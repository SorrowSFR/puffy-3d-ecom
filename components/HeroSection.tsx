'use client';

import React, { useState } from 'react';
import { Product, PRODUCTS } from '@/lib/products';
import ThreeJacketStudio from './ThreeJacketStudio';
import { Sparkles, ShoppingBag, Check, Info } from 'lucide-react';
import confetti from 'canvas-confetti';
import { motion, AnimatePresence } from 'framer-motion';

interface HeroSectionProps {
  onAddToCart: (product: Product, size: string) => void;
  onOpenCart: () => void;
}

export default function HeroSection({ onAddToCart, onOpenCart }: HeroSectionProps) {
  const [selectedProductIndex, setSelectedProductIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState('M');
  const [viewMode, setViewMode] = useState<'3d' | '2d'>('3d');
  const [addedAnimation, setAddedAnimation] = useState(false);
  const [showFitGuide, setShowFitGuide] = useState(false);

  const currentProduct = PRODUCTS[selectedProductIndex];

  const handleProductChange = (index: number) => {
    setSelectedProductIndex(index);
  };

  const handleSizeChange = (size: string) => {
    setSelectedSize(size);
  };

  const handleAdd = () => {
    onAddToCart(currentProduct, selectedSize);
    setAddedAnimation(true);
    confetti({
      particleCount: 45,
      spread: 60,
      origin: { y: 0.7 },
      colors: [currentProduct.colorHex, '#FFFFFF', '#00D9FF'],
    });
    setTimeout(() => {
      setAddedAnimation(false);
    }, 1500);
  };

  return (
    <section
      id="hero-section"
      style={{
        position: 'relative',
        minHeight: '100vh',
        paddingTop: '130px',
        paddingBottom: '80px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        overflow: 'hidden',
      }}
    >
      {/* Background Image & Horizon Lighting */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `url('/assets/backgrounds/hero-reflective-grid.png')`,
          backgroundPosition: 'center bottom',
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat',
          opacity: 0.45,
          filter: 'saturate(1.25) contrast(1.1)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      {/* Reflective Horizon Glow */}
      <div className="reflective-horizon-glow" />

      {/* Grid Mesh Floor */}
      <div className="reflective-grid-container">
        <div className="reflective-grid-mesh" />
      </div>

      <div
        style={{
          maxWidth: '1380px',
          width: '100%',
          margin: '0 auto',
          padding: '0 24px',
          position: 'relative',
          zIndex: 5,
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
            gap: '40px',
            alignItems: 'center',
          }}
        >
          {/* Left Column: Editorial Copy & Customizer */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            style={{ maxWidth: '580px' }}
          >
            <div className="plushy-badge" style={{ marginBottom: '20px' }}>
              <Sparkles size={14} color="#00D9FF" />
              {currentProduct.edition}
            </div>

            <h1
              className="font-editorial"
              style={{
                fontSize: 'clamp(2.8rem, 5.5vw, 4.8rem)',
                fontWeight: 800,
                lineHeight: 1.05,
                letterSpacing: '-0.03em',
                marginBottom: '18px',
              }}
            >
              A Brighter <span className="gradient-text-iridescent">World</span> Looks Good On You
            </h1>

            <AnimatePresence mode="wait">
              <motion.p
                key={currentProduct.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.35 }}
                style={{
                  fontSize: '1.2rem',
                  color: 'var(--c-lilac)',
                  lineHeight: 1.6,
                  marginBottom: '32px',
                  fontWeight: 400,
                }}
              >
                {currentProduct.description}
              </motion.p>
            </AnimatePresence>

            {/* Jacket Colorway Picker */}
            <div style={{ marginBottom: '28px' }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '12px',
                }}
              >
                <span style={{ fontSize: '0.85rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--c-silver)' }}>
                  Colorway: <span style={{ color: '#fff' }}>{currentProduct.name}</span>
                </span>
                <span style={{ fontSize: '0.8rem', color: currentProduct.colorHex, fontWeight: 700 }}>
                  {currentProduct.tagline}
                </span>
              </div>

              <div style={{ display: 'flex', gap: '14px' }}>
                {PRODUCTS.map((prod, idx) => {
                  const isSelected = idx === selectedProductIndex;
                  return (
                    <motion.button
                      key={prod.id}
                      whileHover={{ scale: 1.12 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleProductChange(idx)}
                      style={{
                        position: 'relative',
                        width: '46px',
                        height: '46px',
                        borderRadius: '50%',
                        background: `radial-gradient(circle at 35% 35%, #fff 0%, ${prod.colorHex} 60%, ${prod.accentHex} 100%)`,
                        border: isSelected ? '3px solid #FFFFFF' : '2px solid rgba(255,255,255,0.2)',
                        boxShadow: isSelected
                          ? `0 0 24px ${prod.colorHex}, 0 6px 14px rgba(0,0,0,0.5)`
                          : '0 4px 10px rgba(0,0,0,0.3)',
                        cursor: 'pointer',
                      }}
                      title={prod.name}
                    >
                      {isSelected && (
                        <div
                          style={{
                            position: 'absolute',
                            inset: 0,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <Check size={16} color="#fff" strokeWidth={3} />
                        </div>
                      )}
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* Size Selector */}
            <div style={{ marginBottom: '32px' }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '12px',
                }}
              >
                <span style={{ fontSize: '0.85rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--c-silver)' }}>
                  Select Size
                </span>
                <button
                  onClick={() => setShowFitGuide(true)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--c-blue)',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <Info size={13} />
                  <span>Fit & Sizing Guide</span>
                </button>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                {currentProduct.sizes.map((size) => {
                  const isSelected = size === selectedSize;
                  return (
                    <motion.button
                      key={size}
                      whileHover={{ scale: 1.06 }}
                      whileTap={{ scale: 0.96 }}
                      onClick={() => handleSizeChange(size)}
                      style={{
                        padding: '10px 20px',
                        borderRadius: '16px',
                        background: isSelected ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.06)',
                        border: isSelected ? '1px solid var(--c-blue)' : '1px solid rgba(255, 255, 255, 0.12)',
                        color: isSelected ? '#FFFFFF' : 'var(--c-silver)',
                        fontSize: '0.9rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      {size}
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* Price & Add to Bag CTA */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
              <div>
                <div style={{ fontSize: '0.8rem', color: 'var(--c-silver)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Pre-Order Price
                </div>
                <div className="font-display" style={{ fontSize: '2.4rem', fontWeight: 800 }}>
                  ${currentProduct.price}
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.96 }}
                onClick={handleAdd}
                className="btn-squish btn-squish-primary"
                style={{
                  flex: 1,
                  padding: '18px 36px',
                  fontSize: '1.15rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '12px',
                }}
              >
                {addedAnimation ? (
                  <>
                    <Check size={20} />
                    <span>Added To Cloud Bag!</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag size={20} />
                    <span>Add To Bag</span>
                  </>
                )}
              </motion.button>
            </div>
          </motion.div>

          {/* Right Column: 3D WebGL Studio Canvas */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="glass-panel"
            style={{
              height: '660px',
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 0,
              overflow: 'hidden',
              boxShadow: '0 30px 80px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
            }}
          >
            <ThreeJacketStudio
              product={currentProduct}
              viewMode={viewMode}
              onToggleViewMode={() => {
                setViewMode(viewMode === '3d' ? '2d' : '3d');
              }}
            />
          </motion.div>
        </div>
      </div>

      {/* Sizing Modal */}
      <AnimatePresence>
        {showFitGuide && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowFitGuide(false)}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 99999,
              background: 'rgba(5, 1, 15, 0.85)',
              backdropFilter: 'blur(20px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '24px',
            }}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-panel"
              style={{
                maxWidth: '520px',
                width: '100%',
                padding: '36px',
                position: 'relative',
              }}
            >
              <h3 className="font-editorial" style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '12px' }}>
                Plushy Fit & Cloud Silhouette
              </h3>
              <p style={{ color: 'var(--c-lilac)', fontSize: '0.95rem', marginBottom: '24px', lineHeight: 1.6 }}>
                All Plushy buffer jackets feature an ergonomic oversized silhouette designed for sub-zero comfort. If you prefer a tailored street fit, we recommend sizing down one size.
              </p>

              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem', marginBottom: '28px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.2)', color: 'var(--c-silver)' }}>
                    <th style={{ padding: '8px', textAlign: 'left' }}>Size</th>
                    <th style={{ padding: '8px', textAlign: 'left' }}>Chest</th>
                    <th style={{ padding: '8px', textAlign: 'left' }}>Sleeve</th>
                    <th style={{ padding: '8px', textAlign: 'left' }}>Fit Style</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                    <td style={{ padding: '8px', fontWeight: 700 }}>XS</td>
                    <td style={{ padding: '8px' }}>36-38 in</td>
                    <td style={{ padding: '8px' }}>32 in</td>
                    <td style={{ padding: '8px', color: 'var(--c-blue)' }}>Compact Puffy</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                    <td style={{ padding: '8px', fontWeight: 700 }}>S</td>
                    <td style={{ padding: '8px' }}>38-40 in</td>
                    <td style={{ padding: '8px' }}>33 in</td>
                    <td style={{ padding: '8px', color: 'var(--c-blue)' }}>Standard Boxy</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                    <td style={{ padding: '8px', fontWeight: 700 }}>M</td>
                    <td style={{ padding: '8px' }}>40-43 in</td>
                    <td style={{ padding: '8px' }}>34 in</td>
                    <td style={{ padding: '8px', color: 'var(--c-pink)' }}>Signature Cloud</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                    <td style={{ padding: '8px', fontWeight: 700 }}>L</td>
                    <td style={{ padding: '8px' }}>44-47 in</td>
                    <td style={{ padding: '8px' }}>35 in</td>
                    <td style={{ padding: '8px', color: 'var(--c-lavender)' }}>Oversized Drape</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '8px', fontWeight: 700 }}>XL</td>
                    <td style={{ padding: '8px' }}>48-52 in</td>
                    <td style={{ padding: '8px' }}>36 in</td>
                    <td style={{ padding: '8px', color: 'var(--c-lavender)' }}>Max Pillow Squish</td>
                  </tr>
                </tbody>
              </table>

              <button
                onClick={() => setShowFitGuide(false)}
                className="btn-squish btn-squish-primary"
                style={{ width: '100%', padding: '14px' }}
              >
                Got It
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
