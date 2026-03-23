/**
 * assemblePayload — joins all seed data files into a single FICO DM evaluationContext.
 *
 * IMPORTANT — DM API uses XML-style JAXB-serialized JSON wrappers:
 *   items             → { item: [...] }
 *   enrichedItems     → { item: [...] }
 *   deliveryPartners  → { deliveryPartner: [...] }
 *   darkStore.candidates → { candidate: [...] }
 *   fraudIntelligence.patternsDetected → { pattern: [...] }
 */

import customerHistory   from '../data/customerHistory.json'
import phoneVerification from '../data/phoneVerification.json'
import fraudIntelligence from '../data/fraudIntelligence.json'
import addressFlags      from '../data/addressFlags.json'
import pincodeRisk       from '../data/pincodeRisk.json'
import deliveryPartners  from '../data/deliveryPartners.json'
import darkStore         from '../data/darkStore.json'
import productCatalog    from '../data/productCatalog.json'

export function assemblePayload(customer, cart, address) {
  // Strip leading '91' country code → 10-digit phone for lookup
  const raw10 = String(customer.phone || '')
  const phone = raw10.startsWith('91') ? raw10.slice(2) : raw10

  /* ── Lookups ── */
  const historyRec  = customerHistory.find(h => h.customerId === customer.customerId) || {}
  const phoneRec    = phoneVerification.find(p => p.phone === phone) || {}

  // fraudIntelligence may be absent for low-risk customers — send null
  const fraudRec    = fraudIntelligence.find(f => f.phone === phone) || null

  // addressFlags keyed by composite (CUSTOMER_ID + PINCODE)
  const flagsRec    = addressFlags.find(
    f => f.CUSTOMER_ID === customer.customerId && String(f.PINCODE) === String(address.pincode)
  ) || { poBox: false, fakePatternDetected: false, matchedPattern: null, highRtoBuilding: false, buildingRtoRate: 0.0, deliverable: true }

  const pincodeRec  = pincodeRisk.find(p => String(p.pincode) === String(address.pincode)) || {}

  // deliveryPartners: support { pincode, partners: [...] } array OR { [pincode]: [...] } object
  let partnersArray = []
  if (Array.isArray(deliveryPartners)) {
    const entry = deliveryPartners.find(d => String(d.pincode) === String(address.pincode))
    partnersArray = entry?.partners || entry?.deliveryPartner || []
  } else {
    partnersArray = deliveryPartners[address.pincode] || deliveryPartners[String(address.pincode)] || []
  }

  // darkStore: filter flat array by SERVICEABLE_PINCODE
  const darkStoreCandidates = darkStore
    .filter(ds => String(ds.SERVICEABLE_PINCODE) === String(address.pincode))
    .map(({ SERVICEABLE_PINCODE, ...rest }) => rest)   // strip lookup key

  /* ── Build enrichedItems: cart item fields + product risk fields ── */
  const enrichedItems = cart.map(item => {
    const prod = productCatalog.find(p => p.sku === item.sku) || {}
    return {
      sku:            item.sku,
      productName:    item.productName,
      category:       item.category,
      subcategory:    item.subcategory || '',
      unitPrice:      item.unitPrice,
      quantity:       item.quantity,
      lineTotal:      item.lineTotal,
      size:           item.size || 'MEDIUM',
      resaleRisk:     prod.resaleRisk     || 'LOW',
      returnRate:     prod.returnRate     ?? 0.05,
      fraudIncidents: prod.fraudIncidents ?? 0,
      avgRtoRate:     prod.avgRtoRate     ?? 0.05,
    }
  })

  /* ── Build order items (no enrichment fields) ── */
  const cartItems = cart.map(item => ({
    sku:         item.sku,
    productName: item.productName,
    category:    item.category,
    subcategory: item.subcategory || '',
    unitPrice:   item.unitPrice,
    quantity:    item.quantity,
    lineTotal:   item.lineTotal,
    size:        item.size || 'MEDIUM',
  }))

  const orderValue = cart.reduce((s, i) => s + i.lineTotal, 0)

  // Strip internal-only keys from addressFlags before sending
  // eslint-disable-next-line no-unused-vars
  const { CUSTOMER_ID, PINCODE, ...addressFlagsClean } = flagsRec

  return {
    evaluationContext: {
      order: {
        orderId:         `ORD-${Date.now()}`,
        customerPhone:   phone,
        customerEmail:   customer.email || '',
        shippingAddress: {
          addressLine1:   address.line1,
          landmark:       address.landmark || null,
          city:           address.city,
          state:          address.state,
          pincode:        String(address.pincode),
          addressQuality: address.addressQuality || 'COMPLETE',
        },
        billingAddress: {
          addressLine1: address.line1,
          city:         address.city,
          state:        address.state,
          pincode:      String(address.pincode),
        },
        orderValue,
        items:         { item: cartItems },
        paymentMethod: 'COD',
        orderTimestamp: new Date().toISOString().slice(0, 19),
        sourcePlatform: customer.sourcePlatform || 'MYNTRA',
        customerId:     customer.customerId,
      },
      addressFlags:     addressFlagsClean,
      phoneVerification: phoneRec,
      pincodeRisk:      pincodeRec,
      customerHistory:  historyRec,
      enrichedItems:    { item: enrichedItems },
      fraudIntelligence: fraudRec,
      deliveryPartners: { deliveryPartner: partnersArray },
      darkStore: {
        requestedPincode:  String(address.pincode),
        candidates:        { candidate: darkStoreCandidates },
        totalStoresServing: darkStoreCandidates.length,
        anyAvailable:      darkStoreCandidates.length > 0,
      },
      temporalContext: null,
      phase:           null,
      strategyId:      'A',
      response:        null,
    },
  }
}
