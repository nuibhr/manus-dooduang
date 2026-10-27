import { FortuneReading } from '../types';

export interface ZodiacSignInfo {
  id: string;
  nameTh: string;
  nameEn: string;
  symbol: string;
  element: 'Fire' | 'Earth' | 'Air' | 'Water';
  elementTh: string;
  elementColor: string;
  dateRange: string;
  planet: string;
  strengths: string[];
  sassyTrait: string;
  lagnaTrait: string;
}

export const ALL_ZODIAC_SIGNS: ZodiacSignInfo[] = [
  {
    id: 'aries',
    nameTh: 'ราศีเมษ',
    nameEn: 'Aries',
    symbol: '♈',
    element: 'Fire',
    elementTh: 'ธาตุไฟ',
    elementColor: '#EF4444',
    dateRange: '13 เม.ย. - 13 พ.ค.',
    planet: 'ดาวอังคาร (Mars)',
    strengths: ['กล้าได้กล้าเสีย', 'ตัดสินใจฉับไว', 'ไฟแรงนำทัพ'],
    sassyTrait: 'พร้อมบวกทุกสถานการณ์ พูดก่อนคิด แต่รักเพื่อนสุดใจ ใครทำเพื่อนเจ็บนางตามสาป!',
    lagnaTrait: 'บุคลิกผู้นำโดยกำเนิด แอคทีฟ อยู่นิ่งไม่ได้ หน้าตรงสายตาเฉียบคม มักเป็นคนบุกเบิกสิ่งใหม่'
  },
  {
    id: 'taurus',
    nameTh: 'ราศีพฤษภ',
    nameEn: 'Taurus',
    symbol: '♉',
    element: 'Earth',
    elementTh: 'ธาตุดิน',
    elementColor: '#10B981',
    dateRange: '14 พ.ค. - 13 มิ.ย.',
    planet: 'ดาวศุกร์ (Venus)',
    strengths: ['การเงินมั่นคง', 'อดทนสูง', 'ตาถึงเรื่องของกินและเงิน'],
    sassyTrait: 'หัวดื้ออันดับหนึ่ง อย่ามาเร่งตอนกินข้าว แต่เรื่องเงินไว้ใจได้ร้อยเปอร์เซ็นต์ เก็บเงินเก่งดุจตู้เซฟ',
    lagnaTrait: 'สุขุม นุ่มลึก รูปร่างหนักแน่น มีเสน่ห์ทางเสียงและรอยยิ้ม รักความมั่นคง ไม่ชอบการเปลี่ยนแปลงกะทันหัน'
  },
  {
    id: 'gemini',
    nameTh: 'ราศีเมถุน',
    nameEn: 'Gemini',
    symbol: '♊',
    element: 'Air',
    elementTh: 'ธาตุลม',
    elementColor: '#06B6D4',
    dateRange: '14 มิ.ย. - 14 ก.ค.',
    planet: 'ดาวพุธ (Mercury)',
    strengths: ['การเจรจาต่อรอง', 'หัวไวมีมุกเยอะ', 'ปรับตัวเก่ง'],
    sassyTrait: 'มี 8 บุคลิกในคนเดียว คุยสนุกจนลืมเวลา แต่อย่าให้สัญญาเพราะเปลี่ยนใจเร็วยิ่งกว่า 5G',
    lagnaTrait: 'หน้าเด็ก คล่องแคล่ว มือไม้อยู่ไม่สุข ช่างเจรจา รู้รอบทิศ จับใจความเก่ง มักมีสองงานในเวลาเดียวกัน'
  },
  {
    id: 'cancer',
    nameTh: 'ราศีกรกฎ',
    nameEn: 'Cancer',
    symbol: '♋',
    element: 'Water',
    elementTh: 'ธาตุน้ำ',
    elementColor: '#3B82F6',
    dateRange: '15 ก.ค. - 16 ส.ค.',
    planet: 'ดวงจันทร์ (Moon)',
    strengths: ['ดูแลเทคแคร์ดี', 'สัญชาตญาณแม่น', 'เซฟโซนทางใจ'],
    sassyTrait: 'งอนเก่งเก็บเงียบ แต่ถ้าเขารักคุณ เขาจะป้อนข้าวป้อนน้ำไม่ให้ลำบาก ชาตินี้ไม่ปล่อยให้หิว!',
    lagnaTrait: 'แววตาอ่อนโยน ใบหน้าอิ่มเอิบ เซนส์แรงสัมผัสอารมณ์คนอื่นได้ไว รักครอบครัวและผูกพันกับบ้าน'
  },
  {
    id: 'leo',
    nameTh: 'ราศีสิงห์',
    nameEn: 'Leo',
    symbol: '♌',
    element: 'Fire',
    elementTh: 'ธาตุไฟ',
    elementColor: '#F59E0B',
    dateRange: '17 ส.ค. - 16 ก.ย.',
    planet: 'ดวงอาทิตย์ (Sun)',
    strengths: ['ภาวะผู้นำ', 'ใจใหญ่สายเปย์', 'มีออร่าเปล่งประกาย'],
    sassyTrait: 'ชอบให้ชมวันละแปดรอบ ถ้าอวยถูกจุดยอมทุ่มเทหมดหน้าตัก ศักดิ์ศรียิ่งชีพ ห้ามหักหน้าเด็ดขาด!',
    lagnaTrait: 'สง่างาม ออร่าจับ บุคลิกโดดเด่นสะกดทุกสายตา เส้นผมหนาสวย เป็นศูนย์กลางความสนใจของทุกกลุ่ม'
  },
  {
    id: 'virgo',
    nameTh: 'ราศีกันย์',
    nameEn: 'Virgo',
    symbol: '♍',
    element: 'Earth',
    elementTh: 'ธาตุดิน',
    elementColor: '#10B981',
    dateRange: '17 ก.ย. - 16 ต.ค.',
    planet: 'ดาวพุธ (Mercury)',
    strengths: ['ละเอียดรอบคอบ', 'จับผิดเก่ง', 'แก้ปัญหาซับซ้อน'],
    sassyTrait: 'บ่นเหมือนแม่คนที่สอง แต่ทุกคำบ่นคือความจริงที่ช่วยให้คุณไม่เจ๊ง จับโป๊ะคนได้ไวยิ่งกว่านักสืบ',
    lagnaTrait: 'สะอาดสะอ้าน แต่งตัวเนี้ยบ ช่างสังเกต วิเคราะห์ข้อมูลแม่นยำ ไม่ปล่อยให้ข้อผิดพลาดหลุดรอดสายตา'
  },
  {
    id: 'libra',
    nameTh: 'ราศีตุลย์',
    nameEn: 'Libra',
    symbol: '♎',
    element: 'Air',
    elementTh: 'ธาตุลม',
    elementColor: '#8B5CF6',
    dateRange: '17 ต.ค. - 15 พ.ย.',
    planet: 'ดาวศุกร์ (Venus)',
    strengths: ['มีเสน่ห์ประนีประนอม', 'สร้างคอนเนคชั่น', 'รสนิยมดีเลิศ'],
    sassyTrait: 'เลือกร้านอาหารนานเป็นชั่วโมง ตัดสินใจยาก แต่เรื่องไกล่เกลี่ยคนทะเลาะกันและเรื่องความสวยความงามยกให้นาง',
    lagnaTrait: 'หน้าตาได้สัดส่วน บุคลิกนุ่มนวลมีเสน่ห์ เข้ากับทุกคนง่าย รักความยุติธรรม ช่างประนีประนอม'
  },
  {
    id: 'scorpio',
    nameTh: 'ราศีพิจิก',
    nameEn: 'Scorpio',
    symbol: '♏',
    element: 'Water',
    elementTh: 'ธาตุน้ำ',
    elementColor: '#EC4899',
    dateRange: '16 พ.ย. - 15 ธ.ค.',
    planet: 'ดาวอังคาร & พลูโต',
    strengths: ['เจาะลึกความจริง', 'เก็บความลับยอดเยี่ยม', 'พลังใจเหล็กกล้า'],
    sassyTrait: 'ตาขวางหน้านิ่งแต่รักแรงเกลียดแรง สแกนคนแม่นเหมือนกล้อง CCTV อย่าคิดทรยศเพราะเอาคืนเจ็บลึก!',
    lagnaTrait: 'ดวงตาลึกลับน่าค้นหา มีพลังดึงดูดทางเพศและจิตวิญญาณ อ่านใจคนออกทะลุปรุโปร่ง พลังฟื้นตัวสูง'
  },
  {
    id: 'sagittarius',
    nameTh: 'ราศีธนู',
    nameEn: 'Sagittarius',
    symbol: '♐',
    element: 'Fire',
    elementTh: 'ธาตุไฟ',
    elementColor: '#F97316',
    dateRange: '16 ธ.ค. - 13 ม.ค.',
    planet: 'ดาวพฤหัส (Jupiter)',
    strengths: ['วิสัยทัศน์กว้างไกล', 'โชคลาภต่างแดน', 'คิดบวกไม่ยึดติด'],
    sassyTrait: 'พูดตรงเหมือนขวานผ่าซาก ไม่ชอบให้ใครตีกรอบ ชีพจรลงเท้าตลอดเวลา เกลียดคนโกหกที่สุด',
    lagnaTrait: 'มองโลกในแง่ดี รักอิสระ ชอบการเดินทางและการเรียนรู้ เสียงหัวเราะสดใส มีปัญญาญาณลึกซึ้ง'
  },
  {
    id: 'capricorn',
    nameTh: 'ราศีมังกร',
    nameEn: 'Capricorn',
    symbol: '♑',
    element: 'Earth',
    elementTh: 'ธาตุดิน',
    elementColor: '#6B7280',
    dateRange: '14 ม.ค. - 12 ก.พ.',
    planet: 'ดาวเสาร์ (Saturn)',
    strengths: ['สร้างฐานะมั่นคง', 'วินัยเหล็ก', 'มองการณ์ไกล'],
    sassyTrait: 'บ้างานจนลืมหายใจ ไม่ขายฝัน ถ้าบอกว่าจะช่วยคือพาไปถึงเป้าหมายจริง หน้าดูดุแต่ใจดีกับคนของตัวเอง',
    lagnaTrait: 'ดูเป็นผู้ใหญ่เกินวัย สุขุมจริงจัง มีความรับผิดชอบสูง มุ่งมั่นไต่เต้าสู่จุดสูงสุดอย่างอดทน'
  },
  {
    id: 'aquarius',
    nameTh: 'ราศีกุมภ์',
    nameEn: 'Aquarius',
    symbol: '♒',
    element: 'Air',
    elementTh: 'ธาตุลม',
    elementColor: '#38BDF8',
    dateRange: '13 ก.พ. - 13 มี.ค.',
    planet: 'ดาวยูเรนัส (Uranus)',
    strengths: ['ไอเดียนอกกรอบ', 'หัวก้าวหน้าล้ำยุค', 'มีเสน่ห์เฉพาะตัว'],
    sassyTrait: 'เหมือนมนุษย์ต่างดาวที่หลงมาบนโลก คุยด้วยแล้วเปิดโลกแต่คาดเดาไม่ได้ อย่าพยายามเปลี่ยนนางเพราะนางจะไม่ฟัง!',
    lagnaTrait: 'มีเอกลักษณ์ไม่ซ้ำใคร หัวก้าวหน้า ปฏิเสธกรอบเดิมๆ รักเพื่อนฝูง สนใจเทคโนโลยีและอนาคต'
  },
  {
    id: 'pisces',
    nameTh: 'ราศีมีน',
    nameEn: 'Pisces',
    symbol: '♓',
    element: 'Water',
    elementTh: 'ธาตุน้ำ',
    elementColor: '#A855F7',
    dateRange: '14 มี.ค. - 12 เม.ย.',
    planet: 'ดาวเนปจูน (Neptune)',
    strengths: ['จินตนาการสูงส่ง', 'เซนส์แรงเห็นใจผู้อื่น', 'พลังศิลปะ'],
    sassyTrait: 'ดราม่าควีนเบาๆ อ่อนไหวเหมือนแก้วคริสตัล แต่บทจะรอดก็รอดแบบปาฏิหาริย์ มีเทวดาคุ้มครองตลอด',
    lagnaTrait: 'ตากลมโต อ่อนหวาน มีเสน่ห์แบบชวนฝัน มีเซนส์ลี้ลับ ฝันแม่น รักศิลปะและดนตรี เมตตาสูง'
  }
];

export interface LunarYearInfo {
  animal: string;
  animalTh: string;
  element: string;
  elementTh: string;
  symbol: string;
  luckyTraits: string[];
}

export const LUNAR_ANIMALS: { [key: number]: { nameTh: string; animal: string; symbol: string; elementTh: string } } = {
  0: { nameTh: 'ปีวอก (ลิง)', animal: 'Monkey', symbol: '🐒', elementTh: 'ธาตุทอง' },
  1: { nameTh: 'ปีระกา (ไก่)', animal: 'Rooster', symbol: '🐓', elementTh: 'ธาตุทอง' },
  2: { nameTh: 'ปีจอ (สุนัข)', animal: 'Dog', symbol: '🐕', elementTh: 'ธาตุดิน' },
  3: { nameTh: 'ปีกุน (หมู)', animal: 'Pig', symbol: '🐖', elementTh: 'ธาตุน้ำ' },
  4: { nameTh: 'ปีชวด (หนู)', animal: 'Rat', symbol: '🐀', elementTh: 'ธาตุน้ำ' },
  5: { nameTh: 'ปีฉลู (วัว)', animal: 'Ox', symbol: '🐂', elementTh: 'ธาตุดิน' },
  6: { nameTh: 'ปีขาล (เสือ)', animal: 'Tiger', symbol: '🐅', elementTh: 'ธาตุไม้' },
  7: { nameTh: 'ปีเถาะ (กระต่าย)', animal: 'Rabbit', symbol: '🐇', elementTh: 'ธาตุไม้' },
  8: { nameTh: 'ปีมะโรง (มังกร/งูใหญ่)', animal: 'Dragon', symbol: '🐉', elementTh: 'ธาตุดิน-ทอง' },
  9: { nameTh: 'ปีมะเส็ง (งูเล็ก)', animal: 'Snake', symbol: '🐍', elementTh: 'ธาตุไฟ' },
  10: { nameTh: 'ปีมะเมีย (ม้า)', animal: 'Horse', symbol: '🐎', elementTh: 'ธาตุไฟ' },
  11: { nameTh: 'ปีมะแม (แพะ)', animal: 'Goat', symbol: '🐐', elementTh: 'ธาตุดิน' }
};

export interface UserBirthProfile {
  birthDate: string; // YYYY-MM-DD
  birthTime: string; // HH:mm
  isTimeUnknown: boolean;
  sunSign: ZodiacSignInfo;
  lagnaSign: ZodiacSignInfo;
  lunarYear: LunarYearInfo;
  soulmateSign: ZodiacSignInfo; // ภพปัตนิ (เรือนที่ 7 เล็งลัคนา)
  trineSigns: ZodiacSignInfo[]; // ตรีโกณธาตุเดียวกัน (เรือนที่ 5 และ 9)
  wealthSign: ZodiacSignInfo; // ภพกดุมภะ/ลาภะ (หนุนการเงิน)
  birthDayOfWeek: string;
  lagnaDescription: string;
  sunDescription: string;
}

/**
 * Calculate Sun Sign (ราศีเกิดสุริยคติตามโหราศาสตร์ไทย)
 */
export function calculateSunSign(birthDateStr: string): ZodiacSignInfo {
  if (!birthDateStr) return ALL_ZODIAC_SIGNS[0];
  const date = new Date(birthDateStr);
  if (isNaN(date.getTime())) return ALL_ZODIAC_SIGNS[0];

  const m = date.getMonth() + 1; // 1-12
  const d = date.getDate();

  // Thai astrology date ranges
  if ((m === 4 && d >= 13) || (m === 5 && d <= 13)) return ALL_ZODIAC_SIGNS[0]; // Aries (เมษ)
  if ((m === 5 && d >= 14) || (m === 6 && d <= 13)) return ALL_ZODIAC_SIGNS[1]; // Taurus (พฤษภ)
  if ((m === 6 && d >= 14) || (m === 7 && d <= 14)) return ALL_ZODIAC_SIGNS[2]; // Gemini (เมถุน)
  if ((m === 7 && d >= 15) || (m === 8 && d <= 16)) return ALL_ZODIAC_SIGNS[3]; // Cancer (กรกฎ)
  if ((m === 8 && d >= 17) || (m === 9 && d <= 16)) return ALL_ZODIAC_SIGNS[4]; // Leo (สิงห์)
  if ((m === 9 && d >= 17) || (m === 10 && d <= 16)) return ALL_ZODIAC_SIGNS[5]; // Virgo (กันย์)
  if ((m === 10 && d >= 17) || (m === 11 && d <= 15)) return ALL_ZODIAC_SIGNS[6]; // Libra (ตุลย์)
  if ((m === 11 && d >= 16) || (m === 12 && d <= 15)) return ALL_ZODIAC_SIGNS[7]; // Scorpio (พิจิก)
  if ((m === 12 && d >= 16) || (m === 1 && d <= 13)) return ALL_ZODIAC_SIGNS[8]; // Sagittarius (ธนู)
  if ((m === 1 && d >= 14) || (m === 2 && d <= 12)) return ALL_ZODIAC_SIGNS[9]; // Capricorn (มังกร)
  if ((m === 2 && d >= 13) || (m === 3 && d <= 13)) return ALL_ZODIAC_SIGNS[10]; // Aquarius (กุมภ์)
  return ALL_ZODIAC_SIGNS[11]; // Pisces (มีน: 14 มี.ค. - 12 เม.ย.)
}

/**
 * Calculate Lagna / Ascendant (ลัคนาในโหราศาสตร์ไทย)
 * Based on Sun Sign at sunrise (06:00) and 2-hour house progression.
 */
export function calculateLagna(
  birthDateStr: string,
  birthTimeStr: string,
  isTimeUnknown: boolean = false
): { lagnaSign: ZodiacSignInfo; houseOffset: number; explanation: string } {
  const sunSign = calculateSunSign(birthDateStr);
  const sunIndex = ALL_ZODIAC_SIGNS.findIndex(s => s.id === sunSign.id);

  if (isTimeUnknown || !birthTimeStr) {
    // If time is unknown, anchor to Sun sign with note
    return {
      lagnaSign: sunSign,
      houseOffset: 0,
      explanation: 'เนื่องจากไม่ระบุเวลาเกิด ระบบใช้ตำแหน่งอาทิตย์กำเนิด (ราศีเกิด) เป็นแกนหลักในการวิเคราะห์ แนะนำให้ระบุเวลาเกิดเพื่อความแม่นยำระดับลัคนาแท้จริง!'
    };
  }

  const [hStr, mStr] = birthTimeStr.split(':');
  const hour = parseInt(hStr, 10) || 6;
  const minute = parseInt(mStr, 10) || 0;

  // Thai astrology: Sunrise anchor is ~06:00
  // Minutes since 06:00
  let minutesSince6AM = (hour * 60 + minute) - (6 * 60);
  if (minutesSince6AM < 0) {
    minutesSince6AM += 24 * 60;
  }

  // Each zodiac house spans ~120 minutes (2 hours)
  const houseOffset = Math.floor(minutesSince6AM / 120) % 12;
  const lagnaIndex = (sunIndex + houseOffset) % 12;
  const lagnaSign = ALL_ZODIAC_SIGNS[lagnaIndex];

  return {
    lagnaSign,
    houseOffset,
    explanation: `คำนวณตามเวลาเกิด ${birthTimeStr} น. พระอาทิตย์อุทัยกาลโยค ทำให้ลัคนาของคุณสถิต ณ ${lagnaSign.nameTh} (${lagnaSign.elementTh}) สะท้อนตัวตนจิตวิญญาณแท้จริง`
  };
}

/**
 * Calculate Thai / Chinese Lunar Animal Year (ปีนักษัตร)
 */
export function calculateThaiLunarYear(birthDateStr: string): LunarYearInfo {
  let year = 2000;
  if (birthDateStr) {
    const d = new Date(birthDateStr);
    if (!isNaN(d.getFullYear())) {
      year = d.getFullYear();
    }
  }

  // Formula: year % 12
  const rem = ((year % 12) + 12) % 12;
  const item = LUNAR_ANIMALS[rem] || LUNAR_ANIMALS[4];

  return {
    animal: item.animal,
    animalTh: item.nameTh,
    element: item.elementTh,
    elementTh: item.elementTh,
    symbol: item.symbol,
    luckyTraits: ['เสริมความมั่นใจ', 'มีไหวพริบเอาตัวรอด', 'ดึงดูดกัลยาณมิตร']
  };
}

/**
 * Get Day of Week in Thai
 */
export function getThaiDayOfWeek(birthDateStr: string): string {
  if (!birthDateStr) return 'วันจันทร์';
  const d = new Date(birthDateStr);
  const days = ['วันอาทิตย์', 'วันจันทร์', 'วันอังคาร', 'วันพุธ', 'วันพฤหัสบดี', 'วันศุกร์', 'วันเสาร์'];
  return days[d.getDay()] || 'วันจันทร์';
}

/**
 * Assemble Complete Birth Profile
 */
export function calculateBirthProfile(
  birthDate: string,
  birthTime: string = '08:30',
  isTimeUnknown: boolean = false
): UserBirthProfile {
  const sunSign = calculateSunSign(birthDate);
  const { lagnaSign } = calculateLagna(birthDate, birthTime, isTimeUnknown);
  const lunarYear = calculateThaiLunarYear(birthDate);
  const birthDayOfWeek = getThaiDayOfWeek(birthDate);

  const lagnaIdx = ALL_ZODIAC_SIGNS.findIndex(s => s.id === lagnaSign.id);

  // 1. ภพปัตนิ (เรือนที่ 7 - ตรงข้ามลัคนา คือ คู่แท้คู่บุญ)
  const soulmateIdx = (lagnaIdx + 6) % 12;
  const soulmateSign = ALL_ZODIAC_SIGNS[soulmateIdx];

  // 2. ตรีโกณธาตุเดียวกัน (เรือนที่ 5 ปุตตะ และเรือนที่ 9 ศุภะ)
  const trine1Idx = (lagnaIdx + 4) % 12;
  const trine2Idx = (lagnaIdx + 8) % 12;
  const trineSigns = [ALL_ZODIAC_SIGNS[trine1Idx], ALL_ZODIAC_SIGNS[trine2Idx]];

  // 3. ภพกดุมภะ/ลาภะ (หนุนการเงินและโชคลาภ - เรือนที่ 2 และเรือนที่ 11)
  const wealthIdx = (lagnaIdx + 10) % 12; // ภพลาภะ
  const wealthSign = ALL_ZODIAC_SIGNS[wealthIdx];

  return {
    birthDate,
    birthTime,
    isTimeUnknown,
    sunSign,
    lagnaSign,
    lunarYear,
    soulmateSign,
    trineSigns,
    wealthSign,
    birthDayOfWeek,
    lagnaDescription: lagnaSign.lagnaTrait,
    sunDescription: sunSign.sassyTrait
  };
}

export interface CompatibilityAnalysis {
  userProfile?: UserBirthProfile;
  topSign: ZodiacSignInfo;
  topScore: number;
  secondarySign: ZodiacSignInfo;
  secondaryScore: number;
  soulmateSign: ZodiacSignInfo;
  wealthSign: ZodiacSignInfo;
  endeavorCategory: 'career' | 'finance' | 'love' | 'mind';
  endeavorTitle: string;
  endeavorBadge: string;
  synergyReason: string;
  sassyAdvice: string;
  collaborativeActions: string[];
  elementalBreakdown: {
    fire: number;
    earth: number;
    air: number;
    water: number;
  };
  cautionSign: ZodiacSignInfo;
  cautionReason: string;
  signRankings: Array<{
    sign: ZodiacSignInfo;
    score: number;
    role: string;
    houseName: string;
    relationshipType: 'soulmate' | 'trine' | 'wealth' | 'partner' | 'growth' | 'caution';
    elementMatch: string;
  }>;
}

/**
 * Analyze compatibility integrating user's birth profile (วันเดือนปีเกิด + เวลาเกิด -> ลัคนา)
 * with reading history and elemental synergy.
 */
export function analyzeZodiacCompatibilityWithProfile(
  readings: FortuneReading[],
  profile?: UserBirthProfile
): CompatibilityAnalysis {
  // Analyze dominant topic and keywords in past readings
  let loveCount = 0;
  let workCount = 0;
  let financeCount = 0;
  let mindCount = 0;

  readings.forEach((r) => {
    const text = `${r.topic} ${r.question} ${r.markdownContent}`.toLowerCase();
    if (/รัก|แฟน|คนคุย|เลิก|เสน่ห์|ใจ|โสด|คู่/i.test(text)) loveCount += 2;
    if (/งาน|ธุรกิจ|โปรเจกต์|เจ้านาย|เปลี่ยนงาน|สัมภาษณ์|คู่ค้า/i.test(text)) workCount += 2;
    if (/เงิน|หนี้|โชคลาภ|หวย|รวย|ลงทุน|กระเป๋า|ทอง/i.test(text)) financeCount += 2;
    if (/เครียด|สติ|เหนื่อย|หมดไฟ|กังวล|กลัว|สุขภาพ/i.test(text)) mindCount += 2;
  });

  let endeavorCategory: 'career' | 'finance' | 'love' | 'mind' = 'career';
  let endeavorTitle = 'ภารกิจสร้างความก้าวหน้า & ผลงานชิ้นใหญ่ (Career & Ambition)';
  let endeavorBadge = '💼 การงาน & ธุรกิจ';

  const maxCount = Math.max(workCount, financeCount, loveCount, mindCount);
  if (maxCount === financeCount && financeCount > 0) {
    endeavorCategory = 'finance';
    endeavorTitle = 'ภารกิจคว้าโชคก้อนใหญ่ & ปิดดีลการเงิน (Wealth & Windfall)';
    endeavorBadge = '🪙 การเงิน & ทรัพย์สิน';
  } else if (maxCount === loveCount && loveCount > 0) {
    endeavorCategory = 'love';
    endeavorTitle = 'ภารกิจความสัมพันธ์ & สะสางเรื่องหัวใจ (Love & Harmony)';
    endeavorBadge = '💖 ความรัก & ความผูกพัน';
  } else if (maxCount === mindCount && mindCount > 0) {
    endeavorCategory = 'mind';
    endeavorTitle = 'ภารกิจฟื้นฟูจิตใจ & เรียกสติคืนร่าง (Soul Healing & Clarity)';
    endeavorBadge = '🧠 สติ & จิตวิญญาณ';
  }

  // Anchor sign: Lagna if profile exists, otherwise fallback to Aries/readings
  const userLagna = profile ? profile.lagnaSign : ALL_ZODIAC_SIGNS[0];
  const userSun = profile ? profile.sunSign : ALL_ZODIAC_SIGNS[0];
  const lagnaIdx = ALL_ZODIAC_SIGNS.findIndex(s => s.id === userLagna.id);

  // House mappings from Lagna (โหราศาสตร์ไทย 12 ภพ)
  // 1: ตนุ (ตัวเอง), 2: กดุมภะ (การเงิน), 3: สหัชชะ (มิตร), 4: พันธุ (ครอบครัว),
  // 5: ปุตตะ (บริวาร/ตรีโกณ), 6: อริ (อุปสรรค), 7: ปัตนิ (คู่ครอง/คู่บุญ เล็งลัคนา),
  // 8: มรณะ (ความเปลี่ยนแปลง), 9: ศุภะ (ความเจริญ/ตรีโกณ), 10: กัมมะ (การงาน),
  // 11: ลาภะ (โชคลาภ), 12: วินาศ (ลับเร้น)
  const HOUSE_CONFIG: {
    [offset: number]: {
      name: string;
      baseScore: number;
      role: string;
      relType: 'soulmate' | 'trine' | 'wealth' | 'partner' | 'growth' | 'caution';
    };
  } = {
    6: { name: 'ภพปัตนิ (เล็งลัคนา)', baseScore: 96, role: '⭐ คู่แท้คู่บุญหนุนบารมี (ภพปัตนิ)', relType: 'soulmate' },
    4: { name: 'ภพปุตตะ (ตรีโกณธาตุ)', baseScore: 93, role: '🌟 คู่มิตรเกื้อหนุนธาตุเดียวกัน (ปุตตะ)', relType: 'trine' },
    8: { name: 'ภพศุภะ (ตรีโกณความเจริญ)', baseScore: 92, role: '🌟 คู่ปัญญาพาเจริญก้าวหน้า (ศุภะ)', relType: 'trine' },
    10: { name: 'ภพลาภะ (เรือนโชคลาภ)', baseScore: 90, role: '🪙 คู่บุญหนุนการเงิน & โชคลาภ (ลาภะ)', relType: 'wealth' },
    1: { name: 'ภพกดุมภะ (เรือนทรัพย์สิน)', baseScore: 88, role: '🪙 คู่สร้างความมั่งคั่ง (กดุมภะ)', relType: 'wealth' },
    9: { name: 'ภพกัมมะ (เรือนการงาน)', baseScore: 86, role: '💼 หุ้นส่วนทรงพลัง ลุยงานคู่ (กัมมะ)', relType: 'partner' },
    2: { name: 'ภพสหัชชะ (เรือนมิตรสหาย)', baseScore: 84, role: '🤝 เพื่อนแท้คู่คิด คุยถูกคอ (สหัชชะ)', relType: 'partner' },
    3: { name: 'ภพพันธุ (เรือนเซฟโซน)', baseScore: 83, role: '🏡 เซฟโซนทางใจ อบอุ่นเหมือนบ้าน (พันธุ)', relType: 'growth' },
    0: { name: 'ภพตนุ (ลัคนาเดียวกัน)', baseScore: 81, role: '🪞 กระจกเงาสะท้อนตัวตน รู้ไส้รู้พุง', relType: 'growth' },
    5: { name: 'ภพอริ (เรือนฝึกฝน)', baseScore: 72, role: '⚔️ คู่พัฒนาความอดทน & ดึงสติ (ภพอริ)', relType: 'caution' },
    7: { name: 'ภพมรณะ (เรือนท้าทาย)', baseScore: 70, role: '⚡ คู่พลิกชะตา ต้องเปิดใจคุย (ภพมรณะ)', relType: 'caution' },
    11: { name: 'ภพวินาศ (เรือนลึกลับ)', baseScore: 68, role: '🛡️ คู่เงาเบื้องหลัง ต้องรักษาความชัดเจน (ภพวินาศ)', relType: 'caution' }
  };

  // Elemental scoring
  let firePts = 0;
  let earthPts = 0;
  let airPts = 0;
  let waterPts = 0;

  const scoredSigns = ALL_ZODIAC_SIGNS.map((sign, idx) => {
    // Relative offset from user's Lagna (0 to 11)
    const offset = (idx - lagnaIdx + 12) % 12;
    const house = HOUSE_CONFIG[offset] || {
      name: 'ภพสัมพันธ์',
      baseScore: 75,
      role: 'พันธมิตรเสริมพลัง',
      relType: 'growth'
    };

    let score = house.baseScore;

    // Elemental synergy check
    let elementMatch = 'ธาตุเข้ากันได้ปกติ';
    if (sign.element === userLagna.element) {
      score += 3;
      elementMatch = `คู่ธาตุ${userLagna.elementTh}เดียวกัน (เกื้อหนุนทางใจ)`;
    } else if (
      (userLagna.element === 'Fire' && sign.element === 'Air') ||
      (userLagna.element === 'Air' && sign.element === 'Fire')
    ) {
      score += 2;
      elementMatch = 'ลมหนุนไฟ (กระตุ้นไอเดียและความกระตือรือร้น)';
    } else if (
      (userLagna.element === 'Water' && sign.element === 'Earth') ||
      (userLagna.element === 'Earth' && sign.element === 'Water')
    ) {
      score += 2;
      elementMatch = 'น้ำรดดิน (สร้างความอุดมสมบูรณ์และความมั่นคง)';
    }

    // Boost based on current endeavor
    if (endeavorCategory === 'love' && house.relType === 'soulmate') score += 2;
    if (endeavorCategory === 'finance' && house.relType === 'wealth') score += 3;
    if (endeavorCategory === 'career' && house.relType === 'partner') score += 2;

    // Slight variation jitter
    const jitter = ((sign.nameEn.charCodeAt(0) * 3 + readings.length * 5) % 5) - 2;
    const finalScore = Math.min(99, Math.max(65, score + jitter));

    // Element tally
    if (sign.element === 'Fire') firePts += finalScore;
    if (sign.element === 'Earth') earthPts += finalScore;
    if (sign.element === 'Air') airPts += finalScore;
    if (sign.element === 'Water') waterPts += finalScore;

    return {
      sign,
      score: finalScore,
      role: house.role,
      houseName: house.name,
      relationshipType: house.relType,
      elementMatch
    };
  }).sort((a, b) => b.score - a.score);

  const top = scoredSigns[0];
  const secondary = scoredSigns[1];
  const caution = scoredSigns[scoredSigns.length - 1];

  // Dynamic explanation leveraging Lagna and Sun sign
  const lagnaPrefix = profile
    ? `ด้วยพลังของลัคนา${userLagna.nameTh} (${userLagna.elementTh}) ผสานกับราศีเกิด${userSun.nameTh}`
    : `ด้วยพลังดวงชะตาและประวัติการดูดวง 4 ศาสตร์ของคุณ`;

  let synergyReason = `${lagnaPrefix} ราศีที่สถิตในตำแหน่งคู่บุญสูงสุดของคุณคือ ${top.sign.nameTh} (${top.houseName})! คลื่นพลังดาว${top.sign.planet} ส่งกระแสตรงมาเติมเต็มพลังที่คุณขาดหาย ทำให้ภารกิจ${endeavorBadge}ช่วงนี้สำเร็จได้เร็วขึ้นสองเท่า`;

  let sassyAdvice = `ถ้าช่วงนี้เจอชาว${top.sign.nameTh} รีบเกาะไว้ให้แน่นจ้ะสาว! อย่าเพิ่งขัดใจนิสัย "${top.sign.sassyTrait}" ของนาง เพราะจุดนั้นแหละที่จะมาเป็นเกราะป้องกันภัยและพากันปัง!`;

  if (endeavorCategory === 'finance') {
    synergyReason = `${lagnaPrefix} กำลังมีดวงเปิดรับทรัพย์ก้อนใหม่ ชาว${top.sign.nameTh} มีพลังเรือนหนุนดวงการเงินและวิสัยทัศน์เฉียบคม จะช่วยให้คุณเห็นช่องทางสร้างรายได้และตัดรายจ่ายที่ไม่จำเป็นออกไป`;
    sassyAdvice = `ชวนชาว${top.sign.nameTh}ไปคุยโปรเจกต์หรือช้อปปิ้งด้วยกันได้เลย นางตาเหยี่ยวมาก ช่วยเบรกความใจอ่อนเรื่องตังค์ให้คุณได้อยู่หมัด!`;
  } else if (endeavorCategory === 'love') {
    synergyReason = `${lagnaPrefix} หัวใจของคุณต้องการคนที่เข้าใจถึงระดับจิตวิญญาณ ชาว${top.sign.nameTh} ซึ่งครองเรือน${top.houseName} คือคู่บุญที่รับส่งอารมณ์กับคุณได้โดยไม่ต้องพูดเยอะ`;
    sassyAdvice = `คนราศีนี้มองตาก็รู้ใจแกแล้วจ้ะสาว ไม่ต้องแอ๊บแกร่งตลอดเวลา อ่อนแอบ้างก็ได้ นางพร้อมเป็นที่พักใจให้คุณเสมอ!`;
  }

  return {
    userProfile: profile,
    topSign: top.sign,
    topScore: top.score,
    secondarySign: secondary.sign,
    secondaryScore: secondary.score,
    soulmateSign: profile ? profile.soulmateSign : top.sign,
    wealthSign: profile ? profile.wealthSign : secondary.sign,
    endeavorCategory,
    endeavorTitle,
    endeavorBadge,
    synergyReason,
    sassyAdvice,
    collaborativeActions: [
      `ชวนร่วมปรึกษาแผนการสำคัญในภารกิจ: ${endeavorTitle.split('(')[0].trim()}`,
      `พกพาพลังงานธาตุ ${top.sign.elementTh} หรือขอความเห็นจากชาว${top.sign.nameTh} ก่อนตัดสินใจใหญ่`,
      `นัดทานอาหารหรือร่วมบุญปล่อยนกปล่อยปลาเพื่อเชื่อมกระแสพลังงานคู่บุญให้เหนียวแน่น`
    ],
    elementalBreakdown: {
      fire: Math.round(firePts / 3),
      earth: Math.round(earthPts / 3),
      air: Math.round(airPts / 3),
      water: Math.round(waterPts / 3)
    },
    cautionSign: caution.sign,
    cautionReason: `ชาว${caution.sign.nameTh} สถิตใน${caution.houseName} ช่วงนี้ความคิดอาจจะสวนทางกันง่าย ควรเน้นคุยด้วยเหตุผลและข้อมูล อย่าใช้อารมณ์ตัดสิน`,
    signRankings: scoredSigns
  };
}

export interface PartnerSynastryResult {
  partnerName: string;
  partnerSunSign: ZodiacSignInfo;
  partnerLagnaSign?: ZodiacSignInfo;
  partnerLunarYear?: LunarYearInfo;
  compatibilityScore: number;
  relationshipTier: string;
  tierBadge: string;
  tierColor: string;
  lagnaSynergy: string;
  elementSynergy: string;
  lunarYearSynergy: string;
  strengthsTogether: string[];
  cautionPoints: string[];
  sassyAdvice: string;
  auspiciousTips: string[];
}

/**
 * Calculate Detailed Synastry between User and a Specific Partner/Friend
 */
export function calculatePartnerSynastry(
  userProfile: UserBirthProfile,
  partnerBirthDate: string,
  partnerBirthTime?: string,
  partnerZodiacId?: string,
  partnerName: string = 'หวานใจ / เพื่อนคนสำคัญ'
): PartnerSynastryResult {
  let partnerSun: ZodiacSignInfo;
  let partnerLagna: ZodiacSignInfo | undefined;
  let partnerLunar: LunarYearInfo | undefined;

  if (partnerBirthDate) {
    partnerSun = calculateSunSign(partnerBirthDate);
    if (partnerBirthTime) {
      partnerLagna = calculateLagna(partnerBirthDate, partnerBirthTime, false).lagnaSign;
    }
    partnerLunar = calculateThaiLunarYear(partnerBirthDate);
  } else if (partnerZodiacId) {
    partnerSun = ALL_ZODIAC_SIGNS.find(s => s.id === partnerZodiacId) || ALL_ZODIAC_SIGNS[0];
  } else {
    partnerSun = ALL_ZODIAC_SIGNS[1]; // default
  }

  // Base score calculation
  let baseScore = 75;

  const userLagna = userProfile.lagnaSign;
  const userSun = userProfile.sunSign;

  const userLagnaIdx = ALL_ZODIAC_SIGNS.findIndex(s => s.id === userLagna.id);
  const targetIdx = ALL_ZODIAC_SIGNS.findIndex(s => s.id === (partnerLagna ? partnerLagna.id : partnerSun.id));
  const offset = (targetIdx - userLagnaIdx + 12) % 12;

  // Astrological aspect bonus
  let aspectDesc = 'คู่หนุนดวงพัฒนา';
  if (offset === 6) {
    baseScore += 22; // ภพปัตนิ (เล็งลัคนา - คู่สร้างคู่สม 97%)
    aspectDesc = 'ภพปัตนิ (เล็งลัคนา) — เป็นคู่แท้คู่บุญที่สมบูรณ์แบบ เกิดมาเพื่อเติมเต็มสิ่งที่อีกฝ่ายขาดหาย';
  } else if (offset === 4 || offset === 8) {
    baseScore += 18; // ตรีโกณธาตุเดียวกัน
    aspectDesc = 'ตรีโกณร่วมธาตุ — นิสัย ความคิด และทัศนคติเคมีตรงกันโดยธรรมชาติ คุยกันรู้เรื่องไม่ต้องอธิบายเยอะ';
  } else if (offset === 10 || offset === 1) {
    baseScore += 15; // ลาภะ/กดุมภะ
    aspectDesc = 'เรือนทรัพย์และโชคลาภ — อยู่ด้วยกันแล้วพากันรวย ช่วยกันหาเงิน ต่อยอดทรัพย์สินได้มหาศาล';
  } else if (offset === 9 || offset === 2) {
    baseScore += 12;
    aspectDesc = 'เรือนการงานและมิตรภาพ — เป็นคู่คิดคู่ลุย ทำงานด้วยกันแล้วปัง มีพลังร่วมมือสูง';
  } else {
    baseScore += 6;
    aspectDesc = 'เรือนแห่งการเรียนรู้ — เป็นคู่ที่ช่วยดึงสติและสอนบทเรียนชีวิตให้แก่กัน';
  }

  // Element synergy
  let elementSynergy = '';
  if (userLagna.element === partnerSun.element) {
    baseScore += 5;
    elementSynergy = `ทั้งคู่ครอง${userLagna.elementTh}เหมือนกัน ส่งผลให้มีความเข้าใจในอารมณ์และเป้าหมายชีวิตคล้ายคลึงกันมาก`;
  } else if (
    (userLagna.element === 'Fire' && partnerSun.element === 'Air') ||
    (userLagna.element === 'Air' && partnerSun.element === 'Fire')
  ) {
    baseScore += 4;
    elementSynergy = 'ธาตุลมกับธาตุไฟ: พัดส่งให้ไฟแห่งความฝันลุกโชน กระตุ้นพลังบวกและความกระตือรือร้น';
  } else if (
    (userLagna.element === 'Water' && partnerSun.element === 'Earth') ||
    (userLagna.element === 'Earth' && partnerSun.element === 'Water')
  ) {
    baseScore += 4;
    elementSynergy = 'ธาตุน้ำกับธาตุดิน: ดินโอบอุ้มน้ำ น้ำหล่อเลี้ยงดิน มั่นคง อบอุ่น และยืนยาว';
  } else {
    elementSynergy = 'ธาตุต่างขั้ว: มีความตื่นเต้นท้าทาย ดึงดูดกันด้วยความแตกต่าง แต่ต้องหมั่นปรับความเข้าใจ';
  }

  // Lunar Year Trine (ซาฮะ) check
  let lunarYearSynergy = 'ปีนักษัตรสมดุลตามเกณฑ์';
  if (partnerLunar && userProfile.lunarYear) {
    const uAnimal = userProfile.lunarYear.animal;
    const pAnimal = partnerLunar.animal;
    const trines = [
      ['Rat', 'Dragon', 'Monkey'],
      ['Ox', 'Snake', 'Rooster'],
      ['Tiger', 'Horse', 'Dog'],
      ['Rabbit', 'Goat', 'Pig']
    ];
    const isTrine = trines.some(t => t.includes(uAnimal) && t.includes(pAnimal));
    if (isTrine) {
      baseScore += 6;
      lunarYearSynergy = `ปี${userProfile.lunarYear.animalTh} กับ ปี${partnerLunar.animalTh} อยู่ในกลุ่ม "สามสมพงษ์ (ซาฮะ)" ตามหลักโหราศาสตร์จีน หนุนนำโชคลาภบารมีเป็นทวีคูณ!`;
    }
  }

  const finalScore = Math.min(99, Math.max(60, baseScore));

  let relationshipTier = 'คู่มิตรหนุนกำลัง';
  let tierBadge = '🌟 กัลยาณมิตรเกื้อหนุน';
  let tierColor = '#10B981';

  if (finalScore >= 94) {
    relationshipTier = 'คู่แท้คู่บุญบารมี (Destined Soulmates)';
    tierBadge = '⭐ คู่บุญบารมี 99%';
    tierColor = '#EAC272';
  } else if (finalScore >= 87) {
    relationshipTier = 'คู่สร้างคู่รวย (Wealth & Prosperity Partners)';
    tierBadge = '🪙 คู่สร้างคู่รวย';
    tierColor = '#F59E0B';
  } else if (finalScore >= 80) {
    relationshipTier = 'คู่ใจรู้ทัน (Harmonious Bond)';
    tierBadge = '💖 คู่ใจรู้ทัน';
    tierColor = '#EC4899';
  } else {
    relationshipTier = 'คู่พัฒนาความอดทน (Growth & Patience)';
    tierBadge = '🛡️ คู่พัฒนาความอดทน';
    tierColor = '#8B5CF6';
  }

  return {
    partnerName,
    partnerSunSign: partnerSun,
    partnerLagnaSign: partnerLagna,
    partnerLunarYear: partnerLunar,
    compatibilityScore: finalScore,
    relationshipTier,
    tierBadge,
    tierColor,
    lagnaSynergy: `ลัคนา${userLagna.nameTh} (${userProfile.birthDate ? 'ของคุณ' : ''}) สัมพันธ์กับ${partnerLagna ? 'ลัคนา' + partnerLagna.nameTh : 'ราศี' + partnerSun.nameTh} ในตำแหน่ง ${aspectDesc}`,
    elementSynergy,
    lunarYearSynergy,
    strengthsTogether: [
      `พลังงานส่งเสริมกันในเรื่อง: ${finalScore >= 88 ? 'ความรักระยะยาวและการต่อยอดเงินทอง' : 'การแลกเปลี่ยนมุมมองชีวิตที่แตกต่าง'}`,
      `เมื่อร่วมมือกัน: ชาว${partnerSun.nameTh} มีจุดเด่นเรื่อง "${partnerSun.strengths[0]}" มาช่วยเสริมลัคนาของคุณ`,
      `การสื่อสาร: ${finalScore >= 85 ? 'มองตาก็เข้าใจกันง่าย ไม่ต้องประดิษฐ์คำ' : 'ควรพูดคุยตรงไปตรงมา ลดการเดาใจกัน'}`
    ],
    cautionPoints: [
      `จุดที่ต้องระวัง: นิสัย "${partnerSun.sassyTrait.split('!')[0]}" ของอีกฝ่าย อย่านำมาเก็บเป็นอารมณ์`,
      `พื้นที่ส่วนตัว: ควรมีสเปซให้กัน ไม่จำเป็นต้องตัวติดกันตลอดเวลา`
    ],
    sassyAdvice: `บอกเลยนะจ๊ะสาว! คู่นี้ ${finalScore >= 90 ? 'ดวงดีเหมือนพระศุกร์เข้าพระเสาร์แทรกในทางโคตรรวย! รีบรักษาไว้ให้ดี คนแบบนี้ไม่ได้หลุดมาง่ายๆ' : 'ดวงคู่แบบเพื่อนคู่คิด ถ้าไม่ยอมกันจะมีงอนกันบ่อย แต่ถ้าคุยด้วยเหตุผล จะเป็นคู่ที่พัฒนาตัวเองได้เร็วที่สุด!'}`,
    auspiciousTips: [
      'ชวนกันไปทำบุญถวายสังฆทานคู่ หรือปล่อยปลาในวันข้างขึ้นเพื่อเสริมสิริมงคล',
      'หากมีปากเสียง ให้แยกย้ายกันไปสงบสติ 15 นาทีก่อนกลับมาคุยด้วยน้ำเสียงนุ่มนวล'
    ]
  };
}
