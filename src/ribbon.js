import * as THREE from 'three'
import { createNoise3D, createNoise4D } from 'simplex-noise'
import { VISUAL_CONFIG, calculateRibbonParams, blendSentimentColor } from './config.js'

const noise3D = createNoise3D()
const noise4D = createNoise4D()

/**
 * 創建絲帶曲線路徑
 * 使用 noise 生成有機的 3D 曲線
 */
function createRibbonCurve(config, sentiment, time) {
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

    // 使用 4D noise 讓曲線隨時間演化
    const noiseTime = time * params.speed * noiseTimeScale
    const nx = noise4D(x * noiseScale, 0, config.phase, noiseTime) * waveAmplitude * params.amplitude
    const ny = noise4D(x * noiseScale, 1, config.phase, noiseTime) * waveAmplitude * params.amplitude * yAmplitudeRatio
    const nz = noise4D(x * noiseScale, 2, config.phase, noiseTime) * waveAmplitude * params.amplitude * zAmplitudeRatio

    // 加上基礎位置偏移
    const baseY = config.position.y + Math.sin(t * Math.PI * params.frequency + config.phase) * baseYSinAmplitude
    const baseZ = config.position.z + Math.cos(t * Math.PI * 0.5 + config.phase) * baseZCosAmplitude

    points.push(new THREE.Vector3(
      x + config.position.x,
      baseY + ny,
      baseZ + nz + nx * zNoiseInfluence
    ))
  }

  return new THREE.CatmullRomCurve3(points)
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
