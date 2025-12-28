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
  const { segments, length, noiseScale, waveAmplitude } = VISUAL_CONFIG.ribbon
  const params = calculateRibbonParams(sentiment)
  const points = []

  for (let i = 0; i <= segments; i++) {
    const t = i / segments
    const x = (t - 0.5) * length

    // 使用 4D noise 讓曲線隨時間演化
    const noiseTime = time * params.speed * 0.5
    const nx = noise4D(x * noiseScale, 0, config.phase, noiseTime) * waveAmplitude * params.amplitude
    const ny = noise4D(x * noiseScale, 1, config.phase, noiseTime) * waveAmplitude * params.amplitude * 0.6
    const nz = noise4D(x * noiseScale, 2, config.phase, noiseTime) * waveAmplitude * params.amplitude * 0.4

    // 加上基礎位置偏移
    const baseY = config.position.y + Math.sin(t * Math.PI * params.frequency + config.phase) * 0.3
    const baseZ = config.position.z + Math.cos(t * Math.PI * 0.5 + config.phase) * 0.2

    points.push(new THREE.Vector3(
      x + config.position.x,
      baseY + ny,
      baseZ + nz + nx * 0.3
    ))
  }

  return new THREE.CatmullRomCurve3(points)
}

/**
 * 創建絲帶 Mesh
 */
export function createRibbon(config, sentiment) {
  const { segments, radius } = VISUAL_CONFIG.ribbon

  // 初始曲線
  const curve = createRibbonCurve(config, sentiment, 0)

  // TubeGeometry - 管狀幾何
  const geometry = new THREE.TubeGeometry(curve, segments, radius, 8, false)

  // 計算顏色
  const color = blendSentimentColor(config, sentiment)
  const hslColor = new THREE.Color().setHSL(color.h / 360, color.s, color.l)

  // 材質 - 柔和發光效果
  const material = new THREE.MeshBasicMaterial({
    color: hslColor,
    transparent: true,
    opacity: 0.6,
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

/**
 * 更新絲帶動畫
 */
export function updateRibbon(ribbon, time) {
  const { config, sentiment } = ribbon.userData
  const { segments, radius } = VISUAL_CONFIG.ribbon

  // 創建新曲線
  const curve = createRibbonCurve(config, sentiment, time)

  // 更新幾何
  const newGeometry = new THREE.TubeGeometry(curve, segments, radius, 8, false)
  ribbon.geometry.dispose()
  ribbon.geometry = newGeometry

  // 存儲新曲線供粒子使用
  ribbon.userData.curve = curve

  // 微妙的顏色呼吸效果
  const breathe = Math.sin(time * 0.001 + config.phase) * 0.1 + 0.9
  const color = ribbon.userData.baseColor
  ribbon.material.color.setHSL(
    color.h / 360,
    color.s,
    color.l * breathe
  )
}

/**
 * 創建遠景細絲群
 */
export function createBackgroundRibbons() {
  const { count, opacity, radius } = VISUAL_CONFIG.backgroundRibbons
  const group = new THREE.Group()

  for (let i = 0; i < count; i++) {
    // 隨機參數
    const hue = Math.random() * 360
    const segments = 80
    const length = 15 + Math.random() * 10

    // 隨機位置（在主絲帶周圍分布）
    const angle = (i / count) * Math.PI * 2
    const distance = 3 + Math.random() * 5
    const height = (Math.random() - 0.5) * 4
    const depth = (Math.random() - 0.5) * 6

    // 創建簡單的曲線
    const points = []
    for (let j = 0; j <= segments; j++) {
      const t = j / segments
      const x = (t - 0.5) * length

      // 簡單的 sin 波動
      const phase = i * 0.5
      const y = height + Math.sin(t * Math.PI * 2 + phase) * 0.5
      const z = depth + Math.cos(t * Math.PI + phase) * 0.3

      points.push(new THREE.Vector3(
        x + Math.cos(angle) * distance,
        y,
        z + Math.sin(angle) * distance
      ))
    }

    const curve = new THREE.CatmullRomCurve3(points)
    const geometry = new THREE.TubeGeometry(curve, segments, radius, 4, false)

    const material = new THREE.MeshBasicMaterial({
      color: new THREE.Color().setHSL(hue / 360, 0.3, 0.4),
      transparent: true,
      opacity: opacity * (0.5 + Math.random() * 0.5),
      blending: THREE.AdditiveBlending,
      depthWrite: false
    })

    const mesh = new THREE.Mesh(geometry, material)
    mesh.userData = {
      phase: i * 0.3,
      speed: 0.0002 + Math.random() * 0.0003,
      originalPoints: points.map(p => p.clone())
    }

    group.add(mesh)
  }

  return group
}

/**
 * 更新遠景細絲動畫
 */
export function updateBackgroundRibbons(group, time) {
  const { radius } = VISUAL_CONFIG.backgroundRibbons

  group.children.forEach((mesh, index) => {
    const { phase, speed, originalPoints } = mesh.userData

    // 緩慢波動
    const points = originalPoints.map((p, i) => {
      const t = i / originalPoints.length
      const offset = noise3D(t * 2, phase, time * speed) * 0.3
      return new THREE.Vector3(
        p.x,
        p.y + offset,
        p.z + offset * 0.5
      )
    })

    const curve = new THREE.CatmullRomCurve3(points)
    const newGeometry = new THREE.TubeGeometry(curve, originalPoints.length - 1, radius, 4, false)
    mesh.geometry.dispose()
    mesh.geometry = newGeometry
  })
}
