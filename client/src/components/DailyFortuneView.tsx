import React, { useState, useEffect, useRef } from 'react';
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
  TrendingUp,
  Activity,
  BarChart3,
  RotateCcw,
  Hand
} from 'lucide-react';
import { DailyFortuneData, SassLevel, FortuneReading } from '../types';
import { speakThaiText, stopSpeaking, playCatPurrSound, playMysticChimeSound } from '../utils/speechHelper';
import { WeeklyTrendDashboard } from './WeeklyTrendDashboard';
import { QuickFortuneWidget } from './QuickFortuneWidget';
import { FateSynchronicityBanner } from './FateSynchronicityBanner';
import { ZodiacCompatibilityBadge, UserBirthProfile } from './ZodiacCompatibilityEngine';
import { AnalysisWaitingOverlay } from './AnalysisWaitingOverlay';

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
}) => {
  // User Profile State
  const [userName, setUserName] = useState<string>(() => {
    return localStorage.getItem('sassy_user_name') || 'คุณผู้ถือกุญแจ';
  });
  const [selectedZodiac, setSelectedZodiac] = useState<string>(() => {
    return localStorage.getItem('sassy_user_zodiac') || 'scorpio';
  });
  const [selectedDay, setSelectedDay] = useState<string>(() => {
    return localStorage.getItem('sassy_user_day') || 'วันจันทร์';
  });
  const [selectedFocus, setSelectedFocus] = useState<string>('love');

  // Fortune Data State
  const [fortuneData, setFortuneData] = useState<DailyFortuneData>(() => {
    const saved = localStorage.getItem('sassy_daily_fortune_cache');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.themeTitle) return parsed;
      } catch (e) {}
    }
    return DEFAULT_FORTUNE;
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [isEditingProfile, setIsEditingProfile] = useState<boolean>(false);
  const [isCardShuffling, setIsCardShuffling] = useState<boolean>(false);
  const [activeSection, setActiveSection] = useState<'both' | 'reading' | 'trend'>('both');

  // 3-Step Interactive Ritual: 'ready' (สับไพ่) -> 'shuffling' (กำลังสับ) -> 'pick' (เลือกจั่วไพ่) -> 'revealed' (เปิดคำทำนาย)
  const [ritualStage, setRitualStage] = useState<'ready' | 'shuffling' | 'pick' | 'revealed'>('ready');
  const [hoveredFanIndex, setHoveredFanIndex] = useState<number | null>(null);
  const readingSectionRef = useRef<HTMLDivElement | null>(null);

  // Today's formatted Thai date
  const todayStr = new Date().toLocaleDateString('th-TH', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Save profile changes
  useEffect(() => {
    localStorage.setItem('sassy_user_name', userName);
    localStorage.setItem('sassy_user_zodiac', selectedZodiac);
    localStorage.setItem('sassy_user_day', selectedDay);
  }, [userName, selectedZodiac, selectedDay]);

  // Clean up speech on unmount
  useEffect(() => {
    return () => {
      stopSpeaking();
    };
  }, []);

  // Current active zodiac object
  const currentZodiacObj = ZODIAC_SIGNS.find(z => z.id === selectedZodiac) || ZODIAC_SIGNS[0];

  // Step 1: Start Shuffling (สับไพ่)
  const handleStartShuffle = () => {
    if (soundEnabled) {
      playCatPurrSound();
      playMysticChimeSound('card');
    }
    setRitualStage('shuffling');
    setIsCardShuffling(true);

    // After realistic shuffling duration, cards are fanned out and ready to pick
    setTimeout(() => {
      setIsCardShuffling(false);
      setRitualStage('pick');
      onShowToast('✨ ไพ่สับเสร็จแล้ว! แตะเลือกไพ่ 1 ใบเพื่อเปิดคำทำนาย');
    }, 1200);
  };

  // Step 2 & 3: Pick a Card from Fan and Reveal Fortune
  const handlePickCardAndReveal = async (cardIndex = 0) => {
    if (soundEnabled) {
      playMysticChimeSound('card');
    }
    setIsLoading(true);

    try {
      const focusLabel = FOCUS_AREAS.find(f => f.id === selectedFocus)?.label || 'ภาพรวม';

      const res = await fetch('/api/gemini/daily-fortune', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: userName,
          zodiac: `${currentZodiacObj.nameTh} ธาตุ${currentZodiacObj.element}`,
          dayOfBirth: selectedDay,
          focusArea: focusLabel,
          sassyLevel: sassLevel,
          date: todayStr,
        }),
      });

      const json = await res.json();
      if (json.data && json.data.themeTitle) {
        setFortuneData(json.data);
        localStorage.setItem('sassy_daily_fortune_cache', JSON.stringify(json.data));
      } else {
        throw new Error(json.error || 'เกิดข้อผิดพลาดในการโหลดดวง');
      }
    } catch (err: any) {
      console.error('Daily Fortune Fetch Notice:', err);
      // Fallback
      const fallbackData: DailyFortuneData = {
        ...DEFAULT_FORTUNE,
        themeTitle: `ดวงฉบับเตือนสติของ ${userName}: สติมา ปัญญาเกิด!`,
        overallVibe: `วันนี้ดาวส่งพลังด้าน${FOCUS_AREAS.find(f => f.id === selectedFocus)?.label || 'ภาพรวม'} แค่แกอย่าลังเล`,
      };
      setFortuneData(fallbackData);
    } finally {
      setIsLoading(false);
      setRitualStage('revealed');
      onShowToast('🐾 จั่วสำเร็จ! เปิดคำทำนายประจำวันแล้ว');
      // Smoothly scroll down to the revealed reading card
      setTimeout(() => {
        readingSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 250);
    }
  };

  // Reset to draw again
  const handleResetRitual = () => {
    setRitualStage('ready');
  };

  // Legacy/Direct fetch for focus change or manual re-calc
  const handleFetchDailyFortune = async (isManualRefresh = false) => {
    if (ritualStage === 'ready') {
      handleStartShuffle();
    } else {
      handlePickCardAndReveal(2);
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

      <AnalysisWaitingOverlay
        status={isLoading ? {
          discipline: 'daily',
          topic: FOCUS_AREAS.find(f => f.id === selectedFocus)?.label || 'ภาพรวมวันนี้',
          depthTier: 'quick',
          itemCount: 1,
        } : null}
        error={null}
        onRetry={() => void handlePickCardAndReveal(2)}
        onCloseError={() => undefined}
      />

      {/* Cross-Reading Fate Synchronicity Banner */}
      {readings && onOpenSynchronicityModal && (
        <FateSynchronicityBanner
          readings={readings}
          onOpenSynchronicityModal={onOpenSynchronicityModal}
          currentDisciplineName="ดวงประจำวัน & จิตวิทยาประยุกต์"
        />
      )}

      {/* ---------------------------------------------------- */}
      {/* Top View Selector Bar */}
      {/* ---------------------------------------------------- */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-[#180B22] p-2.5 sm:p-3 border border-[rgba(242,203,128,0.18)] shadow-lg">
        <div className="flex items-center gap-2 px-2 text-xs font-semibold text-[#EAC272]">
          <Sparkles className="h-4 w-4 text-[#EAC272]" />
          <span>The Cat Room Experience:</span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <button
            id="tab-view-both"
            onClick={() => setActiveSection('both')}
            className={`flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all ${
              activeSection === 'both'
                ? 'bg-gradient-to-r from-[#842C71] to-[#531B47] text-[#FAE9CA] border border-[#EAC272] shadow-md'
                : 'bg-[#110918] text-[#C9B49D] hover:bg-[#24102E] border border-[rgba(242,203,128,0.12)]'
            }`}
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>ครบจบในหน้าเดียว (All-in-One)</span>
          </button>

          <button
            id="tab-view-reading"
            onClick={() => setActiveSection('reading')}
            className={`flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all ${
              activeSection === 'reading'
                ? 'bg-gradient-to-r from-[#842C71] to-[#531B47] text-[#FAE9CA] border border-[#EAC272] shadow-md'
                : 'bg-[#110918] text-[#C9B49D] hover:bg-[#24102E] border border-[rgba(242,203,128,0.12)]'
            }`}
          >
            <span>🎴</span>
            <span>จั่วไพ่ & ดวงประจำวัน</span>
          </button>

          <button
            id="tab-view-trend"
            onClick={() => setActiveSection('trend')}
            className={`flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all ${
              activeSection === 'trend'
                ? 'bg-gradient-to-r from-[#165B53] to-[#0E423C] text-[#AEFFE4] border border-[#AEFFE4] shadow-md'
                : 'bg-[#110918] text-[#C9B49D] hover:bg-[#24102E] border border-[rgba(242,203,128,0.12)]'
            }`}
          >
            <TrendingUp className="h-3.5 w-3.5 text-[#AEFFE4]" />
            <span>กราฟวิถีดวง 7 วัน (Weekly Trend)</span>
          </button>
        </div>
      </div>

      {/* ---------------------------------------------------- */}
      {/* Daily Reading Content (Hero + Details) */}
      {/* ---------------------------------------------------- */}
      {(activeSection === 'both' || activeSection === 'reading') && (
        <>
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

          {/* 3-Step Interactive Ritual Display */}
          <div className="relative py-4 min-h-[300px] flex flex-col items-center justify-center">

            {/* STEP 1: READY TO SHUFFLE (กองไพ่พร้อมสับ) */}
            {ritualStage === 'ready' && (
              <div className="flex flex-col items-center justify-center text-center space-y-5">
                <div className="relative w-44 h-64 cursor-pointer group" onClick={handleStartShuffle}>
                  {/* Layered stack shadows */}
                  {[...Array(4)].map((_, i) => (
                    <div
                      key={i}
                      style={{
                        transform: `translate(${(i - 2) * 2}px, ${(i - 2) * 2.5}px) rotate(${(i - 2) * 1.5}deg)`,
                      }}
                      className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#1E0E2A] to-[#0A0410] border border-[rgba(242,203,128,0.2)] shadow-xl pointer-events-none"
                    />
                  ))}

                  {/* Top card of the stack */}
                  <div className="relative w-full h-full rounded-2xl bg-gradient-to-b from-[#2A143A] via-[#1E0E2A] to-[#14081E] border-2 border-[rgba(242,203,128,0.45)] shadow-2xl shadow-[#110918] p-5 flex flex-col items-center justify-between group-hover:scale-105 group-hover:border-[#EAC272] transition-all duration-300">
                    <div className="w-full flex justify-between text-[10px] text-[#EAC272]">
                      <span>✦</span>
                      <span className="font-serif-display tracking-widest text-[9px] text-[#C9B49D]">DAILY ORACLE</span>
                      <span>✦</span>
                    </div>

                    <div className="flex flex-col items-center space-y-2">
                      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#361A4A]/80 border border-[rgba(242,203,128,0.4)] shadow-inner group-hover:scale-110 transition-transform">
                        <span className="text-2xl text-[#EAC272] filter drop-shadow">🐾</span>
                      </div>
                      <h3 className="font-serif-display text-xl font-normal tracking-wide text-[#FAE9CA] group-hover:text-[#EAC272] transition-colors">
                        The Mystic Deck
                      </h3>
                      <p className="text-[11px] text-[#C9B49D] font-light">
                        แตะเพื่อเริ่มสับไพ่
                      </p>
                    </div>

                    <div className="w-full flex justify-between text-[10px] text-[#EAC272]">
                      <span>✦</span>
                      <span className="text-[10px] text-[#C9B49D]/70">{currentZodiacObj.icon}</span>
                      <span>✦</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <p className="text-xs text-[#EAC272] font-semibold flex items-center justify-center gap-1">
                    <span>ขั้นตอนที่ 1 จาก 3:</span>
                    <span>สับไพ่เพื่อจัดเรียงคลื่นพลังงาน</span>
                  </p>
                  <p className="text-[11px] text-[#C9B49D]">
                    ตั้งสมาธิถึงคำถามหรือเรื่องที่ติดค้างในใจ แล้วกดปุ่มสับไพ่
                  </p>
                </div>

                <button
                  id="btn-daily-purr-draw"
                  onClick={handleStartShuffle}
                  className="btn-gilded w-full max-w-sm flex items-center justify-center gap-3 py-3.5 px-8 text-base sm:text-lg font-bold cursor-pointer"
                >
                  <Shuffle className="h-5 w-5" />
                  <span>สับไพ่ประจำวัน (Shuffle)</span>
                </button>
              </div>
            )}

            {/* STEP 2: SHUFFLING (กำลังสับไพ่อย่างสมจริง) */}
            {ritualStage === 'shuffling' && (
              <div className="flex flex-col items-center justify-center text-center space-y-6 py-6">
                <div className="relative w-48 h-64 flex items-center justify-center">
                  {[...Array(5)].map((_, i) => (
                    <motion.div
                      key={i}
                      animate={{
                        x: [0, (i % 2 === 0 ? 1 : -1) * (24 + i * 8), 0],
                        y: [0, (i % 2 === 0 ? -1 : 1) * (10 + i * 5), 0],
                        rotate: [0, (i % 2 === 0 ? 12 : -12), 0],
                        scale: [1, 1.05, 1],
                      }}
                      transition={{
                        duration: 0.6,
                        repeat: Infinity,
                        delay: i * 0.08,
                      }}
                      className="absolute inset-0 rounded-2xl bg-gradient-to-b from-[#2A143A] via-[#1E0E2A] to-[#14081E] border-2 border-[rgba(242,203,128,0.4)] shadow-2xl p-4 flex flex-col items-center justify-center"
                    >
                      <span className="text-2xl text-[#EAC272]">🐾</span>
                    </motion.div>
                  ))}
                </div>

                <div className="space-y-1">
                  <h4 className="font-serif-display text-lg text-[#FAE9CA] flex items-center justify-center gap-2">
                    <Sparkles className="h-4 w-4 text-[#EAC272] animate-spin" />
                    กำลังสับไพ่ประจำวัน...
                  </h4>
                  <p className="text-xs text-[#C9B49D]">
                    พลังงานกำลังหมุนวน เตรียมคลี่ไพ่ให้คุณเลือก
                  </p>
                </div>
              </div>
            )}

            {/* STEP 3: PICK / DRAW CARD (คลี่ไพ่ให้เลือกจั่วด้วยตนเอง) */}
            {ritualStage === 'pick' && (
              <div className="flex flex-col items-center justify-center text-center space-y-6 w-full py-4">
                <div className="space-y-1">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[#842C71]/50 border border-[#EAC272]/40 px-3.5 py-1 text-xs font-semibold text-[#FAE9CA]">
                    <Hand className="h-3.5 w-3.5 text-[#EAC272]" />
                    ขั้นตอนที่ 2: แตะเลือกไพ่ 1 ใบที่คุณถูกชะตา
                  </span>
                  <p className="text-xs text-[#C9B49D] mt-1">
                    ใช้สัญชาตญาณ แตะเลือกไพ่ใบที่ดึงดูดสายตาคุณมากที่สุด
                  </p>
                </div>

                {/* Interactive Fanned 5 Cards Spread to Pick */}
                <div className="relative w-full max-w-md h-64 sm:h-72 flex items-center justify-center py-4">
                  {[-2, -1, 0, 1, 2].map((offset, idx) => {
                    const isHovered = hoveredFanIndex === idx;
                    const rotateDeg = offset * 11;
                    const translateX = offset * 42;
                    const translateY = Math.abs(offset) * 8;

                    return (
                      <motion.div
                        key={idx}
                        whileHover={{ y: -26, scale: 1.1, zIndex: 50 }}
                        whileTap={{ scale: 0.95 }}
                        onMouseEnter={() => setHoveredFanIndex(idx)}
                        onMouseLeave={() => setHoveredFanIndex(null)}
                        onClick={() => !isLoading && handlePickCardAndReveal(idx)}
                        animate={{
                          rotate: rotateDeg,
                          x: translateX,
                          y: translateY,
                        }}
                        transition={{ type: 'spring', stiffness: 220, damping: 18 }}
                        style={{
                          position: 'absolute',
                          zIndex: isHovered ? 40 : 10 + (2 - Math.abs(offset)),
                        }}
                        className="cursor-pointer select-none"
                      >
                        <div
                          className={`w-28 h-44 sm:w-32 sm:h-52 rounded-2xl bg-gradient-to-b from-[#2A143A] via-[#1E0E2A] to-[#14081E] border-2 ${
                            isHovered
                              ? 'border-[#EAC272] shadow-[0_0_25px_rgba(234,194,114,0.6)]'
                              : 'border-[rgba(242,203,128,0.35)] shadow-xl'
                          } p-3 flex flex-col items-center justify-between transition-colors`}
                        >
                          <div className="w-full flex justify-between text-[8px] text-[#EAC272]">
                            <span>✦</span>
                            <span># {idx + 1}</span>
                            <span>✦</span>
                          </div>
                          <div className="flex flex-col items-center">
                            <span className="text-xl text-[#EAC272] filter drop-shadow">🐾</span>
                            <span className="text-[10px] text-[#FAE9CA] font-serif mt-1">จั่วใบนี้</span>
                          </div>
                          <div className="w-full flex justify-center text-[8px] text-[#EAC272]">
                            <span>✦ ✦ ✦</span>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handlePickCardAndReveal(2)}
                    disabled={isLoading}
                    className="btn-gilded px-6 py-2.5 text-xs font-bold flex items-center gap-2 cursor-pointer"
                  >
                    <Sparkles className="h-4 w-4" />
                    <span>{isLoading ? 'แมวกำลังส่องไฟถอดรหัส...' : 'สุ่มหยิบ 1 ใบ (Random Pick)'}</span>
                  </button>
                  <button
                    onClick={handleStartShuffle}
                    className="text-xs text-[#C9B49D] hover:text-[#FAE9CA] flex items-center gap-1"
                  >
                    <RotateCcw className="h-3 w-3" />
                    <span>สับใหม่อีกรอบ</span>
                  </button>
                </div>
              </div>
            )}

            {/* STEP 4: REVEALED (เปิดไพ่ที่จั่วได้เรียบร้อย) */}
            {ritualStage === 'revealed' && (
              <div className="flex flex-col items-center justify-center text-center space-y-4 py-2">
                <motion.div
                  initial={{ scale: 0.85, opacity: 0, rotateY: 90 }}
                  animate={{ scale: 1, opacity: 1, rotateY: 0 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                  className="relative w-44 h-64 sm:w-48 sm:h-70 rounded-2xl bg-gradient-to-b from-[#3D144A] via-[#240C30] to-[#120518] border-2 border-[#EAC272] shadow-[0_0_30px_rgba(234,194,114,0.4)] p-5 flex flex-col items-center justify-between"
                >
                  <div className="w-full flex justify-between text-[10px] text-[#EAC272]">
                    <span>✦</span>
                    <span className="font-serif-display tracking-widest text-[9px] text-[#C9B49D]">REVEALED</span>
                    <span>✦</span>
                  </div>

                  <div className="flex flex-col items-center space-y-2 text-center">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#842C71]/60 border border-[#EAC272] shadow-inner text-2xl">
                      {fortuneData.dailyCard?.symbol || '🐾'}
                    </div>
                    <h3 className="font-serif-display text-sm font-bold text-[#FAE9CA] line-clamp-2 px-1">
                      {fortuneData.dailyCard?.name || 'The Mystic Black Cat'}
                    </h3>
                    <p className="text-[10px] text-[#EAC272] line-clamp-2 italic px-1">
                      "{fortuneData.dailyCard?.meaning}"
                    </p>
                  </div>

                  <div className="w-full flex justify-between text-[10px] text-[#EAC272]">
                    <span>✦</span>
                    <span className="text-[10px] text-[#C9B49D]/70">{currentZodiacObj.icon}</span>
                    <span>✦</span>
                  </div>
                </motion.div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    onClick={handleStartShuffle}
                    className="rounded-full bg-[#24102E] border border-[rgba(242,203,128,0.3)] hover:border-[#EAC272] px-4 py-2 text-xs font-semibold text-[#FAE9CA] flex items-center gap-2 transition-all cursor-pointer"
                  >
                    <Shuffle className="h-3.5 w-3.5 text-[#EAC272]" />
                    <span>สับและจั่วใหม่อีกครั้ง</span>
                  </button>
                  <button
                    onClick={() => {
                      readingSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }}
                    className="btn-gilded px-4 py-2 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>อ่านคำทำนายละเอียด</span>
                    <span>↓</span>
                  </button>
                </div>
              </div>
            )}

          </div>

          {/* Velvet Focus Area Pills & Profile Section */}
          <div className="flex flex-col items-center gap-4 pt-1">
            <div className="text-[11px] uppercase tracking-wider text-[#C9B49D] font-medium">
              เลือกโฟกัสเรื่องที่ต้องการเจาะลึก:
            </div>
            {/* Velvet Focus Area Pills */}
            <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
              {FOCUS_AREAS.map(item => {
                const isActive = selectedFocus === item.id;
                return (
                  <button
                    key={item.id}
                    id={`pill-focus-${item.id}`}
                    onClick={() => {
                      setSelectedFocus(item.id);
                      if (item.id !== selectedFocus) {
                        handleFetchDailyFortune(false);
                      }
                    }}
                    className={`rounded-full px-4 py-1.5 text-xs sm:text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-[#842C71] text-[#FAE9CA] border border-[rgba(242,203,128,0.55)] shadow-lg shadow-[#842C71]/40 scale-105'
                        : 'bg-[#842C71]/25 text-[#FAE9CA]/80 border border-[rgba(242,203,128,0.15)] hover:bg-[#842C71]/45 hover:text-[#FAE9CA]'
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>

            {/* Profile Config Toggle & Quick Trend Jump */}
            <div className="pt-2 flex flex-wrap items-center justify-center gap-4">
              <button
                id="btn-profile-adjust"
                onClick={() => setIsEditingProfile(!isEditingProfile)}
                className="text-xs text-[#C9B49D] hover:text-[#EAC272] flex items-center gap-1.5 transition-colors"
              >
                <User className="h-3.5 w-3.5 text-[#EAC272]" />
                <span>ลูกดวง: <strong className="text-[#FAE9CA]">{userName}</strong> ({currentZodiacObj.nameTh}) — {isEditingProfile ? 'ปิดแก้ไข' : 'เปลี่ยนชื่อ/ราศี'}</span>
              </button>

              <button
                id="btn-quick-jump-trend"
                onClick={() => {
                  setActiveSection('trend');
                  setTimeout(() => {
                    document.getElementById('weekly-trend-section')?.scrollIntoView({ behavior: 'smooth' });
                  }, 100);
                }}
                className="text-xs text-[#AEFFE4] hover:text-[#EAC272] flex items-center gap-1.5 transition-colors font-medium"
              >
                <TrendingUp className="h-3.5 w-3.5" />
                <span>ดูกราฟแนวโน้ม 7 วัน</span>
              </button>
            </div>

          </div>

        </div>

        {/* Expandable Profile Config Box */}
        <AnimatePresence>
          {isEditingProfile && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden pt-6 border-t border-[rgba(242,203,128,0.15)] mt-6 text-left max-w-2xl mx-auto"
            >
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-[#1E0E2A]/90 p-5 rounded-2xl border border-[rgba(242,203,128,0.2)]">
                {/* Name */}
                <div>
                  <label className="block text-[11px] font-semibold text-[#C9B49D] mb-1">
                    ชื่อเล่น / นามเรียกขาน:
                  </label>
                  <input
                    type="text"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    placeholder="เช่น คุณกิ๊ฟ, คุณนุ้ย"
                    className="w-full rounded-xl bg-[#110918] border border-[rgba(242,203,128,0.2)] px-3 py-2 text-xs text-[#FAE9CA] focus:border-[#EAC272] focus:outline-none"
                  />
                </div>

                {/* Zodiac Sign */}
                <div>
                  <label className="block text-[11px] font-semibold text-[#C9B49D] mb-1">
                    ราศีเกิด (Zodiac):
                  </label>
                  <select
                    value={selectedZodiac}
                    onChange={(e) => setSelectedZodiac(e.target.value)}
                    className="w-full rounded-xl bg-[#110918] border border-[rgba(242,203,128,0.2)] px-3 py-2 text-xs text-[#EAC272] focus:border-[#EAC272] focus:outline-none"
                  >
                    {ZODIAC_SIGNS.map(z => (
                      <option key={z.id} value={z.id}>
                        {z.icon} {z.nameTh}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Day of Birth */}
                <div>
                  <label className="block text-[11px] font-semibold text-[#C9B49D] mb-1">
                    วันเกิดประจำสัปดาห์:
                  </label>
                  <select
                    value={selectedDay}
                    onChange={(e) => setSelectedDay(e.target.value)}
                    className="w-full rounded-xl bg-[#110918] border border-[rgba(242,203,128,0.2)] px-3 py-2 text-xs text-[#EAC272] focus:border-[#EAC272] focus:outline-none"
                  >
                    {DAYS_OF_WEEK.map(day => (
                      <option key={day} value={day}>{day}</option>
                    ))}
                  </select>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </section>

      {/* ---------------------------------------------------- */}
      {/* Quick Fortune Widget: Aphorism & Hidden Advice */}
      {/* ---------------------------------------------------- */}
      <QuickFortuneWidget
        onShowToast={onShowToast}
        soundEnabled={soundEnabled}
      />

      {/* ---------------------------------------------------- */}
      {/* Detailed Reading Results Section */}
      {/* ---------------------------------------------------- */}
      <div ref={readingSectionRef} className="grid grid-cols-1 lg:grid-cols-3 gap-6">

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

      </div>
        </>
      )}

      {/* ---------------------------------------------------- */}
      {/* Weekly Trend Dashboard Component (7-Day Recharts) */}
      {/* ---------------------------------------------------- */}
      {(activeSection === 'both' || activeSection === 'trend') && (
        <section id="weekly-trend-section" className="pt-2">
          <WeeklyTrendDashboard
            currentFortune={fortuneData}
            userName={userName}
            onShowToast={onShowToast}
            soundEnabled={soundEnabled}
          />
        </section>
      )}

    </div>
  );
};
