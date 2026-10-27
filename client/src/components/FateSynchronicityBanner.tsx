import React from 'react';
import { motion } from 'motion/react';
import { GitMerge, Sparkles, ChevronRight, Flame, Layers } from 'lucide-react';
import { FortuneReading } from '../types';
import { analyzeFateSynchronicity } from '../utils/fateDatabase';

interface FateSynchronicityBannerProps {
  readings: FortuneReading[];
  onOpenSynchronicityModal: () => void;
  currentDisciplineName?: string;
}

export const FateSynchronicityBanner: React.FC<FateSynchronicityBannerProps> = ({
  readings,
  onOpenSynchronicityModal,
  currentDisciplineName,
}) => {
  const synchronicity = analyzeFateSynchronicity(readings);

  if (!synchronicity.hasHistory) {
    return (
      <div
        onClick={onOpenSynchronicityModal}
        className="fate-synchronicity-banner w-full mb-4 px-4 py-2.5 rounded-2xl bg-[#17061F]/80 border border-[rgba(242,203,128,0.2)] hover:border-[#EAC272] transition-all flex items-center justify-between gap-3 text-xs cursor-pointer group shadow-sm"
      >
        <div className="flex items-center gap-2.5 text-[#C9B49D]">
          <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#2A0E38] text-xs text-[#EAC272] border border-[#EAC272]/30">
            🌱
          </span>
          <span>
            <strong className="text-[#FAE9CA]">สายใยชะตา LINE Mini App:</strong> เริ่มต้นเปิดคำทำนายแรกเพื่อบันทึกประวัติและเช็คความสัมพันธ์ของคำตอบ
          </span>
        </div>
        <span className="text-[11px] text-[#EAC272] group-hover:translate-x-0.5 transition-transform flex items-center gap-1 font-bold shrink-0">
          <span>ดูระบบสายใย</span>
          <ChevronRight className="h-3.5 w-3.5" />
        </span>
      </div>
    );
  }

  const latest = synchronicity.latestReading;
  const recentCards = synchronicity.previousCardsSummary.slice(0, 2).join(', ');

  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={onOpenSynchronicityModal}
      className="fate-synchronicity-banner w-full mb-4 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-[#2B0E38]/90 via-[#1C0826]/90 to-[#2B0E38]/90 border border-[#EAC272]/40 hover:border-[#EAC272] transition-all flex items-center justify-between gap-3 text-xs cursor-pointer group shadow-md"
    >
      <div className="flex items-center gap-2.5 min-w-0">
        <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-gradient-to-tr from-[#3D144E] to-[#842C71] text-xs text-[#EAC272] border border-[#EAC272]/50 shrink-0">
          🔗
        </span>
        <div className="min-w-0 text-left">
          <p className="text-[#FAE9CA] font-semibold truncate flex items-center gap-1.5">
            <span>เชื่อมโยงคำตอบก่อนหน้า:</span>
            <span className="text-[#EAC272] font-normal truncate">
              {latest ? `${latest.topic} (${recentCards || latest.discipline})` : 'มีประวัติสะสม'}
            </span>
          </p>
          <p className="text-[10px] text-[#C9B49D] truncate">
            ธาตุเด่น: <strong className="text-amber-300">{synchronicity.dominantElement.split(' ')[0]}</strong> • เชื่อม {readings.length} คำทำนายใน LINE Mini App
          </p>
        </div>
      </div>

      <div className="flex items-center gap-1 text-[11px] font-bold text-[#EAC272] bg-[#110417] px-2.5 py-1 rounded-xl border border-[#EAC272]/30 shrink-0 group-hover:border-[#EAC272] transition-colors">
        <span>เช็คความสัมพันธ์</span>
        <ChevronRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
      </div>
    </motion.div>
  );
};
