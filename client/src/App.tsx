import React, { lazy, Suspense, useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  MessageSquareHeart,
  Coins,
  Receipt,
  BookOpen,
  Volume2,
  VolumeX,
  Flame,
  HelpCircle,
  TrendingUp,
  CreditCard
} from 'lucide-react';
import { Navbar } from './components/Navbar';
import { MobileBottomNav } from './components/MobileBottomNav';
import { AnalysisWaitingOverlay, type AnalysisStatus } from './components/AnalysisWaitingOverlay';
import { DailyFortuneView } from './components/DailyFortuneView';
import { DailyRewardSystem } from './components/DailyRewardSystem';
import { MoodSelectorModal } from './components/MoodSelectorModal';
import { MoonPhaseWidget } from './components/MoonPhaseWidget';
import { CosmicSoundscapePlayer } from './components/CosmicSoundscapePlayer';
import type { UserBirthProfile } from './utils/astrologyEngine';
import { useAuth } from './_core/hooks/useAuth';
import { startLogin } from './const';
import { apiFetch } from './lib/api';
import { trpc } from './lib/trpc';
import { DisciplineType, AppMode, SassLevel, FortuneReading, ChatMessage, DailyFortuneData, CoinTransaction, CardDesignSettings, ReadingDepthTier, READING_DEPTH_TIERS } from './types';
import { getReadingCost, isPaidDiscipline } from '@shared/catalog';

const ChineseFortuneView = lazy(() => import('./components/ChineseFortuneView').then(module => ({ default: module.ChineseFortuneView })));
const TarotFortuneView = lazy(() => import('./components/TarotFortuneView').then(module => ({ default: module.TarotFortuneView })));
const OracleFortuneView = lazy(() => import('./components/OracleFortuneView').then(module => ({ default: module.OracleFortuneView })));
const RuneFortuneView = lazy(() => import('./components/RuneFortuneView').then(module => ({ default: module.RuneFortuneView })));
const ChatbotContinuous = lazy(() => import('./components/ChatbotContinuous').then(module => ({ default: module.ChatbotContinuous })));
const MonthlyAstrologyCalendar = lazy(() => import('./components/MonthlyAstrologyCalendar').then(module => ({ default: module.MonthlyAstrologyCalendar })));
const LuckyNumberGenerator = lazy(() => import('./components/LuckyNumberGenerator').then(module => ({ default: module.LuckyNumberGenerator })));
const CosmicFortuneMinigame = lazy(() => import('./components/CosmicFortuneMinigame').then(module => ({ default: module.CosmicFortuneMinigame })));
const CardDesignStudio = lazy(() => import('./components/CardDesignStudio').then(module => ({ default: module.CardDesignStudio })));
const ZodiacCompatibilityModal = lazy(() => import('./components/ZodiacCompatibilityEngine').then(module => ({ default: module.ZodiacCompatibilityModal })));
const PaymentModal = lazy(() => import('./components/PaymentModal').then(module => ({ default: module.PaymentModal })));
const ReadingResultModal = lazy(() => import('./components/ReadingResultModal').then(module => ({ default: module.ReadingResultModal })));
const HistoryDrawer = lazy(() => import('./components/HistoryDrawer').then(module => ({ default: module.HistoryDrawer })));
const SassyCatAssistantPopup = lazy(() => import('./components/SassyCatAssistantPopup').then(module => ({ default: module.SassyCatAssistantPopup })));
const FateSynchronicityModal = lazy(() => import('./components/FateSynchronicityModal').then(module => ({ default: module.FateSynchronicityModal })));
const LotteryHistoryVaultModal = lazy(() => import('./components/LotteryHistoryVaultModal').then(module => ({ default: module.LotteryHistoryVaultModal })));
const ThaiCreditEconomicsModal = lazy(() => import('./components/ThaiCreditEconomicsModal').then(module => ({ default: module.ThaiCreditEconomicsModal })));
const FortuneWisdomLibrary = lazy(() => import('./components/FortuneWisdomLibrary').then(module => ({ default: module.FortuneWisdomLibrary })));
const MonthlyAstrologyForecast = lazy(() => import('./components/MonthlyAstrologyForecast').then(module => ({ default: module.MonthlyAstrologyForecast })));

interface AnalysisRequest {
  requestId?: string;
  discipline: DisciplineType;
  topic: string;
  question: string;
  itemsSelected: any;
  sassyLevel: SassLevel;
  depthTier?: ReadingDepthTier;
}

// Web Audio API Synthesizer for Mystical Chimes
const playMysticChime = (type: 'chime' | 'coin' | 'card' = 'chime') => {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();

    if (type === 'coin') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(987.77, ctx.currentTime); // B5
      osc.frequency.exponentialRampToValueAtTime(1318.51, ctx.currentTime + 0.1); // E6
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } else if (type === 'card') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
      osc.frequency.exponentialRampToValueAtTime(659.25, ctx.currentTime + 0.15); // E5
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.25);
    } else {
      // Mystic Chime Chord
      [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.15, ctx.currentTime + i * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.08 + 0.6);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + i * 0.08);
        osc.stop(ctx.currentTime + i * 0.08 + 0.6);
      });
    }
  } catch (e) {
    // Ignore audio autoplay restrictions
  }
};

export default function App() {
  const { user, loading: authLoading, isAuthenticated, logout } = useAuth();
  const trpcUtils = trpc.useUtils();
  const accountQuery = trpc.account.bootstrap.useQuery(undefined, {
    enabled: isAuthenticated,
    retry: false,
    refetchOnWindowFocus: true,
  });
  const saveProfileMutation = trpc.account.saveProfile.useMutation();
  const claimRewardMutation = trpc.wallet.claimReward.useMutation();
  const clearReadingsMutation = trpc.readings.clear.useMutation();
  const reconcileCheckoutMutation = trpc.payments.reconcile.useMutation();
  const [checkoutReturn] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return {
      state: params.get('payment'),
      orderId: params.get('order_id') || params.get('order'),
      sessionId: params.get('session_id'),
    };
  });
  const checkoutReturnHandledRef = useRef(false);
  const checkoutReconcileStartedRef = useRef(false);
  const checkoutOrderQuery = trpc.payments.order.useQuery(
    { id: checkoutReturn.orderId || 'checkout-not-active' },
    {
      enabled: isAuthenticated && checkoutReturn.state === 'success' && Boolean(checkoutReturn.orderId),
      retry: 2,
      refetchInterval: query => {
        const status = (query.state.data as { status?: string } | undefined)?.status;
        return status === 'paid' || status === 'failed' || status === 'expired' ? false : 2_000;
      },
    },
  );

  // Navigation State
  const [activeDiscipline, setActiveDiscipline] = useState<DisciplineType>(() => {
    const supported: DisciplineType[] = ['daily', 'minigame', 'card_studio', 'calendar', 'numbers', 'tarot', 'oracle', 'rune', 'chinese', 'chat'];
    const requested = typeof window !== 'undefined'
      ? new URLSearchParams(window.location.search).get('view') as DisciplineType | null
      : null;
    if (requested && supported.includes(requested)) return requested;
    // Daily Purr is the free first-session experience on every viewport.
    // Explicit ?view= links still take precedence for campaigns and deep links.
    if (typeof window !== 'undefined' && window.matchMedia('(max-width: 767px)').matches) {
      return 'daily';
    }
    return 'daily';
  });
  const [appMode, setAppMode] = useState<AppMode>('client');
  const isTellerAuthorized = false;
  const [sassLevel, setSassLevel] = useState<SassLevel>('spicy');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Browser state mirrors the authoritative TiDB wallet; all value changes happen on the server.
  const [coins, setCoins] = useState<number>(0);

  // Modal & Drawer States
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState<boolean>(false);
  const [isHistoryDrawerOpen, setIsHistoryDrawerOpen] = useState<boolean>(false);
  const [isSassyCatPopupOpen, setIsSassyCatPopupOpen] = useState<boolean>(false);
  const [isFateSynchronicityModalOpen, setIsFateSynchronicityModalOpen] = useState<boolean>(false);
  const [synchronicityInitialTab, setSynchronicityInitialTab] = useState<'correlation' | 'karmic_thread' | 'line_miniapp'>('correlation');
  const [isLotteryVaultModalOpen, setIsLotteryVaultModalOpen] = useState<boolean>(false);
  const [isEconomicsModalOpen, setIsEconomicsModalOpen] = useState<boolean>(false);
  const [isWisdomLibraryOpen, setIsWisdomLibraryOpen] = useState<boolean>(false);
  const [isMonthlyForecastOpen, setIsMonthlyForecastOpen] = useState<boolean>(false);
  const [isZodiacCompatibilityModalOpen, setIsZodiacCompatibilityModalOpen] = useState<boolean>(false);
  const [birthProfile, setBirthProfile] = useState<UserBirthProfile | null>(null);
  const [activeReadingResult, setActiveReadingResult] = useState<FortuneReading | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisStatus, setAnalysisStatus] = useState<AnalysisStatus | null>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [lastAnalysisRequest, setLastAnalysisRequest] = useState<AnalysisRequest | null>(null);
  const analysisInFlightRef = useRef(false);
  const [isChatLoading, setIsChatLoading] = useState<boolean>(false);

  // Daily Free Reading Tracker (1st time is free, then popup offers VIP Cat assistant)
  const [freeReadingsUsed, setFreeReadingsUsed] = useState<number>(0);

  // Chat stays in memory until a separate consented retention policy is implemented.
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([{
    id: 'msg-welcome',
    role: 'assistant',
    content: `สวัสดีจ้าสาว! **แม่หมอลิลลี่** มาแล้วจ้ะ 💅✨\n\nยินดีต้อนรับสู่สำนักดูดวงที่**ไม่ขายฝัน ไม่อวย แต่พูดความจริงของโลกและหลักจิตวิทยาแบบตาสว่าง!**\n\nอยากดูเรื่องอะไร? ไพ่ยิปซี, โอราเคิล, หินรูนนอร์ส หรือดวงจีนปาจื่อ/อี้จิง ถามมาได้เลย หรือจะให้วิเคราะห์ผลดวงที่เปิดอยู่ก็ได้นะจ๊ะ!`,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  }]);

  // Account-scoped history and ledger are hydrated from TiDB after OAuth.
  const [readingsHistory, setReadingsHistory] = useState<FortuneReading[]>([]);
  const [transactions, setTransactions] = useState<CoinTransaction[]>([]);

  // Active Context for Chat
  const [activeContext, setActiveContext] = useState<any>(null);

  // Card Design Settings (Theme, Back, Foil Glow, Sound)
  const [cardSettings, setCardSettings] = useState<CardDesignSettings>(() => {
    const saved = localStorage.getItem('thecatroom_card_settings');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return {
      backTheme: 'gilded-velvet',
      frontTheme: 'gilded-foil',
      showGoldFoilGlow: true,
      soundEffectsEnabled: true,
    };
  });

  const handleSaveCardSettings = (newSettings: CardDesignSettings) => {
    setCardSettings(newSettings);
    localStorage.setItem('thecatroom_card_settings', JSON.stringify(newSettings));
  };

  const handleClaimMinigameReward = (_amount: number, _reason: string) => {
    showToast('มินิเกมอยู่ในโหมดทดลอง จึงยังไม่เพิ่มหรือลดเหรียญจริง');
  };

  // Toast Notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const closeSecondaryLayers = () => {
    setIsPaymentModalOpen(false);
    setIsHistoryDrawerOpen(false);
    setIsSassyCatPopupOpen(false);
    setIsFateSynchronicityModalOpen(false);
    setIsLotteryVaultModalOpen(false);
    setIsEconomicsModalOpen(false);
    setIsWisdomLibraryOpen(false);
    setIsMonthlyForecastOpen(false);
    setIsZodiacCompatibilityModalOpen(false);
    setActiveReadingResult(null);
    setAnalysisError(null);
    setAnalysisStatus(null);
  };

  type SecondaryLayer = 'payment' | 'history' | 'assistant' | 'synchronicity' | 'lottery' | 'economics' | 'wisdom' | 'monthly' | 'zodiac';

  const openSecondaryLayer = (layer: SecondaryLayer) => {
    closeSecondaryLayers();
    const openLayer: Record<SecondaryLayer, () => void> = {
      payment: () => setIsPaymentModalOpen(true),
      history: () => setIsHistoryDrawerOpen(true),
      assistant: () => setIsSassyCatPopupOpen(true),
      synchronicity: () => setIsFateSynchronicityModalOpen(true),
      lottery: () => setIsLotteryVaultModalOpen(true),
      economics: () => setIsEconomicsModalOpen(true),
      wisdom: () => setIsWisdomLibraryOpen(true),
      monthly: () => setIsMonthlyForecastOpen(true),
      zodiac: () => setIsZodiacCompatibilityModalOpen(true),
    };
    openLayer[layer]();
  };

  const handleOpenTopUp = () => {
    if (!isAuthenticated) {
      showToast('เข้าสู่ระบบก่อนเติมเหรียญ เพื่อผูกยอดกับบัญชีของคุณ');
      startLogin();
      return;
    }
    openSecondaryLayer('payment');
  };

  const handleChangeDiscipline = (discipline: DisciplineType) => {
    closeSecondaryLayers();
    setActiveDiscipline(discipline);
    const nextUrl = new URL(window.location.href);
    nextUrl.searchParams.set('view', discipline);
    window.history.replaceState({}, '', `${nextUrl.pathname}${nextUrl.search}${nextUrl.hash}`);
    window.requestAnimationFrame(() => {
      document.getElementById('discipline-content')?.scrollIntoView({
        behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
        block: 'start',
      });
    });
  };

  useEffect(() => {
    let frame = 0;
    const updateParallax = () => {
      frame = 0;
      const offset = Math.min(window.scrollY, 1200);
      document.documentElement.style.setProperty('--liquid-parallax-slow', `${offset * 0.025}px`);
      document.documentElement.style.setProperty('--liquid-parallax-fast', `${offset * -0.018}px`);
    };
    const onScroll = () => {
      if (frame || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      frame = window.requestAnimationFrame(updateParallax);
    };
    updateParallax();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  // Hydrate all account-scoped state from the canonical OAuth + TiDB backend.
  useEffect(() => {
    const data = accountQuery.data;
    if (!data) return;

    setCoins(data.wallet.balance);
    setTransactions(data.ledger.map(entry => ({
      id: String(entry.id),
      type: entry.direction === 'credit' ? 'earn' : 'spend',
      amount: entry.amount,
      reason: entry.reason,
      timestamp: new Date(entry.createdAt).toLocaleString('th-TH'),
      balanceAfter: entry.balanceAfter,
    })));
    setReadingsHistory(data.readings.map(reading => ({
      id: reading.id,
      discipline: reading.discipline as DisciplineType,
      topic: reading.topic,
      question: reading.question || '',
      itemsSelected: reading.selectedItems,
      markdownContent: reading.markdownContent || '',
      sassyLevel: reading.sassyLevel as SassLevel,
      depthTier: reading.depthTier,
      coinsSpent: reading.coinsSpent,
      timestamp: new Date(reading.createdAt).toLocaleString('th-TH'),
    })));
    if (data.profile?.birthDate) {
      const { birthDate, birthTime, birthTimeUnknown } = data.profile;
      void import('./utils/astrologyEngine').then(({ calculateBirthProfile }) => {
        setBirthProfile(calculateBirthProfile(
          birthDate,
          birthTime || '08:30',
          birthTimeUnknown,
        ));
      });
    }
  }, [accountQuery.data]);

  useEffect(() => {
    if (checkoutReturnHandledRef.current || !checkoutReturn.state) return;

    const clearCheckoutParams = () => {
      const nextUrl = new URL(window.location.href);
      nextUrl.searchParams.delete('payment');
      nextUrl.searchParams.delete('order');
      nextUrl.searchParams.delete('order_id');
      nextUrl.searchParams.delete('session_id');
      window.history.replaceState({}, '', `${nextUrl.pathname}${nextUrl.search}${nextUrl.hash}`);
    };

    if (checkoutReturn.state === 'cancelled') {
      checkoutReturnHandledRef.current = true;
      showToast('ยกเลิกการชำระเงินแล้ว — ไม่มีการเพิ่มเหรียญหรือเรียกเก็บเงิน');
      clearCheckoutParams();
      return;
    }

    if (
      checkoutReturn.state === 'success' &&
      checkoutReturn.orderId &&
      checkoutReturn.sessionId &&
      !checkoutReconcileStartedRef.current
    ) {
      checkoutReconcileStartedRef.current = true;
      void reconcileCheckoutMutation
        .mutateAsync({ id: checkoutReturn.orderId, sessionId: checkoutReturn.sessionId })
        .then(() => checkoutOrderQuery.refetch())
        .catch(() => {
          showToast('ตรวจสอบการชำระเงินไม่สำเร็จ กรุณารีเฟรชหน้าอีกครั้ง');
        });
      return;
    }

    const order = reconcileCheckoutMutation.data || checkoutOrderQuery.data;
    if (!order) return;
    if (order.status === 'paid') {
      checkoutReturnHandledRef.current = true;
      void trpcUtils.account.bootstrap.invalidate();
      showToast(`ชำระเงินสำเร็จ รับ ${order.credits} เหรียญเข้าบัญชีแล้ว`);
      clearCheckoutParams();
    } else if (order.status === 'failed' || order.status === 'expired') {
      checkoutReturnHandledRef.current = true;
      showToast('Stripe ยังไม่ยืนยันการชำระเงิน จึงยังไม่มีการเพิ่มเหรียญ');
      clearCheckoutParams();
    }
  }, [checkoutOrderQuery.data, checkoutReturn.state, checkoutReturn.orderId, checkoutReturn.sessionId, reconcileCheckoutMutation.data, trpcUtils.account.bootstrap]);

  // Remove legacy browser-authoritative financial and sensitive records.
  useEffect(() => {
    [
      'sassy_fortune_coins',
      'sassy_coin_transactions',
      'sassy_readings_history',
      'thecatroom_user_birth_profile',
      'thecatroom_birth_date',
      'thecatroom_birth_time',
      'thecatroom_birth_time_unknown',
      'thecatroom_teller_authorized',
      'thecatroom_used_promos',
      'thecatroom_line_miniapp_profile',
    ].forEach(key => localStorage.removeItem(key));
  }, []);

  const handleSignIn = () => startLogin();

  const handleSignOutUser = async () => {
    try {
      await logout();
      setCoins(0);
      setTransactions([]);
      setReadingsHistory([]);
      setBirthProfile(null);
      setChatMessages(messages => messages.slice(0, 1));
      setAppMode('client');
      showToast('👋 ออกจากระบบเรียบร้อย');
    } catch (err) {
      console.error('Sign out error:', err);
      showToast('ออกจากระบบไม่สำเร็จ กรุณาลองใหม่');
    }
  };

  const handleSaveBirthProfile = async (profile: UserBirthProfile) => {
    if (!isAuthenticated) {
      showToast('เข้าสู่ระบบก่อน เพื่อบันทึกข้อมูลวันเกิดอย่างปลอดภัย');
      startLogin();
      return;
    }
    try {
      await saveProfileMutation.mutateAsync({
        birthDate: profile.birthDate,
        birthTime: profile.birthTime,
        birthTimeUnknown: profile.isTimeUnknown,
        consentVersion: 'privacy-v1',
      });
      setBirthProfile(profile);
      await trpcUtils.account.bootstrap.invalidate();
      showToast(`🪐 บันทึกดวงชะตาลัคนา${profile.lagnaSign.nameTh} ลงฐานข้อมูลแล้ว`);
    } catch (err: any) {
      showToast('บันทึกข้อมูลไม่สำเร็จ: ' + (err.message || 'กรุณาลองใหม่'));
    }
  };

  const handleToggleSound = () => setSoundEnabled(!soundEnabled);

  const handleClaimDailyReward = async (_coinsWon: number, reason: string) => {
    if (!isAuthenticated) {
      showToast('เข้าสู่ระบบก่อนรับเหรียญ เพื่อเก็บยอดไว้ในบัญชีของคุณ');
      startLogin();
      return { claimed: false, amount: 0, streakDay: 0 };
    }
    try {
      const claimType = reason.includes('แชร์') || reason.includes('คัดลอก') ? 'social_share' : 'daily_checkin';
      const result = await claimRewardMutation.mutateAsync({ claimType });
      setCoins(result.balance);
      await trpcUtils.account.bootstrap.invalidate();
      if (!result.claimed) showToast('วันนี้รับรางวัลประเภทนี้ไปแล้ว ระบบไม่เพิ่มซ้ำ');
      if (result.claimed && soundEnabled) playMysticChime('coin');
      return { claimed: result.claimed, amount: result.amount, streakDay: result.streakDay };
    } catch (err: any) {
      showToast('รับรางวัลไม่สำเร็จ: ' + (err.message || 'กรุณาลองใหม่'));
      return { claimed: false, amount: 0, streakDay: accountQuery.data?.rewards.streakDay ?? 0 };
    }
  };

  // Deep Dive Reading API Caller with Dynamic Credit Deduction by Depth
  const handleAnalyzeReading = async (data: AnalysisRequest) => {
    if (!isAuthenticated) {
      showToast('เข้าสู่ระบบก่อนเปิดไพ่ เพื่อบันทึกผลและยอดเหรียญอย่างปลอดภัย');
      startLogin();
      return;
    }
    if (analysisInFlightRef.current) {
      showToast('🔮 แม่หมอกำลังอ่านคำทำนายเดิมอยู่ รออีกนิดนะ');
      return;
    }

    if (!isPaidDiscipline(data.discipline)) {
      showToast('ศาสตร์นี้ยังไม่เปิดให้ใช้การอ่านแบบคิดเหรียญ');
      return;
    }
    const tier = data.depthTier || 'standard';
    const cost = getReadingCost(data.discipline, tier);

    if (coins < cost) {
      openSecondaryLayer('payment');
      showToast(`⚠️ เหรียญไม่พอสำหรับระดับ "${READING_DEPTH_TIERS[tier].label}" (ต้องการ ${cost} เหรียญ)`);
      return;
    }

    const requestData = { ...data, requestId: data.requestId || crypto.randomUUID() };
    analysisInFlightRef.current = true;
    setLastAnalysisRequest(requestData);
    setAnalysisError(null);
    setAnalysisStatus({
      discipline: data.discipline,
      topic: data.topic,
      depthTier: tier,
      itemCount: Array.isArray(data.itemsSelected) ? data.itemsSelected.length : data.itemsSelected ? 1 : 0,
    });
    setIsAnalyzing(true);
    if (soundEnabled) playMysticChime('card');

    let succeeded = false;
    try {
      const res = await apiFetch('/api/gemini/reading', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requestId: requestData.requestId,
          discipline: data.discipline,
          topic: data.topic,
          question: data.question,
          itemsSelected: data.itemsSelected,
          sassyLevel: data.sassyLevel,
          depthTier: tier,
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(json.error || `ระบบตอบกลับผิดปกติ (${res.status})`);
      }

      if (json.reading) {
        const newReading: FortuneReading = {
          id: json.readingId,
          discipline: data.discipline,
          topic: data.topic,
          question: data.question,
          itemsSelected: data.itemsSelected,
          markdownContent: json.reading,
          sassyLevel: data.sassyLevel,
          depthTier: tier,
          coinsSpent: cost,
          timestamp: new Date().toLocaleString('th-TH'),
        };

        setCoins(json.walletBalance);
        setReadingsHistory(previous => [newReading, ...previous]);
        setActiveReadingResult(newReading);
        setActiveContext(newReading);
        await trpcUtils.account.bootstrap.invalidate();

        const nextUsed = freeReadingsUsed + 1;
        setFreeReadingsUsed(nextUsed);
        if (soundEnabled) playMysticChime('chime');
        succeeded = true;

        if (nextUsed === 1) {
          showToast('🐾 เปิดไพ่ครั้งแรกสำเร็จแล้ว—บันทึกคำทำนายไว้ให้เรียบร้อย');
        }
      } else {
        throw new Error(json.error || 'เกิดข้อผิดพลาดในการประมวลผล');
      }
    } catch (err: any) {
      console.error(err);
      const message = err.message || 'โปรดลองอีกครั้ง';
      setAnalysisError(message);
      showToast('เกิดข้อผิดพลาดในการอ่านดวง: ' + message);
    } finally {
      analysisInFlightRef.current = false;
      setIsAnalyzing(false);
      if (succeeded) {
        window.setTimeout(() => setAnalysisStatus(null), 320);
      }
    }
  };

  const handleRetryAnalysis = () => {
    if (!lastAnalysisRequest) return;
    setAnalysisError(null);
    void handleAnalyzeReading(lastAnalysisRequest);
  };

  // Chat Message Sender
  const handleSendMessage = async (text: string) => {
    if (!isAuthenticated) {
      showToast('เข้าสู่ระบบก่อนคุยกับแม่หมอ');
      startLogin();
      return;
    }
    const userMsg: ChatMessage = {
      id: 'msg-' + Date.now(),
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const newMessages = [...chatMessages, userMsg];
    setChatMessages(newMessages);
    setIsChatLoading(true);

    try {
      const res = await apiFetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.map(m => ({ role: m.role, content: m.content })),
          discipline: activeDiscipline,
          sassyLevel: sassLevel,
          contextData: activeContext,
        }),
      });

      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || `ระบบตอบกลับผิดปกติ (${res.status})`);
      if (json.reply) {
        const botMsg: ChatMessage = {
          id: 'msg-' + (Date.now() + 1),
          role: 'assistant',
          content: json.reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setChatMessages([...newMessages, botMsg]);
        if (soundEnabled) playMysticChime('card');
      }
    } catch (err: any) {
      console.error('Chat error:', err);
      showToast('แชทไม่สำเร็จ: ' + (err.message || 'กรุณาลองใหม่'));
    } finally {
      setIsChatLoading(false);
    }
  };

  // Continue chat with specific reading result
  const handleContinueChatWithReading = (reading: FortuneReading) => {
    setActiveContext(reading);
    handleChangeDiscipline('chat');
    const promptText = `ช่วยวิเคราะห์ผลดูดวง ${reading.topic} ที่เพิ่งเปิดได้เมื่อกี้ให้ฟังหน่อยว่าต้องทำยังไงต่อในชีวิตจริง: "${reading.question}"`;
    handleSendMessage(promptText);
  };

  // Continue chat with daily fortune
  const handleContinueChatWithDaily = (fortune: DailyFortuneData, focusArea: string) => {
    setActiveContext({
      discipline: 'daily',
      topic: `ดวงประจำวัน (${focusArea})`,
      theme: fortune.themeTitle,
      vibe: fortune.overallVibe,
      card: fortune.dailyCard,
      roast: fortune.bestieRoast,
      affirmation: fortune.dailyAffirmation,
    });
    handleChangeDiscipline('chat');
    const promptText = `แม่หมอจ๋า ช่วยขยายความดวงวันนี้เรื่อง "${fortune.themeTitle}" ให้ฟังหน่อย โดยเฉพาะที่บอกว่า "${fortune.bestieRoast}" อยากรู้ว่าต้องทำตัวยังไงถึงจะไม่พลาด!`;
    handleSendMessage(promptText);
  };

  return (
    <div
      className="liquid-app min-h-screen font-sans relative overflow-x-hidden transition-colors duration-500"
      style={{
        backgroundColor: 'var(--cat-surface)',
        color: 'var(--cat-cream)',
      }}
    >

      {/* Background Ambience Glows reacting to Mood CSS variables */}
      <div className="liquid-aurora-field pointer-events-none fixed inset-0 z-0 overflow-hidden transition-all duration-700">
        <div
          className="absolute -top-40 -left-40 h-96 w-96 rounded-full blur-[128px] transition-colors duration-700"
          style={{ backgroundColor: 'var(--cat-plum)' }}
        />
        <div
          className="absolute top-1/3 -right-40 h-96 w-96 rounded-full blur-[128px] transition-colors duration-700"
          style={{ backgroundColor: 'var(--cat-container-highest)' }}
        />
        <div
          className="absolute -bottom-40 left-1/3 h-96 w-96 rounded-full blur-[128px] transition-colors duration-700"
          style={{ backgroundColor: 'var(--cat-gold-glow)' }}
        />
      </div>

      {/* Main Navbar */}
      <Navbar
        activeDiscipline={activeDiscipline}
        onChangeDiscipline={handleChangeDiscipline}
        appMode={appMode}
        onChangeMode={() => showToast('ระบบบิลแม่หมอถูกปิดไว้จนกว่าจะเชื่อม admin backend จริง')}
        coins={coins}
        onOpenPaymentModal={() => isAuthenticated ? openSecondaryLayer('payment') : startLogin()}
        onOpenHistory={() => openSecondaryLayer('history')}
        soundEnabled={soundEnabled}
        onToggleSound={handleToggleSound}
        historyCount={readingsHistory.length}
        isTellerAuthorized={isTellerAuthorized}
        onOpenSynchronicityModal={() => {
          setSynchronicityInitialTab('correlation');
          openSecondaryLayer('synchronicity');
        }}
        onOpenLotteryVault={() => openSecondaryLayer('lottery')}
        onOpenEconomicsModal={() => openSecondaryLayer('economics')}
        onOpenWisdomLibrary={() => openSecondaryLayer('wisdom')}
        onOpenMonthlyForecast={() => openSecondaryLayer('monthly')}
        onOpenZodiacCompatibility={() => openSecondaryLayer('zodiac')}
        readingsHistory={readingsHistory}
        birthProfile={birthProfile}
        user={user}
        onSignIn={handleSignIn}
        onSignOut={handleSignOutUser}
      />

      {appMode === 'client' && (
        <MobileBottomNav
          activeDiscipline={activeDiscipline}
          onChangeDiscipline={handleChangeDiscipline}
          onOpenHistory={() => openSecondaryLayer('history')}
          onOpenPaymentModal={() => isAuthenticated ? openSecondaryLayer('payment') : startLogin()}
          isAuthenticated={isAuthenticated}
          onSignIn={handleSignIn}
          onSignOut={handleSignOutUser}
          onOpenLineMiniApp={() => {
            setSynchronicityInitialTab('line_miniapp');
            openSecondaryLayer('synchronicity');
          }}
          disabled={isAnalyzing}
        />
      )}

      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="liquid-toast fixed top-24 right-6 z-50 rounded-2xl px-4 py-2.5 text-xs font-semibold text-white"
          >
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Application Container */}
      <main className="relative z-10 mx-auto max-w-7xl px-4 py-6 pb-32 sm:px-6 md:pb-6 lg:px-8">

        {/* Client Fortune-Telling Mode */}
        <div className="space-y-6">

            {/* Quick Sassy Personality Bar */}
            {activeDiscipline !== 'chat' && (
              <div className="liquid-toolbar hidden flex-wrap items-center justify-between gap-3 rounded-2xl p-3 px-4 text-xs md:flex">
                <div className="flex items-center gap-2 text-slate-300">
                  <span className="text-pink-400 font-bold">💅 แม่หมอลิลลี่:</span>
                  <span className="text-slate-400 italic">"ดวงชะตาบอกแค่แนวโน้ม แต่สติและการกระทำคือตัวกำหนดผลลัพธ์!"</span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <span>ระดับความตาสว่าง:</span>
                    <select
                      value={sassLevel}
                      onChange={(e) => setSassLevel(e.target.value as SassLevel)}
                      className="rounded-lg bg-slate-950 border border-slate-800 px-2 py-1 text-xs text-purple-300 font-semibold focus:outline-none"
                    >
                      <option value="mild">ละมุนเพื่อนปลอบใจ (Mild)</option>
                      <option value="spicy">แซ่บตบเรียกสติ (Spicy)</option>
                      <option value="savage">ฟาดเรียลสัจธรรม (Savage)</option>
                    </select>
                  </div>

                  <button
                    onClick={() => handleChangeDiscipline('chat')}
                    className="flex items-center gap-1 text-purple-400 hover:text-pink-300 font-semibold transition-colors"
                  >
                    <MessageSquareHeart className="h-3.5 w-3.5" />
                    <span>แชทถามแม่หมอ</span>
                  </button>
                </div>
              </div>
            )}

            {/* Moon Phase & General Cosmic Energy Tracker Widget */}
            {activeDiscipline !== 'chat' && (
              <div className="hidden md:block">
                <MoonPhaseWidget
                  onShowToast={showToast}
                  soundEnabled={soundEnabled}
                />
              </div>
            )}

            {/* Discipline Views */}
            <section id="discipline-content" className="scroll-mt-24" aria-live="polite">
            <Suspense fallback={<div role="status" className="mx-auto my-8 flex min-h-48 max-w-2xl items-center justify-center rounded-3xl border border-[rgba(242,203,128,0.18)] bg-[#180B22]/80 text-sm text-[#EAC272]">กำลังเปิดศาสตร์ที่เลือก…</div>}>
            <AnimatePresence mode="wait">
              {activeDiscipline === 'daily' && (
                <motion.div
                  key="daily"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.25 }}
                >
                  <DailyFortuneView
                    sassLevel={sassLevel}
                    onContinueChatWithDaily={handleContinueChatWithDaily}
                    onShowToast={showToast}
                    soundEnabled={soundEnabled}
                    readings={readingsHistory}
                    birthProfile={birthProfile}
                    isAuthenticated={isAuthenticated}
                    onSignIn={startLogin}
                    currentCoins={coins}
                    onClaimDailyReward={handleClaimDailyReward}
                    rewardsStatus={accountQuery.data?.rewards}
                    onOpenTopUp={() => isAuthenticated ? openSecondaryLayer('payment') : startLogin()}
                    onNavigate={handleChangeDiscipline}
                    onOpenSynchronicityModal={() => openSecondaryLayer('synchronicity')}
                    onOpenLotteryVault={() => openSecondaryLayer('lottery')}
                    onOpenEconomicsModal={() => openSecondaryLayer('economics')}
                    onOpenZodiacCompatibility={() => openSecondaryLayer('zodiac')}
                  />
                </motion.div>
              )}

              {activeDiscipline === 'minigame' && (
                <motion.div
                  key="minigame"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.25 }}
                >
                  <CosmicFortuneMinigame
                    currentCoins={coins}
                    onClaimReward={handleClaimMinigameReward}
                    cardSettings={cardSettings}
                    onShowToast={showToast}
                    onOpenTopUp={handleOpenTopUp}
                  />
                </motion.div>
              )}

              {activeDiscipline === 'card_studio' && (
                <motion.div
                  key="card_studio"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.25 }}
                >
                  <CardDesignStudio
                    initialSettings={cardSettings}
                    onSaveSettings={handleSaveCardSettings}
                    onShowToast={showToast}
                  />
                </motion.div>
              )}

              {activeDiscipline === 'calendar' && (
                <motion.div
                  key="calendar"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.25 }}
                >
                  <MonthlyAstrologyCalendar
                    sassLevel={sassLevel}
                    onSwitchDiscipline={handleChangeDiscipline}
                    onShowToast={showToast}
                    soundEnabled={soundEnabled}
                    onOpenMonthlyForecast={() => openSecondaryLayer('monthly')}
                  />
                </motion.div>
              )}

              {activeDiscipline === 'numbers' && (
                <motion.div
                  key="numbers"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.25 }}
                >
                  <LuckyNumberGenerator
                    sassLevel={sassLevel}
                    onSwitchDiscipline={handleChangeDiscipline}
                    onShowToast={showToast}
                    soundEnabled={soundEnabled}
                    coins={coins}
                    onOpenTopUp={() => isAuthenticated ? openSecondaryLayer('payment') : startLogin()}
                    readings={readingsHistory}
                    onOpenSynchronicityModal={() => openSecondaryLayer('synchronicity')}
                    onOpenLotteryVault={() => openSecondaryLayer('lottery')}
                  />
                </motion.div>
              )}

              {activeDiscipline === 'chinese' && (
                <motion.div
                  key="chinese"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.25 }}
                >
                  <ChineseFortuneView
                    onAnalyzeReading={handleAnalyzeReading}
                    isLoading={isAnalyzing}
                    sassLevel={sassLevel}
                    userCoins={coins}
                    onOpenTopUp={handleOpenTopUp}
                    readings={readingsHistory}
                    onOpenSynchronicityModal={() => openSecondaryLayer('synchronicity')}
                  />
                </motion.div>
              )}

              {activeDiscipline === 'tarot' && (
                <motion.div
                  key="tarot"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.25 }}
                >
                  <TarotFortuneView
                    onAnalyzeReading={handleAnalyzeReading}
                    isLoading={isAnalyzing}
                    sassLevel={sassLevel}
                    cardSettings={cardSettings}
                    onOpenCardStudio={() => handleChangeDiscipline('card_studio')}
                    userCoins={coins}
                    onOpenTopUp={handleOpenTopUp}
                    readings={readingsHistory}
                    onOpenSynchronicityModal={() => openSecondaryLayer('synchronicity')}
                  />
                </motion.div>
              )}

              {activeDiscipline === 'oracle' && (
                <motion.div
                  key="oracle"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.25 }}
                >
                  <OracleFortuneView
                    onAnalyzeReading={handleAnalyzeReading}
                    isLoading={isAnalyzing}
                    sassLevel={sassLevel}
                    cardSettings={cardSettings}
                    onOpenCardStudio={() => handleChangeDiscipline('card_studio')}
                    userCoins={coins}
                    onOpenTopUp={handleOpenTopUp}
                    readings={readingsHistory}
                    onOpenSynchronicityModal={() => openSecondaryLayer('synchronicity')}
                  />
                </motion.div>
              )}

              {activeDiscipline === 'rune' && (
                <motion.div
                  key="rune"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.25 }}
                >
                  <RuneFortuneView
                    onAnalyzeReading={handleAnalyzeReading}
                    isLoading={isAnalyzing}
                    sassLevel={sassLevel}
                    userCoins={coins}
                    onOpenTopUp={handleOpenTopUp}
                    readings={readingsHistory}
                    onOpenSynchronicityModal={() => openSecondaryLayer('synchronicity')}
                  />
                </motion.div>
              )}

              {activeDiscipline === 'chat' && (
                <motion.div
                  key="chat"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.25 }}
                >
                  <ChatbotContinuous
                    messages={chatMessages}
                    onSendMessage={handleSendMessage}
                    isLoading={isChatLoading}
                    onClearHistory={() => setChatMessages([])}
                    currentDiscipline={activeDiscipline}
                    onChangeDiscipline={handleChangeDiscipline}
                    sassLevel={sassLevel}
                    onChangeSassLevel={setSassLevel}
                    soundEnabled={soundEnabled}
                    onToggleSound={handleToggleSound}
                    activeContext={activeContext}
                  />
                </motion.div>
              )}
            </AnimatePresence>
            </Suspense>
            </section>
        </div>
      </main>

      {/* Footer Area with Clean Mystic Branding & Discreet Teller Access */}
      <footer className="relative z-10 hidden border-t border-[rgba(242,203,128,0.1)] py-8 text-center text-xs text-[#C9B49D]/60 md:block">
        <div className="mx-auto max-w-7xl px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-sm">🐾</span>
            <span className="font-serif-display text-[#FAE9CA] font-medium">ดูดวงค่ะอีหญิง • แม่หมอเหมียว</span>
            <span>—</span>
            <span className="text-[11px] italic">"ดูดวงแบบไม่หวานเจี๊ยบ แต่ตรงจนมีสะดุ้ง ✨"</span>
          </div>

        </div>
      </footer>

      {/* Modals & Drawers */}
      <Suspense fallback={null}>
      {isPaymentModalOpen && <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        currentCoins={coins}
        transactions={transactions}
      />}

      <AnalysisWaitingOverlay
        status={analysisStatus}
        error={analysisError}
        onRetry={handleRetryAnalysis}
        onCloseError={() => {
          setAnalysisError(null);
          setAnalysisStatus(null);
        }}
      />

      <AnimatePresence>
        {activeReadingResult && (
          <ReadingResultModal
            key={activeReadingResult.id}
            reading={activeReadingResult}
            coins={coins}
            historyCount={readingsHistory.length}
            onClose={() => setActiveReadingResult(null)}
            onContinueChatWithReading={handleContinueChatWithReading}
            onExploreDiscipline={handleChangeDiscipline}
            onOpenWisdomLibrary={() => openSecondaryLayer('wisdom')}
          />
        )}
      </AnimatePresence>

      {isHistoryDrawerOpen && <HistoryDrawer
        isOpen={isHistoryDrawerOpen}
        onClose={() => setIsHistoryDrawerOpen(false)}
        history={readingsHistory}
        onSelectReading={(reading) => setActiveReadingResult(reading)}
        onClearHistory={async () => {
          try {
            await clearReadingsMutation.mutateAsync();
            setReadingsHistory([]);
            await trpcUtils.account.bootstrap.invalidate();
            showToast('ลบประวัติคำทำนายในบัญชีแล้ว');
          } catch (err: any) {
            showToast('ลบประวัติไม่สำเร็จ: ' + (err.message || 'กรุณาลองใหม่'));
          }
        }}
        onOpenWisdomLibrary={() => openSecondaryLayer('wisdom')}
        onOpenMonthlyForecast={() => openSecondaryLayer('monthly')}
      />}

      <MoodSelectorModal />

      {/* Sassy Cat Assistant AI Popup (Unlocked after 1 free view & provides lottery numbers for current period) */}
      {isSassyCatPopupOpen && <SassyCatAssistantPopup
        isOpen={isSassyCatPopupOpen}
        onClose={() => setIsSassyCatPopupOpen(false)}
        coins={coins}
        onOpenTopUp={() => isAuthenticated ? openSecondaryLayer('payment') : startLogin()}
        onSwitchDiscipline={handleChangeDiscipline}
        onAskChatQuestion={(q) => {
          handleSendMessage(q);
        }}
        onShowToast={showToast}
        soundEnabled={soundEnabled}
        onOpenLotteryVault={() => openSecondaryLayer('lottery')}
        onOpenEconomicsModal={() => openSecondaryLayer('economics')}
      />}

      {/* Cross-Reading Fate Synchronicity & Correlation Checker Modal */}
      {isFateSynchronicityModalOpen && <FateSynchronicityModal
        isOpen={isFateSynchronicityModalOpen}
        onClose={() => setIsFateSynchronicityModalOpen(false)}
        readings={readingsHistory}
        initialTab={synchronicityInitialTab}
        isAuthenticated={isAuthenticated}
        onSignIn={handleSignIn}
        onShowToast={showToast}
        onSwitchDiscipline={handleChangeDiscipline}
        onOpenWisdomLibrary={() => openSecondaryLayer('wisdom')}
      />}

      {/* Fortune Wisdom Library (จัดกลุ่มตามศาสตร์ & หัวข้อ + Data Viz แนวโน้มแพทเทิร์นชีวิต) */}
      {isWisdomLibraryOpen && <FortuneWisdomLibrary
        isOpen={isWisdomLibraryOpen}
        onClose={() => setIsWisdomLibraryOpen(false)}
        readings={readingsHistory}
        onSelectReading={(reading) => setActiveReadingResult(reading)}
        onSwitchDiscipline={handleChangeDiscipline}
        soundEnabled={soundEnabled}
        onOpenMonthlyForecast={() => openSecondaryLayer('monthly')}
      />}

      {/* Monthly Astrology Forecast (สรุปผล 4 ศาสตร์ประจำเดือน & วิเคราะห์แนวโน้มกวนๆ พร้อมแชร์รูปภาพ) */}
      {isMonthlyForecastOpen && <MonthlyAstrologyForecast
        isOpen={isMonthlyForecastOpen}
        onClose={() => setIsMonthlyForecastOpen(false)}
        readings={readingsHistory}
        onSelectReading={(reading) => setActiveReadingResult(reading)}
        onSwitchDiscipline={handleChangeDiscipline}
        soundEnabled={soundEnabled}
        onShowToast={showToast}
      />}

      {/* Zodiac Compatibility Engine Modal (วิเคราะห์ราศีคู่บุญหนุนดวง 12 ราศี) */}
      {isZodiacCompatibilityModalOpen && <ZodiacCompatibilityModal
        isOpen={isZodiacCompatibilityModalOpen}
        onClose={() => setIsZodiacCompatibilityModalOpen(false)}
        readingsHistory={readingsHistory}
        initialBirthProfile={birthProfile}
        onSaveBirthProfile={handleSaveBirthProfile}
        soundEnabled={soundEnabled}
        onOpenChatWithTopic={(topic) => {
          handleChangeDiscipline('chat');
          handleSendMessage(`แม่หมอเหมียวจ๋า เล่าเรื่องดวงสมพงษ์ของราศี ${topic} กับชีวิตฉันช่วงนี้ให้ฟังหน่อย`);
        }}
      />}

      {/* Historical Thai Lottery Results & User Unlocked Numbers Vault Modal */}
      {isLotteryVaultModalOpen && <LotteryHistoryVaultModal
        isOpen={isLotteryVaultModalOpen}
        onClose={() => setIsLotteryVaultModalOpen(false)}
        coins={coins}
        onOpenTopUp={handleOpenTopUp}
        onUnlockNewLottery={() => openSecondaryLayer('assistant')}
        onShowToast={showToast}
      />}

      {/* Thai Market Willingness-to-Pay & Credit Economics Calculator Modal */}
      {isEconomicsModalOpen && <ThaiCreditEconomicsModal
        isOpen={isEconomicsModalOpen}
        onClose={() => setIsEconomicsModalOpen(false)}
        coins={coins}
        onOpenTopUp={handleOpenTopUp}
      />}

      </Suspense>

      {/* Floating Interactive Sassy Cat Bubble */}
      {appMode !== 'teller' && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.5, type: 'spring' }}
          className="fixed bottom-24 right-5 z-40 hidden sm:right-7 md:block"
        >
          <motion.button
            whileHover={{ scale: 1.08, y: -3 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              if (soundEnabled) playMysticChime('card');
              openSecondaryLayer('assistant');
            }}
            className="group relative flex items-center gap-2.5 rounded-full bg-gradient-to-r from-[#3D144E] via-[#2A0E35] to-[#842C71] p-3 pr-4 sm:pr-5 text-left border-2 border-[#EAC272] shadow-2xl shadow-[#110417] cursor-pointer hover:shadow-[0_0_25px_rgba(234,194,114,0.45)] transition-all"
          >
            {/* Pulsing Aura Badge */}
            <span className="absolute -top-2.5 -right-1 flex items-center gap-1 rounded-full bg-gradient-to-r from-[#EAC272] to-[#D4A84D] px-2 py-0.5 text-[9px] font-black text-[#110918] shadow">
              <span>🎰 ขอหวย & ปรึกษา</span>
            </span>

            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1A0724] border border-[#EAC272]/60 text-xl group-hover:scale-110 transition-transform">
              🐾
            </div>

            <div className="hidden sm:block">
              <span className="block text-xs font-bold text-[#FAE9CA] group-hover:text-[#EAC272] transition-colors leading-tight">
                แม่หมอเหมียว AI
              </span>
              <span className="block text-[10px] text-[#C9B49D]">
                {freeReadingsUsed >= 1 ? 'ใช้สิทธิ์ฟรีแล้ว • แตะขอเลขเด็ด' : 'จิ้มรับคำแนะนำพิเศษ'}
              </span>
            </div>
          </motion.button>
        </motion.div>
      )}

      {/* Cosmic Soundscape & Ambient Audio Player */}
      <CosmicSoundscapePlayer onShowToast={showToast} />
    </div>
  );
}
