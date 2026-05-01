/**
 * assemblePayload - builds the PLOR main process request body.
 *
 * PLOR accepts a simple OrderRequest and handles all enrichment lookups
 * (phone, pincode, customer, fraud, product, address, delivery, dark store)
 * internally in parallel. No local data joins needed here.
 */

export function assemblePayload(customer, cart, address) {
  // Strip leading '91' country code -> 10-digit phone
  const raw10 = String(customer.phone || '')
  const phone = raw10.startsWith('91') ? raw10.slice(2) : raw10

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

  return [{
    name: 'orderRequest',
    value: {
      orderId:         `ORD-${Date.now()}`,
      customerId:      customer.customerId,
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
      items:          { item: cartItems },
      paymentMethod:  'COD',
      orderTimestamp: new Date().toISOString().slice(0, 19),
      sourcePlatform: customer.sourcePlatform || 'MYNTRA',
    },
  }]
}
