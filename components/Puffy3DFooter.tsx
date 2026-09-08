'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { ArrowRight, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function Puffy3DFooter() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [isInteracting, setIsInteracting] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubscribed(true);
    confetti({
      particleCount: 75,
      spread: 80,
      origin: { y: 0.85 },
      colors: ['#00F5FF', '#FF3CDB', '#B57CFF', '#FFFFFF'],
    });
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Scene setup
    const scene = new THREE.Scene();

    const w = container.clientWidth || window.innerWidth;
    const h = container.clientHeight || 420;

    const camera = new THREE.PerspectiveCamera(40, w / h, 0.1, 100);
    camera.position.set(0, 0, 5.0);

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.68; // High-brilliance awards-level exposure
    container.appendChild(renderer.domElement);

    // =========================================================================
    // PROCEDURAL IRIDESCENT STUDIO ENVIRONMENT MAP (High-Specular Reflections)
    // =========================================================================
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    pmremGenerator.compileEquirectangularShader();

    const envCanvas = document.createElement('canvas');
    envCanvas.width = 1024;
    envCanvas.height = 512;
    const ctx = envCanvas.getContext('2d');
    let envMap: THREE.Texture | null = null;
    if (ctx) {
      // Midnight violet gradient ground
      const bgGrad = ctx.createLinearGradient(0, 0, 0, 512);
      bgGrad.addColorStop(0, '#38165c');
      bgGrad.addColorStop(0.35, '#190633');
      bgGrad.addColorStop(0.7, '#0c0218');
      bgGrad.addColorStop(1, '#250843');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, 1024, 512);

      // Left High-Intensity Electric Cyan Softbox
      const cyanSoftbox = ctx.createRadialGradient(220, 256, 15, 220, 256, 260);
      cyanSoftbox.addColorStop(0, 'rgba(0, 245, 255, 1.0)');
      cyanSoftbox.addColorStop(0.45, 'rgba(0, 210, 255, 0.7)');
      cyanSoftbox.addColorStop(1, 'transparent');
      ctx.fillStyle = cyanSoftbox;
      ctx.fillRect(0, 0, 512, 512);

      // Right High-Intensity Neon Magenta Softbox
      const magentaSoftbox = ctx.createRadialGradient(800, 256, 15, 800, 256, 260);
      magentaSoftbox.addColorStop(0, 'rgba(255, 79, 216, 1.0)');
      magentaSoftbox.addColorStop(0.45, 'rgba(230, 50, 190, 0.7)');
      magentaSoftbox.addColorStop(1, 'transparent');
      ctx.fillStyle = magentaSoftbox;
      ctx.fillRect(512, 0, 512, 512);

      // Center-Top Pure Key White Softbox
      const whiteSoftbox = ctx.createRadialGradient(512, 100, 10, 512, 100, 220);
      whiteSoftbox.addColorStop(0, 'rgba(255, 255, 255, 1.0)');
      whiteSoftbox.addColorStop(0.35, 'rgba(255, 255, 255, 0.85)');
      whiteSoftbox.addColorStop(1, 'transparent');
      ctx.fillStyle = whiteSoftbox;
      ctx.fillRect(256, 0, 512, 260);

      // Front Soft Violet Fill
      const frontSoftbox = ctx.createRadialGradient(512, 380, 10, 512, 380, 220);
      frontSoftbox.addColorStop(0, 'rgba(230, 210, 255, 0.9)');
      frontSoftbox.addColorStop(0.5, 'rgba(180, 130, 255, 0.45)');
      frontSoftbox.addColorStop(1, 'transparent');
      ctx.fillStyle = frontSoftbox;
      ctx.fillRect(256, 256, 512, 256);

      const envTexture = new THREE.CanvasTexture(envCanvas);
      envTexture.mapping = THREE.EquirectangularReflectionMapping;
      envMap = pmremGenerator.fromEquirectangular(envTexture).texture;
      scene.environment = envMap;
      pmremGenerator.dispose();
      envTexture.dispose();
    }

    // =========================================================================
    // LIGHTING: Radiant, High-Luminance Multi-Directional Studio Rig
    // =========================================================================
    const ambientLight = new THREE.AmbientLight(0x522880, 2.4);
    scene.add(ambientLight);

    // Front high-power key light aiming directly at the puffy letters
    const frontLight = new THREE.DirectionalLight(0xffffff, 4.5);
    frontLight.position.set(0, 2.5, 5.0);
    scene.add(frontLight);

    // Overhead luminous studio soft light
    const topLight = new THREE.DirectionalLight(0xf1f5f9, 3.0);
    topLight.position.set(0, 7.0, 2.5);
    scene.add(topLight);

    // Left electric cyan softbox light
    const fillCyan = new THREE.DirectionalLight(0x00f5ff, 3.6);
    fillCyan.position.set(-6.0, 1.0, 3.5);
    scene.add(fillCyan);

    // Right neon magenta softbox light
    const rimMagenta = new THREE.DirectionalLight(0xff2ebd, 3.6);
    rimMagenta.position.set(6.0, 1.0, 3.5);
    scene.add(rimMagenta);

    // Sub-floor upward purple bounce
    const underGlow = new THREE.DirectionalLight(0x8b5cf6, 2.0);
    underGlow.position.set(0, -4.0, 2.0);
    scene.add(underGlow);

    // Dynamic pointer cursor light glinting across curves
    const cursorLight = new THREE.PointLight(0xffffff, 4.5, 14);
    cursorLight.position.set(0, 0, 2.8);
    scene.add(cursorLight);

    // =========================================================================
    // 3D PUFFY LETTERS: Displaced Volumetric Iridescent Physical Mesh
    // =========================================================================
    const textureLoader = new THREE.TextureLoader();

    const diffuseMap = textureLoader.load('/assets/brand/puffy-logo-iridescent.png');
    diffuseMap.colorSpace = THREE.SRGBColorSpace;
    diffuseMap.generateMipmaps = true;

    const normalMap = textureLoader.load('/assets/brand/puffy-normal.png');
    const heightMap = textureLoader.load('/assets/brand/puffy-heightmap.png');

    // Aspect ratio of logo image (1433 / 535 ≈ 2.68)
    const logoAspect = 1433 / 535;
    const meshHeight = 2.4;
    const meshWidth = meshHeight * logoAspect;

    const letterGeometry = new THREE.PlaneGeometry(meshWidth, meshHeight, 256, 128);

    const letterMaterial = new THREE.MeshPhysicalMaterial({
      map: diffuseMap,
      displacementMap: heightMap,
      displacementScale: 0.48,
      displacementBias: -0.05,
      normalMap: normalMap,
      normalScale: new THREE.Vector2(1.45, 1.45),
      roughness: 0.10, // Sleek, glossy, specular
      metalness: 0.38, // Keeps diffuse iridescent colors bright and vivid
      clearcoat: 1.0,
      clearcoatRoughness: 0.03,
      transmission: 0.05,
      iridescence: 1.0,
      iridescenceIOR: 1.65,
      iridescenceThicknessRange: [150, 800],
      emissive: new THREE.Color(0x351254), // Luminous inner ambient radiance
      emissiveIntensity: 0.40,
      transparent: true,
      alphaTest: 0.05,
      side: THREE.DoubleSide,
    });

    const letterMesh = new THREE.Mesh(letterGeometry, letterMaterial);
    letterMesh.castShadow = true;

    const lettersGroup = new THREE.Group();
    lettersGroup.add(letterMesh);
    scene.add(lettersGroup);

    // Mirrored reflection beneath floor
    const reflectionMaterial = new THREE.MeshPhysicalMaterial({
      map: diffuseMap,
      displacementMap: heightMap,
      displacementScale: 0.30,
      roughness: 0.25,
      metalness: 0.35,
      clearcoat: 0.8,
      emissive: new THREE.Color(0x220c38),
      emissiveIntensity: 0.30,
      transparent: true,
      opacity: 0.25,
      alphaTest: 0.05,
      side: THREE.DoubleSide,
    });
    const reflectionMesh = new THREE.Mesh(letterGeometry, reflectionMaterial);
    reflectionMesh.position.y = -1.55;
    reflectionMesh.scale.set(1.0, -0.55, 1.0);
    reflectionMesh.rotation.x = Math.PI;
    scene.add(reflectionMesh);

    // Floor Contact Shadow Disc
    const shadowCanvas = document.createElement('canvas');
    shadowCanvas.width = 512;
    shadowCanvas.height = 128;
    const sCtx = shadowCanvas.getContext('2d');
    if (sCtx) {
      const grad = sCtx.createRadialGradient(256, 64, 10, 256, 64, 250);
      grad.addColorStop(0, 'rgba(0, 0, 0, 0.50)');
      grad.addColorStop(0.5, 'rgba(12, 2, 24, 0.25)');
      grad.addColorStop(1, 'transparent');
      sCtx.fillStyle = grad;
      sCtx.fillRect(0, 0, 512, 128);
    }
    const shadowTex = new THREE.CanvasTexture(shadowCanvas);
    const shadowGeo = new THREE.PlaneGeometry(meshWidth * 1.08, 1.8);
    const shadowMat = new THREE.MeshBasicMaterial({
      map: shadowTex,
      transparent: true,
      opacity: 0.55,
      depthWrite: false,
    });
    const floorShadow = new THREE.Mesh(shadowGeo, shadowMat);
    floorShadow.rotation.x = -Math.PI / 2;
    floorShadow.position.set(0, -1.25, 0);
    scene.add(floorShadow);

    // =========================================================================
    // PHYSICS & INTERACTION STATE (Silent: No squish sound!)
    // =========================================================================
    let mouseX = 0;
    let mouseY = 0;
    let isDragging = false;
    let dragStartX = 0;
    let dragStartY = 0;
    let dragRotX = 0;
    let dragRotY = 0;

    // Squish spring physics
    let squishScaleX = 1.0;
    let squishScaleY = 1.0;
    let squishVelX = 0.0;
    let squishVelY = 0.0;

    const onPointerMove = (e: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const ny = -(((e.clientY - rect.top) / rect.height) * 2 - 1);

      mouseX = nx;
      mouseY = ny;

      // Position interactive glint light
      cursorLight.position.x = nx * 3.5;
      cursorLight.position.y = ny * 2.0;

      if (isDragging) {
        const deltaX = (e.clientX - dragStartX) * 0.008;
        const deltaY = (e.clientY - dragStartY) * 0.008;
        dragRotY += deltaX;
        dragRotX += deltaY;
        dragStartX = e.clientX;
        dragStartY = e.clientY;
      }
    };

    const onPointerDown = (e: PointerEvent) => {
      isDragging = true;
      setIsInteracting(true);
      dragStartX = e.clientX;
      dragStartY = e.clientY;

      // Silent squish impulse (sound removed as requested!)
      squishVelY = -0.32;
      squishVelX = 0.28;
    };

    const onPointerUp = () => {
      isDragging = false;
      setIsInteracting(false);
    };

    container.addEventListener('pointermove', onPointerMove);
    container.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointerup', onPointerUp);

    // =========================================================================
    // ANIMATION LOOP
    // =========================================================================
    let animationId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationId = requestAnimationFrame(animate);
      const delta = Math.min(clock.getDelta(), 0.05);
      const time = clock.getElapsedTime();

      // Breathing levitation bobbing
      const currentScaleY = lettersGroup.scale.y || 1.0;
      const bobY = Math.sin(time * 1.8) * (0.05 * currentScaleY);
      lettersGroup.position.y = bobY;
      reflectionMesh.position.y = -1.55 * currentScaleY - bobY * 0.4;
      floorShadow.scale.set(
        currentScaleY * (1.0 + bobY * 0.15),
        currentScaleY * (1.0 + bobY * 0.15),
        currentScaleY * (1.0 + bobY * 0.15)
      );

      // Squish spring harmonic oscillator
      const k = 140; // stiffness
      const d = 10;  // damping
      const forceY = -k * (squishScaleY - 1.0) - d * squishVelY;
      const forceX = -k * (squishScaleX - 1.0) - d * squishVelX;

      squishVelY += forceY * delta;
      squishVelX += forceX * delta;
      squishScaleY += squishVelY * delta;
      squishScaleX += squishVelX * delta;

      // Target rotation from mouse & dragging
      let targetRotY = mouseX * 0.32 + dragRotY;
      let targetRotX = -mouseY * 0.22 + dragRotX;

      // Decay drag back to forward posture over time
      if (!isDragging) {
        dragRotX = THREE.MathUtils.lerp(dragRotX, 0, 0.04);
        dragRotY = THREE.MathUtils.lerp(dragRotY, 0, 0.04);
      }

      lettersGroup.rotation.y = THREE.MathUtils.lerp(lettersGroup.rotation.y, targetRotY, 0.1);
      lettersGroup.rotation.x = THREE.MathUtils.lerp(lettersGroup.rotation.x, targetRotX, 0.1);

      // Apply squish scale
      letterMesh.scale.set(squishScaleX, squishScaleY, 1.0);

      // Sync reflection rotation
      reflectionMesh.rotation.y = -lettersGroup.rotation.y;
      reflectionMesh.rotation.z = -lettersGroup.rotation.x * 0.5;

      // Shift dynamic point light color
      const lightHue = (time * 0.15) % 1.0;
      cursorLight.color.setHSL(lightHue, 1.0, 0.70);

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!container) return;
      const newW = container.clientWidth;
      const newH = container.clientHeight;
      camera.aspect = newW / newH;

      // Span the 3D logo across the entire bottom width of the screen
      const vHeight = 2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * camera.position.z;
      const vWidth = vHeight * camera.aspect;

      // Logo fills ~92% of the viewport width across the bottom
      const desiredWidth = vWidth * 0.92;
      const fitScale = Math.min(desiredWidth / meshWidth, (vHeight * 0.85) / meshHeight);

      lettersGroup.scale.set(fitScale, fitScale, fitScale);
      reflectionMesh.scale.set(fitScale, -fitScale * 0.55, fitScale);
      reflectionMesh.position.y = -1.55 * fitScale;
      floorShadow.scale.set(fitScale, fitScale, fitScale);
      floorShadow.position.set(0, -1.25 * fitScale, 0);

      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => {
      cancelAnimationFrame(animationId);
      container.removeEventListener('pointermove', onPointerMove);
      container.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('resize', handleResize);
      if (envMap) envMap.dispose();
      renderer.dispose();
      letterGeometry.dispose();
      letterMaterial.dispose();
      reflectionMaterial.dispose();
      shadowGeo.dispose();
      shadowMat.dispose();
      diffuseMap.dispose();
      normalMap.dispose();
      heightMap.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <footer
      style={{
        position: 'relative',
        background: 'linear-gradient(180deg, #ffffff 0%, #07010f 22%, #020005 100%)',
        padding: '90px 0 0',
        overflow: 'hidden',
        zIndex: 10,
        color: '#ffffff',
      }}
    >
      {/* Top Iridescent Celestial Aura */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          width: '85vw',
          height: '280px',
          background:
            'radial-gradient(ellipse at center, rgba(181, 124, 255, 0.22) 0%, rgba(0, 245, 255, 0.12) 40%, transparent 70%)',
          filter: 'blur(70px)',
          pointerEvents: 'none',
        }}
      />

      {/* Behind 3D Logo High-Luminance Atmospheric Glow */}
      <div
        style={{
          position: 'absolute',
          bottom: '120px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '95vw',
          height: '380px',
          background:
            'radial-gradient(ellipse at center, rgba(168, 85, 247, 0.26) 0%, rgba(0, 245, 255, 0.16) 35%, rgba(255, 60, 220, 0.10) 65%, transparent 80%)',
          filter: 'blur(80px)',
          pointerEvents: 'none',
        }}
      />

      {/* Top Editorial & Directory Content (Centered Container) */}
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 28px', position: 'relative', zIndex: 2 }}>
        {/* Top Header Badge */}
        <div style={{ textAlign: 'center', marginBottom: '22px' }}>
          <div
            className="plushy-badge"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '9px',
              padding: '6px 18px',
              borderRadius: '999px',
              background: 'rgba(255, 255, 255, 0.05)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.14)',
              fontSize: '0.72rem',
              fontWeight: 800,
              letterSpacing: '0.20em',
              textTransform: 'uppercase',
              color: '#00f5ff',
              boxShadow: '0 0 20px rgba(0, 245, 255, 0.15)',
            }}
          >
            <span
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                backgroundColor: '#00f5ff',
                boxShadow: '0 0 10px #00f5ff',
              }}
            />
            <Sparkles size={13} color="#00F5FF" />
            PLUSHY LABS // 2026 ARCHIVE
          </div>
        </div>

        {/* Big Editorial Slogan & VIP Drop Box */}
        <div style={{ textAlign: 'center', maxWidth: '680px', margin: '0 auto 64px' }}>
          <h2
            style={{
              fontSize: 'clamp(2.4rem, 5.2vw, 4.2rem)',
              fontWeight: 900,
              lineHeight: 1.08,
              letterSpacing: '-0.035em',
              margin: '0 0 18px',
              background: 'linear-gradient(135deg, #ffffff 25%, #d8b4fe 65%, #67e8f9 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Wear A Brighter World
          </h2>
          <p
            style={{
              fontSize: '1.08rem',
              color: 'rgba(255, 255, 255, 0.68)',
              lineHeight: 1.65,
              maxWidth: '560px',
              margin: '0 auto 34px',
              fontWeight: 400,
            }}
          >
            Engineered with 900-fill recycled cloud down and liquid iridescent sheen.
            Bigger feelings. Zero gravity.
          </p>

          {/* Luxury Newsletter Capsule */}
          <form
            onSubmit={handleSubscribe}
            style={{
              display: 'flex',
              alignItems: 'center',
              maxWidth: '480px',
              margin: '0 auto',
              background: 'rgba(255, 255, 255, 0.05)',
              backdropFilter: 'blur(30px)',
              WebkitBackdropFilter: 'blur(30px)',
              borderRadius: '999px',
              padding: '6px 6px 6px 20px',
              border: '1px solid rgba(255, 255, 255, 0.14)',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6), inset 0 1px 1px rgba(255, 255, 255, 0.15)',
            }}
          >
            <input
              type="email"
              placeholder={subscribed ? '✨ You are on the VIP Cloud List!' : 'Enter email for first access'}
              disabled={subscribed}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                flex: 1,
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: '#ffffff',
                fontSize: '0.92rem',
                fontWeight: 500,
              }}
            />
            <button
              type="submit"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '11px 24px',
                borderRadius: '999px',
                background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)',
                color: '#ffffff',
                border: 'none',
                fontWeight: 800,
                fontSize: '0.86rem',
                letterSpacing: '0.04em',
                cursor: 'pointer',
                boxShadow: '0 4px 20px rgba(168, 85, 247, 0.45)',
                transition: 'transform 0.15s ease, box-shadow 0.15s ease',
              }}
            >
              <span>{subscribed ? 'Joined!' : 'Join Drop'}</span>
              <ArrowRight size={15} />
            </button>
          </form>
        </div>

        {/* 4-Column Directory Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
            gap: '36px',
            paddingTop: '45px',
            borderTop: '1px solid rgba(255, 255, 255, 0.09)',
            marginBottom: '40px',
          }}
        >
          {/* Col 1: Brand Manifesto */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/assets/brand/puffy-logo-iridescent.png" alt="Puffy Logo" style={{ height: '34px' }} />
            </div>
            <p style={{ fontSize: '0.84rem', color: 'rgba(255, 255, 255, 0.52)', lineHeight: 1.65 }}>
              The future of puffer outerwear. Engineered with zero-gravity ergonomics and dream-grade iridescent reflection.
            </p>
          </div>

          {/* Col 2: Chroma Spectrum */}
          <div>
            <div
              style={{
                fontSize: '0.74rem',
                fontWeight: 800,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                marginBottom: '16px',
                color: '#00f5ff',
              }}
            >
              01 // SPECTRUM
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '11px', fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.62)' }}>
              <span style={{ transition: 'color 0.2s', cursor: 'pointer' }}>Edition 01 — Lumi Purple</span>
              <span style={{ transition: 'color 0.2s', cursor: 'pointer' }}>Edition 02 — Moonbeam Silver</span>
              <span style={{ transition: 'color 0.2s', cursor: 'pointer' }}>Edition 03 — Bubblegum Pink</span>
              <span style={{ transition: 'color 0.2s', cursor: 'pointer' }}>Edition 04 — Aurora Cyan</span>
            </div>
          </div>

          {/* Col 3: Innovation */}
          <div>
            <div
              style={{
                fontSize: '0.74rem',
                fontWeight: 800,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                marginBottom: '16px',
                color: '#ff4fd8',
              }}
            >
              02 // TECHNOLOGY
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '11px', fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.62)' }}>
              <span>900 Fill Recycled Down</span>
              <span>Iridescent Hydro-Ripstop</span>
              <span>Sub-Zero Ergonomic Core</span>
              <span>Real-Time WebGL Physics</span>
            </div>
          </div>

          {/* Col 4: Sustainability */}
          <div>
            <div
              style={{
                fontSize: '0.74rem',
                fontWeight: 800,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                marginBottom: '16px',
                color: '#b57cff',
              }}
            >
              03 // SUSTAINABILITY
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '11px', fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.62)' }}>
              <span>100% Recycled Shell</span>
              <span>Carbon-Neutral Delivery</span>
              <span>Closed-Loop Initiative</span>
              <span>Lifetime Cloud Repair</span>
            </div>
          </div>
        </div>
      </div>

      {/* ----------------------------------------------------------------- */}
      {/* MONUMENTAL 3D PUFFY LOGO STAGE ACROSS ENTIRE BOTTOM               */}
      {/* ----------------------------------------------------------------- */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          overflow: 'hidden',
        }}
      >
        {/* Full-width 3D Canvas across the entire bottom */}
        <div
          ref={containerRef}
          style={{
            position: 'relative',
            width: '100%',
            height: 'min(440px, 52vh)',
            cursor: isInteracting ? 'grabbing' : 'grab',
            touchAction: 'none',
            userSelect: 'none',
          }}
          title="3D Puffy Letters"
        />

        {/* Bottom Bar Overlaid Directly Across the Bottom of the 3D Puffy Logo */}
        <div
          style={{
            position: 'absolute',
            bottom: '22px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: 'calc(100% - 48px)',
            maxWidth: '1240px',
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '16px',
            padding: '14px 28px',
            borderRadius: '16px',
            background: 'rgba(3, 0, 8, 0.72)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            border: '1px solid rgba(255, 255, 255, 0.09)',
            fontSize: '0.78rem',
            color: 'rgba(255, 255, 255, 0.48)',
            zIndex: 5,
            pointerEvents: 'auto',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                backgroundColor: '#10b981',
                boxShadow: '0 0 8px #10b981',
              }}
            />
            <span>© 2026 PUFFY & PLUSHY APPAREL CORP. ALL RIGHTS RESERVED.</span>
          </div>

          <div style={{ display: 'flex', gap: '26px' }}>
            <span style={{ cursor: 'pointer', transition: 'color 0.2s' }}>Privacy Policy</span>
            <span style={{ cursor: 'pointer', transition: 'color 0.2s' }}>Terms of Service</span>
            <span style={{ cursor: 'pointer', transition: 'color 0.2s' }}>WebGL 2.0 Studio</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
