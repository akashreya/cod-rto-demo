import { useState } from 'react'
import { T } from '../tokens'

function highlight(json) {
  const s = JSON.stringify(json, null, 2)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  return s.replace(
    /(\"(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*\"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
    match => {
      const map = { key: T.sky, string: T.mint, number: T.accent, boolean: '#A78BFA', null: T.fg4 }
      let t = 'number'
      if (/^"/.test(match)) t = /:$/.test(match) ? 'key' : 'string'
      else if (/true|false/.test(match)) t = 'boolean'
      else if (/null/.test(match)) t = 'null'
      return `<span style="color:${map[t]}">${match}</span>`
    }
  )
}

function SignalDot({ level }) {
  const colors = { green: T.mint, amber: T.accent, red: T.danger, blue: T.sky, gray: T.fg4 }
  const c = colors[level] || T.fg4
  return (
    <div style={{
      width: 8, height: 8, borderRadius: '50%', flexShrink: 0, background: c,
      boxShadow: level !== 'gray' ? `0 0 6px ${c}99` : 'none',
    }} />
  )
}

function sigColor(level) {
  return { green: T.mint, red: T.danger, amber: T.accent, blue: T.sky, gray: T.fg4 }[level] || T.fg4
}

export default function DecisionPanel({ dmResponse, lastPayload, action, outcome, riskScore, fulfillment, partnerAssignment }) {
  const [open, setOpen] = useState(true)
  const [tab,  setTab]  = useState('signals')

  const ctx  = dmResponse?.evaluationContext
  const lctx = lastPayload?.evaluationContext

  const pv = ctx?.phoneVerification  || lctx?.phoneVerification
  const pr = ctx?.pincodeRisk        || lctx?.pincodeRisk
  const ch = ctx?.customerHistory    || lctx?.customerHistory
  const fi = ctx?.fraudIntelligence  || lctx?.fraudIntelligence

  const phoneLevel   = pv?.riskCategory === 'TRUSTED' ? 'green' : pv?.riskCategory === 'BLACKLISTED' ? 'red' : 'amber'
  const pincodeLevel = pr?.riskLevel === 'LOW' ? 'green' : pr?.riskLevel === 'HIGH' ? 'red' : 'amber'
  const rtoRate      = ch?.rtoRate ?? 0
  const rtoLevel     = rtoRate < 0.1 ? 'green' : rtoRate < 0.3 ? 'amber' : 'red'
  const fs           = fi?.fraudScore ?? 0
  const fsLevel      = fs < 20 ? 'green' : fs < 50 ? 'amber' : 'red'
  const actLevel     = { ALLOW_COD: 'green', BLOCK_COD: 'red', REQUIRE_OTP: 'amber', OFFER_PREPAID_DISCOUNT: 'blue' }[action] || 'gray'

  const signals = [
    { label: 'Phone Status',      val: pv?.riskCategory ?? 'N/A',                                            level: phoneLevel },
    { label: 'Pincode Risk',      val: pr?.riskLevel ?? 'N/A',                                               level: pincodeLevel },
    { label: 'Customer RTO Rate', val: rtoRate !== undefined ? `${(rtoRate * 100).toFixed(0)}%` : 'N/A',     level: rtoLevel },
    { label: 'Fraud Score',       val: fi ? fs.toFixed(1) : '-',                                             level: fsLevel },
    { label: 'COD Decision',      val: action ?? 'N/A',                                                      level: actLevel },
    { label: 'Risk Score',        val: riskScore?.finalScore != null ? riskScore.finalScore.toFixed(0) : '-', level: 'blue' },
    { label: 'Delivery Partner',  val: partnerAssignment?.partnerName ?? '-',                                level: 'blue' },
    { label: 'Dark Store',        val: fulfillment?.darkStoreName ?? '-',                                     level: 'blue' },
  ]

  const actionBadge = {
    ALLOW_COD:              { color: T.mint,   bg: T.mintTint,   border: `${T.mint}44` },
    BLOCK_COD:              { color: T.danger, bg: T.dangerTint, border: `${T.danger}44` },
    REQUIRE_OTP:            { color: T.sky,    bg: T.skyTint,    border: `${T.sky}44` },
    OFFER_PREPAID_DISCOUNT: { color: T.accent, bg: T.accentTint, border: `${T.accent}44` },
  }[action]

  return (
    <div style={{ background: T.bg1, borderRadius: 20, border: `1px solid ${T.line}`, overflow: 'hidden' }}>

      {/* Toggle header */}
      <button onClick={() => setOpen(!open)}
        style={{
          width: '100%', padding: '16px 18px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: 'transparent', border: 'none', cursor: 'pointer',
          borderBottom: open ? `1px solid ${T.line}` : 'none',
          fontFamily: 'inherit',
        }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <svg width={14} height={14} viewBox="0 0 24 24" fill="none"
            stroke={T.primary} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <polygon points="13 2 4 14 12 14 11 22 20 10 12 10 13 2"/>
          </svg>
          <span style={{ fontSize: 13, fontWeight: 800, color: T.fg0 }}>Decision Inspector</span>
          {action && actionBadge && (
            <span style={{
              fontSize: 10, padding: '3px 9px', borderRadius: 999, fontWeight: 800, letterSpacing: 0.5,
              color: actionBadge.color, background: actionBadge.bg, border: `1px solid ${actionBadge.border}`,
            }}>{action}</span>
          )}
        </span>
        <svg width={14} height={14} viewBox="0 0 24 24" fill="none"
          stroke={T.fg3} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
          style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
          <polyline points="18 15 12 9 6 15"/>
        </svg>
      </button>

      {open && (
        <div>
          {/* Tabs */}
          <div style={{ display: 'flex', borderBottom: `1px solid ${T.line}` }}>
            {[['signals', 'Signals'], ['raw', 'Raw JSON']].map(([t, label]) => (
              <button key={t} onClick={() => setTab(t)}
                style={{
                  flex: 1, padding: '10px 14px', fontSize: 12, fontWeight: 700,
                  border: 'none', cursor: 'pointer', transition: 'all .15s',
                  borderBottom: tab === t ? `2px solid ${T.primary}` : '2px solid transparent',
                  background: 'transparent', color: tab === t ? T.primary : T.fg3,
                  marginBottom: -1, fontFamily: 'inherit',
                }}>
                {label}
              </button>
            ))}
          </div>

          {tab === 'signals' ? (
            <div style={{ padding: '8px 12px' }}>
              {signals.map(sig => (
                <div key={sig.label} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '9px 10px', borderRadius: 10,
                  transition: 'background .1s',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <SignalDot level={sig.level} />
                    <span style={{ fontSize: 12, color: T.fg2 }}>{sig.label}</span>
                  </div>
                  <span style={{
                    fontSize: 11, fontWeight: 800, fontFamily: 'Consolas, monospace',
                    color: sigColor(sig.level),
                    background: `${sigColor(sig.level)}14`,
                    padding: '2px 8px', borderRadius: 6,
                  }}>
                    {sig.val}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ padding: '12px 14px' }}>
              <div style={{
                background: T.bg0, border: `1px solid ${T.line}`, borderRadius: 12,
                padding: '14px', overflow: 'auto', maxHeight: 400,
              }}>
                <pre style={{
                  fontSize: 11, lineHeight: 1.7, fontFamily: 'Consolas, monospace',
                  margin: 0, color: T.fg2,
                }}
                  dangerouslySetInnerHTML={{ __html: highlight(dmResponse?.evaluationContext?.response) }} />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
