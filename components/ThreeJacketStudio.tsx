'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

import { PRODUCTS, Product } from '@/lib/products';
import { sound } from '@/lib/sound';

interface ThreeJacketStudioProps {
  product?: Product;
  viewMode?: '3d' | '2d';
  onToggleViewMode?: () => void;
  scrollProgress?: number;
  onSelectProduct?: (product: Product) => void;
  isRevolverSplit?: boolean;
  onToggleRevolverSplit?: (active: boolean) => void;
}

interface OrbConfig {
  id: string;
  colorHex: string;
  glowColor: string;
  accentHex: string;
  productIndex: number;
}

const ORB_CONFIGS: OrbConfig[] = [
  { id: 'purple-lumi', colorHex: '#B57CFF', glowColor: '#9333EA', accentHex: '#D8B4FE', productIndex: 0 },
  { id: 'moonbeam', colorHex: '#F1F5F9', glowColor: '#CBD5E1', accentHex: '#FFFFFF', productIndex: 1 },
  { id: 'pink-bubblegum', colorHex: '#FF4FD8', glowColor: '#DB2777', accentHex: '#F472B6', productIndex: 2 },
  { id: 'blue-aurora', colorHex: '#00D9FF', glowColor: '#0891B2', accentHex: '#38BDF8', productIndex: 3 },
];

export default function ThreeJacketStudio({
  product,
  viewMode = '3d',
  onToggleViewMode,
  scrollProgress = 0,
  onSelectProduct,
  isRevolverSplit = false,
  onToggleRevolverSplit,
}: ThreeJacketStudioProps = {}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadProgress, setLoadProgress] = useState(0);

  // Three.js Scene References
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const currentModelRef = useRef<THREE.Group | null>(null);
  const mainGroupRef = useRef<THREE.Group | null>(null);
  const reflectionGroupRef = useRef<THREE.Group | null>(null);
  const contactShadowRef = useRef<THREE.Mesh | null>(null);
  const orbsGroupRef = useRef<THREE.Group[]>([]);
  const orbShadowsRef = useRef<THREE.Mesh[]>([]);
  const orbitGroupRef = useRef<THREE.Group | null>(null);
  const orbitAngleRef = useRef<number>(0);
  const targetOrbitAngleRef = useRef<number>(0);
  const jacketSplitScaleRef = useRef<number>(0);
  const isRevolverSplitRef = useRef<boolean>(isRevolverSplit);
  const hoveredOrbIndexRef = useRef<number | null>(null);
  const scrollProgressRef = useRef<number>(scrollProgress);
  const targetScrollProgressRef = useRef<number>(scrollProgress);
  const activeProductRef = useRef<Product | undefined>(product);
  activeProductRef.current = product;
  const modelBaseScaleRef = useRef<number>(1);
  const modelCenterRef = useRef<THREE.Vector3>(new THREE.Vector3());
  const animationFrameRef = useRef<number | null>(null);
  const cursorLightRef = useRef<THREE.PointLight | null>(null);

  // Flimsy Fabric & Iridescent Lighting Uniforms
  const clothUniformsRef = useRef<{
    uTime: { value: number };
    uVelocity: { value: THREE.Vector3 };
    uLeftArmLag: { value: THREE.Vector3 };
    uRightArmLag: { value: THREE.Vector3 };
    uLeftFlapLag: { value: THREE.Vector3 };
    uRightFlapLag: { value: THREE.Vector3 };
    uHemLag: { value: THREE.Vector3 };
    uBellows: { value: number };
    uCursorLightPos: { value: THREE.Vector3 };
  }>({
    uTime: { value: 0 },
    uVelocity: { value: new THREE.Vector3() },
    uLeftArmLag: { value: new THREE.Vector3() },
    uRightArmLag: { value: new THREE.Vector3() },
    uLeftFlapLag: { value: new THREE.Vector3() },
    uRightFlapLag: { value: new THREE.Vector3() },
    uHemLag: { value: new THREE.Vector3() },
    uBellows: { value: 0 },
    uCursorLightPos: { value: new THREE.Vector3(0, 0, 2) },
  });

  // Physical State for Cursor-Reactive Movement
  const physicsRef = useRef({
    // Reactive position (moves opposite to cursor)
    position: new THREE.Vector3(0, 0, 0),
    targetPosition: new THREE.Vector3(0, 0, 0),
    velocity: new THREE.Vector3(0, 0, 0),

    // Reactive rotation (tilts opposite to cursor)
    rotation: new THREE.Euler(0, 0, 0),
    targetRotation: new THREE.Euler(0, 0, 0),

    // Arm lag (flimsy sleeves swinging naturally)
    leftArmLag: new THREE.Vector3(0, 0, 0),
    rightArmLag: new THREE.Vector3(0, 0, 0),

    // Flap lag (unzipped front panels billowing)
    leftFlapLag: new THREE.Vector3(0, 0, 0),
    rightFlapLag: new THREE.Vector3(0, 0, 0),

    // Lower hem lag
    hemLag: new THREE.Vector3(0, 0, 0),

    // Aerodynamic bellows
    bellows: 0,

    // Cursor tracking
    normalizedMouse: new THREE.Vector2(0, 0),
    isInteracting: false,
  });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    // Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Camera (Focused, dynamic perspective)
    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 100);
    camera.position.set(0, 0, 3.8);
    cameraRef.current = camera;

    // WebGL Renderer with High-Fidelity Color Output
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.55;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // =========================================================================
    // Procedural Multi-Spectrum Iridescent Studio Environment Map
    // =========================================================================
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    pmremGenerator.compileEquirectangularShader();

    const envCanvas = document.createElement('canvas');
    envCanvas.width = 1024;
    envCanvas.height = 512;
    const ctx = envCanvas.getContext('2d');
    if (ctx) {
      // 1. Twilight midnight background
      const bgGrad = ctx.createLinearGradient(0, 0, 0, 512);
      bgGrad.addColorStop(0, '#2d104e');
      bgGrad.addColorStop(0.35, '#120424');
      bgGrad.addColorStop(0.7, '#080112');
      bgGrad.addColorStop(1, '#1a062f');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, 1024, 512);

      // 2. Left High-Intensity Electric Cyan Softbox (for iridescent edge pop)
      const cyanSoftbox = ctx.createRadialGradient(220, 256, 15, 220, 256, 260);
      cyanSoftbox.addColorStop(0, 'rgba(0, 245, 255, 1.0)');
      cyanSoftbox.addColorStop(0.4, 'rgba(0, 210, 255, 0.7)');
      cyanSoftbox.addColorStop(0.8, 'rgba(0, 150, 255, 0.2)');
      cyanSoftbox.addColorStop(1, 'rgba(0, 245, 255, 0.0)');
      ctx.fillStyle = cyanSoftbox;
      ctx.fillRect(0, 0, 512, 512);

      // 3. Right Royal Violet / Indigo Softbox (true purple luminescence, no pink cast)
      const violetSoftbox = ctx.createRadialGradient(804, 256, 15, 804, 256, 260);
      violetSoftbox.addColorStop(0, 'rgba(139, 92, 246, 0.95)');
      violetSoftbox.addColorStop(0.4, 'rgba(124, 58, 237, 0.65)');
      violetSoftbox.addColorStop(0.8, 'rgba(91, 33, 182, 0.20)');
      violetSoftbox.addColorStop(1, 'rgba(139, 92, 246, 0.0)');
      ctx.fillStyle = violetSoftbox;
      ctx.fillRect(512, 0, 512, 512);

      // 4. Top Overhead Radiant Violet-Lilac Light Bar
      const topBar = ctx.createRadialGradient(512, 60, 10, 512, 60, 220);
      topBar.addColorStop(0, 'rgba(216, 140, 255, 1.0)');
      topBar.addColorStop(0.5, 'rgba(168, 85, 247, 0.6)');
      topBar.addColorStop(1, 'rgba(120, 40, 200, 0.0)');
      ctx.fillStyle = topBar;
      ctx.fillRect(150, 0, 724, 250);

      // 5. Warm Champagne / Amber Horizon Rim (rich metallic contrast)
      const amberRim = ctx.createRadialGradient(512, 460, 10, 512, 460, 240);
      amberRim.addColorStop(0, 'rgba(255, 190, 70, 0.9)');
      amberRim.addColorStop(0.5, 'rgba(255, 130, 20, 0.5)');
      amberRim.addColorStop(1, 'rgba(255, 90, 0, 0.0)');
      ctx.fillStyle = amberRim;
      ctx.fillRect(150, 262, 724, 250);

      const envTexture = new THREE.CanvasTexture(envCanvas);
      envTexture.mapping = THREE.EquirectangularReflectionMapping;
      const envRenderTarget = pmremGenerator.fromEquirectangular(envTexture);
      scene.environment = envRenderTarget.texture;
      pmremGenerator.dispose();
    }

    // =========================================================================
    // Multi-Spectrum Iridescent Lighting Rig (True Royal Purple & Delicate Iridescence)
    // =========================================================================
    // Ambient light with deep royal twilight tone (clean, non-pink)
    const ambientLight = new THREE.AmbientLight(0x200b3b, 2.0);
    scene.add(ambientLight);

    // Key Light: Clean neutral daylight white
    const keyLight = new THREE.DirectionalLight(0xffffff, 3.0);
    keyLight.position.set(2.5, 3.5, 3.0);
    scene.add(keyLight);

    // Rim Light 1 (Left): Radiant Electric Cyan (carves silhouette)
    const rimCyan = new THREE.DirectionalLight(0x00f0ff, 4.2);
    rimCyan.position.set(-3.8, 1.8, -2.0);
    scene.add(rimCyan);

    // Rim Light 2 (Right): Ethereal Royal Violet (true purple edge glow, no pink cast)
    const rimViolet = new THREE.DirectionalLight(0x8b5cf6, 4.0);
    rimViolet.position.set(3.8, 1.8, -2.0);
    scene.add(rimViolet);

    // Top Rim: Gentle Twilight Indigo
    const topLilac = new THREE.DirectionalLight(0xa78bfa, 3.2);
    topLilac.position.set(0, 4.2, -1.5);
    scene.add(topLilac);

    // Bottom Bounce: Warm Golden-Sunset Amber reflecting from glowing water floor
    const bottomBounce = new THREE.DirectionalLight(0xffbe68, 3.4);
    bottomBounce.position.set(0, -3.2, 1.8);
    scene.add(bottomBounce);

    // Dynamic Iridescent Cursor Specular Point Light (Vibrant Wavelengths)
    const cursorLight = new THREE.PointLight(0x00ffff, 5.5, 8.5, 1.1);
    cursorLight.position.set(0, 0, 2.2);
    scene.add(cursorLight);
    cursorLightRef.current = cursorLight;

    // -------------------------------------------------------------------------
    // 4 Pure-Color Physical Orbs (Scroll Transition: Jacket -> Ball -> 4 Balls)
    // ZERO TEXTURES - Pure high-gloss physical glass + inner luminous core
    // -------------------------------------------------------------------------
    const shadowCanvas = document.createElement('canvas');
    shadowCanvas.width = 128;
    shadowCanvas.height = 128;
    const sCtx = shadowCanvas.getContext('2d');
    if (sCtx) {
      const grad = sCtx.createRadialGradient(64, 64, 4, 64, 64, 60);
      grad.addColorStop(0, 'rgba(15, 5, 28, 0.22)');
      grad.addColorStop(0.45, 'rgba(15, 5, 28, 0.08)');
      grad.addColorStop(1.0, 'rgba(0, 0, 0, 0.0)');
      sCtx.fillStyle = grad;
      sCtx.fillRect(0, 0, 128, 128);
    }
    const shadowTexture = new THREE.CanvasTexture(shadowCanvas);

    // -------------------------------------------------------------------------
    // Magical Floating Chroma Orbit Group (Zero mechanical parts!)
    // -------------------------------------------------------------------------
    const orbitGroup = new THREE.Group();
    scene.add(orbitGroup);
    orbitGroupRef.current = orbitGroup;

    const orbs: THREE.Group[] = [];
    const shadows: THREE.Mesh[] = [];

    ORB_CONFIGS.forEach((cfg, idx) => {
      const orbGroup = new THREE.Group();

      // 1. Internal Point Light (Soft luminous color core shining outwards through refractive glass)
      const innerLight = new THREE.PointLight(new THREE.Color(cfg.colorHex), 3.0, 3.5, 1.2);
      orbGroup.add(innerLight);

      // 2. Pure Optical Refraction & Iridescent Glass Sphere
      // True physical transmission, chromatic dispersion, and thin-film iridescence (NO internal 3D meshes)
      const glassGeo = new THREE.SphereGeometry(0.50, 64, 48);
      const glassMat = new THREE.MeshPhysicalMaterial({
        color: new THREE.Color(0xffffff),
        roughness: 0.012,
        metalness: 0.02,
        transmission: 0.98,
        ior: 1.56,
        thickness: 2.4,
        dispersion: 0.28,
        iridescence: 1.0,
        iridescenceIOR: 1.68,
        iridescenceThicknessRange: [120, 800],
        attenuationColor: new THREE.Color(cfg.colorHex),
        attenuationDistance: 0.82,
        transparent: true,
        opacity: 0.98,
        reflectivity: 0.98,
        clearcoat: 1.0,
        clearcoatRoughness: 0.02,
      });
      const glassMesh = new THREE.Mesh(glassGeo, glassMat);
      glassMesh.userData = { orbIndex: idx };
      orbGroup.add(glassMesh);

      // Attach references to userData for animation loop
      orbGroup.userData = {
        orbIndex: idx,
        innerLight,
        glassMesh,
      };

      orbGroup.scale.set(0, 0, 0);
      orbGroup.visible = false;
      orbitGroup.add(orbGroup);
      orbs.push(orbGroup);

      // 7. Soft Ambient Floor Occlusion for each floating orb
      const shadowGeo = new THREE.PlaneGeometry(1.6, 1.6);
      shadowGeo.rotateX(-Math.PI / 2);
      const shadowMat = new THREE.MeshBasicMaterial({
        map: shadowTexture,
        transparent: true,
        opacity: 0.25,
        depthWrite: false,
      });
      const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
      shadowMesh.position.y = -0.92;
      shadowMesh.visible = false;
      scene.add(shadowMesh);
      shadows.push(shadowMesh);
    });

    orbsGroupRef.current = orbs;
    orbShadowsRef.current = shadows;

    // Scroll listener fallback for standalone use
    const onScroll = () => {
      if (typeof scrollProgress !== 'number') {
        const h = window.innerHeight || 800;
        const scroll = window.scrollY || 0;
        const progress = THREE.MathUtils.clamp(scroll / (h * 0.65), 0, 1);
        targetScrollProgressRef.current = progress;
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });

    // =========================================================================
    // Extremely Reactive Cursor Tracking & Interactive Orb Raycasting
    // =========================================================================
    const raycaster = new THREE.Raycaster();
    const mouseVec = new THREE.Vector2();

    const onPointerMove = (e: PointerEvent) => {
      const w = window.innerWidth;
      const h = window.innerHeight;

      // Normalized coordinates: center = (0, 0), bounds [-1, 1]
      const nx = (e.clientX / w) * 2 - 1;
      const ny = -(e.clientY / h) * 2 + 1;

      physicsRef.current.normalizedMouse.set(nx, ny);
      physicsRef.current.isInteracting = true;

      // MOVE IN THE EXACT OPPOSITE DIRECTION TO THE CURSOR!
      physicsRef.current.targetPosition.x = -nx * 1.35;
      physicsRef.current.targetPosition.y = -ny * 0.95;
      physicsRef.current.targetPosition.z = -Math.hypot(nx, ny) * 0.4;

      // 3D Parallax Tilt (Opposite direction with graceful turn)
      physicsRef.current.targetRotation.y = -nx * 0.44;
      physicsRef.current.targetRotation.x = ny * 0.32;
      physicsRef.current.targetRotation.z = -nx * 0.18;

      // Position the dynamic iridescent cursor specular light
      cursorLight.position.set(nx * 3.2, ny * 2.2, 2.2);
      clothUniformsRef.current.uCursorLightPos.value.set(nx * 3.2, ny * 2.2, 2.2);

      // Raycast against the 4 balls during the orbital stage
      if (scrollProgressRef.current > 0.60 && cameraRef.current) {
        mouseVec.set(nx, ny);
        raycaster.setFromCamera(mouseVec, cameraRef.current);
        const testMeshes: THREE.Object3D[] = [];
        orbs.forEach((g) => {
          if (g.visible) {
            g.children.forEach((c) => testMeshes.push(c));
          }
        });
        const hits = raycaster.intersectObjects(testMeshes, false);
        const hitIdx = hits.length > 0 ? (hits[0].object.userData.orbIndex ?? null) : null;
        hoveredOrbIndexRef.current = hitIdx;
        if (container) {
          container.style.cursor = hitIdx !== null ? 'pointer' : 'default';
        }
      } else {
        hoveredOrbIndexRef.current = null;
        if (container) {
          container.style.cursor = 'default';
        }
      }
    };

    const onPointerDown = (e: PointerEvent) => {
      if (scrollProgressRef.current > 0.60 && cameraRef.current) {
        const w = window.innerWidth;
        const h = window.innerHeight;
        const nx = (e.clientX / w) * 2 - 1;
        const ny = -(e.clientY / h) * 2 + 1;
        mouseVec.set(nx, ny);
        raycaster.setFromCamera(mouseVec, cameraRef.current);
        const testMeshes: THREE.Object3D[] = [];
        orbs.forEach((g) => {
          if (g.visible) {
            g.children.forEach((c) => testMeshes.push(c));
          }
        });
        const hits = raycaster.intersectObjects(testMeshes, false);
        const hitIdx = hits.length > 0 ? (hits[0].object.userData.orbIndex ?? null) : null;
        const targetIdx = hitIdx !== null ? hitIdx : hoveredOrbIndexRef.current;

        if (targetIdx !== null) {
          const selectedProd = PRODUCTS[targetIdx];
          if (selectedProd) {
            // Snap chosen orb to 3 o'clock position (pointing to 3D jacket)
            targetOrbitAngleRef.current = -targetIdx * (Math.PI / 2);

            isRevolverSplitRef.current = true;
            onToggleRevolverSplit?.(true);
            onSelectProduct?.(selectedProd);
          }
        }
      }
    };

    const onPointerLeave = () => {
      physicsRef.current.isInteracting = false;
      physicsRef.current.targetPosition.set(0, 0, 0);
      physicsRef.current.targetRotation.set(0, 0, 0);
      hoveredOrbIndexRef.current = null;
    };

    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointerleave', onPointerLeave);

    // =========================================================================
    // High-Frequency Critically Damped Cloth Physics Loop
    // =========================================================================
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameRef.current = requestAnimationFrame(animate);
      const delta = Math.min(clock.getDelta(), 0.035);
      const time = clock.getElapsedTime();
      clothUniformsRef.current.uTime.value = time;

      const p = physicsRef.current;

      // Store previous position for accurate, smooth velocity derivation
      const prevX = p.position.x;
      const prevY = p.position.y;
      const prevZ = p.position.z;

      // Reactive exponential smoothing: silky, high-end response without violent acceleration spikes
      const reactFactor = p.isInteracting ? 9.0 : 5.5;
      const alpha = 1.0 - Math.exp(-reactFactor * delta);

      p.position.x = THREE.MathUtils.lerp(p.position.x, p.targetPosition.x, alpha);
      p.position.y = THREE.MathUtils.lerp(p.position.y, p.targetPosition.y, alpha);
      p.position.z = THREE.MathUtils.lerp(p.position.z, p.targetPosition.z, alpha);

      p.rotation.x = THREE.MathUtils.lerp(p.rotation.x, p.targetRotation.x, alpha);
      p.rotation.y = THREE.MathUtils.lerp(p.rotation.y, p.targetRotation.y, alpha);
      p.rotation.z = THREE.MathUtils.lerp(p.rotation.z, p.targetRotation.z, alpha);

      // Instantaneous movement velocity with realistic physical ceiling
      const dt = delta || 0.016;
      p.velocity.set(
        (p.position.x - prevX) / dt,
        (p.position.y - prevY) / dt,
        (p.position.z - prevZ) / dt
      );
      const rawSpeed = p.velocity.length();
      if (rawSpeed > 2.8) {
        p.velocity.multiplyScalar(2.8 / rawSpeed);
      }

      clothUniformsRef.current.uVelocity.value.copy(p.velocity);

      // -----------------------------------------------------------------------
      // Flimsy Sleeves & Arms Lag Dynamics (Enhanced Play with Separated Sleeves)
      // -----------------------------------------------------------------------
      const targetArmLagX = -p.velocity.x * 0.075;
      const targetArmLagY = -p.velocity.y * 0.050;
      const targetArmLagZ = -p.velocity.x * 0.065;

      const maxArm = 0.115; // Natural, fluid displacement bounds with sleeve clearance
      p.leftArmLag.x = THREE.MathUtils.clamp(
        THREE.MathUtils.lerp(p.leftArmLag.x, targetArmLagX, 0.18),
        -maxArm,
        maxArm
      );
      p.leftArmLag.y = THREE.MathUtils.clamp(
        THREE.MathUtils.lerp(p.leftArmLag.y, targetArmLagY, 0.18),
        -maxArm,
        maxArm
      );
      p.leftArmLag.z = THREE.MathUtils.clamp(
        THREE.MathUtils.lerp(p.leftArmLag.z, targetArmLagZ, 0.18),
        -maxArm,
        maxArm
      );
      clothUniformsRef.current.uLeftArmLag.value.copy(p.leftArmLag);

      p.rightArmLag.x = THREE.MathUtils.clamp(
        THREE.MathUtils.lerp(p.rightArmLag.x, targetArmLagX, 0.18),
        -maxArm,
        maxArm
      );
      p.rightArmLag.y = THREE.MathUtils.clamp(
        THREE.MathUtils.lerp(p.rightArmLag.y, targetArmLagY, 0.18),
        -maxArm,
        maxArm
      );
      p.rightArmLag.z = THREE.MathUtils.clamp(
        THREE.MathUtils.lerp(p.rightArmLag.z, -targetArmLagZ, 0.18),
        -maxArm,
        maxArm
      );
      clothUniformsRef.current.uRightArmLag.value.copy(p.rightArmLag);

      // -----------------------------------------------------------------------
      // Open Front Flaps & Collar Sway Dynamics
      // -----------------------------------------------------------------------
      const targetFlapLagX = -p.velocity.x * 0.065;
      const targetFlapLagZ = -p.velocity.x * 0.075 + p.velocity.y * 0.035;

      const maxFlap = 0.080;
      p.leftFlapLag.x = THREE.MathUtils.clamp(
        THREE.MathUtils.lerp(p.leftFlapLag.x, targetFlapLagX, 0.18),
        -maxFlap,
        maxFlap
      );
      p.leftFlapLag.z = THREE.MathUtils.clamp(
        THREE.MathUtils.lerp(p.leftFlapLag.z, targetFlapLagZ, 0.18),
        -maxFlap,
        maxFlap
      );
      clothUniformsRef.current.uLeftFlapLag.value.copy(p.leftFlapLag);

      p.rightFlapLag.x = THREE.MathUtils.clamp(
        THREE.MathUtils.lerp(p.rightFlapLag.x, targetFlapLagX, 0.18),
        -maxFlap,
        maxFlap
      );
      p.rightFlapLag.z = THREE.MathUtils.clamp(
        THREE.MathUtils.lerp(p.rightFlapLag.z, -targetFlapLagZ, 0.18),
        -maxFlap,
        maxFlap
      );
      clothUniformsRef.current.uRightFlapLag.value.copy(p.rightFlapLag);

      // Gentle Bellows Expansion (Wind catching open panels)
      const speed = p.velocity.length();
      const targetBellows = Math.min(0.12, speed * 0.06);
      p.bellows = THREE.MathUtils.lerp(p.bellows, targetBellows, 0.14);
      clothUniformsRef.current.uBellows.value = p.bellows;

      // -----------------------------------------------------------------------
      // Garment Body & Hem Sway
      // -----------------------------------------------------------------------
      const targetHemX = -p.velocity.x * 0.045;
      const targetHemY = -p.velocity.y * 0.035;
      const maxHem = 0.065;
      p.hemLag.x = THREE.MathUtils.clamp(
        THREE.MathUtils.lerp(p.hemLag.x, targetHemX, 0.15),
        -maxHem,
        maxHem
      );
      p.hemLag.y = THREE.MathUtils.clamp(
        THREE.MathUtils.lerp(p.hemLag.y, targetHemY, 0.15),
        -maxHem,
        maxHem
      );
      clothUniformsRef.current.uHemLag.value.copy(p.hemLag);

      // -----------------------------------------------------------------------
      // Scroll-Driven Continuum: Jacket -> Ball Morph -> Follow -> Click 4 Balls -> 3D Orbit
      // -----------------------------------------------------------------------
      const HERO_FLOOR_Y = -0.55;
      const DEFAULT_JACKET_Y = 0.18;
      const idleFloat = p.isInteracting ? 0 : Math.sin(time * 1.5) * 0.025;

      // Direct synchronous read from ScrollTrigger global or prop
      if (typeof (window as unknown as { __puffyScrollProgress?: number }).__puffyScrollProgress === 'number') {
        targetScrollProgressRef.current = (window as unknown as { __puffyScrollProgress: number }).__puffyScrollProgress;
      }

      // Smooth responsive catch-up
      scrollProgressRef.current = THREE.MathUtils.lerp(
        scrollProgressRef.current,
        targetScrollProgressRef.current,
        0.25
      );
      const s = scrollProgressRef.current;

      // Identify active product index (default to 0: purple)
      const currentProdId = activeProductRef.current?.id || 'purple-lumi';
      const activeIdx = ORB_CONFIGS.findIndex((c) => c.id === currentProdId);
      const safeActiveIdx = activeIdx >= 0 ? activeIdx : 0;

      // Smoothly ease out cursor influence as scrolling transitions into the orb phase
      // so neither the jacket nor the orb ever jerks or snaps to center.
      const cursorTaper = THREE.MathUtils.clamp(1.0 - (s - 0.05) / 0.25, 0, 1);
      const smoothCursor = cursorTaper * cursorTaper * (3 - 2 * cursorTaper);
      const effPosX = p.position.x * smoothCursor;
      const effPosY = p.position.y * smoothCursor;
      const effPosZ = p.position.z * smoothCursor;
      const effRotX = p.rotation.x * smoothCursor;
      const effRotY = p.rotation.y * smoothCursor;
      const effRotZ = p.rotation.z * smoothCursor;

      // =======================================================================
      // PHASE 1 & 2: JACKET VISIBILITY & SHRINKING (s in [0.0, 0.34])
      // =======================================================================
      let jacketScaleFactor = 1.0;
      if (s <= 0.08) {
        jacketScaleFactor = 1.0;
      } else if (s <= 0.32) {
        const t1 = (s - 0.08) / 0.24;
        const u1 = t1 * t1 * (3 - 2 * t1);
        jacketScaleFactor = Math.max(0, 1.0 - u1);
      } else {
        jacketScaleFactor = 0;
      }

      // 1. Main Floating Jacket (Tapers toward center smoothly as it condenses)
      if (mainGroupRef.current) {
        mainGroupRef.current.position.x = effPosX;
        mainGroupRef.current.position.y = DEFAULT_JACKET_Y + effPosY + idleFloat * smoothCursor;
        mainGroupRef.current.position.z = effPosZ;

        mainGroupRef.current.rotation.x = effRotX;
        mainGroupRef.current.rotation.y = effRotY;
        mainGroupRef.current.rotation.z = effRotZ;

        mainGroupRef.current.scale.set(jacketScaleFactor, jacketScaleFactor, jacketScaleFactor);
        mainGroupRef.current.visible = jacketScaleFactor > 0.002;
      }

      // 2. Vertically Mirrored Floor Reflection (Attached to Jacket, shrinks on scroll)
      if (reflectionGroupRef.current && mainGroupRef.current) {
        const jacketY = mainGroupRef.current.position.y;
        const heightAbove = jacketY - HERO_FLOOR_Y;

        reflectionGroupRef.current.position.x = mainGroupRef.current.position.x;
        reflectionGroupRef.current.position.z = mainGroupRef.current.position.z;
        reflectionGroupRef.current.position.y = HERO_FLOOR_Y - heightAbove * 0.58;

        // Mirrored 3D rotation
        reflectionGroupRef.current.rotation.x = -mainGroupRef.current.rotation.x;
        reflectionGroupRef.current.rotation.y = mainGroupRef.current.rotation.y;
        reflectionGroupRef.current.rotation.z = -mainGroupRef.current.rotation.z;

        reflectionGroupRef.current.scale.set(
          0.96 * jacketScaleFactor,
          -0.58 * jacketScaleFactor,
          0.96 * jacketScaleFactor
        );
        reflectionGroupRef.current.visible = jacketScaleFactor > 0.005;
      }

      // 3. Soft Elliptical Contact Shadow directly under the jacket on the floor plane
      if (contactShadowRef.current && mainGroupRef.current) {
        contactShadowRef.current.position.x = mainGroupRef.current.position.x;
        contactShadowRef.current.position.z = mainGroupRef.current.position.z;

        const currentY = mainGroupRef.current.position.y;
        const heightDelta = Math.max(0, currentY - DEFAULT_JACKET_Y);
        const shadowScale = THREE.MathUtils.clamp(1.0 + heightDelta * 0.35, 0.75, 1.35) * jacketScaleFactor;
        contactShadowRef.current.scale.set(shadowScale, 1, shadowScale * 0.72);
        (contactShadowRef.current.material as THREE.MeshBasicMaterial).opacity =
          THREE.MathUtils.clamp((0.48 - heightDelta * 0.22) * jacketScaleFactor, 0, 0.55);
        contactShadowRef.current.visible = jacketScaleFactor > 0.005;
      }

      // =======================================================================
      // PHASE 2 - 5: MAGICAL 4-ORB FLOATING SPECTRUM & STAGGERED ENTRANCES
      // Hero Condenses -> Glides to Left -> Orbs enter from edges -> Floating Orbit
      // =======================================================================
      const orbs = orbsGroupRef.current;
      const shadows = orbShadowsRef.current;
      const orbitGroup = orbitGroupRef.current;

      const ORBIT_CENTER_X = -2.15;
      const ORBIT_CENTER_Y = 0.06;
      const ORBIT_RADIUS = 1.15;
      const FLOOR_Y = -0.92;

      // Camera distance interpolation for smooth section transitions
      let targetCamZ = 3.8;
      if (s > 0.20) {
        const tCam = THREE.MathUtils.clamp((s - 0.20) / 0.45, 0, 1);
        const uCam = tCam * tCam * (3 - 2 * tCam);
        targetCamZ = 3.8 + 1.05 * uCam; // smoothly pulls back to 4.85
      }
      camera.position.z = THREE.MathUtils.lerp(camera.position.z, targetCamZ, 0.08);

      // Orbit Angular Progression: Continuous gentle celestial drift once assembled
      if (s > 0.65) {
        targetOrbitAngleRef.current += 0.25 * delta;
      }
      orbitAngleRef.current = THREE.MathUtils.lerp(
        orbitAngleRef.current,
        targetOrbitAngleRef.current,
        0.12
      );

      // Split Jacket Scale Interpolation on Right Side (s > 0.65)
      let targetJacketSplitScale = 0.0;
      if (s > 0.65) {
        const tJacket = THREE.MathUtils.clamp((s - 0.65) / 0.22, 0, 1);
        targetJacketSplitScale = tJacket * tJacket * (3 - 2 * tJacket) * 1.30;
      }
      jacketSplitScaleRef.current = THREE.MathUtils.lerp(
        jacketSplitScaleRef.current,
        targetJacketSplitScale,
        0.15
      );
      const splitScale = jacketSplitScaleRef.current;

      if (orbitGroup) {
        orbitGroup.visible = s > 0.12;
      }

      if (orbs.length === 4) {
        // Individual off-screen spawn points for the 3 secondary orbs
        // (ordered relative to safeActiveIdx: relOrder = 1, 2, 3)
        const SPAWN_OFFSETS = [
          new THREE.Vector3(ORBIT_CENTER_X + 0.15, 3.8, 0),    // relOrder 1: from top edge
          new THREE.Vector3(ORBIT_CENTER_X - 0.25, -3.8, 0),   // relOrder 2: from bottom edge
          new THREE.Vector3(ORBIT_CENTER_X - 3.8, ORBIT_CENTER_Y, 0), // relOrder 3: from far-left edge
        ];

        // Staggered scroll entrance intervals for relOrder 1, 2, 3
        const ENTRANCE_RANGES = [
          { start: 0.54, end: 0.72 }, // relOrder 1
          { start: 0.63, end: 0.80 }, // relOrder 2
          { start: 0.71, end: 0.88 }, // relOrder 3
        ];

        orbs.forEach((o, i) => {
          const isPrimary = i === safeActiveIdx;
          const isHovered = hoveredOrbIndexRef.current === i;

          // Target orbital slot in the circle on the left
          const slotAngle = (i * Math.PI) / 2 + orbitAngleRef.current;
          const destX = ORBIT_CENTER_X + ORBIT_RADIUS * Math.cos(slotAngle);
          const destY = ORBIT_CENTER_Y + ORBIT_RADIUS * Math.sin(slotAngle);

          // Ethereal subtle floating bobbing in the air
          const bobY = Math.sin(time * 2.0 + i * 1.57) * 0.035;
          const bobX = Math.cos(time * 1.6 + i * 1.57) * 0.020;

          if (isPrimary) {
            // =================================================================
            // PRIMARY ORB: Seamless Continuous Trajectory (Zero Center Snapping!)
            // Condenses at exact jacket location -> Fluid Arc glide to Left Orbit
            // =================================================================
            if (s <= 0.12) {
              o.visible = false;
              o.scale.set(0, 0, 0);
              if (shadows[i]) shadows[i].visible = false;
            } else if (s <= 0.65) {
              o.visible = true;

              // Scale: Emerges from s=0.12 to s=0.28, then stays at full size
              let curScale = 1.0;
              if (s < 0.28) {
                const tScale = (s - 0.12) / 0.16;
                curScale = tScale * tScale * (3 - 2 * tScale);
              }
              o.scale.set(curScale, curScale, curScale);

              // Continuous Trajectory from jacket location to left orbit
              let curX = effPosX;
              let curY = DEFAULT_JACKET_Y + effPosY;

              if (s > 0.20) {
                const tGlide = (s - 0.20) / 0.45;
                const uGlide = tGlide * tGlide * (3 - 2 * tGlide);

                curX = THREE.MathUtils.lerp(effPosX, destX, uGlide);
                const dip = Math.sin(uGlide * Math.PI) * 0.14;
                curY = THREE.MathUtils.lerp(DEFAULT_JACKET_Y + effPosY, destY, uGlide) - dip;
              }

              o.position.set(curX, curY, effPosZ * (1 - (s - 0.12) / 0.53));
              o.rotation.y = time * 0.8;
              o.rotation.x = Math.sin(time * 0.4) * 0.15;

              // Soft floor shadow smoothly tracks curX and curY
              if (shadows[i]) {
                shadows[i].visible = s > 0.18;
                shadows[i].position.set(curX, FLOOR_Y, 0);
                const distToFloor = curY - FLOOR_Y;
                const sScale = THREE.MathUtils.clamp(1.0 + distToFloor * 0.15, 0.6, 1.3) * curScale;
                shadows[i].scale.set(sScale, sScale, sScale);
                const shadowFade = THREE.MathUtils.clamp((s - 0.18) / 0.15, 0, 1);
                (shadows[i].material as THREE.MeshBasicMaterial).opacity =
                  THREE.MathUtils.clamp((0.24 - distToFloor * 0.06) * shadowFade, 0.02, 0.22);
              }
            } else {
              // Settled in rotating orbit on the left
              o.visible = true;
              const targetScale = isHovered ? 1.15 : 1.0;
              const curScale = o.scale.x;
              const newScale = THREE.MathUtils.lerp(curScale, targetScale, 0.18);
              o.scale.set(newScale, newScale, newScale);

              o.position.set(destX + bobX, destY + bobY, isHovered ? 0.22 : 0);
              o.rotation.y = time * 0.5 + i * 1.2;
              o.rotation.x = Math.sin(time * 0.35 + i) * 0.12;

              if (shadows[i]) {
                shadows[i].visible = true;
                shadows[i].position.set(destX + bobX, FLOOR_Y, 0);
                shadows[i].scale.set(1.1, 1.1, 1.1);
                (shadows[i].material as THREE.MeshBasicMaterial).opacity = 0.20;
              }
            }
          } else {
            // =================================================================
            // SECONDARY ORBS: Enter individually from screen edges into circle!
            // =================================================================
            const relOrder = (i - safeActiveIdx + 4) % 4; // 1, 2, or 3
            const spawnPoint = SPAWN_OFFSETS[relOrder - 1];
            const range = ENTRANCE_RANGES[relOrder - 1];

            if (s < range.start) {
              // Not yet arrived: completely off-screen / hidden
              o.visible = false;
              o.scale.set(0, 0, 0);
              o.position.copy(spawnPoint);
              if (shadows[i]) shadows[i].visible = false;
            } else if (s <= range.end) {
              // Entering from screen edge with smooth easy-ease
              o.visible = true;
              const tEnter = (s - range.start) / (range.end - range.start);
              const uEnter = tEnter * tEnter * (3 - 2 * tEnter);

              o.scale.set(uEnter, uEnter, uEnter);
              const curX = THREE.MathUtils.lerp(spawnPoint.x, destX, uEnter);
              const curY = THREE.MathUtils.lerp(spawnPoint.y, destY, uEnter);

              o.position.set(curX, curY, 0);
              o.rotation.y = time * 0.8 + i * 1.5;
              o.rotation.x = Math.sin(time * 0.5 + i) * 0.15;

              if (shadows[i]) {
                shadows[i].visible = uEnter > 0.1;
                shadows[i].position.set(curX, FLOOR_Y, 0);
                shadows[i].scale.set(uEnter * 1.1, uEnter * 1.1, uEnter * 1.1);
                (shadows[i].material as THREE.MeshBasicMaterial).opacity = 0.20 * uEnter;
              }
            } else {
              // Fully settled in the rotating circle on the left!
              o.visible = true;
              const targetScale = isHovered ? 1.15 : 1.0;
              const curScale = o.scale.x;
              const newScale = THREE.MathUtils.lerp(curScale, targetScale, 0.18);
              o.scale.set(newScale, newScale, newScale);

              o.position.set(destX + bobX, destY + bobY, isHovered ? 0.22 : 0);
              o.rotation.y = time * 0.5 + i * 1.2;
              o.rotation.x = Math.sin(time * 0.35 + i) * 0.12;

              if (shadows[i]) {
                shadows[i].visible = true;
                shadows[i].position.set(destX + bobX, FLOOR_Y, 0);
                shadows[i].scale.set(1.1, 1.1, 1.1);
                (shadows[i].material as THREE.MeshBasicMaterial).opacity = 0.20;
              }
            }
          }

          // ===================================================================
          // ANIMATE INTERNAL REFRACTIONS & OPTICAL REFLECTIONS
          // ===================================================================
          const ud = o.userData as {
            innerLight?: THREE.PointLight;
            glassMesh?: THREE.Mesh;
          };

          if (ud.innerLight) {
            // Optical luminance shining outward through the glass
            ud.innerLight.intensity = isHovered
              ? 4.8
              : (2.8 + 0.65 * Math.sin(time * 2.8 + i * 1.8));
          }

          if (ud.glassMesh) {
            // Subtle undulating rotation so crystal reflections glide across the sphere
            ud.glassMesh.rotation.y = time * 0.45 + i * 0.6;
            ud.glassMesh.rotation.z = Math.cos(time * 0.35 + i) * 0.10;
          }
        });

        // =====================================================================
        // Render 3D Jacket on the Right Side in Section 2 (Enlarged & Centered)
        // =====================================================================
        if (splitScale > 0.01 && mainGroupRef.current) {
          mainGroupRef.current.position.x = 1.05 + p.position.x * 0.35;
          mainGroupRef.current.position.y = 0.04 + p.position.y * 0.35;
          mainGroupRef.current.position.z = p.position.z * 0.35;

          mainGroupRef.current.rotation.x = p.rotation.x;
          mainGroupRef.current.rotation.y = p.rotation.y;
          mainGroupRef.current.rotation.z = p.rotation.z;

          mainGroupRef.current.scale.set(splitScale, splitScale, splitScale);
          mainGroupRef.current.visible = true;

          // Mirrored reflection under jacket on right
          if (reflectionGroupRef.current) {
            const jacketY = mainGroupRef.current.position.y;
            const heightAbove = jacketY - FLOOR_Y;

            reflectionGroupRef.current.position.x = mainGroupRef.current.position.x;
            reflectionGroupRef.current.position.z = mainGroupRef.current.position.z;
            reflectionGroupRef.current.position.y = FLOOR_Y - heightAbove * 0.58;

            reflectionGroupRef.current.rotation.x = -mainGroupRef.current.rotation.x;
            reflectionGroupRef.current.rotation.y = mainGroupRef.current.rotation.y;
            reflectionGroupRef.current.rotation.z = -mainGroupRef.current.rotation.z;

            reflectionGroupRef.current.scale.set(0.96 * splitScale, -0.58 * splitScale, 0.96 * splitScale);
            reflectionGroupRef.current.visible = true;
          }

          // Soft contact shadow under jacket on right
          if (contactShadowRef.current) {
            contactShadowRef.current.position.x = mainGroupRef.current.position.x;
            contactShadowRef.current.position.z = mainGroupRef.current.position.z;
            contactShadowRef.current.scale.set(1.15 * splitScale, 1, 0.85 * splitScale);
            contactShadowRef.current.visible = true;
          }
        }
      }

      // Dynamic Iridescent Hue Modulation for Cursor Specular Light
      if (cursorLightRef.current) {
        const hue = 0.50 + 0.28 * (0.5 + 0.5 * Math.sin(time * 2.0 + p.normalizedMouse.x));
        cursorLightRef.current.color.setHSL(hue, 1.0, 0.65);
      }

      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!container || !rendererRef.current) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointerleave', onPointerLeave);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', handleResize);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      renderer.dispose();
      container.innerHTML = '';
    };
  }, []);

  // Synchronize active product & scroll progress props with internal refs
  useEffect(() => {
    activeProductRef.current = product;
    if (product) {
      const idx = PRODUCTS.findIndex((p) => p.id === product.id);
      if (idx >= 0) {
        targetOrbitAngleRef.current = -idx * (Math.PI / 2);
      }
    }
  }, [product]);

  useEffect(() => {
    isRevolverSplitRef.current = isRevolverSplit;
  }, [isRevolverSplit]);

  useEffect(() => {
    if (typeof scrollProgress === 'number') {
      targetScrollProgressRef.current = THREE.MathUtils.clamp(scrollProgress, 0, 1);
    }
  }, [scrollProgress]);

  // Load Purple Puffer GLB Model with the Advanced Iridescent Fabric & Flimsy Cloth Shader
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    setLoading(true);
    setLoadProgress(20);

    const loader = new GLTFLoader();
    const activeModelUrl = product?.modelUrl || '/assets/models/puffer-purple-lumi.glb';

    loader.load(
      activeModelUrl,
      (gltf) => {
        if (mainGroupRef.current) {
          scene.remove(mainGroupRef.current);
          mainGroupRef.current = null;
        }
        if (reflectionGroupRef.current) {
          scene.remove(reflectionGroupRef.current);
          reflectionGroupRef.current = null;
        }
        if (contactShadowRef.current) {
          scene.remove(contactShadowRef.current);
          contactShadowRef.current = null;
        }
        if (currentModelRef.current) {
          scene.remove(currentModelRef.current);
          currentModelRef.current = null;
        }

        const model = gltf.scene;

        // Traverse & Inject Custom Flimsy Cloth & Iridescent Shader
        model.traverse((child) => {
          if (child instanceof THREE.Mesh && child.material) {
            child.castShadow = true;
            child.receiveShadow = true;

            const materials = Array.isArray(child.material) ? child.material : [child.material];

            materials.forEach((m) => {
              const mat = m as THREE.MeshStandardMaterial;
              mat.roughness = 0.16;
              mat.metalness = 0.58;
              mat.envMapIntensity = 2.6;

              mat.onBeforeCompile = (shader) => {
                // Bind Uniforms
                shader.uniforms.uTime = clothUniformsRef.current.uTime;
                shader.uniforms.uVelocity = clothUniformsRef.current.uVelocity;
                shader.uniforms.uLeftArmLag = clothUniformsRef.current.uLeftArmLag;
                shader.uniforms.uRightArmLag = clothUniformsRef.current.uRightArmLag;
                shader.uniforms.uLeftFlapLag = clothUniformsRef.current.uLeftFlapLag;
                shader.uniforms.uRightFlapLag = clothUniformsRef.current.uRightFlapLag;
                shader.uniforms.uHemLag = clothUniformsRef.current.uHemLag;
                shader.uniforms.uBellows = clothUniformsRef.current.uBellows;
                shader.uniforms.uCursorLightPos = clothUniformsRef.current.uCursorLightPos;

                // Vertex Shader Header
                shader.vertexShader = `
                  uniform float uTime;
                  uniform vec3 uVelocity;
                  uniform vec3 uLeftArmLag;
                  uniform vec3 uRightArmLag;
                  uniform vec3 uLeftFlapLag;
                  uniform vec3 uRightFlapLag;
                  uniform vec3 uHemLag;
                  uniform float uBellows;

                  varying vec3 vWorldNormal;
                  varying vec3 vWorldPosition;
                ` + shader.vertexShader;

                // Flimsy Cloth Vertex Displacements
                shader.vertexShader = shader.vertexShader.replace(
                  '#include <begin_vertex>',
                  `
                  #include <begin_vertex>

                  float speed = length(uVelocity.xy);

                  // ----------------------------------------------------
                  // 1. FLIMSY ARMS & SLEEVES (Separated Geometry & Enhanced Play)
                  // ----------------------------------------------------
                  // Clean arm boundary starting at armpit separation (|x| = 0.28) out to cuff (|x| = 0.90)
                  float leftArmExtent = smoothstep(0.28, 0.90, -position.x);
                  float rightArmExtent = smoothstep(0.28, 0.90, position.x);
                  // Sleeve vertical compliance: shoulders flex naturally, cuffs have full swing
                  float armFreedom = mix(0.40, 1.0, 1.0 - smoothstep(-0.45, 0.65, position.y));

                  if (leftArmExtent > 0.001) {
                    float w = leftArmExtent * armFreedom;
                    vec3 armLag = uLeftArmLag * w * 0.70;
                    float ripple = sin(position.x * 5.0 - uTime * 4.0) * 0.009 * min(speed, 1.0) * w;
                    transformed += armLag + vec3(0.0, ripple, ripple * 0.3);
                  }

                  if (rightArmExtent > 0.001) {
                    float w = rightArmExtent * armFreedom;
                    vec3 armLag = uRightArmLag * w * 0.70;
                    float ripple = sin(position.x * 5.0 + uTime * 4.0) * 0.009 * min(speed, 1.0) * w;
                    transformed += armLag + vec3(0.0, ripple, -ripple * 0.3);
                  }

                  // ----------------------------------------------------
                  // 2. OPEN FRONT FLAPS & COLLAR DYNAMICS (Top to Bottom)
                  // ----------------------------------------------------
                  // Front panel detection (runs from collar all the way down)
                  float isFront = smoothstep(-0.02, 0.25, position.z);
                  float isFlapX = 1.0 - smoothstep(0.01, 0.46, abs(position.x));

                  // Collar and upper lapels (y: 0.15 to 0.70)
                  float isCollar = smoothstep(0.15, 0.70, position.y) * (1.0 - smoothstep(0.02, 0.38, abs(position.x))) * isFront;

                  // Vertical flex spans from collar (0.45) down to hem (0.85)
                  // Eliminates the rigid top vs over-stretched bottom disparity!
                  float flapFlex = mix(0.45, 0.85, 1.0 - smoothstep(-0.60, 0.65, position.y));
                  float flapWeight = isFront * isFlapX * flapFlex;

                  if (flapWeight > 0.001) {
                    float billowOut = uBellows * flapWeight * 0.15;
                    // Collar lapel opening and gentle aerodynamic flare
                    float collarFlare = isCollar * (0.022 + uBellows * 0.20);

                    if (position.x < 0.0) {
                      transformed += uLeftFlapLag * flapWeight * 0.50;
                      transformed.x -= (billowOut + collarFlare);
                      float scoop = max(0.0, uVelocity.x) * 0.07 * flapWeight;
                      transformed.z += billowOut * 0.5 + scoop + (isCollar * 0.014);
                    } else {
                      transformed += uRightFlapLag * flapWeight * 0.50;
                      transformed.x += (billowOut + collarFlare);
                      float scoop = max(0.0, -uVelocity.x) * 0.07 * flapWeight;
                      transformed.z += billowOut * 0.5 + scoop + (isCollar * 0.014);
                    }

                    // Gentle, subtle lapel breath rather than harsh distortion
                    float edgeFlutter = sin(position.y * 5.0 - uTime * 4.0) * 0.006 * min(speed, 1.0) * flapWeight;
                    transformed.z += edgeFlutter;
                  }

                  // ----------------------------------------------------
                  // 3. UNIFIED GARMENT BODY & HEM INERTIA (No Bottom-Only Shearing)
                  // ----------------------------------------------------
                  // Smoothly unified across upper torso (0.2) down to hem (0.55)
                  float bodyFactor = mix(0.20, 0.55, 1.0 - smoothstep(-0.65, 0.55, position.y));
                  transformed += uHemLag * bodyFactor * 0.35;
                  `
                );

                // Pass World Coordinates to Fragment Shader for Iridescent Rim Calculations
                shader.vertexShader = shader.vertexShader.replace(
                  '#include <worldpos_vertex>',
                  `
                  #include <worldpos_vertex>
                  vWorldNormal = normalize(mat3(modelMatrix) * normal);
                  vWorldPosition = (modelMatrix * vec4(transformed, 1.0)).xyz;
                  `
                );

                // Fragment Shader Header
                shader.fragmentShader = `
                  uniform float uTime;
                  uniform vec3 uCursorLightPos;
                  varying vec3 vWorldNormal;
                  varying vec3 vWorldPosition;
                ` + shader.fragmentShader;

                // Ultra-Vibrant Multi-Spectrum Iridescent Nano-Glaze Injection
                shader.fragmentShader = shader.fragmentShader.replace(
                  '#include <dithering_fragment>',
                  `
                  #include <dithering_fragment>

                  // View direction in world space
                  vec3 viewDir = normalize(cameraPosition - vWorldPosition);
                  vec3 norm = normalize(vWorldNormal);

                  // Fresnel grazing factor
                  float NdotV = clamp(dot(norm, viewDir), 0.0, 1.0);
                  float grazing = pow(1.0 - NdotV, 2.0);

                  // =========================================================
                  // 1. Dual-Order Thin-Film Nano-Glaze Interference
                  // =========================================================
                  // Primary chromatic wave (shifts across surface with viewing angle & curvature)
                  float phase1 = (1.0 - NdotV) * 3.2 + sin(vWorldPosition.y * 3.5 + vWorldPosition.x * 2.2) * 0.35 + uTime * 0.08;
                  // Secondary high-frequency prismatic wave
                  float phase2 = (1.0 - NdotV) * 5.0 - vWorldPosition.y * 1.8 + uTime * 0.05;

                  // Rich cosine color palettes focused on royal violet, electric cyan, and delicate pearlescence:
                  // Tone 1: Electric Violet -> Indigo -> Soft Lilac
                  vec3 tone1 = 0.5 + 0.5 * cos(6.28318 * (vec3(0.75, 0.55, 0.95) * phase1 + vec3(0.60, 0.20, 0.90)));
                  // Tone 2: Ultra Cyan -> Turquoise -> Orchid
                  vec3 tone2 = 0.5 + 0.5 * cos(6.28318 * (vec3(0.40, 0.80, 0.30) * phase2 + vec3(0.05, 0.75, 0.65)));
                  vec3 multiIrid = mix(tone1, tone2, 0.45);

                  // Surface distribution: subtle grazing sheen only (hues of iridescence, preserving true purple base!)
                  float glazePower = 0.04 + 0.65 * pow(grazing, 2.4);
                  vec3 iridescentSheen = multiIrid * glazePower * 0.95;

                  // =========================================================
                  // 2. Dynamic Prismatic Specular Dispersion from Cursor
                  // =========================================================
                  vec3 lightDir = normalize(uCursorLightPos - vWorldPosition);
                  vec3 halfVec = normalize(lightDir + viewDir);
                  float NdotH = max(dot(norm, halfVec), 0.0);

                  // Chromatic dispersion (focused on specular glints rather than tinting fabric)
                  float specR = pow(NdotH, 42.0);
                  float specG = pow(NdotH, 36.0);
                  float specB = pow(NdotH, 28.0);
                  vec3 chromaticSpec = vec3(specR * 1.0, specG * 0.95, specB * 1.3) * vec3(0.9, 0.95, 1.0) * 1.1;

                  // Apply iridescent glaze and specular highlight
                  gl_FragColor.rgb += iridescentSheen + chromaticSpec;

                  // =========================================================
                  // 3. Vibrance & Saturation Calibration (True Color Balance)
                  // =========================================================
                  float lum = dot(gl_FragColor.rgb, vec3(0.2126, 0.7152, 0.0722));
                  gl_FragColor.rgb = mix(vec3(lum), gl_FragColor.rgb, 1.12);
                  `
                );
              };
            });
          }
        });

        // Center and scale model perfectly
        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());

        const maxDim = Math.max(size.x, size.y, size.z);
        const scale = 2.05 / maxDim;
        modelBaseScaleRef.current = scale;
        modelCenterRef.current.copy(center);

        // Position model centered inside main group
        model.scale.set(scale, scale, scale);
        model.position.set(-center.x * scale, -center.y * scale, -center.z * scale);

        const mainGroup = new THREE.Group();
        mainGroup.add(model);
        mainGroup.position.set(0, 0.18, 0);
        scene.add(mainGroup);
        mainGroupRef.current = mainGroup;
        currentModelRef.current = mainGroup;

        // ---------------------------------------------------------------------
        // Mirrored 3D Reflection Group (Squashed Vertically, Dreamy Liquid Blur)
        // ---------------------------------------------------------------------
        const reflectionModel = model.clone(true);
        reflectionModel.scale.set(scale, scale, scale);
        reflectionModel.position.set(-center.x * scale, -center.y * scale, -center.z * scale);

        reflectionModel.traverse((child) => {
          if (child instanceof THREE.Mesh && child.material) {
            child.castShadow = false;
            child.receiveShadow = false;

            const materials = Array.isArray(child.material) ? child.material : [child.material];
            const refMats = materials.map((m) => {
              const origMat = m as THREE.MeshStandardMaterial;
              const refMat = origMat.clone();
              refMat.transparent = true;
              refMat.opacity = 0.20; // 20% opacity as requested
              refMat.depthWrite = false;
              refMat.side = THREE.DoubleSide; // Prevents face culling when scale.y < 0
              refMat.roughness = 0.52; // Softens details while preserving iridescent specular highlights
              refMat.metalness = 0.45;
              refMat.envMapIntensity = 2.2;

              refMat.onBeforeCompile = (shader) => {
                shader.uniforms.uTime = clothUniformsRef.current.uTime;
                shader.uniforms.uVelocity = clothUniformsRef.current.uVelocity;
                shader.uniforms.uLeftArmLag = clothUniformsRef.current.uLeftArmLag;
                shader.uniforms.uRightArmLag = clothUniformsRef.current.uRightArmLag;
                shader.uniforms.uFloorY = { value: -0.55 };

                shader.vertexShader = `
                  uniform float uTime;
                  uniform vec3 uVelocity;
                  uniform vec3 uLeftArmLag;
                  uniform vec3 uRightArmLag;
                  varying vec3 vWorldNormal;
                  varying vec3 vWorldPosition;
                ` + shader.vertexShader;

                shader.vertexShader = shader.vertexShader.replace(
                  '#include <begin_vertex>',
                  `
                  #include <begin_vertex>
                  // Gentle liquid surface wave displacement on water reflection
                  float liquidWave = sin(position.x * 12.0 + uTime * 2.5) * 0.012
                                   + cos(position.y * 10.0 + uTime * 2.0) * 0.009;
                  transformed.x += liquidWave;
                  transformed.z += liquidWave * 0.5;

                  // Fabric motion mirroring
                  float leftArmExtent = smoothstep(0.28, 0.90, -position.x);
                  float rightArmExtent = smoothstep(0.28, 0.90, position.x);
                  float armFreedom = mix(0.40, 1.0, 1.0 - smoothstep(-0.45, 0.65, position.y));
                  if (leftArmExtent > 0.001) {
                    float w = leftArmExtent * armFreedom;
                    transformed += uLeftArmLag * w * 0.60;
                  }
                  if (rightArmExtent > 0.001) {
                    float w = rightArmExtent * armFreedom;
                    transformed += uRightArmLag * w * 0.60;
                  }
                  `
                );

                shader.vertexShader = shader.vertexShader.replace(
                  '#include <worldpos_vertex>',
                  `
                  #include <worldpos_vertex>
                  vWorldNormal = normalize(mat3(modelMatrix) * normal);
                  vWorldPosition = (modelMatrix * vec4(transformed, 1.0)).xyz;
                  `
                );

                shader.fragmentShader = `
                  uniform float uTime;
                  uniform float uFloorY;
                  varying vec3 vWorldNormal;
                  varying vec3 vWorldPosition;
                ` + shader.fragmentShader;

                shader.fragmentShader = shader.fragmentShader.replace(
                  '#include <dithering_fragment>',
                  `
                  #include <dithering_fragment>

                  // Soft reflection gradient fade downward from floor plane
                  float distBelow = max(0.0, uFloorY - vWorldPosition.y);
                  
                  // Fast fade after first third (0.04 to 0.65 units down)
                  float vertFade = 1.0 - smoothstep(0.04, 0.65, distBelow);
                  vertFade = pow(vertFade, 1.5); // accelerated falloff

                  // Subtle iridescent liquid water tint
                  float shimmer = sin(vWorldPosition.x * 15.0 + uTime * 2.5) * 0.5 + 0.5;
                  vec3 waterSheen = mix(vec3(0.9, 0.82, 1.0), vec3(0.65, 0.92, 1.0), shimmer * 0.4);
                  gl_FragColor.rgb *= waterSheen;

                  // 20% reflection opacity multiplied by vertical gradient fade
                  gl_FragColor.a = 0.20 * vertFade;
                  `
                );
              };
              return refMat;
            });
            child.material = Array.isArray(child.material) ? refMats : refMats[0];
          }
        });

        const reflectionGroup = new THREE.Group();
        reflectionGroup.add(reflectionModel);
        // Squashed vertically to 58% height, 96% width
        reflectionGroup.scale.set(0.96, -0.58, 0.96);
        reflectionGroup.position.set(0, -0.55 - (0.18 - (-0.55)) * 0.58, 0);
        scene.add(reflectionGroup);
        reflectionGroupRef.current = reflectionGroup;

        // ---------------------------------------------------------------------
        // Soft Elliptical Contact Shadow on Floor Plane
        // ---------------------------------------------------------------------
        const shadowCanvas = document.createElement('canvas');
        shadowCanvas.width = 256;
        shadowCanvas.height = 256;
        const sCtx = shadowCanvas.getContext('2d');
        if (sCtx) {
          const grad = sCtx.createRadialGradient(128, 128, 8, 128, 128, 120);
          grad.addColorStop(0, 'rgba(24, 6, 46, 0.72)');
          grad.addColorStop(0.35, 'rgba(44, 12, 76, 0.42)');
          grad.addColorStop(0.70, 'rgba(75, 22, 110, 0.14)');
          grad.addColorStop(1.0, 'rgba(0, 0, 0, 0.0)');
          sCtx.fillStyle = grad;
          sCtx.fillRect(0, 0, 256, 256);
        }
        const shadowTex = new THREE.CanvasTexture(shadowCanvas);
        const shadowGeo = new THREE.PlaneGeometry(2.0, 0.95);
        shadowGeo.rotateX(-Math.PI / 2);
        const shadowMat = new THREE.MeshBasicMaterial({
          map: shadowTex,
          transparent: true,
          opacity: 0.48,
          depthWrite: false,
        });
        const contactShadow = new THREE.Mesh(shadowGeo, shadowMat);
        contactShadow.position.set(0, -0.55 + 0.003, 0);
        scene.add(contactShadow);
        contactShadowRef.current = contactShadow;

        setLoadProgress(100);
        setTimeout(() => setLoading(false), 150);
      },
      (xhr) => {
        if (xhr.total > 0) {
          const p = Math.floor((xhr.loaded / xhr.total) * 95);
          setLoadProgress(p);
        }
      },
      (error) => {
        console.error('Error loading GLB:', error);
        setLoading(false);
      }
    );

    return () => {
      if (mainGroupRef.current && scene) scene.remove(mainGroupRef.current);
      if (reflectionGroupRef.current && scene) scene.remove(reflectionGroupRef.current);
      if (contactShadowRef.current && scene) scene.remove(contactShadowRef.current);
    };
  }, [product?.modelUrl]);

  return (
    <div
      style={{
        position: 'relative',
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        cursor: 'default',
        touchAction: 'none',
      }}
    >
      {/* Three.js Canvas */}
      <div
        ref={containerRef}
        style={{
          width: '100%',
          height: '100%',
          position: 'absolute',
          inset: 0,
        }}
      />

      {/* Minimal Loading Bar */}
      {loading && (
        <div
          style={{
            position: 'absolute',
            bottom: '36px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 10,
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '8px 18px',
            borderRadius: '999px',
            background: 'rgba(15, 3, 30, 0.7)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            fontSize: '0.8rem',
            fontWeight: 700,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: 'var(--c-silver)',
            pointerEvents: 'none',
          }}
        >
          <span>Iridescent Puffer {loadProgress}%</span>
          <div
            style={{
              width: '60px',
              height: '3px',
              background: 'rgba(255,255,255,0.15)',
              borderRadius: '999px',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                width: `${loadProgress}%`,
                height: '100%',
                background: 'linear-gradient(90deg, #00D9FF, #FF4FD8)',
                borderRadius: '999px',
                transition: 'width 0.2s ease',
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
