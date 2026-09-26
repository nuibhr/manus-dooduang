import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  Heart,
  Briefcase,
  Coins,
  Brain,
  Shield,
  Zap,
  Info,
  ChevronRight,
  X,
  Share2,
  Check,
  Flame,
  Compass,
  Star,
  Layers,
  ArrowRight,
  TrendingUp,
  Award,
  Calendar,
  Clock,
  User,
  Users,
  Eye,
  RefreshCw,
  Sliders,
  HelpCircle,
  Gem
} from 'lucide-react';
import { FortuneReading } from '../types';
import { playMysticChimeSound } from '../utils/speechHelper';
import {
  ALL_ZODIAC_SIGNS,
  ZodiacSignInfo,
  UserBirthProfile,
  calculateBirthProfile,
  analyzeZodiacCompatibilityWithProfile,
  calculatePartnerSynastry,
  PartnerSynastryResult
} from '../utils/astrologyEngine';

export { ALL_ZODIAC_SIGNS, calculateBirthProfile, analyzeZodiacCompatibilityWithProfile, calculatePartnerSynastry };
export type { ZodiacSignInfo, UserBirthProfile, PartnerSynastryResult };

export interface ZodiacCompatibilityEngineProps {
  readingsHistory: FortuneReading[];
  birthProfile?: UserBirthProfile | null;
  onSaveBirthProfile?: (profile: UserBirthProfile) => void;
  onSelectSign?: (sign: ZodiacSignInfo) => void;
  onOpenChatWithTopic?: (topic: string) => void;
  soundEnabled?: boolean;
}

/**
 * Small Dynamic Badge for Dashboard and Navbar
 */
export const ZodiacCompatibilityBadge: React.FC<{
  readingsHistory: FortuneReading[];
  birthProfile?: UserBirthProfile | null;
  onClick?: () => void;
  className?: string;
}> = ({ readingsHistory, birthProfile, onClick, className = '' }) => {
  const analysis = useMemo(() => {
    return analyzeZodiacCompatibilityWithProfile(readingsHistory, birthProfile || undefined);
  }, [readingsHistory, birthProfile]);

  return (
    <motion.button
      whileHover={{ scale: 1.04, y: -1 }}
      whileTap={{ scale: 0.96 }}
      onClick={() => {
        playMysticChimeSound('card');
        if (onClick) onClick();
      }}
      className={`group relative flex items-center gap-2 rounded-full bg-gradient-to-r from-[#2A0E38] via-[#1E092B] to-[#361548] border border-[#EAC272]/40 px-3 py-1.5 text-xs shadow-md shadow-purple-950/40 hover:border-[#EAC272] transition-all cursor-pointer ${className}`}
      title="คลิกดูราศีคู่บุญและถอดรหัสลัคนา (Zodiac & Lagna Compatibility Engine)"
    >
      {/* Animated Subtle Pulse Indicator */}
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#EAC272] opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2 w-2 bg-[#EAC272]"></span>
      </span>

      {birthProfile ? (
        <>
          {/* User's Lagna */}
          <span className="font-serif-display text-sm text-[#FAE9CA] group-hover:scale-110 transition-transform">
            {birthProfile.lagnaSign.symbol}
          </span>

          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-bold text-[#FAE9CA] group-hover:text-[#EAC272] transition-colors">
              ลัคนา{birthProfile.lagnaSign.nameTh.replace('ราศี', '')} • คู่บุญ: {analysis.topSign.nameTh.replace('ราศี', '')}
            </span>
            <span className="rounded-full bg-[#842C71]/60 border border-[#EAC272]/40 px-1.5 py-0.2 text-[10px] font-black text-[#EAC272]">
              {analysis.topScore}%
            </span>
          </div>
        </>
      ) : (
        <>
          {/* Unconfigured Birth Date prompt */}
          <span className="font-serif-display text-sm text-[#EAC272]">
            ♈
          </span>
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-bold text-[#FAE9CA] group-hover:text-[#EAC272] transition-colors">
              วัด % ราศีคู่บุญ & ลัคนา
            </span>
            <span className="rounded-full bg-[#EAC272]/20 border border-[#EAC272]/50 px-1.5 py-0.2 text-[10px] font-semibold text-[#EAC272]">
              ใส่วันเกิด ✨
            </span>
          </div>
        </>
      )}

      <ChevronRight className="h-3 w-3 text-[#EAC272]/70 group-hover:translate-x-0.5 transition-transform" />
    </motion.button>
  );
};

/**
 * Detailed Modal for Zodiac & Lagna Compatibility Engine
 */
export const ZodiacCompatibilityModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  readingsHistory: FortuneReading[];
  initialBirthProfile?: UserBirthProfile | null;
  onSaveBirthProfile?: (profile: UserBirthProfile) => void;
  onOpenChatWithTopic?: (topic: string) => void;
  soundEnabled?: boolean;
}> = ({
  isOpen,
  onClose,
  readingsHistory,
  initialBirthProfile,
  onSaveBirthProfile,
  onOpenChatWithTopic,
  soundEnabled = true,
}) => {
  // Tabs: 'top' (ราศีคู่บุญหลัก), 'all12' (12 ราศี), 'matcher' (ตรวจดวงคู่รายคน), 'lagna' (เจาะลึกพลังลัคนา)
  const [activeTab, setActiveTab] = useState<'top' | 'all12' | 'matcher' | 'lagna'>('top');

  // Birth Profile Form State
  const [isEditingProfile, setIsEditingProfile] = useState<boolean>(false);
  const [inputBirthDate, setInputBirthDate] = useState<string>(() => {
    if (initialBirthProfile?.birthDate) return initialBirthProfile.birthDate;
    const saved = localStorage.getItem('thecatroom_birth_date');
    return saved || '1998-05-15';
  });
  const [inputBirthTime, setInputBirthTime] = useState<string>(() => {
    if (initialBirthProfile?.birthTime) return initialBirthProfile.birthTime;
    const saved = localStorage.getItem('thecatroom_birth_time');
    return saved || '08:30';
  });
  const [isTimeUnknown, setIsTimeUnknown] = useState<boolean>(() => {
    if (initialBirthProfile?.isTimeUnknown !== undefined) return initialBirthProfile.isTimeUnknown;
    const saved = localStorage.getItem('thecatroom_birth_time_unknown');
    return saved === 'true';
  });

  // Calculate current active UserBirthProfile
  const currentProfile = useMemo(() => {
    return calculateBirthProfile(inputBirthDate, inputBirthTime, isTimeUnknown);
  }, [inputBirthDate, inputBirthTime, isTimeUnknown]);

  // Compatibility analysis with current profile
  const analysis = useMemo(() => {
    return analyzeZodiacCompatibilityWithProfile(readingsHistory, currentProfile);
  }, [readingsHistory, currentProfile]);

  // Partner Matcher Form State
  const [partnerName, setPartnerName] = useState<string>('หวานใจ / เพื่อนสนิท');
  const [partnerBirthDate, setPartnerBirthDate] = useState<string>('1997-11-20');
  const [partnerBirthTime, setPartnerBirthTime] = useState<string>('14:15');
  const [partnerZodiacId, setPartnerZodiacId] = useState<string>('scorpio');
  const [partnerMode, setPartnerMode] = useState<'date' | 'sign'>('date');

  // Partner Synastry Result
  const partnerSynastry = useMemo(() => {
    return calculatePartnerSynastry(
      currentProfile,
      partnerMode === 'date' ? partnerBirthDate : '',
      partnerMode === 'date' ? partnerBirthTime : undefined,
      partnerMode === 'sign' ? partnerZodiacId : undefined,
      partnerName
    );
  }, [currentProfile, partnerBirthDate, partnerBirthTime, partnerZodiacId, partnerMode, partnerName]);

  const [selectedTargetSign, setSelectedTargetSign] = useState<ZodiacSignInfo | null>(null);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  // Sync to parent/storage on profile save
  const handleSaveProfile = () => {
    if (soundEnabled) playMysticChimeSound('gold');
    localStorage.setItem('thecatroom_birth_date', inputBirthDate);
    localStorage.setItem('thecatroom_birth_time', inputBirthTime);
    localStorage.setItem('thecatroom_birth_time_unknown', isTimeUnknown ? 'true' : 'false');
    localStorage.setItem('thecatroom_user_birth_profile', JSON.stringify(currentProfile));

    if (onSaveBirthProfile) {
      onSaveBirthProfile(currentProfile);
    }
    setIsEditingProfile(false);
  };

  const handleCopySummary = () => {
    if (soundEnabled) playMysticChimeSound('gold');
    const text = `🌟 ผลวิเคราะห์ลัคนา & ราศีคู่บุญหนุนดวง (สำนักดูดวงค่ะอีหญิง)\n` +
      `👤 ลัคนาของคุณ: ${currentProfile.lagnaSign.nameTh} (${currentProfile.lagnaSign.symbol}) • ราศีเกิด: ${currentProfile.sunSign.nameTh} • ${currentProfile.lunarYear.animalTh}\n` +
      `⭐ ราศีคู่บุญสูงสุด: ${analysis.topSign.nameTh} (${analysis.topSign.symbol}) ความสมพงษ์ ${analysis.topScore}%\n` +
      `🎯 ภารกิจหนุนดวงช่วงนี้: ${analysis.endeavorTitle}\n` +
      `💡 พลังดวงเกื้อหนุน: ${analysis.synergyReason}\n` +
      `😼 คำเตือนเพื่อนสาว: "${analysis.sassyAdvice}"`;

    navigator.clipboard.writeText(text);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  if (!isOpen) return null;

  const currentTargetSign = selectedTargetSign || analysis.topSign;
  const targetSignRank = analysis.signRankings.find(r => r.sign.id === currentTargetSign.id) || {
    score: 85,
    role: 'พันธมิตรเสริมพลัง',
    houseName: 'ภพสัมพันธ์',
    relationshipType: 'growth',
    elementMatch: 'ปกติ'
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-5 overflow-y-auto backdrop-blur-md bg-black/85 animate-in fade-in duration-200">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ duration: 0.25 }}
        className="relative w-full max-w-4xl rounded-3xl border border-[#EAC272]/30 bg-gradient-to-b from-[#1E0B2C] via-[#14061F] to-[#0A0210] text-[#FAE9CA] shadow-2xl shadow-purple-950/70 overflow-hidden my-auto max-h-[92vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#EAC272]/20 px-4 sm:px-6 py-3.5 bg-[#190825]/95 backdrop-blur-md sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#EAC272] via-[#D4A84D] to-[#842C71] text-2xl shadow-md text-[#110918]">
              {currentProfile.lagnaSign.symbol}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-serif-display text-lg sm:text-xl font-bold text-[#FAE9CA] tracking-wide">
                  Zodiac & Lagna Compatibility Engine
                </h2>
                <span className="rounded-full bg-[#842C71]/40 border border-[#EAC272]/30 px-2 py-0.5 text-[10px] font-semibold text-[#EAC272]">
                  ถอดรหัสลัคนา & ราศีคู่บุญ
                </span>
              </div>
              <p className="text-xs text-[#C9B49D]">
                คำนวณตามวันเดือนปีเกิดและเวลาเกิดจริง เจาะลึก % ดวงสมพงษ์ 12 ราศี
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopySummary}
              className="flex items-center gap-1.5 rounded-full bg-[#2A0E38] border border-[#EAC272]/30 px-3 py-1.5 text-xs text-[#EAC272] hover:bg-[#3D1452] transition-colors"
              title="แชร์ผลลัพธ์ดวงชะตา"
            >
              {copiedLink ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Share2 className="h-3.5 w-3.5" />}
              <span className="hidden sm:inline">{copiedLink ? 'คัดลอกแล้ว' : 'แชร์ผล'}</span>
            </button>

            <button
              onClick={onClose}
              className="h-9 w-9 rounded-full bg-[#2A0E38] border border-[#EAC272]/20 flex items-center justify-center text-[#C9B49D] hover:text-[#FAE9CA] hover:bg-[#3D1452] transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* User Birth Profile Summary Ribbon & Edit Button */}
        <div className="border-b border-[#EAC272]/20 bg-gradient-to-r from-[#2A0E38] via-[#1B0A26] to-[#2A0E38] px-4 sm:px-6 py-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs">
              <span className="text-sm">🪐</span>
              <div className="flex items-center gap-1.5 bg-[#170522] border border-[#EAC272]/30 rounded-xl px-2.5 py-1">
                <span className="text-[#C9B49D]">ลัคนา:</span>
                <span className="font-extrabold text-[#EAC272] flex items-center gap-1">
                  {currentProfile.lagnaSign.nameTh} ({currentProfile.lagnaSign.symbol})
                </span>
                <span className="text-[10px] text-[#C9B49D]/80">[{currentProfile.lagnaSign.elementTh}]</span>
              </div>

              <div className="flex items-center gap-1.5 bg-[#170522] border border-white/10 rounded-xl px-2.5 py-1">
                <span className="text-[#C9B49D]">ราศีเกิด:</span>
                <span className="font-semibold text-[#FAE9CA]">
                  {currentProfile.sunSign.nameTh}
                </span>
              </div>

              <div className="hidden md:flex items-center gap-1.5 bg-[#170522] border border-white/10 rounded-xl px-2.5 py-1">
                <span className="text-[#C9B49D]">ปีนักษัตร:</span>
                <span className="font-semibold text-[#FAE9CA]">
                  {currentProfile.lunarYear.symbol} {currentProfile.lunarYear.animalTh}
                </span>
              </div>

              <div className="hidden lg:flex items-center gap-1.5 bg-[#170522] border border-white/10 rounded-xl px-2.5 py-1 text-[11px] text-[#C9B49D]">
                <span>เวลาเกิด: {isTimeUnknown ? 'ไม่ระบุเวลา' : `${inputBirthTime} น.`}</span>
              </div>
            </div>

            <button
              onClick={() => {
                if (soundEnabled) playMysticChimeSound('soft');
                setIsEditingProfile(!isEditingProfile);
              }}
              className="flex items-center gap-1.5 rounded-xl bg-[#842C71]/40 border border-[#EAC272]/40 px-3 py-1 text-xs font-semibold text-[#FAE9CA] hover:bg-[#842C71] hover:text-white transition-all shadow-sm"
            >
              <Sliders className="h-3.5 w-3.5 text-[#EAC272]" />
              <span>{isEditingProfile ? 'ซ่อนการตั้งค่า' : 'แก้ไขวันเกิด & เวลาเกิด'}</span>
            </button>
          </div>

          {/* Collapsible Birth Profile Configuration Panel */}
          <AnimatePresence>
            {isEditingProfile && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-3 pt-3 border-t border-[#EAC272]/15 space-y-3"
              >
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  {/* Birth Date Input */}
                  <div className="space-y-1">
                    <label className="font-bold text-[#EAC272] flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5" /> วัน เดือน ปีเกิด (ค.ศ.)
                    </label>
                    <input
                      type="date"
                      value={inputBirthDate}
                      onChange={(e) => setInputBirthDate(e.target.value)}
                      className="w-full rounded-xl bg-[#12041B] border border-[#EAC272]/30 p-2 text-sm text-[#FAE9CA] focus:outline-none focus:border-[#EAC272]"
                    />
                    <span className="text-[10px] text-[#C9B49D] block">
                      ใช้คำนวณราศีเกิด, ปีนักษัตร และกาลโยค
                    </span>
                  </div>

                  {/* Birth Time Input */}
                  <div className="space-y-1">
                    <label className="font-bold text-[#EAC272] flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5" /> เวลาเกิด (ชั่วโมง:นาที)
                    </label>
                    <input
                      type="time"
                      value={inputBirthTime}
                      disabled={isTimeUnknown}
                      onChange={(e) => setInputBirthTime(e.target.value)}
                      className="w-full rounded-xl bg-[#12041B] border border-[#EAC272]/30 p-2 text-sm text-[#FAE9CA] disabled:opacity-40 focus:outline-none focus:border-[#EAC272]"
                    />
                    <div className="flex items-center gap-2 pt-0.5">
                      <input
                        type="checkbox"
                        id="time-unknown-check"
                        checked={isTimeUnknown}
                        onChange={(e) => setIsTimeUnknown(e.target.checked)}
                        className="rounded border-[#EAC272]/40 text-[#842C71] focus:ring-0"
                      />
                      <label htmlFor="time-unknown-check" className="text-[11px] text-[#C9B49D] cursor-pointer">
                        ไม่ทราบเวลาเกิดแน่นอน
                      </label>
                    </div>
                  </div>

                  {/* Instant Calculation Preview */}
                  <div className="rounded-2xl bg-[#150422] border border-[#EAC272]/20 p-3 space-y-1 flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">
                        ✨ ผลการคำนวณลัคนาสด:
                      </span>
                      <p className="text-xs text-[#FAE9CA] mt-0.5">
                        <strong className="text-[#EAC272]">ลัคนา{currentProfile.lagnaSign.nameTh}</strong> ({currentProfile.lagnaSign.symbol})
                      </p>
                      <p className="text-[11px] text-[#C9B49D]">
                        คู่แท้คู่บุญประจำลัคนา: <strong className="text-emerald-400">{currentProfile.soulmateSign.nameTh}</strong>
                      </p>
                    </div>

                    <button
                      onClick={handleSaveProfile}
                      className="w-full rounded-xl bg-gradient-to-r from-[#EAC272] to-[#D4A84D] text-[#110918] py-1.5 font-bold text-xs hover:brightness-110 shadow-md transition-all mt-2"
                    >
                      บันทึกข้อมูลดวงชะตา
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center border-b border-[#EAC272]/15 px-4 sm:px-6 bg-[#160621]/70 gap-2 py-2 overflow-x-auto">
          <button
            onClick={() => {
              if (soundEnabled) playMysticChimeSound('soft');
              setActiveTab('top');
            }}
            className={`flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all whitespace-nowrap ${
              activeTab === 'top'
                ? 'bg-gradient-to-r from-[#EAC272] to-[#D4A84D] text-[#110918] shadow-md shadow-[#EAC272]/20'
                : 'text-[#C9B49D] hover:text-[#FAE9CA] hover:bg-[#2A0E38]'
            }`}
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>ราศีคู่บุญสูงสุด ({analysis.topSign.nameTh} {analysis.topScore}%)</span>
          </button>

          <button
            onClick={() => {
              if (soundEnabled) playMysticChimeSound('card');
              setActiveTab('all12');
            }}
            className={`flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all whitespace-nowrap ${
              activeTab === 'all12'
                ? 'bg-gradient-to-r from-[#EAC272] to-[#D4A84D] text-[#110918] shadow-md shadow-[#EAC272]/20'
                : 'text-[#C9B49D] hover:text-[#FAE9CA] hover:bg-[#2A0E38]'
            }`}
          >
            <Layers className="h-3.5 w-3.5" />
            <span>ตารางวิเคราะห์ 12 ราศี</span>
          </button>

          <button
            onClick={() => {
              if (soundEnabled) playMysticChimeSound('soft');
              setActiveTab('matcher');
            }}
            className={`flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all whitespace-nowrap ${
              activeTab === 'matcher'
                ? 'bg-gradient-to-r from-[#EAC272] to-[#D4A84D] text-[#110918] shadow-md shadow-[#EAC272]/20'
                : 'text-[#C9B49D] hover:text-[#FAE9CA] hover:bg-[#2A0E38]'
            }`}
          >
            <Heart className="h-3.5 w-3.5 text-rose-400" />
            <span>วัดสมพงษ์รายบุคคล (Synastry Match)</span>
          </button>

          <button
            onClick={() => {
              if (soundEnabled) playMysticChimeSound('soft');
              setActiveTab('lagna');
            }}
            className={`flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all whitespace-nowrap ${
              activeTab === 'lagna'
                ? 'bg-gradient-to-r from-[#EAC272] to-[#D4A84D] text-[#110918] shadow-md shadow-[#EAC272]/20'
                : 'text-[#C9B49D] hover:text-[#FAE9CA] hover:bg-[#2A0E38]'
            }`}
          >
            <Gem className="h-3.5 w-3.5 text-amber-300" />
            <span>ถอดรหัสพลังลัคนาแท้จริง</span>
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">

          {/* TAB 1: TOP SOULMATE SIGN */}
          {activeTab === 'top' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Astrological Insight Banner */}
              <div className="rounded-2xl border border-[#EAC272]/30 bg-gradient-to-r from-[#291339] via-[#1B0B26] to-[#291339] p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-base">🎯</span>
                  <span className="text-[#C9B49D]">ภารกิจเด่นตามเกณฑ์ลัคนาช่วงนี้:</span>
                  <span className="font-bold text-[#FAE9CA]">{analysis.endeavorTitle}</span>
                </div>
                <span className="rounded-full bg-[#EAC272]/20 text-[#EAC272] font-semibold px-2.5 py-0.5">
                  {analysis.endeavorBadge}
                </span>
              </div>

              {/* Main Top Match Card */}
              <div className="relative rounded-3xl border-2 border-[#EAC272] bg-gradient-to-br from-[#2D123D] via-[#1F092A] to-[#120419] p-5 sm:p-7 overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 p-6 opacity-10 pointer-events-none select-none text-9xl font-serif">
                  {analysis.topSign.symbol}
                </div>

                <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
                  <div className="flex items-center gap-4">
                    <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-tr from-[#EAC272] to-[#842C71] text-5xl shadow-xl border border-amber-300">
                      {analysis.topSign.symbol}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="rounded-full bg-[#EAC272] px-2.5 py-0.5 text-[10px] font-black text-[#110918]">
                          TOP SOULMATE SIGN #1
                        </span>
                        <span className="text-xs text-[#C9B49D]">
                          ช่วงวันที่: {analysis.topSign.dateRange}
                        </span>
                      </div>
                      <h3 className="font-serif-display text-2xl sm:text-3xl font-extrabold text-[#FAE9CA] mt-1">
                        {analysis.topSign.nameTh} ({analysis.topSign.nameEn})
                      </h3>
                      <p className="text-xs text-[#EAC272] font-medium flex items-center gap-2 mt-0.5">
                        <span>{analysis.topSign.elementTh}</span>
                        <span>•</span>
                        <span>ดาวครองเรือน: {analysis.topSign.planet}</span>
                        <span>•</span>
                        <span className="text-emerald-400 font-bold">เล็งลัคนา{currentProfile.lagnaSign.nameTh}</span>
                      </p>
                    </div>
                  </div>

                  <div className="rounded-2xl bg-[#170522]/90 border border-[#EAC272]/30 p-4 text-center min-w-[140px]">
                    <span className="text-[11px] text-[#C9B49D] block">ดัชนีหนุนดวงคู่บุญ</span>
                    <span className="text-3xl sm:text-4xl font-black text-[#EAC272] tracking-tight">
                      {analysis.topScore}%
                    </span>
                    <span className="text-[10px] text-emerald-400 font-bold block mt-0.5">
                      ⭐ กัลยาณมิตรคู่บุญบารมี
                    </span>
                  </div>
                </div>

                {/* Cosmic Synergy Explanation */}
                <div className="mt-5 rounded-2xl bg-[#180824]/80 border border-[#EAC272]/20 p-4 space-y-2">
                  <h4 className="text-xs font-bold text-[#EAC272] flex items-center gap-1.5 uppercase">
                    <Sparkles className="h-3.5 w-3.5" /> ทำไมลัคนาของคุณถึงสมพงษ์กับราศีนี้สูงสุด?
                  </h4>
                  <p className="text-xs sm:text-sm text-[#FAE9CA] leading-relaxed">
                    {analysis.synergyReason}
                  </p>
                </div>

                {/* Sassy Bestie Advice */}
                <div className="mt-3 rounded-2xl border border-rose-500/30 bg-rose-950/25 p-4 flex items-start gap-3">
                  <span className="text-2xl flex-shrink-0">😼</span>
                  <div className="space-y-1">
                    <span className="text-[11px] font-bold text-rose-300 uppercase block">
                      คำเตือนสไตล์แม่หมอเหมียว (ฉบับกวนๆ ไม่อวย):
                    </span>
                    <p className="text-xs sm:text-sm text-[#FAE9CA] italic leading-relaxed">
                      "{analysis.sassyAdvice}"
                    </p>
                  </div>
                </div>

                {/* Collaborative Action Plan */}
                <div className="mt-4 pt-4 border-t border-[#EAC272]/15">
                  <span className="text-xs font-bold text-[#FAE9CA] block mb-2">
                    ✨ 3 ก้าวเสริมพลังร่วมกับชาว{analysis.topSign.nameTh}:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    {analysis.collaborativeActions.map((act, i) => (
                      <div key={i} className="rounded-xl bg-[#14051E] border border-white/5 p-3 text-xs text-[#C9B49D] leading-relaxed">
                        <span className="text-[#EAC272] font-bold block mb-1">ก้าวที่ {i + 1}</span>
                        {act}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Secondary Sign & Caution Sign Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Secondary Sign */}
                <div className="rounded-2xl border border-purple-500/30 bg-[#1D0A2A]/70 p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-purple-300 flex items-center gap-1.5">
                      <Star className="h-4 w-4 text-amber-400" /> กองหนุนสำรองอันดับ 2
                    </span>
                    <span className="text-sm font-black text-[#FAE9CA]">
                      {analysis.secondaryScore}%
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{analysis.secondarySign.symbol}</span>
                    <div>
                      <h4 className="font-bold text-sm text-[#FAE9CA]">
                        {analysis.secondarySign.nameTh} ({analysis.secondarySign.nameEn})
                      </h4>
                      <p className="text-[11px] text-[#C9B49D]">
                        {analysis.secondarySign.elementTh} • {analysis.secondarySign.strengths.join(', ')}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Caution Sign */}
                <div className="rounded-2xl border border-amber-500/30 bg-[#251508]/70 p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                      <Shield className="h-4 w-4 text-amber-400" /> ราศีที่ต้องใจเย็นเป็นพิเศษ
                    </span>
                    <span className="text-xs text-[#C9B49D]">
                      คลื่นพลังสวนทางชั่วคราว
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{analysis.cautionSign.symbol}</span>
                    <div>
                      <h4 className="font-bold text-sm text-[#FAE9CA]">
                        {analysis.cautionSign.nameTh} ({analysis.cautionSign.nameEn})
                      </h4>
                      <p className="text-[11px] text-[#C9B49D]">
                        {analysis.cautionReason}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 2: ALL 12 SIGNS RANKING */}
          {activeTab === 'all12' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="rounded-2xl border border-[#EAC272]/20 bg-[#1A0826]/70 p-3.5 text-xs text-[#C9B49D] flex flex-wrap items-center justify-between gap-2">
                <span>
                  🌌 ตารางจัดอันดับความสมพงษ์ของทั้ง 12 ราศี โดยเทียบกับลัคนา <strong className="text-[#EAC272]">{currentProfile.lagnaSign.nameTh}</strong> ของคุณ
                </span>
                <span className="text-[#EAC272] font-semibold">
                  เรียงตามภพชะตา & คะแนนคู่บุญ
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {analysis.signRankings.map((item, idx) => (
                  <div
                    key={item.sign.id}
                    onClick={() => {
                      setSelectedTargetSign(item.sign);
                      setPartnerZodiacId(item.sign.id);
                      setPartnerMode('sign');
                      setActiveTab('matcher');
                    }}
                    className={`rounded-2xl border p-3.5 flex items-center justify-between transition-all cursor-pointer hover:scale-[1.02] ${
                      idx === 0
                        ? 'border-[#EAC272] bg-gradient-to-r from-[#3D1452] to-[#250D32] shadow-md shadow-amber-500/20'
                        : 'border-[#EAC272]/20 bg-[#1B0A29]/70 hover:border-[#EAC272]/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#12041A] border border-white/10 text-2xl">
                        {item.sign.symbol}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-xs text-[#FAE9CA]">
                            #{idx + 1} {item.sign.nameTh}
                          </span>
                          <span className="text-[10px] text-[#C9B49D]">
                            ({item.sign.nameEn})
                          </span>
                        </div>
                        <div className="text-[10px] text-amber-300 font-medium mt-0.5">
                          {item.houseName}
                        </div>
                        <span className="text-[10px]" style={{ color: item.sign.elementColor }}>
                          {item.sign.elementTh} • {item.elementMatch.split('(')[0]}
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-base font-black text-[#EAC272] block">
                        {item.score}%
                      </span>
                      <span className="text-[9px] text-[#C9B49D] hover:underline">
                        ตรวจดวงคู่ →
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* TAB 3: PARTNER MATCHMAKER CALCULATOR */}
          {activeTab === 'matcher' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Partner Input Controls */}
              <div className="rounded-3xl border border-[#EAC272]/30 bg-gradient-to-br from-[#250E36] to-[#12041C] p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">💘</span>
                    <h3 className="font-serif-display text-base sm:text-lg font-bold text-[#FAE9CA]">
                      เครื่องคำนวณดวงสมพงษ์คู่บุญรายบุคคล (Synastry Meter)
                    </h3>
                  </div>

                  {/* Mode switch: Date vs Sign */}
                  <div className="flex rounded-xl bg-[#12041B] p-1 border border-white/10 text-xs">
                    <button
                      onClick={() => setPartnerMode('date')}
                      className={`px-3 py-1 rounded-lg font-medium transition-all ${
                        partnerMode === 'date' ? 'bg-[#EAC272] text-[#110918] font-bold' : 'text-[#C9B49D]'
                      }`}
                    >
                      ระบุวันเกิด
                    </button>
                    <button
                      onClick={() => setPartnerMode('sign')}
                      className={`px-3 py-1 rounded-lg font-medium transition-all ${
                        partnerMode === 'sign' ? 'bg-[#EAC272] text-[#110918] font-bold' : 'text-[#C9B49D]'
                      }`}
                    >
                      เลือกราศีตรงๆ
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  {/* Partner Name */}
                  <div className="space-y-1">
                    <label className="font-semibold text-[#C9B49D]">
                      ชื่อ / ชื่อเล่นของคนที่จะดู:
                    </label>
                    <input
                      type="text"
                      value={partnerName}
                      onChange={(e) => setPartnerName(e.target.value)}
                      placeholder="เช่น พี่ต้น, น้องมินท์, คุณลูกค้า"
                      className="w-full rounded-xl bg-[#150522] border border-[#EAC272]/30 p-2.5 text-sm text-[#FAE9CA] focus:outline-none focus:border-[#EAC272]"
                    />
                  </div>

                  {partnerMode === 'date' ? (
                    <>
                      {/* Partner Birth Date */}
                      <div className="space-y-1">
                        <label className="font-semibold text-[#C9B49D]">
                          วันเดือนปีเกิดของเขา:
                        </label>
                        <input
                          type="date"
                          value={partnerBirthDate}
                          onChange={(e) => setPartnerBirthDate(e.target.value)}
                          className="w-full rounded-xl bg-[#150522] border border-[#EAC272]/30 p-2 text-sm text-[#FAE9CA] focus:outline-none focus:border-[#EAC272]"
                        />
                      </div>

                      {/* Partner Birth Time */}
                      <div className="space-y-1">
                        <label className="font-semibold text-[#C9B49D]">
                          เวลาเกิด (ถ้าทราบ):
                        </label>
                        <input
                          type="time"
                          value={partnerBirthTime}
                          onChange={(e) => setPartnerBirthTime(e.target.value)}
                          className="w-full rounded-xl bg-[#150522] border border-[#EAC272]/30 p-2 text-sm text-[#FAE9CA] focus:outline-none focus:border-[#EAC272]"
                        />
                      </div>
                    </>
                  ) : (
                    /* Partner Direct Zodiac Picker */
                    <div className="sm:col-span-2 space-y-1">
                      <label className="font-semibold text-[#C9B49D]">
                        เลือกระบุราศีของเขา:
                      </label>
                      <select
                        value={partnerZodiacId}
                        onChange={(e) => setPartnerZodiacId(e.target.value)}
                        className="w-full rounded-xl bg-[#150522] border border-[#EAC272]/30 p-2.5 text-sm text-[#FAE9CA] focus:outline-none focus:border-[#EAC272]"
                      >
                        {ALL_ZODIAC_SIGNS.map(s => (
                          <option key={s.id} value={s.id} className="bg-[#150522]">
                            {s.symbol} {s.nameTh} ({s.nameEn}) - {s.elementTh}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              </div>

              {/* Synastry Match Result Display */}
              <div className="rounded-3xl border-2 border-[#EAC272] bg-gradient-to-br from-[#2D123F] via-[#1D0A2B] to-[#120419] p-5 sm:p-7 space-y-5 shadow-2xl">
                {/* Result Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-[#EAC272]/20">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center -space-x-3">
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#EAC272] to-[#842C71] text-3xl shadow-lg border border-amber-300 z-10">
                        {currentProfile.lagnaSign.symbol}
                      </div>
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#842C71] to-[#3B82F6] text-3xl shadow-lg border border-white/20">
                        {partnerSynastry.partnerSunSign.symbol}
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-serif-display text-lg sm:text-xl font-bold text-[#FAE9CA]">
                          {partnerName}
                        </span>
                        <span className="rounded-full bg-[#EAC272]/20 border border-[#EAC272]/40 text-[#EAC272] px-2.5 py-0.5 text-[11px] font-bold">
                          {partnerSynastry.tierBadge}
                        </span>
                      </div>
                      <p className="text-xs text-[#C9B49D] mt-0.5">
                        {partnerSynastry.partnerSunSign.nameTh} ({partnerSynastry.partnerSunSign.elementTh})
                        {partnerSynastry.partnerLagnaSign && ` • ลัคนา${partnerSynastry.partnerLagnaSign.nameTh}`}
                        {partnerSynastry.partnerLunarYear && ` • ${partnerSynastry.partnerLunarYear.animalTh}`}
                      </p>
                    </div>
                  </div>

                  <div className="rounded-2xl bg-[#14041F] border border-[#EAC272]/30 px-5 py-3 text-center sm:text-right w-full sm:w-auto">
                    <span className="text-[10px] text-[#C9B49D] block uppercase">ความสมพงษ์คู่ชะตา</span>
                    <span className="text-4xl font-black text-[#EAC272] tracking-tight">
                      {partnerSynastry.compatibilityScore}%
                    </span>
                    <span className="text-[11px] font-bold text-purple-300 block mt-0.5">
                      {partnerSynastry.relationshipTier}
                    </span>
                  </div>
                </div>

                {/* Core Astrological Chemistry */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div className="rounded-2xl bg-[#14051D] border border-white/10 p-3.5 space-y-1">
                    <span className="font-bold text-[#EAC272] flex items-center gap-1.5">
                      🪐 เคมีลัคนา & ภพชะตา:
                    </span>
                    <p className="text-[#FAE9CA] leading-relaxed">
                      {partnerSynastry.lagnaSynergy}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-[#14051D] border border-white/10 p-3.5 space-y-1">
                    <span className="font-bold text-[#EAC272] flex items-center gap-1.5">
                      🔥 พลังธาตุสัมพันธ์:
                    </span>
                    <p className="text-[#FAE9CA] leading-relaxed">
                      {partnerSynastry.elementSynergy}
                    </p>
                  </div>
                </div>

                {/* Lunar Year Connection */}
                {partnerSynastry.lunarYearSynergy && (
                  <div className="rounded-2xl bg-[#180826]/80 border border-amber-500/20 p-3.5 text-xs text-[#FAE9CA] flex items-center gap-2.5">
                    <span className="text-xl">🐉</span>
                    <span>{partnerSynastry.lunarYearSynergy}</span>
                  </div>
                )}

                {/* Sassy Verdict */}
                <div className="rounded-2xl border border-rose-500/30 bg-rose-950/25 p-4 flex items-start gap-3">
                  <span className="text-2xl flex-shrink-0">😼</span>
                  <div className="space-y-1">
                    <span className="text-[11px] font-bold text-rose-300 uppercase block">
                      คำทำนาย & ฟันธงสไตล์แม่หมอเหมียว:
                    </span>
                    <p className="text-xs sm:text-sm text-[#FAE9CA] italic leading-relaxed">
                      "{partnerSynastry.sassyAdvice}"
                    </p>
                  </div>
                </div>

                {/* Strengths & Cautions */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="rounded-2xl bg-[#13051C] border border-emerald-500/20 p-3.5 space-y-2">
                    <span className="font-bold text-emerald-400 block">
                      ✨ จุดเกื้อหนุนเมื่ออยู่ด้วยกัน:
                    </span>
                    <ul className="space-y-1 text-[#C9B49D]">
                      {partnerSynastry.strengthsTogether.map((st, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span className="text-emerald-400">✓</span> {st}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="rounded-2xl bg-[#13051C] border border-amber-500/20 p-3.5 space-y-2">
                    <span className="font-bold text-amber-400 block">
                      ⚠️ จุดที่ต้องระวัง & ดึงสติ:
                    </span>
                    <ul className="space-y-1 text-[#C9B49D]">
                      {partnerSynastry.cautionPoints.map((cp, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span className="text-amber-400">!</span> {cp}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 4: DEEP LAGNA IDENTITY BREAKDOWN */}
          {activeTab === 'lagna' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Lagna vs Sun Comparison Banner */}
              <div className="rounded-3xl border border-[#EAC272]/30 bg-gradient-to-br from-[#260E36] to-[#12041C] p-5 sm:p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">🔮</span>
                  <div>
                    <h3 className="font-serif-display text-lg sm:text-xl font-bold text-[#FAE9CA]">
                      ไขความลับ: "ลัคนา" กับ "ราศีเกิด" ต่างกันอย่างไร?
                    </h3>
                    <p className="text-xs text-[#C9B49D]">
                      ศาสตร์โบราณชี้ว่า เวลาเกิดคือจุดกำหนดโชคชะตาที่แม่นยำที่สุด
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="rounded-2xl bg-[#150422] border border-[#EAC272]/30 p-4 space-y-2">
                    <span className="text-xs font-bold text-[#EAC272] flex items-center gap-1.5">
                      <span>🪐</span> ลัคนา (Lagna / Ascendant) — ตัวตนแท้จริง
                    </span>
                    <p className="text-[#FAE9CA] leading-relaxed">
                      คำนวณจาก <strong>เวลาเกิดจริง</strong> ของคุณ คือราศีที่กำลังขึ้นจากขอบฟ้าทิศตะวันออก บ่งบอกถึงตัวตน จิตใต้สำนึก บุคลิกหน้าตา ท่าทาง และโชคชะตารายปีที่แท้จริง
                    </p>
                    <div className="pt-1 text-[11px] text-emerald-400 font-semibold">
                      ลัคนาของคุณ: {currentProfile.lagnaSign.nameTh} ({currentProfile.lagnaSign.elementTh})
                    </div>
                  </div>

                  <div className="rounded-2xl bg-[#150422] border border-white/10 p-4 space-y-2">
                    <span className="text-xs font-bold text-[#FAE9CA] flex items-center gap-1.5">
                      <span>☀️</span> ราศีเกิด (Sun Sign) — ภาพลักษณ์ภายนอก
                    </span>
                    <p className="text-[#C9B49D] leading-relaxed">
                      คำนวณจาก <strong>วันและเดือนเกิด</strong> บ่งบอกเป้าหมายชีวิต สิ่งที่คุณอยากเป็น และพลังงานพื้นฐานที่คุณแสดงออกต่อสายตาคนภายนอก
                    </p>
                    <div className="pt-1 text-[11px] text-[#EAC272] font-semibold">
                      ราศีเกิดของคุณ: {currentProfile.sunSign.nameTh} ({currentProfile.sunSign.elementTh})
                    </div>
                  </div>
                </div>
              </div>

              {/* Deep Lagna Profile Card */}
              <div className="rounded-3xl border border-[#EAC272]/30 bg-gradient-to-br from-[#2D123E] via-[#1D0A2B] to-[#120419] p-5 sm:p-7 space-y-5">
                <div className="flex items-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#EAC272] to-[#842C71] text-4xl shadow-lg border border-amber-300">
                    {currentProfile.lagnaSign.symbol}
                  </div>
                  <div>
                    <span className="text-xs font-bold text-[#EAC272] uppercase tracking-wide">
                      อัตลักษณ์แห่งจิตวิญญาณของคุณ
                    </span>
                    <h4 className="font-serif-display text-2xl font-black text-[#FAE9CA] mt-0.5">
                      ลัคนาราศี{currentProfile.lagnaSign.nameTh.replace('ราศี', '')} ({currentProfile.lagnaSign.nameEn})
                    </h4>
                    <p className="text-xs text-[#C9B49D]">
                      {currentProfile.lagnaSign.elementTh} • ครองโดย {currentProfile.lagnaSign.planet}
                    </p>
                  </div>
                </div>

                <div className="rounded-2xl bg-[#14051D] border border-white/10 p-4 space-y-2">
                  <span className="text-xs font-bold text-[#EAC272] block">
                    💫 บุคลิกและชะตาชีวิตแท้จริงของลัคนา{currentProfile.lagnaSign.nameTh}:
                  </span>
                  <p className="text-xs sm:text-sm text-[#FAE9CA] leading-relaxed">
                    {currentProfile.lagnaDescription}
                  </p>
                </div>

                {/* Auspicious Houses */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="rounded-2xl bg-[#170624] border border-[#EAC272]/20 p-3.5 space-y-1">
                    <span className="text-[#C9B49D] block">ภพปัตนิ (คู่แท้คู่บุญ):</span>
                    <span className="font-bold text-[#EAC272] text-sm block">
                      {currentProfile.soulmateSign.symbol} {currentProfile.soulmateSign.nameTh}
                    </span>
                    <span className="text-[10px] text-[#C9B49D]">
                      ตรงข้ามลัคนา เติมเต็มพลังบารมี
                    </span>
                  </div>

                  <div className="rounded-2xl bg-[#170624] border border-[#EAC272]/20 p-3.5 space-y-1">
                    <span className="text-[#C9B49D] block">ตรีโกณร่วมธาตุ (คู่มิตรแท้):</span>
                    <span className="font-bold text-[#FAE9CA] text-sm block">
                      {currentProfile.trineSigns.map(s => `${s.symbol} ${s.nameTh.replace('ราศี', '')}`).join(' & ')}
                    </span>
                    <span className="text-[10px] text-[#C9B49D]">
                      เข้าใจกันโดยไม่ต้องอธิบาย
                    </span>
                  </div>

                  <div className="rounded-2xl bg-[#170624] border border-[#EAC272]/20 p-3.5 space-y-1">
                    <span className="text-[#C9B49D] block">ภพลาภะ (คู่ทรัพย์คู่รวย):</span>
                    <span className="font-bold text-amber-400 text-sm block">
                      {currentProfile.wealthSign.symbol} {currentProfile.wealthSign.nameTh}
                    </span>
                    <span className="text-[10px] text-[#C9B49D]">
                      พากันหาเงินและต่อยอดโชคลาภ
                    </span>
                  </div>
                </div>

                {/* Sassy Roast */}
                <div className="rounded-2xl border border-rose-500/25 bg-rose-950/20 p-4 flex items-start gap-3">
                  <span className="text-xl flex-shrink-0">😼</span>
                  <div className="text-xs space-y-1">
                    <span className="font-bold text-rose-300">
                      เตือนสติตัวเองตามลัคนา:
                    </span>
                    <p className="text-[#FAE9CA] italic">
                      "{currentProfile.sunDescription}"
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

        </div>

        {/* Footer */}
        <div className="border-t border-[#EAC272]/20 px-4 sm:px-6 py-3.5 bg-[#170622]/95 flex items-center justify-between text-xs text-[#C9B49D]">
          <div className="flex items-center gap-2">
            <span className="text-sm">🐾</span>
            <span>ดูดวงค่ะอีหญิง • Thai Astrology & Lagna Compatibility</span>
          </div>

          <button
            onClick={onClose}
            className="hover:text-[#FAE9CA] font-medium"
          >
            ปิดหน้าต่าง
          </button>
        </div>
      </motion.div>
    </div>
  );
};
