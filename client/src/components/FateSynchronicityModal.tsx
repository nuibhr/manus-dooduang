import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Check, ExternalLink, Flame, HelpCircle, LoaderCircle, Smartphone, X } from 'lucide-react';
import { FortuneReading, DisciplineType } from '../types';
import { analyzeFateSynchronicity } from '../utils/fateDatabase';
import { trpc } from '../lib/trpc';
import { getLineIdToken, initializeLineLiff, isLineEndpointOrigin, isLineLoggedIn, LINE_LIFF_URL, startLineLogin } from '../lib/lineLiff';

type SynchronicityTab = 'correlation' | 'karmic_thread' | 'line_miniapp';

interface FateSynchronicityModalProps {
  isOpen: boolean;
  onClose: () => void;
  readings: FortuneReading[];
  initialTab?: SynchronicityTab;
  isAuthenticated: boolean;
  onSignIn: () => void;
  onShowToast: (message: string) => void;
  onSwitchDiscipline: (discipline: DisciplineType) => void;
  onOpenWisdomLibrary?: () => void;
}

export const FateSynchronicityModal: React.FC<FateSynchronicityModalProps> = ({
  isOpen,
  onClose,
  readings,
  initialTab = 'correlation',
  isAuthenticated,
  onSignIn,
  onShowToast,
  onSwitchDiscipline,
  onOpenWisdomLibrary,
}) => {
  const [activeTab, setActiveTab] = useState<SynchronicityTab>(initialTab);
  const [liffState, setLiffState] = useState<'not_endpoint' | 'initializing' | 'ready' | 'failed'>(
    () => isLineEndpointOrigin() ? 'initializing' : 'not_endpoint',
  );
  const lineStatusQuery = trpc.line.status.useQuery(undefined, { enabled: isAuthenticated, retry: false });
  const linkLineMutation = trpc.line.link.useMutation();

  useEffect(() => {
    if (isOpen) setActiveTab(initialTab);
  }, [initialTab, isOpen]);

  useEffect(() => {
    if (!isLineEndpointOrigin()) {
      setLiffState('not_endpoint');
      return;
    }
    let active = true;
    setLiffState('initializing');
    void initializeLineLiff().then(() => {
      if (active) setLiffState('ready');
    }).catch(() => {
      if (active) setLiffState('failed');
    });
    return () => { active = false; };
  }, []);

  if (!isOpen) return null;

  const synchronicity = analyzeFateSynchronicity(readings);

  const handleLineLink = async () => {
    if (!isAuthenticated) {
      onShowToast('เข้าสู่ระบบ Dooduang ก่อน เพื่อเชื่อมบัญชี LINE กับประวัติของคุณ');
      onSignIn();
      return;
    }
    if (liffState !== 'ready') {
      window.location.assign(LINE_LIFF_URL);
      return;
    }
    try {
      if (!(await isLineLoggedIn())) {
        await startLineLogin();
        return;
      }
      const idToken = await getLineIdToken();
      if (!idToken) {
        onShowToast('ยังอ่าน LINE ID token ไม่ได้ กรุณาตรวจว่าเปิด scope openid ใน LINE Developers Console แล้ว');
        return;
      }
      await linkLineMutation.mutateAsync({ idToken });
      await lineStatusQuery.refetch();
      onShowToast('เชื่อมบัญชี LINE กับ Dooduang สำเร็จแล้ว');
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : '';
      onShowToast(message || 'เชื่อมบัญชี LINE ไม่สำเร็จ กรุณาลองใหม่');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0C0412]/80 backdrop-blur-md p-4 overflow-y-auto">
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="relative my-8 w-full max-w-2xl rounded-[32px] bg-gradient-to-b from-[#280E36] via-[#1A0724] to-[#100315] p-6 sm:p-7 border-2 border-[rgba(242,203,128,0.35)] shadow-2xl shadow-[#110918] max-h-[92vh] overflow-y-auto text-left"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 rounded-full bg-[#180824] p-2 text-[#C9B49D] hover:text-[#FAE9CA] border border-[rgba(242,203,128,0.2)] hover:border-[#EAC272] transition-all cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 border-b border-[rgba(242,203,128,0.15)] pb-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#3D144E] to-[#842C71] border border-[#EAC272] text-2xl shadow-lg">
            🔗
          </div>
          <div>
            <h3 className="font-serif-display text-lg sm:text-xl text-[#FAE9CA] font-bold flex items-center gap-2">
              <span>เช็คความสัมพันธ์ของคำตอบ & สายใยชะตากรรม</span>
            </h3>
            <p className="text-xs text-[#C9B49D] mt-0.5">
              เชื่อมโยงทุกศาสตร์ที่เปิด วิเคราะห์แพทเทิร์นชีวิต (LINE Mini App Fate Thread)
            </p>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex flex-wrap items-center justify-between gap-2 my-4">
          <div className="flex flex-1 rounded-xl bg-[#110417] p-1 border border-[rgba(242,203,128,0.15)] text-xs font-semibold">
            <button
              onClick={() => setActiveTab('correlation')}
              className={`flex-1 py-2 rounded-lg transition-all text-center flex items-center justify-center gap-1.5 ${
                activeTab === 'correlation'
                  ? 'bg-gradient-to-r from-[#EAC272] to-[#D4A84D] text-[#110918] font-bold shadow'
                  : 'text-[#C9B49D] hover:text-[#FAE9CA]'
              }`}
            >
              <span>🔮</span>
              <span>วิเคราะห์ความสัมพันธ์</span>
            </button>
            <button
              onClick={() => setActiveTab('karmic_thread')}
              className={`flex-1 py-2 rounded-lg transition-all text-center flex items-center justify-center gap-1.5 ${
                activeTab === 'karmic_thread'
                  ? 'bg-gradient-to-r from-[#EAC272] to-[#D4A84D] text-[#110918] font-bold shadow'
                  : 'text-[#C9B49D] hover:text-[#FAE9CA]'
              }`}
            >
              <span>📜</span>
              <span>เส้นใยไพ่ ({readings.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('line_miniapp')}
              className={`flex-1 py-2 rounded-lg transition-all text-center flex items-center justify-center gap-1.5 ${
                activeTab === 'line_miniapp'
                  ? 'bg-gradient-to-r from-[#EAC272] to-[#D4A84D] text-[#110918] font-bold shadow'
                  : 'text-[#C9B49D] hover:text-[#FAE9CA]'
              }`}
            >
              <span>💬</span>
              <span>LINE Mini App</span>
            </button>
          </div>

          {onOpenWisdomLibrary && (
            <button
              onClick={() => {
                onClose();
                onOpenWisdomLibrary();
              }}
              className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#842C71] to-[#361A4A] border border-[#EAC272]/50 px-3.5 py-2 text-xs font-bold text-[#FAE9CA] hover:border-[#EAC272] transition-all shadow"
            >
              <span>📊 คลังปัญญา & Data Viz</span>
            </button>
          )}
        </div>

        {/* TAB 1: CORRELATION & BESTIE REALITY CHECK */}
        {activeTab === 'correlation' && (
          <div className="space-y-4">
            {/* Sassy Bestie Reality Check based on past readings */}
            <div className="rounded-2xl bg-gradient-to-b from-[#2E0F3D] to-[#180722] border-2 border-[#EAC272] p-5 space-y-3 shadow-xl">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#EAC272] flex items-center gap-1.5">
                  <Flame className="h-4 w-4 text-rose-400" />
                  หมัดฮุกเพื่อนสาว: ความจริงที่แท้ทรูจากผลดูดวงสะสม
                </span>
                <span className="text-[10px] text-[#A89279] bg-[#110417] px-2.5 py-0.5 rounded-full border border-[#EAC272]/30">
                  Alignment {synchronicity.alignmentScore}%
                </span>
              </div>

              <p className="text-sm font-medium text-[#FAE9CA] leading-relaxed italic bg-[#110417]/80 p-3.5 rounded-xl border border-[rgba(242,203,128,0.15)]">
                "{synchronicity.sassyCorrelationRoast}"
              </p>

              <div className="text-xs text-[#C9B49D] space-y-1.5 pt-1">
                <p>
                  <strong className="text-[#EAC272]">🧭 ธาตุเด่นประจำจิตใต้สำนึก: </strong>
                  <span>{synchronicity.dominantElement}</span>
                </p>
                <p>
                  <strong className="text-[#FAE9CA]">🎯 วงจรกรรม/ประเด็นที่ถามซ้ำ: </strong>
                  <span>{synchronicity.dominantTheme}</span>
                </p>
                {synchronicity.previousCardsSummary.length > 0 && (
                  <p>
                    <strong className="text-[#A89279]">🎴 ไพ่/สัญลักษณ์ที่เชื่อมโยง: </strong>
                    <span className="text-[#EAC272]">{synchronicity.previousCardsSummary.join(' ➔ ')}</span>
                  </p>
                )}
              </div>
            </div>

            {/* Cross-Discipline Energy Breakdown */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="rounded-2xl bg-[#14061A] p-4 border border-[rgba(242,203,128,0.18)] space-y-2">
                <span className="font-bold text-[#FAE9CA] block">สมดุลธาตุในไพ่สะสม:</span>
                <div className="space-y-1.5">
                  {Object.entries(synchronicity.elementCounts).map(([elem, cnt], i) => (
                    <div key={i} className="flex items-center justify-between">
                      <span className="text-[#C9B49D]">{elem.split(' ')[0]}</span>
                      <span className="font-bold text-[#EAC272]">{cnt} ครั้ง</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl bg-[#14061A] p-4 border border-[rgba(242,203,128,0.18)] space-y-2">
                <span className="font-bold text-[#FAE9CA] block">สถิติหัวข้อที่กังวล:</span>
                <div className="space-y-1.5">
                  {Object.entries(synchronicity.themeCounts).map(([thm, cnt], i) => (
                    <div key={i} className="flex items-center justify-between">
                      <span className="text-[#C9B49D]">{thm.split(' ')[0]}</span>
                      <span className="font-bold text-[#F472B6]">{cnt} ครั้ง</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Action suggestion */}
            <div className="rounded-2xl bg-[#17061F] p-4 border border-[rgba(242,203,128,0.15)] text-xs text-[#C9B49D] flex items-center justify-between gap-3">
              <div>
                <span className="font-bold text-[#FAE9CA] block mb-0.5">อยากปลดล็อกข้อสงสัยนี้ให้ลึกขึ้น?</span>
                <p>เปิดไพ่ขยายความต่อ หรือถามตรงกับแม่หมอเหมียว AI ได้ทันที</p>
              </div>
              <button
                onClick={() => {
                  onClose();
                  onSwitchDiscipline('tarot');
                }}
                className="btn-gilded px-4 py-2 text-xs font-bold text-[#110918] rounded-xl shrink-0 cursor-pointer shadow"
              >
                <span>เปิดไพ่ใบใหม่ 🎴</span>
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: KARMIC THREAD OF SAVED READINGS */}
        {activeTab === 'karmic_thread' && (
          <div className="space-y-3">
            {readings.length === 0 ? (
              <div className="rounded-2xl border-2 border-dashed border-[rgba(242,203,128,0.25)] p-8 text-center space-y-3 bg-[#14061A]/60">
                <span className="text-4xl block">📜</span>
                <h4 className="font-serif-display text-base text-[#FAE9CA] font-bold">
                  ยังไม่มีประวัติการดูดวงในฐานข้อมูล
                </h4>
                <p className="text-xs text-[#C9B49D] max-w-sm mx-auto">
                  เมื่อคุณเปิดไพ่ยิปซี โอราเคิล รูน หรือดวงจีน ข้อมูลจะถูกจัดเก็บเข้าสู่สายใยชะตากรรมเพื่อเช็คความสัมพันธ์ของคำตอบทันที!
                </p>
              </div>
            ) : (
              <div className="space-y-2.5 max-h-[55vh] overflow-y-auto pr-1">
                {readings.map((r, idx) => (
                  <div
                    key={r.id || idx}
                    className="rounded-2xl bg-[#180722] border border-[rgba(242,203,128,0.15)] p-3.5 text-xs space-y-2 hover:border-[#EAC272]/50 transition-all"
                  >
                    <div className="flex items-center justify-between border-b border-[rgba(242,203,128,0.1)] pb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[#FAE9CA]">{r.topic}</span>
                        <span className="text-[10px] text-[#A89279]">({r.discipline})</span>
                      </div>
                      <span className="text-[10px] text-[#EAC272] bg-[#110417] px-2 py-0.5 rounded-full border border-[rgba(242,203,128,0.2)]">
                        {r.timestamp}
                      </span>
                    </div>

                    <p className="text-[#C9B49D] text-[11px]">
                      <strong>คำถาม: </strong>"{r.question || 'ภาพรวมชะตาชีวิต'}"
                    </p>

                    {Array.isArray(r.itemsSelected) && r.itemsSelected.length > 0 && (
                      <div className="flex items-center gap-1.5 flex-wrap pt-1">
                        <span className="text-[10px] text-[#A89279]">ไพ่ที่เปิดได้:</span>
                        {r.itemsSelected.map((item: any, i: number) => (
                          <span
                            key={i}
                            className="bg-[#2A0E38] text-[#FAE9CA] px-2 py-0.5 rounded-md border border-[#EAC272]/20 text-[10px]"
                          >
                            {item.nameTh || item.name || item.titleTh || item.symbol}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: LINE MINI APP + ACCOUNT LINKING */}
        {activeTab === 'line_miniapp' && (
          <div className="space-y-4">
            <div className={`rounded-2xl border p-5 text-xs shadow-xl ${
              lineStatusQuery.data?.linked
                ? 'border-emerald-400/35 bg-gradient-to-b from-[#103019] to-[#0A160E]'
                : 'border-amber-400/35 bg-gradient-to-b from-[#2b2110] to-[#18130b]'
            }`}>
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-emerald-300/30 bg-emerald-400/10 text-emerald-200">
                  <Smartphone className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="font-bold text-[#FAE9CA] text-sm">
                    {lineStatusQuery.data?.linked ? 'เชื่อมบัญชี LINE แล้ว' : 'Dooduang Thai บน LINE Mini App'}
                  </h4>
                  <p className="mt-1 leading-relaxed text-[#C9B49D]">
                    {lineStatusQuery.data?.linked
                      ? 'บัญชี LINE นี้เชื่อมกับบัญชี Dooduang ปัจจุบันแล้ว การอ่านคำทำนายและยอดเหรียญยังคงผูกกับบัญชี Dooduang ใน TiDB'
                      : 'LIFF ใช้สำหรับเปิดเว็บใน LINE และยืนยันตัวตน LINE ส่วนประวัติ/กระเป๋าเหรียญยังคงเป็นข้อมูลบัญชี Dooduang ที่ระบบเดิม'}
                  </p>
                  {liffState === 'not_endpoint' && (
                    <p className="mt-2 rounded-xl border border-amber-300/20 bg-black/15 p-2 text-[11px] text-amber-100">
                      หน้า Preview นี้ไม่ใช่ Endpoint URL ที่ตั้งใน LINE Console ให้เปิดผ่าน LIFF URL หรือทดสอบบนโดเมนถาวรหลัง publish
                    </p>
                  )}
                  {liffState === 'initializing' && (
                    <p className="mt-2 text-[11px] text-amber-200">กำลังเริ่มต้น LIFF…</p>
                  )}
                  {liffState === 'failed' && (
                    <p className="mt-2 rounded-xl border border-rose-300/20 bg-black/15 p-2 text-[11px] text-rose-200">
                      เริ่ม LIFF ไม่สำเร็จ ตรวจ Endpoint URL, LIFF ID และ scope openid ใน LINE Developers Console
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <a
                  href={LINE_LIFF_URL}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-400/35 bg-emerald-400/10 px-3.5 py-2.5 font-bold text-emerald-100 hover:bg-emerald-400/15"
                >
                  <Smartphone className="h-4 w-4" /> เปิด Mini App ใน LINE
                  <ExternalLink className="h-3 w-3" />
                </a>
                {lineStatusQuery.data?.linked ? (
                  <span className="inline-flex items-center gap-2 rounded-xl border border-emerald-300/20 bg-black/10 px-3.5 py-2.5 font-bold text-emerald-200">
                    <Check className="h-4 w-4" /> เชื่อมบัญชีแล้ว
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => void handleLineLink()}
                    disabled={linkLineMutation.isPending || lineStatusQuery.isLoading}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#EAC272] to-[#D4A84D] px-3.5 py-2.5 font-bold text-[#110918] shadow disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {(linkLineMutation.isPending || lineStatusQuery.isLoading)
                      ? <LoaderCircle className="h-4 w-4 animate-spin" />
                      : <Check className="h-4 w-4" />}
                    {isAuthenticated ? 'เชื่อมบัญชี LINE' : 'เข้าสู่ระบบ Dooduang ก่อนเชื่อม LINE'}
                  </button>
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-[rgba(242,203,128,0.15)] bg-[#14061A] p-4 text-xs text-[#C9B49D]">
              <h4 className="mb-3 font-bold text-[#FAE9CA]">ค่า LIFF ที่ตั้งไว้</h4>
              <ol className="space-y-2.5">
                <li className="flex gap-2"><Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-400" /><span>LIFF ID: <code className="rounded bg-black/30 px-1.5 text-emerald-200">2011886478-BHvHWoAG</code></span></li>
                <li className="flex gap-2"><Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-400" /><span>Endpoint URL: <code className="break-all rounded bg-black/30 px-1.5 text-emerald-200">https://doopuangth-7zcjyrkh.manus.space</code></span></li>
                <li className="flex gap-2"><Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-400" /><span>ตรวจให้มี scope <code className="rounded bg-black/30 px-1.5 text-emerald-200">openid</code> เพื่อออก ID token และ <code className="rounded bg-black/30 px-1.5 text-emerald-200">profile</code> ถ้าต้องการแสดงข้อมูลโปรไฟล์</span></li>
                <li className="flex gap-2"><Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-400" /><span>ระบบจะส่งเฉพาะ signed ID token ไปตรวจที่ LINE แล้วบันทึก LINE subject ผูกกับบัญชี Dooduang ที่ล็อกอินอยู่</span></li>
              </ol>
              <a
                href="https://developers.line.biz/en/docs/liff/developing-liff-apps/"
                target="_blank"
                rel="noreferrer"
                className="mt-4 inline-flex items-center gap-2 rounded-xl border border-emerald-400/30 bg-emerald-400/10 px-3 py-2 font-bold text-emerald-200 hover:bg-emerald-400/15"
              >
                <Smartphone className="h-4 w-4" />
                อ่านคู่มือ LIFF จาก LINE Developers
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>
        )}

      </motion.div>
    </div>
  );
};
