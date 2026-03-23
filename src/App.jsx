import { useState, useEffect } from 'react'
import CustomerSelection from './components/CustomerSelection'
import ProductBrowse from './components/ProductBrowse'
import CartAddress from './components/CartAddress'
import PaymentDecision from './components/PaymentDecision'
import { validateAllData } from './utils/validateData'

const STEPS = [
  { label: 'Customer' },
  { label: 'Products' },
  { label: 'Address' },
  { label: 'Decision' },
]

export default function App() {
  const [screen,          setScreen]          = useState(1)
  const [selectedCustomer, setSelectedCustomer] = useState(null)
  const [cart,            setCart]            = useState([])
  const [selectedAddress, setSelectedAddress] = useState(null)
  const [dmResponse,      setDmResponse]      = useState(null)
  const [dmError,         setDmError]         = useState(null)
  const [isLoading,       setIsLoading]       = useState(false)
  const [lastPayload,     setLastPayload]      = useState(null)

  useEffect(() => { validateAllData() }, [])

  const handleReset = () => {
    setScreen(1)
    setSelectedCustomer(null)
    setCart([])
    setSelectedAddress(null)
    setDmResponse(null)
    setDmError(null)
    setIsLoading(false)
    setLastPayload(null)
  }

  return (
    <div style={{ minHeight: '100vh', background: '#EAEDED', fontFamily: "'Noto Sans', sans-serif" }}>

      {/* Top nav bar */}
      <header style={{ background: '#232F3E', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ height: 60, display: 'flex', alignItems: 'center', padding: '0 16px', gap: 12, maxWidth: 1400, margin: '0 auto' }}>

          {/* Logo */}
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', minWidth: 110 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
              <span style={{ color: '#FFFFFF', fontSize: 22, fontWeight: 700, letterSpacing: -1, lineHeight: 1 }}>
                shopindia
              </span>
              <span style={{ color: '#FFFFFF', fontSize: 11, verticalAlign: 'super', fontWeight: 400 }}>.in</span>
              <span style={{ display: 'inline-block', width: 7, height: 7, background: '#00A650', borderRadius: '50%', marginLeft: 4, marginBottom: 2 }} />
            </div>
            <div style={{ color: '#AAA', fontSize: 10, marginTop: 1, letterSpacing: 0.2 }}>COD/RTO Intelligence Demo</div>
          </div>

          {/* Search bar */}
          <div style={{ flex: 1, display: 'flex', height: 40, maxWidth: 700 }}>
            <input
              type="text"
              placeholder="Search products, brands and more"
              readOnly
              style={{
                flex: 1, border: 'none', padding: '0 12px', fontSize: 14,
                outline: 'none', borderRadius: '4px 0 0 4px', background: '#FFF', color: '#0F1111'
              }}
            />
            <button style={{
              background: '#00A650', border: 'none', padding: '0 16px', cursor: 'pointer',
              borderRadius: '0 4px 4px 0', display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#FFF" strokeWidth="2.2" strokeLinecap="round">
                <circle cx="11" cy="11" r="6" /><line x1="16.5" y1="16.5" x2="21" y2="21" />
              </svg>
            </button>
          </div>

          {/* Right side badges */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginLeft: 'auto' }}>
            <span style={{
              background: '#00A650', color: '#FFF', fontSize: 11, fontWeight: 600,
              padding: '3px 8px', borderRadius: 3, whiteSpace: 'nowrap'
            }}>
              FICO Decision Manager
            </span>
            <button
              onClick={handleReset}
              style={{
                background: 'transparent', border: '1px solid #6B7280', color: '#FFF',
                fontSize: 12, padding: '4px 12px', borderRadius: 3, cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 5, whiteSpace: 'nowrap'
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#FFF' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#6B7280' }}
            >
              <span style={{ fontSize: 14 }}>↺</span> Reset
            </button>
          </div>
        </div>

        {/* Sub-nav with breadcrumb */}
        <div style={{ background: '#37475A', height: 36, display: 'flex', alignItems: 'center', padding: '0 16px' }}>
          <div style={{ maxWidth: 1400, margin: '0 auto', width: '100%', display: 'flex', alignItems: 'center', gap: 0 }}>
            {STEPS.map((step, i) => {
              const n    = i + 1
              const done = screen > n
              const cur  = screen === n
              return (
                <div key={step.label} style={{ display: 'flex', alignItems: 'center' }}>
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 7,
                    padding: '0 14px', height: 36, cursor: 'default',
                    borderBottom: cur ? '2px solid #00A650' : '2px solid transparent',
                    color: cur ? '#FFF' : done ? '#A0D8B0' : '#9CA3AF',
                    fontSize: 13, whiteSpace: 'nowrap'
                  }}>
                    <span style={{
                      width: 20, height: 20, borderRadius: '50%', display: 'flex', alignItems: 'center',
                      justifyContent: 'center', fontSize: 11, fontWeight: 700,
                      background: cur ? '#00A650' : done ? '#007600' : '#555',
                      color: '#FFF', flexShrink: 0
                    }}>
                      {done ? '✓' : n}
                    </span>
                    {step.label}
                  </div>
                  {i < STEPS.length - 1 && (
                    <span style={{ color: '#6B7280', fontSize: 16, padding: '0 2px' }}>›</span>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </header>

      {/* Main content */}
      <main style={{ minHeight: 'calc(100vh - 96px)', background: '#EAEDED', padding: '16px 0' }}>
        <div style={{ maxWidth: 1400, margin: '0 auto', padding: '0 16px' }}>
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
    </div>
  )
}
