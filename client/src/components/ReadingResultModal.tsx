import React from 'react';
import { motion } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import {
  ArrowRight,
  Check,
  Copy,
  Library,
  MessageSquareHeart,
  Share2,
  Sparkles,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react';
import { DisciplineType, FortuneReading } from '../types';
import { speakThaiText, stopSpeaking } from '../utils/speechHelper';

interface ReadingResultModalProps {
  reading: FortuneReading | null;
  coins: number;
  historyCount: number;
  onClose: () => void;
  onContinueChatWithReading: (reading: FortuneReading) => void;
  onExploreDiscipline: (discipline: DisciplineType) => void;
  onOpenWisdomLibrary: () => void;
}

export const ReadingResultModal: React.FC<ReadingResultModalProps> = ({
  reading,
  coins,
  historyCount,
  onClose,
  onContinueChatWithReading,
  onExploreDiscipline,
  onOpenWisdomLibrary,
}) => {
  const [shared, setShared] = React.useState(false);
  const [isSpeaking, setIsSpeaking] = React.useState(false);

  React.useEffect(() => () => stopSpeaking(), []);

  if (!reading) return null;

  const disciplineTitles: Record<DisciplineType, string> = {
    daily: '🐾 ดวงประจำวัน (Daily Purr)',
    calendar: '📅 ปฏิทินดวงรายเดือน',
    numbers: '✨ เลขมงคลดวงดาว',
    minigame: '🎡 มินิเกมโชคชะตา',
    card_studio: '🎨 สตูดิโอลายไพ่',
    tarot: '🎴 ศาสตร์ไพ่ยิปซี (Tarot of Truth)',
    oracle: '🔮 ไพ่โอราเคิลแมวดำ (Cat Room Oracle)',
    rune: 'ᛋ ศาสตร์หินรูนนอร์ส (Elder Futhark)',
    chinese: '☯️ ศาสตร์จีนโบราณ (Bazi & I-Ching)',
    chat: '💬 คำแนะนำจากแม่หมอเหมียว',
  };

  const disciplineTitle = disciplineTitles[reading.discipline];
  const comparisonDiscipline: DisciplineType = reading.discipline === 'tarot' ? 'oracle' : 'tarot';
  const comparisonLabel = comparisonDiscipline === 'tarot' ? 'เทียบด้วยไพ่ยิปซี' : 'เทียบด้วยโอราเคิล';
  const patternProgress = Math.min(historyCount, 3);
  const shareNavigator = navigator as Navigator & { share?: (data: ShareData) => Promise<void> };
  const canNativeShare = typeof shareNavigator.share === 'function';

  const handleShare = async () => {
    const text = `🐾 ดูดวงค่ะอีหญิง\n${disciplineTitle}\nหัวข้อ: ${reading.topic}\n\n${reading.markdownContent}\n\n— แม่หมอช่วยส่องไฟ แต่คนถือกุญแจยังเป็นคุณ`;
    try {
      if (canNativeShare && shareNavigator.share) {
        await shareNavigator.share({ title: `ผลดวง: ${reading.topic}`, text });
      } else {
        await navigator.clipboard.writeText(text);
      }
      setShared(true);
      window.setTimeout(() => setShared(false), 2200);
    } catch (error) {
      if ((error as DOMException)?.name !== 'AbortError') {
        await navigator.clipboard.writeText(text);
        setShared(true);
        window.setTimeout(() => setShared(false), 2200);
      }
    }
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

  const closeAnd = (action: () => void) => {
    stopSpeaking();
    onClose();
    action();
  };

  return (
    <div className="reading-result-backdrop fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-4">
      <motion.div
        initial={{ scale: 0.96, opacity: 0, y: 16 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.98, opacity: 0, y: 10 }}
        transition={{ type: 'spring', stiffness: 270, damping: 25 }}
        className="reading-result-panel relative my-8 max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-[32px] p-6 sm:p-8"
        role="dialog"
        aria-modal="true"
        aria-labelledby="reading-result-title"
      >
        <button
          type="button"
          onClick={() => closeAnd(() => undefined)}
          className="liquid-icon-button absolute right-5 top-5 rounded-full border p-2"
          aria-label="ปิดผลคำทำนาย"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="border-b border-[var(--cat-border)] pb-5 pr-10">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-[var(--cat-gold)]">
            <span>🐾 คำพยากรณ์จาก The Cat Room</span>
          </div>
          <h2 id="reading-result-title" className="mt-2 font-serif-display text-2xl font-normal leading-tight text-[var(--cat-cream)] sm:text-3xl">
            {disciplineTitle}
          </h2>
          <div className="mt-3 flex flex-wrap items-center gap-2.5 text-xs text-[var(--cat-muted)]">
            <span className="rounded-full border border-[var(--cat-border)] bg-[var(--cat-container-high)] px-3 py-0.5 text-[var(--cat-cream)]">หัวข้อ: {reading.topic}</span>
            <span className="rounded-full border border-[var(--cat-border)] bg-[var(--cat-container-highest)] px-2.5 py-0.5 text-[var(--cat-gold)]">
              {reading.sassyLevel === 'savage' ? '🔥 ฟาดแรง' : reading.sassyLevel === 'spicy' ? '🌶️ แซ่บ' : '✨ ละมุน'}
            </span>
            {reading.depthTier && (
              <span className="rounded-full border border-[var(--cat-border-glow)] px-2.5 py-0.5 font-semibold text-[var(--cat-gold)]">
                {reading.depthTier === 'quick' ? '⚡ สรุปด่วน 5 เหรียญ' : reading.depthTier === 'deep_soul' ? '👑 เจาะลึก 25 เหรียญ' : '🔮 มาตรฐาน 10 เหรียญ'}
              </span>
            )}
            <span>{reading.timestamp}</span>
          </div>
        </div>

        <div className="my-4 rounded-2xl border border-[var(--cat-border)] bg-[var(--cat-surface)] p-4 text-xs">
          <span className="mb-1 block text-[var(--cat-muted)]">คำถามที่จุดประกาย:</span>
          <p className="font-semibold text-[var(--cat-cream)]">“{reading.question}”</p>
        </div>

        <div className="prose prose-invert max-w-none space-y-3 py-2 text-sm leading-relaxed text-[var(--cat-cream)]">
          <ReactMarkdown>{reading.markdownContent}</ReactMarkdown>
        </div>

        <section className="reading-next-path mt-7 rounded-[26px] p-4" aria-labelledby="next-path-title">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[var(--cat-gold)]">Next best insight</p>
              <h3 id="next-path-title" className="mt-1 text-base font-bold text-[var(--cat-cream)]">อย่าเพิ่งเชื่อศาสตร์เดียว ลองเทียบมุมมอง</h3>
              <p className="mt-1 text-xs leading-relaxed text-[var(--cat-muted)]">ดูอีกศาสตร์เพื่อหาแก่นคำตอบร่วม หรือสะสม 3 ครั้งให้ระบบช่วยมองแพทเทิร์นชีวิต</p>
            </div>
            <span className="shrink-0 rounded-full border border-[var(--cat-border)] px-2.5 py-1 text-[10px] font-bold text-[var(--cat-gold)]">เหลือ {coins} 🪙</span>
          </div>

          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => closeAnd(() => onExploreDiscipline(comparisonDiscipline))}
              className="reading-next-button"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-[var(--liquid-fill-hover)] text-lg" aria-hidden="true">
                {comparisonDiscipline === 'tarot' ? '🃏' : '🔮'}
              </span>
              <span className="min-w-0 flex-1 text-left">
                <span className="block text-sm font-bold text-[var(--cat-cream)]">{comparisonLabel}</span>
                <span className="block text-[10px] text-[var(--cat-muted)]">เริ่ม 5 เหรียญ • เลือกระดับได้</span>
              </span>
              <ArrowRight className="h-4 w-4 text-[var(--cat-gold)]" />
            </button>
            <button
              type="button"
              onClick={() => closeAnd(onOpenWisdomLibrary)}
              className="reading-next-button"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-[var(--liquid-fill-hover)]" aria-hidden="true"><Library className="h-4 w-4" /></span>
              <span className="min-w-0 flex-1 text-left">
                <span className="block text-sm font-bold text-[var(--cat-cream)]">แพทเทิร์นชีวิต {patternProgress}/3</span>
                <span className="block text-[10px] text-[var(--cat-muted)]">อ่านประวัติเดิม ไม่เสียเหรียญ</span>
              </span>
              <Sparkles className="h-4 w-4 text-[var(--cat-gold)]" />
            </button>
          </div>
        </section>

        <div className="mt-5 flex flex-col items-center justify-between gap-3 border-t border-[var(--cat-border)] pt-5 sm:flex-row">
          <div className="flex w-full items-center gap-2 sm:w-auto">
            <button type="button" onClick={handleShare} className="liquid-secondary-button flex-1 px-4 py-2 text-xs sm:flex-none">
              {shared ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : canNativeShare ? <Share2 className="h-3.5 w-3.5 text-[var(--cat-gold)]" /> : <Copy className="h-3.5 w-3.5 text-[var(--cat-gold)]" />}
              <span>{shared ? 'พร้อมแชร์แล้ว' : canNativeShare ? 'แชร์ผลดวง' : 'คัดลอกผลดวง'}</span>
            </button>
            <button type="button" onClick={handleToggleSpeak} className={`liquid-secondary-button flex-1 px-4 py-2 text-xs sm:flex-none ${isSpeaking ? 'ring-1 ring-[var(--cat-gold)]' : ''}`}>
              {isSpeaking ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5 text-[var(--cat-gold)]" />}
              <span>{isSpeaking ? 'หยุดเสียง' : 'ฟังเสียง'}</span>
            </button>
          </div>

          <button
            id="btn-ask-further-chat"
            type="button"
            onClick={() => closeAnd(() => onContinueChatWithReading(reading))}
            className="btn-gilded flex w-full cursor-pointer items-center justify-center gap-2 px-6 py-2.5 text-xs font-bold text-[#08101f] sm:w-auto"
          >
            <MessageSquareHeart className="h-4 w-4" />
            <span>ถามต่อจากผลนี้</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
};
