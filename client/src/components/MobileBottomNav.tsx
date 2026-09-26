import React, { useEffect, useState } from 'react';
import type { LucideIcon } from 'lucide-react';
import {
  BookOpenCheck,
  CalendarDays,
  CircleDot,
  Coins,
  Dices,
  Gem,
  Grid2X2,
  Hash,
  History,
  MessageCircleMore,
  Monitor,
  Moon,
  Palette,
  Paintbrush,
  PawPrint,
  Sparkles,
  Sun,
  WandSparkles,
} from 'lucide-react';
import { useMood } from '../context/MoodContext';
import { DISCIPLINE_NAV_ITEMS, MOBILE_PRIMARY_DISCIPLINES } from '../navigation';
import type { DisciplineType } from '../types';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from './ui/sheet';

interface MobileBottomNavProps {
  activeDiscipline: DisciplineType;
  onChangeDiscipline: (discipline: DisciplineType) => void;
  onOpenHistory: () => void;
  onOpenPaymentModal: () => void;
  disabled?: boolean;
}

const DISCIPLINE_ICONS: Record<DisciplineType, LucideIcon> = {
  daily: PawPrint,
  minigame: Dices,
  card_studio: Paintbrush,
  calendar: CalendarDays,
  numbers: Hash,
  tarot: Sparkles,
  oracle: Gem,
  rune: CircleDot,
  chinese: WandSparkles,
  chat: MessageCircleMore,
};

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeDiscipline,
  onChangeDiscipline,
  onOpenHistory,
  onOpenPaymentModal,
  disabled = false,
}) => {
  const {
    activeMoodConfig,
    colorScheme,
    resolvedScheme,
    setColorScheme,
    openMoodSelector,
  } = useMood();
  const [isMoreOpen, setIsMoreOpen] = useState(false);

  const primaryItems = MOBILE_PRIMARY_DISCIPLINES.map(
    id => DISCIPLINE_NAV_ITEMS.find(item => item.id === id)!
  );
  const moreItems = DISCIPLINE_NAV_ITEMS.filter(item =>
    !MOBILE_PRIMARY_DISCIPLINES.includes(item.id)
  );
  const isMoreActive = !MOBILE_PRIMARY_DISCIPLINES.includes(activeDiscipline);

  useEffect(() => {
    setIsMoreOpen(false);
  }, [activeDiscipline]);

  const goTo = (discipline: DisciplineType) => {
    if (disabled) return;
    setIsMoreOpen(false);
    onChangeDiscipline(discipline);
  };

  // Radix Sheet has an exit animation. Let it finish before opening another
  // portal so users never see two scrims or two panels stacked together.
  const closeThen = (action: () => void) => {
    setIsMoreOpen(false);
    window.setTimeout(action, 220);
  };

  return (
    <div className="liquid-bottom-wrap md:hidden">
      <nav className="liquid-bottom-nav" aria-label="เมนูหลักบนมือถือ">
        {primaryItems.map(item => {
          const isActive = activeDiscipline === item.id;
          const Icon = DISCIPLINE_ICONS[item.id];
          const isPrimary = item.id === 'tarot';

          return (
            <button
              key={item.id}
              id={`mobile-nav-${item.id}`}
              type="button"
              onClick={() => goTo(item.id)}
              disabled={disabled}
              aria-current={isActive ? 'page' : undefined}
              className={`liquid-bottom-item ${isActive ? 'is-active' : ''} ${isPrimary ? 'is-primary' : ''}`}
            >
              <span className="liquid-bottom-icon" aria-hidden="true">
                <Icon className="h-[19px] w-[19px]" strokeWidth={isPrimary ? 2.4 : 2} />
              </span>
              <span>{item.shortName}</span>
            </button>
          );
        })}

        <Sheet open={isMoreOpen} onOpenChange={setIsMoreOpen}>
          <SheetTrigger asChild>
            <button
              id="mobile-nav-more"
              type="button"
              disabled={disabled}
              aria-current={isMoreActive ? 'page' : undefined}
              aria-label="เปิดเมนูเพิ่มเติม"
              className={`liquid-bottom-item ${isMoreActive ? 'is-active' : ''}`}
            >
              <span className="liquid-bottom-icon" aria-hidden="true">
                <Grid2X2 className="h-[19px] w-[19px]" />
              </span>
              <span>เพิ่มเติม</span>
            </button>
          </SheetTrigger>

          <SheetContent
            side="bottom"
            className="liquid-mobile-sheet max-h-[82dvh] overflow-y-auto rounded-t-[32px] border-0 px-4 pb-[calc(1rem+env(safe-area-inset-bottom))]"
          >
            <SheetHeader className="px-1 pt-2 text-left">
              <div className="mx-auto mb-2 h-1.5 w-12 rounded-full bg-current opacity-20" />
              <SheetTitle className="font-serif-display text-xl text-[var(--cat-cream)]">
                เลือกศาสตร์อื่น
              </SheetTitle>
              <SheetDescription className="text-xs text-[var(--cat-muted)]">
                เปิดครั้งละหนึ่งหน้า เมนูนี้จะปิดก่อนพาไปยังคอนเทนต์ใหม่
              </SheetDescription>
            </SheetHeader>

            <div className="grid grid-cols-2 gap-2">
              {moreItems.map(item => {
                const isActive = activeDiscipline === item.id;
                const Icon = DISCIPLINE_ICONS[item.id] || BookOpenCheck;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => goTo(item.id)}
                    aria-current={isActive ? 'page' : undefined}
                    className={`liquid-sheet-tile ${isActive ? 'is-active' : ''}`}
                  >
                    <span className="liquid-sheet-icon" aria-hidden="true">
                      <Icon className="h-5 w-5" />
                    </span>
                    <span className="min-w-0 text-left">
                      <span className="block truncate text-sm font-bold text-[var(--cat-cream)]">{item.shortName}</span>
                      <span className="block truncate text-[10px] text-[var(--cat-muted)]">{item.tag}</span>
                    </span>
                  </button>
                );
              })}
            </div>

            <section className="mt-4 rounded-[24px] bg-[var(--cat-container)] p-3" aria-labelledby="appearance-title">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h3 id="appearance-title" className="text-sm font-bold text-[var(--cat-cream)]">แสงของหน้าจอ</h3>
                  <p className="text-[10px] text-[var(--cat-muted)]">ตอนนี้: {resolvedScheme === 'light' ? 'สว่าง' : 'มืด'}</p>
                </div>
                <div className="liquid-segmented" role="radiogroup" aria-label="เลือกธีมสว่างหรือมืด">
                  {([
                    ['light', Sun, 'สว่าง'],
                    ['dark', Moon, 'มืด'],
                    ['system', Monitor, 'ตามเครื่อง'],
                  ] as const).map(([value, Icon, label]) => (
                    <button
                      key={value}
                      type="button"
                      role="radio"
                      aria-checked={colorScheme === value}
                      onClick={() => setColorScheme(value)}
                      className={colorScheme === value ? 'is-active' : ''}
                      title={label}
                    >
                      <Icon className="h-4 w-4" />
                      <span className="sr-only">{label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </section>

            <div className="mt-3 grid grid-cols-3 gap-2">
              <button type="button" onClick={() => closeThen(onOpenHistory)} className="liquid-utility-button">
                <History className="h-4 w-4" />
                <span>ประวัติ</span>
              </button>
              <button type="button" onClick={() => closeThen(openMoodSelector)} className="liquid-utility-button">
                <Palette className="h-4 w-4" />
                <span>{activeMoodConfig.nameEn}</span>
              </button>
              <button type="button" onClick={() => closeThen(onOpenPaymentModal)} className="liquid-utility-button">
                <Coins className="h-4 w-4" />
                <span>เหรียญ</span>
              </button>
            </div>
          </SheetContent>
        </Sheet>
      </nav>
    </div>
  );
};
