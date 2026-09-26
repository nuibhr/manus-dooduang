import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  Sparkles,
  Calendar,
  Heart,
  Briefcase,
  Coins,
  Brain,
  Zap,
  Flame,
  Award,
  Share2,
  RefreshCw,
  Eye,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  ShieldCheck,
  Compass,
  Check,
  Copy,
} from 'lucide-react';
import { DailyFortuneData, WeeklyReadingPoint } from '../types';
import { playMysticChimeSound } from '../utils/speechHelper';

export interface WeeklyTrendDashboardProps {
  currentFortune?: DailyFortuneData;
  userName: string;
  onShowToast: (msg: string) => void;
  soundEnabled?: boolean;
}

const DIMENSION_CONFIG = {
  love: {
    label: 'ความรัก',
    enLabel: 'Love',
    color: '#EC4899',
    gradientFrom: '#EC4899',
    gradientTo: '#BE185D',
    icon: Heart,
    bgClass: 'bg-[#842C71]/30',
    borderClass: 'border-[#EC4899]/40',
    textClass: 'text-[#F472B6]',
  },
  work: {
    label: 'การงาน',
    enLabel: 'Career',
    color: '#10B981',
    gradientFrom: '#10B981',
    gradientTo: '#047857',
    icon: Briefcase,
    bgClass: 'bg-[#165B53]/30',
    borderClass: 'border-[#10B981]/40',
    textClass: 'text-[#6EE7B7]',
  },
  money: {
    label: 'การเงิน',
    enLabel: 'Wealth',
    color: '#F59E0B',
    gradientFrom: '#F59E0B',
    gradientTo: '#B45309',
    icon: Coins,
    bgClass: 'bg-[#78350F]/30',
    borderClass: 'border-[#F59E0B]/40',
    textClass: 'text-[#FCD34D]',
  },
  sanity: {
    label: 'สติ/จิตใจ',
    enLabel: 'Sanity',
    color: '#A855F7',
    gradientFrom: '#A855F7',
    gradientTo: '#6B21A8',
    icon: Brain,
    bgClass: 'bg-[#581C87]/30',
    borderClass: 'border-[#A855F7]/40',
    textClass: 'text-[#D8B4FE]',
  },
  overall: {
    label: 'ออร่าเฉลี่ยรวม',
    enLabel: 'Overall Aura',
    color: '#FAE9CA',
    gradientFrom: '#EAC272',
    gradientTo: '#842C71',
    icon: Sparkles,
    bgClass: 'bg-[#EAC272]/20',
    borderClass: 'border-[#FAE9CA]/40',
    textClass: 'text-[#FAE9CA]',
  },
};

type DimensionKey = 'all' | 'overall' | 'love' | 'work' | 'money' | 'sanity';
type ChartStyle = 'line' | 'area' | 'bar';

export const WeeklyTrendDashboard: React.FC<WeeklyTrendDashboardProps> = ({
  currentFortune,
  userName,
  onShowToast,
  soundEnabled = true,
}) => {
  const [selectedDimension, setSelectedDimension] = useState<DimensionKey>('all');
  const [chartStyle, setChartStyle] = useState<ChartStyle>('line');
  const [selectedDayIndex, setSelectedDayIndex] = useState<number>(6); // Default to today (last index)
  const [copied, setCopied] = useState<boolean>(false);

  // Generate or Load 7-Day History
  const [weeklyHistory, setWeeklyHistory] = useState<WeeklyReadingPoint[]>(() => {
    const saved = localStorage.getItem('sassy_weekly_trend_history');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length === 7) {
          return parsed;
        }
      } catch (e) {}
    }
    return generateInitialWeeklyHistory(currentFortune);
  });

  // Keep today's reading in sync with currentFortune if provided
  useEffect(() => {
    if (currentFortune && currentFortune.scores) {
      setWeeklyHistory((prev) => {
        const updated = [...prev];
        const lastIdx = updated.length - 1;
        if (lastIdx >= 0) {
          const overall = Math.round(
            (currentFortune.scores.love +
              currentFortune.scores.work +
              currentFortune.scores.money +
              currentFortune.scores.sanity) /
              4
          );
          updated[lastIdx] = {
            ...updated[lastIdx],
            love: currentFortune.scores.love,
            work: currentFortune.scores.work,
            money: currentFortune.scores.money,
            sanity: currentFortune.scores.sanity,
            overall,
            themeTitle: currentFortune.themeTitle || updated[lastIdx].themeTitle,
            cardName: currentFortune.dailyCard?.name || updated[lastIdx].cardName,
            cardSymbol: currentFortune.dailyCard?.symbol || updated[lastIdx].cardSymbol,
            bestieRoast: currentFortune.bestieRoast || updated[lastIdx].bestieRoast,
            isToday: true,
          };
          localStorage.setItem('sassy_weekly_trend_history', JSON.stringify(updated));
        }
        return updated;
      });
    }
  }, [currentFortune]);

  // Analytics Computations
  const analytics = useMemo(() => {
    if (weeklyHistory.length === 0) return null;

    // Averages
    const avgLove = Math.round(
      weeklyHistory.reduce((sum, d) => sum + d.love, 0) / weeklyHistory.length
    );
    const avgWork = Math.round(
      weeklyHistory.reduce((sum, d) => sum + d.work, 0) / weeklyHistory.length
    );
    const avgMoney = Math.round(
      weeklyHistory.reduce((sum, d) => sum + d.money, 0) / weeklyHistory.length
    );
    const avgSanity = Math.round(
      weeklyHistory.reduce((sum, d) => sum + d.sanity, 0) / weeklyHistory.length
    );
    const avgOverall = Math.round(
      weeklyHistory.reduce((sum, d) => sum + d.overall, 0) / weeklyHistory.length
    );

    // Peak Day
    let peakDay = weeklyHistory[0];
    let lowDay = weeklyHistory[0];
    weeklyHistory.forEach((d) => {
      if (d.overall > peakDay.overall) peakDay = d;
      if (d.overall < lowDay.overall) lowDay = d;
    });

    // Momentum / Trajectory Trend
    const firstHalfAvg =
      (weeklyHistory[0].overall + weeklyHistory[1].overall + weeklyHistory[2].overall) / 3;
    const secondHalfAvg =
      (weeklyHistory[4].overall + weeklyHistory[5].overall + weeklyHistory[6].overall) / 3;
    const momentumDiff = Math.round(secondHalfAvg - firstHalfAvg);

    // Strongest Dimension
    const dims = [
      { key: 'love', name: 'ความรัก', avg: avgLove, icon: '💖', color: '#EC4899' },
      { key: 'work', name: 'การงาน', avg: avgWork, icon: '💼', color: '#10B981' },
      { key: 'money', name: 'การเงิน', avg: avgMoney, icon: '💰', color: '#F59E0B' },
      { key: 'sanity', name: 'สติ & จิตใจ', avg: avgSanity, icon: '🧘', color: '#A855F7' },
    ];
    dims.sort((a, b) => b.avg - a.avg);
    const topDimension = dims[0];
    const lowDimension = dims[dims.length - 1];

    return {
      avgLove,
      avgWork,
      avgMoney,
      avgSanity,
      avgOverall,
      peakDay,
      lowDay,
      momentumDiff,
      topDimension,
      lowDimension,
    };
  }, [weeklyHistory]);

  // Selected Day Detail
  const activeDay = weeklyHistory[selectedDayIndex] || weeklyHistory[weeklyHistory.length - 1];

  // Refresh / Regenerate History Simulation
  const handleRegenerateWeekly = () => {
    if (soundEnabled) playMysticChimeSound('coin');
    const newHistory = generateInitialWeeklyHistory(currentFortune);
    setWeeklyHistory(newHistory);
    localStorage.setItem('sassy_weekly_trend_history', JSON.stringify(newHistory));
    onShowToast('🔄 จำลองแนวโน้มวิถีดวง 7 วันย้อนหลังใหม่เรียบร้อย!');
  };

  // Copy Weekly Summary Report
  const handleCopyWeeklyReport = () => {
    if (!analytics) return;
    const reportText = `📊 สรุปแนวโน้มชะตา 7 วัน (Weekly Trend Dashboard)\n👤 สำหรับคุณ: ${userName}\n\n🌟 ออร่าเฉลี่ยรวมทั้งสัปดาห์: ${analytics.avgOverall}%\n💖 ความรักเฉลี่ย: ${analytics.avgLove}%\n💼 การงานเฉลี่ย: ${analytics.avgWork}%\n💰 การเงินเฉลี่ย: ${analytics.avgMoney}%\n🧘 สติ/จิตใจเฉลี่ย: ${analytics.avgSanity}%\n\n🔥 วันที่ดวงพุ่งสูงสุด: ${analytics.peakDay.dayLabel} (${analytics.peakDay.overall}%)\n🚀 มิติที่โดดเด่นที่สุด: ${analytics.topDimension.icon} ${analytics.topDimension.name} (${analytics.topDimension.avg}%)\n📈 ทิศทางพลังงาน: ${analytics.momentumDiff >= 0 ? `ขาขึ้น (+${analytics.momentumDiff}%)` : `พักฟื้น (${analytics.momentumDiff}%)`}\n\n🐱 แมววิเคราะห์ภาพรวม:\n"${activeDay.bestieRoast}"\n\n— The Cat Room • โหราศาสตร์และจิตวิทยาเพื่อการลงมือทำจริง`;

    navigator.clipboard.writeText(reportText);
    setCopied(true);
    if (soundEnabled) playMysticChimeSound('coin');
    onShowToast('📋 คัดลอกรายงานแนวโน้มสัปดาห์เรียบร้อย!');
    setTimeout(() => setCopied(false), 2500);
  };

  // Custom Chart Tooltip
  const CustomChartTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const dataPoint: WeeklyReadingPoint = payload[0].payload;
      return (
        <div className="rounded-2xl bg-[#180B22]/95 p-4 border border-[rgba(242,203,128,0.3)] shadow-2xl backdrop-blur-md min-w-[220px] space-y-2 z-50">
          <div className="flex items-center justify-between border-b border-[rgba(242,203,128,0.15)] pb-2">
            <div className="flex items-center gap-1.5">
              <span className="text-sm">{dataPoint.cardSymbol || '🐾'}</span>
              <span className="font-bold text-xs text-[#FAE9CA]">
                {dataPoint.dayLabel} {dataPoint.isToday ? '(วันนี้)' : ''}
              </span>
            </div>
            <span className="text-[10px] text-[#C9B49D]">{dataPoint.fullDate}</span>
          </div>

          <div className="space-y-1.5 text-xs">
            {payload.map((entry: any, index: number) => {
              const dimKey = entry.dataKey as keyof typeof DIMENSION_CONFIG;
              const config = DIMENSION_CONFIG[dimKey];
              return (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: entry.color }}
                    />
                    <span className="text-[#C9B49D] text-[11px]">
                      {config ? config.label : entry.name}:
                    </span>
                  </div>
                  <span className="font-bold text-[#FAE9CA]">{entry.value}%</span>
                </div>
              );
            })}
          </div>

          <div className="pt-1 border-t border-[rgba(242,203,128,0.1)] text-[10px] text-[#EAC272] italic line-clamp-1">
            "{dataPoint.themeTitle}"
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-8">
      {/* ---------------------------------------------------- */}
      {/* Header Banner & Controls */}
      {/* ---------------------------------------------------- */}
      <div className="rounded-[32px] bg-gradient-to-br from-[#24102E] via-[#1A0B24] to-[#110918] p-6 sm:p-8 border border-[rgba(242,203,128,0.22)] shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 h-64 w-64 rounded-full bg-[#842C71]/15 blur-[80px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 h-48 w-48 rounded-full bg-[#165B53]/15 blur-[70px] pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-[#842C71]/40 px-3.5 py-1 text-xs font-semibold text-[#EAC272] border border-[rgba(242,203,128,0.25)]">
              <Activity className="h-3.5 w-3.5 text-[#EAC272]" />
              <span>Weekly Fortune Trajectory • 7-Day Analytics</span>
            </div>
            <h2 className="font-serif-display text-2xl sm:text-4xl font-normal text-[#FAE9CA]">
              กราฟวิถีดวง & การเติบโต 7 วัน
            </h2>
            <p className="text-xs sm:text-sm text-[#C9B49D] max-w-xl leading-relaxed">
              ติดตามเส้นทางพลังงาน ความรัก การงาน การเงิน และสุขภาพใจย้อนหลัง 7 วัน เพื่อถอดรหัสความเสถียรและปลดล็อกจิตวิทยาพฤติกรรมของคุณ
            </p>
          </div>

          {/* Action Toolbar */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              id="btn-weekly-refresh"
              onClick={handleRegenerateWeekly}
              className="flex items-center gap-1.5 rounded-full bg-[#2A143A] hover:bg-[#381B4E] px-3.5 py-2 text-xs font-semibold text-[#FAE9CA] border border-[rgba(242,203,128,0.2)] shadow-md transition-all active:scale-95"
              title="สุ่มจำลองแนวโน้มสัปดาห์ใหม่"
            >
              <RefreshCw className="h-3.5 w-3.5 text-[#EAC272]" />
              <span>ซิงค์กราฟ</span>
            </button>

            <button
              id="btn-weekly-copy"
              onClick={handleCopyWeeklyReport}
              className="flex items-center gap-1.5 rounded-full bg-gradient-to-r from-[#842C71] to-[#531B47] hover:from-[#9D3486] hover:to-[#662057] px-4 py-2 text-xs font-semibold text-[#FAE9CA] border border-[rgba(242,203,128,0.3)] shadow-lg transition-all active:scale-95"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Share2 className="h-3.5 w-3.5 text-[#EAC272]" />}
              <span>{copied ? 'คัดลอกแล้ว!' : 'แชร์บทสรุปสัปดาห์'}</span>
            </button>
          </div>
        </div>

        {/* ---------------------------------------------------- */}
        {/* Metric Overview Ribbon Cards */}
        {/* ---------------------------------------------------- */}
        {analytics && (
          <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3.5">

            {/* Overall Average */}
            <div className="rounded-2xl bg-[#110918]/80 p-3.5 sm:p-4 border border-[rgba(242,203,128,0.14)] space-y-1">
              <div className="flex items-center justify-between text-[11px] text-[#C9B49D]">
                <span>ออร่าเฉลี่ย 7 วัน</span>
                <Sparkles className="h-3.5 w-3.5 text-[#EAC272]" />
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="font-serif-display text-2xl sm:text-3xl font-bold text-[#FAE9CA]">
                  {analytics.avgOverall}%
                </span>
                <span className="text-[10px] text-[#EAC272]">Aura Avg</span>
              </div>
              <div className="h-1 w-full rounded-full bg-[#24102E] overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#842C71] to-[#EAC272]"
                  style={{ width: `${analytics.avgOverall}%` }}
                />
              </div>
            </div>

            {/* Peak Day */}
            <div className="rounded-2xl bg-[#110918]/80 p-3.5 sm:p-4 border border-[rgba(242,203,128,0.14)] space-y-1">
              <div className="flex items-center justify-between text-[11px] text-[#C9B49D]">
                <span>วันที่ดวงพุ่งสุด</span>
                <Award className="h-3.5 w-3.5 text-[#AEFFE4]" />
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="font-serif-display text-xl sm:text-2xl font-bold text-[#AEFFE4]">
                  {analytics.peakDay.dayLabel}
                </span>
                <span className="text-[10px] text-[#C9B49D]">({analytics.peakDay.overall}%)</span>
              </div>
              <div className="text-[10px] text-[#C9B49D] truncate">
                {analytics.peakDay.cardName}
              </div>
            </div>

            {/* Rising Star Dimension */}
            <div className="rounded-2xl bg-[#110918]/80 p-3.5 sm:p-4 border border-[rgba(242,203,128,0.14)] space-y-1">
              <div className="flex items-center justify-between text-[11px] text-[#C9B49D]">
                <span>มิติเด่นประจำวีค</span>
                <span className="text-xs">{analytics.topDimension.icon}</span>
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="font-serif-display text-xl sm:text-2xl font-bold text-[#FCD34D]">
                  {analytics.topDimension.name}
                </span>
                <span className="text-[10px] text-[#C9B49D]">({analytics.topDimension.avg}%)</span>
              </div>
              <div className="text-[10px] text-[#C9B49D]">
                คะแนนเฉลี่ยสูงสุดใน 4 มิติ
              </div>
            </div>

            {/* 7-Day Momentum */}
            <div className="rounded-2xl bg-[#110918]/80 p-3.5 sm:p-4 border border-[rgba(242,203,128,0.14)] space-y-1">
              <div className="flex items-center justify-between text-[11px] text-[#C9B49D]">
                <span>โมเมนตัมแนวโน้ม</span>
                {analytics.momentumDiff >= 0 ? (
                  <TrendingUp className="h-3.5 w-3.5 text-emerald-400" />
                ) : (
                  <TrendingDown className="h-3.5 w-3.5 text-amber-400" />
                )}
              </div>
              <div className="flex items-baseline gap-1.5">
                <span
                  className={`font-serif-display text-xl sm:text-2xl font-bold ${
                    analytics.momentumDiff >= 0 ? 'text-emerald-400' : 'text-amber-400'
                  }`}
                >
                  {analytics.momentumDiff >= 0 ? `+${analytics.momentumDiff}%` : `${analytics.momentumDiff}%`}
                </span>
                <span className="text-[10px] text-[#C9B49D]">
                  {analytics.momentumDiff >= 0 ? 'ทิศทางขาขึ้น' : 'ช่วงสะสมพลัง'}
                </span>
              </div>
              <div className="text-[10px] text-[#C9B49D]">
                {analytics.momentumDiff >= 0 ? 'พลังงานต่อเนื่องดีมาก' : 'แนะนำพักผ่อนใจ'}
              </div>
            </div>

          </div>
        )}
      </div>

      {/* ---------------------------------------------------- */}
      {/* Chart Filter & Style Controls */}
      {/* ---------------------------------------------------- */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">

        {/* Dimension Selector Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setSelectedDimension('all')}
            className={`flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all ${
              selectedDimension === 'all'
                ? 'bg-gradient-to-r from-[#842C71] to-[#531B47] text-[#FAE9CA] border border-[#EAC272] shadow-md'
                : 'bg-[#180B22] text-[#C9B49D] hover:bg-[#24102E] border border-[rgba(242,203,128,0.12)]'
            }`}
          >
            <Activity className="h-3.5 w-3.5" />
            <span>ครบทุกมิติ (4 Lines)</span>
          </button>

          <button
            onClick={() => setSelectedDimension('overall')}
            className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${
              selectedDimension === 'overall'
                ? 'bg-[#EAC272]/20 text-[#FAE9CA] border border-[#FAE9CA] shadow-md'
                : 'bg-[#180B22] text-[#C9B49D] hover:bg-[#24102E] border border-[rgba(242,203,128,0.12)]'
            }`}
          >
            <Sparkles className="h-3.5 w-3.5 text-[#EAC272]" />
            <span>ออร่าเฉลี่ยรวม</span>
          </button>

          <button
            onClick={() => setSelectedDimension('love')}
            className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${
              selectedDimension === 'love'
                ? 'bg-[#EC4899]/20 text-[#F472B6] border border-[#EC4899] shadow-md'
                : 'bg-[#180B22] text-[#C9B49D] hover:bg-[#24102E] border border-[rgba(242,203,128,0.12)]'
            }`}
          >
            <Heart className="h-3.5 w-3.5 text-[#EC4899]" />
            <span>ความรัก</span>
          </button>

          <button
            onClick={() => setSelectedDimension('work')}
            className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${
              selectedDimension === 'work'
                ? 'bg-[#10B981]/20 text-[#6EE7B7] border border-[#10B981] shadow-md'
                : 'bg-[#180B22] text-[#C9B49D] hover:bg-[#24102E] border border-[rgba(242,203,128,0.12)]'
            }`}
          >
            <Briefcase className="h-3.5 w-3.5 text-[#10B981]" />
            <span>การงาน</span>
          </button>

          <button
            onClick={() => setSelectedDimension('money')}
            className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${
              selectedDimension === 'money'
                ? 'bg-[#F59E0B]/20 text-[#FCD34D] border border-[#F59E0B] shadow-md'
                : 'bg-[#180B22] text-[#C9B49D] hover:bg-[#24102E] border border-[rgba(242,203,128,0.12)]'
            }`}
          >
            <Coins className="h-3.5 w-3.5 text-[#F59E0B]" />
            <span>การเงิน</span>
          </button>

          <button
            onClick={() => setSelectedDimension('sanity')}
            className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${
              selectedDimension === 'sanity'
                ? 'bg-[#A855F7]/20 text-[#D8B4FE] border border-[#A855F7] shadow-md'
                : 'bg-[#180B22] text-[#C9B49D] hover:bg-[#24102E] border border-[rgba(242,203,128,0.12)]'
            }`}
          >
            <Brain className="h-3.5 w-3.5 text-[#A855F7]" />
            <span>สติ/จิตใจ</span>
          </button>
        </div>

        {/* Chart View Mode (Line / Area / Bar) */}
        <div className="flex items-center rounded-xl bg-[#110918] p-1 border border-[rgba(242,203,128,0.14)] self-start sm:self-auto">
          <button
            onClick={() => setChartStyle('line')}
            className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-all ${
              chartStyle === 'line'
                ? 'bg-[#2A143A] text-[#FAE9CA] shadow-sm font-semibold'
                : 'text-[#C9B49D] hover:text-[#FAE9CA]'
            }`}
          >
            เส้นโค้ง (Line)
          </button>
          <button
            onClick={() => setChartStyle('area')}
            className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-all ${
              chartStyle === 'area'
                ? 'bg-[#2A143A] text-[#FAE9CA] shadow-sm font-semibold'
                : 'text-[#C9B49D] hover:text-[#FAE9CA]'
            }`}
          >
            เรืองแสง (Area)
          </button>
          <button
            onClick={() => setChartStyle('bar')}
            className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-all ${
              chartStyle === 'bar'
                ? 'bg-[#2A143A] text-[#FAE9CA] shadow-sm font-semibold'
                : 'text-[#C9B49D] hover:text-[#FAE9CA]'
            }`}
          >
            แท่ง (Bar)
          </button>
        </div>

      </div>

      {/* ---------------------------------------------------- */}
      {/* Primary Recharts Canvas Card */}
      {/* ---------------------------------------------------- */}
      <div className="rounded-[28px] bg-[#180B22] p-5 sm:p-7 border border-[rgba(242,203,128,0.18)] shadow-2xl space-y-6">

        {/* Chart Header */}
        <div className="flex items-center justify-between border-b border-[rgba(242,203,128,0.12)] pb-4">
          <div className="flex items-center gap-2">
            <span className="text-xl">📈</span>
            <div>
              <h3 className="font-serif-display text-lg sm:text-xl font-normal text-[#FAE9CA]">
                {selectedDimension === 'all'
                  ? 'วิเคราะห์พลังงาน 4 มิติย้อนหลัง 7 วัน (Multi-Dimension Trend)'
                  : selectedDimension === 'overall'
                  ? 'ทิศทางออร่าเฉลี่ยรวม (Overall Trajectory Curve)'
                  : `เจาะลึกเฉพาะด้าน${DIMENSION_CONFIG[selectedDimension].label} (7-Day ${DIMENSION_CONFIG[selectedDimension].enLabel} Focus)`}
              </h3>
              <p className="text-[11px] text-[#C9B49D]">
                คลิกที่จุดบนกราฟหรือตารางด้านล่างเพื่อดูรายละเอียดและคำเตือนสติของแต่ละวัน
              </p>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-4 text-xs font-medium">
            <span className="flex items-center gap-1.5 text-[#F472B6]">
              <span className="h-2.5 w-2.5 rounded-full bg-[#EC4899]" />
              รัก
            </span>
            <span className="flex items-center gap-1.5 text-[#6EE7B7]">
              <span className="h-2.5 w-2.5 rounded-full bg-[#10B981]" />
              งาน
            </span>
            <span className="flex items-center gap-1.5 text-[#FCD34D]">
              <span className="h-2.5 w-2.5 rounded-full bg-[#F59E0B]" />
              เงิน
            </span>
            <span className="flex items-center gap-1.5 text-[#D8B4FE]">
              <span className="h-2.5 w-2.5 rounded-full bg-[#A855F7]" />
              สติ
            </span>
          </div>
        </div>

        {/* Recharts Container */}
        <div className="h-72 sm:h-96 w-full">
          <ResponsiveContainer width="100%" height="100%">
            {chartStyle === 'area' ? (
              <AreaChart
                data={weeklyHistory}
                onClick={(data: any) => {
                  if (data && data.activeTooltipIndex !== undefined) {
                    setSelectedDayIndex(data.activeTooltipIndex);
                  }
                }}
                margin={{ top: 15, right: 15, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorOverall" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EAC272" stopOpacity={0.5} />
                    <stop offset="95%" stopColor="#EAC272" stopOpacity={0.02} />
                  </linearGradient>
                  <linearGradient id="colorLove" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EC4899" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#EC4899" stopOpacity={0.02} />
                  </linearGradient>
                  <linearGradient id="colorWork" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0.02} />
                  </linearGradient>
                  <linearGradient id="colorMoney" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#F59E0B" stopOpacity={0.02} />
                  </linearGradient>
                  <linearGradient id="colorSanity" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#A855F7" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#A855F7" stopOpacity={0.02} />
                  </linearGradient>
                </defs>

                <CartesianGrid strokeDasharray="3 3" stroke="rgba(242, 203, 128, 0.08)" vertical={false} />
                <XAxis
                  dataKey="dayLabel"
                  stroke="#C9B49D"
                  fontSize={12}
                  tickLine={false}
                  axisLine={{ stroke: 'rgba(242, 203, 128, 0.2)' }}
                />
                <YAxis
                  stroke="#C9B49D"
                  fontSize={11}
                  domain={[30, 100]}
                  tickLine={false}
                  axisLine={{ stroke: 'rgba(242, 203, 128, 0.2)' }}
                  tickFormatter={(val) => `${val}%`}
                />
                <Tooltip content={<CustomChartTooltip />} />
                <ReferenceLine y={75} stroke="rgba(242, 203, 128, 0.2)" strokeDasharray="3 3" label={{ value: 'เกณฑ์พลังงานสมดุล (75%)', fill: '#C9B49D', fontSize: 10 }} />

                {(selectedDimension === 'all' || selectedDimension === 'love') && (
                  <Area
                    type="monotone"
                    dataKey="love"
                    name="ความรัก"
                    stroke="#EC4899"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#colorLove)"
                  />
                )}
                {(selectedDimension === 'all' || selectedDimension === 'work') && (
                  <Area
                    type="monotone"
                    dataKey="work"
                    name="การงาน"
                    stroke="#10B981"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#colorWork)"
                  />
                )}
                {(selectedDimension === 'all' || selectedDimension === 'money') && (
                  <Area
                    type="monotone"
                    dataKey="money"
                    name="การเงิน"
                    stroke="#F59E0B"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#colorMoney)"
                  />
                )}
                {(selectedDimension === 'all' || selectedDimension === 'sanity') && (
                  <Area
                    type="monotone"
                    dataKey="sanity"
                    name="สติ/จิตใจ"
                    stroke="#A855F7"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#colorSanity)"
                  />
                )}
                {selectedDimension === 'overall' && (
                  <Area
                    type="monotone"
                    dataKey="overall"
                    name="ออร่าเฉลี่ยรวม"
                    stroke="#FAE9CA"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorOverall)"
                  />
                )}
              </AreaChart>
            ) : chartStyle === 'bar' ? (
              <BarChart
                data={weeklyHistory}
                onClick={(data: any) => {
                  if (data && data.activeTooltipIndex !== undefined) {
                    setSelectedDayIndex(data.activeTooltipIndex);
                  }
                }}
                margin={{ top: 15, right: 15, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(242, 203, 128, 0.08)" vertical={false} />
                <XAxis
                  dataKey="dayLabel"
                  stroke="#C9B49D"
                  fontSize={12}
                  tickLine={false}
                  axisLine={{ stroke: 'rgba(242, 203, 128, 0.2)' }}
                />
                <YAxis
                  stroke="#C9B49D"
                  fontSize={11}
                  domain={[0, 100]}
                  tickLine={false}
                  axisLine={{ stroke: 'rgba(242, 203, 128, 0.2)' }}
                  tickFormatter={(val) => `${val}%`}
                />
                <Tooltip content={<CustomChartTooltip />} />
                <Legend wrapperStyle={{ fontSize: '11px', color: '#FAE9CA' }} />

                {(selectedDimension === 'all' || selectedDimension === 'love') && (
                  <Bar dataKey="love" name="ความรัก" fill="#EC4899" radius={[4, 4, 0, 0]} />
                )}
                {(selectedDimension === 'all' || selectedDimension === 'work') && (
                  <Bar dataKey="work" name="การงาน" fill="#10B981" radius={[4, 4, 0, 0]} />
                )}
                {(selectedDimension === 'all' || selectedDimension === 'money') && (
                  <Bar dataKey="money" name="การเงิน" fill="#F59E0B" radius={[4, 4, 0, 0]} />
                )}
                {(selectedDimension === 'all' || selectedDimension === 'sanity') && (
                  <Bar dataKey="sanity" name="สติ/จิตใจ" fill="#A855F7" radius={[4, 4, 0, 0]} />
                )}
                {selectedDimension === 'overall' && (
                  <Bar dataKey="overall" name="ออร่ารวม" fill="#EAC272" radius={[4, 4, 0, 0]} />
                )}
              </BarChart>
            ) : (
              <LineChart
                data={weeklyHistory}
                onClick={(data: any) => {
                  if (data && data.activeTooltipIndex !== undefined) {
                    setSelectedDayIndex(data.activeTooltipIndex);
                  }
                }}
                margin={{ top: 15, right: 15, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(242, 203, 128, 0.08)" vertical={false} />
                <XAxis
                  dataKey="dayLabel"
                  stroke="#C9B49D"
                  fontSize={12}
                  tickLine={false}
                  axisLine={{ stroke: 'rgba(242, 203, 128, 0.2)' }}
                />
                <YAxis
                  stroke="#C9B49D"
                  fontSize={11}
                  domain={[40, 100]}
                  tickLine={false}
                  axisLine={{ stroke: 'rgba(242, 203, 128, 0.2)' }}
                  tickFormatter={(val) => `${val}%`}
                />
                <Tooltip content={<CustomChartTooltip />} />
                <ReferenceLine y={75} stroke="rgba(242, 203, 128, 0.2)" strokeDasharray="3 3" label={{ value: 'เกณฑ์สมดุล (75%)', fill: '#C9B49D', fontSize: 10 }} />

                {(selectedDimension === 'all' || selectedDimension === 'love') && (
                  <Line
                    type="monotone"
                    dataKey="love"
                    name="ความรัก"
                    stroke="#EC4899"
                    strokeWidth={selectedDimension === 'love' ? 3.5 : 2.5}
                    dot={{ r: 4, fill: '#EC4899', stroke: '#180B22', strokeWidth: 2 }}
                    activeDot={{ r: 7, fill: '#EC4899', stroke: '#FAE9CA', strokeWidth: 2 }}
                  />
                )}
                {(selectedDimension === 'all' || selectedDimension === 'work') && (
                  <Line
                    type="monotone"
                    dataKey="work"
                    name="การงาน"
                    stroke="#10B981"
                    strokeWidth={selectedDimension === 'work' ? 3.5 : 2.5}
                    dot={{ r: 4, fill: '#10B981', stroke: '#180B22', strokeWidth: 2 }}
                    activeDot={{ r: 7, fill: '#10B981', stroke: '#FAE9CA', strokeWidth: 2 }}
                  />
                )}
                {(selectedDimension === 'all' || selectedDimension === 'money') && (
                  <Line
                    type="monotone"
                    dataKey="money"
                    name="การเงิน"
                    stroke="#F59E0B"
                    strokeWidth={selectedDimension === 'money' ? 3.5 : 2.5}
                    dot={{ r: 4, fill: '#F59E0B', stroke: '#180B22', strokeWidth: 2 }}
                    activeDot={{ r: 7, fill: '#F59E0B', stroke: '#FAE9CA', strokeWidth: 2 }}
                  />
                )}
                {(selectedDimension === 'all' || selectedDimension === 'sanity') && (
                  <Line
                    type="monotone"
                    dataKey="sanity"
                    name="สติ/จิตใจ"
                    stroke="#A855F7"
                    strokeWidth={selectedDimension === 'sanity' ? 3.5 : 2.5}
                    dot={{ r: 4, fill: '#A855F7', stroke: '#180B22', strokeWidth: 2 }}
                    activeDot={{ r: 7, fill: '#A855F7', stroke: '#FAE9CA', strokeWidth: 2 }}
                  />
                )}
                {(selectedDimension === 'overall' || selectedDimension === 'all') && (
                  <Line
                    type="monotone"
                    dataKey="overall"
                    name="ออร่ารวม"
                    stroke="#FAE9CA"
                    strokeDasharray={selectedDimension === 'all' ? '5 5' : undefined}
                    strokeWidth={selectedDimension === 'overall' ? 3.5 : 2}
                    dot={{ r: 4, fill: '#FAE9CA', stroke: '#180B22', strokeWidth: 2 }}
                    activeDot={{ r: 7, fill: '#FAE9CA', stroke: '#842C71', strokeWidth: 2 }}
                  />
                )}
              </LineChart>
            )}
          </ResponsiveContainer>
        </div>

        {/* 7-Day Quick Selector Strip */}
        <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
          {weeklyHistory.map((item, idx) => {
            const isSelected = selectedDayIndex === idx;
            return (
              <button
                key={idx}
                onClick={() => {
                  setSelectedDayIndex(idx);
                  if (soundEnabled) playMysticChimeSound('card');
                }}
                className={`flex flex-col items-center justify-center p-2 rounded-xl border text-center transition-all ${
                  isSelected
                    ? 'bg-gradient-to-b from-[#361A4A] to-[#24102E] border-[#EAC272] shadow-lg ring-1 ring-[#EAC272]/50 scale-[1.03]'
                    : 'bg-[#110918]/60 border-[rgba(242,203,128,0.1)] hover:bg-[#1E0E2A]/70 text-[#C9B49D]'
                }`}
              >
                <span className="text-xs">{item.cardSymbol}</span>
                <span className="text-[11px] font-bold text-[#FAE9CA] mt-0.5">
                  {item.dayLabel}
                </span>
                <span className="font-serif-display text-xs font-bold text-[#EAC272]">
                  {item.overall}%
                </span>
                {item.isToday && (
                  <span className="text-[8px] uppercase tracking-wider text-[#AEFFE4] font-bold">
                    วันนี้
                  </span>
                )}
              </button>
            );
          })}
        </div>

      </div>

      {/* ---------------------------------------------------- */}
      {/* Selected Day Inspector & Cat Psychologist Diagnosis */}
      {/* ---------------------------------------------------- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Day Details Card (Left 2 Cols) */}
        <div className="lg:col-span-2 rounded-[28px] bg-gradient-to-br from-[#24102E] via-[#1E0E2A] to-[#110918] p-6 sm:p-7 border border-[rgba(242,203,128,0.2)] shadow-2xl space-y-5">

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[rgba(242,203,128,0.14)] pb-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-[#EAC272]">
                <span>🐾 ข้อมูลดวงวันที่เลือก: {activeDay.dayLabel} ({activeDay.fullDate})</span>
                {activeDay.isToday && (
                  <span className="rounded-full bg-[#165B53] px-2 py-0.5 text-[10px] text-[#AEFFE4] font-bold">
                    วันนี้ (Today)
                  </span>
                )}
              </div>
              <h4 className="mt-1 font-serif-display text-xl sm:text-2xl font-normal text-[#FAE9CA]">
                "{activeDay.themeTitle}"
              </h4>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <div className="flex items-center gap-2 rounded-2xl bg-[#110918] px-3.5 py-2 border border-[rgba(242,203,128,0.16)]">
                <span className="text-xl">{activeDay.cardSymbol}</span>
                <div className="text-left">
                  <div className="text-[10px] text-[#C9B49D]">ไพ่นำทาง</div>
                  <div className="text-xs font-bold text-[#FAE9CA]">{activeDay.cardName}</div>
                </div>
              </div>
            </div>
          </div>

          {/* 4 Scores Breakdown for this day */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">

            <div className="rounded-xl bg-[#110918]/80 p-3 border border-[#EC4899]/30 space-y-1">
              <div className="flex items-center justify-between text-[11px] text-[#F472B6]">
                <span>ความรัก</span>
                <Heart className="h-3.5 w-3.5 fill-[#EC4899]/40" />
              </div>
              <div className="font-serif-display text-xl font-bold text-[#FAE9CA]">
                {activeDay.love}%
              </div>
            </div>

            <div className="rounded-xl bg-[#110918]/80 p-3 border border-[#10B981]/30 space-y-1">
              <div className="flex items-center justify-between text-[11px] text-[#6EE7B7]">
                <span>การงาน</span>
                <Briefcase className="h-3.5 w-3.5 text-[#10B981]" />
              </div>
              <div className="font-serif-display text-xl font-bold text-[#FAE9CA]">
                {activeDay.work}%
              </div>
            </div>

            <div className="rounded-xl bg-[#110918]/80 p-3 border border-[#F59E0B]/30 space-y-1">
              <div className="flex items-center justify-between text-[11px] text-[#FCD34D]">
                <span>การเงิน</span>
                <Coins className="h-3.5 w-3.5 text-[#F59E0B]" />
              </div>
              <div className="font-serif-display text-xl font-bold text-[#FAE9CA]">
                {activeDay.money}%
              </div>
            </div>

            <div className="rounded-xl bg-[#110918]/80 p-3 border border-[#A855F7]/30 space-y-1">
              <div className="flex items-center justify-between text-[11px] text-[#D8B4FE]">
                <span>สติ/จิตใจ</span>
                <Brain className="h-3.5 w-3.5 text-[#A855F7]" />
              </div>
              <div className="font-serif-display text-xl font-bold text-[#FAE9CA]">
                {activeDay.sanity}%
              </div>
            </div>

          </div>

          {/* Sassy Daily Quote */}
          <div className="rounded-2xl bg-[#110918]/90 p-4 border border-[rgba(242,203,128,0.16)] flex items-start gap-3">
            <Flame className="h-5 w-5 text-[#EAC272] shrink-0 mt-0.5" />
            <div className="space-y-1">
              <div className="text-[11px] font-bold uppercase tracking-wider text-[#EAC272]">
                คำเตือนสติประจำวันนี้:
              </div>
              <p className="text-xs sm:text-sm text-[#FAE9CA] italic leading-relaxed">
                "{activeDay.bestieRoast}"
              </p>
            </div>
          </div>

        </div>

        {/* 7-Day Trajectory Takeaway / Weekly Advice (Right 1 Col) */}
        <div className="weekly-diagnosis-card rounded-[28px] bg-gradient-to-tr from-[#361A4A] via-[#24102E] to-[#110918] p-6 border border-[rgba(242,203,128,0.22)] shadow-2xl space-y-4">

          <div className="flex items-center gap-2 text-xs font-bold text-[#EAC272] uppercase tracking-wider">
            <Compass className="h-4 w-4 text-[#EAC272]" />
            <span>คำวินิจฉัยสัปดาห์จากแม่หมอแมวดำ</span>
          </div>

          <p className="font-serif-display text-base text-[#FAE9CA] leading-snug">
            "การดูดวงไม่ใช่เพื่อรอโชคหล่นทับ แต่คือกราฟสะท้อนว่าแกใช้พลังงานไปกับอะไร!"
          </p>

          <div className="space-y-3 text-xs text-[#C9B49D] leading-relaxed pt-2 border-t border-[rgba(242,203,128,0.12)]">
            <div className="flex items-start gap-2">
              <span className="text-[#AEFFE4] font-bold">1.</span>
              <span>
                <strong>สม่ำเสมอคือกุญแจ:</strong> เส้นกราฟที่เสถียรแปลว่าแกเริ่มคุมอารมณ์และขอบเขตชีวิตได้ดีขึ้นมาก
              </span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-[#AEFFE4] font-bold">2.</span>
              <span>
                <strong>วันที่กราฟดร็อป:</strong> ไม่ใช่เพราะดวงตก แต่เป็นสัญญาณเตือนจากร่างกายว่าแกกำลังแบกงานหรือความกังวลเกินลิมิต
              </span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-[#AEFFE4] font-bold">3.</span>
              <span>
                <strong>แอ็กชันเพื่อสัปดาห์หน้า:</strong> เลือกปรับปรุงมิติที่คะแนนต่ำสุดสัปดาห์นี้ 1 เรื่องเล็กๆ ทุกวัน
              </span>
            </div>
          </div>

          <div className="rounded-2xl bg-[#110918]/80 p-3.5 border border-[rgba(242,203,128,0.14)] text-center">
            <div className="text-[10px] text-[#C9B49D]">ความพร้อมของจิตวิญญาณสัปดาห์นี้</div>
            <div className="font-serif-display text-2xl font-bold text-[#AEFFE4] mt-0.5">
              {analytics ? analytics.avgOverall + 5 : 88}%
            </div>
            <div className="text-[10px] text-[#FAE9CA]/80 mt-0.5">พร้อมทะยานสู่เป้าหมายใหม่</div>
          </div>

        </div>

      </div>
    </div>
  );
};

// Helper to generate 7 historical days based on today's reading
function generateInitialWeeklyHistory(currentFortune?: DailyFortuneData): WeeklyReadingPoint[] {
  const dayNames = ['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์'];
  const today = new Date();
  const history: WeeklyReadingPoint[] = [];

  const baseLove = currentFortune?.scores?.love || 78;
  const baseWork = currentFortune?.scores?.work || 85;
  const baseMoney = currentFortune?.scores?.money || 80;
  const baseSanity = currentFortune?.scores?.sanity || 72;

  const sampleThemes = [
    { title: 'สะสางงานค้าง จัดระบบชีวิตใหม่', card: 'The Emperor Cat', symbol: '👑', roast: 'อย่าปล่อยให้ความขี้เกียจชนะแผนที่วางไว้!' },
    { title: 'โอกาสการเงินและโปรเจกต์ใหม่เริ่มขยับ', card: 'Ace of Coins', symbol: '🪙', roast: 'เงินเข้าแล้วอย่าเพิ่งรีบโอนออกไปซื้อของแก้เหงา' },
    { title: 'พักใจ เติมพลังบวก ตัดสิ่งรบกวน', card: 'The Zen Cat', symbol: '🧘', roast: 'นอนให้พอ ดื่มน้ำเยอะๆ เลิกไถจอดึกๆ' },
    { title: 'ความสัมพันธ์ชัดเจน รู้จักตั้งขอบเขต', card: 'Two of Cups', symbol: '💖', roast: 'เค้าไม่ได้ไม่ว่าง เค้าแค่ไม่สำคัญเท่าที่แกคิด' },
    { title: 'พลังสร้างสรรค์พุ่ง ไอเดียเฉียบคม', card: 'The Magician Cat', symbol: '✨', roast: 'ไอเดียดีแค่ไหนไม่ลงมือทำก็คือความฝันกลางวัน' },
    { title: 'รับมือกับความท้าทายด้วยสติและปัญญา', card: 'Strength of Feline', symbol: '🦁', roast: 'หายใจลึกๆ ทุกปัญหามีทางออกถ้าแกไม่ใช้อารมณ์' },
    { title: currentFortune?.themeTitle || 'หยุดคิดวนแล้วลงมือทำ เดี๋ยวชวดปลาทู!', card: currentFortune?.dailyCard?.name || 'The Mystic Black Cat', symbol: currentFortune?.dailyCard?.symbol || '🐾', roast: currentFortune?.bestieRoast || 'ดวงแกวันนี้ดีมาก อย่ามัวแต่นอนอืดไถฟีด!' },
  ];

  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(today.getDate() - i);
    const dayOfWeek = d.getDay();
    const dayLabel = `วัน${dayNames[dayOfWeek]}`;
    const fullDate = d.toLocaleDateString('th-TH', { day: 'numeric', month: 'short' });

    // Vary scores naturally for past days
    const variance = (i === 0) ? 0 : ((i * 7) % 15) - 7;
    const love = i === 0 ? baseLove : Math.min(98, Math.max(55, baseLove + variance));
    const work = i === 0 ? baseWork : Math.min(98, Math.max(58, baseWork - variance + 3));
    const money = i === 0 ? baseMoney : Math.min(98, Math.max(60, baseMoney + (variance % 6)));
    const sanity = i === 0 ? baseSanity : Math.min(98, Math.max(50, baseSanity - (variance % 8)));
    const overall = Math.round((love + work + money + sanity) / 4);

    const themeObj = sampleThemes[6 - i] || sampleThemes[0];

    history.push({
      date: d.toISOString().split('T')[0],
      dayLabel,
      fullDate,
      love,
      work,
      money,
      sanity,
      overall,
      themeTitle: themeObj.title,
      cardName: themeObj.card,
      cardSymbol: themeObj.symbol,
      bestieRoast: themeObj.roast,
      isToday: i === 0,
    });
  }

  return history;
}
