import type { DisciplineType } from './types';

export interface DisciplineNavItem {
  id: DisciplineType;
  name: string;
  shortName: string;
  icon: string;
  tag: string;
}

export const DISCIPLINE_NAV_ITEMS: DisciplineNavItem[] = [
  { id: 'daily', name: 'Daily Purr จั่วไพ่ประจำวัน', shortName: 'วันนี้', icon: '🐾', tag: 'AI ดวงรายวัน' },
  { id: 'minigame', name: 'มินิเกมโชคชะตา', shortName: 'เสี่ยงทาย', icon: '🎡', tag: 'กงล้อ/เซียมซี' },
  { id: 'card_studio', name: 'สตูดิโอลายไพ่', shortName: 'แต่งไพ่', icon: '🎴', tag: 'หน้า/หลังไพ่ 3D' },
  { id: 'calendar', name: 'ปฏิทินดวงรายเดือน', shortName: 'ปฏิทิน', icon: '📅', tag: 'ฤกษ์มงคล Grid' },
  { id: 'numbers', name: 'คำนวณเลขมงคลดวงดาว', shortName: 'เลขมงคล', icon: '✨', tag: 'Astro Numerology' },
  { id: 'tarot', name: 'ไพ่ยิปซี ทาโรต์', shortName: 'เปิดไพ่', icon: '🃏', tag: '78 ใบ' },
  { id: 'oracle', name: 'ไพ่โอราเคิลแมวดำ', shortName: 'โอราเคิล', icon: '🔮', tag: 'จิตใต้สำนึก' },
  { id: 'rune', name: 'หินรูนนอร์ส', shortName: 'รูน', icon: 'ᛋ', tag: 'อักษรโบราณ' },
  { id: 'chinese', name: 'ศาสตร์จีน 5 ธาตุ', shortName: 'ดวงจีน', icon: '☯️', tag: 'ปาจื่อ/อี้จิง' },
  { id: 'chat', name: 'แชทแม่หมอเหมียว', shortName: 'แม่หมอ', icon: '💬', tag: 'คุยต่อเนื่อง' },
];

// Keep Tarot in the visual center of the five-item bottom navigation.
export const MOBILE_PRIMARY_DISCIPLINES: DisciplineType[] = ['daily', 'numbers', 'tarot', 'chat'];
