import React from 'react';
import { motion } from 'motion/react';
import { OracleCard, CardBackThemeId } from '../types';
const oracleCoverImg = '/manus-storage/oracle_cards_back_1790239349784_ea0987c6.jpg';
import { CARD_BACK_THEMES } from './CosmicCardRenderer';

interface HonestCatCardProps {
  card: OracleCard;
  isSelected?: boolean;
  onClick?: () => void;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  isFlipped?: boolean;
  showBack?: boolean;
  customClass?: string;
  backTheme?: CardBackThemeId;
}

export const HonestCatCard: React.FC<HonestCatCardProps> = ({
  card,
  isSelected = false,
  onClick,
  size = 'md',
  isFlipped = false,
  showBack = false,
  customClass = '',
  backTheme = 'gilded-velvet',
}) => {
  // Height & Width based on size
  const sizeClasses = {
    xs: 'w-[56px] h-[86px] text-[8px]',
    sm: 'w-[105px] h-[155px] text-[10px]',
    md: 'w-[145px] h-[215px] text-xs',
    lg: 'w-[200px] h-[295px] text-sm',
  }[size];

  // Specific procedural ink wash artwork for cheeky cats
  const renderCatInkArt = () => {
    return (
      <div className="relative flex-1 w-full flex items-center justify-center overflow-hidden my-1">
        {/* Purple watercolor ink wash splatter in background */}
        <div className="absolute inset-0 bg-radial from-[#9333ea]/35 via-[#6b21a8]/20 to-transparent rounded-full blur-[10px] scale-90" />

        {/* Ink brush circles and linework */}
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full max-w-[80px] max-h-[80px] drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Rough Ink wash blob */}
          <path
            d="M30 25 C45 10, 75 15, 80 35 C85 55, 75 80, 50 85 C25 90, 15 70, 20 45 Z"
            fill="rgba(147, 51, 234, 0.25)"
          />
          <path
            d="M35 30 C50 18, 70 22, 75 40 C80 58, 68 78, 48 80 C28 82, 22 65, 26 42 Z"
            fill="rgba(192, 132, 252, 0.15)"
          />

          {/* Rough cheeky ink linework cat */}
          {/* Head & Ears */}
          <path
            d="M30 45 L25 22 L42 33 C47 31, 53 31, 58 33 L75 22 L70 45 C77 55, 75 70, 68 76 C58 84, 42 84, 32 76 C25 70, 23 55, 30 45 Z"
            stroke="#FAE9CA"
            strokeWidth="2.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="#180A22"
          />

          {/* Inner ears with purple ink */}
          <path d="M29 27 L33 38 L39 34 Z" fill="#A855F7" />
          <path d="M71 27 L67 38 L61 34 Z" fill="#A855F7" />

          {/* Cheeky Cat Eyes (Expressive Ink Strokes) */}
          <ellipse cx="40" cy="50" rx="4.5" ry="3.5" fill="#EAC272" stroke="#FAE9CA" strokeWidth="1.2" />
          <ellipse cx="60" cy="50" rx="4.5" ry="3.5" fill="#EAC272" stroke="#FAE9CA" strokeWidth="1.2" />
          <circle cx="40" cy="50" r="2" fill="#110918" />
          <circle cx="60" cy="50" r="2" fill="#110918" />

          {/* Nose & Cheeky Smirk */}
          <path d="M48 57 L52 57 L50 60 Z" fill="#F472B6" />
          <path
            d="M44 63 Q50 68 50 60 Q50 68 56 63"
            stroke="#FAE9CA"
            strokeWidth="2"
            strokeLinecap="round"
          />

          {/* Whiskers */}
          <path d="M20 54 L34 56 M18 60 L34 60 M20 66 L34 64" stroke="#FAE9CA" strokeWidth="1.4" strokeLinecap="round" />
          <path d="M80 54 L66 56 M82 60 L66 60 M80 66 L66 64" stroke="#FAE9CA" strokeWidth="1.4" strokeLinecap="round" />

          {/* Ink splatters */}
          <circle cx="78" cy="76" r="1.5" fill="#C084FC" />
          <circle cx="84" cy="70" r="0.8" fill="#C084FC" />
          <circle cx="16" cy="38" r="1.2" fill="#C084FC" />
        </svg>

        {/* Emoji/Pose badge */}
        {card.catPose && (
          <span className="absolute bottom-1 right-2 text-sm drop-shadow-md select-none">
            {card.catPose}
          </span>
        )}
      </div>
    );
  };

  // Card Back Presentation with Luxury Oracle Celestial Gold Foil Art or Custom Theme
  const renderCardBack = () => {
    const themeInfo = CARD_BACK_THEMES[backTheme];
    if (backTheme !== 'gilded-velvet' && themeInfo) {
      return (
        <div
          className={`w-full h-full rounded-2xl border-2 shadow-2xl relative overflow-hidden select-none bg-gradient-to-b ${themeInfo.bgGradient} flex flex-col items-center justify-between p-2`}
          style={{ borderColor: themeInfo.borderColor }}
        >
          <div className="w-full flex items-center justify-between px-1 text-[8px]" style={{ color: themeInfo.accentColor }}>
            <span>✦</span>
            <span className="font-serif-display uppercase tracking-widest">{themeInfo.nameEn}</span>
            <span>✦</span>
          </div>
          <div className="relative flex items-center justify-center">
            <span className="text-3xl filter drop-shadow">🐾</span>
          </div>
          <div className="w-full text-center text-[8px] font-serif-display" style={{ color: themeInfo.accentColor }}>
            THE CAT ORACLE
          </div>
        </div>
      );
    }

    return (
      <div
        className={`w-full h-full rounded-2xl border-2 border-[#EAC272]/60 shadow-2xl relative overflow-hidden select-none bg-[#120818]`}
      >
        <img
          src={oracleCoverImg}
          alt="Oracle Card Back"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 border border-[#EAC272]/30 pointer-events-none rounded-2xl" />
      </div>
    );
  };

  // Card Front Presentation
  const renderCardFront = () => (
    <div
      className={`w-full h-full rounded-2xl bg-gradient-to-b from-[#220E2E] via-[#170821] to-[#0D0412] border-2 ${
        isSelected
          ? 'border-[#EAC272] shadow-[0_0_20px_rgba(234,194,114,0.45)] ring-2 ring-[#EAC272]/50'
          : 'border-[rgba(242,203,128,0.25)] shadow-xl hover:border-[#EAC272]/70'
      } p-2 flex flex-col justify-between relative overflow-hidden select-none`}
    >
      {/* Delicate gilded outer border lines */}
      <div className="absolute inset-1 rounded-xl border border-[rgba(242,203,128,0.15)] pointer-events-none" />

      {/* Decorative top corner ink marks */}
      <div className="flex items-center justify-between px-1 pt-0.5 z-10">
        <span className="text-[10px] text-[#EAC272]/60">✦</span>
        <span className="text-[9px] text-[#C084FC]/90 font-mono tracking-widest uppercase">
          {card.category}
        </span>
        <span className="text-[10px] text-[#EAC272]/60">✦</span>
      </div>

      {/* Expressive Cheeky Ink Art Area */}
      {renderCatInkArt()}

      {/* English Title Only (No numbers on card as strictly mandated) */}
      <div className="z-10 text-center pb-1 pt-0.5 border-t border-[rgba(242,203,128,0.12)]">
        <h4 className="font-serif-display font-bold text-[#FAE9CA] tracking-wide leading-tight line-clamp-1">
          {card.name_en || card.titleEn}
        </h4>
      </div>
    </div>
  );

  // If statically showing back only
  if (showBack && !isFlipped) {
    return (
      <motion.div
        whileHover={{ y: -4, scale: 1.03 }}
        whileTap={{ scale: 0.98 }}
        onClick={onClick}
        className={`${sizeClasses} ${customClass} cursor-pointer transition-all duration-300`}
      >
        {renderCardBack()}
      </motion.div>
    );
  }

  // If 3D flip capable
  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`${sizeClasses} ${customClass} cursor-pointer relative [perspective:1000px]`}
    >
      <motion.div
        animate={{ rotateY: isFlipped ? 0 : showBack ? 180 : 0 }}
        transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
        className="w-full h-full relative [transform-style:preserve-3d]"
      >
        {/* Front Face */}
        <div className="w-full h-full [backface-visibility:hidden]">
          {renderCardFront()}
        </div>

        {/* Back Face */}
        <div className="w-full h-full absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)]">
          {renderCardBack()}
        </div>
      </motion.div>
    </motion.div>
  );
};
