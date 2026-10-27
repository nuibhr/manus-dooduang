import { describe, expect, it } from "vitest";
import Stripe from "stripe";

const secretKey = process.env.DOODUANG_STRIPE_SECRET_KEY ?? "";
const webhookSecret = process.env.DOODUANG_STRIPE_WEBHOOK_SECRET ?? "";

describe.skipIf(!secretKey || !webhookSecret)("Stripe test-mode secrets", () => {
  it("uses test credentials with the expected formats", () => {
    expect(secretKey.startsWith("sk_test_")).toBe(true);
    expect(webhookSecret.startsWith("whsec_")).toBe(true);
  });

  it("authenticates with Stripe in test mode", async () => {
    const stripe = new Stripe(secretKey, { timeout: 10_000, maxNetworkRetries: 1 });
    const account = await stripe.accounts.retrieve();
    expect(account.id).toMatch(/^acct_/);
    expect(account.charges_enabled).toBeTypeOf("boolean");
  }, 20_000);

  it("verifies a signed webhook payload with the configured endpoint secret", () => {
    const payload = JSON.stringify({
      id: "evt_local_signature_check",
      object: "event",
      type: "checkout.session.completed",
      data: { object: { id: "cs_test_local" } },
    });
    const signature = Stripe.webhooks.generateTestHeaderString({ payload, secret: webhookSecret });
    const event = Stripe.webhooks.constructEvent(payload, signature, webhookSecret);
    expect(event.id).toBe("evt_local_signature_check");
  });
});
