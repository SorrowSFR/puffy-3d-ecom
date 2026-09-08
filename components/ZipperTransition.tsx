'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { sound } from '@/lib/sound';

interface ZipperTransitionProps {
  onComplete?: () => void;
}

export default function ZipperTransition({ onComplete }: ZipperTransitionProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isRevealed, setIsRevealed] = useState(false);
  const [progress, setProgress] = useState(0);
  const [audioStarted, setAudioStarted] = useState(false);
  const animFrameRef = useRef<number | null>(null);

  const startAudio = useCallback(() => {
    if (audioRef.current && !audioStarted) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().then(() => {
        setAudioStarted(true);
      }).catch(() => {
        sound.playZipper();
      });
    }
  }, [audioStarted]);

  useEffect(() => {
    // 1. Prepare Zipper Audio (User-provided realistic zipper sound effect)
    const audio = new Audio('/assets/transitions/zipper-sound.mp3');
    audio.volume = 0.9;
    audioRef.current = audio;

    // 2. Prepare Zipper Video
    const video = document.createElement('video');
    video.src = '/assets/transitions/zipper-reveal.mp4';
    video.crossOrigin = 'anonymous';
    video.muted = true; // Required for browser autoplay
    video.playsInline = true;
    video.autoplay = true;
    video.preload = 'auto';
    video.playbackRate = 1.45; // Smooth, cinematic 5.2s duration
    videoRef.current = video;

    const canvas = canvasRef.current;
    if (!canvas) return;

    // Optimized internal processing resolution (960x540 @ 16:9)
    // Ensures buttery-smooth 60fps real-time pixel despill without CPU bottlenecks
    canvas.width = 960;
    canvas.height = 540;

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    let isFinished = false;

    const renderLoop = () => {
      if (isFinished) return;

      if (!video.paused && !video.ended) {
        const w = canvas.width;
        const h = canvas.height;

        ctx.drawImage(video, 0, 0, w, h);
        const imgData = ctx.getImageData(0, 0, w, h);
        const data = imgData.data;
        const len = data.length;

        // Real-time green-screen chroma key with despill
        for (let i = 0; i < len; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          const maxRB = r > b ? r : b;
          const greenDiff = g - maxRB;

          if (g > 55 && greenDiff > 20) {
            if (greenDiff > 40) {
              data[i + 3] = 0; // Transparent opening
            } else {
              const factor = 1.0 - (greenDiff - 20) / 20;
              data[i + 3] = Math.floor(data[i + 3] * factor);
              data[i + 1] = maxRB; // Despill green tint on garment edges
            }
          }
        }
        ctx.putImageData(imgData, 0, 0);

        // Update progress bar
        const dur = video.duration || 7.5;
        const currentProg = Math.min(100, Math.round((video.currentTime / dur) * 100));
        setProgress(currentProg);
      }

      // Finish reveal when jacket unzips fully off-screen (~7.0s)
      if (video.currentTime >= 7.0 || video.ended) {
        isFinished = true;
        setIsRevealed(true);
        if (onComplete) onComplete();
        return;
      }

      animFrameRef.current = requestAnimationFrame(renderLoop);
    };

    // Auto-start video playback and trigger zipper audio
    video.play().then(() => {
      animFrameRef.current = requestAnimationFrame(renderLoop);
      // Attempt immediate audio playback
      audio.play().then(() => {
        setAudioStarted(true);
      }).catch(() => {
        // Autoplay policy: listen to first user click or tap to start audio
        const handleUserGesture = () => {
          startAudio();
          window.removeEventListener('pointerdown', handleUserGesture);
        };
        window.addEventListener('pointerdown', handleUserGesture);
      });
    }).catch(() => {
      const handleUserGesture = () => {
        video.play();
        startAudio();
        animFrameRef.current = requestAnimationFrame(renderLoop);
        window.removeEventListener('pointerdown', handleUserGesture);
      };
      window.addEventListener('pointerdown', handleUserGesture);
    });

    return () => {
      isFinished = true;
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      video.pause();
      audio.pause();
    };
  }, [onComplete, startAudio]);

  const handleSkip = () => {
    setIsRevealed(true);
    if (audioRef.current) audioRef.current.pause();
    if (onComplete) onComplete();
  };

  return (
    <AnimatePresence>
      {!isRevealed && (
        <motion.div
          key="zipper-loader-overlay"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.05, filter: 'blur(10px)' }}
          transition={{ duration: 0.95, ease: [0.16, 1, 0.3, 1] }}
          onClick={startAudio}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            overflow: 'hidden',
            backgroundColor: 'transparent',
            cursor: 'default',
          }}
        >
          {/* Keyed Canvas (Displays unzipping jacket while revealing 3D scene underneath) */}
          <canvas
            ref={canvasRef}
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />

          {/* Luxury Unzipping Brand Indicator (Bottom Center) */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.6, delay: 0.2 }}
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
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: 'rgba(20, 8, 38, 0.6)',
                backdropFilter: 'blur(20px)',
                padding: '8px 20px',
                borderRadius: '999px',
                border: '1px solid rgba(255, 255, 255, 0.18)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
              }}
            >
              <span
                style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  background: '#00e5ff',
                  boxShadow: '0 0 10px #00e5ff',
                  display: 'inline-block',
                }}
              />
              <span
                style={{
                  color: 'rgba(255, 255, 255, 0.85)',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  letterSpacing: '0.16em',
                  textTransform: 'uppercase',
                }}
              >
                Unzipping Collection
              </span>
              <span
                style={{
                  color: 'rgba(181, 124, 255, 0.9)',
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  marginLeft: '4px',
                }}
              >
                {progress}%
              </span>
            </div>

            {/* Glowing progress line */}
            <div
              style={{
                width: '180px',
                height: '2px',
                background: 'rgba(255, 255, 255, 0.15)',
                borderRadius: '999px',
                overflow: 'hidden',
              }}
            >
              <motion.div
                style={{
                  height: '100%',
                  width: `${progress}%`,
                  background: 'linear-gradient(90deg, #b57cff, #00e5ff)',
                  boxShadow: '0 0 8px #00e5ff',
                  transition: 'width 0.1s linear',
                }}
              />
            </div>
          </motion.div>

          {/* Discreet Skip Button */}
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSkip}
            style={{
              position: 'absolute',
              bottom: '36px',
              right: '36px',
              pointerEvents: 'auto',
              background: 'rgba(20, 8, 38, 0.65)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              color: 'rgba(255, 255, 255, 0.75)',
              fontSize: '0.72rem',
              fontWeight: 700,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              padding: '8px 18px',
              borderRadius: '999px',
              cursor: 'pointer',
              zIndex: 10,
              transition: 'all 0.2s ease',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
            }}
          >
            Skip Reveal
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
