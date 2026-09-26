import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  Flame, 
  Compass, 
  RotateCcw, 
  HelpCircle, 
  Send, 
  CheckCircle2, 
  Layers,
  Activity,
  Calendar,
  Clock
} from 'lucide-react';
import { FIVE_ELEMENTS, CHINESE_ZODIACS, I_CHING_HEXAGRAMS } from '../data/chineseData';
import { ChineseZodiac, IChingHexagram, SassLevel, ReadingDepthTier, READING_DEPTH_TIERS, FortuneReading } from '../types';
import { playCatPurrSound, playMysticChimeSound } from '../utils/speechHelper';
import { ReadingDepthSelector } from './ReadingDepthSelector';
import { FateSynchronicityBanner } from './FateSynchronicityBanner';

interface ChineseFortuneViewProps {
  onAnalyzeReading: (data: {
    discipline: 'chinese';
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

export const ChineseFortuneView: React.FC<ChineseFortuneViewProps> = ({
  onAnalyzeReading,
  isLoading,
  sassLevel,
  userCoins = 50,
  onOpenTopUp = () => {},
  readings,
  onOpenSynchronicityModal,
}) => {
  // Mode: 1. Bazi & 5 Elements, 2. I-Ching Hexagram Coin Toss
  const [subMode, setSubMode] = useState<'bazi' | 'iching'>('bazi');
  const [selectedDepth, setSelectedDepth] = useState<ReadingDepthTier>('standard');
  
  // Bazi State
  const [birthYear, setBirthYear] = useState<number>(1998);
  const [birthMonth, setBirthMonth] = useState<number>(6);
  const [birthDay, setBirthDay] = useState<number>(15);
  const [birthHour, setBirthHour] = useState<string>('09:30');
  const [gender, setGender] = useState<'female' | 'male' | 'other'>('female');
  const [selectedZodiac, setSelectedZodiac] = useState<ChineseZodiac>(CHINESE_ZODIACS[2]); // Tiger default
  const [userQuestion, setUserQuestion] = useState<string>('ดวงการงาน การเงิน และคนที่จะเข้ามาในปีนี้เป็นยังไง');
  const [selectedTopic, setSelectedTopic] = useState<string>('การงานและการเงิน');

  // I-Ching Coin Toss State
  const [tossLines, setTossLines] = useState<number[]>([]); // 6 lines (0 = Yin broken, 1 = Yang solid)
  const [isTossing, setIsTossing] = useState<boolean>(false);
  const [coinsResult, setCoinsResult] = useState<number[]>([1, 1, 1]); // 3 coins (0 or 1)
  const [matchedHexagram, setMatchedHexagram] = useState<IChingHexagram | null>(null);

  // Quick calculate Chinese Zodiac by year
  const handleYearChange = (year: number) => {
    setBirthYear(year);
    // Zodiac cycle based on 1900 = Rat
    const index = (year - 4) % 12;
    const zodiacIndex = (index + 12) % 12;
    if (CHINESE_ZODIACS[zodiacIndex]) {
      setSelectedZodiac(CHINESE_ZODIACS[zodiacIndex]);
    }
  };

  // Toss 3 I-Ching Coins
  const handleTossCoins = () => {
    if (tossLines.length >= 6) return;
    playMysticChimeSound('iching');
    setIsTossing(true);

    setTimeout(() => {
      // 3 coins flip: 1 is Heads (Yang=3), 0 is Tails (Yin=2)
      const c1 = Math.random() > 0.5 ? 1 : 0;
      const c2 = Math.random() > 0.5 ? 1 : 0;
      const c3 = Math.random() > 0.5 ? 1 : 0;
      setCoinsResult([c1, c2, c3]);

      // Sum: if 2 or 3 Heads -> Yang line (1), else Yin line (0)
      const sum = c1 + c2 + c3;
      const newLine = sum >= 2 ? 1 : 0;
      const updatedLines = [...tossLines, newLine];
      setTossLines(updatedLines);
      setIsTossing(false);

      if (updatedLines.length === 6) {
        // Find matching hexagram or pick closest
        const binaryStr = updatedLines.join('');
        const found = I_CHING_HEXAGRAMS.find(h => h.binary === binaryStr) || I_CHING_HEXAGRAMS[0];
        setMatchedHexagram(found);
      }
    }, 600);
  };

  const handleResetIChing = () => {
    setTossLines([]);
    setMatchedHexagram(null);
  };

  // Submit for Deep Dive Sassy Analysis
  const handleSubmitBazi = () => {
    playCatPurrSound();
    const calculatedElement = FIVE_ELEMENTS[birthYear % 5];
    const items = {
      zodiac: selectedZodiac.nameTh,
      element: calculatedElement.nameTh,
      birthInfo: `${birthDay}/${birthMonth}/${birthYear} เวลา ${birthHour}`,
      gender: gender,
      personality: selectedZodiac.personality,
      blindspot: selectedZodiac.psychologicalBlindspot,
    };

    onAnalyzeReading({
      discipline: 'chinese',
      topic: selectedTopic,
      question: userQuestion,
      itemsSelected: items,
      sassyLevel: sassLevel,
      depthTier: selectedDepth,
    });
  };

  const handleSubmitIChing = () => {
    if (!matchedHexagram) return;
    playCatPurrSound();
    const items = {
      hexagramName: matchedHexagram.nameTh,
      chineseName: matchedHexagram.chineseName,
      number: matchedHexagram.number,
      judgment: matchedHexagram.judgment,
      binary: matchedHexagram.binary,
      psychologicalFocus: matchedHexagram.psychologicalFocus,
    };

    onAnalyzeReading({
      discipline: 'chinese',
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
          currentDisciplineName="ศาสตร์จีนโบราณ ปาจื่อ & อี้จิง"
        />
      )}

      {/* Submode Switcher: Bazi vs I-Ching */}
      <div className="velvet-card flex flex-wrap items-center justify-between gap-4 rounded-[28px] p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#361A4A] border border-[rgba(242,203,128,0.3)] text-[#EAC272] text-2xl shadow-md">
            ☯️
          </div>
          <div>
            <h2 className="font-serif-display text-2xl font-normal text-[#FAE9CA]">ศาสตร์จีนโบราณ (Chinese Metaphysics)</h2>
            <p className="text-xs text-[#C9B49D]">
              วิเคราะห์สมดุลธาตุปาจื่อ (Bazi) และคัมภีร์อี้จิงเปลี่ยนชีวิต (I-Ching Hexagram)
            </p>
          </div>
        </div>

        <div className="flex items-center rounded-full bg-[#110918] p-1 border border-[rgba(242,203,128,0.15)]">
          <button
            id="btn-submode-bazi"
            onClick={() => setSubMode('bazi')}
            className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all ${
              subMode === 'bazi'
                ? 'bg-gradient-to-r from-[#EAC272] to-[#D4A84D] text-[#110918] font-bold shadow-md'
                : 'text-[#C9B49D] hover:text-[#FAE9CA]'
            }`}
          >
            ปาจื่อ 5 ธาตุ & นักษัตร
          </button>
          <button
            id="btn-submode-iching"
            onClick={() => setSubMode('iching')}
            className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all ${
              subMode === 'iching'
                ? 'bg-gradient-to-r from-[#EAC272] to-[#D4A84D] text-[#110918] font-bold shadow-md'
                : 'text-[#C9B49D] hover:text-[#FAE9CA]'
            }`}
          >
            โยนเหรียญเสี่ยงทายอี้จิง (64 กว้า)
          </button>
        </div>
      </div>

      {/* Mode 1: Bazi & Five Elements View */}
      {subMode === 'bazi' && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          
          {/* Left Column: Input Form */}
          <div className="velvet-card rounded-[28px] p-6 space-y-5 lg:col-span-7">
            <div className="flex items-center gap-2 border-b border-[rgba(242,203,128,0.14)] pb-3">
              <Calendar className="h-4 w-4 text-[#EAC272]" />
              <h3 className="font-serif-display text-lg text-[#FAE9CA]">
                1. กรอกข้อมูลวันเกิดเพื่อถอดรหัสดิถีธาตุ
              </h3>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div>
                <label className="text-[11px] font-medium text-[#C9B49D]">ปีเกิด (ค.ศ.)</label>
                <input
                  id="input-birth-year"
                  type="number"
                  min="1940"
                  max="2030"
                  value={birthYear}
                  onChange={(e) => handleYearChange(parseInt(e.target.value) || 2000)}
                  className="mt-1 w-full rounded-xl bg-[#110918] border border-[rgba(242,203,128,0.18)] px-3 py-2 text-sm text-[#FAE9CA] focus:border-[#EAC272] focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-medium text-[#C9B49D]">เดือนเกิด</label>
                <select
                  id="input-birth-month"
                  value={birthMonth}
                  onChange={(e) => setBirthMonth(parseInt(e.target.value))}
                  className="mt-1 w-full rounded-xl bg-[#110918] border border-[rgba(242,203,128,0.18)] px-3 py-2 text-sm text-[#FAE9CA] focus:border-[#EAC272] focus:outline-none"
                >
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                    <option key={m} value={m} className="bg-[#110918] text-[#FAE9CA]">เดือน {m}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-medium text-[#C9B49D]">วันที่</label>
                <input
                  id="input-birth-day"
                  type="number"
                  min="1"
                  max="31"
                  value={birthDay}
                  onChange={(e) => setBirthDay(parseInt(e.target.value) || 1)}
                  className="mt-1 w-full rounded-xl bg-[#110918] border border-[rgba(242,203,128,0.18)] px-3 py-2 text-sm text-[#FAE9CA] focus:border-[#EAC272] focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-medium text-[#C9B49D]">เวลาตกฟาก</label>
                <input
                  id="input-birth-time"
                  type="time"
                  value={birthHour}
                  onChange={(e) => setBirthHour(e.target.value)}
                  className="mt-1 w-full rounded-xl bg-[#110918] border border-[rgba(242,203,128,0.18)] px-3 py-2 text-sm text-[#FAE9CA] focus:border-[#EAC272] focus:outline-none"
                />
              </div>
            </div>

            {/* Zodiac Selector */}
            <div>
              <label className="text-[11px] font-medium text-[#EAC272]">ปีนักษัตรที่ตรวจพบ:</label>
              <div className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-6">
                {CHINESE_ZODIACS.map((z) => {
                  const isSel = selectedZodiac.id === z.id;
                  return (
                    <button
                      key={z.id}
                      type="button"
                      onClick={() => setSelectedZodiac(z)}
                      className={`flex flex-col items-center rounded-xl p-2 transition-all ${
                        isSel
                          ? 'bg-[#842C71]/40 border border-[#EAC272] text-[#FAE9CA] shadow-md'
                          : 'bg-[#110918] border border-[rgba(242,203,128,0.14)] text-[#C9B49D] hover:border-[rgba(242,203,128,0.3)]'
                      }`}
                    >
                      <span className="text-xl">{z.symbol}</span>
                      <span className="mt-1 text-[11px] font-bold">{z.nameTh.split(' ')[0]}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Question & Topic */}
            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-medium text-[#EAC272]">หมวดหมู่ที่ต้องการดู:</label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {['การงานและการเงิน', 'ความรักและความสัมพันธ์', 'จุดอ่อนจิตวิทยา & สุขภาพ', 'โอกาสพลิกชีวิตปีนี้'].map((topic) => (
                    <button
                      key={topic}
                      type="button"
                      onClick={() => setSelectedTopic(topic)}
                      className={`rounded-full px-3.5 py-1 text-xs font-medium transition-all ${
                        selectedTopic === topic
                          ? 'bg-[#EAC272] text-[#110918] font-bold shadow-md'
                          : 'bg-[#110918] text-[#C9B49D] border border-[rgba(242,203,128,0.15)] hover:text-[#FAE9CA]'
                      }`}
                    >
                      {topic}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[11px] font-medium text-[#EAC272]">คำถามหรือความกังวลใจในใจ:</label>
                <textarea
                  id="input-user-question"
                  rows={2}
                  value={userQuestion}
                  onChange={(e) => setUserQuestion(e.target.value)}
                  placeholder="เช่น ทำไมงานช่วงนี้ติดขัด, คนที่คุยอยู่มีโอกาสพัฒนาไหม..."
                  className="mt-2 w-full rounded-2xl bg-[#110918] border border-[rgba(242,203,128,0.18)] px-4 py-2.5 text-sm text-[#FAE9CA] placeholder:text-[#C9B49D]/40 focus:border-[#EAC272] focus:outline-none"
                />
              </div>
            </div>

            {/* Reading Depth Selector for Bazi */}
            <div className="pt-2">
              <ReadingDepthSelector
                selectedDepth={selectedDepth}
                onSelectDepth={(d) => setSelectedDepth(d)}
                userCoins={userCoins}
                onOpenTopUp={onOpenTopUp}
                compact={true}
              />
            </div>

            <button
              id="btn-analyze-bazi"
              onClick={handleSubmitBazi}
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
                    ผ่าดวงจีนดิถีธาตุ ({READING_DEPTH_TIERS[selectedDepth].label} • ใช้ {READING_DEPTH_TIERS[selectedDepth].costCoins} เหรียญ)
                  </span>
                </>
              )}
            </button>
          </div>

          {/* Right Column: Dynamic Matrix & Sassy Preview */}
          <div className="space-y-4 lg:col-span-5">
            {/* 5 Elements Overview Card */}
            <div className="velvet-card rounded-[28px] p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-[rgba(242,203,128,0.14)] pb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-[#EAC272]">
                  ลักษณะเด่นนักษัตร {selectedZodiac.nameTh}
                </span>
                <span className="rounded-full bg-[#842C71]/40 px-2.5 py-0.5 text-xs text-[#F2CB80] border border-[rgba(242,203,128,0.2)]">
                  {selectedZodiac.yinYang} • {selectedZodiac.fixedElement}
                </span>
              </div>

              <div className="mt-4 space-y-3 text-sm">
                <div>
                  <h4 className="text-xs font-semibold text-[#EAC272]">อุปนิสัยตามธรรมชาติ:</h4>
                  <p className="mt-1 text-[#FAE9CA]/90">{selectedZodiac.personality}</p>
                </div>

                <div className="rounded-2xl bg-[#B3261E]/20 p-3.5 border border-[#B3261E]/40">
                  <h4 className="text-xs font-bold text-[#FFA4A4]">🧠 จุดบอดจิตวิทยา (Psychological Blindspot):</h4>
                  <p className="mt-1 text-xs text-[#FFA4A4]/90">{selectedZodiac.psychologicalBlindspot}</p>
                </div>

                <div className="rounded-2xl bg-[#842C71]/25 p-3.5 border border-[rgba(242,203,128,0.15)]">
                  <h4 className="text-xs font-bold text-[#EAC272]">🐾 ความจริงจากแม่หมอเหมียว:</h4>
                  <p className="mt-1 text-xs italic text-[#FAE9CA]/90 leading-relaxed">
                    "{selectedZodiac.sassyCritique}"
                  </p>
                </div>
              </div>
            </div>

            {/* 5 Elements Interactive Chart */}
            <div className="velvet-card rounded-[28px] p-5">
              <h4 className="text-xs font-bold text-[#FAE9CA] mb-3 flex items-center gap-1.5">
                <Compass className="h-3.5 w-3.5 text-[#EAC272]" />
                วงจรธาตุทั้ง 5 ในจักรวาลจีน (Five Elements Wheel)
              </h4>
              <div className="grid grid-cols-5 gap-1.5 text-center">
                {FIVE_ELEMENTS.map((el, i) => (
                  <div key={i} className="rounded-xl p-2 bg-[#110918] border border-[rgba(242,203,128,0.15)]">
                    <div className="text-lg">{el.symbol}</div>
                    <div className="text-[10px] font-bold mt-1 text-[#FAE9CA]">{el.nameEn}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mode 2: I-Ching 64 Hexagram Coin Toss */}
      {subMode === 'iching' && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Coin Toss Stage */}
          <div className="velvet-card rounded-[28px] p-6 space-y-5 lg:col-span-6">
            <div className="flex items-center justify-between border-b border-[rgba(242,203,128,0.14)] pb-3">
              <div>
                <h3 className="font-serif-display text-lg text-[#FAE9CA]">
                  โยนเหรียญทองโบราณ 3 เหรียญ (โยน {tossLines.length}/6 ครั้ง)
                </h3>
                <p className="text-[11px] text-[#C9B49D]">
                  หยาง (เส้นทึบ ⚊) คือพลังบวกและการลงมือทำ | หยิน (เส้นขาด ⚋) คือการรับฟังและตั้งรับ
                </p>
              </div>
              <button
                id="btn-reset-iching"
                onClick={handleResetIChing}
                className="flex items-center gap-1 text-xs text-[#C9B49D] hover:text-[#FAE9CA]"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                รีเซ็ต
              </button>
            </div>

            {/* Coins Animation Stage */}
            <div className="flex min-h-[160px] flex-col items-center justify-center rounded-2xl bg-[#110918] p-6 border border-[rgba(242,203,128,0.2)]">
              <div className="flex gap-4">
                {coinsResult.map((c, idx) => (
                  <motion.div
                    key={idx}
                    animate={isTossing ? { rotateY: [0, 720], y: [-20, 0] } : {}}
                    transition={{ duration: 0.5, delay: idx * 0.1 }}
                    className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-tr from-[#EAC272] via-[#F2CB80] to-[#D4A84D] text-[#110918] shadow-lg font-bold border border-[#FAE9CA]"
                  >
                    <span className="text-xl">{c === 1 ? '陽' : '陰'}</span>
                  </motion.div>
                ))}
              </div>

              <div className="mt-4 text-xs font-semibold text-[#EAC272]">
                {isTossing ? 'กำลังเสี่ยงทายเส้นกว้า...' : `ผลการโยนครั้งล่าสุด: ${coinsResult.map(c => c === 1 ? 'หยาง' : 'หยิน').join(' • ')}`}
              </div>
            </div>

            {/* Toss Button or Analyze Button */}
            {tossLines.length < 6 ? (
              <button
                id="btn-toss-coin"
                onClick={handleTossCoins}
                disabled={isTossing}
                className="btn-gilded w-full py-3.5 text-sm font-bold text-[#110918] cursor-pointer"
              >
                {isTossing ? 'กำลังทอดเหรียญ...' : `🐾 โยนเหรียญสร้างเส้นที่ ${tossLines.length + 1} จาก 6`}
              </button>
            ) : (
              <div className="space-y-3">
                <ReadingDepthSelector
                  selectedDepth={selectedDepth}
                  onSelectDepth={(d) => setSelectedDepth(d)}
                  userCoins={userCoins}
                  onOpenTopUp={onOpenTopUp}
                  compact={true}
                />

                <button
                  id="btn-analyze-iching"
                  onClick={handleSubmitIChing}
                  disabled={isLoading || userCoins < READING_DEPTH_TIERS[selectedDepth].costCoins}
                  className={`w-full py-3.5 text-sm font-bold rounded-2xl shadow-xl transition-all cursor-pointer ${
                    userCoins < READING_DEPTH_TIERS[selectedDepth].costCoins
                      ? 'bg-stone-800 text-stone-500 cursor-not-allowed border border-stone-700'
                      : 'btn-gilded text-[#110918]'
                  }`}
                >
                  {isLoading ? 'กำลังประมวลผลคำทำนาย...' : `✨ แปลผลอี้จิง (${READING_DEPTH_TIERS[selectedDepth].label} • ใช้ ${READING_DEPTH_TIERS[selectedDepth].costCoins} เหรียญ)`}
                </button>
              </div>
            )}
          </div>

          {/* Hexagram Lines Display & Meaning */}
          <div className="velvet-card rounded-[28px] p-6 space-y-4 lg:col-span-6">
            <h3 className="font-serif-display text-lg text-[#FAE9CA] border-b border-[rgba(242,203,128,0.14)] pb-3">
              เส้นกว้าที่ปรากฏ (The 6 Lines of Hexagram)
            </h3>

            {/* 6 lines stack (from bottom to top) */}
            <div className="flex flex-col-reverse gap-2 rounded-2xl bg-[#110918] p-4 border border-[rgba(242,203,128,0.15)] min-h-[180px] justify-center items-center">
              {Array.from({ length: 6 }).map((_, i) => {
                const lineVal = tossLines[i];
                if (lineVal === undefined) {
                  return (
                    <div key={i} className="h-3 w-48 rounded bg-[#1E0E2A]/50 border border-dashed border-[rgba(242,203,128,0.15)]" />
                  );
                }
                if (lineVal === 1) {
                  // Yang Solid Line
                  return (
                    <motion.div
                      key={i}
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      className="h-3 w-48 rounded bg-[#EAC272] shadow-sm shadow-[#EAC272]/50"
                    />
                  );
                }
                // Yin Broken Line
                return (
                  <motion.div
                    key={i}
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    className="flex h-3 w-48 gap-3"
                  >
                    <div className="h-3 w-1/2 rounded bg-[#842C71] shadow-sm" />
                    <div className="h-3 w-1/2 rounded bg-[#842C71] shadow-sm" />
                  </motion.div>
                );
              })}
            </div>

            {/* Matched Hexagram Info */}
            {matchedHexagram && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-3 rounded-2xl bg-gradient-to-br from-[#24102E] to-[#110918] p-5 border border-[rgba(242,203,128,0.25)]"
              >
                <div className="flex items-center justify-between">
                  <span className="font-serif-display text-lg text-[#EAC272]">
                    กว้าที่ {matchedHexagram.number}: {matchedHexagram.nameTh}
                  </span>
                  <span className="text-xl text-[#FAE9CA] font-serif">{matchedHexagram.chineseName}</span>
                </div>
                <p className="text-xs text-[#C9B49D] leading-relaxed">
                  <strong className="text-[#FAE9CA]">คำตัดสินโบราณ: </strong>
                  {matchedHexagram.judgment}
                </p>
                <div className="rounded-xl bg-[#842C71]/25 p-3 border border-[rgba(242,203,128,0.15)] text-xs text-[#FAE9CA]">
                  <strong className="text-[#EAC272]">🐾 คำแนะนำแม่หมอเหมียว: </strong>
                  "{matchedHexagram.sassyRealWorldAdvice}"
                </div>
              </motion.div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
