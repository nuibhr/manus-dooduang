import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import {
  Send,
  Sparkles,
  Trash2,
  Volume2,
  VolumeX,
  Flame,
  Zap,
  User,
  MessageSquareHeart,
  HelpCircle,
  Clock,
  ArrowDown
} from 'lucide-react';
import { ChatMessage, DisciplineType, SassLevel } from '../types';
import { speakThaiText, stopSpeaking, playCatPurrSound } from '../utils/speechHelper';

interface ChatbotContinuousProps {
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  isLoading: boolean;
  onClearHistory: () => void;
  currentDiscipline: DisciplineType;
  onChangeDiscipline: (d: DisciplineType) => void;
  sassLevel: SassLevel;
  onChangeSassLevel: (l: SassLevel) => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  activeContext?: any;
}

export const ChatbotContinuous: React.FC<ChatbotContinuousProps> = ({
  messages,
  onSendMessage,
  isLoading,
  onClearHistory,
  currentDiscipline,
  onChangeDiscipline,
  sassLevel,
  onChangeSassLevel,
  soundEnabled,
  onToggleSound,
  activeContext,
}) => {
  const [inputText, setInputText] = useState('');
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  useEffect(() => {
    return () => {
      stopSpeaking();
    };
  }, []);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isLoading) return;
    if (soundEnabled) playCatPurrSound();
    onSendMessage(inputText.trim());
    setInputText('');
  };

  const handleQuickPrompt = (prompt: string) => {
    if (isLoading) return;
    if (soundEnabled) playCatPurrSound();
    onSendMessage(prompt);
  };

  // High quality Thai female voice reading
  const handleToggleSpeak = (msgId: string, text: string) => {
    if (speakingMessageId === msgId) {
      stopSpeaking();
      setSpeakingMessageId(null);
      return;
    }

    stopSpeaking();
    setSpeakingMessageId(msgId);

    speakThaiText(
      text,
      () => setSpeakingMessageId(msgId),
      () => setSpeakingMessageId(null),
      () => setSpeakingMessageId(null)
    );
  };

  const quickPrompts = [
    'ตบเรียกสติเรื่องความรักหน่อยเจ๊!',
    'ทำไมยังตัดใจจากแฟนเก่าไม่ได้สักที?',
    'งานที่ทำอยู่ควรทนต่อหรือยื่นใบลาออก?',
    'สแกนดวงการเงินให้หน่อย ทำไมเงินหมดไวมาก?',
    'ช่วยวิเคราะห์ผลไพ่ The Cat Room ให้เข้าใจง่ายๆ หน่อย',
  ];

  return (
    <div className="flex h-[calc(100vh-140px)] min-h-[580px] flex-col rounded-[32px] bg-gradient-to-b from-[#24102E] via-[#180B22] to-[#110918] border border-[rgba(242,203,128,0.2)] shadow-2xl shadow-[#110918] backdrop-blur-xl overflow-hidden">

      {/* Chat Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[rgba(242,203,128,0.15)] bg-[#180B22]/90 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="relative flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#361A4A] via-[#24102E] to-[#842C71] border border-[rgba(242,203,128,0.3)] shadow-md">
            <span className="text-xl">🐾</span>
            <span className="absolute -bottom-0.5 -right-0.5 flex h-3 w-3">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#EAC272] opacity-75"></span>
              <span className="relative inline-flex h-3 w-3 rounded-full bg-[#EAC272]"></span>
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-serif-display text-lg text-[#FAE9CA]">แม่หมอเหมียว (The Cat Room Oracle)</h3>
              <span className="rounded-full bg-[#842C71]/40 px-2 py-0.5 text-[10px] font-bold text-[#F2CB80] border border-[rgba(242,203,128,0.2)]">
                ตอบต่อเนื่อง 24 ชม.
              </span>
            </div>
            <p className="text-xs text-[#C9B49D]">
              แมวช่วยส่องไฟให้ แต่คนถือกุญแจยังเป็นคุณ
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Sass Level Selector */}
          <div className="flex items-center rounded-full bg-[#110918] p-1 border border-[rgba(242,203,128,0.15)]">
            <button
              onClick={() => onChangeSassLevel('mild')}
              className={`rounded-full px-2.5 py-1 text-[11px] font-semibold transition-all ${
                sassLevel === 'mild' ? 'bg-[#EAC272]/20 text-[#EAC272] border border-[#EAC272]/40' : 'text-[#C9B49D]'
              }`}
            >
              ละมุน
            </button>
            <button
              onClick={() => onChangeSassLevel('spicy')}
              className={`rounded-full px-2.5 py-1 text-[11px] font-semibold transition-all ${
                sassLevel === 'spicy' ? 'bg-[#842C71] text-[#FAE9CA] border border-[rgba(242,203,128,0.3)]' : 'text-[#C9B49D]'
              }`}
            >
              แซ่บ
            </button>
            <button
              onClick={() => onChangeSassLevel('savage')}
              className={`rounded-full px-2.5 py-1 text-[11px] font-semibold transition-all ${
                sassLevel === 'savage' ? 'bg-[#B3261E]/40 text-[#FFA4A4] border border-[#B3261E]/60' : 'text-[#C9B49D]'
              }`}
            >
              ฟาดแรง 🔥
            </button>
          </div>

          <button
            onClick={onClearHistory}
            className="rounded-full bg-[#1E0E2A] border border-[rgba(242,203,128,0.15)] p-2 text-[#C9B49D] hover:text-[#FFA4A4] hover:bg-[#361A4A] transition-all"
            title="ล้างประวัติการสนทนา"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Active Context Banner if any */}
      {activeContext && (
        <div className="bg-[#361A4A]/50 px-6 py-2 border-b border-[rgba(242,203,128,0.15)] flex items-center justify-between text-xs text-[#FAE9CA]">
          <span className="flex items-center gap-1.5 truncate">
            <Sparkles className="h-3.5 w-3.5 text-[#EAC272]" />
            เชื่อมต่อกับคำพยากรณ์ล่าสุด: <strong className="text-[#EAC272] truncate">{JSON.stringify(activeContext).slice(0, 60)}...</strong>
          </span>
          <span className="text-[10px] bg-[#842C71]/50 px-2 py-0.5 rounded-full text-[#FAE9CA] border border-[rgba(242,203,128,0.2)] shrink-0">
            บริบททำงานอยู่
          </span>
        </div>
      )}

      {/* Chat Messages List */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center p-6 space-y-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-[#361A4A]/50 text-3xl text-[#EAC272] border border-[rgba(242,203,128,0.3)] shadow-inner">
              🐾
            </div>
            <div className="max-w-md space-y-1">
              <h4 className="font-serif-display text-xl font-normal text-[#FAE9CA]">
                ห้องดูดวงแมวลึกลับเปิดรับฟังคุณแล้ว
              </h4>
              <p className="text-xs text-[#C9B49D] leading-relaxed">
                ถามมาได้ทุกเรื่อง ทั้งความรัก การงาน ปัญหาชีวิต หรือจะให้แปลความหมายผลไพ่/รูน/ดวงจีนที่เพิ่งเปิดได้ แม่หมอพร้อมวิเคราะห์ด้วยจิตวิทยาและสัจธรรม
              </p>
            </div>

            {/* Quick Prompts */}
            <div className="flex flex-wrap justify-center gap-2 max-w-lg pt-2">
              {quickPrompts.map((qp, i) => (
                <button
                  key={i}
                  onClick={() => handleQuickPrompt(qp)}
                  className="rounded-full bg-[#1E0E2A] border border-[rgba(242,203,128,0.18)] px-3.5 py-1.5 text-xs text-[#FAE9CA] hover:bg-[#842C71]/40 hover:border-[#EAC272] transition-all text-left"
                >
                  💬 {qp}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg) => {
            const isUser = msg.role === 'user';
            const isSpeakingThis = speakingMessageId === msg.id;
            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-[#361A4A] to-[#842C71] text-[#FAE9CA] font-bold text-sm border border-[rgba(242,203,128,0.3)] shadow-md">
                    🐾
                  </div>
                )}

                <div
                  className={`relative max-w-[85%] rounded-[24px] p-4 text-sm leading-relaxed shadow-lg ${
                    isUser
                      ? 'btn-gilded !rounded-tr-none text-[#110918]'
                      : 'bg-[#1E0E2A]/90 border border-[rgba(242,203,128,0.18)] text-[#FAE9CA] rounded-tl-none'
                  }`}
                >
                  {!isUser ? (
                    <div className="space-y-2">
                      <div className="prose prose-invert prose-sm max-w-none text-[#FAE9CA]/90">
                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                      </div>
                      <div className="flex items-center justify-between pt-2 border-t border-[rgba(242,203,128,0.12)] mt-2 text-[10px] text-[#C9B49D]">
                        <span>แม่หมอเหมียว • {msg.timestamp}</span>
                        <button
                          onClick={() => handleToggleSpeak(msg.id, msg.content)}
                          className={`flex items-center gap-1 transition-colors ${
                            isSpeakingThis ? 'text-[#EAC272] font-bold animate-pulse' : 'text-[#C9B49D] hover:text-[#FAE9CA]'
                          }`}
                          title="ฟังเสียงอ่านภาษาไทย"
                        >
                          {isSpeakingThis ? <VolumeX className="h-3 w-3" /> : <Volume2 className="h-3 w-3 text-[#EAC272]" />}
                          <span>{isSpeakingThis ? 'หยุดเสียง' : 'ฟังเสียง'}</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <p className="whitespace-pre-wrap font-medium">{msg.content}</p>
                      <span className="mt-1 block text-right text-[10px] text-[#110918]/70 font-sans">
                        {msg.timestamp}
                      </span>
                    </div>
                  )}
                </div>

                {isUser && (
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#24102E] text-[#FAE9CA] font-bold text-xs border border-[rgba(242,203,128,0.2)]">
                    <User className="h-4 w-4" />
                  </div>
                )}
              </motion.div>
            );
          })
        )}

        {isLoading && (
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-[#361A4A] to-[#842C71] text-[#FAE9CA] font-bold text-sm border border-[rgba(242,203,128,0.3)]">
              🐾
            </div>
            <div className="rounded-[20px] rounded-tl-none bg-[#1E0E2A] border border-[rgba(242,203,128,0.18)] p-4 text-xs text-[#EAC272] flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#EAC272] animate-bounce"></span>
              <span className="h-2 w-2 rounded-full bg-[#842C71] animate-bounce [animation-delay:0.2s]"></span>
              <span className="h-2 w-2 rounded-full bg-[#165B53] animate-bounce [animation-delay:0.4s]"></span>
              <span>แม่หมอเหมียวกำลังหลับตาเพ่งญาณและตรวจดวงดาว...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Chat Input Box */}
      <div className="border-t border-[rgba(242,203,128,0.15)] bg-[#180B22]/95 p-4">
        {/* Quick chip suggestions if in chat */}
        {messages.length > 0 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-2 no-scrollbar text-xs">
            {quickPrompts.slice(0, 3).map((qp, i) => (
              <button
                key={i}
                onClick={() => handleQuickPrompt(qp)}
                className="shrink-0 rounded-full bg-[#110918] border border-[rgba(242,203,128,0.15)] px-3 py-1 text-[11px] text-[#C9B49D] hover:text-[#FAE9CA] hover:border-[#EAC272]"
              >
                {qp}
              </button>
            ))}
          </div>
        )}

        <form onSubmit={handleSend} className="flex items-center gap-2">
          <input
            id="input-chat-message"
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="พิมพ์คำถาม หรือเปิดบทสนทนากับแม่หมอได้เลย..."
            disabled={isLoading}
            className="flex-1 rounded-full bg-[#110918] border border-[rgba(242,203,128,0.2)] px-5 py-3 text-sm text-[#FAE9CA] placeholder:text-[#C9B49D]/50 focus:border-[#EAC272] focus:outline-none"
          />
          <button
            id="btn-send-chat"
            type="submit"
            disabled={!inputText.trim() || isLoading}
            className="btn-gilded flex h-11 w-11 items-center justify-center rounded-full disabled:opacity-40 cursor-pointer shrink-0"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
