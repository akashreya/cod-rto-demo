import { useState, useEffect } from 'react'
import { T } from '../tokens'
import DecisionPanel from './DecisionPanel'

const fmt = n => '₹' + Number(n).toLocaleString('en-IN')

const OUTCOME = {
  ALLOW_COD: {
    codEnabled: true,
    color: T.mint, bg: T.mintTint, border: `${T.mint}44`,
    icon: (
      <svg width={22} height={22} viewBox="0 0 24 24" fill="none"
        stroke={T.mint} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
      </svg>
    ),
    label: 'COD Available',
    sublabel: 'Pay on arrival. No prepayment required.',
    badge: { text: 'APPROVED', color: T.mint, bg: T.mintTint, border: `${T.mint}44` },
  },
  BLOCK_COD: {
    codEnabled: false,
    color: T.danger, bg: T.dangerTint, border: `${T.danger}44`,
    icon: (
      <svg width={22} height={22} viewBox="0 0 24 24" fill="none"
        stroke={T.danger} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
      </svg>
    ),
    label: 'COD Not Available',
    sublabel: 'Please choose a prepaid payment method to continue.',
    badge: { text: 'BLOCKED', color: T.danger, bg: T.dangerTint, border: `${T.danger}44` },
  },
  REQUIRE_OTP: {
    codEnabled: true,
    color: T.sky, bg: T.skyTint, border: `${T.sky}44`,
    icon: (
      <svg width={22} height={22} viewBox="0 0 24 24" fill="none"
        stroke={T.sky} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
        <rect x="5" y="2" width="14" height="20" rx="2" ry="2"/>
        <line x1="12" y1="18" x2="12.01" y2="18"/>
      </svg>
    ),
    label: 'COD with OTP Verification',
    sublabel: 'A one-time password will be required at the time of delivery.',
    badge: { text: 'OTP REQUIRED', color: T.sky, bg: T.skyTint, border: `${T.sky}44` },
  },
  OFFER_PREPAID_DISCOUNT: {
    codEnabled: true,
    color: T.accent, bg: T.accentTint, border: `${T.accent}44`,
    icon: (
      <svg width={22} height={22} viewBox="0 0 24 24" fill="none"
        stroke={T.accent} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <line x1="14.31" y1="8" x2="20.05" y2="17.94"/>
        <line x1="9.69" y1="8" x2="21.17" y2="8"/>
        <line x1="7.38" y1="12" x2="13.12" y2="2.06"/>
        <line x1="9.69" y1="16" x2="3.95" y2="6.06"/>
        <line x1="14.31" y1="16" x2="2.83" y2="16"/>
        <line x1="16.62" y1="12" x2="10.88" y2="21.94"/>
      </svg>
    ),
    label: 'COD Available + Prepaid Discount Offer',
    sublabel: 'Pay online now to unlock an exclusive cashback on this order.',
    badge: { text: 'NUDGE', color: T.accent, bg: T.accentTint, border: `${T.accent}44` },
  },
}

function PayRadio({ checked, onChange, disabled, children }) {
  return (
    <label style={{
      display: 'flex', alignItems: 'center', gap: 12, padding: '13px 16px',
      cursor: disabled ? 'not-allowed' : 'pointer',
      borderBottom: `1px solid ${T.lineSoft}`,
      background: disabled ? T.bg0 : 'transparent',
      opacity: disabled ? 0.5 : 1,
      transition: 'background .15s',
    }}
      onMouseEnter={e => { if (!disabled) e.currentTarget.style.background = T.bg3 }}
      onMouseLeave={e => { e.currentTarget.style.background = disabled ? T.bg0 : 'transparent' }}
    >
      <div style={{
        width: 16, height: 16, borderRadius: '50%', flexShrink: 0,
        border: checked ? `5px solid ${T.mint}` : `2px solid ${T.fg4}`,
        background: T.bg2, transition: 'border .15s',
        boxShadow: checked ? `0 0 0 3px ${T.mint}22` : 'none',
      }} />
      <input type="radio" checked={checked} onChange={onChange} disabled={disabled} style={{ display: 'none' }} />
      {children}
    </label>
  )
}

export default function PaymentDecision({
  dmResponse, dmError, lastPayload, selectedCustomer, selectedAddress, cart,
  onTryAnotherAddress, onRetry,
}) {
  const [payment, setPayment] = useState('COD')

  const ctx      = dmResponse?.evaluationContext
  const resp     = ctx?.response
  const outcome  = resp?.outcome
  const action   = outcome?.action
  const oc       = OUTCOME[action] || OUTCOME.ALLOW_COD

  const partner     = resp?.partnerAssignment
  const fulfillment = resp?.fulfillment
  const riskScore   = resp?.riskScore
  const total       = cart.reduce((s, i) => s + i.lineTotal, 0)

  useEffect(() => { if (action === 'BLOCK_COD') setPayment('UPI') }, [action])

  /* Error state */
  if (dmError) {
    const tokenIssue = dmError.includes('401') || dmError.includes('403') || dmError.includes('Bearer')
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        minHeight: 'calc(100vh - 200px)', padding: '60px 0',
      }}>
        <div style={{
          background: T.bg1, border: `1px solid ${T.dangerTint}`,
          borderRadius: 20, padding: 48, maxWidth: 480, width: '100%', textAlign: 'center',
          boxShadow: `0 0 40px ${T.danger}18`,
        }}>
          <div style={{
            width: 64, height: 64, borderRadius: '50%', background: T.dangerTint,
            border: `1px solid ${T.danger}44`, display: 'flex', alignItems: 'center',
            justifyContent: 'center', margin: '0 auto 20px',
          }}>
            <svg width={28} height={28} viewBox="0 0 24 24" fill="none"
              stroke={T.danger} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
          </div>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: T.fg0, marginBottom: 10 }}>
            Decision Engine Error
          </h2>
          <p style={{
            fontSize: 12, color: T.fg3, marginBottom: 16,
            wordBreak: 'break-all', lineHeight: 1.6,
            fontFamily: 'Consolas, monospace',
            background: T.bg2, border: `1px solid ${T.line}`,
            borderRadius: 10, padding: '10px 14px',
          }}>
            {dmError}
          </p>
          {tokenIssue && (
            <div style={{
              background: T.accentTint, border: `1px solid ${T.accent}44`,
              borderRadius: 12, padding: '12px 16px', marginBottom: 20, textAlign: 'left',
            }}>
              <div style={{ fontSize: 12, color: T.accent, fontWeight: 700, marginBottom: 4 }}>
                Token expired or invalid?
              </div>
              <div style={{ fontSize: 11, color: T.fg3, lineHeight: 1.5 }}>
                Update the <code style={{ color: T.sky, fontFamily: 'Consolas, monospace' }}>BEARER_TOKEN</code> in{' '}
                <code style={{ color: T.sky, fontFamily: 'Consolas, monospace' }}>config.js</code> and reload.
              </div>
            </div>
          )}
          <button onClick={onRetry}
            style={{
              padding: '12px 32px', background: `linear-gradient(135deg, ${T.primary}, ${T.accent})`,
              color: '#FFF', border: 'none', borderRadius: 999,
              fontSize: 13, fontWeight: 800, cursor: 'pointer', fontFamily: 'inherit',
              boxShadow: '0 6px 20px rgba(255,77,109,0.3)',
            }}>
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ paddingTop: 28 }}>

      {/* Step badge + heading */}
      <div style={{ marginBottom: 24 }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          background: T.primaryTint, borderRadius: 999, padding: '5px 14px',
          border: `1px solid rgba(255,77,109,0.3)`, marginBottom: 12,
        }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: T.primary, letterSpacing: 0.5 }}>
            STEP 4 OF 4
          </span>
        </div>
        <h1 style={{ fontSize: 24, fontWeight: 900, color: T.fg0, margin: '0 0 4px', letterSpacing: -0.4 }}>
          Payment Decision
        </h1>
        <p style={{ color: T.fg3, fontSize: 13, margin: 0 }}>
          Decision Intelligence for eCommerce evaluated your order in real-time
        </p>
      </div>

      {/* Outcome hero banner */}
      <div style={{
        background: oc.bg, border: `1px solid ${oc.border}`,
        borderRadius: 16, padding: '18px 20px', marginBottom: 20,
        display: 'flex', alignItems: 'center', gap: 16,
        boxShadow: `0 0 24px ${oc.color}18`,
      }}>
        <div style={{
          width: 48, height: 48, borderRadius: '50%',
          background: `${oc.color}20`, border: `1px solid ${oc.border}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          {oc.icon}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 16, fontWeight: 800, color: oc.color, marginBottom: 3 }}>
            {oc.label}
          </div>
          <div style={{ fontSize: 12, color: T.fg3 }}>{oc.sublabel}</div>
        </div>
        <span style={{
          fontSize: 10, padding: '4px 12px', borderRadius: 999, fontWeight: 800, letterSpacing: 1,
          color: oc.badge.color, background: oc.badge.bg, border: `1px solid ${oc.badge.border}`,
          whiteSpace: 'nowrap',
        }}>
          {oc.badge.text}
        </span>
      </div>

      {/* Prepaid nudge banner */}
      {action === 'OFFER_PREPAID_DISCOUNT' && outcome?.incentiveAmount > 0 && (
        <div style={{
          marginBottom: 20, background: T.accentTint, border: `1px solid ${T.accent}44`,
          borderRadius: 16, padding: '14px 18px',
          display: 'flex', alignItems: 'center', gap: 14,
        }}>
          <div style={{
            width: 40, height: 40, borderRadius: '50%',
            background: `${T.accent}28`, border: `1px solid ${T.accent}55`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <svg width={18} height={18} viewBox="0 0 24 24" fill="none"
              stroke={T.accent} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
            </svg>
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 800, color: T.accent }}>
              Pay online and get {fmt(outcome.incentiveAmount)} instant cashback
            </div>
            <div style={{ fontSize: 12, color: T.fg3, marginTop: 2 }}>
              Limited-time offer - available for this order only
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col-reverse lg:flex-row lg:items-start" style={{ gap: 20 }}>

        {/* Left: Payment + Delivery */}
        <div style={{ flex: 3, minWidth: 0 }}>

          {/* Delivery info */}
          <div style={{
            background: T.bg1, border: `1px solid ${T.line}`,
            borderRadius: 16, padding: '16px 18px', marginBottom: 16,
          }}>
            <div style={{
              fontSize: 10, fontWeight: 800, color: T.fg4,
              textTransform: 'uppercase', letterSpacing: 1, marginBottom: 14,
            }}>
              Delivery Information
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3" style={{ gap: 16 }}>
              {[
                { label: 'Delivery Partner', val: partner?.partnerName ?? '-' },
                { label: 'Estimated Delivery', val: partner?.avgDeliveryDays ? `${partner.avgDeliveryDays} days` : '-' },
                { label: 'Ships From', val: fulfillment?.darkStoreName ?? 'Regional Warehouse' },
              ].map(({ label, val }) => (
                <div key={label}>
                  <div style={{ fontSize: 11, color: T.fg4, marginBottom: 4 }}>{label}</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: T.fg1 }}>{val}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Payment method selector */}
          <div style={{
            background: T.bg1, border: `1px solid ${T.line}`,
            borderRadius: 16, overflow: 'hidden',
          }}>
            <div style={{
              padding: '14px 18px', borderBottom: `1px solid ${T.line}`,
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <span style={{ fontSize: 14, fontWeight: 800, color: T.fg0 }}>Select Payment Method</span>
              <span style={{ fontSize: 12, color: T.fg3 }}>
                Total:{' '}
                <strong style={{ color: T.primary, fontSize: 14 }}>{fmt(total)}</strong>
              </span>
            </div>

            {/* COD row */}
            <div style={{
              borderLeft: `3px solid ${oc.color}`,
              background: oc.bg,
            }}>
              <label style={{
                display: 'flex', alignItems: 'flex-start', gap: 12, padding: '14px 16px',
                cursor: oc.codEnabled ? 'pointer' : 'not-allowed',
                borderBottom: `1px solid ${T.lineSoft}`,
              }}>
                <div style={{
                  marginTop: 2, width: 16, height: 16, borderRadius: '50%', flexShrink: 0,
                  border: payment === 'COD' && oc.codEnabled ? `5px solid ${oc.color}` : `2px solid ${T.fg4}`,
                  background: T.bg2, transition: 'border .15s',
                  boxShadow: payment === 'COD' && oc.codEnabled ? `0 0 0 3px ${oc.color}22` : 'none',
                }} />
                <input type="radio" name="pay" value="COD" style={{ display: 'none' }}
                  disabled={!oc.codEnabled} checked={payment === 'COD'}
                  onChange={() => oc.codEnabled && setPayment('COD')} />
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 8, marginBottom: 3 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: oc.codEnabled ? T.fg0 : T.fg4 }}>
                      Cash on Delivery
                    </span>
                    {oc.badge && (
                      <span style={{
                        fontSize: 10, padding: '2px 8px', borderRadius: 999, fontWeight: 800,
                        color: oc.badge.color, background: oc.badge.bg, border: `1px solid ${oc.badge.border}`,
                        letterSpacing: 0.5,
                      }}>
                        {oc.badge.text}
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: 11, color: T.fg4 }}>{oc.label}</div>
                </div>
                {action && (
                  <div style={{
                    marginTop: 4, width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
                    background: oc.color,
                    boxShadow: `0 0 0 3px ${oc.color}33`,
                    animation: 'pulseDot 2s ease-in-out infinite',
                  }} />
                )}
              </label>
            </div>

            {/* UPI */}
            <PayRadio checked={payment === 'UPI'} onChange={() => setPayment('UPI')}>
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: T.fg1 }}>UPI</span>
                <span style={{ fontSize: 11, color: T.fg4 }}>Google Pay · PhonePe · Paytm</span>
              </div>
            </PayRadio>

            {/* Card */}
            <PayRadio checked={payment === 'CARD'} onChange={() => setPayment('CARD')}>
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: T.fg1 }}>Credit / Debit Card</span>
                <div style={{ display: 'flex', gap: 4 }}>
                  {['VISA', 'MC', 'RuPay'].map(b => (
                    <span key={b} style={{
                      fontSize: 10, background: T.bg3, border: `1px solid ${T.line}`,
                      borderRadius: 4, padding: '2px 6px', color: T.fg3, fontFamily: 'Consolas, monospace',
                    }}>{b}</span>
                  ))}
                </div>
              </div>
            </PayRadio>

            {/* Net Banking */}
            <PayRadio checked={payment === 'NB'} onChange={() => setPayment('NB')}>
              <span style={{ fontSize: 13, fontWeight: 700, color: T.fg1 }}>Net Banking</span>
            </PayRadio>

            {/* Place order CTA */}
            <div style={{ padding: '16px 18px', borderTop: `1px solid ${T.line}` }}>
              <button style={{
                width: '100%', padding: '14px', borderRadius: 999, border: 'none',
                background: `linear-gradient(135deg, ${T.primary}, ${T.accent})`,
                color: '#FFF', fontSize: 14, fontWeight: 800, cursor: 'pointer',
                fontFamily: 'inherit', letterSpacing: 0.2,
                boxShadow: '0 6px 20px rgba(255,77,109,0.35)',
                transition: 'all .2s',
              }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.02)' }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)' }}
              >
                Place Order · {fmt(total)}
              </button>
            </div>
          </div>

          {/* Try another address */}
          <div style={{ textAlign: 'center', marginTop: 14 }}>
            <button onClick={onTryAnotherAddress}
              style={{
                background: 'none', border: 'none', fontSize: 12,
                color: T.sky, cursor: 'pointer',
                textDecoration: 'underline', fontFamily: 'inherit',
              }}>
              Try a different address
            </button>
          </div>
        </div>

        {/* Right: Decision Panel */}
        <div style={{ flex: 2, minWidth: 0 }}>
          <DecisionPanel
            dmResponse={dmResponse}
            lastPayload={lastPayload}
            action={action}
            outcome={outcome}
            riskScore={riskScore}
            fulfillment={fulfillment}
            partnerAssignment={partner}
          />
        </div>
      </div>
    </div>
  )
}
