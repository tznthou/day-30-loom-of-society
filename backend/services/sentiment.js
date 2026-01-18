/**
 * 情緒分析服務
 * 使用關鍵字計數進行簡單的情緒判斷
 *
 * @module services/sentiment
 */

import { escapeRegExp, safeNormalize } from './utils.js'

/**
 * 情緒分數物件
 * @typedef {Object} SentimentScore
 * @property {number} tension - 張力 (0.1-0.9)，負面情緒越高越大
 * @property {number} buoyancy - 浮力 (0.1-0.9)，正面情緒越高越大
 * @property {number} activity - 活躍度 (0-1)，關鍵字密度
 * @property {Object} [debug] - 除錯資訊（可選）
 * @property {number} [debug.positiveCount] - 正面關鍵字計數
 * @property {number} [debug.negativeCount] - 負面關鍵字計數
 * @property {number} [debug.totalKeywords] - 總關鍵字數
 * @property {number} [debug.sentiment] - 情緒傾向 (-1 到 1)
 */

/**
 * 情緒類別
 * @typedef {'tech' | 'finance' | 'society'} SentimentCategory
 */

/**
 * 關鍵字模式物件
 * @typedef {Object} KeywordPattern
 * @property {string} word - 原始關鍵字
 * @property {RegExp} regex - 編譯後的正則表達式
 */

// 正面關鍵字（科技、金融、社會通用）
const POSITIVE_KEYWORDS = {
  tech: [
    // 中文
    '突破', '創新', '成長', '領先', '合作', '投資', '擴張', '升級',
    '量產', '訂單', '獲利', '營收', '新高', '看好', '利多', '加碼',
    'AI', '半導體', '晶片', '5G', '電動車', '綠能', '雲端',
    // 英文 (Hacker News)
    'breakthrough', 'innovation', 'launch', 'released', 'announcing',
    'open source', 'faster', 'better', 'improved', 'success', 'growth',
    'funding', 'acquired', 'partnership', 'record', 'milestone',
    'revolutionary', 'game-changer', 'excited', 'amazing', 'awesome'
  ],
  finance: [
    '上漲', '走高', '反彈', '突破', '買超', '加碼', '看多', '利多',
    '獲利', '成長', '穩健', '回升', '強勢', '多頭', '紅盤', '創高',
    '降息', '寬鬆', '資金', '外資', '法人'
  ],
  society: [
    // 中文 - 情緒詞
    '希望', '改善', '進步', '成功', '突破', '合作', '支持', '幫助',
    '感謝', '開心', '期待', '祝福', '正向', '溫暖', '團結', '共好',
    // 中文 - 台灣新聞事件詞 (2026-01-14 新增)
    '通過', '批准', '和解', '釋放', '勝出', '當選', '連任',
    '奪冠', '破紀錄', '創新高', '獲獎', '榮獲', '奪金', '摘金',
    '加碼', '補助', '減稅', '利多', '回升', '反彈',
    '捐款', '救援', '康復', '出院', '平安', '獲救', '脫困',
    // 英文 (Reddit/國際新聞)
    'hope', 'peace', 'progress', 'success', 'unity', 'support', 'helped',
    'celebrate', 'victory', 'breakthrough', 'happy', 'joy', 'love',
    'hero', 'saved', 'rescued', 'recovered', 'uplifting', 'inspiring'
  ]
}

// 負面關鍵字
const NEGATIVE_KEYWORDS = {
  tech: [
    // 中文
    '衰退', '下滑', '砍單', '裁員', '虧損', '衰減', '停工', '延遲',
    '缺貨', '斷鏈', '制裁', '禁令', '風險', '利空', '減產', '下修',
    '駭客', '資安', '漏洞', '召回',
    // 英文 (Hacker News)
    'layoff', 'layoffs', 'fired', 'shutdown', 'bankrupt', 'failed',
    'breach', 'hacked', 'vulnerability', 'exploit', 'scam', 'fraud',
    'lawsuit', 'sued', 'investigation', 'controversy', 'backlash',
    'deprecated', 'broken', 'bug', 'outage', 'down', 'struggling',
    'disappointing', 'concerned', 'worried', 'warning', 'danger'
  ],
  finance: [
    '下跌', '重挫', '崩盤', '賣超', '減碼', '看空', '利空', '虧損',
    '衰退', '跌停', '暴跌', '空頭', '綠盤', '套牢', '斷頭', '爆倉',
    '升息', '緊縮', '通膨', '違約', '倒閉'
  ],
  society: [
    // 中文 - 情緒詞
    '擔憂', '失望', '憤怒', '抗議', '衝突', '危機', '問題', '災難',
    '悲傷', '恐慌', '焦慮', '不滿', '批評', '爭議', '對立', '分裂',
    // 中文 - 台灣新聞事件詞 (2026-01-14 新增)
    // 政治司法
    '彈劾', '戒嚴', '內亂', '罷免', '貪污', '弊案', '起訴', '判刑',
    '羈押', '收押', '遭逮', '落網', '通緝',
    // 災害天氣
    '颱風', '地震', '暴風', '洪水', '土石流', '停電', '豪雨', '寒流',
    '暴雨', '淹水', '坍塌', '崩塌',
    // 社會事件
    '死刑', '殺人', '詐騙', '洗錢', '車禍', '墜機', '傷亡', '罹難',
    '失蹤', '溺斃', '身亡', '喪命', '重傷', '搶劫', '竊盜', '性侵',
    // 經濟負面
    '裁員', '倒閉', '虧損', '下滑', '暴跌', '重挫',
    // 國際衝突
    '戰爭', '轟炸', '空襲', '入侵', '砲擊', '飛彈', '襲擊',
    // 英文 (Reddit/國際新聞)
    'war', 'death', 'killed', 'died', 'attack', 'crisis', 'disaster',
    'tragedy', 'violence', 'conflict', 'protest', 'riot', 'shooting',
    'crash', 'collapse', 'fear', 'threat', 'danger', 'warning', 'emergency'
  ]
}

// H02: 預編譯 RegExp（模組載入時執行一次）
function buildPatterns(keywords) {
  const result = {}
  for (const [category, words] of Object.entries(keywords)) {
    result[category] = words.map(word => ({
      word,
      // 轉義特殊字元 + 不分大小寫
      regex: new RegExp(escapeRegExp(word), 'gi')
    }))
  }
  return result
}

const POSITIVE_PATTERNS = buildPatterns(POSITIVE_KEYWORDS)
const NEGATIVE_PATTERNS = buildPatterns(NEGATIVE_KEYWORDS)

/**
 * 分析文本情緒
 *
 * @param {string} text - 要分析的文本
 * @param {SentimentCategory} [category='society'] - 類別
 * @returns {SentimentScore} 情緒分數
 *
 * @example
 * const result = analyzeText('This is amazing breakthrough!', 'tech')
 * // { tension: 0.3, buoyancy: 0.7, activity: 0.4, debug: {...} }
 */
export function analyzeText(text, category = 'society') {
  // H07: 輸入驗證
  if (!text || typeof text !== 'string') {
    return { tension: 0.5, buoyancy: 0.5, activity: 0.3 }
  }

  // H02: 使用預編譯的 patterns
  const positivePatterns = POSITIVE_PATTERNS[category] || POSITIVE_PATTERNS.society
  const negativePatterns = NEGATIVE_PATTERNS[category] || NEGATIVE_PATTERNS.society

  let positiveCount = 0
  let negativeCount = 0

  // 計算正面關鍵字
  for (const { regex } of positivePatterns) {
    const matches = text.match(regex)
    if (matches) {
      positiveCount += matches.length
    }
  }

  // 計算負面關鍵字
  for (const { regex } of negativePatterns) {
    const matches = text.match(regex)
    if (matches) {
      negativeCount += matches.length
    }
  }

  const totalKeywords = positiveCount + negativeCount
  const textLength = text.length

  // 活躍度：基於關鍵字密度
  const keywordDensity = totalKeywords / Math.max(textLength / 100, 1)
  const activity = safeNormalize(keywordDensity * 0.5 + 0.3, 0, 1, 0.3)

  // H07: 如果沒有找到關鍵字，返回中性值
  if (totalKeywords === 0) {
    return {
      tension: 0.5,
      buoyancy: 0.5,
      activity: parseFloat(activity.toFixed(3)),
      debug: { positiveCount, negativeCount, totalKeywords }
    }
  }

  // 計算情緒傾向（已確保 totalKeywords > 0）
  const sentiment = (positiveCount - negativeCount) / totalKeywords

  // H07: 使用 safeNormalize 防止 NaN
  const tension = safeNormalize(0.5 - (sentiment * 0.4), 0.1, 0.9, 0.5)
  const buoyancy = safeNormalize(0.5 + (sentiment * 0.4), 0.1, 0.9, 0.5)

  return {
    tension: parseFloat(tension.toFixed(3)),
    buoyancy: parseFloat(buoyancy.toFixed(3)),
    activity: parseFloat(activity.toFixed(3)),
    debug: { positiveCount, negativeCount, totalKeywords, sentiment }
  }
}

