# COD/RTO Order Intelligence - Demo App

An interactive browser-based demo for the **FICO GSI Partner Hackathon** (Tech Mahindra team). Simulates a real Indian e-commerce checkout flow where every order is evaluated in real-time by **FICO Decision Manager** to decide COD eligibility and optimize fulfillment.

## What It Does

At checkout, the app makes a live POST to the FICO Decision Manager REST API with a full order context (customer, address, cart, phone verification, pincode risk, fraud signals). The DM responds with one of four decisions:

| Decision | Meaning |
|---|---|
| `ALLOW_COD` | Cash on Delivery enabled - trusted customer/address |
| `BLOCK_COD` | COD disabled - high risk phone, blacklisted, or dangerous pincode |
| `REQUIRE_OTP` | COD allowed but OTP verification required at delivery |
| `OFFER_PREPAID_DISCOUNT` | COD available but customer nudged with ₹80 cashback to pay online |

The DM also selects the best **dark store** and **delivery partner** for fulfillment.

## Tech Stack

- **React 18 + Vite** - frontend framework
- **Tailwind CSS** - utility styling
- **FICO Decision Manager** - decision engine (85+ rules, 6 signal types)
- No backend - all data joins happen in the browser using static JSON seed files

## Getting Started

```bash
npm install
```

Create a `.env` file in the project root:

```env
VITE_DM_ENDPOINT_URL=
VITE_DM_TOKEN_URL=
VITE_DM_CLIENT_ID=your_client_id
VITE_DM_CLIENT_SECRET=your_client_secret
VITE_DM_PROXY_URL=/proxy/dm
VITE_DM_TOKEN_PROXY_URL=/proxy/token
VITE_EVALUATION_LOADING_MIN_MS=1500
VITE_SOURCE_PLATFORM=MYNTRA
```

```bash
npm run dev        # dev server at localhost:5173
npm run build      # production build
npm run preview    # preview production build
```

## Architecture

```
Static JSON seed files (src/data/)
    |
Runtime join in browser on "Place Order"
    |
Single POST to FICO Decision Manager
    |
Live UI update showing COD decision + delivery details
```

The Vite dev server proxies `/proxy/token` and `/proxy/dm` to the FICO endpoints to avoid CORS issues. Bearer tokens are auto-fetched and cached (50-min TTL) - no manual token management needed.

## Demo Flow

4 screens, no routing library:

1. **Customer Selection** - Pick from 8 pre-built personas (Priya, Rohit, Anjali, Suresh, Meera, Vikram, Fatima, Rajesh) with varying trust scores and loyalty tiers
2. **Product Browse** - 46 products across Fashion, Electronics, Home Appliances - add to cart
3. **Address Selection** - Each customer has 2-6 saved addresses across different pincodes - different addresses produce different DM decisions
4. **Payment Decision** - Live DM result shown with payment options, delivery partner, dark store, and expandable decision details panel

## Demo Scenarios

Each customer-address combination is engineered to hit a specific decision:

| Customer | Loyalty | Key scenario |
|---|---|---|
| Priya Sharma | GOLD | ALLOW_COD on most addresses |
| Rohit Verma | NONE | BLOCK_COD always (blacklisted phone) |
| Anjali Nair | NONE | REQUIRE_OTP (new customer) |
| Suresh Gupta | BRONZE | BLOCK_COD on Tier-3 city addresses |
| Meera Iyer | SILVER | Mix of ALLOW and OFFER_PREPAID_DISCOUNT |
| Vikram Joshi | BRONZE | Mix of NUDGE and REQUIRE_OTP |
| Fatima Sheikh | NONE | REQUIRE_OTP or BLOCK (velocity flags) |
| Rajesh Pillai | PLATINUM | ALLOW_COD even on moderate-risk addresses |

## Project Structure

```
src/
  components/
    CustomerSelection.jsx   - Screen 1: customer picker
    ProductBrowse.jsx       - Screen 2: product catalog + cart
    CartSidebar.jsx         - Persistent cart panel
    CartAddress.jsx         - Screen 3: address picker + DM call
    PaymentDecision.jsx     - Screen 4: payment options + COD decision
    DecisionPanel.jsx       - Collapsible signals summary + raw JSON
  data/
    customers.json          - 8 customer profiles
    customerHistory.json    - RTO history, loyalty, trust scores
    addresses.json          - 2-6 addresses per customer
    addressFlags.json       - High-risk address/building flags
    phoneVerification.json  - Phone trust signals
    pincodeRisk.json        - Pincode-level delivery risk
    deliveryPartners.json   - Partner availability by pincode
    darkStore.json          - Dark store coverage by pincode
    fraudIntelligence.json  - Fraud pattern detection results
    productCatalog.json     - 46 products with risk enrichment + images
  utils/
    assemblePayload.js      - Builds the DM EvaluationContext from all data sources
    dmClient.js             - Fetches bearer token, calls DM API, enforces min loading delay
    validateData.js         - Startup data integrity checks (console only)
```

## FICO Decision Manager Integration

The payload follows `DefaultTermLibrary.xsd` (JAXB serialization). Key quirks:
- Array fields use XML-style wrappers: `{ item: [...] }`, `{ deliveryPartner: [...] }`, `{ candidate: [...] }`
- `CustomerSegment` is not sent - DM computes it internally from order history
- `fraudIntelligence` may be `null` for low-risk customers
- `temporalContext` and `phase` are `null` in the request; DM computes them

---

Built for **FICO GSI Partner Hackathon 2026** - Tech Mahindra team.
