import { useState } from 'react'
import products from '../data/productCatalog.json'
import CartSidebar from './CartSidebar'

const CATEGORIES = ['All', 'Fashion', 'Electronics', 'Home Appliances']

const CAT_FILTER = {
  'Fashion':         'FASHION',
  'Electronics':     'ELECTRONICS',
  'Home Appliances': 'HOME_APPLIANCES',
}

const CAT_COLOR = {
  FASHION:         '#be185d',
  ELECTRONICS:     '#1d4ed8',
  HOME_APPLIANCES: '#15803d',
}

function fmt(n) { return '₹' + Number(n).toLocaleString('en-IN') }

export default function ProductBrowse({ cart, setCart, onCheckout, selectedCustomer }) {
  const [search,   setSearch]   = useState('')
  const [category, setCategory] = useState('All')

  const filtered = products.filter(p => {
    const q = search.toLowerCase()
    const matchQ = !q || p.productName.toLowerCase().includes(q) || (p.subcategory || '').toLowerCase().includes(q)
    const matchC = category === 'All' || p.category === CAT_FILTER[category]
    return matchQ && matchC
  })

  const cartQty = sku => cart.find(i => i.sku === sku)?.quantity ?? 0

  const addToCart = (p) => {
    setCart(prev => {
      const ex = prev.find(i => i.sku === p.sku)
      if (ex) return prev.map(i => i.sku === p.sku
        ? { ...i, quantity: i.quantity + 1, lineTotal: (i.quantity + 1) * i.unitPrice }
        : i)
      return [...prev, {
        sku: p.sku, productName: p.productName,
        category: p.category, subcategory: p.subcategory || '',
        unitPrice: p.unitPrice, quantity: 1,
        lineTotal: p.unitPrice, size: p.size || 'MEDIUM',
      }]
    })
  }

  const removeFromCart = (sku) => {
    setCart(prev => {
      const item = prev.find(i => i.sku === sku)
      if (!item || item.quantity <= 1) return prev.filter(i => i.sku !== sku)
      return prev.map(i => i.sku === sku
        ? { ...i, quantity: i.quantity - 1, lineTotal: (i.quantity - 1) * i.unitPrice }
        : i)
    })
  }

  return (
    <div style={{ display: 'flex', gap: 20, minHeight: 'calc(100vh - 120px)', alignItems: 'flex-start' }}>

      {/* Left: Browse */}
      <div style={{ flex: 1, minWidth: 0 }}>

        {/* Context bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14, fontSize: 13, color: '#555' }}>
          <div style={{
            width: 28, height: 28, borderRadius: '50%', background: '#00A650',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#FFF', fontWeight: 700, fontSize: 12, flexShrink: 0
          }}>
            {selectedCustomer?.name?.[0] ?? '?'}
          </div>
          Shopping as <strong style={{ color: '#0F1111' }}>{selectedCustomer?.name}</strong>
        </div>

        {/* Search */}
        <div style={{ position: 'relative', marginBottom: 14 }}>
          <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="#888" strokeWidth="2"
            style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
            <circle cx="11" cy="11" r="6" /><line x1="16.5" y1="16.5" x2="21" y2="21" />
          </svg>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search products, brands and more..."
            style={{
              width: '100%', padding: '9px 12px 9px 32px', border: '1px solid #CCC',
              borderRadius: 4, fontSize: 13, color: '#0F1111', background: '#FFF',
              outline: 'none', boxSizing: 'border-box'
            }}
            onFocus={e => { e.currentTarget.style.borderColor = '#00A650'; e.currentTarget.style.boxShadow = '0 0 0 2px rgba(0,166,80,0.15)' }}
            onBlur={e => { e.currentTarget.style.borderColor = '#CCC'; e.currentTarget.style.boxShadow = 'none' }}
          />
        </div>

        {/* Category tabs */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 16, overflowX: 'auto', paddingBottom: 4 }}>
          {CATEGORIES.map(cat => (
            <button key={cat} onClick={() => setCategory(cat)}
              style={{
                padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: 500,
                whiteSpace: 'nowrap', cursor: 'pointer', transition: 'all 0.15s',
                background: category === cat ? '#00A650' : '#FFF',
                color: category === cat ? '#FFF' : '#555',
                border: category === cat ? '1px solid #00A650' : '1px solid #CCC',
              }}>
              {cat}
            </button>
          ))}
        </div>

        {/* Grid */}
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#888', fontSize: 14 }}>No products found</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
            {filtered.map(p => {
              const qty    = cartQty(p.sku)
              const accent = CAT_COLOR[p.category?.toUpperCase()] || '#555'
              return (
                <div key={p.sku} style={{
                  background: '#FFF', border: '1px solid #DDD', borderRadius: 4, overflow: 'hidden',
                  transition: 'box-shadow 0.15s, transform 0.15s',
                }}
                  onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.12)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
                  onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'none' }}
                >
                  {/* Product image */}
                  <div style={{ height: 160, overflow: 'hidden', position: 'relative', background: '#F5F5F5' }}>
                    <img
                      src={p.imageUrl}
                      alt={p.productName}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={e => { e.currentTarget.style.display = 'none' }}
                    />
                    <span style={{
                      position: 'absolute', top: 8, left: 8,
                      background: accent, color: '#FFF',
                      fontSize: 10, fontWeight: 600, padding: '2px 7px', borderRadius: 3
                    }}>
                      {(p.subcategory || '').replace(/_/g, ' ')}
                    </span>
                  </div>

                  <div style={{ padding: '10px 10px 12px' }}>
                    <div style={{
                      fontSize: 12, color: '#0F1111', fontWeight: 500, lineHeight: 1.4, marginBottom: 6,
                      display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                      minHeight: '2.4em'
                    }}>
                      {p.productName}
                    </div>
                    <div style={{ marginBottom: 10 }}>
                      <span style={{ fontSize: 15, fontWeight: 700, color: '#B12704' }}>{fmt(p.unitPrice)}</span>
                    </div>

                    {qty === 0 ? (
                      <button onClick={() => addToCart(p)}
                        style={{
                          width: '100%', padding: '7px 0', border: '1px solid #00A650',
                          background: '#00A650', color: '#FFF', borderRadius: 4,
                          fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: 'background 0.15s'
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = '#007B3A'; e.currentTarget.style.borderColor = '#007B3A' }}
                        onMouseLeave={e => { e.currentTarget.style.background = '#00A650'; e.currentTarget.style.borderColor = '#00A650' }}>
                        + Add to Cart
                      </button>
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#F5F5F5', borderRadius: 4, padding: 3 }}>
                        <button onClick={() => removeFromCart(p.sku)}
                          style={{
                            width: 28, height: 26, border: 'none', background: '#FFF', borderRadius: 3,
                            cursor: 'pointer', fontSize: 16, fontWeight: 700, color: '#555'
                          }}
                          onMouseEnter={e => e.currentTarget.style.background = '#FFE8E8'}
                          onMouseLeave={e => e.currentTarget.style.background = '#FFF'}>
                          -
                        </button>
                        <span style={{ fontSize: 13, fontWeight: 700, color: '#0F1111', minWidth: 24, textAlign: 'center' }}>{qty}</span>
                        <button onClick={() => addToCart(p)}
                          style={{
                            width: 28, height: 26, border: 'none', background: '#FFF', borderRadius: 3,
                            cursor: 'pointer', fontSize: 16, fontWeight: 700, color: '#00A650'
                          }}
                          onMouseEnter={e => e.currentTarget.style.background = '#E6F9EE'}
                          onMouseLeave={e => e.currentTarget.style.background = '#FFF'}>
                          +
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Right: Cart */}
      <CartSidebar
        cart={cart}
        onRemove={removeFromCart}
        onAdd={addToCart}
        onCheckout={onCheckout}
      />
    </div>
  )
}
