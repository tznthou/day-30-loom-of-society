import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import {
  RIBBON_CONFIG,
  mockSentiment,
  VISUAL_CONFIG,
  RENDERER_CONFIG,
  CONTROLS_CONFIG,
  TIMING
} from './config.js'
import { createRibbon, updateRibbonsWithWeave, createBackgroundRibbons, updateBackgroundRibbons } from './ribbon.js'
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

// H03: 動畫與輪詢控制
let animationFrameId = null
let stopPolling = null

// 當前情緒數據（會被即時更新）
let currentSentiment = { ...mockSentiment }

// ============================================
// 初始化
// ============================================
async function init() {
  startTime = performance.now()

  // Scene
  scene = new THREE.Scene()
  scene.background = new THREE.Color(RENDERER_CONFIG.background)

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
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, RENDERER_CONFIG.maxPixelRatio))
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = RENDERER_CONFIG.toneMappingExposure

  const container = document.getElementById('canvas-container')
  container.appendChild(renderer.domElement)

  // Controls
  controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true
  controls.dampingFactor = CONTROLS_CONFIG.dampingFactor
  controls.enableZoom = true
  controls.minDistance = CONTROLS_CONFIG.minDistance
  controls.maxDistance = CONTROLS_CONFIG.maxDistance
  controls.autoRotate = true
  controls.autoRotateSpeed = CONTROLS_CONFIG.autoRotateSpeed

  // Post-processing
  postProcessing = createPostProcessing(renderer, scene, camera)

  // 創建場景元素
  await createScene()

  // 事件監聽
  window.addEventListener('resize', onResize)

  // H03: 頁面卸載時清理
  window.addEventListener('beforeunload', cleanup)

  // H03: 分頁可見性變化時暫停/恢復動畫
  document.addEventListener('visibilitychange', handleVisibilityChange)

  // 隱藏 loading
  hideLoading()

  // 開始即時數據更新（H03: 存儲停止函數）
  stopPolling = startSentimentPolling((sentiment) => {
    currentSentiment = sentiment
    updateSentimentDisplay(sentiment)
    updateRibbonSentiments(sentiment)
  }, TIMING.sentimentPolling)

  // 開始動畫
  animate()
}

// ============================================
// H03: 資源清理函式
// ============================================
function cleanup() {
  console.log('Cleaning up resources...')

  // 停止動畫迴圈
  if (animationFrameId !== null) {
    cancelAnimationFrame(animationFrameId)
    animationFrameId = null
  }

  // 停止 API 輪詢
  if (stopPolling) {
    stopPolling()
    stopPolling = null
  }

  // 清理 Three.js 資源
  if (scene) {
    scene.traverse((object) => {
      if (object.geometry) {
        object.geometry.dispose()
      }
      if (object.material) {
        if (Array.isArray(object.material)) {
          object.material.forEach(m => m.dispose())
        } else {
          object.material.dispose()
        }
      }
    })
  }

  // 清理 renderer
  if (renderer) {
    renderer.dispose()
    renderer.forceContextLoss()
    if (renderer.domElement && renderer.domElement.parentNode) {
      renderer.domElement.parentNode.removeChild(renderer.domElement)
    }
  }

  // 清理 postProcessing
  if (postProcessing && postProcessing.composer) {
    postProcessing.composer.dispose()
  }

  // 移除事件監聽器
  window.removeEventListener('resize', onResize)
  window.removeEventListener('beforeunload', cleanup)
  document.removeEventListener('visibilitychange', handleVisibilityChange)

  console.log('Cleanup complete')
}

// H03: 分頁可見性處理（分頁隱藏時暫停動畫節省資源）
function handleVisibilityChange() {
  if (document.hidden) {
    // 分頁隱藏時暫停動畫
    if (animationFrameId !== null) {
      cancelAnimationFrame(animationFrameId)
      animationFrameId = null
    }
  } else {
    // 分頁顯示時恢復動畫
    if (animationFrameId === null && scene) {
      animate()
    }
  }
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
  const { color, intensity } = RENDERER_CONFIG.ambientLight
  const ambientLight = new THREE.AmbientLight(color, intensity)
  scene.add(ambientLight)
}

// ============================================
// 動畫循環
// ============================================
function animate() {
  // H03: 存儲 animationFrameId 以便清理
  animationFrameId = requestAnimationFrame(animate)

  const time = performance.now() - startTime

  // 更新控制器
  controls.update()

  // 更新星塵
  updateStarDust(starDust, time)

  // 更新遠景細絲（每 N 幀更新一次，節省效能）
  // 使用 16ms 作為一幀的基準時間
  if (Math.floor(time / 16) % TIMING.backgroundRibbonFrameSkip === 0) {
    updateBackgroundRibbons(backgroundRibbons, time)
  }

  // 更新主絲帶（批次處理 + 真交叉檢測）
  updateRibbonsWithWeave(ribbons, time)

  // 更新粒子
  particles.forEach(p => updateParticles(p, time))

  // 動態後處理（Bloom + Chromatic Aberration）
  updateBloomParams(postProcessing.bloomPass, currentSentiment, postProcessing.chromaticPass)

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

  setTimeout(() => {
    loading.classList.add('hidden')

    // 顯示 HUD 和操作提示
    setTimeout(() => {
      hud.classList.add('visible')
      controlsHint.classList.add('visible')

      // 一段時間後淡出操作提示
      setTimeout(() => {
        controlsHint.classList.remove('visible')
      }, TIMING.controlsHintDuration)
    }, TIMING.hudShowDelay)

    setTimeout(() => loading.remove(), TIMING.loadingRemoveDelay)
  }, TIMING.loadingHideDelay)
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
    await new Promise(resolve => setTimeout(resolve, TIMING.introTransition))

    // 初始化場景
    try {
      await init()
    } catch (error) {
      console.error('初始化失敗:', error)
      document.getElementById('loading-text').textContent = 'Failed to initialize'
    }

    // 移除前導頁面
    setTimeout(() => intro.remove(), TIMING.introRemoveDelay)
  })
}

// ============================================
// 啟動
// ============================================
setupIntro()

// H03: 導出清理函式供外部使用（測試）
if (typeof window !== 'undefined') {
  window.__loomCleanup = cleanup
}
