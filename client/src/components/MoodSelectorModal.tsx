import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Palette, Check, Sparkles, X, Sun, Moon } from 'lucide-react';
import { useMood } from '../context/MoodContext';
import { MoodType } from '../types';

export const MoodSelectorModal: React.FC = () => {
  const { currentMood, setMood, availableMoods, isMoodModalOpen, setIsMoodModalOpen } = useMood();

  if (!isMoodModalOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 15 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="velvet-card w-full max-w-xl rounded-[28px] p-6 shadow-2xl relative border border-[rgba(242,203,128,0.3)] overflow-hidden"
          style={{
            backgroundColor: 'var(--cat-container)',
            borderColor: 'var(--cat-border-glow)',
          }}
        >
          {/* Ambient Glow */}
          <div
            className="absolute -top-16 -right-16 h-48 w-48 rounded-full blur-3xl pointer-events-none opacity-40"
            style={{ backgroundColor: 'var(--cat-gold)' }}
          />

          {/* Modal Header */}
          <div className="flex items-center justify-between border-b border-[rgba(242,203,128,0.16)] pb-4 mb-5">
            <div className="flex items-center gap-3">
              <div
                className="flex h-11 w-11 items-center justify-center rounded-2xl shadow-md border"
                style={{
                  backgroundColor: 'var(--cat-container-highest)',
                  borderColor: 'var(--cat-border)',
                  color: 'var(--cat-gold)',
                }}
              >
                <Palette className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-serif-display text-xl" style={{ color: 'var(--cat-cream)' }}>
                    บรรยากาศสำนัก (Interface Mood)
                  </h3>
                  <span
                    className="rounded-full px-2 py-0.5 text-[10px] font-bold border"
                    style={{
                      backgroundColor: 'rgba(234, 194, 114, 0.15)',
                      color: 'var(--cat-gold)',
                      borderColor: 'var(--cat-border)',
                    }}
                  >
                    CSS Variables
                  </span>
                </div>
                <p className="text-xs" style={{ color: 'var(--cat-muted)' }}>
                  ปรับแต่งโทนแสงและสีของ The Cat Room ให้เข้ากับพลังจิตใจของคุณ
                </p>
              </div>
            </div>

            <button
              id="btn-close-mood-modal"
              onClick={() => setIsMoodModalOpen(false)}
              className="rounded-full p-2 hover:opacity-80 transition-opacity"
              style={{
                backgroundColor: 'var(--cat-container-high)',
                color: 'var(--cat-muted)',
              }}
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Mood Options Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mb-5">
            {availableMoods.map((mood) => {
              const isSelected = currentMood === mood.id;

              return (
                <button
                  key={mood.id}
                  id={`btn-select-mood-${mood.id}`}
                  onClick={() => setMood(mood.id)}
                  className={`group relative text-left rounded-2xl p-4 transition-all border cursor-pointer ${
                    isSelected
                      ? 'ring-2 scale-[1.02] shadow-xl'
                      : 'hover:scale-[1.01] hover:brightness-105'
                  }`}
                  style={{
                    backgroundColor: mood.previewColors.surface,
                    borderColor: isSelected ? mood.previewColors.accent : 'rgba(255, 255, 255, 0.1)',
                    boxShadow: isSelected
                      ? `0 10px 25px -5px ${mood.previewColors.surface}, 0 0 15px ${mood.previewColors.accent}33`
                      : 'none',
                  }}
                >
                  {/* Active Indicator Badge */}
                  {isSelected && (
                    <span
                      className="absolute top-3 right-3 flex h-5 w-5 items-center justify-center rounded-full text-black shadow-md"
                      style={{ backgroundColor: mood.previewColors.accent }}
                    >
                      <Check className="h-3 w-3 stroke-[3]" />
                    </span>
                  )}

                  {/* Title & Icon */}
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">{mood.icon}</span>
                    <div>
                      <h4
                        className="font-serif-display text-sm font-semibold tracking-wide"
                        style={{ color: mood.previewColors.text }}
                      >
                        {mood.nameEn}
                      </h4>
                      <span className="text-[10px] block opacity-80" style={{ color: mood.previewColors.text }}>
                        {mood.subtitle}
                      </span>
                    </div>
                  </div>

                  {/* Color Swatches */}
                  <div className="flex items-center gap-1.5 my-2.5">
                    <span
                      className="h-3.5 w-6 rounded-md border border-white/20"
                      title="Surface (พื้นหลัง)"
                      style={{ backgroundColor: mood.previewColors.surface }}
                    />
                    <span
                      className="h-3.5 w-6 rounded-md border border-white/20"
                      title="Container (การ์ด)"
                      style={{ backgroundColor: mood.previewColors.container }}
                    />
                    <span
                      className="h-3.5 w-6 rounded-md border border-white/20"
                      title="Accent (ทอง/เน้น)"
                      style={{ backgroundColor: mood.previewColors.accent }}
                    />
                    <span
                      className="h-3.5 w-6 rounded-md border border-white/20"
                      title="Text (ตัวอักษร)"
                      style={{ backgroundColor: mood.previewColors.text }}
                    />
                  </div>

                  {/* Description */}
                  <p
                    className="text-[11px] leading-relaxed line-clamp-2 mt-1"
                    style={{ color: mood.previewColors.text, opacity: 0.75 }}
                  >
                    {mood.description}
                  </p>
                </button>
              );
            })}
          </div>

          {/* Footer & Live Status */}
          <div
            className="flex items-center justify-between rounded-xl p-3 border text-xs"
            style={{
              backgroundColor: 'var(--cat-surface)',
              borderColor: 'var(--cat-border)',
            }}
          >
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" style={{ color: 'var(--cat-gold)' }} />
              <span style={{ color: 'var(--cat-muted)' }}>
                กำลังใช้ธีม: <strong style={{ color: 'var(--cat-cream)' }}>{currentMood}</strong>
              </span>
            </div>

            <button
              id="btn-confirm-mood"
              onClick={() => setIsMoodModalOpen(false)}
              className="btn-gilded px-5 py-1.5 text-xs font-bold"
            >
              เสร็จสิ้น
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
