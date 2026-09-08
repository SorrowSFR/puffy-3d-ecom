'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowUpRight, Sparkles } from 'lucide-react';
import { PRODUCTS, Product } from '@/lib/products';

interface NavigationMenuDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectProduct: (product: Product) => void;
}

export default function NavigationMenuDrawer({
  isOpen,
  onClose,
  onSelectProduct,
}: NavigationMenuDrawerProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9500,
            display: 'flex',
            justifyContent: 'flex-start',
          }}
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(5, 1, 15, 0.72)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
            }}
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            style={{
              position: 'relative',
              width: '100%',
              maxWidth: '440px',
              height: '100%',
              background: 'rgba(18, 5, 36, 0.94)',
              backdropFilter: 'blur(36px)',
              WebkitBackdropFilter: 'blur(36px)',
              borderRight: '1px solid rgba(255, 255, 255, 0.12)',
              boxShadow: '20px 0 60px rgba(0, 0, 0, 0.65)',
              display: 'flex',
              flexDirection: 'column',
              zIndex: 10,
              padding: '36px 32px',
            }}
          >
            {/* Header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '40px',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  color: 'var(--c-lilac)',
                }}
              >
                <Sparkles size={14} color="#B57CFF" />
                <span>Puffy Archive</span>
              </div>
              <motion.button
                type="button"
                aria-label="Close Menu"
                onClick={onClose}
                whileHover={{ scale: 1.1, backgroundColor: 'rgba(255, 255, 255, 0.15)' }}
                whileTap={{ scale: 0.92 }}
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  cursor: 'pointer',
                }}
              >
                <X size={18} />
              </motion.button>
            </div>

            {/* Navigation Sections */}
            <div style={{ flex: 1, overflowY: 'auto' }}>
              <div
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  letterSpacing: '0.16em',
                  textTransform: 'uppercase',
                  color: 'rgba(255, 255, 255, 0.45)',
                  marginBottom: '16px',
                }}
              >
                Outerwear Editions
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '36px' }}>
                {PRODUCTS.map((prod, idx) => (
                  <motion.button
                    key={prod.id}
                    type="button"
                    onClick={() => {
                      onSelectProduct(prod);
                      onClose();
                    }}
                    whileHover={{ x: 6, backgroundColor: 'rgba(255, 255, 255, 0.06)' }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '14px 16px',
                      borderRadius: '16px',
                      background: 'transparent',
                      border: '1px solid transparent',
                      color: '#F7F9FF',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <span
                        style={{
                          width: '10px',
                          height: '10px',
                          borderRadius: '50%',
                          background: prod.colorHex,
                          boxShadow: `0 0 10px ${prod.colorHex}`,
                        }}
                      />
                      <div>
                        <div style={{ fontSize: '0.98rem', fontWeight: 600 }}>{prod.name}</div>
                        <div style={{ fontSize: '0.78rem', color: 'rgba(255, 255, 255, 0.5)' }}>
                          0{idx + 1} / ${prod.price}
                        </div>
                      </div>
                    </div>
                    <ArrowUpRight size={16} color="rgba(255, 255, 255, 0.35)" />
                  </motion.button>
                ))}
              </div>

              <div
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  letterSpacing: '0.16em',
                  textTransform: 'uppercase',
                  color: 'rgba(255, 255, 255, 0.45)',
                  marginBottom: '16px',
                }}
              >
                Exploration
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {[
                  { label: '4-Article Discovery Grid', href: '#discovery-section' },
                  { label: 'Iridescent Fabric Technology', href: '#technology' },
                  { label: 'Sub-Zero Cloud Insulation', href: '#insulation' },
                  { label: 'About Puffy Universe', href: '#about' },
                ].map((item, i) => (
                  <a
                    key={i}
                    href={item.href}
                    onClick={onClose}
                    style={{
                      padding: '12px 16px',
                      fontSize: '0.92rem',
                      fontWeight: 500,
                      color: 'var(--c-silver)',
                      textDecoration: 'none',
                      borderRadius: '12px',
                      transition: 'background 0.2s ease',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    {item.label}
                  </a>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div
              style={{
                paddingTop: '24px',
                borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '0.8rem',
                color: 'rgba(255, 255, 255, 0.4)',
              }}
            >
              <span>Worldwide Shipping</span>
              <span>USD ($)</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
