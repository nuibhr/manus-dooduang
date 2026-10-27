export type DisciplineType = 'daily' | 'calendar' | 'numbers' | 'minigame' | 'card_studio' | 'tarot' | 'oracle' | 'rune' | 'chinese' | 'chat';

export type AppMode = 'client' | 'teller';

export type SassLevel = 'mild' | 'spicy' | 'savage';

// Card Design & Customization Types
export type CardBackThemeId =
  | 'gilded-velvet'
  | 'cosmic-midnight'
  | 'honest-cat'
  | 'emerald-oracle'
  | 'crimson-sol';

export type CardFrontThemeId =
  | 'gilded-foil'
  | 'mystic-dark'
  | 'ancient-parchment';

export interface CardBackTheme {
  id: CardBackThemeId;
  nameTh: string;
  nameEn: string;
  description: string;
  icon: string;
  primaryColor: string;
  accentColor: string;
  borderColor: string;
  previewBg: string;
}

export interface CardDesignSettings {
  backTheme: CardBackThemeId;
  frontTheme: CardFrontThemeId;
  showGoldFoilGlow: boolean;
  soundEffectsEnabled: boolean;
}

// Cosmic Soundscape Ambient Audio Types
export type CosmicSoundscapeMode = '432hz-drone' | 'singing-bowl' | 'cat-purr' | 'temple-bell' | 'off';

export interface SoundscapeState {
  isPlaying: boolean;
  mode: CosmicSoundscapeMode;
  volume: number; // 0.0 - 1.0
}

// Minigame Types
export type MinigameTab = 'wheel' | 'esiimsi' | 'esp';

export interface EsiimsiResult {
  number: number;
  grade: 'ยอดเยี่ยม (มหาโชค)' | 'ดีมาก (สมปรารถนา)' | 'ปานกลาง (มีสติ)' | 'เตือนภัย (ระวังอารมณ์)';
  gradeColor: string;
  poem: string[];
  meaning: string;
  sassyCatAdvice: string;
  luckyNumbers: string;
  powerDirection: string;
}

export interface WheelReward {
  id: string;
  label: string;
  icon: string;
  type: 'coins' | 'blessing';
  coinsAmount?: number;
  blessingText?: string;
  color: string;
  probability: number;
}

export interface DailyFortuneData {
  themeTitle: string;
  overallVibe: string;
  scores: {
    love: number;
    work: number;
    money: number;
    sanity: number;
  };
  summary: {
    love: string;
    work: string;
    money: string;
    sanity: string;
  };
  dailyCard: {
    name: string;
    symbol: string;
    meaning: string;
  };
  bestieRoast: string;
  psychologicalTip: string;
  luckyElements: {
    color: string;
    colorHex?: string;
    number: string;
    powerHour: string;
    luckyItem: string;
  };
  doList: string[];
  dontList: string[];
  dailyAffirmation: string;
}

export interface WeeklyReadingPoint {
  date: string;
  dayLabel: string;
  fullDate: string;
  love: number;
  work: number;
  money: number;
  sanity: number;
  overall: number;
  themeTitle: string;
  cardName: string;
  cardSymbol: string;
  bestieRoast: string;
  isToday?: boolean;
}

export interface UserProfile {
  name: string;
  birthDate?: string;
  birthTime?: string;
  gender?: string;
  solarSign?: string;
  coins: number;
}

export interface TarotCard {
  id: number;
  name: string;
  nameTh: string;
  arcana: 'major' | 'minor';
  suit?: 'wands' | 'cups' | 'swords' | 'pentacles';
  number: number;
  keywords: string[];
  psychologicalTheme: string;
  sassyInsight: string;
  element: string;
  imageSymbol: string;
  uprightMeaning: string;
  reversedMeaning: string;
}

export interface OracleCard {
  id: string;
  name_en?: string;
  name_th?: string;
  titleTh: string;
  titleEn: string;
  meaning?: string;
  advice?: string;
  category: 'shadow' | 'boundary' | 'cosmic' | 'ego' | 'growth' | 'connection';
  coreTruth: string;
  psychologicalBias: string;
  sassyQuote: string;
  color: string;
  iconName: string;
  actionableStep: string;
  file?: string;
  art?: string;
  catPose?: string;
}

export interface RuneStone {
  id: string;
  name: string;
  symbol: string;
  phonetic: string;
  traditionalMeaning: string;
  psychologicalMirror: string;
  sassyRealityCheck: string;
  element: 'Fire' | 'Ice' | 'Earth' | 'Air' | 'Water' | 'Cosmos';
  keywords: string[];
}

export interface ChineseZodiac {
  id: string;
  nameTh: string;
  nameEn: string;
  symbol: string;
  earthlyBranch: string;
  fixedElement: 'Wood' | 'Fire' | 'Earth' | 'Metal' | 'Water';
  yinYang: 'Yin' | 'Yang';
  personality: string;
  psychologicalBlindspot: string;
  sassyCritique: string;
}

export interface IChingHexagram {
  number: number;
  nameTh: string;
  nameEn: string;
  chineseName: string;
  binary: string; // e.g. "111111"
  symbol: string;
  judgment: string;
  sassyRealWorldAdvice: string;
  psychologicalFocus: string;
}

export type ReadingDepthTier = 'quick' | 'standard' | 'deep_soul';

export interface ReadingDepthConfig {
  id: ReadingDepthTier;
  label: string;
  depthLevel: string;
  costCoins: number;
  icon: string;
  badge?: string;
  description: string;
  features: string[];
  systemFocus: string;
}

export const READING_DEPTH_TIERS: Record<ReadingDepthTier, ReadingDepthConfig> = {
  quick: {
    id: 'quick',
    label: 'คำทำนายรวบรัด (Quick Summary)',
    depthLevel: 'ระดับ 1: รวบรัด ได้ใจความ',
    costCoins: 5,
    icon: '⚡',
    description: 'เน้นใจความสำคัญ ตอบตรงประเด็นเร็ว เหมาะกับคนรีบรู้ผล',
    features: [
      'แก่นสารของไพ่/ดวงแบบกระชับ',
      'คำตอบตรงประเด็น ไม่เยิ่นเย้อ',
      'คำเตือน 1 ข้อที่ต้องระวังทันที',
    ],
    systemFocus: 'เน้นความกระชับ ตรงเป้า สรุปเนื้อหาสำคัญภายใน 3-4 ย่อหน้า ไม่เยิ่นเย้อ',
  },
  standard: {
    id: 'standard',
    label: 'วิเคราะห์มาตรฐาน (Deep Dive 5 มิติ)',
    depthLevel: 'ระดับ 2: ละเอียดรอบด้าน',
    costCoins: 10,
    icon: '🔮',
    badge: 'ยอดนิยม 🔥',
    description: 'วิเคราะห์ลึก 5 มิติ ผสานจิตวิทยา จิกกัดเพื่อนสาว พร้อม Action Plan',
    features: [
      'The Raw Truth ความจริงไม่อ้อมค้อม',
      'ถอดรหัสสัญลักษณ์ศาสตร์พยากรณ์',
      'มุมมองจิตวิทยา (Psychological Bias)',
      'Action Plan 3 ข้อที่ลงมือทำได้จริง',
      'Soul Readiness Score % & คำคมเรียกสติ',
    ],
    systemFocus: 'วิเคราะห์ครบทั้ง 5 มิติ เจาะลึกทางจิตวิทยา ผสานสไตล์จิกกัดเพื่อนสาวอย่างสมบูรณ์แบบ',
  },
  deep_soul: {
    id: 'deep_soul',
    label: 'ผ่าจิตวิญญาณระดับลึก (Ultra Deep Psycho-Spiritual)',
    depthLevel: 'ระดับ 3: เจาะลึกกรรม & จิตใต้สำนึก',
    costCoins: 25,
    icon: '✨',
    badge: 'แม่นลึกสุดใจ 👑',
    description: 'เจาะลึกทะลุภาพลวงตา แกะปมจิตใต้สำนึก ไทม์ไลน์ 3 ระยะ และพิธีกรรมปลดล็อกเฉพาะบุคคล',
    features: [
      'วิเคราะห์ปมในใจวัยเด็ก & Shadow Self',
      'แผนผังกรรมและพฤติกรรมวนซ้ำ (Karmic Loop)',
      'พยากรณ์ไทม์ไลน์ 3 ระยะ (1 สัปดาห์ / 1 เดือน / 3 เดือน)',
      'พลังงานธาตุที่ขาดและวิธีเหนี่ยวนำเพิ่ม',
      'พิธีกรรมจิตวิทยาปลดล็อก (Personal Micro-Ritual)',
      'คู่มือคุยแชทต่อกับแม่หมอแบบไม่จำกัดมุมมอง',
    ],
    systemFocus: 'วิเคราะห์แบบเจาะลึกขั้นสูงสุด ละเอียดประณีต ผ่าลึกถึงรากเหง้าปมจิตวิทยา Shadow Self แผนผังไทม์ไลน์ 3 ระยะ และแนะนำ Micro-Action Ritual เฉพาะตัว',
  },
};

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'model';
  content: string;
  timestamp: string;
  discipline?: DisciplineType | 'general';
  sassyLevel?: SassLevel;
  relatedReadingId?: string;
}

export interface FortuneReading {
  id: string;
  discipline: DisciplineType;
  topic: string;
  question: string;
  itemsSelected: any;
  markdownContent: string;
  sassyLevel: SassLevel;
  depthTier?: ReadingDepthTier;
  coinsSpent?: number;
  timestamp: string;
}

export type SavedReading = FortuneReading;

// Fortune Teller Billing & CRM Types
export interface FortunePackage {
  id: string;
  title: string;
  description: string;
  discipline: DisciplineType | 'all';
  durationMinutes: number;
  priceThb: number;
  coinsReward: number;
  isPopular?: boolean;
  features: string[];
  tag: string;
}

export interface ClientInvoice {
  id: string;
  invoiceNumber: string;
  clientName: string;
  clientPhone?: string;
  clientLineId?: string;
  packageName: string;
  amountThb: number;
  status: 'pending' | 'paid' | 'cancelled';
  createdAt: string;
  paidAt?: string;
  promptPayId: string; // Seller's PromptPay phone or ID card
  merchantName: string;
  notes?: string;
  readingTopic?: string;
}

export interface ClientRecord {
  id: string;
  name: string;
  phone?: string;
  lineId?: string;
  birthInfo?: string;
  totalSpent: number;
  sessionsCount: number;
  lastSessionDate: string;
  tags: string[];
  notes: string;
}

export interface CoinPackage {
  id: string;
  coins: number;
  bonus: number;
  priceThb: number;
  tag?: string;
  isBest?: boolean;
}

export interface CoinTransaction {
  id: string;
  type: 'earn' | 'spend';
  amount: number;
  reason: string;
  timestamp: string;
  discipline?: DisciplineType;
  balanceAfter?: number;
}

export interface DailyCheckinState {
  lastCheckinDate: string; // YYYY-MM-DD
  streakDays: number;
  claimedDates: string[];
}

export interface TopicPopularityStat {
  topic: string;
  category: 'love' | 'work' | 'finance' | 'mind' | 'destiny';
  count: number;
  percentage: number;
  color: string;
  trend: 'up' | 'stable' | 'hot';
  commonDisciplines: string[];
}

export type MoodType = 'liquid-aurora' | 'mystic-purple' | 'gilded-gold' | 'midnight-black' | 'emerald-oracle';
export type ColorScheme = 'light' | 'dark' | 'system';
export interface MoodOption {
  id: MoodType;
  nameTh: string;
  nameEn: string;
  subtitle: string;
  icon: string;
  previewColors: {
    surface: string;
    container: string;
    accent: string;
    text: string;
  };
  description: string;
}

export type AstrologyDayType = 'auspicious' | 'inauspicious' | 'astrology_event' | 'neutral';

export interface AstrologyDayData {
  day: number;
  date: string; // YYYY-MM-DD
  dayOfWeek: number; // 0 (Sun) - 6 (Sat)
  type: AstrologyDayType;
  badge: string; // e.g. "🌟 ฤกษ์ธงชัย", "🌕 จันทร์เพ็ญ", "⚠️ วันอุบาทว์"
  title: string;
  shortNote: string;
  energyScore: number; // 1-100
  auspiciousFor: string[];
  avoidFor: string[];
  luckyColor: string;
  luckyHours: string;
  lunarPhase: string; // e.g. "ขึ้น 15 ค่ำ เดือน 10"
  planetaryAspect?: string;
}

export interface MajorAstrologyEvent {
  day: number;
  date: string;
  title: string;
  tag: string;
  icon: string;
  description: string;
  impact: string;
}

export interface MonthlyAstrologyData {
  year: number;
  month: number; // 1 - 12
  monthNameTh: string;
  monthTheme: string;
  energyOverview: {
    auspiciousDaysCount: number;
    cautionDaysCount: number;
    eventDaysCount: number;
    averageScore: number;
  };
  sassyMonthlyRoast: string;
  elementFocus: string;
  majorEvents: MajorAstrologyEvent[];
  days: AstrologyDayData[];
}

export interface PlanetaryPosition {
  planet: string;
  symbol: string;
  sign: string;
  degree: string;
  element: string;
  vibrationNumber: number;
  aspectToSign: string;
}

export interface LuckyPairNumber {
  pair: string;
  category: 'wealth' | 'love' | 'work' | 'protection' | 'windfall';
  categoryLabel: string;
  meaning: string;
  planetarySynergy: string;
  luckScore: number;
}

export interface LuckyNumbersResult {
  zodiacSign: string;
  date: string;
  dayOfWeek: string;
  rulingPlanet: string;
  zodiacElement: string;
  corePrimeNumber: number;
  secondaryNumbers: number[];
  tripletNumbers: string[];
  luckyPairs: LuckyPairNumber[];
  cautionNumbers: number[];
  cautionReason: string;
  powerHours: string;
  powerDirection: string;
  cosmicColorVibe: string;
  planetaryPositions: PlanetaryPosition[];
  bestieNumerologyRoast: string;
  dailyCosmicAdvice: string;
  suggestedAction: string;
}

export type MoonPhaseName =
  | 'new_moon'
  | 'waxing_crescent'
  | 'first_quarter'
  | 'waxing_gibbous'
  | 'full_moon'
  | 'waning_gibbous'
  | 'last_quarter'
  | 'waning_crescent';

export interface MoonPhaseInfo {
  phase: MoonPhaseName;
  nameTh: string;
  nameEn: string;
  symbol: string;
  illumination: number; // 0 - 100%
  ageInDays: number; // 0 - 29.53
  zodiacSign: string;
  zodiacSymbol: string;
  zodiacElement: string;
  cosmicEnergy: {
    theme: string;
    vibe: string;
    intensity: 'calm' | 'moderate' | 'high' | 'peak';
    intensityScore: number; // 0 - 100
    elementalFocus: string;
    doActions: string[];
    avoidActions: string[];
    catWisdom: string;
    mantra: string;
  };
  upcomingKeyPhase: {
    nameTh: string;
    date: string;
    daysLeft: number;
    symbol: string;
  };
}
