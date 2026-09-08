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
  const [progress, setProgress] = useState(0);
  const [isRevealed, setIsRevealed] = useState(false);
  const [hasStartedVideo, setHasStartedVideo] = useState(false);
  const hasCompletedRef = useRef(false);
  const animFrameRef = useRef<number | null>(null);

  // Dynamic basePath to work seamlessly on Cloudflare Pages, GitHub Pages, and localhost
  const [basePath, setBasePath] = useState('');
  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.pathname.startsWith('/puffy-3d-ecom')) {
      setBasePath('/puffy-3d-ecom');
    }
  }, []);

  const finishTransition = useCallback(() => {
    if (hasCompletedRef.current) return;
    hasCompletedRef.current = true;
    setIsRevealed(true);
    if (audioRef.current) {
      audioRef.current.pause();
    }
    if (onComplete) {
      onComplete();
    }
  }, [onComplete]);

  const handleSkip = useCallback(() => {
    finishTransition();
  }, [finishTransition]);

  useEffect(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    // Target internal resolution: 1280x720 (crisp 16:9, fast GPU processing)
    canvas.width = 1280;
    canvas.height = 720;

    // Prepare audio
    const audio = new Audio(`${basePath}/assets/transitions/zipper-sound.mp3`);
    audio.volume = 0.85;
    audioRef.current = audio;

    const playAudio = () => {
      audio.play().catch(() => {
        sound.playZipper();
      });
    };

    // Try WebGL for hardware-accelerated 60fps real-time chroma-key
    let gl: WebGLRenderingContext | null = null;
    let shaderProgram: WebGLProgram | null = null;
    let texture: WebGLTexture | null = null;
    let isWebGL = false;

    try {
      gl = canvas.getContext('webgl', {
        alpha: true,
        premultipliedAlpha: false,
        antialias: true,
      });

      if (gl) {
        // Vertex shader: Full-screen quad
        const vsSource = `
          attribute vec2 a_pos;
          attribute vec2 a_uv;
          varying vec2 v_uv;
          void main() {
            gl_Position = vec4(a_pos, 0.0, 1.0);
            v_uv = a_uv;
          }
        `;

        // Fragment shader: Precise green-screen keying with edge despill
        const fsSource = `
          precision mediump float;
          uniform sampler2D u_tex;
          varying vec2 v_uv;
          void main() {
            vec4 c = texture2D(u_tex, v_uv);
            float r = c.r;
            float g = c.g;
            float b = c.b;
            float maxRB = max(r, b);
            float diff = g - maxRB;

            if (g > 0.28 && diff > 0.08) {
              if (diff > 0.18) {
                discard;
              } else {
                float factor = 1.0 - (diff - 0.08) / 0.10;
                c.a = c.a * factor;
                c.g = maxRB;
                gl_FragColor = c;
              }
            } else {
              gl_FragColor = c;
            }
          }
        `;

        const compileShader = (type: number, src: string) => {
          const shader = gl!.createShader(type);
          if (!shader) return null;
          gl!.shaderSource(shader, src);
          gl!.compileShader(shader);
          if (!gl!.getShaderParameter(shader, gl!.COMPILE_STATUS)) {
            console.warn('Shader compile failed:', gl!.getShaderInfoLog(shader));
            gl!.deleteShader(shader);
            return null;
          }
          return shader;
        };

        const vs = compileShader(gl.VERTEX_SHADER, vsSource);
        const fs = compileShader(gl.FRAGMENT_SHADER, fsSource);

        if (vs && fs) {
          shaderProgram = gl.createProgram();
          if (shaderProgram) {
            gl.attachShader(shaderProgram, vs);
            gl.attachShader(shaderProgram, fs);
            gl.linkProgram(shaderProgram);

            if (gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
              gl.useProgram(shaderProgram);

              // Setup quad geometry
              const posBuffer = gl.createBuffer();
              gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
              gl.bufferData(
                gl.ARRAY_BUFFER,
                new Float32Array([
                  -1, -1,
                   1, -1,
                  -1,  1,
                  -1,  1,
                   1, -1,
                   1,  1,
                ]),
                gl.STATIC_DRAW
              );

              const aPos = gl.getAttribLocation(shaderProgram, 'a_pos');
              gl.enableVertexAttribArray(aPos);
              gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

              const uvBuffer = gl.createBuffer();
              gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);
              // Video texture UVs (Y is inverted in WebGL by default)
              gl.bufferData(
                gl.ARRAY_BUFFER,
                new Float32Array([
                  0, 1,
                  1, 1,
                  0, 0,
                  0, 0,
                  1, 1,
                  1, 0,
                ]),
                gl.STATIC_DRAW
              );

              const aUv = gl.getAttribLocation(shaderProgram, 'a_uv');
              gl.enableVertexAttribArray(aUv);
              gl.vertexAttribPointer(aUv, 2, gl.FLOAT, false, 0, 0);

              // Setup video texture
              texture = gl.createTexture();
              gl.bindTexture(gl.TEXTURE_2D, texture);
              gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
              gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
              gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
              gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

              gl.viewport(0, 0, canvas.width, canvas.height);
              isWebGL = true;
            }
          }
        }
      }
    } catch {
      isWebGL = false;
    }

    // 2D fallback context if WebGL is unavailable
    let ctx2d: CanvasRenderingContext2D | null = null;
    if (!isWebGL) {
      canvas.width = 640;
      canvas.height = 360;
      ctx2d = canvas.getContext('2d', { willReadFrequently: true });
    }

    let isRunning = true;

    const renderLoop = () => {
      if (!isRunning || hasCompletedRef.current) return;

      if (video.readyState >= 2 && !video.paused) {
        setHasStartedVideo(true);

        if (isWebGL && gl && texture) {
          gl.clearColor(0, 0, 0, 0);
          gl.clear(gl.COLOR_BUFFER_BIT);
          gl.bindTexture(gl.TEXTURE_2D, texture);
          gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, video);
          gl.drawArrays(gl.TRIANGLES, 0, 6);
        } else if (ctx2d) {
          const w = canvas.width;
          const h = canvas.height;
          ctx2d.drawImage(video, 0, 0, w, h);
          const imgData = ctx2d.getImageData(0, 0, w, h);
          const data = imgData.data;
          const len = data.length;

          for (let i = 0; i < len; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            const maxRB = r > b ? r : b;
            const diff = g - maxRB;
            if (g > 70 && diff > 20) {
              if (diff > 45) {
                data[i + 3] = 0;
              } else {
                const f = 1.0 - (diff - 20) / 25;
                data[i + 3] = Math.floor(data[i + 3] * f);
                data[i + 1] = maxRB;
              }
            }
          }
          ctx2d.putImageData(imgData, 0, 0);
        }

        // Progress calculation
        const duration = video.duration || 8.0;
        const currentProgress = Math.min(100, Math.round((video.currentTime / duration) * 100));
        setProgress(currentProgress);

        // Completion condition: jacket is fully unzipped off-screen (~6.8s) or ended
        if (video.currentTime >= 6.8 || video.ended) {
          isRunning = false;
          finishTransition();
          return;
        }
      }

      animFrameRef.current = requestAnimationFrame(renderLoop);
    };

    // Initiate playback safely
    video.playbackRate = 1.25; // Balanced, smooth cinematic unzip

    const startPlaying = () => {
      video.play().then(() => {
        playAudio();
      }).catch(() => {
        // Retry on user interaction if browser policy strictly demanded gesture
        const onFirstTap = () => {
          video.play().catch(() => {});
          playAudio();
          window.removeEventListener('pointerdown', onFirstTap);
        };
        window.addEventListener('pointerdown', onFirstTap);
      });
    };

    if (video.readyState >= 3) {
      startPlaying();
    } else {
      video.addEventListener('canplay', startPlaying, { once: true });
    }

    animFrameRef.current = requestAnimationFrame(renderLoop);

    // Hard fallback safety timeout (7.5s): guarantees reveal under any network stall
    const fallbackTimer = setTimeout(() => {
      finishTransition();
    }, 7500);

    return () => {
      isRunning = false;
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      clearTimeout(fallbackTimer);
      video.removeEventListener('canplay', startPlaying);
      video.pause();
      if (audioRef.current) audioRef.current.pause();
    };
  }, [basePath, finishTransition]);

  return (
    <AnimatePresence>
      {!isRevealed && (
        <motion.div
          key="zipper-video-overlay"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.75, ease: [0.16, 1, 0.3, 1] } }}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            overflow: 'hidden',
            backgroundColor: 'transparent',
            userSelect: 'none',
            pointerEvents: progress > 90 ? 'none' : 'auto',
          }}
        >
          {/* 1. Initial Poster Image: Shows instantly before first video frame to prevent any blank canvas */}
          <img
            src={`${basePath}/assets/transitions/zipper-poster.jpg`}
            alt="Zipper Cover"
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '100vw',
              height: '100vh',
              objectFit: 'cover',
              objectPosition: 'center',
              display: hasStartedVideo ? 'none' : 'block',
              pointerEvents: 'none',
            }}
          />

          {/* 2. Hidden DOM Video Element for Reliable Native Decoding & Autoplay Compliance */}
          <video
            ref={videoRef}
            src={`${basePath}/assets/transitions/zipper-reveal.mp4`}
            playsInline
            muted
            autoPlay
            preload="auto"
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '1px',
              height: '1px',
              opacity: 0.001,
              pointerEvents: 'none',
              zIndex: -1,
            }}
          />

          {/* 3. Centered Video Keying Canvas (Hardware WebGL Shader with 2D Fallback) */}
          <canvas
            ref={canvasRef}
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '100vw',
              height: '100vh',
              objectFit: 'cover',
              objectPosition: 'center',
              display: 'block',
              pointerEvents: 'none',
            }}
          />

          {/* 4. Luxury "Unzipping Collection" Status Indicator (Perfect Center Alignment) */}
          <div
            style={{
              position: 'absolute',
              bottom: '36px',
              left: 0,
              right: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
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
                background: 'rgba(15, 6, 30, 0.80)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                padding: '8px 24px',
                borderRadius: '999px',
                border: '1px solid rgba(255, 255, 255, 0.18)',
                boxShadow: '0 10px 30px rgba(0, 0, 0, 0.65)',
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
                  color: 'rgba(255, 255, 255, 0.90)',
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

          {/* 5. Discreet "Skip Reveal" Button (Top Right) */}
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
              color: 'rgba(255, 255, 255, 0.80)',
              fontSize: '0.72rem',
              fontWeight: 700,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              padding: '6px 14px',
              borderRadius: '999px',
              cursor: 'pointer',
              pointerEvents: 'auto',
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
