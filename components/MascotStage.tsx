'use client';

import React, { useState } from 'react';
import { Sparkles, Heart, Zap, Smile, Compass, Feather } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function MascotStage() {
  const [activeAction, setActiveAction] = useState<'front' | 'bounce' | 'wave' | 'float' | 'squish'>('front');
  const [activeExpression, setActiveExpression] = useState('happy');
  const [activeAccessory, setActiveAccessory] = useState<string | null>('star-bag');
  const [speechText, setSpeechText] = useState('Squishy outside, brighter inside ♡');

  const actions = [
    { id: 'front', label: 'Standing', img: '/assets/mascot/puffy-front.png', speech: 'Wear a brighter world ♡' },
    { id: 'bounce', label: 'Bounce', img: '/assets/mascot/actions/bounce.png', speech: 'Bouncing higher into the clouds!' },
    { id: 'wave', label: 'Waving', img: '/assets/mascot/actions/wave.png', speech: 'Hi friend! Ready to puff?' },
    { id: 'float', label: 'Floating', img: '/assets/mascot/actions/float.png', speech: 'Zero gravity comfort ~' },
    { id: 'squish', label: 'Squish', img: '/assets/mascot/actions/squish.png', speech: 'Squish me! Super soft ~' },
  ];

  const expressions = [
    { id: 'happy', label: 'Happy', img: '/assets/mascot/expressions/happy.png', speech: 'Always beaming!' },
    { id: 'excited', label: 'Excited', img: '/assets/mascot/expressions/excited.png', speech: 'New drop is here!!' },
    { id: 'wink', label: 'Wink', img: '/assets/mascot/expressions/wink.png', speech: 'Looking fresh today ;) ' },
    { id: 'curious', label: 'Curious', img: '/assets/mascot/expressions/curious.png', speech: 'What buffer is your favorite?' },
    { id: 'sleepy', label: 'Sleepy', img: '/assets/mascot/expressions/sleepy.png', speech: 'Like sleeping on a cloud zzz' },
    { id: 'surprised', label: 'Surprised', img: '/assets/mascot/expressions/surprised.png', speech: 'Whoa! So reflective!' },
  ];

  const accessories = [
    { id: 'star-bag', name: 'Star Bag', desc: 'Wear Your Light', img: '/assets/mascot/accessories/star-bag.png' },
    { id: 'puffer-hat', name: 'Puffer Hat', desc: 'Extra Cute Squish', img: '/assets/mascot/accessories/puffer-hat.png' },
    { id: 'headphones', name: 'Star Headphones', desc: 'Tune Your World', img: '/assets/mascot/accessories/headphones.png' },
    { id: 'puff-wings', name: 'Puff Wings', desc: 'Small Wings, Big Dreams', img: '/assets/mascot/accessories/puff-wings.png' },
  ];

  const handleActionSelect = (actionId: typeof activeAction, speech: string) => {
    setActiveAction(actionId);
    setSpeechText(speech);
  };

  const handleExpressionSelect = (exprId: string, speech: string) => {
    setActiveExpression(exprId);
    setSpeechText(speech);
  };

  const currentActionObj = actions.find((a) => a.id === activeAction) || actions[0];

  return (
    <section
      id="mascot-section"
      style={{
        position: 'relative',
        padding: '120px 24px',
        maxWidth: '1280px',
        margin: '0 auto',
        zIndex: 10,
      }}
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        style={{ textAlign: 'center', marginBottom: '60px' }}
      >
        <div className="plushy-badge" style={{ marginBottom: '16px' }}>
          <Sparkles size={14} color="#FF4FD8" />
          Brand Mascot Studio
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
          Meet <span className="gradient-text-pink-blue">Puffy</span>
        </h2>
        <p
          style={{
            fontSize: '1.2rem',
            color: 'var(--c-lilac)',
            maxWidth: '600px',
            margin: '0 auto',
          }}
        >
          Your squishy, cheerful companion engineered with the same sub-zero cloud down and iridescent nano-shell.
        </p>
      </motion.div>

      {/* Main Mascot Stage Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '32px',
          alignItems: 'center',
        }}
      >
        {/* Left: Interactive Puffy Stage */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="glass-panel"
          style={{
            padding: '40px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '520px',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Ambient Glow */}
          <div
            style={{
              position: 'absolute',
              width: '320px',
              height: '320px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(181,124,255,0.3) 0%, rgba(255,79,216,0.15) 50%, transparent 70%)',
              filter: 'blur(40px)',
              pointerEvents: 'none',
            }}
          />

          {/* Speech Bubble */}
          <AnimatePresence mode="wait">
            <motion.div
              key={speechText}
              initial={{ opacity: 0, y: -8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.95 }}
              transition={{ duration: 0.25 }}
              style={{
                background: 'rgba(255, 255, 255, 0.12)',
                backdropFilter: 'blur(16px)',
                border: '1px solid rgba(255, 255, 255, 0.25)',
                padding: '12px 24px',
                borderRadius: '24px',
                borderBottomLeftRadius: '4px',
                marginBottom: '24px',
                fontSize: '0.95rem',
                fontWeight: 600,
                color: '#FFFFFF',
                boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
                position: 'relative',
                zIndex: 2,
              }}
            >
              {speechText}
            </motion.div>
          </AnimatePresence>

          {/* Mascot Image with Spring Physics Squish */}
          <motion.div
            whileHover={{ scale: 1.04, rotate: 1 }}
            whileTap={{
              scale: [1, 1.25, 0.78, 1.12, 0.94, 1],
              transition: { duration: 0.6, times: [0, 0.2, 0.45, 0.7, 0.85, 1] },
            }}
            onClick={() => setSpeechText('SQUISH! Super soft cloud bounce activated ✨')}
            style={{
              cursor: 'pointer',
              position: 'relative',
              zIndex: 2,
              userSelect: 'none',
            }}
            title="Click or Tap to squish Puffy!"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <motion.img
              key={currentActionObj.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              src={currentActionObj.img}
              alt="Puffy Mascot"
              style={{
                width: 'auto',
                maxHeight: '340px',
                objectFit: 'contain',
                filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.6)) drop-shadow(0 0 35px var(--glow-pink))',
              }}
            />
          </motion.div>

          {/* Action Selector Pills */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '8px',
              justifyContent: 'center',
              marginTop: '32px',
              position: 'relative',
              zIndex: 2,
            }}
          >
            {actions.map((act) => (
              <motion.button
                key={act.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleActionSelect(act.id as typeof activeAction, act.speech)}
                style={{
                  background: activeAction === act.id ? 'linear-gradient(135deg, var(--c-lavender), var(--c-pink))' : 'rgba(255,255,255,0.08)',
                  color: '#fff',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '999px',
                  padding: '8px 18px',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                }}
              >
                {act.label}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Right: Expressions & Accessories Studio */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Facial Expressions Panel */}
          <div className="glass-panel" style={{ padding: '32px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '18px' }}>
              <Smile size={18} color="#00D9FF" />
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Facial Expressions</h3>
            </div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '12px',
              }}
            >
              {expressions.map((exp) => (
                <motion.div
                  key={exp.id}
                  whileHover={{ scale: 1.06 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleExpressionSelect(exp.id, exp.speech)}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '12px',
                    borderRadius: '18px',
                    background: activeExpression === exp.id ? 'rgba(181, 124, 255, 0.25)' : 'rgba(255, 255, 255, 0.05)',
                    border: activeExpression === exp.id ? '1px solid var(--c-lavender)' : '1px solid rgba(255, 255, 255, 0.1)',
                    cursor: 'pointer',
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={exp.img}
                    alt={exp.label}
                    style={{
                      width: '60px',
                      height: '60px',
                      borderRadius: '12px',
                      objectFit: 'cover',
                    }}
                  />
                  <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>{exp.label}</span>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Accessories Rack */}
          <div className="glass-panel" style={{ padding: '32px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '18px' }}>
              <Sparkles size={18} color="#FF4FD8" />
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Collectible Accessories</h3>
            </div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '12px',
              }}
            >
              {accessories.map((acc) => (
                <motion.div
                  key={acc.id}
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => {
                    setActiveAccessory(acc.id);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px',
                    borderRadius: '18px',
                    background: activeAccessory === acc.id ? 'rgba(255, 79, 216, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                    border: activeAccessory === acc.id ? '1px solid var(--c-pink)' : '1px solid rgba(255, 255, 255, 0.1)',
                    cursor: 'pointer',
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={acc.img}
                    alt={acc.name}
                    style={{
                      width: '50px',
                      height: '50px',
                      borderRadius: '10px',
                      objectFit: 'cover',
                    }}
                  />
                  <div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>{acc.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--c-lilac)' }}>{acc.desc}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Sustainable Badges */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '16px',
          justifyContent: 'center',
          marginTop: '60px',
        }}
      >
        <div className="plushy-badge">
          <Feather size={14} color="#00D9FF" />
          Ultra Soft Cloud Down
        </div>
        <div className="plushy-badge">
          <Zap size={14} color="#FF4FD8" />
          Highly Reflective Nano-Glaze
        </div>
        <div className="plushy-badge">
          <Heart size={14} color="#B57CFF" />
          Squish Interactive Outerwear
        </div>
        <div className="plushy-badge">
          <Compass size={14} color="#F7F9FF" />
          100% Recycled Eco-Conscious
        </div>
      </div>
    </section>
  );
}
