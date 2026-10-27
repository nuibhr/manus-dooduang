import React, { lazy, Suspense, useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  Calendar,
  Heart,
  Briefcase,
  Coins,
  Brain,
  Flame,
  Volume2,
  VolumeX,
  Share2,
  Copy,
  Check,
  RefreshCw,
  Compass,
  MessageSquareHeart,
  Zap,
  CheckCircle2,
  XCircle,
  ShieldAlert,
  User,
  Sun,
  Award,
  Sparkle,
  Shuffle,
} from 'lucide-react';
import { DailyFortuneData, SassLevel, FortuneReading, ReadingDepthTier, TarotCard } from '../types';
import { chooseDailyTarotCard } from '../utils/dailyTarot';
import { speakThaiText, stopSpeaking, playCatPurrSound, playMysticChimeSound } from '../utils/speechHelper';
import { ZodiacCompatibilityBadge } from './ZodiacCompatibilityBadge';
import type { UserBirthProfile } from '../utils/astrologyEngine';

// Load secondary conversion and follow-up widgets only after the user asks to continue.
const QuickFortuneWidget = lazy(() => import('./QuickFortuneWidget').then((module) => ({ default: module.QuickFortuneWidget })));
const DailyRewardSystem = lazy(() => import('./DailyRewardSystem').then((module) => ({ default: module.DailyRewardSystem })));
const FateSynchronicityBanner = lazy(() => import('./FateSynchronicityBanner').then((module) => ({ default: module.FateSynchronicityBanner })));

export interface DailyFortuneViewProps {
  sassLevel: SassLevel;
  onContinueChatWithDaily: (fortune: DailyFortuneData, focusArea: string) => void;
  onShowToast: (msg: string) => void;
  soundEnabled: boolean;
  readings?: FortuneReading[];
  birthProfile?: UserBirthProfile | null;
  onOpenSynchronicityModal?: () => void;
  onOpenLotteryVault?: () => void;
  onOpenEconomicsModal?: () => void;
  onOpenZodiacCompatibility?: () => void;
  isAuthenticated: boolean;
  onSignIn: () => void;
  currentCoins: number;
  onClaimDailyReward: (coinsAmount: number, reason: string) => Promise<{ claimed: boolean; amount: number; streakDay: number }>;
  rewardsStatus?: { dailyClaimed: boolean; shareClaimed: boolean; streakDay: number; weeklyEarned: number; weeklyCap: number; weeklyRemaining: number };
  onOpenTopUp: () => void;
  onNavigate: (discipline: 'tarot' | 'oracle' | 'rune') => void;
}

const ZODIAC_SIGNS = [
  { id: 'aries', nameTh: 'ราศีเมษ (Aries)', date: '13 เม.ย. - 13 พ.ค.', icon: '♈', element: 'ไฟ' },
  { id: 'taurus', nameTh: 'ราศีพฤษภ (Taurus)', date: '14 พ.ค. - 13 มิ.ย.', icon: '♉', element: 'ดิน' },
  { id: 'gemini', nameTh: 'ราศีเมถุน (Gemini)', date: '14 มิ.ย. - 14 ก.ค.', icon: '♊', element: 'ลม' },
  { id: 'cancer', nameTh: 'ราศีกรกฎ (Cancer)', date: '15 ก.ค. - 16 ส.ค.', icon: '♋', element: 'น้ำ' },
  { id: 'leo', nameTh: 'ราศีสิงห์ (Leo)', date: '17 ส.ค. - 16 ก.ย.', icon: '♌', element: 'ไฟ' },
  { id: 'virgo', nameTh: 'ราศีกันย์ (Virgo)', date: '17 ก.ย. - 16 ต.ค.', icon: '♍', element: 'ดิน' },
  { id: 'libra', nameTh: 'ราศีตุลย์ (Libra)', date: '17 ต.ค. - 15 พ.ย.', icon: '♎', element: 'ลม' },
  { id: 'scorpio', nameTh: 'ราศีพิจิก (Scorpio)', date: '16 พ.ย. - 15 ธ.ค.', icon: '♏', element: 'น้ำ' },
  { id: 'sagittarius', nameTh: 'ราศีธนู (Sagittarius)', date: '16 ธ.ค. - 13 ม.ค.', icon: '♐', element: 'ไฟ' },
  { id: 'capricorn', nameTh: 'ราศีมังกร (Capricorn)', date: '14 ม.ค. - 12 ก.พ.', icon: '♑', element: 'ดิน' },
  { id: 'aquarius', nameTh: 'ราศีกุมภ์ (Aquarius)', date: '13 ก.พ. - 13 มี.ค.', icon: '♒', element: 'ลม' },
  { id: 'pisces', nameTh: 'ราศีมีน (Pisces)', date: '14 มี.ค. - 12 เม.ย.', icon: '♓', element: 'น้ำ' },
];

const DAYS_OF_WEEK = [
  'วันอาทิตย์', 'วันจันทร์', 'วันอังคาร', 'วันพุธ', 'วันพฤหัสบดี', 'วันศุกร์', 'วันเสาร์'
];

const FOCUS_AREAS = [
  { id: 'love', label: 'ความรัก', desc: 'เช็กสถานะหัวใจ กับดักความสัมพันธ์', icon: '💖' },
  { id: 'work', label: 'การงาน', desc: 'โอกาสเติบโต เพื่อนร่วมงาน และอุปสรรค', icon: '💼' },
  { id: 'money', label: 'โชคลาภ', desc: 'รายรับ รายจ่าย และพฤติกรรมใช้เงิน', icon: '🪙' },
  { id: 'sanity', label: 'สุขภาพใจ', desc: 'จัดการความเครียด และการตั้งขอบเขต', icon: '🧘' },
  { id: 'all', label: 'ภาพรวม', desc: 'ครบทุกมิติ พร้อมรับมือทุกสถานการณ์', icon: '🌟' },
];

const DEFAULT_FORTUNE: DailyFortuneData = {
  themeTitle: "แมวตื่นมาเตือน: หยุดคิดวนแล้วลงมือทำ เดี๋ยวชวดปลาทู!",
  overallVibe: "อย่าให้ความกังวลในสิ่งที่ยังไม่เกิดมาขโมยความสงบและพลังงานของวันนี้",
  scores: {
    love: 78,
    work: 88,
    money: 82,
    sanity: 72,
  },
  summary: {
    love: "ถ้าเค้าไม่ทักมา ก็อย่าเพิ่งคิดไปเองว่าโลกจะแตก เอาเวลาไปเลียขนดูแลตัวเองให้สง่างามค่ะ",
    work: "สัญชาตญาณแมวนักล่าพร้อมลุย ปัญหาเดียวคือแกชอบผัดวันประกันพรุ่ง เริ่มต้นชิ้นแรกเดี๋ยวนี้!",
    money: "กระเป๋าตังค์ยังปลอดภัยถ้าแกไม่กดสั่งซื้อของออนไลน์ตอนดึกๆ เพราะอารมณ์เหงา",
    sanity: "หายใจเข้าลึกๆ ยืดเส้นยืดสายแบบแมว แล้วปล่อยวางเรื่องที่ไม่ใช่ธุระของเรา",
  },
  dailyCard: {
    name: "The Mystic Black Cat (แมวดำผู้หยั่งรู้)",
    symbol: "🐾",
    meaning: "ควบคุมสติและกรงเล็บชีวิตตัวเอง อย่าให้อารมณ์คนอื่นพาแกหลุดวงโคจร",
  },
  bestieRoast: "ดวงแกวันนี้ไม่ได้แย่เลยแก แต่ถ้ายังมัวแต่นอนอืดไถฟีดแล้วบอกเหนื่อย ปาฏิหาริย์ที่ไหนก็วิ่งเข้าหาไม่ทันนะจ๊ะ!",
  psychologicalTip: "เทคนิค 5-Second Rule: เมื่อรู้สึกผัดวันประกันพรุ่ง ให้นับ 5-4-3-2-1 แล้วลุกขึ้นทำทันที สมองจะไม่มีเวลาสร้างข้ออ้าง",
  luckyElements: {
    color: "ม่วงกำมะหยี่ & ทองแชมเปญ",
    colorHex: "#842C71",
    number: "9 หรือ 99",
    powerHour: "10:30 - 12:00 น.",
    luckyItem: "เครื่องรางรูปแมว หรือแก้วเซรามิกใบโปรด",
  },
  doList: [
    "เคลียร์งานค้างอันดับ 1 ให้เสร็จก่อนช่วงบ่าย",
    "พูดชมและให้กำลังใจตัวเองหน้ากระจกก่อนเริ่มวัน",
    "ปฏิเสธคำขอที่ล้ำเส้นแบบสุภาพแต่เด็ดขาด",
  ],
  dontList: [
    "อย่าไปส่องโซเชียลคนคุยเก่าให้เสียอารมณ์",
    "อย่ารูดบัตรซื้อของแก้เครียดเด็ดขาด",
  ],
  dailyAffirmation: "วันนี้ฉันสงบ มั่นใจ มีสติ รู้ทันอารมณ์ และเงินทองไหลมาเทมาราวกับต้องมนตร์!",
};

export const DailyFortuneView: React.FC<DailyFortuneViewProps> = ({
  sassLevel,
  onContinueChatWithDaily,
  onShowToast,
  soundEnabled,
  readings,
  birthProfile,
  onOpenSynchronicityModal,
  onOpenLotteryVault,
  onOpenEconomicsModal,
  onOpenZodiacCompatibility,
  isAuthenticated,
  onSignIn,
  currentCoins,
  onClaimDailyReward,
  rewardsStatus,
  onOpenTopUp,
  onNavigate,
}) => {
  // User Profile State
  const [userName, setUserName] = useState<string>('คุณผู้ถือกุญแจ');
  const [selectedZodiac, setSelectedZodiac] = useState<string>(birthProfile?.sunSign.id ?? 'scorpio');
  const [selectedDay, setSelectedDay] = useState<string>(birthProfile?.birthDayOfWeek ?? 'วันจันทร์');
  const [selectedFocus, setSelectedFocus] = useState<string>('love');

  // Resolve one persisted card per device/day only when the user taps the draw button.
  const dateKey = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Bangkok', year: 'numeric', month: '2-digit', day: '2-digit',
  }).format(new Date());
  const [dailyCard, setDailyCard] = useState<TarotCard | null>(null);

  // Fortune Data State
  const [fortuneData, setFortuneData] = useState<DailyFortuneData>(DEFAULT_FORTUNE);
  const [hasPersonalizedFortune, setHasPersonalizedFortune] = useState(false);

  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [isEditingProfile, setIsEditingProfile] = useState<boolean>(false);
  const [activeSection, setActiveSection] = useState<'both' | 'reading' | 'trend'>('reading');

  // One tap starts a short shuffle animation and reveals today's fixed card.
  const [ritualStage, setRitualStage] = useState<'ready' | 'shuffling' | 'revealed'>('ready');
  const readingSectionRef = useRef<HTMLDivElement | null>(null);

  // Today's formatted Thai date
  const todayStr = new Date().toLocaleDateString('th-TH', {
    timeZone: 'Asia/Bangkok',
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Reuse profile values only when the user has explicitly saved a birth profile.
  useEffect(() => {
    if (!birthProfile) return;
    setSelectedZodiac(birthProfile.sunSign.id);
    if (DAYS_OF_WEEK.includes(birthProfile.birthDayOfWeek)) {
      setSelectedDay(birthProfile.birthDayOfWeek);
    }
  }, [birthProfile]);

  // Clean up speech on unmount
  useEffect(() => {
    return () => {
      stopSpeaking();
    };
  }, []);

  // Current active zodiac object
  const currentZodiacObj = ZODIAC_SIGNS.find(z => z.id === selectedZodiac) || ZODIAC_SIGNS[0];

  // One-tap daily draw: animate the ritual, then reveal the actual tarot card.
  const handleStartShuffle = async () => {
    if (ritualStage !== 'ready') return;
    if (soundEnabled) {
      playCatPurrSound();
      playMysticChimeSound('card');
    }
    setRitualStage('shuffling');
    try {
      // Keep the full 78-card deck out of the first-load bundle.
      const { TAROT_DECK } = await import('../data/tarotData');
      const storageKey = 'dooduang_daily_tarot_v1';
      let savedValue: string | null = null;
      try { savedValue = window.localStorage.getItem(storageKey); } catch { /* Private mode may block storage. */ }
      const random = new Uint32Array(1);
      if (window.crypto?.getRandomValues) window.crypto.getRandomValues(random);
      else random[0] = Math.floor(Math.random() * 0xffffffff);
      const choice = chooseDailyTarotCard(TAROT_DECK, dateKey, savedValue, random[0]);
      try { window.localStorage.setItem(storageKey, choice.storedValue); } catch { /* The card still works without persistence. */ }
      setDailyCard(choice.card);
      window.setTimeout(() => {
        setFortuneData(current => ({
          ...current,
          dailyCard: {
            name: choice.card.nameTh,
            symbol: choice.card.imageSymbol,
            meaning: choice.card.uprightMeaning,
          },
        }));
        setRitualStage('revealed');
        if (soundEnabled) playMysticChimeSound('oracle');
        onShowToast('🐾 เปิดไพ่ประจำวันแล้ว — เก็บไพ่ใบนี้ไว้ทบทวนได้ตลอดวันนี้');
      }, 420);
    } catch {
      setRitualStage('ready');
      onShowToast('เปิดไพ่ไม่สำเร็จ ลองอีกครั้งได้เลย');
    }
  };

  // Text to Speech with high-clarity Thai female diction
  const handleToggleSpeech = () => {
    if (isSpeaking) {
      stopSpeaking();
      setIsSpeaking(false);
      return;
    }

    const textToRead = `ดวงประจำวันของ ${userName} วันนี้คือ ${fortuneData.themeTitle} ไวบ์ของวันนี้ ${fortuneData.overallVibe} คำเตือนสติจากแมว ${fortuneData.bestieRoast} เคล็ดลับจิตวิทยา ${fortuneData.psychologicalTip} ประโยคสะกดจิตประจำวัน ${fortuneData.dailyAffirmation}`;

    speakThaiText(
      textToRead,
      () => setIsSpeaking(true),
      () => setIsSpeaking(false),
      (err) => {
        setIsSpeaking(false);
        onShowToast('ไม่สามารถเล่นเสียงได้ในเบราว์เซอร์นี้');
      }
    );
  };

  // Share a concise daily summary through the native mobile share sheet, with clipboard fallback.
  const handleShareSummary = async () => {
    const text = `🐾 The Cat Room • ดวงประจำวัน (${todayStr})\n✨ สำหรับคุณ: ${userName} (${currentZodiacObj.nameTh})\n\n🌟 หัวข้อ: ${fortuneData.themeTitle}\n⚡ ไวบ์วันนี้: ${fortuneData.overallVibe}\n\n📊 คะแนนออร่าวันนี้:\n💖 ความรัก: ${fortuneData.scores.love}%\n💼 การงาน: ${fortuneData.scores.work}%\n💰 การเงิน: ${fortuneData.scores.money}%\n🧘 สติ: ${fortuneData.scores.sanity}%\n\n💅 แมวเตือนสติ: "${fortuneData.bestieRoast}"\n🧠 จิตวิทยาประจำวัน: ${fortuneData.psychologicalTip}\n\n🎨 สีมงคล: ${fortuneData.luckyElements.color}\n🔢 เลขเด็ด: ${fortuneData.luckyElements.number}\n⏰ ฤกษ์ดี: ${fortuneData.luckyElements.powerHour}\n\n💬 Affirmation: "${fortuneData.dailyAffirmation}"\n\n— แมวช่วยส่องไฟให้ แต่คนถือกุญแจยังเป็นคุณ`;

    const shareNavigator = navigator as Navigator & { share?: (data: ShareData) => Promise<void> };
    try {
      if (typeof shareNavigator.share === 'function') {
        await shareNavigator.share({ title: `ดวงวันนี้ของ ${userName}`, text });
        onShowToast('✨ เปิดเมนูแชร์แล้ว ส่งต่อให้เพื่อนได้เลย!');
      } else {
        await navigator.clipboard.writeText(text);
        onShowToast('📋 คัดลอกบทสรุปดวงแล้ว พร้อมส่งใน LINE!');
      }
      setCopied(true);
      if (soundEnabled) playMysticChimeSound('coin');
      setTimeout(() => setCopied(false), 2500);
    } catch (error) {
      if ((error as DOMException)?.name !== 'AbortError') {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        onShowToast('📋 คัดลอกบทสรุปดวงแล้ว พร้อมส่งใน LINE!');
        setTimeout(() => setCopied(false), 2500);
      }
    }
  };

  return (
    <div className="space-y-8 pb-12">


      {/* Cross-Reading Fate Synchronicity Banner */}
      {hasPersonalizedFortune && readings && onOpenSynchronicityModal && (
        <Suspense fallback={null}>
          <FateSynchronicityBanner
            readings={readings}
            onOpenSynchronicityModal={onOpenSynchronicityModal}
            currentDisciplineName="ดวงประจำวัน & จิตวิทยาประยุกต์"
          />
        </Suspense>
      )}

      {/* ---------------------------------------------------- */}
      {/* Daily Reading Content (Hero + Details) */}
      {/* ---------------------------------------------------- */}
          {/* Hero Section: The Cat Room Mystical Salon & Card Deck */}
          <section className="relative overflow-hidden rounded-[32px] bg-gradient-to-b from-[#24102E] via-[#180B22] to-[#110918] p-6 sm:p-10 border border-[rgba(242,203,128,0.18)] shadow-2xl text-center">

        {/* Ambient Night Sky & Gold Glows */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 h-72 w-72 rounded-full bg-[#842C71]/25 blur-[90px] pointer-events-none" />
        <div className="absolute top-1/3 left-10 h-48 w-48 rounded-full bg-[#EAC272]/10 blur-[80px] pointer-events-none" />
        <div className="absolute bottom-10 right-10 h-48 w-48 rounded-full bg-[#165B53]/15 blur-[80px] pointer-events-none" />

        <div className="relative z-10 max-w-2xl mx-auto space-y-6">

          {/* Title and Subtitle */}
          <div className="space-y-3">
            <div className="flex items-center justify-center gap-2">
              <span className="text-xl">🐾</span>
              <h2 className="font-serif-display text-4xl sm:text-5xl lg:text-6xl font-bold tracking-wide text-[#FAE9CA]">
                ดูดวงค่ะอีหญิง
              </h2>
              <span className="text-xl">🐾</span>
            </div>

            <p className="text-base sm:text-lg text-[#FAE9CA]/90 font-light tracking-wide max-w-lg mx-auto">
              ดูดวงแบบไม่หวานเจี๊ยบ แต่ตรงจนมีสะดุ้ง • แม่หมอเหมียว
            </p>

            {/* Zodiac Compatibility Badge on Dashboard */}
            {onOpenZodiacCompatibility && (
              <div className="flex justify-center pt-1">
                <ZodiacCompatibilityBadge
                  readingsHistory={readings || []}
                  birthProfile={birthProfile}
                  onClick={onOpenZodiacCompatibility}
                />
              </div>
            )}
          </div>

          {/* One-tap daily draw: one canonical Tarot card, then optional next steps. */}
          <div className="relative py-4 flex flex-col items-center justify-center gap-5">
            <p className="max-w-lg text-sm text-[#C9B49D]">
              ไพ่ประจำวันสุ่มฟรี 1 ใบ • เปิดได้ทันทีโดยไม่ต้องสมัครสมาชิก
            </p>

            {ritualStage === 'ready' && (
              <button
                id="btn-daily-purr-draw"
                type="button"
                onClick={handleStartShuffle}
                className="group relative flex h-60 w-40 flex-col items-center justify-between rounded-2xl border-2 border-[rgba(242,203,128,0.55)] bg-gradient-to-b from-[#2A143A] via-[#1E0E2A] to-[#14081E] p-5 shadow-2xl transition-transform hover:-translate-y-1 active:scale-[0.98]"
                aria-label="สุ่มเปิดไพ่ประจำวันฟรีหนึ่งใบ"
              >
                <span className="text-[10px] tracking-[0.25em] text-[#EAC272]">DAILY TAROT</span>
                <span className="flex h-16 w-16 items-center justify-center rounded-full border border-[#EAC272]/50 bg-[#361A4A]/80 text-3xl">🐾</span>
                <span className="text-center">
                  <span className="block font-serif-display text-lg text-[#FAE9CA]">เปิดไพ่วันนี้</span>
                  <span className="mt-1 block text-xs text-[#EAC272]">สุ่ม 1 ใบ • ฟรี</span>
                </span>
              </button>
            )}

            {ritualStage === 'shuffling' && (
              <div className="flex h-60 w-40 flex-col items-center justify-center gap-4 rounded-2xl border-2 border-[#EAC272] bg-gradient-to-b from-[#2A143A] to-[#14081E] shadow-xl" role="status" aria-live="polite">
                <motion.div animate={{ rotateY: [0, 180, 360], y: [0, -6, 0] }} transition={{ duration: 0.42 }} className="text-5xl">🎴</motion.div>
                <span className="text-sm font-semibold text-[#FAE9CA]">กำลังเปิดไพ่ของวันนี้…</span>
              </div>
            )}

            {ritualStage === 'revealed' && dailyCard && (
              <motion.div
                initial={{ scale: 0.92, opacity: 0, rotateY: 70 }}
                animate={{ scale: 1, opacity: 1, rotateY: 0 }}
                transition={{ type: 'spring', stiffness: 220, damping: 22 }}
                className="relative flex min-h-64 w-48 flex-col items-center justify-between rounded-2xl border-2 border-[#EAC272] bg-gradient-to-b from-[#3D144A] via-[#240C30] to-[#120518] p-5 shadow-[0_0_30px_rgba(234,194,114,0.35)]"
              >
                <span className="text-[10px] tracking-[0.2em] text-[#EAC272]">ไพ่ประจำวัน • {todayStr}</span>
                <span className="flex h-16 w-16 items-center justify-center rounded-full border border-[#EAC272] bg-[#842C71]/60 text-4xl">{dailyCard.imageSymbol}</span>
                <div className="text-center">
                  <h3 className="font-serif-display text-sm font-bold text-[#FAE9CA]">{dailyCard.nameTh}</h3>
                  <p className="mt-2 text-xs leading-relaxed text-[#EAC272]">{dailyCard.uprightMeaning}</p>
                </div>
                <span className="text-[10px] text-[#C9B49D]">บันทึกไพ่ใบนี้บนอุปกรณ์ตลอดวันนี้ (เวลาไทย)</span>
              </motion.div>
            )}

            {ritualStage === 'revealed' && dailyCard && (
              <div className="w-full max-w-3xl space-y-4">
                <p className="text-center text-xs text-[#C9B49D]">
                  ไพ่ใบนี้เป็นจุดเริ่มต้น — เช็คอินรับเหรียญ แล้วเลือกเปิด 3 ใบหรือสำรวจศาสตร์อื่นต่อ
                </p>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <button type="button" onClick={() => onNavigate('tarot')} className="rounded-2xl border border-[#EAC272]/35 bg-[#24102E]/90 p-4 text-left transition hover:border-[#EAC272] hover:bg-[#361A4A]">
                    <span className="text-xl">🃏</span><span className="mt-2 block font-bold text-[#FAE9CA]">Tarot 3 ใบ</span>
                    <span className="mt-1 block text-[11px] text-[#C9B49D]">อดีต • ปัจจุบัน • แนวโน้ม · มาตรฐาน 15 เหรียญ</span>
                  </button>
                  <button type="button" onClick={() => onNavigate('oracle')} className="rounded-2xl border border-[#842C71]/50 bg-[#24102E]/90 p-4 text-left transition hover:border-[#EAC272] hover:bg-[#361A4A]">
                    <span className="text-xl">🔮</span><span className="mt-2 block font-bold text-[#FAE9CA]">Oracle 88 ใบ</span>
                    <span className="mt-1 block text-[11px] text-[#C9B49D]">สำรวจเงาใจ ขอบเขต และการเติบโต · เลือกความลึกก่อนยืนยัน</span>
                  </button>
                  <button type="button" onClick={() => onNavigate('rune')} className="rounded-2xl border border-[#165B53]/55 bg-[#24102E]/90 p-4 text-left transition hover:border-[#AEFFE4] hover:bg-[#1E3531]">
                    <span className="text-xl">ᛋ</span><span className="mt-2 block font-bold text-[#FAE9CA]">หินรูนนอร์ส</span>
                    <span className="mt-1 block text-[11px] text-[#C9B49D]">อ่านสัญลักษณ์และจังหวะลงมือทำ · เลือกความลึกก่อนยืนยัน</span>
                  </button>
                </div>

                <Suspense fallback={<div className="py-2 text-center text-xs text-[#C9B49D]" role="status">กำลังเตรียมเช็คอิน…</div>}>
                  <DailyRewardSystem
                    currentCoins={currentCoins}
                    onClaimDailyReward={onClaimDailyReward}
                    onOpenTopUp={onOpenTopUp}
                    onShowToast={onShowToast}
                    serverStatus={rewardsStatus}
                    isAuthenticated={isAuthenticated}
                    onSignIn={onSignIn}
                    compact
                  />
                </Suspense>

                <div className="rounded-2xl border border-[#EAC272]/20 bg-[#110918]/75 p-4 text-center">
                  <p className="text-sm font-bold text-[#FAE9CA]">อยากเจาะความหมายให้ลึกกว่านี้ไหม?</p>
                  <p className="mt-1 text-xs text-[#C9B49D]">เปิดไพ่ 3 ใบ: อดีต • ปัจจุบัน • แนวโน้ม • ใช้ 15 เหรียญ (ระบบตรวจยอดก่อนหักและบันทึกผล)</p>
                  <button
                    type="button"
                    id="btn-daily-three-card-reading"
                    onClick={() => onNavigate('tarot')}
                    className="btn-gilded mt-3 inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold disabled:opacity-60"
                  >
                    <Sparkles className="h-4 w-4" />
                    เปิดไพ่ 3 ใบ • 15 เหรียญ
                  </button>
                  <p className="mt-2 text-[11px] text-[#C9B49D]">เข้าไปเลือกคำถามและระดับการอ่านก่อนยืนยัน • ถ้าเหรียญไม่พอ ระบบจะพาไปเติมเงินหรือเข้าสู่ระบบ</p>
                </div>
              </div>
            )}
          </div>


        </div>


      </section>

      {/* ---------------------------------------------------- */}
      {/* Quick Fortune Widget: Aphorism & Hidden Advice */}
      {/* ---------------------------------------------------- */}
      {ritualStage === 'revealed' && (
        <Suspense fallback={<div className="py-3 text-center text-xs text-[#C9B49D]" role="status">กำลังเตรียมคำแนะนำต่อ…</div>}>
          <QuickFortuneWidget onShowToast={onShowToast} soundEnabled={soundEnabled} />
        </Suspense>
      )}

      {/* ---------------------------------------------------- */}
      {/* Detailed Reading Results Section */}
      {/* ---------------------------------------------------- */}
      {hasPersonalizedFortune && <div ref={readingSectionRef} className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left 2 Columns: Scores, Main Themes, and Detailed Summaries */}
        <div className="lg:col-span-2 space-y-6">

          {/* Daily Theme Card */}
          <div className="velvet-card rounded-[28px] p-6 sm:p-7 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[rgba(242,203,128,0.14)] pb-4">
              <div>
                <div className="flex items-center gap-2 text-xs font-semibold text-[#EAC272] tracking-wider">
                  <span>🐾 สารจากแม่หมอเหมียว (ดูดวงค่ะอีหญิง)</span>
                  <span className="text-[10px] text-[#C9B49D]">• {todayStr}</span>
                </div>
                <h3 className="mt-1 font-serif-display text-2xl sm:text-3xl font-normal text-[#FAE9CA] leading-snug">
                  "{fortuneData.themeTitle}"
                </h3>
              </div>

              {/* Utility Tools: Thai Female Voice & Share */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  id="btn-daily-speech"
                  onClick={handleToggleSpeech}
                  className={`flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold transition-all ${
                    isSpeaking
                      ? 'bg-[#842C71] text-[#FAE9CA] border border-[#EAC272] animate-pulse shadow-lg'
                      : 'bg-[#2A143A] text-[#FAE9CA] hover:bg-[#361A4A] border border-[rgba(242,203,128,0.2)]'
                  }`}
                  title="ฟังเสียงแม่หมอภาษาไทย"
                >
                  {isSpeaking ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4 text-[#EAC272]" />}
                  <span>{isSpeaking ? 'หยุดเสียงแม่หมอ' : 'ฟังเสียงแม่หมอ'}</span>
                </button>

                <button
                  id="btn-daily-copy"
                  onClick={handleShareSummary}
                  className="flex items-center gap-1.5 rounded-full bg-[#2A143A] hover:bg-[#361A4A] px-3.5 py-2 text-xs font-semibold text-[#FAE9CA] border border-[rgba(242,203,128,0.2)] transition-all"
                  title="แชร์สรุปดวงผ่านแอปในมือถือ"
                >
                  {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Share2 className="h-3.5 w-3.5 text-[#EAC272]" />}
                  <span>{copied ? 'พร้อมแชร์แล้ว' : 'แชร์ผลดวง'}</span>
                </button>
              </div>
            </div>

            {/* Vibe Quote Box */}
            <div className="rounded-2xl bg-[#110918]/80 p-4 border border-[rgba(242,203,128,0.12)] text-[#FAE9CA] text-sm leading-relaxed flex items-start gap-3">
              <span className="text-xl">🕯️</span>
              <div>
                <span className="text-[11px] uppercase tracking-wider text-[#C9B49D] font-bold block mb-0.5">ไวบ์ประจำวัน (Daily Aura):</span>
                <p className="text-sm text-[#FAE9CA] font-normal">
                  {fortuneData.overallVibe}
                </p>
              </div>
            </div>

            {/* 4 Dimension Aura & Energy Grid */}
            <div>
              <h4 className="text-xs font-bold text-[#EAC272] uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <Zap className="h-3.5 w-3.5 text-[#EAC272]" />
                <span>คะแนนพลังงาน 4 มิติ (Aura Radar)</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                {/* Love */}
                <div className="rounded-2xl bg-[#1E0E2A]/90 p-4 border border-[rgba(242,203,128,0.14)] hover:border-[rgba(242,203,128,0.35)] transition-all space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#842C71]/40 text-[#FAE9CA]">
                        <Heart className="h-4 w-4 fill-[#FAE9CA]/30" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-[#FAE9CA]">ความรัก & เสน่ห์</div>
                        <div className="text-[10px] text-[#C9B49D]">Love & Connection</div>
                      </div>
                    </div>
                    <span className="font-serif-display text-lg font-normal text-[#EAC272]">
                      {fortuneData.scores.love}%
                    </span>
                  </div>

                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#110918]">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#842C71] to-[#EAC272] transition-all duration-700"
                      style={{ width: `${fortuneData.scores.love}%` }}
                    />
                  </div>

                  <p className="text-xs text-[#C9B49D] pt-1 leading-relaxed">
                    {fortuneData.summary.love}
                  </p>
                </div>

                {/* Work */}
                <div className="rounded-2xl bg-[#1E0E2A]/90 p-4 border border-[rgba(242,203,128,0.14)] hover:border-[rgba(242,203,128,0.35)] transition-all space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#165B53]/50 text-[#FAE9CA]">
                        <Briefcase className="h-4 w-4 text-[#AEFFE4]" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-[#FAE9CA]">การงาน & ธุรกิจ</div>
                        <div className="text-[10px] text-[#C9B49D]">Career & Ambition</div>
                      </div>
                    </div>
                    <span className="font-serif-display text-lg font-normal text-[#AEFFE4]">
                      {fortuneData.scores.work}%
                    </span>
                  </div>

                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#110918]">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#165B53] to-[#AEFFE4] transition-all duration-700"
                      style={{ width: `${fortuneData.scores.work}%` }}
                    />
                  </div>

                  <p className="text-xs text-[#C9B49D] pt-1 leading-relaxed">
                    {fortuneData.summary.work}
                  </p>
                </div>

                {/* Money */}
                <div className="rounded-2xl bg-[#1E0E2A]/90 p-4 border border-[rgba(242,203,128,0.14)] hover:border-[rgba(242,203,128,0.35)] transition-all space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#EAC272]/20 text-[#EAC272]">
                        <Coins className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-[#FAE9CA]">การเงิน & โชคลาภ</div>
                        <div className="text-[10px] text-[#C9B49D]">Wealth & Fortune</div>
                      </div>
                    </div>
                    <span className="font-serif-display text-lg font-normal text-[#EAC272]">
                      {fortuneData.scores.money}%
                    </span>
                  </div>

                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#110918]">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#D4A84D] to-[#FFDE9E] transition-all duration-700"
                      style={{ width: `${fortuneData.scores.money}%` }}
                    />
                  </div>

                  <p className="text-xs text-[#C9B49D] pt-1 leading-relaxed">
                    {fortuneData.summary.money}
                  </p>
                </div>

                {/* Sanity & Mind */}
                <div className="rounded-2xl bg-[#1E0E2A]/90 p-4 border border-[rgba(242,203,128,0.14)] hover:border-[rgba(242,203,128,0.35)] transition-all space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#361A4A] text-[#FAE9CA]">
                        <Brain className="h-4 w-4 text-[#F2CB80]" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-[#FAE9CA]">สติ & สุขภาพใจ</div>
                        <div className="text-[10px] text-[#C9B49D]">Sanity & Calm</div>
                      </div>
                    </div>
                    <span className="font-serif-display text-lg font-normal text-[#F2CB80]">
                      {fortuneData.scores.sanity}%
                    </span>
                  </div>

                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#110918]">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#361A4A] to-[#842C71] transition-all duration-700"
                      style={{ width: `${fortuneData.scores.sanity}%` }}
                    />
                  </div>

                  <p className="text-xs text-[#C9B49D] pt-1 leading-relaxed">
                    {fortuneData.summary.sanity}
                  </p>
                </div>

              </div>
            </div>
          </div>

          {/* Sassy Cat Roast & Psychological Insights Box */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

            {/* Bestie Roast */}
            <div className="rounded-[24px] bg-gradient-to-br from-[#24102E] to-[#180B22] p-5 border border-[rgba(242,203,128,0.18)] shadow-lg space-y-3">
              <div className="flex items-center gap-2 text-[#EAC272] font-bold text-xs uppercase tracking-wider">
                <Flame className="h-4 w-4" />
                <span>แมวเตือนสติกระตุกหนวด (Reality Check)</span>
              </div>
              <p className="text-sm font-medium text-[#FAE9CA] italic leading-relaxed">
                "{fortuneData.bestieRoast}"
              </p>
            </div>

            {/* Psychological Insight */}
            <div className="rounded-[24px] bg-gradient-to-br from-[#1E0E2A] to-[#110918] p-5 border border-[rgba(242,203,128,0.18)] shadow-lg space-y-3">
              <div className="flex items-center gap-2 text-[#AEFFE4] font-bold text-xs uppercase tracking-wider">
                <Brain className="h-4 w-4" />
                <span>จิตวิทยาประยุกต์ (Mind Hack)</span>
              </div>
              <p className="text-xs text-[#C9B49D] leading-relaxed">
                {fortuneData.psychologicalTip}
              </p>
            </div>

          </div>

          {/* Do's & Don'ts Checklist */}
          <div className="rounded-[28px] bg-[#180B22] p-6 border border-[rgba(242,203,128,0.16)] shadow-xl space-y-4">
            <h4 className="text-xs font-bold text-[#EAC272] uppercase tracking-wider flex items-center gap-2">
              <Compass className="h-4 w-4 text-[#EAC272]" />
              <span>คู่มือการปฏิบัติตัววันนี้ (Do's & Don'ts)</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

              {/* Do List */}
              <div className="space-y-2.5 rounded-2xl bg-[#165B53]/15 p-4 border border-[#165B53]/40">
                <div className="flex items-center gap-2 text-[#AEFFE4] font-bold text-xs">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>สิ่งที่ควรทำวันนี้ (Do):</span>
                </div>
                <ul className="space-y-2">
                  {fortuneData.doList.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-xs text-[#FAE9CA]/90 leading-relaxed">
                      <span className="text-[#AEFFE4] font-bold">✓</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Don't List */}
              <div className="space-y-2.5 rounded-2xl bg-[#842C71]/15 p-4 border border-[#842C71]/40">
                <div className="flex items-center gap-2 text-[#FFADE4] font-bold text-xs">
                  <XCircle className="h-4 w-4" />
                  <span>สิ่งที่อย่าหาทำเด็ดขาด (Don't):</span>
                </div>
                <ul className="space-y-2">
                  {fortuneData.dontList.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-xs text-[#FAE9CA]/90 leading-relaxed">
                      <span className="text-[#FFADE4] font-bold">✗</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

            </div>
          </div>

        </div>

        {/* Right 1 Column: Daily Card, Lucky Elements & Affirmation */}
        <div className="space-y-6">

          {/* Daily Card Guide */}
          <div className="rounded-[28px] bg-gradient-to-br from-[#24102E] via-[#1E0E2A] to-[#110918] p-6 border border-[rgba(242,203,128,0.22)] shadow-xl space-y-4 text-center">
            <div className="text-xs font-bold uppercase tracking-wider text-[#EAC272]">
              🎴 ไพ่นำทางประจำวัน (Daily Card)
            </div>

            {/* Glowing Mystic Card Container */}
            <div className="mx-auto flex h-40 w-28 flex-col items-center justify-center rounded-2xl bg-gradient-to-tr from-[#361A4A] via-[#1E0E2A] to-[#842C71] p-3 shadow-2xl ring-1 ring-[rgba(242,203,128,0.4)] relative group cursor-pointer transform hover:scale-105 transition-all">
              <span className="text-4xl filter drop-shadow-md">
                {fortuneData.dailyCard.symbol || '🐾'}
              </span>
              <span className="mt-2 font-serif-display text-xs font-normal text-[#FAE9CA] text-center leading-tight">
                {fortuneData.dailyCard.name}
              </span>
            </div>

            <p className="text-xs text-[#C9B49D] leading-relaxed">
              {fortuneData.dailyCard.meaning}
            </p>
          </div>

          {/* Lucky Elements Box */}
          <div className="rounded-[28px] bg-[#180B22] p-6 border border-[rgba(242,203,128,0.16)] shadow-xl space-y-4">
            <h4 className="text-xs font-bold text-[#EAC272] uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-[#EAC272]" />
              <span>เข็มทิศมงคลนำโชค (Lucky Elements)</span>
            </h4>

            <div className="space-y-3 text-xs">

              {/* Lucky Color */}
              <div className="flex items-center justify-between rounded-xl bg-[#110918] p-3 border border-[rgba(242,203,128,0.12)]">
                <span className="text-[#C9B49D]">🎨 สีมงคลเสริมออร่า:</span>
                <span className="font-bold text-[#FAE9CA] flex items-center gap-2">
                  <span
                    className="h-3 w-3 rounded-full border border-white/20"
                    style={{ backgroundColor: fortuneData.luckyElements.colorHex || '#842C71' }}
                  />
                  {fortuneData.luckyElements.color}
                </span>
              </div>

              {/* Lucky Number */}
              <div className="flex items-center justify-between rounded-xl bg-[#110918] p-3 border border-[rgba(242,203,128,0.12)]">
                <span className="text-[#C9B49D]">🔢 เลขเด็ดตาสว่าง:</span>
                <span className="font-serif-display text-base font-bold text-[#EAC272] tracking-wider">
                  {fortuneData.luckyElements.number}
                </span>
              </div>

              {/* Power Hour */}
              <div className="flex items-center justify-between rounded-xl bg-[#110918] p-3 border border-[rgba(242,203,128,0.12)]">
                <span className="text-[#C9B49D]">⏰ ช่วงเวลาทอง (Power Hour):</span>
                <span className="font-bold text-[#AEFFE4]">
                  {fortuneData.luckyElements.powerHour}
                </span>
              </div>

              {/* Lucky Item */}
              <div className="flex items-center justify-between rounded-xl bg-[#110918] p-3 border border-[rgba(242,203,128,0.12)]">
                <span className="text-[#C9B49D]">🧲 สิ่งนำโชคประจำวัน:</span>
                <span className="font-semibold text-[#FAE9CA]">
                  {fortuneData.luckyElements.luckyItem}
                </span>
              </div>

            </div>
          </div>

          {/* Daily Affirmation Card */}
          <div className="relative overflow-hidden rounded-[28px] bg-gradient-to-tr from-[#361A4A] via-[#24102E] to-[#110918] p-6 border border-[rgba(242,203,128,0.22)] shadow-xl space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold text-[#EAC272] uppercase tracking-wider">
              <Award className="h-4 w-4 text-[#EAC272]" />
              <span>ประโยคสะกดจิตเสริมพลังใจ (Daily Affirmation)</span>
            </div>

            <p className="font-serif-display text-base text-[#FAE9CA] italic leading-relaxed">
              "{fortuneData.dailyAffirmation}"
            </p>

            <button
              id="btn-ask-teller-daily"
              onClick={() => onContinueChatWithDaily(fortuneData, selectedFocus)}
              className="mother-chat-cta mt-2 w-full flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#842C71] to-[#531B47] border border-[rgba(242,203,128,0.3)] px-4 py-3 text-xs font-bold text-[#FAE9CA] shadow-lg hover:border-[#EAC272] hover:scale-[1.01] transition-all"
            >
              <MessageSquareHeart className="h-4 w-4 text-[#EAC272]" />
              <span>คุยแชทถามแม่หมอต่อเรื่องดวงวันนี้</span>
            </button>
          </div>

        </div>

      </div>}


    </div>
  );
};
