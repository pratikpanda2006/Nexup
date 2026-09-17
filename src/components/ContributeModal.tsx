import React, { useState, useEffect } from 'react';
import { 
  Heart, 
  Sparkles, 
  Copy, 
  Check, 
  X, 
  ShieldCheck, 
  Smartphone,
  ExternalLink
} from 'lucide-react';

interface ContributeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ContributeModal: React.FC<ContributeModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);
  const upiId = '8983647308.etb@icici';
  const payeeName = 'PRATIK PANDA';
  const upiDeepLink = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(payeeName)}&cu=INR`;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(upiId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-md max-h-[92vh] overflow-y-auto bg-gradient-to-b from-slate-900 via-[#0d1527] to-[#080d19] border border-slate-700/80 rounded-3xl p-5 sm:p-7 shadow-2xl text-slate-100 space-y-4 sm:space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Accent Line */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-rose-500 via-pink-500 to-amber-400 rounded-t-3xl" />

        {/* Header with Close */}
        <div className="flex items-start justify-between gap-3 pt-1">
          <div className="flex items-center space-x-3">
            <div className="w-11 h-11 rounded-2xl bg-rose-950/80 border border-rose-800 text-rose-400 flex items-center justify-center shadow-lg shadow-rose-950/50 shrink-0">
              <Heart className="w-6 h-6 fill-rose-500/20 text-rose-400 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-950/70 text-rose-300 border border-rose-800/80">
                  <Sparkles className="w-3 h-3 mr-1 text-amber-400" />
                  Community Powered
                </span>
                <span className="text-[10px] text-slate-400">100% Free &amp; Ad-Free</span>
              </div>
              <h3 className="text-xl font-black text-white tracking-tight mt-0.5">
                Support &amp; Fuel NexUP
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800/70 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Heartfelt Community Message */}
        <div className="bg-slate-950/70 border border-slate-800/90 rounded-2xl p-3.5 sm:p-4 text-xs text-slate-300 leading-relaxed space-y-2">
          <p>
            <strong className="text-white font-semibold">Hey Builder! 👋</strong> If you feel NexUP has helped you — whether by landing a hackathon prize, securing an internship, finding research grants, or simply saving hours tracking deadlines — please consider contributing whatever amount feels right to you!
          </p>
          <p className="text-slate-400">
            NexUP is built by students for students, completely free and without any ads. Every single contribution directly funds real-time scraping, AI deadline tracking, and cloud server hosting. ❤️
          </p>
        </div>

        {/* UPI QR Code Display */}
        <div className="flex flex-col items-center bg-slate-950/90 border border-slate-800 rounded-2xl p-4 sm:p-5 text-center space-y-3 shadow-inner">
          <div className="relative group w-full flex flex-col items-center">
            {/* White card container for QR code */}
            <div className="p-2.5 bg-white rounded-2xl shadow-xl max-w-[270px] sm:max-w-[290px] w-full mx-auto border border-slate-200">
              <img 
                src="/pay.png" 
                alt="UPI QR Code - PRATIK PANDA (8983647308.etb@icici)"
                className="w-full h-auto object-contain rounded-xl block mx-auto"
                loading="eager"
              />
            </div>
            
            <div className="mt-2 inline-flex items-center space-x-1.5 bg-slate-900 border border-slate-700/90 px-3 py-1 rounded-full text-[11px] font-mono text-emerald-400 font-bold shadow-md">
              <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
              <span>GPay • PhonePe • Paytm • BHIM • Cred</span>
            </div>
          </div>

          {/* Mobile Instant UPI Intent Button */}
          <div className="w-full sm:hidden pt-1">
            <a
              href={upiDeepLink}
              className="flex items-center justify-center space-x-2 w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white font-bold text-xs shadow-lg shadow-rose-950/50 transition-all cursor-pointer"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Tap to Pay via Installed UPI App</span>
            </a>
          </div>

          {/* Copyable UPI ID Strip */}
          <div className="w-full flex items-center justify-between bg-slate-900 border border-slate-700/80 rounded-xl px-3.5 py-2.5 mt-1">
            <div className="text-left min-w-0 pr-2">
              <span className="text-[10px] uppercase font-mono tracking-wider text-slate-500 block">UPI ID (VPA)</span>
              <span className="text-xs font-mono font-bold text-cyan-300 truncate block select-all">
                {upiId}
              </span>
            </div>
            <button
              type="button"
              onClick={handleCopyUpi}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer shrink-0 ${
                copied
                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                  : 'bg-blue-600 hover:bg-blue-500 text-white shadow-xs'
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy UPI</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Suggested Contribution Chips */}
        <div className="space-y-2">
          <span className="text-[10px] uppercase font-mono tracking-wider text-slate-500 font-bold block text-center">
            Suggested Tokens of Support
          </span>
          <div className="grid grid-cols-4 gap-2 text-center text-xs">
            <div className="p-2 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-300">
              <div className="font-bold text-white text-sm">₹30</div>
              <div className="text-[10px] text-slate-400 mt-0.5">Chai ☕</div>
            </div>
            <div className="p-2 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-300">
              <div className="font-bold text-white text-sm">₹50</div>
              <div className="text-[10px] text-slate-400 mt-0.5">Snack 🍕</div>
            </div>
            <div className="p-2 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-300">
              <div className="font-bold text-white text-sm">₹100</div>
              <div className="text-[10px] text-slate-400 mt-0.5">Server 🚀</div>
            </div>
            <div className="p-2 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-300">
              <div className="font-bold text-white text-sm">₹250</div>
              <div className="text-[10px] text-slate-400 mt-0.5">Champion 🌟</div>
            </div>
          </div>
          <p className="text-[11px] text-slate-400 text-center italic mt-1">
            ...or contribute any amount you like. Every bit counts!
          </p>
        </div>

        {/* Footer actions */}
        <div className="pt-2 flex items-center justify-between border-t border-slate-800/80 text-xs">
          <div className="flex items-center space-x-1.5 text-slate-400 text-[11px]">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Verified ICICI UPI • {payeeName}</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold transition-all cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
