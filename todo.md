# Project Todo — ดูดวงค่ะอีหญิง

อัปเดตล่าสุด: 26 กันยายน 2026

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

## Future roadmap — P0 ก่อนเปิดขายจริง

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
