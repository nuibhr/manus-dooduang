import React, { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { AlertCircle, RefreshCw, Sparkles } from 'lucide-react';
import type { DisciplineType, ReadingDepthTier } from '../types';

export interface AnalysisStatus {
  discipline: DisciplineType;
  topic: string;
  depthTier: ReadingDepthTier;
  itemCount: number;
}

interface AnalysisWaitingOverlayProps {
  status: AnalysisStatus | null;
  error: string | null;
  onRetry: () => void;
  onCloseError: () => void;
}

const disciplineMeta: Record<DisciplineType, { icon: string; name: string; noun: string }> = {
  daily: { icon: '🐾', name: 'ดวงประจำวัน', noun: 'สัญญาณประจำวัน' },
  calendar: { icon: '📅', name: 'ปฏิทินดวง', noun: 'จังหวะดาว' },
  numbers: { icon: '✨', name: 'เลขมงคล', noun: 'ตัวเลข' },
  minigame: { icon: '🎡', name: 'เสี่ยงทาย', noun: 'สัญญาณโชค' },
  card_studio: { icon: '🎴', name: 'สตูดิโอลายไพ่', noun: 'ลายไพ่' },
  tarot: { icon: '🃏', name: 'ไพ่ยิปซี', noun: 'หน้าไพ่' },
  oracle: { icon: '🔮', name: 'โอราเคิลแมวดำ', noun: 'สารจากไพ่' },
  rune: { icon: 'ᛋ', name: 'หินรูนนอร์ส', noun: 'อักขระรูน' },
  chinese: { icon: '☯️', name: 'ศาสตร์จีน', noun: 'ธาตุและเส้นชะตา' },
  chat: { icon: '💬', name: 'แม่หมอเหมียว', noun: 'บทสนทนา' },
};

const stages = [
  'กำลังอ่านพลังจากสิ่งที่คุณเลือก',
  'กำลังเชื่อมโยงคำถามกับศาสตร์พยากรณ์',
  'กำลังเรียบเรียงคำตอบให้ตรงและใช้ได้จริง',
];

export const AnalysisWaitingOverlay: React.FC<AnalysisWaitingOverlayProps> = ({
  status,
  error,
  onRetry,
  onCloseError,
}) => {
  const [stageIndex, setStageIndex] = useState(0);

  useEffect(() => {
    if (!status) {
      setStageIndex(0);
      return;
    }
    const interval = window.setInterval(() => {
      setStageIndex(index => Math.min(index + 1, stages.length - 1));
    }, 1800);
    return () => window.clearInterval(interval);
  }, [status]);

  const meta = useMemo(
    () => disciplineMeta[status?.discipline || 'tarot'],
    [status?.discipline]
  );

  return (
    <AnimatePresence>
      {(status || error) && (
        <motion.div
          key="analysis-waiting-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="liquid-analysis-backdrop fixed inset-0 z-[70] flex items-center justify-center p-5"
          aria-live="polite"
          aria-busy={Boolean(status)}
        >
          <motion.section
            initial={{ opacity: 0, y: 18, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 260, damping: 24 }}
            className="liquid-analysis-panel w-full max-w-sm overflow-hidden rounded-[32px] p-6 text-center"
            role={error ? 'alertdialog' : 'status'}
            aria-label={error ? 'เกิดข้อผิดพลาดในการอ่านดวง' : 'กำลังวิเคราะห์คำทำนาย'}
          >
            {error ? (
              <>
                <div className="liquid-error-orb mx-auto flex h-20 w-20 items-center justify-center rounded-full">
                  <AlertCircle className="h-9 w-9" />
                </div>
                <h2 className="mt-5 font-serif-display text-2xl font-bold text-[var(--cat-cream)]">พลังสะดุดนิดหน่อย</h2>
                <p className="mt-2 text-sm leading-relaxed text-[var(--cat-muted)]">{error}</p>
                <div className="mt-6 grid grid-cols-2 gap-2">
                  <button type="button" onClick={onCloseError} className="liquid-secondary-button">ไว้ก่อน</button>
                  <button type="button" onClick={onRetry} className="btn-gilded flex items-center justify-center gap-2 px-4 py-3 text-sm font-bold text-[#08101f]">
                    <RefreshCw className="h-4 w-4" /> ลองอีกครั้ง
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="liquid-divination-orbit mx-auto" aria-hidden="true">
                  <motion.span
                    animate={{ rotate: 360 }}
                    transition={{ duration: 7, repeat: Infinity, ease: 'linear' }}
                    className="liquid-orbit-ring"
                  />
                  <motion.span
                    animate={{ y: [0, -5, 0], rotate: [-2, 2, -2] }}
                    transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
                    className="liquid-orbit-core"
                  >
                    {meta.icon}
                  </motion.span>
                  <Sparkles className="liquid-orbit-spark h-5 w-5" />
                </div>

                <p className="mt-5 text-[10px] font-bold uppercase tracking-[0.24em] text-[var(--cat-gold)]">{meta.name}</p>
                <h2 className="mt-2 font-serif-display text-2xl font-bold text-[var(--cat-cream)]">
                  กำลังถอดรหัส{status && status.itemCount > 0 ? ` ${status.itemCount} ${meta.noun}` : meta.noun}
                </h2>
                <p className="mt-2 line-clamp-2 text-xs text-[var(--cat-muted)]">“{status?.topic}”</p>

                <div className="mt-6 grid grid-cols-3 gap-2" aria-label="ขั้นตอนการวิเคราะห์">
                  {stages.map((stage, index) => (
                    <div key={stage} className={`liquid-analysis-step ${index <= stageIndex ? 'is-active' : ''}`}>
                      <span className="block h-1.5 rounded-full" />
                      <span className="sr-only">{stage}</span>
                    </div>
                  ))}
                </div>
                <motion.p
                  key={stageIndex}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 min-h-10 text-sm font-medium text-[var(--cat-cream)]"
                >
                  {stages[stageIndex]}
                </motion.p>
                <p className="text-[10px] leading-relaxed text-[var(--cat-muted)]">
                  ไม่ต้องกดซ้ำ แม่หมอจะเปิดผลให้ทันทีเมื่อพร้อม
                </p>
              </>
            )}
          </motion.section>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
