import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  Eye,
  EyeOff,
  RefreshCw,
  Lightbulb,
  Flame,
  Compass,
  Brain,
  Share2,
  Check,
  Volume2,
  VolumeX,
  Lock,
  Unlock,
  Coins
} from 'lucide-react';
import { playMysticChimeSound, playCatPurrSound, speakThaiText, stopSpeaking } from '../utils/speechHelper';

interface QuickFortuneWidgetProps {
  onShowToast: (msg: string) => void;
  soundEnabled?: boolean;
  onOpenReadingModal?: () => void;
}

interface QuickAphorismItem {
  id: string;
  aphorismTh: string;
  aphorismEn: string;
  category: 'reality_check' | 'mindset' | 'love' | 'wealth' | 'cosmic';
  categoryLabel: string;
  categoryColor: string;
  catVibe: string;
  hiddenAdvice: {
    title: string;
    coreTruth: string;
    actionableStep: string;
    psychologicalBias: string;
    sassyRoast: string;
    luckyCharm: string;
  };
}

const QUICK_APHORISMS: QuickAphorismItem[] = [
  {
    id: 'qf-1',
    aphorismTh: '“ดวงดาวไม่ได้กุมชะตาแก... ความผัดวันประกันพรุ่งต่างหากที่กำลังขโมยอนาคตแกไปทีละนาที”',
    aphorismEn: 'The stars don’t dictate your fate; procrastination is what quietly steals your future.',
    category: 'reality_check',
    categoryLabel: 'ฟาดสติทันควัน ⚡',
    categoryColor: '#EAC272',
    catVibe: 'แมวดำจ้องตาไม่กะพริบ 🐾',
    hiddenAdvice: {
      title: 'ปลดล็อกกับดักการผัดวันประกันพรุ่ง (Instant Action Mode)',
      coreTruth: 'แกไม่ได้ขาดแรงบันดาลใจ แกแค่กลัวผลลัพธ์จะไม่สมบูรณ์แบบจนไม่กล้าเริ่มก้าวแรก',
      actionableStep: 'หยิบงานที่ดองไว้มาทำแค่ 3 นาทีแรกตอนนี้ทันที ถ้าครบ 3 นาทีแล้วอยากหยุดค่อยหยุด (แต่ส่วนใหญ่สมองจะเริ่มไหลต่อได้เอง)',
      psychologicalBias: 'Perfectionism Paralysis & Present Bias (สมองเลือกความสบายทันทีมากกว่าความสำเร็จในอนาคต)',
      sassyRoast: 'ตื่นค่ะสาว! เลิกนอนอืดบนฟูกแล้วบ่นว่าทำไมคนอื่นเค้าไปไกล ลุกมาล้างหน้าแล้วลงมือทำเดี๋ยวนี้!',
      luckyCharm: 'ดื่มน้ำเย็นจัด 1 แก้วเต็มๆ แล้วเปิดเพลงจังหวะเร็วเพื่อกระตุ้นโดปามีน'
    }
  },
  {
    id: 'qf-2',
    aphorismTh: '“เค้าไม่ได้ไม่ว่าง... เค้าแค่ไม่ได้อยากคุยกับแกมากพอ หยุดคิดเข้าข้างตัวเองแล้วเอาเวลากลับมารักตัวเองเถอะ”',
    aphorismEn: 'They aren’t too busy; they just don’t prioritize you. Stop romanticizing lukewarm efforts.',
    category: 'love',
    categoryLabel: 'หัวใจตาสว่าง 💔',
    categoryColor: '#F472B6',
    catVibe: 'แมวเมินใส่อาหารที่เย็นชืด 😼',
    hiddenAdvice: {
      title: 'ตัดวงจรความสัมพันธ์คลุมเครือ (Warm-hearted Boundary)',
      coreTruth: 'การพยายามวิ่งตามคนที่ไม่ก้าวมาหาแกครึ่งทาง มีแต่จะทำให้คุณค่าของแกดูไร้ราคาในสายตาเค้า',
      actionableStep: 'วางมือถือคว่ำหน้าลง 3 ชั่วโมงเต็ม เลิกส่งข้อความตาม และไม่แอบเข้าไปส่องสตอรี่เค้าซ้ำๆ ในวันนี้',
      psychologicalBias: 'Intermittent Reinforcement (เสพติดการตอบรับแบบกะปริบกะปรอยเหมือนเล่นสล็อตแมชชีน)',
      sassyRoast: 'เค้าตอบแชทวันละ 2 คำ แกก็แต่งงานในมโนไป 3 ภพแล้ว ดึงสติค่ะ! หน้าตาแกคู่ควรกับคนที่กระตือรือร้นจะคุยย่ะ!',
      luckyCharm: 'ทาลิปสติกสีแดงหรือชมพูเข้ม ส่องกระจกแล้วยิ้มสวยๆ ให้ตัวเอง 1 ครั้ง'
    }
  },
  {
    id: 'qf-3',
    aphorismTh: '“เงินไม่ได้ลอยมาจากการนั่งภาวนา... แต่มันจะวิ่งเข้าหาคนที่แก้ปัญหาให้คนอื่นได้เก่งที่สุด”',
    aphorismEn: 'Wealth doesn’t come from wishful thinking; it flows to those who solve real problems.',
    category: 'wealth',
    categoryLabel: 'กระเป๋าตังค์เปิดรับ 🪙',
    categoryColor: '#34D399',
    catVibe: 'แมวกวักเงินทองแท้ 🐾✨',
    hiddenAdvice: {
      title: 'ตั้งเสาอากาศเหนี่ยวนำโชคลาภและการเงิน (Value Creation Protocol)',
      coreTruth: 'รายได้คือกระจกสะท้อนคุณค่าของทักษะที่แกมอบให้กับตลาด ไม่ใช่จำนวนชั่วโมงที่แกนั่งบ่นเหนื่อย',
      actionableStep: 'สำรวจ 1 ทักษะที่แกทำได้ดีกว่าคนรอบตัว แล้วลองคิดวิธีแพ็กเกจมันเป็นบริการหรือผลงานที่ช่วยประหยัดเวลาให้คนอื่น',
      psychologicalBias: 'Lottery Mindset (หวังพึ่งโชคชะตาแทนที่จะสร้างคุณค่าที่ควบคุมได้)',
      sassyRoast: 'ถ้าใช้เงินเก่งเท่าที่บ่นว่าจน ป่านนี้แกคงเป็นเจ้าสัวไปแล้วจ้ะสาว! เลิกช้อปปิ้งตอนตีสองก่อนเถอะ!',
      luckyCharm: 'จัดระเบียบกระเป๋าสตางค์ เอาใบเสร็จเก่าๆ ออก ทิ้งไว้เฉพาะแบงก์เรียงหน้าให้สวยงาม'
    }
  },
  {
    id: 'qf-4',
    aphorismTh: '“อย่าลดมาตรฐานตัวเองลงเพียงเพราะกลัวว่าจะต้องเดินคนเดียวในป่าลึก”',
    aphorismEn: 'Never lower your standards just because you fear walking alone in the dark.',
    category: 'mindset',
    categoryLabel: 'พลังแห่งขอบเขต 🛡️',
    categoryColor: '#A78BFA',
    catVibe: 'เสือดำเจ้าป่าผู้สง่างาม 🐆',
    hiddenAdvice: {
      title: 'กำแพงป้องกันพลังงานลบ (Unhakeable Self-Respect)',
      coreTruth: 'คนที่ไม่เคารพเวลาและพื้นที่ของคุณ จะไม่มีวันเริ่มเคารพคุณหากคุณไม่กล้าเอ่ยคำปฏิเสธ',
      actionableStep: 'ฝึกปฏิเสธคำขอ 1 อย่างที่คุณไม่อยากทำจริงๆ ในวันนี้ด้วยประโยคสั้นๆ: "ขอโทษทีนะ ช่วงนี้เราไม่สะดวกเลยจ้า" โดยไม่ต้องอธิบายเหตุผลยาว',
      psychologicalBias: 'People Pleasing & Fear of Social Rejection',
      sassyRoast: 'แกเกิดมาเป็นมนุษย์ ไม่ใช่พรมเช็ดเท้าหน้าห้องใครนะจ๊ะ หัดพูดคำว่า "ไม่" ให้เป็นเสน่ห์ส่วนตัวบ้าง!',
      luckyCharm: 'สวมแหวนหรือเครื่องประดับโลหะที่นิ้วชี้ข้างขวาเพื่อเสริมอำนาจการตัดสินใจ'
    }
  },
  {
    id: 'qf-5',
    aphorismTh: '“ทุกสิ่งที่เกิดขึ้นไม่ได้มาทำลายแก... มันมาเพื่อลอกคราบเอาความไร้เดียงสาออก แล้วติดเขี้ยวเล็บให้แกต่างหาก”',
    aphorismEn: 'Nothing happens to destroy you; it happens to shed your naivety and sharpen your claws.',
    category: 'cosmic',
    categoryLabel: 'พลังจักรวาลผลัดใบ 🌌',
    categoryColor: '#38BDF8',
    catVibe: 'แมวนักปีนเขาผู้ไม่เคยยอมตกลงมา 🐾⛰️',
    hiddenAdvice: {
      title: 'เปลี่ยนวิกฤตให้เป็นอาวุธทางจิตวิญญาณ (Post-Traumatic Growth)',
      coreTruth: 'ความเจ็บปวดในอดีตคือหลักสูตรเร่งรัดที่เตรียมแกให้พร้อมสำหรับบทบาทผู้นำในชีวิตตัวเอง',
      actionableStep: 'เขียน 1 บทเรียนราคาแพงที่สุดจากปีที่ผ่านมาลงบนกระดาษ แล้วเขียนกำกับว่า "นี่คือค่าหน่วยกิตความฉลาดที่ฉันจ่ายไปแล้ว"',
      psychologicalBias: 'Catastrophizing (จินตนาการว่าความล้มเหลวครั้งเดียวคือจุดจบของชีวิต)',
      sassyRoast: 'ล้มแล้วก็นั่งพักได้แต่อย่านอนแช่ในโคลนแล้วถ่ายรูปลงสตอรี่เรียกร้องความสงสารนะแก ลุกขึ้นมาปัดฝุ่นแล้วเชิดหน้าย่ะ!',
      luckyCharm: 'สูดหายใจลึกๆ 4 จังหวะ (Box Breathing: เข้า 4 กลั้น 4 ออก 4 พัก 4) 3 รอบเพื่อรีเซ็ตระบบประสาท'
    }
  }
];

export const QuickFortuneWidget: React.FC<QuickFortuneWidgetProps> = ({
  onShowToast,
  soundEnabled = true,
  onOpenReadingModal,
}) => {
  const [currentIndex, setCurrentIndex] = useState<number>(() => {
    // Generate deterministic initial index based on today's date
    const today = new Date().toISOString().slice(0, 10);
    let hash = 0;
    for (let i = 0; i < today.length; i++) {
      hash = (hash << 5) - hash + today.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash) % QUICK_APHORISMS.length;
  });

  const [isRevealed, setIsRevealed] = useState<boolean>(false);
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

  const currentItem = QUICK_APHORISMS[currentIndex];

  useEffect(() => {
    return () => {
      stopSpeaking();
    };
  }, []);

  // Shuffle to another random aphorism
  const handleShuffleAphorism = () => {
    if (soundEnabled) {
      playMysticChimeSound('card');
      playCatPurrSound();
    }
    setIsSpinning(true);
    setIsRevealed(false);
    stopSpeaking();
    setIsSpeaking(false);

    setTimeout(() => {
      let nextIndex = Math.floor(Math.random() * QUICK_APHORISMS.length);
      if (nextIndex === currentIndex) {
        nextIndex = (currentIndex + 1) % QUICK_APHORISMS.length;
      }
      setCurrentIndex(nextIndex);
      setIsSpinning(false);
      onShowToast('✨ หมุนรับคติเตือนสติบทใหม่แล้ว');
    }, 400);
  };

  // Toggle reveal
  const handleToggleReveal = () => {
    if (!isRevealed) {
      if (soundEnabled) {
        playMysticChimeSound('chime');
      }
      setIsRevealed(true);
      onShowToast('🐾 ปลดล็อกกล่องคำแนะนำลับฉบับเจาะลึกแล้ว!');
    } else {
      setIsRevealed(false);
      stopSpeaking();
      setIsSpeaking(false);
    }
  };

  // Copy aphorism & advice
  const handleCopy = () => {
    const text = `🐾 ดูดวงค่ะอีหญิง • Quick Fortune of the Day\n\n💬 คติเตือนสติ:\n${currentItem.aphorismTh}\n\n🔓 คำแนะนำลับ:\n${currentItem.hiddenAdvice.title}\n\n🎯 แก่นแท้: ${currentItem.hiddenAdvice.coreTruth}\n🐾 Action วันนี้: ${currentItem.hiddenAdvice.actionableStep}\n💅 แม่หมอฟาด: "${currentItem.hiddenAdvice.sassyRoast}"\n✨ สิ่งนำโชค: ${currentItem.hiddenAdvice.luckyCharm}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    if (soundEnabled) playMysticChimeSound('coin');
    onShowToast('📋 คัดลอกคติเตือนสติและคำแนะนำลับแล้ว');
    setTimeout(() => setCopied(false), 2000);
  };

  // Text-to-speech for aphorism
  const handleToggleSpeech = () => {
    if (isSpeaking) {
      stopSpeaking();
      setIsSpeaking(false);
      return;
    }

    const textToRead = `${currentItem.aphorismTh} ... คำแนะนำลับคือ ${currentItem.hiddenAdvice.title} ... ${currentItem.hiddenAdvice.coreTruth} ... คำเตือนจากแม่หมอคือ ${currentItem.hiddenAdvice.sassyRoast}`;

    speakThaiText(
      textToRead,
      () => setIsSpeaking(true),
      () => setIsSpeaking(false),
      () => setIsSpeaking(false)
    );
  };

  return (
    <div className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-[#200D2B] via-[#160820] to-[#0D0414] border border-[rgba(242,203,128,0.28)] shadow-2xl p-5 sm:p-7">

      {/* Background Ambience Shimmer */}
      <div
        className="absolute -top-16 -right-16 w-52 h-52 rounded-full opacity-25 blur-3xl pointer-events-none transition-colors duration-700"
        style={{ backgroundColor: currentItem.categoryColor }}
      />
      <div className="absolute -bottom-16 -left-16 w-44 h-44 rounded-full bg-[#842C71]/20 blur-3xl pointer-events-none" />

      {/* Top Controls Header */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 border-b border-[rgba(242,203,128,0.15)] pb-4">

        {/* Title & Badge */}
        <div className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#311442] border border-[rgba(242,203,128,0.3)] shadow-md text-xl">
            🔮
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-serif-display text-lg sm:text-xl font-normal text-[#FAE9CA]">
                Quick Fortune Widget
              </h3>
              <span
                className="text-[10px] font-bold px-2 py-0.5 rounded-full border shadow-sm"
                style={{
                  backgroundColor: `${currentItem.categoryColor}22`,
                  borderColor: `${currentItem.categoryColor}66`,
                  color: currentItem.categoryColor
                }}
              >
                {currentItem.categoryLabel}
              </span>
            </div>
            <p className="text-[11px] text-[#C9B49D]">
              คติประจำวันเรียกสติ • พร้อมกล่องคำแนะนำลับแบบซ่อน
            </p>
          </div>
        </div>

        {/* Action Buttons: Shuffle, Listen, Copy */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleShuffleAphorism}
            disabled={isSpinning}
            className="flex items-center gap-1.5 rounded-full bg-[#2A1138] hover:bg-[#3D1852] border border-[rgba(242,203,128,0.2)] hover:border-[#EAC272] px-3 py-1.5 text-xs text-[#FAE9CA] font-medium transition-all shadow cursor-pointer"
            title="สุ่มคติบทใหม่"
          >
            <RefreshCw className={`h-3.5 w-3.5 text-[#EAC272] ${isSpinning ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">สุ่มใหม่</span>
          </button>

          <button
            type="button"
            onClick={handleToggleSpeech}
            className={`rounded-full p-2 text-xs border transition-all cursor-pointer ${
              isSpeaking
                ? 'bg-[#842C71] text-[#FAE9CA] border-[#EAC272] animate-pulse shadow-lg'
                : 'bg-[#2A1138] hover:bg-[#3D1852] text-[#FAE9CA] border-[rgba(242,203,128,0.2)]'
            }`}
            title="ฟังเสียงแม่หมอ"
          >
            {isSpeaking ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5 text-[#EAC272]" />}
          </button>

          <button
            type="button"
            onClick={handleCopy}
            className="rounded-full bg-[#2A1138] hover:bg-[#3D1852] border border-[rgba(242,203,128,0.2)] p-2 text-xs text-[#FAE9CA] transition-all cursor-pointer"
            title="คัดลอกข้อความ"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Share2 className="h-3.5 w-3.5 text-[#EAC272]" />}
          </button>
        </div>
      </div>

      {/* Main Aphorism Quote Display */}
      <div className="relative z-10 my-5">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentItem.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}
            className="rounded-2xl bg-gradient-to-r from-[#170820]/95 via-[#230C30]/95 to-[#170820]/95 border border-[rgba(242,203,128,0.2)] p-5 sm:p-6 shadow-xl relative group"
          >
            {/* Sassy Cat Badge Indicator */}
            <div className="flex items-center justify-between mb-3 text-[11px] text-[#C9B49D]">
              <span className="flex items-center gap-1.5 font-medium text-[#EAC272]">
                <Sparkles className="h-3.5 w-3.5 text-[#EAC272]" />
                {currentItem.catVibe}
              </span>
              <span className="text-[10px] text-[#C9B49D]/60 font-mono">DAILY REFLECTION</span>
            </div>

            {/* Thai Aphorism */}
            <blockquote className="font-serif-display text-lg sm:text-2xl font-normal text-[#FAE9CA] leading-relaxed tracking-wide">
              {currentItem.aphorismTh}
            </blockquote>

            {/* English translation */}
            <p className="mt-2 text-xs sm:text-sm text-[#C9B49D]/85 font-light italic">
              {currentItem.aphorismEn}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ---------------------------------------------------- */}
      {/* Click to Reveal Hidden Advice Section */}
      {/* ---------------------------------------------------- */}
      <div className="relative z-10 pt-1">

        {/* Interactive Reveal Toggle Button */}
        <motion.button
          type="button"
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleToggleReveal}
          className={`w-full flex items-center justify-between gap-3 p-4 rounded-2xl border transition-all cursor-pointer shadow-lg ${
            isRevealed
              ? 'bg-gradient-to-r from-[#3D144A] via-[#2A0E35] to-[#1F0828] border-[#EAC272] shadow-[0_0_20px_rgba(234,194,114,0.25)]'
              : 'bg-gradient-to-r from-[#2A1138]/90 to-[#190924]/90 border-[rgba(242,203,128,0.3)] hover:border-[#EAC272] hover:bg-[#341445]'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className={`flex h-9 w-9 items-center justify-center rounded-xl transition-colors ${
              isRevealed
                ? 'bg-[#EAC272] text-[#110918]'
                : 'bg-[#15061D] text-[#EAC272] border border-[rgba(242,203,128,0.3)]'
            }`}>
              {isRevealed ? <Unlock className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
            </div>
            <div className="text-left">
              <span className="text-xs sm:text-sm font-bold text-[#FAE9CA] flex items-center gap-2">
                {isRevealed ? '🐾 กล่องคำแนะนำลับ (Hidden Advice) เปิดออกแล้ว' : '✨ แตะเพื่อเปิดคำแนะนำลับ (Click to Reveal Hidden Advice)'}
              </span>
              <span className="text-[10px] text-[#C9B49D] block mt-0.5">
                {isRevealed ? 'วิเคราะห์เชิงจิตวิทยาและวิธีแก้ปัญหาเฉพาะหน้า' : 'ถอดรหัสเบื้องลึก + ข้อปฏิบัติทางจิตวิทยา + เคล็ดลับดึงดูดพลังงาน'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <span className={`text-[11px] font-bold px-3 py-1 rounded-full border transition-all ${
              isRevealed
                ? 'bg-[#EAC272] text-[#110918] border-[#EAC272]'
                : 'bg-[#110918] text-[#EAC272] border-[rgba(242,203,128,0.3)]'
            }`}>
              {isRevealed ? 'ซ่อนคำแนะนำ' : 'เปิดดูความจริง 👁️'}
            </span>
          </div>
        </motion.button>

        {/* Revealed Content Drawer */}
        <AnimatePresence>
          {isRevealed && (
            <motion.div
              initial={{ opacity: 0, height: 0, marginTop: 0 }}
              animate={{ opacity: 1, height: 'auto', marginTop: 12 }}
              exit={{ opacity: 0, height: 0, marginTop: 0 }}
              transition={{ duration: 0.35, ease: 'easeInOut' }}
              className="overflow-hidden"
            >
              <div className="rounded-2xl bg-gradient-to-b from-[#260E33] via-[#1A0924] to-[#12051A] border border-[rgba(242,203,128,0.22)] p-5 sm:p-6 space-y-4 shadow-xl text-left">

                {/* Title */}
                <div className="flex items-center justify-between border-b border-[rgba(242,203,128,0.12)] pb-3">
                  <h4 className="font-serif-display text-base sm:text-lg text-[#EAC272] flex items-center gap-2">
                    <Lightbulb className="h-4 w-4 text-[#EAC272]" />
                    {currentItem.hiddenAdvice.title}
                  </h4>
                  <span className="text-[10px] text-[#C9B49D] bg-[#110918] px-2.5 py-0.5 rounded-full border border-[rgba(242,203,128,0.15)]">
                    Psychological Strategy
                  </span>
                </div>

                {/* Core Truth & Psychological Bias */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="rounded-xl bg-[#13061A] p-3.5 border border-[rgba(242,203,128,0.12)] space-y-1">
                    <span className="text-[11px] font-bold text-[#FAE9CA] flex items-center gap-1.5">
                      <Compass className="h-3.5 w-3.5 text-[#EAC272]" />
                      แก่นแท้ความจริง (Core Truth):
                    </span>
                    <p className="text-[#C9B49D] leading-relaxed">
                      {currentItem.hiddenAdvice.coreTruth}
                    </p>
                  </div>

                  <div className="rounded-xl bg-[#13061A] p-3.5 border border-[rgba(242,203,128,0.12)] space-y-1">
                    <span className="text-[11px] font-bold text-[#FAE9CA] flex items-center gap-1.5">
                      <Brain className="h-3.5 w-3.5 text-[#F472B6]" />
                      กับดักจิตวิทยา (Mind Trap):
                    </span>
                    <p className="text-[#C9B49D] leading-relaxed">
                      {currentItem.hiddenAdvice.psychologicalBias}
                    </p>
                  </div>
                </div>

                {/* Actionable Step */}
                <div className="rounded-xl bg-gradient-to-r from-[#1E0929] to-[#2B0E3B] p-4 border border-[rgba(242,203,128,0.2)] text-xs space-y-1.5">
                  <span className="text-[11px] font-bold text-[#EAC272] flex items-center gap-1.5 uppercase tracking-wider">
                    <Sparkles className="h-3.5 w-3.5 text-[#EAC272]" />
                    ภารกิจดึงสติวันนี้ (Actionable Step):
                  </span>
                  <p className="text-[#FAE9CA] leading-relaxed font-normal">
                    {currentItem.hiddenAdvice.actionableStep}
                  </p>
                </div>

                {/* Sassy Roast Quote */}
                <div className="rounded-xl bg-[#842C71]/25 p-3.5 border border-[rgba(242,203,128,0.25)] text-xs flex items-start gap-2.5">
                  <span className="text-lg">💅</span>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#F2CB80] block">
                      หมัดฮุกเพื่อนสาวตบเรียกสติ:
                    </span>
                    <p className="text-[#FAE9CA] font-medium italic mt-0.5">
                      "{currentItem.hiddenAdvice.sassyRoast}"
                    </p>
                  </div>
                </div>

                {/* Lucky Charm Note */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[rgba(242,203,128,0.1)] text-[11px] text-[#C9B49D]">
                  <span className="flex items-center gap-1 text-[#EAC272]">
                    <span>🐾 เคล็ดลับดวงดาว:</span>
                    <span className="text-[#FAE9CA]">{currentItem.hiddenAdvice.luckyCharm}</span>
                  </span>

                  <span className="text-[10px] text-[#C9B49D]/70">
                    ดูดวงค่ะอีหญิง • The Cat Room
                  </span>
                </div>

              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

    </div>
  );
};
