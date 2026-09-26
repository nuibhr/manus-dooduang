import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  RotateCw, 
  Check, 
  Palette, 
  Sliders, 
  Volume2, 
  VolumeX, 
  Info, 
  Eye, 
  Flame,
  Shield,
  Layers
} from 'lucide-react';
import { CardBackThemeId, CardFrontThemeId, CardDesignSettings } from '../types';
import { CosmicCardRenderer, CARD_BACK_THEMES } from './CosmicCardRenderer';
import { playMysticChimeSound, playCatPurrSound } from '../utils/speechHelper';
import { TAROT_DECK } from '../data/tarotData';

interface CardDesignStudioProps {
  currentSettings?: CardDesignSettings;
  initialSettings?: CardDesignSettings;
  onSaveSettings: (settings: CardDesignSettings) => void;
  onShowToast: (msg: string) => void;
}

export const CardDesignStudio: React.FC<CardDesignStudioProps> = ({
  currentSettings,
  initialSettings,
  onSaveSettings,
  onShowToast,
}) => {
  const activeInitial = initialSettings || currentSettings || {
    backTheme: 'gilded-velvet',
    frontTheme: 'gilded-foil',
    showGoldFoilGlow: true,
    soundEffectsEnabled: true,
  };
  const [backTheme, setBackTheme] = useState<CardBackThemeId>(activeInitial.backTheme || 'gilded-velvet');
  const [frontTheme, setFrontTheme] = useState<CardFrontThemeId>(activeInitial.frontTheme || 'gilded-foil');
  const [showGlow, setShowGlow] = useState<boolean>(activeInitial.showGoldFoilGlow ?? true);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(activeInitial.soundEffectsEnabled ?? true);
  
  // Interactive preview card state
  const [isFlipped, setIsFlipped] = useState<boolean>(false); // Start with back preview
  const [sampleCardIndex, setSampleCardIndex] = useState<number>(19); // The Sun
  const sampleCard = TAROT_DECK[sampleCardIndex] || TAROT_DECK[0];

  const handleFlipCard = () => {
    if (soundEnabled) playMysticChimeSound('card');
    setIsFlipped(!isFlipped);
  };

  const handleSelectBackTheme = (themeId: CardBackThemeId) => {
    if (soundEnabled) playMysticChimeSound('chime');
    setBackTheme(themeId);
  };

  const handleSelectFrontTheme = (fId: CardFrontThemeId) => {
    if (soundEnabled) playMysticChimeSound('chime');
    setFrontTheme(fId);
  };

  const handleSave = () => {
    playCatPurrSound();
    if (soundEnabled) playMysticChimeSound('gold');

    const newSettings: CardDesignSettings = {
      backTheme,
      frontTheme,
      showGoldFoilGlow: showGlow,
      soundEffectsEnabled: soundEnabled,
    };

    onSaveSettings(newSettings);
    localStorage.setItem('thecatroom_card_settings', JSON.stringify(newSettings));
    onShowToast('✨ บันทึกลวดลายไพ่เรียบร้อย! ระบบจะใช้ลายนี้ในทุกศาสตร์และมินิเกม');
  };

  // Sample cards to cycle through
  const sampleOptions = [
    { idx: 19, name: 'The Sun (พระอาทิตย์)' },
    { idx: 0, name: 'The Fool (คนโง่เขลา)' },
    { idx: 10, name: 'Wheel of Fortune (กงล้อชะตา)' },
    { idx: 18, name: 'The Moon (ดวงจันทร์)' },
    { idx: 17, name: 'The Star (ดวงดาว)' },
    { idx: 13, name: 'Death (การเปลี่ยนแปลง)' },
  ];

  return (
    <div className="space-y-6">
      {/* Studio Header Banner */}
      <div className="relative overflow-hidden rounded-[28px] border border-[rgba(242,203,128,0.25)] bg-gradient-to-r from-[#2A0E35] via-[#1B0A24] to-[#110517] p-6 sm:p-8 shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <div className="inline-flex items-center gap-2 rounded-full bg-[#842C71]/40 px-3 py-1 text-xs font-semibold text-[#FFDE9E] border border-[rgba(242,203,128,0.3)]">
              <span>🎴 สตูดิโอออกแบบหน้าไพ่และหลังไพ่ (Card Design Studio)</span>
            </div>
            <h2 className="font-serif-display text-2xl sm:text-3xl font-bold text-[#FAE9CA]">
              ปรับแต่งมนตรา & ลวดลายสำรับไพ่ส่วนตัว
            </h2>
            <p className="text-xs sm:text-sm text-[#C9B49D] max-w-xl">
              เลือกหลังไพ่กำมะหยี่ทองโบราณ สุริยันต์สีชาด หรือเนตรแมวดำ พร้อมปรับสไตล์หน้าไพ่ทองคำโบราณที่คุณชื่นชอบ ลายที่เลือกจะแสดงผลทันทีในการเปิดไพ่ 78 ใบ และมินิเกมเสี่ยงดวง
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              id="btn-save-card-design"
              onClick={handleSave}
              className="btn-gilded flex items-center gap-2 px-6 py-3 text-xs sm:text-sm font-bold text-[#110918] cursor-pointer"
            >
              <Check className="h-4 w-4" />
              <span>บันทึกและใช้งานลายนี้</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Studio Grid: Left Previewer & Right Customizer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Interactive 3D Card Preview Stage (5 cols) */}
        <div className="lg:col-span-5 velvet-card rounded-[28px] p-6 flex flex-col items-center justify-between relative overflow-hidden">
          <div className="w-full flex items-center justify-between border-b border-[rgba(242,203,128,0.15)] pb-3">
            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4 text-[#EAC272]" />
              <span className="text-xs font-bold text-[#FAE9CA]">
                พรีวิวแบบเรียลไทม์ 3D ({isFlipped ? 'หน้าไพ่' : 'หลังไพ่'})
              </span>
            </div>

            <button
              onClick={handleFlipCard}
              className="flex items-center gap-1.5 rounded-full bg-[#361A4A] hover:bg-[#842C71] text-[#FAE9CA] text-xs font-semibold px-3 py-1 border border-[rgba(242,203,128,0.3)] transition-all"
            >
              <RotateCw className="h-3.5 w-3.5 text-[#EAC272]" />
              <span>คลิกเพื่อพลิกไพ่</span>
            </button>
          </div>

          {/* Interactive Card Presentation Stage */}
          <div className="my-8 flex flex-col items-center justify-center">
            <div className="cursor-pointer transition-transform hover:scale-105 active:scale-95 duration-300">
              <CosmicCardRenderer
                card={sampleCard}
                isFlipped={isFlipped}
                backTheme={backTheme}
                frontTheme={frontTheme}
                showGlow={showGlow}
                interactive={true}
                size="lg"
                badgeText={isFlipped ? 'ตัวอย่างหน้าไพ่' : 'ตัวอย่างหลังไพ่'}
              />
            </div>
            <p className="mt-4 text-[11px] text-[#C9B49D] text-center">
              💡 แตะที่ตัวไพ่หรือกดปุ่มเพื่อดูการหมุนพลิก 3D ระหว่างหน้าไพ่และหลังไพ่
            </p>
          </div>

          {/* Sample Card Switcher */}
          <div className="w-full bg-[#110918]/80 rounded-2xl p-3 border border-[rgba(242,203,128,0.15)] space-y-2">
            <span className="text-[11px] text-[#C9B49D] block font-medium">
              สลับดูตัวอย่างหน้าไพ่ใบอื่น:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {sampleOptions.map((opt) => (
                <button
                  key={opt.idx}
                  onClick={() => {
                    if (soundEnabled) playMysticChimeSound('card');
                    setSampleCardIndex(opt.idx);
                    setIsFlipped(true); // Flip to front to see it
                  }}
                  className={`text-[10px] px-2.5 py-1 rounded-lg transition-all ${
                    sampleCardIndex === opt.idx
                      ? 'bg-[#EAC272] text-[#110918] font-bold shadow'
                      : 'bg-[#1E0E2A] text-[#C9B49D] hover:text-[#FAE9CA] border border-[rgba(242,203,128,0.15)]'
                  }`}
                >
                  {opt.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Customization Controls (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          
          {/* Section 1: Card Back Selection */}
          <div className="velvet-card rounded-[28px] p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-base">🎴</span>
                <h3 className="font-serif-display text-lg text-[#FAE9CA]">
                  1. เลือกลาย "หลังไพ่" (Card Back Themes)
                </h3>
              </div>
              <span className="text-xs text-[#EAC272] font-semibold">
                เลือกแล้ว: {CARD_BACK_THEMES[backTheme]?.nameEn}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {(Object.keys(CARD_BACK_THEMES) as CardBackThemeId[]).map((themeKey) => {
                const t = CARD_BACK_THEMES[themeKey];
                const isSelected = backTheme === themeKey;

                return (
                  <motion.div
                    key={themeKey}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleSelectBackTheme(themeKey)}
                    className={`relative cursor-pointer rounded-2xl p-4 transition-all border ${
                      isSelected
                        ? 'bg-[#842C71]/35 border-2 border-[#EAC272] ring-2 ring-[#EAC272]/30 shadow-xl'
                        : 'bg-[#110918]/80 border-[rgba(242,203,128,0.15)] hover:border-[rgba(242,203,128,0.4)]'
                    }`}
                  >
                    {/* Active check pill */}
                    {isSelected && (
                      <span className="absolute top-2 right-2 rounded-full bg-[#EAC272] p-1 text-[#110918]">
                        <Check className="h-3 w-3 stroke-[3]" />
                      </span>
                    )}

                    <div className="flex items-start gap-3">
                      {/* Mini Card Back Preview Thumbnail */}
                      <div className="shrink-0 w-12 h-16 rounded-lg overflow-hidden border border-[#EAC272]/50 shadow relative">
                        <CosmicCardRenderer
                          card={sampleCard}
                          isFlipped={false}
                          backTheme={themeKey}
                          size="xs"
                          showGlow={false}
                        />
                      </div>

                      <div className="space-y-1">
                        <h4 className="text-xs font-bold text-[#FAE9CA]">
                          {t.nameTh}
                        </h4>
                        <p className="text-[10px] text-[#C9B49D] leading-relaxed line-clamp-2">
                          {t.desc}
                        </p>
                        <div className="flex items-center gap-1.5 pt-1">
                          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: t.borderColor }} />
                          <span className="text-[9px] text-[#EAC272] font-mono">
                            {themeKey.toUpperCase()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Section 2: Card Front Theme Selection */}
          <div className="velvet-card rounded-[28px] p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-base">✨</span>
                <h3 className="font-serif-display text-lg text-[#FAE9CA]">
                  2. เลือกสไตล์ "หน้าไพ่" (Card Face Styles)
                </h3>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                {
                  id: 'gilded-foil' as CardFrontThemeId,
                  title: 'Gilded Foil (ทองคำโบราณ)',
                  desc: 'กรอบทองคำวิจิตรอลังการ สัญลักษณ์ธาตุเปล่งประกาย คอนทราสต์ลึก',
                  icon: '👑',
                  accent: '#EAC272',
                },
                {
                  id: 'mystic-dark' as CardFrontThemeId,
                  title: 'Mystic Obsidian (ออบซิเดียน)',
                  desc: 'กรอบสีดำมืดมิด ล้อมออร่าสีม่วงเรืองแสง สไตล์แม่หมอไซเบอร์มินิมอล',
                  icon: '🔮',
                  accent: '#8B5CF6',
                },
                {
                  id: 'ancient-parchment' as CardFrontThemeId,
                  title: 'Ancient Parchment (กระดาษคัมภีร์)',
                  desc: 'โทนกระดาษสาโบราณสีน้ำตาลอบอุ่น อารมณ์ไพ่ยิปซีโบราณยุคเรเนซองส์',
                  icon: '📜',
                  accent: '#D97706',
                },
              ].map((f) => {
                const isSel = frontTheme === f.id;
                return (
                  <div
                    key={f.id}
                    onClick={() => handleSelectFrontTheme(f.id)}
                    className={`cursor-pointer rounded-2xl p-4 transition-all border ${
                      isSel
                        ? 'bg-[#842C71]/35 border-2 border-[#EAC272] ring-2 ring-[#EAC272]/30 shadow-lg'
                        : 'bg-[#110918]/80 border-[rgba(242,203,128,0.15)] hover:border-[rgba(242,203,128,0.4)]'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xl">{f.icon}</span>
                      <h4 className="text-xs font-bold text-[#FAE9CA]">{f.title}</h4>
                    </div>
                    <p className="text-[10px] text-[#C9B49D] leading-relaxed">
                      {f.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 3: Extra Sensory Options (Glow & Sounds) */}
          <div className="velvet-card rounded-[28px] p-6 space-y-4">
            <h3 className="font-serif-display text-base text-[#FAE9CA] flex items-center gap-2">
              <Sliders className="h-4 w-4 text-[#EAC272]" />
              <span>3. การตั้งค่าเอฟเฟกต์และเสียงสัมผัสไพ่</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Gold Glow Toggle */}
              <div className="flex items-center justify-between rounded-2xl bg-[#110918]/80 p-3.5 border border-[rgba(242,203,128,0.15)]">
                <div>
                  <h4 className="text-xs font-bold text-[#FAE9CA]">แสงออร่าเรืองทองรอบการ์ด</h4>
                  <p className="text-[10px] text-[#C9B49D]">เพิ่มแสงประกายรัศมีเวลาสัมผัสไพ่</p>
                </div>
                <button
                  onClick={() => setShowGlow(!showGlow)}
                  className={`h-6 w-11 rounded-full p-1 transition-colors ${
                    showGlow ? 'bg-[#EAC272]' : 'bg-[#361A4A]'
                  }`}
                >
                  <div
                    className={`h-4 w-4 rounded-full bg-[#110918] transition-transform ${
                      showGlow ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Sound Effect Toggle */}
              <div className="flex items-center justify-between rounded-2xl bg-[#110918]/80 p-3.5 border border-[rgba(242,203,128,0.15)]">
                <div>
                  <h4 className="text-xs font-bold text-[#FAE9CA]">เสียงพลิกไพ่และกระดิ่งมนตรา</h4>
                  <p className="text-[10px] text-[#C9B49D]">เสียงสไลด์ไพ่จำลองระดับเสมือนจริง</p>
                </div>
                <button
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  className={`h-6 w-11 rounded-full p-1 transition-colors ${
                    soundEnabled ? 'bg-[#EAC272]' : 'bg-[#361A4A]'
                  }`}
                >
                  <div
                    className={`h-4 w-4 rounded-full bg-[#110918] transition-transform ${
                      soundEnabled ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Bottom Save Action */}
            <div className="pt-2">
              <button
                onClick={handleSave}
                className="btn-gilded w-full flex items-center justify-center gap-2 py-3.5 text-sm font-bold text-[#110918] cursor-pointer"
              >
                <Sparkles className="h-4 w-4" />
                <span>บันทึกลวดลายไพ่และเริ่มใช้งานทันที</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
