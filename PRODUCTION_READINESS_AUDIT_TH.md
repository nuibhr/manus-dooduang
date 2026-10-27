# Production Readiness Review — ดูดวงค่ะอีหญิง

**วันที่ตรวจ:** 29 กันยายน 2026
**สถาปัตยกรรมหลัก:** React + Vite + Express + tRPC + Manus OAuth + TiDB/Drizzle + Stripe Checkout
**โหมด Stripe ปัจจุบัน:** **Test Mode เท่านั้น**

## คำตัดสิน

| ขอบเขต | คำตัดสิน | เหตุผล |
|---|---|---|
| ทดลองภายใน / QA ด้วย Stripe Test Mode | **GO** | Build, tests, DB readiness, Stripe credential validation, auth boundaries และ dependency audit ผ่าน |
| Public beta ที่ยังไม่รับเงินจริง | **GO แบบมีเงื่อนไข** | ต้องมี Privacy/Terms ขั้นต่ำและแจ้งว่าบางฟีเจอร์รองยังเก็บเฉพาะอุปกรณ์ |
| เปิดรับเงินจริงด้วย Stripe Live Mode | **NO-GO ตอนนี้** | Paid E2E ผ่านแล้ว แต่ยังต้องแก้ public webhook reachability และทำ refund/dispute, reconciliation, monitoring, backup/restore และ legal/privacy gate |

> ระบบไม่ได้เชื่อหน้า success หรือ browser ว่าชำระแล้ว การเพิ่มเหรียญเกิดจาก **signed Stripe webhook** หรือ protected return reconciliation ที่ดึง Checkout Session จาก Stripe API แล้วตรวจ ownership, paid status, amount และ currency ฝั่ง serverเท่านั้น

---

## 1. สรุปผลตรวจล่าสุด

| ระบบ | ผล | หลักฐาน/พฤติกรรมที่ยืนยัน |
|---|---|---|
| TypeScript | **ผ่าน** | `pnpm check` ผ่าน |
| Tests | **ผ่าน 11 unit/security + 1 TiDB integration** | Auth boundary, reconciliation boundary, catalog invariants, Gemini/Stripe secrets, webhook signature และ reversible persistence (opt-in) |
| Production build | **ผ่าน** | Vite และ server bundle build สำเร็จ |
| Production runtime | **ผ่าน** | `/api/health` 200, `/readyz` = DB OK + Stripe configured, หน้าเว็บ 200 |
| Dependency security | **ผ่าน** | `pnpm audit --prod --audit-level=low` รายงาน **No known vulnerabilities** |
| Stripe credentials | **ผ่าน Test Mode** | `sk_test_...` authenticate กับ Stripe API จริง และ `whsec_...` verify signed payload ได้ |
| Paid Checkout E2E | **ผ่านบน Managed Preview** | ฿49 / 80 เหรียญ, order `paid`, UI success, wallet +80 และ ledger 1 รายการ |
| Webhook delivery + duplicate protection | **ผ่านบน Managed Preview** | Stripe CLI resend จาก Stripe infrastructure ถึง HTTPS endpoint จริง, event `processed`; replay success/event ซ้ำแล้ว balance ไม่เพิ่มซ้ำ |
| Anonymous AI access | **ถูกบล็อก** | `/api/gemini/*` ตอบ 401 เมื่อไม่มี Manus OAuth session |
| Invalid Stripe webhook | **ถูกบล็อก** | ลายเซ็นผิดตอบ 400 และไม่แตะ wallet |
| TiDB schema | **ผ่าน** | ตาราง persistence 8 ตารางและ unique constraints อยู่จริง |
| Secret hygiene | **ผ่าน** | ไม่พบ Stripe key/webhook secret ฝังใน source หรือ Git |
| Security headers | **ผ่าน baseline** | CSP, frame protection, nosniff, referrer policy และ Helmet เปิดใช้แล้ว |

### ข้อสังเกตด้านประสิทธิภาพ

- Main JavaScript bundle หลัง minify ประมาณ **2.35 MB** (gzipประมาณ **573 KB**)
- ฟังก์ชันหลักทำงาน แต่ควรทำ route/component lazy loading ก่อนยิงโฆษณาหรือรับ traffic จำนวนมาก

---

## 2. ข้อมูลใดถูกบันทึกในฐานข้อมูลจริง

ฐานข้อมูล TiDB เป็น source of truth หลังผู้ใช้เข้าสู่ระบบด้วย Manus OAuth

| ตาราง | ข้อมูลที่บันทึก | Authority |
|---|---|---|
| `users` | Manus `openId`, ชื่อ, email, role, เวลาล็อกอิน | Server only |
| `user_profiles` | วันเกิด เวลาเกิด สถานะไม่ทราบเวลา ราศี/ลัคนาที่คำนวณ | Server mutation |
| `wallet_accounts` | ยอดเหรียญปัจจุบันและจำนวนเหรียญตลอดชีพ | Server transaction |
| `wallet_ledger` | รายการ credit/debit แบบ immutable พร้อม balance หลังรายการ | Server transaction + unique idempotency |
| `fortune_readings` | ศาสตร์ คำถาม ไพ่/รายการที่เลือก ผลคำทำนาย ระดับ และเหรียญที่ใช้ | Server only |
| `reward_claims` | Daily/share reward ต่อผู้ใช้และวัน | Unique per user/type/period |
| `payment_orders` | SKU, ราคาเป็นสตางค์, currency, credits, Stripe session, สถานะ | Server-created order |
| `payment_events` | Stripe event inbox, event type, mode และสถานะประมวลผล | Signed webhook only |

### สถานะฐานข้อมูล ณ เวลาตรวจ

- ตารางทั้งหมดสร้างจริงและเชื่อมต่อสำเร็จ
- หลัง QA จริงมี user/wallet 1 บัญชี, ledger 3 รายการ, paid order 1 รายการ, processed Stripe event 1 รายการ และ reward claim 1 รายการ
- TiDB integration test ใช้ข้อมูล synthetic แบบสุ่มและ cleanup คืนอัตโนมัติ; ไม่พบ test residue
- ยังไม่มี fortune reading หรือ profile row เพราะบัญชี QA ยังไม่ได้บันทึกข้อมูลส่วนนั้น

### สิ่งที่เอาออกแล้ว

- Firebase identity/Firestore path ถูกถอดออก เพื่อไม่ให้เกิดสองบัญชีต่อคน
- browser ไม่สามารถปรับ balance หรือยืนยันการชำระเอง
- PromptPay QR/slip simulator ถูกลบ
- teller PIN และ localStorage billing prototype ถูกลบจาก runtime/source
- chat, birth profile, readings และ OAuth user PII ไม่ถูก mirror ลง localStorage

### ข้อมูลรองที่ยังเป็น device-local

ฟีเจอร์รองบางตัว เช่น saved lucky-number collection, weekly visualization history, theme และ card design settings ยังใช้ localStorage เพื่อ UX เท่านั้น ข้อมูลเหล่านี้ **ไม่ใช่ wallet/payment authority** และยังไม่ sync ข้ามอุปกรณ์

---

## 3. Stripe implementation ที่มีแล้ว

### Checkout

1. ผู้ใช้ต้องล็อกอินด้วย Manus OAuth
2. Browser ส่งเฉพาะ `SKU` และ request idempotency key
3. Server lookup ราคา/เหรียญจาก catalog ของ server
4. Server สร้าง `payment_orders` ก่อนเรียก Stripe
5. Server สร้าง Stripe Checkout Session ใน Test Mode
6. Browser redirect ไป hosted Stripe Checkout

### Webhook

Endpoint:

```text
https://doopuangth-7zcjyrkh.manus.space/api/stripe/webhook
```

Events ที่ต้องเลือก:

```text
checkout.session.completed
checkout.session.async_payment_succeeded
checkout.session.async_payment_failed
checkout.session.expired
```

Webhook pipeline:

1. รับ raw body ก่อน global JSON parser
2. ตรวจ `Stripe-Signature` ด้วย endpoint secret
3. allow-list เฉพาะสี่ event ข้างต้น
4. บันทึก event ID เพื่อ deduplicate/retry
5. retrieve Checkout Session จาก Stripe อีกครั้ง
6. ตรวจ `payment_status=paid`, Test/Live mode, Stripe session ที่ผูกกับ server-created order, amount และ currency; return reconciliation ตรวจ order/user/SKU metadata เพิ่มเติม
7. lock wallet/order ใน TiDB transaction
8. เพิ่ม ledger และ balance เพียงครั้งเดียว
9. เปลี่ยน order เป็น `paid`

### Safety controls

- Test key ใช้งานได้จริง และ Live key ถูกปฏิเสธถ้ายังไม่เปิด kill switch
- Success URL อย่างเดียวเพิ่มเหรียญไม่ได้; protected reconciliation ต้อง retrieve และตรวจ paid Checkout Session จาก Stripe API ก่อน
- Stripe event ซ้ำไม่เพิ่มเหรียญซ้ำ
- price/currency ไม่เชื่อข้อมูลจาก browser
- idempotency key ถูก namespace ด้วย user ID ฝั่ง server
- โปร first-purchase ถูกปิดชั่วคราวเพื่อไม่ให้เกิด race condition
- แพ็กที่เปิดตอนนี้เริ่มที่ **฿49 / 80 เหรียญ**

---

## 4. จุดที่แก้จาก audit เดิม

| ปัญหาเดิม | สถานะปัจจุบัน |
|---|---|
| Browser mint เหรียญเอง | **แก้แล้ว** — wallet/ledger เป็น TiDB transaction |
| PaymentModal จำลอง success ด้วย timer | **แก้แล้ว** — ใช้ Stripe Checkout จริงใน Test Mode |
| Gemini anonymous/cost drain | **แก้แล้ว** — OAuth, strict Zod schemas, body limit และ rate limit |
| Firebase/Manus identity split | **แก้แล้ว** — ใช้ Manus OAuth เป็น canonical identity |
| ประวัติ/วันเกิดเก็บใน localStorage | **แก้แล้วสำหรับข้อมูลบัญชีหลัก** — persist ผ่าน TiDB |
| Teller PIN/URL bypass | **แก้แล้ว** — ปิดและลบ prototype |
| ไม่มี Stripe webhook signature | **แก้แล้ว** |
| ไม่มี idempotent fulfillment | **แก้แล้ว** |
| ไม่มี DB tables สำหรับธุรกรรม | **แก้แล้ว** |
| ไม่มี security headers/readiness | **แก้แล้ว baseline** |
| Dependency audit มี Critical/High | **แก้แล้ว** — 0 known vulnerabilities |
| Port fallback อาจรันผิดพอร์ต | **แก้แล้ว** — bind exact configured port หรือ fail |

---

## 5. สิ่งที่ยังไม่พร้อมและมีโอกาสพัง

### P0 ก่อนเปิดรับเงินจริง

1. **Public webhook endpoint ยังรับ event อัตโนมัติไม่ได้**
   - Stripe Test Payment สำเร็จและ server-side reconciliation เพิ่ม 80 เหรียญถูกต้อง
   - Stripe infrastructure resend event ถึง Managed Preview HTTPS endpoint จริง; inbox เปลี่ยนเป็น `processed` และ replay ซ้ำไม่เพิ่มเหรียญ
   - แต่โดเมนถาวรปัจจุบันตอบ billing/quota unavailable จึงต้องคืน public availability และกด Test webhook จาก Stripe Dashboard ให้ได้ HTTP 200 ก่อน Live Mode

2. **ยังไม่มี refund/dispute/chargeback flow**
   - ห้ามเปิด Live Mode จนกำหนดนโยบายคืนเงินและการถอนเหรียญเมื่อ chargeback

3. **ยังไม่มี reconciliation job/dashboard**
   - ต้องเทียบ Stripe paid sessions ↔ payment orders ↔ wallet ledger เป็นรอบ

4. **Privacy/legal ยังไม่ครบ**
   - ต้องมี Privacy Notice, Terms, refund policy, retention period และ account/data deletion
   - ควรให้ผู้เชี่ยวชาญไทยตรวจ PDPA/ภาษี/ใบเสร็จก่อน Live Mode

5. **Backup/restore ยังไม่ได้ drill**
   - ต้องกำหนด RPO/RTO, backup schedule และทดสอบ restore ใน non-production

6. **Observability ยังไม่พอสำหรับเงินจริง**
   - ต้อง alert webhook failure, payment mismatch, wallet invariant และ Gemini error/cost spike

### P1 ก่อน scale

- Code-split bundle และตั้ง performance budget
- เพิ่ม Playwright E2E สำหรับ login, reading, reward และ payment return
- เพิ่ม concurrency tests สำหรับ wallet debit/reward/webhook
- ย้าย saved lucky numbers/weekly history ที่ต้องการ sync ข้ามเครื่องเข้า backend
- แยก `App.tsx` และ `dooduangApi.ts` ซึ่งยังมีขนาดใหญ่
- เพิ่ม export/delete workflow และ authenticated audit trail

---

## 6. Launch checklist ที่แนะนำ

### ตอนนี้: Test Mode QA

- [x] Stripe Test Secret Key
- [x] Stripe webhook signing secret
- [x] Endpoint URL ถูกต้อง
- [x] เลือก 2 webhook events ที่ backend รองรับ
- [x] TiDB migrations applied
- [x] Typecheck/tests/build ผ่าน
- [x] Dependency audit = 0 known vulnerabilities
- [x] ล็อกอินบัญชี QA ครั้งแรกและยืนยัน user/wallet rows
- [x] ชำระด้วย Stripe test card และยืนยัน server-side fulfillment
- [x] Stripe external resend ถึง Managed Preview และ success URL/event ซ้ำ; ยืนยัน no double credit
- [ ] คืน public deployment availability และยืนยัน Stripe Dashboard ส่ง webhook ได้ HTTP 200
- [ ] ทดสอบ insufficient credits และ AI failure refund

### ก่อนเปิด Live Mode

- [ ] ผ่านทุก Test Mode QA ด้านบน
- [ ] Refund/dispute/chargeback state machine
- [ ] Daily reconciliation + alerting
- [ ] Privacy/Terms/refund policy/retention/delete flow
- [ ] Backup + restore drill
- [ ] Support runbook และผู้รับผิดชอบ incident
- [ ] แยก Live webhook endpoint/secret จาก Test Mode
- [ ] เปลี่ยนเป็น live key ผ่าน managed secrets เท่านั้น
- [ ] เปิด `STRIPE_LIVE_MODE_ENABLED=true` ใน release ที่ได้รับอนุมัติ
- [ ] ทำ canary transaction จำนวนต่ำและตรวจบัญชีจริงก่อนเปิด public

---

## 7. คำแนะนำสุดท้าย

**เปิดให้ทีมทดสอบ Stripe Test Mode ได้แล้ว** และ backend core ตอนนี้เป็น server-authoritative จริงสำหรับ identity, profile, wallet, ledger, readings, rewards และ payment records

Paid E2E และ duplicate-event test ผ่านแล้ว แต่ยัง **ไม่ควรเปิด Stripe Live หรือรับเงินจริงจากลูกค้าทั่วไป** จนกว่า public webhook จะเข้าถึงได้จริง และ refund/dispute, reconciliation, privacy/legal กับ backup/monitoring gates ข้างต้นจะครบถ้วน
