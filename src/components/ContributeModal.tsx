import React, { useState, useEffect } from 'react';
import { 
  Heart, 
  Sparkles, 
  Copy, 
  Check, 
  X, 
  ShieldCheck, 
  Maximize2,
  ZoomIn,
  ZoomOut,
  ExternalLink,
  Smartphone
} from 'lucide-react';

interface ContributeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ContributeModal: React.FC<ContributeModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);
  const [isQrZoomed, setIsQrZoomed] = useState(false);

  // Privacy-friendly 8-digit UPI Number for UI exposure & manual entry
  const upiNumber = '24021526';
  
  // Payee name & UPI ID (used strictly in direct background intent URI)
  const payeeName = 'PRATIK PANDA';
  const upiInternalId = '8983647308.etb@icici';
  
  // Plain P2P UPI intent — strictly no orgid and no mc (avoids merchant check errors)
  const plainP2PUpiUri = `upi://pay?pa=${encodeURIComponent(upiInternalId)}&pn=${encodeURIComponent(payeeName)}&cu=INR`;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isQrZoomed) {
          setIsQrZoomed(false);
        } else {
          onClose();
        }
      }
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isQrZoomed, onClose]);

  if (!isOpen) return null;

  const handleCopyUpiNumber = () => {
    navigator.clipboard.writeText(upiNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <>
      {/* Main Contribution Modal */}
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

          {/* 1. FIRST: UPI QR Code Container with Click-to-Enlarge */}
          <div className="flex flex-col items-center bg-slate-950/90 border border-slate-800 rounded-2xl p-4 sm:p-5 text-center space-y-3 shadow-inner">
            <div 
              onClick={() => setIsQrZoomed(true)}
              className="relative group cursor-pointer w-full flex flex-col items-center select-none"
              title="Click QR to enlarge"
            >
              {/* White card container for QR code */}
              <div className="p-2.5 bg-white rounded-2xl shadow-xl max-w-[270px] sm:max-w-[290px] w-full mx-auto border border-slate-200 transition-all duration-200 group-hover:scale-[1.02] group-hover:shadow-2xl group-hover:border-rose-400/80 relative">
                <img 
                  src="/pay.png" 
                  alt="UPI QR Code - PRATIK PANDA (UPI Number: 24021526)"
                  className="w-full h-auto object-contain rounded-xl block mx-auto pointer-events-none"
                  loading="eager"
                />
                
                {/* Enlarge badge in bottom right corner */}
                <div className="absolute bottom-3 right-3 bg-slate-900/90 hover:bg-slate-950 text-white px-2 py-1 rounded-lg border border-slate-700 shadow-md flex items-center space-x-1 text-[10px] font-semibold backdrop-blur-xs transition-transform group-hover:scale-105">
                  <ZoomIn className="w-3 h-3 text-cyan-400" />
                  <span>Tap to Enlarge</span>
                </div>
              </div>

              <p className="mt-2.5 text-[11px] text-slate-400 flex items-center justify-center gap-1.5 group-hover:text-cyan-300 transition-colors">
                <Maximize2 className="w-3.5 h-3.5 text-cyan-400" />
                <span>Click QR code to view full-size &amp; zoom</span>
              </p>
            </div>

            {/* Tap to Pay via Installed UPI App (Plain P2P Intent - No orgid / No mc) */}
            <div className="w-full pt-1">
              <a
                href={plainP2PUpiUri}
                className="flex items-center justify-center space-x-2 w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-rose-600 via-pink-600 to-rose-500 hover:from-rose-500 hover:to-pink-500 text-white font-bold text-xs shadow-lg shadow-rose-950/50 transition-all cursor-pointer"
              >
                <Smartphone className="w-4 h-4" />
                <span>Tap to Pay via Installed UPI App</span>
                <ExternalLink className="w-3.5 h-3.5 opacity-80" />
              </a>
            </div>

            {/* Copyable UPI Number Strip (Privacy protected - shows official 8-digit UPI Number) */}
            <div className="w-full flex items-center justify-between bg-slate-900 border border-slate-700/80 rounded-xl px-3 sm:px-3.5 py-2.5 mt-1 gap-2">
              <div className="text-left min-w-0 flex-1">
                <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 font-semibold block">
                  UPI NUMBER
                </span>
                <span className="text-sm font-mono font-bold text-cyan-300 block select-all tracking-wider">
                  {upiNumber}
                </span>
              </div>
              <button
                type="button"
                onClick={handleCopyUpiNumber}
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
                    <span>Copy Number</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* 2. BELOW QR: Support NexUP Community Message (Requested Format) */}
          <div className="bg-slate-950/70 border border-slate-800/90 rounded-2xl p-4 text-xs text-slate-300 leading-relaxed space-y-2.5">
            <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
              <span>Support NexUP</span>
              <span className="text-rose-500">❤️</span>
            </h4>
            <p className="text-slate-300">
              If NexUP has helped you discover an opportunity or save time, consider supporting its continued development with any amount you’re comfortable with.
            </p>
            <p className="text-slate-300">
              NexUP is <strong className="text-white font-semibold">built by students, for students</strong>, and stays completely free and ad-free. Contributions help cover <strong className="text-white font-semibold">cloud hosting, real-time scraping, AI services, and maintenance</strong>.
            </p>
            <p className="text-slate-400 font-medium">
              Every contribution helps keep NexUP running. Thank you! 🚀
            </p>
          </div>

          {/* 3. Suggested Contribution Chips */}
          <div className="space-y-2">
            <span className="text-[10px] uppercase font-mono tracking-wider text-slate-500 font-bold block text-center">
              Suggested Tokens of Support
            </span>
            <div className="grid grid-cols-4 gap-1.5 sm:gap-2 text-center text-xs">
              <div className="p-2 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-300">
                <div className="font-bold text-white text-sm">₹30</div>
                <div className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5 font-medium">Scraping</div>
              </div>
              <div className="p-2 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-300">
                <div className="font-bold text-white text-sm">₹50</div>
                <div className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5 font-medium">AI Engine</div>
              </div>
              <div className="p-2 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-300">
                <div className="font-bold text-white text-sm">₹100</div>
                <div className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5 font-medium">Server</div>
              </div>
              <div className="p-2 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-300">
                <div className="font-bold text-white text-sm">₹250</div>
                <div className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5 font-medium">Maintenance</div>
              </div>
            </div>
            <p className="text-[11px] text-slate-400 text-center italic mt-1">
              ...or contribute any amount you like. Every bit counts!
            </p>
          </div>

          {/* 4. Footer actions */}
          <div className="pt-2 flex items-center justify-between border-t border-slate-800/80 text-xs">
            <div className="flex items-center space-x-1.5 text-slate-400 text-[11px]">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Verified UPI • {payeeName}</span>
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

      {/* Enlarged QR Code Lightbox Overlay */}
      {isQrZoomed && (
        <div 
          className="fixed inset-0 z-60 flex items-center justify-center p-3 sm:p-6 bg-black/92 backdrop-blur-md animate-in fade-in duration-150"
          onClick={() => setIsQrZoomed(false)}
        >
          <div 
            className="relative max-w-sm sm:max-w-md w-full bg-slate-950 border border-slate-700 rounded-3xl p-4 sm:p-6 shadow-2xl flex flex-col items-center space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Row with Close */}
            <div className="w-full flex items-center justify-between text-xs text-slate-300 pb-1 border-b border-slate-800">
              <span className="font-bold flex items-center gap-1 text-white">
                <ZoomOut className="w-4 h-4 text-cyan-400" />
                Enlarged UPI QR Code
              </span>
              <button
                type="button"
                onClick={() => setIsQrZoomed(false)}
                className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                title="Close enlarged view"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Enlarged White QR Card */}
            <div 
              onClick={() => setIsQrZoomed(false)}
              className="p-3 bg-white rounded-2xl shadow-2xl w-full max-w-[340px] border border-slate-300 cursor-pointer transition-transform hover:scale-[1.01]"
              title="Click to shrink"
            >
              <img 
                src="/pay.png" 
                alt="Enlarged UPI QR Code - PRATIK PANDA (UPI Number: 24021526)"
                className="w-full h-auto object-contain rounded-xl block mx-auto"
              />
            </div>

            {/* Quick Helper Text */}
            <div className="text-center space-y-1">
              <p className="text-xs text-slate-200 font-medium">
                Scan directly with GPay, PhonePe, Paytm, or BHIM
              </p>
              <p className="text-[11px] text-slate-400">
                Tap image or anywhere outside to shrink
              </p>
            </div>

            {/* Direct Pay & Copy Buttons inside Lightbox */}
            <div className="w-full space-y-2">
              <a
                href={plainP2PUpiUri}
                className="flex items-center justify-center space-x-2 w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
              >
                <Smartphone className="w-4 h-4" />
                <span>Open in Installed UPI App</span>
              </a>

              <button
                type="button"
                onClick={handleCopyUpiNumber}
                className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-2 cursor-pointer ${
                  copied
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                    : 'bg-slate-850 hover:bg-slate-800 text-white border border-slate-700'
                }`}
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>Copied UPI Number ({upiNumber})</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Copy UPI Number ({upiNumber})</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};