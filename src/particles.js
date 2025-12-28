import * as THREE from 'three'
import { VISUAL_CONFIG } from './config.js'

/**
 * 創建沿絲帶流動的能量粒子
 */
export function createRibbonParticles(ribbon) {
  const p = VISUAL_CONFIG.particles
  const { curve, baseColor } = ribbon.userData

  // 粒子位置
  const positions = new Float32Array(p.countPerRibbon * 3)
  const colors = new Float32Array(p.countPerRibbon * 3)
  const sizes = new Float32Array(p.countPerRibbon)
  const offsets = new Float32Array(p.countPerRibbon)  // 每個粒子在曲線上的位置 (0-1)

  const color = new THREE.Color().setHSL(
    baseColor.h / 360,
    baseColor.s,
    baseColor.l + p.lightnessBoost
  )

  for (let i = 0; i < p.countPerRibbon; i++) {
    // 初始分布在曲線上
    offsets[i] = Math.random()
    const point = curve.getPointAt(offsets[i])

    positions[i * 3] = point.x
    positions[i * 3 + 1] = point.y
    positions[i * 3 + 2] = point.z

    // 顏色（帶有微小變化，降低亮度）
    const hueVariation = (Math.random() - 0.5) * p.hueVariation
    const particleColor = new THREE.Color().setHSL(
      (baseColor.h / 360 + hueVariation + 1) % 1,
      baseColor.s * p.saturationScale,
      baseColor.l * p.lightnessScale + Math.random() * p.lightnessVariation
    )
    colors[i * 3] = particleColor.r
    colors[i * 3 + 1] = particleColor.g
    colors[i * 3 + 2] = particleColor.b

    // 大小變化
    sizes[i] = p.size * (p.sizeVariation.min + Math.random() * (p.sizeVariation.max - p.sizeVariation.min))
  }

  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))
  geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1))

  // 自定義 shader 材質實現柔和光點
  const shader = p.shader
  const material = new THREE.ShaderMaterial({
    uniforms: {
      time: { value: 0 },
      pixelRatio: { value: window.devicePixelRatio },
      pointSizeScale: { value: shader.pointSizeScale },
      alphaEdgeStart: { value: shader.alphaEdgeStart },
      alphaEdgeEnd: { value: shader.alphaEdgeEnd },
      alphaMax: { value: shader.alphaMax }
    },
    vertexShader: `
      attribute float size;
      varying vec3 vColor;
      uniform float pixelRatio;
      uniform float pointSizeScale;

      void main() {
        vColor = color;
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        gl_PointSize = size * pixelRatio * (pointSizeScale / -mvPosition.z);
        gl_Position = projectionMatrix * mvPosition;
      }
    `,
    fragmentShader: `
      varying vec3 vColor;
      uniform float alphaEdgeStart;
      uniform float alphaEdgeEnd;
      uniform float alphaMax;

      void main() {
        // 柔和的圓形光點
        float dist = length(gl_PointCoord - vec2(0.5));
        if (dist > 0.5) discard;

        // 柔和邊緣
        float alpha = 1.0 - smoothstep(alphaEdgeStart, alphaEdgeEnd, dist);
        alpha *= alphaMax;

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
    speeds: Array.from(
      { length: p.countPerRibbon },
      () => p.speedBase + Math.random() * p.speedVariation
    )
  }

  return points
}

/**
 * 更新粒子位置（沿曲線流動）
 */
export function updateParticles(particles, time) {
  const p = VISUAL_CONFIG.particles
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
    const wobble = Math.sin(time * p.wobbleFrequency + i) * p.wobbleAmplitude
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
  const sd = VISUAL_CONFIG.starDust
  const positions = new Float32Array(sd.count * 3)
  const colors = new Float32Array(sd.count * 3)
  const sizes = new Float32Array(sd.count)

  for (let i = 0; i < sd.count; i++) {
    // 球形分布
    const radius = sd.radiusBase + Math.random() * sd.radiusVariation
    const theta = Math.random() * Math.PI * 2
    const phi = Math.acos(2 * Math.random() - 1)

    positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta)
    positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta)
    positions[i * 3 + 2] = radius * Math.cos(phi)

    // 冷色調星塵
    const hue = sd.hueBase + Math.random() * sd.hueVariation
    const color = new THREE.Color().setHSL(
      hue,
      sd.saturation,
      sd.lightnessBase + Math.random() * sd.lightnessVariation
    )
    colors[i * 3] = color.r
    colors[i * 3 + 1] = color.g
    colors[i * 3 + 2] = color.b

    sizes[i] = sd.sizeBase + Math.random() * sd.sizeVariation
  }

  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))
  geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1))

  const shader = sd.shader
  const material = new THREE.ShaderMaterial({
    uniforms: {
      time: { value: 0 },
      pixelRatio: { value: window.devicePixelRatio },
      pointSizeScale: { value: shader.pointSizeScale },
      flickerFrequency: { value: shader.flickerFrequency },
      flickerSpatialFreq: { value: shader.flickerSpatialFreq },
      flickerAmplitude: { value: shader.flickerAmplitude },
      flickerBaseline: { value: shader.flickerBaseline },
      alphaScale: { value: shader.alphaScale }
    },
    vertexShader: `
      attribute float size;
      varying vec3 vColor;
      varying float vAlpha;
      uniform float time;
      uniform float pixelRatio;
      uniform float pointSizeScale;
      uniform float flickerFrequency;
      uniform float flickerSpatialFreq;
      uniform float flickerAmplitude;
      uniform float flickerBaseline;
      uniform float alphaScale;

      void main() {
        vColor = color;

        // 微弱閃爍
        float flicker = sin(time * flickerFrequency + position.x * flickerSpatialFreq) * flickerAmplitude + flickerBaseline;
        vAlpha = flicker * alphaScale;

        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        gl_PointSize = size * pixelRatio * (pointSizeScale / -mvPosition.z);
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
  const sd = VISUAL_CONFIG.starDust

  starDust.material.uniforms.time.value = time
  // 緩慢旋轉
  starDust.rotation.y = time * sd.rotationSpeedY
  starDust.rotation.x = Math.sin(time * sd.rotationSpeedX) * sd.rotationAmplitudeX
}
