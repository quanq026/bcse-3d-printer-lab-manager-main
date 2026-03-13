import { useEffect, useState, useMemo } from 'react';
import { createPortal } from 'react-dom';

// ── Stars ────────────────────────────────────────────────────────────────────
const STAR_COUNT = 80;
interface Star { id: number; x: number; y: number; size: number; dur: number; delay: number; amber: boolean; }

// ── Planets ──────────────────────────────────────────────────────────────────
const PLANETS = [
  { name: 'mercury', size: 5,  orbitR: 58,  dur: 7,   color: '#9ca3af', glow: '#6b7280',  ring: false, startDeg: 20  },
  { name: 'venus',   size: 10, orbitR: 95,  dur: 14,  color: '#fcd34d', glow: '#f59e0b',  ring: false, startDeg: 110 },
  { name: 'earth',   size: 11, orbitR: 138, dur: 25,  color: '#3b82f6', glow: '#1d4ed8',  ring: false, startDeg: 200 },
  { name: 'mars',    size: 7,  orbitR: 180, dur: 42,  color: '#ef4444', glow: '#dc2626',  ring: false, startDeg: 300 },
  { name: 'jupiter', size: 22, orbitR: 248, dur: 90,  color: '#d97706', glow: '#b45309',  ring: false, startDeg: 50  },
  { name: 'saturn',  size: 17, orbitR: 318, dur: 145, color: '#fde68a', glow: '#fbbf24',  ring: true,  startDeg: 170 },
];

export const StarRain: React.FC = () => {
  const [isDark, setIsDark] = useState(() =>
    document.documentElement.classList.contains('dark')
  );

  useEffect(() => {
    const obs = new MutationObserver(() =>
      setIsDark(document.documentElement.classList.contains('dark'))
    );
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => obs.disconnect();
  }, []);

  const stars = useMemo<Star[]>(() =>
    Array.from({ length: STAR_COUNT }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 2.2 + 0.5,
      dur: Math.random() * 6 + 4,
      delay: Math.random() * 10,
      amber: Math.random() < 0.15,
    })), []
  );

  if (!isDark) return null;

  const keyframes = `
    @keyframes twinkle {
      0%,100% { opacity:0.08; transform:scale(0.7); }
      50%      { opacity:1;    transform:scale(1.4); }
    }
    @keyframes fall {
      0%   { transform:translateY(-30px); opacity:0; }
      8%   { opacity:0.9; }
      92%  { opacity:0.5; }
      100% { transform:translateY(105vh); opacity:0; }
    }
    @keyframes shoot {
      0%   { transform:translateX(0) translateY(0) rotate(-35deg); opacity:0.9; width:80px; }
      100% { transform:translateX(160px) translateY(100px) rotate(-35deg); opacity:0; width:0px; }
    }
    @keyframes sunPulse {
      0%,100% { box-shadow: 0 0 30px 10px #fbbf24, 0 0 60px 20px #f59e0b88, 0 0 100px 30px #d9770644; }
      50%      { box-shadow: 0 0 40px 16px #fde68a, 0 0 80px 28px #f59e0baa, 0 0 130px 40px #d9770666; }
    }
    @keyframes moonOrbit {
      from { transform: rotate(0deg) translateX(18px) rotate(0deg); }
      to   { transform: rotate(360deg) translateX(18px) rotate(-360deg); }
    }
    ${PLANETS.map(p => `
    @keyframes orbit-${p.name} {
      from { transform: rotate(${p.startDeg}deg) translateX(${p.orbitR}px) rotate(-${p.startDeg}deg); }
      to   { transform: rotate(${p.startDeg + 360}deg) translateX(${p.orbitR}px) rotate(-${p.startDeg + 360}deg); }
    }`).join('')}
  `;

  // Sun positioned at center-left, below the main jobs table section
  const SUN_X = 42;
  const SUN_Y = 67;

  return createPortal(
    <>
      <style>{keyframes}</style>

      {/* ── Container ── */}
      <div
        aria-hidden="true"
        style={{
          position: 'fixed', inset: 0, pointerEvents: 'none',
          zIndex: 0, overflow: 'hidden',
        }}
      >
        {/* ── Stars ── */}
        {stars.map(s => (
          <div key={s.id} style={{
            position: 'absolute',
            left: `${s.x}%`,
            top: s.size > 1.8 ? `${s.y}%` : '-8px',
            width: s.size,
            height: s.size,
            borderRadius: '50%',
            background: s.amber ? '#fbbf24' : '#fff',
            boxShadow: s.amber
              ? `0 0 ${s.size*3}px #f59e0b, 0 0 ${s.size*5}px #d97706`
              : `0 0 ${s.size*2}px rgba(255,255,255,0.7)`,
            animation: s.size > 1.8
              ? `twinkle ${s.dur}s ${s.delay}s ease-in-out infinite`
              : `fall ${s.dur + 5}s ${s.delay}s linear infinite`,
          }} />
        ))}

        {/* ── Shooting stars ── */}
        {[
          { left: '12%', top: '8%',  delay: '0s',   dur: '4s' },
          { left: '45%', top: '18%', delay: '6s',   dur: '3.5s' },
          { left: '68%', top: '6%',  delay: '11s',  dur: '5s' },
          { left: '25%', top: '35%', delay: '16s',  dur: '3s' },
        ].map((s, i) => (
          <div key={`shoot-${i}`} style={{
            position: 'absolute', left: s.left, top: s.top,
            height: '1.5px',
            background: 'linear-gradient(90deg, transparent, #fbbf24, #fff)',
            borderRadius: '2px',
            opacity: 0,
            transformOrigin: 'left center',
            animation: `shoot ${s.dur} ${s.delay} ease-out infinite`,
          }} />
        ))}

        {/* ── Solar System ── */}
        <div style={{
          position: 'absolute',
          left: `${SUN_X}%`, top: `${SUN_Y}%`,
          transform: 'translate(-50%, -50%)',
        }}>
          {/* Orbit rings */}
          {PLANETS.map(p => (
            <div key={`ring-${p.name}`} style={{
              position: 'absolute',
              width: p.orbitR * 2, height: p.orbitR * 2,
              top: -p.orbitR, left: -p.orbitR,
              borderRadius: '50%',
              border: '1px solid rgba(255,255,255,0.06)',
            }} />
          ))}

          {/* Sun */}
          <div style={{
            position: 'absolute',
            width: 36, height: 36,
            top: -18, left: -18,
            borderRadius: '50%',
            background: 'radial-gradient(circle at 38% 35%, #fef3c7, #fbbf24 40%, #f59e0b 70%, #d97706)',
            animation: 'sunPulse 3s ease-in-out infinite',
          }} />

          {/* Planets */}
          {PLANETS.map(p => (
            <div key={p.name} style={{
              position: 'absolute',
              top: 0, left: 0,
              width: 0, height: 0,
              animation: `orbit-${p.name} ${p.dur}s linear infinite`,
            }}>
              {/* Planet body */}
              <div style={{
                position: 'absolute',
                width: p.size, height: p.size,
                top: -p.size / 2, left: -p.size / 2,
                borderRadius: '50%',
                background: p.name === 'earth'
                  ? 'radial-gradient(circle at 35% 35%, #60a5fa, #3b82f6 50%, #1e40af)'
                  : p.name === 'jupiter'
                  ? 'radial-gradient(circle at 35% 40%, #fde68a, #d97706 40%, #92400e)'
                  : p.name === 'saturn'
                  ? 'radial-gradient(circle at 35% 35%, #fef3c7, #fde68a 50%, #fbbf24)'
                  : p.name === 'mars'
                  ? 'radial-gradient(circle at 35% 35%, #fca5a5, #ef4444 50%, #dc2626)'
                  : p.name === 'venus'
                  ? 'radial-gradient(circle at 35% 35%, #fef3c7, #fcd34d 50%, #f59e0b)'
                  : 'radial-gradient(circle at 35% 35%, #e5e7eb, #9ca3af 50%, #6b7280)',
                boxShadow: `0 0 ${p.size * 1.5}px ${p.glow}80`,
              }}>
                {/* Saturn ring */}
                {p.ring && (
                  <div style={{
                    position: 'absolute',
                    width: p.size * 2.6, height: p.size * 0.5,
                    top: '50%', left: '50%',
                    transform: 'translate(-50%, -50%) rotateX(70deg)',
                    borderRadius: '50%',
                    border: `3px solid rgba(253,230,138,0.5)`,
                    boxSizing: 'border-box',
                  }} />
                )}
              </div>

              {/* Earth's moon */}
              {p.name === 'earth' && (
                <div style={{
                  position: 'absolute',
                  top: -p.size / 2, left: -p.size / 2,
                  width: p.size, height: p.size,
                  animation: 'moonOrbit 2.5s linear infinite',
                }}>
                  <div style={{
                    position: 'absolute',
                    width: 3, height: 3,
                    top: -1.5, left: -1.5,
                    borderRadius: '50%',
                    background: '#d1d5db',
                    boxShadow: '0 0 4px #9ca3af',
                  }} />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Subtle nebula glow in background */}
        <div style={{
          position: 'absolute',
          width: '40vw', height: '40vw',
          right: '-5%', bottom: '-5%',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(217,119,6,0.07) 0%, transparent 70%)',
          filter: 'blur(40px)',
        }} />
        <div style={{
          position: 'absolute',
          width: '30vw', height: '30vw',
          left: '5%', top: '20%',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(59,130,246,0.05) 0%, transparent 70%)',
          filter: 'blur(40px)',
        }} />
      </div>
    </>,
    document.body
  );
};
