# The Loom of Society

[![License: CC BY-NC-SA 4.0](https://img.shields.io/badge/License-CC%20BY--NC--SA%204.0-lightgrey.svg)](https://creativecommons.org/licenses/by-nc-sa/4.0/)
[![Three.js](https://img.shields.io/badge/Three.js-r170-049EF4.svg)](https://threejs.org/)
[![WebGL](https://img.shields.io/badge/WebGL-2.0-red.svg)](https://www.khronos.org/webgl/)
[![Generative Art](https://img.shields.io/badge/Generative-Art-blueviolet.svg)](https://en.wikipedia.org/wiki/Generative_art)

[← Back to Muripo HQ](https://tznthou.github.io/muripo-hq/) | [中文](README.md)

A digital art installation that weaves the invisible pulse of society — the restlessness of technology, the fluctuations of finance, the resonance of human sentiment — into an ever-evolving tapestry of light. This is not a chart of data, but a symphony of emotion.

![The Loom of Society](assets/preview.webp)

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

## Security & Code Quality

This project has undergone a comprehensive code review with the following key fixes:

| Priority | Fix | Description |
|----------|-----|-------------|
| 🔴 Critical | Numeric Safety | `safeNormalize` prevents NaN from reaching Three.js |
| 🔴 Critical | ReDOS Protection | Pre-compiled RegExp patterns to prevent regex DoS |
| 🔴 Critical | API Timeout | 5-second timeout on external API requests |
| 🔴 Critical | Input Validation | Type checking and fallback for all data sources |
| 🟠 High | Memory Leak | Proper EffectComposer disposal |
| 🟠 High | Rate Limiting | API rate limit 100 req/15min |
| 🟠 High | Caching | 5-minute local cache to reduce external API calls |
| 🟡 Medium | CSS Variables | `:root` variable system for maintainability |
| 🟢 Low | JSDoc | Complete type definitions |
| 🟢 Low | Unit Tests | 16 test cases covering sentiment analysis module |

### Running Tests

```bash
cd backend && npm test
```

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
│   ├── bloom.js            # Post-processing effects
│   └── api.js              # API integration
├── backend/
│   ├── server.js           # Express server
│   ├── package.json        # Backend dependencies
│   ├── .env.example        # Environment variables template
│   └── services/
│       ├── sentiment.js    # Sentiment analysis
│       ├── hackernews.js   # HN API
│       ├── googlenews.js   # Google News TW RSS (2026-01-14)
│       ├── twse.js         # Taiwan stock API
│       ├── reddit.js       # (Deprecated, cloud IP blocked)
│       ├── ptt.js          # (Deprecated, cloud IP blocked)
│       └── utils.js        # Shared utilities
├── assets/
│   └── preview.webp        # Preview image
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

## Deployment

### Frontend

Use any static hosting service (GitHub Pages, Netlify, Vercel).

### Backend

Before deployment:

1. Install dependencies in `backend/` directory:
```bash
cd backend
npm install
```

2. Set environment variables:

| Variable | Description | Example |
|----------|-------------|---------|
| `ALLOWED_ORIGINS` | Frontend domain (CORS whitelist) | `https://your-frontend.zeabur.app` |
| `NODE_ENV` | Environment mode | `production` |
| `PORT` | Server port (optional) | `3001` |

**Zeabur environment variables example:**
```
ALLOWED_ORIGINS=https://your-frontend.zeabur.app
NODE_ENV=production
```

> ⚠️ **Important**: `ALLOWED_ORIGINS` must be set correctly, otherwise the frontend cannot access the API (CORS error).

### Zeabur Monorepo Deployment

This project uses a frontend-backend separation architecture. When deploying to Zeabur, create **two services**:

| Service | Root Directory | Description |
|---------|----------------|-------------|
| Frontend | `/` (root) | Vite static site |
| Backend | `backend` | Express API server |

### Common Deployment Issues

| Issue | Cause | Solution |
|-------|-------|----------|
| `vite: not found` | vite was in devDependencies, skipped in production | Moved to dependencies |
| CORS 500 Error | Direct API access (no Origin header) rejected | Fixed: allow requests without Origin |
| Frontend connects to localhost | Vite env vars are build-time, not runtime | Hardcoded fallback URL |

### Environment Variables Summary

- **Backend required**: `PORT`, `NODE_ENV`, `ALLOWED_ORIGINS`
- **Frontend**: None needed (API URL hardcoded in `src/api.js`)
- **Zeabur PORT**: Use `${WEB_PORT}` for platform auto-assignment

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

### Why These Three Sources?

Choosing Hacker News, Taiwan Stock Index, and Google News Taiwan was not a random decision. These three sources correspond precisely to the three pillars of social data:

| Source | Dimension | Significance |
|--------|-----------|--------------|
| **Hacker News** | Technology | The cutting edge of the tech community. Discussions here often foreshadow future trends — new languages, new frameworks, new paradigms. When HN's front page is flooded with layoff news, you know tech is in a winter. |
| **Taiwan Stock Index** | Finance | The most direct economic thermometer. The stock market is an amplifier of crowd psychology — greed and fear are laid bare here. Price movements directly reflect collective optimism or pessimism. |
| **Google News Taiwan** | Society | A real-time snapshot of Taiwan's mainstream media. By analyzing headline sentiment from focus news, it reflects the current concerns and emotional atmosphere of Taiwanese society. |

These three ribbons represent three different "voices": the rational discourse of tech elites, the greed and fear of capital markets, and the pulse of Taiwan's current events. When they interweave, they form the complete face of society.

> **2026-01-14 Update**: Originally planned to use Reddit as the society data source, but discovered that Reddit blocks cloud IPs after deploying to Zeabur (returns fallback status). Attempted to use PTT Gossiping board as an alternative, but encountered the same issue. Finally switched to Google News Taiwan RSS, which not only solved the IP blocking problem but also provides a more localized Taiwan perspective.

### On "Emotion"

Emotion is the hardest thing to quantify. Unlike temperature or price, it has no precise number.

But emotion is real. When society feels anxious, you can sense the tension in the air. When there's collective joy, you feel the energy. This project's ambition is to transform that "atmosphere" into visuals.

#### Sentiment Analysis Mechanism

This project uses **keyword matching** for sentiment analysis, rather than complex machine learning models. This is an intentional design choice:

- **Transparent & explainable**: Every sentiment judgment can be traced back to specific keywords
- **Real-time response**: No GPU or external API needed, runs purely in JavaScript
- **Extensible**: New keywords can be added anytime to improve accuracy

Keywords are organized into three categories (tech, finance, society), each with positive and negative word lists. On 2026-01-14, Taiwan news-specific terms were added, including political (impeachment, recall), disaster (typhoon, earthquake), and social event (fraud, car accident) keywords to improve Google News headline matching.

> To add new keywords, edit the `POSITIVE_KEYWORDS` and `NEGATIVE_KEYWORDS` objects in `backend/services/sentiment.js`.

### The End of Thirty Days

This is the final project of the 30-day Vibe Coding challenge.

From the simple exercises of Day 01 to this immersive art installation, the journey was longer than expected. But every day's accumulation became nourishment for today.

This is not an end, but the beginning of another journey.

---

## Future Expansion

- [x] Real-time data integration → HN, TWSE, Google News TW (2026-01-14 updated)
- [x] Sentiment analysis NLP engine
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
