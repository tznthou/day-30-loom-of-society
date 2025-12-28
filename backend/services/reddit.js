/**
 * Reddit API 服務
 * 抓取熱門新聞標題，分析社會情緒
 */

import { analyzeText } from './sentiment.js'

// 使用多個 subreddit 混合，獲得更平衡的社會情緒
const SUBREDDITS = ['worldnews', 'news', 'upliftingnews']

/**
 * 從單一 subreddit 抓取熱門文章
 * @param {string} subreddit
 * @param {number} limit
 * @returns {Promise<string[]>}
 */
async function fetchSubredditTitles(subreddit, limit = 15) {
  try {
    const response = await fetch(
      `https://www.reddit.com/r/${subreddit}/hot.json?limit=${limit}`,
      {
        headers: {
          // Reddit 要求 User-Agent
          'User-Agent': 'LoomOfSociety/1.0 (Social Sentiment Art Installation)'
        }
      }
    )

    if (!response.ok) {
      throw new Error(`Reddit API error: ${response.status}`)
    }

    const data = await response.json()

    // 提取文章標題
    return data.data.children
      .map(post => post.data.title)
      .filter(Boolean)
  } catch (error) {
    console.error(`Failed to fetch r/${subreddit}:`, error.message)
    return []
  }
}

/**
 * 抓取所有 subreddit 的標題
 * @returns {Promise<string[]>}
 */
export async function fetchRedditTitles() {
  const allPromises = SUBREDDITS.map(sub => fetchSubredditTitles(sub, 15))
  const results = await Promise.all(allPromises)

  // 合併所有標題
  return results.flat()
}

/**
 * 分析 Reddit 社會情緒
 * @returns {Promise<Object>}
 */
export async function analyzeReddit() {
  const titles = await fetchRedditTitles()

  if (titles.length === 0) {
    return {
      tension: 0.4,
      buoyancy: 0.6,
      activity: 0.4,
      source: 'reddit',
      status: 'fallback',
      postCount: 0
    }
  }

  // 合併分析
  const combinedText = titles.join(' ')
  const sentiment = analyzeText(combinedText, 'society')

  return {
    ...sentiment,
    source: 'reddit',
    status: 'live',
    postCount: titles.length,
    subreddits: SUBREDDITS,
    debug: undefined
  }
}
