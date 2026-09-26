import React, { useState } from 'react';
import { motion } from 'motion/react';
import { CardBackThemeId, CardFrontThemeId, TarotCard, OracleCard } from '../types';
import { playMysticChimeSound } from '../utils/speechHelper';
import tarotCoverImg from '../assets/images/tarot_cat_cover_1790238012657.jpg';
import oracleCoverImg from '../assets/images/oracle_cards_back_1790239349784.jpg';

interface CosmicCardRendererProps {
  card?: TarotCard | OracleCard | any;
  cardType?: 'tarot' | 'oracle' | 'generic';
  isFlipped?: boolean; // false = back shown, true = front shown
  isReversed?: boolean;
  backTheme?: CardBackThemeId;
  frontTheme?: CardFrontThemeId;
  interactive?: boolean;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showGlow?: boolean;
  onClick?: () => void;
  className?: string;
  badgeText?: string;
}

export const CARD_BACK_THEMES: Record<CardBackThemeId, {
  nameTh: string;
  nameEn: string;
  desc: string;
  bgGradient: string;
  borderColor: string;
  accentColor: string;
  patternType: string;
}> = {
  'gilded-velvet': {
    nameTh: 'กำมะหยี่ทองจักรวาล (Gilded Velvet)',
    nameEn: 'Gilded Velvet',
    desc: 'ลวดลายแมนดาลาสุริยันจันทรา กำมะหยี่ม่วงเข้มขลิบทองคำโบราณ',
    bgGradient: 'from-[#2D123A] via-[#1A0923] to-[#0F0515]',
    borderColor: '#EAC272',
    accentColor: '#FFDE9E',
    patternType: 'mandala',
  },
  'cosmic-midnight': {
    nameTh: 'รัตติกาลดาราจักร (Cosmic Midnight)',
    nameEn: 'Cosmic Midnight',
    desc: 'ผืนฟ้าดึกดำบรรพ์ แผนที่กลุ่มดาว 12 ราศี และประกายละอองดาวสีทอง',
    bgGradient: 'from-[#0D1322] via-[#090B14] to-[#040508]',
    borderColor: '#60A5FA',
    accentColor: '#93C5FD',
    patternType: 'constellation',
  },
  'honest-cat': {
    nameTh: 'เนตรแมวดำเจ้าปัญญา (The Honest Cat)',
    nameEn: 'Honest Cat Eyes',
    desc: 'ดวงตาสีทองอำพันของแมวแม่หมอ สะกดจิตใจ และยันต์แมวนำโชค',
    bgGradient: 'from-[#24130A] via-[#150A05] to-[#0A0503]',
    borderColor: '#F59E0B',
    accentColor: '#FDE68A',
    patternType: 'cat-sigil',
  },
  'emerald-oracle': {
    nameTh: 'มรกตมนตราโอราเคิล (Emerald Oracle)',
    nameEn: 'Emerald Oracle',
    desc: 'ศิลาหยกมรกตลึกลับ เถาว์ไม้ทองคำศักดิ์สิทธิ์ และอักขระรูนนอร์ส',
    bgGradient: 'from-[#0A261E] via-[#051712] to-[#020D0A]',
    borderColor: '#34D399',
    accentColor: '#A7F3D0',
    patternType: 'emerald-rune',
  },
  'crimson-sol': {
    nameTh: 'สุริยันต์สีชาด (Crimson Sol)',
    nameEn: 'Crimson Sol',
    desc: 'สีแดงทับทิมจักรพรรดิ ตราประทับสุริยเทพ และเปลวเพลิงบริสุทธิ์',
    bgGradient: 'from-[#3A0D15] via-[#20060B] to-[#100305]',
    borderColor: '#F87171',
    accentColor: '#FECACA',
    patternType: 'solar-halo',
  },
};

export const CosmicCardRenderer: React.FC<CosmicCardRendererProps> = ({
  card,
  cardType = 'tarot',
  isFlipped = true,
  isReversed = false,
  backTheme = 'gilded-velvet',
  frontTheme = 'gilded-foil',
  interactive = false,
  size = 'md',
  showGlow = true,
  onClick,
  className = '',
  badgeText,
}) => {
  const [localFlipped, setLocalFlipped] = useState(isFlipped);

  // Sync prop changes
  React.useEffect(() => {
    setLocalFlipped(isFlipped);
  }, [isFlipped]);

  const themeInfo = CARD_BACK_THEMES[backTheme] || CARD_BACK_THEMES['gilded-velvet'];

  const sizeDimensions = {
    xs: 'w-[64px] h-[100px] text-[8px]',
    sm: 'w-[100px] h-[155px] text-[10px]',
    md: 'w-[150px] h-[230px] text-xs',
    lg: 'w-[200px] h-[310px] text-sm',
    xl: 'w-[260px] h-[390px] text-base',
  }[size];

  const handleClick = () => {
    if (interactive) {
      playMysticChimeSound('card');
      setLocalFlipped(!localFlipped);
    }
    onClick?.();
  };

  // Render Pattern on Card Back
  const renderCardBackPattern = () => {
    return (
      <div className={`relative w-full h-full rounded-2xl bg-gradient-to-b ${themeInfo.bgGradient} p-2 flex flex-col items-center justify-between overflow-hidden shadow-2xl border-2 select-none`}
        style={{ borderColor: themeInfo.borderColor }}
      >
        {/* Outer and Inner Filigree Borders */}
        <div className="absolute inset-1.5 rounded-xl border border-dashed opacity-40 pointer-events-none" style={{ borderColor: themeInfo.accentColor }} />
        <div className="absolute inset-3 rounded-lg border opacity-20 pointer-events-none" style={{ borderColor: themeInfo.accentColor }} />

        {/* Top Arcane Mark */}
        <div className="w-full flex items-center justify-between px-2 pt-1 z-10 text-[10px]" style={{ color: themeInfo.accentColor }}>
          <span>✦</span>
          <span className="font-serif-display tracking-widest text-[9px] opacity-80 uppercase">
            {themeInfo.nameEn}
          </span>
          <span>✦</span>
        </div>

        {/* Center Mystical Art Motif */}
        <div className="relative flex-1 w-full flex items-center justify-center">
          {/* Radial Aura Glow */}
          <div className="absolute w-20 h-20 rounded-full blur-xl opacity-30" style={{ backgroundColor: themeInfo.borderColor }} />

          {themeInfo.patternType === 'cat-sigil' && (
            <svg viewBox="0 0 100 100" className="w-20 h-20 drop-shadow-lg" fill="none">
              <circle cx="50" cy="50" r="42" stroke={themeInfo.borderColor} strokeWidth="1.5" strokeDasharray="3 3" />
              <polygon points="50,15 80,75 20,75" stroke={themeInfo.accentColor} strokeWidth="1.2" opacity="0.6" />
              <polygon points="50,85 80,25 20,25" stroke={themeInfo.accentColor} strokeWidth="1.2" opacity="0.6" />
              {/* Cat Silhouette */}
              <path d="M36,65 C36,55 42,48 50,48 C58,48 64,55 64,65 Z" fill={themeInfo.borderColor} opacity="0.4" />
              <circle cx="50" cy="42" r="14" fill="#0A0503" stroke={themeInfo.borderColor} strokeWidth="1.5" />
              {/* Ears */}
              <polygon points="38,36 34,22 45,28" fill={themeInfo.borderColor} />
              <polygon points="62,36 66,22 55,28" fill={themeInfo.borderColor} />
              {/* Glowing Amber Eyes */}
              <ellipse cx="45" cy="42" rx="3.5" ry="2.5" fill="#FBBF24" />
              <ellipse cx="55" cy="42" rx="3.5" ry="2.5" fill="#FBBF24" />
              <circle cx="45" cy="42" r="1.2" fill="#000" />
              <circle cx="55" cy="42" r="1.2" fill="#000" />
            </svg>
          )}

          {themeInfo.patternType === 'mandala' && (
            <svg viewBox="0 0 100 100" className="w-24 h-24 drop-shadow-md animate-[spin_60s_linear_infinite]" fill="none">
              <circle cx="50" cy="50" r="40" stroke={themeInfo.borderColor} strokeWidth="1.5" />
              <circle cx="50" cy="50" r="32" stroke={themeInfo.accentColor} strokeWidth="1" strokeDasharray="4 2" />
              <circle cx="50" cy="50" r="22" stroke={themeInfo.borderColor} strokeWidth="1.2" />
              <circle cx="50" cy="50" r="10" fill={themeInfo.borderColor} opacity="0.3" />
              {/* 8-pointed star rays */}
              {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
                <line
                  key={i}
                  x1="50"
                  y1="10"
                  x2="50"
                  y2="90"
                  stroke={themeInfo.accentColor}
                  strokeWidth="0.8"
                  transform={`rotate(${angle} 50 50)`}
                  opacity="0.7"
                />
              ))}
              {/* Sun in center */}
              <circle cx="50" cy="50" r="6" fill={themeInfo.borderColor} />
            </svg>
          )}

          {themeInfo.patternType === 'constellation' && (
            <svg viewBox="0 0 100 100" className="w-22 h-22 drop-shadow-md" fill="none">
              <circle cx="50" cy="50" r="40" stroke="#60A5FA" strokeWidth="1.2" opacity="0.7" />
              <polygon points="50,16 61,38 85,38 66,54 73,78 50,64 27,78 34,54 15,38 39,38" stroke="#93C5FD" strokeWidth="1" opacity="0.6" />
              <circle cx="50" cy="50" r="14" stroke="#60A5FA" strokeWidth="1" strokeDasharray="2 2" />
              <circle cx="50" cy="50" r="4" fill="#E0F2FE" />
              {/* Constellation Dots */}
              <circle cx="35" cy="30" r="1.5" fill="#fff" />
              <circle cx="68" cy="28" r="1.5" fill="#fff" />
              <circle cx="75" cy="62" r="1.5" fill="#fff" />
              <circle cx="28" cy="65" r="1.5" fill="#fff" />
            </svg>
          )}

          {themeInfo.patternType === 'emerald-rune' && (
            <svg viewBox="0 0 100 100" className="w-22 h-22 drop-shadow-md" fill="none">
              <circle cx="50" cy="50" r="40" stroke="#34D399" strokeWidth="1.5" />
              <polygon points="50,15 80,50 50,85 20,50" stroke="#A7F3D0" strokeWidth="1.2" opacity="0.7" />
              <circle cx="50" cy="50" r="20" stroke="#34D399" strokeWidth="1" strokeDasharray="3 3" />
              {/* Runic Sigil / Algiz & Fehu blend */}
              <path d="M50,30 L50,70 M35,42 L50,55 L65,42" stroke="#6EE7B7" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          )}

          {themeInfo.patternType === 'solar-halo' && (
            <svg viewBox="0 0 100 100" className="w-22 h-22 drop-shadow-md" fill="none">
              <circle cx="50" cy="50" r="38" stroke="#F87171" strokeWidth="1.5" />
              <circle cx="50" cy="50" r="28" stroke="#FECACA" strokeWidth="1" strokeDasharray="4 2" />
              {/* Fiery Solar Flairs */}
              <circle cx="50" cy="50" r="16" fill="#F87171" opacity="0.35" stroke="#FCA5A5" strokeWidth="1.5" />
              <circle cx="50" cy="50" r="8" fill="#F87171" />
              {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg, idx) => (
                <line
                  key={idx}
                  x1="50"
                  y1={idx % 2 === 0 ? "14" : "18"}
                  x2="50"
                  y2="24"
                  stroke="#F87171"
                  strokeWidth="1.5"
                  transform={`rotate(${deg} 50 50)`}
                />
              ))}
            </svg>
          )}
        </div>

        {/* Bottom Logo Text */}
        <div className="w-full flex items-center justify-between px-2 pb-1 z-10 text-[9px]" style={{ color: themeInfo.accentColor }}>
          <span>⚜️</span>
          <span className="font-serif-display tracking-widest opacity-75">
            THE CAT ORACLE
          </span>
          <span>⚜️</span>
        </div>
      </div>
    );
  };

  // Roman Numerals for Tarot Cards
  const getRomanNumeral = (num: number): string => {
    const romans = ['0', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII', 'XIII', 'XIV', 'XV', 'XVI', 'XVII', 'XVIII', 'XIX', 'XX', 'XXI'];
    return romans[num] || String(num);
  };

  // Render Card Front Face
  const renderCardFrontFace = () => {
    const isOracle = cardType === 'oracle' || card?.category || card?.actionableStep;
    const cardTitleTh = card?.nameTh || card?.titleTh || card?.name_th || 'ไพ่แห่งดวงชะตา';
    const cardTitleEn = card?.name || card?.titleEn || card?.name_en || 'The Mystic Arcana';
    const symbolIcon = card?.imageSymbol || card?.catPose || '✨';
    const cardNumber = typeof card?.number === 'number' ? card.number : 0;
    const element = card?.element || 'Cosmos';

    // Front Theme Background Styles
    let bgClasses = 'bg-gradient-to-b from-[#24102E] via-[#1A0923] to-[#110918]';
    let borderStyles = 'border-2 border-[rgba(242,203,128,0.4)]';
    let textCream = 'text-[#FAE9CA]';
    let textGold = 'text-[#EAC272]';

    if (frontTheme === 'mystic-dark') {
      bgClasses = 'bg-gradient-to-b from-[#141419] via-[#0E0E12] to-[#08080A]';
      borderStyles = 'border-2 border-[#8B5CF6]/50 shadow-[0_0_15px_rgba(139,92,246,0.3)]';
    } else if (frontTheme === 'ancient-parchment') {
      bgClasses = 'bg-gradient-to-b from-[#2C2114] via-[#1F170E] to-[#140E08]';
      borderStyles = 'border-2 border-[#D97706]/60 shadow-[0_0_15px_rgba(217,119,6,0.2)]';
      textCream = 'text-[#FEF3C7]';
      textGold = 'text-[#F59E0B]';
    }

    return (
      <div className={`relative w-full h-full rounded-2xl ${bgClasses} ${borderStyles} p-3 flex flex-col justify-between overflow-hidden shadow-2xl select-none`}>
        {/* Foil Inset Border */}
        <div className="absolute inset-1 rounded-xl border border-[rgba(242,203,128,0.2)] pointer-events-none" />

        {/* Reversed Indicator Badge */}
        {isReversed && (
          <div className="absolute top-2 right-2 z-20 rounded-full bg-[#B3261E]/40 border border-[#B3261E] px-2 py-0.5 text-[8px] font-bold text-[#FFA4A4]">
            หัวกลับ
          </div>
        )}

        {/* Custom Header Badge */}
        {badgeText && (
          <div className="absolute top-2 left-2 z-20 rounded-full bg-[#EAC272]/20 border border-[#EAC272]/50 px-2 py-0.5 text-[8px] font-bold text-[#FFDE9E]">
            {badgeText}
          </div>
        )}

        {/* Card Header (Number & Archetype) */}
        <div className="flex items-center justify-between z-10 pt-0.5">
          <span className={`font-serif-display font-bold text-xs ${textGold}`}>
            {!isOracle && cardNumber !== undefined ? getRomanNumeral(cardNumber) : '✦'}
          </span>
          <span className="text-[9px] font-mono tracking-widest text-[#C9B49D] uppercase">
            {element}
          </span>
          <span className={`text-xs ${textGold}`}>✦</span>
        </div>

        {/* Center Artwork Symbol */}
        <div className={`relative flex-1 w-full flex flex-col items-center justify-center my-1 ${isReversed ? 'rotate-180' : ''}`}>
          {/* Subtle Halo */}
          <div className="absolute w-20 h-20 rounded-full bg-[#EAC272]/10 blur-xl pointer-events-none" />

          {/* Large Emoji / Icon Avatar */}
          <div className="relative z-10 flex items-center justify-center h-16 w-16 sm:h-20 sm:w-20 rounded-2xl bg-[#361A4A]/40 border border-[rgba(242,203,128,0.25)] shadow-inner">
            <span className="text-3xl sm:text-4xl filter drop-shadow-md select-none">
              {symbolIcon}
            </span>
          </div>

          {/* Quick Keywords or Cat Pose */}
          {card?.keywords && Array.isArray(card.keywords) && (
            <div className="mt-2 flex flex-wrap justify-center gap-1 max-w-[90%]">
              {card.keywords.slice(0, 2).map((k: string, i: number) => (
                <span key={i} className="text-[8px] px-1.5 py-0.2 rounded-full bg-[#110918]/80 text-[#C9B49D] border border-[rgba(242,203,128,0.1)]">
                  {k}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Card Title & Bottom Inscription */}
        <div className="z-10 text-center border-t border-[rgba(242,203,128,0.15)] pt-1.5 pb-0.5">
          <h4 className={`font-serif-display font-bold text-xs sm:text-sm ${textCream} leading-tight line-clamp-1`}>
            {cardTitleTh}
          </h4>
          <p className="text-[9px] text-[#C9B49D] line-clamp-1 font-sans">
            {cardTitleEn}
          </p>
        </div>
      </div>
    );
  };

  return (
    <div
      onClick={handleClick}
      className={`relative [perspective:1000px] cursor-pointer group ${sizeDimensions} ${className}`}
      title={interactive ? 'คลิกเพื่อพลิกไพ่' : undefined}
    >
      {/* Outer Glow on Hover */}
      {showGlow && (
        <div
          className="absolute -inset-1 rounded-2xl blur-md opacity-30 group-hover:opacity-75 transition-opacity pointer-events-none"
          style={{ backgroundColor: themeInfo.borderColor }}
        />
      )}

      {/* 3D Flippable Card Container */}
      <motion.div
        animate={{ rotateY: localFlipped ? 0 : 180 }}
        transition={{ duration: 0.55, ease: [0.25, 1, 0.5, 1] }}
        className="w-full h-full relative [transform-style:preserve-3d]"
      >
        {/* Front Face (0 deg) */}
        <div className="w-full h-full absolute inset-0 [backface-visibility:hidden]">
          {renderCardFrontFace()}
        </div>

        {/* Back Face (180 deg) */}
        <div className="w-full h-full absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)]">
          {renderCardBackPattern()}
        </div>
      </motion.div>
    </div>
  );
};
