import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import {
  X,
  Coins,
  QrCode,
  Check,
  Sparkles,
  CreditCard,
  ArrowRight,
  ShieldCheck,
  UploadCloud,
  Clock,
  History,
  Info,
  Copy,
  Tag,
  Building,
  FileText,
  AlertCircle
} from 'lucide-react';
import { COIN_PACKAGES } from '../data/packagesData';
import { generatePromptPayQRCode } from '../utils/promptpay';
import { playCatPurrSound, playMysticChimeSound, playJackpotSound } from '../utils/speechHelper';
import { CoinTransaction } from '../types';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccessPayment: (coinsAdded: number, amountThb: number, pkgName: string) => void;
  currentCoins: number;
  transactions?: CoinTransaction[];
  onRedeemPromoCode?: (code: string) => boolean;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  onSuccessPayment,
  currentCoins,
  transactions = [],
}) => {
  const [selectedPackage, setSelectedPackage] = useState(COIN_PACKAGES[2] || COIN_PACKAGES[0]);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [verificationProgress, setVerificationProgress] = useState<string>('');
  const [step, setStep] = useState<'packages' | 'payment' | 'success' | 'ledger' | 'receipt'>('packages');
  const [paymentTab, setPaymentTab] = useState<'promptpay' | 'bank' | 'slip'>('promptpay');
  const [countdown, setCountdown] = useState<number>(300); // 5 minutes
  const [copiedAccount, setCopiedAccount] = useState<string | null>(null);

  // Promo Code State
  const [promoCode, setPromoCode] = useState<string>('');
  const [promoMessage, setPromoMessage] = useState<{ text: string; isError: boolean } | null>(null);
  const [usedPromoCodes, setUsedPromoCodes] = useState<string[]>(() => {
    const saved = localStorage.getItem('thecatroom_used_promos');
    return saved ? JSON.parse(saved) : [];
  });

  // Slip Upload State
  const [uploadedSlipPreview, setUploadedSlipPreview] = useState<string | null>(null);
  const [lastTransactionRef, setLastTransactionRef] = useState<string>('');

  // Generate QR when moving to payment step
  useEffect(() => {
    if (step === 'payment') {
      const mockRef = `CR-${Date.now().toString().slice(-6)}`;
      setLastTransactionRef(mockRef);

      generatePromptPayQRCode('0899998888', selectedPackage.priceThb)
        .then(url => setQrCodeUrl(url))
        .catch(err => console.error(err));

      setCountdown(300);
      const timer = setInterval(() => {
        setCountdown(c => (c > 0 ? c - 1 : 0));
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [step, selectedPackage]);

  if (!isOpen) return null;

  // Copy helper
  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedAccount(label);
    playMysticChimeSound('soft');
    setTimeout(() => setCopiedAccount(null), 2000);
  };

  // Promo Code Redeem Handler
  const handleRedeemPromo = () => {
    const cleanCode = promoCode.trim().toUpperCase();
    if (!cleanCode) return;

    if (usedPromoCodes.includes(cleanCode)) {
      setPromoMessage({ text: '⚠️ โค้ดนี้ถูกใช้งานไปแล้วจ้า', isError: true });
      return;
    }

    const promoMap: Record<string, { coins: number; name: string }> = {
      'LUCKY999': { coins: 50, name: 'โค้ดมหาเฮง 999 (+50 เหรียญ)' },
      'SASSYCAT': { coins: 30, name: 'โค้ดแม่หมอเหมียวฟาดสติ (+30 เหรียญ)' },
      'RICH2026': { coins: 100, name: 'โค้ดมหาเศรษฐีปี 2026 (+100 เหรียญ)' },
      'MEOWFREE': { coins: 25, name: 'โค้ดทาสแมวนำโชค (+25 เหรียญ)' },
    };

    const matched = promoMap[cleanCode];
    if (matched) {
      playJackpotSound();
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#EAC272', '#FAE9CA', '#842C71'],
      });

      const nextUsed = [...usedPromoCodes, cleanCode];
      setUsedPromoCodes(nextUsed);
      localStorage.setItem('thecatroom_used_promos', JSON.stringify(nextUsed));

      setPromoMessage({ text: `🎉 ยินดีด้วย! ได้รับ ${matched.coins} เหรียญฟรี`, isError: false });
      setPromoCode('');
      onSuccessPayment(matched.coins, 0, matched.name);
    } else {
      setPromoMessage({ text: '❌ โค้ดไม่ถูกต้อง หรือหมดอายุแล้ว ลอง LUCKY999 หรือ SASSYCAT', isError: true });
    }
  };

  // Simulated Slip Upload Selection
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setUploadedSlipPreview(reader.result as string);
        playMysticChimeSound('card');
      };
      reader.readAsDataURL(file);
    }
  };

  // Slip Verification / Approval
  const handleVerifySlip = () => {
    setIsVerifying(true);
    setVerificationProgress('กำลังเชื่อมต่อระบบตรวจสลิป EMVCo PromptPay...');

    setTimeout(() => {
      setVerificationProgress('ตรวจสอบยอดเงินตรงกัน ฿' + selectedPackage.priceThb + '.00 บาท...');
    }, 600);

    setTimeout(() => {
      setVerificationProgress('สลิปถูกต้องแท้จริง! กำลังโอนเหรียญเข้ากระเป๋า...');
    }, 1200);

    setTimeout(() => {
      setIsVerifying(false);
      setVerificationProgress('');
      setStep('success');
      playJackpotSound();

      // Trigger Confetti Celebration!
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#EAC272', '#FAE9CA', '#842C71', '#10B981'],
      });

      const totalCoins = selectedPackage.coins + selectedPackage.bonus;
      onSuccessPayment(totalCoins, selectedPackage.priceThb, selectedPackage.tag || `${selectedPackage.coins} เหรียญ`);
    }, 1800);
  };

  const handleReset = () => {
    setStep('packages');
    setUploadedSlipPreview(null);
    onClose();
  };

  const minutes = Math.floor(countdown / 60);
  const seconds = countdown % 60;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#110918]/85 p-4 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="relative my-6 w-full max-w-xl rounded-[32px] bg-gradient-to-b from-[#24102E] via-[#1A0923] to-[#110918] p-6 sm:p-8 border-2 border-[rgba(242,203,128,0.25)] shadow-2xl shadow-[#110918] max-h-[92vh] overflow-y-auto"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 rounded-full bg-[#1E0E2A] p-2 text-[#C9B49D] hover:text-[#FAE9CA] hover:bg-[#361A4A] border border-[rgba(242,203,128,0.15)] transition-all"
        >
          <X className="h-4 w-4" />
        </button>

        {/* ==================================================== */}
        {/* STEP 1: CHOOSE PACKAGE & PROMO CODE */}
        {/* ==================================================== */}
        {step === 'packages' && (
          <div className="space-y-5">
            <div className="text-center">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#361A4A] to-[#842C71] text-[#EAC272] text-2xl mb-2 border border-[rgba(242,203,128,0.3)] shadow-md">
                🪙
              </div>
              <h3 className="font-serif-display text-2xl font-bold text-[#FAE9CA]">
                เติมเหรียญดูดวงแม่หมอ (The Cat Coins)
              </h3>
              <p className="text-xs text-[#C9B49D] mt-1">
                เหรียญในกระเป๋าปัจจุบัน: <strong className="text-[#EAC272] font-serif-display text-sm">{currentCoins.toLocaleString()} เหรียญ</strong>
              </p>
            </div>

            {/* Promo Code Input Box */}
            <div className="rounded-2xl bg-[#110918]/90 p-3.5 border border-[rgba(242,203,128,0.2)]">
              <div className="flex items-center gap-2 mb-2">
                <Tag className="h-3.5 w-3.5 text-[#EAC272]" />
                <span className="text-xs font-bold text-[#FAE9CA]">มีโค้ดส่วนลดหรือรับเหรียญฟรีไหม?</span>
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="ใส่โค้ด เช่น LUCKY999, SASSYCAT"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                  className="flex-1 rounded-xl bg-[#1E0E2A] px-3 py-2 text-xs font-mono uppercase text-[#FAE9CA] border border-[rgba(242,203,128,0.2)] focus:border-[#EAC272] focus:outline-none"
                />
                <button
                  onClick={handleRedeemPromo}
                  className="btn-gilded px-4 py-2 text-xs font-bold text-[#110918]"
                >
                  ใช้โค้ด
                </button>
              </div>
              {promoMessage && (
                <p className={`text-[11px] mt-2 font-medium ${promoMessage.isError ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {promoMessage.text}
                </p>
              )}
            </div>

            {/* Packages Grid */}
            <div className="space-y-2.5">
              <span className="text-xs font-bold text-[#EAC272] block">
                เลือกแพ็กเกจเหรียญสุดคุ้ม:
              </span>
              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                {COIN_PACKAGES.map((pkg) => {
                  const isSel = selectedPackage.id === pkg.id;
                  return (
                    <div
                      key={pkg.id}
                      onClick={() => {
                        playMysticChimeSound('gold');
                        setSelectedPackage(pkg);
                      }}
                      className={`relative cursor-pointer rounded-2xl p-4 transition-all ${
                        isSel
                          ? 'bg-[#842C71]/35 border-2 border-[#EAC272] ring-2 ring-[#EAC272]/30 shadow-xl'
                          : 'bg-[#110918]/80 border border-[rgba(242,203,128,0.15)] hover:border-[rgba(242,203,128,0.4)]'
                      }`}
                    >
                      {pkg.tag && (
                        <span className={`absolute top-2 right-2 rounded-full px-2 py-0.5 text-[9px] font-bold ${
                          pkg.isBest ? 'bg-[#EAC272] text-[#110918]' : 'bg-[#361A4A] text-[#FAE9CA] border border-[rgba(242,203,128,0.2)]'
                        }`}>
                          {pkg.tag}
                        </span>
                      )}

                      <div className="flex items-center gap-2">
                        <Coins className="h-5 w-5 text-[#EAC272]" />
                        <span className="font-serif-display text-lg text-[#FAE9CA]">{pkg.coins} เหรียญ</span>
                      </div>

                      {pkg.bonus > 0 && (
                        <p className="text-[11px] font-bold text-[#AEFFE4] mt-0.5">
                          + แถมฟรี {pkg.bonus} เหรียญ (รวม {pkg.coins + pkg.bonus})
                        </p>
                      )}

                      <div className="mt-3 flex items-center justify-between border-t border-[rgba(242,203,128,0.12)] pt-2 text-xs">
                        <span className="text-[#C9B49D]">ราคาเพียง</span>
                        <span className="font-serif-display text-base text-[#EAC272]">฿{pkg.priceThb}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Ledger & Fast Note */}
            <div className="flex items-center justify-between pt-1">
              <button
                onClick={() => setStep('ledger')}
                className="flex items-center gap-1.5 text-xs text-[#C9B49D] hover:text-[#EAC272] transition-colors"
              >
                <History className="h-3.5 w-3.5" />
                <span>ประวัติเหรียญ ({transactions.length})</span>
              </button>

              <span className="text-[11px] text-[#AEFFE4] flex items-center gap-1">
                <ShieldCheck className="h-3.5 w-3.5 text-[#10B981]" />
                ระบบอนุมัติอัตโนมัติ 24 ชม.
              </span>
            </div>

            <button
              id="btn-proceed-qr"
              onClick={() => {
                playCatPurrSound();
                setStep('payment');
              }}
              className="btn-gilded w-full flex items-center justify-center gap-2 py-3.5 text-sm font-bold text-[#110918] cursor-pointer"
            >
              <span>ไปที่หน้าชำระเงิน (฿{selectedPackage.priceThb})</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* ==================================================== */}
        {/* STEP 2: PAYMENT CHANNELS & SLIP UPLOAD */}
        {/* ==================================================== */}
        {step === 'payment' && (
          <div className="space-y-4">
            <div className="text-center">
              <span className="text-xs font-bold text-[#AEFFE4] uppercase tracking-wider">
                ช่องทางชำระเงินที่ปลอดภัย
              </span>
              <h3 className="font-serif-display text-2xl text-[#FAE9CA] mt-0.5">
                ชำระยอด ฿{selectedPackage.priceThb} บาท
              </h3>
              <p className="text-xs text-[#C9B49D]">
                รับ {selectedPackage.coins + selectedPackage.bonus} เหรียญทันทีหลังชำระเงิน
              </p>
            </div>

            {/* Payment Method Switcher Tabs */}
            <div className="flex items-center justify-center gap-2 border-b border-[rgba(242,203,128,0.15)] pb-3">
              {[
                { id: 'promptpay' as const, name: 'พร้อมเพย์ QR', icon: <QrCode className="h-3.5 w-3.5" /> },
                { id: 'bank' as const, name: 'โอนบัญชีธนาคาร', icon: <Building className="h-3.5 w-3.5" /> },
                { id: 'slip' as const, name: 'แนบสลิปโอน', icon: <UploadCloud className="h-3.5 w-3.5" /> },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    playMysticChimeSound('soft');
                    setPaymentTab(tab.id);
                  }}
                  className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all ${
                    paymentTab === tab.id
                      ? 'bg-[#EAC272] text-[#110918] font-bold shadow'
                      : 'bg-[#1E0E2A] text-[#C9B49D] hover:text-[#FAE9CA]'
                  }`}
                >
                  {tab.icon}
                  <span>{tab.name}</span>
                </button>
              ))}
            </div>

            {/* TAB 1: PROMPTPAY QR */}
            {paymentTab === 'promptpay' && (
              <div className="space-y-3 text-center">
                <div className="mx-auto flex w-fit flex-col items-center justify-center rounded-2xl bg-white p-3.5 shadow-xl">
                  {qrCodeUrl ? (
                    <img src={qrCodeUrl} alt="PromptPay QR" className="h-44 w-44 object-contain" />
                  ) : (
                    <div className="h-44 w-44 flex items-center justify-center text-slate-800">
                      กำลังสร้าง QR...
                    </div>
                  )}
                  <div className="mt-1 text-[11px] font-bold text-slate-800 flex items-center gap-1">
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                    <span>PromptPay EMVCo มาตรฐานสากล</span>
                  </div>
                </div>

                <div className="flex items-center justify-center gap-1.5 text-xs text-[#EAC272]">
                  <Clock className="h-3.5 w-3.5" />
                  <span>รหัส QR หมดอายุใน {minutes}:{String(seconds).padStart(2, '0')} นาที</span>
                </div>

                <div className="rounded-xl bg-[#110918]/80 p-2.5 border border-[rgba(242,203,128,0.15)] flex items-center justify-between text-xs max-w-sm mx-auto">
                  <span className="text-[#C9B49D]">เบอร์พร้อมเพย์: <strong className="text-[#FAE9CA]">089-999-8888</strong></span>
                  <button
                    onClick={() => handleCopy('0899998888', 'พร้อมเพย์')}
                    className="flex items-center gap-1 text-[#EAC272] hover:underline"
                  >
                    <Copy className="h-3 w-3" />
                    <span>{copiedAccount === 'พร้อมเพย์' ? 'คัดลอกแล้ว' : 'คัดลอก'}</span>
                  </button>
                </div>
              </div>
            )}

            {/* TAB 2: BANK TRANSFER */}
            {paymentTab === 'bank' && (
              <div className="space-y-2.5">
                {[
                  { bank: 'ธนาคารกสิกรไทย (KBANK)', acc: '098-2-34567-8', name: 'บจก. เดอะแคทรูม ดูดวง', color: '#138f2d' },
                  { bank: 'ธนาคารไทยพาณิชย์ (SCB)', acc: '405-1-23456-7', name: 'บจก. เดอะแคทรูม ดูดวง', color: '#4e2a84' },
                  { bank: 'ธนาคารกรุงเทพ (BBL)', acc: '123-4-56789-0', name: 'บจก. เดอะแคทรูม ดูดวง', color: '#1e4598' },
                ].map((b, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between rounded-xl bg-[#110918] p-3 border border-[rgba(242,203,128,0.15)] text-xs"
                  >
                    <div>
                      <span className="font-bold text-[#FAE9CA] block">{b.bank}</span>
                      <span className="font-mono text-sm text-[#EAC272] font-bold">{b.acc}</span>
                      <span className="text-[10px] text-[#C9B49D] block">{b.name}</span>
                    </div>
                    <button
                      onClick={() => handleCopy(b.acc, b.bank)}
                      className="rounded-lg bg-[#24102E] px-3 py-1.5 text-xs text-[#EAC272] hover:bg-[#361A4A] border border-[rgba(242,203,128,0.2)] flex items-center gap-1"
                    >
                      <Copy className="h-3 w-3" />
                      <span>{copiedAccount === b.bank ? 'คัดลอกแล้ว' : 'คัดลอกเลข'}</span>
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* TAB 3: SLIP UPLOAD */}
            {paymentTab === 'slip' && (
              <div className="space-y-3">
                <div className="rounded-2xl border-2 border-dashed border-[rgba(242,203,128,0.3)] bg-[#110918]/60 p-4 text-center">
                  {uploadedSlipPreview ? (
                    <div className="space-y-2">
                      <img src={uploadedSlipPreview} alt="Slip Preview" className="h-40 mx-auto rounded-lg object-contain border border-[#EAC272]" />
                      <span className="text-[11px] text-emerald-400 block font-medium">✓ แนบไฟล์สลิปเรียบร้อยแล้ว</span>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center cursor-pointer py-4">
                      <UploadCloud className="h-8 w-8 text-[#EAC272] mb-1" />
                      <span className="text-xs font-bold text-[#FAE9CA]">คลิกเพื่ออัปโหลดสลิปจากเครื่อง</span>
                      <span className="text-[10px] text-[#C9B49D] mt-0.5">รองรับไฟล์ JPG, PNG</span>
                      <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                    </label>
                  )}
                </div>

                <div className="text-[11px] text-[#C9B49D] text-center">
                  💡 ระบบมี AI สแกนตรวจยอดเงิน ฿{selectedPackage.priceThb} บาท และเลขอ้างอิงอัตโนมัติ
                </div>
              </div>
            )}

            {/* Verification & Action Button */}
            <div className="space-y-2 pt-2">
              <button
                id="btn-verify-slip-instant"
                onClick={handleVerifySlip}
                disabled={isVerifying}
                className="btn-gilded w-full flex items-center justify-center gap-2 py-3.5 text-sm font-bold text-[#110918] cursor-pointer"
              >
                {isVerifying ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#110918] border-t-transparent" />
                    <span>{verificationProgress || 'กำลังยืนยันสลิปอัตโนมัติ...'}</span>
                  </div>
                ) : (
                  <>
                    <UploadCloud className="h-4 w-4" />
                    <span>แจ้งโอนเงิน / ยืนยันสลิปทันใจ</span>
                  </>
                )}
              </button>

              <button
                onClick={() => setStep('packages')}
                className="w-full text-center text-xs text-[#C9B49D] hover:text-[#FAE9CA] transition-colors py-1"
              >
                ← ย้อนกลับไปเปลี่ยนแพ็กเกจ
              </button>
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* STEP 3: SUCCESS SCREEN */}
        {/* ==================================================== */}
        {step === 'success' && (
          <div className="space-y-4 text-center py-4">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-emerald-950/60 text-3xl text-emerald-400 border border-emerald-500/40 shadow-lg">
              ✓
            </div>
            <div>
              <h3 className="font-serif-display text-2xl font-bold text-[#FAE9CA]">เติมเหรียญสำเร็จแล้ว!</h3>
              <p className="text-xs text-[#C9B49D] mt-1">
                ได้รับเพิ่ม <strong className="text-[#EAC272] text-sm">{selectedPackage.coins + selectedPackage.bonus} เหรียญ</strong> เรียบร้อย
              </p>
            </div>

            {/* Receipt Summary Card */}
            <div className="rounded-2xl bg-[#110918] p-4 border border-[rgba(242,203,128,0.2)] text-left space-y-2 text-xs">
              <div className="flex justify-between border-b border-[rgba(242,203,128,0.1)] pb-1.5">
                <span className="text-[#C9B49D]">รหัสธุรกรรม:</span>
                <span className="font-mono text-[#EAC272] font-bold">{lastTransactionRef || 'CR-SUCCESS'}</span>
              </div>
              <div className="flex justify-between border-b border-[rgba(242,203,128,0.1)] pb-1.5">
                <span className="text-[#C9B49D]">แพ็กเกจ:</span>
                <span className="text-[#FAE9CA]">{selectedPackage.tag || `${selectedPackage.coins} เหรียญ`}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#C9B49D]">ยอดชำระ:</span>
                <span className="text-emerald-400 font-bold">฿{selectedPackage.priceThb}.00 บาท (ชำระแล้ว)</span>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <button
                onClick={handleReset}
                className="btn-gilded w-full py-3.5 text-sm font-bold text-[#110918] cursor-pointer"
              >
                เปิดผ้าม่านดูดวงใน The Cat Room ต่อได้เลย!
              </button>
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* STEP 4: TRANSACTION LEDGER VIEW */}
        {/* ==================================================== */}
        {step === 'ledger' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-[rgba(242,203,128,0.14)] pb-3">
              <h3 className="font-serif-display text-lg text-[#FAE9CA] flex items-center gap-2">
                <History className="h-4 w-4 text-[#EAC272]" />
                สมุดบัญชีเหรียญ (Transaction Ledger)
              </h3>
              <button
                onClick={() => setStep('packages')}
                className="text-xs text-[#EAC272] hover:underline"
              >
                ← กลับไปเลือกแพ็กเกจ
              </button>
            </div>

            <div className="max-h-64 overflow-y-auto space-y-2 pr-1">
              {transactions.length === 0 ? (
                <div className="text-center py-8 text-xs text-[#C9B49D]">
                  ยังไม่มีประวัติการใช้งานเหรียญ
                </div>
              ) : (
                transactions.map((tx) => (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between rounded-xl bg-[#110918] p-3 border border-[rgba(242,203,128,0.12)] text-xs"
                  >
                    <div>
                      <span className="font-medium text-[#FAE9CA] block">{tx.reason}</span>
                      <span className="text-[10px] text-[#C9B49D]">{tx.timestamp}</span>
                    </div>
                    <div className="font-serif-display text-sm font-bold">
                      {tx.type === 'earn' ? (
                        <span className="text-[#AEFFE4]">+{tx.amount} 🪙</span>
                      ) : (
                        <span className="text-rose-400">-{tx.amount} 🪙</span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="rounded-xl bg-[#1E0E2A] p-3 border border-[rgba(242,203,128,0.15)] flex items-center justify-between text-xs">
              <span className="text-[#C9B49D]">ยอดคงเหลือปัจจุบัน</span>
              <span className="font-serif-display text-base text-[#EAC272] font-bold">
                {currentCoins.toLocaleString()} เหรียญ
              </span>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};
