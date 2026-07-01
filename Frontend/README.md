# KHQR Payment Tester (Frontend)

A plain HTML/CSS/JS UI to test the Bakong KHQR endpoints in this project:

| Step | Endpoint | Body |
|------|----------|------|
| 1. Generate | `POST /api/khqr/generate` | `{ amount, currency, billNumber? }` |
| 2. Verify (auto) | `POST /api/khqr/verify` | `{ qrString }` |
| 3. Check payment (auto-poll) | `POST /api/khqr/check-payment` | `{ md5 }` |

## Flow
1. Enter an amount + currency and click **Generate KHQR**.
2. The KHQR string is rendered as a scannable QR image and the QR string is
   automatically **verified**.
3. The app then **auto-polls** `check-payment` every 5s (up to ~5 min).
   When Bakong reports the transaction complete, a green ✓ overlay appears and
   the status flips to **Payment received & confirmed**.

## Run
The frontend is served by the API itself (same origin — no CORS issues):

```bash
npm start
```

Then open **http://localhost:3000/** in your browser.

> Alternatively open `Frontend/index.html` with a static server (e.g. VS Code
> Live Server) and set the **API Base URL** field to `http://localhost:3000`.

## Requirements for auto-check to succeed
The `check-payment` step calls the real Bakong Open API. In your `.env`:

```env
BAKONG_ACCOUNT_ID=yourname@bank
BAKONG_API_URL=https://api-bakong.nbc.gov.kh
BAKONG_API_TOKEN=your_token_here
BAKONG_API_ENABLED=true
```

If `BAKONG_API_ENABLED` is not `true`, generation and verification still work,
but the status panel will tell you auto-check is disabled.

## Notes
- QR rendering uses the `qrcodejs` library via CDN (needs internet on first load).
- Use **Check Once** to poll a single time, or **Stop** to pause auto-checking.
- The **Activity Log** shows every request/response for debugging.
