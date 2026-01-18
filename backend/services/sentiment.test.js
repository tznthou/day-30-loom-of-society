/**
 * sentiment.js 單元測試
 * 使用 Node.js 內建 test runner（Node 20+）
 *
 * 執行方式：node --test backend/services/sentiment.test.js
 */

import { describe, it } from 'node:test'
import assert from 'node:assert'
import { analyzeText } from './sentiment.js'

describe('analyzeText', () => {
  describe('正面情緒', () => {
    it('英文正面關鍵字應返回高 buoyancy', () => {
      const result = analyzeText('This is an amazing breakthrough! Revolutionary innovation!', 'tech')

      assert.ok(result.buoyancy > 0.6, `buoyancy should > 0.6, got ${result.buoyancy}`)
      assert.ok(result.tension < 0.4, `tension should < 0.4, got ${result.tension}`)
    })

    it('中文正面關鍵字應返回高 buoyancy', () => {
      const result = analyzeText('突破性創新，營收成長創新高', 'tech')

      assert.ok(result.buoyancy > 0.6, `buoyancy should > 0.6, got ${result.buoyancy}`)
    })
  })

  describe('負面情緒', () => {
    it('英文負面關鍵字應返回高 tension', () => {
      const result = analyzeText('Massive layoffs, company failed, security breach', 'tech')

      assert.ok(result.tension > 0.6, `tension should > 0.6, got ${result.tension}`)
      assert.ok(result.buoyancy < 0.4, `buoyancy should < 0.4, got ${result.buoyancy}`)
    })

    it('中文負面關鍵字應返回高 tension', () => {
      const result = analyzeText('裁員衰退虧損利空', 'tech')

      assert.ok(result.tension > 0.6, `tension should > 0.6, got ${result.tension}`)
    })
  })

  describe('中性情緒', () => {
    it('無關鍵字文本應返回中性值', () => {
      const result = analyzeText('The quick brown fox jumps over the lazy dog', 'tech')

      assert.strictEqual(result.tension, 0.5)
      assert.strictEqual(result.buoyancy, 0.5)
    })

    it('空字串應返回中性值', () => {
      const result = analyzeText('', 'tech')

      assert.strictEqual(result.tension, 0.5)
      assert.strictEqual(result.buoyancy, 0.5)
      assert.strictEqual(result.activity, 0.3)
    })
  })

  describe('邊界情況', () => {
    it('null 輸入應返回中性值', () => {
      const result = analyzeText(null, 'tech')

      assert.strictEqual(result.tension, 0.5)
      assert.strictEqual(result.buoyancy, 0.5)
    })

    it('數字輸入應返回中性值', () => {
      const result = analyzeText(12345, 'tech')

      assert.strictEqual(result.tension, 0.5)
      assert.strictEqual(result.buoyancy, 0.5)
    })

    it('無效類別應使用 society 預設', () => {
      const result = analyzeText('hope peace progress', 'invalid')

      assert.ok(result.buoyancy > 0.5, 'should use society keywords')
    })

    it('tension 和 buoyancy 應在 0.1-0.9 範圍內', () => {
      // 極端正面
      const positive = analyzeText('amazing breakthrough innovation success growth funding', 'tech')
      assert.ok(positive.tension >= 0.1 && positive.tension <= 0.9)
      assert.ok(positive.buoyancy >= 0.1 && positive.buoyancy <= 0.9)

      // 極端負面
      const negative = analyzeText('layoffs failed bankrupt breach hacked shutdown', 'tech')
      assert.ok(negative.tension >= 0.1 && negative.tension <= 0.9)
      assert.ok(negative.buoyancy >= 0.1 && negative.buoyancy <= 0.9)
    })
  })

  describe('類別差異', () => {
    it('finance 類別應識別金融關鍵字', () => {
      const result = analyzeText('上漲反彈買超多頭紅盤', 'finance')

      assert.ok(result.buoyancy > 0.6)
    })

    it('society 類別應識別社會關鍵字', () => {
      const result = analyzeText('war death crisis disaster violence', 'society')

      assert.ok(result.tension > 0.6)
    })
  })
})

