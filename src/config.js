/**
 * The Loom of Society - 配置中心
 * 所有 magic numbers 集中管理
 */

// ============================================
// 三條主絲帶配置（顏色與位置）
// ============================================
export const RIBBON_CONFIG = {
  // 科技脈絡 - 青藍色系
  tech: {
    name: '科技',
    baseColor: { h: 195, s: 0.85, l: 0.55 },   // 青藍
    stressColor: { h: 280, s: 0.7, l: 0.4 },   // 冷紫
    relaxColor: { h: 165, s: 0.75, l: 0.5 },   // 翠綠
    position: { x: 0, y: 0.5, z: 0 },
    phase: 0
  },
  // 金融脈絡 - 琥珀金系
  finance: {
    name: '金融',
    baseColor: { h: 35, s: 0.9, l: 0.55 },     // 琥珀金
    stressColor: { h: 0, s: 0.8, l: 0.45 },    // 深紅
    relaxColor: { h: 50, s: 0.85, l: 0.6 },    // 暖金
    position: { x: -1.5, y: -0.3, z: 0.5 },
    phase: Math.PI * 0.33
  },
  // 社會脈絡 - 珊瑚粉系
  society: {
    name: '社會',
    baseColor: { h: 340, s: 0.7, l: 0.6 },     // 珊瑚粉
    stressColor: { h: 320, s: 0.6, l: 0.35 },  // 暗紫紅
    relaxColor: { h: 25, s: 0.8, l: 0.65 },    // 暖橙
    position: { x: 1.5, y: -0.5, z: -0.5 },
    phase: Math.PI * 0.66
  }
}

// ============================================
// 情緒 → 物理參數 轉換公式
// ============================================
export const SENTIMENT_FORMULA = {
  // 頻率：tension 越高，振動越快
  frequency: {
    base: 0.5,
    tensionScale: 1.5
  },
  // 尖銳度：tension 越高，曲線越尖銳
  sharpness: {
    base: 0.3,
    tensionScale: 0.7
  },
  // 振幅：buoyancy 越高，擺幅越大
  amplitude: {
    base: 0.5,
    buoyancyScale: 1.0
  },
  // 速度：activity 越高，動畫越快
  speed: {
    base: 0.5,
    activityScale: 1.0
  },
  // 顏色混合權重
  colorBlend: {
    stressWeight: 0.6,   // 張力對 stressColor 的影響
    relaxWeight: 0.4     // 浮力對 relaxColor 的影響
  }
}

// ============================================
// 渲染器配置
// ============================================
export const RENDERER_CONFIG = {
  background: 0x020208,           // 深空背景（近乎純黑，微帶深藍）
  maxPixelRatio: 2,               // 最大像素比（效能考量）
  toneMappingExposure: 0.9,       // ACES 曝光值
  ambientLight: {
    color: 0x222244,              // 環境光顏色（微弱深藍）
    intensity: 0.1                // 環境光強度
  }
}

// ============================================
// 控制器配置（OrbitControls）
// ============================================
export const CONTROLS_CONFIG = {
  dampingFactor: 0.05,            // 阻尼係數
  minDistance: 3,                 // 最小縮放距離
  maxDistance: 20,                // 最大縮放距離
  autoRotateSpeed: 0.3            // 自動旋轉速度
}

// ============================================
// 時間配置（毫秒）
// ============================================
export const TIMING = {
  // API 輪詢
  sentimentPolling: 30000,        // 情緒數據更新間隔 (30秒)

  // UI 過渡
  loadingHideDelay: 500,          // Loading 隱藏延遲
  hudShowDelay: 1000,             // HUD 顯示延遲
  loadingRemoveDelay: 1000,       // Loading 移除延遲
  controlsHintDuration: 5000,     // 操作提示顯示時間
  introTransition: 800,           // 前導頁面過渡時間
  introRemoveDelay: 1500,         // 前導頁面移除延遲

  // 動畫優化
  backgroundRibbonFrameSkip: 3    // 背景絲帶每 N 幀更新一次
}

// ============================================
// 視覺參數
// ============================================
export const VISUAL_CONFIG = {
  // 主絲帶
  ribbon: {
    segments: 200,                // 曲線分段數
    radius: 0.08,                 // 絲帶粗細
    length: 12,                   // 絲帶長度
    radialSegments: 8,            // TubeGeometry 圓周分段
    opacity: 0.6,                 // 絲帶不透明度

    // Noise 參數
    noiseScale: 0.15,             // 噪聲空間縮放
    noiseSpeed: 0.0003,           // 噪聲時間速度
    noiseTimeScale: 0.5,          // noise time 的速度乘數

    // 波動參數
    waveAmplitude: 1.2,           // 主波動振幅
    waveFrequency: 0.8,           // 主波動頻率
    yAmplitudeRatio: 0.6,         // Y 軸振幅相對比例
    zAmplitudeRatio: 0.4,         // Z 軸振幅相對比例
    baseYSinAmplitude: 0.3,       // 基底 Y sin 波振幅
    baseZCosAmplitude: 0.2,       // 基底 Z cos 波振幅
    zNoiseInfluence: 0.3,         // X noise 對 Z 的影響

    // 呼吸效果
    breathe: {
      frequency: 0.001,           // 呼吸頻率
      amplitude: 0.1,             // 呼吸振幅 (lightness ±)
      baseline: 0.9               // 呼吸基準值
    }
  },

  // 遠景細絲
  backgroundRibbons: {
    count: 25,                    // 細絲數量
    opacity: 0.15,                // 基礎不透明度
    opacityVariation: 0.5,        // 不透明度隨機範圍
    radius: 0.02,                 // 細絲粗細
    radialSegments: 4,            // 圓周分段（較低以節省效能）
    segments: 80,                 // 曲線分段

    // 分布範圍
    lengthBase: 15,               // 基礎長度
    lengthVariation: 10,          // 長度隨機範圍
    distanceBase: 3,              // 距中心基礎距離
    distanceVariation: 5,         // 距離隨機範圍
    heightRange: 4,               // 高度範圍 (±2)
    depthRange: 6,                // 深度範圍 (±3)

    // 動畫參數
    waveAmplitude: 0.5,           // 波動振幅
    waveFrequency: 2,             // 波動頻率
    speedBase: 0.0002,            // 基礎動畫速度
    speedVariation: 0.0003,       // 速度隨機範圍
    noiseAmplitude: 0.3,          // 噪聲振幅
    noiseZRatio: 0.5,             // Z 軸噪聲比例

    // 顏色
    saturation: 0.3,              // 飽和度
    lightness: 0.4                // 亮度
  },

  // 能量粒子
  particles: {
    countPerRibbon: 80,           // 每條絲帶的粒子數
    size: 0.03,                   // 基礎粒子大小
    sizeVariation: { min: 0.5, max: 1.5 },  // 大小變化範圍

    // 顏色變化
    hueVariation: 0.05,           // 色相隨機偏移
    saturationScale: 0.8,         // 飽和度縮放
    lightnessScale: 0.7,          // 亮度縮放
    lightnessVariation: 0.1,      // 亮度隨機偏移
    lightnessBoost: 0.2,          // 基礎顏色亮度提升

    // 運動參數
    speedBase: 0.001,             // 基礎速度
    speedVariation: 0.002,        // 速度隨機範圍
    wobbleFrequency: 0.002,       // 擺動頻率
    wobbleAmplitude: 0.02,        // 擺動振幅

    // Shader 參數
    shader: {
      pointSizeScale: 300.0,      // 粒子大小縮放因子
      alphaEdgeStart: 0.2,        // Alpha 漸變開始
      alphaEdgeEnd: 0.5,          // Alpha 漸變結束
      alphaMax: 0.8               // 最大 Alpha 值
    }
  },

  // 星塵
  starDust: {
    count: 500,                   // 粒子數量
    radiusBase: 15,               // 基礎分布半徑
    radiusVariation: 20,          // 半徑隨機範圍
    sizeBase: 0.02,               // 基礎大小
    sizeVariation: 0.04,          // 大小隨機範圍

    // 顏色（青藍到紫色）
    hueBase: 0.5,                 // 基礎色相
    hueVariation: 0.2,            // 色相隨機範圍
    saturation: 0.3,              // 飽和度
    lightnessBase: 0.4,           // 基礎亮度
    lightnessVariation: 0.2,      // 亮度隨機範圍

    // 旋轉動畫
    rotationSpeedY: 0.00005,      // Y 軸旋轉速度
    rotationSpeedX: 0.00003,      // X 軸擺動頻率
    rotationAmplitudeX: 0.1,      // X 軸擺動幅度

    // Shader 閃爍
    shader: {
      pointSizeScale: 200.0,      // 粒子大小縮放因子
      flickerFrequency: 0.001,    // 閃爍頻率
      flickerSpatialFreq: 10.0,   // 空間頻率
      flickerAmplitude: 0.3,      // 閃爍振幅
      flickerBaseline: 0.7,       // 閃爍基準
      alphaScale: 0.4             // Alpha 縮放
    }
  },

  // Bloom 後處理
  bloom: {
    strength: 0.8,                // 基礎強度
    radius: 0.6,                  // 擴散半徑
    threshold: 0.4,               // 亮度閾值
    // 動態調整
    activityInfluence: 0.2,       // 活躍度對強度的影響
    tensionInfluence: 0.1         // 張力對半徑的影響
  },

  // 相機
  camera: {
    fov: 60,                      // 視野角度
    near: 0.1,                    // 近裁切面
    far: 100,                     // 遠裁切面
    position: { x: 0, y: 0, z: 8 }  // 初始位置
  }
}

// ============================================
// 假數據 - 模擬情緒狀態（API 未連線時使用）
// ============================================
export const mockSentiment = {
  tech: {
    tension: 0.4,                 // 0-1，張力（負面/緊張）
    buoyancy: 0.6,                // 0-1，浮力（正面/放鬆）
    activity: 0.5                 // 0-1，活躍度
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

// ============================================
// 輔助函數：情緒 → 物理參數
// ============================================
export function calculateRibbonParams(sentiment) {
  const { tension, buoyancy, activity } = sentiment
  const { frequency, sharpness, amplitude, speed } = SENTIMENT_FORMULA

  return {
    // 張力高 = 波動快且尖銳
    frequency: frequency.base + tension * frequency.tensionScale,
    sharpness: sharpness.base + tension * sharpness.tensionScale,

    // 浮力高 = 振幅大且柔軟
    amplitude: amplitude.base + buoyancy * amplitude.buoyancyScale,
    softness: buoyancy,

    // 活躍度 = 整體動畫速度
    speed: speed.base + activity * speed.activityScale
  }
}

// ============================================
// 輔助函數：情緒 → 顏色混合
// ============================================
export function blendSentimentColor(config, sentiment) {
  const { tension, buoyancy } = sentiment
  const { baseColor, stressColor, relaxColor } = config
  const { stressWeight, relaxWeight } = SENTIMENT_FORMULA.colorBlend

  // 高張力 → 偏向 stressColor
  // 高浮力 → 偏向 relaxColor
  const stressInfluence = tension * stressWeight
  const relaxInfluence = buoyancy * relaxWeight
  const baseInfluence = 1 - stressInfluence - relaxInfluence

  return {
    h: baseColor.h * baseInfluence + stressColor.h * stressInfluence + relaxColor.h * relaxInfluence,
    s: baseColor.s * baseInfluence + stressColor.s * stressInfluence + relaxColor.s * relaxInfluence,
    l: baseColor.l * baseInfluence + stressColor.l * stressInfluence + relaxColor.l * relaxInfluence
  }
}
