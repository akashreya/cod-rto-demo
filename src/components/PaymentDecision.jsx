import { useState, useEffect } from 'react'
import DecisionPanel from './DecisionPanel'

function fmt(n) { return '₹' + Number(n).toLocaleString('en-IN') }

const OUTCOME = {
  ALLOW_COD: {
    codEnabled: true,
    icon: '✅',
    label: 'Cash on Delivery - Pay on arrival',
    badge: null,
    borderLeft: '#007600',
    rowBg: '#F0FBF4',
  },
  BLOCK_COD: {
    codEnabled: false,
    icon: '🔒',
    label: 'COD unavailable for this address / order',
    badge: { text: 'Blocked', color: '#B12704', bg: '#FFF0F0', border: '#F5BDBC' },
    borderLeft: '#B12704',
    rowBg: '#FFF5F5',
  },
  REQUIRE_OTP: {
    codEnabled: true,
    icon: '📱',
    label: 'Cash on Delivery - OTP verification required at delivery',
    badge: { text: 'OTP Required', color: '#B85C00', bg: '#FFF3E0', border: '#FFCC80' },
    borderLeft: '#FF8F00',
    rowBg: '#FFFBF0',
  },
  OFFER_PREPAID_DISCOUNT: {
    codEnabled: true,
    icon: '✓',
    label: 'Cash on Delivery (available)',
    badge: null,
    borderLeft: '#DDD',
    rowBg: '#FFF',
  },
}

function PayRadio({ checked, onChange, disabled, children }) {
  return (
    <label style={{
      display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px',
      cursor: disabled ? 'not-allowed' : 'pointer',
      borderBottom: '1px solid #F0F0F0',
      background: disabled ? '#FAFAFA' : '#FFF',
      opacity: disabled ? 0.6 : 1
    }}>
      <div style={{
        width: 16, height: 16, borderRadius: '50%', flexShrink: 0, position: 'relative',
        border: checked ? '5px solid #00A650' : '2px solid #AAA',
        background: '#FFF', transition: 'border 0.15s'
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

  const ctx     = dmResponse?.evaluationContext
  const resp    = ctx?.response
  const outcome = resp?.outcome
  const action  = outcome?.action
  const oc      = OUTCOME[action] || OUTCOME.ALLOW_COD

  const partner     = resp?.partnerAssignment
  const fulfillment = resp?.fulfillment
  const riskScore   = resp?.riskScore
  const total       = cart.reduce((s, i) => s + i.lineTotal, 0)

  useEffect(() => { if (action === 'BLOCK_COD') setPayment('UPI') }, [action])

  /* Error state */
  if (dmError) {
    const tokenIssue = dmError.includes('401') || dmError.includes('403') || dmError.includes('Bearer')
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px 0' }}>
        <div style={{
          background: '#FFF', border: '1px solid #F5BDBC', borderRadius: 4, padding: 40,
          maxWidth: 460, width: '100%', textAlign: 'center'
        }}>
          <div style={{ fontSize: 44, marginBottom: 16 }}>⚠️</div>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: '#0F1111', marginBottom: 8 }}>Decision Engine Error</h2>
          <p style={{ fontSize: 13, color: '#555', marginBottom: 12, wordBreak: 'break-all' }}>{dmError}</p>
          {tokenIssue && (
            <div style={{ background: '#FFF3E0', border: '1px solid #FFCC80', borderRadius: 4, padding: '10px 14px', marginBottom: 16, textAlign: 'left' }}>
              <p style={{ fontSize: 12, color: '#B85C00', fontWeight: 600, margin: '0 0 4px' }}>Token expired?</p>
              <p style={{ fontSize: 11, color: '#7A4000', margin: 0 }}>Check your .env credentials and reload.</p>
            </div>
          )}
          <button onClick={onRetry}
            style={{
              padding: '10px 24px', background: '#00A650', color: '#FFF', border: 'none',
              borderRadius: 4, fontSize: 13, fontWeight: 600, cursor: 'pointer'
            }}>
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="fade-in">

      {/* Prepaid nudge banner */}
      {action === 'OFFER_PREPAID_DISCOUNT' && outcome?.incentiveAmount > 0 && (
        <div style={{
          marginBottom: 16, background: '#E8F4FD', border: '1px solid #B8D9F5',
          borderRadius: 4, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12
        }}>
          <span style={{ fontSize: 24 }}>💙</span>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#0A4C8C' }}>Pay online now and get {fmt(outcome.incentiveAmount)} instant cashback on this order</div>
            <div style={{ fontSize: 12, color: '#1565A0', marginTop: 2 }}>Limited time offer - available for this order only</div>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>

        {/* Left: Payment */}
        <div style={{ flex: 3, minWidth: 0 }}>

          {/* Delivery info */}
          <div style={{ background: '#FFF', border: '1px solid #DDD', borderRadius: 4, padding: '14px 16px', marginBottom: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#555', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>Delivery Information</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
              <div>
                <div style={{ fontSize: 11, color: '#888', marginBottom: 3 }}>Assigned Partner</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#0F1111' }}>{partner?.partnerName ?? '-'}</div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: '#888', marginBottom: 3 }}>Estimated Delivery</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#0F1111' }}>
                  {partner?.avgDeliveryDays ? `${partner.avgDeliveryDays} days` : '-'}
                </div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: '#888', marginBottom: 3 }}>Ships From</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#0F1111' }}>{fulfillment?.darkStoreName ?? 'Regional Warehouse'}</div>
              </div>
            </div>
          </div>

          {/* Payment options */}
          <div style={{ background: '#FFF', border: '1px solid #DDD', borderRadius: 4, overflow: 'hidden' }}>
            <div style={{ padding: '12px 16px', borderBottom: '1px solid #EEE', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: '#0F1111' }}>Select Payment Method</span>
              <span style={{ fontSize: 13, color: '#555' }}>Total: <strong style={{ color: '#B12704' }}>{fmt(total)}</strong></span>
            </div>

            {/* COD row */}
            <div style={{
              borderLeft: `4px solid ${oc.borderLeft}`,
              background: oc.rowBg,
              opacity: action === 'BLOCK_COD' ? 0.75 : 1
            }}>
              <label style={{
                display: 'flex', alignItems: 'flex-start', gap: 12, padding: '14px 16px',
                cursor: oc.codEnabled ? 'pointer' : 'not-allowed',
                borderBottom: '1px solid #F0F0F0'
              }}>
                <div style={{
                  marginTop: 2, width: 16, height: 16, borderRadius: '50%', flexShrink: 0,
                  border: payment === 'COD' && oc.codEnabled ? '5px solid #00A650' : '2px solid #AAA',
                  background: '#FFF', transition: 'border 0.15s'
                }} />
                <input type="radio" name="pay" value="COD" style={{ display: 'none' }}
                  disabled={!oc.codEnabled} checked={payment === 'COD'}
                  onChange={() => oc.codEnabled && setPayment('COD')} />
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 8, marginBottom: 3 }}>
                    <span style={{ fontSize: 14 }}>{oc.icon}</span>
                    <span style={{ fontSize: 14, fontWeight: 600, color: oc.codEnabled ? '#0F1111' : '#888' }}>Cash on Delivery</span>
                    {oc.badge && (
                      <span style={{
                        fontSize: 11, padding: '2px 8px', borderRadius: 3, fontWeight: 600,
                        color: oc.badge.color, background: oc.badge.bg, border: `1px solid ${oc.badge.border}`
                      }}>{oc.badge.text}</span>
                    )}
                  </div>
                  <div style={{ fontSize: 12, color: oc.codEnabled ? '#555' : '#AAA' }}>{oc.label}</div>
                </div>
                {/* Live indicator dot */}
                {action && (
                  <div style={{
                    marginTop: 4, width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
                    background: action === 'ALLOW_COD' ? '#007600' : action === 'BLOCK_COD' ? '#B12704' : action === 'REQUIRE_OTP' ? '#FF8F00' : '#007AFF',
                    boxShadow: `0 0 0 3px ${action === 'ALLOW_COD' ? 'rgba(0,118,0,0.2)' : action === 'BLOCK_COD' ? 'rgba(177,39,4,0.2)' : 'rgba(255,143,0,0.2)'}`,
                    animation: 'pulseDot 2s ease-in-out infinite'
                  }} />
                )}
              </label>
            </div>

            {/* UPI */}
            <PayRadio checked={payment === 'UPI'} onChange={() => setPayment('UPI')}>
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 14, fontWeight: 600, color: '#0F1111' }}>UPI</span>
                <span style={{ fontSize: 12, color: '#888' }}>Google Pay · PhonePe · Paytm</span>
              </div>
            </PayRadio>

            {/* Card */}
            <PayRadio checked={payment === 'CARD'} onChange={() => setPayment('CARD')}>
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 14, fontWeight: 600, color: '#0F1111' }}>Credit / Debit Card</span>
                <div style={{ display: 'flex', gap: 4 }}>
                  {['VISA', 'MC', 'RuPay'].map(b => (
                    <span key={b} style={{
                      fontSize: 10, background: '#F5F5F5', border: '1px solid #DDD',
                      borderRadius: 3, padding: '2px 5px', color: '#555'
                    }}>{b}</span>
                  ))}
                </div>
              </div>
            </PayRadio>

            {/* Net Banking */}
            <PayRadio checked={payment === 'NB'} onChange={() => setPayment('NB')}>
              <span style={{ fontSize: 14, fontWeight: 600, color: '#0F1111' }}>Net Banking</span>
            </PayRadio>

            {/* Place order */}
            <div style={{ padding: '14px 16px', borderTop: '1px solid #EEE' }}>
              <button style={{
                width: '100%', padding: '13px', borderRadius: 4, border: 'none',
                background: '#00A650', color: '#FFF', fontSize: 14, fontWeight: 700, cursor: 'pointer'
              }}
                onMouseEnter={e => e.currentTarget.style.background = '#007B3A'}
                onMouseLeave={e => e.currentTarget.style.background = '#00A650'}
              >
                Place Order · {fmt(total)}
              </button>
            </div>
          </div>

          {/* Try another address */}
          <div style={{ textAlign: 'center', marginTop: 12 }}>
            <button onClick={onTryAnotherAddress}
              style={{ background: 'none', border: 'none', fontSize: 13, color: '#0066C0', cursor: 'pointer', textDecoration: 'underline' }}>
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
