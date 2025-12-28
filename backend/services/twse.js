/**
 * TWSE 台灣證券交易所 數據服務
 * 抓取大盤指數、成交量等數據
 */

// TWSE API 端點
const TWSE_API = {
  // 大盤即時資訊
  index: 'https://mis.twse.com.tw/stock/api/getStockInfo.jsp?ex_ch=tse_t00.tw',
  // 加權指數歷史（當日）
  daily: 'https://www.twse.com.tw/rwd/zh/TAIEX/MI_5MINS_INDEX'
}

/**
 * 抓取大盤即時數據
 * @returns {Promise<Object>} 大盤數據
 */
export async function fetchMarketIndex() {
  try {
    const response = await fetch(TWSE_API.index, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
        'Accept': 'application/json'
      }
    })

    if (!response.ok) {
      throw new Error(`TWSE API error: ${response.status}`)
    }

    const data = await response.json()

    if (!data.msgArray || data.msgArray.length === 0) {
      // 可能是非交易時間
      return getDefaultMarketData()
    }

    const info = data.msgArray[0]

    // 解析數據
    // z: 當前價格, y: 昨收, v: 成交量, o: 開盤
    const currentPrice = parseFloat(info.z) || parseFloat(info.y)
    const yesterdayClose = parseFloat(info.y)
    const volume = parseFloat(info.v) || 0
    const openPrice = parseFloat(info.o) || yesterdayClose

    // 計算漲跌幅
    const change = currentPrice - yesterdayClose
    const changePercent = (change / yesterdayClose) * 100

    return {
      name: '加權指數',
      price: currentPrice,
      change: change,
      changePercent: changePercent.toFixed(2),
      volume: volume,
      open: openPrice,
      high: parseFloat(info.h) || currentPrice,
      low: parseFloat(info.l) || currentPrice,
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

  const change = parseFloat(changePercent)

  // 張力 (Tension): 負值越大 → 張力越高
  // 範圍映射: -3% ~ +3% → 1.0 ~ 0.0
  let tension = 0.5 - (change / 6)  // 每 1% 變動 ≈ 0.167 的張力變化
  tension = Math.max(0, Math.min(1, tension))

  // 浮力 (Buoyancy): 正值越大 → 浮力越高
  // 範圍映射: -3% ~ +3% → 0.0 ~ 1.0
  let buoyancy = 0.5 + (change / 6)
  buoyancy = Math.max(0, Math.min(1, buoyancy))

  // 活躍度 (Activity): 基於成交量
  // 這裡用簡化邏輯，假設正常日成交量約 2000-4000 億
  // 實際應該比較歷史平均
  const avgVolume = 3000  // 億
  let activity = volume / avgVolume
  activity = Math.max(0.2, Math.min(1, activity))

  return {
    tension: parseFloat(tension.toFixed(3)),
    buoyancy: parseFloat(buoyancy.toFixed(3)),
    activity: parseFloat(activity.toFixed(3))
  }
}
