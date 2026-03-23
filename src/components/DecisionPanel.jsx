import { useState } from 'react'

function highlight(json) {
  const s = JSON.stringify(json, null, 2)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  return s.replace(
    /(\"(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*\"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
    match => {
      const map = { key: '#1565A0', string: '#007600', number: '#B12704', boolean: '#7B1FA2', null: '#888' }
      let t = 'number'
      if (/^"/.test(match)) t = /:$/.test(match) ? 'key' : 'string'
      else if (/true|false/.test(match)) t = 'boolean'
      else if (/null/.test(match)) t = 'null'
      return `<span style="color:${map[t]}">${match}</span>`
    }
  )
}

function SignalDot({ level }) {
  const colors = { green: '#007600', amber: '#FF8F00', red: '#B12704', blue: '#0066C0', gray: '#999' }
  const c = colors[level] || colors.gray
  return (
    <div style={{
      width: 8, height: 8, borderRadius: '50%', flexShrink: 0, background: c,
      boxShadow: level !== 'gray' ? `0 0 4px ${c}88` : 'none'
    }} />
  )
}

function sigColor(level) {
  return { green: '#007600', red: '#B12704', amber: '#B85C00', blue: '#0066C0', gray: '#888' }[level] || '#888'
}

export default function DecisionPanel({ dmResponse, lastPayload, action, outcome, riskScore, fulfillment, partnerAssignment }) {
  const [open, setOpen] = useState(false)
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
    { label: 'Phone Status',      val: pv?.riskCategory ?? 'N/A',                                          level: phoneLevel },
    { label: 'Pincode Risk',      val: pr?.riskLevel ?? 'N/A',                                             level: pincodeLevel },
    { label: 'Customer RTO Rate', val: rtoRate !== undefined ? `${(rtoRate * 100).toFixed(0)}%` : 'N/A',   level: rtoLevel },
    { label: 'Fraud Score',       val: fi ? fs.toFixed(1) : '-',                                           level: fsLevel },
    { label: 'COD Decision',      val: action ?? 'N/A',                                                    level: actLevel },
    { label: 'Risk Score',        val: riskScore?.finalScore != null ? riskScore.finalScore.toFixed(0) : '-', level: 'blue' },
    { label: 'Delivery Partner',  val: partnerAssignment?.partnerName ?? '-',                              level: 'blue' },
    { label: 'Dark Store',        val: fulfillment?.darkStoreName ?? '-',                                   level: 'blue' },
  ]

  const actionBadge = {
    ALLOW_COD:              { text: action, color: '#007600', bg: '#F0FBF4', border: '#00A65033' },
    BLOCK_COD:              { text: action, color: '#B12704', bg: '#FFF0F0', border: '#F5BDBC' },
    REQUIRE_OTP:            { text: action, color: '#B85C00', bg: '#FFF3E0', border: '#FFCC80' },
    OFFER_PREPAID_DISCOUNT: { text: action, color: '#0066C0', bg: '#E8F4FD', border: '#B8D9F5' },
  }[action]

  return (
    <div style={{ background: '#FFF', border: '1px solid #DDD', borderRadius: 4, overflow: 'hidden' }}>

      {/* Toggle button */}
      <button onClick={() => setOpen(!open)}
        style={{
          width: '100%', padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: open ? '#FAFAFA' : '#FFF', border: 'none', cursor: 'pointer', borderBottom: open ? '1px solid #EEE' : 'none'
        }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 15 }}>⚡</span>
          <span style={{ fontSize: 13, fontWeight: 600, color: '#0F1111' }}>See Decision Details</span>
          {action && actionBadge && (
            <span style={{
              fontSize: 11, padding: '2px 8px', borderRadius: 3, fontWeight: 600,
              color: actionBadge.color, background: actionBadge.bg, border: `1px solid ${actionBadge.border}`
            }}>{actionBadge.text}</span>
          )}
        </span>
        <span style={{ fontSize: 13, color: '#888', transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', display: 'inline-block' }}>▼</span>
      </button>

      {open && (
        <div>
          {/* Tabs */}
          <div style={{ display: 'flex', borderBottom: '1px solid #EEE' }}>
            {[['signals', 'Signals Summary'], ['raw', 'Raw Response']].map(([t, label]) => (
              <button key={t} onClick={() => setTab(t)}
                style={{
                  flex: 1, padding: '10px 12px', fontSize: 12, fontWeight: 600,
                  border: 'none', cursor: 'pointer', transition: 'all 0.15s',
                  borderBottom: tab === t ? '2px solid #00A650' : '2px solid transparent',
                  background: tab === t ? '#F0FBF4' : '#FFF',
                  color: tab === t ? '#007600' : '#555',
                  marginBottom: -1
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
                  padding: '8px 10px', borderRadius: 4
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <SignalDot level={sig.level} />
                    <span style={{ fontSize: 12, color: '#555' }}>{sig.label}</span>
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 600, fontFamily: 'monospace', color: sigColor(sig.level) }}>{sig.val}</span>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ padding: '10px 12px' }}>
              <div style={{
                background: '#F8F8F8', border: '1px solid #E5E5E5', borderRadius: 4,
                padding: '12px', overflow: 'auto', maxHeight: 380
              }}>
                <pre style={{ fontSize: 11, lineHeight: 1.6, fontFamily: 'Consolas, monospace', margin: 0, color: '#333' }}
                  dangerouslySetInnerHTML={{ __html: highlight(dmResponse?.evaluationContext?.response) }} />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
