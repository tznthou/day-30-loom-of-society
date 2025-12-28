/**
 * Hacker News API 服務
 * 抓取熱門文章標題，分析科技社群情緒
 */

import { analyzeText } from './sentiment.js'

const HN_API = 'https://hacker-news.firebaseio.com/v0'

/**
 * 取得熱門文章標題
 * @param {number} limit 要抓取的文章數量
 * @returns {Promise<string[]>} 文章標題陣列
 */
export async function fetchTopStoryTitles(limit = 30) {
  try {
    // 1. 取得熱門文章 ID
    const response = await fetch(`${HN_API}/topstories.json`)
    if (!response.ok) {
      throw new Error(`HN API error: ${response.status}`)
    }

    const storyIds = await response.json()
    const topIds = storyIds.slice(0, limit)

    // 2. 並行抓取文章詳情（只要標題）
    const storyPromises = topIds.map(async (id) => {
      try {
        const storyRes = await fetch(`${HN_API}/item/${id}.json`)
        if (!storyRes.ok) return null
        const story = await storyRes.json()
        return story?.title || null
      } catch {
        return null
      }
    })

    const titles = await Promise.all(storyPromises)
    return titles.filter(Boolean)
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
    // 移除 debug 資訊（生產環境不需要）
    debug: undefined
  }
}
