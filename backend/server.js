/**
 * The Loom of Society - Backend API
 * 提供即時情緒數據給前端
 */

import express from 'express'
import cors from 'cors'
import { fetchMarketIndex, marketToSentiment } from './services/twse.js'
import { analyzeText } from './services/sentiment.js'

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

  // 抓取新數據
  const marketData = await fetchMarketIndex()
  const financeSentiment = marketToSentiment(marketData)

  // 科技和社會暫時用模擬數據（之後接 PTT/新聞）
  const result = {
    timestamp: new Date().toISOString(),
    market: marketData,
    sentiment: {
      tech: {
        tension: 0.4 + Math.random() * 0.2,
        buoyancy: 0.5 + Math.random() * 0.2,
        activity: 0.4 + Math.random() * 0.3,
        source: 'mock'  // 之後換成 PTT 科技版
      },
      finance: {
        ...financeSentiment,
        source: 'twse'
      },
      society: {
        tension: 0.3 + Math.random() * 0.2,
        buoyancy: 0.6 + Math.random() * 0.2,
        activity: 0.3 + Math.random() * 0.2,
        source: 'mock'  // 之後換成新聞/PTT
      }
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
