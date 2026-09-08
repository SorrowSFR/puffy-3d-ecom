'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Eye, ShoppingBag, Check, ArrowUpRight } from 'lucide-react';
import { PRODUCTS, Product } from '@/lib/products';

interface ProductDiscoverySectionProps {
  activeProduct: Product;
  onSelectProduct: (product: Product) => void;
  onAddToCart: (product: Product, size: string) => void;
}

export default function ProductDiscoverySection({
  activeProduct,
  onSelectProduct,
  onAddToCart,
}: ProductDiscoverySectionProps) {
  const [selectedSizes, setSelectedSizes] = useState<Record<string, string>>({
    'purple-lumi': 'M',
    'moonbeam': 'M',
    'pink-bubblegum': 'M',
    'blue-aurora': 'M',
  });
  const [addedAnimationId, setAddedAnimationId] = useState<string | null>(null);

  const handleSizeChange = (productId: string, size: string) => {
    setSelectedSizes((prev) => ({ ...prev, [productId]: size }));
  };

  const handleAdd = (product: Product) => {
    const size = selectedSizes[product.id] || 'M';
    onAddToCart(product, size);
    setAddedAnimationId(product.id);
    setTimeout(() => setAddedAnimationId(null), 1400);
  };

  const handleExperienceIn3D = (product: Product) => {
    onSelectProduct(product);
    // Smoothly scroll back to the 3D stage
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <section
      id="discovery-section"
      style={{
        position: 'relative',
        zIndex: 20,
        padding: '120px clamp(20px, 5vw, 64px) 140px',
        maxWidth: '1440px',
        margin: '0 auto',
      }}
    >
      {/* Minimal Header */}
      <div style={{ textAlign: 'center', marginBottom: '80px' }}>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 18px',
            borderRadius: '999px',
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            backdropFilter: 'blur(16px)',
            fontSize: '0.78rem',
            fontWeight: 700,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: 'var(--c-lilac)',
            marginBottom: '20px',
          }}
        >
          <Sparkles size={13} color="#B57CFF" />
          <span>Winter 2026 Collection / All 4 Editions</span>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="font-editorial"
          style={{
            fontSize: 'clamp(2.4rem, 5.5vw, 4.2rem)',
            fontWeight: 800,
            lineHeight: 1.1,
            letterSpacing: '-0.03em',
            marginBottom: '20px',
            color: '#FFFFFF',
          }}
        >
          Four Shades of <span className="gradient-text-iridescent">Cloud-Down</span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.2 }}
          style={{
            fontSize: '1.12rem',
            color: 'rgba(255, 255, 255, 0.6)',
            maxWidth: '620px',
            margin: '0 auto',
            lineHeight: 1.6,
          }}
        >
          Sculpted with ultra-loft air baffles and a light-responsive nano-glaze. Select an edition to experience it in the full-screen 3D studio.
        </motion.p>
      </div>

      {/* 4-Article Clean Minimal Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))',
          gap: '28px',
        }}
      >
        {PRODUCTS.map((product, index) => {
          const isCurrentActive = activeProduct.id === product.id;
          const currentSize = selectedSizes[product.id] || 'M';
          const isAdded = addedAnimationId === product.id;

          return (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ y: -8 }}
              style={{
                position: 'relative',
                borderRadius: '32px',
                background: 'rgba(18, 5, 36, 0.45)',
                backdropFilter: 'blur(28px)',
                WebkitBackdropFilter: 'blur(28px)',
                border: isCurrentActive
                  ? `1.5px solid ${product.colorHex}`
                  : '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: isCurrentActive
                  ? `0 24px 60px rgba(0,0,0,0.5), 0 0 30px ${product.colorHex}25`
                  : '0 20px 50px rgba(0, 0, 0, 0.4)',
                padding: '32px 28px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'border-color 0.3s ease, box-shadow 0.3s ease',
              }}
            >
              {/* Top Row: Index & Badge */}
              <div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '24px',
                  }}
                >
                  <span
                    style={{
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      letterSpacing: '0.12em',
                      color: 'rgba(255, 255, 255, 0.45)',
                      textTransform: 'uppercase',
                    }}
                  >
                    0{index + 1} / 04
                  </span>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '4px 12px',
                      borderRadius: '999px',
                      background: 'rgba(255, 255, 255, 0.06)',
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                      fontSize: '0.72rem',
                      fontWeight: 600,
                      color: product.colorHex,
                    }}
                  >
                    <span
                      style={{
                        width: '6px',
                        height: '6px',
                        borderRadius: '50%',
                        background: product.colorHex,
                        boxShadow: `0 0 8px ${product.colorHex}`,
                      }}
                    />
                    <span>{product.badge}</span>
                  </div>
                </div>

                {/* Transparent Product Image Showcase */}
                <div
                  style={{
                    height: '280px',
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '24px',
                    cursor: 'pointer',
                  }}
                  onClick={() => handleExperienceIn3D(product)}
                >
                  {/* Subtle Glow Aura */}
                  <div
                    style={{
                      position: 'absolute',
                      width: '200px',
                      height: '200px',
                      borderRadius: '50%',
                      background: product.colorHex,
                      opacity: 0.14,
                      filter: 'blur(50px)',
                      pointerEvents: 'none',
                    }}
                  />
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <motion.img
                    src={product.imageUrl}
                    alt={product.name}
                    draggable={false}
                    whileHover={{ scale: 1.06, rotate: -1.5 }}
                    transition={{ type: 'spring', stiffness: 350, damping: 20 }}
                    style={{
                      maxHeight: '100%',
                      maxWidth: '100%',
                      objectFit: 'contain',
                      filter: 'drop-shadow(0 18px 30px rgba(0,0,0,0.5))',
                      userSelect: 'none',
                    }}
                  />
                </div>

                {/* Product Name & Tagline */}
                <h3
                  className="font-display"
                  style={{
                    fontSize: '1.45rem',
                    fontWeight: 700,
                    color: '#FFFFFF',
                    marginBottom: '6px',
                  }}
                >
                  {product.name}
                </h3>
                <p
                  style={{
                    fontSize: '0.85rem',
                    color: 'rgba(255, 255, 255, 0.55)',
                    marginBottom: '16px',
                    lineHeight: 1.45,
                  }}
                >
                  {product.tagline}
                </p>

                {/* Warmth Spec Pill */}
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '0.75rem',
                    color: 'var(--c-silver)',
                    padding: '4px 10px',
                    background: 'rgba(255, 255, 255, 0.04)',
                    borderRadius: '8px',
                    marginBottom: '24px',
                  }}
                >
                  <span>Warmth:</span>
                  <strong style={{ color: '#fff' }}>{product.specs.warmth.split(' ')[0]}</strong>
                </div>

                {/* Size Selector */}
                <div style={{ marginBottom: '24px' }}>
                  <div
                    style={{
                      fontSize: '0.72rem',
                      fontWeight: 600,
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                      color: 'rgba(255, 255, 255, 0.4)',
                      marginBottom: '8px',
                    }}
                  >
                    Select Size
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {product.sizes.map((sz) => {
                      const isSzActive = currentSize === sz;
                      return (
                        <button
                          key={sz}
                          type="button"
                          onClick={() => handleSizeChange(product.id, sz)}
                          style={{
                            flex: 1,
                            padding: '6px 0',
                            borderRadius: '10px',
                            background: isSzActive ? 'rgba(255, 255, 255, 0.18)' : 'rgba(255, 255, 255, 0.04)',
                            border: isSzActive
                              ? `1px solid ${product.colorHex}`
                              : '1px solid rgba(255, 255, 255, 0.1)',
                            color: isSzActive ? '#fff' : 'rgba(255, 255, 255, 0.6)',
                            fontSize: '0.78rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            transition: 'all 0.18s ease',
                          }}
                        >
                          {sz}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Bottom Row: Price & Action Buttons */}
              <div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'baseline',
                    justifyContent: 'space-between',
                    marginBottom: '16px',
                    paddingTop: '16px',
                    borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                  }}
                >
                  <span style={{ fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.45)' }}>Price</span>
                  <span
                    style={{
                      fontSize: '1.45rem',
                      fontWeight: 800,
                      color: '#FFFFFF',
                      fontFamily: 'var(--font-display)',
                    }}
                  >
                    ${product.price}
                  </span>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  {/* Experience in 3D Button */}
                  <motion.button
                    type="button"
                    onClick={() => handleExperienceIn3D(product)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.96 }}
                    style={{
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      padding: '12px 14px',
                      borderRadius: '16px',
                      background: isCurrentActive ? 'rgba(255, 255, 255, 0.16)' : 'rgba(255, 255, 255, 0.06)',
                      border: isCurrentActive
                        ? `1px solid ${product.colorHex}`
                        : '1px solid rgba(255, 255, 255, 0.14)',
                      color: '#FFFFFF',
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <Eye size={15} color={product.colorHex} />
                    <span>{isCurrentActive ? 'Active in 3D' : 'View in 3D'}</span>
                  </motion.button>

                  {/* Add to Bag Button */}
                  <motion.button
                    type="button"
                    onClick={() => handleAdd(product)}
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.94 }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '46px',
                      height: '46px',
                      borderRadius: '16px',
                      background: isAdded
                        ? '#22c55e'
                        : `linear-gradient(135deg, ${product.colorHex}, #9333ea)`,
                      border: 'none',
                      color: '#fff',
                      cursor: 'pointer',
                      boxShadow: `0 6px 18px ${product.colorHex}40`,
                      transition: 'background 0.25s ease',
                      flexShrink: 0,
                    }}
                  >
                    {isAdded ? <Check size={18} strokeWidth={2.5} /> : <ShoppingBag size={18} />}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
