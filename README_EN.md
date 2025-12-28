# The Loom of Society

[![License: CC BY-NC-SA 4.0](https://img.shields.io/badge/License-CC%20BY--NC--SA%204.0-lightgrey.svg)](https://creativecommons.org/licenses/by-nc-sa/4.0/)
[![Three.js](https://img.shields.io/badge/Three.js-r170-049EF4.svg)](https://threejs.org/)
[![WebGL](https://img.shields.io/badge/WebGL-2.0-red.svg)](https://www.khronos.org/webgl/)
[![Generative Art](https://img.shields.io/badge/Generative-Art-blueviolet.svg)](https://en.wikipedia.org/wiki/Generative_art)

[← Back to Muripo HQ](https://tznthou.github.io/muripo-hq/) | [中文](README.md)

A digital art installation that weaves the invisible pulse of society — the restlessness of technology, the fluctuations of finance, the resonance of human sentiment — into an ever-evolving tapestry of light. This is not a chart of data, but a symphony of emotion.

![The Loom of Society](assets/preview.png)

> **"The world is a loom, and data is the thread. We are the weavers of this digital age."**

---

## Core Concept

This is a **breathing loom**.

Three ribbons represent three dimensions of social context: Technology, Finance, and Society. They are not static lines, but living entities — when tension rises, the ribbons tighten, tremble, and turn deep red; when relaxed, they flow freely, drifting with golden light.

What you see is not data, but the **soul** behind the data.

---

## The Three Ribbons

| Ribbon | Color | Dimension | Emotional Mapping |
|--------|-------|-----------|-------------------|
| **Tech** | Cyan `#3DB8D4` | Technology sector pulse | Tense→Cold Purple / Relaxed→Emerald |
| **Finance** | Amber `#E6A030` | Financial market sentiment | Tense→Deep Red / Relaxed→Warm Gold |
| **Society** | Coral `#D47090` | Social discourse atmosphere | Tense→Dark Purple / Relaxed→Warm Orange |

---

## Physicalization of Emotion

We transform abstract emotions into physical properties of the ribbons:

### Tension
When sentiment is **negative/tense**:
- Ribbon oscillation frequency increases
- Curves become sharp and angular
- Colors shift toward cool tones

### Buoyancy
When sentiment is **positive/relaxed**:
- Ribbon oscillation becomes slow and deep
- Curves flow smoothly
- Colors shift toward warm tones

### Activity
Overall discussion intensity:
- High activity → Faster animation, stronger bloom
- Low activity → Slower animation, softer glow

---

## Visual Architecture

```
┌─────────────────────────────────────────────────────┐
│                   Deep Space Background              │
│                   (Near black #020208)               │
├─────────────────────────────────────────────────────┤
│                                                     │
│    ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░   │
│         Star Dust (500 particles, subtle twinkle)   │
│    ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░   │
│                                                     │
│         ════════════════════════════                │
│              Background Ribbons (25)                │
│         ════════════════════════════                │
│                                                     │
│              ╭───────────────────╮                  │
│           ╭──╯   Three Main      ╰──╮              │
│        ╭──╯      Ribbons           ╰──╮            │
│     ───╯    (Tech/Finance/Society)    ╰───         │
│                                                     │
│              ✦ ✦ ✦ Energy Particles ✦ ✦ ✦          │
│                                                     │
├─────────────────────────────────────────────────────┤
│                 Bloom Post-Processing                │
│                 (UnrealBloomPass)                   │
└─────────────────────────────────────────────────────┘
```

---

## Tech Stack

| Technology | Purpose | Notes |
|------------|---------|-------|
| [Three.js](https://threejs.org/) | 3D Rendering Engine | WebGL wrapper |
| [simplex-noise](https://github.com/jwagner/simplex-noise.js) | Noise Generation | Organic dynamics |
| TubeGeometry | Ribbon Geometry | 3D tubular structure |
| UnrealBloomPass | Post-processing | Bloom effect |
| ACES Filmic Tone Mapping | Color grading | Cinematic colors |
| ES Modules + Import Maps | Module system | CDN direct loading |

---

## Project Structure

```
day-30-loom-of-society/
├── index.html              # Intro page + main canvas
├── src/
│   ├── main.js             # Entry point & scene init
│   ├── config.js           # Sentiment params & visual config
│   ├── ribbon.js           # Ribbon geometry & animation
│   ├── particles.js        # Energy particles & star dust
│   └── bloom.js            # Post-processing effects
├── assets/
│   └── preview.png         # Preview image
├── package.json
├── LICENSE
├── README.md
└── README_EN.md
```

---

## Local Development

```bash
# Clone the project
git clone https://github.com/tznthou/day-30-loom-of-society.git
cd day-30-loom-of-society

# Method 1: Use Live Server (recommended)
# Simply open index.html with VS Code Live Server

# Method 2: Use Vite
npm install
npm run dev
```

---

## Interactions

| Action | Effect |
|--------|--------|
| Drag | Rotate view |
| Scroll | Zoom in/out |
| Idle | Auto-rotate slowly |

---

## Reflections

### Why a "Loom"?

The loom is one of humanity's oldest machines. The interweaving of warp and weft creates fabric, clothing, civilization.

In this digital age, we are constantly "weaving" — posting, commenting, trading, voting. These actions seem small, yet together they form the texture of society. This loom attempts to make that process visible.

### On "Emotion"

Emotion is the hardest thing to quantify. Unlike temperature or price, it has no precise number.

But emotion is real. When society feels anxious, you can sense the tension in the air. When there's collective joy, you feel the energy. This project's ambition is to transform that "atmosphere" into visuals.

### The End of Thirty Days

This is the final project of the 30-day Vibe Coding challenge.

From the simple exercises of Day 01 to this immersive art installation, the journey was longer than expected. But every day's accumulation became nourishment for today.

This is not an end, but the beginning of another journey.

---

## Future Expansion

- [ ] Real-time data integration (PTT, news, stock market)
- [ ] Sentiment analysis NLP engine
- [ ] Ribbon interweaving physics simulation
- [ ] Chromatic aberration effect
- [ ] Ambient sound response
- [ ] Full-screen exhibition mode

---

## License

This work is licensed under [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/).

This means:
- ✅ Free to share and adapt
- ✅ Must give appropriate credit
- ❌ No commercial use
- 🔄 Derivatives must use same license

---

## Related Projects

- [Day-26 Harmonic Monoliths](https://github.com/tznthou/day-26-harmonic-monoliths) - Generative music installation
- [Day-25 Data Tapestry](https://github.com/tznthou/day-25-data-tapestry) - Data visualization weave
- [Three.js](https://threejs.org/) - 3D JavaScript library

---

> **"Every tremble of the ribbon is an echo of a million heartbeats."**
