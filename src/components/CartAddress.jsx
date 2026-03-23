import { useState } from 'react'
import addresses from '../data/addresses.json'
import { assemblePayload } from '../utils/assemblePayload'
import { callDM } from '../utils/dmClient'

function fmt(n) { return '₹' + Number(n).toLocaleString('en-IN') }

const SIGNALS = ['Phone verification', 'Pincode risk', 'Customer history', 'Fraud intelligence', 'Product risk', 'Address signals']

export default function CartAddress({
  cart, selectedCustomer, selectedAddress,
  onSelectAddress, setDmResponse, setDmError,
  setIsLoading, isLoading, setLastPayload, onComplete,
}) {
  const [localAddr, setLocalAddr] = useState(selectedAddress)
  const customerAddrs = addresses.filter(a => a.customerId === selectedCustomer?.customerId)
  const total = cart.reduce((s, i) => s + i.lineTotal, 0)

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
      setDmError(err.message || 'Unknown error contacting Decision Manager')
      onComplete()
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div style={{ position: 'relative' }}>

      {/* Loading overlay */}
      {isLoading && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 50,
          background: 'rgba(255,255,255,0.96)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        }}>
          {/* Spinner */}
          <div style={{ position: 'relative', width: 64, height: 64, marginBottom: 28 }}>
            <div style={{
              width: 64, height: 64, borderRadius: '50%',
              border: '4px solid #E0E0E0',
              borderTop: '4px solid #00A650',
              animation: 'spin 0.9s linear infinite'
            }} />
            <div style={{
              position: 'absolute', inset: 10, borderRadius: '50%',
              border: '3px solid transparent',
              borderTop: '3px solid rgba(0,166,80,0.4)',
              animation: 'spin 1.4s linear infinite reverse'
            }} />
          </div>

          <div style={{ fontSize: 20, fontWeight: 700, color: '#0F1111', marginBottom: 8 }}>Evaluating your order...</div>
          <div style={{ fontSize: 13, color: '#666', marginBottom: 28 }}>Running 85+ rulesets across 6 intelligence signals</div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center', maxWidth: 440 }}>
            {SIGNALS.map(s => (
              <span key={s} style={{
                fontSize: 11, color: '#007600', border: '1px solid #00A650',
                background: '#E6F9EE', borderRadius: 20, padding: '4px 12px'
              }}>{s}</span>
            ))}
          </div>

          <div style={{ marginTop: 32, width: 280, height: 4, background: '#E0E0E0', borderRadius: 2, overflow: 'hidden' }}>
            <div className="loading-bar-animate" style={{ height: '100%', background: '#00A650', borderRadius: 2, width: 0 }} />
          </div>
        </div>
      )}

      <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>

        {/* Left: Order summary */}
        <div style={{ width: '40%', flexShrink: 0 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: '#0F1111', margin: '0 0 14px' }}>Order Summary</h2>

          <div style={{ background: '#FFF', border: '1px solid #DDD', borderRadius: 4, overflow: 'hidden' }}>
            {cart.map((item, idx) => (
              <div key={item.sku} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
                padding: '12px 16px',
                borderBottom: idx < cart.length - 1 ? '1px solid #F0F0F0' : 'none',
                gap: 12
              }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontSize: 13, color: '#0F1111', fontWeight: 500,
                    display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden'
                  }}>
                    {item.productName}
                  </div>
                  <div style={{ fontSize: 12, color: '#555', marginTop: 2 }}>Qty: {item.quantity}</div>
                </div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#B12704', whiteSpace: 'nowrap' }}>{fmt(item.lineTotal)}</div>
              </div>
            ))}

            <div style={{ background: '#FAFAFA', borderTop: '1px solid #EEE', padding: '12px 16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#555', marginBottom: 6 }}>
                <span>Subtotal</span><span style={{ color: '#0F1111' }}>{fmt(total)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#555', marginBottom: 8 }}>
                <span>Delivery charges</span>
                <span style={{ color: '#007600', fontWeight: 600 }}>FREE</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 15, fontWeight: 700, paddingTop: 8, borderTop: '1px solid #EEE' }}>
                <span style={{ color: '#0F1111' }}>Order Total</span>
                <span style={{ color: '#B12704' }}>{fmt(total)}</span>
              </div>
            </div>
          </div>

          <div style={{ marginTop: 12, background: '#E6F9EE', border: '1px solid #00A65033', borderRadius: 4, padding: '10px 12px' }}>
            <div style={{ fontSize: 12, color: '#007600', fontWeight: 600, marginBottom: 3 }}>FICO Decision Manager</div>
            <div style={{ fontSize: 11, color: '#555', lineHeight: 1.5 }}>
              Placing this order triggers a real-time COD risk evaluation using 85+ rules across phone, address, pincode, and customer history signals.
            </div>
          </div>
        </div>

        {/* Right: Address selection */}
        <div style={{ flex: 1 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: '#0F1111', margin: '0 0 14px' }}>Deliver to</h2>

          {customerAddrs.length === 0 ? (
            <div style={{ fontSize: 13, color: '#666', padding: '40px 0', textAlign: 'center' }}>
              No saved addresses for this customer.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
              {customerAddrs.map(addr => {
                const sel = localAddr?.addressId === addr.addressId
                return (
                  <button key={addr.addressId} onClick={() => setLocalAddr(addr)}
                    style={{
                      textAlign: 'left', padding: '14px 16px', borderRadius: 4, cursor: 'pointer',
                      border: sel ? '2px solid #00A650' : '1px solid #DDD',
                      background: sel ? '#F0FBF4' : '#FFF',
                      transition: 'all 0.15s', outline: 'none'
                    }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                      <div style={{
                        marginTop: 2, width: 16, height: 16, borderRadius: '50%',
                        border: sel ? '5px solid #00A650' : '2px solid #AAA',
                        flexShrink: 0, background: '#FFF', transition: 'border 0.15s'
                      }} />
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                          <span style={{ fontSize: 13, fontWeight: 600, color: '#0F1111' }}>{addr.label}</span>
                          {sel && <span style={{ fontSize: 10, background: '#00A650', color: '#FFF', padding: '1px 6px', borderRadius: 3, fontWeight: 600 }}>SELECTED</span>}
                        </div>
                        <div style={{ fontSize: 12, color: '#333' }}>{addr.line1}</div>
                        {addr.landmark && <div style={{ fontSize: 12, color: '#555' }}>{addr.landmark}</div>}
                        <div style={{ fontSize: 12, color: '#333', marginTop: 2 }}>{addr.city}, {addr.state} - <strong>{addr.pincode}</strong></div>
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
              width: '100%', padding: '13px', borderRadius: 4, border: 'none',
              fontSize: 14, fontWeight: 700, cursor: localAddr && !isLoading ? 'pointer' : 'not-allowed',
              background: localAddr && !isLoading ? '#00A650' : '#CCC',
              color: localAddr && !isLoading ? '#FFF' : '#888',
              transition: 'background 0.15s'
            }}
            onMouseEnter={e => { if (localAddr && !isLoading) e.currentTarget.style.background = '#007B3A' }}
            onMouseLeave={e => { if (localAddr && !isLoading) e.currentTarget.style.background = '#00A650' }}
          >
            {isLoading ? 'Evaluating...' : 'Place Order'}
          </button>
        </div>
      </div>
    </div>
  )
}
