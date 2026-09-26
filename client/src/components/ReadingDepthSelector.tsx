import React from 'react';
import { motion } from 'motion/react';
import {
  Sparkles,
  Brain,
  Layers,
  Flame,
  Coins,
  Info,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Activity,
  Award
} from 'lucide-react';
import { ReadingDepthTier, READING_DEPTH_TIERS } from '../types';

interface ReadingDepthSelectorProps {
  selectedDepth: ReadingDepthTier;
  onSelectDepth: (depth: ReadingDepthTier) => void;
  userCoins: number;
  onOpenTopUp: () => void;
  compact?: boolean;
}

export const ReadingDepthSelector: React.FC<ReadingDepthSelectorProps> = ({
  selectedDepth,
  onSelectDepth,
  userCoins,
  onOpenTopUp,
  compact = false,
}) => {
  const currentTier = READING_DEPTH_TIERS[selectedDepth];
  const hasEnoughCoins = userCoins >= currentTier.costCoins;

  return (
    <div className="w-full space-y-3 rounded-2xl bg-gradient-to-b from-[#1E0E2A]/90 to-[#120518]/90 border border-[rgba(242,203,128,0.25)] p-4 shadow-xl">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[rgba(242,203,128,0.15)] pb-3">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#361A4A] border border-[rgba(242,203,128,0.3)] text-[#EAC272]">
            <Layers className="h-4 w-4" />
          </div>
          <div>
            <span className="text-xs font-bold text-[#FAE9CA] flex items-center gap-1.5">
              เลือกระดับความลึกของข้อมูล (Credit Cost per Depth)
            </span>
            <span className="text-[10px] text-[#C9B49D] block">
              หักเหรียญตามความละเอียดเชิงจิตวิทยาและศาสตร์พยากรณ์
            </span>
          </div>
        </div>

        {/* User coins indicator */}
        <div className="flex items-center gap-1.5 rounded-full bg-[#110918] px-3 py-1 border border-[rgba(242,203,128,0.2)]">
          <Coins className="h-3.5 w-3.5 text-[#EAC272]" />
          <span className="text-xs font-bold text-[#FAE9CA]">{userCoins}</span>
          <span className="text-[10px] text-[#C9B49D]">เหรียญ</span>
        </div>
      </div>

      {/* Tier Options Grid */}
      <div className={`grid gap-2.5 ${compact ? 'grid-cols-1 sm:grid-cols-3' : 'grid-cols-1 sm:grid-cols-3'}`}>
        {(Object.keys(READING_DEPTH_TIERS) as ReadingDepthTier[]).map((tierKey) => {
          const tier = READING_DEPTH_TIERS[tierKey];
          const isSelected = selectedDepth === tierKey;
          const canAfford = userCoins >= tier.costCoins;

          return (
            <motion.button
              key={tierKey}
              type="button"
              whileHover={{ y: -2, scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onSelectDepth(tierKey)}
              className={`relative flex flex-col justify-between p-3.5 rounded-xl text-left border transition-all cursor-pointer ${
                isSelected
                  ? 'bg-gradient-to-b from-[#3D144E] to-[#21092B] border-[#EAC272] shadow-[0_0_16px_rgba(234,194,114,0.35)] ring-1 ring-[#EAC272]'
                  : 'bg-[#15071F]/80 border-[rgba(242,203,128,0.15)] hover:border-[rgba(242,203,128,0.35)] hover:bg-[#1C0A28]'
              }`}
            >
              {/* Badge if Popular */}
              {tier.badge && (
                <span className="absolute -top-2.5 right-3 rounded-full bg-gradient-to-r from-[#EAC272] to-[#D4A84D] text-[#110918] text-[9px] font-extrabold px-2 py-0.5 shadow">
                  {tier.badge}
                </span>
              )}

              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{tier.icon}</span>
                    <div>
                      <h4 className={`text-xs font-bold ${isSelected ? 'text-[#EAC272]' : 'text-[#FAE9CA]'}`}>
                        {tier.label}
                      </h4>
                      <span className="text-[10px] text-[#C9B49D] font-mono">
                        {tier.depthLevel}
                      </span>
                    </div>
                  </div>
                </div>

                <p className="text-[11px] text-[#FAE9CA]/80 mt-2 leading-relaxed">
                  {tier.description}
                </p>

                {/* Bullets */}
                <div className="mt-2.5 space-y-1">
                  {tier.features.slice(0, compact ? 2 : 3).map((feat, idx) => (
                    <div key={idx} className="flex items-center gap-1.5 text-[10px] text-[#C9B49D]">
                      <CheckCircle2 className="h-3 w-3 text-[#EAC272] shrink-0" />
                      <span className="truncate">{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bottom Cost bar */}
              <div className="mt-3 pt-2.5 border-t border-[rgba(242,203,128,0.1)] flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <Coins className={`h-3.5 w-3.5 ${isSelected ? 'text-[#EAC272]' : 'text-[#C9B49D]'}`} />
                  <span className={`text-xs font-black ${isSelected ? 'text-[#EAC272]' : 'text-[#FAE9CA]'}`}>
                    {tier.costCoins} เหรียญ
                  </span>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                  canAfford
                    ? isSelected ? 'bg-[#EAC272]/20 text-[#EAC272]' : 'bg-[#110918] text-[#C9B49D]'
                    : 'bg-rose-900/40 text-rose-300 font-semibold'
                }`}>
                  {canAfford ? (isSelected ? 'เลือกอยู่' : 'แตะเลือก') : 'เหรียญไม่พอ'}
                </span>
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Selected Tier Summary Banner & Insufficient Coin Notice */}
      {!hasEnoughCoins ? (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-rose-950/50 border border-rose-800/40 p-3 text-xs">
          <div className="flex items-center gap-2 text-rose-200">
            <Info className="h-4 w-4 text-rose-400 shrink-0" />
            <span>
              ต้องใช้ <strong>{currentTier.costCoins} เหรียญ</strong> สำหรับระดับ "{currentTier.label}" (คุณมี {userCoins} เหรียญ)
            </span>
          </div>
          <button
            type="button"
            onClick={onOpenTopUp}
            className="btn-gilded px-3.5 py-1 text-[11px] font-bold text-[#110918] rounded-full shrink-0"
          >
            เติมเหรียญทันที 💳
          </button>
        </div>
      ) : (
        <div className="flex items-center justify-between px-2 text-[11px] text-[#C9B49D]">
          <span className="flex items-center gap-1">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
            จะหัก <strong>{currentTier.costCoins} เหรียญ</strong> เมื่อกดปุ่มทำนายดวงชะตา
          </span>
          <span className="text-[#EAC272]">
            คงเหลือหลังทำนาย: {userCoins - currentTier.costCoins} เหรียญ
          </span>
        </div>
      )}
    </div>
  );
};
