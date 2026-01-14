/**
 * Chromatic Aberration Shader
 * 色散效果 - 模擬鏡頭光學色散
 *
 * RGB 通道分別偏移，製造彩虹邊緣效果
 * 可動態調整 offset 來響應情緒張力
 */

import * as THREE from 'three'

/**
 * Chromatic Aberration Shader 定義
 */
export const ChromaticAberrationShader = {
  name: 'ChromaticAberrationShader',

  uniforms: {
    tDiffuse: { value: null },
    // 色散偏移量（x: 水平, y: 垂直）
    offset: { value: new THREE.Vector2(0.003, 0.003) },
    // 從中心向外的徑向強度（0 = 均勻, 1 = 邊緣最強）
    radialIntensity: { value: 0.5 }
  },

  vertexShader: /* glsl */ `
    varying vec2 vUv;

    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,

  fragmentShader: /* glsl */ `
    uniform sampler2D tDiffuse;
    uniform vec2 offset;
    uniform float radialIntensity;

    varying vec2 vUv;

    void main() {
      // 計算到中心的距離（用於徑向色散）
      vec2 center = vec2(0.5, 0.5);
      vec2 dir = vUv - center;
      float dist = length(dir);

      // 徑向強度：邊緣色散更強
      float radialFactor = mix(1.0, dist * 2.0, radialIntensity);
      vec2 aberration = offset * radialFactor;

      // RGB 通道分別採樣
      // R 通道向外偏移
      float r = texture2D(tDiffuse, vUv + aberration).r;
      // G 通道不偏移（基準）
      float g = texture2D(tDiffuse, vUv).g;
      // B 通道向內偏移
      float b = texture2D(tDiffuse, vUv - aberration).b;

      // 保留原始 alpha
      float a = texture2D(tDiffuse, vUv).a;

      gl_FragColor = vec4(r, g, b, a);
    }
  `
}
