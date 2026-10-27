# ดูดวงค่ะอีหญิง — Mobile Tarot MVP

แอปดูดวงภาษาไทยแบบ **React + Vite + Tailwind CSS + Express** เน้นประสบการณ์มือถือ, Tarot-first flow, Liquid Glass UI และ Gemini API ฝั่งเซิร์ฟเวอร์

## ฟีเจอร์เด่น

- ไพ่ Tarot เป็นหน้าแรกบนมือถือ พร้อม Scrollspy 3 ขั้น
- Bottom Navigation: วันนี้, เลขมงคล, เปิดไพ่, แม่หมอ และเมนูเพิ่มเติม
- Tarot / Oracle / Rune / ศาสตร์จีน / ดวงรายวัน / เลขมงคล / แชทต่อเนื่อง
- Light / Dark / System theme และ Mood ของแบรนด์
- Lucky Number Calendar Picker และ quick dates
- Loading overlay, retry state และ single-flight request
- Deep links เช่น `?view=tarot`, `?view=daily`, `?view=numbers`
- Manus OAuth เป็น canonical identity
- TiDB persistence สำหรับ profile, wallet, ledger, readings, rewards และ payment records
- Stripe Checkout Test Mode พร้อม signed webhook, server-verified return reconciliation และ idempotent fulfillment

## เริ่มต้นใช้งาน

ต้องมี Node.js 22 ขึ้นไป และแนะนำให้ใช้ pnpm

```bash
corepack enable
pnpm install
pnpm dev
```

เปิดเว็บที่ URL ซึ่งแสดงใน terminal โดยปกติคือ `http://localhost:3000`

## ตรวจคุณภาพ

```bash
pnpm check
pnpm test
pnpm build
```

ทดสอบ persistence กับ TiDB แบบสร้างข้อมูลชั่วคราวและลบคืนอัตโนมัติ:

```bash
pnpm test:integration
```

## Environment variables

ตั้งค่า Gemini และ Stripe เป็น secrets ฝั่งเซิร์ฟเวอร์เท่านั้น

```bash
GEMINI_API_KEY=your_server_side_key
DOODUANG_STRIPE_SECRET_KEY=sk_test_...
DOODUANG_STRIPE_WEBHOOK_SECRET=whsec_...
```

ห้ามใส่ API key ในไฟล์ frontend, commit, log หรือ URL

ระบบ Managed Hosting จะมีตัวแปรระบบสำหรับ database, OAuth และ built-in services ให้โดยอัตโนมัติ ดูรายการที่ `server/_core/env.ts`

Stripe webhook endpoint:

```text
https://doopuangth-7zcjyrkh.manus.space/api/stripe/webhook
```

Events ที่รองรับในรุ่นนี้:

```text
checkout.session.completed
checkout.session.async_payment_succeeded
checkout.session.async_payment_failed
checkout.session.expired
```

## Database migration

```bash
pnpm drizzle-kit generate
pnpm drizzle-kit migrate
```

ห้ามแก้ schema ฝั่ง TypeScript โดยไม่สร้างและ apply migration ที่สอดคล้องกัน

## โครงสร้างสำคัญ

- `client/src/App.tsx` — navigation, state และ flow หลัก
- `client/src/components/` — หน้าแต่ละศาสตร์และ UI
- `client/src/index.css` — Liquid Glass design tokens และ responsive styles
- `server/dooduangApi.ts` — REST endpoints และ Gemini integration
- `server/routers.ts` — tRPC routes
- `server/payments/stripe.ts` — Checkout และ signed webhook fulfillment
- `drizzle/schema.ts` — authoritative persistence schema
- `PRODUCTION_READINESS_AUDIT_TH.md` — Go/No-Go และ launch checklist ล่าสุด
- `PRODUCT_REVIEW_TH.md` — รีวิวโปรดักต์ จุดขาย และ roadmap
- `todo.md` — สถานะฟีเจอร์/บั๊กและแผนต่อยอด

## หมายเหตุ

คำทำนายใช้เพื่อความบันเทิงและการสะท้อนตนเอง ไม่ใช่คำแนะนำทางการแพทย์ กฎหมาย หรือการเงิน
