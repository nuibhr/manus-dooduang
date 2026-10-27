# Stripe implementation notes

Reviewed: 2026-09-29

## Credential status

Project-specific Stripe **Test Mode** credentials are stored in Managed Secrets. The secret key authenticated successfully against Stripe API and the endpoint signing secret passed a cryptographic signature test. Live Mode remains disabled.

## Authoritative requirements

Sources:

- Stripe webhooks: https://docs.stripe.com/webhooks
- Stripe Checkout fulfillment: https://docs.stripe.com/checkout/fulfillment?payment-ui=stripe-hosted
- Checkout Sessions API: https://docs.stripe.com/api/checkout/sessions

Key requirements applied to this project:

1. Create Checkout Sessions on the server from a server-owned catalog. Never trust browser-supplied price, currency, credit quantity, user ID, or order status.
2. Primary fulfillment uses verified webhooks. The success return may invoke a protected reconciliation endpoint, but the server must retrieve the Checkout Session from Stripe and verify ownership, paid status, amount, currency, and metadata before fulfillment.
3. Verify `Stripe-Signature` with the **unmodified raw request body** and the endpoint-specific `whsec_...` secret.
4. Store Stripe event IDs and Checkout Session IDs under unique constraints. Stripe can retry and deliver duplicate events, including concurrently.
5. Do not assume event ordering. Retrieve/validate the relevant Checkout Session and compare order, amount, currency, payment status, and metadata before fulfillment.
6. Handle `checkout.session.completed` only when payment is paid, `checkout.session.async_payment_succeeded` for delayed confirmation, and mark orders terminal on `checkout.session.async_payment_failed` / `checkout.session.expired`.
7. Store the event in a durable inbox before fulfillment. Current Test Mode handles fulfillment synchronously; queue/DLQ processing is required before higher-volume Live Mode.
8. Test entirely in Stripe sandbox/test mode before enabling live mode. Test keys and webhook signing secrets are different from live credentials.

## E2E result — 2026-09-29

- Test Checkout: THB 49 for 80 credits — paid successfully.
- Order persisted as `paid` with Checkout Session and PaymentIntent IDs.
- Wallet credit: exactly +80; UI displayed the success state.
- Replayed the same success URL: no duplicate credit.
- Used Stripe CLI resend against the real Stripe event and a temporary reachable Managed Preview endpoint: the event arrived from Stripe infrastructure and reached `processed`.
- Replayed the same signed event again: HTTP 200, one event inbox row, one Stripe ledger entry.
- The permanent public domain was unavailable because of managed-hosting billing/quota, so automatic Stripe-to-public-endpoint delivery remains a Live Mode blocker.

## Project safety policy

- `DOODUANG_STRIPE_SECRET_KEY` must start with `sk_test_` unless `STRIPE_LIVE_MODE_ENABLED=true` is deliberately set after launch approval.
- `DOODUANG_STRIPE_WEBHOOK_SECRET` is server-only.
- A redirect with `?payment=success` is not proof of payment; it can only trigger protected server reconciliation against Stripe's API.
- Wallet balance and append-only ledger live in TiDB/MySQL and change only inside server transactions.
