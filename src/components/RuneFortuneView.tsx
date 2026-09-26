import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  RotateCcw, 
  Layers, 
  Flame, 
  Compass, 
  ShieldCheck, 
  HelpCircle 
} from 'lucide-react';
import { RUNE_STONES } from '../data/runeData';
import { RuneStone, SassLevel, ReadingDepthTier, READING_DEPTH_TIERS, FortuneReading } from '../types';
import { playCatPurrSound, playMysticChimeSound } from '../utils/speechHelper';
import { ReadingDepthSelector } from './ReadingDepthSelector';
import { FateSynchronicityBanner } from './FateSynchronicityBanner';

interface RuneFortuneViewProps {
  onAnalyzeReading: (data: {
    discipline: 'rune';
    topic: string;
    question: string;
    itemsSelected: any;
    sassyLevel: SassLevel;
    depthTier?: ReadingDepthTier;
  }) => void;
  isLoading: boolean;
  sassLevel: SassLevel;
  userCoins?: number;
  onOpenTopUp?: () => void;
  readings?: FortuneReading[];
  onOpenSynchronicityModal?: () => void;
}

export const RuneFortuneView: React.FC<RuneFortuneViewProps> = ({
  onAnalyzeReading,
  isLoading,
  sassLevel,
  userCoins = 50,
  onOpenTopUp = () => {},
  readings,
  onOpenSynchronicityModal,
}) => {
  const [castCount, setCastCount] = useState<1 | 3>(3);
  const [selectedDepth, setSelectedDepth] = useState<ReadingDepthTier>('standard');
  const [selectedRunes, setSelectedRunes] = useState<Array<{ rune: RuneStone; position: string }>>([]);
  const [isCasting, setIsCasting] = useState<boolean>(false);
  const [userQuestion, setUserQuestion] = useState<string>('ทิศทางและจังหวะชีวิตข้างหน้ามีอะไรที่ต้องระวังเป็นพิเศษ');
  const [selectedTopic, setSelectedTopic] = useState<string>('จังหวะชีวิตและอุปสรรค');

  const nornLabels = [
    '1. อดีตที่สร้างรากฐาน (Urd - What Was)',
    '2. ความเป็นจริงขณะนี้ (Verdandi - What Is)',
    '3. แนวโน้มและการลงมือทำ (Skuld - What Should Be)',
  ];

  // Cast Runes from Pouch
  const handleCastRunes = () => {
    playCatPurrSound();
    playMysticChimeSound('rune');
    setIsCasting(true);
    setSelectedRunes([]);

    setTimeout(() => {
      const shuffled = [...RUNE_STONES].sort(() => Math.random() - 0.5);
      const picked = shuffled.slice(0, castCount).map((r, idx) => ({
        rune: r,
        position: castCount === 1 ? 'หินรูนแห่งแก่นแท้ (The Core Stave)' : nornLabels[idx],
      }));
      setSelectedRunes(picked);
      setIsCasting(false);
    }, 700);
  };

  const handleSubmit = () => {
    if (selectedRunes.length === 0) return;
    playCatPurrSound();

    const items = selectedRunes.map(sr => ({
      position: sr.position,
      name: sr.rune.name,
      symbol: sr.rune.symbol,
      element: sr.rune.element,
      traditionalMeaning: sr.rune.traditionalMeaning,
      psychologicalMirror: sr.rune.psychologicalMirror,
      sassyRealityCheck: sr.rune.sassyRealityCheck,
    }));

    onAnalyzeReading({
      discipline: 'rune',
      topic: selectedTopic,
      question: userQuestion,
      itemsSelected: items,
      sassyLevel: sassLevel,
      depthTier: selectedDepth,
    });
  };

  return (
    <div className="space-y-6">
      {/* Cross-Reading Fate Synchronicity Banner */}
      {readings && onOpenSynchronicityModal && (
        <FateSynchronicityBanner
          readings={readings}
          onOpenSynchronicityModal={onOpenSynchronicityModal}
          currentDisciplineName="ศาสตร์หินรูนนอร์ส"
        />
      )}

      {/* Header & Configuration */}
      <div className="velvet-card rounded-[28px] p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[rgba(242,203,128,0.14)] pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#361A4A] border border-[rgba(242,203,128,0.3)] text-[#EAC272] text-2xl font-serif shadow-md">
              ᛋ
            </div>
            <div>
              <h2 className="font-serif-display text-2xl font-normal text-[#FAE9CA]">ศาสตร์หินรูนนอร์ส (Elder Futhark Runes)</h2>
              <p className="text-xs text-[#C9B49D]">
                สัญลักษณ์พลังธรรมชาติ กฎแห่งเหตุและผล (Cause & Effect)
              </p>
            </div>
          </div>

          <div className="flex items-center rounded-full bg-[#110918] p-1 border border-[rgba(242,203,128,0.15)]">
            <button
              id="btn-rune-cast-1"
              onClick={() => {
                setCastCount(1);
                setSelectedRunes([]);
              }}
              className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all ${
                castCount === 1
                  ? 'bg-gradient-to-r from-[#EAC272] to-[#D4A84D] text-[#110918] font-bold shadow-md'
                  : 'text-[#C9B49D] hover:text-[#FAE9CA]'
              }`}
            >
              ทอดหิน 1 เม็ด (แก่นแท้)
            </button>
            <button
              id="btn-rune-cast-3"
              onClick={() => {
                setCastCount(3);
                setSelectedRunes([]);
              }}
              className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all ${
                castCount === 3
                  ? 'bg-gradient-to-r from-[#EAC272] to-[#D4A84D] text-[#110918] font-bold shadow-md'
                  : 'text-[#C9B49D] hover:text-[#FAE9CA]'
              }`}
            >
              ทอดหิน 3 นอร์น (อดีต-ปัจจุบัน-อนาคต)
            </button>
          </div>
        </div>

        {/* Question Prompt */}
        <div>
          <label className="text-[11px] font-semibold uppercase tracking-wider text-[#EAC272]">
            คำถามในใจก่อนทอดหินรูน:
          </label>
          <textarea
            id="input-rune-question"
            rows={2}
            value={userQuestion}
            onChange={(e) => setUserQuestion(e.target.value)}
            placeholder="เช่น ต้องระวังอะไรในช่วงนี้, ทำไมแผนที่วางไว้ยังติดขัด..."
            className="mt-2 w-full rounded-2xl bg-[#110918] border border-[rgba(242,203,128,0.18)] px-4 py-2.5 text-sm text-[#FAE9CA] placeholder:text-[#C9B49D]/40 focus:border-[#EAC272] focus:outline-none"
          />
        </div>
      </div>

      {/* Rune Casting Alter / Canvas */}
      <div className="velvet-card rounded-[28px] p-6 space-y-5">
        
        {/* Runic Bag / Cast Trigger */}
        <div className="flex flex-col items-center justify-center p-6 text-center">
          <motion.div
            animate={isCasting ? { rotate: [-10, 10, -10, 10, 0], scale: [1, 1.1, 1] } : {}}
            transition={{ duration: 0.6 }}
            className="flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-tr from-[#361A4A] via-[#24102E] to-[#110918] border-2 border-[rgba(242,203,128,0.4)] shadow-2xl shadow-[#110918] cursor-pointer hover:border-[#EAC272]"
            onClick={handleCastRunes}
          >
            <span className="text-4xl text-[#EAC272] font-serif">ᛟ</span>
          </motion.div>

          <button
            id="btn-cast-runes"
            onClick={handleCastRunes}
            disabled={isCasting}
            className="btn-gilded mt-5 px-6 py-2.5 text-xs font-bold text-[#110918] cursor-pointer"
          >
            {isCasting ? 'กำลังเขย่าถุงรูน...' : `🐾 เขย่าถุงทอดหินรูน (${castCount} เม็ด)`}
          </button>
        </div>

        {/* Selected Runes Stones Display */}
        {selectedRunes.length > 0 && (
          <div className={`grid grid-cols-1 gap-4 ${castCount === 1 ? 'max-w-md mx-auto' : 'md:grid-cols-3'}`}>
            {selectedRunes.map((sr, i) => (
              <motion.div
                key={sr.rune.id}
                initial={{ scale: 0.8, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                transition={{ delay: i * 0.15 }}
                className="flex flex-col justify-between rounded-2xl bg-gradient-to-b from-[#24102E] to-[#110918] p-5 border border-[rgba(242,203,128,0.3)] shadow-xl"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="rounded-full bg-[#842C71]/40 px-2.5 py-0.5 text-[10px] font-bold text-[#F2CB80] border border-[rgba(242,203,128,0.2)]">
                      {sr.position}
                    </span>
                    <span className="text-xs text-[#C9B49D]">ธาตุ: {sr.rune.element}</span>
                  </div>

                  {/* Stone Glyph Visual */}
                  <div className="my-4 flex items-center gap-4">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#110918] border border-[rgba(242,203,128,0.4)] text-[#EAC272] text-3xl font-serif shadow-lg">
                      {sr.rune.symbol}
                    </div>
                    <div>
                      <h3 className="font-serif-display text-lg text-[#FAE9CA]">{sr.rune.name}</h3>
                      <p className="text-xs text-[#EAC272] font-mono">เสียงอ่าน: /{sr.rune.phonetic}/</p>
                    </div>
                  </div>

                  <p className="text-xs text-[#C9B49D] leading-relaxed">
                    <strong className="text-[#FAE9CA]">ความหมายโบราณ: </strong>
                    {sr.rune.traditionalMeaning}
                  </p>

                  <div className="mt-3 rounded-xl bg-[#110918]/80 p-2.5 border border-[rgba(242,203,128,0.12)] text-[11px] text-[#C9B49D]">
                    <strong className="text-[#FAE9CA]">🧠 จิตวิทยาสะท้อน: </strong>
                    {sr.rune.psychologicalMirror}
                  </div>
                </div>

                <div className="mt-4 rounded-xl bg-[#842C71]/25 p-2.5 border border-[rgba(242,203,128,0.15)] text-xs text-[#FAE9CA]">
                  <strong className="text-[#EAC272]">🐾 ข้อคิดแม่หมอเหมียว: </strong>
                  <p className="mt-0.5 italic">"{sr.rune.sassyRealityCheck}"</p>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Reading Depth Tier & Submit Button */}
        {selectedRunes.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="pt-3 space-y-4"
          >
            {/* Tier Selector */}
            <ReadingDepthSelector
              selectedDepth={selectedDepth}
              onSelectDepth={(d) => setSelectedDepth(d)}
              userCoins={userCoins}
              onOpenTopUp={onOpenTopUp}
            />

            <button
              id="btn-analyze-rune"
              onClick={handleSubmit}
              disabled={isLoading || userCoins < READING_DEPTH_TIERS[selectedDepth].costCoins}
              className={`w-full flex items-center justify-center gap-2 py-3.5 text-sm font-bold rounded-2xl shadow-xl transition-all cursor-pointer ${
                userCoins < READING_DEPTH_TIERS[selectedDepth].costCoins
                  ? 'bg-stone-800 text-stone-500 cursor-not-allowed border border-stone-700'
                  : 'btn-gilded text-[#110918]'
              }`}
            >
              {isLoading ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#110918] border-t-transparent" />
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  <span>
                    ถอดรหัสหินรูน ({READING_DEPTH_TIERS[selectedDepth].label} • ใช้ {READING_DEPTH_TIERS[selectedDepth].costCoins} เหรียญ)
                  </span>
                </>
              )}
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
};
