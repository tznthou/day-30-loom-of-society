/**
 * Google News 台灣 RSS 服務
 * 抓取台灣焦點新聞標題，分析社會情緒
 */

import { analyzeText } from './sentiment.js'
import { fetchWithTimeout } from './utils.js'

// Google News 台灣 RSS
const GOOGLE_NEWS_TW_RSS = 'https://news.google.com/rss?hl=zh-TW&gl=TW&ceid=TW:zh-Hant'

// H06: timeout 設定
const TIMEOUT = 5000

// 預編譯正則表達式（H02: 避免 ReDOS）
const TITLE_REGEX = /<title>([^<]+)<\/title>/g

/**
 * 抓取 Google News 台灣新聞標題
 * @returns {Promise<string[]>} 新聞標題陣列
 */
export async function fetchGoogleNewsTitles() {
  try {
    const response = await fetchWithTimeout(
      GOOGLE_NEWS_TW_RSS,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; LoomOfSociety/1.0)'
        }
      },
      TIMEOUT
    )

    if (!response.ok) {
      throw new Error(`Google News RSS error: ${response.status}`)
    }

    const xml = await response.text()

    // 用正則抓標題
    const titles = []
    let match
    TITLE_REGEX.lastIndex = 0
    while ((match = TITLE_REGEX.exec(xml)) !== null) {
      const title = match[1].trim()
      // 跳過 RSS feed 本身的標題
      if (!title.includes('Google 新聞') && !title.includes('焦點新聞')) {
        // 移除來源標記（如 " - 聯合新聞網"）
        const cleanTitle = title.replace(/\s*-\s*[^-]+$/, '').trim()
        if (cleanTitle) {
          titles.push(cleanTitle)
        }
      }
    }

    return titles
  } catch (error) {
    console.error('Failed to fetch Google News:', error.message)
    return []
  }
}

/**
 * 分析 Google News 台灣社會情緒
 * @returns {Promise<Object>} 情緒分數
 */
export async function analyzeGoogleNews() {
  const titles = await fetchGoogleNewsTitles()

  if (titles.length === 0) {
    return {
      tension: 0.4,
      buoyancy: 0.6,
      activity: 0.4,
      source: 'googlenews',
      region: 'TW',
      status: 'fallback',
      articleCount: 0
    }
  }

  // 合併所有標題進行分析
  const combinedText = titles.join(' ')
  const sentiment = analyzeText(combinedText, 'society')

  return {
    ...sentiment,
    source: 'googlenews',
    region: 'TW',
    status: 'live',
    articleCount: titles.length
  }
}
