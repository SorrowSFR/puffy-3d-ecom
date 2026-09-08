'use client';

import React, { useState } from 'react';
import { ArrowRight, Sparkles, Heart, Globe } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubscribed(true);
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.8 },
      colors: ['#00D9FF', '#FF4FD8', '#B57CFF'],
    });
  };

  return (
    <footer
      style={{
        position: 'relative',
        background: 'linear-gradient(180deg, transparent 0%, #06010d 60%, #030008 100%)',
        borderTop: '1px solid rgba(255, 255, 255, 0.12)',
        padding: '120px 24px 60px',
        overflow: 'hidden',
        zIndex: 10,
      }}
    >
      {/* Background glow */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          width: '70vw',
          height: '260px',
          background: 'radial-gradient(ellipse at center, rgba(181, 124, 255, 0.2) 0%, rgba(255, 79, 216, 0.1) 40%, transparent 70%)',
          filter: 'blur(50px)',
          pointerEvents: 'none',
        }}
      />

      <div style={{ maxWidth: '1280px', margin: '0 auto', position: 'relative', zIndex: 2 }}>
        {/* Big Editorial Slogan */}
        <div style={{ textAlign: 'center', marginBottom: '80px' }}>
          <div
            className="plushy-badge"
            style={{ marginBottom: '20px' }}
          >
            <Sparkles size={14} color="#00D9FF" />
            Puff • Play • Repeat
          </div>

          <h2
            className="font-editorial gradient-text-iridescent"
            style={{
              fontSize: 'clamp(2.8rem, 7vw, 6.5rem)',
              fontWeight: 800,
              lineHeight: 1.05,
              textTransform: 'uppercase',
              letterSpacing: '-0.03em',
            }}
          >
            Wear A Brighter World
          </h2>
          <p
            style={{
              fontSize: '1.25rem',
              color: 'var(--c-lilac)',
              maxWidth: '640px',
              margin: '20px auto 40px',
            }}
          >
            Iconic puffers. Bigger feelings. Designed with recycled cloud-down insulation and liquid iridescent sheen.
          </p>

          {/* Newsletter Box */}
          <form
            onSubmit={handleSubscribe}
            style={{
              display: 'flex',
              maxWidth: '520px',
              margin: '0 auto',
              background: 'rgba(255, 255, 255, 0.08)',
              backdropFilter: 'blur(20px)',
              borderRadius: '999px',
              padding: '6px',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
            }}
          >
            <input
              type="email"
              placeholder={subscribed ? '✨ You are on the VIP Cloud List!' : 'Enter your email for 15% off first puff'}
              disabled={subscribed}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                flex: 1,
                background: 'transparent',
                border: 'none',
                outline: 'none',
                padding: '14px 24px',
                color: '#fff',
                fontSize: '0.95rem',
              }}
            />
            <button
              type="submit"
              className="btn-squish btn-squish-primary"
              style={{ padding: '12px 28px', fontSize: '0.95rem' }}
            >
              <span>{subscribed ? 'Joined!' : 'Join Drop'}</span>
              <ArrowRight size={16} />
            </button>
          </form>
        </div>

        {/* Links Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '40px',
            paddingTop: '60px',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            marginBottom: '60px',
          }}
        >
          {/* Col 1 */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/assets/brand/puffy-logo-iridescent.png" alt="Logo" style={{ height: '28px' }} />
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--c-silver)', lineHeight: 1.6 }}>
              The future of puffer outerwear. Engineered with zero-gravity ergonomics and dream-grade reflection.
            </p>
          </div>

          {/* Col 2 */}
          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '16px', color: '#fff' }}>Collection</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.85rem', color: 'var(--c-silver)' }}>
              <a href="#hero-section" style={{ color: 'inherit', textDecoration: 'none' }}>Lumi Purple Hero</a>
              <a href="#hero-section" style={{ color: 'inherit', textDecoration: 'none' }}>Icy Silver Prism</a>
              <a href="#hero-section" style={{ color: 'inherit', textDecoration: 'none' }}>Neon Bubblegum</a>
              <a href="#hero-section" style={{ color: 'inherit', textDecoration: 'none' }}>Electric Aurora</a>
            </div>
          </div>

          {/* Col 3 */}
          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '16px', color: '#fff' }}>Experience</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.85rem', color: 'var(--c-silver)' }}>
              <a href="#hero-section" style={{ color: 'inherit', textDecoration: 'none' }}>3D Interactive Studio</a>
              <a href="#mascot-section" style={{ color: 'inherit', textDecoration: 'none' }}>Meet Puffy Mascot</a>
              <a href="#specs-section" style={{ color: 'inherit', textDecoration: 'none' }}>Nano-Ripstop Tech</a>
              <a href="#lookbook-section" style={{ color: 'inherit', textDecoration: 'none' }}>Community Lookbook</a>
            </div>
          </div>

          {/* Col 4 */}
          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '16px', color: '#fff' }}>Sustainability</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.85rem', color: 'var(--c-silver)' }}>
              <span>100% Recycled Cloud-Down</span>
              <span>Carbon-Neutral Worldwide Delivery</span>
              <span>Sub-Zero Ergonomic Shielding</span>
              <span>Circular Outerwear Initiative</span>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '16px',
            fontSize: '0.8rem',
            color: 'rgba(255,255,255,0.4)',
          }}
        >
          <div>© 2026 PLUSHY & PUFFY APPAREL CORP. ALL RIGHTS RESERVED.</div>
          <div style={{ display: 'flex', gap: '20px' }}>
            <span>Privacy Policy</span>
            <span>Terms of Service</span>
            <span>3D Studio Credits</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
