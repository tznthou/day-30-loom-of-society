import * as THREE from 'three'
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js'
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js'
import { VISUAL_CONFIG } from './config.js'

/**
 * 創建後處理效果鏈
 */
export function createPostProcessing(renderer, scene, camera) {
  const { bloom } = VISUAL_CONFIG

  // Effect Composer
  const composer = new EffectComposer(renderer)

  // 基礎渲染 Pass
  const renderPass = new RenderPass(scene, camera)
  composer.addPass(renderPass)

  // Bloom Pass - 高光擴散效果
  const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    bloom.strength,     // 強度
    bloom.radius,       // 擴散半徑
    bloom.threshold     // 亮度閾值
  )
  composer.addPass(bloomPass)

  // 輸出 Pass（色彩空間轉換）
  const outputPass = new OutputPass()
  composer.addPass(outputPass)

  return {
    composer,
    bloomPass,
    resize: (width, height) => {
      composer.setSize(width, height)
      bloomPass.resolution.set(width, height)
    }
  }
}

/**
 * 動態調整 Bloom 參數（根據情緒變化，保持柔和）
 */
export function updateBloomParams(bloomPass, sentiment) {
  const { bloom } = VISUAL_CONFIG

  // 計算平均活躍度和張力
  const avgActivity = (sentiment.tech.activity + sentiment.finance.activity + sentiment.society.activity) / 3
  const avgTension = (sentiment.tech.tension + sentiment.finance.tension + sentiment.society.tension) / 3

  // 高活躍度時 Bloom 稍強，高張力時擴散半徑稍大
  bloomPass.strength = bloom.strength + avgActivity * bloom.activityInfluence
  bloomPass.radius = bloom.radius + avgTension * bloom.tensionInfluence
}
