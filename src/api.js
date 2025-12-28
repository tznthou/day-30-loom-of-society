/**
 * API 串接模組
 * 從後端取得即時情緒數據
 */

// API 端點（開發時用 localhost，部署時改成 Zeabur URL）
const API_BASE = import.meta.env?.VITE_API_URL || 'https://loomsc-api.zeabur.app'

// 上次取得的數據（fallback 用）
let lastSentiment = null

/**
 * M05: fetch with retry - 網路暫時錯誤時自動重試
 * @param {string} url
 * @param {number} maxRetries
 * @param {number} delayMs
 * @returns {Promise<Response>}
 */
async function fetchWithRetry(url, maxRetries = 2, delayMs = 1500) {
  for (let i = 0; i <= maxRetries; i++) {
    try {
      const response = await fetch(url)

      if (response.ok) {
        return response
      }

      // 5xx 錯誤重試，4xx 錯誤不重試
      if (response.status >= 500 && i < maxRetries) {
        console.warn(`Retry ${i + 1}/${maxRetries} due to ${response.status}`)
        await new Promise(resolve => setTimeout(resolve, delayMs * (i + 1)))
        continue
      }

      throw new Error(`API error: ${response.status}`)
    } catch (error) {
      if (i < maxRetries && error.name !== 'AbortError') {
        console.warn(`Retry ${i + 1}/${maxRetries}:`, error.message)
        await new Promise(resolve => setTimeout(resolve, delayMs * (i + 1)))
      } else {
        throw error
      }
    }
  }
}

/**
 * 取得即時情緒數據
 * @returns {Promise<Object>} 情緒數據
 */
export async function fetchSentiment() {
  try {
    // M05: 使用 fetchWithRetry
    const response = await fetchWithRetry(`${API_BASE}/api/sentiment`, 2, 1500)
    const data = await response.json()
    lastSentiment = data.sentiment

    return data.sentiment
  } catch (error) {
    console.warn('Failed to fetch sentiment after retries:', error.message)

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
