import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  Receipt,
  QrCode,
  Copy,
  Check,
  Plus,
  Trash2,
  Users,
  TrendingUp,
  DollarSign,
  Calendar,
  Sparkles,
  ExternalLink,
  Download,
  Share2,
  FileText,
  UserCheck
} from 'lucide-react';
import { ClientInvoice, ClientRecord, FortunePackage, FortuneReading } from '../types';
import { FORTUNE_PACKAGES } from '../data/packagesData';
import { generatePromptPayQRCode, formatPromptPayTarget } from '../utils/promptpay';
import { playCatPurrSound, playMysticChimeSound } from '../utils/speechHelper';
import { TopicAnalyticsDashboard } from './TopicAnalyticsDashboard';

interface FortuneTellerBillingSuiteProps {
  readings?: FortuneReading[];
  onExit?: () => void;
}

export const FortuneTellerBillingSuite: React.FC<FortuneTellerBillingSuiteProps> = ({
  readings = [],
  onExit
}) => {
  // Tab: 'create' | 'invoices' | 'clients' | 'analytics'
  const [activeTab, setActiveTab] = useState<'create' | 'invoices' | 'clients' | 'analytics'>('analytics');

  // Fortune Teller profile / settings
  const [merchantName, setMerchantName] = useState<string>('แม่หมอเหมียว (ดูดวงค่ะอีหญิง)');
  const [promptPayId, setPromptPayId] = useState<string>('0812345678');

  // Invoice Form State
  const [clientName, setClientName] = useState<string>('');
  const [clientLine, setClientLine] = useState<string>('');
  const [clientPhone, setClientPhone] = useState<string>('');
  const [selectedPkgId, setSelectedPkgId] = useState<string>(FORTUNE_PACKAGES[1].id);
  const [customAmount, setCustomAmount] = useState<number>(FORTUNE_PACKAGES[1].priceThb);
  const [readingTopic, setReadingTopic] = useState<string>('ดูดวงความรักและการงานเจาะลึก 30 นาที');
  const [invoiceNotes, setInvoiceNotes] = useState<string>('');

  // Generated QR & Invoice State
  const [generatedQR, setGeneratedQR] = useState<string>('');
  const [currentCreatedInvoice, setCurrentCreatedInvoice] = useState<ClientInvoice | null>(null);
  const [copiedText, setCopiedText] = useState<boolean>(false);

  // Invoices & Client records stored locally
  const [invoices, setInvoices] = useState<ClientInvoice[]>(() => {
    const saved = localStorage.getItem('sassy_fortune_invoices');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    // Default initial mock invoices
    return [
      {
        id: 'inv-101',
        invoiceNumber: 'INV-202608-001',
        clientName: 'คุณแพรวา',
        clientLineId: 'praewa.n',
        packageName: 'ผ่าชะตาไพ่ยิปซี 3 ใบ (Past-Present-Future)',
        amountThb: 99,
        status: 'paid',
        createdAt: '16 ส.ค. 2026 14:20',
        paidAt: '16 ส.ค. 2026 14:25',
        promptPayId: '0812345678',
        merchantName: 'แม่หมอเหมียว (The Cat Room)',
        readingTopic: 'เรื่องความรักคนคุยเก่า',
      },
      {
        id: 'inv-102',
        invoiceNumber: 'INV-202608-002',
        clientName: 'คุณกิตติศักดิ์',
        clientPhone: '0899998888',
        packageName: 'คอมโบ 4 ศาสตร์สะท้านจักรวาล VIP',
        amountThb: 299,
        status: 'pending',
        createdAt: '16 ส.ค. 2026 19:10',
        promptPayId: '0812345678',
        merchantName: 'แม่หมอเหมียว (The Cat Room)',
        readingTopic: 'การย้ายงานและการเงิน',
      },
    ];
  });

  const [clients, setClients] = useState<ClientRecord[]>(() => {
    const saved = localStorage.getItem('sassy_fortune_clients');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [
      {
        id: 'cli-1',
        name: 'คุณแพรวา',
        lineId: 'praewa.n',
        totalSpent: 99,
        sessionsCount: 1,
        lastSessionDate: '16 ส.ค. 2026',
        tags: ['ชอบถามเรื่องความรัก', 'สายมูหนัก'],
        notes: 'ไพ่ The Tower + Lovers แนะนำให้ตัดใจจากคนเก่าเพื่อเปิดรับคนใหม่',
      },
      {
        id: 'cli-2',
        name: 'คุณกิตติศักดิ์',
        phone: '0899998888',
        totalSpent: 299,
        sessionsCount: 1,
        lastSessionDate: '16 ส.ค. 2026',
        tags: ['ลูกดวง VIP', 'ดูเรื่องธุรกิจ'],
        notes: 'ดวงจีนธาตุทองกำลังรุ่ง เหมาะกับการลงทุนใหม่',
      },
    ];
  });

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('sassy_fortune_invoices', JSON.stringify(invoices));
  }, [invoices]);

  useEffect(() => {
    localStorage.setItem('sassy_fortune_clients', JSON.stringify(clients));
  }, [clients]);

  // Update amount when package changes
  const handleSelectPackage = (pkgId: string) => {
    setSelectedPkgId(pkgId);
    const found = FORTUNE_PACKAGES.find(p => p.id === pkgId);
    if (found) {
      setCustomAmount(found.priceThb);
      setReadingTopic(found.title);
    }
  };

  // Generate Invoice and QR Code
  const handleGenerateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim() || customAmount <= 0) return;

    try {
      playCatPurrSound();
      playMysticChimeSound('gold');
      const qr = await generatePromptPayQRCode(promptPayId, customAmount);
      setGeneratedQR(qr);

      const newInv: ClientInvoice = {
        id: 'inv-' + Date.now(),
        invoiceNumber: `INV-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(invoices.length + 1).padStart(3, '0')}`,
        clientName: clientName.trim(),
        clientPhone: clientPhone.trim() || undefined,
        clientLineId: clientLine.trim() || undefined,
        packageName: readingTopic,
        amountThb: customAmount,
        status: 'pending',
        createdAt: new Date().toLocaleString('th-TH'),
        promptPayId: promptPayId,
        merchantName: merchantName,
        notes: invoiceNotes,
        readingTopic: readingTopic,
      };

      setInvoices([newInv, ...invoices]);
      setCurrentCreatedInvoice(newInv);

      // Also add or update client record
      const existingClient = clients.find(c => c.name.toLowerCase() === clientName.trim().toLowerCase());
      if (!existingClient) {
        setClients([
          {
            id: 'cli-' + Date.now(),
            name: clientName.trim(),
            lineId: clientLine.trim() || undefined,
            phone: clientPhone.trim() || undefined,
            totalSpent: customAmount,
            sessionsCount: 1,
            lastSessionDate: new Date().toLocaleDateString('th-TH'),
            tags: ['ลูกดวงใหม่'],
            notes: invoiceNotes || 'รอเริ่มดูดวง',
          },
          ...clients,
        ]);
      }
    } catch (err) {
      console.error('Failed to generate promptpay qr:', err);
    }
  };

  // Toggle invoice status
  const handleToggleStatus = (id: string, newStatus: 'pending' | 'paid' | 'cancelled') => {
    if (newStatus === 'paid') playMysticChimeSound('gold');
    setInvoices(invoices.map(inv => {
      if (inv.id === id) {
        return {
          ...inv,
          status: newStatus,
          paidAt: newStatus === 'paid' ? new Date().toLocaleString('th-TH') : undefined,
        };
      }
      return inv;
    }));
  };

  // Delete invoice
  const handleDeleteInvoice = (id: string) => {
    setInvoices(invoices.filter(i => i.id !== id));
  };

  // Copy payment message to clipboard
  const handleCopyPaymentMessage = () => {
    if (!currentCreatedInvoice) return;
    const msg = `🐾 ใบแจ้งชำระเงินค่าดูดวง [${currentCreatedInvoice.merchantName}]
━━━━━━━━━━━━━━━━━━━━
👤 ลูกดวง: ${currentCreatedInvoice.clientName}
📜 บริการ: ${currentCreatedInvoice.packageName}
💰 ยอดชำระ: ${currentCreatedInvoice.amountThb.toLocaleString()} บาท
📱 พร้อมเพย์: ${promptPayId} (${merchantName})
🔖 เลขที่บิล: ${currentCreatedInvoice.invoiceNumber}
━━━━━━━━━━━━━━━━━━━━
✨ โอนแล้วรบกวนส่งสลิปเพื่อเริ่มเปิดไพ่ดูดวงได้เลยค่ะ!`;

    navigator.clipboard.writeText(msg);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2500);
  };

  // Financial Stats
  const totalEarnings = invoices
    .filter(i => i.status === 'paid')
    .reduce((sum, i) => sum + i.amountThb, 0);

  const pendingAmount = invoices
    .filter(i => i.status === 'pending')
    .reduce((sum, i) => sum + i.amountThb, 0);

  return (
    <div className="space-y-6">
      {/* Top Banner & Stats */}
      <div className="velvet-card rounded-[32px] p-6 sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#361A4A] text-[#EAC272] border border-[rgba(242,203,128,0.3)] text-2xl shadow-md">
              💰
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-serif-display text-2xl font-normal text-[#FAE9CA]">ระบบเก็บเงินลูกดวง (The Cat Room Billing)</h2>
                <span className="rounded-full bg-[#842C71]/40 px-2.5 py-0.5 text-xs font-bold text-[#F2CB80] border border-[rgba(242,203,128,0.2)]">
                  เครื่องมือแม่หมอมืออาชีพ
                </span>
              </div>
              <p className="text-xs text-[#C9B49D] mt-0.5">
                ออกบิล สร้าง QR พร้อมเพย์สแกนได้จริง จัดการบันทึกลูกดวง และสรุปรายรับค่าครู
              </p>
            </div>
          </div>

          {/* Quick Stats Grid & Exit button */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="rounded-2xl bg-[#110918] p-3 border border-[rgba(242,203,128,0.15)] text-center min-w-[110px]">
              <span className="text-[10px] uppercase font-bold text-[#C9B49D]">รายรับรวมที่ได้</span>
              <div className="font-serif-display text-lg text-[#AEFFE4]">฿{totalEarnings.toLocaleString()}</div>
            </div>

            <div className="rounded-2xl bg-[#110918] p-3 border border-[rgba(242,203,128,0.15)] text-center min-w-[110px]">
              <span className="text-[10px] uppercase font-bold text-[#C9B49D]">รอลูกดวงโอน</span>
              <div className="font-serif-display text-lg text-[#EAC272]">฿{pendingAmount.toLocaleString()}</div>
            </div>

            <div className="rounded-2xl bg-[#110918] p-3 border border-[rgba(242,203,128,0.15)] text-center min-w-[90px]">
              <span className="text-[10px] uppercase font-bold text-[#C9B49D]">ลูกดวงทั้งหมด</span>
              <div className="font-serif-display text-lg text-[#FAE9CA]">{clients.length} คน</div>
            </div>

            {onExit && (
              <button
                onClick={onExit}
                className="flex items-center gap-1.5 rounded-2xl bg-[#842C71]/30 hover:bg-[#842C71]/60 border border-[rgba(242,203,128,0.3)] px-3.5 py-3 text-xs font-semibold text-[#FAE9CA] hover:text-[#EAC272] transition-all shadow-sm"
                title="สลับกลับสู่ห้องดูดวงลูกดวง"
              >
                <span>🐾 กลับหน้าดูดวง</span>
              </button>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mt-6 flex items-center gap-2 border-t border-[rgba(242,203,128,0.12)] pt-4">
          <button
            id="tab-billing-analytics"
            onClick={() => setActiveTab('analytics')}
            className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold transition-all ${
              activeTab === 'analytics'
                ? 'bg-gradient-to-r from-[#EAC272] to-[#D4A84D] text-[#110918] shadow-md'
                : 'text-[#C9B49D] hover:text-[#FAE9CA] hover:bg-[#1E0E2A]'
            }`}
          >
            <TrendingUp className="h-4 w-4 text-[#842C71]" />
            <span>สถิติหัวข้อดวงยอดนิยม (Recharts)</span>
            <span className="rounded bg-[#842C71]/30 px-1.5 py-0.2 text-[9px] text-[#FAE9CA] border border-[rgba(242,203,128,0.2)]">
              HOT
            </span>
          </button>

          <button
            id="tab-billing-create"
            onClick={() => setActiveTab('create')}
            className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold transition-all ${
              activeTab === 'create'
                ? 'bg-[#EAC272] text-[#110918] shadow-md'
                : 'text-[#C9B49D] hover:text-[#FAE9CA] hover:bg-[#1E0E2A]'
            }`}
          >
            <Plus className="h-4 w-4" />
            <span>สร้างบิล & QR เก็บเงิน</span>
          </button>

          <button
            id="tab-billing-invoices"
            onClick={() => setActiveTab('invoices')}
            className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold transition-all ${
              activeTab === 'invoices'
                ? 'bg-[#EAC272] text-[#110918] shadow-md'
                : 'text-[#C9B49D] hover:text-[#FAE9CA] hover:bg-[#1E0E2A]'
            }`}
          >
            <Receipt className="h-4 w-4" />
            <span>รายการบิลทั้งหมด ({invoices.length})</span>
          </button>

          <button
            id="tab-billing-clients"
            onClick={() => setActiveTab('clients')}
            className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold transition-all ${
              activeTab === 'clients'
                ? 'bg-[#EAC272] text-[#110918] shadow-md'
                : 'text-[#C9B49D] hover:text-[#FAE9CA] hover:bg-[#1E0E2A]'
            }`}
          >
            <Users className="h-4 w-4" />
            <span>สมุดบันทึกลูกดวง (CRM)</span>
          </button>
        </div>
      </div>

      {/* Tab 1: Create Invoice & Payment QR */}
      {activeTab === 'create' && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">

          {/* Left Form: Invoice Creation */}
          <form onSubmit={handleGenerateInvoice} className="velvet-card rounded-[28px] p-6 space-y-4 lg:col-span-7">
            <div className="flex items-center justify-between border-b border-[rgba(242,203,128,0.14)] pb-3">
              <h3 className="font-serif-display text-lg text-[#FAE9CA] flex items-center gap-2">
                <Receipt className="h-4 w-4 text-[#EAC272]" />
                กรอกข้อมูลออกบิลให้ลูกดวง
              </h3>
              <span className="text-xs text-[#C9B49D]">ระบบสร้าง QR อัตโนมัติ</span>
            </div>

            {/* Merchant / PromptPay Settings */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 rounded-2xl bg-[#110918] p-3.5 border border-[rgba(242,203,128,0.15)]">
              <div>
                <label className="text-[11px] font-semibold text-[#C9B49D]">ชื่อแม่หมอ / ร้านดูดวง:</label>
                <input
                  type="text"
                  value={merchantName}
                  onChange={(e) => setMerchantName(e.target.value)}
                  className="mt-1 w-full rounded-xl bg-[#1E0E2A] border border-[rgba(242,203,128,0.2)] px-3 py-1.5 text-xs text-[#FAE9CA] focus:border-[#EAC272] focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-[#C9B49D]">เบอร์พร้อมเพย์รับเงิน:</label>
                <input
                  type="text"
                  value={promptPayId}
                  onChange={(e) => setPromptPayId(e.target.value)}
                  placeholder="เช่น 0812345678"
                  className="mt-1 w-full rounded-xl bg-[#1E0E2A] border border-[rgba(242,203,128,0.2)] px-3 py-1.5 text-xs text-[#AEFFE4] font-mono focus:border-[#EAC272] focus:outline-none"
                />
              </div>
            </div>

            {/* Client Info */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="text-[11px] font-semibold text-[#EAC272]">ชื่อลูกดวง *</label>
                <input
                  id="input-billing-client-name"
                  type="text"
                  required
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="เช่น คุณดาว, คุณณัฐ"
                  className="mt-1 w-full rounded-xl bg-[#110918] border border-[rgba(242,203,128,0.18)] px-3 py-2 text-sm text-[#FAE9CA] focus:border-[#EAC272] focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-[#EAC272]">LINE ID หรือเบอร์ติดต่อ</label>
                <input
                  type="text"
                  value={clientLine}
                  onChange={(e) => setClientLine(e.target.value)}
                  placeholder="เช่น line_id_123"
                  className="mt-1 w-full rounded-xl bg-[#110918] border border-[rgba(242,203,128,0.18)] px-3 py-2 text-sm text-[#FAE9CA] focus:border-[#EAC272] focus:outline-none"
                />
              </div>
            </div>

            {/* Select Predefined Packages */}
            <div>
              <label className="text-[11px] font-semibold text-[#EAC272]">เลือกแพ็กเกจดูดวงด่วน:</label>
              <div className="mt-1.5 grid grid-cols-2 gap-2 sm:grid-cols-3">
                {FORTUNE_PACKAGES.map((pkg) => (
                  <button
                    key={pkg.id}
                    type="button"
                    onClick={() => handleSelectPackage(pkg.id)}
                    className={`flex flex-col items-start rounded-2xl p-2.5 text-left transition-all ${
                      selectedPkgId === pkg.id
                        ? 'bg-[#842C71]/40 border border-[#EAC272] text-[#FAE9CA] shadow-md'
                        : 'bg-[#110918] border border-[rgba(242,203,128,0.15)] text-[#C9B49D] hover:border-[rgba(242,203,128,0.3)]'
                    }`}
                  >
                    <span className="text-xs font-bold truncate w-full">{pkg.title.split('(')[0]}</span>
                    <span className="text-[11px] font-black text-[#EAC272] mt-1">฿{pkg.priceThb}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Amount & Service Title */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="sm:col-span-2">
                <label className="text-[11px] font-semibold text-[#EAC272]">หัวข้อบริการดูดวง</label>
                <input
                  type="text"
                  value={readingTopic}
                  onChange={(e) => setReadingTopic(e.target.value)}
                  className="mt-1 w-full rounded-xl bg-[#110918] border border-[rgba(242,203,128,0.18)] px-3 py-2 text-sm text-[#FAE9CA] focus:border-[#EAC272] focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-[#EAC272]">ยอดเงิน (บาท) *</label>
                <input
                  id="input-billing-amount"
                  type="number"
                  required
                  min="1"
                  value={customAmount}
                  onChange={(e) => setCustomAmount(parseFloat(e.target.value) || 0)}
                  className="mt-1 w-full rounded-xl bg-[#110918] border border-[rgba(242,203,128,0.18)] px-3 py-2 text-sm text-[#EAC272] font-bold focus:border-[#EAC272] focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-[#C9B49D]">โน้ตช่วยจำ (Private Note สำหรับแม่หมอ)</label>
              <textarea
                rows={2}
                value={invoiceNotes}
                onChange={(e) => setInvoiceNotes(e.target.value)}
                placeholder="เช่น ลูกค้าขอคิววันศุกร์ 2 ทุ่ม, นัดเปิดไพ่ใน LINE..."
                className="mt-1 w-full rounded-xl bg-[#110918] border border-[rgba(242,203,128,0.18)] px-3 py-2 text-xs text-[#FAE9CA] placeholder:text-[#C9B49D]/40 focus:border-[#EAC272] focus:outline-none"
              />
            </div>

            <button
              id="btn-generate-bill-qr"
              type="submit"
              className="btn-gilded w-full flex items-center justify-center gap-2 py-3.5 text-sm font-bold text-[#110918] cursor-pointer"
            >
              <QrCode className="h-4 w-4" />
              <span>สร้าง QR Code พร้อมเพย์ & ใบแจ้งหนี้ทันที</span>
            </button>
          </form>

          {/* Right Column: Generated Invoice Slip & QR Preview */}
          <div className="space-y-4 lg:col-span-5">
            {currentCreatedInvoice && generatedQR ? (
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="velvet-card rounded-[32px] p-6 border-2 border-[#EAC272]/50 shadow-2xl relative overflow-hidden"
              >
                {/* Header of Slip */}
                <div className="text-center border-b border-[rgba(242,203,128,0.15)] pb-4">
                  <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-[#361A4A] text-xl text-[#EAC272] mb-2 border border-[rgba(242,203,128,0.3)] shadow-md">
                    🐾
                  </div>
                  <h4 className="font-serif-display text-lg font-normal text-[#FAE9CA]">{currentCreatedInvoice.merchantName}</h4>
                  <p className="text-xs text-[#C9B49D]">ใบแจ้งชำระค่าบริการดูดวง (Payment Invoice)</p>
                  <span className="mt-1 inline-block text-[10px] font-mono text-[#EAC272]">
                    เลขที่: {currentCreatedInvoice.invoiceNumber}
                  </span>
                </div>

                {/* QR Code Canvas */}
                <div className="my-4 flex flex-col items-center justify-center p-3 bg-white rounded-2xl shadow-inner">
                  <img
                    src={generatedQR}
                    alt="PromptPay QR Code"
                    className="h-48 w-48 object-contain"
                  />
                  <div className="mt-1 flex items-center gap-1.5 text-[11px] font-bold text-slate-800">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping"></span>
                    <span>สแกนผ่านแอปธนาคารทุกธนาคารในไทย</span>
                  </div>
                </div>

                {/* Amount & Details */}
                <div className="space-y-2 rounded-2xl bg-[#110918] p-3.5 border border-[rgba(242,203,128,0.15)] text-xs">
                  <div className="flex justify-between">
                    <span className="text-[#C9B49D]">ลูกดวง:</span>
                    <span className="font-bold text-[#FAE9CA]">{currentCreatedInvoice.clientName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#C9B49D]">บริการ:</span>
                    <span className="font-medium text-[#FAE9CA] text-right truncate max-w-[180px]">{currentCreatedInvoice.packageName}</span>
                  </div>
                  <div className="flex justify-between border-t border-[rgba(242,203,128,0.12)] pt-2 text-sm font-bold">
                    <span className="text-[#C9B49D]">ยอดที่ต้องชำระ:</span>
                    <span className="font-serif-display text-[#EAC272] text-lg">฿{currentCreatedInvoice.amountThb.toLocaleString()}</span>
                  </div>
                </div>

                {/* Actions: Copy message & Confirm Paid */}
                <div className="mt-4 space-y-2">
                  <button
                    id="btn-copy-billing-text"
                    onClick={handleCopyPaymentMessage}
                    className="flex w-full items-center justify-center gap-2 rounded-full bg-[#1E0E2A] hover:bg-[#2A143A] py-2.5 text-xs font-semibold text-[#FAE9CA] border border-[rgba(242,203,128,0.2)] transition-all"
                  >
                    {copiedText ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-[#AEFFE4]" />
                        <span className="text-[#AEFFE4]">คัดลอกข้อความแจ้งลูกดวงแล้ว!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5 text-[#EAC272]" />
                        <span>คัดลอกข้อความ & บิล ส่งใน LINE/แชท</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => handleToggleStatus(currentCreatedInvoice.id, 'paid')}
                    className="btn-gilded w-full flex items-center justify-center gap-2 py-2.5 text-xs font-bold text-[#110918] cursor-pointer"
                  >
                    <UserCheck className="h-3.5 w-3.5" />
                    <span>ยืนยันว่าลูกดวงชำระเงินแล้ว (Mark as Paid)</span>
                  </button>
                </div>
              </motion.div>
            ) : (
              <div className="flex min-h-[380px] flex-col items-center justify-center rounded-[32px] border-2 border-dashed border-[rgba(242,203,128,0.2)] bg-[#110918]/60 p-8 text-center">
                <QrCode className="h-12 w-12 text-[#C9B49D]/50 mb-3" />
                <h4 className="font-serif-display text-base text-[#FAE9CA]">รอสร้างบิลและ QR Code</h4>
                <p className="text-xs text-[#C9B49D] mt-1 max-w-xs">
                  กรอกชื่อลูกดวงและเลือกแพ็กเกจทางด้านซ้าย เพื่อสร้างบิลพร้อมเพย์อัตโนมัติ
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Invoices List */}
      {activeTab === 'invoices' && (
        <div className="velvet-card rounded-[28px] p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-[rgba(242,203,128,0.14)] pb-3">
            <h3 className="font-serif-display text-lg text-[#FAE9CA] flex items-center gap-2">
              <Receipt className="h-4 w-4 text-[#EAC272]" />
              รายการบิลและสถานะการชำระเงิน
            </h3>
            <span className="text-xs text-[#C9B49D]">ทั้งหมด {invoices.length} รายการ</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#FAE9CA]">
              <thead className="border-b border-[rgba(242,203,128,0.15)] bg-[#110918] text-[11px] uppercase font-bold text-[#EAC272]">
                <tr>
                  <th className="py-3 px-4">เลขที่บิล / วันที่</th>
                  <th className="py-3 px-4">ชื่อลูกดวง</th>
                  <th className="py-3 px-4">บริการ</th>
                  <th className="py-3 px-4">ยอดเงิน</th>
                  <th className="py-3 px-4">สถานะ</th>
                  <th className="py-3 px-4 text-right">จัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[rgba(242,203,128,0.1)]">
                {invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-[#1E0E2A]/50 transition-colors">
                    <td className="py-3 px-4 font-mono">
                      <div className="font-bold text-[#FAE9CA]">{inv.invoiceNumber}</div>
                      <div className="text-[10px] text-[#C9B49D]">{inv.createdAt}</div>
                    </td>
                    <td className="py-3 px-4 font-semibold text-[#FAE9CA]">
                      {inv.clientName}
                      {inv.clientLineId && <span className="block text-[10px] text-[#C9B49D]">LINE: {inv.clientLineId}</span>}
                    </td>
                    <td className="py-3 px-4 max-w-[200px] truncate text-[#C9B49D]">{inv.packageName}</td>
                    <td className="py-3 px-4 font-serif-display text-sm text-[#EAC272]">฿{inv.amountThb.toLocaleString()}</td>
                    <td className="py-3 px-4">
                      {inv.status === 'paid' ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-[#165B53]/40 px-2.5 py-0.5 text-[10px] font-bold text-[#AEFFE4] border border-[#165B53]/60">
                          <Check className="h-3 w-3" /> ชำระแล้ว
                        </span>
                      ) : inv.status === 'pending' ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-[#842C71]/40 px-2.5 py-0.5 text-[10px] font-bold text-[#F2CB80] border border-[rgba(242,203,128,0.2)]">
                          รอชำระ
                        </span>
                      ) : (
                        <span className="rounded-full bg-[#B3261E]/30 px-2 py-0.5 text-[10px] text-[#FFA4A4]">
                          ยกเลิก
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right space-x-1">
                      {inv.status === 'pending' && (
                        <button
                          onClick={() => handleToggleStatus(inv.id, 'paid')}
                          className="rounded-full bg-[#165B53]/50 border border-[#165B53]/80 px-3 py-1 text-[11px] font-semibold text-[#AEFFE4] hover:bg-[#165B53] transition-all"
                        >
                          รับเงินแล้ว
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteInvoice(inv.id)}
                        className="rounded-full p-1.5 text-[#C9B49D] hover:text-[#FFA4A4] hover:bg-[#1E0E2A]"
                        title="ลบ"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Client CRM */}
      {activeTab === 'clients' && (
        <div className="velvet-card rounded-[28px] p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-[rgba(242,203,128,0.14)] pb-3">
            <h3 className="font-serif-display text-lg text-[#FAE9CA] flex items-center gap-2">
              <Users className="h-4 w-4 text-[#EAC272]" />
              ประวัติและบันทึกข้อมูลลูกดวง (Client CRM)
            </h3>
            <span className="text-xs text-[#C9B49D]">บันทึก {clients.length} ท่าน</span>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {clients.map((cli) => (
              <div key={cli.id} className="space-y-3 rounded-2xl bg-[#110918] p-4 border border-[rgba(242,203,128,0.15)]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#361A4A] text-[#EAC272] font-serif-display font-bold border border-[rgba(242,203,128,0.2)]">
                      {cli.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-serif-display text-sm text-[#FAE9CA]">{cli.name}</h4>
                      <span className="text-[10px] text-[#C9B49D]">{cli.lineId || cli.phone || 'ไม่มีข้อมูลติดต่อ'}</span>
                    </div>
                  </div>
                  <span className="font-serif-display text-xs text-[#EAC272]">฿{cli.totalSpent.toLocaleString()}</span>
                </div>

                <div className="text-xs bg-[#1E0E2A]/70 p-2.5 rounded-xl border border-[rgba(242,203,128,0.1)]">
                  <strong className="text-[#EAC272] block text-[10px] mb-1">📝 บันทึกผลดูดวงล่าสุด:</strong>
                  <p className="line-clamp-3 text-[11px] text-[#C9B49D]">{cli.notes}</p>
                </div>

                <div className="flex flex-wrap gap-1">
                  {cli.tags.map((t, i) => (
                    <span key={i} className="rounded-full bg-[#361A4A]/50 border border-[rgba(242,203,128,0.15)] px-2 py-0.5 text-[9px] text-[#FAE9CA]">
                      #{t}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Topic Popularity Recharts Analytics */}
      {activeTab === 'analytics' && (
        <TopicAnalyticsDashboard readings={readings} invoices={invoices} />
      )}
    </div>
  );
};
