import * as THREE from 'three'
import { createNoise3D, createNoise4D } from 'simplex-noise'
import { VISUAL_CONFIG, calculateRibbonParams, blendSentimentColor } from './config.js'

const noise3D = createNoise3D()
const noise4D = createNoise4D()

/**
 * 創建基礎絲帶點（不含交織偏移）
 * @returns {THREE.Vector3[]} 點陣列
 */
function createBaseRibbonPoints(config, sentiment, time) {
  const {
    segments,
    length,
    noiseScale,
    waveAmplitude,
    noiseTimeScale,
    yAmplitudeRatio,
    zAmplitudeRatio,
    baseYSinAmplitude,
    baseZCosAmplitude,
    zNoiseInfluence
  } = VISUAL_CONFIG.ribbon

  const params = calculateRibbonParams(sentiment)
  const points = []

  for (let i = 0; i <= segments; i++) {
    const t = i / segments
    const x = (t - 0.5) * length

    const noiseTime = time * params.speed * noiseTimeScale
    const nx = noise4D(x * noiseScale, 0, config.phase, noiseTime) * waveAmplitude * params.amplitude
    const ny = noise4D(x * noiseScale, 1, config.phase, noiseTime) * waveAmplitude * params.amplitude * yAmplitudeRatio
    const nz = noise4D(x * noiseScale, 2, config.phase, noiseTime) * waveAmplitude * params.amplitude * zAmplitudeRatio

    const baseY = config.position.y + Math.sin(t * Math.PI * params.frequency + config.phase) * baseYSinAmplitude
    const baseZ = config.position.z + Math.cos(t * Math.PI * 0.5 + config.phase) * baseZCosAmplitude

    points.push(new THREE.Vector3(
      x + config.position.x,
      baseY + ny,
      baseZ + nz + nx * zNoiseInfluence
    ))
  }

  return points
}

/**
 * 交叉檢測並應用 Z 軸偏移
 * 當兩條絲帶的 Y 差距小於閾值時，判定為交叉區域
 * 根據 segment 位置輪替決定誰在前誰在後
 */
function applyWeaveOffsets(allPoints) {
  const { weave } = VISUAL_CONFIG.ribbon
  if (!weave.enabled) return allPoints

  const segments = allPoints[0].length
  const threshold = weave.crossThreshold
  const zOffset = weave.amplitude
  const cycleLength = weave.cycleLength

  // 複製點陣列
  const result = allPoints.map(points =>
    points.map(p => p.clone())
  )

  // 對每個 segment 檢測交叉
  for (let i = 0; i < segments; i++) {
    // 檢測三對組合：0-1, 0-2, 1-2
    const pairs = [[0, 1], [0, 2], [1, 2]]

    for (const [a, b] of pairs) {
      const yA = result[a][i].y
      const yB = result[b][i].y
      const yDiff = Math.abs(yA - yB)

      if (yDiff < threshold) {
        // 交叉區域：決定前後順序
        // 使用 segment 位置 + 配對索引來輪替
        const cyclePos = Math.floor(i / cycleLength)
        const shouldABeInFront = ((a + b + cyclePos) % 2 === 0)

        // 平滑過渡因子：越接近 threshold 邊緣，偏移越弱
        const smoothFactor = 1 - (yDiff / threshold)
        const offset = zOffset * smoothFactor

        if (shouldABeInFront) {
          result[a][i].z += offset
          result[b][i].z -= offset
        } else {
          result[a][i].z -= offset
          result[b][i].z += offset
        }
      }
    }
  }

  return result
}

/**
 * 批次更新三條絲帶（含真交叉檢測）
 */
export function updateRibbonsWithWeave(ribbons, time) {
  const { segments, radius, radialSegments, breathe, weave } = VISUAL_CONFIG.ribbon

  // 節流控制
  const now = time
  const lastUpdate = ribbons[0]?.userData.lastGeometryUpdate || 0
  if (now - lastUpdate < GEOMETRY_UPDATE_INTERVAL) {
    // 只更新呼吸效果
    ribbons.forEach(ribbon => {
      const { config } = ribbon.userData
      const breatheValue = Math.sin(time * breathe.frequency + config.phase) * breathe.amplitude + breathe.baseline
      const color = ribbon.userData.baseColor
      ribbon.material.color.setHSL(color.h / 360, color.s, color.l * breatheValue)
    })
    return
  }

  // 1. 為每條絲帶計算基礎點
  const allBasePoints = ribbons.map(ribbon => {
    const { config, sentiment } = ribbon.userData
    return createBaseRibbonPoints(config, sentiment, time)
  })

  // 2. 應用交織偏移（真交叉檢測）
  const allFinalPoints = weave.enabled
    ? applyWeaveOffsets(allBasePoints)
    : allBasePoints

  // 3. 更新每條絲帶的幾何
  ribbons.forEach((ribbon, index) => {
    const points = allFinalPoints[index]
    const curve = new THREE.CatmullRomCurve3(points)

    const newGeometry = new THREE.TubeGeometry(curve, segments, radius, radialSegments, false)
    ribbon.geometry.dispose()
    ribbon.geometry = newGeometry

    ribbon.userData.curve = curve
    ribbon.userData.lastGeometryUpdate = now

    // 呼吸效果
    const { config } = ribbon.userData
    const breatheValue = Math.sin(time * breathe.frequency + config.phase) * breathe.amplitude + breathe.baseline
    const color = ribbon.userData.baseColor
    ribbon.material.color.setHSL(color.h / 360, color.s, color.l * breatheValue)
  })
}

/**
 * 創建絲帶曲線路徑（保留給初始化使用）
 */
function createRibbonCurve(config, sentiment, time) {
  return new THREE.CatmullRomCurve3(createBaseRibbonPoints(config, sentiment, time))
}

/**
 * 創建絲帶 Mesh
 */
export function createRibbon(config, sentiment) {
  const { segments, radius, radialSegments, opacity } = VISUAL_CONFIG.ribbon

  // 初始曲線
  const curve = createRibbonCurve(config, sentiment, 0)

  // TubeGeometry - 管狀幾何
  const geometry = new THREE.TubeGeometry(curve, segments, radius, radialSegments, false)

  // 計算顏色
  const color = blendSentimentColor(config, sentiment)
  const hslColor = new THREE.Color().setHSL(color.h / 360, color.s, color.l)

  // 材質 - 柔和發光效果
  const material = new THREE.MeshBasicMaterial({
    color: hslColor,
    transparent: true,
    opacity: opacity,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  })

  const mesh = new THREE.Mesh(geometry, material)

  // 存儲配置以便更新
  mesh.userData = {
    config,
    sentiment,
    curve,
    baseColor: color
  }

  return mesh
}

// C02 平衡修復：降低頻率但保持流暢
// 原本每幀 (16ms) → 改為 25ms (40fps)，GC 壓力減少 40%，視覺仍流暢
const GEOMETRY_UPDATE_INTERVAL = 25

/**
 * 更新絲帶動畫
 */
export function updateRibbon(ribbon, time) {
  const { config, sentiment } = ribbon.userData
  const { segments, radius, radialSegments, breathe } = VISUAL_CONFIG.ribbon

  // 只在間隔內更新 Geometry，減少每秒建立的物件數量
  const lastGeometryUpdate = ribbon.userData.lastGeometryUpdate || 0
  if (time - lastGeometryUpdate >= GEOMETRY_UPDATE_INTERVAL) {
    // 創建新曲線
    const curve = createRibbonCurve(config, sentiment, time)

    // 更新幾何
    const newGeometry = new THREE.TubeGeometry(curve, segments, radius, radialSegments, false)
    ribbon.geometry.dispose()
    ribbon.geometry = newGeometry

    // 存儲新曲線供粒子使用
    ribbon.userData.curve = curve
    ribbon.userData.lastGeometryUpdate = time
  }

  // 微妙的顏色呼吸效果（每幀更新，成本低）
  const breatheValue = Math.sin(time * breathe.frequency + config.phase) * breathe.amplitude + breathe.baseline
  const color = ribbon.userData.baseColor
  ribbon.material.color.setHSL(
    color.h / 360,
    color.s,
    color.l * breatheValue
  )
}

/**
 * 創建遠景細絲群
 */
export function createBackgroundRibbons() {
  const bg = VISUAL_CONFIG.backgroundRibbons
  const group = new THREE.Group()

  for (let i = 0; i < bg.count; i++) {
    // 隨機參數
    const hue = Math.random() * 360
    const length = bg.lengthBase + Math.random() * bg.lengthVariation

    // 隨機位置（在主絲帶周圍分布）
    const angle = (i / bg.count) * Math.PI * 2
    const distance = bg.distanceBase + Math.random() * bg.distanceVariation
    const height = (Math.random() - 0.5) * bg.heightRange
    const depth = (Math.random() - 0.5) * bg.depthRange

    // 創建簡單的曲線
    const points = []
    for (let j = 0; j <= bg.segments; j++) {
      const t = j / bg.segments
      const x = (t - 0.5) * length

      // 簡單的 sin 波動
      const phase = i * 0.5
      const y = height + Math.sin(t * Math.PI * bg.waveFrequency + phase) * bg.waveAmplitude
      const z = depth + Math.cos(t * Math.PI + phase) * (bg.waveAmplitude * 0.6)

      points.push(new THREE.Vector3(
        x + Math.cos(angle) * distance,
        y,
        z + Math.sin(angle) * distance
      ))
    }

    const curve = new THREE.CatmullRomCurve3(points)
    const geometry = new THREE.TubeGeometry(curve, bg.segments, bg.radius, bg.radialSegments, false)

    const material = new THREE.MeshBasicMaterial({
      color: new THREE.Color().setHSL(hue / 360, bg.saturation, bg.lightness),
      transparent: true,
      opacity: bg.opacity * (bg.opacityVariation + Math.random() * bg.opacityVariation),
      blending: THREE.AdditiveBlending,
      depthWrite: false
    })

    const mesh = new THREE.Mesh(geometry, material)
    mesh.userData = {
      phase: i * 0.3,
      speed: bg.speedBase + Math.random() * bg.speedVariation,
      originalPoints: points.map(p => p.clone())
    }

    group.add(mesh)
  }

  return group
}

// C02 平衡修復：背景絲帶降低更新頻率（遠景可接受較低 fps）
// 原本每幀 (16ms) → 改為 50ms (20fps)，GC 壓力減少 70%
const BG_GEOMETRY_UPDATE_INTERVAL = 50
let lastBgUpdate = 0

/**
 * 更新遠景細絲動畫
 */
export function updateBackgroundRibbons(group, time) {
  // 降低更新頻率
  if (time - lastBgUpdate < BG_GEOMETRY_UPDATE_INTERVAL) return
  lastBgUpdate = time

  const bg = VISUAL_CONFIG.backgroundRibbons

  group.children.forEach((mesh, index) => {
    const { phase, speed, originalPoints } = mesh.userData

    // 緩慢波動
    const points = originalPoints.map((p, i) => {
      const t = i / originalPoints.length
      const offset = noise3D(t * bg.waveFrequency, phase, time * speed) * bg.noiseAmplitude
      return new THREE.Vector3(
        p.x,
        p.y + offset,
        p.z + offset * bg.noiseZRatio
      )
    })

    const curve = new THREE.CatmullRomCurve3(points)
    const newGeometry = new THREE.TubeGeometry(curve, originalPoints.length - 1, bg.radius, bg.radialSegments, false)
    mesh.geometry.dispose()
    mesh.geometry = newGeometry
  })
}
