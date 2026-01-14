/**
 * PTT 八卦版爬蟲服務
 * 抓取熱門文章標題，分析台灣社會情緒
 */

import { analyzeText } from './sentiment.js'
import { fetchWithTimeout } from './utils.js'

// PTT 八卦版網址
const PTT_GOSSIPING_URL = 'https://www.ptt.cc/bbs/Gossiping/index.html'

// H06: timeout 設定
const TIMEOUT = 5000

// 預編譯正則表達式（H02: 避免 ReDOS）
const TITLE_REGEX = /<div class="title">\s*<a[^>]*>([^<]+)<\/a>/g

/**
 * 抓取八卦版文章標題
 * @param {number} pages 要抓取的頁數
 * @returns {Promise<string[]>} 文章標題陣列
 */
export async function fetchGossipingTitles(pages = 1) {
  try {
    const response = await fetchWithTimeout(
      PTT_GOSSIPING_URL,
      {
        headers: {
          'Cookie': 'over18=1',
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
      },
      TIMEOUT
    )

    if (!response.ok) {
      throw new Error(`PTT error: ${response.status}`)
    }

    const html = await response.text()

    // 用正則抓標題
    const titles = []
    let match
    // 重置 regex lastIndex（因為是全域 regex）
    TITLE_REGEX.lastIndex = 0
    while ((match = TITLE_REGEX.exec(html)) !== null) {
      const title = match[1].trim()
      // 過濾掉公告類文章
      if (!title.startsWith('[公告]') && !title.startsWith('[協尋]')) {
        titles.push(title)
      }
    }

    return titles
  } catch (error) {
    console.error('Failed to fetch PTT Gossiping:', error.message)
    return []
  }
}

/**
 * 分析 PTT 八卦版社會情緒
 * @returns {Promise<Object>} 情緒分數
 */
export async function analyzePTT() {
  const titles = await fetchGossipingTitles(1)

  if (titles.length === 0) {
    return {
      tension: 0.4,
      buoyancy: 0.6,
      activity: 0.4,
      source: 'ptt',
      board: 'Gossiping',
      status: 'fallback',
      postCount: 0
    }
  }

  // 合併所有標題進行分析
  const combinedText = titles.join(' ')
  const sentiment = analyzeText(combinedText, 'society')

  return {
    ...sentiment,
    source: 'ptt',
    board: 'Gossiping',
    status: 'live',
    postCount: titles.length
  }
}
