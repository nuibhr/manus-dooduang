import { COOKIE_NAME } from "@shared/const";
import { COIN_CATALOG } from "@shared/catalog";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import * as db from "./db";
import { createCheckoutSession, getStripeReadiness, reconcileCheckoutSession } from "./payments/stripe";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { verifyLineIdToken } from "./lineLiff";

const coinSkuSchema = z.enum(Object.keys(COIN_CATALOG) as [keyof typeof COIN_CATALOG, ...(keyof typeof COIN_CATALOG)[]]);
const uuidSchema = z.string().uuid();

function requestOrigin(req: { protocol: string; headers: Record<string, unknown>; get?: (name: string) => string | undefined }) {
  const forwardedProto = String(req.headers["x-forwarded-proto"] || req.protocol || "https").split(",")[0].trim();
  const forwardedHost = String(req.headers["x-forwarded-host"] || req.get?.("host") || "").split(",")[0].trim();
  if (!forwardedHost) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Request host is unavailable" });
  const safeHost = forwardedHost === "doopuangth-7zcjyrkh.manus.space" || forwardedHost.endsWith(".manus.computer") || forwardedHost === "localhost:3000";
  if (!safeHost) throw new TRPCError({ code: "BAD_REQUEST", message: "Untrusted request host" });
  return `${forwardedProto === "http" ? "http" : "https"}://${forwardedHost}`;
}

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  account: router({
    bootstrap: protectedProcedure.query(async ({ ctx }) => {
      const [wallet, profile, rewards, readings] = await Promise.all([
        db.getWalletSnapshot(ctx.user.id),
        db.getProfile(ctx.user.id),
        db.getRewardStatus(ctx.user.id),
        db.listReadings(ctx.user.id, 50),
      ]);
      return { user: ctx.user, ...wallet, profile, rewards, readings };
    }),
    saveProfile: protectedProcedure
      .input(z.object({
        birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
        birthTime: z.string().regex(/^\d{2}:\d{2}$/),
        birthTimeUnknown: z.boolean(),
        consentVersion: z.literal("privacy-v1"),
      }).strict())
      .mutation(({ ctx, input }) => db.upsertProfile({ userId: ctx.user.id, ...input })),
  }),

  line: router({
    status: protectedProcedure.query(async ({ ctx }) => {
      const linked = await db.getLineAccount(ctx.user.id);
      return { linked: Boolean(linked) } as const;
    }),
    link: protectedProcedure
      .input(z.object({ idToken: z.string().min(32).max(8192) }).strict())
      .mutation(async ({ ctx, input }) => {
        let identity: { userId: string };
        try {
          identity = await verifyLineIdToken(input.idToken);
        } catch (error: any) {
          console.warn("[LINE link] ID token verification failed", { code: error?.code || "VERIFY_FAILED" });
          throw new TRPCError({ code: "UNAUTHORIZED", message: "ตรวจสอบการเข้าสู่ระบบ LINE ไม่สำเร็จ กรุณาลองใหม่" });
        }

        try {
          const result = await db.linkLineAccount(ctx.user.id, identity.userId);
          return { linked: result.linked, alreadyLinked: result.alreadyLinked } as const;
        } catch (error: any) {
          if (error?.message === "LINE_ACCOUNT_ALREADY_LINKED") {
            throw new TRPCError({ code: "CONFLICT", message: "บัญชี Dooduang นี้เชื่อมกับ LINE บัญชีอื่นแล้ว" });
          }
          if (error?.message === "LINE_ID_ALREADY_LINKED") {
            throw new TRPCError({ code: "CONFLICT", message: "LINE บัญชีนี้เชื่อมกับบัญชี Dooduang อื่นแล้ว" });
          }
          console.error("[LINE link] database operation failed", { userId: ctx.user.id });
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "บันทึกการเชื่อมบัญชีไม่สำเร็จ กรุณาลองใหม่" });
        }
      }),
  }),

  wallet: router({
    get: protectedProcedure.query(({ ctx }) => db.getWalletSnapshot(ctx.user.id)),
    claimReward: protectedProcedure
      .input(z.object({ claimType: z.enum(["daily_checkin", "social_share"]) }).strict())
      .mutation(({ ctx, input }) => db.claimReward(ctx.user.id, input.claimType)),
  }),

  readings: router({
    list: protectedProcedure
      .input(z.object({ limit: z.number().int().min(1).max(100).default(50) }).default({ limit: 50 }))
      .query(({ ctx, input }) => db.listReadings(ctx.user.id, input.limit)),
    delete: protectedProcedure
      .input(z.object({ id: uuidSchema }).strict())
      .mutation(async ({ ctx, input }) => {
        await db.deleteReading(ctx.user.id, input.id);
        return { success: true } as const;
      }),
    clear: protectedProcedure.mutation(async ({ ctx }) => {
      await db.clearReadings(ctx.user.id);
      return { success: true } as const;
    }),
  }),

  payments: router({
    readiness: publicProcedure.query(() => getStripeReadiness()),
    createCheckout: protectedProcedure
      .input(z.object({
        sku: coinSkuSchema,
        idempotencyKey: z.string().min(16).max(128).regex(/^[A-Za-z0-9:_-]+$/),
      }).strict())
      .mutation(async ({ ctx, input }) => {
        const readiness = getStripeReadiness();
        if (!readiness.configured) {
          throw new TRPCError({ code: "PRECONDITION_FAILED", message: "Stripe test mode is not configured yet" });
        }
        try {
          return await createCheckoutSession({
            userId: ctx.user.id,
            email: ctx.user.email,
            sku: input.sku,
            idempotencyKey: `user:${ctx.user.id}:${input.idempotencyKey}`,
            origin: requestOrigin(ctx.req),
          });
        } catch (error: any) {
          const message = error?.message || "CHECKOUT_CREATE_FAILED";
          const code = message.includes("LIVE_MODE") ? "PRECONDITION_FAILED" : "INTERNAL_SERVER_ERROR";
          throw new TRPCError({ code, message });
        }
      }),
    order: protectedProcedure
      .input(z.object({ id: uuidSchema }).strict())
      .query(({ ctx, input }) => db.getPaymentOrder(ctx.user.id, input.id)),
    reconcile: protectedProcedure
      .input(z.object({
        id: uuidSchema,
        sessionId: z.string().regex(/^cs_(test|live)_[A-Za-z0-9]+$/).max(255),
      }).strict())
      .mutation(async ({ ctx, input }) => {
        try {
          return await reconcileCheckoutSession({
            userId: ctx.user.id,
            orderId: input.id,
            stripeSessionId: input.sessionId,
          });
        } catch (error: any) {
          console.error("[Stripe reconcile] failed", { userId: ctx.user.id, orderId: input.id, code: error?.message });
          throw new TRPCError({ code: "BAD_REQUEST", message: "Unable to verify Stripe payment" });
        }
      }),
  }),
});

export type AppRouter = typeof appRouter;
