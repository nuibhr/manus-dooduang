import type { Express, Request, Response } from "express";
import express from "express";
import Stripe from "stripe";
import { COIN_CATALOG, type CoinSku } from "../../shared/catalog";
import * as db from "../db";
import { ENV } from "../_core/env";

function getStripe(): Stripe {
  if (!ENV.stripeSecretKey) throw new Error("STRIPE_NOT_CONFIGURED");
  if (ENV.stripeSecretKey.startsWith("sk_live_") && !ENV.stripeLiveModeEnabled) {
    throw new Error("STRIPE_LIVE_MODE_DISABLED");
  }
  return new Stripe(ENV.stripeSecretKey, { maxNetworkRetries: 2, timeout: 15_000 });
}

export function getStripeReadiness() {
  const key = ENV.stripeSecretKey;
  return {
    configured: Boolean(key && ENV.stripeWebhookSecret),
    mode: key.startsWith("sk_test_") ? "test" : key.startsWith("sk_live_") ? "live" : "disabled",
    liveModeEnabled: ENV.stripeLiveModeEnabled,
  } as const;
}

export async function createCheckoutSession(input: {
  userId: number;
  email: string | null;
  sku: CoinSku;
  idempotencyKey: string;
  origin: string;
}) {
  const stripe = getStripe();
  const item = COIN_CATALOG[input.sku];

  if (item.firstPurchaseOnly) {
    throw new Error("FIRST_PURCHASE_PROMO_TEMPORARILY_DISABLED");
  }

  const existing = await db.getPaymentOrderByIdempotency(input.userId, input.idempotencyKey);
  if (existing?.stripeCheckoutSessionId) {
    const session = await stripe.checkout.sessions.retrieve(existing.stripeCheckoutSessionId);
    return { order: existing, checkoutUrl: session.url, reused: true };
  }

  const orderId = existing?.id ?? crypto.randomUUID();
  const order = existing ?? await db.createPaymentOrder({
    id: orderId,
    userId: input.userId,
    sku: item.sku,
    amountSatang: item.priceSatang,
    currency: item.currency,
    credits: item.coins,
    idempotencyKey: input.idempotencyKey,
  });

  if (!order) throw new Error("ORDER_CREATE_FAILED");

  const session = await stripe.checkout.sessions.create(
    {
      mode: "payment",
      client_reference_id: order.id,
      customer_email: input.email || undefined,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: item.currency,
            unit_amount: item.priceSatang,
            product_data: {
              name: `${item.name} — ${item.coins.toLocaleString()} เหรียญ`,
              metadata: { sku: item.sku },
            },
          },
        },
      ],
      metadata: {
        orderId: order.id,
        userId: String(input.userId),
        sku: item.sku,
        credits: String(item.coins),
      },
      success_url: `${input.origin}/?payment=success&order_id=${order.id}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${input.origin}/?payment=cancelled&order_id=${order.id}`,
      locale: "th",
    },
    { idempotencyKey: input.idempotencyKey },
  );

  if (!session.url) throw new Error("STRIPE_CHECKOUT_URL_MISSING");
  await db.attachStripeSession(order.id, session.id);

  return {
    order: await db.getPaymentOrder(input.userId, order.id),
    checkoutUrl: session.url,
    reused: false,
  };
}

/**
 * Recovery path for a customer returning from Checkout before a webhook reaches us.
 * The browser return URL is never trusted as proof of payment: this function retrieves
 * the session from Stripe and re-validates ownership plus the server-owned order values.
 * fulfillStripeOrder remains idempotent, so a later webhook cannot grant twice.
 */
export async function reconcileCheckoutSession(input: {
  userId: number;
  orderId: string;
  stripeSessionId: string;
}) {
  const order = await db.getPaymentOrder(input.userId, input.orderId);
  if (!order) throw new Error("ORDER_NOT_FOUND");
  if (order.stripeCheckoutSessionId !== input.stripeSessionId) {
    throw new Error("CHECKOUT_SESSION_MISMATCH");
  }
  if (order.status === "paid") return order;

  const session = await getStripe().checkout.sessions.retrieve(input.stripeSessionId);
  if (
    session.client_reference_id !== order.id ||
    session.metadata?.orderId !== order.id ||
    session.metadata?.userId !== String(input.userId) ||
    session.metadata?.sku !== order.sku
  ) {
    throw new Error("CHECKOUT_SESSION_OWNERSHIP_MISMATCH");
  }
  if (session.payment_status !== "paid") return order;

  await db.fulfillStripeOrder({
    stripeSessionId: session.id,
    paymentIntentId: typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id ?? null,
    amountTotal: session.amount_total ?? -1,
    currency: session.currency ?? "",
    paymentStatus: session.payment_status,
    livemode: session.livemode,
  });
  return db.getPaymentOrder(input.userId, input.orderId);
}

async function processCheckoutEvent(event: Stripe.Event) {
  const object = event.data.object as Stripe.Checkout.Session;
  const processable = new Set([
    "checkout.session.completed",
    "checkout.session.async_payment_succeeded",
    "checkout.session.async_payment_failed",
    "checkout.session.expired",
  ]);

  const accepted = await db.recordPaymentEvent({
    stripeEventId: event.id,
    eventType: event.type,
    objectId: object.id ?? null,
    livemode: event.livemode,
  });
  if (!accepted) return;

  if (!processable.has(event.type)) {
    await db.markPaymentEvent(event.id, "ignored");
    return;
  }

  if (event.type === "checkout.session.async_payment_failed") {
    await db.markPaymentOrderTerminalBySession(object.id, "failed", event.type);
    await db.markPaymentEvent(event.id, "processed");
    return;
  }
  if (event.type === "checkout.session.expired") {
    await db.markPaymentOrderTerminalBySession(object.id, "expired", event.type);
    await db.markPaymentEvent(event.id, "processed");
    return;
  }

  const stripe = getStripe();
  const session = await stripe.checkout.sessions.retrieve(object.id);
  if (session.payment_status !== "paid") {
    await db.markPaymentEvent(event.id, "ignored");
    return;
  }
  await db.fulfillStripeOrder({
    stripeSessionId: session.id,
    paymentIntentId: typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id ?? null,
    amountTotal: session.amount_total ?? -1,
    currency: session.currency ?? "",
    paymentStatus: session.payment_status,
    livemode: event.livemode,
  });
  await db.markPaymentEvent(event.id, "processed");
}

export function registerStripeWebhook(app: Express) {
  app.post(
    "/api/stripe/webhook",
    express.raw({ type: "application/json", limit: "1mb" }),
    async (req: Request, res: Response) => {
      if (!ENV.stripeSecretKey || !ENV.stripeWebhookSecret) {
        return res.status(503).json({ error: "Stripe webhook is not configured" });
      }

      const signature = req.header("stripe-signature");
      if (!signature) return res.status(400).json({ error: "Missing Stripe-Signature" });

      let event: Stripe.Event;
      try {
        event = getStripe().webhooks.constructEvent(req.body, signature, ENV.stripeWebhookSecret);
      } catch {
        return res.status(400).json({ error: "Invalid webhook signature" });
      }

      try {
        await processCheckoutEvent(event);
        return res.status(200).json({ received: true });
      } catch (error: any) {
        await db.markPaymentEvent(event.id, "failed", error?.message || "WEBHOOK_PROCESSING_FAILED").catch(() => undefined);
        console.error("[Stripe webhook] processing failed", { eventId: event.id, type: event.type, code: error?.message });
        return res.status(500).json({ error: "Webhook processing failed" });
      }
    },
  );
}
