/**
 * TWSE 台灣證券交易所 數據服務
 * 抓取大盤指數、成交量等數據
 */

import { fetchWithTimeout, safeNormalize, safeParseFloat } from './utils.js'

// TWSE API 端點
const TWSE_API = {
  // 大盤即時資訊
  index: 'https://mis.twse.com.tw/stock/api/getStockInfo.jsp?ex_ch=tse_t00.tw',
  // 加權指數歷史（當日）
  daily: 'https://www.twse.com.tw/rwd/zh/TAIEX/MI_5MINS_INDEX'
}

// H06: timeout 設定
const TIMEOUT = 5000

// H05: 改善 User-Agent（完整 Chrome UA，避免被識別為爬蟲）
const TWSE_USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'

/**
 * 抓取大盤即時數據
 * @returns {Promise<Object>} 大盤數據
 */
export async function fetchMarketIndex() {
  try {
    // H06: 加 timeout
    const response = await fetchWithTimeout(
      TWSE_API.index,
      {
        headers: {
          // H05: 改善 User-Agent
          'User-Agent': TWSE_USER_AGENT,
          'Accept': 'application/json',
          'Accept-Language': 'zh-TW,zh;q=0.9,en;q=0.8',
          'Referer': 'https://www.twse.com.tw/'
        }
      },
      TIMEOUT
    )

    if (!response.ok) {
      throw new Error(`TWSE API error: ${response.status}`)
    }

    const data = await response.json()

    if (!data.msgArray || data.msgArray.length === 0) {
      // 可能是非交易時間
      return getDefaultMarketData()
    }

    const info = data.msgArray[0]

    // H07: 使用 safeParseFloat 防止 NaN
    const currentPrice = safeParseFloat(info.z) || safeParseFloat(info.y)
    const yesterdayClose = safeParseFloat(info.y)
    const volume = safeParseFloat(info.v)
    const openPrice = safeParseFloat(info.o) || yesterdayClose

    // H07: 安全計算漲跌幅
    let change = 0
    let changePercent = 0
    if (yesterdayClose > 0) {
      change = currentPrice - yesterdayClose
      changePercent = (change / yesterdayClose) * 100
    }

    return {
      name: '加權指數',
      price: currentPrice,
      change: change,
      changePercent: Number.isFinite(changePercent) ? changePercent.toFixed(2) : '0.00',
      volume: volume,
      open: openPrice,
      high: safeParseFloat(info.h) || currentPrice,
      low: safeParseFloat(info.l) || currentPrice,
      timestamp: new Date().toISOString(),
      isTrading: info.z !== '-'  // 是否交易中
    }
  } catch (error) {
    console.error('TWSE fetch error:', error.message)
    return getDefaultMarketData()
  }
}

/**
 * 非交易時間的預設數據
 */
function getDefaultMarketData() {
  return {
    name: '加權指數',
    price: 0,
    change: 0,
    changePercent: '0.00',
    volume: 0,
    open: 0,
    high: 0,
    low: 0,
    timestamp: new Date().toISOString(),
    isTrading: false,
    note: '非交易時間'
  }
}

/**
 * 將股市數據轉換為情緒分數
 * @param {Object} marketData 股市數據
 * @returns {Object} 情緒分數
 */
export function marketToSentiment(marketData) {
  const { changePercent, volume, isTrading } = marketData

  if (!isTrading) {
    // 非交易時間，返回中性值
    return {
      tension: 0.5,
      buoyancy: 0.5,
      activity: 0.3
    }
  }

  // H07: 安全的數值解析
  const change = safeParseFloat(changePercent)

  // H07: 使用 safeNormalize 防止 NaN
  // 張力 (Tension): 負值越大 → 張力越高
  // 範圍映射: -3% ~ +3% → 1.0 ~ 0.0
  const rawTension = 0.5 - (change / 6)
  const tension = safeNormalize(rawTension, 0, 1, 0.5)

  // 浮力 (Buoyancy): 正值越大 → 浮力越高
  // 範圍映射: -3% ~ +3% → 0.0 ~ 1.0
  const rawBuoyancy = 0.5 + (change / 6)
  const buoyancy = safeNormalize(rawBuoyancy, 0, 1, 0.5)

  // 活躍度 (Activity): 基於成交量
  const avgVolume = 3000  // 億
  const rawActivity = Number.isFinite(volume) ? volume / avgVolume : 0.5
  const activity = safeNormalize(rawActivity, 0.2, 1, 0.5)

  return {
    tension: parseFloat(tension.toFixed(3)),
    buoyancy: parseFloat(buoyancy.toFixed(3)),
    activity: parseFloat(activity.toFixed(3))
  }
}
