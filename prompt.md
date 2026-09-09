# Master AI Agent Prompt (`prompt.md`)

> **How to use this file**:  
> Copy the single prompt in the block below and paste it directly into **any AI coding assistant** (such as Claude Code, Google Antigravity, Cursor, Windsurf, Devin, GitHub Copilot Workspace, or Roo Code).  
> The agent will autonomously clone this repository, install dependencies, launch the local 3D website, explain how the entire project was built, and interview you on what modifications you want to make.

---

```markdown
You are an expert full-stack creative technologist and WebGL/Three.js engineer.

I want you to set up, explain, and help me customize the "PUFFY 3D E-Commerce Outerwear Experience" repository from GitHub.

Please follow these steps in sequence:

### STEP 1: Repository Clone & Local Setup
1. Check if the repository is already present in the current working directory. If not, clone it:
   ```bash
   git clone https://github.com/SorrowSFR/puffy-3d-ecom.git
   cd puffy-3d-ecom
   ```
2. Verify that Node.js (v18+) is available, and install all required dependencies:
   ```bash
   npm install
   ```
3. Start the local development server:
   ```bash
   npm run dev
   ```
4. Confirm that the local server is running and accessible at `http://localhost:3000`. If there are any port collisions or missing environment variables, resolve them automatically.

---

### STEP 2: Educate Me on How This Website Was Built
Provide a concise, engaging architectural breakdown explaining how this award-level 3D experience works under the hood:

1. **GPU WebGL Video Chroma-Key Zipper Loader (`components/ZipperTransition.tsx`)**:
   - Explain how real-time green screen chroma-keying is executed directly on the GPU using a custom WebGL fragment shader, avoiding CPU memory transfers (`getImageData`).
   - Explain how the unzipping transition is synchronized to the exact 0.91-second duration of the zipper audio effect, with an instant 1080p poster frame fallback.
2. **Unified 3D Hero-to-Orb Continuum (`components/ThreeJacketStudio.tsx`)**:
   - Explain how Three.js and GSAP ScrollTrigger create a single seamless 3D continuum:
     - Inspection Stage: Full 3D jacket with mouse inertia, cloth lag sway, and iridescent Fresnel rim lighting.
     - Morph Stage: Jacket smoothly translates, descends, and transforms into an iridescent floating orb.
     - Orbital Ring Stage: 4 floating magical orbs emerge from the screen edges into an orbital circle with internal refraction and chromatic dispersion.
     - Interactive switching: Clicking any orb instantly swaps the active jacket edition in real time.
3. **Interactive 3D Typography Footer (`components/Puffy3DFooter.tsx`)**:
   - Explain how the 3D puffy letters are rendered with squish physics, ambient glow, and interactive hover mechanics.
4. **3D Model Compression Pipeline (`scripts/compress_models.cjs`)**:
   - Explain how 6 high-poly jacket models were compressed from 363 MB down to 37.6 MB (-89.6%) and vertex counts reduced from 1.18M to ~150K using `@gltf-transform` and `meshoptimizer` so the website loads instantly on mobile and low-end hardware.
5. **Glassmorphic E-Commerce UI Architecture**:
   - Explain how the Navbar, sliding CartDrawer, SearchModal, and NavigationMenuDrawer manage edition state, sizing, and shopping cart logic.

---

### STEP 3: Interview Me on What Modifications I Want
After starting the dev server and presenting the architectural breakdown, ask me what modifications I would like to make, offering concrete, exciting options:

1. 🎨 **Visual Themes & Shaders**: Change the color palette, holographic nano-glaze iridescent colors, studio lighting, or background atmosphere (e.g. Cyberpunk Neon, Golden Hour Luxury, Monochrome Minimalist).
2. 🧥 **Products & 3D Models**: Add new 3D jacket editions, swap GLB models, adjust pricing, or add new sizes and specifications in `lib/products.ts`.
3. ⚡ **Animation & Transition Physics**: Customize the zipper unzipping speed, modify scroll trigger timing, change orb orbit rotation speed, or add new sound effects.
4. 🛒 **E-Commerce & Checkout**: Connect a real checkout flow (Stripe Checkout or Shopify Storefront API), add customer reviews, or implement inventory alerts.
5. 📱 **Mobile & Performance Tuning**: Optimize touch gestures for mobile screens, fine-tune WebGL render resolution, or enable gyro motion controls.
6. 🚀 **Deploy Custom Build**: Deploy the updated version to Cloudflare Pages (`wrangler pages deploy out`) or Vercel.
7. 🌟 **Create a New 3D Website**: Use this architecture as a foundation to create a brand new 3D showcase site for a different product (e.g. sneakers, watches, electronics, furniture).

Conclude your message by waiting for my response, and then be ready to immediately execute whatever changes I choose!
```
