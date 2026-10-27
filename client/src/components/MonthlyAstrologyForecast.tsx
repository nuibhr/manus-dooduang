import React, { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import {
  Sparkles,
  Calendar,
  Share2,
  Download,
  Copy,
  Check,
  X,
  Flame,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  ShieldCheck,
  AlertTriangle,
  Heart,
  Briefcase,
  Coins,
  Brain,
  Layers,
  Compass,
  Zap,
  RotateCcw,
  Palette,
  ExternalLink,
  MessageCircle,
  Eye,
  Camera
} from 'lucide-react';
import { FortuneReading, DisciplineType, SassLevel } from '../types';
import { playMysticChimeSound } from '../utils/speechHelper';

export interface MonthlyAstrologyForecastProps {
  isOpen: boolean;
  onClose: () => void;
  readings: FortuneReading[];
  onSelectReading?: (reading: FortuneReading) => void;
  onSwitchDiscipline?: (discipline: DisciplineType) => void;
  soundEnabled?: boolean;
  onShowToast?: (msg: string) => void;
  initialMonth?: number; // 1-12
  initialYear?: number;
}

// 4 Core Divination Disciplines
export type Core4Discipline = 'tarot' | 'oracle' | 'rune' | 'chinese';

export interface DisciplineMonthlySummary {
  discipline: Core4Discipline;
  titleTh: string;
  icon: string;
  color: string;
  badge: string;
  cardName: string;
  symbol: string;
  coreMessage: string;
  sassyInsight: string;
  elementOrSuit: string;
  readingsCount: number;
}

export interface MonthlyForecastReport {
  year: number;
  month: number;
  monthNameTh: string;
  archetypeTitle: string;
  archetypeSubtitle: string;
  catVibeEmoji: string;
  sassyMonthlyRoast: string;
  chaosScore: number; // 0 - 100
  clarityScore: number; // 0 - 100
  scores: {
    love: number;
    career: number;
    finance: number;
    sanity: number;
  };
  scoreNotes: {
    love: string;
    career: string;
    finance: string;
    sanity: string;
  };
  disciplineSummaries: Record<Core4Discipline, DisciplineMonthlySummary>;
  weeklyFlow: Array<{
    week: number;
    title: string;
    vibe: string;
    rating: 'hot' | 'smooth' | 'caution' | 'peace';
    advice: string;
  }>;
  doList: string[];
  dontList: string[];
  luckyElements: {
    luckyColors: string[];
    luckyNumbers: string[];
    powerHours: string;
    bestDirection: string;
    mantra: string;
  };
  totalReadingsThisMonth: number;
  isSimulatedBaseline: boolean;
}

const MONTH_NAMES_TH = [
  'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
  'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
];

// Rich fallback monthly archetypes and sassy roasts
const MONTHLY_ARCHETYPES = [
  {
    archetypeTitle: 'แมวนอนแผ่แต่หัวใจนักสู้',
    archetypeSubtitle: 'เหนื่อยมาก แต่ยังฝืนตอบ "ไหวค่ะ" เพื่อความปัง',
    catVibeEmoji: '🐾😼',
    sassyMonthlyRoast: 'เดือนนี้ 4 ศาสตร์รวมหัวกันฟ้องว่า คุณไม่ได้หมดไฟเพราะงานหนักหรอกค่ะ แต่หมดไฟเพราะ "ความเกรงใจคนอื่น" และ "การซื้อของปลอบใจตัวเองจนเงินหมดบัญชี"! เลิกเป็นคนดีที่ทุกคนรัก แต่ตัวเองนั่งปาดน้ำตาตอนเช็คยอดเงินได้แล้วจ้ะสาว!',
    mantra: 'สติมาก่อนสตอรี่ เงินเข้าบัญชีสำคัญกว่าความเท่',
  },
  {
    archetypeTitle: 'คนสวยขาแต่ตังค์รั่วระเนระนาด',
    archetypeSubtitle: 'งานดี ความรักพอถูไถ แต่กระเป๋าตังค์ร้องขอชีวิต',
    catVibeEmoji: '💸🐈',
    sassyMonthlyRoast: 'ทาโรต์เปิดมาเจอเงิน รูนบอกให้คว้า แต่โอราเคิลแฉว่าเธอเอาเงินไปกดสั่งของออนไลน์ตอนเที่ยงคืนหมดแล้ว! สรุปเดือนนี้ไม่ได้จนเพราะดวงตกนะจ๊ะ จนเพราะนิ้วสั่งจิตใต้สำนึกล้วนๆ!',
    mantra: 'ของที่อยากได้มีเป็นร้อย แต่เงินในพอร์ตเหลือเป็นร้อยเช่นกัน',
  },
  {
    archetypeTitle: 'นักแบกจักรวาลผู้ไม่ยอมปล่อยวาง',
    archetypeSubtitle: 'อะไรๆ ก็กู แต่พอถามว่าใครสั่ง... สั่งตัวเองล้วนๆ',
    catVibeEmoji: '👑🙀',
    sassyMonthlyRoast: 'ศาสตร์จีนบอกว่าธาตุไฟลุกโชน รูนเตือนให้ถอยหนึ่งก้าว แต่จิตใต้สำนึกเธอบอกว่า "ถ้าฉันไม่ทำ เดี๋ยวคนอื่นทำพัง" แม่หมอขอเตือน: โลกนี้ไม่ได้หยุดหมุนถ้าเธอลาพักร้อน 3 วันจ้ะ หยุดแบกแล้วไปนอน!',
    mantra: 'โลกไม่ได้พังถ้าเราช่างแม่งบ้างบางเวลา',
  },
  {
    archetypeTitle: 'ผู้ตื่นรู้แต่ขี้เกียจตื่นเช้า',
    archetypeSubtitle: 'ดวงจิตผ่องใส แต่ร่างกายนอนขดใต้ผ้าห่ม',
    catVibeEmoji: '🧘‍♀️😽',
    sassyMonthlyRoast: 'โอราเคิลบอกว่าเดือนนี้เป็นช่วงเวลาแห่งการเติบโตทางจิตวิญญาณ... แต่ทาโรต์มองบน เพราะเธอตื่นรู้บนเตียงแล้วเลื่อน TikTok ต่อ 2 ชั่วโมง! ถ้าอยากให้ชีวิตเปลี่ยน ต้องลุกขึ้นมาทำตามแผน ไม่ใช่สวดมนต์แล้วนอนรอโชคหล่นทับค่ะ!',
    mantra: 'จิตวิญญาณจะเบิกบานได้ ขาต้องก้าวออกจากเตียงก่อน',
  }
];

export const MonthlyAstrologyForecast: React.FC<MonthlyAstrologyForecastProps> = ({
  isOpen,
  onClose,
  readings,
  onSelectReading,
  onSwitchDiscipline,
  soundEnabled = true,
  onShowToast,
  initialMonth = new Date().getMonth() + 1,
  initialYear = new Date().getFullYear(),
}) => {
  const [selectedMonth, setSelectedMonth] = useState<number>(initialMonth);
  const [selectedYear, setSelectedYear] = useState<number>(initialYear);
  const [viewTab, setViewTab] = useState<'overview' | 'disciplines4' | 'weekly' | 'share'>('overview');
  const [shareTheme, setShareTheme] = useState<'gold' | 'purple' | 'neon'>('gold');
  const [isGeneratingImage, setIsGeneratingImage] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [imageGeneratedUrl, setImageGeneratedUrl] = useState<string | null>(null);

  // Hidden / Interactive Canvas ref for high-res image generation
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Analyze readings for this month across the 4 disciplines
  const forecastReport = useMemo<MonthlyForecastReport>(() => {
    // Filter readings for target month
    const monthReadings = readings.filter(r => {
      if (!r.timestamp) return false;
      const d = new Date(r.timestamp);
      if (isNaN(d.getTime())) return true; // if relative string like '2 วันที่แล้ว', include
      return d.getMonth() + 1 === selectedMonth && d.getFullYear() === selectedYear;
    });

    const tarotReadings = readings.filter(r => r.discipline === 'tarot');
    const oracleReadings = readings.filter(r => r.discipline === 'oracle');
    const runeReadings = readings.filter(r => r.discipline === 'rune');
    const chineseReadings = readings.filter(r => r.discipline === 'chinese');

    const totalActualReadings = monthReadings.length;
    const isSimulated = totalActualReadings < 3;

    // Pick archetype deterministically based on month + year
    const archetypeIdx = (selectedMonth + selectedYear) % MONTHLY_ARCHETYPES.length;
    const archetype = MONTHLY_ARCHETYPES[archetypeIdx];

    // Compute dynamic scores from readings or archetype
    const loveScore = Math.min(95, Math.max(45, 60 + ((selectedMonth * 7) % 35)));
    const careerScore = Math.min(95, Math.max(50, 75 + ((selectedMonth * 11) % 25) - 5));
    const financeScore = Math.min(92, Math.max(40, 55 + ((selectedMonth * 13) % 40)));
    const sanityScore = Math.min(88, Math.max(35, 50 + ((selectedMonth * 9) % 38)));

    const chaosVal = Math.round(100 - sanityScore * 0.7);
    const clarityVal = Math.round(sanityScore * 0.9 + 10);

    // 4 Disciplines syntheses
    const disciplineSummaries: Record<Core4Discipline, DisciplineMonthlySummary> = {
      tarot: {
        discipline: 'tarot',
        titleTh: 'ไพ่ยิปซี ทาโรต์ (Tarot)',
        icon: '🃏',
        color: '#8B5CF6',
        badge: 'แก่นสารจิตวิญญาณ & โอกาสใหญ่',
        cardName: tarotReadings.length > 0 ? (tarotReadings[0].itemsSelected?.[0]?.nameTh || 'The Chariot (ราชรถพุ่งทะยาน)') : 'The Chariot (ราชรถพุ่งทะยาน)',
        symbol: '⚔️🏎️',
        elementOrSuit: 'ธาตุไฟ (Wands/Fire)',
        readingsCount: tarotReadings.length || 1,
        coreMessage: 'การควบคุมทิศทางชีวิตกำลังอยู่ในมือคุณ แต่อย่าดึงบังเหียนแรงเกินไปจนม้าพยศ',
        sassyInsight: 'เดือนนี้ไพ่บอกว่าคุณเก่งเรื่องคุมงาน แต่ห่วยเรื่องคุมอารมณ์! อย่าเอาความเครียดไปลงกับคนที่เขารักคุณนะจ๊ะสาว'
      },
      oracle: {
        discipline: 'oracle',
        titleTh: 'ไพ่โอราเคิลแมวดำ (Oracle)',
        icon: '🔮',
        color: '#EC4899',
        badge: 'จิตใต้สำนึก & Shadow Self',
        cardName: oracleReadings.length > 0 ? (oracleReadings[0].itemsSelected?.[0]?.titleTh || 'The Velvet Mask (หน้ากากกำมะหยี่)') : 'The Velvet Mask (หน้ากากกำมะหยี่)',
        symbol: '🎭🐈‍⬛',
        elementOrSuit: 'จิตวิทยาปมในใจ (Shadow)',
        readingsCount: oracleReadings.length || 1,
        coreMessage: 'คุณกำลังเหนื่อยกับการรักษาภาพลักษณ์ "คนเก่งที่ไม่เคยเจ็บปวด" ต่อหน้าคนอื่น',
        sassyInsight: 'ถอดหน้ากากบ้างก็ได้ค่ะ ไม่มีใครแจกโล่คนไม่ยอมอ่อนแอหรอก ร้องไห้บ้าง สั่งพิซซ่ามากินบ้าง ไม่ตายจ้ะ!'
      },
      rune: {
        discipline: 'rune',
        titleTh: 'หินรูนนอร์ส (Norse Rune)',
        icon: 'ᛋ',
        color: '#06B6D4',
        badge: 'พลังงานสัจธรรม & การตัดสินใจเด็ดขาด',
        cardName: runeReadings.length > 0 ? (runeReadings[0].itemsSelected?.[0]?.name || 'ᛏ Tiwaz (รูนแห่งความยุติธรรม)') : 'ᛏ Tiwaz (รูนแห่งชัยชนะ & ความสัตย์จริง)',
        symbol: 'ᛏ🛡️',
        elementOrSuit: 'ธาตุลม & เหล็กกล้า (Air/Steel)',
        readingsCount: runeReadings.length || 1,
        coreMessage: 'ถึงเวลาต้องตัดสิ่งที่ถ่วงความก้าวหน้าอย่างเฉียบขาด การประนีประนอมกับสิ่งที่เป็นพิษจะทำให้คุณจมน้ำ',
        sassyInsight: 'รูนนอร์สเขาไม่ปลอบใจสายแบกนะจ๊ะ มีหนามต้องถอน มีคนเอาเปรียบต้องไล่ออกจากชีวิต อย่ามัวแต่เกรงใจจนตัวเองหมดตัว!'
      },
      chinese: {
        discipline: 'chinese',
        titleTh: 'ศาสตร์จีน 5 ธาตุ & อี้จิง (BaZi & I Ching)',
        icon: '☯️',
        color: '#F97316',
        badge: 'จังหวะฟ้าดิน & สมดุลหยิน-หยาง',
        cardName: chineseReadings.length > 0 ? (chineseReadings[0].itemsSelected?.[0]?.nameTh || 'กว้าที่ 11 ไท่ (泰 - ความสงบสุข & เจริญรุ่งเรือง)') : 'กว้าที่ 11 ไท่ (泰 - ฟ้าดินสมานไมตรี)',
        symbol: '☯️🏯',
        elementOrSuit: 'ธาตุดิน & ทอง (Earth/Metal)',
        readingsCount: chineseReadings.length || 1,
        coreMessage: 'ช่วงต้นเดือนหยางแกร่งปลายเดือนหยินหนุน จังหวะชีวิตจะลงตัวหากรู้จักนิ่งรอเวลาที่ใช่',
        sassyInsight: 'ใจร้อนเหมือนไฟลามทุ่ง แต่เงินในกระเป๋าเย็นเหมือนน้ำแข็งขั้วโลก! ศาสตร์จีนเตือนว่าอย่าเพิ่งลงทุนเสี่ยงโชคแบบวู่วามเด็ดขาด!'
      }
    };

    return {
      year: selectedYear,
      month: selectedMonth,
      monthNameTh: MONTH_NAMES_TH[selectedMonth - 1] || 'กันยายน',
      archetypeTitle: archetype.archetypeTitle,
      archetypeSubtitle: archetype.archetypeSubtitle,
      catVibeEmoji: archetype.catVibeEmoji,
      sassyMonthlyRoast: archetype.sassyMonthlyRoast,
      chaosScore: chaosVal,
      clarityScore: clarityVal,
      scores: {
        love: loveScore,
        career: careerScore,
        finance: financeScore,
        sanity: sanityScore,
      },
      scoreNotes: {
        love: loveScore > 75 ? 'เสน่ห์ล้นจนคนทัก แต่ระวังคนมีเจ้าของแอบเข้ามาเนียน' : 'รักตัวเองให้เต็มร้อยก่อน แล้วค่อยไปเป็นที่พักใจให้คนอื่นจ้ะ',
        career: careerScore > 75 ? 'งานพุ่ง ผู้ใหญ่เห็นผลงาน แต่ระวังงานงอกเพราะปฏิเสธใครไม่เป็น' : 'ประคองตัวให้รอด ไม่ต้องเป็นที่หนึ่งทุกงาน แค่ส่งงานตรงเวลาก็เก่งแล้ว',
        finance: financeScore > 70 ? 'มีโชคฟลุ๊คๆ เข้ามา แต่กระเป๋ามีรอยรั่วจากการช้อปปิ้งแก้เครียด' : 'งดเอฟของออนไลน์หลัง 4 ทุ่ม บัญชีเงินเก็บจะกราบขอบคุณคุณ',
        sanity: sanityScore > 70 ? 'สติยังอยู่กับร่องกับรอย พร้อมตบะแตกเฉพาะเวลาเจอคนประสาทแดก' : 'ต้มชาร้อน ดื่มน้ำเยอะๆ และอย่าเพิ่งตอบอีเมลตอนกำลังโมโห',
      },
      disciplineSummaries,
      weeklyFlow: [
        {
          week: 1,
          title: 'สัปดาห์ที่ 1: ไฟแรงเกินเบอร์',
          vibe: '🔥 พุ่งทะยาน',
          rating: 'hot',
          advice: 'มีพลังเริ่มสิ่งใหม่ๆ แต่อย่าเพิ่งรับปากใครว่าจะทำเสร็จภายใน 3 วัน'
        },
        {
          week: 2,
          title: 'สัปดาห์ที่ 2: งานรุมเร้า & ปะทะอารมณ์',
          vibe: '⚠️ ระวังสะดุด',
          rating: 'caution',
          advice: 'คนรอบตัวจะเริ่มงอแง ให้ใช้ความเงียบสยบความเคลื่อนไหว อย่าเพิ่งต่อปากต่อคำ'
        },
        {
          week: 3,
          title: 'สัปดาห์ที่ 3: กระเป๋าตังค์สั่นคลอน',
          vibe: '🪙 รัดเข็มขัด',
          rating: 'caution',
          advice: 'มีเกณฑ์เสียเงินก้อนจากของพังหรือสุขภาพ ควบรวมรายจ่ายให้รัดกุม'
        },
        {
          week: 4,
          title: 'สัปดาห์ที่ 4: ฟ้าหลังฝน & ปล่อยจอย',
          vibe: '🌈 โล่งอก',
          rating: 'smooth',
          advice: 'ทุกอย่างเริ่มคลี่คลาย ปิดสวิตช์การทำงานแล้วไปให้รางวัลตัวเองเบาๆ'
        },
      ],
      doList: [
        'โอนเงินเข้าบัญชีเก็บก่อนจะเผลอเอาไปซื้อของไร้สาระ',
        'ฝึกปฏิเสธคำขอที่ไม่ใช่หน้าที่ตัวเองด้วยรอยยิ้มหวานๆ',
        'นอนให้ครบ 7 ชั่วโมง เลิกส่องสตอรี่ชาวบ้านตอนดึก',
        'จดบันทึกไอเดียใหม่ๆ เพราะช่วงนี้เซนส์เปิดแรงมาก'
      ],
      dontList: [
        'อย่าทักหาแฟนเก่าหรือคนคุยเก่าเวลาเหงาเด็ดขาด (เตือนแล้วนะ!)',
        'อย่าเพิ่งเซ็นค้ำประกันหรือให้ใครยืมเงิน แม้จะเป็นคนสนิท',
        'อย่าตัดสินใจเรื่องสำคัญตอนหิวหรือตอนนอนไม่พอ',
        'อย่าเปรียบเทียบชีวิตตัวเองกับชีวิตในฟีดอินสตาแกรมคนอื่น'
      ],
      luckyElements: {
        luckyColors: ['สีเขียวเหนี่ยวทรัพย์ (#10B981)', 'สีทองจักรพรรดิ (#F59E0B)', 'สีม่วงดึงดูดเสน่ห์ (#8B5CF6)'],
        luckyNumbers: ['8 (อินฟินิตี้)', '16 (โชคลาภ)', '39 (เสน่ห์วาจา)', '78 (ทาโรต์นำโชค)'],
        powerHours: '09:09 น. และ 15:15 น.',
        bestDirection: 'ทิศตะวันออกเฉียงเหนือ (ทิศกักเก็บพลังมงคล)',
        mantra: archetype.mantra,
      },
      totalReadingsThisMonth: totalActualReadings,
      isSimulatedBaseline: isSimulated,
    };
  }, [readings, selectedMonth, selectedYear]);

  // Next / Prev Month handlers
  const handlePrevMonth = () => {
    if (soundEnabled) playMysticChimeSound('soft');
    if (selectedMonth === 1) {
      setSelectedMonth(12);
      setSelectedYear(selectedYear - 1);
    } else {
      setSelectedMonth(selectedMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (soundEnabled) playMysticChimeSound('soft');
    if (selectedMonth === 12) {
      setSelectedMonth(1);
      setSelectedYear(selectedYear + 1);
    } else {
      setSelectedMonth(selectedMonth + 1);
    }
  };

  // Render High-Resolution Shareable Image onto HTML5 Canvas
  const drawForecastCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = 1080;
    const height = 1440;
    canvas.width = width;
    canvas.height = height;

    // Theme palettes
    const themes = {
      gold: {
        bgStart: '#140920',
        bgMid: '#240F35',
        bgEnd: '#0D0414',
        borderOuter: '#EAC272',
        borderInner: 'rgba(234, 194, 114, 0.4)',
        cardBg: 'rgba(32, 13, 46, 0.85)',
        textGold: '#F3D48A',
        textCream: '#FAE9CA',
        textMuted: '#C9B49D',
        accent: '#EAC272',
        badgeBg: '#842C71',
      },
      purple: {
        bgStart: '#0B0410',
        bgMid: '#1C0626',
        bgEnd: '#06010B',
        borderOuter: '#C084FC',
        borderInner: 'rgba(192, 132, 252, 0.4)',
        cardBg: 'rgba(23, 7, 33, 0.88)',
        textGold: '#E9D5FF',
        textCream: '#F3E8FF',
        textMuted: '#D8B4FE',
        accent: '#A855F7',
        badgeBg: '#4C1D95',
      },
      neon: {
        bgStart: '#090D16',
        bgMid: '#0F172A',
        bgEnd: '#030712',
        borderOuter: '#38BDF8',
        borderInner: 'rgba(56, 189, 248, 0.4)',
        cardBg: 'rgba(15, 23, 42, 0.88)',
        textGold: '#7DD3FC',
        textCream: '#F0F9FF',
        textMuted: '#94A3B8',
        accent: '#F43F5E',
        badgeBg: '#0369A1',
      }
    };

    const t = themes[shareTheme];

    // 1. Background Gradient
    const bgGrad = ctx.createLinearGradient(0, 0, width, height);
    bgGrad.addColorStop(0, t.bgStart);
    bgGrad.addColorStop(0.5, t.bgMid);
    bgGrad.addColorStop(1, t.bgEnd);
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // Decorative Starlight particles
    for (let i = 0; i < 90; i++) {
      const sx = (i * 1234.5) % width;
      const sy = (i * 987.6) % height;
      const sRadius = ((i % 5) + 1) * 0.7;
      ctx.fillStyle = i % 3 === 0 ? t.borderOuter : 'rgba(255, 255, 255, 0.6)';
      ctx.beginPath();
      ctx.arc(sx, sy, sRadius, 0, Math.PI * 2);
      ctx.fill();
    }

    // 2. Gilded Double Frame Borders
    ctx.strokeStyle = t.borderOuter;
    ctx.lineWidth = 8;
    ctx.strokeRect(36, 36, width - 72, height - 72);

    ctx.strokeStyle = t.borderInner;
    ctx.lineWidth = 2;
    ctx.strokeRect(48, 48, width - 96, height - 96);

    // Corner Filigrees
    const drawCorner = (cx: number, cy: number, rot: number) => {
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(rot);
      ctx.strokeStyle = t.borderOuter;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(35, 0);
      ctx.moveTo(0, 0);
      ctx.lineTo(0, 35);
      ctx.stroke();

      ctx.fillStyle = t.borderOuter;
      ctx.beginPath();
      ctx.arc(10, 10, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    };

    drawCorner(54, 54, 0);
    drawCorner(width - 54, 54, Math.PI / 2);
    drawCorner(width - 54, height - 54, Math.PI);
    drawCorner(54, height - 54, -Math.PI / 2);

    // 3. Top Header: Branding & Title
    ctx.fillStyle = t.textGold;
    ctx.font = 'bold 30px "Kanit", "Noto Sans Thai", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('🐾 ดูดวงค่ะอีหญิง • สำนักแม่หมอเหมียว 💅✨', width / 2, 105);

    // Subtitle Badge
    ctx.fillStyle = t.badgeBg;
    ctx.beginPath();
    ctx.roundRect(width / 2 - 240, 125, 480, 46, 23);
    ctx.fill();
    ctx.strokeStyle = t.borderOuter;
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 22px "Kanit", "Noto Sans Thai", sans-serif';
    ctx.fillText(`สรุปดวง 4 ศาสตร์ประจำเดือน • ${forecastReport.monthNameTh} ${forecastReport.year}`, width / 2, 156);

    // 4. Monthly Archetype Hero Banner
    const heroY = 195;
    ctx.fillStyle = t.cardBg;
    ctx.beginPath();
    ctx.roundRect(64, heroY, width - 128, 175, 20);
    ctx.fill();
    ctx.strokeStyle = t.borderInner;
    ctx.lineWidth = 2;
    ctx.stroke();

    // Archetype Icon / Emoji
    ctx.font = '54px sans-serif';
    ctx.fillText(forecastReport.catVibeEmoji, 135, heroY + 85);

    // Archetype Title
    ctx.textAlign = 'left';
    ctx.fillStyle = t.textGold;
    ctx.font = 'bold 36px "Kanit", "Noto Sans Thai", sans-serif';
    ctx.fillText(`ฉายา: ${forecastReport.archetypeTitle}`, 215, heroY + 68);

    ctx.fillStyle = t.textMuted;
    ctx.font = '22px "Kanit", "Noto Sans Thai", sans-serif';
    ctx.fillText(forecastReport.archetypeSubtitle, 215, heroY + 110);

    // Quick clarity tag
    ctx.fillStyle = t.textCream;
    ctx.font = '18px "Kanit", "Noto Sans Thai", sans-serif';
    ctx.fillText(`✨ ดัชนีตาสว่าง: ${forecastReport.clarityScore}% | สติพร้อมลุย: ${forecastReport.scores.sanity}%`, 215, heroY + 145);

    // 5. Four Scores Meter Bar Section
    const scoreY = 390;
    const scoreItems = [
      { label: '💖 ความรัก', val: forecastReport.scores.love, color: '#EC4899' },
      { label: '💼 การงาน', val: forecastReport.scores.career, color: '#10B981' },
      { label: '🪙 การเงิน', val: forecastReport.scores.finance, color: '#F59E0B' },
      { label: '🧠 สติสัมปชัญญะ', val: forecastReport.scores.sanity, color: '#A855F7' },
    ];

    const boxWidth = (width - 128 - 45) / 4;
    scoreItems.forEach((sc, i) => {
      const bx = 64 + i * (boxWidth + 15);
      ctx.fillStyle = t.cardBg;
      ctx.beginPath();
      ctx.roundRect(bx, scoreY, boxWidth, 105, 14);
      ctx.fill();
      ctx.strokeStyle = t.borderInner;
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.fillStyle = t.textCream;
      ctx.font = 'bold 20px "Kanit", "Noto Sans Thai", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(sc.label, bx + boxWidth / 2, scoreY + 38);

      ctx.fillStyle = sc.color;
      ctx.font = 'bold 34px "Kanit", sans-serif';
      ctx.fillText(`${sc.val}%`, bx + boxWidth / 2, scoreY + 82);
    });

    // 6. 4 Divination Cards Matrix (2x2 Grid)
    const cardsY = 515;
    const cardW = (width - 128 - 20) / 2;
    const cardH = 210;

    const discKeys: Core4Discipline[] = ['tarot', 'oracle', 'rune', 'chinese'];
    discKeys.forEach((key, idx) => {
      const col = idx % 2;
      const row = Math.floor(idx / 2);
      const cx = 64 + col * (cardW + 20);
      const cy = cardsY + row * (cardH + 18);

      const d = forecastReport.disciplineSummaries[key];

      ctx.fillStyle = t.cardBg;
      ctx.beginPath();
      ctx.roundRect(cx, cy, cardW, cardH, 16);
      ctx.fill();
      ctx.strokeStyle = d.color;
      ctx.lineWidth = 2;
      ctx.stroke();

      // Card Header
      ctx.textAlign = 'left';
      ctx.fillStyle = d.color;
      ctx.font = 'bold 22px "Kanit", "Noto Sans Thai", sans-serif';
      ctx.fillText(`${d.icon} ${d.titleTh}`, cx + 20, cy + 36);

      // Card Name & Symbol
      ctx.fillStyle = t.textGold;
      ctx.font = 'bold 24px "Kanit", "Noto Sans Thai", sans-serif';
      ctx.fillText(`${d.symbol} ${d.cardName}`, cx + 20, cy + 74);

      // Core Message & Sassy Roast
      ctx.fillStyle = t.textCream;
      ctx.font = '18px "Kanit", "Noto Sans Thai", sans-serif';

      // Multi-line wrap text for insight
      const wrapText = (text: string, x: number, y: number, maxWidth: number, lineHeight: number) => {
        const words = text.split(' ');
        let line = '';
        let curY = y;
        for (let n = 0; n < words.length; n++) {
          const testLine = line + words[n] + ' ';
          const metrics = ctx.measureText(testLine);
          if (metrics.width > maxWidth && n > 0) {
            ctx.fillText(line, x, curY);
            line = words[n] + ' ';
            curY += lineHeight;
            if (curY > y + lineHeight * 2) break; // max 3 lines
          } else {
            line = testLine;
          }
        }
        ctx.fillText(line, x, curY);
      };

      ctx.fillStyle = t.textCream;
      wrapText(`💡 ${d.coreMessage}`, cx + 20, cy + 110, cardW - 40, 26);

      ctx.fillStyle = '#FCA5A5';
      ctx.font = 'italic 16px "Kanit", "Noto Sans Thai", sans-serif';
      wrapText(`😼 จิกกัด: "${d.sassyInsight}"`, cx + 20, cy + 165, cardW - 40, 22);
    });

    // 7. Sassy Punchline Roast Quote Box
    const roastY = 985;
    ctx.fillStyle = 'rgba(132, 44, 113, 0.4)';
    ctx.beginPath();
    ctx.roundRect(64, roastY, width - 128, 180, 18);
    ctx.fill();
    ctx.strokeStyle = t.borderOuter;
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.textAlign = 'center';
    ctx.fillStyle = t.textGold;
    ctx.font = 'bold 24px "Kanit", "Noto Sans Thai", sans-serif';
    ctx.fillText('🗣️ คำเตือนสติแบบไม่อวย จากแม่หมอเหมียว', width / 2, roastY + 40);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = '22px "Kanit", "Noto Sans Thai", sans-serif';

    // Draw wrapped sassy quote
    const quoteWords = forecastReport.sassyMonthlyRoast.split(' ');
    let qLine = '';
    let qY = roastY + 80;
    for (let n = 0; n < quoteWords.length; n++) {
      const testLine = qLine + quoteWords[n] + ' ';
      if (ctx.measureText(testLine).width > width - 180 && n > 0) {
        ctx.fillText(qLine, width / 2, qY);
        qLine = quoteWords[n] + ' ';
        qY += 32;
      } else {
        qLine = testLine;
      }
    }
    ctx.fillText(qLine, width / 2, qY);

    // 8. Lucky Elements Strip
    const luckyY = 1185;
    ctx.fillStyle = t.cardBg;
    ctx.beginPath();
    ctx.roundRect(64, luckyY, width - 128, 120, 16);
    ctx.fill();
    ctx.strokeStyle = t.borderInner;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.textAlign = 'left';
    ctx.fillStyle = t.textGold;
    ctx.font = 'bold 20px "Kanit", "Noto Sans Thai", sans-serif';
    ctx.fillText('🍀 เลขเด็ด 4 ศาสตร์:', 88, luckyY + 42);
    ctx.fillStyle = t.textCream;
    ctx.font = 'bold 22px "Kanit", sans-serif';
    ctx.fillText(forecastReport.luckyElements.luckyNumbers.join(' • '), 280, luckyY + 42);

    ctx.fillStyle = t.textGold;
    ctx.font = 'bold 20px "Kanit", "Noto Sans Thai", sans-serif';
    ctx.fillText('🎨 สีมงคลรับทรัพย์:', 88, luckyY + 85);
    ctx.fillStyle = t.textCream;
    ctx.font = '19px "Kanit", "Noto Sans Thai", sans-serif';
    ctx.fillText(forecastReport.luckyElements.luckyColors.join(' • '), 280, luckyY + 85);

    // 9. Footer & Watermark
    ctx.textAlign = 'center';
    ctx.fillStyle = t.textMuted;
    ctx.font = '17px "Kanit", "Noto Sans Thai", sans-serif';
    ctx.fillText('ดูดวงค่ะอีหญิง • เปิดดวงครบ 4 ศาสตร์ ไพ่ยิปซี / โอราเคิล / รูน / จีนปาจื่อ', width / 2, height - 60);

    ctx.fillStyle = t.textGold;
    ctx.font = 'bold 15px "Kanit", sans-serif';
    ctx.fillText('VERIFIED AUTHENTIC BY CAT ASTROLOGY SUITE 👑✨', width / 2, height - 38);

    // Save image URL
    try {
      const dataUrl = canvas.toDataURL('image/png');
      setImageGeneratedUrl(dataUrl);
    } catch (e) {
      console.warn('Canvas export warning', e);
    }
  };

  // Re-draw when report or theme changes
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        drawForecastCanvas();
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [isOpen, forecastReport, shareTheme]);

  // Download image PNG
  const handleDownloadImage = () => {
    if (soundEnabled) playMysticChimeSound('gold');
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      const link = document.createElement('a');
      link.download = `monthly-forecast-${forecastReport.year}-${forecastReport.month}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();

      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 }
      });

      if (onShowToast) onShowToast('📥 บันทึกรูปภาพสรุปดวง 4 ศาสตร์สำเร็จ!');
    } catch (err) {
      if (onShowToast) onShowToast('ไม่สามารถดาวน์โหลดรูปภาพได้ กรุณาลองใหม่อีกครั้ง');
    }
  };

  // Copy Image to Clipboard
  const handleCopyImage = async () => {
    if (soundEnabled) playMysticChimeSound('coin');
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      canvas.toBlob(async (blob) => {
        if (!blob) return;
        try {
          await navigator.clipboard.write([
            new ClipboardItem({ 'image/png': blob })
          ]);
          setCopiedLink(true);
          setTimeout(() => setCopiedLink(false), 2500);
          if (onShowToast) onShowToast('📋 คัดลอกรูปภาพลงคลิปบอร์ดแล้ว พร้อมนำไปแปะแชร์ได้ทันที!');
        } catch (clipErr) {
          // Fallback to text copy
          handleCopyTextSummary();
        }
      }, 'image/png');
    } catch (e) {
      handleCopyTextSummary();
    }
  };

  // Copy Text summary
  const handleCopyTextSummary = () => {
    const text = `🐾 สรุปดวง 4 ศาสตร์ประจำเดือน ${forecastReport.monthNameTh} ${forecastReport.year} (สำนักดูดวงค่ะอีหญิง)\n` +
      `👑 ฉายาเดือนนี้: ${forecastReport.archetypeTitle} (${forecastReport.archetypeSubtitle})\n\n` +
      `📊 ดัชนีพลังงาน:\n` +
      `💖 ความรัก: ${forecastReport.scores.love}%\n` +
      `💼 การงาน: ${forecastReport.scores.career}%\n` +
      `🪙 การเงิน: ${forecastReport.scores.finance}%\n` +
      `🧠 สติ: ${forecastReport.scores.sanity}%\n\n` +
      `🃏 ทาโรต์: ${forecastReport.disciplineSummaries.tarot.cardName}\n` +
      `🔮 โอราเคิล: ${forecastReport.disciplineSummaries.oracle.cardName}\n` +
      `ᛋ หินรูน: ${forecastReport.disciplineSummaries.rune.cardName}\n` +
      `☯️ ศาสตร์จีน: ${forecastReport.disciplineSummaries.chinese.cardName}\n\n` +
      `🗣️ คำคมตาสว่าง: "${forecastReport.sassyMonthlyRoast}"\n\n` +
      `🍀 เลขเด่น: ${forecastReport.luckyElements.luckyNumbers.join(', ')}\n` +
      `🎨 สีมงคล: ${forecastReport.luckyElements.luckyColors.join(', ')}\n` +
      `✨ ตรวจดวงต่อได้ที่แอป: ดูดวงค่ะอีหญิง`;

    navigator.clipboard.writeText(text);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
    if (onShowToast) onShowToast('📋 คัดลอกข้อความสรุปดวง 4 ศาสตร์แล้ว!');
  };

  // Native Web Share API
  const handleShareNative = async () => {
    if (soundEnabled) playMysticChimeSound('chime');
    const canvas = canvasRef.current;

    if (canvas && navigator.share) {
      try {
        canvas.toBlob(async (blob) => {
          if (!blob) return;
          const file = new File([blob], `monthly-forecast-${forecastReport.month}.png`, { type: 'image/png' });
          if (navigator.canShare && navigator.canShare({ files: [file] })) {
            await navigator.share({
              title: `สรุปดวง 4 ศาสตร์ ${forecastReport.monthNameTh} • ดูดวงค่ะอีหญิง`,
              text: `ฉายาเดือนนี้: ${forecastReport.archetypeTitle} 🐾✨ มาดูดวง 4 ศาสตร์ฉบับตาสว่างไม่อวยกัน!`,
              files: [file],
            });
            if (onShowToast) onShowToast('🚀 ส่งต่อคำทำนายสำเร็จ!');
            return;
          }
          // Fallback text share
          await navigator.share({
            title: `สรุปดวง 4 ศาสตร์ ${forecastReport.monthNameTh}`,
            text: `ฉายาเดือนนี้: ${forecastReport.archetypeTitle}\n"${forecastReport.sassyMonthlyRoast}"`,
            url: window.location.href,
          });
        }, 'image/png');
      } catch (err) {
        // user cancelled or failed, fallback to copy text
        handleCopyTextSummary();
      }
    } else {
      handleCopyTextSummary();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto backdrop-blur-md bg-black/80 animate-in fade-in duration-200">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 15 }}
        transition={{ duration: 0.25 }}
        className="relative w-full max-w-5xl rounded-3xl border border-[#EAC272]/30 bg-gradient-to-b from-[#1E0B2C] via-[#14061F] to-[#0A0210] text-[#FAE9CA] shadow-2xl shadow-purple-950/60 overflow-hidden my-auto max-h-[92vh] flex flex-col"
      >
        {/* Top Header Bar */}
        <div className="flex items-center justify-between border-b border-[#EAC272]/20 px-4 sm:px-6 py-4 bg-[#190825]/90 backdrop-blur-md sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#EAC272] via-[#D4A84D] to-[#842C71] text-2xl shadow-md text-[#110918]">
              🌟
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-serif-display text-lg sm:text-xl font-bold text-[#FAE9CA] tracking-wide">
                  Monthly Astrology Forecast
                </h2>
                <span className="rounded-full bg-[#842C71]/40 border border-[#EAC272]/30 px-2 py-0.5 text-[10px] font-semibold text-[#EAC272]">
                  สรุปผล 4 ศาสตร์
                </span>
              </div>
              <p className="text-xs text-[#C9B49D]">
                ผสานสัจธรรม ทาโรต์ • โอราเคิล • รูนนอร์ส • ศาสตร์จีน ฉบับกวนๆ ไม่อวย
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Month Navigator */}
            <div className="flex items-center rounded-full bg-[#2A0E38] border border-[#EAC272]/30 p-1">
              <button
                onClick={handlePrevMonth}
                className="h-8 w-8 rounded-full flex items-center justify-center text-[#EAC272] hover:bg-[#3D1452] transition-colors"
                title="เดือนก่อนหน้า"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <div className="px-3 text-xs font-bold text-[#FAE9CA]">
                {forecastReport.monthNameTh} {forecastReport.year}
              </div>
              <button
                onClick={handleNextMonth}
                className="h-8 w-8 rounded-full flex items-center justify-center text-[#EAC272] hover:bg-[#3D1452] transition-colors"
                title="เดือนถัดไป"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            <button
              onClick={onClose}
              className="h-9 w-9 rounded-full bg-[#2A0E38] border border-[#EAC272]/20 flex items-center justify-center text-[#C9B49D] hover:text-[#FAE9CA] hover:bg-[#3D1452] transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center justify-between border-b border-[#EAC272]/15 px-4 sm:px-6 bg-[#160621]/60 overflow-x-auto gap-2 py-2.5">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              onClick={() => {
                if (soundEnabled) playMysticChimeSound('soft');
                setViewTab('overview');
              }}
              className={`flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all whitespace-nowrap ${
                viewTab === 'overview'
                  ? 'bg-gradient-to-r from-[#EAC272] to-[#D4A84D] text-[#110918] shadow-md shadow-[#EAC272]/20'
                  : 'text-[#C9B49D] hover:text-[#FAE9CA] hover:bg-[#2A0E38]'
              }`}
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>ภาพรวมรายเดือน & จิกกัด</span>
            </button>

            <button
              onClick={() => {
                if (soundEnabled) playMysticChimeSound('card');
                setViewTab('disciplines4');
              }}
              className={`flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all whitespace-nowrap ${
                viewTab === 'disciplines4'
                  ? 'bg-gradient-to-r from-[#EAC272] to-[#D4A84D] text-[#110918] shadow-md shadow-[#EAC272]/20'
                  : 'text-[#C9B49D] hover:text-[#FAE9CA] hover:bg-[#2A0E38]'
              }`}
            >
              <Layers className="h-3.5 w-3.5" />
              <span>ผ่าดวง 4 ศาสตร์ (Tarot/Oracle/Rune/Chinese)</span>
            </button>

            <button
              onClick={() => {
                if (soundEnabled) playMysticChimeSound('soft');
                setViewTab('weekly');
              }}
              className={`flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all whitespace-nowrap ${
                viewTab === 'weekly'
                  ? 'bg-gradient-to-r from-[#EAC272] to-[#D4A84D] text-[#110918] shadow-md shadow-[#EAC272]/20'
                  : 'text-[#C9B49D] hover:text-[#FAE9CA] hover:bg-[#2A0E38]'
              }`}
            >
              <Calendar className="h-3.5 w-3.5" />
              <span>ไทม์ไลน์ 4 สัปดาห์ & Do/Don't</span>
            </button>
          </div>

          {/* Quick Share Trigger Button */}
          <button
            onClick={() => {
              if (soundEnabled) playMysticChimeSound('gold');
              setViewTab('share');
            }}
            className={`flex items-center gap-1.5 rounded-xl px-4 py-1.5 text-xs font-bold transition-all border whitespace-nowrap ${
              viewTab === 'share'
                ? 'bg-gradient-to-r from-[#EC4899] to-[#842C71] text-white border-pink-400 shadow-md'
                : 'bg-[#2A0E38] text-[#EAC272] border-[#EAC272]/40 hover:bg-[#3D1452]'
            }`}
          >
            <Camera className="h-3.5 w-3.5" />
            <span>แชร์เป็นรูปภาพสวยๆ 📸</span>
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">

          {/* TAB 1: OVERVIEW */}
          {viewTab === 'overview' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              {/* Hero Archetype & Roast Banner */}
              <div className="relative rounded-3xl border border-[#EAC272]/30 bg-gradient-to-br from-[#2D123D] via-[#1F092A] to-[#120419] p-5 sm:p-6 overflow-hidden shadow-xl">
                <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none select-none text-9xl">
                  {forecastReport.catVibeEmoji}
                </div>

                <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
                  <div className="space-y-2 max-w-2xl">
                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-[#EAC272]/20 border border-[#EAC272]/40 px-3 py-0.5 text-xs font-bold text-[#EAC272]">
                        ฉายาชะตาชีวิตประจำเดือน {forecastReport.monthNameTh}
                      </span>
                      {forecastReport.isSimulatedBaseline && (
                        <span className="text-[11px] text-[#C9B49D]/80 italic">
                          (วิเคราะห์ร่วมกับการจำลองสถิติ 4 ศาสตร์)
                        </span>
                      )}
                    </div>

                    <h3 className="font-serif-display text-2xl sm:text-3xl font-extrabold text-[#FAE9CA] tracking-wide flex items-center gap-3">
                      <span>{forecastReport.catVibeEmoji}</span>
                      <span>"{forecastReport.archetypeTitle}"</span>
                    </h3>

                    <p className="text-sm text-[#EAC272]/90 font-medium">
                      {forecastReport.archetypeSubtitle}
                    </p>
                  </div>

                  <div className="flex flex-row md:flex-col items-center gap-2 bg-[#170522]/80 border border-[#EAC272]/20 rounded-2xl p-3 px-4">
                    <div className="text-center">
                      <span className="block text-[11px] text-[#C9B49D]">ดัชนีตาสว่าง (Clarity)</span>
                      <span className="text-xl sm:text-2xl font-black text-[#10B981]">
                        {forecastReport.clarityScore}%
                      </span>
                    </div>
                    <div className="hidden md:block w-full h-[1px] bg-[#EAC272]/15" />
                    <div className="text-center">
                      <span className="block text-[11px] text-[#C9B49D]">ดวงเปิดไปแล้ว</span>
                      <span className="text-xl sm:text-2xl font-black text-[#EAC272]">
                        {forecastReport.totalReadingsThisMonth} ครั้ง
                      </span>
                    </div>
                  </div>
                </div>

                {/* Sassy Roast Quote Box */}
                <div className="mt-5 rounded-2xl border border-rose-500/30 bg-rose-950/20 p-4 sm:p-5 relative">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl flex-shrink-0">😼</span>
                    <div className="space-y-1">
                      <h4 className="text-xs font-bold text-rose-300 tracking-wide uppercase">
                        คำทำนายรวม 4 ศาสตร์ ฉบับกวนโอ๊ย & ตาสว่างไม่อวย
                      </h4>
                      <p className="text-sm sm:text-base text-[#FAE9CA] leading-relaxed">
                        {forecastReport.sassyMonthlyRoast}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* 4 Dimension Energy Gauges */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Love */}
                <div className="rounded-2xl border border-pink-500/25 bg-[#230C2E]/60 p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-xs font-bold text-pink-400">
                      <Heart className="h-4 w-4" /> ความรัก & ความสัมพันธ์
                    </span>
                    <span className="text-lg font-black text-pink-300">
                      {forecastReport.scores.love}%
                    </span>
                  </div>
                  <div className="h-2 w-full bg-[#15061C] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-pink-500 to-rose-400 rounded-full transition-all duration-500"
                      style={{ width: `${forecastReport.scores.love}%` }}
                    />
                  </div>
                  <p className="text-xs text-[#C9B49D] leading-relaxed">
                    {forecastReport.scoreNotes.love}
                  </p>
                </div>

                {/* Career */}
                <div className="rounded-2xl border border-emerald-500/25 bg-[#0F2220]/60 p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                      <Briefcase className="h-4 w-4" /> การงาน & โอกาส
                    </span>
                    <span className="text-lg font-black text-emerald-300">
                      {forecastReport.scores.career}%
                    </span>
                  </div>
                  <div className="h-2 w-full bg-[#081413] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500"
                      style={{ width: `${forecastReport.scores.career}%` }}
                    />
                  </div>
                  <p className="text-xs text-[#C9B49D] leading-relaxed">
                    {forecastReport.scoreNotes.career}
                  </p>
                </div>

                {/* Finance */}
                <div className="rounded-2xl border border-amber-500/25 bg-[#261A0C]/60 p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-xs font-bold text-amber-400">
                      <Coins className="h-4 w-4" /> การเงิน & โชคลาภ
                    </span>
                    <span className="text-lg font-black text-amber-300">
                      {forecastReport.scores.finance}%
                    </span>
                  </div>
                  <div className="h-2 w-full bg-[#140C04] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 rounded-full transition-all duration-500"
                      style={{ width: `${forecastReport.scores.finance}%` }}
                    />
                  </div>
                  <p className="text-xs text-[#C9B49D] leading-relaxed">
                    {forecastReport.scoreNotes.finance}
                  </p>
                </div>

                {/* Sanity */}
                <div className="rounded-2xl border border-purple-500/25 bg-[#1E0D2C]/60 p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-xs font-bold text-purple-400">
                      <Brain className="h-4 w-4" /> สติ & สุขภาพจิต
                    </span>
                    <span className="text-lg font-black text-purple-300">
                      {forecastReport.scores.sanity}%
                    </span>
                  </div>
                  <div className="h-2 w-full bg-[#110519] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-purple-500 to-violet-400 rounded-full transition-all duration-500"
                      style={{ width: `${forecastReport.scores.sanity}%` }}
                    />
                  </div>
                  <p className="text-xs text-[#C9B49D] leading-relaxed">
                    {forecastReport.scoreNotes.sanity}
                  </p>
                </div>
              </div>

              {/* Quick Glance at 4 Disciplines */}
              <div className="rounded-3xl border border-[#EAC272]/20 bg-[#170622]/80 p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-serif-display text-base font-bold text-[#FAE9CA] flex items-center gap-2">
                    <span>🔮 สรุปมงคลจาก 4 เสาหลักชะตาชีวิต</span>
                  </h4>
                  <button
                    onClick={() => setViewTab('disciplines4')}
                    className="text-xs text-[#EAC272] hover:underline font-semibold"
                  >
                    ดูรายละเอียดเชิงลึก 4 ศาสตร์ →
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {(['tarot', 'oracle', 'rune', 'chinese'] as Core4Discipline[]).map((key) => {
                    const d = forecastReport.disciplineSummaries[key];
                    return (
                      <div
                        key={key}
                        className="rounded-2xl border border-[#EAC272]/15 bg-[#220B32]/70 p-4 flex items-start gap-3 hover:border-[#EAC272]/40 transition-colors"
                      >
                        <div
                          className="h-10 w-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                          style={{ backgroundColor: `${d.color}25`, border: `1px solid ${d.color}50` }}
                        >
                          {d.icon}
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold" style={{ color: d.color }}>
                              {d.titleTh}
                            </span>
                            <span className="text-[10px] text-[#C9B49D] bg-[#12041B] px-1.5 py-0.5 rounded">
                              {d.symbol} {d.cardName}
                            </span>
                          </div>
                          <p className="text-xs text-[#FAE9CA] leading-snug">
                            {d.coreMessage}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Monthly Lucky Elements Banner */}
              <div className="rounded-2xl border border-[#EAC272]/30 bg-gradient-to-r from-[#291339] to-[#1C0928] p-4 sm:p-5">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <h5 className="text-xs font-bold text-[#EAC272] uppercase tracking-wider">
                      🍀 เลขมงคล & สีนำโชคประจำเดือน
                    </h5>
                    <div className="flex flex-wrap items-center gap-4 mt-2 text-xs">
                      <div>
                        <span className="text-[#C9B49D]">เลขเด่น 4 ศาสตร์: </span>
                        <span className="font-bold text-[#FAE9CA] text-sm">
                          {forecastReport.luckyElements.luckyNumbers.join(' • ')}
                        </span>
                      </div>
                      <div>
                        <span className="text-[#C9B49D]">ช่วงเวลาทรงพลัง: </span>
                        <span className="font-bold text-amber-300">
                          {forecastReport.luckyElements.powerHours}
                        </span>
                      </div>
                      <div>
                        <span className="text-[#C9B49D]">ทิศรับทรัพย์: </span>
                        <span className="font-bold text-emerald-300">
                          {forecastReport.luckyElements.bestDirection}
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => setViewTab('share')}
                    className="rounded-full bg-gradient-to-r from-[#EAC272] to-[#D4A84D] px-4 py-2 text-xs font-bold text-[#110918] shadow-md hover:scale-105 active:scale-95 transition-transform flex items-center gap-1.5"
                  >
                    <Share2 className="h-3.5 w-3.5" />
                    <span>แชร์ภาพผลดวงเดือนนี้</span>
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 2: 4 DISCIPLINES DETAILED BREAKDOWN */}
          {viewTab === 'disciplines4' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              <div className="rounded-2xl border border-[#EAC272]/20 bg-[#1A0826]/70 p-4 text-xs text-[#C9B49D] flex items-center justify-between">
                <span>
                  🔮 <strong>การสังเคราะห์ 4 ศาสตร์</strong>: นำผลลัพธ์จากแต่ละศาสตร์ที่คุณเคยเปิดในระบบ (หรือสถิติพยากรณ์ประจำเดือน) มาร้อยเรียงเป็นคำแนะนำที่เห็นภาพลึกรอบด้าน
                </span>
                {onSwitchDiscipline && (
                  <span className="text-[11px] text-[#EAC272] font-semibold">
                    คลิกเปิดดูดวงเฉพาะศาสตร์ได้
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {(['tarot', 'oracle', 'rune', 'chinese'] as Core4Discipline[]).map((key) => {
                  const d = forecastReport.disciplineSummaries[key];
                  return (
                    <div
                      key={key}
                      className="rounded-3xl border border-[#EAC272]/25 bg-gradient-to-b from-[#240F35] to-[#14061F] p-5 space-y-4 shadow-lg hover:border-[#EAC272]/50 transition-all flex flex-col justify-between"
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <div
                              className="h-10 w-10 rounded-xl flex items-center justify-center text-xl"
                              style={{ backgroundColor: `${d.color}25`, border: `1px solid ${d.color}60` }}
                            >
                              {d.icon}
                            </div>
                            <div>
                              <h4 className="font-bold text-sm text-[#FAE9CA]">
                                {d.titleTh}
                              </h4>
                              <span className="text-[11px] font-semibold" style={{ color: d.color }}>
                                {d.badge}
                              </span>
                            </div>
                          </div>

                          <span className="rounded-full bg-[#12041B] px-2.5 py-1 text-[10px] text-[#C9B49D] border border-white/10">
                            {d.elementOrSuit}
                          </span>
                        </div>

                        {/* Card Name */}
                        <div className="rounded-xl bg-[#190726] border border-[#EAC272]/15 p-3 flex items-center justify-between">
                          <div>
                            <span className="text-[10px] text-[#C9B49D] uppercase block">
                              สัญลักษณ์คุมชะตาเดือนนี้
                            </span>
                            <span className="font-serif-display text-base font-bold text-[#FAE9CA]">
                              {d.symbol} {d.cardName}
                            </span>
                          </div>
                          <span className="text-xs text-[#EAC272] bg-[#EAC272]/10 px-2 py-1 rounded-md">
                            เปิดแล้ว {d.readingsCount} ใบ
                          </span>
                        </div>

                        {/* Core Message */}
                        <div className="space-y-1">
                          <span className="text-[11px] font-bold text-[#EAC272] uppercase">
                            ✨ บทเรียนสำคัญประจำเดือน:
                          </span>
                          <p className="text-xs sm:text-sm text-[#FAE9CA] leading-relaxed">
                            {d.coreMessage}
                          </p>
                        </div>

                        {/* Sassy Insight */}
                        <div className="rounded-xl border border-rose-500/25 bg-rose-950/20 p-3 space-y-1">
                          <span className="text-[11px] font-bold text-rose-300 flex items-center gap-1">
                            😼 แม่หมอจิกกัดตาสว่าง:
                          </span>
                          <p className="text-xs text-[#FAE9CA] italic leading-relaxed">
                            "{d.sassyInsight}"
                          </p>
                        </div>
                      </div>

                      {/* Action to Jump to that discipline */}
                      {onSwitchDiscipline && (
                        <div className="pt-2 border-t border-[#EAC272]/10 flex justify-end">
                          <button
                            onClick={() => {
                              onSwitchDiscipline(d.discipline as DisciplineType);
                              onClose();
                            }}
                            className="text-xs font-semibold text-[#EAC272] hover:text-[#FAE9CA] flex items-center gap-1 transition-colors"
                          >
                            <span>เปิดหน้าดูดวง {d.titleTh.split(' ')[0]}</span>
                            <ChevronRight className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* TAB 3: WEEKLY FLOW & DO/DON'T */}
          {viewTab === 'weekly' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              {/* Weekly Timeline */}
              <div className="rounded-3xl border border-[#EAC272]/20 bg-[#1B0A29]/70 p-5 space-y-4">
                <h4 className="font-serif-display text-base font-bold text-[#FAE9CA] flex items-center gap-2">
                  <span>📅 แผนผังกระแสชะตา 4 สัปดาห์ตลอดเดือน</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {forecastReport.weeklyFlow.map((wf) => (
                    <div
                      key={wf.week}
                      className="rounded-2xl border border-[#EAC272]/15 bg-[#230C34]/80 p-4 space-y-2 flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="rounded-full bg-[#EAC272]/15 text-[#EAC272] text-[10px] font-bold px-2 py-0.5">
                            Week {wf.week}
                          </span>
                          <span className="text-xs font-semibold text-pink-300">
                            {wf.vibe}
                          </span>
                        </div>
                        <h5 className="font-bold text-xs text-[#FAE9CA] mt-2">
                          {wf.title}
                        </h5>
                        <p className="text-xs text-[#C9B49D] mt-1 leading-relaxed">
                          {wf.advice}
                        </p>
                      </div>

                      <div className="pt-2 text-[10px] text-[#EAC272]/70 font-medium">
                        {wf.rating === 'hot' && '⚡ จังหวะลุยเต็มที่'}
                        {wf.rating === 'caution' && '⚠️ เน้นตั้งการ์ดรอบคอบ'}
                        {wf.rating === 'smooth' && '✨ ไหลลื่นสำเร็จง่าย'}
                        {wf.rating === 'peace' && '🧘 พักผ่อนปล่อยวาง'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Do & Don't Matrix */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Do List */}
                <div className="rounded-3xl border border-emerald-500/30 bg-[#0C1E1B]/70 p-5 space-y-3">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-300">
                      ✓
                    </span>
                    <span>สิ่งที่ควรทำด่วน (Do for Good Karma & Wealth)</span>
                  </div>
                  <ul className="space-y-2 text-xs text-[#FAE9CA]">
                    {forecastReport.doList.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-emerald-400 font-bold mt-0.5">✔</span>
                        <span className="leading-relaxed">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Don't List */}
                <div className="rounded-3xl border border-rose-500/30 bg-[#250C17]/70 p-5 space-y-3">
                  <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-rose-500/20 text-rose-300">
                      ✗
                    </span>
                    <span>สิ่งที่ควรหยุดทำทันที (Don't for Sanity & Peace)</span>
                  </div>
                  <ul className="space-y-2 text-xs text-[#FAE9CA]">
                    {forecastReport.dontList.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-rose-400 font-bold mt-0.5">✖</span>
                        <span className="leading-relaxed">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Personal Mantra Callout */}
              <div className="rounded-2xl border border-[#EAC272]/30 bg-gradient-to-r from-[#291339] via-[#1B0B26] to-[#291339] p-4 text-center space-y-1">
                <span className="text-[11px] text-[#C9B49D] font-bold uppercase tracking-wider">
                  🧘 คาถาเรียกสติ & เพิ่มพลังใจประจำเดือน
                </span>
                <p className="font-serif-display text-lg font-bold text-[#EAC272]">
                  "{forecastReport.luckyElements.mantra}"
                </p>
              </div>
            </motion.div>
          )}

          {/* TAB 4: BEAUTIFUL SHAREABLE IMAGE GENERATOR */}
          {viewTab === 'share' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              {/* Share Controls Bar */}
              <div className="rounded-2xl border border-[#EAC272]/30 bg-[#210D31]/80 p-4 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-[#EAC272]">
                    🎨 เลือกธีมรูปภาพ:
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShareTheme('gold')}
                      className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                        shareTheme === 'gold'
                          ? 'bg-[#EAC272] text-[#110918] shadow'
                          : 'bg-[#14061F] text-[#C9B49D] hover:text-[#FAE9CA]'
                      }`}
                    >
                      👑 Royal Gold
                    </button>
                    <button
                      onClick={() => setShareTheme('purple')}
                      className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                        shareTheme === 'purple'
                          ? 'bg-purple-500 text-white shadow'
                          : 'bg-[#14061F] text-[#C9B49D] hover:text-[#FAE9CA]'
                      }`}
                    >
                      🔮 Velvet Purple
                    </button>
                    <button
                      onClick={() => setShareTheme('neon')}
                      className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                        shareTheme === 'neon'
                          ? 'bg-cyan-400 text-[#0F172A] shadow'
                          : 'bg-[#14061F] text-[#C9B49D] hover:text-[#FAE9CA]'
                      }`}
                    >
                      ⚡ Cyber Sassy
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleDownloadImage}
                    className="flex items-center gap-1.5 rounded-full bg-gradient-to-r from-[#EAC272] to-[#D4A84D] px-4 py-2 text-xs font-bold text-[#110918] shadow-md hover:scale-105 active:scale-95 transition-transform"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>บันทึกรูปภาพ (Download PNG)</span>
                  </button>

                  <button
                    onClick={handleCopyImage}
                    className="flex items-center gap-1.5 rounded-full bg-[#351548] border border-[#EAC272]/30 px-3.5 py-2 text-xs font-bold text-[#FAE9CA] hover:bg-[#481E60] transition-colors"
                  >
                    {copiedLink ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                    <span>{copiedLink ? 'คัดลอกแล้ว!' : 'คัดลอกรูป'}</span>
                  </button>

                  <button
                    onClick={handleShareNative}
                    className="flex items-center gap-1.5 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 px-4 py-2 text-xs font-bold text-white shadow hover:scale-105 active:scale-95 transition-transform"
                  >
                    <Share2 className="h-3.5 w-3.5" />
                    <span>แชร์ส่งต่อ (LINE / IG / X)</span>
                  </button>
                </div>
              </div>

              {/* High-Resolution Live Canvas & Preview Card */}
              <div className="flex flex-col items-center justify-center p-3 sm:p-5 rounded-3xl border border-[#EAC272]/20 bg-[#0E0315] shadow-inner">
                <div className="text-center mb-3">
                  <span className="text-xs text-[#EAC272] font-semibold flex items-center justify-center gap-1">
                    <Sparkles className="h-3.5 w-3.5" /> พรีวิวการ์ดรูปภาพสรุปดวง (ความละเอียดสูง คมชัด 1080x1440)
                  </span>
                  <p className="text-[11px] text-[#C9B49D]">
                    เหมาะสำหรับแชร์ลง Instagram Stories, LINE OA, หรือเซฟไว้ดูเตือนสติตลอดเดือน
                  </p>
                </div>

                <div className="relative max-w-sm sm:max-w-md w-full rounded-2xl overflow-hidden border-2 border-[#EAC272]/40 shadow-2xl shadow-purple-950/80">
                  {/* Live Rendered Canvas */}
                  <canvas
                    ref={canvasRef}
                    className="w-full h-auto block select-none"
                    style={{ aspectRatio: '1080/1440' }}
                  />
                </div>

                <div className="flex flex-wrap items-center justify-center gap-3 mt-4 text-xs">
                  <button
                    onClick={handleCopyTextSummary}
                    className="text-[#C9B49D] hover:text-[#FAE9CA] hover:underline flex items-center gap-1"
                  >
                    <MessageCircle className="h-3.5 w-3.5" />
                    <span>หรือคัดลอกสรุปข้อความสำหรับส่งในแชท LINE</span>
                  </button>
                </div>
              </div>
            </motion.div>
          )}

        </div>

        {/* Footer Area */}
        <div className="border-t border-[#EAC272]/20 px-4 sm:px-6 py-3.5 bg-[#170622]/90 flex flex-wrap items-center justify-between gap-3 text-xs text-[#C9B49D]">
          <div className="flex items-center gap-2">
            <span className="text-sm">🐾</span>
            <span>ดูดวงค่ะอีหญิง • รายงานดวงชะตา 4 ศาสตร์ประจำเดือน</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                if (soundEnabled) playMysticChimeSound('gold');
                setViewTab('share');
              }}
              className="text-[#EAC272] hover:underline font-bold"
            >
              แชร์ภาพสรุปดวง 📸
            </button>
            <span>•</span>
            <button
              onClick={onClose}
              className="hover:text-[#FAE9CA] font-medium"
            >
              ปิดหน้าต่าง
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
