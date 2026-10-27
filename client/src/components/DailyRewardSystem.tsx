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
import { resolveDailyRewardGate } from '../utils/dailyRewardGate';
import { DAILY_CHECKIN_COINS, WEEKLY_FREE_COIN_CAP, WEEKLY_SHARE_BONUS_COINS } from '@shared/rewards';

interface DailyRewardSystemProps {
  currentCoins: number;
  onClaimDailyReward: (coinsAmount: number, reason: string) => Promise<{ claimed: boolean; amount: number; streakDay: number }>;
  onOpenTopUp: () => void;
  onShowToast: (msg: string) => void;
  serverStatus?: { dailyClaimed: boolean; shareClaimed: boolean; streakDay: number; weeklyEarned: number; weeklyCap: number; weeklyRemaining: number };
  isAuthenticated?: boolean;
  compact?: boolean;
  onSignIn?: () => void;
}

const CHECKIN_REWARDS = [
  { day: 1, coins: DAILY_CHECKIN_COINS, label: 'วันที่ 1', icon: '🐾' },
  { day: 2, coins: DAILY_CHECKIN_COINS, label: 'วันที่ 2', icon: '✨' },
  { day: 3, coins: DAILY_CHECKIN_COINS, label: 'วันที่ 3', icon: '🎴' },
  { day: 4, coins: DAILY_CHECKIN_COINS, label: 'วันที่ 4', icon: '🔮' },
  { day: 5, coins: DAILY_CHECKIN_COINS, label: 'วันที่ 5', icon: 'ᛋ' },
  { day: 6, coins: DAILY_CHECKIN_COINS, label: 'วันที่ 6', icon: '☯️' },
  { day: 7, coins: DAILY_CHECKIN_COINS, label: 'วันที่ 7', icon: '👑' },
];

export const DailyRewardSystem: React.FC<DailyRewardSystemProps> = ({
  currentCoins,
  onClaimDailyReward,
  onOpenTopUp,
  onShowToast,
  serverStatus,
  isAuthenticated = true,
  compact = false,
  onSignIn,
}) => {
  const todayStr = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Bangkok', year: 'numeric', month: '2-digit', day: '2-digit',
  }).format(new Date());

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
  const [isClaimingShare, setIsClaimingShare] = useState(false);

  const isClaimedToday = serverStatus?.dailyClaimed ?? checkinState.lastCheckinDate === todayStr;
  const hasSharedThisWeek = serverStatus?.shareClaimed ?? hasSharedToday;
  const currentStreak = serverStatus?.streakDay ?? checkinState.streakDays;
  const nextRewardDay = (currentStreak % 7) + 1;
  const nextReward = CHECKIN_REWARDS[nextRewardDay - 1] || CHECKIN_REWARDS[0];
  const weeklyCap = serverStatus?.weeklyCap ?? WEEKLY_FREE_COIN_CAP;
  const weeklyEarned = serverStatus?.weeklyEarned ?? 0;
  const weeklyRemaining = serverStatus?.weeklyRemaining ?? weeklyCap;
  const checkinRewardAmount = Math.min(nextReward.coins, weeklyRemaining);
  const shareRewardAmount = Math.min(WEEKLY_SHARE_BONUS_COINS, weeklyRemaining);
  const weeklyCapReached = weeklyRemaining <= 0;

  // Claim Daily Checkin
  const handleClaimCheckin = async () => {
    const gate = resolveDailyRewardGate(isAuthenticated, isClaimedToday);
    if (gate === 'sign-in') {
      onShowToast('เข้าสู่ระบบก่อนเพื่อบันทึกเช็คอินและรับเหรียญเข้ากระเป๋าของคุณ');
      onSignIn?.();
      return;
    }
    if (gate === 'already-claimed') {
      onShowToast('วันนี้คุณรับเหรียญประจำวันไปแล้วนะจ๊ะ กลับมารับใหม่พรุ่งนี้ได้เลย!');
      return;
    }

    const nextStreak = (currentStreak % 7) + 1;
    const rewardConfig = CHECKIN_REWARDS[nextStreak - 1] || CHECKIN_REWARDS[0];
    const result = await onClaimDailyReward(Math.min(rewardConfig.coins, weeklyRemaining), `เช็คอินวันที่ ${nextStreak}`);
    if (!result.claimed) return;
    playCatPurrSound();
    playMysticChimeSound('gold');

    const newState: DailyCheckinState = {
      lastCheckinDate: todayStr,
      streakDays: result.streakDay,
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

    onShowToast(`🎉 เช็คอินสำเร็จ! ได้รับ ${result.amount} เหรียญแมวนำโชค`);
  };

  // Claim the weekly share bonus after a successful native share or copy.
  const handleShareToSocial = async () => {
    if (!isAuthenticated) {
      onShowToast('เข้าสู่ระบบก่อนเพื่อรับโบนัสชวนเพื่อน');
      onSignIn?.();
      return;
    }
    if (isClaimingShare) return;
    if (hasSharedThisWeek) {
      onShowToast('สัปดาห์นี้คุณรับโบนัสชวนเพื่อนไปแล้ว กลับมารับใหม่สัปดาห์หน้านะ!');
      return;
    }

    const shareText = `🐾 มาส่องไฟตรวจดวง 4 ศาสตร์กับ The Cat Room: ไพ่ยิปซี โอราเคิล หินรูน และปาจื่อจีน ไม่ขายฝันแต่ฟาดสติ! ทดลองได้ที่ ${window.location.origin}`;
    const shareNavigator = navigator as Navigator & { share?: (data: ShareData) => Promise<void> };
    let actionLabel = 'คัดลอกข้อความชวนเพื่อน';
    try {
      if (typeof shareNavigator.share === 'function') {
        await shareNavigator.share({ title: 'ชวนเพื่อนมาดูดวง', text: shareText });
        actionLabel = 'แชร์ข้อความชวนเพื่อน';
      } else if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareText);
      } else {
        onShowToast('เบราว์เซอร์นี้ยังแชร์หรือคัดลอกข้อความไม่ได้');
        return;
      }
    } catch (error) {
      if ((error as DOMException)?.name !== 'AbortError') onShowToast('แชร์หรือคัดลอกไม่สำเร็จ จึงยังไม่ได้รับโบนัส');
      return;
    }

    setIsClaimingShare(true);
    try {
      playMysticChimeSound('gold');
      const result = await onClaimDailyReward(shareRewardAmount, actionLabel);
      if (!result.claimed) return;
      setHasSharedToday(true);
      localStorage.setItem('thecatroom_shared_date', todayStr);
      onShowToast(`✨ ${actionLabel}และรับโบนัส ${result.amount} เหรียญแล้วจ้า!`);
    } finally {
      setIsClaimingShare(false);
    }
  };

  // A small post-reveal prompt preserves the reading as the first value moment.
  if (compact) {
    return (
      <section className="rounded-2xl border border-[rgba(242,203,128,0.22)] bg-[#180B22]/90 p-3 sm:p-4" aria-label="เช็คอินรับเหรียญประจำวัน">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#842C71]/35 text-[#EAC272]">
            {isClaimedToday ? <CheckCircle2 className="h-5 w-5" /> : <Gift className="h-5 w-5" />}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-[#FAE9CA]">
              {isClaimedToday ? 'เช็คอินวันนี้เรียบร้อย' : 'เก็บเหรียญไว้เปิดไพ่ต่อ'}
            </p>
            <p className="text-[11px] text-[#C9B49D]">
              {isClaimedToday
                ? `ยอดคงเหลือ ${currentCoins.toLocaleString()} เหรียญ • ฟรีสัปดาห์นี้ ${weeklyEarned}/${weeklyCap}`
                : weeklyCapReached ? `โควตาฟรีสัปดาห์นี้เต็มแล้ว (${weeklyEarned}/${weeklyCap})` : `รับ +${checkinRewardAmount} เหรียญ • เหลือโควตา ${weeklyRemaining}/${weeklyCap}`}
            </p>
          </div>
          <button
            id="btn-claim-daily-checkin-compact"
            type="button"
            onClick={handleClaimCheckin}
            disabled={isClaimedToday || weeklyCapReached}
            className="shrink-0 rounded-full bg-gradient-to-r from-[#EAC272] to-[#D4A84D] px-3.5 py-2 text-xs font-extrabold text-[#110918] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isClaimedToday ? 'รับแล้ว' : weeklyCapReached ? 'ครบโควตา' : isAuthenticated ? `เช็คอิน +${checkinRewardAmount}` : 'เข้าสู่ระบบรับเหรียญ'}
          </button>
        </div>
      </section>
    );
  }

  return (
    <>
      {/* Mobile: rewards support the core reading flow without taking over the first screen. */}
      <section
        id="mobile-daily-reward"
        className="mobile-reward-strip md:hidden"
        aria-label="รับเหรียญประจำวัน"
      >
        <div className="mobile-reward-icon" aria-hidden="true">
          {isClaimedToday ? <CheckCircle2 className="h-5 w-5" /> : <Gift className="h-5 w-5" />}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span className="truncate text-xs font-extrabold text-[var(--cat-cream)]">
              {isClaimedToday ? 'รับเหรียญวันนี้แล้ว' : weeklyCapReached ? 'ครบโควตาฟรีสัปดาห์นี้' : `รับฟรี ${checkinRewardAmount} เหรียญก่อนเปิดไพ่`}
            </span>
            <span className="inline-flex items-center gap-0.5 whitespace-nowrap text-[10px] font-bold text-[var(--cat-gold)]">
              <Flame className="h-3 w-3" /> {currentStreak} วัน
            </span>
          </div>
          <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-[var(--cat-container-highest)]">
            <div
              className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-violet-400 to-amber-300 transition-[width] duration-300"
              style={{ width: `${Math.max(8, (currentStreak / 7) * 100)}%` }}
            />
          </div>
        </div>
        <button
          id="btn-claim-daily-checkin-mobile"
          type="button"
          onClick={handleClaimCheckin}
          disabled={isClaimedToday || weeklyCapReached}
          className="mobile-reward-action"
        >
          {isClaimedToday ? 'สำเร็จ' : weeklyCapReached ? 'ครบโควตา' : `รับ +${checkinRewardAmount}`}
        </button>
      </section>

      {/* Desktop keeps the full retention dashboard. */}
      <div className="velvet-card hidden rounded-[28px] p-6 space-y-5 border border-[rgba(242,203,128,0.22)] shadow-xl relative overflow-hidden md:block">
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
            ตารางเช็คอินรับเหรียญ 7 วัน (วันละ 3 เหรียญ • รวมทุกภารกิจไม่เกิน 25 เหรียญ/สัปดาห์)
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
              ? `คุณเช็คอินวันนี้แล้ว • เหรียญฟรีสัปดาห์นี้ ${weeklyEarned}/${weeklyCap}`
              : weeklyCapReached ? `รับเหรียญฟรีครบ ${weeklyCap} เหรียญของสัปดาห์นี้แล้ว` : `กดรับ ${checkinRewardAmount} เหรียญ • ใช้โควตาฟรีไปแล้ว ${weeklyEarned}/${weeklyCap}`}
          </p>

          <button
            id="btn-claim-daily-checkin"
            onClick={handleClaimCheckin}
            disabled={isClaimedToday || weeklyCapReached}
            className={`flex items-center gap-2 rounded-full px-6 py-2.5 text-xs font-bold transition-all shadow-md ${
              isClaimedToday || weeklyCapReached
                ? 'bg-[#1E0E2A] text-[#C9B49D] border border-[rgba(242,203,128,0.1)] cursor-not-allowed opacity-60'
                : 'btn-gilded text-[#110918] cursor-pointer hover:scale-105'
            }`} style={{color: '#2965c7'}}
          >
            <Sparkles className="h-4 w-4" />
            <span>{isClaimedToday ? 'รับเหรียญวันนี้แล้ว' : weeklyCapReached ? 'ครบโควตาฟรีสัปดาห์นี้' : `รับเหรียญประจำวัน +${checkinRewardAmount}`}</span>
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
                <h5 className="font-serif-display text-sm text-[#FAE9CA]">ชวนเพื่อนมาดูดวง</h5>
                <p className="text-[11px] text-[#C9B49D]">แชร์หรือคัดลอกสำเร็จ รับสูงสุด 4 เหรียญ (สัปดาห์ละ 1 ครั้ง)</p>
              </div>
            </div>

            <button
              id="btn-share-social-bonus"
              onClick={handleShareToSocial}
              disabled={hasSharedThisWeek || isClaimingShare || weeklyCapReached}
              className={`rounded-full px-3 py-1.5 text-xs font-bold transition-all ${
                hasSharedThisWeek || weeklyCapReached
                  ? 'bg-[#1E0E2A] text-[#C9B49D] border border-[rgba(242,203,128,0.1)] cursor-not-allowed'
                  : 'bg-[#361A4A] text-[#FAE9CA] hover:bg-[#842C71] border border-[rgba(242,203,128,0.3)]'
              }`}
            >
              {hasSharedThisWeek ? 'รับแล้วสัปดาห์นี้' : weeklyCapReached ? 'ครบโควตา' : isClaimingShare ? 'กำลังรับ…' : `+${shareRewardAmount} 🪙 รับ`}
            </button>
          </div>

          {/* Quest 2: First-time Buyer Prompt */}
          <div className="flex items-center justify-between rounded-2xl bg-gradient-to-r from-[#24102E] to-[#1E0E2A] p-3.5 border border-[#EAC272]/30">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#EAC272] text-[#110918] font-bold shadow">
                ⚡
              </div>
              <div>
                <h5 className="font-serif-display text-sm text-[#FAE9CA]">Starter พกไว้ถามด่วน ฿49</h5>
                <p className="text-[11px] text-[#AEFFE4]">รับ 80 เหรียญผ่าน Stripe Checkout</p>
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
    </>
  );
};
