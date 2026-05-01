import { useState, useRef, useEffect } from 'react'
import { T } from '../tokens'
import products from '../data/productCatalog.json'
import CartSidebar from './CartSidebar'

const CATEGORIES = ['All', 'Fashion', 'Electronics', 'Home']
const CAT_FILTER = { Fashion: 'FASHION', Electronics: 'ELECTRONICS', Home: 'HOME_APPLIANCES' }
const CAT_LABEL  = { FASHION: 'Fashion', ELECTRONICS: 'Electronics', HOME_APPLIANCES: 'Home' }

const fmt = n => '₹' + Number(n).toLocaleString('en-IN')

export default function ProductBrowse({ cart, setCart, onCheckout, selectedCustomer }) {
  const [search,   setSearch]   = useState('')
  const [category, setCategory] = useState('All')
  const cartRef = useRef(null)
  const [cartVisible, setCartVisible] = useState(false)

  useEffect(() => {
    if (!cartRef.current) return
    const obs = new IntersectionObserver(
      ([entry]) => setCartVisible(entry.isIntersecting),
      { threshold: 0.1 }
    )
    obs.observe(cartRef.current)
    return () => obs.disconnect()
  }, [])

  const scrollToCart = () => {
    cartRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const filtered = products.filter(p => {
    const q      = search.toLowerCase()
    const matchQ = !q || p.productName.toLowerCase().includes(q) || (p.subcategory || '').toLowerCase().includes(q)
    const matchC = category === 'All' || p.category === CAT_FILTER[category]
    return matchQ && matchC
  })

  const cartQty = sku => cart.find(i => i.sku === sku)?.quantity ?? 0

  const addToCart = p => {
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

  const removeFromCart = sku => {
    setCart(prev => {
      const item = prev.find(i => i.sku === sku)
      if (!item || item.quantity <= 1) return prev.filter(i => i.sku !== sku)
      return prev.map(i => i.sku === sku
        ? { ...i, quantity: i.quantity - 1, lineTotal: (i.quantity - 1) * i.unitPrice }
        : i)
    })
  }

  return (
    <div className="flex flex-col lg:flex-row lg:items-start" style={{ gap: 20, minHeight: 'calc(100vh - 120px)',
      paddingTop: 28, paddingBottom: (cart.length > 0 && !cartVisible) ? 88 : 28 }}>

      {/* Left: Browse */}
      <div style={{ flex: 1, minWidth: 0 }}>

        {/* Context bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8,
              background: T.primaryTint, borderRadius: 999, padding: '5px 14px',
              border: `1px solid rgba(255,77,109,0.3)`, marginBottom: 10 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: T.primary, letterSpacing: 0.5 }}>STEP 2 OF 4</span>
            </div>
            <h1 style={{ fontSize: 24, fontWeight: 900, color: T.fg0, margin: '0 0 4px', letterSpacing: -0.4 }}>
              Pick your products
            </h1>
            <p style={{ color: T.fg3, fontSize: 13, margin: 0 }}>
              Shopping as <strong style={{ color: T.fg1 }}>{selectedCustomer?.name}</strong>
            </p>
          </div>
        </div>

        {/* Search + categories row */}
        <div className="flex flex-col sm:flex-row sm:items-center" style={{ gap: 12, marginBottom: 20 }}>
          {/* Search */}
          <div style={{ position: 'relative', flex: 1 }}>
            <svg viewBox="0 0 24 24" width={15} height={15} fill="none" stroke={T.fg3} strokeWidth={2}
              style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
              <circle cx="11" cy="11" r="6"/><line x1="16.5" y1="16.5" x2="21" y2="21"/>
            </svg>
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search products..."
              style={{
                width: '100%', padding: '10px 14px 10px 36px',
                border: `1px solid ${T.line}`, borderRadius: 999,
                fontSize: 13, color: T.fg0, background: T.bg2,
                outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit',
                transition: 'border-color .15s',
              }}
              onFocus={e => e.currentTarget.style.borderColor = T.primary}
              onBlur={e => e.currentTarget.style.borderColor = T.line}
            />
          </div>

          {/* Category chips */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {CATEGORIES.map(cat => {
              const active = category === cat
              return (
                <button key={cat} onClick={() => setCategory(cat)}
                  style={{
                    padding: active ? '7px 16px' : '8px 16px',
                    borderRadius: 999, fontSize: 12, fontWeight: active ? 700 : 500,
                    cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap',
                    background: active ? T.primaryTint : T.bg2,
                    color: active ? T.fg0 : T.fg2,
                    border: active ? `2px solid ${T.primary}` : `1px solid ${T.line}`,
                    transition: 'all .15s',
                  }}>
                  {cat}
                </button>
              )
            })}
          </div>
        </div>

        {/* Grid */}
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0', color: T.fg3, fontSize: 14 }}>
            <svg width={40} height={40} viewBox="0 0 24 24" fill="none"
              stroke={T.fg4} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"
              style={{ marginBottom: 12 }}>
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
            </svg>
            <div>No products found</div>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4" style={{ gap: 14 }}>
            {filtered.map(p => (
              <ProductCard key={p.sku} product={p} qty={cartQty(p.sku)}
                onAdd={() => addToCart(p)} onRemove={() => removeFromCart(p.sku)} />
            ))}
          </div>
        )}
      </div>

      {/* Right: Cart */}
      <div ref={cartRef}>
        <CartSidebar cart={cart} onRemove={removeFromCart} onAdd={addToCart} onCheckout={onCheckout} />
      </div>

      {/* Floating cart bar - tablet + mobile only, when cart sidebar is off-screen */}
      {cart.length > 0 && !cartVisible && (
        <div className="lg:hidden" style={{
          position: 'fixed', bottom: 16, left: 16, right: 16, zIndex: 60,
        }}>
          <button onClick={scrollToCart}
            style={{
              width: '100%', padding: '14px 20px',
              background: `linear-gradient(135deg, ${T.primary}, ${T.accent})`,
              border: 'none', borderRadius: 16, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              fontFamily: 'inherit',
              boxShadow: '0 8px 32px rgba(255,77,109,0.45), 0 2px 8px rgba(0,0,0,0.3)',
            }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 32, height: 32, borderRadius: 10,
                background: 'rgba(255,255,255,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                position: 'relative',
              }}>
                <svg width={16} height={16} viewBox="0 0 24 24" fill="none"
                  stroke="#FFF" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 1.95-1.56L23 6H6"/>
                </svg>
                <div style={{
                  position: 'absolute', top: -6, right: -6,
                  background: '#FFF', color: T.primary,
                  width: 18, height: 18, borderRadius: '50%',
                  fontSize: 10, fontWeight: 900,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {cart.reduce((s, i) => s + i.quantity, 0)}
                </div>
              </div>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: 13, fontWeight: 800, color: '#FFF', lineHeight: 1 }}>View Cart</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.75)', marginTop: 2 }}>
                  {cart.reduce((s, i) => s + i.quantity, 0)} item{cart.reduce((s, i) => s + i.quantity, 0) !== 1 ? 's' : ''}
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 15, fontWeight: 900, color: '#FFF' }}>
                {fmt(cart.reduce((s, i) => s + i.lineTotal, 0))}
              </span>
              <svg width={18} height={18} viewBox="0 0 24 24" fill="none"
                stroke="rgba(255,255,255,0.8)" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </div>
          </button>
        </div>
      )}
    </div>
  )
}

function ProductCard({ product: p, qty, onAdd, onRemove }) {
  const [hov, setHov] = useState(false)
  const subLabel = (p.subcategory || '').replace(/_/g, ' ')
  const catLabel = CAT_LABEL[p.category] || p.category

  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: T.bg2, borderRadius: 16, overflow: 'hidden',
        border: `1px solid ${hov ? T.primary : T.line}`,
        boxShadow: hov ? '0 8px 24px rgba(255,77,109,0.12)' : '0 2px 8px rgba(0,0,0,0.15)',
        transition: 'all .2s', display: 'flex', flexDirection: 'column',
        transform: hov ? 'translateY(-2px)' : 'translateY(0)',
      }}>

      {/* Image */}
      <div style={{ aspectRatio: '1 / 0.8', overflow: 'hidden', position: 'relative', background: T.bg3, flexShrink: 0 }}>
        {p.imageUrl ? (
          <img src={p.imageUrl} alt={p.productName} style={{
            width: '100%', height: '100%', objectFit: 'cover',
            transform: hov ? 'scale(1.04)' : 'scale(1)', transition: 'transform .3s',
          }} onError={e => { e.currentTarget.style.display = 'none' }} />
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center',
            justifyContent: 'center', color: T.fg4, fontSize: 28 }}>
            {catLabel === 'Fashion' ? '👗' : catLabel === 'Electronics' ? '⚡' : '🏠'}
          </div>
        )}
        {/* Sub-category chip */}
        <div style={{
          position: 'absolute', top: 8, left: 8,
          background: 'rgba(10,11,20,0.75)', borderRadius: 6, backdropFilter: 'blur(8px)',
          padding: '3px 8px', fontSize: 9, fontWeight: 700, color: T.fg2,
          letterSpacing: 0.6, textTransform: 'uppercase',
        }}>
          {subLabel}
        </div>
        {qty > 0 && (
          <div style={{
            position: 'absolute', top: 8, right: 8,
            background: T.primary, color: '#FFF',
            width: 22, height: 22, borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 11, fontWeight: 800,
            boxShadow: '0 2px 6px rgba(255,77,109,0.4)',
          }}>
            {qty}
          </div>
        )}
      </div>

      {/* Body */}
      <div style={{ padding: '12px 12px 14px', display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
        <div className="line-clamp-2" style={{ fontSize: 12, fontWeight: 600, color: T.fg1,
          lineHeight: 1.4, minHeight: '2.4em' }}>
          {p.productName}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontSize: 16, fontWeight: 800, color: T.primary }}>{fmt(p.unitPrice)}</div>
          <div style={{ fontSize: 10, color: T.mint, fontWeight: 700,
            background: T.mintTint, borderRadius: 6, padding: '2px 7px' }}>
            FREE
          </div>
        </div>

        {qty === 0 ? (
          <button onClick={onAdd}
            style={{
              width: '100%', padding: '8px', border: `1.5px solid ${T.primary}`,
              background: 'transparent', color: T.primary, borderRadius: 999,
              fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
              transition: 'all .15s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
            }}
            onMouseEnter={e => { e.currentTarget.style.background = T.primary; e.currentTarget.style.color = '#FFF' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = T.primary }}>
            <svg width={11} height={11} viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth={2.5} strokeLinecap="round">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Add to Cart
          </button>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            background: T.bg3, borderRadius: 999, padding: '3px 3px' }}>
            <button onClick={onRemove}
              style={{
                width: 30, height: 30, border: 'none', borderRadius: '50%',
                background: T.bg1, cursor: 'pointer', fontSize: 16, fontWeight: 700,
                color: T.fg2, display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>-</button>
            <span style={{ fontSize: 14, fontWeight: 800, color: T.fg0 }}>{qty}</span>
            <button onClick={onAdd}
              style={{
                width: 30, height: 30, border: 'none', borderRadius: '50%',
                background: T.primary, cursor: 'pointer', fontSize: 16, fontWeight: 700,
                color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>+</button>
          </div>
        )}
      </div>
    </div>
  )
}
