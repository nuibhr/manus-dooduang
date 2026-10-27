# Project Todo — ดูดวงค่ะอีหญิง

อัปเดตล่าสุด: 29 กันยายน 2026

## งานรุ่น Mobile Tarot MVP

| สถานะ | งาน | หลักฐานการตรวจ |
|---|---|---|
| [x] | ป้องกัน Bottom Nav, More sheet, Drawer และ Modal ซ้อนกัน | ทดสอบ More → History: Sheet ปิดก่อนและเหลือ fixed content layer เดียว |
| [x] | ยก Tarot เป็นค่าเริ่มต้นบนมือถือและ CTA กลาง | QA viewport 390×844 |
| [x] | เพิ่ม Tarot Scrollspy 3 ขั้น: ตั้งคำถาม → เลือกไพ่ → อ่านดวง | IntersectionObserver + smooth scroll + Reduced Motion |
| [x] | ย่อ Daily Reward บนมือถือ | แสดงเป็นแถบ compact; desktop ยังใช้ dashboard เต็ม |
| [x] | แก้ Today ให้พาไปเนื้อหาดวงจริง | `discipline-content` scroll target และ Daily draw button แสดงครบ |
| [x] | แก้ Lucky Number ไม่เด้ง | deep link, loading state, error/retry และผลลัพธ์จริง |
| [x] | เพิ่ม Liquid Calendar Date Picker | Calendar Popover + วันนี้/พรุ่งนี้/วันหวยออก |
| [x] | แก้ Light Mode contrast | semantic surfaces และ audit ข้อความแม่หมอ |
| [x] | เพิ่ม deep links ของแต่ละศาสตร์ | `?view=daily`, `?view=numbers`, `?view=tarot` เป็นต้น |
| [x] | เพิ่ม parallax แบบเบา | requestAnimationFrame + Reduced Motion guard |
| [x] | เปลี่ยน emoji หลักใน Bottom Nav เป็น Lucide icons | semantic SVG icons พร้อม active state |

## Backend & Stripe Test Mode

| สถานะ | งาน | หลักฐานการตรวจ |
|---|---|---|
| [x] | ใช้ Manus OAuth เป็น canonical identity | Firebase path ถูกถอดและ protected APIs derive user ฝั่ง server |
| [x] | TiDB persistence สำหรับ profile, wallet, ledger, readings, rewards และ payment | migrations applied และ `/readyz` ตรวจ DB ผ่าน |
| [x] | Server-authoritative debit/reward | DB transaction, row lock, unique idempotency/per-period constraints |
| [x] | Stripe Checkout Test Mode | Test secret authenticate กับ Stripe API จริง |
| [x] | Signed webhook fulfillment | raw body, signature verification, success/failed/expired events และ dedupe inbox |
| [x] | Payment return reconciliation | UI poll server order แล้ว refresh wallet; success URL ไม่ grant เหรียญ |
| [x] | ปิด PromptPay/slip/teller prototypes | ไม่มี browser-side paid/credit path ใน runtime |
| [x] | Production security baseline | Helmet/CSP, exact port, body limits, auth, Zod, rate limit |
| [x] | Dependency security gate | `pnpm audit --prod --audit-level=low` = 0 known vulnerabilities |
| [x] | Regression gate | TypeScript, 11 unit/security tests, 1 opt-in TiDB integration test, build และ runtime smoke ผ่าน |
| [x] | Stripe paid E2E | Test card ฿49, UI success, order paid, wallet +80 และ ledger ครบ |
| [x] | Stripe delivery/idempotency E2E | external resend ถึง Managed Preview; replay success/event ซ้ำแล้วไม่เพิ่มเครดิตซ้ำ |

## P0 — ก่อนเปิด Stripe Live Mode

- Planned — คืน public deployment availability และให้ Stripe Dashboard ส่ง webhook ถึง endpoint ได้ HTTP 200
- Planned — Refund/dispute/chargeback state machine
- Planned — Daily Stripe/order/ledger reconciliation และ alerting
- Planned — Privacy Notice, Terms, refund policy, retention และ account deletion
- Planned — Backup/restore drill พร้อม RPO/RTO
- Planned — แยก Live webhook secret และเปิด kill switch หลังอนุมัติ release เท่านั้น

## Product roadmap — ก่อน scale

- Planned — ผูก Daily cache กับวันที่ `Asia/Bangkok`, profile และ focus
- Planned — เพิ่ม API timeout, AbortController และ idempotency key สำหรับการตัดเหรียญ
- Planned — แสดง source/evidence chips ว่าคำทำนายใช้ข้อมูลอะไร และอะไรเป็นข้อมูลจำลอง
- Planned — เพิ่ม analytics funnel แบบไม่เก็บข้อความส่วนตัว: view → select cards → result → share → continue
- Planned — ทำ first-visit setup 3 ขั้นที่ข้ามได้

## P1 — จุดแข็งสำหรับป้ายยาและ retention

- Planned — Story Card 9:16 สำหรับแชร์ LINE/IG
- Planned — “ไพ่ใบนี้ตามคุณมาอีกแล้ว” จาก card recurrence
- Planned — เลือก action 1 ข้อจากคำทำนายและเช็กอินวันถัดไป
- Planned — Prompt เข้าสู่ระบบหลังได้รับผลลัพธ์ ไม่ขวาง free reading
- Planned — Lazy-load หน้าศาสตร์/Calendar/Modal เพื่อลด initial JS bundle

## P2 — Growth loops

- Planned — Compatibility share loop แบบยินยอมและไม่เปิดเผยประวัติ
- Planned — Referral reward ที่ป้องกัน self-referral
- Planned — A/B test copy ของ Tarot CTA และ Result continuation
