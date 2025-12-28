/**
 * The Loom of Society - Backend API
 * 提供即時情緒數據給前端
 */

import express from 'express'
import cors from 'cors'
import { fetchMarketIndex, marketToSentiment } from './services/twse.js'
import { analyzeText } from './services/sentiment.js'
import { analyzeHackerNews } from './services/hackernews.js'
import { analyzeReddit } from './services/reddit.js'

const app = express()
const PORT = process.env.PORT || 3001

// ============================================
// 中間件
// ============================================
app.use(cors())
app.use(express.json())

// ============================================
// 簡易快取（避免過度請求 TWSE）
// ============================================
const cache = {
  data: null,
  timestamp: 0,
  TTL: 30000  // 30 秒快取
}

async function getCachedSentiment() {
  const now = Date.now()

  if (cache.data && (now - cache.timestamp) < cache.TTL) {
    return cache.data
  }

  // 並行抓取所有數據源
  const [marketData, techSentiment, societySentiment] = await Promise.all([
    fetchMarketIndex(),
    analyzeHackerNews(),
    analyzeReddit()
  ])

  const financeSentiment = marketToSentiment(marketData)

  const result = {
    timestamp: new Date().toISOString(),
    market: marketData,
    sentiment: {
      tech: techSentiment,
      finance: {
        ...financeSentiment,
        source: 'twse'
      },
      society: societySentiment
    }
  }

  // 更新快取
  cache.data = result
  cache.timestamp = now

  return result
}

// ============================================
// API 路由
// ============================================

// 健康檢查
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// 取得即時情緒數據
app.get('/api/sentiment', async (req, res) => {
  try {
    const data = await getCachedSentiment()
    res.json(data)
  } catch (error) {
    console.error('Sentiment API error:', error)
    res.status(500).json({
      error: 'Failed to fetch sentiment data',
      message: error.message
    })
  }
})

// 分析文本（供測試用）
app.post('/api/analyze', (req, res) => {
  try {
    const { text, category = 'society' } = req.body

    if (!text) {
      return res.status(400).json({ error: 'Text is required' })
    }

    const result = analyzeText(text, category)
    res.json(result)
  } catch (error) {
    console.error('Analyze API error:', error)
    res.status(500).json({
      error: 'Failed to analyze text',
      message: error.message
    })
  }
})

// ============================================
// 啟動伺服器
// ============================================
app.listen(PORT, () => {
  console.log(`🧵 Loom Backend running on port ${PORT}`)
  console.log(`   Health: http://localhost:${PORT}/health`)
  console.log(`   API:    http://localhost:${PORT}/api/sentiment`)
})
