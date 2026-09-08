'use client';

import React, { useState } from 'react';
import { Sparkles, ExternalLink, Image as ImageIcon, X } from 'lucide-react';

export default function LookbookSection() {
  const [selectedSheet, setSelectedSheet] = useState<string | null>(null);

  const lookbookCards = [
    {
      title: 'Neon Orbit 01',
      jacket: 'Lumi Purple Hero',
      tag: 'Dream Exploration',
      bg: '/assets/backgrounds/hero-dreamy-sunset.png',
      quote: '“It feels like stepping into a nebula of warm down.”',
    },
    {
      title: 'Prism Horizon 02',
      jacket: 'Icy Silver Prism',
      tag: 'Reflective Grid',
      bg: '/assets/backgrounds/hero-reflective-grid.png',
      quote: '“Catching twilight reflections across the city floor.”',
    },
    {
      title: 'Atmosphere Cloud 03',
      jacket: 'Bubblegum & Aurora',
      tag: 'Cloudscape Series',
      bg: '/assets/backgrounds/sky-clouds-atmosphere.png',
      quote: '“Pure dopamine outerwear that lifts your mood instantly.”',
    },
  ];

  return (
    <section
      id="lookbook-section"
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
          <Sparkles size={14} color="#FF4FD8" />
          Editorial Lookbook
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
          A Brighter <span className="gradient-text-pink-blue">State of Mind</span>
        </h2>
        <p
          style={{
            fontSize: '1.2rem',
            color: 'var(--c-lilac)',
            maxWidth: '600px',
            margin: '0 auto',
          }}
        >
          Dreamy worlds engineered for high-altitude feelings and effortless street presence.
        </p>
      </div>

      {/* Lookbook Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
          gap: '32px',
          marginBottom: '60px',
        }}
      >
        {lookbookCards.map((card, i) => (
          <div
            key={i}
            className="glass-panel"
            style={{
              height: '460px',
              position: 'relative',
              borderRadius: '28px',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-end',
              padding: '36px',
              border: '1px solid rgba(255, 255, 255, 0.15)',
            }}
          >
            {/* Background Image */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={card.bg}
              alt={card.title}
              style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                filter: 'brightness(0.65) saturate(1.2)',
                transition: 'transform 0.8s ease',
              }}
            />

            {/* Gradient Overlay */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(180deg, transparent 40%, rgba(10, 2, 22, 0.95) 100%)',
              }}
            />

            {/* Content */}
            <div style={{ position: 'relative', zIndex: 2 }}>
              <div
                style={{
                  display: 'inline-block',
                  padding: '6px 14px',
                  borderRadius: '999px',
                  background: 'rgba(255, 255, 255, 0.15)',
                  backdropFilter: 'blur(10px)',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  marginBottom: '12px',
                  color: 'var(--c-silver)',
                }}
              >
                {card.tag}
              </div>
              <h3 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '6px' }}>{card.title}</h3>
              <div style={{ fontSize: '0.9rem', color: 'var(--c-blue)', fontWeight: 600, marginBottom: '12px' }}>
                {card.jacket}
              </div>
              <p style={{ fontSize: '0.95rem', color: 'var(--c-white)', fontStyle: 'italic', lineHeight: 1.5 }}>
                {card.quote}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Behind the Scenes Reference Sheets Modal Trigger */}
      <div
        className="glass-panel"
        style={{
          padding: '36px 48px',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '24px',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <ImageIcon size={18} color="#B57CFF" />
            <h4 style={{ fontSize: '1.3rem', fontWeight: 800 }}>Master Design Sheets & Concept Art</h4>
          </div>
          <p style={{ color: 'var(--c-lilac)', fontSize: '0.95rem', maxWidth: '600px' }}>
            Explore the official website art direction sheet and character design blueprint that inspired this experience.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <button
            onClick={() => {
              setSelectedSheet('/assets/sheets/website-art-direction.png');
            }}
            className="btn-squish btn-squish-secondary"
            style={{ fontSize: '0.9rem', padding: '12px 24px', display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <span>Art Direction Sheet</span>
            <ExternalLink size={15} />
          </button>

          <button
            onClick={() => {
              setSelectedSheet('/assets/sheets/character-design-sheet.png');
            }}
            className="btn-squish btn-squish-secondary"
            style={{ fontSize: '0.9rem', padding: '12px 24px', display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <span>Character Blueprint</span>
            <ExternalLink size={15} />
          </button>
        </div>
      </div>

      {/* Sheet Lightbox Modal */}
      {selectedSheet && (
        <div
          onClick={() => setSelectedSheet(null)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 99999,
            background: 'rgba(5, 1, 15, 0.92)',
            backdropFilter: 'blur(25px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '40px',
          }}
        >
          <button
            onClick={() => setSelectedSheet(null)}
            style={{
              position: 'absolute',
              top: '30px',
              right: '30px',
              background: 'rgba(255, 255, 255, 0.15)',
              border: 'none',
              borderRadius: '50%',
              padding: '12px',
              color: '#fff',
              cursor: 'pointer',
              zIndex: 10,
            }}
          >
            <X size={24} />
          </button>

          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: '90vw',
              maxHeight: '88vh',
              overflow: 'auto',
              borderRadius: '24px',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              boxShadow: '0 30px 80px rgba(0,0,0,0.8)',
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={selectedSheet}
              alt="Design Sheet"
              style={{
                width: '100%',
                height: 'auto',
                display: 'block',
              }}
            />
          </div>
        </div>
      )}
    </section>
  );
}
