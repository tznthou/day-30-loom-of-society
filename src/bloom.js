import * as THREE from 'three'
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js'
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js'
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js'
import { VISUAL_CONFIG } from './config.js'
import { ChromaticAberrationShader } from './chromaticAberration.js'

/**
 * 創建後處理效果鏈
 */
export function createPostProcessing(renderer, scene, camera) {
  const { bloom, chromaticAberration } = VISUAL_CONFIG

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

  // Chromatic Aberration Pass - 色散效果
  let chromaticPass = null
  if (chromaticAberration.enabled) {
    chromaticPass = new ShaderPass(ChromaticAberrationShader)
    chromaticPass.uniforms.offset.value.set(
      chromaticAberration.baseOffset,
      chromaticAberration.baseOffset
    )
    chromaticPass.uniforms.radialIntensity.value = chromaticAberration.radialIntensity
    composer.addPass(chromaticPass)
  }

  // 輸出 Pass（色彩空間轉換）
  const outputPass = new OutputPass()
  composer.addPass(outputPass)

  return {
    composer,
    bloomPass,
    chromaticPass,
    resize: (width, height) => {
      composer.setSize(width, height)
      bloomPass.resolution.set(width, height)
    }
  }
}

/**
 * 動態調整後處理參數（根據情緒變化）
 */
export function updateBloomParams(bloomPass, sentiment, chromaticPass = null) {
  const { bloom, chromaticAberration } = VISUAL_CONFIG
  const { tech, finance, society } = sentiment

  // 計算平均活躍度和張力
  const avgActivity = (tech.activity + finance.activity + society.activity) / 3
  const avgTension = (tech.tension + finance.tension + society.tension) / 3

  // 高活躍度時 Bloom 稍強，高張力時擴散半徑稍大
  bloomPass.strength = bloom.strength + avgActivity * bloom.activityInfluence
  bloomPass.radius = bloom.radius + avgTension * bloom.tensionInfluence

  // 動態色散：張力越高，色散越強
  if (chromaticPass && chromaticAberration.enabled) {
    const tensionFactor = avgTension * chromaticAberration.tensionInfluence
    const dynamicOffset = chromaticAberration.baseOffset +
      (chromaticAberration.maxOffset - chromaticAberration.baseOffset) * tensionFactor

    chromaticPass.uniforms.offset.value.set(dynamicOffset, dynamicOffset)
  }
}
