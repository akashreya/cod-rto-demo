import { T } from '../tokens'

const fmt = n => '₹' + Number(n).toLocaleString('en-IN')

export default function CartSidebar({ cart, onRemove, onAdd, onCheckout }) {
  const total = cart.reduce((s, i) => s + i.lineTotal, 0)
  const count = cart.reduce((s, i) => s + i.quantity, 0)

  return (
    <div className="lg:w-72 lg:shrink-0">
      <div className="lg:sticky lg:top-24" style={{
        background: T.bg1, borderRadius: 20,
        border: `1px solid ${T.line}`,
        overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{
          padding: '16px 18px', display: 'flex', alignItems: 'center', gap: 10,
          borderBottom: `1px solid ${T.line}`,
        }}>
          <svg width={18} height={18} viewBox="0 0 24 24" fill="none"
            stroke={T.fg2} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 1.95-1.56L23 6H6"/>
          </svg>
          <span style={{ fontSize: 14, fontWeight: 800, color: T.fg0 }}>Your Cart</span>
          {count > 0 && (
            <span style={{
              background: T.primary, color: '#FFF', fontSize: 11, fontWeight: 800,
              borderRadius: '50%', width: 22, height: 22,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              marginLeft: 'auto',
              boxShadow: '0 2px 8px rgba(255,77,109,0.4)',
            }}>{count}</span>
          )}
        </div>

        {/* Items */}
        <div style={{ maxHeight: 340, overflowY: 'auto' }}>
          {cart.length === 0 ? (
            <div style={{ padding: '36px 18px', textAlign: 'center', color: T.fg4 }}>
              <svg width={36} height={36} viewBox="0 0 24 24" fill="none"
                stroke={T.fg4} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"
                style={{ marginBottom: 10 }}>
                <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 1.95-1.56L23 6H6"/>
              </svg>
              <div style={{ fontSize: 13 }}>Your cart is empty</div>
              <div style={{ fontSize: 11, marginTop: 4, color: T.fg4 }}>Add products to get started</div>
            </div>
          ) : (
            <div>
              {cart.map((item, idx) => (
                <div key={item.sku} style={{
                  padding: '12px 18px',
                  borderBottom: idx < cart.length - 1 ? `1px solid ${T.lineSoft}` : 'none',
                  display: 'flex', alignItems: 'flex-start', gap: 10,
                }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="line-clamp-2" style={{
                      fontSize: 12, color: T.fg1, fontWeight: 600, lineHeight: 1.4,
                    }}>
                      {item.productName}
                    </div>
                    <div style={{ fontSize: 11, color: T.mint, marginTop: 3, fontWeight: 600 }}>In Stock</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8 }}>
                      <button onClick={() => onRemove(item.sku)}
                        style={{
                          width: 24, height: 24, borderRadius: '50%',
                          border: `1px solid ${T.line}`, background: T.bg2,
                          cursor: 'pointer', fontSize: 14, fontWeight: 700, color: T.fg2,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>-</button>
                      <span style={{ fontSize: 13, color: T.fg0, fontWeight: 700,
                        minWidth: 20, textAlign: 'center' }}>{item.quantity}</span>
                      <button onClick={() => onAdd(item)}
                        style={{
                          width: 24, height: 24, borderRadius: '50%',
                          border: `1px solid ${T.primary}`, background: T.primaryTint,
                          cursor: 'pointer', fontSize: 14, fontWeight: 700, color: T.primary,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>+</button>
                    </div>
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: T.primary, whiteSpace: 'nowrap' }}>
                    {fmt(item.lineTotal)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Totals */}
        {cart.length > 0 && (
          <div style={{ padding: '14px 18px', borderTop: `1px solid ${T.line}`, background: T.bg2 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: T.fg3, marginBottom: 6 }}>
              <span>Subtotal ({count} item{count !== 1 ? 's' : ''})</span>
              <span style={{ color: T.fg1, fontWeight: 600 }}>{fmt(total)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: T.fg3, marginBottom: 10 }}>
              <span>Delivery</span>
              <span style={{ color: T.mint, fontWeight: 700 }}>FREE</span>
            </div>
            <div style={{
              display: 'flex', justifyContent: 'space-between', fontSize: 15, fontWeight: 800,
              paddingTop: 10, borderTop: `1px solid ${T.line}`, color: T.fg0,
            }}>
              <span>Order Total</span>
              <span style={{ color: T.primary }}>{fmt(total)}</span>
            </div>
          </div>
        )}

        {/* CTA */}
        <div style={{ padding: '14px 18px' }}>
          <button onClick={onCheckout} disabled={cart.length === 0}
            style={{
              width: '100%', padding: '12px', borderRadius: 999, border: 'none',
              fontSize: 14, fontWeight: 800, cursor: cart.length > 0 ? 'pointer' : 'not-allowed',
              background: cart.length > 0
                ? `linear-gradient(135deg, ${T.primary}, ${T.accent})`
                : T.bg3,
              color: cart.length > 0 ? '#FFF' : T.fg4,
              fontFamily: 'inherit', letterSpacing: 0.2,
              boxShadow: cart.length > 0 ? '0 6px 20px rgba(255,77,109,0.35)' : 'none',
              transition: 'all .2s',
            }}
            onMouseEnter={e => { if (cart.length > 0) e.currentTarget.style.transform = 'scale(1.02)' }}
            onMouseLeave={e => { if (cart.length > 0) e.currentTarget.style.transform = 'scale(1)' }}>
            Proceed to Checkout
          </button>
        </div>
      </div>
    </div>
  )
}
