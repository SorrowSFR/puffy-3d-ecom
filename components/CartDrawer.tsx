'use client';

import React from 'react';
import { X, Plus, Minus, ShoppingBag, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';
import { Product } from '@/lib/products';
import confetti from 'canvas-confetti';
import { motion, AnimatePresence } from 'framer-motion';

export interface CartItem {
  product: Product;
  size: string;
  quantity: number;
}

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (productId: string, size: string, delta: number) => void;
  onRemoveItem: (productId: string, size: string) => void;
}

export default function CartDrawer({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
}: CartDrawerProps) {
  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const freeShippingThreshold = 500;
  const progressToFree = Math.min(100, Math.floor((subtotal / freeShippingThreshold) * 100));
  const diffToFree = Math.max(0, freeShippingThreshold - subtotal);

  const handleCheckout = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#B57CFF', '#FF4FD8', '#00D9FF', '#FFFFFF'],
    });
    alert('🎉 Order Placed! Welcome to the Plushy Cloud Universe.');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9000,
            display: 'flex',
            justifyContent: 'flex-end',
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
              background: 'rgba(5, 1, 15, 0.7)',
              backdropFilter: 'blur(10px)',
            }}
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            style={{
              position: 'relative',
              width: '100%',
              maxWidth: '460px',
              height: '100%',
              background: 'rgba(16, 4, 32, 0.9)',
              backdropFilter: 'blur(30px)',
              borderLeft: '1px solid rgba(255, 255, 255, 0.15)',
              boxShadow: '-20px 0 60px rgba(0,0,0,0.7)',
              display: 'flex',
              flexDirection: 'column',
              zIndex: 10,
            }}
          >
            {/* Header */}
            <div
              style={{
                padding: '28px',
                borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <ShoppingBag size={20} color="#FF4FD8" />
                <h3 className="font-display" style={{ fontSize: '1.4rem', fontWeight: 800 }}>
                  Your Cloud Bag ({items.reduce((s, i) => s + i.quantity, 0)})
                </h3>
              </div>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                style={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: 'none',
                  borderRadius: '50%',
                  padding: '8px',
                  color: '#fff',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <X size={18} />
              </motion.button>
            </div>

            {/* Free Shipping Meter */}
            <div
              style={{
                padding: '16px 28px',
                background: 'rgba(181, 124, 255, 0.08)',
                borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '8px' }}>
                <span style={{ color: 'var(--c-silver)' }}>
                  {diffToFree === 0 ? '✨ You unlocked Free Cosmic Delivery!' : `Add $${diffToFree} for Free Cosmic Delivery`}
                </span>
                <span style={{ fontWeight: 700, color: 'var(--c-blue)' }}>{progressToFree}%</span>
              </div>
              <div
                style={{
                  width: '100%',
                  height: '5px',
                  background: 'rgba(255, 255, 255, 0.15)',
                  borderRadius: '999px',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    width: `${progressToFree}%`,
                    height: '100%',
                    background: 'linear-gradient(90deg, var(--c-blue), var(--c-pink))',
                    borderRadius: '999px',
                    transition: 'width 0.3s ease',
                  }}
                />
              </div>
            </div>

            {/* Items List */}
            <div
              style={{
                flex: 1,
                overflowY: 'auto',
                padding: '24px 28px',
                display: 'flex',
                flexDirection: 'column',
                gap: '20px',
              }}
            >
              {items.length === 0 ? (
                <div
                  style={{
                    textAlign: 'center',
                    margin: 'auto 0',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '16px',
                  }}
                >
                  <Sparkles size={36} color="var(--c-lavender)" className="anim-float-slow" />
                  <div style={{ fontSize: '1.2rem', fontWeight: 700 }}>Your bag is feather light</div>
                  <p style={{ color: 'var(--c-lilac)', fontSize: '0.9rem', maxWidth: '280px' }}>
                    Explore the 4 buffer editions and inflate your wardrobe with pure comfort.
                  </p>
                </div>
              ) : (
                items.map((item) => (
                  <div
                    key={`${item.product.id}-${item.size}`}
                    style={{
                      display: 'flex',
                      gap: '16px',
                      padding: '16px',
                      borderRadius: '20px',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                    }}
                  >
                    {/* Image */}
                    <div
                      style={{
                        width: '80px',
                        height: '90px',
                        borderRadius: '14px',
                        background: 'rgba(25, 8, 48, 0.6)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '6px',
                      }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.product.imageUrl}
                        alt={item.product.name}
                        style={{
                          maxHeight: '100%',
                          width: 'auto',
                          objectFit: 'contain',
                        }}
                      />
                    </div>

                    {/* Details */}
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <h4 style={{ fontSize: '0.95rem', fontWeight: 700 }}>{item.product.name}</h4>
                          <button
                            onClick={() => onRemoveItem(item.product.id, item.size)}
                            style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer' }}
                          >
                            <X size={14} />
                          </button>
                        </div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--c-silver)', marginTop: '2px' }}>
                          Size: {item.size} • {item.product.edition}
                        </div>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px' }}>
                        {/* Quantity controls */}
                        <div
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '12px',
                            background: 'rgba(255, 255, 255, 0.08)',
                            borderRadius: '999px',
                            padding: '4px 10px',
                          }}
                        >
                          <button
                            onClick={() => onUpdateQuantity(item.product.id, item.size, -1)}
                            style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex' }}
                          >
                            <Minus size={12} />
                          </button>
                          <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>{item.quantity}</span>
                          <button
                            onClick={() => onUpdateQuantity(item.product.id, item.size, 1)}
                            style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex' }}
                          >
                            <Plus size={12} />
                          </button>
                        </div>

                        <span style={{ fontSize: '1rem', fontWeight: 800 }}>${item.product.price * item.quantity}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer with Checkout */}
            {items.length > 0 && (
              <div
                style={{
                  padding: '24px 28px',
                  borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                  background: 'rgba(10, 2, 20, 0.8)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--c-silver)' }}>
                  <span>Subtotal</span>
                  <span style={{ color: '#fff', fontWeight: 700 }}>${subtotal}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '18px', fontSize: '0.9rem', color: 'var(--c-silver)' }}>
                  <span>Cosmic Shipping</span>
                  <span style={{ color: 'var(--c-blue)', fontWeight: 700 }}>{diffToFree === 0 ? 'FREE' : '$25'}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px', fontSize: '1.25rem', fontWeight: 800 }}>
                  <span>Total</span>
                  <span className="gradient-text-pink-blue">${subtotal + (diffToFree === 0 ? 0 : 25)}</span>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleCheckout}
                  className="btn-squish btn-squish-primary"
                  style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
                >
                  <span>Secure Cloud Checkout</span>
                  <ArrowRight size={18} />
                </motion.button>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    marginTop: '16px',
                    fontSize: '0.75rem',
                    color: 'var(--c-silver)',
                  }}
                >
                  <ShieldCheck size={14} color="#00D9FF" />
                  <span>30-Day Squish Return Guarantee • Carbon Neutral Delivery</span>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
