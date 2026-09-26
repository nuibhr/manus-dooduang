import React, { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  RotateCcw, 
  Search, 
  Eye, 
  Brain, 
  CheckCircle2,
  X,
  Shuffle,
  HelpCircle,
  BookOpen,
  ArrowLeft,
  ArrowRight,
  RefreshCw,
  Compass
} from 'lucide-react';
import { ORACLE_DECK, ORACLE_DECK_INFO } from '../data/oracleData';
import { OracleCard, SassLevel, CardDesignSettings, ReadingDepthTier, READING_DEPTH_TIERS, FortuneReading } from '../types';
import { playCatPurrSound, playMysticChimeSound } from '../utils/speechHelper';
import { HonestCatCard } from './HonestCatCard';
import { ReadingDepthSelector } from './ReadingDepthSelector';
import { FateSynchronicityBanner } from './FateSynchronicityBanner';
import oracleCoverImg from '../assets/images/oracle_cards_back_1790239349784.jpg';

interface OracleFortuneViewProps {
  onAnalyzeReading: (data: {
    discipline: 'oracle';
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

export const OracleFortuneView: React.FC<OracleFortuneViewProps> = ({
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
  const [drawMode, setDrawMode] = useState<'single' | 'triple'>('single');
  const [selectedDepth, setSelectedDepth] = useState<ReadingDepthTier>('standard');
  const [deck, setDeck] = useState<OracleCard[]>(() => [...ORACLE_DECK]);
  const [selectedCards, setSelectedCards] = useState<OracleCard[]>([]);
  const [userQuestion, setUserQuestion] = useState<string>('อะไรคือสิ่งที่กำลังขัดขวางความสุขและความก้าวหน้าของฉันตอนนี้');
  const [previewCard, setPreviewCard] = useState<OracleCard | null>(null);
  
  // Stages: 'stacked' (รวมกอง) | 'shuffling' (กำลังสับ) | 'linear_spread' (คลี่แถวตอนเรียงสวย)
  const [spreadStage, setSpreadStage] = useState<'stacked' | 'shuffling' | 'linear_spread'>('stacked');
  const [oracleDrawStyle, setOracleDrawStyle] = useState<'piles' | 'compact_grid' | 'ribbon'>('piles');
  const [activeDeckCategory, setActiveDeckCategory] = useState<'all' | 'shadow' | 'boundary' | 'cosmic' | 'ego' | 'growth' | 'connection'>('all');
  const [hoveredCardId, setHoveredCardId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'spread' | 'gallery'>('spread');
  const [spreadScrollIndex, setSpreadScrollIndex] = useState<number>(0);
  const ribbonContainerRef = useRef<HTMLDivElement>(null);

  // Pick from 3 mystery oracle cut piles
  const handlePickFromOraclePile = (pileIndex: number) => {
    if (selectedCards.length >= maxSelectable) return;
    playCatPurrSound();
    playMysticChimeSound('card');
    const unpicked = deck.filter((c) => !selectedCards.some((s) => s.id === c.id));
    const chunkSize = Math.ceil(unpicked.length / 3);
    const pileCards = unpicked.slice(pileIndex * chunkSize, (pileIndex + 1) * chunkSize);
    if (pileCards.length > 0) {
      const picked = pileCards[Math.floor(Math.random() * pileCards.length)];
      handlePickFromRibbon(picked);
    }
  };

  // Search in encyclopedia
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const maxSelectable = drawMode === 'single' ? 1 : 3;

  // Shuffle Deck Handler
  const handleShuffleDeck = () => {
    setSpreadStage('shuffling');
    playCatPurrSound();
    playMysticChimeSound('card');
    setSelectedCards([]);

    // Riffle shuffle simulation
    setTimeout(() => {
      const shuffled = [...ORACLE_DECK].sort(() => Math.random() - 0.5);
      setDeck(shuffled);
      setSpreadStage('linear_spread');
      playMysticChimeSound('oracle');
      if (ribbonContainerRef.current) {
        ribbonContainerRef.current.scrollLeft = 0;
      }
    }, 900);
  };

  // Spread directly into linear ribbon
  const handleSpreadRibbon = () => {
    if (spreadStage === 'stacked') {
      handleShuffleDeck();
    } else {
      setSpreadStage('linear_spread');
    }
  };

  // Reset to stacked deck
  const handleResetDeck = () => {
    setSpreadStage('stacked');
    setSelectedCards([]);
    playMysticChimeSound('soft');
  };

  // Card Picked from Linear Spread
  const handlePickFromRibbon = (card: OracleCard) => {
    if (selectedCards.some((c) => c.id === card.id)) return;

    if (selectedCards.length >= maxSelectable) {
      if (maxSelectable === 1) {
        setSelectedCards([card]);
        playMysticChimeSound('card');
        return;
      }
      return;
    }

    playMysticChimeSound('card');
    const newSelected = [...selectedCards, card];
    setSelectedCards(newSelected);

    if (newSelected.length === maxSelectable) {
      setTimeout(() => {
        playMysticChimeSound('oracle');
      }, 300);
    }
  };

  // Auto pick remaining
  const handleAutoPick = () => {
    playCatPurrSound();
    playMysticChimeSound('card');
    const unpicked = deck.filter((c) => !selectedCards.some((s) => s.id === c.id));
    const needed = maxSelectable - selectedCards.length;
    if (needed <= 0) return;

    const randomPick = unpicked.slice(0, needed);
    setSelectedCards([...selectedCards, ...randomPick]);
  };

  const scrollRibbon = (direction: 'left' | 'right') => {
    if (ribbonContainerRef.current) {
      const scrollAmount = 320;
      ribbonContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  // Submit to AI
  const handleSubmit = () => {
    if (selectedCards.length === 0) return;
    playCatPurrSound();

    const items = selectedCards.map((c, i) => ({
      position: drawMode === 'single' 
        ? 'ไพ่สะท้อนความจริง (Raw Truth Oracle)' 
        : `ใบที่ ${i + 1}: ${i === 0 ? 'ภาพสะท้อนจิตใต้สำนึก' : i === 1 ? 'กับดักความคิดและพฤติกรรม' : 'กุญแจและทางออก'}`,
      cardId: c.id,
      name_en: c.name_en || c.titleEn,
      name_th: c.name_th || c.titleTh,
      meaning: c.meaning || c.coreTruth,
      advice: c.advice || c.actionableStep,
      psychologicalBias: c.psychologicalBias,
      sassyQuote: c.sassyQuote,
    }));

    onAnalyzeReading({
      discipline: 'oracle',
      topic: 'The Honest Cat Oracle — Ink Edition',
      question: userQuestion,
      itemsSelected: items,
      sassyLevel: sassLevel,
      depthTier: selectedDepth,
    });
  };

  // Filter 88 cards for encyclopedia gallery
  const filteredCards = useMemo(() => {
    return ORACLE_DECK.filter((c) => {
      const matchSearch =
        (c.name_en || c.titleEn).toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.name_th || c.titleTh).includes(searchQuery) ||
        (c.meaning || c.coreTruth).includes(searchQuery) ||
        (c.advice || c.actionableStep).includes(searchQuery);

      const matchCat = selectedCategory === 'all' || c.category === selectedCategory;
      return matchSearch && matchCat;
    });
  }, [searchQuery, selectedCategory]);

  return (
    <div className="space-y-6 select-none">
      {/* Cross-Reading Fate Synchronicity Banner */}
      {readings && onOpenSynchronicityModal && (
        <FateSynchronicityBanner
          readings={readings}
          onOpenSynchronicityModal={onOpenSynchronicityModal}
          currentDisciplineName="ไพ่โอราเคิล The Honest Cat"
        />
      )}

      {/* Header & Question Panel */}
      <div className="velvet-card rounded-[28px] p-6 space-y-4 relative overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[rgba(242,203,128,0.14)] pb-4">
          <div className="flex items-center gap-3.5">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#4A1968] to-[#1E0E2A] border border-[rgba(242,203,128,0.35)] text-[#EAC272] text-2xl shadow-xl">
              🐾
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-serif-display text-2xl font-normal text-[#FAE9CA]">
                  {ORACLE_DECK_INFO.deckName}
                </h2>
                <span className="rounded-full bg-[#842C71]/50 border border-[rgba(242,203,128,0.3)] px-2.5 py-0.5 text-[11px] font-bold text-[#F2CB80]">
                  {ORACLE_DECK_INFO.totalCards} ใบครบชุด
                </span>
              </div>
              <p className="text-xs text-[#C9B49D] mt-0.5">
                สับกองไพ่และคลี่เรียงเป็นแถวตอน 88 ใบ เลือกเสี่ยงทายโดยคว่ำหน้าไพ่ทั้งหมด แล้วหงายรับความจริงตรงๆ
              </p>
            </div>
          </div>

          {/* Nav Tab Switcher: Spread vs Gallery */}
          <div className="flex rounded-full bg-[#110918] p-1 border border-[rgba(242,203,128,0.15)] text-xs">
            <button
              type="button"
              onClick={() => setActiveTab('spread')}
              className={`rounded-full px-3.5 py-1.5 font-semibold transition-all ${
                activeTab === 'spread'
                  ? 'bg-[#EAC272] text-[#110918] shadow'
                  : 'text-[#C9B49D] hover:text-[#FAE9CA]'
              }`}
            >
              ✨ โต๊ะสับไพ่แถวตอน
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('gallery')}
              className={`rounded-full px-3.5 py-1.5 font-semibold transition-all ${
                activeTab === 'gallery'
                  ? 'bg-[#EAC272] text-[#110918] shadow'
                  : 'text-[#C9B49D] hover:text-[#FAE9CA]'
              }`}
            >
              📖 สารานุกรม 88 ใบ
            </button>
          </div>
        </div>

        {/* User Question Input */}
        <div>
          <label className="text-[11px] font-semibold uppercase tracking-wider text-[#EAC272] flex items-center gap-1.5">
            <HelpCircle className="h-3.5 w-3.5" />
            ตั้งจิตถามเรื่องในใจ (แมวดำจะตอบตรงๆ แบบกู/มึง ปลุกสติให้ตาสว่าง):
          </label>
          <textarea
            id="input-oracle-question"
            rows={2}
            value={userQuestion}
            onChange={(e) => setUserQuestion(e.target.value)}
            placeholder="พิมพ์เรื่องที่อยากถาม เช่น เรื่องงานนี้ควรเอายังไงต่อ, ทำไมยังตัดใจไม่ได้, มีอะไรที่กูยังมองข้าม..."
            className="mt-2 w-full rounded-2xl bg-[#110918] border border-[rgba(242,203,128,0.18)] px-4 py-2.5 text-sm text-[#FAE9CA] placeholder:text-[#C9B49D]/40 focus:border-[#EAC272] focus:outline-none transition-all"
          />
        </div>
      </div>

      {/* Main Mode: Interactive Circular Fan Spread */}
      {activeTab === 'spread' && (
        <div className="space-y-6">
          {/* Controls Bar */}
          <div className="velvet-card rounded-[28px] p-4 flex flex-wrap items-center justify-between gap-3">
            {/* Draw Mode Switcher */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#C9B49D] font-medium">รูปแบบการสุ่ม:</span>
              <div className="flex rounded-full bg-[#110918] p-1 border border-[rgba(242,203,128,0.15)] text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setDrawMode('single');
                    if (selectedCards.length > 1) setSelectedCards(selectedCards.slice(0, 1));
                  }}
                  className={`rounded-full px-3 py-1 font-semibold transition-all ${
                    drawMode === 'single'
                      ? 'bg-[#EAC272] text-[#110918] shadow'
                      : 'text-[#C9B49D] hover:text-[#FAE9CA]'
                  }`}
                >
                  สุ่ม 1 ใบ (Quick Truth)
                </button>
                <button
                  type="button"
                  onClick={() => setDrawMode('triple')}
                  className={`rounded-full px-3 py-1 font-semibold transition-all ${
                    drawMode === 'triple'
                      ? 'bg-[#EAC272] text-[#110918] shadow'
                      : 'text-[#C9B49D] hover:text-[#FAE9CA]'
                  }`}
                >
                  สเปรด 3 ใบ (Deep Spread)
                </button>
              </div>
            </div>

            {/* Actions for Shuffling & Spreading */}
            <div className="flex items-center gap-2">
              <button
                id="btn-oracle-shuffle"
                onClick={handleShuffleDeck}
                disabled={spreadStage === 'shuffling'}
                className="btn-gilded flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-[#110918] cursor-pointer"
              >
                <Shuffle className={`h-3.5 w-3.5 ${spreadStage === 'shuffling' ? 'animate-spin' : ''}`} />
                <span>{spreadStage === 'shuffling' ? 'กำลังสับไพ่...' : 'สับกองไพ่ 88 ใบ'}</span>
              </button>

              {spreadStage === 'linear_spread' && (
                <button
                  onClick={handleAutoPick}
                  disabled={selectedCards.length >= maxSelectable}
                  className="rounded-full bg-[#2A1238] border border-[rgba(242,203,128,0.3)] px-3.5 py-1.5 text-xs font-semibold text-[#FAE9CA] hover:border-[#EAC272] transition-all disabled:opacity-50"
                >
                  สุ่มหยิบแทนกู ({selectedCards.length}/{maxSelectable})
                </button>
              )}

              {spreadStage === 'linear_spread' && (
                <button
                  onClick={handleResetDeck}
                  className="rounded-full bg-[#110918] p-2 text-[#C9B49D] hover:text-[#FAE9CA] border border-[rgba(242,203,128,0.15)]"
                  title="รวมกองไพ่ใหม่"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Interactive Velvet Table: Stacked vs Circular Wheel */}
          <div className="velvet-card rounded-[32px] p-6 relative overflow-hidden flex flex-col items-center justify-center min-h-[520px] sm:min-h-[580px] border border-[rgba(242,203,128,0.2)] bg-gradient-to-b from-[#180A22] via-[#120619] to-[#0A0310]">
            
            {/* Background Mystic Circle Ornament */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-25">
              <div className="w-[480px] h-[480px] rounded-full border border-dashed border-[#EAC272]/40 animate-[spin_120s_linear_infinite]" />
              <div className="absolute w-[360px] h-[360px] rounded-full border border-[#EAC272]/30" />
              <div className="absolute w-[240px] h-[240px] rounded-full border border-dashed border-[#EAC272]/20" />
            </div>

            {/* STAGE 1: STACKED DECK IN CENTER (ปิดชื่อ คว่ำหน้า 88 ใบ) */}
            {spreadStage === 'stacked' && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center text-center space-y-6 z-10 my-8"
              >
                {/* 3D Stacked Deck Visual with Card Backs */}
                <div className="relative w-[150px] h-[220px] cursor-pointer group" onClick={handleSpreadRibbon}>
                  {/* Layered card shadows */}
                  {[...Array(6)].map((_, i) => (
                    <div
                      key={i}
                      style={{
                        transform: `translate(${(i - 3) * 1.5}px, ${(i - 3) * 2}px) rotate(${(i - 3) * 0.8}deg)`,
                      }}
                      className="absolute inset-0 rounded-2xl bg-gradient-to-b from-[#251032] via-[#1A0A24] to-[#100516] border border-[#EAC272]/30 shadow-xl pointer-events-none"
                    />
                  ))}

                  {/* Top card of the stack (Honest Cat Back) */}
                  <div className="relative w-full h-full rounded-2xl bg-gradient-to-b from-[#2D143D] via-[#1D0C28] to-[#100516] border-2 border-[#EAC272] shadow-[0_0_30px_rgba(234,194,114,0.3)] p-3 flex flex-col items-center justify-between group-hover:scale-105 transition-transform duration-300">
                    <div className="absolute inset-1.5 rounded-xl border border-dashed border-[#EAC272]/40" />
                    <div className="w-full flex justify-between text-[9px] text-[#EAC272]/80">
                      <span>✦</span>
                      <span>88 CARDS</span>
                      <span>✦</span>
                    </div>
                    <div className="flex flex-col items-center text-center">
                      <div className="w-12 h-12 rounded-full border border-[#EAC272]/60 flex items-center justify-center bg-[#3D1A52]/70 text-2xl text-[#EAC272] shadow-inner mb-1.5">
                        🐾
                      </div>
                      <span className="font-serif-display text-xs tracking-wider text-[#EAC272] font-bold uppercase">
                        Honest Cat
                      </span>
                      <span className="text-[9px] text-[#C9B49D]/80">
                        Ink Edition • Oracle
                      </span>
                    </div>
                    <span className="text-[9px] text-[#EAC272]/80 font-serif">✦ ✦ ✦</span>
                  </div>
                </div>

                <div className="space-y-2 max-w-sm">
                  <h3 className="font-serif-display text-xl text-[#FAE9CA]">
                    กองไพ่โอราเคิลแมวปิดหน้า 88 ใบ
                  </h3>
                  <p className="text-xs text-[#C9B49D]">
                    ไพ่ทุกใบปิดหน้าและปิดชื่อไว้ พร้อมสำหรับการสับกองและคลี่เรียงแถวตอนเป็นระเบียบ
                  </p>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-3">
                  <button
                    onClick={handleShuffleDeck}
                    className="btn-gilded flex items-center gap-2 px-6 py-3 text-xs font-bold text-[#110918] cursor-pointer"
                  >
                    <Shuffle className="h-4 w-4" />
                    <span>สับกองไพ่และคลี่แถวตอน</span>
                  </button>
                  <button
                    onClick={handleSpreadRibbon}
                    className="rounded-full bg-[#24102E] border border-[rgba(242,203,128,0.3)] px-5 py-3 text-xs font-semibold text-[#FAE9CA] hover:border-[#EAC272] transition-all"
                  >
                    ✨ คลี่แถวตอนทันที
                  </button>
                </div>
              </motion.div>
            )}

            {/* STAGE 2: SHUFFLING ANIMATION */}
            {spreadStage === 'shuffling' && (
              <div className="flex flex-col items-center justify-center text-center space-y-6 z-10 py-16">
                <div className="relative w-[180px] h-[240px] flex items-center justify-center">
                  {[...Array(8)].map((_, i) => (
                    <motion.div
                      key={i}
                      animate={{
                        x: [0, (i % 2 === 0 ? 1 : -1) * (30 + i * 8), 0],
                        y: [0, (i % 2 === 0 ? -1 : 1) * (15 + i * 4), 0],
                        rotate: [0, (i % 2 === 0 ? 15 : -15), 0],
                        scale: [1, 1.05, 1],
                      }}
                      transition={{
                        duration: 0.8,
                        repeat: Infinity,
                        delay: i * 0.08,
                      }}
                      className="absolute inset-0 rounded-2xl bg-gradient-to-b from-[#2A1238] via-[#1A0A24] to-[#100516] border-2 border-[#EAC272]/50 shadow-2xl p-2 flex flex-col items-center justify-center"
                    >
                      <span className="text-xl text-[#EAC272]">🐾</span>
                    </motion.div>
                  ))}
                </div>
                <div className="space-y-1">
                  <h4 className="font-serif-display text-lg text-[#FAE9CA] flex items-center justify-center gap-2">
                    <Sparkles className="h-4 w-4 text-[#EAC272] animate-spin" />
                    กำลังสับไพ่ 88 ใบ...
                  </h4>
                  <p className="text-xs text-[#C9B49D]">
                    สัมผัสพลังงาน ผ่อนคลายจิตใจ และตั้งจิตถึงคำถามของคุณ
                  </p>
                </div>
              </div>
            )}

            {/* STAGE 3: INTUITIVE 88-CARD MAT (ไม่มีปัญหาเลื่อนไกลอีกต่อไป) */}
            {spreadStage === 'linear_spread' && (
              <div className="w-full flex flex-col items-center justify-center relative z-10 py-2 space-y-4">
                {/* Mode Switcher Header */}
                <div className="w-full flex flex-wrap items-center justify-between gap-3 px-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-[#EAC272] font-semibold flex items-center gap-1.5">
                      <Compass className="h-3.5 w-3.5 text-[#EAC272]" />
                      สำรับโอราเคิล 88 ใบ ({selectedCards.length}/{maxSelectable} ใบ)
                    </span>
                    
                    {/* View Style Tabs */}
                    <div className="flex items-center rounded-xl bg-[#110918] p-1 border border-[rgba(242,203,128,0.2)]">
                      <button
                        onClick={() => setOracleDrawStyle('piles')}
                        className={`px-3 py-1 text-xs rounded-lg font-medium transition-all ${
                          oracleDrawStyle === 'piles'
                            ? 'bg-gradient-to-r from-[#EAC272] to-[#D4A84D] text-[#110918] font-bold shadow'
                            : 'text-[#C9B49D] hover:text-[#FAE9CA]'
                        }`}
                      >
                        สับ 3 กองพลังงาน (แนะนำ)
                      </button>
                      <button
                        onClick={() => setOracleDrawStyle('compact_grid')}
                        className={`px-3 py-1 text-xs rounded-lg font-medium transition-all ${
                          oracleDrawStyle === 'compact_grid'
                            ? 'bg-gradient-to-r from-[#EAC272] to-[#D4A84D] text-[#110918] font-bold shadow'
                            : 'text-[#C9B49D] hover:text-[#FAE9CA]'
                        }`}
                      >
                        กระดานหมวดพลังงาน
                      </button>
                      <button
                        onClick={() => setOracleDrawStyle('ribbon')}
                        className={`px-3 py-1 text-xs rounded-lg font-medium transition-all ${
                          oracleDrawStyle === 'ribbon'
                            ? 'bg-gradient-to-r from-[#EAC272] to-[#D4A84D] text-[#110918] font-bold shadow'
                            : 'text-[#C9B49D] hover:text-[#FAE9CA]'
                        }`}
                      >
                        แถวพัด
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {onOpenCardStudio && (
                      <button
                        onClick={onOpenCardStudio}
                        className="rounded-xl bg-[#24102E] border border-[rgba(242,203,128,0.25)] px-3 py-1.5 text-xs text-[#FAE9CA] hover:border-[#EAC272] transition-all flex items-center gap-1.5"
                        title="ปรับแต่งลายไพ่"
                      >
                        <span>🎴 ปรับลายไพ่</span>
                      </button>
                    )}

                    {selectedCards.length < maxSelectable && (
                      <button
                        onClick={handleAutoPick}
                        className="rounded-full bg-gradient-to-r from-[#842C71] to-[#361A4A] border border-[#EAC272]/50 text-[#FAE9CA] font-bold text-xs px-3.5 py-1.5 shadow hover:scale-105 transition-transform flex items-center gap-1.5"
                      >
                        <Sparkles className="h-3.5 w-3.5 text-[#EAC272]" />
                        <span>สุ่มหยิบ 1 ใบ (จาก 88 ใบ)</span>
                      </button>
                    )}
                    <button
                      onClick={handleResetDeck}
                      className="text-xs text-[#C9B49D] hover:text-[#FAE9CA] flex items-center gap-1 ml-2"
                    >
                      <RotateCcw className="h-3 w-3" />
                      <span>รวมกองใหม่</span>
                    </button>
                  </div>
                </div>

                {/* VIEW 1: 3 CUT PILES (สับแบ่ง 3 กองพลังงาน - จบในจอเดียว ไม่ต้องเลื่อนจอเลย) */}
                {oracleDrawStyle === 'piles' && (
                  <div className="w-full rounded-2xl bg-[#0F0615]/95 border border-[rgba(242,203,128,0.25)] p-5 sm:p-7 shadow-2xl">
                    <p className="text-xs text-[#C9B49D] text-center mb-5">
                      ไพ่ 88 ใบถูกจัดเป็น 3 กองพลังงาน — แตะเลือกกองที่ดวงจิตคุณสัมผัสได้:
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto">
                      {[
                        { 
                          title: 'กองที่ 1: เงาในใจ & ปมแผลเดิม', 
                          desc: 'สะท้อนสิ่งที่ซ่อนไว้ใต้พรม ความกลัวที่ยังไม่ยอมรับ',
                          icon: '🔮',
                          tag: 'Shadow & Truth',
                          pileIdx: 0 
                        },
                        { 
                          title: 'กองที่ 2: เข็มทิศปัจจุบัน & ทางแยก', 
                          desc: 'พลังงานหมุนเวียนรอบตัว จังหวะก้าวและทางเลือกเฉพาะหน้า',
                          icon: '🧭',
                          tag: 'Present Reality',
                          pileIdx: 1 
                        },
                        { 
                          title: 'กองที่ 3: การปลดล็อก & การเติบโต', 
                          desc: 'คำแนะนำดึงสติและทางออกจากปัญหาที่ติดหล่ม',
                          icon: '✨',
                          tag: 'Growth & Power',
                          pileIdx: 2 
                        },
                      ].map((pile) => (
                        <motion.button
                          key={pile.pileIdx}
                          whileHover={{ y: -8, scale: 1.03 }}
                          whileTap={{ scale: 0.96 }}
                          onClick={() => handlePickFromOraclePile(pile.pileIdx)}
                          className="group flex flex-col items-center justify-between rounded-2xl bg-gradient-to-b from-[#2A1035] via-[#1A0824] to-[#100516] p-4 border border-[rgba(242,203,128,0.3)] hover:border-[#EAC272] shadow-xl hover:shadow-[0_0_25px_rgba(234,194,114,0.3)] transition-all text-center cursor-pointer relative overflow-hidden"
                        >
                          <span className="text-[10px] font-bold text-[#EAC272] bg-[#842C71]/40 border border-[#EAC272]/30 px-2.5 py-0.5 rounded-full mb-2">
                            {pile.tag}
                          </span>

                          {/* Stacked Cards Illusion */}
                          <div className="relative w-20 aspect-[2/3] my-2">
                            <div className="absolute inset-0 rounded-xl bg-[#15071D] border border-[#EAC272]/20 translate-x-2 translate-y-2" />
                            <div className="absolute inset-0 rounded-xl bg-[#240C30] border border-[#EAC272]/30 translate-x-1 translate-y-1" />
                            <div className="relative w-full h-full rounded-xl bg-gradient-to-b from-[#3D144A] to-[#120518] border border-[#EAC272] flex flex-col items-center justify-center p-2 shadow-lg">
                              <span className="text-2xl filter drop-shadow">{pile.icon}</span>
                              <span className="text-[8px] text-[#EAC272] font-serif mt-1">THE ORACLE</span>
                            </div>
                          </div>

                          <h4 className="font-serif-display text-sm text-[#FAE9CA] group-hover:text-[#EAC272] transition-colors mt-1 font-bold">
                            {pile.title}
                          </h4>
                          <p className="text-[11px] text-[#C9B49D] mt-1 leading-snug line-clamp-2">
                            {pile.desc}
                          </p>

                          <span className="mt-3 text-[10px] font-bold text-[#110918] bg-[#EAC272] px-3 py-1 rounded-full group-hover:scale-105 transition-transform shadow">
                            แตะเพื่อเปิดไพ่ 🐾
                          </span>
                        </motion.button>
                      ))}
                    </div>
                  </div>
                )}

                {/* VIEW 2: COMPACT CATEGORIZED GRID (แบ่งตาม 6 หมวดพลังงาน ไม่ต้องเลื่อนไกล) */}
                {oracleDrawStyle === 'compact_grid' && (
                  <div className="w-full rounded-2xl bg-[#0F0615]/95 border border-[rgba(242,203,128,0.25)] p-4 sm:p-5 shadow-2xl space-y-3">
                    {/* Category Filter Pills */}
                    <div className="flex flex-wrap items-center justify-center gap-1.5 text-xs">
                      {[
                        { id: 'all', label: 'ทั้งหมด (88)' },
                        { id: 'shadow', label: '🌑 เงาในใจ (Shadow)' },
                        { id: 'boundary', label: '🛡️ ขอบเขต (Boundary)' },
                        { id: 'growth', label: '🌱 เติบโต (Growth)' },
                        { id: 'ego', label: '🦁 ตัวตน/อีโก้ (Ego)' },
                        { id: 'connection', label: '💞 ความสัมพันธ์ (Connection)' },
                        { id: 'cosmic', label: '✨ จักรวาล (Cosmic)' },
                      ].map((cat) => (
                        <button
                          key={cat.id}
                          onClick={() => setActiveDeckCategory(cat.id as any)}
                          className={`px-3 py-1 rounded-full text-xs transition-all ${
                            activeDeckCategory === cat.id
                              ? 'bg-[#EAC272] text-[#110918] font-bold shadow'
                              : 'bg-[#110918] text-[#C9B49D] border border-[rgba(242,203,128,0.15)] hover:text-[#FAE9CA]'
                          }`}
                        >
                          {cat.label}
                        </button>
                      ))}
                    </div>

                    {/* Compact Card Grid Container */}
                    <div className="grid grid-cols-4 sm:grid-cols-8 lg:grid-cols-11 gap-2 max-h-60 overflow-y-auto p-2 bg-[#09030D] rounded-xl border border-[rgba(242,203,128,0.15)]">
                      {deck
                        .filter((c) => activeDeckCategory === 'all' || c.category === activeDeckCategory)
                        .map((card, idx) => {
                          const isSelected = selectedCards.some((s) => s.id === card.id);
                          if (isSelected) return null;

                          return (
                            <motion.button
                              key={card.id}
                              whileHover={{ y: -6, scale: 1.08 }}
                              whileTap={{ scale: 0.94 }}
                              onClick={() => handlePickFromRibbon(card)}
                              className="relative aspect-[2/3] rounded-xl bg-gradient-to-b from-[#2D143D] via-[#1D0C28] to-[#100516] border border-[rgba(242,203,128,0.3)] hover:border-[#EAC272] p-1.5 flex flex-col items-center justify-between shadow hover:shadow-[0_0_12px_rgba(234,194,114,0.5)] transition-all cursor-pointer group"
                            >
                              <span className="text-[7px] text-[#EAC272]/70 font-serif">✦</span>
                              <span className="text-base group-hover:scale-110 transition-transform">🐾</span>
                              <span className="text-[8px] font-bold text-[#FAE9CA] truncate w-full text-center">
                                #{idx + 1}
                              </span>
                            </motion.button>
                          );
                        })}
                    </div>
                  </div>
                )}

                {/* VIEW 3: HORIZONTAL RIBBON WITH ARROWS */}
                {oracleDrawStyle === 'ribbon' && (
                  <div className="relative w-full rounded-2xl bg-[#0F0615]/90 border border-[rgba(242,203,128,0.25)] p-4 sm:p-6 shadow-2xl overflow-hidden">
                    <div className="flex items-center justify-end gap-2 mb-2">
                      <button
                        onClick={() => scrollRibbon('left')}
                        className="rounded-full bg-[#110918] p-1.5 text-[#C9B49D] hover:text-[#FAE9CA] border border-[rgba(242,203,128,0.2)] hover:border-[#EAC272]"
                      >
                        <ArrowLeft className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => scrollRibbon('right')}
                        className="rounded-full bg-[#110918] p-1.5 text-[#C9B49D] hover:text-[#FAE9CA] border border-[rgba(242,203,128,0.2)] hover:border-[#EAC272]"
                      >
                        <ArrowRight className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    <div
                      ref={ribbonContainerRef}
                      className="flex items-end gap-1.5 overflow-x-auto py-6 px-4 no-scrollbar scroll-smooth cursor-pointer"
                    >
                      {deck.map((card, index) => {
                        const isSelected = selectedCards.some((s) => s.id === card.id);
                        if (isSelected) return null;

                        return (
                          <motion.div
                            key={card.id}
                            whileHover={{ y: -18, scale: 1.08 }}
                            whileTap={{ scale: 0.96 }}
                            onClick={() => handlePickFromRibbon(card)}
                            className="relative shrink-0"
                          >
                            <div className="w-[58px] h-[98px] sm:w-[68px] sm:h-[110px] rounded-xl bg-gradient-to-b from-[#2D143D] via-[#1D0C28] to-[#100516] border border-[rgba(242,203,128,0.3)] hover:border-[#EAC272] p-2 flex flex-col items-center justify-between shadow-lg">
                              <span className="text-[8px] text-[#EAC272]/70 font-serif">✦</span>
                              <span className="text-base text-[#EAC272]">🐾</span>
                              <span className="text-[8px] text-[#C9B49D]/70">#{index + 1}</span>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* REVEALED DRAWN CARDS TRAY (ไพ่ที่สุ่มเปิดได้ - 3D FLIPPED) */}
          <div className="velvet-card rounded-[28px] p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-[rgba(242,203,128,0.12)] pb-3">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-[#FAE9CA]">
                  ไพ่ที่เปิดได้ ({selectedCards.length}/{maxSelectable} ใบ)
                </span>
                <span className="text-xs text-[#EAC272]">
                  {selectedCards.length === maxSelectable
                    ? '✨ หงายหน้าไพ่ครบแล้ว พร้อมถอดรหัสคำทำนาย'
                    : `(เลือกจากวงกลมด้านบนอีก ${maxSelectable - selectedCards.length} ใบ)`}
                </span>
              </div>

              {selectedCards.length > 0 && (
                <button
                  onClick={() => setSelectedCards([])}
                  className="text-xs text-[#C9B49D] hover:text-[#FAE9CA] underline underline-offset-4"
                >
                  ล้างไพ่ที่เลือก
                </button>
              )}
            </div>

            {/* Selected Cards Stage */}
            <div className="flex flex-wrap items-center justify-center gap-6 min-h-[240px] py-2">
              {Array.from({ length: maxSelectable }).map((_, idx) => {
                const card = selectedCards[idx];
                const labels = drawMode === 'single' 
                  ? ['ความจริงตรงหน้า (The Raw Truth)']
                  : [
                      '1. ภาพสะท้อนจิตใต้สำนึก (Mirror)',
                      '2. กับดักความคิดและพฤติกรรม (Trap)',
                      '3. ทางออกและกุญแจปลดล็อก (Key)',
                    ];

                if (!card) {
                  return (
                    <div
                      key={`oracle-slot-empty-${idx}`}
                      className="w-[145px] h-[215px] rounded-2xl border-2 border-dashed border-[rgba(242,203,128,0.25)] bg-[#110918]/60 flex flex-col items-center justify-center p-3 text-center"
                    >
                      <Brain className="h-7 w-7 text-[#EAC272]/40 mb-2" />
                      <span className="text-[11px] font-bold text-[#FAE9CA]/80">{labels[idx]}</span>
                      <span className="text-[10px] text-[#C9B49D]/60 mt-1">แตะเลือกจากวงล้อ</span>
                    </div>
                  );
                }

                return (
                  <motion.div
                    key={`oracle-slot-card-${idx}-${card.id}`}
                    initial={{ scale: 0.8, opacity: 0, rotateY: 180 }}
                    animate={{ scale: 1, opacity: 1, rotateY: 0 }}
                    transition={{ duration: 0.5 }}
                    className="flex flex-col items-center gap-2 max-w-[200px]"
                  >
                    <div className="relative group">
                      <HonestCatCard
                        card={card}
                        isSelected={true}
                        size="md"
                        isFlipped={true}
                        backTheme={cardSettings.backTheme}
                        onClick={() => setPreviewCard(card)}
                      />
                      <button
                        onClick={() => setPreviewCard(card)}
                        className="absolute top-2 right-2 rounded-full bg-[#110918]/90 p-1 text-[#EAC272] border border-[rgba(242,203,128,0.3)] shadow opacity-0 group-hover:opacity-100 transition-opacity"
                        title="ดูรายละเอียดการ์ด"
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <div className="text-center">
                      <span className="text-[10px] font-bold text-[#F2CB80] bg-[#842C71]/40 px-2 py-0.5 rounded-full border border-[rgba(242,203,128,0.2)]">
                        {labels[idx]}
                      </span>
                      <h4 className="font-serif-display text-xs font-bold text-[#FAE9CA] mt-1">
                        {card.name_th || card.titleTh}
                      </h4>
                      <p className="text-[11px] text-[#C9B49D] line-clamp-2 mt-0.5 leading-snug">
                        {card.meaning || card.coreTruth}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Reading Depth Tier & Submit Button */}
            {selectedCards.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="pt-2 space-y-4"
              >
                {/* Tier Selector */}
                <ReadingDepthSelector
                  selectedDepth={selectedDepth}
                  onSelectDepth={(d) => setSelectedDepth(d)}
                  userCoins={userCoins}
                  onOpenTopUp={onOpenTopUp}
                />

                <button
                  id="btn-analyze-oracle"
                  onClick={handleSubmit}
                  disabled={isLoading || userCoins < READING_DEPTH_TIERS[selectedDepth].costCoins}
                  className={`w-full flex items-center justify-center gap-2.5 py-4 text-sm font-bold rounded-2xl shadow-xl transition-all cursor-pointer ${
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
                        ถอดรหัสความจริงกับ The Honest Cat Oracle ({READING_DEPTH_TIERS[selectedDepth].label} • ใช้ {READING_DEPTH_TIERS[selectedDepth].costCoins} เหรียญ)
                      </span>
                    </>
                  )}
                </button>
              </motion.div>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: 88 Cards Encyclopedia Gallery */}
      {activeTab === 'gallery' && (
        <div className="velvet-card rounded-[28px] p-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[rgba(242,203,128,0.12)] pb-4">
            <div>
              <h3 className="font-serif-display text-lg text-[#FAE9CA] flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-[#EAC272]" />
                สารานุกรมไพ่โอราเคิลแมวครบชุด (88 ใบ)
              </h3>
              <p className="text-xs text-[#C9B49D]">
                ศึกษาความหมาย คำแนะนำ และข้อคิดเตือนสติของไพ่แต่ละใบ
              </p>
            </div>

            {/* Search & Filter */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-[#C9B49D]/60" />
                <input
                  type="text"
                  placeholder="ค้นหาชื่อไพ่ / ความหมาย..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="rounded-full bg-[#110918] border border-[rgba(242,203,128,0.18)] pl-8 pr-3.5 py-1.5 text-xs text-[#FAE9CA] placeholder:text-[#C9B49D]/40 focus:border-[#EAC272] focus:outline-none w-[170px] sm:w-[220px]"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-2.5 text-[#C9B49D] hover:text-[#FAE9CA]"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>

              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="rounded-full bg-[#110918] border border-[rgba(242,203,128,0.18)] px-3 py-1.5 text-xs text-[#FAE9CA] focus:border-[#EAC272] focus:outline-none"
              >
                <option value="all">ทุกหมวดหมู่ (88 ใบ)</option>
                <option value="growth">การเติบโต & จังหวะชีวิต (Growth)</option>
                <option value="boundary">ขอบเขต & การปล่อยวาง (Boundary)</option>
                <option value="shadow">จิตใต้สำนึก & ด้านมืด (Shadow)</option>
                <option value="connection">สายสัมพันธ์ & ตัวตน (Connection)</option>
              </select>
            </div>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 max-h-[560px] overflow-y-auto pr-1">
            {filteredCards.map((card) => (
              <div key={card.id} className="flex flex-col items-center">
                <HonestCatCard
                  card={card}
                  isSelected={false}
                  size="sm"
                  isFlipped={true}
                  onClick={() => setPreviewCard(card)}
                />
                <button
                  type="button"
                  onClick={() => setPreviewCard(card)}
                  className="text-[10px] text-[#C9B49D] hover:text-[#FAE9CA] mt-1 text-center line-clamp-1 hover:underline cursor-pointer"
                >
                  {card.name_th || card.titleTh}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Card Detail Modal */}
      <AnimatePresence>
        {previewCard && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-lg rounded-[28px] bg-gradient-to-b from-[#24102E] via-[#1A0A24] to-[#110918] border-2 border-[#EAC272]/50 p-6 shadow-2xl space-y-4 overflow-hidden"
            >
              <button
                onClick={() => setPreviewCard(null)}
                className="absolute top-4 right-4 rounded-full bg-[#110918] p-2 text-[#C9B49D] hover:text-[#FAE9CA] border border-[rgba(242,203,128,0.2)]"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
                <div className="shrink-0">
                  <HonestCatCard 
                    card={previewCard} 
                    size="lg" 
                    isSelected={true} 
                    isFlipped={true} 
                    backTheme={cardSettings.backTheme}
                  />
                </div>

                <div className="space-y-3 flex-1 text-left">
                  <div>
                    <span className="text-[10px] font-mono text-[#EAC272] tracking-wider uppercase bg-[#842C71]/40 px-2 py-0.5 rounded-md border border-[rgba(242,203,128,0.2)]">
                      {previewCard.id} • {previewCard.category}
                    </span>
                    <h3 className="font-serif-display text-xl font-bold text-[#FAE9CA] mt-1">
                      {previewCard.name_th || previewCard.titleTh}
                    </h3>
                    <p className="text-xs text-[#EAC272] italic font-serif">
                      "{previewCard.name_en || previewCard.titleEn}"
                    </p>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="rounded-xl bg-[#110918]/80 p-3 border border-[rgba(242,203,128,0.12)]">
                      <strong className="text-[#FAE9CA] block mb-1">🪞 ความหมายของไพ่:</strong>
                      <p className="text-[#C9B49D] leading-relaxed">
                        {previewCard.meaning || previewCard.coreTruth}
                      </p>
                    </div>

                    <div className="rounded-xl bg-[#165B53]/30 p-3 border border-[#165B53]/50">
                      <strong className="text-[#AEFFE4] block mb-1">🐾 คำแนะนำ & ทางออก:</strong>
                      <p className="text-[#E0FFF6] leading-relaxed">
                        {previewCard.advice || previewCard.actionableStep}
                      </p>
                    </div>

                    <div className="rounded-xl bg-[#842C71]/25 p-3 border border-[rgba(242,203,128,0.15)]">
                      <strong className="text-[#EAC272] block mb-1">😼 ข้อคิดเรียกสติ:</strong>
                      <p className="text-[#FAE9CA] italic">
                        "{previewCard.sassyQuote}"
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      handlePickFromRibbon(previewCard);
                      setPreviewCard(null);
                    }}
                    className="btn-gilded w-full py-2.5 text-xs font-bold text-[#110918] cursor-pointer"
                  >
                    {selectedCards.some((c) => c.id === previewCard.id)
                      ? 'ไพ่ใบนี้อยู่ในสเปรดแล้ว'
                      : 'เลือกไพ่ใบนี้เข้าสเปรด'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
