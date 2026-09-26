import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import { 
  X, 
  Sparkles, 
  MessageSquareHeart, 
  Share2, 
  Download, 
  Copy, 
  Check, 
  Volume2,
  VolumeX,
  Brain,
  Zap,
  Flame
} from 'lucide-react';
import { FortuneReading } from '../types';
import { speakThaiText, stopSpeaking } from '../utils/speechHelper';

interface ReadingResultModalProps {
  reading: FortuneReading | null;
  onClose: () => void;
  onContinueChatWithReading: (reading: FortuneReading) => void;
}

export const ReadingResultModal: React.FC<ReadingResultModalProps> = ({
  reading,
  onClose,
  onContinueChatWithReading,
}) => {
  const [copied, setCopied] = React.useState(false);
  const [isSpeaking, setIsSpeaking] = React.useState(false);

  React.useEffect(() => {
    return () => {
      stopSpeaking();
    };
  }, []);

  if (!reading) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(reading.markdownContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleToggleSpeak = () => {
    if (isSpeaking) {
      stopSpeaking();
      setIsSpeaking(false);
      return;
    }
    
    speakThaiText(
      reading.markdownContent,
      () => setIsSpeaking(true),
      () => setIsSpeaking(false),
      () => setIsSpeaking(false)
    );
  };

  const disciplineTitle = {
    chinese: '☯️ ศาสตร์จีนโบราณ (Bazi & I-Ching)',
    tarot: '🎴 ศาสตร์ไพ่ยิปซี (Tarot of Truth)',
    oracle: '🔮 ไพ่โอราเคิลแมวดำ (Cat Room Oracle)',
    rune: 'ᛋ ศาสตร์หินรูนนอร์ส (Elder Futhark)',
  }[reading.discipline];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#110918]/85 p-4 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="relative my-8 w-full max-w-2xl rounded-[32px] bg-gradient-to-b from-[#24102E] via-[#180B22] to-[#110918] p-6 sm:p-8 border border-[rgba(242,203,128,0.22)] shadow-2xl shadow-[#110918] max-h-[90vh] overflow-y-auto"
      >
        {/* Close Button */}
        <button
          onClick={() => {
            stopSpeaking();
            onClose();
          }}
          className="absolute top-5 right-5 rounded-full bg-[#1E0E2A] p-2 text-[#C9B49D] hover:text-[#FAE9CA] hover:bg-[#361A4A] border border-[rgba(242,203,128,0.15)] transition-all"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Header */}
        <div className="border-b border-[rgba(242,203,128,0.15)] pb-5">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#EAC272] uppercase tracking-widest">
            <span>🐾 คำพยากรณ์จาก The Cat Room</span>
          </div>

          <h2 className="mt-2 font-serif-display text-2xl sm:text-3xl font-normal text-[#FAE9CA] leading-tight">
            {disciplineTitle}
          </h2>

          <div className="mt-3 flex flex-wrap items-center gap-2.5 text-xs text-[#C9B49D]">
            <span className="rounded-full bg-[#361A4A] px-3 py-0.5 text-[#FAE9CA] border border-[rgba(242,203,128,0.2)]">
              หัวข้อ: {reading.topic}
            </span>
            <span className="rounded-full bg-[#842C71]/30 px-2.5 py-0.5 text-[#F2CB80] border border-[rgba(242,203,128,0.15)]">
              ระดับ: {reading.sassyLevel === 'savage' ? '🔥 ฟาดแรง' : reading.sassyLevel === 'spicy' ? '🌶️ แซ่บ' : '✨ ละมุน'}
            </span>
            {reading.depthTier && (
              <span className="rounded-full bg-gradient-to-r from-[#EAC272]/25 to-[#D4A84D]/25 px-2.5 py-0.5 text-[#EAC272] border border-[#EAC272]/40 font-semibold">
                {reading.depthTier === 'quick' ? '⚡ สรุปด่วน (5 เหรียญ)' : reading.depthTier === 'deep_soul' ? '👑 เจาะลึกจิตวิญญาณ (25 เหรียญ)' : '🔮 มาตรฐาน 5 มิติ (10 เหรียญ)'}
              </span>
            )}
            <span>{reading.timestamp}</span>
          </div>
        </div>

        {/* Question Review */}
        <div className="my-4 rounded-2xl bg-[#110918]/80 p-4 border border-[rgba(242,203,128,0.12)] text-xs">
          <span className="text-[#C9B49D] block mb-1">คำถามที่จุดประกาย:</span>
          <p className="font-semibold text-[#FAE9CA]">"{reading.question}"</p>
        </div>

        {/* Markdown Content */}
        <div className="prose prose-invert max-w-none space-y-3 py-2 text-sm leading-relaxed text-[#FAE9CA]/90">
          <ReactMarkdown>{reading.markdownContent}</ReactMarkdown>
        </div>

        {/* Bottom Actions */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-[rgba(242,203,128,0.15)] pt-5">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={handleCopy}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 rounded-full bg-[#1E0E2A] hover:bg-[#2A143A] px-4 py-2 text-xs font-semibold text-[#FAE9CA] border border-[rgba(242,203,128,0.2)] transition-all"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5 text-[#EAC272]" />}
              <span>{copied ? 'คัดลอกแล้ว' : 'คัดลอกคำทำนาย'}</span>
            </button>

            <button
              onClick={handleToggleSpeak}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold border transition-all ${
                isSpeaking 
                  ? 'bg-[#842C71] text-[#FAE9CA] border-[#EAC272] animate-pulse' 
                  : 'bg-[#1E0E2A] hover:bg-[#2A143A] text-[#FAE9CA] border-[rgba(242,203,128,0.2)]'
              }`}
            >
              {isSpeaking ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5 text-[#EAC272]" />}
              <span>{isSpeaking ? 'หยุดเสียง' : 'ฟังเสียงแม่หมอ'}</span>
            </button>
          </div>

          <button
            id="btn-ask-further-chat"
            onClick={() => {
              stopSpeaking();
              onContinueChatWithReading(reading);
              onClose();
            }}
            className="btn-gilded w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 text-xs font-bold text-[#110918] cursor-pointer"
          >
            <MessageSquareHeart className="h-4 w-4" />
            <span>คุยแชทถามต่อกับแม่หมอเหมียว</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
};
