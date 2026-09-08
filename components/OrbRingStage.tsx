'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ShoppingBag, Eye, ArrowRight, RotateCw, Check } from 'lucide-react';
import { PRODUCTS, Product } from '@/lib/products';

interface OrbRingStageProps {
  activeProduct: Product;
  onSelectProduct: (product: Product) => void;
  onAddToCart: (product: Product, size: string) => void;
  onWearIn3D: (product: Product) => void;
}

interface OrbData {
  product: Product;
  textureUrl: string;
  glowColor: string;
}

const ORB_CONFIGS: OrbData[] = [
  {
    product: PRODUCTS[0], // Lumi Purple
    textureUrl: '/assets/orbs/orb-purple-lumi.png',
    glowColor: '#B57CFF',
  },
  {
    product: PRODUCTS[1], // Moonbeam
    textureUrl: '/assets/orbs/orb-moonbeam.png',
    glowColor: '#E2E8F0',
  },
  {
    product: PRODUCTS[2], // Neon Bubblegum
    textureUrl: '/assets/orbs/orb-pink-bubblegum.png',
    glowColor: '#FF4FD8',
  },
  {
    product: PRODUCTS[3], // Electric Aurora
    textureUrl: '/assets/orbs/orb-blue-aurora.png',
    glowColor: '#00D9FF',
  },
];

export default function OrbRingStage({
  activeProduct,
  onSelectProduct,
  onAddToCart,
  onWearIn3D,
}: OrbRingStageProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number>(() => {
    const idx = ORB_CONFIGS.findIndex((o) => o.product.id === activeProduct.id);
    return idx >= 0 ? idx : 0;
  });
  const [selectedSize, setSelectedSize] = useState<string>('M');
  const [isAdded, setIsAdded] = useState(false);

  // Synchronize with external activeProduct changes
  useEffect(() => {
    const idx = ORB_CONFIGS.findIndex((o) => o.product.id === activeProduct.id);
    if (idx >= 0 && idx !== selectedIndex) {
      setSelectedIndex(idx);
    }
  }, [activeProduct.id]);

  // Three.js Scene References
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const orbsGroupRef = useRef<THREE.Group[]>([]);
  const shadowsRef = useRef<THREE.Mesh[]>([]);
  const orbitalAngleRef = useRef<number>(0);
  const targetOrbitalAngleRef = useRef<number>(0);
  const isDraggingRef = useRef<boolean>(false);
  const dragStartXRef = useRef<number>(0);
  const dragStartAngleRef = useRef<number>(0);
  const hoveredIndexRef = useRef<number | null>(null);

  hoveredIndexRef.current = hoveredIndex;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    // Scene on Pure Blank White Background
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xffffff);
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 1.2, 7.2);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // WebGL Renderer with High-Fidelity Color Output
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // High-Key Studio Lighting for Clean White Gallery
    const ambientLight = new THREE.AmbientLight(0xffffff, 2.4);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 2.2);
    keyLight.position.set(3, 8, 5);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xf0f4ff, 1.5);
    fillLight.position.set(-4, 4, 3);
    scene.add(fillLight);

    // Subtle Infinite White Ground Plane
    const groundGeo = new THREE.PlaneGeometry(30, 30);
    groundGeo.rotateX(-Math.PI / 2);
    const groundMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.position.y = -1.8;
    scene.add(ground);

    // Procedural Soft Shadow Texture on White Floor
    const shadowCanvas = document.createElement('canvas');
    shadowCanvas.width = 256;
    shadowCanvas.height = 256;
    const sCtx = shadowCanvas.getContext('2d');
    if (sCtx) {
      const grad = sCtx.createRadialGradient(128, 128, 10, 128, 128, 120);
      grad.addColorStop(0, 'rgba(0, 0, 0, 0.22)');
      grad.addColorStop(0.35, 'rgba(0, 0, 0, 0.10)');
      grad.addColorStop(0.70, 'rgba(0, 0, 0, 0.03)');
      grad.addColorStop(1.0, 'rgba(0, 0, 0, 0.0)');
      sCtx.fillStyle = grad;
      sCtx.fillRect(0, 0, 256, 256);
    }
    const shadowTexture = new THREE.CanvasTexture(shadowCanvas);

    // Create 4 3D Orbs (Infinity Stones)
    const textureLoader = new THREE.TextureLoader();
    const orbs: THREE.Group[] = [];
    const shadows: THREE.Mesh[] = [];

    ORB_CONFIGS.forEach((cfg, idx) => {
      const orbGroup = new THREE.Group();

      // 1. Inner Luminous Swirling Core
      const sphereGeo = new THREE.SphereGeometry(0.88, 64, 48);
      const orbTex = textureLoader.load(cfg.textureUrl);
      orbTex.colorSpace = THREE.SRGBColorSpace;

      const orbMat = new THREE.MeshStandardMaterial({
        map: orbTex,
        roughness: 0.12,
        metalness: 0.15,
        emissive: new THREE.Color(cfg.glowColor),
        emissiveIntensity: 0.18,
        emissiveMap: orbTex,
        transparent: true,
        opacity: 0.98,
      });
      const coreMesh = new THREE.Mesh(sphereGeo, orbMat);
      orbGroup.add(coreMesh);

      // 2. Outer Prismatic Glass Bubble Shell
      const glassGeo = new THREE.SphereGeometry(0.92, 48, 36);
      const glassMat = new THREE.MeshPhysicalMaterial({
        roughness: 0.04,
        transmission: 0.82,
        ior: 1.45,
        thickness: 0.4,
        transparent: true,
        opacity: 0.75,
        reflectivity: 0.9,
        clearcoat: 1.0,
        clearcoatRoughness: 0.05,
      });
      const glassMesh = new THREE.Mesh(glassGeo, glassMat);
      orbGroup.add(glassMesh);

      // Attach index to meshes for raycasting
      coreMesh.userData = { orbIndex: idx };
      glassMesh.userData = { orbIndex: idx };

      scene.add(orbGroup);
      orbs.push(orbGroup);

      // 3. Soft Floor Contact Shadow
      const shadowGeo = new THREE.PlaneGeometry(2.4, 2.4);
      shadowGeo.rotateX(-Math.PI / 2);
      const shadowMat = new THREE.MeshBasicMaterial({
        map: shadowTexture,
        transparent: true,
        opacity: 0.45,
        depthWrite: false,
      });
      const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
      shadowMesh.position.y = -1.78;
      scene.add(shadowMesh);
      shadows.push(shadowMesh);
    });

    orbsGroupRef.current = orbs;
    shadowsRef.current = shadows;

    // Orbital Mechanics & Physics
    const RING_RADIUS = 2.85;
    const RING_TILT = 0.24; // 14-degree viewing perspective
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameRef.current = requestAnimationFrame(animate);
      const delta = Math.min(clock.getDelta(), 0.035);
      const time = clock.getElapsedTime();

      // Auto-orbit speed (slows down smoothly if hovered or dragging)
      const isHovered = hoveredIndexRef.current !== null;
      const baseSpeed = isDraggingRef.current ? 0 : isHovered ? 0.08 : 0.28;
      targetOrbitalAngleRef.current += baseSpeed * delta;

      // Smooth angle interpolation
      orbitalAngleRef.current = THREE.MathUtils.lerp(
        orbitalAngleRef.current,
        targetOrbitalAngleRef.current,
        0.12
      );

      // Update Orbs & Shadows
      orbs.forEach((orb, i) => {
        const theta = orbitalAngleRef.current + (i * Math.PI) / 2;
        const x = RING_RADIUS * Math.cos(theta);
        const z = RING_RADIUS * Math.sin(theta) * Math.cos(RING_TILT);
        const y =
          -RING_RADIUS * Math.sin(theta) * Math.sin(RING_TILT) +
          Math.sin(time * 2.2 + i * 1.5) * 0.08;

        const isCurrentHovered = hoveredIndexRef.current === i;
        const targetScale = isCurrentHovered ? 1.15 : 1.0;
        const curScale = orb.scale.x;
        const newScale = THREE.MathUtils.lerp(curScale, targetScale, 0.15);
        orb.scale.set(newScale, newScale, newScale);

        // Elevation bump on hover
        const hoverLift = isCurrentHovered ? 0.22 : 0;
        orb.position.set(x, y + hoverLift, z);

        // Slowly spin orb texture for living liquid feel
        orb.rotation.y = time * 0.4 + i * 1.2;
        orb.rotation.x = Math.sin(time * 0.3 + i) * 0.15;

        // Shadow synchronization
        const shadow = shadows[i];
        if (shadow) {
          shadow.position.x = x;
          shadow.position.z = z;
          const distToFloor = y + hoverLift - -1.78;
          const sScale = THREE.MathUtils.clamp(1.0 + distToFloor * 0.18, 0.7, 1.4);
          shadow.scale.set(sScale, sScale, sScale);
          (shadow.material as THREE.MeshBasicMaterial).opacity =
            THREE.MathUtils.clamp(0.52 - distToFloor * 0.12, 0.12, 0.6);
        }
      });

      renderer.render(scene, camera);
    };
    animate();

    // Raycasting for Hover & Click
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const getIntersectedOrbIndex = (e: MouseEvent) => {
      if (!containerRef.current) return null;
      const rect = containerRef.current.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);

      const interactiveMeshes: THREE.Object3D[] = [];
      orbs.forEach((group) => {
        group.children.forEach((c) => interactiveMeshes.push(c));
      });

      const intersects = raycaster.intersectObjects(interactiveMeshes, false);
      if (intersects.length > 0) {
        return intersects[0].object.userData.orbIndex ?? null;
      }
      return null;
    };

    const onMouseMove = (e: MouseEvent) => {
      if (isDraggingRef.current) {
        const deltaX = e.clientX - dragStartXRef.current;
        targetOrbitalAngleRef.current = dragStartAngleRef.current + deltaX * 0.0065;
        return;
      }
      const idx = getIntersectedOrbIndex(e);
      setHoveredIndex(idx);
    };

    const onMouseDown = (e: MouseEvent) => {
      const idx = getIntersectedOrbIndex(e);
      if (idx !== null) {
        // Direct click on orb
        setSelectedIndex(idx);
        onSelectProduct(ORB_CONFIGS[idx].product);
        return;
      }
      // Start drag rotate
      isDraggingRef.current = true;
      dragStartXRef.current = e.clientX;
      dragStartAngleRef.current = targetOrbitalAngleRef.current;
    };

    const onMouseUp = () => {
      isDraggingRef.current = false;
    };

    const handleResize = () => {
      if (!containerRef.current || !rendererRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };

    const dom = renderer.domElement;
    dom.addEventListener('mousemove', onMouseMove);
    dom.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);
    window.addEventListener('resize', handleResize);

    return () => {
      dom.removeEventListener('mousemove', onMouseMove);
      dom.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('resize', handleResize);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      renderer.dispose();
      container.innerHTML = '';
    };
  }, []);

  const selectedOrb = ORB_CONFIGS[selectedIndex];

  const handleAddToCartClick = () => {
    onAddToCart(selectedOrb.product, selectedSize);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1400);
  };

  return (
    <section
      id="discovery-section"
      style={{
        position: 'relative',
        width: '100%',
        minHeight: '100vh',
        background: '#FFFFFF',
        color: '#0A0116',
        padding: '100px 24px 120px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
        overflow: 'hidden',
      }}
    >
      {/* Minimal Editorial Header */}
      <div style={{ textAlign: 'center', maxWidth: '780px', marginBottom: '24px', zIndex: 10 }}>
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 18px',
            borderRadius: '999px',
            background: 'rgba(10, 1, 22, 0.04)',
            border: '1px solid rgba(10, 1, 22, 0.08)',
            fontSize: '0.75rem',
            fontWeight: 700,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: '#6B7280',
            marginBottom: '16px',
          }}
        >
          <Sparkles size={13} color="#7C3AED" />
          <span>Orbital Archive / 04 Elemental Stones</span>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.1 }}
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(2.4rem, 5.2vw, 4.2rem)',
            fontWeight: 800,
            lineHeight: 1.08,
            letterSpacing: '-0.035em',
            color: '#0A0116',
            marginBottom: '16px',
          }}
        >
          The Four Infinity Stones of Down
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.2 }}
          style={{
            fontSize: '1.08rem',
            color: '#64748B',
            lineHeight: 1.6,
            maxWidth: '580px',
            margin: '0 auto',
          }}
        >
          Each revolving stone encapsulates one high-loft outerwear edition. Drag to rotate the orbital ring, or click any stone to inspect its form.
        </motion.p>
      </div>

      {/* 3D WebGL Orbital Ring Stage */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '1240px',
          height: '520px',
          cursor: isDraggingRef.current ? 'grabbing' : 'grab',
        }}
      >
        <div ref={containerRef} style={{ width: '100%', height: '100%' }} />

        {/* Minimal Instruction Tooltip */}
        <div
          style={{
            position: 'absolute',
            bottom: '12px',
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '0.74rem',
            fontWeight: 600,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: '#94A3B8',
            pointerEvents: 'none',
          }}
        >
          <RotateCw size={13} />
          <span>Drag to Spin • Click Any Orb to Select</span>
        </div>
      </div>

      {/* Selected Orb Minimal Product Inspector Card */}
      <div style={{ width: '100%', maxWidth: '780px', marginTop: '20px', zIndex: 10 }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedOrb.product.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            style={{
              background: '#FFFFFF',
              borderRadius: '28px',
              boxShadow: '0 25px 60px rgba(0, 0, 0, 0.07), 0 2px 10px rgba(0, 0, 0, 0.03)',
              border: '1px solid rgba(0, 0, 0, 0.06)',
              padding: '32px 36px',
              display: 'flex',
              flexDirection: 'column',
              gap: '24px',
            }}
          >
            {/* Top row: Name, Badge, Price */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '16px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <span
                  style={{
                    width: '18px',
                    height: '18px',
                    borderRadius: '50%',
                    background: selectedOrb.glowColor,
                    boxShadow: `0 0 16px ${selectedOrb.glowColor}`,
                  }}
                />
                <div>
                  <h3
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: '1.65rem',
                      fontWeight: 700,
                      color: '#0A0116',
                      lineHeight: 1.2,
                    }}
                  >
                    {selectedOrb.product.name}
                  </h3>
                  <p style={{ fontSize: '0.88rem', color: '#64748B', marginTop: '3px' }}>
                    {selectedOrb.product.tagline}
                  </p>
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.78rem', color: '#94A3B8', textTransform: 'uppercase' }}>
                  {selectedOrb.product.badge}
                </div>
                <div
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '1.8rem',
                    fontWeight: 800,
                    color: '#0A0116',
                  }}
                >
                  ${selectedOrb.product.price}
                </div>
              </div>
            </div>

            {/* Description & Specs Row */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '16px',
                padding: '16px 20px',
                background: 'rgba(0, 0, 0, 0.02)',
                borderRadius: '16px',
              }}
            >
              <div>
                <span style={{ fontSize: '0.74rem', color: '#94A3B8', textTransform: 'uppercase' }}>
                  Warmth Rating
                </span>
                <div style={{ fontSize: '0.92rem', fontWeight: 600, color: '#0A0116' }}>
                  {selectedOrb.product.specs.warmth}
                </div>
              </div>
              <div>
                <span style={{ fontSize: '0.74rem', color: '#94A3B8', textTransform: 'uppercase' }}>
                  Insulation Core
                </span>
                <div style={{ fontSize: '0.92rem', fontWeight: 600, color: '#0A0116' }}>
                  {selectedOrb.product.specs.insulation}
                </div>
              </div>
              <div>
                <span style={{ fontSize: '0.74rem', color: '#94A3B8', textTransform: 'uppercase' }}>
                  Shell Material
                </span>
                <div style={{ fontSize: '0.92rem', fontWeight: 600, color: '#0A0116' }}>
                  {selectedOrb.product.specs.shell}
                </div>
              </div>
            </div>

            {/* Sizes & Actions Row */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '20px',
                paddingTop: '8px',
              }}
            >
              {/* Size Selector */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>
                  Size:
                </span>
                <div style={{ display: 'flex', gap: '6px' }}>
                  {selectedOrb.product.sizes.map((sz) => {
                    const isSzActive = selectedSize === sz;
                    return (
                      <button
                        key={sz}
                        type="button"
                        onClick={() => setSelectedSize(sz)}
                        style={{
                          width: '38px',
                          height: '38px',
                          borderRadius: '10px',
                          background: isSzActive ? '#0A0116' : 'rgba(0,0,0,0.04)',
                          border: 'none',
                          color: isSzActive ? '#FFFFFF' : '#475569',
                          fontWeight: 700,
                          fontSize: '0.82rem',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                        }}
                      >
                        {sz}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '12px', flex: '1', maxWidth: '380px', minWidth: '280px' }}>
                {/* Wear in 3D Button */}
                <motion.button
                  type="button"
                  onClick={() => onWearIn3D(selectedOrb.product)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    padding: '12px 20px',
                    borderRadius: '14px',
                    background: '#0A0116',
                    color: '#FFFFFF',
                    fontWeight: 600,
                    fontSize: '0.88rem',
                    border: 'none',
                    cursor: 'pointer',
                    boxShadow: '0 8px 24px rgba(10, 1, 22, 0.15)',
                  }}
                >
                  <Eye size={16} />
                  <span>Wear Jacket in 3D</span>
                </motion.button>

                {/* Quick Add to Cart Button */}
                <motion.button
                  type="button"
                  onClick={handleAddToCartClick}
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.95 }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '48px',
                    height: '48px',
                    borderRadius: '14px',
                    background: isAdded ? '#22c55e' : selectedOrb.glowColor,
                    color: '#FFFFFF',
                    border: 'none',
                    cursor: 'pointer',
                    boxShadow: `0 8px 20px ${selectedOrb.glowColor}40`,
                    transition: 'background 0.25s ease',
                    flexShrink: 0,
                  }}
                >
                  {isAdded ? <Check size={20} strokeWidth={2.5} /> : <ShoppingBag size={20} />}
                </motion.button>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
