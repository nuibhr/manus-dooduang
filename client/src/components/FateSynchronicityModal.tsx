import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  GitMerge,
  Sparkles,
  X,
  Flame,
  Compass,
  Layers,
  Link2,
  Check,
  Coins,
  Calendar,
  Share2,
  ShieldCheck,
  MessageSquare,
  HelpCircle,
  Smartphone
} from 'lucide-react';
import { FortuneReading, DisciplineType } from '../types';
import { analyzeFateSynchronicity, getLineMiniAppProfile, saveLineMiniAppProfile, LineMiniAppProfile } from '../utils/fateDatabase';
import { playMysticChimeSound } from '../utils/speechHelper';

interface FateSynchronicityModalProps {
  isOpen: boolean;
  onClose: () => void;
  readings: FortuneReading[];
  coins: number;
  onSwitchDiscipline: (discipline: DisciplineType) => void;
  onShowToast: (msg: string) => void;
  onOpenWisdomLibrary?: () => void;
}

export const FateSynchronicityModal: React.FC<FateSynchronicityModalProps> = ({
  isOpen,
  onClose,
  readings,
  coins,
  onSwitchDiscipline,
  onShowToast,
  onOpenWisdomLibrary,
}) => {
  const [lineProfile, setLineProfile] = useState<LineMiniAppProfile>(() => getLineMiniAppProfile());
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'correlation' | 'karmic_thread' | 'line_miniapp'>('correlation');

  if (!isOpen) return null;

  const synchronicity = analyzeFateSynchronicity(readings);

  const handleSyncWithLine = () => {
    setIsSyncing(true);
    playMysticChimeSound('gold');
    setTimeout(() => {
      const updated: LineMiniAppProfile = {
        ...lineProfile,
        isLineConnected: true,
        lastSyncedAt: new Date().toISOString(),
      };
      setLineProfile(updated);
      saveLineMiniAppProfile(updated);
      setIsSyncing(false);
      onShowToast('✨ ซิงค์สายใยชะตาเข้าสู่ฐานข้อมูล LINE Mini App สำเร็จแล้ว!');
    }, 700);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0C0412]/80 backdrop-blur-md p-4 overflow-y-auto">
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="relative my-8 w-full max-w-2xl rounded-[32px] bg-gradient-to-b from-[#280E36] via-[#1A0724] to-[#100315] p-6 sm:p-7 border-2 border-[rgba(242,203,128,0.35)] shadow-2xl shadow-[#110918] max-h-[92vh] overflow-y-auto text-left"
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
            🔗
          </div>
          <div>
            <h3 className="font-serif-display text-lg sm:text-xl text-[#FAE9CA] font-bold flex items-center gap-2">
              <span>เช็คความสัมพันธ์ของคำตอบ & สายใยชะตากรรม</span>
            </h3>
            <p className="text-xs text-[#C9B49D] mt-0.5">
              เชื่อมโยงทุกศาสตร์ที่เปิด วิเคราะห์แพทเทิร์นชีวิต (LINE Mini App Fate Thread)
            </p>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex flex-wrap items-center justify-between gap-2 my-4">
          <div className="flex flex-1 rounded-xl bg-[#110417] p-1 border border-[rgba(242,203,128,0.15)] text-xs font-semibold">
            <button
              onClick={() => setActiveTab('correlation')}
              className={`flex-1 py-2 rounded-lg transition-all text-center flex items-center justify-center gap-1.5 ${
                activeTab === 'correlation'
                  ? 'bg-gradient-to-r from-[#EAC272] to-[#D4A84D] text-[#110918] font-bold shadow'
                  : 'text-[#C9B49D] hover:text-[#FAE9CA]'
              }`}
            >
              <span>🔮</span>
              <span>วิเคราะห์ความสัมพันธ์</span>
            </button>
            <button
              onClick={() => setActiveTab('karmic_thread')}
              className={`flex-1 py-2 rounded-lg transition-all text-center flex items-center justify-center gap-1.5 ${
                activeTab === 'karmic_thread'
                  ? 'bg-gradient-to-r from-[#EAC272] to-[#D4A84D] text-[#110918] font-bold shadow'
                  : 'text-[#C9B49D] hover:text-[#FAE9CA]'
              }`}
            >
              <span>📜</span>
              <span>เส้นใยไพ่ ({readings.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('line_miniapp')}
              className={`flex-1 py-2 rounded-lg transition-all text-center flex items-center justify-center gap-1.5 ${
                activeTab === 'line_miniapp'
                  ? 'bg-gradient-to-r from-[#EAC272] to-[#D4A84D] text-[#110918] font-bold shadow'
                  : 'text-[#C9B49D] hover:text-[#FAE9CA]'
              }`}
            >
              <span>💬</span>
              <span>LINE Mini App</span>
            </button>
          </div>

          {onOpenWisdomLibrary && (
            <button
              onClick={() => {
                onClose();
                onOpenWisdomLibrary();
              }}
              className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#842C71] to-[#361A4A] border border-[#EAC272]/50 px-3.5 py-2 text-xs font-bold text-[#FAE9CA] hover:border-[#EAC272] transition-all shadow"
            >
              <span>📊 คลังปัญญา & Data Viz</span>
            </button>
          )}
        </div>

        {/* TAB 1: CORRELATION & BESTIE REALITY CHECK */}
        {activeTab === 'correlation' && (
          <div className="space-y-4">
            {/* Sassy Bestie Reality Check based on past readings */}
            <div className="rounded-2xl bg-gradient-to-b from-[#2E0F3D] to-[#180722] border-2 border-[#EAC272] p-5 space-y-3 shadow-xl">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#EAC272] flex items-center gap-1.5">
                  <Flame className="h-4 w-4 text-rose-400" />
                  หมัดฮุกเพื่อนสาว: ความจริงที่แท้ทรูจากผลดูดวงสะสม
                </span>
                <span className="text-[10px] text-[#A89279] bg-[#110417] px-2.5 py-0.5 rounded-full border border-[#EAC272]/30">
                  Alignment {synchronicity.alignmentScore}%
                </span>
              </div>

              <p className="text-sm font-medium text-[#FAE9CA] leading-relaxed italic bg-[#110417]/80 p-3.5 rounded-xl border border-[rgba(242,203,128,0.15)]">
                "{synchronicity.sassyCorrelationRoast}"
              </p>

              <div className="text-xs text-[#C9B49D] space-y-1.5 pt-1">
                <p>
                  <strong className="text-[#EAC272]">🧭 ธาตุเด่นประจำจิตใต้สำนึก: </strong>
                  <span>{synchronicity.dominantElement}</span>
                </p>
                <p>
                  <strong className="text-[#FAE9CA]">🎯 วงจรกรรม/ประเด็นที่ถามซ้ำ: </strong>
                  <span>{synchronicity.dominantTheme}</span>
                </p>
                {synchronicity.previousCardsSummary.length > 0 && (
                  <p>
                    <strong className="text-[#A89279]">🎴 ไพ่/สัญลักษณ์ที่เชื่อมโยง: </strong>
                    <span className="text-[#EAC272]">{synchronicity.previousCardsSummary.join(' ➔ ')}</span>
                  </p>
                )}
              </div>
            </div>

            {/* Cross-Discipline Energy Breakdown */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="rounded-2xl bg-[#14061A] p-4 border border-[rgba(242,203,128,0.18)] space-y-2">
                <span className="font-bold text-[#FAE9CA] block">สมดุลธาตุในไพ่สะสม:</span>
                <div className="space-y-1.5">
                  {Object.entries(synchronicity.elementCounts).map(([elem, cnt], i) => (
                    <div key={i} className="flex items-center justify-between">
                      <span className="text-[#C9B49D]">{elem.split(' ')[0]}</span>
                      <span className="font-bold text-[#EAC272]">{cnt} ครั้ง</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl bg-[#14061A] p-4 border border-[rgba(242,203,128,0.18)] space-y-2">
                <span className="font-bold text-[#FAE9CA] block">สถิติหัวข้อที่กังวล:</span>
                <div className="space-y-1.5">
                  {Object.entries(synchronicity.themeCounts).map(([thm, cnt], i) => (
                    <div key={i} className="flex items-center justify-between">
                      <span className="text-[#C9B49D]">{thm.split(' ')[0]}</span>
                      <span className="font-bold text-[#F472B6]">{cnt} ครั้ง</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Action suggestion */}
            <div className="rounded-2xl bg-[#17061F] p-4 border border-[rgba(242,203,128,0.15)] text-xs text-[#C9B49D] flex items-center justify-between gap-3">
              <div>
                <span className="font-bold text-[#FAE9CA] block mb-0.5">อยากปลดล็อกข้อสงสัยนี้ให้ลึกขึ้น?</span>
                <p>เปิดไพ่ขยายความต่อ หรือถามตรงกับแม่หมอเหมียว AI ได้ทันที</p>
              </div>
              <button
                onClick={() => {
                  onClose();
                  onSwitchDiscipline('tarot');
                }}
                className="btn-gilded px-4 py-2 text-xs font-bold text-[#110918] rounded-xl shrink-0 cursor-pointer shadow"
              >
                <span>เปิดไพ่ใบใหม่ 🎴</span>
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: KARMIC THREAD OF SAVED READINGS */}
        {activeTab === 'karmic_thread' && (
          <div className="space-y-3">
            {readings.length === 0 ? (
              <div className="rounded-2xl border-2 border-dashed border-[rgba(242,203,128,0.25)] p-8 text-center space-y-3 bg-[#14061A]/60">
                <span className="text-4xl block">📜</span>
                <h4 className="font-serif-display text-base text-[#FAE9CA] font-bold">
                  ยังไม่มีประวัติการดูดวงในฐานข้อมูล
                </h4>
                <p className="text-xs text-[#C9B49D] max-w-sm mx-auto">
                  เมื่อคุณเปิดไพ่ยิปซี โอราเคิล รูน หรือดวงจีน ข้อมูลจะถูกจัดเก็บเข้าสู่สายใยชะตากรรมเพื่อเช็คความสัมพันธ์ของคำตอบทันที!
                </p>
              </div>
            ) : (
              <div className="space-y-2.5 max-h-[55vh] overflow-y-auto pr-1">
                {readings.map((r, idx) => (
                  <div
                    key={r.id || idx}
                    className="rounded-2xl bg-[#180722] border border-[rgba(242,203,128,0.15)] p-3.5 text-xs space-y-2 hover:border-[#EAC272]/50 transition-all"
                  >
                    <div className="flex items-center justify-between border-b border-[rgba(242,203,128,0.1)] pb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[#FAE9CA]">{r.topic}</span>
                        <span className="text-[10px] text-[#A89279]">({r.discipline})</span>
                      </div>
                      <span className="text-[10px] text-[#EAC272] bg-[#110417] px-2 py-0.5 rounded-full border border-[rgba(242,203,128,0.2)]">
                        {r.timestamp}
                      </span>
                    </div>

                    <p className="text-[#C9B49D] text-[11px]">
                      <strong>คำถาม: </strong>"{r.question || 'ภาพรวมชะตาชีวิต'}"
                    </p>

                    {Array.isArray(r.itemsSelected) && r.itemsSelected.length > 0 && (
                      <div className="flex items-center gap-1.5 flex-wrap pt-1">
                        <span className="text-[10px] text-[#A89279]">ไพ่ที่เปิดได้:</span>
                        {r.itemsSelected.map((item: any, i: number) => (
                          <span
                            key={i}
                            className="bg-[#2A0E38] text-[#FAE9CA] px-2 py-0.5 rounded-md border border-[#EAC272]/20 text-[10px]"
                          >
                            {item.nameTh || item.name || item.titleTh || item.symbol}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: LINE MINI APP SYNC STATUS */}
        {activeTab === 'line_miniapp' && (
          <div className="space-y-4">
            <div className="rounded-2xl bg-gradient-to-b from-[#103019] via-[#0E2014] to-[#0A160E] border-2 border-emerald-500/40 p-5 space-y-3.5 shadow-xl text-xs">
              <div className="flex items-center justify-between border-b border-emerald-500/20 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-emerald-400 bg-emerald-950 flex items-center justify-center text-xl">
                    {lineProfile.pictureUrl ? (
                      <img src={lineProfile.pictureUrl} alt="LINE Avatar" className="w-full h-full object-cover" />
                    ) : (
                      '👤'
                    )}
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-sm flex items-center gap-1.5">
                      <span>{lineProfile.displayName}</span>
                      <span className="bg-emerald-500 text-black text-[9px] font-bold px-1.5 py-0.2 rounded-full">
                        LINE LIFF Ready
                      </span>
                    </h4>
                    <p className="text-[10px] text-emerald-300 font-mono mt-0.5">
                      LINE ID: {lineProfile.lineUserId}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded-full border border-emerald-500/30">
                    <Check className="h-3 w-3" /> ออนไลน์
                  </span>
                </div>
              </div>

              <div className="space-y-2 text-[#C9B49D]">
                <p>
                  ✨ <strong>ความพร้อมสำหรับ LINE Mini App:</strong> ฐานข้อมูลดวงชะตานี้รองรับการติดตั้งเป็น LINE Mini App (LIFF) โดยตรง ทุกผลการทำนาย, เลขเด็ดที่ปลดล็อค, และประวัติการจ่ายเหรียญจะผูกติดกับบัญชี LINE ของคุณอย่างถาวร
                </p>
                <div className="bg-[#051108] p-3 rounded-xl border border-emerald-500/20 font-mono text-[10px] space-y-1 text-emerald-200">
                  <p>• Linked LINE User ID: {lineProfile.lineUserId}</p>
                  <p>• Total Synced Readings: {readings.length} รายการ</p>
                  <p>• Cloud Sync Timestamp: {lineProfile.lastSyncedAt || 'Active'}</p>
                  <p>• Coin Balance Synced: {coins} Coins</p>
                </div>
              </div>

              <button
                onClick={handleSyncWithLine}
                disabled={isSyncing}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-black font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer hover:brightness-110 shadow-lg"
              >
                <Smartphone className="h-4 w-4" />
                <span>{isSyncing ? 'กำลังซิงค์ฐานข้อมูล...' : 'ซิงค์ข้อมูลกับ LINE Mini App'}</span>
              </button>
            </div>
          </div>
        )}

      </motion.div>
    </div>
  );
};
