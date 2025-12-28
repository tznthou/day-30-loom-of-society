import * as THREE from 'three'
import { VISUAL_CONFIG } from './config.js'

/**
 * 創建沿絲帶流動的能量粒子
 */
export function createRibbonParticles(ribbon) {
  const { countPerRibbon, size } = VISUAL_CONFIG.particles
  const { curve, baseColor } = ribbon.userData

  // 粒子位置
  const positions = new Float32Array(countPerRibbon * 3)
  const colors = new Float32Array(countPerRibbon * 3)
  const sizes = new Float32Array(countPerRibbon)
  const offsets = new Float32Array(countPerRibbon)  // 每個粒子在曲線上的位置 (0-1)

  const color = new THREE.Color().setHSL(baseColor.h / 360, baseColor.s, baseColor.l + 0.2)

  for (let i = 0; i < countPerRibbon; i++) {
    // 初始分布在曲線上
    offsets[i] = Math.random()
    const point = curve.getPointAt(offsets[i])

    positions[i * 3] = point.x
    positions[i * 3 + 1] = point.y
    positions[i * 3 + 2] = point.z

    // 顏色（帶有微小變化，降低亮度）
    const hueVariation = (Math.random() - 0.5) * 0.05
    const particleColor = new THREE.Color().setHSL(
      (baseColor.h / 360 + hueVariation + 1) % 1,
      baseColor.s * 0.8,
      baseColor.l * 0.7 + Math.random() * 0.1
    )
    colors[i * 3] = particleColor.r
    colors[i * 3 + 1] = particleColor.g
    colors[i * 3 + 2] = particleColor.b

    // 大小變化
    sizes[i] = size * (0.5 + Math.random() * 1.0)
  }

  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))
  geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1))

  // 自定義 shader 材質實現柔和光點
  const material = new THREE.ShaderMaterial({
    uniforms: {
      time: { value: 0 },
      pixelRatio: { value: window.devicePixelRatio }
    },
    vertexShader: `
      attribute float size;
      varying vec3 vColor;
      uniform float pixelRatio;

      void main() {
        vColor = color;
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        gl_PointSize = size * pixelRatio * (300.0 / -mvPosition.z);
        gl_Position = projectionMatrix * mvPosition;
      }
    `,
    fragmentShader: `
      varying vec3 vColor;

      void main() {
        // 柔和的圓形光點
        float dist = length(gl_PointCoord - vec2(0.5));
        if (dist > 0.5) discard;

        // 柔和邊緣
        float alpha = 1.0 - smoothstep(0.2, 0.5, dist);
        alpha *= 0.8;

        gl_FragColor = vec4(vColor, alpha);
      }
    `,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    vertexColors: true
  })

  const points = new THREE.Points(geometry, material)
  points.userData = {
    offsets,
    ribbon,
    speeds: Array.from({ length: countPerRibbon }, () => 0.001 + Math.random() * 0.002)
  }

  return points
}

/**
 * 更新粒子位置（沿曲線流動）
 */
export function updateParticles(particles, time) {
  const { offsets, ribbon, speeds } = particles.userData
  const curve = ribbon.userData.curve
  const positions = particles.geometry.attributes.position.array

  for (let i = 0; i < offsets.length; i++) {
    // 沿曲線移動
    offsets[i] += speeds[i]
    if (offsets[i] > 1) offsets[i] -= 1

    // 獲取曲線上的點
    const point = curve.getPointAt(offsets[i])

    // 加上微小的隨機偏移，讓粒子不完全貼合曲線
    const wobble = Math.sin(time * 0.002 + i) * 0.02
    positions[i * 3] = point.x + wobble
    positions[i * 3 + 1] = point.y + wobble
    positions[i * 3 + 2] = point.z + wobble
  }

  particles.geometry.attributes.position.needsUpdate = true
  particles.material.uniforms.time.value = time
}

/**
 * 創建背景星塵粒子
 */
export function createStarDust() {
  const count = 500
  const positions = new Float32Array(count * 3)
  const colors = new Float32Array(count * 3)
  const sizes = new Float32Array(count)

  for (let i = 0; i < count; i++) {
    // 球形分布
    const radius = 15 + Math.random() * 20
    const theta = Math.random() * Math.PI * 2
    const phi = Math.acos(2 * Math.random() - 1)

    positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta)
    positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta)
    positions[i * 3 + 2] = radius * Math.cos(phi)

    // 冷色調星塵
    const hue = 0.5 + Math.random() * 0.2  // 青藍到紫色
    const color = new THREE.Color().setHSL(hue, 0.3, 0.4 + Math.random() * 0.2)
    colors[i * 3] = color.r
    colors[i * 3 + 1] = color.g
    colors[i * 3 + 2] = color.b

    sizes[i] = 0.02 + Math.random() * 0.04
  }

  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))
  geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1))

  const material = new THREE.ShaderMaterial({
    uniforms: {
      time: { value: 0 },
      pixelRatio: { value: window.devicePixelRatio }
    },
    vertexShader: `
      attribute float size;
      varying vec3 vColor;
      varying float vAlpha;
      uniform float time;
      uniform float pixelRatio;

      void main() {
        vColor = color;

        // 微弱閃爍
        float flicker = sin(time * 0.001 + position.x * 10.0) * 0.3 + 0.7;
        vAlpha = flicker * 0.4;

        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        gl_PointSize = size * pixelRatio * (200.0 / -mvPosition.z);
        gl_Position = projectionMatrix * mvPosition;
      }
    `,
    fragmentShader: `
      varying vec3 vColor;
      varying float vAlpha;

      void main() {
        float dist = length(gl_PointCoord - vec2(0.5));
        if (dist > 0.5) discard;

        float alpha = (1.0 - dist * 2.0) * vAlpha;
        gl_FragColor = vec4(vColor, alpha);
      }
    `,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    vertexColors: true
  })

  const points = new THREE.Points(geometry, material)
  return points
}

/**
 * 更新星塵
 */
export function updateStarDust(starDust, time) {
  starDust.material.uniforms.time.value = time
  // 緩慢旋轉
  starDust.rotation.y = time * 0.00005
  starDust.rotation.x = Math.sin(time * 0.00003) * 0.1
}
