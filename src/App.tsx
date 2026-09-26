import React, { useState, useEffect } from 'react';
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
import { DailyFortuneView } from './components/DailyFortuneView';
import { ChineseFortuneView } from './components/ChineseFortuneView';
import { TarotFortuneView } from './components/TarotFortuneView';
import { OracleFortuneView } from './components/OracleFortuneView';
import { RuneFortuneView } from './components/RuneFortuneView';
import { ChatbotContinuous } from './components/ChatbotContinuous';
import { FortuneTellerBillingSuite } from './components/FortuneTellerBillingSuite';
import { PaymentModal } from './components/PaymentModal';
import { ReadingResultModal } from './components/ReadingResultModal';
import { HistoryDrawer } from './components/HistoryDrawer';
import { DailyRewardSystem } from './components/DailyRewardSystem';
import { MoodSelectorModal } from './components/MoodSelectorModal';
import { MonthlyAstrologyCalendar } from './components/MonthlyAstrologyCalendar';
import { LuckyNumberGenerator } from './components/LuckyNumberGenerator';
import { MoonPhaseWidget } from './components/MoonPhaseWidget';
import { TellerPasscodeModal } from './components/TellerPasscodeModal';
import { CosmicFortuneMinigame } from './components/CosmicFortuneMinigame';
import { CardDesignStudio } from './components/CardDesignStudio';
import { CosmicSoundscapePlayer } from './components/CosmicSoundscapePlayer';
import { SassyCatAssistantPopup } from './components/SassyCatAssistantPopup';
import { FateSynchronicityModal } from './components/FateSynchronicityModal';
import { LotteryHistoryVaultModal } from './components/LotteryHistoryVaultModal';
import { ThaiCreditEconomicsModal } from './components/ThaiCreditEconomicsModal';
import { FortuneWisdomLibrary } from './components/FortuneWisdomLibrary';
import { MonthlyAstrologyForecast } from './components/MonthlyAstrologyForecast';
import { ZodiacCompatibilityModal, UserBirthProfile, calculateBirthProfile } from './components/ZodiacCompatibilityEngine';
import {
  auth,
  db,
  signInWithGoogle,
  signOutUser,
  onAuthStateChanged,
  FirebaseUser,
  testFirestoreConnection
} from './firebase';
import { doc, getDoc, setDoc, updateDoc, collection, getDocs, orderBy, query } from 'firebase/firestore';
import { DisciplineType, AppMode, SassLevel, FortuneReading, ChatMessage, DailyFortuneData, CoinTransaction, CardDesignSettings, ReadingDepthTier, READING_DEPTH_TIERS } from './types';

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
  // Check URL query for secret teller mode (e.g. ?teller=true or ?mode=teller or hash #teller)
  const isTellerFromUrl = typeof window !== 'undefined' && (
    new URLSearchParams(window.location.search).get('teller') === 'true' ||
    new URLSearchParams(window.location.search).get('mode') === 'teller' ||
    window.location.hash.toLowerCase().includes('teller') ||
    localStorage.getItem('thecatroom_teller_authorized') === 'true'
  );

  // Navigation State
  const [activeDiscipline, setActiveDiscipline] = useState<DisciplineType>('daily');
  const [appMode, setAppMode] = useState<AppMode>(() => isTellerFromUrl ? 'teller' : 'client');
  const [isTellerAuthorized, setIsTellerAuthorized] = useState<boolean>(() => Boolean(isTellerFromUrl));
  const [isPasscodeModalOpen, setIsPasscodeModalOpen] = useState<boolean>(false);
  const [sassLevel, setSassLevel] = useState<SassLevel>('spicy');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Coins Balance
  const [coins, setCoins] = useState<number>(() => {
    const saved = localStorage.getItem('sassy_fortune_coins');
    return saved ? parseInt(saved, 10) : 50; // Initial 50 free coins
  });

  // Modal & Drawer States
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState<boolean>(false);
  const [isHistoryDrawerOpen, setIsHistoryDrawerOpen] = useState<boolean>(false);
  const [isSassyCatPopupOpen, setIsSassyCatPopupOpen] = useState<boolean>(false);
  const [isFateSynchronicityModalOpen, setIsFateSynchronicityModalOpen] = useState<boolean>(false);
  const [isLotteryVaultModalOpen, setIsLotteryVaultModalOpen] = useState<boolean>(false);
  const [isEconomicsModalOpen, setIsEconomicsModalOpen] = useState<boolean>(false);
  const [isWisdomLibraryOpen, setIsWisdomLibraryOpen] = useState<boolean>(false);
  const [isMonthlyForecastOpen, setIsMonthlyForecastOpen] = useState<boolean>(false);
  const [isZodiacCompatibilityModalOpen, setIsZodiacCompatibilityModalOpen] = useState<boolean>(false);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [birthProfile, setBirthProfile] = useState<UserBirthProfile | null>(() => {
    const saved = localStorage.getItem('thecatroom_user_birth_profile');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    const bDate = localStorage.getItem('thecatroom_birth_date');
    if (bDate) {
      const bTime = localStorage.getItem('thecatroom_birth_time') || '08:30';
      const bUnknown = localStorage.getItem('thecatroom_birth_time_unknown') === 'true';
      return calculateBirthProfile(bDate, bTime, bUnknown);
    }
    return null;
  });
  const [activeReadingResult, setActiveReadingResult] = useState<FortuneReading | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [isChatLoading, setIsChatLoading] = useState<boolean>(false);

  // Daily Free Reading Tracker (1st time is free, then popup offers VIP Cat assistant)
  const [freeReadingsUsed, setFreeReadingsUsed] = useState<number>(() => {
    const saved = localStorage.getItem('thecatroom_free_readings_used');
    return saved ? parseInt(saved, 10) : 0;
  });

  // Chatbot State
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(() => {
    const saved = localStorage.getItem('sassy_chat_history');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [
      {
        id: 'msg-welcome',
        role: 'assistant',
        content: `สวัสดีจ้าสาว! **แม่หมอลิลลี่** มาแล้วจ้ะ 💅✨\n\nยินดีต้อนรับสู่สำนักดูดวงที่**ไม่ขายฝัน ไม่อวย แต่พูดความจริงของโลกและหลักจิตวิทยาแบบตาสว่าง!**\n\nอยากดูเรื่องอะไร? ไพ่ยิปซี, โอราเคิล, หินรูนนอร์ส หรือดวงจีนปาจื่อ/อี้จิง ถามมาได้เลย หรือจะให้วิเคราะห์ผลดวงที่เปิดอยู่ก็ได้นะจ๊ะ!`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ];
  });

  // Fortune Readings History
  const [readingsHistory, setReadingsHistory] = useState<FortuneReading[]>(() => {
    const saved = localStorage.getItem('sassy_readings_history');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [];
  });

  // Coin Transactions Ledger
  const [transactions, setTransactions] = useState<CoinTransaction[]>(() => {
    const saved = localStorage.getItem('sassy_coin_transactions');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [
      {
        id: 'tx-welcome',
        type: 'earn',
        amount: 50,
        reason: 'ของขวัญต้อนรับสมาชิกใหม่ ดูดวงค่ะอีหญิง',
        timestamp: new Date().toLocaleString('th-TH'),
        balanceAfter: 50,
      }
    ];
  });

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

  const handleClaimMinigameReward = (amount: number, reason: string) => {
    const nextBal = Math.max(0, coins + amount);
    setCoins(nextBal);
    recordTransaction(amount >= 0 ? 'earn' : 'spend', Math.abs(amount), reason, nextBal);
  };

  // Toast Notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Firebase Auth & Firestore Connection Initialization
  useEffect(() => {
    testFirestoreConnection();

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);
      if (user) {
        try {
          const userRef = doc(db, 'users', user.uid);
          const snap = await getDoc(userRef);
          if (snap.exists()) {
            const data = snap.data();
            if (typeof data.coins === 'number') {
              setCoins(data.coins);
            }
            if (data.birthProfile) {
              setBirthProfile(data.birthProfile);
              try {
                localStorage.setItem('thecatroom_user_birth_profile', JSON.stringify(data.birthProfile));
                if (data.birthProfile.birthDate) localStorage.setItem('thecatroom_birth_date', data.birthProfile.birthDate);
                if (data.birthProfile.birthTime) localStorage.setItem('thecatroom_birth_time', data.birthProfile.birthTime);
                if (data.birthProfile.isTimeUnknown !== undefined) {
                  localStorage.setItem('thecatroom_birth_time_unknown', data.birthProfile.isTimeUnknown ? 'true' : 'false');
                }
              } catch (e) {}
            }
          } else {
            // Initialize user doc
            await setDoc(userRef, {
              id: user.uid,
              email: user.email || '',
              displayName: user.displayName || 'ผู้ใช้สำนักแมว',
              photoURL: user.photoURL || '',
              coins: coins,
              birthProfile: birthProfile || null,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            });
          }

          // Fetch user's saved readings from Firestore
          const readingsCol = collection(db, 'users', user.uid, 'readings');
          const readingsSnap = await getDocs(query(readingsCol, orderBy('timestamp', 'desc')));
          if (!readingsSnap.empty) {
            const remoteReadings = readingsSnap.docs.map(d => d.data() as FortuneReading);
            setReadingsHistory(remoteReadings);
          }
        } catch (e) {
          console.warn('Firebase user sync warning:', e);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  const handleSignInWithGoogle = async () => {
    try {
      const user = await signInWithGoogle();
      if (user) {
        showToast(`✨ เข้าสู่ระบบสำเร็จ ยินดีต้อนรับ ${user.displayName || user.email}!`);
        if (soundEnabled) playMysticChime('coin');
      }
    } catch (err: any) {
      console.error('Google Sign-In failed:', err);
      showToast('เข้าสู่ระบบไม่สำเร็จ: ' + (err.message || 'กรุณาลองใหม่'));
    }
  };

  const handleSignOutUser = async () => {
    try {
      await signOutUser();
      setFirebaseUser(null);
      showToast('👋 ออกจากระบบเรียบร้อย');
    } catch (err) {
      console.error('Sign out error:', err);
    }
  };

  const handleSaveBirthProfile = async (profile: UserBirthProfile) => {
    setBirthProfile(profile);
    try {
      localStorage.setItem('thecatroom_user_birth_profile', JSON.stringify(profile));
      localStorage.setItem('thecatroom_birth_date', profile.birthDate);
      localStorage.setItem('thecatroom_birth_time', profile.birthTime);
      localStorage.setItem('thecatroom_birth_time_unknown', profile.isTimeUnknown ? 'true' : 'false');
    } catch (e) {}

    showToast(`🪐 บันทึกดวงชะตาลัคนา${profile.lagnaSign.nameTh} เรียบร้อย!`);

    if (firebaseUser) {
      try {
        const userRef = doc(db, 'users', firebaseUser.uid);
        await updateDoc(userRef, {
          birthProfile: profile,
          updatedAt: new Date().toISOString(),
        });
      } catch (err) {
        console.warn('Failed to sync birth profile to Firestore:', err);
      }
    }
  };

  // Sync to local storage & Firestore
  useEffect(() => {
    localStorage.setItem('sassy_fortune_coins', coins.toString());
    if (firebaseUser) {
      const userRef = doc(db, 'users', firebaseUser.uid);
      setDoc(userRef, { coins, updatedAt: new Date().toISOString() }, { merge: true }).catch(console.warn);
    }
  }, [coins, firebaseUser]);

  useEffect(() => {
    localStorage.setItem('sassy_chat_history', JSON.stringify(chatMessages));
  }, [chatMessages]);

  useEffect(() => {
    localStorage.setItem('sassy_readings_history', JSON.stringify(readingsHistory));
  }, [readingsHistory]);

  useEffect(() => {
    localStorage.setItem('sassy_coin_transactions', JSON.stringify(transactions));
  }, [transactions]);

  const handleToggleSound = () => {
    setSoundEnabled(!soundEnabled);
  };

  // Record a coin transaction
  const recordTransaction = (type: 'earn' | 'spend', amount: number, reason: string, newBalance: number) => {
    const tx: CoinTransaction = {
      id: 'tx-' + Date.now(),
      type,
      amount,
      reason,
      timestamp: new Date().toLocaleString('th-TH'),
      balanceAfter: newBalance,
    };
    setTransactions(prev => [tx, ...prev]);
  };

  // Handle Top-Up Success
  const handleSuccessPayment = (coinsAdded: number, amountThb: number, pkgName: string) => {
    const newBal = coins + coinsAdded;
    setCoins(newBal);
    recordTransaction('earn', coinsAdded, `เติมเงิน ฿${amountThb} (${pkgName})`, newBal);
    if (soundEnabled) playMysticChime('coin');
    showToast(`✨ เติมเงินสำเร็จ! ได้รับ ${coinsAdded} เหรียญ`);
  };

  // Handle Daily Rewards & Quests
  const handleClaimDailyReward = (coinsWon: number, reason: string) => {
    const newBal = coins + coinsWon;
    setCoins(newBal);
    recordTransaction('earn', coinsWon, reason, newBal);
    if (soundEnabled) playMysticChime('coin');
  };

  // Deep Dive Reading API Caller with Dynamic Credit Deduction by Depth
  const handleAnalyzeReading = async (data: {
    discipline: DisciplineType;
    topic: string;
    question: string;
    itemsSelected: any;
    sassyLevel: SassLevel;
    depthTier?: ReadingDepthTier;
  }) => {
    const tier = data.depthTier || 'standard';
    const cost = READING_DEPTH_TIERS[tier]?.costCoins ?? 10;

    // Check coin cost dynamically
    if (coins < cost) {
      setIsPaymentModalOpen(true);
      showToast(`⚠️ เหรียญไม่พอสำหรับระดับ "${READING_DEPTH_TIERS[tier].label}" (ต้องการ ${cost} เหรียญ)`);
      return;
    }

    setIsAnalyzing(true);
    if (soundEnabled) playMysticChime('card');

    try {
      const res = await fetch('/api/gemini/reading', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          depthTier: tier,
          pastReadings: readingsHistory.slice(0, 3),
        }),
      });

      const json = await res.json();
      if (json.reading) {
        const newReading: FortuneReading = {
          id: 'read-' + Date.now(),
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

        const newBal = Math.max(0, coins - cost);
        setCoins(newBal);
        recordTransaction(
          'spend', 
          cost, 
          `ผ่าดวง ${data.discipline}: ${data.topic} [ระดับ: ${READING_DEPTH_TIERS[tier].label}]`, 
          newBal
        );

        setReadingsHistory([newReading, ...readingsHistory]);
        setActiveReadingResult(newReading);
        setActiveContext(newReading);

        // Persist to Firestore if user is authenticated
        if (firebaseUser) {
          const rRef = doc(db, 'users', firebaseUser.uid, 'readings', newReading.id);
          setDoc(rRef, {
            id: newReading.id,
            userId: firebaseUser.uid,
            discipline: newReading.discipline,
            topic: newReading.topic,
            question: newReading.question,
            markdownContent: newReading.markdownContent,
            sassyLevel: newReading.sassyLevel,
            timestamp: newReading.timestamp,
          }).catch(console.warn);
        }

        // Track reading count and prompt Sassy Cat Assistant
        const nextUsed = freeReadingsUsed + 1;
        setFreeReadingsUsed(nextUsed);
        localStorage.setItem('thecatroom_free_readings_used', nextUsed.toString());

        if (soundEnabled) playMysticChime('chime');

        // After closing reading or after first deep read, notify about the Cat assistant popup
        if (nextUsed === 1) {
          setTimeout(() => {
            setIsSassyCatPopupOpen(true);
            showToast('🐾 แม่หมอเหมียว AI แวะมาเตือน: คุณใช้สิทธิ์ฟรีครั้งแรกแล้ว มีเลขเด็ดงวดนี้รออยู่!');
          }, 1800);
        }
      } else {
        throw new Error(json.error || 'เกิดข้อผิดพลาดในการประมวลผล');
      }
    } catch (err: any) {
      console.error(err);
      showToast('เกิดข้อผิดพลาดในการอ่านดวง: ' + (err.message || 'โปรดลองอีกครั้ง'));
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Chat Message Sender
  const handleSendMessage = async (text: string) => {
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
      const res = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.map(m => ({ role: m.role, content: m.content })),
          discipline: activeDiscipline,
          sassyLevel: sassLevel,
          contextData: activeContext,
        }),
      });

      const json = await res.json();
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
    } catch (err) {
      console.error('Chat error:', err);
    } finally {
      setIsChatLoading(false);
    }
  };

  // Continue chat with specific reading result
  const handleContinueChatWithReading = (reading: FortuneReading) => {
    setActiveContext(reading);
    setActiveDiscipline('chat');
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
    setActiveDiscipline('chat');
    const promptText = `แม่หมอจ๋า ช่วยขยายความดวงวันนี้เรื่อง "${fortune.themeTitle}" ให้ฟังหน่อย โดยเฉพาะที่บอกว่า "${fortune.bestieRoast}" อยากรู้ว่าต้องทำตัวยังไงถึงจะไม่พลาด!`;
    handleSendMessage(promptText);
  };

  return (
    <div 
      className="min-h-screen font-sans relative overflow-x-hidden transition-colors duration-500"
      style={{
        backgroundColor: 'var(--cat-surface)',
        color: 'var(--cat-cream)',
      }}
    >
      
      {/* Background Ambience Glows reacting to Mood CSS variables */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden opacity-35 transition-all duration-700">
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
        onChangeDiscipline={setActiveDiscipline}
        appMode={appMode}
        onChangeMode={(newMode) => {
          if (newMode === 'teller' && !isTellerAuthorized) {
            setIsPasscodeModalOpen(true);
            return;
          }
          setAppMode(newMode);
        }}
        coins={coins}
        onOpenPaymentModal={() => setIsPaymentModalOpen(true)}
        onOpenHistory={() => setIsHistoryDrawerOpen(true)}
        soundEnabled={soundEnabled}
        onToggleSound={handleToggleSound}
        historyCount={readingsHistory.length}
        isTellerAuthorized={isTellerAuthorized}
        onOpenSynchronicityModal={() => setIsFateSynchronicityModalOpen(true)}
        onOpenLotteryVault={() => setIsLotteryVaultModalOpen(true)}
        onOpenEconomicsModal={() => setIsEconomicsModalOpen(true)}
        onOpenWisdomLibrary={() => setIsWisdomLibraryOpen(true)}
        onOpenMonthlyForecast={() => setIsMonthlyForecastOpen(true)}
        onOpenZodiacCompatibility={() => setIsZodiacCompatibilityModalOpen(true)}
        readingsHistory={readingsHistory}
        birthProfile={birthProfile}
        firebaseUser={firebaseUser}
        onSignInWithGoogle={handleSignInWithGoogle}
        onSignOut={handleSignOutUser}
      />

      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 right-6 z-50 rounded-2xl bg-purple-900/90 px-4 py-2.5 text-xs font-semibold text-white shadow-2xl border border-purple-500/50 backdrop-blur-md"
          >
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Application Container */}
      <main className="relative z-10 mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        
        {/* Fortune Teller Billing Mode */}
        {appMode === 'teller' ? (
          <motion.div
            key="teller-view"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <FortuneTellerBillingSuite
              readings={readingsHistory}
              onExit={() => setAppMode('client')}
            />
          </motion.div>
        ) : (
          /* Client Fortune-Telling Mode */
          <div className="space-y-6">
            
            {/* Daily Reward & Checkin Quest System */}
            <DailyRewardSystem
              currentCoins={coins}
              onClaimDailyReward={handleClaimDailyReward}
              onOpenTopUp={() => setIsPaymentModalOpen(true)}
              onShowToast={showToast}
            />

            {/* Quick Sassy Personality Bar */}
            {activeDiscipline !== 'chat' && (
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-slate-900/40 p-3 px-4 border border-slate-800/80 text-xs">
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
                    onClick={() => setActiveDiscipline('chat')}
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
              <MoonPhaseWidget
                onShowToast={showToast}
                soundEnabled={soundEnabled}
              />
            )}

            {/* Discipline Views */}
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
                    onOpenSynchronicityModal={() => setIsFateSynchronicityModalOpen(true)}
                    onOpenLotteryVault={() => setIsLotteryVaultModalOpen(true)}
                    onOpenEconomicsModal={() => setIsEconomicsModalOpen(true)}
                    onOpenZodiacCompatibility={() => setIsZodiacCompatibilityModalOpen(true)}
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
                    onOpenTopUp={() => setIsPaymentModalOpen(true)}
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
                    onSwitchDiscipline={(d) => setActiveDiscipline(d)}
                    onShowToast={showToast}
                    soundEnabled={soundEnabled}
                    onOpenMonthlyForecast={() => setIsMonthlyForecastOpen(true)}
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
                    onSwitchDiscipline={(d) => setActiveDiscipline(d)}
                    onShowToast={showToast}
                    soundEnabled={soundEnabled}
                    coins={coins}
                    onSpendCoins={(amount, reason) => {
                      if (coins < amount) return false;
                      const nextBal = coins - amount;
                      setCoins(nextBal);
                      recordTransaction('spend', amount, reason, nextBal);
                      return true;
                    }}
                    onOpenTopUp={() => setIsPaymentModalOpen(true)}
                    readings={readingsHistory}
                    onOpenSynchronicityModal={() => setIsFateSynchronicityModalOpen(true)}
                    onOpenLotteryVault={() => setIsLotteryVaultModalOpen(true)}
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
                    onOpenTopUp={() => setIsPaymentModalOpen(true)}
                    readings={readingsHistory}
                    onOpenSynchronicityModal={() => setIsFateSynchronicityModalOpen(true)}
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
                    onOpenCardStudio={() => setActiveDiscipline('card_studio')}
                    userCoins={coins}
                    onOpenTopUp={() => setIsPaymentModalOpen(true)}
                    readings={readingsHistory}
                    onOpenSynchronicityModal={() => setIsFateSynchronicityModalOpen(true)}
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
                    onOpenCardStudio={() => setActiveDiscipline('card_studio')}
                    userCoins={coins}
                    onOpenTopUp={() => setIsPaymentModalOpen(true)}
                    readings={readingsHistory}
                    onOpenSynchronicityModal={() => setIsFateSynchronicityModalOpen(true)}
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
                    onOpenTopUp={() => setIsPaymentModalOpen(true)}
                    readings={readingsHistory}
                    onOpenSynchronicityModal={() => setIsFateSynchronicityModalOpen(true)}
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
                    onChangeDiscipline={setActiveDiscipline}
                    sassLevel={sassLevel}
                    onChangeSassLevel={setSassLevel}
                    soundEnabled={soundEnabled}
                    onToggleSound={handleToggleSound}
                    activeContext={activeContext}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </main>

      {/* Footer Area with Clean Mystic Branding & Discreet Teller Access */}
      <footer className="relative z-10 border-t border-[rgba(242,203,128,0.1)] py-8 text-center text-xs text-[#C9B49D]/60">
        <div className="mx-auto max-w-7xl px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-sm">🐾</span>
            <span className="font-serif-display text-[#FAE9CA] font-medium">ดูดวงค่ะอีหญิง • แม่หมอเหมียว</span>
            <span>—</span>
            <span className="text-[11px] italic">"ดูดวงแบบไม่หวานเจี๊ยบ แต่ตรงจนมีสะดุ้ง ✨"</span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            {isTellerAuthorized ? (
              <button
                onClick={() => setAppMode(appMode === 'teller' ? 'client' : 'teller')}
                className="text-[#EAC272] hover:underline font-semibold"
              >
                {appMode === 'teller' ? '← สลับไปหน้าดูดวง' : '→ สลับไปหน้าระบบบิลแม่หมอ'}
              </button>
            ) : (
              <button
                onClick={() => setIsPasscodeModalOpen(true)}
                className="text-[#C9B49D]/30 hover:text-[#C9B49D]/70 transition-colors"
                title="สำหรับแม่หมอเจ้าของสำนักเท่านั้น"
              >
                🔒 สำหรับผู้ดูแลสำนัก
              </button>
            )}
          </div>
        </div>
      </footer>

      {/* Modals & Drawers */}
      <TellerPasscodeModal
        isOpen={isPasscodeModalOpen}
        onClose={() => setIsPasscodeModalOpen(false)}
        onSuccess={() => {
          setIsTellerAuthorized(true);
          setAppMode('teller');
          try {
            localStorage.setItem('thecatroom_teller_authorized', 'true');
          } catch (e) {}
          showToast('🔑 เข้าสู่ระบบหลังบ้านแม่หมอเรียบร้อย!');
        }}
      />

      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        onSuccessPayment={handleSuccessPayment}
        currentCoins={coins}
        transactions={transactions}
      />

      <ReadingResultModal
        reading={activeReadingResult}
        onClose={() => setActiveReadingResult(null)}
        onContinueChatWithReading={handleContinueChatWithReading}
      />

      <HistoryDrawer
        isOpen={isHistoryDrawerOpen}
        onClose={() => setIsHistoryDrawerOpen(false)}
        history={readingsHistory}
        onSelectReading={(reading) => setActiveReadingResult(reading)}
        onClearHistory={() => setReadingsHistory([])}
        onOpenWisdomLibrary={() => setIsWisdomLibraryOpen(true)}
        onOpenMonthlyForecast={() => setIsMonthlyForecastOpen(true)}
      />

      <MoodSelectorModal />

      {/* Sassy Cat Assistant AI Popup (Unlocked after 1 free view & provides lottery numbers for current period) */}
      <SassyCatAssistantPopup
        isOpen={isSassyCatPopupOpen}
        onClose={() => setIsSassyCatPopupOpen(false)}
        coins={coins}
        onSpendCoins={(amount, reason) => {
          if (coins < amount) return false;
          const nextBal = coins - amount;
          setCoins(nextBal);
          recordTransaction('spend', amount, reason, nextBal);
          return true;
        }}
        onOpenTopUp={() => setIsPaymentModalOpen(true)}
        onSwitchDiscipline={(d) => setActiveDiscipline(d)}
        onAskChatQuestion={(q) => {
          handleSendMessage(q);
        }}
        onShowToast={showToast}
        soundEnabled={soundEnabled}
        onOpenLotteryVault={() => setIsLotteryVaultModalOpen(true)}
        onOpenEconomicsModal={() => setIsEconomicsModalOpen(true)}
      />

      {/* Cross-Reading Fate Synchronicity & Correlation Checker Modal */}
      <FateSynchronicityModal
        isOpen={isFateSynchronicityModalOpen}
        onClose={() => setIsFateSynchronicityModalOpen(false)}
        readings={readingsHistory}
        coins={coins}
        onSwitchDiscipline={(d) => setActiveDiscipline(d)}
        onShowToast={showToast}
        onOpenWisdomLibrary={() => setIsWisdomLibraryOpen(true)}
      />

      {/* Fortune Wisdom Library (จัดกลุ่มตามศาสตร์ & หัวข้อ + Data Viz แนวโน้มแพทเทิร์นชีวิต) */}
      <FortuneWisdomLibrary
        isOpen={isWisdomLibraryOpen}
        onClose={() => setIsWisdomLibraryOpen(false)}
        readings={readingsHistory}
        onSelectReading={(reading) => setActiveReadingResult(reading)}
        onSwitchDiscipline={(d) => setActiveDiscipline(d)}
        soundEnabled={soundEnabled}
        onOpenMonthlyForecast={() => setIsMonthlyForecastOpen(true)}
      />

      {/* Monthly Astrology Forecast (สรุปผล 4 ศาสตร์ประจำเดือน & วิเคราะห์แนวโน้มกวนๆ พร้อมแชร์รูปภาพ) */}
      <MonthlyAstrologyForecast
        isOpen={isMonthlyForecastOpen}
        onClose={() => setIsMonthlyForecastOpen(false)}
        readings={readingsHistory}
        onSelectReading={(reading) => setActiveReadingResult(reading)}
        onSwitchDiscipline={(d) => setActiveDiscipline(d)}
        soundEnabled={soundEnabled}
        onShowToast={showToast}
      />

      {/* Zodiac Compatibility Engine Modal (วิเคราะห์ราศีคู่บุญหนุนดวง 12 ราศี) */}
      <ZodiacCompatibilityModal
        isOpen={isZodiacCompatibilityModalOpen}
        onClose={() => setIsZodiacCompatibilityModalOpen(false)}
        readingsHistory={readingsHistory}
        initialBirthProfile={birthProfile}
        onSaveBirthProfile={handleSaveBirthProfile}
        soundEnabled={soundEnabled}
        onOpenChatWithTopic={(topic) => {
          setIsZodiacCompatibilityModalOpen(false);
          setActiveDiscipline('chat');
          handleSendMessage(`แม่หมอเหมียวจ๋า เล่าเรื่องดวงสมพงษ์ของราศี ${topic} กับชีวิตฉันช่วงนี้ให้ฟังหน่อย`);
        }}
      />

      {/* Historical Thai Lottery Results & User Unlocked Numbers Vault Modal */}
      <LotteryHistoryVaultModal
        isOpen={isLotteryVaultModalOpen}
        onClose={() => setIsLotteryVaultModalOpen(false)}
        coins={coins}
        onOpenTopUp={() => setIsPaymentModalOpen(true)}
        onUnlockNewLottery={() => setIsSassyCatPopupOpen(true)}
        onShowToast={showToast}
      />

      {/* Thai Market Willingness-to-Pay & Credit Economics Calculator Modal */}
      <ThaiCreditEconomicsModal
        isOpen={isEconomicsModalOpen}
        onClose={() => setIsEconomicsModalOpen(false)}
        coins={coins}
        onOpenTopUp={() => setIsPaymentModalOpen(true)}
      />

      {/* Floating Interactive Sassy Cat Bubble */}
      {appMode !== 'teller' && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.5, type: 'spring' }}
          className="fixed bottom-24 right-5 sm:right-7 z-40"
        >
          <motion.button
            whileHover={{ scale: 1.08, y: -3 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              if (soundEnabled) playMysticChime('card');
              setIsSassyCatPopupOpen(true);
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
