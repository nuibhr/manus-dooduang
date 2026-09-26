import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Lock, KeyRound, X, Sparkles, AlertCircle } from 'lucide-react';
import { playMysticChimeSound } from '../utils/speechHelper';

interface TellerPasscodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const TellerPasscodeModal: React.FC<TellerPasscodeModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [pin, setPin] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');

  if (!isOpen) return null;

  // Master passcode for fortune teller console (Default: 8888 or custom 9999)
  const CORRECT_PINS = ['8888', '9999', '1234'];

  const handleDigit = (digit: string) => {
    if (pin.length >= 4) return;
    const newPin = pin + digit;
    setPin(newPin);
    setErrorMsg('');

    if (newPin.length === 4) {
      if (CORRECT_PINS.includes(newPin)) {
        playMysticChimeSound('gold');
        onSuccess();
        onClose();
        setPin('');
      } else {
        playMysticChimeSound('soft');
        setErrorMsg('รหัสผ่านไม่ถูกต้อง (ลอง 8888)');
        setTimeout(() => setPin(''), 600);
      }
    }
  };

  const handleDelete = () => {
    setPin(pin.slice(0, -1));
    setErrorMsg('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="w-full max-w-sm rounded-[32px] bg-[#180B22] p-6 border border-[rgba(242,203,128,0.3)] shadow-2xl relative text-center"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-2 text-[#C9B49D] hover:bg-[#24102E] hover:text-[#FAE9CA] transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header Icon */}
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#361A4A] to-[#842C71] border border-[rgba(242,203,128,0.4)] text-[#EAC272] mb-3 shadow-lg">
          <KeyRound className="h-6 w-6" />
        </div>

        <h3 className="font-serif-display text-xl text-[#FAE9CA]">ระบบหลังบ้านแม่หมอ</h3>
        <p className="text-xs text-[#C9B49D] mt-1">
          กรุณากรอกรหัส PIN 4 หลักเพื่อเข้าสู่ระบบออกบิลและสรุปรายรับ
        </p>

        {/* PIN Indicators */}
        <div className="my-6 flex justify-center items-center gap-3">
          {[0, 1, 2, 3].map((idx) => {
            const isFilled = pin.length > idx;
            return (
              <div
                key={idx}
                className={`h-4 w-4 rounded-full transition-all duration-200 ${
                  isFilled
                    ? 'bg-[#EAC272] scale-110 shadow-[0_0_10px_#EAC272]'
                    : 'bg-[#110918] border border-[rgba(242,203,128,0.3)]'
                }`}
              />
            );
          })}
        </div>

        {errorMsg && (
          <div className="mb-4 flex items-center justify-center gap-1.5 text-xs text-rose-400 font-semibold animate-shake">
            <AlertCircle className="h-3.5 w-3.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Keypad */}
        <div className="grid grid-cols-3 gap-2.5 max-w-[240px] mx-auto">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
            <button
              key={digit}
              onClick={() => handleDigit(digit)}
              className="h-12 rounded-2xl bg-[#24102E]/80 hover:bg-[#361A4A] border border-[rgba(242,203,128,0.18)] text-base font-bold text-[#FAE9CA] active:scale-95 transition-all shadow-sm"
            >
              {digit}
            </button>
          ))}
          <div />
          <button
            onClick={() => handleDigit('0')}
            className="h-12 rounded-2xl bg-[#24102E]/80 hover:bg-[#361A4A] border border-[rgba(242,203,128,0.18)] text-base font-bold text-[#FAE9CA] active:scale-95 transition-all shadow-sm"
          >
            0
          </button>
          <button
            onClick={handleDelete}
            className="h-12 rounded-2xl bg-[#24102E]/40 hover:bg-[#24102E] border border-[rgba(242,203,128,0.1)] text-xs font-semibold text-[#C9B49D] active:scale-95 transition-all"
          >
            ลบ
          </button>
        </div>

        {/* Quick Hint for Owner */}
        <p className="mt-5 text-[10px] text-[#C9B49D]/50">
          * รหัสเริ่มต้นสำนักแม่หมอ: <span className="font-mono text-[#EAC272]">8888</span> (หรือเข้าผ่าน URL <code className="text-[#AEFFE4]">?teller=true</code>)
        </p>
      </motion.div>
    </div>
  );
};
