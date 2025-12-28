/**
 * 情緒分析服務
 * 使用關鍵字計數進行簡單的情緒判斷
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
    // 中文
    '希望', '改善', '進步', '成功', '突破', '合作', '支持', '幫助',
    '感謝', '開心', '期待', '祝福', '正向', '溫暖', '團結', '共好',
    // 英文 (Reddit)
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
    // 中文
    '擔憂', '失望', '憤怒', '抗議', '衝突', '危機', '問題', '災難',
    '悲傷', '恐慌', '焦慮', '不滿', '批評', '爭議', '對立', '分裂',
    // 英文 (Reddit)
    'war', 'death', 'killed', 'died', 'attack', 'crisis', 'disaster',
    'tragedy', 'violence', 'conflict', 'protest', 'riot', 'shooting',
    'crash', 'collapse', 'fear', 'threat', 'danger', 'warning', 'emergency'
  ]
}

/**
 * 分析文本情緒
 * @param {string} text 要分析的文本
 * @param {string} category 類別 (tech/finance/society)
 * @returns {Object} 情緒分數
 */
export function analyzeText(text, category = 'society') {
  if (!text || typeof text !== 'string') {
    return { tension: 0.5, buoyancy: 0.5, activity: 0.3 }
  }

  const positiveWords = POSITIVE_KEYWORDS[category] || POSITIVE_KEYWORDS.society
  const negativeWords = NEGATIVE_KEYWORDS[category] || NEGATIVE_KEYWORDS.society

  let positiveCount = 0
  let negativeCount = 0

  // 計算正面關鍵字
  for (const word of positiveWords) {
    const regex = new RegExp(word, 'g')
    const matches = text.match(regex)
    if (matches) {
      positiveCount += matches.length
    }
  }

  // 計算負面關鍵字
  for (const word of negativeWords) {
    const regex = new RegExp(word, 'g')
    const matches = text.match(regex)
    if (matches) {
      negativeCount += matches.length
    }
  }

  const totalKeywords = positiveCount + negativeCount
  const textLength = text.length

  // 活躍度：基於關鍵字密度
  const keywordDensity = totalKeywords / Math.max(textLength / 100, 1)
  let activity = Math.min(1, keywordDensity * 0.5 + 0.3)

  // 如果沒有找到關鍵字，返回中性值
  if (totalKeywords === 0) {
    return {
      tension: 0.5,
      buoyancy: 0.5,
      activity: 0.3,
      debug: { positiveCount, negativeCount, totalKeywords }
    }
  }

  // 計算情緒傾向
  const sentiment = (positiveCount - negativeCount) / totalKeywords

  // 張力：負面情緒越多，張力越高
  let tension = 0.5 - (sentiment * 0.4)
  tension = Math.max(0.1, Math.min(0.9, tension))

  // 浮力：正面情緒越多，浮力越高
  let buoyancy = 0.5 + (sentiment * 0.4)
  buoyancy = Math.max(0.1, Math.min(0.9, buoyancy))

  return {
    tension: parseFloat(tension.toFixed(3)),
    buoyancy: parseFloat(buoyancy.toFixed(3)),
    activity: parseFloat(activity.toFixed(3)),
    debug: { positiveCount, negativeCount, totalKeywords, sentiment }
  }
}

/**
 * 合併多個情緒分數
 * @param {Array<Object>} sentiments 情緒分數陣列
 * @returns {Object} 合併後的情緒分數
 */
export function mergeSentiments(sentiments) {
  if (!sentiments || sentiments.length === 0) {
    return { tension: 0.5, buoyancy: 0.5, activity: 0.3 }
  }

  const sum = sentiments.reduce((acc, s) => ({
    tension: acc.tension + s.tension,
    buoyancy: acc.buoyancy + s.buoyancy,
    activity: acc.activity + s.activity
  }), { tension: 0, buoyancy: 0, activity: 0 })

  const count = sentiments.length

  return {
    tension: parseFloat((sum.tension / count).toFixed(3)),
    buoyancy: parseFloat((sum.buoyancy / count).toFixed(3)),
    activity: parseFloat((sum.activity / count).toFixed(3))
  }
}
