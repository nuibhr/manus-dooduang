import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Moon,
  Sun,
  AlertTriangle,
  Flame,
  Clock,
  Compass,
  CheckCircle2,
  XCircle,
  Share2,
  RotateCcw,
  Zap,
  Info,
  X
} from 'lucide-react';
import { MonthlyAstrologyData, AstrologyDayData, MajorAstrologyEvent, SassLevel, DisciplineType } from '../types';
import { useMood } from '../context/MoodContext';
import { playMysticChimeSound } from '../utils/speechHelper';

interface MonthlyAstrologyCalendarProps {
  sassLevel?: SassLevel;
  onSwitchDiscipline?: (discipline: DisciplineType) => void;
  onShowToast?: (msg: string) => void;
  soundEnabled?: boolean;
  onOpenMonthlyForecast?: () => void;
}

const ZODIAC_OPTIONS = [
  { id: 'general', name: 'ภาพรวมทุกราศี (General)' },
  { id: 'aries', name: 'ราศีเมษ (Aries)' },
  { id: 'taurus', name: 'ราศีพฤษภ (Taurus)' },
  { id: 'gemini', name: 'ราศีเมถุน (Gemini)' },
  { id: 'cancer', name: 'ราศีกรกฎ (Cancer)' },
  { id: 'leo', name: 'ราศีสิงห์ (Leo)' },
  { id: 'virgo', name: 'ราศีกันย์ (Virgo)' },
  { id: 'libra', name: 'ราศีตุลย์ (Libra)' },
  { id: 'scorpio', name: 'ราศีพิจิก (Scorpio)' },
  { id: 'sagittarius', name: 'ราศีธนู (Sagittarius)' },
  { id: 'capricorn', name: 'ราศีมังกร (Capricorn)' },
  { id: 'aquarius', name: 'ราศีกุมภ์ (Aquarius)' },
  { id: 'pisces', name: 'ราศีมีน (Pisces)' },
];

const WEEKDAY_NAMES = [
  { th: 'อา.', en: 'Sun', color: 'text-rose-400' },
  { th: 'จ.', en: 'Mon', color: 'text-amber-200' },
  { th: 'อ.', en: 'Tue', color: 'text-pink-400' },
  { th: 'พ.', en: 'Wed', color: 'text-emerald-400' },
  { th: 'พฤ.', en: 'Thu', color: 'text-amber-400' },
  { th: 'ศ.', en: 'Fri', color: 'text-cyan-400' },
  { th: 'ส.', en: 'Sat', color: 'text-purple-400' },
];

export const MonthlyAstrologyCalendar: React.FC<MonthlyAstrologyCalendarProps> = ({
  sassLevel = 'spicy',
  onSwitchDiscipline,
  onShowToast,
  soundEnabled = true,
  onOpenMonthlyForecast,
}) => {
  const { currentMood } = useMood();
  
  // Date State - defaulting to current year and month (or September 2026 per sandbox clock)
  const now = new Date();
  const [currentYear, setCurrentYear] = useState<number>(now.getFullYear());
  const [currentMonth, setCurrentMonth] = useState<number>(now.getMonth() + 1); // 1-12
  const [selectedZodiac, setSelectedZodiac] = useState<string>('ภาพรวมทุกราศี (General)');
  const [activeFilter, setActiveFilter] = useState<'all' | 'auspicious' | 'events' | 'caution'>('all');
  
  // Data & Loading state
  const [calendarData, setCalendarData] = useState<MonthlyAstrologyData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [selectedDay, setSelectedDay] = useState<AstrologyDayData | null>(null);
  const [activeEventModal, setActiveEventModal] = useState<MajorAstrologyEvent | null>(null);

  // Fetch Monthly Data from AI endpoint
  const fetchMonthlyAstrology = async (year: number, month: number, zodiac: string, isManualRefresh = false) => {
    if (isManualRefresh) setIsRefreshing(true);
    else setIsLoading(true);

    try {
      const response = await fetch('/api/gemini/monthly-astrology', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          year,
          month,
          zodiac,
          sassyLevel: sassLevel,
        }),
      });

      if (!response.ok) {
        throw new Error('Network error fetching astrology calendar');
      }

      const resJson = await response.json();
      if (resJson?.data) {
        setCalendarData(resJson.data);
      }
    } catch (err) {
      console.error('[Calendar Error]:', err);
      if (onShowToast) onShowToast('เกิดข้อขัดข้องในการดึงข้อมูล กำลังใช้ปฏิทินคำนวณฐานดวงดาว');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchMonthlyAstrology(currentYear, currentMonth, selectedZodiac);
  }, [currentYear, currentMonth, selectedZodiac]);

  // Navigation handlers
  const handlePrevMonth = () => {
    if (soundEnabled) playMysticChimeSound('soft');
    if (currentMonth === 1) {
      setCurrentMonth(12);
      setCurrentYear((prev) => prev - 1);
    } else {
      setCurrentMonth((prev) => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (soundEnabled) playMysticChimeSound('soft');
    if (currentMonth === 12) {
      setCurrentMonth(1);
      setCurrentYear((prev) => prev + 1);
    } else {
      setCurrentMonth((prev) => prev + 1);
    }
  };

  const handleCurrentMonth = () => {
    if (soundEnabled) playMysticChimeSound('coin');
    const today = new Date();
    setCurrentYear(today.getFullYear());
    setCurrentMonth(today.getMonth() + 1);
  };

  // Day selection
  const handleSelectDay = (day: AstrologyDayData) => {
    if (soundEnabled) {
      if (day.type === 'auspicious') playMysticChimeSound('gold');
      else if (day.type === 'astrology_event') playMysticChimeSound('iching');
      else playMysticChimeSound('soft');
    }
    setSelectedDay(day);
  };

  // Copy shareable auspicious message
  const handleShareDay = (day: AstrologyDayData) => {
    if (!calendarData) return;
    const shareText = `✨ ฤกษ์มงคลประจำวันที่ ${day.day} ${calendarData.monthNameTh} ✨\n` +
      `สถานะ: ${day.badge} (${day.title})\n` +
      `🌟 พลังงาน: ${day.energyScore}%\n` +
      `⏰ ฤกษ์เวลาทอง: ${day.luckyHours}\n` +
      `🍀 สีมงคล: ${day.luckyColor}\n` +
      `✅ สิ่งที่ควรทำ: ${day.auspiciousFor.join(', ')}\n` +
      `❌ สิ่งที่ควรระวัง: ${day.avoidFor.join(', ')}\n\n` +
      `🔮 ดูดวงและเช็คปฏิทินที่ The Cat Room`;

    navigator.clipboard.writeText(shareText);
    if (onShowToast) onShowToast('คัดลอกรายละเอียดฤกษ์มงคลเรียบร้อยแล้ว!');
    if (soundEnabled) playMysticChimeSound('coin');
  };

  // Calculate Calendar Grid with leading blank cells
  const calendarGrid = useMemo(() => {
    if (!calendarData || !calendarData.days || calendarData.days.length === 0) {
      return { blankLeading: [] as unknown[], days: [] as AstrologyDayData[] };
    }

    const firstDayOfWeek = calendarData.days[0].dayOfWeek; // 0 (Sun) to 6 (Sat)
    const blankCellsCount = firstDayOfWeek;

    return {
      blankLeading: Array.from({ length: blankCellsCount }),
      days: calendarData.days,
    };
  }, [calendarData]);

  // Check if date is today
  const isDateToday = (dayNum: number) => {
    const today = new Date();
    return (
      today.getFullYear() === currentYear &&
      today.getMonth() + 1 === currentMonth &&
      today.getDate() === dayNum
    );
  };

  // Filtered day count
  const filteredDays = useMemo(() => {
    if (!calendarData) return [];
    if (activeFilter === 'all') return calendarData.days;
    if (activeFilter === 'auspicious') return calendarData.days.filter((d) => d.type === 'auspicious');
    if (activeFilter === 'events') return calendarData.days.filter((d) => d.type === 'astrology_event');
    if (activeFilter === 'caution') return calendarData.days.filter((d) => d.type === 'inauspicious');
    return calendarData.days;
  }, [calendarData, activeFilter]);

  return (
    <div id="monthly-astrology-calendar-section" className="space-y-6">
      
      {/* Header & Controls Panel */}
      <div 
        className="rounded-3xl p-5 sm:p-7 border backdrop-blur-xl transition-all shadow-xl"
        style={{
          backgroundColor: 'var(--cat-container)',
          borderColor: 'var(--cat-border)',
        }}
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          
          {/* Title and Subtitle */}
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xl shadow-inner">
                📅
              </span>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                  <span>ปฏิทินโหราศาสตร์ & ฤกษ์มงคล</span>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 font-medium">
                    AI Powered 4 ศาสตร์
                  </span>
                </h2>
                <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                  เช็ควันดีวันร้าย ฤกษ์ธงชัย จันทร์เพ็ญ จันทร์ดับ และปรากฏการณ์ดวงดาวรายเดือน
                </p>
              </div>
            </div>
          </div>

          {/* Month Navigation & Zodiac selector */}
          <div className="flex flex-wrap items-center gap-2.5">
            
            {/* Zodiac Selector */}
            <div className="relative">
              <select
                id="zodiac-filter-select"
                value={selectedZodiac}
                onChange={(e) => setSelectedZodiac(e.target.value)}
                className="appearance-none rounded-xl border border-slate-700/80 bg-slate-900/90 py-2 pl-3 pr-8 text-xs font-medium text-slate-200 focus:outline-none focus:ring-1 focus:ring-amber-500/50"
              >
                {ZODIAC_OPTIONS.map((z) => (
                  <option key={z.id} value={z.name}>
                    {z.name}
                  </option>
                ))}
              </select>
              <Compass className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            </div>

            {/* Quick Jump to Today */}
            <button
              id="jump-today-btn"
              onClick={handleCurrentMonth}
              className="rounded-xl border border-slate-700/80 bg-slate-900/80 px-3 py-2 text-xs font-semibold text-slate-300 hover:text-amber-300 hover:border-amber-500/40 transition-colors"
            >
              เดือนปัจจุบัน
            </button>

            {/* Prev / Next Month Buttons */}
            <div className="flex items-center rounded-xl border border-slate-700/80 bg-slate-900/90 p-1">
              <button
                id="prev-month-btn"
                onClick={handlePrevMonth}
                aria-label="Previous Month"
                className="rounded-lg p-1.5 text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              
              <div className="px-3 text-xs sm:text-sm font-bold text-amber-200 min-w-[120px] text-center">
                {calendarData ? calendarData.monthNameTh : `เดือนที่ ${currentMonth} / ${currentYear}`}
              </div>

              <button
                id="next-month-btn"
                onClick={handleNextMonth}
                aria-label="Next Month"
                className="rounded-lg p-1.5 text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            {/* Refresh / Re-analyze with AI */}
            <button
              id="refresh-calendar-btn"
              onClick={() => fetchMonthlyAstrology(currentYear, currentMonth, selectedZodiac, true)}
              disabled={isRefreshing || isLoading}
              className="flex items-center gap-1.5 rounded-xl border border-amber-500/40 bg-gradient-to-r from-amber-500/20 to-purple-600/20 px-3 py-2 text-xs font-semibold text-amber-200 hover:brightness-110 active:scale-95 transition-all disabled:opacity-50"
              title="ดึงข้อมูลคำนวณดวงดาวใหม่ด้วย AI"
            >
              <RotateCcw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">อัปเดตดวง AI</span>
            </button>

            {/* Open Monthly Astrology Forecast 4 Disciplines */}
            {onOpenMonthlyForecast && (
              <button
                id="btn-calendar-monthly-forecast"
                onClick={onOpenMonthlyForecast}
                className="flex items-center gap-1.5 rounded-xl border border-[#EAC272]/50 bg-gradient-to-r from-[#842C71] to-[#3D1452] px-3.5 py-2 text-xs font-bold text-[#FAE9CA] hover:border-[#EAC272] hover:scale-105 active:scale-95 transition-all shadow-md shadow-purple-950/40"
                title="วิเคราะห์สรุป 4 ศาสตร์ประจำเดือน & ส่งออกรูปภาพ"
              >
                <span>🌟 สรุป 4 ศาสตร์ & แชร์รูป</span>
              </button>
            )}
          </div>
        </div>

        {/* Month Overview Banner & Sassy Advice */}
        {calendarData && (
          <div className="mt-6 pt-5 border-t border-slate-800/80 grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Theme & Element */}
            <div className="rounded-2xl bg-slate-900/60 border border-slate-800/70 p-4">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-400 mb-1">
                <Sparkles className="h-3.5 w-3.5" />
                <span>ธีมดาวประจำเดือน</span>
              </div>
              <h3 className="text-sm font-semibold text-white">
                {calendarData.monthTheme}
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                <span className="text-slate-300 font-medium">ธาตุเด่น:</span> {calendarData.elementFocus}
              </p>
            </div>

            {/* Quick Stat Highlights */}
            <div className="rounded-2xl bg-slate-900/60 border border-slate-800/70 p-4 flex flex-col justify-between">
              <div className="text-xs font-bold text-purple-400 mb-2 flex items-center gap-1.5">
                <Zap className="h-3.5 w-3.5" />
                <span>สถิติกำหนดการเดือนนี้</span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="rounded-xl bg-amber-500/10 border border-amber-500/20 py-1.5">
                  <div className="text-base font-extrabold text-amber-300">
                    {calendarData.energyOverview.auspiciousDaysCount}
                  </div>
                  <div className="text-[10px] text-amber-200/80">วันฤกษ์ดี</div>
                </div>
                <div className="rounded-xl bg-purple-500/10 border border-purple-500/20 py-1.5">
                  <div className="text-base font-extrabold text-purple-300">
                    {calendarData.energyOverview.eventDaysCount}
                  </div>
                  <div className="text-[10px] text-purple-200/80">อีเวนต์ดาว</div>
                </div>
                <div className="rounded-xl bg-rose-500/10 border border-rose-500/20 py-1.5">
                  <div className="text-base font-extrabold text-rose-300">
                    {calendarData.energyOverview.cautionDaysCount}
                  </div>
                  <div className="text-[10px] text-rose-200/80">วันระวังภัย</div>
                </div>
              </div>
            </div>

            {/* Sassy Roast from Lilly */}
            <div className="rounded-2xl bg-gradient-to-br from-pink-950/20 to-purple-950/30 border border-pink-900/30 p-4">
              <div className="flex items-center gap-1.5 text-xs font-bold text-pink-400 mb-1">
                <span>💅 แม่หมอลิลลี่ตบเรียกสติ:</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed italic">
                "{calendarData.sassyMonthlyRoast}"
              </p>
              <div className="mt-2 flex items-center justify-between text-[11px] text-pink-300/80">
                <span>ดัชนีพลังงานเฉลี่ย:</span>
                <span className="font-bold text-amber-300">{calendarData.energyOverview.averageScore}%</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Major Monthly Astrology Events Bento */}
      {calendarData && calendarData.majorEvents && calendarData.majorEvents.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <Moon className="h-4 w-4 text-purple-400" />
              <span>อีเวนต์ดาราศาสตร์ & โหราศาสตร์สำคัญประจำเดือน</span>
            </h3>
            <span className="text-xs text-slate-400">คลิกที่การ์ดเพื่อดูรายละเอียด</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {calendarData.majorEvents.map((event, idx) => (
              <motion.div
                key={`major-event-${idx}`}
                whileHover={{ scale: 1.02 }}
                onClick={() => {
                  if (soundEnabled) playMysticChimeSound('soft');
                  setActiveEventModal(event);
                }}
                className="cursor-pointer rounded-2xl border p-4 transition-all relative overflow-hidden group shadow-lg"
                style={{
                  backgroundColor: 'var(--cat-container-highest)',
                  borderColor: 'var(--cat-border)',
                }}
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-purple-500/10 to-transparent pointer-events-none rounded-bl-full" />
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl">{event.icon}</span>
                  <span className="rounded-lg bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 text-[10px] font-bold text-amber-300">
                    วันที่ {event.day}
                  </span>
                </div>
                <div className="text-[11px] font-medium text-purple-300 mb-0.5">{event.tag}</div>
                <h4 className="text-xs font-bold text-white group-hover:text-amber-300 transition-colors line-clamp-1">
                  {event.title}
                </h4>
                <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                  {event.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Calendar Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-900/80 border border-slate-800">
          <button
            id="filter-all-btn"
            onClick={() => setActiveFilter('all')}
            className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all ${
              activeFilter === 'all'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            ทั้งหมด (30 วัน)
          </button>
          <button
            id="filter-auspicious-btn"
            onClick={() => setActiveFilter('auspicious')}
            className={`flex items-center gap-1 rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all ${
              activeFilter === 'auspicious'
                ? 'bg-amber-500/30 text-amber-200 border border-amber-500/40 shadow-md'
                : 'text-slate-400 hover:text-amber-300'
            }`}
          >
            <span>🌟 วันฤกษ์มงคล</span>
          </button>
          <button
            id="filter-events-btn"
            onClick={() => setActiveFilter('events')}
            className={`flex items-center gap-1 rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all ${
              activeFilter === 'events'
                ? 'bg-purple-500/30 text-purple-200 border border-purple-500/40 shadow-md'
                : 'text-slate-400 hover:text-purple-300'
            }`}
          >
            <span>🌕 อีเวนต์จันทร์/ดาว</span>
          </button>
          <button
            id="filter-caution-btn"
            onClick={() => setActiveFilter('caution')}
            className={`flex items-center gap-1 rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all ${
              activeFilter === 'caution'
                ? 'bg-rose-500/30 text-rose-200 border border-rose-500/40 shadow-md'
                : 'text-slate-400 hover:text-rose-300'
            }`}
          >
            <span>⚠️ วันควรระวัง</span>
          </button>
        </div>

        {/* Legend */}
        <div className="hidden sm:flex items-center gap-3 text-[11px] text-slate-400">
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-amber-400" /> วันมงคล
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-purple-400" /> อีเวนต์ดาว
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-rose-400" /> ควรระวัง
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-slate-500" /> ทั่วไป
          </span>
        </div>
      </div>

      {/* Main Calendar Grid */}
      <div 
        className="rounded-3xl p-4 sm:p-6 border backdrop-blur-xl transition-all shadow-2xl relative overflow-hidden"
        style={{
          backgroundColor: 'var(--cat-container)',
          borderColor: 'var(--cat-border)',
        }}
      >
        {isLoading ? (
          <div className="py-24 flex flex-col items-center justify-center space-y-4">
            <div className="relative">
              <div className="h-16 w-16 rounded-full border-4 border-amber-500/20 border-t-amber-400 animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center text-xl">
                🔮
              </div>
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold text-amber-200">
                แม่หมอลิลลี่กำลังคำนวณตำแหน่งดวงดาวและถอดรหัสฤกษ์มงคล...
              </p>
              <p className="text-xs text-slate-400 mt-1">
                ผสานโหราศาสตร์ไทย จีน ปาจื่อ และปฏิทินจันทรคติ
              </p>
            </div>
          </div>
        ) : (
          <div>
            {/* Weekday Names Header */}
            <div className="grid grid-cols-7 gap-1.5 sm:gap-2 text-center mb-3">
              {WEEKDAY_NAMES.map((wd, i) => (
                <div
                  key={`weekday-${i}`}
                  className="py-2 rounded-xl bg-slate-900/60 border border-slate-800/80"
                >
                  <span className={`text-xs sm:text-sm font-bold ${wd.color}`}>
                    {wd.th}
                  </span>
                  <span className="hidden sm:inline text-[10px] text-slate-500 ml-1">
                    {wd.en}
                  </span>
                </div>
              ))}
            </div>

            {/* Calendar Cells Grid */}
            <div className="grid grid-cols-7 gap-1.5 sm:gap-2.5">
              
              {/* Blank leading cells */}
              {calendarGrid.blankLeading?.map((_, bIdx) => (
                <div
                  key={`blank-${bIdx}`}
                  className="aspect-square sm:aspect-auto sm:min-h-[110px] rounded-2xl bg-slate-950/20 border border-dashed border-slate-900/40 opacity-30 pointer-events-none"
                />
              ))}

              {/* Day Cells */}
              {calendarGrid.days?.map((dayItem) => {
                const isToday = isDateToday(dayItem.day);
                const isFilteredOut =
                  activeFilter === 'auspicious' && dayItem.type !== 'auspicious' ||
                  activeFilter === 'events' && dayItem.type !== 'astrology_event' ||
                  activeFilter === 'caution' && dayItem.type !== 'inauspicious';

                // Style based on day type
                let typeStyles = {
                  bg: 'bg-slate-900/50 hover:bg-slate-800/60',
                  border: 'border-slate-800/80 hover:border-slate-700',
                  badgeBg: 'bg-slate-800/60 text-slate-300',
                  accentDot: 'bg-slate-400',
                };

                if (dayItem.type === 'auspicious') {
                  typeStyles = {
                    bg: 'bg-gradient-to-b from-amber-950/25 to-slate-900/80 hover:from-amber-950/40 hover:to-slate-900',
                    border: 'border-amber-500/40 hover:border-amber-400/70',
                    badgeBg: 'bg-amber-500/20 text-amber-200 border border-amber-500/30',
                    accentDot: 'bg-amber-400',
                  };
                } else if (dayItem.type === 'astrology_event') {
                  typeStyles = {
                    bg: 'bg-gradient-to-b from-purple-950/30 to-slate-900/80 hover:from-purple-950/50 hover:to-slate-900',
                    border: 'border-purple-500/40 hover:border-purple-400/70',
                    badgeBg: 'bg-purple-500/20 text-purple-200 border border-purple-500/30',
                    accentDot: 'bg-purple-400',
                  };
                } else if (dayItem.type === 'inauspicious') {
                  typeStyles = {
                    bg: 'bg-gradient-to-b from-rose-950/25 to-slate-900/80 hover:from-rose-950/40 hover:to-slate-900',
                    border: 'border-rose-500/30 hover:border-rose-400/60',
                    badgeBg: 'bg-rose-500/20 text-rose-200 border border-rose-500/30',
                    accentDot: 'bg-rose-400',
                  };
                }

                return (
                  <motion.div
                    key={`day-${dayItem.day}`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleSelectDay(dayItem)}
                    className={`cursor-pointer rounded-2xl border p-2 sm:p-2.5 flex flex-col justify-between transition-all relative overflow-hidden group shadow-md ${
                      typeStyles.bg
                    } ${typeStyles.border} ${
                      isToday ? 'ring-2 ring-amber-400 ring-offset-2 ring-offset-slate-950' : ''
                    } ${isFilteredOut ? 'opacity-30 grayscale-[50%]' : 'opacity-100'}`}
                    style={{ minHeight: '100px' }}
                  >
                    {/* Top Row: Date & Lunar Phase */}
                    <div className="flex items-start justify-between gap-1">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`text-sm sm:text-base font-black ${
                            isToday ? 'text-amber-300 underline decoration-amber-400 decoration-2' : 'text-white'
                          }`}
                        >
                          {dayItem.day}
                        </span>
                        {isToday && (
                          <span className="hidden sm:inline text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-400 text-slate-950">
                            วันนี้
                          </span>
                        )}
                      </div>

                      {/* Energy Score Pill */}
                      <div className="flex items-center gap-0.5 text-[9px] font-bold text-slate-400">
                        <span className={`h-1.5 w-1.5 rounded-full ${typeStyles.accentDot}`} />
                        <span className="hidden sm:inline">{dayItem.energyScore}%</span>
                      </div>
                    </div>

                    {/* Middle: Badge & Title */}
                    <div className="my-1.5">
                      <div
                        className={`text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 rounded-lg truncate w-fit max-w-full ${typeStyles.badgeBg}`}
                      >
                        {dayItem.badge}
                      </div>
                      <p className="hidden sm:block text-[11px] font-medium text-slate-200 line-clamp-1 mt-1 group-hover:text-amber-200 transition-colors">
                        {dayItem.title}
                      </p>
                    </div>

                    {/* Bottom: Lunar Phase & Quick Action tags */}
                    <div className="pt-1 border-t border-slate-800/60 flex items-center justify-between text-[9px] text-slate-400">
                      <span className="truncate max-w-[80px]">
                        {dayItem.lunarPhase}
                      </span>
                      <span className="hidden md:inline font-mono text-[9px] text-amber-300/80">
                        {dayItem.luckyHours.split('-')[0]}
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Selected Day Detail Modal / Sheet */}
      <AnimatePresence>
        {selectedDay && calendarData && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-3xl border p-6 sm:p-7 shadow-2xl transition-all"
              style={{
                backgroundColor: 'var(--cat-container)',
                borderColor: 'var(--cat-border)',
                color: 'var(--cat-cream)',
              }}
            >
              {/* Close Button */}
              <button
                id="close-day-detail-modal"
                onClick={() => setSelectedDay(null)}
                className="absolute top-5 right-5 rounded-full p-2 text-slate-400 hover:text-white hover:bg-slate-800/70 transition-colors"
                aria-label="Close Modal"
              >
                <X className="h-5 w-5" />
              </button>

              {/* Header */}
              <div className="flex items-start gap-3.5 mb-4">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/20 text-amber-300 border border-amber-500/30 text-2xl font-black shadow-inner">
                  {selectedDay.day}
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-amber-300">
                      {selectedDay.date} ({selectedDay.lunarPhase})
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                      {selectedDay.badge}
                    </span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-white mt-1">
                    {selectedDay.title}
                  </h3>
                </div>
              </div>

              {/* Short Note */}
              <div className="rounded-2xl bg-slate-900/70 border border-slate-800 p-4 mb-4 text-xs sm:text-sm text-slate-300 leading-relaxed">
                <p>{selectedDay.shortNote}</p>
                {selectedDay.planetaryAspect && (
                  <p className="mt-2 text-xs text-purple-300 font-medium flex items-center gap-1.5">
                    <Moon className="h-3.5 w-3.5" />
                    <span>อิทธิพลดาว: {selectedDay.planetaryAspect}</span>
                  </p>
                )}
              </div>

              {/* Energy & Lucky Attributes Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-5">
                <div className="rounded-2xl bg-slate-900/60 border border-slate-800/80 p-3">
                  <div className="text-[11px] font-bold text-amber-400 flex items-center gap-1 mb-1">
                    <Zap className="h-3.5 w-3.5" />
                    <span>คะแนนพลังงาน</span>
                  </div>
                  <div className="text-lg font-extrabold text-white">
                    {selectedDay.energyScore}%
                  </div>
                </div>

                <div className="rounded-2xl bg-slate-900/60 border border-slate-800/80 p-3">
                  <div className="text-[11px] font-bold text-emerald-400 flex items-center gap-1 mb-1">
                    <Clock className="h-3.5 w-3.5" />
                    <span>ฤกษ์เวลาทอง</span>
                  </div>
                  <div className="text-xs font-bold text-slate-200 mt-1">
                    {selectedDay.luckyHours}
                  </div>
                </div>

                <div className="rounded-2xl bg-slate-900/60 border border-slate-800/80 p-3 col-span-2 sm:col-span-1">
                  <div className="text-[11px] font-bold text-pink-400 flex items-center gap-1 mb-1">
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>สีมงคลประจำวัน</span>
                  </div>
                  <div className="text-xs font-bold text-slate-200 mt-1">
                    {selectedDay.luckyColor}
                  </div>
                </div>
              </div>

              {/* Auspicious For (Do) and Avoid For (Don't) */}
              <div className="space-y-3 mb-6">
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 mb-2">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>สิ่งที่ควรทำ / ฤกษ์มงคลเหมาะสมสำหรับ:</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedDay.auspiciousFor.map((item, idx) => (
                      <span
                        key={`auspicious-item-${idx}`}
                        className="rounded-xl bg-emerald-500/15 border border-emerald-500/30 px-3 py-1 text-xs font-medium text-emerald-200"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-rose-400 mb-2">
                    <XCircle className="h-4 w-4" />
                    <span>สิ่งที่อย่าหาทำ / ควรระมัดระวังเป็นพิเศษ:</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedDay.avoidFor.map((item, idx) => (
                      <span
                        key={`avoid-item-${idx}`}
                        className="rounded-xl bg-rose-500/15 border border-rose-500/30 px-3 py-1 text-xs font-medium text-rose-200"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-800">
                <button
                  id="share-day-btn"
                  onClick={() => handleShareDay(selectedDay)}
                  className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-2.5 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-all active:scale-95"
                >
                  <Share2 className="h-4 w-4 text-amber-400" />
                  <span>แชร์ฤกษ์มงคล</span>
                </button>

                <div className="flex items-center gap-2">
                  {onSwitchDiscipline && (
                    <>
                      <button
                        id="goto-lucky-numbers-btn"
                        onClick={() => {
                          setSelectedDay(null);
                          onSwitchDiscipline('numbers');
                        }}
                        className="rounded-xl px-3.5 py-2.5 text-xs font-semibold text-amber-200 border border-amber-500/40 bg-amber-500/15 hover:bg-amber-500/25 active:scale-95 transition-all"
                      >
                        ✨ คำนวณเลขมงคล
                      </button>
                      <button
                        id="goto-daily-draw-btn"
                        onClick={() => {
                          setSelectedDay(null);
                          onSwitchDiscipline('daily');
                        }}
                        className="rounded-xl px-4 py-2.5 text-xs font-bold text-slate-900 bg-gradient-to-r from-amber-400 to-amber-500 hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-amber-500/20"
                      >
                        🐾 จั่วไพ่ประจำวันนี้
                      </button>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Major Event Detail Modal */}
      <AnimatePresence>
        {activeEventModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md rounded-3xl border p-6 shadow-2xl transition-all"
              style={{
                backgroundColor: 'var(--cat-container)',
                borderColor: 'var(--cat-border)',
                color: 'var(--cat-cream)',
              }}
            >
              <button
                id="close-event-modal-btn"
                onClick={() => setActiveEventModal(null)}
                className="absolute top-4 right-4 rounded-full p-2 text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="text-center mb-4">
                <span className="text-4xl">{activeEventModal.icon}</span>
                <span className="block mt-2 text-xs font-bold text-amber-400">
                  {activeEventModal.tag} • วันที่ {activeEventModal.day}
                </span>
                <h3 className="text-lg font-bold text-white mt-1">
                  {activeEventModal.title}
                </h3>
              </div>

              <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-4 text-xs text-slate-300 leading-relaxed mb-4">
                <p>{activeEventModal.description}</p>
                <div className="mt-3 pt-3 border-t border-slate-800/80 text-purple-300 font-medium">
                  ⚡ ผลกระทบ: {activeEventModal.impact}
                </div>
              </div>

              <button
                onClick={() => setActiveEventModal(null)}
                className="w-full rounded-xl py-2.5 text-xs font-bold bg-slate-800 text-slate-200 hover:bg-slate-700 transition-colors"
              >
                รับทราบคำทำนาย
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
