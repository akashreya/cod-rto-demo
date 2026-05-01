import { useState, useEffect } from 'react'
import HeroLanding from './components/HeroLanding'
import CustomerSelection from './components/CustomerSelection'
import ProductBrowse from './components/ProductBrowse'
import CartAddress from './components/CartAddress'
import PaymentDecision from './components/PaymentDecision'
import { validateAllData } from './utils/validateData'
import { T } from './tokens'

export { T }

const STEPS = ['Customer', 'Products', 'Address', 'Decision']

function Icon({ name, size = 20, stroke = 2, color, style }) {
  const paths = {
    check:   <polyline points="20 6 9 17 4 12"/>,
    reset:   <><path d="M21 12a9 9 0 1 1-3-6.7L21 8"/><polyline points="21 3 21 8 16 8"/></>,
    bolt:    <polygon points="13 2 4 14 12 14 11 22 20 10 12 10 13 2"/>,
  }
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none"
      stroke={color || 'currentColor'} strokeWidth={stroke}
      strokeLinecap="round" strokeLinejoin="round" style={style}>
      {paths[name]}
    </svg>
  )
}

export default function App() {
  const [screen,           setScreen]           = useState(0)
  const [selectedCustomer, setSelectedCustomer] = useState(null)
  const [cart,             setCart]             = useState([])
  const [selectedAddress,  setSelectedAddress]  = useState(null)
  const [dmResponse,       setDmResponse]       = useState(null)
  const [dmError,          setDmError]          = useState(null)
  const [isLoading,        setIsLoading]        = useState(false)
  const [lastPayload,      setLastPayload]       = useState(null)

  useEffect(() => { validateAllData() }, [])

  useEffect(() => {
    if (screen >= 1) window.scrollTo({ top: 0, behavior: 'instant' })
  }, [screen])

  const handleReset = () => {
    setScreen(0)
    setSelectedCustomer(null)
    setCart([])
    setSelectedAddress(null)
    setDmResponse(null)
    setDmError(null)
    setIsLoading(false)
    setLastPayload(null)
  }

  return (
    <div style={{ minHeight: '100vh', background: T.bg0, color: T.fg0,
      fontFamily: "'Montserrat', -apple-system, sans-serif" }}>

      {/* Screen 0: Hero landing - has its own nav */}
      {screen === 0 && <HeroLanding onStart={() => setScreen(1)} />}

      {/* Screens 1-4: Checkout flow with top bar */}
      {screen >= 1 && (
        <>
          <TopBar screen={screen} customer={selectedCustomer}
            cartCount={cart.reduce((s, i) => s + i.quantity, 0)}
            onReset={handleReset} />
          <MobileStepBar screen={screen} onReset={handleReset} />

          <main className="pt-[44px] sm:pt-0"
            style={{ minHeight: 'calc(100vh - 80px)', paddingLeft: 24, paddingRight: 24, paddingBottom: 48 }}>
            <div style={{ maxWidth: 1280, margin: '0 auto' }}>
              {screen === 1 && (
                <CustomerSelection
                  selectedCustomer={selectedCustomer}
                  onSelect={setSelectedCustomer}
                  onContinue={() => setScreen(2)}
                />
              )}
              {screen === 2 && (
                <ProductBrowse
                  cart={cart}
                  setCart={setCart}
                  onCheckout={() => setScreen(3)}
                  selectedCustomer={selectedCustomer}
                />
              )}
              {screen === 3 && (
                <CartAddress
                  cart={cart}
                  selectedCustomer={selectedCustomer}
                  selectedAddress={selectedAddress}
                  onSelectAddress={setSelectedAddress}
                  setDmResponse={setDmResponse}
                  setDmError={setDmError}
                  setIsLoading={setIsLoading}
                  isLoading={isLoading}
                  setLastPayload={setLastPayload}
                  onComplete={() => setScreen(4)}
                />
              )}
              {screen === 4 && (
                <PaymentDecision
                  dmResponse={dmResponse}
                  dmError={dmError}
                  lastPayload={lastPayload}
                  selectedCustomer={selectedCustomer}
                  selectedAddress={selectedAddress}
                  cart={cart}
                  onTryAnotherAddress={() => {
                    setSelectedAddress(null)
                    setDmResponse(null)
                    setDmError(null)
                    setScreen(3)
                  }}
                  onRetry={() => {
                    setDmResponse(null)
                    setDmError(null)
                    setScreen(3)
                  }}
                />
              )}
            </div>
          </main>
        </>
      )}

      <AppFooter />
    </div>
  )
}

function TopBar({ screen, customer, cartCount, onReset }) {
  const initials = n => n ? n.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() : ''

  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 50,
      background: 'rgba(10,11,20,0.88)', backdropFilter: 'blur(18px)',
      WebkitBackdropFilter: 'blur(18px)',
      borderBottom: `1px solid ${T.line}`,
    }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px', height: 72,
        display: 'flex', alignItems: 'center', gap: 20 }}>

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}
          onClick={onReset}>
          <div style={{
            width: 36, height: 36, borderRadius: 12,
            background: `linear-gradient(135deg, ${T.primary}, ${T.accent})`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 18, fontWeight: 900, color: '#FFF',
            boxShadow: '0 6px 20px rgba(255,77,109,0.35)',
          }}>S</div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 800, color: T.fg0, letterSpacing: -0.3, lineHeight: 1 }}>
              shop<span style={{ color: T.primary }}>Smart</span>
            </div>
            <div className="hidden lg:block" style={{ fontSize: 9, color: T.fg3, letterSpacing: 1.5, textTransform: 'uppercase', marginTop: 2 }}>
              Decision Intelligence for eCommerce
            </div>
          </div>
        </div>

        {/* Step indicator - hidden on mobile, shown on sm+ */}
        <div className="hidden sm:flex" style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          {STEPS.map((label, i) => {
            const n = i + 1, done = screen > n, cur = screen === n
            return (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                  <div style={{
                    width: 26, height: 26, borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 11, fontWeight: 800,
                    background: cur ? T.primary : done ? T.mint : T.bg2,
                    color: cur ? '#FFF' : done ? '#002418' : T.fg3,
                    boxShadow: cur ? '0 4px 12px rgba(255,77,109,0.4)' : 'none',
                    transition: 'all .3s',
                  }}>
                    {done ? <Icon name="check" size={12} stroke={3} /> : n}
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 600,
                    color: cur ? T.fg0 : done ? T.fg2 : T.fg3 }}>{label}</span>
                </div>
                {i < STEPS.length - 1 && (
                  <div style={{ width: 20, height: 2, borderRadius: 1,
                    background: done ? T.mint : T.bg2 }} />
                )}
              </div>
            )
          })}
        </div>

        {/* Right: customer pill + reset - hidden on mobile */}
        <div className="hidden sm:flex" style={{ alignItems: 'center', gap: 10 }}>
          {customer && screen > 1 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8,
              padding: '6px 12px 6px 6px',
              background: T.bg2, borderRadius: 999, border: `1px solid ${T.line}` }}>
              <div style={{ width: 26, height: 26, borderRadius: '50%',
                background: T.tier[customer.loyaltyTier]?.bg || T.tier.NONE.bg,
                color: T.tier[customer.loyaltyTier]?.fg || T.tier.NONE.fg,
                fontSize: 10, fontWeight: 800,
                display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {initials(customer.name)}
              </div>
              <span style={{ fontSize: 12, fontWeight: 600, color: T.fg1 }}>
                {customer.name.split(' ')[0]}
              </span>
            </div>
          )}
          {cartCount > 0 && screen === 2 && (
            <div style={{ fontSize: 12, fontWeight: 700, color: T.primary,
              background: T.primaryTint, borderRadius: 999, padding: '6px 12px',
              border: `1px solid rgba(255,77,109,0.3)` }}>
              🛒 {cartCount}
            </div>
          )}
          <button onClick={onReset}
            style={{
              background: 'transparent', border: `1px solid ${T.bg4}`,
              color: T.fg2, fontSize: 12, fontWeight: 600, padding: '8px 14px',
              borderRadius: 999, cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'inherit',
              transition: 'border-color .15s',
            }}
            onMouseEnter={e => e.currentTarget.style.borderColor = T.primary}
            onMouseLeave={e => e.currentTarget.style.borderColor = T.bg4}>
            <Icon name="reset" size={13} /> Reset
          </button>
        </div>
      </div>
    </header>
  )
}

function AppFooter() {
  const team = ['Akash S Kantharaj', 'Irene Daniel', 'Adhikesav M', 'Supriya R', 'Murugesan D']
  return (
    <footer style={{
      borderTop: `1px solid ${T.line}`,
      background: T.bg1,
      fontFamily: "'Montserrat', -apple-system, sans-serif",
    }}>
      <div style={{
        maxWidth: 1280, margin: '0 auto',
        padding: '18px 24px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: 12,
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: T.fg2, letterSpacing: 0.2 }}>
            Decision Intelligence for eCommerce
          </span>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 5,
            background: T.skyTint, borderRadius: 999, padding: '4px 10px',
            border: `1px solid ${T.sky}44`, width: 'fit-content',
          }}>
            <span style={{ fontSize: 10, fontWeight: 700, color: T.sky, letterSpacing: 0.3 }}>
              Tech Mahindra &nbsp;·&nbsp; FICO World 2026
            </span>
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          <span style={{ fontSize: 10, color: T.fg4, letterSpacing: 0.5, textTransform: 'uppercase', marginRight: 4 }}>
            Team
          </span>
          {team.map((name, i) => (
            <span key={name} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: T.fg2 }}>{name}</span>
              {i < team.length - 1 && (
                <span style={{ color: T.fg4, fontSize: 10 }}>·</span>
              )}
            </span>
          ))}
        </div>
      </div>
    </footer>
  )
}

/* Mobile-only step bar - sticky below the main header */
function MobileStepBar({ screen, onReset }) {
  return (
    <div className="block sm:hidden" style={{
      position: 'sticky', top: 72, zIndex: 49,
      background: 'rgba(10,11,20,0.95)', backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      borderBottom: `1px solid ${T.line}`,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 16px', height: 44 }}>

        {/* Step indicators - numbers only */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {STEPS.map((label, i) => {
            const n = i + 1, done = screen > n, cur = screen === n
            return (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{
                  width: 28, height: 28, borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 12, fontWeight: 800,
                  background: cur ? T.primary : done ? T.mint : T.bg2,
                  color: cur ? '#FFF' : done ? '#002418' : T.fg3,
                  boxShadow: cur ? '0 2px 10px rgba(255,77,109,0.45)' : 'none',
                  transition: 'all .3s', flexShrink: 0,
                }}>
                  {done ? <Icon name="check" size={11} stroke={3} /> : n}
                </div>
                {i < STEPS.length - 1 && (
                  <div style={{ width: 16, height: 2, borderRadius: 1,
                    background: done ? T.mint : T.bg3, flexShrink: 0 }} />
                )}
              </div>
            )
          })}
        </div>

        {/* Reset button */}
        <button onClick={onReset}
          style={{
            background: 'transparent', border: `1px solid ${T.bg4}`,
            color: T.fg2, fontSize: 11, fontWeight: 600, padding: '5px 10px',
            borderRadius: 999, cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 4, fontFamily: 'inherit',
            flexShrink: 0, marginLeft: 8,
          }}
          onMouseEnter={e => e.currentTarget.style.borderColor = T.primary}
          onMouseLeave={e => e.currentTarget.style.borderColor = T.bg4}>
          <Icon name="reset" size={11} /> Reset
        </button>
      </div>
    </div>
  )
}
