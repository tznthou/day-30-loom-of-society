/**
 * API 串接模組
 * 從後端取得即時情緒數據
 */

// M03：API 端點配置
// Production fallback - 開發時可用 VITE_API_URL 環境變數覆蓋
const PRODUCTION_API = 'https://loomsc-api.zeabur.app'
const API_BASE = import.meta.env?.VITE_API_URL || PRODUCTION_API

// 上次取得的數據（fallback 用）
let lastSentiment = null

/**
 * M06 修復：fetch with retry - 指數退避 + jitter
 * @param {string} url
 * @param {number} maxRetries
 * @param {number} baseDelay - 基礎延遲（毫秒）
 * @returns {Promise<Response>}
 */
async function fetchWithRetry(url, maxRetries = 2, baseDelay = 1000) {
  for (let i = 0; i <= maxRetries; i++) {
    try {
      const response = await fetch(url)

      if (response.ok) {
        return response
      }

      // 5xx 錯誤重試，4xx 錯誤不重試
      if (response.status >= 500 && i < maxRetries) {
        // M06：指數退避 (1s → 2s → 4s) + jitter (0-500ms)
        const delay = baseDelay * Math.pow(2, i)
        const jitter = Math.random() * 500
        console.warn(`Retry ${i + 1}/${maxRetries} in ${Math.round(delay + jitter)}ms`)
        await new Promise(resolve => setTimeout(resolve, delay + jitter))
        continue
      }

      throw new Error(`API error: ${response.status}`)
    } catch (error) {
      if (i < maxRetries && error.name !== 'AbortError') {
        // M06：網路錯誤也使用指數退避
        const delay = baseDelay * Math.pow(2, i) + Math.random() * 500
        console.warn(`Retry ${i + 1}/${maxRetries}:`, error.message)
        await new Promise(resolve => setTimeout(resolve, delay))
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
