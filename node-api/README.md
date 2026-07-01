# Visa PayWay

Node + Express + Stripe Checkout demo for accepting card payments, including Visa.

Stripe is the payment processor here. You do not send card details to your server and you do not call Visa directly; Stripe Checkout collects the card securely and returns the customer to your app.

## 1. Create Stripe Keys

1. Create or open your Stripe account.
2. In the Stripe Dashboard, switch to test mode.
3. Go to **Developers > API keys**.
4. Copy your **Secret key**.

## 2. Configure Environment

Create a `.env` file in this folder:

```env
STRIPE_SECRET_KEY=sk_test_your_secret_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
APP_URL=http://localhost:4242
PORT=4242
```

`STRIPE_WEBHOOK_SECRET` is only needed when you test webhooks.

## 3. Install And Run

```bash
npm install
npm run dev
```

Open:

```text
http://localhost:4242
```

## 4. Test Visa Payment

Use Stripe test mode only. Do not use a real card while testing.

```text
Card number: 4242 4242 4242 4242
Expiry: any future date, for example 12/34
CVC: any 3 digits
ZIP/postal: any value
```

Thailand Visa test cards:

```text
Credit: 4000 0076 4000 0003
Debit: 4000 0576 4000 0008
```

## 5. Test Webhooks

Install and log in to the Stripe CLI, then run:

```bash
stripe listen --forward-to localhost:4242/webhook
```

Copy the generated `whsec_...` value into `STRIPE_WEBHOOK_SECRET`, restart the server, then complete a test payment. The server logs `checkout.session.completed` after successful payment.

## Main Files

- `server.js` creates Checkout Sessions, serves the frontend, retrieves receipt details, and verifies webhooks.
- `public/index.html` is the checkout page.
- `public/success.html` displays the completed payment summary.
- `public/cancel.html` handles canceled checkout.

## Production Notes

- Store secret keys in real environment variables or a secrets manager.
- Create prices and products in Stripe Dashboard instead of hardcoding demo `price_data`.
- Fulfill orders from the webhook, not only from the success page.
- Use HTTPS in production.
