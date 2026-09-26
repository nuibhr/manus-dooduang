import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Volume2, 
  VolumeX, 
  Music, 
  Sparkles, 
  Play, 
  Square, 
  Sliders, 
  Check, 
  X,
  Radio,
  Headphones
} from 'lucide-react';
import { CosmicSoundscapeMode } from '../types';
import { cosmicSoundscape, speakThaiText, playMysticChimeSound } from '../utils/speechHelper';

interface CosmicSoundscapePlayerProps {
  onShowToast?: (msg: string) => void;
}

export const CosmicSoundscapePlayer: React.FC<CosmicSoundscapePlayerProps> = ({ onShowToast }) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [activeMode, setActiveMode] = useState<CosmicSoundscapeMode>('432hz-drone');
  const [volume, setVolume] = useState<number>(50); // 0-100
  const [voiceSpeed, setVoiceSpeed] = useState<number>(1.0);

  // Sync volume with soundscape
  useEffect(() => {
    cosmicSoundscape.setVolume(volume / 100);
  }, [volume]);

  const handleTogglePlay = (modeToPlay?: CosmicSoundscapeMode) => {
    const targetMode = modeToPlay || activeMode;

    if (isPlaying && targetMode === activeMode && !modeToPlay) {
      cosmicSoundscape.stop();
      setIsPlaying(false);
      onShowToast?.('⏹️ ปิดเสียงคลื่นความถี่จักรวาล');
    } else {
      playMysticChimeSound('gold');
      cosmicSoundscape.play(targetMode as any);
      setActiveMode(targetMode);
      setIsPlaying(true);
      onShowToast?.(`🎶 เริ่มเปิดเสียงดวงชะตา: ${getModeTitle(targetMode)}`);
    }
  };

  const handleStop = () => {
    cosmicSoundscape.stop();
    setIsPlaying(false);
  };

  const handleTestVoice = () => {
    speakThaiText(
      'สวัสดีค่ะลูกดวง คลื่นเสียงดวงชะตาเปิดพร้อมรับพลังงานบวกแล้ว ขอให้วันนี้มีแต่เรื่องดีๆ เข้ามานะจ๊ะ',
      undefined,
      undefined,
      undefined,
      { rate: voiceSpeed }
    );
  };

  const getModeTitle = (m: CosmicSoundscapeMode) => {
    switch (m) {
      case '432hz-drone': return '432Hz คลื่นสมาธิจักรวาล';
      case 'singing-bowl': return 'ขันธิเบต กังวานชำระจิต';
      case 'cat-purr': return 'คลื่นเสียงครางแมว 26Hz บำบัด';
      case 'temple-bell': return 'ระฆังวิหารศักดิ์สิทธิ์';
      default: return 'ปิดเสียงดนตรี';
    }
  };

  const soundModes: Array<{ id: CosmicSoundscapeMode; title: string; subtitle: string; icon: string }> = [
    {
      id: '432hz-drone',
      title: '432Hz Solfeggio Cosmic Drone',
      subtitle: 'ความถี่ฮาร์มอนิกสลายความเครียด เปิดจักระรับคำทำนาย',
      icon: '🧘',
    },
    {
      id: 'singing-bowl',
      title: 'Tibetan Crystal Singing Bowl',
      subtitle: 'เสียงกังวานใสของขันหิมาลัย ชำระล้างพลังงานลบรอบตัว',
      icon: '🔔',
    },
    {
      id: 'cat-purr',
      title: 'Sacred Cat Purr Vibration',
      subtitle: 'คลื่นเสียงทุ้ม 26Hz ของแมวแม่หมอ ปลอบประโลมจิตใจ',
      icon: '🐾',
    },
    {
      id: 'temple-bell',
      title: 'Night Temple Celestial Bells',
      subtitle: 'เสียงกระดิ่งลมและระฆังทองคำวิหารศักดิ์สิทธิ์ยามค่ำ',
      icon: '⛩️',
    },
  ];

  return (
    <>
      {/* Floating Ambient Toggle Trigger (Bottom Right) */}
      <div className="fixed bottom-24 right-5 z-40 flex items-center gap-2">
        {isPlaying && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="hidden sm:flex items-center gap-2 rounded-full bg-[#180B22]/90 backdrop-blur-md px-3 py-1.5 border border-[#EAC272]/40 shadow-lg text-[11px] text-[#FAE9CA]"
          >
            {/* Animated Equalizer Wave */}
            <div className="flex items-end gap-0.5 h-3">
              <span className="w-1 bg-[#EAC272] rounded-full animate-[pulse_0.8s_infinite] h-3" />
              <span className="w-1 bg-[#AEFFE4] rounded-full animate-[pulse_0.5s_infinite] h-2" />
              <span className="w-1 bg-[#842C71] rounded-full animate-[pulse_1.1s_infinite] h-3.5" />
            </div>
            <span className="line-clamp-1">{getModeTitle(activeMode)}</span>
          </motion.div>
        )}

        <button
          id="btn-floating-soundscape"
          onClick={() => setIsOpen(!isOpen)}
          className={`flex h-12 w-12 items-center justify-center rounded-full shadow-2xl border transition-all cursor-pointer ${
            isPlaying
              ? 'bg-gradient-to-tr from-[#842C71] via-[#361A4A] to-[#EAC272] border-[#FAE9CA] text-[#FAE9CA] ring-4 ring-[#EAC272]/30 shadow-[#EAC272]/20'
              : 'bg-[#1E0E2A]/90 backdrop-blur-md border-[rgba(242,203,128,0.25)] text-[#C9B49D] hover:text-[#FAE9CA] hover:border-[#EAC272]'
          }`}
          title="เสียงดวงชะตา & ดนตรีสมาธิ (Cosmic Soundscape)"
        >
          {isPlaying ? (
            <Headphones className="h-5 w-5 text-[#FAE9CA] animate-bounce" />
          ) : (
            <Music className="h-5 w-5 text-[#EAC272]" />
          )}
        </button>
      </div>

      {/* Expandable Soundscape Modal */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#110918]/80 p-4 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-lg rounded-[28px] bg-gradient-to-b from-[#24102E] via-[#1A0923] to-[#110918] p-6 border-2 border-[rgba(242,203,128,0.3)] shadow-2xl space-y-5"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-[rgba(242,203,128,0.15)] pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🌌</span>
                  <div>
                    <h3 className="font-serif-display text-lg sm:text-xl text-[#FAE9CA]">
                      เสียงดวงชะตา & ดนตรีสมาธิ (Soundscape)
                    </h3>
                    <p className="text-[11px] text-[#C9B49D]">
                      สร้างบรรยากาศสงบด้วยคลื่นความถี่บำบัดขณะเปิดไพ่และอ่านคำทำนาย
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setIsOpen(false)}
                  className="rounded-full bg-[#1E0E2A] p-1.5 text-[#C9B49D] hover:text-[#FAE9CA] transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Mode Options */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-[#EAC272]">
                  เลือกคลื่นเสียงบรรยากาศ:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {soundModes.map((mode) => {
                    const isSelected = activeMode === mode.id && isPlaying;
                    return (
                      <div
                        key={mode.id}
                        onClick={() => handleTogglePlay(mode.id)}
                        className={`cursor-pointer rounded-2xl p-3 border transition-all ${
                          isSelected
                            ? 'bg-[#842C71]/40 border-[#EAC272] shadow-lg ring-1 ring-[#EAC272]/50'
                            : 'bg-[#110918]/70 border-[rgba(242,203,128,0.15)] hover:border-[rgba(242,203,128,0.35)]'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xl">{mode.icon}</span>
                          {isSelected && (
                            <span className="rounded-full bg-[#EAC272] px-2 py-0.5 text-[9px] font-bold text-[#110918]">
                              กำลังเล่น
                            </span>
                          )}
                        </div>
                        <h4 className="text-xs font-bold text-[#FAE9CA]">
                          {mode.title}
                        </h4>
                        <p className="text-[10px] text-[#C9B49D] line-clamp-2 mt-0.5">
                          {mode.subtitle}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Volume Slider & Play Controls */}
              <div className="rounded-2xl bg-[#110918]/80 p-4 border border-[rgba(242,203,128,0.15)] space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#C9B49D] flex items-center gap-1.5">
                    <Volume2 className="h-4 w-4 text-[#EAC272]" />
                    <span>ระดับเสียงดนตรีบรรยากาศ: {volume}%</span>
                  </span>
                  <button
                    onClick={() => handleTogglePlay()}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all ${
                      isPlaying
                        ? 'bg-rose-900/60 text-rose-200 border border-rose-500/40'
                        : 'bg-emerald-900/60 text-emerald-200 border border-emerald-500/40'
                    }`}
                  >
                    {isPlaying ? (
                      <>
                        <Square className="h-3 w-3 fill-current" />
                        <span>หยุดเล่น</span>
                      </>
                    ) : (
                      <>
                        <Play className="h-3 w-3 fill-current" />
                        <span>เริ่มเล่น</span>
                      </>
                    )}
                  </button>
                </div>

                <input
                  type="range"
                  min="0"
                  max="100"
                  value={volume}
                  onChange={(e) => setVolume(parseInt(e.target.value, 10))}
                  className="w-full accent-[#EAC272] cursor-pointer"
                />
              </div>

              {/* Thai Female Voice Speed Tuning */}
              <div className="rounded-2xl bg-[#110918]/80 p-4 border border-[rgba(242,203,128,0.15)] space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#C9B49D]">ความเร็วเสียงอ่านคำทำนาย:</span>
                  <div className="flex items-center gap-1.5">
                    {[0.85, 1.0, 1.15].map((spd) => (
                      <button
                        key={spd}
                        onClick={() => setVoiceSpeed(spd)}
                        className={`text-[10px] px-2 py-0.5 rounded-lg transition-all ${
                          voiceSpeed === spd
                            ? 'bg-[#EAC272] text-[#110918] font-bold'
                            : 'bg-[#1E0E2A] text-[#C9B49D] hover:text-[#FAE9CA]'
                        }`}
                      >
                        {spd}x
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleTestVoice}
                  className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-[#24102E] hover:bg-[#361A4A] py-2 text-xs font-semibold text-[#FAE9CA] border border-[rgba(242,203,128,0.2)] transition-all cursor-pointer"
                >
                  <Volume2 className="h-3.5 w-3.5 text-[#EAC272]" />
                  <span>ทดสอบเสียงอ่านดวงชะตาภาษาไทย</span>
                </button>
              </div>

              <div className="text-center">
                <button
                  onClick={() => setIsOpen(false)}
                  className="btn-gilded w-full py-2.5 text-xs font-bold text-[#110918]"
                >
                  เรียบร้อย
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
