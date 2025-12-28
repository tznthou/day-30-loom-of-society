/**
 * 情緒數據配置
 * 之後會換成真實 API 數據
 */

// 三條主絲帶的配置
export const RIBBON_CONFIG = {
  // 科技脈絡 - 青藍色系
  tech: {
    name: '科技',
    baseColor: { h: 195, s: 0.85, l: 0.55 },   // 青藍
    stressColor: { h: 280, s: 0.7, l: 0.4 },    // 冷紫
    relaxColor: { h: 165, s: 0.75, l: 0.5 },    // 翠綠
    position: { x: 0, y: 0.5, z: 0 },
    phase: 0
  },
  // 金融脈絡 - 琥珀金系
  finance: {
    name: '金融',
    baseColor: { h: 35, s: 0.9, l: 0.55 },      // 琥珀金
    stressColor: { h: 0, s: 0.8, l: 0.45 },     // 深紅
    relaxColor: { h: 50, s: 0.85, l: 0.6 },     // 暖金
    position: { x: -1.5, y: -0.3, z: 0.5 },
    phase: Math.PI * 0.33
  },
  // 社會脈絡 - 珊瑚粉系
  society: {
    name: '社會',
    baseColor: { h: 340, s: 0.7, l: 0.6 },      // 珊瑚粉
    stressColor: { h: 320, s: 0.6, l: 0.35 },   // 暗紫紅
    relaxColor: { h: 25, s: 0.8, l: 0.65 },     // 暖橙
    position: { x: 1.5, y: -0.5, z: -0.5 },
    phase: Math.PI * 0.66
  }
}

// 假數據 - 模擬情緒狀態
export const mockSentiment = {
  tech: {
    tension: 0.4,      // 0-1，張力（負面/緊張）
    buoyancy: 0.6,     // 0-1，浮力（正面/放鬆）
    activity: 0.5      // 0-1，活躍度
  },
  finance: {
    tension: 0.7,
    buoyancy: 0.3,
    activity: 0.8
  },
  society: {
    tension: 0.3,
    buoyancy: 0.7,
    activity: 0.4
  }
}

// 視覺參數
export const VISUAL_CONFIG = {
  // 絲帶參數
  ribbon: {
    segments: 200,         // 絲帶分段數
    radius: 0.08,          // 絲帶粗細
    length: 12,            // 絲帶長度
    noiseScale: 0.15,      // 噪聲縮放
    noiseSpeed: 0.0003,    // 噪聲速度
    waveAmplitude: 1.2,    // 波動振幅
    waveFrequency: 0.8     // 波動頻率
  },
  // 遠景細絲
  backgroundRibbons: {
    count: 25,
    opacity: 0.15,
    radius: 0.02
  },
  // 粒子
  particles: {
    countPerRibbon: 80,
    size: 0.03,
    speed: 0.002
  },
  // Bloom（降低強度，避免刺眼）
  bloom: {
    strength: 0.8,
    radius: 0.6,
    threshold: 0.4
  },
  // 相機
  camera: {
    fov: 60,
    near: 0.1,
    far: 100,
    position: { x: 0, y: 0, z: 8 }
  }
}

/**
 * 根據情緒計算絲帶物理參數
 */
export function calculateRibbonParams(sentiment) {
  const { tension, buoyancy, activity } = sentiment

  return {
    // 張力高 = 波動快且尖銳
    frequency: 0.5 + tension * 1.5,
    sharpness: 0.3 + tension * 0.7,

    // 浮力高 = 振幅大且柔軟
    amplitude: 0.5 + buoyancy * 1.0,
    softness: buoyancy,

    // 活躍度 = 整體動畫速度
    speed: 0.5 + activity * 1.0
  }
}

/**
 * 根據情緒混合顏色
 */
export function blendSentimentColor(config, sentiment) {
  const { tension, buoyancy } = sentiment
  const { baseColor, stressColor, relaxColor } = config

  // 高張力 → 偏向 stressColor
  // 高浮力 → 偏向 relaxColor
  const stressWeight = tension * 0.6
  const relaxWeight = buoyancy * 0.4
  const baseWeight = 1 - stressWeight - relaxWeight

  return {
    h: baseColor.h * baseWeight + stressColor.h * stressWeight + relaxColor.h * relaxWeight,
    s: baseColor.s * baseWeight + stressColor.s * stressWeight + relaxColor.s * relaxWeight,
    l: baseColor.l * baseWeight + stressColor.l * stressWeight + relaxColor.l * relaxWeight
  }
}
