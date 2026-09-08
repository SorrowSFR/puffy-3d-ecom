'use client';

import React, { useState, useEffect, useRef } from 'react';

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import ThreeJacketStudio from '@/components/ThreeJacketStudio';
import Navbar from '@/components/Navbar';
import ZipperTransition from '@/components/ZipperTransition';
import NavigationMenuDrawer from '@/components/NavigationMenuDrawer';
import SearchModal from '@/components/SearchModal';
import CartDrawer, { CartItem } from '@/components/CartDrawer';
import Puffy3DFooter from '@/components/Puffy3DFooter';
import { PRODUCTS, Product } from '@/lib/products';

export default function Home() {
  const [isLoaderFinished, setIsLoaderFinished] = useState(false);
  const [activeProduct, setActiveProduct] = useState<Product>(PRODUCTS[0]);
  const [isRevolverSplit, setIsRevolverSplit] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const activeProductIndex = PRODUCTS.findIndex((p) => p.id === activeProduct.id);

  const handlePrevEdition = () => {
    const currentIdx = PRODUCTS.findIndex((p) => p.id === activeProduct.id);
    const prevIdx = (currentIdx - 1 + PRODUCTS.length) % PRODUCTS.length;
    setActiveProduct(PRODUCTS[prevIdx]);
  };

  const handleNextEdition = () => {
    const currentIdx = PRODUCTS.findIndex((p) => p.id === activeProduct.id);
    const nextIdx = (currentIdx + 1) % PRODUCTS.length;
    setActiveProduct(PRODUCTS[nextIdx]);
  };

  const handleSelectChroma = (prod: Product) => {
    setActiveProduct(prod);
    setIsRevolverSplit(true);
  };

  const handleAddToCart = (product: Product, size: string) => {
    setCartItems((prev) => {
      const existing = prev.find(
        (item) => item.product.id === product.id && item.size === size
      );
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id && item.size === size
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, size, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const handleUpdateQuantity = (productId: string, size: string, delta: number) => {
    setCartItems((prev) =>
      prev
        .map((item) => {
          if (item.product.id === productId && item.size === size) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter((item): item is CartItem => item !== null)
    );
  };

  const handleRemoveItem = (productId: string, size: string) => {
    setCartItems((prev) =>
      prev.filter(
        (item) => !(item.product.id === productId && item.size === size)
      )
    );
  };


  const pinSectionRef = useRef<HTMLDivElement | null>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [selectedSize, setSelectedSize] = useState('M');
  const [isAdded, setIsAdded] = useState(false);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    if (!pinSectionRef.current) return;

    // GSAP ScrollTrigger: Pins the 3D Continuum for 2400px of scroll
    const trigger = ScrollTrigger.create({
      trigger: pinSectionRef.current,
      pin: true,
      start: 'top top',
      end: '+=2400',
      scrub: 0.12,
      anticipatePin: 1,
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        const p = self.progress;
        setScrollProgress(p);
        (window as unknown as { __puffyScrollProgress?: number }).__puffyScrollProgress = p;
      },
    });

    return () => {
      trigger.kill();
    };
  }, []);

  useEffect(() => {
    if (isLoaderFinished) {
      setTimeout(() => {
        ScrollTrigger.refresh();
      }, 60);
    }
  }, [isLoaderFinished]);

  const oceanBgOpacity = Math.max(0, 1 - Math.max(0, (scrollProgress - 0.14) / 0.26));
  const orbUiOpacity = Math.min(1, Math.max(0, (scrollProgress - 0.70) / 0.14));

  return (
    <main
      style={{
        position: 'relative',
        width: '100%',
        minHeight: '100vh',
        overflowX: 'clip',
        background: '#ffffff',
      }}
    >
      {/* Unzipping Video Loader with Real-Time Chroma Key & Zipper Sound */}
      {!isLoaderFinished && (
        <ZipperTransition onComplete={() => setIsLoaderFinished(true)} />
      )}

      {/* Minimal Top Navigation: Hamburger on left, Centered Logo, Search & Cart on right */}
      <Navbar
        onOpenMenu={() => setIsMenuOpen(true)}
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenCart={() => setIsCartOpen(true)}
        cartCount={cartItems.reduce((acc, it) => acc + it.quantity, 0)}
      />

      {/* =================================================================== */}
      {/* UNIFIED 3D CONTINUUM: Hero Jacket -> Ball Morph -> Follow Scroll -> 4 Rotating Balls */}
      {/* =================================================================== */}
      <div
        ref={pinSectionRef}
        id="hero-3d-continuum"
        style={{
          position: 'relative',
          width: '100vw',
          height: '100vh',
          overflow: 'hidden',
          backgroundColor: '#ffffff',
        }}
      >
          {/* Ethereal Water Horizon Background (Smoothly cross-fades to pure blank white) */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backgroundImage: `url('/assets/backgrounds/hero-dreamy-ocean-reflection.png')`,
              backgroundPosition: 'center bottom',
              backgroundSize: 'cover',
              backgroundRepeat: 'no-repeat',
              opacity: oceanBgOpacity,
              filter: 'saturate(1.05) contrast(1.03)',
              pointerEvents: 'none',
              zIndex: 0,
              transition: 'opacity 0.08s linear',
            }}
          />

          {/* Unified 3D WebGL Canvas */}
          <div style={{ position: 'relative', zIndex: 5, width: '100%', height: '100%' }}>
            <ThreeJacketStudio
              product={activeProduct}
              scrollProgress={scrollProgress}
              onSelectProduct={(prod) => setActiveProduct(prod)}
              isRevolverSplit={isRevolverSplit}
              onToggleRevolverSplit={(active) => setIsRevolverSplit(active)}
            />
          </div>


          {/* --------------------------------------------------------------- */}
          {/* Section 2 UI Overlay: The 4-Chroma Floating Spectrum & Inspection */}
          {/* Active during scrollProgress > 0.65 */}
          {/* --------------------------------------------------------------- */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              zIndex: 15,
              pointerEvents: orbUiOpacity > 0.1 ? 'auto' : 'none',
              opacity: orbUiOpacity,
              transition: 'opacity 0.25s ease-out',
            }}
          >
            {/* ------------------------------------------------------------- */}
            {/* Unified Editorial Layout: Floating Orbs (Left) & 3D Jacket (Right) */}
            {/* ------------------------------------------------------------- */}


            {/* Bottom Floating Chroma Selector Dock */}
            <div
              style={{
                position: 'absolute',
                bottom: '28px',
                left: '50%',
                transform: 'translateX(-50%)',
                background: 'rgba(255, 255, 255, 0.90)',
                backdropFilter: 'blur(24px)',
                WebkitBackdropFilter: 'blur(24px)',
                border: '1px solid rgba(0, 0, 0, 0.08)',
                borderRadius: '999px',
                padding: '8px 16px',
                boxShadow: '0 20px 45px -10px rgba(0, 0, 0, 0.12), 0 0 1px rgba(0, 0, 0, 0.18)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                zIndex: 20,
              }}
            >
              {PRODUCTS.map((prod, idx) => {
                const isSelected = prod.id === activeProduct.id;
                return (
                  <button
                    key={prod.id}
                    type="button"
                    onClick={() => handleSelectChroma(prod)}
                    title={`Edition 0${idx + 1}: ${prod.name}`}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '7px 14px',
                      borderRadius: '999px',
                      background: isSelected ? '#0f172a' : 'transparent',
                      color: isSelected ? '#ffffff' : '#475569',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      transition: 'all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
                    }}
                  >
                    <span
                      style={{
                        width: '12px',
                        height: '12px',
                        borderRadius: '50%',
                        backgroundColor: prod.colorHex,
                        boxShadow: isSelected ? `0 0 10px ${prod.colorHex}` : 'none',
                      }}
                    />
                    <span>0{idx + 1} {prod.name.replace('Puff ', '')}</span>
                  </button>
                );
              })}
            </div>

            {/* End of Section 2 UI Overlay */}
          </div>
        </div>

      {/* 3D Puffy Interactive Footer */}
      <Puffy3DFooter />

      {/* Slide-out Navigation Drawer */}
      <NavigationMenuDrawer
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        onSelectProduct={(prod) => {
          setActiveProduct(prod);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* Minimal Search Modal */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectProduct={(prod) => {
          setActiveProduct(prod);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
      />
    </main>
  );
}


