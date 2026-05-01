import { useState } from 'react'
import { T } from '../tokens'
import addresses from '../data/addresses.json'
import { assemblePayload } from '../utils/assemblePayload'
import { callDM } from '../utils/dmClient'

const fmt = n => '₹' + Number(n).toLocaleString('en-IN')

const SIGNALS = [
  { label: 'Phone verification',  icon: 'phone'  },
  { label: 'Pincode risk',        icon: 'pin'    },
  { label: 'Customer history',    icon: 'user'   },
  { label: 'Fraud intelligence',  icon: 'shield' },
  { label: 'Product risk',        icon: 'box'    },
  { label: 'Address signals',     icon: 'home'   },
]

const ADDR_ICONS = {
  Home:   <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>,
  Office: <><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></>,
  Other:  <><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></>,
}

export default function CartAddress({
  cart, selectedCustomer, selectedAddress,
  onSelectAddress, setDmResponse, setDmError,
  setIsLoading, isLoading, setLastPayload, onComplete,
}) {
  const [localAddr, setLocalAddr] = useState(selectedAddress)
  const customerAddrs = addresses.filter(a => a.customerId === selectedCustomer?.customerId)
  const total = cart.reduce((s, i) => s + i.lineTotal, 0)
  const count = cart.reduce((s, i) => s + i.quantity, 0)

  const handlePlaceOrder = async () => {
    if (!localAddr || isLoading) return
    onSelectAddress(localAddr)
    setIsLoading(true)
    setDmError(null)
    try {
      const payload = assemblePayload(selectedCustomer, cart, localAddr)
      setLastPayload(payload)
      const resp = await callDM(payload)
      setDmResponse(resp)
      onComplete()
    } catch (err) {
      setDmError(err.message || 'Unknown error contacting Decision Intelligence for eCommerce')
      onComplete()
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div style={{ position: 'relative' }}>

      {/* Dark mode EvalOverlay */}
      {isLoading && <EvalOverlay />}

      <div className="flex flex-col lg:flex-row lg:items-start" style={{ gap: 24, paddingTop: 28 }}>

        {/* Right: Address selection (main column) */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8,
            background: T.primaryTint, borderRadius: 999, padding: '5px 14px',
            border: `1px solid rgba(255,77,109,0.3)`, marginBottom: 14 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: T.primary, letterSpacing: 0.5 }}>STEP 3 OF 4</span>
          </div>

          <h1 style={{ fontSize: 24, fontWeight: 900, color: T.fg0, margin: '0 0 6px', letterSpacing: -0.4 }}>
            Deliver to
          </h1>
          <p style={{ color: T.fg3, fontSize: 13, margin: '0 0 24px' }}>
            Select a delivery address for{' '}
            <strong style={{ color: T.fg1 }}>{selectedCustomer?.name}</strong>
          </p>

          {customerAddrs.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: T.fg3 }}>
              No saved addresses for this customer.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 28 }}>
              {customerAddrs.map(addr => {
                const sel = localAddr?.addressId === addr.addressId
                const iconPaths = ADDR_ICONS[addr.label] || ADDR_ICONS.Other
                return (
                  <button key={addr.addressId} onClick={() => setLocalAddr(addr)}
                    style={{
                      textAlign: 'left', padding: '18px 20px', borderRadius: 20, cursor: 'pointer',
                      border: `${sel ? 2 : 1}px solid ${sel ? T.primary : T.line}`,
                      background: sel ? T.bg3 : T.bg1,
                      boxShadow: sel ? `0 0 0 4px ${T.primaryTint}` : 'none',
                      transition: 'all .2s', outline: 'none', fontFamily: 'inherit',
                    }}
                    onMouseEnter={e => { if (!sel) e.currentTarget.style.borderColor = T.bg4 }}
                    onMouseLeave={e => { if (!sel) e.currentTarget.style.borderColor = T.line }}>

                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                      {/* Radio */}
                      <div style={{ marginTop: 2, flexShrink: 0 }}>
                        <div style={{
                          width: 18, height: 18, borderRadius: '50%',
                          border: sel ? `5px solid ${T.primary}` : `2px solid ${T.fg4}`,
                          background: T.bg1, transition: 'border .15s',
                        }} />
                      </div>

                      {/* Address icon */}
                      <div style={{
                        width: 38, height: 38, borderRadius: 12, flexShrink: 0,
                        background: sel ? T.primaryTint : T.bg2,
                        border: `1px solid ${sel ? 'rgba(255,77,109,0.3)' : T.line}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        transition: 'all .2s',
                      }}>
                        <svg width={16} height={16} viewBox="0 0 24 24" fill="none"
                          stroke={sel ? T.primary : T.fg3} strokeWidth={2}
                          strokeLinecap="round" strokeLinejoin="round">
                          {iconPaths}
                        </svg>
                      </div>

                      {/* Address text */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                          <span style={{ fontSize: 14, fontWeight: 800, color: T.fg0 }}>{addr.label}</span>
                          {sel && (
                            <span style={{
                              fontSize: 9, background: T.primary, color: '#FFF',
                              padding: '2px 8px', borderRadius: 999, fontWeight: 800, letterSpacing: 0.5,
                            }}>SELECTED</span>
                          )}
                        </div>
                        <div style={{ fontSize: 13, color: T.fg2, marginBottom: 2 }}>{addr.line1}</div>
                        {addr.landmark && (
                          <div style={{ fontSize: 12, color: T.fg3, marginBottom: 2 }}>{addr.landmark}</div>
                        )}
                        <div style={{ fontSize: 13, color: T.fg2 }}>
                          {addr.city}, {addr.state} -{' '}
                          <strong style={{ color: T.fg1 }}>{addr.pincode}</strong>
                        </div>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          )}

          <button
            onClick={handlePlaceOrder}
            disabled={!localAddr || isLoading}
            style={{
              width: '100%', padding: '15px', borderRadius: 999, border: 'none',
              fontSize: 15, fontWeight: 800, fontFamily: 'inherit',
              cursor: localAddr && !isLoading ? 'pointer' : 'not-allowed',
              background: localAddr && !isLoading
                ? `linear-gradient(135deg, ${T.primary}, ${T.accent})`
                : T.bg3,
              color: localAddr && !isLoading ? '#FFF' : T.fg4,
              boxShadow: localAddr && !isLoading ? '0 8px 28px rgba(255,77,109,0.4)' : 'none',
              transition: 'all .2s',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}
            onMouseEnter={e => { if (localAddr && !isLoading) e.currentTarget.style.transform = 'scale(1.01)' }}
            onMouseLeave={e => { if (localAddr && !isLoading) e.currentTarget.style.transform = 'scale(1)' }}>
            {isLoading ? (
              <>
                <div style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)',
                  borderTop: '2px solid #FFF', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                Evaluating...
              </>
            ) : (
              <>
                <svg width={16} height={16} viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="13 2 4 14 12 14 11 22 20 10 12 10 13 2"/>
                </svg>
                Evaluate & Place Order
              </>
            )}
          </button>
        </div>

        {/* Left: Order summary sidebar */}
        <div className="lg:w-[300px] lg:shrink-0">
          <div className="lg:sticky lg:top-[92px]" style={{
            background: T.bg1, borderRadius: 20, border: `1px solid ${T.line}`,
            overflow: 'hidden',
          }}>
            <div style={{ padding: '16px 18px', borderBottom: `1px solid ${T.line}` }}>
              <div style={{ fontSize: 14, fontWeight: 800, color: T.fg0 }}>Order Summary</div>
              <div style={{ fontSize: 12, color: T.fg3, marginTop: 2 }}>{count} item{count !== 1 ? 's' : ''}</div>
            </div>

            <div style={{ maxHeight: 280, overflowY: 'auto' }}>
              {cart.map((item, idx) => (
                <div key={item.sku} style={{
                  padding: '12px 18px',
                  borderBottom: idx < cart.length - 1 ? `1px solid ${T.lineSoft}` : 'none',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10,
                }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="line-clamp-1" style={{ fontSize: 12, color: T.fg1, fontWeight: 600 }}>
                      {item.productName}
                    </div>
                    <div style={{ fontSize: 11, color: T.fg3, marginTop: 2 }}>Qty: {item.quantity}</div>
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: T.primary, whiteSpace: 'nowrap' }}>
                    {fmt(item.lineTotal)}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ padding: '14px 18px', background: T.bg2, borderTop: `1px solid ${T.line}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: T.fg3, marginBottom: 6 }}>
                <span>Subtotal</span>
                <span style={{ color: T.fg1 }}>{fmt(total)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: T.fg3, marginBottom: 10 }}>
                <span>Delivery</span>
                <span style={{ color: T.mint, fontWeight: 700 }}>FREE</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 15, fontWeight: 800,
                paddingTop: 10, borderTop: `1px solid ${T.line}`, color: T.fg0 }}>
                <span>Order Total</span>
                <span style={{ color: T.primary }}>{fmt(total)}</span>
              </div>
            </div>

            {/* DM badge */}
            <div style={{ padding: '14px 18px', borderTop: `1px solid ${T.line}` }}>
              <div style={{
                background: T.primaryTint, borderRadius: 12, padding: '12px 14px',
                border: `1px solid rgba(255,77,109,0.25)`,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <svg width={14} height={14} viewBox="0 0 24 24" fill="none"
                    stroke={T.primary} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="13 2 4 14 12 14 11 22 20 10 12 10 13 2"/>
                  </svg>
                  <span style={{ fontSize: 11, fontWeight: 800, color: T.primary, letterSpacing: 0.5 }}>
                    DECISION INTELLIGENCE FOR eCOMMERCE
                  </span>
                </div>
                <div style={{ fontSize: 11, color: T.fg3, lineHeight: 1.55 }}>
                  Placing this order triggers a live COD risk evaluation across 85+ rules covering
                  phone, address, pincode, customer history, and fraud signals.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ---- Dark mode Evaluation Overlay ---- */
function EvalOverlay() {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 100,
      background: 'rgba(10,11,20,0.97)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      backdropFilter: 'blur(8px)',
    }}>
      {/* Ambient glow */}
      <div style={{
        position: 'absolute', top: '30%', left: '50%', transform: 'translateX(-50%)',
        width: 400, height: 400, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(255,77,109,0.15) 0%, transparent 70%)',
        pointerEvents: 'none', animation: 'glowPulse 2s ease-in-out infinite',
      }} />

      {/* Conic spinner */}
      <div style={{ position: 'relative', width: 80, height: 80, marginBottom: 32 }}>
        <div style={{
          width: 80, height: 80, borderRadius: '50%',
          background: `conic-gradient(${T.primary} 0deg, transparent 270deg)`,
          animation: 'conicSpin 1s linear infinite',
        }} />
        <div style={{
          position: 'absolute', inset: 6, borderRadius: '50%',
          background: 'rgba(10,11,20,0.97)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <svg width={28} height={28} viewBox="0 0 24 24" fill="none"
            stroke={T.primary} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <polygon points="13 2 4 14 12 14 11 22 20 10 12 10 13 2"/>
          </svg>
        </div>
      </div>

      <div style={{ fontSize: 22, fontWeight: 900, color: T.fg0, marginBottom: 8, letterSpacing: -0.3 }}>
        Evaluating your order...
      </div>
      <div style={{ fontSize: 14, color: T.fg3, marginBottom: 36, textAlign: 'center', maxWidth: 400 }}>
        Running 85+ rulesets across 6 intelligence signals in real time
      </div>

      {/* Signal pills */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center', maxWidth: 480, marginBottom: 40 }}>
        {SIGNALS.map((s, i) => (
          <div key={s.label} style={{
            display: 'flex', alignItems: 'center', gap: 7,
            fontSize: 12, fontWeight: 600, color: T.mint,
            border: `1px solid ${T.mint}55`,
            background: T.mintTint,
            borderRadius: 999, padding: '6px 14px',
            animation: `fadeInUp 0.4s ease-out both`,
            animationDelay: `${i * 0.08}s`,
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: T.mint,
              animation: 'pulseDot 1.4s ease-in-out infinite',
              animationDelay: `${i * 0.2}s` }} />
            {s.label}
          </div>
        ))}
      </div>

      {/* Progress bar */}
      <div style={{ width: 320, height: 4, background: T.bg3, borderRadius: 2, overflow: 'hidden' }}>
        <div className="loading-bar-animate" style={{
          height: '100%', background: `linear-gradient(90deg, ${T.primary}, ${T.accent})`,
          borderRadius: 2, width: 0,
        }} />
      </div>
    </div>
  )
}
