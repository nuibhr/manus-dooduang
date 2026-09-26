import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Moon,
  Sparkles,
  Info,
  Calendar,
  CheckCircle2,
  XCircle,
  Zap,
  ChevronRight,
  Compass,
  Volume2,
  Share2,
  Copy,
  ChevronDown,
  RefreshCw,
  Flame,
  Shield,
  Heart,
  Droplets,
  Wind
} from 'lucide-react';
import { MoonPhaseInfo, MoonPhaseName } from '../types';
import { calculateMoonPhase } from '../utils/lunarEngine';
import { playMysticChimeSound } from '../utils/speechHelper';

interface MoonPhaseWidgetProps {
  onShowToast?: (msg: string) => void;
  soundEnabled?: boolean;
  className?: string;
  defaultExpanded?: boolean;
}

export const MoonPhaseWidget: React.FC<MoonPhaseWidgetProps> = ({
  onShowToast,
  soundEnabled = true,
  className = '',
  defaultExpanded = false,
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(defaultExpanded);
  const [selectedDate, setSelectedDate] = useState<Date>(() => new Date());
  const [activeTab, setActiveTab] = useState<'influence' | 'actions' | 'mantra'>('influence');

  // Compute accurate real-time lunar data
  const moonData: MoonPhaseInfo = useMemo(() => {
    return calculateMoonPhase(selectedDate);
  }, [selectedDate]);

  // Visual SVG Moon Graphic Renderer
  const renderMoonGraphic = (phase: MoonPhaseName, illumination: number) => {
    // 0 = completely dark (new moon), 100 = completely illuminated (full moon)
    // We render an SVG sphere with crater textures and dynamic terminator curve
    const isWaxing = [
      'waxing_crescent',
      'first_quarter',
      'waxing_gibbous',
    ].includes(phase);
    const isFull = phase === 'full_moon';
    const isNew = phase === 'new_moon';

    return (
      <div className="relative flex items-center justify-center">
        {/* Ambient Outer Halo */}
        <div
          className="absolute inset-0 rounded-full blur-xl pointer-events-none transition-all duration-700"
          style={{
            background: isFull
              ? 'radial-gradient(circle, rgba(253, 230, 138, 0.45) 0%, rgba(217, 119, 6, 0.15) 70%, transparent 100%)'
              : isNew
              ? 'radial-gradient(circle, rgba(147, 51, 234, 0.25) 0%, transparent 70%)'
              : 'radial-gradient(circle, rgba(245, 208, 126, 0.3) 0%, rgba(132, 44, 113, 0.15) 70%, transparent 100%)',
            transform: 'scale(1.25)',
          }}
        />

        {/* SVG Lunar Sphere with Precision Terminator & Surface Details */}
        <svg
          viewBox="0 0 100 100"
          className="w-20 h-20 sm:w-24 sm:h-24 filter drop-shadow-[0_0_15px_rgba(245,208,126,0.25)] transition-all duration-500"
        >
          <defs>
            {/* Crater Pattern Filter */}
            <radialGradient id="lunarSurface" cx="35%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#FFF7ED" />
              <stop offset="60%" stopColor="#E2D4BF" />
              <stop offset="100%" stopColor="#B39E82" />
            </radialGradient>

            <radialGradient id="darkSide" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#1E162A" />
              <stop offset="80%" stopColor="#120B1C" />
              <stop offset="100%" stopColor="#08040C" />
            </radialGradient>

            {/* Glow Gradient */}
            <linearGradient id="rimGlow" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FEF08A" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#D97706" stopOpacity="0.2" />
            </linearGradient>

            <clipPath id="moonDisc">
              <circle cx="50" cy="50" r="46" />
            </clipPath>
          </defs>

          {/* Dark Disc Base */}
          <circle cx="50" cy="50" r="46" fill="url(#darkSide)" stroke="#3B2A4E" strokeWidth="1.5" />

          {/* Moon Surface with Craters (Clipped) */}
          <g clipPath="url(#moonDisc)">
            {/* Subtle lunar maria textures */}
            <circle cx="38" cy="35" r="14" fill="#0c0714" opacity="0.35" />
            <circle cx="62" cy="40" r="10" fill="#0c0714" opacity="0.3" />
            <circle cx="45" cy="65" r="16" fill="#0c0714" opacity="0.35" />
            <circle cx="68" cy="62" r="8" fill="#0c0714" opacity="0.25" />

            {/* Dynamic Illuminated Hemisphere Calculation */}
            {isFull ? (
              <circle cx="50" cy="50" r="46" fill="url(#lunarSurface)" />
            ) : isNew ? (
              <circle cx="50" cy="50" r="46" fill="#0e0716" opacity="0.95" />
            ) : (
              /* Terminator Curve via Path */
              <path
                d={getTerminatorPath(illumination, isWaxing)}
                fill="url(#lunarSurface)"
              />
            )}

            {/* Crater detailing on illuminated area */}
            {illumination > 15 && (
              <>
                <circle cx="42" cy="38" r="5" fill="#9A8367" opacity="0.4" />
                <circle cx="56" cy="52" r="7" fill="#8C7356" opacity="0.35" />
                <circle cx="36" cy="60" r="4" fill="#9A8367" opacity="0.3" />
                <circle cx="65" cy="32" r="3.5" fill="#8C7356" opacity="0.3" />
              </>
            )}
          </g>

          {/* Subtle Outer Atmosphere Rim */}
          <circle
            cx="50"
            cy="50"
            r="46"
            fill="none"
            stroke="url(#rimGlow)"
            strokeWidth="1.5"
            opacity={illumination > 50 ? 0.7 : 0.3}
          />
        </svg>

        {/* Small Floating Sparkle on Full or Waxing */}
        {illumination > 60 && (
          <div className="absolute -top-1 -right-1 text-amber-300 animate-pulse text-xs">
            ✨
          </div>
        )}
      </div>
    );
  };

  // Helper to generate SVG path for accurate Terminator curve
  function getTerminatorPath(illumination: number, isWaxing: boolean): string {
    // Disc radius = 46, center = 50, 50
    // If waxing: illuminated on the right side
    // If waning: illuminated on the left side
    const r = 46;
    const cx = 50;
    const cy = 50;
    const topY = cy - r;
    const botY = cy + r;

    // rx scales from -r to +r based on illumination
    // illumination = 50% => rx = 0 (straight line down middle)
    // illumination = 100% => full disc
    // normalized between -1 and 1
    const factor = (illumination - 50) / 50; // -1 to 1
    const rx = Math.abs(factor * r);
    const sweep = factor >= 0 ? 1 : 0;

    if (isWaxing) {
      // Right side is lit
      return `
        M ${cx} ${topY}
        A ${r} ${r} 0 0 1 ${cx} ${botY}
        A ${rx} ${r} 0 0 ${sweep} ${cx} ${topY}
        Z
      `;
    } else {
      // Left side is lit
      return `
        M ${cx} ${topY}
        A ${r} ${r} 0 0 0 ${cx} ${botY}
        A ${rx} ${r} 0 0 ${factor >= 0 ? 0 : 1} ${cx} ${topY}
        Z
      `;
    }
  }

  // Intensity Badge Styles
  const getIntensityBadge = (intensity: MoonPhaseInfo['cosmicEnergy']['intensity']) => {
    switch (intensity) {
      case 'peak':
        return {
          bg: 'bg-rose-500/20 border-rose-500/40 text-rose-300',
          dot: 'bg-rose-400',
          label: 'พลังงานสูงสุด (Peak Cosmic Vibe)',
        };
      case 'high':
        return {
          bg: 'bg-amber-500/20 border-amber-500/40 text-amber-300',
          dot: 'bg-amber-400',
          label: 'กระแสพลังเข้มข้น (High Momentum)',
        };
      case 'moderate':
        return {
          bg: 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300',
          dot: 'bg-cyan-400',
          label: 'พลังงานสมดุล (Moderate Flow)',
        };
      default:
        return {
          bg: 'bg-purple-500/20 border-purple-500/40 text-purple-300',
          dot: 'bg-purple-400',
          label: 'พลังงานสงบนิ่ง (Deep Calm & Reset)',
        };
    }
  };

  const badge = getIntensityBadge(moonData.cosmicEnergy.intensity);

  const copyMoonAffirmation = () => {
    navigator.clipboard.writeText(`🌙 [The Cat Room Cosmic Mantra]\n"${moonData.cosmicEnergy.mantra}"\n(ระยะดวงจันทร์: ${moonData.nameTh} • แสงสว่าง ${moonData.illumination}%)`);
    if (soundEnabled) playMysticChimeSound('gold');
    if (onShowToast) onShowToast('คัดลอกคาถาจันทร์เพ็ญประจำวันเรียบร้อย!');
  };

  return (
    <div
      id="moon-phase-tracker-widget"
      className={`relative overflow-hidden rounded-3xl border transition-all duration-300 shadow-xl backdrop-blur-xl ${className}`}
      style={{
        backgroundColor: 'var(--cat-container)',
        borderColor: 'var(--cat-border)',
      }}
    >
      {/* Subtle Background Cosmic Gradient Aura */}
      <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-amber-500/10 blur-3xl" />
      <div className="pointer-events-none absolute -left-16 -bottom-16 h-56 w-56 rounded-full bg-purple-600/15 blur-3xl" />

      {/* Main Bar / Compact Header */}
      <div className="p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">

          {/* Left: Moon Graphic & Phase Title */}
          <div className="flex items-center gap-4">
            {renderMoonGraphic(moonData.phase, moonData.illumination)}

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-1.5">
                  <span>{moonData.symbol}</span>
                  <span>{moonData.nameTh}</span>
                </span>

                {/* Illumination Pill */}
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-2.5 py-0.5 text-[11px] font-bold text-amber-300 border border-amber-500/30">
                  <Sparkles className="h-3 w-3 text-amber-400" />
                  <span>สว่าง {moonData.illumination}%</span>
                </span>
              </div>

              {/* Zodiac & Age Subtitle */}
              <div className="mt-1 flex items-center gap-2 text-xs text-slate-400 flex-wrap">
                <span className="flex items-center gap-1 text-purple-300 font-medium">
                  <Compass className="h-3.5 w-3.5 text-purple-400" />
                  <span>ดวงจันทร์สถิต: {moonData.zodiacSymbol} {moonData.zodiacSign}</span>
                </span>
                <span>•</span>
                <span>อายุจันทร์: {moonData.ageInDays} วัน</span>
                <span>•</span>
                <span className="text-amber-200/80">ธาตุ{moonData.zodiacElement}</span>
              </div>
            </div>
          </div>

          {/* Right: Cosmic Energy Status & Expand Toggle */}
          <div className="flex items-center gap-3 sm:self-center justify-between sm:justify-end border-t border-slate-800/80 sm:border-t-0 pt-3 sm:pt-0">

            <div className="text-left sm:text-right">
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-bold border ${badge.bg}`}>
                <span className={`h-2 w-2 rounded-full animate-pulse ${badge.dot}`} />
                <span>{badge.label}</span>
              </span>
              <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-1 justify-start sm:justify-end">
                <span>เป้าหมายถัดไป:</span>
                <span className="text-amber-300 font-semibold">{moonData.upcomingKeyPhase.symbol} {moonData.upcomingKeyPhase.nameTh}</span>
                <span className="text-slate-500">({moonData.upcomingKeyPhase.daysLeft} วัน)</span>
              </div>
            </div>

            <button
              id="toggle-moon-details-btn"
              onClick={() => {
                if (soundEnabled) playMysticChimeSound('soft');
                setIsExpanded(!isExpanded);
              }}
              className="flex items-center gap-1.5 rounded-xl border border-slate-700/80 bg-slate-900/80 hover:bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-200 transition-all active:scale-95 shadow-sm"
              title={isExpanded ? 'ย่อรายละเอียด' : 'ดูอิทธิพลและคำแนะนำ'}
            >
              <span className="hidden xs:inline">{isExpanded ? 'ซ่อน' : 'เจาะลึกอิทธิพล'}</span>
              <ChevronDown className={`h-4 w-4 text-amber-400 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
            </button>

          </div>

        </div>

        {/* Short Summary Bar (Always Visible) */}
        <div className="mt-3.5 pt-3 border-t border-slate-800/60 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-300 min-w-0">
            <span className="text-sm">🪐</span>
            <span className="truncate font-medium text-slate-300">
              <strong className="text-amber-300 mr-1">อิทธิพลจักรวาล:</strong>
              {moonData.cosmicEnergy.theme}
            </span>
          </div>

          <div className="shrink-0 text-[11px] text-purple-300 font-medium hidden md:block">
            {moonData.cosmicEnergy.elementalFocus}
          </div>
        </div>
      </div>

      {/* Expanded Astrological Insights Panel */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.28, ease: 'easeInOut' }}
            className="border-t border-slate-800/80 bg-slate-950/70 p-4 sm:p-6"
          >
            {/* Tabs for Detailed Lunar View */}
            <div className="flex items-center justify-between gap-2 border-b border-slate-800/80 pb-3 mb-4 flex-wrap">
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => {
                    if (soundEnabled) playMysticChimeSound('soft');
                    setActiveTab('influence');
                  }}
                  className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
                    activeTab === 'influence'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>ไวบ์ & พลังงานดวงดาว</span>
                </button>

                <button
                  onClick={() => {
                    if (soundEnabled) playMysticChimeSound('soft');
                    setActiveTab('actions');
                  }}
                  className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
                    activeTab === 'actions'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Zap className="h-3.5 w-3.5" />
                  <span>สิ่งที่ควรทำ / ควรเลี่ยง</span>
                </button>

                <button
                  onClick={() => {
                    if (soundEnabled) playMysticChimeSound('soft');
                    setActiveTab('mantra');
                  }}
                  className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
                    activeTab === 'mantra'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Heart className="h-3.5 w-3.5" />
                  <span>คาถา & คำเตือนสติแมว</span>
                </button>
              </div>

              {/* Energy Intensity Meter */}
              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-400 text-[11px]">ระดับคลื่นแรงดึงดูด:</span>
                <div className="w-24 h-2 rounded-full bg-slate-800 overflow-hidden border border-slate-700/80">
                  <div
                    className="h-full bg-gradient-to-r from-purple-500 via-amber-400 to-rose-400 rounded-full transition-all duration-500"
                    style={{ width: `${moonData.cosmicEnergy.intensityScore}%` }}
                  />
                </div>
                <span className="font-mono text-amber-300 font-bold text-xs">
                  {moonData.cosmicEnergy.intensityScore}%
                </span>
              </div>
            </div>

            {/* Tab 1: Cosmic Influence & Vibe */}
            {activeTab === 'influence' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* General Vibe Card */}
                  <div className="rounded-2xl bg-slate-900/80 border border-slate-800/80 p-4">
                    <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                      <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                      <span>กระแสคลื่นจิตวิญญาณในรอบนี้</span>
                    </h4>
                    <p className="text-xs text-slate-200 leading-relaxed font-medium">
                      {moonData.cosmicEnergy.vibe}
                    </p>
                    <div className="mt-3 pt-2.5 border-t border-slate-800/80 text-[11px] text-purple-300 flex items-center gap-1">
                      <span>จุดรวมธาตุ:</span>
                      <span className="text-slate-300">{moonData.cosmicEnergy.elementalFocus}</span>
                    </div>
                  </div>

                  {/* Lunar Phase Trajectory */}
                  <div className="rounded-2xl bg-slate-900/80 border border-slate-800/80 p-4 flex flex-col justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                        <Calendar className="h-3.5 w-3.5 text-cyan-400" />
                        <span>หมุดหมายถัดไปของพระจันทร์</span>
                      </h4>
                      <div className="flex items-center gap-3 my-2">
                        <span className="text-3xl">{moonData.upcomingKeyPhase.symbol}</span>
                        <div>
                          <div className="text-xs font-bold text-white">
                            {moonData.upcomingKeyPhase.nameTh}
                          </div>
                          <div className="text-[11px] text-slate-400">
                            คาดว่าจะถึงในอีก {moonData.upcomingKeyPhase.daysLeft} วัน ({moonData.upcomingKeyPhase.date})
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="text-[10px] text-slate-400 bg-slate-950/60 p-2 rounded-xl border border-slate-800/80">
                      💡 เคล็ดลับ: การตั้งจิตในวันจันทร์ดับ (New Moon) แล้วเก็บเกี่ยวผลลัพธ์ในวันจันทร์เพ็ญ (Full Moon) เป็นวัฏจักรธรรมชาติที่เสริมพลังจิตใต้สำนึกได้ดีที่สุด
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 2: Do's and Don'ts */}
            {activeTab === 'actions' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Do Actions */}
                <div className="rounded-2xl bg-emerald-950/20 border border-emerald-800/40 p-4">
                  <div className="flex items-center gap-2 mb-3 text-emerald-300 text-xs font-bold">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    <span>สิ่งที่ควรทำภายใต้อิทธิพลจันทร์นี้ (Do)</span>
                  </div>
                  <ul className="space-y-2">
                    {moonData.cosmicEnergy.doActions.map((item, idx) => (
                      <li key={`do-${idx}`} className="flex items-start gap-2 text-xs text-slate-200">
                        <span className="text-emerald-400 mt-0.5">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Avoid Actions */}
                <div className="rounded-2xl bg-rose-950/20 border border-rose-800/40 p-4">
                  <div className="flex items-center gap-2 mb-3 text-rose-300 text-xs font-bold">
                    <XCircle className="h-4 w-4 text-rose-400" />
                    <span>สิ่งที่ควรระวังและหลีกเลี่ยง (Avoid)</span>
                  </div>
                  <ul className="space-y-2">
                    {moonData.cosmicEnergy.avoidActions.map((item, idx) => (
                      <li key={`avoid-${idx}`} className="flex items-start gap-2 text-xs text-slate-200">
                        <span className="text-rose-400 mt-0.5">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Tab 3: Mantra & Cat Wisdom */}
            {activeTab === 'mantra' && (
              <div className="space-y-4">
                {/* Daily Affirmation Mantra */}
                <div className="rounded-2xl bg-gradient-to-r from-amber-500/15 via-purple-600/20 to-pink-500/15 border border-amber-500/30 p-4 relative">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold text-amber-300 flex items-center gap-1.5">
                      <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                      <span>คาถาจูนพลังงานจักรวาล (Lunar Cosmic Mantra)</span>
                    </span>
                    <button
                      onClick={copyMoonAffirmation}
                      className="text-[11px] font-semibold text-amber-300 hover:text-white flex items-center gap-1 transition-colors"
                    >
                      <Copy className="h-3 w-3" />
                      <span>คัดลอกคาถา</span>
                    </button>
                  </div>
                  <p className="text-sm sm:text-base font-serif-display italic text-amber-100 font-semibold text-center py-2">
                    "{moonData.cosmicEnergy.mantra}"
                  </p>
                </div>

                {/* Sassy Cat Advice */}
                <div className="rounded-2xl bg-slate-900/80 border border-slate-800/80 p-3.5 flex items-start gap-3">
                  <span className="text-2xl">🐾</span>
                  <div className="text-xs">
                    <span className="font-bold text-pink-300">แม่หมอแมวลิลลี่กระซิบเตือน:</span>
                    <p className="text-slate-300 mt-0.5 leading-relaxed italic">
                      "{moonData.cosmicEnergy.catWisdom}"
                    </p>
                  </div>
                </div>
              </div>
            )}

          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};
