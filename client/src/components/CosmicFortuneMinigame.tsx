import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import {
  Sparkles,
  RotateCw,
  Gift,
  Volume2,
  VolumeX,
  Coins,
  HelpCircle,
  Award,
  Heart,
  Briefcase,
  Compass,
  Flame,
  Check,
  Eye,
  ShieldCheck,
  Zap,
  Repeat
} from 'lucide-react';
import { MinigameTab, EsiimsiResult, CardDesignSettings } from '../types';
import { CosmicCardRenderer } from './CosmicCardRenderer';
import {
  playWheelTickSound,
  playBambooShakeSound,
  playJackpotSound,
  playMysticChimeSound,
  playCatPurrSound,
  speakThaiText
} from '../utils/speechHelper';

interface CosmicFortuneMinigameProps {
  currentCoins: number;
  onClaimReward: (amount: number, reason: string) => void;
  cardSettings: CardDesignSettings;
  onShowToast: (msg: string) => void;
  onOpenTopUp: () => void;
}

// 8 Wheel segments
const WHEEL_SEGMENTS = [
  { id: '1', label: '10 เหรียญ', sub: 'ลาภปาก', coins: 10, color: '#842C71', textColor: '#FAE9CA', icon: '🪙' },
  { id: '2', label: 'พรความรัก', sub: 'เสน่ห์ฟุ้ง', coins: 15, color: '#361A4A', textColor: '#FFD7EC', icon: '💖' },
  { id: '3', label: '25 เหรียญ', sub: 'เงินหมุนคล่อง', coins: 25, color: '#165B53', textColor: '#AEFFE4', icon: '💰' },
  { id: '4', label: 'พรการงาน', sub: 'ปิดดีลฉลุย', coins: 20, color: '#1E0E2A', textColor: '#EAC272', icon: '💼' },
  { id: '5', label: 'JACKPOT 100', sub: 'จักรวาลเปิดทาง', coins: 100, color: '#EAC272', textColor: '#110918', icon: '👑', isJackpot: true },
  { id: '6', label: 'พรเนตรทิพย์', sub: 'สติเต็มร้อย', coins: 15, color: '#2A143A', textColor: '#D8B4FE', icon: '🔮' },
  { id: '7', label: '50 เหรียญ', sub: 'มหาเฮง', coins: 50, color: '#842C71', textColor: '#FAE9CA', icon: '🪙' },
  { id: '8', label: 'พรมหาลาภ', sub: 'โชคหล่นทับ', coins: 30, color: '#165B53', textColor: '#AEFFE4', icon: '🍀' },
];

// Rich Esiimsi database (28 traditional sets)
const ESIIMSI_DATABASE: EsiimsiResult[] = [
  {
    number: 1,
    grade: 'ยอดเยี่ยม (มหาโชค)',
    gradeColor: '#10B981',
    poem: [
      'ใบที่หนึ่ง เบิกฟ้า พระอาทิตย์',
      'ส่องประสิทธิ์ ศุภผล ดลสุขศานต์',
      'คิดทำการ สิ่งใด ไร้รำคาญ',
      'จะเบิกบาน รับทรัพย์ นับอนันต์',
    ],
    meaning: 'ชะตาเปิดสว่างไสวเหมือนรุ่งอรุณ การงานและการเงินที่ติดขัดจะได้รับการปลดล็อก ผู้ใหญ่หรือคนมีบารมีจะยื่นมือเข้ามาอุปถัมภ์',
    sassyCatAdvice: 'ฟ้าเปิดทางให้ขนาดนี้แล้ว ถ้ายังนอนอืดไม่ลุกไปทำงาน ก็อย่าไปโทษเทวดานะสาว!',
    luckyNumbers: '19, 91, 168',
    powerDirection: 'ทิศตะวันออกเฉียงเหนือ',
  },
  {
    number: 7,
    grade: 'ดีมาก (สมปรารถนา)',
    gradeColor: '#3B82F6',
    poem: [
      'ใบที่เจ็ด เกล็ดมังกร ซ่อนสมบัติ',
      'ฟ้าจัดสรร นำทาง สว่างใส',
      'แม้นย่อท้อ วันวาน จงผ่านไป',
      'ชัยชนะ อันยิ่งใหญ่ ใกล้เข้ามา',
    ],
    meaning: 'สิ่งที่เพียรพยายามมานานกำลังจะผลิดอกออกผล คนที่แอบชอบจะเริ่มเห็นคุณค่า งานที่ส่งประกวดหรือนำเสนอจะผ่านฉลุย',
    sassyCatAdvice: 'อย่าเอามาตรฐานตัวเองไปเทียบกับคนในไอจี โฟกัสเป้าหมายตรงหน้าแล้วลงมือลุย!',
    luckyNumbers: '24, 42, 789',
    powerDirection: 'ทิศใต้',
  },
  {
    number: 9,
    grade: 'ยอดเยี่ยม (มหาโชค)',
    gradeColor: '#10B981',
    poem: [
      'ใบที่เก้า พระพาย พัดผ่านเมฆ',
      'ดุจมนต์เสก ทรัพย์สิน บินเข้าหา',
      'เสน่ห์ล้ำ วาจา นำเงินตรา',
      'ทุกทิศา ล้วนต้อนรับ ประทับใจ',
    ],
    meaning: 'วาจาเป็นมหาเสน่ห์ เจรจาค้าขายหรือขอความช่วยเหลือจะได้รับความเอ็นดูเป็นพิเศษ โชคลาภก้อนโตจากการเดินทาง',
    sassyCatAdvice: 'พูดจาให้ไพเราะ ยิ้มหวานๆ แต่สัญญาต้องทำเป็นลายลักษณ์อักษรเสมอ อย่าไว้ใจใครเกินร้อย!',
    luckyNumbers: '99, 89, 569',
    powerDirection: 'ทิศตะวันออก',
  },
  {
    number: 13,
    grade: 'เตือนภัย (ระวังอารมณ์)',
    gradeColor: '#F59E0B',
    poem: [
      'ใบสิบสาม คลื่นซัด ตัดนาวา',
      'อย่ารีบร้อน นำพา พาเรือล่ม',
      'คำคนลวง ลมปาก มักขื่นขม',
      'จงดื่นจม ด้วยสติ มิหลงทาง',
    ],
    meaning: 'ช่วงนี้งดการตัดสินใจลงทุนก้อนใหญ่ตามอารมณ์ชั่ววูบ ระวังเอกสารสัญญาหมกเม็ด และอย่าเพิ่งเปิดใจให้คนคุยใหม่หมดร้อยเปอร์เซ็นต์',
    sassyCatAdvice: 'เค้าทักมาแค่ "ทำไรอยู่" ไม่ได้แปลว่าเค้าอยากแต่งงานด้วยค่ะสาว ตื่น!',
    luckyNumbers: '03, 30, 403',
    powerDirection: 'ทิศเหนือ',
  },
  {
    number: 18,
    grade: 'ปานกลาง (มีสติ)',
    gradeColor: '#8B5CF6',
    poem: [
      'สิบแปดนี้ ม่านหมอก บังดวงจิต',
      'เพ่งพินิจ ความจริง อิงเหตุผล',
      'พึ่งพาใคร ไม่เทียมเท่า พึ่งพึ่งตน',
      'สุขจะพ้น จากมัวหมอง ผ่องอำไพ',
    ],
    meaning: 'สถานการณ์บางอย่างยังคงคลุมเครือ ไม่ควรคาดหวังความสมบูรณ์แบบ ให้รักษาพลังงานตัวเองและโฟกัสกับหน้าที่ประจำวัน',
    sassyCatAdvice: 'เหนื่อยก็ไปนอน หิวน้ำก็ดื่มน้ำ เลิกส่องแฟนเก่าได้แล้วจ้ะ!',
    luckyNumbers: '18, 81, 218',
    powerDirection: 'ทิศตะวันตก',
  },
  {
    number: 28,
    grade: 'ยอดเยี่ยม (มหาโชค)',
    gradeColor: '#10B981',
    poem: [
      'ยี่สิบแปด ดาวจรัส รัศมีเรือง',
      'เกียรติประเทือง ทั่วแคว้น ดั่งปรารถนา',
      'ปลดเปลื้องหนี้ ทวีสิน ล้นพสุธา',
      'บุญนำพา สุขเกษม เปรมปรีดา',
    ],
    meaning: 'ใบมหาบารมี ชนะคู่แข่ง ชนะอุปสรรคทั้งปวง มีสิทธิ์ได้รับข่าวดีเรื่องเงินก้อนโต มรดก หรือโบนัสประจำปี',
    sassyCatAdvice: 'รวยแล้วอย่าลืมเก็บออม เลิกเอฟของออนไลน์ตอนตีสองได้แล้ว!',
    luckyNumbers: '28, 82, 168',
    powerDirection: 'ทิศตะวันออกเฉียงใต้',
  },
];

export const CosmicFortuneMinigame: React.FC<CosmicFortuneMinigameProps> = ({
  currentCoins,
  onClaimReward,
  cardSettings,
  onShowToast,
  onOpenTopUp,
}) => {
  const [activeTab, setActiveTab] = useState<MinigameTab>('wheel');

  // ----------------------------------------------------
  // Game 1: Wheel of Destiny State
  // ----------------------------------------------------
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [wheelRotation, setWheelRotation] = useState<number>(0);
  const [wonReward, setWonReward] = useState<any | null>(null);
  const todayStr = new Date().toISOString().split('T')[0];
  const [hasFreeSpin, setHasFreeSpin] = useState<boolean>(() => {
    return localStorage.getItem('thecatroom_free_spin_date') !== todayStr;
  });

  // ----------------------------------------------------
  // Game 2: Esiimsi Bamboo Shake State
  // ----------------------------------------------------
  const [isShaking, setIsShaking] = useState<boolean>(false);
  const [esiimsiResult, setEsiimsiResult] = useState<EsiimsiResult | null>(null);
  const [hasDrawnEsiimsiToday, setHasDrawnEsiimsiToday] = useState<boolean>(false);

  // ----------------------------------------------------
  // Game 3: Psychic Card Match (ESP Trial)
  // ----------------------------------------------------
  const [winningCardIndex, setWinningCardIndex] = useState<number>(() => Math.floor(Math.random() * 4));
  const [pickedCardIndex, setPickedCardIndex] = useState<number | null>(null);
  const [isEspRevealed, setIsEspRevealed] = useState<boolean>(false);
  const [espStreak, setEspStreak] = useState<number>(0);

  // Wheel Spin Logic
  const handleSpinWheel = () => {
    if (isSpinning) return;

    if (!hasFreeSpin && currentCoins < 10) {
      onShowToast('⚠️ เหรียญไม่พอสำหรับหมุนวงล้อ (ต้องการ 10 เหรียญ หรือรอฟรีวันพรุ่งนี้)');
      onOpenTopUp();
      return;
    }

    if (!hasFreeSpin) {
      onClaimReward(-10, 'ค่าหมุนวงล้อโชคชะตา 1 ครั้ง');
    } else {
      setHasFreeSpin(false);
      localStorage.setItem('thecatroom_free_spin_date', todayStr);
    }

    setIsSpinning(true);
    setWonReward(null);

    // Pick winning index with realistic probability
    const targetIdx = Math.floor(Math.random() * WHEEL_SEGMENTS.length);
    const segmentAngle = 360 / WHEEL_SEGMENTS.length; // 45 deg
    const extraRotations = 5 * 360; // 5 full turns
    const targetAngle = extraRotations + (360 - (targetIdx * segmentAngle + segmentAngle / 2));

    // Play tick sound interval while spinning
    const tickInterval = setInterval(() => {
      playWheelTickSound();
    }, 120);

    setWheelRotation(prev => prev + targetAngle);

    setTimeout(() => {
      clearInterval(tickInterval);
      setIsSpinning(false);
      const selected = WHEEL_SEGMENTS[targetIdx];
      setWonReward(selected);

      playJackpotSound();
      confetti({
        particleCount: selected.isJackpot ? 150 : 80,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#EAC272', '#FAE9CA', '#842C71', '#10B981'],
      });

      onClaimReward(selected.coins, `รางวัลจากวงล้อโชคชะตา: ${selected.label}`);
      onShowToast(`🎉 ยินดีด้วย! ได้รับ ${selected.label} (+${selected.coins} เหรียญ)`);
    }, 3500);
  };

  // Esiimsi Shake Logic
  const handleShakeEsiimsi = () => {
    if (isShaking) return;

    playBambooShakeSound();
    setIsShaking(true);
    setEsiimsiResult(null);

    const soundInterval = setInterval(() => {
      playBambooShakeSound();
    }, 180);

    setTimeout(() => {
      clearInterval(soundInterval);
      setIsShaking(false);

      const randomResult = ESIIMSI_DATABASE[Math.floor(Math.random() * ESIIMSI_DATABASE.length)];
      setEsiimsiResult(randomResult);
      playMysticChimeSound('gold');

      if (!hasDrawnEsiimsiToday) {
        setHasDrawnEsiimsiToday(true);
        onClaimReward(10, `ของขวัญเขย่าเซียมซีใบที่ ${randomResult.number}`);
        onShowToast(`📜 เซียมซีใบที่ ${randomResult.number} หล่นลงมาแล้ว! (+10 เหรียญ)`);
      }
    }, 1500);
  };

  // Psychic Card Pick
  const handlePickEspCard = (idx: number) => {
    if (isEspRevealed) return;

    playMysticChimeSound('card');
    setPickedCardIndex(idx);
    setIsEspRevealed(true);

    const isWin = idx === winningCardIndex;
    if (isWin) {
      playJackpotSound();
      setEspStreak(s => s + 1);
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#EAC272', '#FAE9CA', '#842C71'],
      });
      onClaimReward(30, 'ทายไพ่พลังจิตถูกต้อง 100% (+30 เหรียญ)');
      onShowToast('🌟 ยอดเยี่ยมมาก! สัญชาตญาณแม่นยำ 100% ได้รับ 30 เหรียญ');
    } else {
      playMysticChimeSound('soft');
      onClaimReward(5, 'ปลอบใจทายไพ่พลังจิต (+5 เหรียญ)');
      onShowToast('🐾 เกือบถูกแล้วจ้า! ได้รับเหรียญปลอบใจ 5 เหรียญ');
    }
  };

  const handleResetEsp = () => {
    playMysticChimeSound('card');
    setWinningCardIndex(Math.floor(Math.random() * 4));
    setPickedCardIndex(null);
    setIsEspRevealed(false);
  };

  return (
    <div className="space-y-6">
      {/* Minigames Banner */}
      <div className="relative overflow-hidden rounded-[28px] border border-[rgba(242,203,128,0.25)] bg-gradient-to-r from-[#240C30] via-[#1A0824] to-[#120518] p-6 sm:p-8 shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <div className="inline-flex items-center gap-2 rounded-full bg-[#842C71]/40 px-3 py-1 text-xs font-semibold text-[#FFDE9E] border border-[rgba(242,203,128,0.3)]">
              <span>🎡 โซนมินิเกมเสี่ยงดวงชะตา (Cosmic Fortune Minigames)</span>
            </div>
            <h2 className="font-serif-display text-2xl sm:text-3xl font-bold text-[#FAE9CA]">
              หมุนวงล้อจักรวาล & เขย่าเซียมซีรับเหรียญฟรี!
            </h2>
            <p className="text-xs sm:text-sm text-[#C9B49D] max-w-xl">
              ทดสอบพลังจิต เสี่ยงทายดวงชะตารับเหรียญแม่หมอเหมียวฟรีทุกวัน หมุนวงล้อรับพรความรัก การงาน และแจ็กพอต 100 เหรียญ!
            </p>
          </div>

          {/* Quick Balance & Free Spin Status */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="flex items-center gap-2 rounded-2xl bg-[#110918]/80 px-4 py-2.5 border border-[rgba(242,203,128,0.2)]">
              <span className="text-lg">🪙</span>
              <div>
                <span className="text-[10px] text-[#C9B49D] block">เหรียญของคุณ:</span>
                <span className="font-serif-display text-base font-bold text-[#EAC272]">
                  {currentCoins.toLocaleString()} เหรียญ
                </span>
              </div>
            </div>

            {hasFreeSpin && (
              <span className="rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-3 py-1 text-xs font-bold animate-pulse">
                ✨ มีสิทธิ์หมุนฟรี 1 ครั้ง!
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="flex items-center justify-center gap-2">
        {[
          { id: 'wheel' as MinigameTab, name: 'กงล้อโชคชะตา 12 ทิศ', icon: '🎡' },
          { id: 'esiimsi' as MinigameTab, name: 'เซียมซีกระบอกไม้ไผ่', icon: '🎋' },
          { id: 'esp' as MinigameTab, name: 'ทายไพ่พลังจิต (ESP)', icon: '🔮' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              playMysticChimeSound('soft');
              setActiveTab(tab.id);
            }}
            className={`flex items-center gap-2 rounded-full px-5 py-2.5 text-xs sm:text-sm font-semibold transition-all ${
              activeTab === tab.id
                ? 'bg-gradient-to-r from-[#842C71] via-[#361A4A] to-[#1E0E2A] text-[#FAE9CA] border border-[#EAC272] shadow-lg shadow-[#110918]'
                : 'bg-[#1E0E2A] text-[#C9B49D] hover:text-[#FAE9CA] border border-[rgba(242,203,128,0.12)]'
            }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.name}</span>
          </button>
        ))}
      </div>

      {/* ==================================================== */}
      {/* GAME 1: WHEEL OF DESTINY */}
      {/* ==================================================== */}
      {activeTab === 'wheel' && (
        <div className="velvet-card rounded-[28px] p-6 sm:p-8 flex flex-col items-center justify-center space-y-6 relative overflow-hidden">
          <div className="text-center max-w-md">
            <h3 className="font-serif-display text-2xl text-[#FAE9CA]">
              กงล้อโชคชะตาจักรวาล (The Wheel of Destiny)
            </h3>
            <p className="text-xs text-[#C9B49D] mt-1">
              {hasFreeSpin
                ? '🎁 วันนี้คุณมีสิทธิ์หมุนฟรี 1 ครั้ง! แตะปุ่มตรงกลางเพื่อหมุน'
                : 'ใช้ 10 เหรียญเพื่อหมุนเสี่ยงทาย หรือรอสิทธิ์ฟรีในวันถัดไป'}
            </p>
          </div>

          {/* Wheel Graphic Container */}
          <div className="relative w-72 h-72 sm:w-84 sm:h-84 flex items-center justify-center my-4">

            {/* Top Gilded Pointer Arrow */}
            <div className="absolute -top-3 z-30 flex flex-col items-center">
              <div className="w-0 h-0 border-l-[14px] border-l-transparent border-r-[14px] border-r-transparent border-t-[24px] border-t-[#EAC272] filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.8)]" />
              <div className="h-2 w-2 rounded-full bg-[#110918] -mt-5" />
            </div>

            {/* Spinning Wheel */}
            <div
              className="relative w-full h-full rounded-full border-4 border-[#EAC272] shadow-[0_0_40px_rgba(234,194,114,0.35)] overflow-hidden transition-transform duration-[3500ms] cubic-bezier(0.15, 0.9, 0.25, 1)"
              style={{ transform: `rotate(${wheelRotation}deg)` }}
            >
              {/* Segments SVG */}
              <svg viewBox="0 0 100 100" className="w-full h-full">
                {WHEEL_SEGMENTS.map((seg, idx) => {
                  const angle = 360 / WHEEL_SEGMENTS.length;
                  const startAngle = idx * angle;
                  const endAngle = (idx + 1) * angle;

                  // Polar to cartesian
                  const x1 = 50 + 50 * Math.cos((Math.PI * startAngle) / 180);
                  const y1 = 50 + 50 * Math.sin((Math.PI * startAngle) / 180);
                  const x2 = 50 + 50 * Math.cos((Math.PI * endAngle) / 180);
                  const y2 = 50 + 50 * Math.sin((Math.PI * endAngle) / 180);

                  const pathData = `M 50 50 L ${x1} ${y1} A 50 50 0 0 1 ${x2} ${y2} Z`;

                  // Text angle at center of slice
                  const midAngle = startAngle + angle / 2;
                  const textRad = (Math.PI * midAngle) / 180;
                  const textX = 50 + 32 * Math.cos(textRad);
                  const textY = 50 + 32 * Math.sin(textRad);

                  return (
                    <g key={seg.id}>
                      <path
                        d={pathData}
                        fill={seg.color}
                        stroke="#EAC272"
                        strokeWidth="0.6"
                      />
                      <text
                        x={textX}
                        y={textY}
                        fill={seg.textColor}
                        fontSize="3.4"
                        fontWeight="bold"
                        textAnchor="middle"
                        dominantBaseline="central"
                        transform={`rotate(${midAngle + 90} ${textX} ${textY})`}
                      >
                        {seg.label}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>

            {/* Center Spin Hub Button */}
            <motion.button
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
              onClick={handleSpinWheel}
              disabled={isSpinning}
              className="absolute z-20 flex h-20 w-20 flex-col items-center justify-center rounded-full bg-gradient-to-tr from-[#361A4A] via-[#842C71] to-[#EAC272] border-2 border-[#FAE9CA] text-[#FAE9CA] shadow-2xl cursor-pointer"
            >
              {isSpinning ? (
                <RotateCw className="h-6 w-6 animate-spin text-[#FAE9CA]" />
              ) : (
                <>
                  <Sparkles className="h-5 w-5 text-[#FAE9CA]" />
                  <span className="text-[11px] font-bold mt-0.5">
                    {hasFreeSpin ? 'หมุนฟรี' : 'หมุน'}
                  </span>
                  {!hasFreeSpin && (
                    <span className="text-[9px] text-[#FFDE9E]">10 🪙</span>
                  )}
                </>
              )}
            </motion.button>
          </div>

          {/* Winner Display Card */}
          <AnimatePresence>
            {wonReward && (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="w-full max-w-sm rounded-2xl bg-gradient-to-r from-[#842C71]/40 via-[#361A4A] to-[#1E0E2A] p-4 border border-[#EAC272] text-center shadow-xl space-y-2"
              >
                <span className="text-3xl">{wonReward.icon}</span>
                <h4 className="font-serif-display text-xl text-[#FAE9CA]">
                  ยินดีด้วย! คุณได้รับ "{wonReward.label}"
                </h4>
                <p className="text-xs text-[#EAC272] font-semibold">
                  {wonReward.sub} (+{wonReward.coins} เหรียญแม่หมอ)
                </p>
                <button
                  onClick={handleSpinWheel}
                  disabled={isSpinning}
                  className="btn-gilded mt-2 px-5 py-2 text-xs font-bold text-[#110918]"
                >
                  หมุนอีกครั้ง (10 🪙)
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* ==================================================== */}
      {/* GAME 2: ESIIMSI BAMBOO SHAKE */}
      {/* ==================================================== */}
      {activeTab === 'esiimsi' && (
        <div className="velvet-card rounded-[28px] p-6 sm:p-8 flex flex-col items-center justify-center space-y-6">
          <div className="text-center max-w-md">
            <h3 className="font-serif-display text-2xl text-[#FAE9CA]">
              เซียมซีกระบอกไม้ไผ่วัดมังกร (Cosmic Esiimsi Shake)
            </h3>
            <p className="text-xs text-[#C9B49D] mt-1">
              ตั้งจิตอธิษฐานถามเรื่องที่ข้องใจ แล้วกดปุ่มเขย่ากระบอกเซียมซีจนกว่าไม้ทำนายจะหล่นลงมา
            </p>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-center gap-8 w-full max-w-3xl">
            {/* Bamboo Tube Graphics & Shake Button */}
            <div className="flex flex-col items-center justify-center space-y-4">
              <motion.div
                animate={isShaking ? {
                  rotate: [0, -12, 12, -8, 8, 0],
                  y: [0, -15, 0, -15, 0],
                } : {}}
                transition={{ repeat: isShaking ? Infinity : 0, duration: 0.3 }}
                className="relative w-28 h-52 rounded-2xl bg-gradient-to-r from-[#3D2513] via-[#5C381E] to-[#2E1A0C] border-2 border-[#EAC272] shadow-2xl flex flex-col items-center justify-between p-3 select-none"
              >
                {/* Bamboo Rim Rings */}
                <div className="w-full h-3 rounded-full bg-[#784A28] border-b border-[#EAC272]/50 shadow" />

                {/* Bamboo Sticks poking out from top */}
                <div className="absolute -top-7 flex items-center justify-center gap-1.5 w-full">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <div
                      key={s}
                      className="w-2 rounded-t-sm bg-[#D4A373] border border-[#8B5E34]"
                      style={{ height: `${24 + (s % 3) * 6}px` }}
                    />
                  ))}
                </div>

                {/* Golden Chinese/Thai Calligraphy Label on Shaker */}
                <div className="flex flex-col items-center py-2 space-y-1">
                  <span className="font-serif-display text-xl text-[#EAC272] font-bold">籤</span>
                  <span className="text-[10px] font-bold tracking-widest text-[#FAE9CA]">เซียมซี</span>
                  <span className="text-[9px] text-[#AEFFE4]">แม่หมอเหมียว</span>
                </div>

                <div className="w-full h-3 rounded-full bg-[#784A28] border-t border-[#EAC272]/50 shadow" />
              </motion.div>

              <button
                id="btn-shake-esiimsi"
                onClick={handleShakeEsiimsi}
                disabled={isShaking}
                className="btn-gilded flex items-center gap-2 px-6 py-3 text-xs sm:text-sm font-bold text-[#110918] cursor-pointer"
              >
                {isShaking ? (
                  <>
                    <RotateCw className="h-4 w-4 animate-spin" />
                    <span>กำลังเขย่ากระบอก...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    <span>เขย่าเซียมซี (ฟรี!)</span>
                  </>
                )}
              </button>
            </div>

            {/* Resulting Esiimsi Parchment */}
            {esiimsiResult ? (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="w-full max-w-md rounded-2xl bg-gradient-to-b from-[#2B1B10] via-[#1F130B] to-[#120B06] p-6 border-2 border-[#EAC272] shadow-2xl space-y-4"
              >
                <div className="flex items-center justify-between border-b border-[#EAC272]/30 pb-3">
                  <div>
                    <span className="text-xs text-[#EAC272] font-semibold">ใบเซียมซีที่</span>
                    <h4 className="font-serif-display text-2xl text-[#FAE9CA]">
                      เบอร์ {esiimsiResult.number}
                    </h4>
                  </div>
                  <span
                    className="rounded-full px-3 py-1 text-xs font-bold border"
                    style={{
                      backgroundColor: `${esiimsiResult.gradeColor}20`,
                      borderColor: esiimsiResult.gradeColor,
                      color: esiimsiResult.gradeColor,
                    }}
                  >
                    {esiimsiResult.grade}
                  </span>
                </div>

                {/* Poem */}
                <div className="bg-[#110918]/60 rounded-xl p-3 border border-[#EAC272]/20 text-center space-y-1">
                  {esiimsiResult.poem.map((line, idx) => (
                    <p key={idx} className="font-serif-display text-xs text-[#FFDE9E]">
                      {line}
                    </p>
                  ))}
                </div>

                {/* Explanation */}
                <div className="space-y-1 text-xs text-[#FAE9CA]/90">
                  <strong className="text-[#EAC272]">ความหมาย: </strong>
                  <span>{esiimsiResult.meaning}</span>
                </div>

                {/* Sassy Roast */}
                <div className="rounded-xl bg-[#842C71]/30 p-3 border border-[#EAC272]/25 text-xs text-[#FAE9CA]">
                  <strong className="text-[#FFDE9E]">🐾 คำเตือนสติแม่หมอเหมียว: </strong>
                  <span className="italic">"{esiimsiResult.sassyCatAdvice}"</span>
                </div>

                {/* Lucky details */}
                <div className="flex items-center justify-between pt-2 border-t border-[#EAC272]/20 text-xs">
                  <span className="text-[#C9B49D]">เลขเด็ด: <strong className="text-[#AEFFE4]">{esiimsiResult.luckyNumbers}</strong></span>
                  <span className="text-[#C9B49D]">ทิศมงคล: <strong className="text-[#EAC272]">{esiimsiResult.powerDirection}</strong></span>
                </div>

                <div className="pt-1 flex items-center justify-end">
                  <button
                    onClick={() => speakThaiText(`ใบเซียมซีที่ ${esiimsiResult.number} ${esiimsiResult.poem.join(' ')} ${esiimsiResult.meaning} คำเตือนสติ ${esiimsiResult.sassyCatAdvice}`)}
                    className="flex items-center gap-1.5 text-xs text-[#EAC272] hover:text-[#FAE9CA]"
                  >
                    <Volume2 className="h-3.5 w-3.5" />
                    <span>ฟังเสียงอ่านเซียมซี</span>
                  </button>
                </div>
              </motion.div>
            ) : (
              <div className="w-full max-w-md rounded-2xl border-2 border-dashed border-[rgba(242,203,128,0.2)] p-8 text-center text-xs text-[#C9B49D]">
                <span className="text-3xl block mb-2">🎋</span>
                แตะปุ่ม "เขย่าเซียมซี" เพื่อเริ่มเสี่ยงทายคำทำนายโบราณ
              </div>
            )}
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* GAME 3: PSYCHIC ESP TRIAL */}
      {/* ==================================================== */}
      {activeTab === 'esp' && (
        <div className="velvet-card rounded-[28px] p-6 sm:p-8 flex flex-col items-center justify-center space-y-6">
          <div className="text-center max-w-md">
            <h3 className="font-serif-display text-2xl text-[#FAE9CA]">
              ทดสอบพลังจิตทายไพ่ (Psychic ESP Intuition)
            </h3>
            <p className="text-xs text-[#C9B49D] mt-1">
              จักรวาลซ่อน "แมวดำทองคำ (Golden Cat of Fortune)" ไว้ใต้ไพ่ 1 ใน 4 ใบนี้... หลับตา สัมผัสพลังงาน แล้วเลือกไพ่ที่สัญชาตญาณคุณบอก!
            </p>
          </div>

          {/* 4 Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 my-2">
            {[0, 1, 2, 3].map((cardIdx) => {
              const isPicked = pickedCardIndex === cardIdx;
              const isWinner = cardIdx === winningCardIndex;

              return (
                <div
                  key={cardIdx}
                  onClick={() => handlePickEspCard(cardIdx)}
                  className="flex flex-col items-center space-y-2"
                >
                  <CosmicCardRenderer
                    card={{
                      nameTh: isWinner ? 'แมวดำทองคำแห่งโชค' : 'ไพ่แห่งภาพลวงตา',
                      name: isWinner ? 'The Golden Fortune Cat' : 'The Illusion',
                      imageSymbol: isWinner ? '👑🐾' : '🌑',
                      element: isWinner ? 'Cosmos' : 'Shadow',
                    }}
                    isFlipped={isEspRevealed}
                    backTheme={cardSettings.backTheme}
                    frontTheme={cardSettings.frontTheme}
                    size="md"
                    showGlow={isPicked}
                    badgeText={isPicked ? 'คุณเลือกใบนี้' : undefined}
                  />

                  <span className="text-xs font-semibold text-[#C9B49D]">
                    ไพ่ใบที่ {cardIdx + 1}
                  </span>
                </div>
              );
            })}
          </div>

          {/* ESP Result Banner */}
          {isEspRevealed && (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-full max-w-md rounded-2xl bg-[#1E0E2A] p-4 border border-[#EAC272] text-center space-y-2 shadow-xl"
            >
              <h4 className="font-serif-display text-lg text-[#FAE9CA]">
                {pickedCardIndex === winningCardIndex
                  ? '🎉 ถูกต้องแม่นยำ! พลังจิตของคุณคมกริบ 100%'
                  : '🐾 เกือบถูกแล้ว! ซ่อนอยู่ที่ใบอื่น'}
              </h4>
              <p className="text-xs text-[#EAC272]">
                {pickedCardIndex === winningCardIndex
                  ? 'รับรางวัลพลังจิต 30 เหรียญเข้ากระเป๋าเรียบร้อย'
                  : 'ได้รับ 5 เหรียญปลอบใจ ฝึกฝนสัญชาตญาณบ่อยๆ แล้วจะแม่นยำขึ้น!'}
              </p>
              <button
                onClick={handleResetEsp}
                className="btn-gilded mt-2 px-5 py-2 text-xs font-bold text-[#110918]"
              >
                เล่นรอบใหม่ (ฝึกสมาธิ)
              </button>
            </motion.div>
          )}
        </div>
      )}
    </div>
  );
};
