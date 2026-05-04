import { useState, useEffect, useRef } from 'react'
import { T } from '../tokens'

const STAGE_TIMINGS = [0, 5200, 11500, 17500]
const LOOP_MS = 22000

const STAGES = [
  { label: 'Order status',  value: 'Packed & ready',   iconIdx: 0, color: T.accent },
  { label: 'In transit',    value: 'Out for delivery',  iconIdx: 1, color: T.accent },
  { label: 'Almost there',  value: 'Arriving now',      iconIdx: 2, color: T.accent },
  { label: 'Delivered',     value: 'Handed over ✓', iconIdx: 3, color: T.mint },
]


export default function HeroLanding({ onStart }) {
  const [stageIdx, setStageIdx] = useState(0)
  const [prevIdx,  setPrevIdx]  = useState(0)
  const [fading,   setFading]   = useState(false)
  const rafRef = useRef(null)

  useEffect(() => {
    let lastIdx = -1
    const tick = () => {
      const t = performance.now() % LOOP_MS
      let idx = 0
      for (let i = STAGE_TIMINGS.length - 1; i >= 0; i--) {
        if (t >= STAGE_TIMINGS[i]) { idx = i; break }
      }
      if (idx !== lastIdx) {
        lastIdx = idx
        setPrevIdx(p => p)
        setFading(true)
        setTimeout(() => {
          setPrevIdx(idx)
          setStageIdx(idx)
          setFading(false)
        }, 180)
      }
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [])

  return (
    <div style={{ minHeight: '100vh', background: T.bg0, color: T.fg0,
      fontFamily: "'Montserrat', -apple-system, sans-serif" }}>
      <HeroNav onStart={onStart} />
      <HeroSection onStart={onStart} stageIdx={stageIdx} fading={fading} />
      <TrustStrip />
    </div>
  )
}

/* ---- Top Nav ---- */
function HeroNav({ onStart }) {
  return (
    <header style={{
      background: 'rgba(10,11,20,0.92)', backdropFilter: 'blur(18px)',
      WebkitBackdropFilter: 'blur(18px)',
      borderBottom: `1px solid ${T.line}`,
      position: 'sticky', top: 0, zIndex: 50,
    }}>
      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '0 20px',
        height: 68, display: 'flex', alignItems: 'center', gap: 16 }}>

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
          <div style={{
            width: 38, height: 38, borderRadius: 12,
            background: `linear-gradient(135deg, ${T.primary}, ${T.accent})`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 20, fontWeight: 900, color: '#FFF',
            boxShadow: '0 6px 20px rgba(255,77,109,0.4)',
          }}>S</div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 800, color: T.fg0, letterSpacing: -0.5, lineHeight: 1 }}>
              shop<span style={{ color: T.primary }}>Smart</span>
            </div>
            <div style={{ fontSize: 9, color: T.fg3, letterSpacing: 1.2, textTransform: 'uppercase', marginTop: 2 }}>
              Decision Intelligence for eCommerce
            </div>
          </div>
        </div>

        {/* Right links */}
        <div className="hidden md:flex" style={{ alignItems: 'center', gap: 12, flexShrink: 0, marginLeft: 'auto' }}>
          <NavLink top="Hello, Sign in" bot="Account & Lists" />
          <NavLink top="Returns" bot="& Orders" />
          <button onClick={onStart}
            style={{
              background: `linear-gradient(135deg, ${T.primary}, ${T.accent})`,
              border: 'none', color: '#FFF', fontSize: 13, fontWeight: 800,
              padding: '10px 22px', borderRadius: 999, cursor: 'pointer',
              fontFamily: 'inherit', letterSpacing: 0.3,
              boxShadow: '0 4px 16px rgba(255,77,109,0.4)',
              display: 'flex', alignItems: 'center', gap: 6,
            }}>
            <svg width={14} height={14} viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
              <polygon points="13 2 4 14 12 14 11 22 20 10 12 10 13 2"/>
            </svg>
            Try Demo
          </button>
        </div>
      </div>
    </header>
  )
}

function NavLink({ top, bot }) {
  return (
    <div style={{ cursor: 'pointer' }}>
      <div style={{ fontSize: 10, color: T.fg3 }}>{top}</div>
      <div style={{ fontSize: 12, fontWeight: 700, color: T.fg1 }}>{bot}</div>
    </div>
  )
}

/* ---- Hero Section ---- */
function HeroSection({ onStart, stageIdx, fading }) {
  const stage = STAGES[stageIdx]

  return (
    <section style={{
      background: `linear-gradient(160deg, ${T.bg0} 60%, #1A0E1F 100%)`,
      padding: '48px 0 56px',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Ambient glow */}
      <div style={{
        position: 'absolute', top: '-20%', right: '5%',
        width: 500, height: 500, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(255,77,109,0.10) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div className="grid grid-cols-1 lg:grid-cols-2" style={{ maxWidth: 1400, margin: '0 auto', padding: '0 24px',
        gap: 48, alignItems: 'center' }}>

        {/* Left */}
        <div style={{ animation: 'fadeIn 0.6s ease-out' }}>
          <div className="flex flex-col sm:flex-row sm:items-center" style={{ gap: 10, marginBottom: 24 }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: T.primaryTint, borderRadius: 999, padding: '6px 16px',
              border: `1px solid rgba(255,77,109,0.3)`,
            }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: T.primary,
                animation: 'pulseDot 1.4s ease-in-out infinite', flexShrink: 0 }} />
              <span style={{ fontSize: 12, fontWeight: 700, color: T.primary, letterSpacing: 0.3 }}>
                Live · Decision Intelligence for eCommerce
              </span>
            </div>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              background: T.skyTint, borderRadius: 999, padding: '6px 14px',
              border: `1px solid ${T.sky}44`,
            }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: T.sky, letterSpacing: 0.3 }}>
                Tech Mahindra · FICO World 2026
              </span>
            </div>
          </div>

          <h1 className="text-[30px] sm:text-[38px] lg:text-[50px]" style={{
            fontWeight: 900, lineHeight: 1.08, letterSpacing: -1.5,
            margin: '0 0 20px', color: T.fg0,
          }}>
            Smarter COD decisions.
            <br/><span style={{ color: T.primary }}>Less RTO rates.</span>
          </h1>

          <p style={{
            fontSize: 15, lineHeight: 1.7, color: T.fg2,
            margin: '0 0 28px', maxWidth: 500,
          }}>
            India's e-commerce loses <strong style={{ color: T.fg1 }}>₹180-240 on every returned COD order</strong> - and 25-30% of COD shipments never reach the customer. Decision Intelligence for eCommerce evaluates 85+ risk signals per order in real time via FICO Decision Manager, making four intelligent decisions before the order is confirmed.
          </p>

          <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 32px', display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[
              {
                color: T.mint,
                bold: '4 decisions per order, 1 DM call',
                rest: 'COD eligibility, prepaid incentive, dark store routing, delivery partner - all resolved in a single FICO Decision Manager invocation.',
              },
              {
                color: T.sky,
                bold: '85+ risk signals evaluated in parallel',
                rest: 'Phone trust, pincode history, customer RTO rate, fraud score, product risk - fetched simultaneously via PLOR.',
              },
              {
                color: T.accent,
                bold: 'RTO rate target: under 8%',
                rest: 'Down from the 25-30% industry average on COD orders, without blocking genuine buyers.',
              },
            ].map(({ color, bold, rest }, i) => (
              <li key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <span style={{
                  width: 22, height: 22, borderRadius: '50%', flexShrink: 0, marginTop: 1,
                  background: `${color}18`, border: `1.5px solid ${color}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <svg width={11} height={11} viewBox="0 0 24 24" fill="none"
                    stroke={color} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                </span>
                <span style={{ fontSize: 13, color: T.fg2, lineHeight: 1.55 }}>
                  <strong style={{ color: T.fg1 }}>{bold}</strong> {rest}
                </span>
              </li>
            ))}
          </ul>

          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 36 }}>
            <button onClick={onStart}
              style={{
                background: `linear-gradient(135deg, ${T.primary}, ${T.accent})`,
                border: 'none', color: '#FFF', fontSize: 15, fontWeight: 800,
                padding: '14px 32px', borderRadius: 999, cursor: 'pointer',
                fontFamily: 'inherit', letterSpacing: 0.2,
                boxShadow: '0 8px 28px rgba(255,77,109,0.45)',
                display: 'flex', alignItems: 'center', gap: 8, transition: 'transform .15s',
              }}
              onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.03)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>
              <svg width={16} height={16} viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                <polygon points="13 2 4 14 12 14 11 22 20 10 12 10 13 2"/>
              </svg>
              Run the Platform
            </button>
          </div>

        </div>

        {/* Right: Animated Panorama */}
        <div style={{ position: 'relative' }}>

          {/* Floating status chip */}
          <div style={{
            position: 'absolute', top: -16, left: -20, zIndex: 10,
            background: T.bg1, borderRadius: 16, padding: '10px 16px 10px 10px',
            display: 'flex', alignItems: 'center', gap: 10,
            border: `1px solid ${T.line}`,
            boxShadow: '0 12px 30px rgba(0,0,0,0.4)',
            animation: 'chipFloat 3.2s ease-in-out infinite',
            minWidth: 200,
            opacity: fading ? 0 : 1,
            transform: fading ? 'translateY(4px)' : 'translateY(0)',
            transition: 'opacity 0.18s, transform 0.18s',
          }}>
            <div style={{
              width: 38, height: 38, borderRadius: 10, flexShrink: 0,
              background: stageIdx === 3 ? T.mintTint : T.accentTint,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <ChipIcon idx={stageIdx} />
            </div>
            <div>
              <div style={{ fontSize: 10, color: T.fg3, letterSpacing: 0.5, textTransform: 'uppercase', fontWeight: 600 }}>
                {stage.label}
              </div>
              <div style={{ fontSize: 14, fontWeight: 700, color: stageIdx === 3 ? T.mint : T.accent, whiteSpace: 'nowrap' }}>
                {stage.value}
              </div>
            </div>
          </div>

          {/* DM decision chip */}
          <div style={{
            position: 'absolute', bottom: 24, right: -16, zIndex: 10,
            background: T.bg1, borderRadius: 16, padding: '10px 16px 10px 12px',
            display: 'flex', alignItems: 'center', gap: 10,
            border: `1px solid ${T.mint}44`,
            boxShadow: `0 12px 30px rgba(0,0,0,0.4), 0 0 0 1px ${T.mint}22`,
            animation: 'chipFloat 3.2s ease-in-out infinite',
            animationDelay: '1.2s',
          }}>
            <div style={{
              width: 34, height: 34, borderRadius: 10,
              background: T.mintTint,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              <svg width={16} height={16} viewBox="0 0 24 24" fill="none"
                stroke={T.mint} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                <polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
            </div>
            <div>
              <div style={{ fontSize: 9, color: T.fg3, letterSpacing: 0.8, textTransform: 'uppercase', fontWeight: 700 }}>
                Decision Output
              </div>
              <div style={{ fontSize: 13, fontWeight: 800, color: T.mint }}>ALLOW_COD</div>
            </div>
          </div>

          {/* Panorama stage */}
          <div style={{
            borderRadius: 24, overflow: 'hidden',
            background: 'linear-gradient(180deg, #C2E8FF 0%, #F5E8D8 100%)',
            boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
            position: 'relative', height: 340,
          }}>
            {/* Sky */}
            <div style={{
              position: 'absolute', top: 0, left: 0, right: 0, height: '52%',
              background: 'linear-gradient(180deg, #6EC8F5 0%, #B8E4F8 60%, #F5E8D8 100%)',
            }} />

            {/* Clouds */}
            <CloudEl cls="c1" />
            <CloudEl cls="c2" delay="8s" />
            <CloudEl cls="c3" delay="14s" />

            {/* Viewport */}
            <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
              {/* World (4 scenes wide) */}
              <div style={{
                position: 'absolute', inset: 0,
                width: '400%',
                animation: `panoramaPan 22s linear infinite`,
              }}>
                {/* Ground */}
                <div style={{
                  position: 'absolute', bottom: 0, left: 0, right: 0, height: '14%',
                  background: 'linear-gradient(180deg, #C9A97A 0%, #A8845A 100%)',
                }} />
                {/* Road dashes */}
                <div style={{
                  position: 'absolute', bottom: '8%', left: 0, width: '100%', height: 6,
                  background: 'repeating-linear-gradient(to right, #B89478 0, #B89478 36px, transparent 36px, transparent 72px)',
                  opacity: 0.7,
                }} />

                {/* Scene 1: Warehouse */}
                <Scene1 />
                {/* Scene 2: Road */}
                <Scene2 />
                {/* Scene 3: Doorstep */}
                <Scene3 />
                {/* Scene 4: Delivered */}
                <Scene4 />
              </div>
            </div>

            {/* Progress dots */}
            <div style={{
              position: 'absolute', bottom: 14, left: '50%', transform: 'translateX(-50%)',
              display: 'flex', gap: 6, zIndex: 4,
            }}>
              {[0,1,2,3].map(i => (
                <div key={i} style={{
                  height: 6, borderRadius: 3,
                  width: i === stageIdx ? 20 : 6,
                  background: i === stageIdx ? T.primary : 'rgba(255,255,255,0.4)',
                  transition: 'all 0.4s ease',
                }} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function ChipIcon({ idx }) {
  const color = idx === 3 ? T.mint : T.accent
  if (idx === 0) return (
    <svg width={18} height={18} viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
      <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
      <line x1="12" y1="22.08" x2="12" y2="12"/>
    </svg>
  )
  if (idx === 1) return (
    <svg width={18} height={18} viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="3" width="15" height="13"/>
      <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/>
      <circle cx="5.5" cy="18.5" r="2.5"/>
      <circle cx="18.5" cy="18.5" r="2.5"/>
    </svg>
  )
  if (idx === 2) return (
    <svg width={18} height={18} viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
      <circle cx="12" cy="10" r="3"/>
    </svg>
  )
  return (
    <svg width={18} height={18} viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth={2.8} strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  )
}

function CloudEl({ cls, delay = '0s' }) {
  const configs = {
    c1: { top: '8%',  left: '8%',  width: 80,  animation: 'cloudDrift 18s linear infinite' },
    c2: { top: '15%', left: '40%', width: 60,  animation: 'cloudDrift 24s linear infinite' },
    c3: { top: '6%',  left: '70%', width: 50,  animation: 'cloudDrift 30s linear infinite' },
  }
  const c = configs[cls] || configs.c1
  return (
    <div style={{
      position: 'absolute', top: c.top, left: c.left, width: c.width,
      animation: c.animation, animationDelay: delay, pointerEvents: 'none', zIndex: 2,
    }}>
      <svg viewBox="0 0 80 40" width="100%">
        <ellipse cx="40" cy="30" rx="38" ry="12" fill="rgba(255,255,255,0.9)"/>
        <ellipse cx="30" cy="24" rx="22" ry="14" fill="rgba(255,255,255,0.95)"/>
        <ellipse cx="50" cy="22" rx="18" ry="13" fill="rgba(255,255,255,0.92)"/>
      </svg>
    </div>
  )
}

/* ---- Panorama Scenes ---- */
function Scene1() {
  return (
    <div style={{ position: 'absolute', left: '0%', top: 0, width: '25%', height: '100%' }}>
      <svg viewBox="0 0 400 500" preserveAspectRatio="xMidYMid meet"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
        <path d="M0 340 Q100 300 200 330 T400 320 L400 420 L0 420 Z" fill="#F5CFA8" opacity="0.6"/>
        <rect x="60" y="180" width="280" height="200" rx="4" fill="#FFB98A"/>
        <rect x="60" y="170" width="280" height="22" fill="#FF9060"/>
        <polygon points="60,170 340,170 320,150 80,150" fill="#FF7B3E"/>
        <rect x="140" y="200" width="120" height="28" rx="4" fill="#0F1923"/>
        <text x="200" y="219" fontFamily="sans-serif" fontSize="13" fontWeight="800" fill="#FF5C1A" textAnchor="middle">SHOP-SMART</text>
        <rect x="110" y="250" width="80" height="130" rx="3" fill="#D4864C"/>
        <rect x="118" y="258" width="64" height="114" rx="2" fill="#FFE8D0"/>
        <line x1="118" y1="280" x2="182" y2="280" stroke="#D4864C" strokeWidth="1.5"/>
        <line x1="118" y1="310" x2="182" y2="310" stroke="#D4864C" strokeWidth="1.5"/>
        <line x1="118" y1="340" x2="182" y2="340" stroke="#D4864C" strokeWidth="1.5"/>
        <rect x="220" y="250" width="40" height="40" rx="3" fill="#C8E8FF"/>
        <rect x="275" y="250" width="40" height="40" rx="3" fill="#C8E8FF"/>
        <rect x="220" y="310" width="40" height="40" rx="3" fill="#C8E8FF"/>
        <rect x="275" y="310" width="40" height="40" rx="3" fill="#C8E8FF"/>
        <rect x="20" y="340" width="40" height="40" rx="3" fill="#F5C878"/>
        <rect x="20" y="340" width="40" height="40" rx="3" fill="none" stroke="#E0A848" strokeWidth="1.5"/>
        <line x1="40" y1="340" x2="40" y2="380" stroke="#E0A848" strokeWidth="1.2"/>
        <line x1="20" y1="360" x2="60" y2="360" stroke="#E0A848" strokeWidth="1.2"/>
        <rect x="22" y="300" width="38" height="40" rx="3" fill="#F5D688"/>
        <g style={{ transformOrigin: '330px 400px', animation: 'happyBob 0.8s ease-in-out infinite' }}>
          <rect x="326" y="380" width="5" height="18" fill="#1A3A6B"/>
          <rect x="334" y="380" width="5" height="18" fill="#1A3A6B"/>
          <rect x="322" y="355" width="20" height="28" rx="4" fill="#2255AA"/>
          <circle cx="332" cy="345" r="9" fill="#E8B890"/>
          <rect x="324" y="336" width="18" height="7" rx="2" fill="#FF5C1A"/>
          <rect x="340" y="345" width="4" height="14" rx="2" fill="#E8B890" transform="rotate(25 342 352)"/>
        </g>
      </svg>
    </div>
  )
}

function Scene2() {
  return (
    <div style={{ position: 'absolute', left: '25%', top: 0, width: '25%', height: '100%' }}>
      <svg viewBox="0 0 400 500" preserveAspectRatio="xMidYMid meet"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
        <path d="M0 320 Q80 290 160 310 T400 300 L400 420 L0 420 Z" fill="#F5CFA8" opacity="0.55"/>
        <rect x="40" y="260" width="6" height="120" fill="#8B5E3C"/>
        <ellipse cx="43" cy="255" rx="30" ry="10" fill="#4D9E5C" transform="rotate(-20 43 255)"/>
        <ellipse cx="43" cy="255" rx="30" ry="10" fill="#5BAD6A" transform="rotate(20 43 255)"/>
        <ellipse cx="43" cy="248" rx="28" ry="9" fill="#5BAD6A" transform="rotate(-60 43 248)"/>
        <ellipse cx="43" cy="248" rx="28" ry="9" fill="#4D9E5C" transform="rotate(60 43 248)"/>
        <rect x="330" y="250" width="8" height="130" fill="#8B5E3C"/>
        <ellipse cx="334" cy="240" rx="34" ry="44" fill="#5BAD6A"/>
        <ellipse cx="320" cy="255" rx="20" ry="28" fill="#4D9E5C"/>
        <rect x="126" y="300" width="4" height="80" fill="#5A3220"/>
        <rect x="105" y="305" width="50" height="20" rx="3" fill="#FF5C1A"/>
        <text x="130" y="319" fontFamily="sans-serif" fontSize="9" fontWeight="700" fill="#fff" textAnchor="middle">DELHI</text>
        <rect x="105" y="330" width="50" height="20" rx="3" fill="#0F1923"/>
        <text x="130" y="344" fontFamily="sans-serif" fontSize="9" fontWeight="700" fill="#fff" textAnchor="middle">2 KM</text>
        <path d="M260 120 Q265 115 270 120 M270 120 Q275 115 280 120" stroke="#0F1923" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
        <path d="M180 80 Q184 76 188 80 M188 80 Q192 76 196 80" stroke="#0F1923" strokeWidth="1.2" fill="none" strokeLinecap="round"/>
      </svg>
      {/* Scooter */}
      <div style={{
        position: 'absolute', bottom: '11%', left: '35%', width: 90, height: 100,
        transformOrigin: 'bottom center',
        animation: 'scooterBob 0.35s ease-in-out infinite',
      }}>
        <svg viewBox="0 0 120 110" width="100%" height="100%">
          <ellipse cx="60" cy="100" rx="42" ry="5" fill="#0F1923" opacity="0.15"/>
          <rect x="8" y="48" width="32" height="26" rx="4" fill="#F5D080"/>
          <rect x="8" y="48" width="32" height="26" rx="4" fill="none" stroke="#E0A848" strokeWidth="1.5"/>
          <line x1="24" y1="48" x2="24" y2="74" stroke="#E0A848" strokeWidth="1.5"/>
          <line x1="8" y1="61" x2="40" y2="61" stroke="#E0A848" strokeWidth="1.2"/>
          <path d="M22 76 Q22 66 34 66 L82 66 Q96 66 96 80 L90 90 L32 90 Z" fill="#FF5C1A"/>
          <rect x="40" y="58" width="46" height="14" rx="5" fill="#FF7B3E"/>
          <rect x="84" y="48" width="4" height="22" rx="2" fill="#3D4F5C"/>
          <rect x="78" y="45" width="16" height="5" rx="2" fill="#3D4F5C"/>
          <circle cx="94" cy="74" r="5" fill="#FFF0C8"/>
          <circle cx="94" cy="74" r="3" fill="#FFE28C"/>
          <rect x="46" y="28" width="28" height="32" rx="6" fill="#2255AA"/>
          <circle cx="60" cy="22" r="13" fill="#FDDBB4"/>
          <path d="M47 18 Q47 6 60 6 Q73 6 73 18 L73 27 L47 27 Z" fill="#0F1923"/>
          <rect x="48" y="22" width="24" height="6" rx="2" fill="#88B3F0" opacity="0.85"/>
          <rect x="46" y="27" width="28" height="5" rx="2" fill="#2255AA"/>
          <rect x="72" y="40" width="14" height="5" rx="2" fill="#FDDBB4"/>
          <g transform="translate(32,90)">
            <g style={{ animation: 'wheelSpin 0.5s linear infinite', transformOrigin: 'center' }}>
              <circle r="14" fill="#0F1923"/>
              <circle r="9" fill="#3D4F5C"/>
              <rect x="-1" y="-9" width="2" height="18" fill="#666"/>
              <rect x="-9" y="-1" width="18" height="2" fill="#666"/>
              <circle r="3" fill="#999"/>
            </g>
          </g>
          <g transform="translate(92,90)">
            <g style={{ animation: 'wheelSpin 0.5s linear infinite', transformOrigin: 'center' }}>
              <circle r="14" fill="#0F1923"/>
              <circle r="9" fill="#3D4F5C"/>
              <rect x="-1" y="-9" width="2" height="18" fill="#666"/>
              <rect x="-9" y="-1" width="18" height="2" fill="#666"/>
              <circle r="3" fill="#999"/>
            </g>
          </g>
          <g opacity="0.6">
            <line x1="-20" y1="72" x2="8" y2="72" stroke="#FFB880" strokeWidth="2" strokeLinecap="round" strokeDasharray="6 4"/>
            <line x1="-15" y1="84" x2="6" y2="84" stroke="#FFB880" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="4 4"/>
          </g>
        </svg>
      </div>
    </div>
  )
}

function Scene3() {
  return (
    <div style={{ position: 'absolute', left: '50%', top: 0, width: '25%', height: '100%' }}>
      <svg viewBox="0 0 400 500" preserveAspectRatio="xMidYMid meet"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
        <rect x="20" y="120" width="360" height="260" fill="#F5E4D8"/>
        <line x1="20" y1="220" x2="380" y2="220" stroke="#EDD0BE" strokeWidth="1"/>
        <line x1="20" y1="300" x2="380" y2="300" stroke="#EDD0BE" strokeWidth="1"/>
        <polygon points="0,120 400,120 360,60 40,60" fill="#C96A3C"/>
        <rect x="0" y="115" width="400" height="10" fill="#A84E28"/>
        <rect x="60" y="150" width="80" height="70" rx="4" fill="#C8E8FF"/>
        <rect x="60" y="150" width="80" height="70" rx="4" fill="none" stroke="#D4864C" strokeWidth="3"/>
        <line x1="100" y1="150" x2="100" y2="220" stroke="#D4864C" strokeWidth="2"/>
        <line x1="60" y1="185" x2="140" y2="185" stroke="#D4864C" strokeWidth="2"/>
        <rect x="74" y="230" width="52" height="20" rx="2" fill="#C96A3C"/>
        <circle cx="90" cy="218" r="8" fill="#FF5C1A"/>
        <circle cx="100" cy="212" r="8" fill="#FFD580"/>
        <circle cx="112" cy="218" r="8" fill="#FF5C1A"/>
        <rect x="96" y="220" width="3" height="12" fill="#4D9E5C"/>
        <rect x="200" y="160" width="130" height="220" rx="6" fill="#8B5E3C"/>
        <rect x="208" y="168" width="114" height="204" rx="4" fill="#5A3220"/>
        <rect x="216" y="180" width="42" height="70" rx="3" fill="#6B3D26"/>
        <rect x="270" y="180" width="42" height="70" rx="3" fill="#6B3D26"/>
        <rect x="216" y="266" width="42" height="70" rx="3" fill="#6B3D26"/>
        <rect x="270" y="266" width="42" height="70" rx="3" fill="#6B3D26"/>
        <circle cx="302" cy="258" r="5" fill="#E8C060"/>
        <g transform="translate(338, 230)">
          <circle r="14" fill="none" stroke="#FF5C1A" strokeWidth="2"
            style={{ animation: 'bellWave 1.6s ease-out infinite', opacity: 0 }}/>
          <circle r="14" fill="none" stroke="#FF5C1A" strokeWidth="2"
            style={{ animation: 'bellWave 1.6s ease-out infinite', animationDelay: '0.5s', opacity: 0 }}/>
          <circle r="14" fill="none" stroke="#FF5C1A" strokeWidth="2"
            style={{ animation: 'bellWave 1.6s ease-out infinite', animationDelay: '1.0s', opacity: 0 }}/>
          <circle r="10" fill="#fff"/>
          <circle r="10" fill="none" stroke="#D4864C" strokeWidth="1.5"/>
          <circle r="5" fill="#FF5C1A"/>
        </g>
        <ellipse cx="140" cy="385" rx="30" ry="6" fill="#0F1923" opacity="0.15"/>
        <rect x="126" y="340" width="12" height="42" rx="4" fill="#1A3A6B"/>
        <rect x="142" y="340" width="12" height="42" rx="4" fill="#1A3A6B"/>
        <ellipse cx="132" cy="385" rx="10" ry="5" fill="#0F1923"/>
        <ellipse cx="148" cy="385" rx="10" ry="5" fill="#0F1923"/>
        <rect x="118" y="280" width="48" height="62" rx="10" fill="#2255AA"/>
        <rect x="92" y="348" width="38" height="34" rx="4" fill="#F5D080"/>
        <rect x="92" y="348" width="38" height="34" rx="4" fill="none" stroke="#E0A848" strokeWidth="1.5"/>
        <line x1="111" y1="348" x2="111" y2="382" stroke="#E0A848" strokeWidth="1.5"/>
        <path d="M166 292 Q230 275 325 232" stroke="#FDDBB4" strokeWidth="13" strokeLinecap="round" fill="none"/>
        <circle cx="142" cy="264" r="20" fill="#FDDBB4"/>
        <ellipse cx="142" cy="250" rx="20" ry="8" fill="#2255AA"/>
        <rect x="122" y="244" width="40" height="10" rx="3" fill="#2255AA"/>
        <rect x="118" y="251" width="10" height="5" rx="2" fill="#2255AA"/>
        <path d="M135 263 Q138 260 141 263" stroke="#0F1923" strokeWidth="2" fill="none" strokeLinecap="round"/>
        <path d="M145 263 Q148 260 151 263" stroke="#0F1923" strokeWidth="2" fill="none" strokeLinecap="round"/>
        <path d="M135 272 Q142 278 149 272" stroke="#0F1923" strokeWidth="2" fill="none" strokeLinecap="round"/>
      </svg>
    </div>
  )
}

function Scene4() {
  return (
    <div style={{ position: 'absolute', left: '75%', top: 0, width: '25%', height: '100%' }}>
      <svg viewBox="0 0 400 500" preserveAspectRatio="xMidYMid meet"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
        <rect x="0" y="60" width="400" height="320" fill="#F5E4D8"/>
        <line x1="0" y1="200" x2="400" y2="200" stroke="#EDD0BE" strokeWidth="1"/>
        <line x1="0" y1="300" x2="400" y2="300" stroke="#EDD0BE" strokeWidth="1"/>
        <rect x="250" y="100" width="130" height="280" rx="4" fill="#9B6E4A"/>
        <polygon points="250,100 250,380 370,370 370,110" fill="#6B3D26"/>
        <polygon points="250,115 250,380 130,380 130,220" fill="#FFE8D0" opacity="0.5"/>
        <rect x="40" y="100" width="60" height="44" rx="3" fill="#8B5E3C"/>
        <rect x="46" y="106" width="48" height="32" rx="2" fill="#C8E8FF"/>
        <circle cx="58" cy="116" r="5" fill="#FFD580"/>
        <path d="M46 138 L60 125 L72 130 L94 138 Z" fill="#5BAD6A"/>
        <ellipse cx="155" cy="388" rx="55" ry="8" fill="#0F1923" opacity="0.15"/>
        <rect x="130" y="320" width="18" height="65" rx="5" fill="#5B2E94"/>
        <rect x="158" y="320" width="18" height="65" rx="5" fill="#5B2E94"/>
        <ellipse cx="139" cy="388" rx="13" ry="6" fill="#0F1923"/>
        <ellipse cx="167" cy="388" rx="13" ry="6" fill="#0F1923"/>
        <g style={{ transformOrigin: '153px 320px', animation: 'happyBob 0.8s ease-in-out infinite' }}>
          <rect x="108" y="230" width="90" height="95" rx="14" fill="#7B4FC4"/>
          <rect x="108" y="318" width="90" height="10" fill="#6A3FB0"/>
          <rect x="108" y="240" width="90" height="2" fill="#FFD580" opacity="0.7"/>
          <path d="M108 252 Q75 275 65 295" stroke="#C68642" strokeWidth="15" strokeLinecap="round" fill="none"/>
          <g style={{ transformOrigin: '200px 248px', animation: 'happyBob 0.8s ease-in-out infinite' }}>
            <path d="M198 248 Q240 235 255 205" stroke="#C68642" strokeWidth="15" strokeLinecap="round" fill="none"/>
            <g transform="translate(258,200) rotate(-20)">
              <ellipse cx="0" cy="-8" rx="11" ry="14" fill="#C68642"/>
              <ellipse cx="0" cy="-10" rx="7" ry="5" fill="#D4976A"/>
              <path d="M-8 -2 Q0 -14 8 -2" stroke="#8A5A2A" strokeWidth="1.5" fill="none"/>
            </g>
          </g>
          <g style={{ transformOrigin: '60px 308px', animation: 'pkgHop 1.5s ease-in-out infinite' }}>
            <rect x="42" y="288" width="40" height="38" rx="5" fill="#F5D080"/>
            <rect x="42" y="288" width="40" height="38" rx="5" fill="none" stroke="#E0A848" strokeWidth="1.8"/>
            <line x1="62" y1="288" x2="62" y2="326" stroke="#E0A848" strokeWidth="1.5"/>
            <line x1="42" y1="307" x2="82" y2="307" stroke="#E0A848" strokeWidth="1.2"/>
            <circle cx="75" cy="294" r="7" fill="#1DAB5F"/>
            <polyline points="71,295 74,298 80,291" stroke="#fff" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
          </g>
          <circle cx="153" cy="204" r="28" fill="#C68642"/>
          <ellipse cx="153" cy="188" rx="26" ry="15" fill="#2A1A0A"/>
          <ellipse cx="128" cy="198" rx="8" ry="17" fill="#2A1A0A"/>
          <ellipse cx="178" cy="198" rx="8" ry="17" fill="#2A1A0A"/>
          <circle cx="180" cy="192" r="4" fill="#FF5C1A"/>
          <path d="M142 203 Q146 198 150 203" stroke="#0F1923" strokeWidth="2.2" fill="none" strokeLinecap="round"/>
          <path d="M157 203 Q161 198 165 203" stroke="#0F1923" strokeWidth="2.2" fill="none" strokeLinecap="round"/>
          <circle cx="138" cy="212" r="5" fill="#FF5C1A" opacity="0.3"/>
          <circle cx="168" cy="212" r="5" fill="#FF5C1A" opacity="0.3"/>
          <path d="M140 218 Q153 230 166 218" stroke="#2A1A0A" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
        </g>
        <g transform="translate(300,170)" style={{ animation: 'sparkle 1.6s ease-in-out infinite' }}>
          <circle r="24" fill="#1DAB5F"/>
          <circle r="24" fill="none" stroke="#fff" strokeWidth="2" opacity="0.4"/>
          <polyline points="-10,0 -2,8 10,-6" stroke="#fff" strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
        </g>
        <rect x="60" y="100" width="6" height="10" rx="1" fill="#FF5C1A"
          style={{ animation: 'confettiFall 1.6s ease-out infinite', animationDelay: '0s' }}/>
        <rect x="120" y="80" width="6" height="10" rx="1" fill="#FFD580"
          style={{ animation: 'confettiFall 1.6s ease-out infinite', animationDelay: '0.3s' }}/>
        <rect x="200" y="90" width="6" height="10" rx="1" fill="#1DAB5F"
          style={{ animation: 'confettiFall 1.6s ease-out infinite', animationDelay: '0.6s' }}/>
        <rect x="320" y="70" width="6" height="10" rx="1" fill="#2255AA"
          style={{ animation: 'confettiFall 1.6s ease-out infinite', animationDelay: '0.9s' }}/>
        <rect x="85" y="140" width="6" height="10" rx="1" fill="#FF5C1A"
          style={{ animation: 'confettiFall 1.6s ease-out infinite', animationDelay: '0.2s' }}/>
        <rect x="260" y="130" width="6" height="10" rx="1" fill="#FFD580"
          style={{ animation: 'confettiFall 1.6s ease-out infinite', animationDelay: '0.7s' }}/>
        <rect x="180" y="60" width="6" height="10" rx="1" fill="#FF5C1A"
          style={{ animation: 'confettiFall 1.6s ease-out infinite', animationDelay: '1.1s' }}/>
      </svg>
    </div>
  )
}

/* ---- Metrics Strip ---- */
function TrustStrip() {
  const items = [
    {
      color: T.primary,
      value: '85+',
      title: 'Risk Signals Per Order',
      sub: 'Phone, pincode, fraud, customer history, product risk - all evaluated in parallel',
      icon: (
        <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={T.primary} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
      ),
    },
    {
      color: T.mint,
      value: '<2s',
      title: 'Real-Time Decision',
      sub: 'Single FICO Decision Manager call with parallel PLOR data fetch - not sequential, not cached',
      icon: (
        <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={T.mint} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
        </svg>
      ),
    },
    {
      color: T.sky,
      value: '4',
      title: 'Decisions Per Order',
      sub: 'COD eligibility · Prepaid incentive · Dark store · Delivery partner',
      icon: (
        <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={T.sky} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <polygon points="13 2 4 14 12 14 11 22 20 10 12 10 13 2"/>
        </svg>
      ),
    },
    {
      color: T.accent,
      value: '25% → 18%',
      title: 'RTO Rate Reduction',
      sub: 'Target outcome on COD orders without blocking genuine buyers',
      icon: (
        <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={T.accent} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/>
        </svg>
      ),
    },
  ]
  return (
    <div style={{ padding: '0 24px 32px' }}>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4" style={{
        maxWidth: 1400, margin: '0 auto',
        background: T.bg1, border: `1px solid ${T.line}`,
        borderRadius: 16, overflow: 'hidden',
      }}>
        {items.map((item, i) => (
          <div key={item.title} style={{
            padding: '20px 24px', display: 'flex', alignItems: 'flex-start', gap: 14,
            borderRight: i < 3 ? `1px solid ${T.line}` : 'none',
          }}>
            <div style={{
              width: 40, height: 40, borderRadius: 12, flexShrink: 0,
              background: `${item.color}18`, border: `1px solid ${item.color}33`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              marginTop: 2,
            }}>
              {item.icon}
            </div>
            <div>
              <div style={{ fontSize: 20, fontWeight: 900, color: item.color, letterSpacing: -0.5, lineHeight: 1.1 }}>
                {item.value}
              </div>
              <div style={{ fontSize: 12, fontWeight: 700, color: T.fg1, marginTop: 3 }}>{item.title}</div>
              <div style={{ fontSize: 11, color: T.fg2, marginTop: 3, lineHeight: 1.45 }}>{item.sub}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

