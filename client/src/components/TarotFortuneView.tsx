import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  RotateCw,
  Layers,
  Heart,
  Briefcase,
  Coins as CoinsIcon,
  Shuffle,
  HelpCircle,
  Eye,
  CheckCircle2
} from 'lucide-react';
import { TAROT_DECK } from '../data/tarotData';
import { TarotCard, SassLevel, CardDesignSettings, ReadingDepthTier, READING_DEPTH_TIERS, FortuneReading } from '../types';
import { playCatPurrSound, playMysticChimeSound } from '../utils/speechHelper';
import { CosmicCardRenderer } from './CosmicCardRenderer';
import { ReadingDepthSelector } from './ReadingDepthSelector';
import { FateSynchronicityBanner } from './FateSynchronicityBanner';
const tarotCoverImg = '/manus-storage/tarot_cat_cover_1790238012657_3167cb61.jpg';

interface TarotFortuneViewProps {
  onAnalyzeReading: (data: {
    discipline: 'tarot';
    topic: string;
    question: string;
    itemsSelected: any;
    sassyLevel: SassLevel;
    depthTier?: ReadingDepthTier;
  }) => void;
  isLoading: boolean;
  sassLevel: SassLevel;
  cardSettings?: CardDesignSettings;
  onOpenCardStudio?: () => void;
  userCoins?: number;
  onOpenTopUp?: () => void;
  readings?: FortuneReading[];
  onOpenSynchronicityModal?: () => void;
}

type SpreadType = 'single' | 'three' | 'five';

interface SelectedTarotCard {
  card: TarotCard;
  isReversed: boolean;
  positionLabel: string;
}

export const TarotFortuneView: React.FC<TarotFortuneViewProps> = ({
  onAnalyzeReading,
  isLoading,
  sassLevel,
  cardSettings = {
    backTheme: 'gilded-velvet',
    frontTheme: 'gilded-foil',
    showGoldFoilGlow: true,
    soundEffectsEnabled: true,
  },
  onOpenCardStudio,
  userCoins = 50,
  onOpenTopUp = () => {},
  readings,
  onOpenSynchronicityModal,
}) => {
  const [spreadType, setSpreadType] = useState<SpreadType>('three');
  const [selectedDepth, setSelectedDepth] = useState<ReadingDepthTier>('standard');
  const [selectedTopic, setSelectedTopic] = useState<string>('ความรักและความสัมพันธ์');
  const [userQuestion, setUserQuestion] = useState<string>('ความสัมพันธ์ครั้งนี้จะเอายังไงต่อดี เค้าคิดยังไงกับเรากันแน่');
  const [selectedCards, setSelectedCards] = useState<SelectedTarotCard[]>([]);
  const [isShuffling, setIsShuffling] = useState<boolean>(false);
  const [deck, setDeck] = useState<TarotCard[]>(() => [...TAROT_DECK].sort(() => Math.random() - 0.5));
  const [activeSuitFilter, setActiveSuitFilter] = useState<'all' | 'major' | 'wands' | 'cups' | 'swords' | 'pentacles'>('all');
  const [cardDeckStage, setCardDeckStage] = useState<'piles' | 'carousel'>('piles');
  const [activeStep, setActiveStep] = useState<'question' | 'draw' | 'reading'>('question');

  const maxCards = spreadType === 'single' ? 1 : spreadType === 'three' ? 3 : 5;

  const positionLabels: Record<SpreadType, string[]> = {
    single: ['ความจริงในจิตใต้สำนึก (The Core Reality)'],
    three: [
      '1. ปมในอดีต/รากเหง้า (Past Origin)',
      '2. สถานการณ์จริงปัจจุบัน (Present Reality)',
      '3. แนวโน้มและบทเรียน (Future Trajectory)',
    ],
    five: [
      '1. จุดยืนตัวคุณ (Your Mindset)',
      '2. อิทธิพลภายนอก/อีกฝ่าย (External Force)',
      '3. อุปสรรคที่มองไม่เห็น (Hidden Obstacle)',
      '4. คำแนะนำดึงสติ (Cat Wisdom)',
      '5. ผลลัพธ์สุดท้าย (Ultimate Outcome)',
    ],
  };

  const scrollToStep = (id: string) => {
    document.getElementById(id)?.scrollIntoView({
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
      block: 'start',
    });
  };

  useEffect(() => {
    const sections = ['tarot-question', 'tarot-draw', 'tarot-reading'];
    const observer = new IntersectionObserver(
      entries => {
        const visible = entries
          .filter(entry => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) {
          setActiveStep(visible.target.id.replace('tarot-', '') as 'question' | 'draw' | 'reading');
        }
      },
      { rootMargin: '-22% 0px -62% 0px', threshold: [0.05, 0.35, 0.7] }
    );

    sections.forEach(id => {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    });
    return () => observer.disconnect();
  }, [selectedCards.length, maxCards]);

  useEffect(() => {
    if (selectedCards.length !== maxCards) return;
    const timer = window.setTimeout(() => scrollToStep('tarot-reading'), 280);
    return () => window.clearTimeout(timer);
  }, [selectedCards.length, maxCards]);

  // Shuffle Full 78-Card Deck
  const handleShuffle = () => {
    playCatPurrSound();
    playMysticChimeSound('card');
    setIsShuffling(true);
    setSelectedCards([]);
    setTimeout(() => {
      setDeck([...TAROT_DECK].sort(() => Math.random() - 0.5));
      setIsShuffling(false);
      playMysticChimeSound('card');
    }, 600);
  };

  // Pick a card from fan or pile
  const handlePickCard = (card: TarotCard) => {
    if (selectedCards.length >= maxCards) return;
    if (selectedCards.some(sc => sc.card.id === card.id)) return;

    playMysticChimeSound('card');
    const isReversed = Math.random() > 0.75; // 25% chance reversed
    const positionIndex = selectedCards.length;
    const positionLabel = positionLabels[spreadType][positionIndex] || `ตำแหน่งที่ ${positionIndex + 1}`;

    setSelectedCards([...selectedCards, { card, isReversed, positionLabel }]);
  };

  // Draw Randomly from remaining 78 cards
  const handleDrawRandomCard = () => {
    if (selectedCards.length >= maxCards) return;
    playCatPurrSound();
    playMysticChimeSound('card');
    const unpicked = deck.filter(c => !selectedCards.some(sc => sc.card.id === c.id));
    if (unpicked.length === 0) return;
    const randomIndex = Math.floor(Math.random() * unpicked.length);
    handlePickCard(unpicked[randomIndex]);
  };

  // Cut Pile Draw: Pick from 3 mystery piles (สับแบ่ง 3 กอง)
  const handlePickFromPile = (pileIndex: number) => {
    if (selectedCards.length >= maxCards) return;
    playCatPurrSound();
    playMysticChimeSound('card');
    const unpicked = deck.filter(c => !selectedCards.some(sc => sc.card.id === c.id));
    // Split into 3 chunks
    const chunkSize = Math.ceil(unpicked.length / 3);
    const pileCards = unpicked.slice(pileIndex * chunkSize, (pileIndex + 1) * chunkSize);
    if (pileCards.length > 0) {
      const picked = pileCards[Math.floor(Math.random() * pileCards.length)];
      handlePickCard(picked);
    }
  };

  // Reset current selection
  const handleReset = () => {
    setSelectedCards([]);
  };

  // Submit to Sassy AI
  const handleSubmit = () => {
    if (selectedCards.length < maxCards) return;
    playCatPurrSound();

    const items = selectedCards.map(sc => ({
      name: sc.card.nameTh,
      nameEn: sc.card.name,
      position: sc.positionLabel,
      isReversed: sc.isReversed,
      keywords: sc.card.keywords,
      psychologicalTheme: sc.card.psychologicalTheme,
      sassyInsight: sc.card.sassyInsight,
    }));

    onAnalyzeReading({
      discipline: 'tarot',
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
          currentDisciplineName="ไพ่ยิปซี Tarot"
        />
      )}

      <nav className="tarot-scrollspy md:hidden" aria-label="ขั้นตอนเปิดไพ่">
        {([
          ['question', HelpCircle, 'ตั้งคำถาม'],
          ['draw', Layers, 'เลือกไพ่'],
          ['reading', Sparkles, 'อ่านดวง'],
        ] as const).map(([id, Icon, label], index) => (
          <button
            key={id}
            type="button"
            onClick={() => scrollToStep(`tarot-${id}`)}
            aria-current={activeStep === id ? 'step' : undefined}
            className={activeStep === id ? 'is-active' : ''}
          >
            <span className="tarot-scrollspy-index">{index + 1}</span>
            <Icon className="h-3.5 w-3.5" />
            <span>{label}</span>
          </button>
        ))}
      </nav>

      {/* Tarot Book & Mystic Cover Hero Banner */}
      <div id="tarot-intro" className="tarot-mvp-hero relative overflow-hidden rounded-[28px] border border-[rgba(242,203,128,0.3)] bg-gradient-to-r from-[#240C30] via-[#1A0824] to-[#120518] p-4 sm:p-7 shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
          {/* Cover Image Frame */}
          <motion.div
            whileHover={{ scale: 1.03, rotate: -1 }}
            className="hidden shrink-0 relative w-40 sm:block sm:w-48 aspect-[2/3] rounded-2xl overflow-hidden border-2 border-[#EAC272] shadow-[0_0_35px_rgba(234,194,114,0.35)] ring-1 ring-[rgba(242,203,128,0.4)]"
          >
            <img
              src={tarotCoverImg}
              alt="ปกไพ่ยิปซี แม่หมอเหมียว"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#110918]/60 via-transparent to-transparent pointer-events-none" />
          </motion.div>

          {/* Sassy Intro Content */}
          <div className="flex-1 text-left space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full bg-[#842C71]/40 border border-[rgba(242,203,128,0.3)] px-3 py-1 text-xs font-semibold text-[#FAE9CA]">
              <span>🐾</span>
              <span>สำรับไพ่พิเศษ: ไพ่ยิปซี แม่หมอเหมียว</span>
            </div>

            <h1 className="font-serif-display text-2xl sm:text-4xl font-normal text-[#FAE9CA] leading-tight">
              เปิดไพ่แล้วแม่นเวอร์ แบบไม่อวย
            </h1>

            <p className="text-sm sm:text-base text-[#FAE9CA]/90 font-light leading-relaxed max-w-xl">
              "ไม่ได้ทำนายให้สวยหรู แต่ทำนายให้รู้สึกจริง... ดวงดีก็ดีใจด้วย แต่ถ้าดวงพัง เดี๋ยวแม่ช่วยด่าฟรีค่ะ!"
            </p>

            <div className="hidden grid-cols-2 gap-2 pt-2 text-xs sm:grid sm:grid-cols-4">
              <div className="rounded-xl bg-[#110918]/60 border border-[rgba(242,203,128,0.15)] p-2.5 text-center">
                <span className="block text-[#FAE9CA] font-bold">ความรัก</span>
                <span className="text-[10px] text-[#C9B49D]">(แบบเจ็บแต่จบ)</span>
              </div>
              <div className="rounded-xl bg-[#110918]/60 border border-[rgba(242,203,128,0.15)] p-2.5 text-center">
                <span className="block text-[#FAE9CA] font-bold">การงาน</span>
                <span className="text-[10px] text-[#C9B49D]">(แบบสับแต่ปัง)</span>
              </div>
              <div className="rounded-xl bg-[#110918]/60 border border-[rgba(242,203,128,0.15)] p-2.5 text-center">
                <span className="block text-[#FAE9CA] font-bold">การเงิน</span>
                <span className="text-[10px] text-[#C9B49D]">(รวยได้ถ้าเลิกใจอ่อน)</span>
              </div>
              <div className="rounded-xl bg-[#110918]/60 border border-[rgba(242,203,128,0.15)] p-2.5 text-center">
                <span className="block text-[#FAE9CA] font-bold">คำแนะนำ</span>
                <span className="text-[10px] text-[#C9B49D]">(ตรง ชัด จิกถึงใจ)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Ambient Glows */}
        <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-[#842C71]/20 blur-3xl pointer-events-none" />
        <div className="absolute -left-16 -bottom-16 w-64 h-64 rounded-full bg-[#EAC272]/15 blur-3xl pointer-events-none" />
      </div>

      {/* Top Controls Card */}
      <div id="tarot-question" className="velvet-card scroll-mt-36 rounded-[28px] p-4 space-y-4 sm:p-6">

        {/* Header & Spread Type Selector */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[rgba(242,203,128,0.14)] pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#361A4A] border border-[rgba(242,203,128,0.3)] text-[#EAC272] text-2xl shadow-md">
              🎴
            </div>
            <div>
              <h2 className="font-serif-display text-2xl font-normal text-[#FAE9CA]">เลือกรูปแบบการวางไพ่ยิปซี</h2>
              <p className="text-xs text-[#C9B49D]">
                ตั้งจิตให้นิ่ง นึกถึงเรื่องที่อยากถาม แล้วเลือกจำนวนไพ่ที่ต้องการ
              </p>
            </div>
          </div>

          {/* Spread Type Buttons */}
          <div className="flex max-w-full items-center overflow-x-auto rounded-full bg-[#110918] p-1 border border-[rgba(242,203,128,0.15)] no-scrollbar">
            {[
              { id: 'single', label: '1 ใบ เรียกสติ' },
              { id: 'three', label: '3 ใบ อดีต-ปัจจุบัน-อนาคต' },
              { id: 'five', label: '5 ใบ แผนที่รัก/งาน' },
            ].map((st) => (
              <button
                key={st.id}
                id={`btn-spread-${st.id}`}
                onClick={() => {
                  setSpreadType(st.id as SpreadType);
                  setSelectedCards([]);
                }}
                className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all ${
                  spreadType === st.id
                    ? 'bg-gradient-to-r from-[#EAC272] to-[#D4A84D] text-[#110918] font-bold shadow-md'
                    : 'text-[#C9B49D] hover:text-[#FAE9CA]'
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>
        </div>

        {/* Topic & Question Prompt */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-12">
          <div className="md:col-span-4">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-[#EAC272]">
              เลือกหัวข้อที่ต้องการส่องไฟ:
            </label>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {[
                { id: 'ความรักและความสัมพันธ์', icon: Heart, color: 'text-pink-300' },
                { id: 'การงานและอนาคต', icon: Briefcase, color: 'text-[#AEFFE4]' },
                { id: 'การเงินและโชคลาภ', icon: CoinsIcon, color: 'text-[#EAC272]' },
                { id: 'จิตใจและพลังชีวิต', icon: Sparkles, color: 'text-purple-300' },
              ].map((t) => {
                const Icon = t.icon;
                const isSel = selectedTopic === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setSelectedTopic(t.id)}
                    className={`flex items-center gap-2 rounded-xl p-2.5 text-xs font-medium transition-all ${
                      isSel
                        ? 'bg-[#842C71]/40 border border-[#EAC272] text-[#FAE9CA] shadow-md'
                        : 'bg-[#110918] border border-[rgba(242,203,128,0.14)] text-[#C9B49D] hover:border-[rgba(242,203,128,0.3)]'
                    }`}
                  >
                    <Icon className={`h-3.5 w-3.5 ${t.color}`} />
                    <span className="truncate">{t.id.split('และ')[0]}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="md:col-span-8">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-[#EAC272]">
              คำถามหรือสถานการณ์ที่คาใจ (พิมพ์ได้ตามอัธยาศัย):
            </label>
            <textarea
              id="input-tarot-question"
              rows={2}
              value={userQuestion}
              onChange={(e) => setUserQuestion(e.target.value)}
              placeholder="เช่น อยากรู้ว่าความสัมพันธ์ตอนนี้ควรไปต่อหรือพอแค่นี้, งานที่ทำอยู่มีโอกาสก้าวหน้าไหม..."
              className="mt-2 w-full rounded-2xl bg-[#110918] border border-[rgba(242,203,128,0.18)] px-4 py-2.5 text-sm text-[#FAE9CA] placeholder:text-[#C9B49D]/40 focus:border-[#EAC272] focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Interactive Card Picking Fan / Stage */}
      <div id="tarot-draw" className="velvet-card scroll-mt-36 rounded-[28px] p-4 space-y-4 sm:p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#FAE9CA]">
              เลือกไพ่ ({selectedCards.length}/{maxCards} ใบ):
            </span>
            <span className="text-xs text-[#EAC272]">
              {selectedCards.length < maxCards
                ? `คลิกเลือกไพ่ที่ดึงดูดสายตาคุณอีก ${maxCards - selectedCards.length} ใบ`
                : '✅ ครบตามรูปแบบแล้ว พร้อมผ่าดวง!'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="btn-shuffle-tarot"
              onClick={handleShuffle}
              disabled={isShuffling}
              className="flex items-center gap-1.5 rounded-full bg-[#1E0E2A] border border-[rgba(242,203,128,0.2)] px-3.5 py-1.5 text-xs font-medium text-[#FAE9CA] hover:bg-[#2A143A]"
            >
              <Shuffle className={`h-3.5 w-3.5 text-[#EAC272] ${isShuffling ? 'animate-spin' : ''}`} />
              สับไพ่ใหม่
            </button>
            {selectedCards.length > 0 && (
              <button
                onClick={handleReset}
                className="rounded-full bg-[#1E0E2A] border border-[rgba(242,203,128,0.15)] px-3.5 py-1.5 text-xs font-medium text-[#C9B49D] hover:text-[#FAE9CA]"
              >
                ล้างการเลือก
              </button>
            )}
          </div>
        </div>

        {/* Selected Cards Spread Display */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 lg:grid-cols-5 min-h-[260px]">
          {Array.from({ length: maxCards }).map((_, idx) => {
            const sc = selectedCards[idx];
            const label = positionLabels[spreadType][idx] || `ตำแหน่งที่ ${idx + 1}`;

            if (!sc) {
              return (
                <div
                  key={`tarot-slot-empty-${idx}`}
                  className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[rgba(242,203,128,0.2)] bg-[#110918]/60 p-4 text-center"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#361A4A]/50 text-[#EAC272]">
                    <Eye className="h-5 w-5" />
                  </div>
                  <span className="mt-3 text-[11px] font-bold text-[#FAE9CA]/80">{label}</span>
                  <span className="text-[10px] text-[#C9B49D] mt-1">รอการเลือกไพ่</span>
                </div>
              );
            }

            return (
              <motion.div
                key={`tarot-slot-card-${idx}-${sc.card.id}`}
                initial={{ rotateY: 90, scale: 0.8, opacity: 0 }}
                animate={{ rotateY: 0, scale: 1, opacity: 1 }}
                transition={{ duration: 0.4 }}
                className={`tarot-selected-card flex flex-col justify-between rounded-2xl bg-gradient-to-b from-[#24102E] to-[#110918] p-4 border ${
                  sc.isReversed ? 'border-[#B3261E]/70' : 'border-[rgba(242,203,128,0.45)]'
                } shadow-xl relative overflow-hidden`}
              >
                {sc.isReversed && (
                  <span className="absolute top-2 right-2 rounded-full bg-[#B3261E]/30 px-2 py-0.5 text-[9px] font-bold text-[#FFA4A4] border border-[#B3261E]/40">
                    หัวกลับ (Reversed)
                  </span>
                )}

                <div>
                  <span className="text-[10px] font-semibold text-[#EAC272] block mb-1">
                    {sc.positionLabel}
                  </span>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-2xl">{sc.card.imageSymbol}</span>
                    <div>
                      <h4 className="font-serif-display text-sm text-[#FAE9CA]">{sc.card.nameTh}</h4>
                      <p className="text-[10px] text-[#C9B49D]">{sc.card.name}</p>
                    </div>
                  </div>

                  <p className="mt-2 text-xs text-[#C9B49D] line-clamp-2">
                    {sc.isReversed ? sc.card.reversedMeaning : sc.card.uprightMeaning}
                  </p>
                </div>

                <div className="mt-3 rounded-xl bg-[#842C71]/25 p-2.5 border border-[rgba(242,203,128,0.15)] text-[11px] text-[#FAE9CA]">
                  <strong className="text-[#EAC272]">🐾 ข้อคิดแมว: </strong>
                  <span className="line-clamp-2 italic">"{sc.card.sassyInsight}"</span>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Card Deck Selection Stage (Intuitive 3 Piles or Compact Fan) */}
        {selectedCards.length < maxCards && (
          <div className="pt-4 border-t border-[rgba(242,203,128,0.12)] space-y-4">
            {/* Mode Switcher & Quick Random Draw */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-[#110918]/70 p-3 rounded-2xl border border-[rgba(242,203,128,0.15)]">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-[#FAE9CA]">วิธีเลือกไพ่ (78 ใบเต็ม):</span>
                <div className="flex items-center rounded-xl bg-[#1B0B24] p-1 border border-[rgba(242,203,128,0.2)]">
                  <button
                    onClick={() => setCardDeckStage('piles')}
                    className={`px-3 py-1 text-xs rounded-lg font-medium transition-all ${
                      cardDeckStage === 'piles'
                        ? 'bg-gradient-to-r from-[#EAC272] to-[#D4A84D] text-[#110918] font-bold shadow'
                        : 'text-[#C9B49D] hover:text-[#FAE9CA]'
                    }`}
                  >
                    กองสับ 3 กอง (แนะนำ)
                  </button>
                  <button
                    onClick={() => setCardDeckStage('carousel')}
                    className={`px-3 py-1 text-xs rounded-lg font-medium transition-all ${
                      cardDeckStage === 'carousel'
                        ? 'bg-gradient-to-r from-[#EAC272] to-[#D4A84D] text-[#110918] font-bold shadow'
                        : 'text-[#C9B49D] hover:text-[#FAE9CA]'
                    }`}
                  >
                    คลี่พัดตามธาตุ
                  </button>
                </div>
              </div>

              {/* Instant Random Pick & Card Studio */}
              <div className="flex items-center gap-2">
                {onOpenCardStudio && (
                  <button
                    onClick={onOpenCardStudio}
                    className="flex items-center gap-1.5 rounded-xl bg-[#24102E] border border-[rgba(242,203,128,0.25)] px-3 py-1.5 text-xs text-[#FAE9CA] hover:border-[#EAC272] transition-all"
                    title="เปลี่ยนลวดลายหน้าไพ่/หลังไพ่"
                  >
                    <span>🎴 ปรับลายไพ่</span>
                  </button>
                )}

                <button
                  onClick={handleDrawRandomCard}
                  className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#842C71] to-[#361A4A] border border-[#EAC272]/50 px-3.5 py-1.5 text-xs font-semibold text-[#FAE9CA] hover:border-[#EAC272] hover:scale-105 transition-all shadow-md"
                >
                  <Sparkles className="h-3.5 w-3.5 text-[#EAC272]" />
                  <span>สุ่มหยิบ 1 ใบ (จาก 78 ใบ)</span>
                </button>
              </div>
            </div>

            {/* OPTION 1: 3 CUT PILES (กองไพ่ 3 กอง สไตล์แม่หมอจริง ไม่ต้องไถจอ) */}
            {cardDeckStage === 'piles' && (
              <div className="py-2">
                <p className="text-xs text-[#C9B49D] text-center mb-4">
                  ตั้งจิตให้นิ่ง สัมผัสพลังงานแล้วแตะเลือก **กองไพ่** ที่ดึงดูดใจคุณที่สุด:
                </p>
                <div className="grid grid-cols-3 gap-3 sm:gap-6 max-w-xl mx-auto">
                  {[
                    { title: 'กองที่ 1: อดีตและรากเหง้า', icon: '🌑', sub: 'สัญชาตญาณลึกซึ้ง' },
                    { title: 'กองที่ 2: ปัจจุบันขณะ', icon: '🌕', sub: 'พลังงานรอบตัว' },
                    { title: 'กองที่ 3: อนาคตและทางออก', icon: '✨', sub: 'แสงสว่างนำทาง' },
                  ].map((pile, idx) => (
                    <motion.button
                      key={idx}
                      whileHover={{ y: -8, scale: 1.04 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handlePickFromPile(idx)}
                      className="tarot-pile-card group relative flex flex-col items-center justify-between rounded-2xl bg-gradient-to-b from-[#2A1035] via-[#1A0923] to-[#0F0515] p-3 sm:p-4 border border-[rgba(242,203,128,0.3)] hover:border-[#EAC272] shadow-xl hover:shadow-[0_0_25px_rgba(234,194,114,0.35)] transition-all cursor-pointer"
                    >
                      {/* Stacked Deck Visual Effect */}
                      <div className="relative w-20 sm:w-24 aspect-[2/3] my-2 flex items-center justify-center">
                        <div className="absolute inset-0 rounded-xl bg-[#110918] border border-[rgba(242,203,128,0.2)] translate-x-2 translate-y-2 opacity-50" />
                        <div className="absolute inset-0 rounded-xl bg-[#1D0C28] border border-[rgba(242,203,128,0.3)] translate-x-1 translate-y-1 opacity-75" />
                        <div className="relative z-10 w-full h-full flex items-center justify-center">
                          <CosmicCardRenderer
                            isFlipped={false}
                            backTheme={cardSettings.backTheme}
                            size="sm"
                            showGlow={false}
                          />
                          <span className="absolute bottom-1.5 right-1.5 z-20 text-xs text-[#EAC272] font-bold drop-shadow">
                            {pile.icon}
                          </span>
                        </div>
                      </div>

                      <div className="text-center mt-1">
                        <h4 className="text-xs font-bold text-[#FAE9CA] group-hover:text-[#EAC272] transition-colors">
                          {pile.title}
                        </h4>
                        <span className="text-[10px] text-[#C9B49D] hidden sm:block">
                          {pile.sub}
                        </span>
                      </div>
                      <span className="mt-2 text-[10px] font-semibold text-[#EAC272] rounded-full bg-[#842C71]/40 px-2.5 py-0.5 border border-[#EAC272]/30">
                        แตะเพื่อจั่ว 🐾
                      </span>
                    </motion.button>
                  ))}
                </div>
              </div>
            )}

            {/* OPTION 2: FILTERABLE SUITS FAN (คลี่พัดตามธาตุ ดาบ ถ้วย ไม้เท้า เหรียญ เมเจอร์) */}
            {cardDeckStage === 'carousel' && (
              <div className="space-y-3">
                {/* Suit Filter Tabs */}
                <div className="flex flex-wrap items-center justify-center gap-1.5 text-xs">
                  {[
                    { id: 'all', label: 'ทั้งหมด (78)' },
                    { id: 'major', label: '👑 Major (22)' },
                    { id: 'cups', label: '🏆 ถ้วย (14)' },
                    { id: 'swords', label: '⚔️ ดาบ (14)' },
                    { id: 'wands', label: '🪵 ไม้เท้า (14)' },
                    { id: 'pentacles', label: '🪙 เหรียญ (14)' },
                  ].map((f) => (
                    <button
                      key={f.id}
                      onClick={() => setActiveSuitFilter(f.id as any)}
                      className={`px-3 py-1 rounded-full text-xs transition-all ${
                        activeSuitFilter === f.id
                          ? 'bg-[#EAC272] text-[#110918] font-bold shadow'
                          : 'bg-[#110918] text-[#C9B49D] border border-[rgba(242,203,128,0.15)] hover:text-[#FAE9CA]'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>

                {/* Filtered Compact Grid (No horizontal infinite scroll) */}
                <div className="grid grid-cols-4 sm:grid-cols-7 lg:grid-cols-11 gap-2 max-h-56 overflow-y-auto p-2 bg-[#0F0515]/80 rounded-2xl border border-[rgba(242,203,128,0.2)]">
                  {deck
                    .filter((c) => {
                      if (activeSuitFilter === 'all') return true;
                      if (activeSuitFilter === 'major') return c.arcana === 'major';
                      return c.suit === activeSuitFilter;
                    })
                    .map((card) => {
                      const isSelected = selectedCards.some(sc => sc.card.id === card.id);
                      if (isSelected) return null;

                      return (
                        <motion.button
                          key={card.id}
                          whileHover={{ y: -6, scale: 1.06 }}
                          whileTap={{ scale: 0.94 }}
                          onClick={() => handlePickCard(card)}
                          className="relative aspect-[2/3] rounded-xl overflow-hidden border border-[rgba(242,203,128,0.3)] shadow hover:border-[#EAC272] hover:shadow-[0_0_12px_rgba(234,194,114,0.4)] transition-all group"
                          title={card.nameTh}
                        >
                          <img
                            src={tarotCoverImg}
                            alt="หลังไพ่"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-[#110918]/85 via-transparent to-transparent pointer-events-none" />
                          <span className="absolute bottom-1 right-1 text-[9px] font-bold text-[#FAE9CA] drop-shadow">
                            #{card.id + 1}
                          </span>
                        </motion.button>
                      );
                    })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Reading Depth Selector & Final Submit Button */}
        {selectedCards.length === maxCards && (
          <motion.div
            id="tarot-reading"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="scroll-mt-36 pt-3 space-y-4"
          >
            {/* Tier Selector */}
            <ReadingDepthSelector
              selectedDepth={selectedDepth}
              onSelectDepth={(d) => setSelectedDepth(d)}
              userCoins={userCoins}
              onOpenTopUp={onOpenTopUp}
            />

            <button
              id="btn-analyze-tarot"
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
                    ผ่าดวงไพ่ยิปซี ({READING_DEPTH_TIERS[selectedDepth].label} • ใช้ {READING_DEPTH_TIERS[selectedDepth].costCoins} เหรียญ)
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
