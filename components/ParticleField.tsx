'use client';

import React, { useEffect, useState } from 'react';

interface Particle {
  id: number;
  type: 'bubble' | 'sparkle' | 'droplet' | 'shape';
  src: string;
  x: number; // percentage
  y: number; // percentage
  size: number; // px
  speedY: number;
  speedX: number;
  rotSpeed: number;
  opacity: number;
  scale: number;
}

export default function ParticleField() {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    // Curate high aesthetic sprites from cut assets
    const bubbleSprites = [
      '/assets/particles/bubbles/bubble-01.png',
      '/assets/particles/bubbles/bubble-03.png',
      '/assets/particles/bubbles/bubble-07.png',
      '/assets/particles/bubbles/bubble-14.png',
      '/assets/particles/bubbles/bubble-16.png',
    ];

    const sparkleSprites = [
      '/assets/particles/sparkles/sparkle-01.png',
      '/assets/particles/sparkles/sparkle-04.png',
      '/assets/particles/sparkles/sparkle-08.png',
      '/assets/particles/sparkles/sparkle-12.png',
      '/assets/particles/sparkles/sparkle-18.png',
    ];

    const dropletSprites = [
      '/assets/particles/chrome-droplets/droplet-02.png',
      '/assets/particles/chrome-droplets/droplet-05.png',
      '/assets/particles/chrome-droplets/droplet-10.png',
    ];

    const shapeSprites = [
      '/assets/particles/puffer-shapes/shape-01.png',
      '/assets/particles/puffer-shapes/shape-02.png',
      '/assets/particles/puffer-shapes/shape-04.png',
    ];

    const created: Particle[] = [];

    // Add 6 floating bubbles
    for (let i = 0; i < 6; i++) {
      created.push({
        id: created.length,
        type: 'bubble',
        src: bubbleSprites[i % bubbleSprites.length],
        x: 5 + Math.random() * 90,
        y: 10 + Math.random() * 80,
        size: 70 + Math.random() * 110,
        speedY: 0.15 + Math.random() * 0.25,
        speedX: (Math.random() - 0.5) * 0.2,
        rotSpeed: (Math.random() - 0.5) * 0.3,
        opacity: 0.7 + Math.random() * 0.3,
        scale: 1,
      });
    }

    // Add 8 star sparkles
    for (let i = 0; i < 8; i++) {
      created.push({
        id: created.length,
        type: 'sparkle',
        src: sparkleSprites[i % sparkleSprites.length],
        x: 4 + Math.random() * 92,
        y: 8 + Math.random() * 85,
        size: 35 + Math.random() * 45,
        speedY: 0.1 + Math.random() * 0.2,
        speedX: (Math.random() - 0.5) * 0.15,
        rotSpeed: 0.5 + Math.random() * 1.2,
        opacity: 0.85,
        scale: 1,
      });
    }

    // Add 4 chrome droplets
    for (let i = 0; i < 4; i++) {
      created.push({
        id: created.length,
        type: 'droplet',
        src: dropletSprites[i % dropletSprites.length],
        x: 10 + Math.random() * 80,
        y: 15 + Math.random() * 70,
        size: 50 + Math.random() * 50,
        speedY: 0.2 + Math.random() * 0.2,
        speedX: (Math.random() - 0.5) * 0.2,
        rotSpeed: (Math.random() - 0.5) * 0.4,
        opacity: 0.8,
        scale: 1,
      });
    }

    // Add 3 puffer shapes
    for (let i = 0; i < 3; i++) {
      created.push({
        id: created.length,
        type: 'shape',
        src: shapeSprites[i % shapeSprites.length],
        x: 8 + Math.random() * 84,
        y: 20 + Math.random() * 60,
        size: 80 + Math.random() * 60,
        speedY: 0.12 + Math.random() * 0.18,
        speedX: (Math.random() - 0.5) * 0.15,
        rotSpeed: (Math.random() - 0.5) * 0.2,
        opacity: 0.75,
        scale: 1,
      });
    }

    setParticles(created);
  }, []);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        overflow: 'hidden',
        zIndex: 4,
      }}
    >
      {particles.map((p) => (
        <div
          key={p.id}
          className="anim-float-slow"
          style={{
            position: 'absolute',
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            opacity: p.opacity,
            animationDuration: `${5 + (p.id % 4) * 2}s`,
            animationDelay: `${(p.id % 3) * 1.5}s`,
            transform: 'translate(-50%, -50%)',
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={p.src}
            alt="Particle"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              filter: p.type === 'sparkle' ? 'drop-shadow(0 0 15px rgba(255, 79, 216, 0.8))' : 'drop-shadow(0 10px 20px rgba(0,0,0,0.3))',
            }}
          />
        </div>
      ))}
    </div>
  );
}
