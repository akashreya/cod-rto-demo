import customers from '../data/customers.json'
import customerHistory from '../data/customerHistory.json'

const LOYALTY_COLORS = {
  GOLD:     { avatar: '#F5A623', badge: { bg: '#00A650', color: '#FFF' } },
  PLATINUM: { avatar: '#1A73E8', badge: { bg: '#1A73E8', color: '#FFF' } },
  SILVER:   { avatar: '#8D9093', badge: { bg: '#8D9093', color: '#FFF' } },
  BRONZE:   { avatar: '#8B572A', badge: { bg: '#8B572A', color: '#FFF' } },
  NONE:     { avatar: '#C5C5C5', badge: { bg: '#EEEEEE', color: '#555' } },
}

function trustBar(score) {
  if (score > 70) return '#007600'
  if (score > 40) return '#FF8F00'
  return '#B12704'
}

function initials(name) {
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
}

export default function CustomerSelection({ selectedCustomer, onSelect, onContinue }) {
  const histMap = Object.fromEntries(customerHistory.map(h => [h.customerId, h]))

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 0' }}>
      {/* Heading */}
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 20, fontWeight: 600, color: '#0F1111', margin: '0 0 6px' }}>
          Who is shopping today?
        </h1>
        <p style={{ color: '#565959', fontSize: 13, margin: 0 }}>
          Select a customer profile to begin the COD/RTO evaluation demo
        </p>
      </div>

      {/* Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: 14,
        marginBottom: 28,
      }}>
        {customers.map((c) => {
          const hist  = histMap[c.customerId]
          const score = hist?.trustScore ?? 50
          const lc    = LOYALTY_COLORS[c.loyaltyTier] || LOYALTY_COLORS.NONE
          const sel   = selectedCustomer?.customerId === c.customerId

          return (
            <button
              key={c.customerId}
              onClick={() => onSelect(c)}
              style={{
                background: '#FFF',
                border: sel ? '2px solid #00A650' : '2px solid #DDD',
                borderRadius: 6,
                padding: 16,
                cursor: 'pointer',
                position: 'relative',
                textAlign: 'left',
                transition: 'all 0.15s',
                boxShadow: sel
                  ? '0 0 0 3px rgba(0,166,80,0.15)'
                  : '0 1px 4px rgba(0,0,0,0.06)',
              }}
              onMouseEnter={e => {
                if (!sel) {
                  e.currentTarget.style.borderColor = '#00A650'
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)'
                }
              }}
              onMouseLeave={e => {
                if (!sel) {
                  e.currentTarget.style.borderColor = '#DDD'
                  e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.06)'
                }
              }}
            >
              {/* Checkmark */}
              {sel && (
                <div style={{
                  position: 'absolute', top: 10, right: 10,
                  width: 22, height: 22, background: '#00A650', borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#FFF', fontSize: 12, fontWeight: 700
                }}>
                  ✓
                </div>
              )}

              {/* Avatar */}
              <div style={{
                width: 52, height: 52, borderRadius: '50%',
                background: lc.avatar, color: '#FFF',
                fontSize: 18, fontWeight: 700,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 10px'
              }}>
                {initials(c.name)}
              </div>

              {/* Name */}
              <div style={{ fontWeight: 600, fontSize: 14, textAlign: 'center', marginBottom: 2, color: '#0F1111' }}>
                {c.name}
              </div>

              {/* City */}
              <div style={{ color: '#565959', fontSize: 12, textAlign: 'center', marginBottom: 8 }}>
                {c.city}
              </div>

              {/* Loyalty badge */}
              <div style={{ textAlign: 'center', marginBottom: 10 }}>
                <span style={{
                  display: 'inline-block',
                  padding: '2px 8px',
                  borderRadius: 12,
                  fontSize: 11,
                  fontWeight: 600,
                  background: lc.badge.bg,
                  color: lc.badge.color,
                }}>
                  {c.loyaltyTier || 'NONE'}
                </span>
              </div>

              {/* Trust score */}
              <div style={{ fontSize: 11, color: '#565959', textAlign: 'center', marginBottom: 4 }}>
                Trust Score: {score}/100
              </div>
              <div style={{ height: 4, background: '#EEE', borderRadius: 2, overflow: 'hidden' }}>
                <div style={{
                  height: '100%',
                  width: `${score}%`,
                  background: trustBar(score),
                  borderRadius: 2,
                  transition: 'width 0.4s',
                }} />
              </div>
            </button>
          )
        })}
      </div>

      {/* Continue button */}
      <div style={{ textAlign: 'center' }}>
        <button
          onClick={onContinue}
          disabled={!selectedCustomer}
          style={{
            background: selectedCustomer ? '#00A650' : '#E8E8E8',
            color: selectedCustomer ? '#FFF' : '#999',
            border: selectedCustomer ? '1px solid #007B3A' : '1px solid #CCC',
            fontSize: 15,
            fontWeight: 600,
            padding: '10px 40px',
            borderRadius: 4,
            cursor: selectedCustomer ? 'pointer' : 'not-allowed',
            transition: 'background 0.15s',
            fontFamily: "'Noto Sans', sans-serif",
          }}
          onMouseEnter={e => { if (selectedCustomer) e.currentTarget.style.background = '#007B3A' }}
          onMouseLeave={e => { if (selectedCustomer) e.currentTarget.style.background = '#00A650' }}
        >
          Continue to Products →
        </button>
      </div>
    </div>
  )
}
