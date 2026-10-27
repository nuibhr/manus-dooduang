import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import { ChevronRight } from 'lucide-react';
import type { FortuneReading } from '../types';
import { playMysticChimeSound } from '../utils/speechHelper';
import { analyzeZodiacCompatibilityWithProfile, type UserBirthProfile } from '../utils/astrologyEngine';

interface ZodiacCompatibilityBadgeProps {
  readingsHistory: FortuneReading[];
  birthProfile?: UserBirthProfile | null;
  onClick?: () => void;
  className?: string;
}

/** Small, independently bundled entry point for the Zodiac modal. */
export const ZodiacCompatibilityBadge: React.FC<ZodiacCompatibilityBadgeProps> = ({
  readingsHistory,
  birthProfile,
  onClick,
  className = '',
}) => {
  const analysis = useMemo(
    () => analyzeZodiacCompatibilityWithProfile(readingsHistory, birthProfile || undefined),
    [readingsHistory, birthProfile],
  );

  return (
    <motion.button
      type="button"
      whileHover={{ scale: 1.04, y: -1 }}
      whileTap={{ scale: 0.96 }}
      onClick={() => {
        playMysticChimeSound('card');
        onClick?.();
      }}
      className={`group relative flex items-center gap-2 rounded-full bg-gradient-to-r from-[#2A0E38] via-[#1E092B] to-[#361548] border border-[#EAC272]/40 px-3 py-1.5 text-xs shadow-md shadow-purple-950/40 hover:border-[#EAC272] transition-all cursor-pointer ${className}`}
      title="คลิกดูราศีคู่บุญและถอดรหัสลัคนา (Zodiac & Lagna Compatibility Engine)"
    >
      <span className="relative flex h-2 w-2" aria-hidden="true">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#EAC272] opacity-75" />
        <span className="relative inline-flex rounded-full h-2 w-2 bg-[#EAC272]" />
      </span>

      {birthProfile ? (
        <>
          <span className="font-serif-display text-sm text-[#FAE9CA] group-hover:scale-110 transition-transform">
            {birthProfile.lagnaSign.symbol}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="text-[11px] font-bold text-[#FAE9CA] group-hover:text-[#EAC272] transition-colors">
              ลัคนา{birthProfile.lagnaSign.nameTh.replace('ราศี', '')} • คู่บุญ: {analysis.topSign.nameTh.replace('ราศี', '')}
            </span>
            <span className="rounded-full bg-[#842C71]/60 border border-[#EAC272]/40 px-1.5 py-0.2 text-[10px] font-black text-[#EAC272]">
              {analysis.topScore}%
            </span>
          </span>
        </>
      ) : (
        <>
          <span className="font-serif-display text-sm text-[#EAC272]">♈</span>
          <span className="flex items-center gap-1.5">
            <span className="text-[11px] font-bold text-[#FAE9CA] group-hover:text-[#EAC272] transition-colors">
              วัด % ราศีคู่บุญ & ลัคนา
            </span>
            <span className="rounded-full bg-[#EAC272]/20 border border-[#EAC272]/50 px-1.5 py-0.2 text-[10px] font-semibold text-[#EAC272]">
              ใส่วันเกิด ✨
            </span>
          </span>
        </>
      )}

      <ChevronRight className="h-3 w-3 text-[#EAC272]/70 group-hover:translate-x-0.5 transition-transform" />
    </motion.button>
  );
};
