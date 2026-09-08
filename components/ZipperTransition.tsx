'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { sound } from '@/lib/sound';

interface ZipperTransitionProps {
  onComplete?: () => void;
}

export default function ZipperTransition({ onComplete }: ZipperTransitionProps) {
  const [progress, setProgress] = useState(0);
  const [isRevealed, setIsRevealed] = useState(false);
  const hasCompletedRef = useRef(false);
  const startTimeRef = useRef<number | null>(null);
  const animIdRef = useRef<number | null>(null);

  const finishTransition = useCallback(() => {
    if (hasCompletedRef.current) return;
    hasCompletedRef.current = true;
    setIsRevealed(true);
    if (onComplete) {
      onComplete();
    }
  }, [onComplete]);

  const handleSkip = useCallback(() => {
    finishTransition();
  }, [finishTransition]);

  useEffect(() => {
    // Attempt audio playback
    const audio = new Audio('/assets/transitions/zipper-sound.mp3');
    audio.volume = 0.85;

    const playAudio = () => {
      audio.play().catch(() => {
        // Fallback to Web Audio synthesized zipper sound
        sound.playZipper();
      });
    };

    playAudio();

    // User gesture listener in case browser blocked autoplay
    const onUserInteraction = () => {
      playAudio();
      window.removeEventListener('pointerdown', onUserInteraction);
    };
    window.addEventListener('pointerdown', onUserInteraction);

    // Smooth, cinematic 2.2-second center unzip animation
    const DURATION_MS = 2200;

    const animate = (now: number) => {
      if (startTimeRef.current === null) {
        startTimeRef.current = now;
      }
      const elapsed = now - startTimeRef.current;
      const t = Math.min(elapsed / DURATION_MS, 1.0);

      // Smooth custom ease-in-out curve
      const easeT = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;

      setProgress(Math.round(easeT * 100));

      if (t < 1.0) {
        animIdRef.current = requestAnimationFrame(animate);
      } else {
        // Unzip complete!
        finishTransition();
      }
    };

    animIdRef.current = requestAnimationFrame(animate);

    // Hard fallback timeout: guarantees completion within 3.0s under all circumstances
    const fallbackTimer = setTimeout(() => {
      finishTransition();
    }, 3000);

    return () => {
      if (animIdRef.current) cancelAnimationFrame(animIdRef.current);
      clearTimeout(fallbackTimer);
      window.removeEventListener('pointerdown', onUserInteraction);
      audio.pause();
    };
  }, [finishTransition]);

  // Normalized progress (0 to 1)
  const p = progress / 100;

  // Geometry calculations for centered unzipping
  // The zipper is centered exactly at X = 50%
  const sliderY = p * 105; // moves from 0% down to 105%
  const topApertureHalfWidth = p * 58; // top opening widens up to 58% on either side

  const leftClip = `polygon(0% 0%, ${Math.max(0, 50 - topApertureHalfWidth)}% 0%, 50% ${Math.min(100, sliderY)}%, 50% 100%, 0% 100%)`;
  const rightClip = `polygon(100% 0%, ${Math.min(100, 50 + topApertureHalfWidth)}% 0%, 50% ${Math.min(100, sliderY)}%, 50% 100%, 100% 100%)`;

  return (
    <AnimatePresence>
      {!isRevealed && (
        <motion.div
          key="zipper-transition-overlay"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.65, ease: [0.16, 1, 0.3, 1] } }}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            overflow: 'hidden',
            backgroundColor: 'transparent',
            userSelect: 'none',
            pointerEvents: p > 0.88 ? 'none' : 'auto',
          }}
        >
          {/* --------------------------------------------------------------- */}
          {/* LEFT FLAP: Quilted Down Cushion with Center Seam Clip Path      */}
          {/* --------------------------------------------------------------- */}
          <motion.div
            style={{
              position: 'absolute',
              inset: 0,
              clipPath: leftClip,
              WebkitClipPath: leftClip,
              backgroundImage: 'url(/assets/transitions/puffer-fabric-bg.jpg)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              boxShadow: 'inset -8px 0 25px rgba(0, 0, 0, 0.65)',
              transform: `translateX(-${p > 0.85 ? (p - 0.85) * 400 : 0}px)`,
              transition: 'transform 0.1s linear',
            }}
          >
            {/* Iridescent Purple Sheen Overlay */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background:
                  'linear-gradient(135deg, rgba(147, 51, 234, 0.25) 0%, rgba(236, 72, 153, 0.15) 50%, rgba(6, 182, 212, 0.20) 100%)',
                mixBlendMode: 'color-dodge',
              }}
            />
            {/* Dark Seam Shadow along the center split */}
            <div
              style={{
                position: 'absolute',
                top: 0,
                bottom: 0,
                right: '50%',
                width: '30px',
                background: 'linear-gradient(to left, rgba(0,0,0,0.55), transparent)',
                pointerEvents: 'none',
              }}
            />
          </motion.div>

          {/* --------------------------------------------------------------- */}
          {/* RIGHT FLAP: Quilted Down Cushion with Center Seam Clip Path     */}
          {/* --------------------------------------------------------------- */}
          <motion.div
            style={{
              position: 'absolute',
              inset: 0,
              clipPath: rightClip,
              WebkitClipPath: rightClip,
              backgroundImage: 'url(/assets/transitions/puffer-fabric-bg.jpg)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              boxShadow: 'inset 8px 0 25px rgba(0, 0, 0, 0.65)',
              transform: `translateX(${p > 0.85 ? (p - 0.85) * 400 : 0}px)`,
              transition: 'transform 0.1s linear',
            }}
          >
            {/* Iridescent Purple Sheen Overlay */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background:
                  'linear-gradient(135deg, rgba(6, 182, 212, 0.20) 0%, rgba(236, 72, 153, 0.15) 50%, rgba(147, 51, 234, 0.25) 100%)',
                mixBlendMode: 'color-dodge',
              }}
            />
            {/* Dark Seam Shadow along the center split */}
            <div
              style={{
                position: 'absolute',
                top: 0,
                bottom: 0,
                left: '50%',
                width: '30px',
                background: 'linear-gradient(to right, rgba(0,0,0,0.55), transparent)',
                pointerEvents: 'none',
              }}
            />
          </motion.div>

          {/* --------------------------------------------------------------- */}
          {/* CENTER METALLIC ZIPPER TRACK (Only below slider position)       */}
          {/* --------------------------------------------------------------- */}
          <div
            style={{
              position: 'absolute',
              top: `${Math.min(100, sliderY)}%`,
              bottom: 0,
              left: '50%',
              transform: 'translateX(-50%)',
              width: '12px',
              display: p < 0.96 ? 'flex' : 'none',
              flexDirection: 'column',
              alignItems: 'center',
              pointerEvents: 'none',
              zIndex: 10,
              boxShadow: '0 0 10px rgba(0, 0, 0, 0.6)',
            }}
          >
            {/* Interlocking Chrome Teeth Pattern */}
            <div
              style={{
                width: '10px',
                height: '100%',
                background:
                  'repeating-linear-gradient(0deg, #d1d5db 0px, #d1d5db 3px, #4b5563 3px, #1f2937 6px)',
                borderRadius: '2px',
                border: '1px solid rgba(255, 255, 255, 0.35)',
              }}
            />
          </div>

          {/* --------------------------------------------------------------- */}
          {/* METALLIC ZIPPER SLIDER & PULL TAB (Glides down Center X = 50%)   */}
          {/* --------------------------------------------------------------- */}
          {p < 0.98 && (
            <div
              style={{
                position: 'absolute',
                top: `${sliderY}%`,
                left: '50%',
                transform: 'translate(-50%, -50%)',
                zIndex: 20,
                pointerEvents: 'none',
                filter: 'drop-shadow(0 6px 16px rgba(0,0,0,0.75))',
              }}
            >
              {/* Metallic Slider Body */}
              <div
                style={{
                  width: '34px',
                  height: '42px',
                  background: 'linear-gradient(135deg, #f8fafc 0%, #cbd5e1 35%, #64748b 70%, #94a3b8 100%)',
                  borderRadius: '6px',
                  border: '1.5px solid rgba(255, 255, 255, 0.85)',
                  boxShadow: 'inset 0 1px 3px rgba(255, 255, 255, 0.9), 0 4px 12px rgba(0, 0, 0, 0.5)',
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {/* Center Ridge */}
                <div
                  style={{
                    width: '4px',
                    height: '24px',
                    background: 'linear-gradient(180deg, #ffffff, #475569)',
                    borderRadius: '2px',
                  }}
                />
              </div>

              {/* Dangling Pull Tab with PUFFY Engraving */}
              <div
                style={{
                  width: '24px',
                  height: '48px',
                  margin: '-4px auto 0',
                  background: 'linear-gradient(180deg, #e2e8f0 0%, #94a3b8 60%, #475569 100%)',
                  borderRadius: '4px 4px 10px 10px',
                  border: '1.5px solid rgba(255, 255, 255, 0.75)',
                  boxShadow: '0 6px 14px rgba(0, 0, 0, 0.55)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <span
                  style={{
                    writingMode: 'vertical-rl',
                    fontSize: '0.62rem',
                    fontWeight: 900,
                    letterSpacing: '0.18em',
                    color: '#1e293b',
                    textShadow: '0 1px 1px rgba(255, 255, 255, 0.6)',
                  }}
                >
                  PUFFY
                </span>
              </div>

              {/* Sparkle Glint at Slider Nose */}
              <div
                style={{
                  position: 'absolute',
                  top: '-6px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: '16px',
                  height: '16px',
                  background: 'radial-gradient(circle, #ffffff 20%, rgba(0, 245, 255, 0.8) 60%, transparent 80%)',
                  borderRadius: '50%',
                  filter: 'blur(1px)',
                }}
              />
            </div>
          )}

          {/* --------------------------------------------------------------- */}
          {/* LUXURY STATUS BAR (Bottom Center)                               */}
          {/* --------------------------------------------------------------- */}
          <div
            style={{
              position: 'absolute',
              bottom: '36px',
              left: '50%',
              transform: 'translateX(-50%)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '10px',
              pointerEvents: 'none',
              zIndex: 30,
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '9px',
                background: 'rgba(15, 6, 30, 0.75)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                padding: '8px 22px',
                borderRadius: '999px',
                border: '1px solid rgba(255, 255, 255, 0.18)',
                boxShadow: '0 10px 30px rgba(0, 0, 0, 0.6)',
              }}
            >
              <span
                style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  backgroundColor: '#00f5ff',
                  boxShadow: '0 0 10px #00f5ff',
                  display: 'inline-block',
                }}
              />
              <span
                style={{
                  color: 'rgba(255, 255, 255, 0.88)',
                  fontSize: '0.74rem',
                  fontWeight: 800,
                  letterSpacing: '0.18em',
                  textTransform: 'uppercase',
                }}
              >
                Unzipping Collection
              </span>
              <span
                style={{
                  color: '#b57cff',
                  fontSize: '0.74rem',
                  fontWeight: 700,
                  marginLeft: '4px',
                }}
              >
                {progress}%
              </span>
            </div>

            {/* Glowing progress line */}
            <div
              style={{
                width: '190px',
                height: '2.5px',
                background: 'rgba(255, 255, 255, 0.12)',
                borderRadius: '999px',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  height: '100%',
                  width: `${progress}%`,
                  background: 'linear-gradient(90deg, #b57cff, #00f5ff)',
                  boxShadow: '0 0 10px #00f5ff',
                  transition: 'width 0.08s linear',
                }}
              />
            </div>
          </div>

          {/* --------------------------------------------------------------- */}
          {/* SKIP BUTTON (Top Right)                                         */}
          {/* --------------------------------------------------------------- */}
          <button
            type="button"
            onClick={handleSkip}
            style={{
              position: 'absolute',
              top: '24px',
              right: '28px',
              zIndex: 40,
              background: 'rgba(255, 255, 255, 0.08)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              border: '1px solid rgba(255, 255, 255, 0.18)',
              color: 'rgba(255, 255, 255, 0.75)',
              fontSize: '0.72rem',
              fontWeight: 700,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              padding: '6px 14px',
              borderRadius: '999px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            Skip Reveal
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
