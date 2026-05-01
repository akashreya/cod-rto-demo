import { useState } from 'react'
import { T } from '../tokens'
import customers from '../data/customers.json'
import customerHistory from '../data/customerHistory.json'

function initials(name) {
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
}

function trustColor(score) {
  if (score >= 70) return T.mint
  if (score >= 40) return T.accent
  return T.danger
}


export default function CustomerSelection({ selectedCustomer, onSelect, onContinue }) {
  const histMap = Object.fromEntries(customerHistory.map(h => [h.customerId, h]))

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 0 48px' }}>

      {/* Heading */}
      <div style={{ marginBottom: 32 }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          background: T.primaryTint, borderRadius: 999, padding: '5px 14px',
          border: `1px solid rgba(255,77,109,0.3)`, marginBottom: 14,
        }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: T.primary, letterSpacing: 0.5 }}>
            STEP 1 OF 4
          </span>
        </div>
        <h1 style={{ fontSize: 28, fontWeight: 900, color: T.fg0, margin: '0 0 8px', letterSpacing: -0.5 }}>
          Who is shopping today?
        </h1>
        <p style={{ color: T.fg3, fontSize: 14, margin: 0 }}>
          Select a customer profile - each is engineered to produce a specific outcome from Decision Intelligence for eCommerce
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4" style={{
        gap: 14, marginBottom: 32,
      }}>
        {customers.map(c => {
          const hist  = histMap[c.customerId]
          const score = hist?.trustScore ?? 50
          const sel   = selectedCustomer?.customerId === c.customerId
          const tier  = c.loyaltyTier || 'NONE'

          return (
            <CustomerCard
              key={c.customerId}
              customer={c}
              hist={hist}
              score={score}
              tier={tier}
              selected={sel}
              onSelect={onSelect}
            />
          )
        })}
      </div>

      {/* Continue CTA */}
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <button
          onClick={onContinue}
          disabled={!selectedCustomer}
          style={{
            background: selectedCustomer
              ? `linear-gradient(135deg, ${T.primary}, ${T.accent})`
              : T.bg3,
            color: selectedCustomer ? '#FFF' : T.fg4,
            border: 'none', fontSize: 15, fontWeight: 800,
            padding: '14px 48px', borderRadius: 999, cursor: selectedCustomer ? 'pointer' : 'not-allowed',
            fontFamily: 'inherit', letterSpacing: 0.2,
            boxShadow: selectedCustomer ? '0 8px 24px rgba(255,77,109,0.35)' : 'none',
            transition: 'all .2s', display: 'flex', alignItems: 'center', gap: 8,
          }}
          onMouseEnter={e => { if (selectedCustomer) e.currentTarget.style.transform = 'scale(1.02)' }}
          onMouseLeave={e => { if (selectedCustomer) e.currentTarget.style.transform = 'scale(1)' }}>
          Continue to Products
          <svg width={16} height={16} viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14M12 5l7 7-7 7"/>
          </svg>
        </button>
      </div>
    </div>
  )
}

function CustomerCard({ customer: c, hist, score, tier, selected, onSelect }) {
  const [hov, setHov] = useState(false)
  const tierStyle = T.tier[tier] || T.tier.NONE

  return (
    <button
      onClick={() => onSelect(c)}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: selected ? T.bg3 : hov ? T.bg2 : T.bg1,
        border: `${selected ? 2 : 1}px solid ${selected ? T.primary : hov ? T.bg4 : T.line}`,
        borderRadius: 20, padding: '20px 16px 18px', cursor: 'pointer',
        position: 'relative', textAlign: 'left',
        boxShadow: selected
          ? `0 0 0 4px ${T.primaryTint}, 0 8px 24px rgba(255,77,109,0.2)`
          : hov ? '0 4px 16px rgba(0,0,0,0.2)' : 'none',
        transition: 'all .2s',
        transform: hov && !selected ? 'translateY(-2px)' : 'translateY(0)',
        fontFamily: 'inherit',
      }}>

      {/* Selected checkmark */}
      {selected && (
        <div style={{
          position: 'absolute', top: 14, right: 14,
          width: 24, height: 24, borderRadius: '50%',
          background: T.primary,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 2px 8px rgba(255,77,109,0.5)',
        }}>
          <svg width={12} height={12} viewBox="0 0 24 24" fill="none"
            stroke="#FFF" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </div>
      )}

      {/* Tier avatar - gradient disc */}
      <div style={{
        width: 60, height: 60, borderRadius: '50%',
        background: tierStyle.bg,
        color: tierStyle.fg,
        fontSize: 20, fontWeight: 900,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        margin: '0 auto 14px',
        boxShadow: selected ? '0 4px 14px rgba(255,77,109,0.3)' : '0 2px 8px rgba(0,0,0,0.3)',
      }}>
        {initials(c.name)}
      </div>

      {/* Name */}
      <div style={{ fontWeight: 800, fontSize: 14, textAlign: 'center', marginBottom: 3, color: T.fg0 }}>
        {c.name}
      </div>

      {/* City */}
      <div style={{ color: T.fg3, fontSize: 12, textAlign: 'center', marginBottom: 12,
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
        <svg width={10} height={10} viewBox="0 0 24 24" fill="none"
          stroke={T.fg3} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
          <circle cx="12" cy="10" r="3"/>
        </svg>
        {c.city}
      </div>

      {/* Tier chip */}
      <div style={{ textAlign: 'center', marginBottom: 14 }}>
        <span style={{
          display: 'inline-block', padding: '3px 12px', borderRadius: 999,
          fontSize: 10, fontWeight: 800, letterSpacing: 0.8,
          background: tierStyle.bg, color: tierStyle.fg,
          textTransform: 'uppercase',
        }}>
          {tier}
        </span>
      </div>

      {/* Trust score */}
      <div style={{ marginBottom: 4 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
          <span style={{ fontSize: 10, color: T.fg3, fontWeight: 600, letterSpacing: 0.5, textTransform: 'uppercase' }}>
            Trust Score
          </span>
          <span style={{ fontSize: 10, fontWeight: 800, color: trustColor(score) }}>
            {score}/100
          </span>
        </div>
        <div style={{ height: 4, background: T.bg3, borderRadius: 2, overflow: 'hidden' }}>
          <div style={{
            height: '100%', width: `${score}%`,
            background: trustColor(score),
            borderRadius: 2, transition: 'width .4s',
          }} />
        </div>
      </div>

      {/* Orders count */}
      <div style={{ marginTop: 10, fontSize: 11, color: T.fg4, textAlign: 'center' }}>
        {hist?.totalOrders ?? 0} orders placed
      </div>
    </button>
  )
}
