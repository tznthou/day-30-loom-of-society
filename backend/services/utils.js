/**
 * Backend Services 共用工具函式
 * H02, H06, H07 修復
 */

/**
 * H06: fetch with timeout - 防止無限等待
 * @param {string} url
 * @param {RequestInit} options
 * @param {number} timeout 毫秒
 * @returns {Promise<Response>}
 */
export function fetchWithTimeout(url, options = {}, timeout = 5000) {
  return Promise.race([
    fetch(url, options),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error(`Request timeout after ${timeout}ms`)), timeout)
    )
  ])
}

/**
 * H02: 轉義 RegExp 特殊字元
 * @param {string} string
 * @returns {string}
 */
export function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/**
 * H07: 安全的數值正規化，防止 NaN
 * @param {number} value
 * @param {number} min
 * @param {number} max
 * @param {number} fallback
 * @returns {number}
 */
export function safeNormalize(value, min, max, fallback = 0.5) {
  if (!Number.isFinite(value)) return fallback
  return Math.max(min, Math.min(max, value))
}

/**
 * 安全的 parseFloat，防止 NaN
 * @param {*} value
 * @param {number} fallback
 * @returns {number}
 */
export function safeParseFloat(value, fallback = 0) {
  const parsed = parseFloat(value)
  return Number.isFinite(parsed) ? parsed : fallback
}
