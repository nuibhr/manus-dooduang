import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { AlertCircle, ArrowRight, CheckCircle2, Coins, History, Loader2, ShieldCheck, X } from 'lucide-react';
import { COIN_PACKAGES } from '../data/packagesData';
import { trpc } from '../lib/trpc';
import type { CoinTransaction } from '../types';
import type { CoinSku } from '../../../shared/catalog';

const AVAILABLE_PACKAGES = COIN_PACKAGES.filter(pkg => pkg.id !== 'coin-double-first');

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentCoins: number;
  transactions?: CoinTransaction[];
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  currentCoins,
  transactions = [],
}) => {
  const [selectedPackage, setSelectedPackage] = useState(AVAILABLE_PACKAGES[1] || AVAILABLE_PACKAGES[0]);
  const [showLedger, setShowLedger] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [idempotencyKey, setIdempotencyKey] = useState(() => `checkout:${crypto.randomUUID()}`);
  const readiness = trpc.payments.readiness.useQuery(undefined, { enabled: isOpen, retry: false });
  const checkout = trpc.payments.createCheckout.useMutation();

  useEffect(() => {
    if (!isOpen) return;
    setError(null);
    setShowLedger(false);
    setIdempotencyKey(`checkout:${crypto.randomUUID()}`);
  }, [isOpen]);

  const canCheckout = readiness.data?.configured && readiness.data.mode === 'test';
  const statusText = useMemo(() => {
    if (readiness.isLoading) return 'กำลังตรวจสถานะระบบชำระเงิน…';
    if (readiness.data?.mode === 'live' && !readiness.data.liveModeEnabled) return 'พบ Live key แต่ระบบปิดรับเงินจริงไว้เพื่อความปลอดภัย';
    if (!readiness.data?.configured) return 'Stripe Test Mode ยังไม่ได้ตั้งค่า — ขณะนี้ไม่มีการรับชำระเงินจริง';
    if (readiness.data.mode === 'test') return 'Stripe Test Mode พร้อมทดสอบ — ยังไม่ตัดเงินจริง';
    return 'ระบบชำระเงินยังไม่พร้อม';
  }, [readiness.data, readiness.isLoading]);

  if (!isOpen) return null;

  const handleCheckout = async () => {
    if (!canCheckout) return;
    setError(null);
    try {
      const result = await checkout.mutateAsync({
        sku: selectedPackage.id as CoinSku,
        idempotencyKey,
      });
      if (!result.checkoutUrl) throw new Error('ไม่พบ Checkout URL');
      window.location.assign(result.checkoutUrl);
    } catch (err: any) {
      setError(err.message || 'สร้าง Stripe Checkout ไม่สำเร็จ');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-[#110918]/85 p-4 backdrop-blur-md">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="relative my-6 max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-[32px] border-2 border-[rgba(242,203,128,0.25)] bg-gradient-to-b from-[#24102E] via-[#1A0923] to-[#110918] p-6 shadow-2xl shadow-[#110918] sm:p-8"
      >
        <button onClick={onClose} className="absolute right-5 top-5 rounded-full border border-[rgba(242,203,128,0.15)] bg-[#1E0E2A] p-2 text-[#C9B49D] transition-all hover:bg-[#361A4A] hover:text-[#FAE9CA]" aria-label="ปิด">
          <X className="h-4 w-4" />
        </button>

        <div className="space-y-5">
          <div className="text-center">
            <div className="mb-2 inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-[rgba(242,203,128,0.3)] bg-gradient-to-tr from-[#361A4A] to-[#842C71] text-2xl text-[#EAC272]">🪙</div>
            <h3 className="font-serif-display text-2xl font-bold text-[#FAE9CA]">เติมเหรียญผ่าน Stripe Checkout</h3>
            <p className="mt-1 text-xs text-[#C9B49D]">ยอดในฐานข้อมูล: <strong className="text-[#EAC272]">{currentCoins.toLocaleString()} เหรียญ</strong></p>
          </div>

          <div className={`rounded-2xl border p-3 text-xs ${canCheckout ? 'border-emerald-400/30 bg-emerald-500/10 text-emerald-200' : 'border-amber-400/30 bg-amber-500/10 text-amber-100'}`}>
            <div className="flex items-start gap-2">
              {canCheckout ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" /> : <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />}
              <div>
                <p className="font-bold">{statusText}</p>
                <p className="mt-1 opacity-80">เหรียญจะเพิ่มจาก Stripe webhook ที่ตรวจลายเซ็นและยอดเงินแล้วเท่านั้น หน้า success ไม่สามารถเพิ่มเหรียญเองได้</p>
              </div>
            </div>
          </div>

          {!showLedger ? (
            <>
              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                {AVAILABLE_PACKAGES.map(pkg => {
                  const selected = selectedPackage.id === pkg.id;
                  return (
                    <button
                      type="button"
                      key={pkg.id}
                      onClick={() => {
                        setSelectedPackage(pkg);
                        setIdempotencyKey(`checkout:${crypto.randomUUID()}`);
                      }}
                      className={`relative rounded-2xl p-4 text-left transition-all ${selected ? 'border-2 border-[#EAC272] bg-[#842C71]/35 ring-2 ring-[#EAC272]/30' : 'border border-[rgba(242,203,128,0.15)] bg-[#110918]/80 hover:border-[rgba(242,203,128,0.4)]'}`}
                    >
                      {pkg.tag && <span className="absolute right-2 top-2 rounded-full bg-[#EAC272] px-2 py-0.5 text-[9px] font-bold text-[#110918]">{pkg.tag}</span>}
                      <div className="flex items-center gap-2 pr-20"><Coins className="h-5 w-5 text-[#EAC272]" /><span className="font-serif-display text-lg text-[#FAE9CA]">{pkg.coins + pkg.bonus} เหรียญ</span></div>
                      <div className="mt-3 flex items-center justify-between border-t border-[rgba(242,203,128,0.12)] pt-2 text-xs"><span className="text-[#C9B49D]">ราคา</span><span className="font-serif-display text-base text-[#EAC272]">฿{pkg.priceThb}</span></div>
                    </button>
                  );
                })}
              </div>

              <button type="button" onClick={() => setShowLedger(true)} className="flex items-center gap-1.5 text-xs text-[#C9B49D] hover:text-[#EAC272]"><History className="h-3.5 w-3.5" />ประวัติเหรียญจากฐานข้อมูล ({transactions.length})</button>

              <button
                type="button"
                onClick={handleCheckout}
                disabled={!canCheckout || checkout.isPending}
                className="btn-gilded flex w-full items-center justify-center gap-2 py-3.5 text-sm font-bold text-[#110918] disabled:cursor-not-allowed disabled:opacity-45"
              >
                {checkout.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
                <span>{canCheckout ? `ไป Stripe Test Checkout (฿${selectedPackage.priceThb})` : 'รอเชื่อม Stripe Test Mode'}</span>
                {!checkout.isPending && <ArrowRight className="h-4 w-4" />}
              </button>
              {error && <p className="rounded-xl border border-rose-400/30 bg-rose-500/10 p-3 text-xs text-rose-200">{error}</p>}
            </>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between"><h4 className="font-serif-display text-lg text-[#FAE9CA]">สมุดบัญชีเหรียญจาก TiDB</h4><button onClick={() => setShowLedger(false)} className="text-xs text-[#EAC272]">← กลับ</button></div>
              <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
                {transactions.length === 0 ? <p className="py-8 text-center text-xs text-[#C9B49D]">ยังไม่มีรายการ</p> : transactions.map(tx => (
                  <div key={tx.id} className="flex items-center justify-between rounded-xl border border-[rgba(242,203,128,0.12)] bg-[#110918] p-3 text-xs">
                    <div><span className="block font-medium text-[#FAE9CA]">{tx.reason}</span><span className="text-[10px] text-[#C9B49D]">{tx.timestamp}</span></div>
                    <span className={tx.type === 'earn' ? 'font-bold text-[#AEFFE4]' : 'font-bold text-rose-400'}>{tx.type === 'earn' ? '+' : '-'}{tx.amount} 🪙</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
