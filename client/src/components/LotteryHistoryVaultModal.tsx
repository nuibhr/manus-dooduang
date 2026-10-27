import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  History,
  Coins,
  X,
  Sparkles,
  Check,
  Copy,
  Flame,
  Calendar,
  Award,
  ShieldCheck,
  ChevronRight,
  Layers,
  TrendingUp,
  ExternalLink
} from 'lucide-react';
import {
  HISTORICAL_LOTTERY_DRAWS,
  TOP_TWO_DIGIT_STATS,
  RUNNER_DIGIT_STATS,
  DAY_OF_WEEK_LOTTERY_STATS,
  HistoricalLotteryDraw
} from '../data/lotteryStatsData';
import { getUnlockedLotteryVault, UnlockedLotteryRecord } from '../utils/fateDatabase';
import { playMysticChimeSound } from '../utils/speechHelper';

interface LotteryHistoryVaultModalProps {
  isOpen: boolean;
  onClose: () => void;
  coins: number;
  onOpenTopUp: () => void;
  onUnlockNewLottery?: () => void;
  onShowToast: (msg: string) => void;
}

export const LotteryHistoryVaultModal: React.FC<LotteryHistoryVaultModalProps> = ({
  isOpen,
  onClose,
  coins,
  onOpenTopUp,
  onUnlockNewLottery,
  onShowToast,
}) => {
  const [activeTab, setActiveTab] = useState<'user_vault' | 'historical_stats' | 'day_stats'>('user_vault');
  const [unlockedRecords, setUnlockedRecords] = useState<UnlockedLotteryRecord[]>([]);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      const records = getUnlockedLotteryVault();
      setUnlockedRecords(records);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    onShowToast(`คัดลอกเลข ${text} เรียบร้อยแล้ว!`);
    playMysticChimeSound('chime');
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0C0412]/80 backdrop-blur-md p-4 overflow-y-auto">
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="relative my-8 w-full max-w-2xl rounded-[32px] bg-gradient-to-b from-[#260D33] via-[#1A0724] to-[#100315] p-6 sm:p-7 border-2 border-[rgba(242,203,128,0.35)] shadow-2xl shadow-[#110918] max-h-[92vh] overflow-y-auto text-left"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 rounded-full bg-[#180824] p-2 text-[#C9B49D] hover:text-[#FAE9CA] border border-[rgba(242,203,128,0.2)] hover:border-[#EAC272] transition-all cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 border-b border-[rgba(242,203,128,0.15)] pb-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#3D144E] to-[#842C71] border border-[#EAC272] text-2xl shadow-lg">
            🎰
          </div>
          <div>
            <h3 className="font-serif-display text-lg sm:text-xl text-[#FAE9CA] font-bold flex items-center gap-2">
              <span>คลังเลขเด็ด & สถิติหวยรัฐบาลไทย</span>
            </h3>
            <p className="text-xs text-[#C9B49D] mt-0.5">
              บันทึกทุกเลขที่คุณเคยจ่ายเหรียญเปิด เทียบสถิติรางวัลจริงย้อนหลัง
            </p>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex rounded-xl bg-[#110417] p-1 border border-[rgba(242,203,128,0.15)] my-4 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('user_vault')}
            className={`flex-1 py-2 rounded-lg transition-all text-center flex items-center justify-center gap-1.5 ${
              activeTab === 'user_vault'
                ? 'bg-gradient-to-r from-[#EAC272] to-[#D4A84D] text-[#110918] font-bold shadow'
                : 'text-[#C9B49D] hover:text-[#FAE9CA]'
            }`}
          >
            <span>📜</span>
            <span>เลขที่คุณเคยเปิด ({unlockedRecords.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('historical_stats')}
            className={`flex-1 py-2 rounded-lg transition-all text-center flex items-center justify-center gap-1.5 ${
              activeTab === 'historical_stats'
                ? 'bg-gradient-to-r from-[#EAC272] to-[#D4A84D] text-[#110918] font-bold shadow'
                : 'text-[#C9B49D] hover:text-[#FAE9CA]'
            }`}
          >
            <span>📊</span>
            <span>สถิติหวยออกจริงย้อนหลัง</span>
          </button>
          <button
            onClick={() => setActiveTab('day_stats')}
            className={`flex-1 py-2 rounded-lg transition-all text-center flex items-center justify-center gap-1.5 ${
              activeTab === 'day_stats'
                ? 'bg-gradient-to-r from-[#EAC272] to-[#D4A84D] text-[#110918] font-bold shadow'
                : 'text-[#C9B49D] hover:text-[#FAE9CA]'
            }`}
          >
            <span>📅</span>
            <span>สถิติตามวันในสัปดาห์</span>
          </button>
        </div>

        {/* TAB 1: USER UNLOCKED LOTTERY VAULT */}
        {activeTab === 'user_vault' && (
          <div className="space-y-4">
            {unlockedRecords.length === 0 ? (
              <div className="rounded-2xl border-2 border-dashed border-[rgba(242,203,128,0.25)] p-8 text-center space-y-3 bg-[#14061A]/60">
                <span className="text-4xl block">🔒</span>
                <h4 className="font-serif-display text-base text-[#FAE9CA] font-bold">
                  ยังไม่มีประวัติการปลดล็อกเลขเด็ด
                </h4>
                <p className="text-xs text-[#C9B49D] max-w-sm mx-auto">
                  ทุกครั้งที่คุณจ่ายเหรียญขอเลขเด็ดผ่านแม่หมอเหมียว AI หรือหน้ารหัสเลขมงคล ระบบจะบันทึกเลขและเปรียบเทียบกับผลหวยย้อนหลังให้อัตโนมัติที่นี่!
                </p>
                {onUnlockNewLottery && (
                  <button
                    onClick={() => {
                      onClose();
                      onUnlockNewLottery();
                    }}
                    className="btn-gilded px-5 py-2.5 text-xs font-bold text-[#110918] rounded-xl cursor-pointer"
                  >
                    <span>ปลดล็อกเลขงวดนี้ทันที (15C)</span>
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {unlockedRecords.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-2xl bg-[#190724] border border-[rgba(242,203,128,0.2)] p-4 space-y-3 hover:border-[#EAC272]/60 transition-all shadow-md"
                  >
                    {/* Top Row: Period and Coins Spent */}
                    <div className="flex items-center justify-between border-b border-[rgba(242,203,128,0.12)] pb-2 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[#FAE9CA]">{item.drawPeriod}</span>
                        <span className="text-[10px] text-[#A89279]">({item.dateCreated})</span>
                      </div>
                      <span className="flex items-center gap-1 text-[11px] font-bold text-[#EAC272] bg-[#110417] px-2.5 py-0.5 rounded-full border border-[#EAC272]/30">
                        <Coins className="h-3 w-3" /> จ่าย {item.coinsSpent} เหรียญ
                      </span>
                    </div>

                    {/* Number Badges */}
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="rounded-xl bg-[#110417] p-2 border border-[rgba(242,203,128,0.15)]">
                        <span className="text-[10px] text-[#A89279] block mb-0.5">เลขวิ่งเดี่ยว</span>
                        <span className="text-xl font-black text-[#EAC272]">{item.primeRunner}</span>
                      </div>

                      <div className="rounded-xl bg-[#110417] p-2 border border-[rgba(242,203,128,0.15)]">
                        <span className="text-[10px] text-[#A89279] block mb-0.5">เลขท้าย 2 ตัว</span>
                        <div className="flex items-center justify-center gap-1 flex-wrap">
                          {item.twoDigits.map((n, i) => (
                            <button
                              key={i}
                              onClick={() => handleCopy(n, `${item.id}-2d-${i}`)}
                              className="text-xs font-bold text-[#FAE9CA] bg-[#2A0E38] px-2 py-0.5 rounded-md hover:bg-[#3D144E] cursor-pointer"
                              title="แตะเพื่อคัดลอก"
                            >
                              {n}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="rounded-xl bg-[#110417] p-2 border border-[rgba(242,203,128,0.15)]">
                        <span className="text-[10px] text-[#A89279] block mb-0.5">เลข 3 ตัว</span>
                        <div className="flex items-center justify-center gap-1 flex-wrap">
                          {item.threeDigits.map((n, i) => (
                            <button
                              key={i}
                              onClick={() => handleCopy(n, `${item.id}-3d-${i}`)}
                              className="text-xs font-bold text-[#EAC272] bg-[#2A0E38] px-2 py-0.5 rounded-md hover:bg-[#3D144E] cursor-pointer"
                              title="แตะเพื่อคัดลอก"
                            >
                              {n}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Historical Match Cross-Check */}
                    {item.matchedDraws && item.matchedDraws.length > 0 && (
                      <div className="rounded-xl bg-emerald-950/40 border border-emerald-500/30 p-2.5 text-[11px] text-emerald-300 space-y-1">
                        <span className="font-bold flex items-center gap-1">
                          <Award className="h-3.5 w-3.5 text-emerald-400" />
                          ตรงกับสถิติรางวัลย้อนหลัง:
                        </span>
                        {item.matchedDraws.map((m, idx) => (
                          <p key={idx} className="pl-4 text-[10px] text-emerald-200">
                            • {m.prizeType}: เลข {m.matchedNumbers.join(', ')}
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: HISTORICAL THAI LOTTERY STATS */}
        {activeTab === 'historical_stats' && (
          <div className="space-y-4">
            {/* Top 2-digit statistics */}
            <div className="rounded-2xl bg-[#14061A] p-4 border border-[rgba(242,203,128,0.18)] space-y-2.5">
              <div className="flex items-center justify-between text-xs text-[#EAC272] font-bold">
                <span className="flex items-center gap-1.5">
                  <Flame className="h-4 w-4 text-rose-400" />
                  สถิติเลขท้าย 2 ตัวที่ออกบ่อยที่สุด (Top 12)
                </span>
                <span className="text-[10px] text-[#A89279]">สถิติ 120 งวด</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
                {TOP_TWO_DIGIT_STATS.map((stat, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-xl bg-[#1C0A26] border border-[rgba(242,203,128,0.12)] flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="text-base font-black text-[#EAC272] block">{stat.number}</span>
                      <span className="text-[9px] text-[#A89279]">งวดล่าสุด: {stat.lastAppeared}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-bold text-rose-300 block">{stat.count} ครั้ง</span>
                      <span className="text-[9px] text-[#C9B49D]">{stat.percentage}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Runner Digits */}
            <div className="rounded-2xl bg-[#14061A] p-4 border border-[rgba(242,203,128,0.18)] space-y-2">
              <span className="text-xs text-[#FAE9CA] font-bold block">
                เลขวิ่งเด่น (ความถี่เลขโดด 0 - 9 ใน 2 ตัวท้าย):
              </span>
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {RUNNER_DIGIT_STATS.slice(0, 5).map((r, i) => (
                  <div
                    key={i}
                    className="p-2 rounded-xl bg-[#2A0E38] border border-[#EAC272]/30 text-center shrink-0 min-w-[70px]"
                  >
                    <span className="text-base font-black text-[#FAE9CA] block">{r.digit}</span>
                    <span className="text-[9px] text-[#EAC272] block">{r.count} ครั้ง</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Historical Past Draws Table */}
            <div className="space-y-2">
              <span className="text-xs text-[#FAE9CA] font-bold block">
                ผลการออกสลากกินแบ่งรัฐบาลไทย ย้อนหลังล่าสุด:
              </span>
              <div className="space-y-1.5 text-xs max-h-60 overflow-y-auto pr-1">
                {HISTORICAL_LOTTERY_DRAWS.map((draw, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-xl bg-[#17061F] border border-[rgba(242,203,128,0.1)] flex items-center justify-between"
                  >
                    <div>
                      <span className="font-bold text-[#FAE9CA] block">{draw.period} ({draw.dayOfWeek})</span>
                      <span className="text-[10px] text-[#A89279]">
                        รางวัลที่ 1: <strong className="text-[#FAE9CA]">{draw.firstPrize}</strong>
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-right">
                      <div className="bg-[#110417] px-2.5 py-1 rounded-lg border border-[#EAC272]/30">
                        <span className="text-[9px] text-[#A89279] block">2 ตัวท้าย</span>
                        <span className="text-sm font-black text-[#EAC272]">{draw.twoDigits}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: DAY OF WEEK LOTTERY STATS */}
        {activeTab === 'day_stats' && (
          <div className="space-y-3">
            <p className="text-xs text-[#C9B49D]">
              สถิติแยกตามวันในสัปดาห์ที่หวยออก (กำลังวันและเลขที่ออกซ้ำบ่อยในแต่ละวัน):
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {DAY_OF_WEEK_LOTTERY_STATS.map((d, i) => (
                <div
                  key={i}
                  className="rounded-2xl bg-[#17061F] border border-[rgba(242,203,128,0.15)] p-3.5 space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between border-b border-[rgba(242,203,128,0.1)] pb-1.5">
                    <span className="font-bold text-[#EAC272]">หวยออกวัน{d.dayName}</span>
                    <span className="text-[10px] text-[#A89279]">{d.totalDraws} งวด</span>
                  </div>

                  <div>
                    <span className="text-[10px] text-[#A89279] block">เลขวิ่งเด่นประจำวัน:</span>
                    <div className="flex gap-1.5 mt-1">
                      {d.topRunnerDigits.map((dig, idx) => (
                        <span key={idx} className="bg-[#2A0E38] text-[#FAE9CA] font-bold px-2 py-0.5 rounded-lg border border-[#EAC272]/20">
                          {dig}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] text-[#A89279] block">เลขท้าย 2 ตัวที่ออกบ่อย:</span>
                    <div className="flex gap-1.5 mt-1 flex-wrap">
                      {d.topTwoDigits.map((pair, idx) => (
                        <span key={idx} className="bg-[#110417] text-[#EAC272] font-bold px-2 py-0.5 rounded-lg border border-[rgba(242,203,128,0.2)]">
                          {pair}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer Top Up Shortcut */}
        <div className="mt-5 pt-4 border-t border-[rgba(242,203,128,0.12)] flex items-center justify-between text-xs">
          <span className="text-[#C9B49D]">
            เหรียญคงเหลือ: <strong className="text-[#FAE9CA] font-bold">{coins} เหรียญ</strong>
          </span>
          <button
            onClick={() => {
              onClose();
              onOpenTopUp();
            }}
            className="text-[#EAC272] hover:underline font-bold flex items-center gap-1 cursor-pointer"
          >
            <span>เติมเหรียญเพิ่ม 💳</span>
          </button>
        </div>

      </motion.div>
    </div>
  );
};
