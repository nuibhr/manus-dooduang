import React, { useEffect, useState } from 'react';
import {
  Sparkles,
  Coins,
  Receipt,
  MessageSquareHeart,
  History,
  Volume2,
  VolumeX,
  Flame,
  Zap,
  Sparkle,
  Palette,
  Sun,
  Moon,
  User,
  LogOut,
  LogIn
} from 'lucide-react';
import { DisciplineType, SassLevel, AppMode, FortuneReading } from '../types';
import { useMood } from '../context/MoodContext';
import { DISCIPLINE_NAV_ITEMS } from '../navigation';
import { FirebaseUser } from '../firebase';
import { ZodiacCompatibilityBadge, UserBirthProfile } from './ZodiacCompatibilityEngine';

export interface NavbarProps {
  activeDiscipline: DisciplineType;
  onChangeDiscipline: (d: DisciplineType) => void;
  appMode: AppMode;
  onChangeMode: (m: AppMode) => void;
  coins: number;
  onOpenPaymentModal: () => void;
  onOpenHistory: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  historyCount: number;
  isTellerAuthorized?: boolean;
  onOpenSynchronicityModal?: () => void;
  onOpenLotteryVault?: () => void;
  onOpenEconomicsModal?: () => void;
  onOpenWisdomLibrary?: () => void;
  onOpenMonthlyForecast?: () => void;
  onOpenZodiacCompatibility?: () => void;
  readingsHistory?: FortuneReading[];
  birthProfile?: UserBirthProfile | null;
  firebaseUser?: FirebaseUser | null;
  onSignInWithGoogle?: () => void;
  onSignOut?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeDiscipline,
  onChangeDiscipline,
  appMode,
  onChangeMode,
  coins,
  onOpenPaymentModal,
  onOpenHistory,
  soundEnabled,
  onToggleSound,
  historyCount,
  isTellerAuthorized = false,
  onOpenSynchronicityModal,
  onOpenLotteryVault,
  onOpenEconomicsModal,
  onOpenWisdomLibrary,
  onOpenMonthlyForecast,
  onOpenZodiacCompatibility,
  readingsHistory = [],
  birthProfile,
  firebaseUser = null,
  onSignInWithGoogle,
  onSignOut,
}) => {
  const { activeMoodConfig, resolvedScheme, toggleColorScheme, openMoodSelector } = useMood();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState<boolean>(false);
  const [isCompact, setIsCompact] = useState<boolean>(false);

  useEffect(() => {
    const handleScroll = () => setIsCompact(window.scrollY > 28);
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`liquid-header-shell sticky top-0 z-40 w-full transition-all ${isCompact ? 'is-compact' : ''}`}
      style={{
        backgroundColor: 'var(--cat-nav-bg)',
        borderColor: 'var(--cat-border)',
      }}
    >
      <div className="liquid-navbar mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">

        {/* Brand & Logo: ดูดวงค่ะอีหญิง */}
        <div
          onClick={() => onChangeDiscipline('daily')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="liquid-brand-orb flex h-11 w-11 items-center justify-center rounded-2xl transition-all">
            <span className="text-2xl filter drop-shadow-sm group-hover:scale-110 transition-transform">🐾</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-serif-display text-xl sm:text-2xl font-bold tracking-wide text-[#FAE9CA] group-hover:text-[#EAC272] transition-colors">
                ดูดวงค่ะอีหญิง
              </h1>
              <span className="liquid-chip rounded-full px-2 py-0.5 text-[10px] font-semibold">
                แม่หมอเหมียว
              </span>
            </div>
            <p className="text-[11px] text-[#C9B49D] tracking-wide">
              ดูดวงแบบไม่หวานเจี๊ยบ แต่ตรงจนมีสะดุ้ง ✨
            </p>
          </div>
        </div>

        {/* Center Mode Switcher - Hidden from clients, only visible if authorized teller */}
        {isTellerAuthorized && (
          <div className="flex items-center rounded-full bg-[#180B22] p-1 border border-[rgba(242,203,128,0.2)] shadow-inner">
            <button
              id="btn-mode-client"
              onClick={() => onChangeMode('client')}
              className={`flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-medium transition-all ${
                appMode === 'client'
                  ? 'bg-gradient-to-r from-[#EAC272] to-[#D4A84D] text-[#110918] font-bold shadow-md shadow-[#EAC272]/20'
                  : 'text-[#C9B49D] hover:text-[#FAE9CA]'
              }`}
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>ห้องดูดวงลูกดวง</span>
            </button>

            <button
              id="btn-mode-teller"
              onClick={() => onChangeMode('teller')}
              className={`flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-medium transition-all ${
                appMode === 'teller'
                  ? 'bg-gradient-to-r from-[#165B53] to-[#0E423C] text-[#FAE9CA] font-bold shadow-md'
                  : 'text-[#C9B49D] hover:text-[#FAE9CA]'
              }`}
            >
              <Receipt className="h-3.5 w-3.5 text-[#AEFFE4]" />
              <span className="flex items-center gap-1">
                ระบบบิลแม่หมอ
                <span className="rounded bg-[#AEFFE4]/20 px-1 py-0.2 text-[9px] text-[#AEFFE4]">
                  BACKOFFICE
                </span>
              </span>
            </button>
          </div>
        )}

        {/* Right Actions & Utilities */}
        <div className="liquid-action-cluster hidden items-center gap-2 md:flex md:gap-3">

          {/* User Coins & Top Up (1,250 🪙 style) */}
          <button
            id="btn-topup"
            onClick={onOpenPaymentModal}
            className="flex items-center gap-2 rounded-full bg-[#24102E] border border-[rgba(242,203,128,0.25)] px-3.5 py-1.5 text-xs font-semibold text-[#FAE9CA] hover:border-[#EAC272] hover:bg-[#361A4A] transition-all shadow-sm"
          >
            <span className="text-sm">🪙</span>
            <span className="font-serif-display text-sm tracking-wider text-[#EAC272]">{coins.toLocaleString()}</span>
            <span className="rounded-full bg-[#EAC272]/20 px-1.5 py-0.5 text-[10px] text-[#FFDE9E] font-sans font-bold">
              + เติม
            </span>
          </button>

          {/* Monthly Astrology Forecast (สรุปผล 4 ศาสตร์ประจำเดือน & แชร์รูปภาพ) */}
          {onOpenMonthlyForecast && (
            <button
              id="btn-nav-monthly-forecast"
              onClick={onOpenMonthlyForecast}
              className="flex items-center gap-1.5 rounded-full bg-gradient-to-r from-[#3D1452] to-[#240F35] border border-[#EAC272]/40 px-3 py-1.5 text-xs font-semibold text-[#FAE9CA] hover:border-[#EAC272] hover:scale-105 transition-all shadow-sm"
              title="สรุปดวง 4 ศาสตร์ประจำเดือน (Monthly Forecast & Shareable Image)"
            >
              <span className="text-xs">🌟</span>
              <span className="hidden md:inline text-[11px] text-[#EAC272] font-bold">ดวง 4 ศาสตร์</span>
            </button>
          )}

          {/* Fortune Wisdom Library (จัดกลุ่มตามศาสตร์ & หัวข้อ + Data Viz แนวโน้ม) */}
          {onOpenWisdomLibrary && (
            <button
              id="btn-nav-wisdom-library"
              onClick={onOpenWisdomLibrary}
              className="flex items-center gap-1.5 rounded-full bg-[#24102E] border border-[rgba(242,203,128,0.3)] px-3 py-1.5 text-xs font-semibold text-[#FAE9CA] hover:border-[#EAC272] hover:bg-[#361A4A] transition-all shadow-sm"
              title="คลังปัญญาชะตาชีวิต & วิเคราะห์แพทเทิร์นชีวิต (Wisdom Library)"
            >
              <span className="text-xs">📊</span>
              <span className="hidden lg:inline text-[11px] text-[#EAC272]">คลังปัญญา</span>
            </button>
          )}

          {/* Thai Credit Economics / Value Calculator */}
          {onOpenEconomicsModal && (
            <button
              id="btn-nav-economics"
              onClick={onOpenEconomicsModal}
              className="rounded-full bg-[#1E0E2A] border border-[rgba(242,203,128,0.2)] p-2 text-[#EAC272] hover:text-[#FAE9CA] hover:border-[#EAC272] transition-all"
              title="คำนวณความคุ้มค่า & เศรษฐศาสตร์เครดิต (LINE Mini App)"
            >
              <span className="text-xs">🧮</span>
            </button>
          )}

          {/* Fate Synchronicity & Cross-Reading Correlation */}
          {onOpenSynchronicityModal && (
            <button
              id="btn-nav-synchronicity"
              onClick={onOpenSynchronicityModal}
              className="rounded-full bg-[#1E0E2A] border border-[rgba(242,203,128,0.2)] p-2 text-[#EAC272] hover:text-[#FAE9CA] hover:border-[#EAC272] transition-all"
              title="เช็คความสัมพันธ์ของคำตอบ & สายใยชะตา"
            >
              <span className="text-xs">🔗</span>
            </button>
          )}

          {/* Lottery Statistics & Vault */}
          {onOpenLotteryVault && (
            <button
              id="btn-nav-lottery-vault"
              onClick={onOpenLotteryVault}
              className="rounded-full bg-[#1E0E2A] border border-[rgba(242,203,128,0.2)] p-2 text-[#EAC272] hover:text-[#FAE9CA] hover:border-[#EAC272] transition-all"
              title="สถิติหวยรัฐบาลไทยย้อนหลัง & คลังเลขที่คุณเคยเปิด"
            >
              <span className="text-xs">🎰</span>
            </button>
          )}

          {/* Interface Mood Selector */}
          <button
            id="btn-nav-mood"
            onClick={openMoodSelector}
            className="flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-all hover:scale-105 active:scale-95 shadow-sm"
            style={{
              backgroundColor: 'var(--cat-container)',
              borderColor: 'var(--cat-border)',
              color: 'var(--cat-cream)',
            }}
            title={`เลือกบรรยากาศ Mood (ปัจจุบัน: ${activeMoodConfig.nameTh})`}
          >
            <Palette className="h-3.5 w-3.5" style={{ color: 'var(--cat-gold)' }} />
            <span className="text-xs">{activeMoodConfig.icon}</span>
            <span className="hidden md:inline text-[11px] font-medium" style={{ color: 'var(--cat-cream)' }}>
              {activeMoodConfig.nameEn}
            </span>
            <span
              className="h-2 w-2 rounded-full hidden sm:inline-block"
              style={{ backgroundColor: activeMoodConfig.previewColors.accent }}
            />
          </button>

          <button
            id="btn-nav-color-scheme"
            type="button"
            onClick={toggleColorScheme}
            className="liquid-icon-button rounded-full border p-2"
            aria-label={resolvedScheme === 'dark' ? 'เปลี่ยนเป็นธีมสว่าง' : 'เปลี่ยนเป็นธีมมืด'}
            title={resolvedScheme === 'dark' ? 'Light Liquid Glass' : 'Dark Liquid Glass'}
          >
            {resolvedScheme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
          {/* History Drawer */}
          <button
            id="btn-nav-history"
            onClick={onOpenHistory}
            className="relative rounded-full bg-[#1E0E2A] border border-[rgba(242,203,128,0.16)] p-2 text-[#C9B49D] hover:text-[#FAE9CA] hover:border-[rgba(242,203,128,0.35)] transition-all"
            title="บันทึกคำพยากรณ์"
          >
            <History className="h-4 w-4" />
            {historyCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#842C71] text-[9px] font-bold text-[#FAE9CA] border border-[rgba(242,203,128,0.3)]">
                {historyCount}
              </span>
            )}
          </button>

          {/* Zodiac Compatibility Badge (ราศีคู่บุญหนุนดวง) */}
          {onOpenZodiacCompatibility && (
            <div className="hidden sm:block">
              <ZodiacCompatibilityBadge
                readingsHistory={readingsHistory}
                birthProfile={birthProfile}
                onClick={onOpenZodiacCompatibility}
              />
            </div>
          )}

          {/* Sound Toggle (Thai Female Voice & Cat Purr) */}
          <button
            id="btn-nav-sound"
            onClick={onToggleSound}
            className={`rounded-full border p-2 transition-all ${
              soundEnabled
                ? 'bg-[#361A4A] border-[rgba(242,203,128,0.4)] text-[#EAC272]'
                : 'bg-[#1E0E2A] border-[rgba(242,203,128,0.12)] text-[#C9B49D]'
            }`}
            title={soundEnabled ? 'เสียงพูดแม่หมอภาษาไทย (เปิดอยู่)' : 'เปิดเสียงพูดแม่หมอ'}
          >
            {soundEnabled ? <Volume2 className="h-4 w-4 text-[#EAC272]" /> : <VolumeX className="h-4 w-4 text-[#C9B49D]/60" />}
          </button>

          {/* Google Sign-in & User Profile */}
          {firebaseUser ? (
            <div className="relative">
              <button
                id="btn-nav-user-profile"
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2 rounded-full border border-[#EAC272]/50 bg-[#250F35] p-1 pr-2.5 text-xs font-semibold text-[#FAE9CA] hover:border-[#EAC272] transition-all"
                title={firebaseUser.displayName || firebaseUser.email || 'ผู้ใช้งาน'}
              >
                {firebaseUser.photoURL ? (
                  <img
                    src={firebaseUser.photoURL}
                    alt={firebaseUser.displayName || 'User'}
                    className="h-6 w-6 rounded-full object-cover border border-[#EAC272]/40"
                  />
                ) : (
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#EAC272] text-[10px] font-bold text-[#110918]">
                    {firebaseUser.displayName?.charAt(0) || 'U'}
                  </div>
                )}
                <span className="hidden md:inline max-w-[90px] truncate text-[11px]">
                  {firebaseUser.displayName?.split(' ')[0] || 'บัญชีฉัน'}
                </span>
              </button>

              {/* User Dropdown */}
              {isUserMenuOpen && (
                <div className="liquid-popover absolute right-0 top-full mt-2 w-48 rounded-2xl p-2 z-50 animate-in fade-in zoom-in-95">
                  <div className="px-3 py-2 border-b border-[#EAC272]/15">
                    <p className="text-xs font-bold text-[#FAE9CA] truncate">
                      {firebaseUser.displayName || 'ผู้ใช้สำนักแมว'}
                    </p>
                    <p className="text-[10px] text-[#C9B49D] truncate">
                      {firebaseUser.email}
                    </p>
                  </div>
                  <div className="py-1">
                    {onSignOut && (
                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          onSignOut();
                        }}
                        className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-rose-300 hover:bg-rose-950/30 rounded-xl transition-colors text-left"
                      >
                        <LogOut className="h-3.5 w-3.5" />
                        <span>ออกจากระบบ</span>
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : (
            onSignInWithGoogle && (
              <button
                id="btn-nav-signin"
                onClick={onSignInWithGoogle}
                className="flex items-center gap-1.5 rounded-full bg-gradient-to-r from-[#EAC272] to-[#D4A84D] px-3.5 py-1.5 text-xs font-bold text-[#110918] shadow-md hover:scale-105 active:scale-95 transition-transform"
                title="เข้าสู่ระบบด้วย Google เพื่อบันทึกดวงชะตาและเหรียญลงคลาวด์"
              >
                <LogIn className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">เข้าสู่ระบบ</span>
              </button>
            )
          )}
        </div>
        <button
          type="button"
          onClick={toggleColorScheme}
          className="liquid-icon-button ml-auto rounded-full border p-2.5 md:hidden"
          aria-label={resolvedScheme === 'dark' ? 'เปลี่ยนเป็นธีมสว่าง' : 'เปลี่ยนเป็นธีมมืด'}
          title={resolvedScheme === 'dark' ? 'Light Liquid Glass' : 'Dark Liquid Glass'}
        >
          {resolvedScheme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>
      </div>

      {/* Disciplines Navigation Bar (When in Client Mode) */}
      {appMode === 'client' && (
        <div className="liquid-dock-shell relative hidden px-2 py-2 md:block sm:px-6">
          {/* Subtle mobile gradient indicators for scrollability */}
          <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-4 bg-gradient-to-r from-[#180B22] to-transparent z-10 sm:hidden" />
          <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-4 bg-gradient-to-l from-[#180B22] to-transparent z-10 sm:hidden" />

          <div className="liquid-dock mx-auto flex max-w-7xl items-center sm:justify-center gap-1.5 sm:gap-2.5 overflow-x-auto py-1.5 px-2 no-scrollbar scroll-smooth">
            {DISCIPLINE_NAV_ITEMS.map((d) => {
              const isActive = activeDiscipline === d.id;
              return (
                <button
                  key={d.id}
                  id={`nav-discipline-${d.id}`}
                  onClick={() => onChangeDiscipline(d.id)}
                  className={`liquid-tab flex shrink-0 items-center gap-1.5 sm:gap-2 whitespace-nowrap rounded-full px-3 sm:px-4 py-1.5 text-xs transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-[#361A4A] to-[#24102E] text-[#FAE9CA] border border-[rgba(242,203,128,0.5)] shadow-lg shadow-[#110918] font-bold ring-1 ring-[#EAC272]/30'
                      : 'text-[#C9B49D] hover:bg-[#24102E]/60 hover:text-[#FAE9CA] border border-transparent'
                  }`}
                >
                  <span className="text-sm">{d.icon}</span>
                  <span className={isActive ? 'text-[#FAE9CA]' : 'text-[#C9B49D]'}>{d.name}</span>
                  <span className={`text-[10px] px-1.5 sm:px-2 py-0.2 rounded-full ${
                    isActive ? 'bg-[#EAC272]/20 text-[#EAC272] border border-[#EAC272]/30' : 'bg-[#110918] text-[#C9B49D]/70'
                  }`}>
                    {d.tag}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
};
