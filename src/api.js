/**
 * API 串接模組
 * 從後端取得即時情緒數據
 */

// API 端點（開發時用 localhost，部署時改成 Zeabur URL）
const API_BASE = import.meta.env?.VITE_API_URL || 'http://localhost:3001'

// 上次取得的數據（fallback 用）
let lastSentiment = null

/**
 * 取得即時情緒數據
 * @returns {Promise<Object>} 情緒數據
 */
export async function fetchSentiment() {
  try {
    const response = await fetch(`${API_BASE}/api/sentiment`)

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`)
    }

    const data = await response.json()
    lastSentiment = data.sentiment

    return data.sentiment
  } catch (error) {
    console.warn('Failed to fetch sentiment, using fallback:', error.message)

    // 返回上次數據或預設值
    return lastSentiment || getDefaultSentiment()
  }
}

/**
 * 預設情緒數據
 */
function getDefaultSentiment() {
  return {
    tech: { tension: 0.4, buoyancy: 0.6, activity: 0.5 },
    finance: { tension: 0.5, buoyancy: 0.5, activity: 0.5 },
    society: { tension: 0.3, buoyancy: 0.7, activity: 0.4 }
  }
}

/**
 * 開始定時更新情緒數據
 * @param {Function} callback 更新回調
 * @param {number} interval 更新間隔（毫秒）
 * @returns {Function} 停止函數
 */
export function startSentimentPolling(callback, interval = 30000) {
  // 立即取得一次
  fetchSentiment().then(callback)

  // 定時更新
  const timer = setInterval(async () => {
    const sentiment = await fetchSentiment()
    callback(sentiment)
  }, interval)

  // 返回停止函數
  return () => clearInterval(timer)
}
