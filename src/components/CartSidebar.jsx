function fmt(n) { return '₹' + Number(n).toLocaleString('en-IN') }

export default function CartSidebar({ cart, onRemove, onAdd, onCheckout }) {
  const total = cart.reduce((s, i) => s + i.lineTotal, 0)
  const count = cart.reduce((s, i) => s + i.quantity, 0)

  return (
    <div style={{ width: 280, flexShrink: 0 }}>
      <div style={{ position: 'sticky', top: 100, background: '#FFF', border: '1px solid #DDD', borderRadius: 4, overflow: 'hidden' }}>

        {/* Header */}
        <div style={{ background: '#232F3E', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ color: '#FFF', fontSize: 14, fontWeight: 600 }}>Cart</span>
          {count > 0 && (
            <span style={{
              background: '#00A650', color: '#FFF', fontSize: 11, fontWeight: 700,
              borderRadius: '50%', width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>{count}</span>
          )}
        </div>

        {/* Items */}
        <div style={{ maxHeight: 340, overflowY: 'auto' }}>
          {cart.length === 0 ? (
            <div style={{ padding: '32px 16px', textAlign: 'center', color: '#666' }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>🛒</div>
              <div style={{ fontSize: 13 }}>Your cart is empty</div>
            </div>
          ) : (
            <div>
              {cart.map((item, idx) => (
                <div key={item.sku} style={{
                  padding: '10px 14px',
                  borderBottom: idx < cart.length - 1 ? '1px solid #F0F0F0' : 'none',
                  display: 'flex', alignItems: 'flex-start', gap: 8
                }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, color: '#0F1111', fontWeight: 500, lineHeight: 1.4,
                      display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {item.productName}
                    </div>
                    <div style={{ fontSize: 11, color: '#007600', marginTop: 2 }}>In Stock</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 6 }}>
                      <button onClick={() => onRemove(item.sku)} style={{
                        width: 22, height: 22, borderRadius: '50%', border: '1px solid #CCC',
                        background: '#FFF', cursor: 'pointer', fontSize: 14, fontWeight: 700, color: '#555',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1
                      }}>-</button>
                      <span style={{ fontSize: 12, color: '#0F1111', fontWeight: 600, minWidth: 16, textAlign: 'center' }}>{item.quantity}</span>
                      <button onClick={() => onAdd(item)} style={{
                        width: 22, height: 22, borderRadius: '50%', border: '1px solid #CCC',
                        background: '#FFF', cursor: 'pointer', fontSize: 14, fontWeight: 700, color: '#555',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1
                      }}>+</button>
                    </div>
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#B12704', whiteSpace: 'nowrap' }}>{fmt(item.lineTotal)}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Totals */}
        {cart.length > 0 && (
          <div style={{ borderTop: '1px solid #EEE', padding: '10px 14px', background: '#FAFAFA' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#555', marginBottom: 4 }}>
              <span>Subtotal ({count} item{count !== 1 ? 's' : ''})</span>
              <span style={{ color: '#0F1111', fontWeight: 500 }}>{fmt(total)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#555', marginBottom: 8 }}>
              <span>Delivery</span>
              <span style={{ color: '#007600', fontWeight: 600 }}>FREE</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, fontWeight: 700, paddingTop: 8, borderTop: '1px solid #EEE' }}>
              <span style={{ color: '#0F1111' }}>Order Total</span>
              <span style={{ color: '#B12704' }}>{fmt(total)}</span>
            </div>
          </div>
        )}

        {/* CTA */}
        <div style={{ padding: '12px 14px' }}>
          <button
            onClick={onCheckout}
            disabled={cart.length === 0}
            style={{
              width: '100%', padding: '10px', borderRadius: 4, border: 'none',
              fontSize: 13, fontWeight: 600, cursor: cart.length > 0 ? 'pointer' : 'not-allowed',
              background: cart.length > 0 ? '#00A650' : '#CCC',
              color: cart.length > 0 ? '#FFF' : '#888',
              transition: 'background 0.15s'
            }}
            onMouseEnter={e => { if (cart.length > 0) e.currentTarget.style.background = '#007B3A' }}
            onMouseLeave={e => { if (cart.length > 0) e.currentTarget.style.background = '#00A650' }}
          >
            Proceed to Checkout
          </button>
        </div>
      </div>
    </div>
  )
}
