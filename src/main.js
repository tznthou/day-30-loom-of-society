import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { RIBBON_CONFIG, mockSentiment, VISUAL_CONFIG } from './config.js'
import { createRibbon, updateRibbon, createBackgroundRibbons, updateBackgroundRibbons } from './ribbon.js'
import { createRibbonParticles, updateParticles, createStarDust, updateStarDust } from './particles.js'
import { createPostProcessing, updateBloomParams } from './bloom.js'
import { startSentimentPolling } from './api.js'

// ============================================
// 全域變數
// ============================================
let scene, camera, renderer, controls
let postProcessing
let ribbons = []
let particles = []
let backgroundRibbons
let starDust
let startTime

// 當前情緒數據（會被即時更新）
let currentSentiment = { ...mockSentiment }

// ============================================
// 初始化
// ============================================
async function init() {
  startTime = performance.now()

  // Scene
  scene = new THREE.Scene()
  scene.background = new THREE.Color(0x020208)  // 近乎純黑，微帶深藍

  // Camera
  const { fov, near, far, position } = VISUAL_CONFIG.camera
  camera = new THREE.PerspectiveCamera(fov, window.innerWidth / window.innerHeight, near, far)
  camera.position.set(position.x, position.y, position.z)

  // Renderer
  renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: false,
    powerPreference: 'high-performance'
  })
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 0.9

  const container = document.getElementById('canvas-container')
  container.appendChild(renderer.domElement)

  // Controls
  controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true
  controls.dampingFactor = 0.05
  controls.enableZoom = true
  controls.minDistance = 3
  controls.maxDistance = 20
  controls.autoRotate = true
  controls.autoRotateSpeed = 0.3

  // Post-processing
  postProcessing = createPostProcessing(renderer, scene, camera)

  // 創建場景元素
  await createScene()

  // 事件監聽
  window.addEventListener('resize', onResize)

  // 隱藏 loading
  hideLoading()

  // 開始即時數據更新（每 30 秒）
  startSentimentPolling((sentiment) => {
    currentSentiment = sentiment
    updateSentimentDisplay(sentiment)
    updateRibbonSentiments(sentiment)
  }, 30000)

  // 開始動畫
  animate()
}

// ============================================
// 更新情緒數據到絲帶
// ============================================
function updateRibbonSentiments(sentiment) {
  const keys = ['tech', 'finance', 'society']
  ribbons.forEach((ribbon, index) => {
    const key = keys[index]
    if (sentiment[key]) {
      ribbon.userData.sentiment = sentiment[key]
    }
  })
}

// ============================================
// 更新 HUD 顯示
// ============================================
function updateSentimentDisplay(sentiment) {
  const avgTension = (sentiment.tech.tension + sentiment.finance.tension + sentiment.society.tension) / 3
  const avgBuoyancy = (sentiment.tech.buoyancy + sentiment.finance.buoyancy + sentiment.society.buoyancy) / 3

  const tensionEl = document.getElementById('hud-tension')
  const buoyancyEl = document.getElementById('hud-buoyancy')

  if (tensionEl) tensionEl.textContent = avgTension.toFixed(2)
  if (buoyancyEl) buoyancyEl.textContent = avgBuoyancy.toFixed(2)
}

// ============================================
// 創建場景
// ============================================
async function createScene() {
  // 1. 背景星塵
  starDust = createStarDust()
  scene.add(starDust)

  // 2. 遠景細絲群
  backgroundRibbons = createBackgroundRibbons()
  scene.add(backgroundRibbons)

  // 3. 三條主絲帶
  const ribbonConfigs = Object.entries(RIBBON_CONFIG)
  for (const [key, config] of ribbonConfigs) {
    const sentiment = mockSentiment[key]
    const ribbon = createRibbon(config, sentiment)
    ribbons.push(ribbon)
    scene.add(ribbon)

    // 4. 每條絲帶的粒子
    const ribbonParticles = createRibbonParticles(ribbon)
    particles.push(ribbonParticles)
    scene.add(ribbonParticles)
  }

  // 5. 環境光（微弱，主要靠自發光）
  const ambientLight = new THREE.AmbientLight(0x222244, 0.1)
  scene.add(ambientLight)
}

// ============================================
// 動畫循環
// ============================================
function animate() {
  requestAnimationFrame(animate)

  const time = performance.now() - startTime

  // 更新控制器
  controls.update()

  // 更新星塵
  updateStarDust(starDust, time)

  // 更新遠景細絲（每 3 幀更新一次，節省效能）
  if (Math.floor(time / 16) % 3 === 0) {
    updateBackgroundRibbons(backgroundRibbons, time)
  }

  // 更新主絲帶
  ribbons.forEach(ribbon => updateRibbon(ribbon, time))

  // 更新粒子
  particles.forEach(p => updateParticles(p, time))

  // 動態 Bloom
  updateBloomParams(postProcessing.bloomPass, currentSentiment)

  // 渲染（使用後處理）
  postProcessing.composer.render()
}

// ============================================
// 響應式
// ============================================
function onResize() {
  const width = window.innerWidth
  const height = window.innerHeight

  camera.aspect = width / height
  camera.updateProjectionMatrix()

  renderer.setSize(width, height)
  postProcessing.resize(width, height)
}

// ============================================
// 隱藏 Loading，顯示 HUD
// ============================================
function hideLoading() {
  const loading = document.getElementById('loading')
  const hud = document.getElementById('hud')
  const controlsHint = document.getElementById('controls-hint')
  const infoBtn = document.getElementById('info-btn')

  setTimeout(() => {
    loading.classList.add('hidden')

    // 顯示 HUD、操作提示、資訊按鈕
    setTimeout(() => {
      hud.classList.add('visible')
      controlsHint.classList.add('visible')
      infoBtn.classList.add('visible')

      // 5 秒後淡出操作提示
      setTimeout(() => {
        controlsHint.classList.remove('visible')
      }, 5000)
    }, 1000)

    setTimeout(() => loading.remove(), 1000)
  }, 500)
}

// ============================================
// 前導頁面交互
// ============================================
function setupIntro() {
  const intro = document.getElementById('intro')
  const enterBtn = document.getElementById('enter-btn')
  const loading = document.getElementById('loading')

  // 隱藏 loading（前導頁面顯示時不需要）
  loading.style.display = 'none'

  enterBtn.addEventListener('click', async () => {
    // 顯示 loading
    loading.style.display = 'flex'

    // 淡出前導頁面
    intro.classList.add('hidden')

    // 等待過渡動畫
    await new Promise(resolve => setTimeout(resolve, 800))

    // 初始化場景
    try {
      await init()
    } catch (error) {
      console.error('初始化失敗:', error)
      document.getElementById('loading-text').textContent = 'Failed to initialize'
    }

    // 移除前導頁面
    setTimeout(() => intro.remove(), 1500)
  })
}

// ============================================
// 啟動
// ============================================
setupIntro()
