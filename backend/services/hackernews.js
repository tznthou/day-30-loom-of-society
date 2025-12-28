/**
 * Hacker News API 服務
 * 抓取熱門文章標題，分析科技社群情緒
 */

import { analyzeText } from './sentiment.js'
import { fetchWithTimeout } from './utils.js'

const HN_API = 'https://hacker-news.firebaseio.com/v0'

// H06: timeout 設定
const TIMEOUT = {
  topStories: 5000,  // 取得文章列表
  item: 3000         // 單一文章（較短，避免卡住）
}

/**
 * 取得熱門文章標題
 * @param {number} limit 要抓取的文章數量
 * @returns {Promise<string[]>} 文章標題陣列
 */
export async function fetchTopStoryTitles(limit = 30) {
  try {
    // 1. 取得熱門文章 ID（H06: 加 timeout）
    const response = await fetchWithTimeout(`${HN_API}/topstories.json`, {}, TIMEOUT.topStories)
    if (!response.ok) {
      throw new Error(`HN API error: ${response.status}`)
    }

    const storyIds = await response.json()
    const topIds = storyIds.slice(0, limit)

    // 2. 並行抓取文章詳情（H06: 每個都加 timeout）
    const storyPromises = topIds.map(async (id) => {
      try {
        const storyRes = await fetchWithTimeout(`${HN_API}/item/${id}.json`, {}, TIMEOUT.item)
        if (!storyRes.ok) return null
        const story = await storyRes.json()
        return story?.title || null
      } catch (error) {
        // H06: 記錄 timeout 但不中斷
        console.warn(`HN item ${id} failed:`, error.message)
        return null
      }
    })

    // H06: 使用 allSettled 而非 all，更容錯
    const results = await Promise.allSettled(storyPromises)
    const titles = results
      .filter(r => r.status === 'fulfilled' && r.value)
      .map(r => r.value)

    return titles
  } catch (error) {
    console.error('Failed to fetch HN stories:', error.message)
    return []
  }
}

/**
 * 分析 Hacker News 情緒
 * @returns {Promise<Object>} 情緒分數
 */
export async function analyzeHackerNews() {
  const titles = await fetchTopStoryTitles(30)

  if (titles.length === 0) {
    return {
      tension: 0.4,
      buoyancy: 0.6,
      activity: 0.5,
      source: 'hackernews',
      status: 'fallback',
      storyCount: 0
    }
  }

  // 合併所有標題進行分析
  const combinedText = titles.join(' ')
  const sentiment = analyzeText(combinedText, 'tech')

  return {
    ...sentiment,
    source: 'hackernews',
    status: 'live',
    storyCount: titles.length,
    debug: undefined
  }
}
