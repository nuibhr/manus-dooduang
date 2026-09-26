import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  X, 
  Trash2, 
  Sparkles, 
  Clock, 
  BookOpen, 
  ExternalLink,
  ChevronRight,
  Hash,
  BookmarkCheck
} from 'lucide-react';
import { FortuneReading } from '../types';
import { playMysticChimeSound } from '../utils/speechHelper';

interface SavedLuckyNumber {
  id: string;
  date: string;
  zodiac: string;
  core: number;
  pairs: string[];
  triplets: string[];
}

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  history: FortuneReading[];
  onSelectReading: (reading: FortuneReading) => void;
  onClearHistory: () => void;
  onOpenWisdomLibrary?: () => void;
  onOpenMonthlyForecast?: () => void;
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
  isOpen,
  onClose,
  history,
  onSelectReading,
  onClearHistory,
  onOpenWisdomLibrary,
  onOpenMonthlyForecast,
}) => {
  const [activeTab, setActiveTab] = useState<'readings' | 'numbers'>('readings');
  const [savedNumbers, setSavedNumbers] = useState<SavedLuckyNumber[]>([]);

  useEffect(() => {
    if (!isOpen) return;
    try {
      const stored = localStorage.getItem('thecatroom_saved_lucky_numbers');
      if (stored) {
        setSavedNumbers(JSON.parse(stored));
      } else {
        setSavedNumbers([]);
      }
    } catch (e) {
      console.error(e);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleDeleteNumber = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = savedNumbers.filter(n => n.id !== id);
    setSavedNumbers(updated);
    try {
      localStorage.setItem('thecatroom_saved_lucky_numbers', JSON.stringify(updated));
    } catch (err) {
      console.error(err);
    }
    playMysticChimeSound('soft');
  };

  const handleClearAllNumbers = () => {
    setSavedNumbers([]);
    try {
      localStorage.removeItem('thecatroom_saved_lucky_numbers');
    } catch (err) {
      console.error(err);
    }
    playMysticChimeSound('soft');
  };

  const disciplineIcons = {
    chinese: '☯️',
    tarot: '🎴',
    oracle: '🔮',
    rune: 'ᛋ',
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-[#110918]/80 backdrop-blur-sm">
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="flex h-full w-full max-w-md flex-col bg-gradient-to-b from-[#24102E] via-[#1E0E2A] to-[#110918] border-l border-[rgba(242,203,128,0.2)] p-6 shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[rgba(242,203,128,0.14)] pb-4">
          <div className="flex items-center gap-2.5">
            <BookOpen className="h-5 w-5 text-[#EAC272]" />
            <h3 className="font-serif-display text-lg text-[#FAE9CA]">บันทึกความมงคล</h3>
          </div>
          <div className="flex items-center gap-2">
            {activeTab === 'readings' && history.length > 0 && (
              <button
                onClick={onClearHistory}
                className="rounded-full p-1.5 text-[#C9B49D] hover:text-[#FFA4A4] hover:bg-[#110918] transition-all"
                title="ลบประวัติคำทำนายทั้งหมด"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
            {activeTab === 'numbers' && savedNumbers.length > 0 && (
              <button
                onClick={handleClearAllNumbers}
                className="rounded-full p-1.5 text-[#C9B49D] hover:text-[#FFA4A4] hover:bg-[#110918] transition-all"
                title="ลบประวัติเลขมงคลทั้งหมด"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
            <button
              onClick={onClose}
              className="rounded-full p-1.5 text-[#C9B49D] hover:text-[#FAE9CA] hover:bg-[#110918] transition-all"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Tab Switcher: Readings vs Lucky Numbers */}
        <div className="flex items-center gap-2 pt-3 pb-1">
          <button
            onClick={() => {
              playMysticChimeSound('soft');
              setActiveTab('readings');
            }}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'readings'
                ? 'bg-gradient-to-r from-[#361A4A] to-[#842C71] text-[#FAE9CA] border border-[rgba(242,203,128,0.4)] shadow-md'
                : 'bg-[#180B22] text-[#C9B49D] hover:text-[#FAE9CA] border border-transparent'
            }`}
          >
            <Sparkles className="h-3.5 w-3.5 text-[#EAC272]" />
            <span>คำทำนาย ({history.length})</span>
          </button>

          <button
            onClick={() => {
              playMysticChimeSound('soft');
              setActiveTab('numbers');
            }}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'numbers'
                ? 'bg-gradient-to-r from-[#361A4A] to-[#842C71] text-[#FAE9CA] border border-[rgba(242,203,128,0.4)] shadow-md'
                : 'bg-[#180B22] text-[#C9B49D] hover:text-[#FAE9CA] border border-transparent'
            }`}
          >
            <Hash className="h-3.5 w-3.5 text-[#EAC272]" />
            <span>เลขมงคล ({savedNumbers.length})</span>
          </button>
        </div>

        {/* Quick Launch Banner into Fortune Wisdom Library */}
        {onOpenWisdomLibrary && (
          <button
            onClick={() => {
              onClose();
              onOpenWisdomLibrary();
            }}
            className="group flex items-center justify-between rounded-xl bg-gradient-to-r from-[#361A4A] via-[#24102E] to-[#842C71] border border-[#EAC272]/40 p-2.5 text-left shadow hover:border-[#EAC272] transition-all"
          >
            <div className="flex items-center gap-2">
              <span className="text-base">📊</span>
              <div>
                <span className="text-xs font-bold text-[#FAE9CA] group-hover:text-[#EAC272] transition-colors block">
                  เข้าสู่คลังปัญญาชะตาชีวิต (Wisdom Library)
                </span>
                <span className="text-[10px] text-[#C9B49D] block">
                  ดู Data Viz วิเคราะห์แนวโน้ม & ถอดรหัสแพทเทิร์นชีวิต
                </span>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-[#EAC272] group-hover:translate-x-1 transition-transform" />
          </button>
        )}

        {/* Quick Launch Banner into Monthly Astrology Forecast */}
        {onOpenMonthlyForecast && (
          <button
            onClick={() => {
              onClose();
              onOpenMonthlyForecast();
            }}
            className="group flex items-center justify-between rounded-xl bg-gradient-to-r from-[#240F35] to-[#3D1452] border border-[#EAC272]/40 p-2.5 text-left shadow hover:border-[#EAC272] transition-all mt-2"
          >
            <div className="flex items-center gap-2">
              <span className="text-base">🌟</span>
              <div>
                <span className="text-xs font-bold text-[#FAE9CA] group-hover:text-[#EAC272] transition-colors block">
                  สรุปผลดวง 4 ศาสตร์ประจำเดือน
                </span>
                <span className="text-[10px] text-[#C9B49D] block">
                  วิเคราะห์กวนๆ พร้อมสร้างรูปภาพแชร์ลงโซเชียล
                </span>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-[#EAC272] group-hover:translate-x-1 transition-transform" />
          </button>
        )}

        {/* Content Section */}
        <div className="flex-1 overflow-y-auto py-3 space-y-3">
          {activeTab === 'readings' ? (
            history.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center text-center p-6 text-[#C9B49D]/60">
                <Sparkles className="h-10 w-10 text-[#EAC272]/40 mb-2" />
                <p className="font-serif-display text-sm text-[#FAE9CA]/70">ยังไม่มีประวัติคำทำนาย</p>
                <p className="text-xs text-[#C9B49D]/50 mt-1">
                  เมื่อเริ่มดูดวงในศาสตร์ต่างๆ คำทำนายจะถูกบันทึกไว้ที่นี่อัตโนมัติ
                </p>
              </div>
            ) : (
              history.map((item) => (
                <div
                  key={item.id}
                  onClick={() => {
                    playMysticChimeSound('soft');
                    onSelectReading(item);
                    onClose();
                  }}
                  className="group flex cursor-pointer items-center justify-between rounded-2xl bg-[#110918]/80 p-4 border border-[rgba(242,203,128,0.15)] hover:border-[#EAC272] hover:bg-[#1E0E2A] transition-all"
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{disciplineIcons[item.discipline]}</span>
                    <div>
                      <h4 className="text-xs font-bold text-[#FAE9CA] group-hover:text-[#EAC272] transition-colors flex items-center gap-1.5">
                        <span>{item.topic}</span>
                        {item.depthTier && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded-md bg-[#842C71]/40 border border-[#EAC272]/30 text-[#EAC272] font-semibold">
                            {item.depthTier === 'quick' ? '⚡ 5 เหรียญ' : item.depthTier === 'deep_soul' ? '👑 25 เหรียญ' : '🔮 10 เหรียญ'}
                          </span>
                        )}
                      </h4>
                      <p className="text-[11px] text-[#C9B49D] line-clamp-1 mt-0.5">
                        "{item.question}"
                      </p>
                      <span className="text-[10px] text-[#C9B49D]/60 mt-1 block">
                        {item.timestamp}
                      </span>
                    </div>
                  </div>

                  <ChevronRight className="h-4 w-4 text-[#C9B49D]/60 group-hover:text-[#EAC272] group-hover:translate-x-0.5 transition-all" />
                </div>
              ))
            )
          ) : (
            savedNumbers.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center text-center p-6 text-[#C9B49D]/60">
                <BookmarkCheck className="h-10 w-10 text-[#EAC272]/40 mb-2" />
                <p className="font-serif-display text-sm text-[#FAE9CA]/70">ยังไม่มีเลขมงคลที่บันทึกไว้</p>
                <p className="text-xs text-[#C9B49D]/50 mt-1">
                  เข้าสู่หน้า "คำนวณเลขมงคลดวงดาว" แล้วกดบันทึกชุดเลขที่คุณถูกใจเพื่อจัดเก็บไว้ที่นี่
                </p>
              </div>
            ) : (
              savedNumbers.map((item) => (
                <div
                  key={item.id}
                  className="rounded-2xl bg-[#110918]/90 p-3.5 border border-[rgba(242,203,128,0.18)] hover:border-[#EAC272]/60 transition-all flex items-center justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center gap-2 text-[10px] text-[#C9B49D]">
                      <span>{item.date}</span>
                      <span>•</span>
                      <span className="text-[#EAC272] font-semibold">{item.zodiac}</span>
                    </div>
                    <div className="flex items-center gap-3 mt-1.5">
                      <span className="text-lg font-black text-[#FAE9CA] bg-[#EAC272]/20 border border-[#EAC272]/40 px-2 py-0.5 rounded-lg">
                        {item.core}
                      </span>
                      <span className="text-xs text-[#D8B4FE] font-mono">
                        {item.pairs.join(', ')}
                      </span>
                      <span className="text-[11px] text-[#C9B49D] font-mono">
                        ({item.triplets.join(' • ')})
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={(e) => handleDeleteNumber(item.id, e)}
                    className="rounded-lg p-2 text-[#C9B49D] hover:text-[#FFA4A4] hover:bg-[#FFA4A4]/10 transition-colors"
                    title="ลบรายการ"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))
            )
          )}
        </div>
      </motion.div>
    </div>
  );
};
