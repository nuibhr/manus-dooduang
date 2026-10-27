import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Calculator,
  Coins,
  X,
  Sparkles,
  Check,
  TrendingDown,
  ShieldCheck,
  Percent,
  Zap,
  Flame,
  ArrowRight,
  HelpCircle,
  PiggyBank
} from 'lucide-react';
import { READING_DEPTH_TIERS } from '../types';

interface ThaiCreditEconomicsModalProps {
  isOpen: boolean;
  onClose: () => void;
  coins: number;
  onOpenTopUp: () => void;
}

export const ThaiCreditEconomicsModal: React.FC<ThaiCreditEconomicsModalProps> = ({
  isOpen,
  onClose,
  coins,
  onOpenTopUp,
}) => {
  // Interactive simulation state
  const [standardReadingsCount, setStandardReadingsCount] = useState<number>(2);
  const [deepSoulCount, setDeepSoulCount] = useState<number>(1);
  const [chatMessagesCount, setChatMessagesCount] = useState<number>(3);
  const [lotteryDrawsCount, setLotteryDrawsCount] = useState<number>(1);

  if (!isOpen) return null;

  // Calculation
  const totalCoinsNeeded =
    (standardReadingsCount * 10) +
    (deepSoulCount * 25) +
    (chatMessagesCount * 5) +
    (lotteryDrawsCount * 15);

  // Thai Market comparison (Average offline/online fortune teller cost: ~399 - 699 THB)
  const estimatedOfflineTellerCost = Math.max(399, (standardReadingsCount + deepSoulCount) * 299 + (chatMessagesCount * 50) + (lotteryDrawsCount * 99));
  const ourAppCostThb = Math.round(totalCoinsNeeded * 0.95); // With coin package bonus ~0.85 - 0.95 THB per coin
  const savingsThb = Math.max(0, estimatedOfflineTellerCost - ourAppCostThb);
  const savingsPercent = Math.min(95, Math.round((savingsThb / estimatedOfflineTellerCost) * 100));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0C0412]/80 backdrop-blur-md p-4 overflow-y-auto">
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="relative my-8 w-full max-w-xl rounded-[32px] bg-gradient-to-b from-[#260D33] via-[#1A0724] to-[#100315] p-6 sm:p-7 border-2 border-[rgba(242,203,128,0.35)] shadow-2xl shadow-[#110918] max-h-[92vh] overflow-y-auto text-left"
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
            🧮
          </div>
          <div>
            <h3 className="font-serif-display text-lg sm:text-xl text-[#FAE9CA] font-bold flex items-center gap-2">
              <span>คำนวณความคุ้มค่า & เศรษฐศาสตร์เครดิต</span>
              <span className="bg-[#EAC272]/20 text-[#EAC272] text-[10px] px-2 py-0.5 rounded-full border border-[#EAC272]/30">
                LINE Mini App WTP
              </span>
            </h3>
            <p className="text-xs text-[#C9B49D] mt-0.5">
              โมเดลราคาที่คนไทยยอมจ่าย สบายกระเป๋า จ่ายตามจริง ไม่ขายฝัน
            </p>
          </div>
        </div>

        {/* Section 1: Thai Market Price Psychology */}
        <div className="mt-4 rounded-2xl bg-[#14061A] p-4 border border-[rgba(242,203,128,0.18)] space-y-2 text-xs">
          <div className="flex items-center justify-between text-[#EAC272] font-semibold">
            <span className="flex items-center gap-1.5">
              <PiggyBank className="h-4 w-4" />
              โครงสร้างราคาที่คนไทยยอมจ่าย (Thai Willingness-to-Pay Sweet Spot)
            </span>
            <span className="text-[10px] text-[#A89279]">1 เหรียญ ≈ 1 บาท</span>
          </div>
          <p className="text-[#C9B49D] leading-relaxed">
            ใน LINE Mini App คนไทยชอบการใช้งานแบบ Micro-transaction สบายใจ ไม่ต้องจ่ายเงินก้อนโต 300 - 1,000 บาท
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
            <div className="p-2.5 rounded-xl bg-[#1C0A26] border border-[rgba(242,203,128,0.15)] text-center">
              <span className="text-[10px] text-[#A89279] block">ทดลองใช้</span>
              <span className="text-xs font-bold text-emerald-400 block my-0.5">ดูฟรี 1 ครั้ง</span>
              <span className="text-[9px] text-[#C9B49D]">สิทธิ์ฟรีแรกเข้า</span>
            </div>
            <div className="p-2.5 rounded-xl bg-[#1C0A26] border border-[rgba(242,203,128,0.15)] text-center">
              <span className="text-[10px] text-[#A89279] block">ถามสั้น / ขอเลข</span>
              <span className="text-xs font-bold text-[#FAE9CA] block my-0.5">5 - 15 บาท</span>
              <span className="text-[9px] text-[#C9B49D]">ราคาเท่าลูกอม</span>
            </div>
            <div className="p-2.5 rounded-xl bg-[#1C0A26] border border-[#EAC272]/40 bg-[#EAC272]/10 text-center">
              <span className="text-[10px] text-[#EAC272] font-bold block">ดวงมาตรฐาน</span>
              <span className="text-xs font-bold text-[#EAC272] block my-0.5">10 บาท</span>
              <span className="text-[9px] text-[#EAC272]">Sweet Spot 🔥</span>
            </div>
            <div className="p-2.5 rounded-xl bg-[#1C0A26] border border-[rgba(242,203,128,0.15)] text-center">
              <span className="text-[10px] text-[#A89279] block">ผ่าจิตวิญญาณ</span>
              <span className="text-xs font-bold text-[#F472B6] block my-0.5">25 บาท</span>
              <span className="text-[9px] text-[#C9B49D]">ถูกกว่าชานม 1 แก้ว</span>
            </div>
          </div>
        </div>

        {/* Section 2: Interactive Spending Calculator */}
        <div className="mt-5 space-y-3.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#FAE9CA] flex items-center gap-1.5">
              <Calculator className="h-4 w-4 text-[#EAC272]" />
              จำลองการใช้งานของคุณ (Interactive Calculator):
            </span>
            <span className="text-[11px] text-[#EAC272]">
              เหรียญของคุณตอนนี้: <strong>{coins} C</strong>
            </span>
          </div>

          <div className="space-y-2.5 text-xs">
            {/* Row 1: Standard Readings */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-[#17061F] border border-[rgba(242,203,128,0.12)]">
              <div>
                <span className="font-semibold text-[#FAE9CA] block">ผ่าดวงมาตรฐาน 5 มิติ (10 Coins)</span>
                <span className="text-[10px] text-[#A89279]">ไพ่ยิปซี, โอราเคิล, รูน, หรือดวงจีน</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setStandardReadingsCount(Math.max(0, standardReadingsCount - 1))}
                  className="w-7 h-7 rounded-lg bg-[#2A0E38] text-[#FAE9CA] font-bold hover:bg-[#3D144E] cursor-pointer"
                >
                  -
                </button>
                <span className="w-5 text-center font-bold text-[#EAC272]">{standardReadingsCount}</span>
                <button
                  onClick={() => setStandardReadingsCount(standardReadingsCount + 1)}
                  className="w-7 h-7 rounded-lg bg-[#2A0E38] text-[#FAE9CA] font-bold hover:bg-[#3D144E] cursor-pointer"
                >
                  +
                </button>
              </div>
            </div>

            {/* Row 2: Deep Soul Readings */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-[#17061F] border border-[rgba(242,203,128,0.12)]">
              <div>
                <span className="font-semibold text-[#FAE9CA] block">ผ่าจิตวิญญาณระดับลึก 3 ไทม์ไลน์ (25 Coins)</span>
                <span className="text-[10px] text-[#A89279]">Shadow Self, ปมในใจ, พิธีกรรมปลดล็อก</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setDeepSoulCount(Math.max(0, deepSoulCount - 1))}
                  className="w-7 h-7 rounded-lg bg-[#2A0E38] text-[#FAE9CA] font-bold hover:bg-[#3D144E] cursor-pointer"
                >
                  -
                </button>
                <span className="w-5 text-center font-bold text-[#EAC272]">{deepSoulCount}</span>
                <button
                  onClick={() => setDeepSoulCount(deepSoulCount + 1)}
                  className="w-7 h-7 rounded-lg bg-[#2A0E38] text-[#FAE9CA] font-bold hover:bg-[#3D144E] cursor-pointer"
                >
                  +
                </button>
              </div>
            </div>

            {/* Row 3: Cat Chat Messages */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-[#17061F] border border-[rgba(242,203,128,0.12)]">
              <div>
                <span className="font-semibold text-[#FAE9CA] block">ถามสดกับแม่หมอเหมียว AI (5 Coins/คำถาม)</span>
                <span className="text-[10px] text-[#A89279]">ถามเรื่องคนคุย, เจาะจงเรื่องงาน, ข้อสงสัยด่วน</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setChatMessagesCount(Math.max(0, chatMessagesCount - 1))}
                  className="w-7 h-7 rounded-lg bg-[#2A0E38] text-[#FAE9CA] font-bold hover:bg-[#3D144E] cursor-pointer"
                >
                  -
                </button>
                <span className="w-5 text-center font-bold text-[#EAC272]">{chatMessagesCount}</span>
                <button
                  onClick={() => setChatMessagesCount(chatMessagesCount + 1)}
                  className="w-7 h-7 rounded-lg bg-[#2A0E38] text-[#FAE9CA] font-bold hover:bg-[#3D144E] cursor-pointer"
                >
                  +
                </button>
              </div>
            </div>

            {/* Row 4: Lottery Unlocks */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-[#17061F] border border-[rgba(242,203,128,0.12)]">
              <div>
                <span className="font-semibold text-[#FAE9CA] block">ปลดล็อกเลขเด็ดงวด 1 หรือ 16 (15 Coins)</span>
                <span className="text-[10px] text-[#A89279]">เลขวิ่ง, 2 ตัวตรง, 3 ตัวตรง พร้อมบันทึกคลังเลข</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setLotteryDrawsCount(Math.max(0, lotteryDrawsCount - 1))}
                  className="w-7 h-7 rounded-lg bg-[#2A0E38] text-[#FAE9CA] font-bold hover:bg-[#3D144E] cursor-pointer"
                >
                  -
                </button>
                <span className="w-5 text-center font-bold text-[#EAC272]">{lotteryDrawsCount}</span>
                <button
                  onClick={() => setLotteryDrawsCount(lotteryDrawsCount + 1)}
                  className="w-7 h-7 rounded-lg bg-[#2A0E38] text-[#FAE9CA] font-bold hover:bg-[#3D144E] cursor-pointer"
                >
                  +
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Value Summary & Savings vs Market */}
        <div className="mt-5 rounded-2xl bg-gradient-to-r from-[#2B0E38] via-[#1E0928] to-[#2B0E38] p-4 border-2 border-[#EAC272] space-y-3">
          <div className="flex items-center justify-between border-b border-[rgba(242,203,128,0.2)] pb-2.5">
            <div>
              <span className="text-[11px] text-[#C9B49D]">เหรียญที่ต้องใช้รวม</span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <Coins className="h-5 w-5 text-[#EAC272]" />
                <span className="text-2xl font-black text-[#FAE9CA]">{totalCoinsNeeded}</span>
                <span className="text-xs text-[#EAC272]">Coins (~{ourAppCostThb} บาท)</span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] text-[#A89279] line-through block">
                เทียบหมอดูข้างนอก: ฿{estimatedOfflineTellerCost}
              </span>
              <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-500/40 px-2 py-0.5 rounded-full">
                <TrendingDown className="h-3 w-3" /> ประหยัด {savingsPercent}% (เซฟ ฿{savingsThb})
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
            <p className="text-[11px] text-[#C9B49D] leading-tight">
              ✨ <strong>คุ้มค่าที่สุดในไทย:</strong> จ่ายเท่าที่ใช้จริง ไม่ต้องเหมาคอร์สแพง เก็บประวัติดวงและสถิติหวยตลอดชีพ
            </p>
            <button
              onClick={() => {
                onClose();
                onOpenTopUp();
              }}
              className="btn-gilded w-full sm:w-auto px-5 py-2.5 text-xs font-bold text-[#110918] flex items-center justify-center gap-1.5 rounded-xl shrink-0 cursor-pointer shadow-lg"
            >
              <span>เติมแพ็กเกจเหรียญ</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

      </motion.div>
    </div>
  );
};
