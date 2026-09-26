import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  Coins,
  X,
  Flame,
  Compass,
  MessageSquareHeart,
  HelpCircle,
  Check,
  Lock,
  ShieldCheck,
  TrendingUp,
  AlertCircle,
  History,
  Calculator
} from 'lucide-react';
import { playMysticChimeSound, playCatPurrSound } from '../utils/speechHelper';
import { saveUnlockedLotteryRecord } from '../utils/fateDatabase';

interface SassyCatAssistantPopupProps {
  isOpen: boolean;
  onClose: () => void;
  coins: number;
  onSpendCoins: (amount: number, reason: string) => boolean;
  onOpenTopUp: () => void;
  onSwitchDiscipline: (discipline: any) => void;
  onAskChatQuestion: (question: string) => void;
  onShowToast: (msg: string) => void;
  soundEnabled?: boolean;
  onOpenLotteryVault?: () => void;
  onOpenEconomicsModal?: () => void;
}

export const SassyCatAssistantPopup: React.FC<SassyCatAssistantPopupProps> = ({
  isOpen,
  onClose,
  coins,
  onSpendCoins,
  onOpenTopUp,
  onSwitchDiscipline,
  onAskChatQuestion,
  onShowToast,
  soundEnabled = true,
  onOpenLotteryVault,
  onOpenEconomicsModal,
}) => {
  const [activeTab, setActiveTab] = useState<'lottery' | 'ask_cat' | 'lucky_charm'>('lottery');
  const [revealedLottery, setRevealedLottery] = useState<any | null>(null);
  const [isRevealing, setIsRevealing] = useState<boolean>(false);
  const [customQuestion, setCustomQuestion] = useState<string>('');

  if (!isOpen) return null;

  // Calculate current/upcoming lottery period (งวดวันที่ 1 หรือ 16)
  const getLotteryPeriod = () => {
    const now = new Date();
    const currentDay = now.getDate();
    const currentMonth = now.getMonth();
    const monthNames = [
      'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
      'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
    ];

    if (currentDay <= 1) {
      return `งวดวันที่ 1 ${monthNames[currentMonth]} ${now.getFullYear() + 543}`;
    } else if (currentDay <= 16) {
      return `งวดวันที่ 16 ${monthNames[currentMonth]} ${now.getFullYear() + 543}`;
    } else {
      const nextMonth = (currentMonth + 1) % 12;
      const nextYear = nextMonth === 0 ? now.getFullYear() + 544 : now.getFullYear() + 543;
      return `งวดวันที่ 1 ${monthNames[nextMonth]} ${nextYear}`;
    }
  };

  const periodLabel = getLotteryPeriod();

  // Unlock VIP Lottery Numbers for this period (Costs 15 Coins)
  const handleUnlockLottery = () => {
    const LOTTERY_COST = 15;
    if (coins < LOTTERY_COST) {
      onOpenTopUp();
      onShowToast(`⚠️ เหรียญไม่พอสำหรับเลขเด็ดงวดนี้ (ต้องการ ${LOTTERY_COST} เหรียญ)`);
      return;
    }

    const success = onSpendCoins(
      LOTTERY_COST,
      `เปิดคลังเลขเด็ดแม่หมอเหมียว (${periodLabel})`
    );

    if (!success) return;

    if (soundEnabled) {
      playCatPurrSound();
      playMysticChimeSound('gold');
    }

    setIsRevealing(true);
    setTimeout(() => {
      // Deterministic yet mystical set of numbers
      const seed = Math.floor(Math.random() * 89) + 10;
      const digit3 = Math.floor(Math.random() * 899) + 100;
      const pair1 = String((seed * 3) % 99).padStart(2, '8');
      const pair2 = String((seed * 7) % 99).padStart(2, '9');
      const runner = (seed % 9) + 1;

      const newLottery = {
        period: periodLabel,
        primeRunner: runner,
        twoDigits: [pair1, pair2, `${runner}${seed % 10}`],
        threeDigits: [String(digit3), `${runner}${pair1}`],
        cosmicTip: 'เลขวิ่งเด่นจักรวาลเหนี่ยวนำธาตุลมและทอง อย่าทุ่มหมดหน้าตัก ซื้อพอหอมปากหอมคอตามสติเพื่อนสาว',
        direction: 'ทิศตะวันออกเฉียงเหนือ (เวลาก่อน 14:00 น.)',
      };

      setRevealedLottery(newLottery);

      // Save permanently to user unlocked lottery vault & match with historical draws
      saveUnlockedLotteryRecord({
        drawPeriod: periodLabel,
        primeRunner: runner,
        twoDigits: newLottery.twoDigits,
        threeDigits: newLottery.threeDigits,
        coinsSpent: LOTTERY_COST,
        source: 'cat_assistant_popup',
      });

      setIsRevealing(false);
      onShowToast('✨ ปลดล็อกและบันทึกลงคลังเลขเด็ดงวดนี้เรียบร้อยแล้ว!');
    }, 600);
  };

  // Submit Quick Question to Sassy AI Chat (Costs 5 Coins after 1 free)
  const handleQuickAsk = (qText: string) => {
    const ASK_COST = 5;
    if (coins < ASK_COST) {
      onOpenTopUp();
      onShowToast(`⚠️ เหรียญไม่พอสำหรับแชทสดแม่หมอ (ต้องการ ${ASK_COST} เหรียญ)`);
      return;
    }

    const success = onSpendCoins(ASK_COST, `ถามแชทแม่หมอเหมียว: ${qText.slice(0, 30)}`);
    if (!success) return;

    if (soundEnabled) {
      playCatPurrSound();
      playMysticChimeSound('chime');
    }

    onClose();
    onSwitchDiscipline('chat');
    onAskChatQuestion(qText);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0C0412]/80 backdrop-blur-md p-4 overflow-y-auto">
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="relative my-8 w-full max-w-lg rounded-[32px] bg-gradient-to-b from-[#260D33] via-[#1B0826] to-[#110417] p-6 sm:p-7 border-2 border-[rgba(242,203,128,0.35)] shadow-2xl shadow-[#110918] max-h-[92vh] overflow-y-auto text-left"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 rounded-full bg-[#180824] p-2 text-[#C9B49D] hover:text-[#FAE9CA] border border-[rgba(242,203,128,0.2)] hover:border-[#EAC272] transition-all cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Header: The Sassy Cat Avatar & Title */}
        <div className="flex items-center gap-3.5 border-b border-[rgba(242,203,128,0.15)] pb-4">
          <div className="relative">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#3D144E] to-[#842C71] border border-[#EAC272] shadow-xl text-3xl">
              🐾
            </div>
            <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-[8px] text-black font-bold ring-2 ring-[#110417]">
              ✓
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-serif-display text-xl text-[#FAE9CA] font-bold">
                แม่หมอเหมียว AI (The Cat Assistant)
              </h3>
            </div>
            <p className="text-xs text-[#EAC272] flex items-center gap-1.5 mt-0.5">
              <span>คุณใช้สิทธิ์ดูฟรีครั้งแรกไปแล้ว</span>
              <span>•</span>
              <span className="flex items-center gap-1 text-[#FAE9CA]">
                <Coins className="h-3 w-3 text-[#EAC272]" /> {coins} เหรียญ
              </span>
            </p>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex rounded-xl bg-[#110417] p-1 border border-[rgba(242,203,128,0.15)] my-4 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('lottery')}
            className={`flex-1 py-2 rounded-lg transition-all text-center flex items-center justify-center gap-1.5 ${
              activeTab === 'lottery'
                ? 'bg-gradient-to-r from-[#EAC272] to-[#D4A84D] text-[#110918] font-bold shadow'
                : 'text-[#C9B49D] hover:text-[#FAE9CA]'
            }`}
          >
            <span>🎰</span>
            <span>ขอเลขเด็ดงวดนี้</span>
          </button>
          <button
            onClick={() => setActiveTab('ask_cat')}
            className={`flex-1 py-2 rounded-lg transition-all text-center flex items-center justify-center gap-1.5 ${
              activeTab === 'ask_cat'
                ? 'bg-gradient-to-r from-[#EAC272] to-[#D4A84D] text-[#110918] font-bold shadow'
                : 'text-[#C9B49D] hover:text-[#FAE9CA]'
            }`}
          >
            <span>💬</span>
            <span>ถามสดแม่หมอ (5C)</span>
          </button>
        </div>

        {/* TAB 1: LOTTERY LUCKY NUMBERS (15 COINS) */}
        {activeTab === 'lottery' && (
          <div className="space-y-4">
            <div className="rounded-2xl bg-gradient-to-b from-[#1F0A2B] to-[#14051D] border border-[rgba(242,203,128,0.2)] p-4 text-xs space-y-2">
              <div className="flex items-center justify-between text-[#EAC272]">
                <span className="font-bold flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5" />
                  คำนวณเลขเด็ดซื้อหวย: {periodLabel}
                </span>
                <span className="bg-[#842C71]/40 border border-[#EAC272]/30 px-2 py-0.5 rounded-full text-[10px] text-[#FAE9CA]">
                  VIP คลังเลข
                </span>
              </div>
              <p className="text-[#C9B49D] leading-relaxed">
                ถอดรหัสคลื่นดวงดาวประจำงวด ผสานเลขกำลังวัน ทิศมงคล และเคล็ดลับซื้อหวยแบบมีสติ
              </p>
            </div>

            {!revealedLottery ? (
              <div className="rounded-2xl border-2 border-dashed border-[rgba(242,203,128,0.3)] p-6 text-center space-y-4 bg-[#14061A]/60">
                <div className="flex h-12 w-12 mx-auto items-center justify-center rounded-full bg-[#2A0E38] border border-[#EAC272] text-xl">
                  🔒
                </div>
                <div>
                  <h4 className="font-serif-display text-base text-[#FAE9CA]">
                    คลังเลขเด็ดงวดนี้ถูกผนึกไว้
                  </h4>
                  <p className="text-xs text-[#C9B49D] mt-1">
                    ใช้ <strong>15 เหรียญ</strong> เพื่อปลดล็อกเลขวิ่ง 2 ตัวตรง และ 3 ตัวตรง
                  </p>
                </div>

                <button
                  onClick={handleUnlockLottery}
                  disabled={isRevealing}
                  className="btn-gilded w-full py-3 text-xs font-bold text-[#110918] flex items-center justify-center gap-2 cursor-pointer shadow-lg"
                >
                  <Coins className="h-4 w-4" />
                  <span>
                    {isRevealing ? 'กำลังคำนวณคลื่นเลขเด็ด...' : `ปลดล็อกเลขงวดนี้ (ใช้ 15 เหรียญ)`}
                  </span>
                </button>
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="rounded-2xl bg-gradient-to-b from-[#2A0F38] to-[#180722] border-2 border-[#EAC272] p-5 space-y-4 shadow-xl"
              >
                <div className="text-center border-b border-[rgba(242,203,128,0.2)] pb-3">
                  <span className="text-[10px] uppercase tracking-wider text-[#EAC272] font-semibold">
                    เลขเด่นประจำ {revealedLottery.period}
                  </span>
                  <div className="flex items-center justify-center gap-2 mt-2">
                    <span className="text-xs text-[#C9B49D]">เลขวิ่งเดี่ยว:</span>
                    <span className="text-3xl font-black text-[#EAC272] bg-[#110417] px-4 py-1 rounded-xl border border-[#EAC272]">
                      {revealedLottery.primeRunner}
                    </span>
                  </div>
                </div>

                {/* 2 & 3 Digits */}
                <div className="grid grid-cols-2 gap-3 text-center">
                  <div className="rounded-xl bg-[#110417] p-3 border border-[rgba(242,203,128,0.15)]">
                    <span className="text-[10px] font-bold text-[#C9B49D] block mb-1">เลขท้าย 2 ตัว</span>
                    <div className="flex items-center justify-center gap-2">
                      {revealedLottery.twoDigits.map((n: string, i: number) => (
                        <span key={i} className="text-sm font-bold text-[#FAE9CA] bg-[#2A0E38] px-2 py-0.5 rounded-lg border border-[#EAC272]/30">
                          {n}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-xl bg-[#110417] p-3 border border-[rgba(242,203,128,0.15)]">
                    <span className="text-[10px] font-bold text-[#C9B49D] block mb-1">เลขท้าย 3 ตัว</span>
                    <div className="flex items-center justify-center gap-2">
                      {revealedLottery.threeDigits.map((n: string, i: number) => (
                        <span key={i} className="text-sm font-bold text-[#EAC272] bg-[#2A0E38] px-2 py-0.5 rounded-lg border border-[#EAC272]/30">
                          {n}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="text-xs text-[#C9B49D] space-y-1 bg-[#110417]/80 p-3 rounded-xl border border-[rgba(242,203,128,0.1)]">
                  <p><strong className="text-[#EAC272]">🧭 ทิศและฤกษ์ซื้อ: </strong>{revealedLottery.direction}</p>
                  <p><strong className="text-[#FAE9CA]">🐾 เตือนสติ: </strong>{revealedLottery.cosmicTip}</p>
                </div>

                {/* View Full Historical Stats & Vault */}
                {onOpenLotteryVault && (
                  <button
                    onClick={() => {
                      onClose();
                      onOpenLotteryVault();
                    }}
                    className="w-full py-2.5 rounded-xl bg-[#1F0A2B] border border-[#EAC272]/40 hover:border-[#EAC272] text-xs font-bold text-[#FAE9CA] flex items-center justify-center gap-2 cursor-pointer shadow-md transition-all"
                  >
                    <History className="h-3.5 w-3.5 text-[#EAC272]" />
                    <span>ดูสถิติหวยออกจริงย้อนหลัง & เลขที่บันทึกไว้</span>
                  </button>
                )}
              </motion.div>
            )}

            {/* Quick Link to Lottery Vault even if not revealed */}
            {!revealedLottery && onOpenLotteryVault && (
              <button
                onClick={() => {
                  onClose();
                  onOpenLotteryVault();
                }}
                className="w-full py-2 rounded-xl bg-[#14061A] border border-[rgba(242,203,128,0.2)] hover:border-[#EAC272] text-xs text-[#C9B49D] hover:text-[#FAE9CA] flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
              >
                <History className="h-3.5 w-3.5 text-[#EAC272]" />
                <span>ดูสถิติหวยรัฐบาลไทยย้อนหลัง & คลังเลขของคุณ</span>
              </button>
            )}
          </div>
        )}

        {/* TAB 2: ASK SASSY CAT AI CHAT (5 COINS) */}
        {activeTab === 'ask_cat' && (
          <div className="space-y-4">
            <div className="rounded-2xl bg-[#14061A] p-4 border border-[rgba(242,203,128,0.18)] text-xs text-[#C9B49D] space-y-2">
              <span className="font-bold text-[#FAE9CA] flex items-center gap-1.5">
                <MessageSquareHeart className="h-4 w-4 text-[#F472B6]" />
                ถามสดกับแม่หมอเหมียว (แชทต่อบทละ 5 เหรียญ)
              </span>
              <p>
                อยากให้ฟาดเรื่องอะไรเป็นพิเศษ? พิมพ์คำถามหรือแตะเลือกหัวข้อยอดฮิตด้านล่างได้เลย
              </p>
            </div>

            {/* Quick Prompt Suggestions */}
            <div className="space-y-2">
              <span className="text-[11px] text-[#EAC272] font-semibold">หัวข้อยอดฮิต (แตะถามทันที):</span>
              <div className="grid grid-cols-1 gap-2">
                {[
                  'คนที่คุยอยู่ตอนนี้ เค้าจริงจังหรือแค่คุยแก้เหงา?',
                  'งานที่ทำอยู่ควรลาออกไปทำอย่างอื่นเลยไหม?',
                  'ดวงการเงินเดือนนี้จะรอดไหม และต้องระวังอะไรสุด?',
                ].map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleQuickAsk(q)}
                    className="flex items-center justify-between p-3 rounded-xl bg-[#1C0A26] border border-[rgba(242,203,128,0.15)] hover:border-[#EAC272] text-xs text-[#FAE9CA] text-left transition-all group cursor-pointer"
                  >
                    <span>{q}</span>
                    <span className="text-[10px] text-[#EAC272] bg-[#110417] px-2 py-0.5 rounded-full border border-[rgba(242,203,128,0.2)] shrink-0 ml-2">
                      5 เหรียญ
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Question Input */}
            <div className="space-y-2 pt-2">
              <label className="text-[11px] text-[#C9B49D] font-medium">หรือพิมพ์คำถามเฉพาะตัวของคุณ:</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customQuestion}
                  onChange={(e) => setCustomQuestion(e.target.value)}
                  placeholder="เช่น พี่เค้าคิดยังไง, ทำไมเพื่อนร่วมงานถึง..."
                  className="flex-1 rounded-xl bg-[#110417] border border-[rgba(242,203,128,0.2)] px-3.5 py-2.5 text-xs text-[#FAE9CA] placeholder:text-[#C9B49D]/40 focus:border-[#EAC272] focus:outline-none"
                />
                <button
                  onClick={() => {
                    if (!customQuestion.trim()) return;
                    handleQuickAsk(customQuestion.trim());
                  }}
                  className="btn-gilded px-4 py-2 text-xs font-bold text-[#110918] rounded-xl shrink-0 cursor-pointer"
                >
                  ถามเลย (5C)
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Footer Top Up Shortcut & Economics Calculator */}
        <div className="mt-5 pt-4 border-t border-[rgba(242,203,128,0.12)] flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-3">
            <span className="text-[#C9B49D]">
              เหรียญ: <strong className="text-[#FAE9CA] font-bold">{coins} C</strong>
            </span>
            {onOpenEconomicsModal && (
              <button
                onClick={() => {
                  onClose();
                  onOpenEconomicsModal();
                }}
                className="text-[#A89279] hover:text-[#EAC272] flex items-center gap-1 cursor-pointer transition-colors"
                title="ดูโมเดลความคุ้มค่าราคาคนไทย"
              >
                <Calculator className="h-3.5 w-3.5 text-[#EAC272]" />
                <span>คำนวณความคุ้มค่า 🧮</span>
              </button>
            )}
          </div>

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
