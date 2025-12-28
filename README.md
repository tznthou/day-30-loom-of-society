# The Loom of Society 社會織機

[![License: CC BY-NC-SA 4.0](https://img.shields.io/badge/License-CC%20BY--NC--SA%204.0-lightgrey.svg)](https://creativecommons.org/licenses/by-nc-sa/4.0/)
[![Three.js](https://img.shields.io/badge/Three.js-r170-049EF4.svg)](https://threejs.org/)
[![WebGL](https://img.shields.io/badge/WebGL-2.0-red.svg)](https://www.khronos.org/webgl/)
[![Generative Art](https://img.shields.io/badge/Generative-Art-blueviolet.svg)](https://en.wikipedia.org/wiki/Generative_art)

[← 回到 Muripo HQ](https://tznthou.github.io/muripo-hq/) | [English](README_EN.md)

一座數位藝術裝置，將社會的無形脈動——科技的躁動、金融的起伏、人心的共鳴——編織成永不重複的光之絲綢。這不是數據的圖表，而是情緒的交響樂。

![The Loom of Society](assets/preview.png)

> **"The world is a loom, and data is the thread. We are the weavers of this digital age."**

---

## 核心概念

這是一座**會呼吸的織機**。

三條絲帶代表三個維度的社會脈絡：科技、金融、社會。它們不是靜態的線條，而是有生命的存在——當情緒緊張時，絲帶繃緊、顫抖、染上深紅；當情緒放鬆時，絲帶舒展、飄蕩、泛著金光。

你看到的不是數據，而是數據背後的**靈魂**。

---

## 三條絲帶

| 絲帶 | 色彩 | 代表維度 | 情緒映射 |
|------|------|---------|---------|
| **科技** | 青藍 `#3DB8D4` | 科技產業脈動 | 緊張→冷紫 / 放鬆→翠綠 |
| **金融** | 琥珀 `#E6A030` | 金融市場情緒 | 緊張→深紅 / 放鬆→暖金 |
| **社會** | 珊瑚 `#D47090` | 社會輿論氛圍 | 緊張→暗紫 / 放鬆→暖橙 |

---

## 情緒的物理化

我們將抽象的情緒轉化為絲帶的「物理屬性」：

### 張力 (Tension)
當情緒**負面/緊張**時：
- 絲帶波動頻率加快
- 曲線變得尖銳
- 顏色偏向冷色調

### 浮力 (Buoyancy)
當情緒**正面/放鬆**時：
- 絲帶波動變得深長緩慢
- 曲線柔軟流暢
- 顏色偏向暖色調

### 活躍度 (Activity)
整體討論熱度：
- 高活躍度 → 動畫速度加快、Bloom 增強
- 低活躍度 → 動畫緩慢、光暈柔和

---

## 視覺架構

```
┌─────────────────────────────────────────────────────┐
│                   深空背景                           │
│                 (近乎純黑 #020208)                   │
├─────────────────────────────────────────────────────┤
│                                                     │
│    ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░   │
│         背景星塵 (500 粒子，微弱閃爍)                 │
│    ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░   │
│                                                     │
│         ════════════════════════════                │
│              遠景細絲群 (25 條)                      │
│         ════════════════════════════                │
│                                                     │
│              ╭───────────────────╮                  │
│           ╭──╯   三條主絲帶       ╰──╮              │
│        ╭──╯    (科技/金融/社會)     ╰──╮           │
│     ───╯                               ╰───        │
│                                                     │
│              ✦ ✦ ✦ 能量粒子 ✦ ✦ ✦                   │
│                                                     │
├─────────────────────────────────────────────────────┤
│                 Bloom 後處理                         │
│              (UnrealBloomPass)                      │
└─────────────────────────────────────────────────────┘
```

---

## 技術棧

| 技術 | 用途 | 備註 |
|------|------|------|
| [Three.js](https://threejs.org/) | 3D 渲染引擎 | WebGL 封裝 |
| [simplex-noise](https://github.com/jwagner/simplex-noise.js) | 噪聲生成 | 有機動態曲線 |
| TubeGeometry | 絲帶幾何 | 3D 管狀結構 |
| UnrealBloomPass | 後處理特效 | 高光擴散 |
| ACES Filmic Tone Mapping | 色調映射 | 電影級色彩 |
| ES Modules + Import Maps | 模組系統 | CDN 直接載入 |

---

## 專案結構

```
day-30-loom-of-society/
├── index.html              # 前導頁面 + 主畫布
├── src/
│   ├── main.js             # 入口與場景初始化
│   ├── config.js           # 情緒參數與視覺配置
│   ├── ribbon.js           # 絲帶幾何與動畫
│   ├── particles.js        # 能量粒子與星塵
│   └── bloom.js            # 後處理效果
├── assets/
│   └── preview.png         # 預覽圖
├── package.json
├── LICENSE
├── README.md
└── README_EN.md
```

---

## 本地開發

```bash
# 複製專案
git clone https://github.com/tznthou/day-30-loom-of-society.git
cd day-30-loom-of-society

# 方法 1：使用 Live Server（推薦）
# 直接用 VS Code Live Server 開啟 index.html

# 方法 2：使用 Vite
npm install
npm run dev
```

---

## 互動方式

| 操作 | 效果 |
|------|------|
| 拖曳 | 旋轉視角 |
| 滾輪 | 縮放距離 |
| 靜置 | 自動緩慢旋轉 |

---

## 隨想

### 為什麼是「織機」？

織機是人類最古老的機器之一。經線與緯線的交織，創造出布料、衣物、文明。

在這個數位時代，我們每天都在「編織」——發文、留言、交易、投票。這些行為看似微小，卻共同織成了社會的肌理。這座織機，試圖讓這個過程變得可見。

### 關於「情緒」

情緒是最難量化的東西。它不像溫度、價格那樣有精確的數字。

但情緒是真實的。當整個社會感到焦慮時，你能感受到空氣中的張力。當集體歡騰時，你能感受到那股能量。這個專案的野心，是把這種「氛圍」轉化為視覺。

### 三十天的句點

這是 30 天 Vibe Coding 挑戰的最後一個專案。

從 Day 01 的簡單練習，到現在的沉浸式藝術裝置，這條路比想像中更遠。但每一天的累積，都成為了今天的養分。

這不是結束，而是另一段旅程的起點。

---

## 未來擴展

- [ ] 接入即時數據（PTT、新聞、股市）
- [ ] 情緒分析 NLP 引擎
- [ ] 絲帶交織物理模擬
- [ ] 色散效果 (Chromatic Aberration)
- [ ] 環境音效響應
- [ ] 全螢幕展覽模式

---

## 授權

本作品採用 [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/) 授權。

這意味著：
- ✅ 可自由分享與改作
- ✅ 需標示原作者
- ❌ 禁止商業使用
- 🔄 衍生作品需採用相同授權

---

## 相關專案

- [Day-26 Harmonic Monoliths](https://github.com/tznthou/day-26-harmonic-monoliths) - 和聲巨石，生成式音樂裝置
- [Day-25 Data Tapestry](https://github.com/tznthou/day-25-data-tapestry) - 數據織錦
- [Three.js](https://threejs.org/) - 3D JavaScript 庫

---

> **"每一條絲帶的顫動，都是千萬人心跳的迴響。"**
