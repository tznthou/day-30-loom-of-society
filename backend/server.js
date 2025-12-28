/**
 * The Loom of Society - Backend API
 * 提供即時情緒數據給前端
 */

import express from 'express'
import cors from 'cors'
import rateLimit from 'express-rate-limit'
import { fetchMarketIndex, marketToSentiment } from './services/twse.js'
import { analyzeText } from './services/sentiment.js'
import { analyzeHackerNews } from './services/hackernews.js'
import { analyzeReddit } from './services/reddit.js'

const app = express()
const PORT = process.env.PORT || 3001
const IS_PRODUCTION = process.env.NODE_ENV === 'production'
const serverStartTime = Date.now()

// ============================================
// 中間件
// ============================================

// C01 修復：CORS 白名單
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
  : ['http://localhost:5173', 'http://localhost:3000']

app.use(cors({
  origin: (origin, callback) => {
    // 開發環境允許無 origin（curl、Postman）
    if (!origin && !IS_PRODUCTION) {
      return callback(null, true)
    }
    if (allowedOrigins.includes(origin)) {
      return callback(null, true)
    }
    callback(new Error('Not allowed by CORS'))
  }
}))

app.use(express.json())

// C04 修復：速率限制
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 分鐘
  max: 60,              // 每分鐘最多 60 次請求
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later' }
})
app.use('/api', limiter)

// ============================================
// H04 修復：改良的快取策略
// ============================================
const cache = {
  data: null,
  timestamp: 0,
  TTL: 30000,       // 30 秒快取
  updating: false   // 防止競態條件
}

async function getCachedSentiment() {
  const now = Date.now()
  const age = now - cache.timestamp

  // 1. 如果快取仍然新鮮，直接回傳
  if (cache.data && age < cache.TTL) {
    return cache.data
  }

  // 2. Stale-While-Revalidate：快取稍微過期但可用，背景更新
  if (cache.data && age < cache.TTL * 2 && !cache.updating) {
    updateCacheInBackground()
    return cache.data
  }

  // 3. 如果正在更新中，等待或回傳舊資料
  if (cache.updating) {
    // 如果有舊資料就先用
    if (cache.data) return cache.data
    // 否則等待（最多 10 秒）
    await waitForUpdate()
    return cache.data || getDefaultSentiment()
  }

  // 4. 執行更新
  try {
    cache.updating = true
    const newData = await fetchFreshData()
    cache.data = newData
    cache.timestamp = Date.now()
    return newData
  } catch (error) {
    console.error('Failed to update cache:', error.message)
    // 如果有舊資料，回傳舊資料
    if (cache.data) {
      console.warn('Returning stale data due to update failure')
      return cache.data
    }
    return { sentiment: getDefaultSentiment() }
  } finally {
    cache.updating = false
  }
}

// 背景更新
async function updateCacheInBackground() {
  if (cache.updating) return

  try {
    cache.updating = true
    const newData = await fetchFreshData()
    cache.data = newData
    cache.timestamp = Date.now()
    console.log('Cache updated in background')
  } catch (error) {
    console.error('Background cache update failed:', error.message)
  } finally {
    cache.updating = false
  }
}

// 等待更新完成
function waitForUpdate() {
  return new Promise((resolve) => {
    const checkInterval = setInterval(() => {
      if (!cache.updating) {
        clearInterval(checkInterval)
        resolve()
      }
    }, 100)
    // 最多等待 10 秒
    setTimeout(() => {
      clearInterval(checkInterval)
      resolve()
    }, 10000)
  })
}

// 抓取新數據
async function fetchFreshData() {
  const [marketData, techSentiment, societySentiment] = await Promise.all([
    fetchMarketIndex(),
    analyzeHackerNews(),
    analyzeReddit()
  ])

  const financeSentiment = marketToSentiment(marketData)

  return {
    timestamp: new Date().toISOString(),
    market: marketData,
    sentiment: {
      tech: techSentiment,
      finance: { ...financeSentiment, source: 'twse' },
      society: societySentiment
    }
  }
}

// 預設情緒值
function getDefaultSentiment() {
  return {
    tech: { tension: 0.5, buoyancy: 0.5, activity: 0.3 },
    finance: { tension: 0.5, buoyancy: 0.5, activity: 0.3 },
    society: { tension: 0.5, buoyancy: 0.5, activity: 0.3 }
  }
}

// ============================================
// API 路由
// ============================================

// M04 改善：健康檢查（包含更多診斷資訊）
app.get('/health', (req, res) => {
  const uptime = Math.floor((Date.now() - serverStartTime) / 1000)
  const memoryUsage = process.memoryUsage()

  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: `${uptime}s`,
    cache: {
      hasData: !!cache.data,
      age: cache.data ? Math.floor((Date.now() - cache.timestamp) / 1000) : null,
      ttl: cache.TTL / 1000,
      updating: cache.updating
    },
    memory: {
      rss: `${Math.round(memoryUsage.rss / 1024 / 1024)}MB`,
      heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)}MB`
    }
  }

  res.json(health)
})

// 取得即時情緒數據
app.get('/api/sentiment', async (req, res) => {
  try {
    const data = await getCachedSentiment()
    res.json(data)
  } catch (error) {
    console.error('Sentiment API error:', error)
    // C03 修復：不洩漏內部錯誤訊息
    res.status(500).json({
      error: 'Failed to fetch sentiment data'
    })
  }
})

// H01 修復：加上輸入驗證
const VALID_CATEGORIES = ['tech', 'finance', 'society']
const MAX_TEXT_LENGTH = 10000

app.post('/api/analyze', (req, res) => {
  try {
    const { text, category = 'society' } = req.body

    // H01: 驗證 text 類型
    if (!text || typeof text !== 'string') {
      return res.status(400).json({
        error: 'Text must be a non-empty string'
      })
    }

    // H01: 驗證 text 長度
    if (text.length > MAX_TEXT_LENGTH) {
      return res.status(400).json({
        error: `Text too long (max ${MAX_TEXT_LENGTH} characters)`
      })
    }

    // H01: 驗證 category
    if (!VALID_CATEGORIES.includes(category)) {
      return res.status(400).json({
        error: `Invalid category. Must be one of: ${VALID_CATEGORIES.join(', ')}`
      })
    }

    const result = analyzeText(text, category)
    res.json(result)
  } catch (error) {
    console.error('Analyze API error:', error)
    // C03 修復：不洩漏內部錯誤訊息
    res.status(500).json({
      error: 'Failed to analyze text'
    })
  }
})

// ============================================
// 啟動伺服器
// ============================================
app.listen(PORT, () => {
  console.log(`🧵 Loom Backend running on port ${PORT}`)
  console.log(`   Environment: ${IS_PRODUCTION ? 'production' : 'development'}`)
  console.log(`   Health: http://localhost:${PORT}/health`)
  console.log(`   API:    http://localhost:${PORT}/api/sentiment`)
})
