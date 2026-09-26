import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  RotateCcw,
  Copy,
  Check,
  Compass,
  Clock,
  ShieldAlert,
  Flame,
  Coins,
  Heart,
  Briefcase,
  Share2,
  BookmarkCheck,
  Calendar as CalendarIcon,
  ChevronRight,
  Info,
  Layers,
  Zap,
  Globe,
  Star,
  CheckCircle2,
  Trash2
} from 'lucide-react';
import { LuckyNumbersResult, PlanetaryPosition, LuckyPairNumber, SassLevel, DisciplineType, FortuneReading } from '../types';
import { useMood } from '../context/MoodContext';
import { playMysticChimeSound } from '../utils/speechHelper';
import { FateSynchronicityBanner } from './FateSynchronicityBanner';

interface LuckyNumberGeneratorProps {
  sassLevel?: SassLevel;
  onSwitchDiscipline?: (discipline: DisciplineType) => void;
  onShowToast?: (msg: string) => void;
  soundEnabled?: boolean;
  coins?: number;
  onSpendCoins?: (amount: number, reason: string) => boolean;
  onOpenTopUp?: () => void;
  readings?: FortuneReading[];
  onOpenSynchronicityModal?: () => void;
  onOpenLotteryVault?: () => void;
}

const ZODIAC_SIGNS = [
  {
    name: 'ราศีเมษ (Aries)',
    en: 'Aries',
    dates: '13 เม.ย. - 13 พ.ค.',
    element: 'ไฟ',
    elementColor: 'text-rose-400',
    icon: '♈',
    ruler: 'ดาวอังคาร (Mars)',
  },
  {
    name: 'ราศีพฤษภ (Taurus)',
    en: 'Taurus',
    dates: '14 พ.ค. - 13 มิ.ย.',
    element: 'ดิน',
    elementColor: 'text-emerald-400',
    icon: '♉',
    ruler: 'ดาวศุกร์ (Venus)',
  },
  {
    name: 'ราศีเมถุน (Gemini)',
    en: 'Gemini',
    dates: '14 มิ.ย. - 14 ก.ค.',
    element: 'ลม',
    elementColor: 'text-amber-300',
    icon: '♊',
    ruler: 'ดาวพุธ (Mercury)',
  },
  {
    name: 'ราศีกรกฎ (Cancer)',
    en: 'Cancer',
    dates: '15 ก.ค. - 16 ส.ค.',
    element: 'น้ำ',
    elementColor: 'text-cyan-400',
    icon: '♋',
    ruler: 'ดาวจันทร์ (Moon)',
  },
  {
    name: 'ราศีสิงห์ (Leo)',
    en: 'Leo',
    dates: '17 ส.ค. - 16 ก.ย.',
    element: 'ไฟ',
    elementColor: 'text-rose-400',
    icon: '♌',
    ruler: 'ดาวอาทิตย์ (Sun)',
  },
  {
    name: 'ราศีกันย์ (Virgo)',
    en: 'Virgo',
    dates: '17 ก.ย. - 16 ต.ค.',
    element: 'ดิน',
    elementColor: 'text-emerald-400',
    icon: '♍',
    ruler: 'ดาวพุธ (Mercury)',
  },
  {
    name: 'ราศีตุลย์ (Libra)',
    en: 'Libra',
    dates: '17 ต.ค. - 15 พ.ย.',
    element: 'ลม',
    elementColor: 'text-amber-300',
    icon: '♎',
    ruler: 'ดาวศุกร์ (Venus)',
  },
  {
    name: 'ราศีพิจิก (Scorpio)',
    en: 'Scorpio',
    dates: '16 พ.ย. - 15 ธ.ค.',
    element: 'น้ำ',
    elementColor: 'text-cyan-400',
    icon: '♏',
    ruler: 'ดาวอังคาร & พลูโต',
  },
  {
    name: 'ราศีธนู (Sagittarius)',
    en: 'Sagittarius',
    dates: '16 ธ.ค. - 14 ม.ค.',
    element: 'ไฟ',
    elementColor: 'text-rose-400',
    icon: '♐',
    ruler: 'ดาวพฤหัสบดี (Jupiter)',
  },
  {
    name: 'ราศีมังกร (Capricorn)',
    en: 'Capricorn',
    dates: '15 ม.ค. - 12 ก.พ.',
    element: 'ดิน',
    elementColor: 'text-emerald-400',
    icon: '♑',
    ruler: 'ดาวเสาร์ (Saturn)',
  },
  {
    name: 'ราศีกุมภ์ (Aquarius)',
    en: 'Aquarius',
    dates: '13 ก.พ. - 13 มี.ค.',
    element: 'ลม',
    elementColor: 'text-amber-300',
    icon: '♒',
    ruler: 'ดาวราหู & ยูเรนัส',
  },
  {
    name: 'ราศีมีน (Pisces)',
    en: 'Pisces',
    dates: '14 มี.ค. - 12 เม.ย.',
    element: 'น้ำ',
    elementColor: 'text-cyan-400',
    icon: '♓',
    ruler: 'ดาวพฤหัสบดี & เกตุ',
  },
];

const INTENTIONS = [
  { id: 'all', label: 'ครอบคลุมทุกมิติ', icon: '✨', desc: 'สมดุลโชคลาภ การงาน เสน่ห์' },
  { id: 'wealth', label: 'การเงิน & โชคลาภ', icon: '💰', desc: 'เจรจาค้าขาย เงินหมุนเวียน เสี่ยงโชค' },
  { id: 'work', label: 'การงาน & บารมี', icon: '💼', desc: 'อำนาจ สอบแข่งขัน ผู้ใหญ่เกื้อหนุน' },
  { id: 'love', label: 'ความรัก & เสน่ห์', icon: '💖', desc: 'เมตตามหานิยม ความสัมพันธ์ดึงดูดใจ' },
];

export const LuckyNumberGenerator: React.FC<LuckyNumberGeneratorProps> = ({
  sassLevel = 'spicy',
  onSwitchDiscipline,
  onShowToast,
  soundEnabled = true,
  coins,
  onSpendCoins,
  onOpenTopUp,
  readings,
  onOpenSynchronicityModal,
  onOpenLotteryVault,
}) => {
  const { currentMood } = useMood();

  // State
  const [selectedZodiac, setSelectedZodiac] = useState<string>('ราศีกันย์ (Virgo)');
  const [targetDate, setTargetDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [selectedIntention, setSelectedIntention] = useState<string>('all');
  
  const [luckyData, setLuckyData] = useState<LuckyNumbersResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [savedNumbersList, setSavedNumbersList] = useState<Array<{ id: string; date: string; zodiac: string; core: number; pairs: string[]; triplets: string[] }>>([]);
  const [showSavedModal, setShowSavedModal] = useState<boolean>(false);

  // Load saved numbers from LocalStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('thecatroom_saved_lucky_numbers');
      if (stored) {
        setSavedNumbersList(JSON.parse(stored));
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  // Fetch or calculate lucky numbers
  const fetchLuckyNumbers = async (zodiac: string, date: string, intention: string, animate = false) => {
    if (animate) {
      setIsSpinning(true);
      if (soundEnabled) playMysticChimeSound('gold');
    } else {
      setIsLoading(true);
    }

    try {
      const response = await fetch('/api/gemini/lucky-numbers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          zodiac,
          date,
          intention,
          sassyLevel: sassLevel,
        }),
      });

      if (!response.ok) {
        throw new Error('Error response from server');
      }

      const resJson = await response.json();
      if (resJson?.data) {
        setLuckyData(resJson.data);
      }
    } catch (error) {
      console.error('[Lucky Numbers Fetch Error]:', error);
      if (onShowToast) onShowToast('เกิดข้อขัดข้องในการเชื่อมต่อ กำลังใช้การคำนวณฐานดวงดาวสำรอง');
    } finally {
      if (animate) {
        setTimeout(() => {
          setIsSpinning(false);
          if (soundEnabled) playMysticChimeSound('coin');
        }, 500);
      } else {
        setIsLoading(false);
      }
    }
  };

  // Debounced load on parameter changes
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchLuckyNumbers(selectedZodiac, targetDate, selectedIntention);
    }, 280);

    return () => clearTimeout(timer);
  }, [selectedZodiac, targetDate, selectedIntention]);

  // Handle re-spin with coin deduction if system enabled
  const handleReSpin = () => {
    // If coin system is integrated, require 5 coins for manual celestial re-spin
    if (onSpendCoins && typeof coins === 'number') {
      const COST = 5;
      if (coins < COST) {
        if (onOpenTopUp) onOpenTopUp();
        if (onShowToast) onShowToast(`⚠️ เหรียญดูดวงไม่พอ (หมุนสับคลื่นดวงดาวใหม่ใช้ ${COST} เหรียญ)`);
        return;
      }
      const success = onSpendCoins(COST, 'หมุนลูกแก้วคำนวณเลขมงคลดวงดาวใหม่');
      if (!success) return;
    }

    fetchLuckyNumbers(selectedZodiac, targetDate, selectedIntention, true);
  };

  // Quick Date select helpers
  const handleSetQuickDate = (type: 'today' | 'tomorrow' | 'lottery') => {
    if (soundEnabled) playMysticChimeSound('soft');
    const now = new Date();
    if (type === 'today') {
      setTargetDate(now.toISOString().split('T')[0]);
    } else if (type === 'tomorrow') {
      const tomorrow = new Date(now);
      tomorrow.setDate(now.getDate() + 1);
      setTargetDate(tomorrow.toISOString().split('T')[0]);
    } else if (type === 'lottery') {
      // Find next 1st or 16th
      const currentDay = now.getDate();
      const lotteryDate = new Date(now);
      if (currentDay < 1) {
        lotteryDate.setDate(1);
      } else if (currentDay < 16) {
        lotteryDate.setDate(16);
      } else {
        lotteryDate.setMonth(lotteryDate.getMonth() + 1);
        lotteryDate.setDate(1);
      }
      setTargetDate(lotteryDate.toISOString().split('T')[0]);
    }
  };

  // Copy helpers
  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(label);
    if (soundEnabled) playMysticChimeSound('coin');
    if (onShowToast) onShowToast(`คัดลอก ${label} เรียบร้อยแล้ว!`);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const copyAllSummary = () => {
    if (!luckyData) return;
    const text = `🐾 [The Cat Room] เลขมงคลส่วนบุคคล 🐾\n` +
      `ราศี: ${luckyData.zodiacSign} | ประจำวันที่: ${luckyData.date} (${luckyData.dayOfWeek})\n` +
      `ดาวเกษตรเจ้าเรือน: ${luckyData.rulingPlanet} (ธาตุ: ${luckyData.zodiacElement})\n` +
      `------------------------------------\n` +
      `🌟 เลขเด่นแกนหลัก: ${luckyData.corePrimeNumber}\n` +
      `🔢 เลขรองพลังงาน: ${luckyData.secondaryNumbers.join(', ')}\n` +
      `💎 ชุด 3 ตัวมงคล: ${luckyData.tripletNumbers.join(' • ')}\n` +
      `✨ คู่เลขทรงพลัง:\n${luckyData.luckyPairs.map(p => ` • ${p.pair}: ${p.categoryLabel} (${p.meaning})`).join('\n')}\n` +
      `⚠️ เลขควรระวังวันนี้: ${luckyData.cautionNumbers.join(', ')}\n` +
      `⏰ ฤกษ์เวลาทอง: ${luckyData.powerHours}\n` +
      `🧭 ทิศมงคล: ${luckyData.powerDirection}\n` +
      `🎨 สีมงคล: ${luckyData.cosmicColorVibe}\n` +
      `💬 แม่หมอลิลลี่ตบเรียกสติ: "${luckyData.bestieNumerologyRoast}"\n\n` +
      `🔮 ดูดวง 4 ศาสตร์และคำนวณเลขมงคลที่ The Cat Room`;

    copyToClipboard(text, 'ชุดเลขมงคลทั้งหมด');
  };

  // Save numbers to local history
  const handleSaveToLedger = () => {
    if (!luckyData) return;
    const newEntry = {
      id: `${Date.now()}`,
      date: luckyData.date,
      zodiac: luckyData.zodiacSign,
      core: luckyData.corePrimeNumber,
      pairs: luckyData.luckyPairs.map(p => p.pair),
      triplets: luckyData.tripletNumbers,
    };

    const updated = [newEntry, ...savedNumbersList.slice(0, 19)];
    setSavedNumbersList(updated);
    try {
      localStorage.setItem('thecatroom_saved_lucky_numbers', JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
    if (soundEnabled) playMysticChimeSound('gold');
    if (onShowToast) onShowToast('บันทึกชุดเลขลงในสมุดโชคลาภเรียบร้อยแล้ว!');
  };

  const handleDeleteSaved = (id: string) => {
    const updated = savedNumbersList.filter(item => item.id !== id);
    setSavedNumbersList(updated);
    try {
      localStorage.setItem('thecatroom_saved_lucky_numbers', JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
    if (soundEnabled) playMysticChimeSound('soft');
  };

  const activeZodiacObj = ZODIAC_SIGNS.find(z => z.name === selectedZodiac) || ZODIAC_SIGNS[0];

  return (
    <div id="lucky-number-generator-section" className="space-y-6">
      
      {/* Cross-Reading Fate Synchronicity Banner */}
      {readings && onOpenSynchronicityModal && (
        <FateSynchronicityBanner
          readings={readings}
          onOpenSynchronicityModal={onOpenSynchronicityModal}
          currentDisciplineName="โหราศาสตร์ตัวเลข & องศาดาวเคราะห์"
        />
      )}

      {/* Header & Controls Panel */}
      <div 
        className="rounded-3xl p-5 sm:p-7 border backdrop-blur-xl transition-all shadow-xl"
        style={{
          backgroundColor: 'var(--cat-container)',
          borderColor: 'var(--cat-border)',
        }}
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          
          {/* Title and Intro */}
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500/20 to-purple-600/30 text-amber-300 border border-amber-500/30 text-2xl shadow-inner">
                🔮
              </span>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                  <span>Lucky Number Generator</span>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-medium">
                    โหราศาสตร์ตัวเลข & องศาดาวเคราะห์
                  </span>
                </h2>
                <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                  คำนวณเลขมงคลส่วนบุคคลตามราศีเกิดและตำแหน่งองศาดาวเคราะห์ประจำวัน (Planetary Transits)
                </p>
              </div>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {onOpenLotteryVault && (
              <button
                id="view-lottery-stats-vault-btn"
                onClick={onOpenLotteryVault}
                className="flex items-center gap-1.5 rounded-xl border border-rose-500/40 bg-gradient-to-r from-rose-950/60 to-purple-950/60 px-3.5 py-2 text-xs font-semibold text-rose-200 hover:text-amber-200 hover:border-amber-400 transition-all cursor-pointer shadow-md"
              >
                <span>📊 สถิติหวยรัฐบาลไทย & คลังเลข</span>
              </button>
            )}

            <button
              id="view-saved-numbers-btn"
              onClick={() => setShowSavedModal(true)}
              className="flex items-center gap-1.5 rounded-xl border border-slate-700/80 bg-slate-900/80 px-3.5 py-2 text-xs font-semibold text-slate-300 hover:text-amber-300 hover:border-amber-500/40 transition-colors"
            >
              <BookmarkCheck className="h-4 w-4 text-amber-400" />
              <span>สมุดเลขที่บันทึก ({savedNumbersList.length})</span>
            </button>

            <button
              id="respin-lucky-numbers-btn"
              onClick={handleReSpin}
              disabled={isSpinning || isLoading}
              className="flex items-center gap-1.5 rounded-xl border border-amber-500/50 bg-gradient-to-r from-amber-500/20 to-purple-600/30 px-4 py-2 text-xs font-bold text-amber-200 hover:brightness-110 active:scale-95 transition-all shadow-md disabled:opacity-50"
            >
              <RotateCcw className={`h-4 w-4 ${isSpinning ? 'animate-spin' : ''}`} />
              <span>{isSpinning ? 'กำลังสับคลื่นดวงดาว...' : 'หมุนลูกแก้วคำนวณใหม่'}</span>
              <span className="flex items-center gap-0.5 rounded-full bg-amber-400/20 px-1.5 py-0.2 text-[10px] text-amber-300 font-normal border border-amber-400/30">
                🪙 5
              </span>
            </button>
          </div>
        </div>

        {/* Filter Controls: Zodiac, Date & Intention */}
        <div className="mt-6 pt-5 border-t border-slate-800/80 grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* Zodiac Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <span>เลือกราศีของคุณ</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded bg-slate-800 ${activeZodiacObj.elementColor}`}>
                ธาตุ{activeZodiacObj.element}
              </span>
            </label>
            <div className="relative">
              <select
                id="lucky-zodiac-select"
                value={selectedZodiac}
                onChange={(e) => {
                  if (soundEnabled) playMysticChimeSound('soft');
                  setSelectedZodiac(e.target.value);
                }}
                className="w-full appearance-none rounded-xl border border-slate-700/80 bg-slate-900/90 py-2.5 pl-3.5 pr-10 text-xs font-medium text-slate-200 focus:outline-none focus:ring-1 focus:ring-amber-500/50"
              >
                {ZODIAC_SIGNS.map((z) => (
                  <option key={z.name} value={z.name}>
                    {z.icon} {z.name} ({z.dates})
                  </option>
                ))}
              </select>
              <Compass className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            </div>
          </div>

          {/* Target Date Picker & Quick Buttons */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1">
                <CalendarIcon className="h-3.5 w-3.5 text-amber-400" />
                <span>วันที่ต้องการใช้ตัวเลข</span>
              </label>
              <div className="flex items-center gap-1 text-[10px]">
                <button
                  type="button"
                  onClick={() => handleSetQuickDate('today')}
                  className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 hover:text-amber-300 transition-colors"
                >
                  วันนี้
                </button>
                <button
                  type="button"
                  onClick={() => handleSetQuickDate('tomorrow')}
                  className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 hover:text-amber-300 transition-colors"
                >
                  พรุ่งนี้
                </button>
                <button
                  type="button"
                  onClick={() => handleSetQuickDate('lottery')}
                  className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 transition-colors"
                >
                  วันหวยออก
                </button>
              </div>
            </div>
            <input
              type="date"
              id="lucky-date-picker"
              value={targetDate}
              onChange={(e) => {
                if (soundEnabled) playMysticChimeSound('soft');
                setTargetDate(e.target.value);
              }}
              className="w-full rounded-xl border border-slate-700/80 bg-slate-900/90 py-2 px-3 text-xs font-medium text-slate-200 focus:outline-none focus:ring-1 focus:ring-amber-500/50"
            />
          </div>

          {/* Intention Segment */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">
              เป้าหมายที่ต้องการส่งเสริม
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              {INTENTIONS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    if (soundEnabled) playMysticChimeSound('soft');
                    setSelectedIntention(item.id);
                  }}
                  className={`flex items-center gap-1.5 rounded-xl border p-2 text-left transition-all ${
                    selectedIntention === item.id
                      ? 'border-amber-500/50 bg-amber-500/15 text-amber-200 shadow-sm'
                      : 'border-slate-800 bg-slate-900/50 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span className="text-sm">{item.icon}</span>
                  <div className="truncate">
                    <div className="text-[11px] font-bold leading-tight truncate">{item.label}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* Main Numbers Display Section */}
      {isLoading ? (
        <div className="py-24 flex flex-col items-center justify-center space-y-4">
          <div className="relative">
            <div className="h-16 w-16 rounded-full border-4 border-amber-500/20 border-t-amber-400 animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center text-xl">
              ✨
            </div>
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold text-amber-200">
              กำลังประสานคลื่นดวงดาวและคำนวณตำแหน่งองศาดาวเคราะห์ส่วนบุคคล...
            </p>
            <p className="text-xs text-slate-400 mt-1">
              คำนวณตามหลักเวทโหราศาสตร์ & รหัสดาวเกษตรเจ้าเรือน
            </p>
          </div>
        </div>
      ) : luckyData ? (
        <div className="space-y-6">

          {/* Top Cosmic Highlight Card: Prime Core Number & Master Triplets */}
          <div 
            className="rounded-3xl p-6 sm:p-8 border backdrop-blur-xl relative overflow-hidden transition-all shadow-2xl"
            style={{
              backgroundColor: 'var(--cat-container-highest)',
              borderColor: 'var(--cat-border)',
            }}
          >
            {/* Ambient Background Aura */}
            <div className="pointer-events-none absolute -top-20 -right-20 h-64 w-64 rounded-full bg-amber-500/15 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-purple-600/15 blur-3xl" />

            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              
              {/* Left Column: Huge Prime Core Number Orb */}
              <div className="lg:col-span-5 flex flex-col items-center justify-center text-center p-6 rounded-2xl bg-gradient-to-b from-slate-900/90 to-slate-950/90 border border-amber-500/30 shadow-inner">
                <span className="text-[11px] font-bold text-amber-300 uppercase tracking-widest flex items-center gap-1.5 mb-2">
                  <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                  <span>เลขเด่นแกนหลัก (Prime Core Key)</span>
                </span>

                <motion.div
                  key={`core-${luckyData.corePrimeNumber}-${isSpinning}`}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                  className="relative my-2 flex items-center justify-center"
                >
                  <div className="h-28 w-28 sm:h-32 sm:w-32 rounded-3xl bg-gradient-to-br from-amber-400 via-amber-500 to-purple-600 p-[2px] shadow-xl shadow-amber-500/20">
                    <div className="h-full w-full rounded-[22px] bg-slate-950 flex flex-col items-center justify-center">
                      <span className="text-6xl sm:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-b from-amber-200 via-amber-400 to-amber-500">
                        {luckyData.corePrimeNumber}
                      </span>
                    </div>
                  </div>
                  <div className="absolute -inset-2 rounded-3xl bg-amber-400/20 blur-xl -z-10 pointer-events-none" />
                </motion.div>

                <div className="mt-2 text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                  <span>พลังดาวเกษตร:</span>
                  <span className="text-amber-300 font-bold">{luckyData.rulingPlanet}</span>
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  ธาตุ{luckyData.zodiacElement} • ประจำ{luckyData.dayOfWeek}
                </div>

                {/* Secondary Digits Underneath */}
                <div className="mt-4 pt-3 border-t border-slate-800/80 w-full flex items-center justify-center gap-3">
                  <span className="text-[10px] font-bold text-slate-400">เลขรองเสริมโชค:</span>
                  <div className="flex gap-2">
                    {luckyData.secondaryNumbers.map((num, idx) => (
                      <span
                        key={`sec-${idx}`}
                        className="h-7 w-7 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-black text-purple-300 shadow-sm"
                      >
                        {num}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column: Triplets & Planetary Synergy Bento */}
              <div className="lg:col-span-7 space-y-4">
                
                {/* 3-Digit Master Combinations */}
                <div className="rounded-2xl bg-slate-900/80 border border-slate-800/80 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                      <Zap className="h-4 w-4" />
                      <span>ชุด 3 ตัวมงคลมหาจักรพรรดิ (Cosmic Triplets)</span>
                    </div>
                    <span className="text-[10px] text-slate-400">
                      คลิกเพื่อคัดลอก
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2.5">
                    {luckyData.tripletNumbers.map((trip, idx) => (
                      <motion.button
                        key={`trip-${idx}`}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => copyToClipboard(trip, `ชุดเลข 3 ตัว ${trip}`)}
                        className="relative group rounded-xl bg-gradient-to-b from-slate-800/90 to-slate-950 border border-slate-700 hover:border-amber-400/60 p-3 text-center transition-all shadow-md"
                      >
                        <span className="block text-xl sm:text-2xl font-black text-amber-200 tracking-wider">
                          {trip}
                        </span>
                        <span className="text-[9px] text-slate-400 group-hover:text-amber-300 flex items-center justify-center gap-1 mt-0.5">
                          <Copy className="h-2.5 w-2.5" />
                          <span>{copiedKey === `ชุดเลข 3 ตัว ${trip}` ? 'คัดลอกแล้ว' : 'คัดลอก'}</span>
                        </span>
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Auspicious Alignment Meta: Direction, Hours, Color */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  
                  {/* Power Hours */}
                  <div className="rounded-2xl bg-slate-900/60 border border-slate-800/80 p-3.5">
                    <div className="text-[11px] font-bold text-emerald-400 flex items-center gap-1.5 mb-1">
                      <Clock className="h-3.5 w-3.5" />
                      <span>ฤกษ์เวลาทอง</span>
                    </div>
                    <div className="text-xs font-bold text-slate-100">
                      {luckyData.powerHours}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">ช่วงพลังงานหนุนส่ง</div>
                  </div>

                  {/* Power Direction */}
                  <div className="rounded-2xl bg-slate-900/60 border border-slate-800/80 p-3.5">
                    <div className="text-[11px] font-bold text-amber-400 flex items-center gap-1.5 mb-1">
                      <Compass className="h-3.5 w-3.5" />
                      <span>ทิศมงคลรับทรัพย์</span>
                    </div>
                    <div className="text-xs font-bold text-slate-100 truncate">
                      {luckyData.powerDirection}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">หันหน้ารับคลื่นดวง</div>
                  </div>

                  {/* Lucky Color Vibe */}
                  <div className="rounded-2xl bg-slate-900/60 border border-slate-800/80 p-3.5">
                    <div className="text-[11px] font-bold text-pink-400 flex items-center gap-1.5 mb-1">
                      <Sparkles className="h-3.5 w-3.5" />
                      <span>สีเสริมออร่า</span>
                    </div>
                    <div className="text-xs font-bold text-slate-100 truncate">
                      {luckyData.cosmicColorVibe}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">เสริมคลื่นแรงดึงดูด</div>
                  </div>

                </div>

                {/* Caution Numbers Warning */}
                <div className="rounded-2xl bg-rose-950/20 border border-rose-900/40 p-3.5 flex items-start gap-3">
                  <div className="rounded-xl bg-rose-500/20 p-2 text-rose-300 border border-rose-500/30">
                    <ShieldAlert className="h-4 w-4" />
                  </div>
                  <div className="text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-rose-300">เลขอริที่ควรเลี่ยงในวันนี้:</span>
                      <span className="font-mono font-black text-rose-200 bg-rose-500/30 px-2 py-0.5 rounded-lg">
                        {luckyData.cautionNumbers.join(', ')}
                      </span>
                    </div>
                    <p className="text-slate-300/80 mt-1 leading-relaxed text-[11px]">
                      {luckyData.cautionReason}
                    </p>
                  </div>
                </div>

              </div>
            </div>

            {/* Bottom Sassy Roast & Action Bar */}
            <div className="mt-6 pt-5 border-t border-slate-800/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-2.5 text-xs text-slate-300">
                <span className="text-lg">💅</span>
                <span className="italic text-slate-400">
                  แม่หมอลิลลี่กระซิบ: <strong className="text-amber-200">"{luckyData.bestieNumerologyRoast}"</strong>
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  id="save-lucky-numbers-btn"
                  onClick={handleSaveToLedger}
                  className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800/90 px-3.5 py-2 text-xs font-semibold text-slate-200 hover:text-white hover:bg-slate-700 transition-all active:scale-95"
                >
                  <BookmarkCheck className="h-3.5 w-3.5 text-amber-400" />
                  <span>บันทึกชุดเลขนี้</span>
                </button>

                <button
                  id="copy-all-numbers-btn"
                  onClick={copyAllSummary}
                  className="flex items-center gap-1.5 rounded-xl border border-amber-500/40 bg-gradient-to-r from-amber-500/20 to-purple-600/30 px-4 py-2 text-xs font-bold text-amber-200 hover:brightness-110 active:scale-95 transition-all shadow-md"
                >
                  <Share2 className="h-3.5 w-3.5" />
                  <span>{copiedKey === 'ชุดเลขมงคลทั้งหมด' ? 'คัดลอกสำเร็จแล้ว!' : 'คัดลอกสรุปทั้งหมด'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Lucky Pairs Breakdown Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                <Coins className="h-4 w-4 text-amber-400" />
                <span>คู่เลขมงคลเฉพาะทาง (Cosmic Harmonic Pairs)</span>
              </h3>
              <span className="text-xs text-slate-400">
                คำนวณตามหลักดวงดาวคู่มิตร & ศุภเคราะห์
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
              {luckyData.luckyPairs.map((pairItem, pIdx) => {
                let catBadge = {
                  bg: 'bg-amber-500/15 border-amber-500/30 text-amber-300',
                  icon: <Coins className="h-3.5 w-3.5" />,
                };
                if (pairItem.category === 'love') {
                  catBadge = {
                    bg: 'bg-pink-500/15 border-pink-500/30 text-pink-300',
                    icon: <Heart className="h-3.5 w-3.5" />,
                  };
                } else if (pairItem.category === 'work') {
                  catBadge = {
                    bg: 'bg-cyan-500/15 border-cyan-500/30 text-cyan-300',
                    icon: <Briefcase className="h-3.5 w-3.5" />,
                  };
                } else if (pairItem.category === 'protection') {
                  catBadge = {
                    bg: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300',
                    icon: <ShieldAlert className="h-3.5 w-3.5" />,
                  };
                }

                return (
                  <motion.div
                    key={`pair-${pIdx}`}
                    whileHover={{ scale: 1.02 }}
                    className="rounded-2xl border p-4 transition-all relative overflow-hidden group shadow-lg flex flex-col justify-between"
                    style={{
                      backgroundColor: 'var(--cat-container)',
                      borderColor: 'var(--cat-border)',
                    }}
                  >
                    <div>
                      {/* Top: Category Tag & Luck Score */}
                      <div className="flex items-center justify-between mb-3">
                        <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[10px] font-bold border ${catBadge.bg}`}>
                          {catBadge.icon}
                          <span>{pairItem.categoryLabel}</span>
                        </span>
                        <div className="flex items-center gap-1 text-[11px] font-extrabold text-amber-300 bg-slate-900/80 px-2 py-0.5 rounded-lg border border-slate-800">
                          <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                          <span>{pairItem.luckScore}%</span>
                        </div>
                      </div>

                      {/* Number Pair */}
                      <div className="flex items-baseline justify-between mb-2">
                        <span className="text-3xl font-black text-amber-200 tracking-wider">
                          {pairItem.pair}
                        </span>
                        <button
                          onClick={() => copyToClipboard(pairItem.pair, `คู่เลข ${pairItem.pair}`)}
                          className="text-[10px] text-slate-400 hover:text-amber-300 flex items-center gap-1 p-1"
                        >
                          <Copy className="h-3 w-3" />
                          <span>{copiedKey === `คู่เลข ${pairItem.pair}` ? 'คัดลอกแล้ว' : 'คัดลอก'}</span>
                        </button>
                      </div>

                      <p className="text-xs text-slate-200 leading-relaxed font-medium">
                        {pairItem.meaning}
                      </p>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-slate-800/80 text-[10px] text-purple-300 font-medium flex items-center gap-1">
                      <span>องศาดาว:</span>
                      <span className="text-slate-300">{pairItem.planetarySynergy}</span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Current Planetary Transits & Aspects Bento */}
          <div 
            className="rounded-3xl p-5 sm:p-6 border backdrop-blur-xl transition-all shadow-xl"
            style={{
              backgroundColor: 'var(--cat-container)',
              borderColor: 'var(--cat-border)',
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Globe className="h-4 w-4 text-purple-400" />
                  <span>ตำแหน่งองศาดาวเคราะห์ประจำวัน (Planetary Transits & Aspects)</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  มุมสัมพันธภาพของดาวจรกับราศี {luckyData.zodiacSign} ที่ใช้ในการคำนวณคลื่นความถี่ตัวเลข
                </p>
              </div>
              <span className="hidden sm:inline text-xs text-amber-300/80 font-mono">
                {luckyData.date}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {luckyData.planetaryPositions.map((planetItem, pIdx) => (
                <div
                  key={`planet-${pIdx}`}
                  className="rounded-2xl bg-slate-900/70 border border-slate-800/80 p-3.5 flex items-start gap-3"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/30 text-lg font-bold">
                    {planetItem.symbol}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-white truncate">
                        {planetItem.planet}
                      </h4>
                      <span className="font-mono text-[10px] text-amber-300 font-bold">
                        {planetItem.degree}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      สถิต: <span className="text-slate-200">{planetItem.sign}</span> (ธาตุ{planetItem.element})
                    </div>
                    <p className="text-[10px] text-purple-200/80 mt-1 line-clamp-1">
                      {planetItem.aspectToSign}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Daily Cosmic Advice Note */}
            <div className="mt-4 pt-4 border-t border-slate-800/80 flex items-start gap-3 text-xs text-slate-300 bg-slate-900/40 p-3.5 rounded-2xl">
              <Info className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
              <div className="leading-relaxed">
                <span className="font-bold text-amber-300 mr-1">ข้อแนะนำเชิงโหราศาสตร์:</span>
                {luckyData.dailyCosmicAdvice}
                <div className="mt-1.5 text-purple-300 font-medium">
                  🎯 คำแนะนำในการปฏิบัติ: {luckyData.suggestedAction}
                </div>
              </div>
            </div>
          </div>

          {/* Quick Jump Links to Other Disciplines */}
          {onSwitchDiscipline && (
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                onClick={() => onSwitchDiscipline('calendar')}
                className="flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-2 text-xs font-semibold text-slate-300 hover:text-amber-300 hover:border-amber-500/40 transition-colors"
              >
                <CalendarIcon className="h-3.5 w-3.5" />
                <span>ไปเช็คปฏิทินฤกษ์มงคลรายเดือน</span>
              </button>
              <button
                onClick={() => onSwitchDiscipline('daily')}
                className="flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-2 text-xs font-semibold text-slate-300 hover:text-amber-300 hover:border-amber-500/40 transition-colors"
              >
                <span>🐾 ไปจั่วไพ่ Daily Purr ประจำวัน</span>
              </button>
            </div>
          )}

        </div>
      ) : null}

      {/* Saved Numbers Ledger Modal */}
      <AnimatePresence>
        {showSavedModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-3xl border p-6 shadow-2xl transition-all"
              style={{
                backgroundColor: 'var(--cat-container)',
                borderColor: 'var(--cat-border)',
                color: 'var(--cat-cream)',
              }}
            >
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <BookmarkCheck className="h-5 w-5 text-amber-400" />
                  <h3 className="text-base font-bold text-white">
                    สมุดบันทึกเลขมงคลส่วนบุคคล
                  </h3>
                </div>
                <button
                  onClick={() => setShowSavedModal(false)}
                  className="rounded-full p-1.5 text-slate-400 hover:text-white hover:bg-slate-800"
                >
                  ✕
                </button>
              </div>

              {savedNumbersList.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-400">
                  <p>ยังไม่มีชุดเลขมงคลที่บันทึกไว้</p>
                  <p className="mt-1">กดปุ่ม "บันทึกชุดเลขนี้" เพื่อเก็บเลขโปรดของคุณ</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {savedNumbersList.map((entry) => (
                    <div
                      key={entry.id}
                      className="rounded-2xl bg-slate-900/80 border border-slate-800 p-3.5 flex items-center justify-between gap-3"
                    >
                      <div>
                        <div className="flex items-center gap-2 text-[10px] text-slate-400">
                          <span>{entry.date}</span>
                          <span>•</span>
                          <span className="text-amber-300 font-semibold">{entry.zodiac}</span>
                        </div>
                        <div className="flex items-center gap-3 mt-1.5">
                          <span className="text-xl font-black text-amber-200 bg-amber-500/20 border border-amber-500/30 px-2.5 py-0.5 rounded-lg">
                            {entry.core}
                          </span>
                          <span className="text-xs text-purple-300 font-mono">
                            {entry.pairs.join(', ')}
                          </span>
                          <span className="text-xs text-slate-300 font-mono">
                            ({entry.triplets.join(' • ')})
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleDeleteSaved(entry.id)}
                        className="rounded-lg p-2 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                        title="ลบรายการ"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-6 pt-3 border-t border-slate-800 flex justify-end">
                <button
                  onClick={() => setShowSavedModal(false)}
                  className="rounded-xl bg-slate-800 px-4 py-2 text-xs font-bold text-slate-200 hover:bg-slate-700 transition-colors"
                >
                  ปิดหน้าต่าง
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
