'use client';

import React from 'react';
import { Sparkles, Shield, Wind, Droplets, Zap } from 'lucide-react';

export default function SpecsSection() {
  const craftFeatures = [
    {
      title: 'Signature Star Zipper',
      subtitle: 'Cold-touch alloy slider with star indent',
      img: '/assets/mascot/details/star-zipper.png',
      desc: 'Engineered for smooth glide with gloved hands. Each star pull is precision-milled from aerospace-grade recycled aluminum.',
    },
    {
      title: 'Iridescent Nano-Shell',
      subtitle: 'Light-responsive prismatic glaze',
      img: '/assets/mascot/details/material-swatch.png',
      desc: 'Bends ambient lighting into pearlescent gradients. Completely windproof and treated with a water-repellent eco-finish.',
    },
    {
      title: 'Soft Ribbed Cuffs',
      subtitle: 'Zero-draft thermal wrist seal',
      img: '/assets/mascot/details/ribbed-cuffs.png',
      desc: 'Ultra-soft micro-knit cuffs lock in warmth while ensuring seamless wrist freedom. Tested in -25°C alpine conditions.',
    },
  ];

  return (
    <section
      id="specs-section"
      style={{
        position: 'relative',
        padding: '120px 24px',
        maxWidth: '1280px',
        margin: '0 auto',
        zIndex: 10,
      }}
    >
      <div style={{ textAlign: 'center', marginBottom: '70px' }}>
        <div className="plushy-badge" style={{ marginBottom: '16px' }}>
          <Zap size={14} color="#00D9FF" />
          Engineered Outerwear
        </div>
        <h2
          className="font-editorial"
          style={{
            fontSize: 'clamp(2.5rem, 5vw, 4rem)',
            fontWeight: 800,
            lineHeight: 1.1,
            marginBottom: '16px',
          }}
        >
          Crafted For <span className="gradient-text-iridescent">Extreme Dreams</span>
        </h2>
        <p
          style={{
            fontSize: '1.2rem',
            color: 'var(--c-lilac)',
            maxWidth: '620px',
            margin: '0 auto',
          }}
        >
          Where dreamlike squish meets alpine engineering. Every seam, baffle, and zipper is obsessed over.
        </p>
      </div>

      {/* 3 Detail Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '32px',
          marginBottom: '60px',
        }}
      >
        {craftFeatures.map((feat, i) => (
          <div
            key={i}
            className="glass-panel"
            style={{
              padding: '36px',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
              transition: 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), border-color 0.4s ease',
            }}
          >
            {/* Image Preview */}
            <div
              style={{
                width: '100%',
                height: '220px',
                borderRadius: '20px',
                overflow: 'hidden',
                background: 'rgba(20, 6, 40, 0.8)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={feat.img}
                alt={feat.title}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  transition: 'transform 0.6s ease',
                }}
              />
            </div>

            <div>
              <div style={{ fontSize: '0.85rem', color: 'var(--c-blue)', fontWeight: 700, letterSpacing: '0.04em' }}>
                {feat.subtitle}
              </div>
              <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginTop: '4px', marginBottom: '10px' }}>
                {feat.title}
              </h3>
              <p style={{ fontSize: '0.95rem', color: 'var(--c-lilac)', lineHeight: 1.6 }}>
                {feat.desc}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Tech Spec Strip */}
      <div
        className="glass-panel"
        style={{
          padding: '36px 48px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '32px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ background: 'rgba(181, 124, 255, 0.15)', padding: '14px', borderRadius: '16px' }}>
            <Wind size={26} color="#B57CFF" />
          </div>
          <div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800 }}>-25°C</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--c-silver)' }}>Sub-Zero Squish Warmth</div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ background: 'rgba(0, 217, 255, 0.15)', padding: '14px', borderRadius: '16px' }}>
            <Droplets size={26} color="#00D9FF" />
          </div>
          <div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800 }}>20,000mm</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--c-silver)' }}>Waterproof Nano-Glaze</div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ background: 'rgba(255, 79, 216, 0.15)', padding: '14px', borderRadius: '16px' }}>
            <Shield size={26} color="#FF4FD8" />
          </div>
          <div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800 }}>900 Fill</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--c-silver)' }}>Recycled Cloud-Loft Down</div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ background: 'rgba(247, 249, 255, 0.15)', padding: '14px', borderRadius: '16px' }}>
            <Sparkles size={26} color="#F7F9FF" />
          </div>
          <div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800 }}>360° Reflect</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--c-silver)' }}>Prismatic Holographic Glow</div>
          </div>
        </div>
      </div>
    </section>
  );
}
