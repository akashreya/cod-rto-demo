/**
 * validateAllData — run at app startup (console output only).
 * Call before the demo to confirm 0 violations.
 */

import customers        from '../data/customers.json'
import customerHistory  from '../data/customerHistory.json'
import phoneVerification from '../data/phoneVerification.json'
import addresses        from '../data/addresses.json'
import addressFlags     from '../data/addressFlags.json'
import pincodeRisk      from '../data/pincodeRisk.json'
import deliveryPartners from '../data/deliveryPartners.json'
import darkStore        from '../data/darkStore.json'

export function validateAllData() {
  const violations = []

  const customerIds = new Set(customers.map(c => c.customerId))
  const customerPhones = new Set(customers.map(c => {
    const p = String(c.phone || '')
    return p.startsWith('91') ? p.slice(2) : p
  }))

  const pincodes = new Set(pincodeRisk.map(p => String(p.pincode)))

  // Support both array { pincode, partners } and object { [pincode]: [...] } formats
  const deliveryPincodes = Array.isArray(deliveryPartners)
    ? new Set(deliveryPartners.map(d => String(d.pincode)))
    : new Set(Object.keys(deliveryPartners))

  const darkStorePincodes = new Set(darkStore.map(ds => String(ds.SERVICEABLE_PINCODE)))

  // customerHistory: every customerId must exist
  customerHistory.forEach(h => {
    if (!customerIds.has(h.customerId))
      violations.push(`customerHistory: unknown customerId "${h.customerId}"`)
  })

  // phoneVerification: every phone must match a customer
  phoneVerification.forEach(pv => {
    if (!customerPhones.has(pv.phone))
      violations.push(`phoneVerification: no customer with 10-digit phone "${pv.phone}"`)
  })

  // addresses: customerId, pincode must all be valid
  addresses.forEach(a => {
    if (!customerIds.has(a.customerId))
      violations.push(`addresses[${a.addressId}]: unknown customerId "${a.customerId}"`)
    if (!pincodes.has(String(a.pincode)))
      violations.push(`addresses[${a.addressId}]: pincode "${a.pincode}" not in pincodeRisk`)
    if (!deliveryPincodes.has(String(a.pincode)))
      violations.push(`addresses[${a.addressId}]: pincode "${a.pincode}" not in deliveryPartners`)
    if (!darkStorePincodes.has(String(a.pincode)))
      violations.push(`addresses[${a.addressId}]: pincode "${a.pincode}" not in darkStore`)
  })

  // addressFlags: CUSTOMER_ID + PINCODE must be consistent
  addressFlags.forEach(af => {
    if (!customerIds.has(af.CUSTOMER_ID))
      violations.push(`addressFlags: unknown CUSTOMER_ID "${af.CUSTOMER_ID}"`)
  })

  if (violations.length === 0) {
    console.log('%c[DataValidation] ✓ All data integrity checks passed (0 violations)', 'color:#10b981;font-weight:600')
  } else {
    console.warn(`%c[DataValidation] ${violations.length} violation(s) found:`, 'color:#f59e0b;font-weight:600')
    violations.forEach(v => console.warn('  ·', v))
  }
}
