import "dotenv/config";
import express from "express";
import helmet from "helmet";
import { createServer } from "http";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { sql } from "drizzle-orm";
import { registerOAuthRoutes } from "./oauth";
import { registerStorageProxy } from "./storageProxy";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";
import { registerDooduangApi } from "../dooduangApi";
import { registerStripeWebhook } from "../payments/stripe";
import { getDb } from "../db";
import { ENV } from "./env";

async function startServer() {
  const app = express();
  const server = createServer(app);
  app.set("trust proxy", 1);
  app.disable("x-powered-by");

  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "data:", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:", "blob:", "https:"],
        connectSrc: ["'self'", "https:", "ws:", "wss:"],
        mediaSrc: ["'self'", "blob:", "https:"],
        objectSrc: ["'none'"],
        frameAncestors: ["'none'"],
        baseUri: ["'self'"],
        formAction: ["'self'", "https://checkout.stripe.com"],
      },
    },
    crossOriginResourcePolicy: { policy: "cross-origin" },
    hsts: ENV.isProduction ? { maxAge: 15_552_000, includeSubDomains: true } : false,
    referrerPolicy: { policy: "no-referrer" },
  }));

  app.get("/livez", (_req, res) => res.status(200).json({ status: "alive" }));
  app.get("/readyz", async (_req, res) => {
    const mandatoryConfig = Boolean(ENV.appId && ENV.cookieSecret && ENV.databaseUrl && process.env.GEMINI_API_KEY);
    try {
      const db = await getDb();
      if (!db) throw new Error("DB_UNAVAILABLE");
      await Promise.race([
        db.execute(sql`SELECT 1`),
        new Promise((_, reject) => setTimeout(() => reject(new Error("DB_TIMEOUT")), 5_000)),
      ]);
      return res.status(mandatoryConfig ? 200 : 503).json({
        status: mandatoryConfig ? "ready" : "config_missing",
        database: "ok",
        stripe: Boolean(ENV.stripeSecretKey && ENV.stripeWebhookSecret),
      });
    } catch {
      return res.status(503).json({ status: "not_ready", database: "unavailable" });
    }
  });

  // Stripe signature verification requires the exact raw bytes. Keep this route before all parsers.
  registerStripeWebhook(app);

  app.use(express.json({ limit: "1mb" }));
  app.use(express.urlencoded({ limit: "64kb", extended: true }));

  registerDooduangApi(app);
  registerStorageProxy(app);
  registerOAuthRoutes(app);
  app.use(
    "/api/trpc",
    createExpressMiddleware({ router: appRouter, createContext }),
  );

  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const port = Number.parseInt(process.env.PORT || "3000", 10);
  if (!Number.isInteger(port) || port <= 0 || port > 65_535) throw new Error("Invalid PORT");

  server.listen(port, "0.0.0.0", () => {
    console.log(`Server running on port ${port}`);
  });
}

startServer().catch(error => {
  console.error("[Startup] fatal error", error instanceof Error ? error.message : "unknown");
  process.exit(1);
});
