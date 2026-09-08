'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Menu, Search, ShoppingBag } from 'lucide-react';

interface NavbarProps {
  onOpenMenu?: () => void;
  onOpenSearch?: () => void;
  onOpenCart?: () => void;
  cartCount?: number;
}

export default function Navbar({
  onOpenMenu,
  onOpenSearch,
  onOpenCart,
  cartCount = 0,
}: NavbarProps) {
  return (
    <motion.header
      initial={{ y: -36, opacity: 0, scale: 0.96 }}
      animate={{ y: 0, opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
      style={{
        position: 'fixed',
        top: '24px',
        left: 0,
        right: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 clamp(20px, 4vw, 48px)',
        zIndex: 60,
        pointerEvents: 'none',
      }}
    >
      {/* Top Left: Minimal Hamburger Button */}
      <div style={{ pointerEvents: 'auto' }}>
        <motion.button
          type="button"
          aria-label="Open Menu"
          onClick={onOpenMenu}
          whileHover={{ scale: 1.08, backgroundColor: 'rgba(255, 255, 255, 0.14)' }}
          whileTap={{ scale: 0.92 }}
          transition={{ type: 'spring', stiffness: 400, damping: 24 }}
          style={{
            width: '46px',
            height: '46px',
            borderRadius: '50%',
            background: 'rgba(20, 6, 38, 0.55)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.14)',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.18)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: '#F7F9FF',
            padding: 0,
          }}
        >
          <Menu size={20} strokeWidth={1.75} />
        </motion.button>
      </div>

      {/* Top Center: Centered Static Iridescent Logo */}
      <div
        style={{
          position: 'absolute',
          left: '50%',
          transform: 'translateX(-50%)',
          pointerEvents: 'auto',
        }}
      >
        <motion.a
          href="#"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.96 }}
          transition={{ type: 'spring', stiffness: 380, damping: 22 }}
          style={{
            display: 'inline-flex',
            justifyContent: 'center',
            alignItems: 'center',
            textDecoration: 'none',
            cursor: 'pointer',
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/assets/brand/puffy-logo-iridescent.png"
            alt="Puffy Logo"
            draggable={false}
            style={{
              height: '80px',
              width: 'auto',
              maxHeight: '12vh',
              objectFit: 'contain',
              filter:
                'drop-shadow(0 12px 36px rgba(181, 124, 255, 0.55)) drop-shadow(0 2px 10px rgba(0, 229, 255, 0.4))',
              userSelect: 'none',
            }}
          />
        </motion.a>
      </div>

      {/* Top Right: Minimal Search & Cart Buttons */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          pointerEvents: 'auto',
        }}
      >
        {/* Search Button */}
        <motion.button
          type="button"
          aria-label="Search"
          onClick={onOpenSearch}
          whileHover={{ scale: 1.08, backgroundColor: 'rgba(255, 255, 255, 0.14)' }}
          whileTap={{ scale: 0.92 }}
          transition={{ type: 'spring', stiffness: 400, damping: 24 }}
          style={{
            width: '46px',
            height: '46px',
            borderRadius: '50%',
            background: 'rgba(20, 6, 38, 0.55)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.14)',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.18)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: '#F7F9FF',
            padding: 0,
          }}
        >
          <Search size={19} strokeWidth={1.75} />
        </motion.button>

        {/* Cart Button with Live Counter Badge */}
        <motion.button
          type="button"
          aria-label="View Cart"
          onClick={onOpenCart}
          whileHover={{ scale: 1.08, backgroundColor: 'rgba(255, 255, 255, 0.14)' }}
          whileTap={{ scale: 0.92 }}
          transition={{ type: 'spring', stiffness: 400, damping: 24 }}
          style={{
            position: 'relative',
            width: '46px',
            height: '46px',
            borderRadius: '50%',
            background: 'rgba(20, 6, 38, 0.55)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.14)',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.18)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: '#F7F9FF',
            padding: 0,
          }}
        >
          <ShoppingBag size={19} strokeWidth={1.75} />
          {cartCount > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              style={{
                position: 'absolute',
                top: '-3px',
                right: '-3px',
                minWidth: '19px',
                height: '19px',
                borderRadius: '999px',
                background: 'linear-gradient(135deg, #FF4FD8, #B57CFF)',
                color: '#fff',
                fontSize: '0.68rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '0 5px',
                boxShadow: '0 2px 8px rgba(255, 79, 216, 0.5)',
              }}
            >
              {cartCount}
            </motion.span>
          )}
        </motion.button>
      </div>
    </motion.header>
  );
}
