# PUFFY • Wear A Brighter World

[![Next.js](https://img.shields.io/badge/Next.js-16.3-black?logo=next.js)](https://nextjs.org/)
[![Three.js](https://img.shields.io/badge/Three.js-r174-black?logo=three.js)](https://threejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Cloudflare Pages](https://img.shields.io/badge/Deployed-Cloudflare_Pages-orange?logo=cloudflare)](https://puffy-3d-ecom.pages.dev)
[![License](https://img.shields.io/badge/License-MIT-purple.svg)](LICENSE)

> **Live Production Website**: [https://puffy-3d-ecom.pages.dev](https://puffy-3d-ecom.pages.dev)  
> **GitHub Repository**: [https://github.com/SorrowSFR/puffy-3d-ecom](https://github.com/SorrowSFR/puffy-3d-ecom)

An award-level, interactive 3D e-commerce outerwear web experience for **PUFFY**. Built with real-time WebGL cloth simulation, iridescent holographic nano-glaze shaders, seamless scroll-driven continuum morphing, GPU video chroma-key reveals, and an interactive 3D typography footer.

---

## Table of Contents

- [Overview](#overview)
- [How It Was Made](#how-it-was-made)
  - [1. 3D Model Optimization Pipeline (-90% Memory)](#1-3d-model-optimization-pipeline--90-memory)
  - [2. GPU WebGL Video Chroma-Key Zipper Reveal](#2-gpu-webgl-video-chroma-key-zipper-reveal)
  - [3. Unified 3D Continuum: Hero Jacket to Floating Orbs](#3-unified-3d-continuum-hero-jacket-to-floating-orbs)
  - [4. Interactive 3D Typography Footer](#4-interactive-3d-typography-footer)
  - [5. Glassmorphic E-Commerce Architecture](#5-glassmorphic-e-commerce-architecture)
- [Component Breakdown](#component-breakdown)
- [Directory Structure](#directory-structure)
- [Technology Stack](#technology-stack)
- [Getting Started](#getting-started)
- [Build & Deployment](#build--deployment)

---

## Overview

PUFFY reimagines digital fashion e-commerce by merging high-end editorial aesthetics with game-engine level 3D interaction. Instead of static product photography, users inspect photorealistic puffer jackets rendered in real time, transition through fluid scroll-bound state morphs, and explore limited colorway editions.

---

## How It Was Made

### 1. 3D Model Optimization Pipeline (-90% Memory)

Standard 3D fashion models often exceed 60MB with over 1 million vertices each, making web delivery sluggish on mobile devices and low-end hardware.

- **Pipeline**: Automated compression utility ([`scripts/compress_models.cjs`](scripts/compress_models.cjs)) using `@gltf-transform` and `meshoptimizer`.
- **Geometry Simplification**: Reduced mesh complexity from **~1.18M vertices down to ~150K vertices** per jacket, maintaining micro-creases and down-puff puffiness while eliminating 90% of redundant polygons.
- **Attribute Quantization**: Quantized vertex positions, normals, and texture coordinates into 16-bit and 8-bit integers.
- **Result**: Reduced all 6 jackets from **363 MB total down to 37.6 MB (-89.6%)**, enabling instantaneous streaming and smooth 60–120 FPS rendering on every device.

| Model | Original Size | Compressed Size | Vertex Reduction |
|---|---|---|---|
| `puffer-purple-lumi.glb` | 64.8 MB | **7.6 MB** | 1.18M → 232K |
| `puffer-silver-iridescent.glb` | 59.7 MB | **6.0 MB** | 1.02M → 152K |
| `puffer-pink-bubblegum.glb` | 58.9 MB | **5.9 MB** | 1.02M → 148K |
| `puffer-blue-aurora.glb` | 59.9 MB | **6.1 MB** | 1.03M → 155K |
| `puffer-electric-aurora.glb` | 59.9 MB | **6.1 MB** | 1.03M → 155K |
| `puffer-moonbeam.glb` | 59.7 MB | **6.0 MB** | 1.02M → 152K |

---

### 2. GPU WebGL Video Chroma-Key Zipper Reveal

The page opens with an unzipping transition that reveals the 3D scene underneath.

- **Hardware-Accelerated GLSL Shader**: A custom WebGL fragment shader executes real-time green-screen keying on the 60 FPS video stream ([`zipper-reveal.mp4`](public/assets/transitions/zipper-reveal.mp4)) on the GPU in < 0.1ms per frame, avoiding CPU memory transfers.
- **Color Despill & Antialiasing**: Evaluates green divergence (`g - max(r, b)`) with progressive smooth alpha ramps, removing all green fringing from jacket seams while preserving metallic highlights.
- **Exact Audio Synchronization (~0.91s)**: Synchronized with the authentic zipper sound effect ([`zipper-sound.mp3`](public/assets/transitions/zipper-sound.mp3)), completing the unzipping action and smoothly fading out in 0.91s.
- **Instant Poster Frame**: Displays a pristine 1080p frame ([`zipper-poster.jpg`](public/assets/transitions/zipper-poster.jpg)) immediately on mount so users never encounter a blank or flashing screen while video streams.
- **Fail-Safe Safety**: 1.8s safety timeout and a "Skip Reveal" button guarantee the user never gets stuck.

---

### 3. Unified 3D Continuum: Hero Jacket to Floating Orbs

Instead of slicing the webpage into disconnected sections, the entire experience is driven by a unified Three.js scene orchestrated with **GSAP ScrollTrigger**:

1. **Hero Stage ($0.0 \to 0.35$ scroll)**:
   - Centered interactive 3D jacket inspection.
   - Cloth inertia and physics lag following mouse movement.
   - Dynamic 3-point studio lighting with iridescent Fresnel rim reflections.
2. **Descent & Morph Stage ($0.35 \to 0.65$ scroll)**:
   - The jacket rotates, descends, and smoothly morphs into an iridescent floating orb with internal refraction.
   - Background cross-fades from dreamy coastal sunset to a reflective minimalist studio grid.
3. **Orbital Ring Stage ($0.65 \to 1.0$ scroll)**:
   - The primary orb joins 3 companion orbs emerging from the edges of the screen.
   - The 4 orbs settle into an orbital rotation with chromatic dispersion and iridescent highlights.
   - Clicking any orb seamlessly swaps the active jacket edition in real time.

---

### 4. Interactive 3D Typography Footer

- Built with custom 3D typography geometry representing the **PUFFY** wordmark.
- **Physics**: Interactive squash-and-stretch on hover and drag with elastic return damping.
- **Visuals**: Iridescent purple, magenta, and cyan specular lighting with soft ambient occlusion and glow.

---

### 5. Glassmorphic E-Commerce Architecture

- **Navbar**: Floating glassmorphic header with live edition indicator, search trigger, cart counter, and sound feedback.
- **Sliding Cart Drawer**: Real-time state management for items, size selection (XS to XXL), quantity adjustments, and live subtotal calculations.
- **Navigation Menu Drawer**: Fullscreen animated overlay showcasing collections, editorial lookbooks, and brand philosophy.
- **Search Modal**: Instant keyboard-driven filter modal for searching editions, materials, and colorways.

---

## Component Breakdown

| Component | File Path | Role |
|---|---|---|
| **ThreeJacketStudio** | [`components/ThreeJacketStudio.tsx`](components/ThreeJacketStudio.tsx) | Core Three.js WebGL continuum: hero jacket, cloth inertia, lighting, scroll morph, and 4 floating iridescent orbs. |
| **Puffy3DFooter** | [`components/Puffy3DFooter.tsx`](components/Puffy3DFooter.tsx) | Interactive 3D typography footer with squish physics and dynamic lighting. |
| **ZipperTransition** | [`components/ZipperTransition.tsx`](components/ZipperTransition.tsx) | GPU WebGL real-time chroma-key unzipping transition synchronized to audio duration (0.91s). |
| **Navbar** | [`components/Navbar.tsx`](components/Navbar.tsx) | Glassmorphic top navigation with edition switcher, search, and cart counter. |
| **CartDrawer** | [`components/CartDrawer.tsx`](components/CartDrawer.tsx) | Sliding slide-over cart drawer with size selectors and subtotal logic. |
| **NavigationMenuDrawer** | [`components/NavigationMenuDrawer.tsx`](components/NavigationMenuDrawer.tsx) | Fullscreen animated navigation menu drawer with brand editorial links. |
| **SearchModal** | [`components/SearchModal.tsx`](components/SearchModal.tsx) | Quick-search overlay for exploring jackets, specs, and materials. |
| **SmoothScroll** | [`components/SmoothScroll.tsx`](components/SmoothScroll.tsx) | Smooth momentum scrolling wrapper for synchronized GSAP scroll tracking. |

---

## Directory Structure

```
puffy-3d-ecom/
├── app/
│   ├── globals.css              # Design tokens, typography, and glassmorphic styles
│   ├── layout.tsx               # Root layout, metadata, and smooth scroll wrapper
│   └── page.tsx                 # Main application page orchestrating 3D continuum
├── components/
│   ├── CartDrawer.tsx           # Sliding shopping cart drawer
│   ├── Navbar.tsx               # Glassmorphic top navigation bar
│   ├── NavigationMenuDrawer.tsx # Fullscreen navigation overlay
│   ├── Puffy3DFooter.tsx        # Interactive 3D typography footer
│   ├── SearchModal.tsx          # Fast search modal
│   ├── SmoothScroll.tsx         # Momentum scroll controller
│   ├── ThreeJacketStudio.tsx    # Flagship Three.js WebGL scene & scroll continuum
│   └── ZipperTransition.tsx     # GPU WebGL video chroma-key unzipping transition
├── lib/
│   ├── products.ts              # Product catalog, colorways, and jacket specifications
│   └── sound.ts                 # Web Audio API procedural sound synthesizer & fallbacks
├── public/
│   └── assets/
│       ├── backgrounds/         # Editorial studio and sunset backdrops
│       ├── brand/               # Favicon, logo marks, and vectors
│       ├── models/              # Optimized ~6MB GLB 3D jacket models
│       ├── orbs/                # Iridescent orb refraction textures
│       ├── particles/           # Droplets, sparkles, and cloud sprites
│       ├── products/            # Sliced jacket product renders
│       ├── sheets/              # Art direction and design sheets
│       └── transitions/         # Fast-start unzipping video, poster, and sound effects
├── scripts/
│   ├── compress_models.cjs      # 3D model compression utility (@gltf-transform)
│   └── process_assets.py        # Asset slicing and pipeline processing script
├── next.config.mjs              # Next.js static export & basePath config
├── package.json                 # Project dependencies and build scripts
├── prompt.md                    # Single-prompt instruction for any AI coding agent
├── README.md                    # Project documentation & engineering breakdown
└── tsconfig.json                # TypeScript configuration
```

---

## Technology Stack

- **Framework**: [Next.js 16 (App Router)](https://nextjs.org/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **3D & WebGL Engine**: [Three.js](https://threejs.org/)
- **Animation & Timelines**: [GSAP](https://greensock.com/gsap/) + [ScrollTrigger](https://greensock.com/scrolltrigger/)
- **UI Micro-Interactions**: [Framer Motion](https://www.framer.com/motion/)
- **Audio**: Web Audio API + HTML5 Audio
- **3D Optimization**: `@gltf-transform/core`, `@gltf-transform/functions`, `meshoptimizer`
- **Hosting & Edge Delivery**: [Cloudflare Pages](https://pages.cloudflare.com/)

---

## Getting Started

### Prerequisites
- Node.js 18.0.0 or higher
- npm, pnpm, or yarn

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/SorrowSFR/puffy-3d-ecom.git
   cd puffy-3d-ecom
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start local development server**:
   ```bash
   npm run dev
   ```

4. **Open in browser**:
   Navigate to [http://localhost:3000](http://localhost:3000).

---

## Build & Deployment

### Static Export Build
To create a production static export:
```bash
npm run build
```
Compiled static assets are generated in the `out/` directory.

### Deploy to Cloudflare Pages
Deploy instantly using Wrangler CLI:
```bash
npx wrangler pages deploy out --project-name=puffy-3d-ecom
```

---

## AI Agent Integration (`prompt.md`)

This repository includes [`prompt.md`](prompt.md), a standalone master prompt that can be provided to any AI coding assistant (Claude Code, Antigravity, Cursor, Windsurf, Devin, etc.). The prompt guides the agent to clone, run, explain the architecture, and interactively guide the user through customizing the 3D models, shaders, transitions, and e-commerce features.

---

## License

MIT © [PUFFY Outerwear Studio](https://puffy-3d-ecom.pages.dev)
