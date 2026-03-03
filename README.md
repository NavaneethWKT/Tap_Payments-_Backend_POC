# Tap PoC Backend

Node.js backend for the Tap Payments PoC. Handles all backend responsibilities: hash generation, webhook, charge verification, and saved cards (list + charge with saved card).

## Setup

```bash
cd TapPoCBackend
cp .env.example .env
# Edit .env: set TAP_SECRET_KEY, TAP_PUBLIC_KEY, TAP_MERCHANT_ID (from Tap Dashboard → goSell → API Credentials)
npm install
```

## Run

```bash
npm start
# or with auto-reload
npm run dev
```

For local development, Tap must be able to reach your webhook. Use [ngrok](https://ngrok.com/) and set `BASE_URL=https://your-ngrok-url` in `.env`.

## API

| Method | Path | Description |
|--------|------|-------------|
| POST | `/checkout/prepare` | Get hash string and refs for Checkout SDK. Creates order. |
| POST | `/webhook/tap` | **Tap calls this.** Set as `post.url` in SDK config. |
| POST | `/charges/verify` | Verify charge status by `chargeId` (after SDK `onSuccess`). |
| POST | `/charges/with-saved-card` | Charge using a saved card (server-side). |
| GET | `/customers/:customerId/cards` | List saved cards for a customer. |
| GET | `/health` | Health check. |

### 1. Prepare checkout (for SDK)

**Request**

```http
POST /checkout/prepare
Content-Type: application/json

{
  "amount": 5,
  "currency": "KWD",
  "customerId": "cust_123",
  "orderId": "ord_optional",
  "idempotent": "optional_idempotency_key"
}
```

**Response**

```json
{
  "hashString": "hex...",
  "transactionReference": "txn_...",
  "orderReference": "ord_...",
  "postUrl": "https://your-backend/webhook/tap",
  "gateway": {
    "publicKey": "pk_test_...",
    "merchantId": "..."
  }
}
```

Use these in your React Native Checkout SDK config: `hashString`, `transaction.reference.transaction` = `transactionReference`, `transaction.reference.order` = `orderReference`, `post` = `postUrl`, and `gateway` from response.

### 2. Webhook (Tap → your backend)

Tap POSTs the charge result to `postUrl`. The backend updates order status and saves the card (if present) for the customer linked to that order.

### 3. Verify charge (after SDK onSuccess)

**Request**

```http
POST /charges/verify
Content-Type: application/json

{ "chargeId": "chg_..." }
```

**Response**

```json
{
  "chargeId": "chg_...",
  "status": "CAPTURED",
  "amount": 5,
  "currency": "KWD",
  "orderReference": "ord_..."
}
```

### 4. List saved cards

**Request**

```http
GET /customers/cust_123/cards
```

**Response**

```json
{
  "customerId": "cust_123",
  "cards": [
    {
      "id": "card_...",
      "last_four": "1019",
      "brand": "VISA",
      "first_six": "450875",
      "display": "VISA •••• 1019"
    }
  ]
}
```

### 5. Charge with saved card

**Request**

```http
POST /charges/with-saved-card
Content-Type: application/json

{
  "customerId": "cust_123",
  "cardId": "card_...",
  "amount": 10,
  "currency": "KWD"
}
```

**Response**

```json
{
  "chargeId": "chg_...",
  "status": "CAPTURED",
  "amount": 10,
  "currency": "KWD"
}
```

## Data store

In-memory store for PoC. Orders and saved cards are lost on restart. Replace `src/store.js` with a real DB (e.g. PostgreSQL) for production.

## Environment

| Variable | Description |
|----------|-------------|
| `TAP_SECRET_KEY` | Tap secret key (sk_test_... / sk_live_...) |
| `TAP_PUBLIC_KEY` | Tap public key (pk_test_... / pk_live_...) |
| `TAP_MERCHANT_ID` | Tap merchant ID from dashboard |
| `PORT` | Server port (default 3000) |
| `BASE_URL` | Public URL of this server (for postUrl; use ngrok in dev) |
