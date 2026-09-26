import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import {
  Gift,
  CheckCircle2,
  Calendar,
  Sparkles,
  Share2,
  Coins,
  Flame,
  Award,
  Clock,
  ArrowRight,
  Zap,
  Check
} from 'lucide-react';
import { DailyCheckinState } from '../types';
import { playMysticChimeSound, playCatPurrSound } from '../utils/speechHelper';

interface DailyRewardSystemProps {
  currentCoins: number;
  onClaimDailyReward: (coinsAmount: number, reason: string) => void;
  onOpenTopUp: () => void;
  onShowToast: (msg: string) => void;
}

const CHECKIN_REWARDS = [
  { day: 1, coins: 5, label: 'วันที่ 1', icon: '🐾' },
  { day: 2, coins: 5, label: 'วันที่ 2', icon: '✨' },
  { day: 3, coins: 10, label: 'วันที่ 3', icon: '🎴', isBonus: true },
  { day: 4, coins: 5, label: 'วันที่ 4', icon: '🔮' },
  { day: 5, coins: 10, label: 'วันที่ 5', icon: 'ᛋ' },
  { day: 6, coins: 15, label: 'วันที่ 6', icon: '☯️' },
  { day: 7, coins: 30, label: 'วันที่ 7', icon: '👑', isJackpot: true },
];

export const DailyRewardSystem: React.FC<DailyRewardSystemProps> = ({
  currentCoins,
  onClaimDailyReward,
  onOpenTopUp,
  onShowToast,
}) => {
  const todayStr = new Date().toISOString().split('T')[0];

  const [checkinState, setCheckinState] = useState<DailyCheckinState>(() => {
    const saved = localStorage.getItem('thecatroom_daily_checkin');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return {
      lastCheckinDate: '',
      streakDays: 0,
      claimedDates: [],
    };
  });

  const [hasSharedToday, setHasSharedToday] = useState<boolean>(() => {
    const saved = localStorage.getItem('thecatroom_shared_date');
    return saved === todayStr;
  });

  const isClaimedToday = checkinState.lastCheckinDate === todayStr;
  const currentStreak = checkinState.streakDays;

  // Claim Daily Checkin
  const handleClaimCheckin = () => {
    if (isClaimedToday) {
      onShowToast('วันนี้คุณรับเหรียญประจำวันไปแล้วนะจ๊ะ กลับมารับใหม่พรุ่งนี้ได้เลย!');
      return;
    }

    playCatPurrSound();
    playMysticChimeSound('gold');

    const nextStreak = (currentStreak % 7) + 1;
    const rewardConfig = CHECKIN_REWARDS[nextStreak - 1] || CHECKIN_REWARDS[0];
    const coinsWon = rewardConfig.coins;

    const newState: DailyCheckinState = {
      lastCheckinDate: todayStr,
      streakDays: nextStreak,
      claimedDates: [...checkinState.claimedDates, todayStr],
    };

    setCheckinState(newState);
    localStorage.setItem('thecatroom_daily_checkin', JSON.stringify(newState));

    // Celebration
    confetti({
      particleCount: 80,
      spread: 60,
      origin: { y: 0.7 },
      colors: ['#EAC272', '#FAE9CA', '#EC4899', '#AEFFE4'],
    });

    onClaimDailyReward(coinsWon, `เช็คอินวันที่ ${nextStreak} รับฟรี ${coinsWon} เหรียญ`);
    onShowToast(`🎉 เช็คอินสำเร็จ! ได้รับ ${coinsWon} เหรียญแมวนำโชค`);
  };

  // Claim Social Share Bonus (5 coins)
  const handleShareToSocial = () => {
    if (hasSharedToday) {
      onShowToast('วันนี้คุณรับโบนัสการแชร์ไปแล้วจ้า พรุ่งนี้มากดใหม่นะ!');
      return;
    }

    playMysticChimeSound('gold');
    const shareText = `🐾 มาส่องไฟตรวจดวง 4 ศาสตร์กับ The Cat Room: ไพ่ยิปซี โอราเคิล หินรูน และปาจื่อจีน ไม่ขายฝันแต่ฟาดสติ! ทดลองได้ที่ ${window.location.origin}`;
    
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareText);
    }

    setHasSharedToday(true);
    localStorage.setItem('thecatroom_shared_date', todayStr);

    onClaimDailyReward(5, 'แชร์ The Cat Room ลงโซเชียล');
    onShowToast('✨ คัดลอกข้อความและรับโบนัสแชร์ 5 เหรียญแล้วจ้า!');
  };

  return (
    <div className="velvet-card rounded-[28px] p-6 space-y-5 border border-[rgba(242,203,128,0.22)] shadow-xl relative overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute -top-12 -right-12 h-44 w-44 rounded-full bg-[#842C71]/20 blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[rgba(242,203,128,0.14)] pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#361A4A] border border-[rgba(242,203,128,0.3)] text-2xl shadow-md text-[#EAC272]">
            🎁
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-serif-display text-xl text-[#FAE9CA]">ภารกิจรับเหรียญฟรี (Daily Earn & Quests)</h3>
              <span className="rounded-full bg-[#EAC272]/20 px-2 py-0.5 text-[10px] font-bold text-[#EAC272] border border-[#EAC272]/30">
                ประหยัดเงินจริง
              </span>
            </div>
            <p className="text-xs text-[#C9B49D] mt-0.5">
              สะสมเหรียญแมวนำโชคฟรีทุกวัน เพื่อใช้เปิดไพ่ ปลดล็อกบทสรุป หรือถามแชทบอทต่อเนื่อง
            </p>
          </div>
        </div>

        {/* Current streak badge */}
        <div className="flex items-center gap-2 rounded-2xl bg-[#110918] px-3.5 py-1.5 border border-[rgba(242,203,128,0.18)]">
          <Flame className="h-4 w-4 text-orange-400 animate-pulse" />
          <div className="text-right">
            <span className="text-[10px] uppercase font-bold text-[#C9B49D]">สถิติต่อเนื่อง</span>
            <div className="font-serif-display text-sm text-[#FAE9CA]">{currentStreak} วันติดกัน</div>
          </div>
        </div>
      </div>

      {/* 7-Day Check-in Track */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#EAC272] flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5" />
            ตารางเช็คอินรับเหรียญ 7 วัน (ครบ 7 วันรับ Jackpot 30 เหรียญ!)
          </span>
          <span className="text-xs text-[#C9B49D]">
            สถานะวันนี้: {isClaimedToday ? '✅ รับแล้ว' : '⏳ รอคุณมากดรับ'}
          </span>
        </div>

        <div className="grid grid-cols-7 gap-2">
          {CHECKIN_REWARDS.map((item, index) => {
            const isCompleted = index < currentStreak;
            const isCurrentToday = index === (isClaimedToday ? currentStreak - 1 : currentStreak % 7);
            const isLocked = index > (currentStreak % 7);

            return (
              <div
                key={item.day}
                className={`relative flex flex-col items-center justify-between rounded-2xl p-2.5 sm:p-3 text-center border transition-all ${
                  isCompleted
                    ? 'bg-[#165B53]/30 border-[#165B53] text-[#AEFFE4]'
                    : isCurrentToday && !isClaimedToday
                    ? 'bg-[#842C71]/40 border-2 border-[#EAC272] ring-2 ring-[#EAC272]/30 shadow-lg scale-105'
                    : 'bg-[#110918] border-[rgba(242,203,128,0.12)] text-[#C9B49D]'
                }`}
              >
                {item.isJackpot && (
                  <span className="absolute -top-2 rounded-full bg-[#EAC272] px-1.5 py-0.2 text-[8px] font-bold text-[#110918] shadow">
                    JACKPOT
                  </span>
                )}

                <span className="text-[10px] font-medium">{item.label}</span>
                <span className="text-xl my-1">{item.icon}</span>

                <div className="flex items-center gap-0.5 text-xs font-bold text-[#FAE9CA]">
                  <span>+{item.coins}</span>
                  <span className="text-[10px]">🪙</span>
                </div>

                {isCompleted && (
                  <span className="mt-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-[10px] text-black">
                    ✓
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* Claim Action Button */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 pt-2">
          <p className="text-xs text-[#C9B49D]">
            {isClaimedToday 
              ? 'คุณเช็คอินวันนี้เรียบร้อยแล้ว พรุ่งนี้กลับมาลุ้นรับโบนัสก้อนโตต่อนะจ๊ะ!'
              : 'กดปุ่มนี้เพื่อรับเหรียญฟรีประจำวันได้ทันที'}
          </p>

          <button
            id="btn-claim-daily-checkin"
            onClick={handleClaimCheckin}
            disabled={isClaimedToday}
            className={`flex items-center gap-2 rounded-full px-6 py-2.5 text-xs font-bold transition-all shadow-md ${
              isClaimedToday
                ? 'bg-[#1E0E2A] text-[#C9B49D] border border-[rgba(242,203,128,0.1)] cursor-not-allowed opacity-60'
                : 'btn-gilded text-[#110918] cursor-pointer hover:scale-105'
            }`}
          >
            <Sparkles className="h-4 w-4" />
            <span>{isClaimedToday ? 'รับเหรียญวันนี้แล้ว' : 'กดรับเหรียญประจำวันฟรี!'}</span>
          </button>
        </div>
      </div>

      {/* Bonus Quests Grid */}
      <div className="border-t border-[rgba(242,203,128,0.12)] pt-4">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-[#EAC272] mb-3 flex items-center gap-1.5">
          <Zap className="h-3.5 w-3.5" />
          ภารกิจพิเศษสะสมเหรียญ (Micro-Quests)
        </h4>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {/* Quest 1: Share to Friends */}
          <div className="flex items-center justify-between rounded-2xl bg-[#110918] p-3.5 border border-[rgba(242,203,128,0.15)]">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#842C71]/40 text-[#FAE9CA] border border-[rgba(242,203,128,0.2)]">
                <Share2 className="h-4 w-4" />
              </div>
              <div>
                <h5 className="font-serif-display text-sm text-[#FAE9CA]">แชร์ลิงก์สำนักดูดวง</h5>
                <p className="text-[11px] text-[#C9B49D]">คัดลอกข้อความชวนเพื่อน รับ 5 เหรียญ (วันละ 1 ครั้ง)</p>
              </div>
            </div>

            <button
              id="btn-share-social-bonus"
              onClick={handleShareToSocial}
              disabled={hasSharedToday}
              className={`rounded-full px-3 py-1.5 text-xs font-bold transition-all ${
                hasSharedToday
                  ? 'bg-[#1E0E2A] text-[#C9B49D] border border-[rgba(242,203,128,0.1)] cursor-not-allowed'
                  : 'bg-[#361A4A] text-[#FAE9CA] hover:bg-[#842C71] border border-[rgba(242,203,128,0.3)]'
              }`}
            >
              {hasSharedToday ? 'แชร์แล้ว' : '+5 🪙 รับ'}
            </button>
          </div>

          {/* Quest 2: First-time Buyer Prompt */}
          <div className="flex items-center justify-between rounded-2xl bg-gradient-to-r from-[#24102E] to-[#1E0E2A] p-3.5 border border-[#EAC272]/30">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#EAC272] text-[#110918] font-bold shadow">
                ⚡
              </div>
              <div>
                <h5 className="font-serif-display text-sm text-[#FAE9CA]">โปรเปิดใจเบิกเนตร ฿29</h5>
                <p className="text-[11px] text-[#AEFFE4]">รับ 65 เหรียญทันที (ลดแรงต้านครั้งแรก)</p>
              </div>
            </div>

            <button
              id="btn-first-buyer-offer"
              onClick={onOpenTopUp}
              className="btn-gilded rounded-full px-3 py-1.5 text-xs font-bold text-[#110918] cursor-pointer"
            >
              ดูแพ็กเกจ
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
