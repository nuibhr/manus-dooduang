// User Cosmic Fate Database & Cross-Reading Synchronicity Engine
// โครงสร้างฐานข้อมูลสายใยชะตากรรม & ตัววิเคราะห์ความเชื่อมโยงของคำตอบทุกเมนู (รองรับ LINE Mini App)

import { FortuneReading, DisciplineType } from '../types';
import { HISTORICAL_LOTTERY_DRAWS, TOP_TWO_DIGIT_STATS, HistoricalLotteryDraw } from '../data/lotteryStatsData';

export interface UnlockedLotteryRecord {
  id: string;
  drawPeriod: string; // e.g. "งวดวันที่ 1 ต.ค. 2569"
  dateCreated: string;
  primeRunner: number;
  twoDigits: string[];
  threeDigits: string[];
  coinsSpent: number;
  source: 'cat_assistant_popup' | 'lucky_numbers_view' | 'daily_reward';
  matchedDraws?: {
    drawPeriod: string;
    matchedNumbers: string[];
    prizeType: string;
  }[];
}

export interface LineMiniAppProfile {
  isLineConnected: boolean;
  lineUserId: string; // e.g. "U4af4980629..."
  displayName: string;
  pictureUrl?: string;
  statusMessage?: string;
  lastSyncedAt?: string;
}

export interface FateKarmicSynchronicity {
  hasHistory: boolean;
  totalReadings: number;
  dominantElement: string;
  dominantTheme: string;
  elementCounts: Record<string, number>;
  themeCounts: Record<string, number>;
  latestReading?: FortuneReading;
  previousCardsSummary: string[];
  karmicBridgeAdvice: string;
  sassyCorrelationRoast: string;
  alignmentScore: number;
}

const STORAGE_KEYS = {
  FATE_HISTORY: 'thecatroom_fate_readings_history',
  UNLOCKED_LOTTERY: 'thecatroom_unlocked_lottery_vault',
  LINE_PROFILE: 'thecatroom_line_miniapp_profile',
};

// ----------------------------------------------------
// LINE Mini App Mock / Integration Helpers
// ----------------------------------------------------
export function getLineMiniAppProfile(): LineMiniAppProfile {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.LINE_PROFILE);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error(e);
  }

  // Default LIFF profile state
  return {
    isLineConnected: true,
    lineUserId: 'U98b2c41097fa6102ee81',
    displayName: 'คุณลูกดวง LINE',
    pictureUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    statusMessage: 'ตาสว่างแล้ว เลิกคิดวน 💅✨',
    lastSyncedAt: new Date().toISOString(),
  };
}

export function saveLineMiniAppProfile(profile: LineMiniAppProfile): void {
  try {
    localStorage.setItem(STORAGE_KEYS.LINE_PROFILE, JSON.stringify(profile));
  } catch (e) {
    console.error(e);
  }
}

// ----------------------------------------------------
// Unlocked Lottery Vault Helpers (ทุกการจ่ายเหรียญจะบันทึกเลข)
// ----------------------------------------------------
export function getUnlockedLotteryVault(): UnlockedLotteryRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.UNLOCKED_LOTTERY);
    if (raw) {
      const records: UnlockedLotteryRecord[] = JSON.parse(raw);
      // Auto-refresh match checks against historical draws
      return records.map((rec) => enrichLotteryRecordWithMatches(rec));
    }
  } catch (e) {
    console.error(e);
  }
  return [];
}

export function saveUnlockedLotteryRecord(record: Omit<UnlockedLotteryRecord, 'id' | 'dateCreated' | 'matchedDraws'>): UnlockedLotteryRecord {
  const fullRecord: UnlockedLotteryRecord = {
    ...record,
    id: 'lottery-' + Date.now(),
    dateCreated: new Date().toLocaleString('th-TH'),
    matchedDraws: [],
  };

  const enriched = enrichLotteryRecordWithMatches(fullRecord);
  const current = getUnlockedLotteryVault();
  const updated = [enriched, ...current];

  try {
    localStorage.setItem(STORAGE_KEYS.UNLOCKED_LOTTERY, JSON.stringify(updated));
  } catch (e) {
    console.error(e);
  }

  return enriched;
}

// Compare unlocked numbers against historical winning numbers
function enrichLotteryRecordWithMatches(rec: UnlockedLotteryRecord): UnlockedLotteryRecord {
  const matches: { drawPeriod: string; matchedNumbers: string[]; prizeType: string }[] = [];

  for (const draw of HISTORICAL_LOTTERY_DRAWS) {
    const matchedNumbers: string[] = [];

    // Check 2 digits match
    if (rec.twoDigits.includes(draw.twoDigits)) {
      matchedNumbers.push(`2 ตัวท้าย (${draw.twoDigits})`);
    }

    // Check 3 digits match
    for (const d3 of rec.threeDigits) {
      if (draw.backThreeDigits.includes(d3) || draw.frontThreeDigits.includes(d3)) {
        matchedNumbers.push(`3 ตัว (${d3})`);
      }
    }

    // Check prime runner digit appearing in first prize or 2 digits
    if (draw.twoDigits.includes(String(rec.primeRunner))) {
      matchedNumbers.push(`วิ่งตรง ${rec.primeRunner}`);
    }

    if (matchedNumbers.length > 0) {
      matches.push({
        drawPeriod: draw.period,
        matchedNumbers,
        prizeType: 'เคยตรงกับสถิติงวด ' + draw.period,
      });
    }
  }

  return {
    ...rec,
    matchedDraws: matches,
  };
}

// ----------------------------------------------------
// Cross-Reading Fate Synchronicity & Correlation Engine
// ----------------------------------------------------
export function analyzeFateSynchronicity(readings: FortuneReading[]): FateKarmicSynchronicity {
  if (!readings || readings.length === 0) {
    return {
      hasHistory: false,
      totalReadings: 0,
      dominantElement: 'ธาตุรู้แจ้ง (Awakening Spirit)',
      dominantTheme: 'เริ่มต้นเส้นทางค้นหาตัวเอง',
      elementCounts: {},
      themeCounts: {},
      previousCardsSummary: [],
      karmicBridgeAdvice: 'ยังไม่มีประวัติดวงก่อนหน้า เริ่มต้นเปิดไพ่ใบแรกเพื่อให้จักรวาลเริ่มร้อยเรียงเส้นใยชะตาของคุณได้เลย!',
      sassyCorrelationRoast: 'กระดาษยังขาวสะอาดแก! รีบเปิดดวงเปิดไพ่สักใบ ให้แม่หมอได้อ่านใจแกหน่อยซิว่าจะเอาไงต่อกับชีวิต',
      alignmentScore: 50,
    };
  }

  const elementCounts: Record<string, number> = {
    'ไฟ (Fire)': 0,
    'ดิน (Earth)': 0,
    'ลม (Air)': 0,
    'น้ำ (Water)': 0,
    'ทอง/โลหะ (Metal)': 0,
    'ไม้ (Wood)': 0,
  };

  const themeCounts: Record<string, number> = {
    'ความรัก & ความผูกพัน': 0,
    'การงาน & ธุรกิจ': 0,
    'การเงิน & โชคลาภ': 0,
    'สติ & สุขภาพจิต': 0,
    'ทิศทางชีวิต & จิตวิญญาณ': 0,
  };

  const cardNames: string[] = [];

  readings.forEach((r) => {
    // Categorize topic
    const t = (r.topic || '').toLowerCase();
    if (t.includes('รัก') || t.includes('แฟน') || t.includes('คุย') || t.includes('คนโปรด')) {
      themeCounts['ความรัก & ความผูกพัน']++;
    } else if (t.includes('งาน') || t.includes('อาชีพ') || t.includes('โปรเจกต์')) {
      themeCounts['การงาน & ธุรกิจ']++;
    } else if (t.includes('เงิน') || t.includes('หนี้') || t.includes('โชค') || t.includes('หวย')) {
      themeCounts['การเงิน & โชคลาภ']++;
    } else if (t.includes('สติ') || t.includes('ใจ') || t.includes('เครียด')) {
      themeCounts['สติ & สุขภาพจิต']++;
    } else {
      themeCounts['ทิศทางชีวิต & จิตวิญญาณ']++;
    }

    // Extract item names
    if (Array.isArray(r.itemsSelected)) {
      r.itemsSelected.forEach((item: any) => {
        const name = item.nameTh || item.name || item.titleTh || item.symbol;
        if (name && !cardNames.includes(name)) {
          cardNames.push(name);
        }
        // Element guessing
        const elem = item.element || '';
        if (elem.includes('ไฟ') || elem.includes('Fire')) elementCounts['ไฟ (Fire)']++;
        else if (elem.includes('ดิน') || elem.includes('Earth')) elementCounts['ดิน (Earth)']++;
        else if (elem.includes('ลม') || elem.includes('Air')) elementCounts['ลม (Air)']++;
        else if (elem.includes('น้ำ') || elem.includes('Water')) elementCounts['น้ำ (Water)']++;
        else if (elem.includes('ทอง') || elem.includes('Metal')) elementCounts['ทอง/โลหะ (Metal)']++;
        else if (elem.includes('ไม้') || elem.includes('Wood')) elementCounts['ไม้ (Wood)']++;
      });
    }
  });

  // Find dominant theme
  let dominantTheme = 'ทิศทางชีวิต & จิตวิญญาณ';
  let maxThemeVal = 0;
  for (const [k, v] of Object.entries(themeCounts)) {
    if (v > maxThemeVal) {
      maxThemeVal = v;
      dominantTheme = k;
    }
  }

  // Find dominant element
  let dominantElement = 'ลม (Air) - พลังความคิดและปัญญา';
  let maxElemVal = 0;
  for (const [k, v] of Object.entries(elementCounts)) {
    if (v > maxElemVal) {
      maxElemVal = v;
      dominantElement = k;
    }
  }

  const latestReading = readings[0];
  const recentCardsStr = cardNames.slice(0, 3).join(', ');

  // Sassy correlation roast connecting previous cards
  let sassyCorrelationRoast = '';
  if (dominantTheme === 'ความรัก & ความผูกพัน') {
    sassyCorrelationRoast = `เปิดมากี่ศาสตร์ ไพ่ก็ยังชี้ไปที่เรื่องหัวใจ! ไพ่ที่แกเคยเปิดได้ (${recentCardsStr}) ชี้ชัดว่าแกไม่ได้กำลังหาแฟนใหม่หรอกแก แกแค่กำลังหาที่พึ่งทางใจเพื่อหนีความเหงา! ตราบใดที่ไม่หยุด People Pleasing คนอื่น ดวงความรักแกก็ยังวนลูปเดิมย่ะ!`;
  } else if (dominantTheme === 'การงาน & ธุรกิจ') {
    sassyCorrelationRoast = `สถิติไพ่ ${readings.length} ครั้งของคุณยืนยันตรงกัน: ศักยภาพเต็มเปี่ยม แต่ "วินัย" กับ "ความกล้า" กำลังตีกัน! ไพ่ชุดเดิมเตือนว่าถ้าแกยังมัวแต่รอให้พร้อม 100% คนอื่นเขาก็แซงหน้าไปคว้าเงินก้อนโตหมดแล้วค่ะสาว!`;
  } else if (dominantTheme === 'การเงิน & โชคลาภ') {
    sassyCorrelationRoast = `สายใยการเงินของคุณเชื่อมกับธาตุ ${dominantElement}! จากการเปิดไพ่ที่ผ่านมา จักรวาลพร้อมเปิดกระเป๋าให้ แต่ติดตรงที่แกชอบหาเรื่องเสียเงินกับของกระจุกกระจิกแก้เครียด เลิกใจใหญ่เลี้ยงคนอื่น แล้วเก็บเงินก้อนไว้ลงทุนได้แล้ว!`;
  } else {
    sassyCorrelationRoast = `สายใยชะตาทั้ง ${readings.length} ศาสตร์กำลังร้อยเรียงคำตอบเดียวกัน: สิ่งที่แกกลัวไม่ใช่ความล้มเหลว แต่คือการต้องยอมรับความจริงแล้วลงมือทำจริงจังต่างหาก! ไพ่ทั้งหลาย (${recentCardsStr}) ขึ้นมาเพื่อเตือนให้แกหยุดหลอกตัวเองได้แล้ว!`;
  }

  const karmicBridgeAdvice = `ความเชื่อมโยงของผลทำนายที่ผ่านมาสะท้อน "ธาตุ${dominantElement.split(' ')[0]}" เป็นแกนกลาง ทุกครั้งที่แกเปิดไพ่ ไพ่ไม่ได้สุ่มมั่ว แต่กำลังสะท้อนเรื่อง ${dominantTheme} เพื่อต้อนให้แกจนมุมและตาสว่างในจุดเดิม!`;

  return {
    hasHistory: true,
    totalReadings: readings.length,
    dominantElement,
    dominantTheme,
    elementCounts,
    themeCounts,
    latestReading,
    previousCardsSummary: cardNames.slice(0, 5),
    karmicBridgeAdvice,
    sassyCorrelationRoast,
    alignmentScore: Math.min(99, 65 + readings.length * 5),
  };
}
