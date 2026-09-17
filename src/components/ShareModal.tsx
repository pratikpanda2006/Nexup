import React, { useState, useEffect } from 'react';
import { 
  X, 
  Copy, 
  Check, 
  Share2, 
  Globe, 
  ExternalLink,
  Send,
  MessageCircle,
  Mail
} from 'lucide-react';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  url?: string;
  title?: string;
  description?: string;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  url = 'https://nexup.onrender.com',
  title = 'NexUP · Opportunity Intelligence',
  description = 'Discover vetted hackathons, frontier engineering internships, funded research fellowships, and open-source contributor programs.'
}) => {
  const [copied, setCopied] = useState(false);

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

  const handleCopy = async () => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(url);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = url;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: description,
          url,
        });
      } catch (err) {
        console.log('Native share dismissed or not supported', err);
      }
    } else {
      handleCopy();
    }
  };

  const socialChannels = [
    {
      name: 'WhatsApp',
      color: 'bg-emerald-600/20 text-emerald-400 border-emerald-500/40 hover:bg-emerald-600/30',
      icon: MessageCircle,
      href: `https://api.whatsapp.com/send?text=${encodeURIComponent(`🚀 Check out NexUP: ${description}\n\n${url}`)}`,
    },
    {
      name: 'X (Twitter)',
      color: 'bg-sky-600/20 text-sky-400 border-sky-500/40 hover:bg-sky-600/30',
      icon: ExternalLink,
      href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(`Discover vetted hackathons, engineering internships, research fellowships & open-source programs on @NexUP!`)}&url=${encodeURIComponent(url)}`,
    },
    {
      name: 'LinkedIn',
      color: 'bg-blue-600/20 text-blue-400 border-blue-500/40 hover:bg-blue-600/30',
      icon: ExternalLink,
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
    },
    {
      name: 'Telegram',
      color: 'bg-cyan-600/20 text-cyan-400 border-cyan-500/40 hover:bg-cyan-600/30',
      icon: Send,
      href: `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(`NexUP - Live Opportunity Intelligence Feed`)}`,
    },
    {
      name: 'Email',
      color: 'bg-purple-600/20 text-purple-400 border-purple-500/40 hover:bg-purple-600/30',
      icon: Mail,
      href: `mailto:?subject=${encodeURIComponent('Discover Opportunities on NexUP')}&body=${encodeURIComponent(`Hey,\n\nI thought you would find this valuable — NexUP is an opportunity intelligence platform for vetted hackathons, engineering internships, research fellowships, and open-source programs:\n\n${url}\n\nCheck it out!`)}`,
    },
  ];

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-lg max-h-[92vh] overflow-y-auto bg-gradient-to-b from-slate-900 via-[#0c1222] to-[#080d19] border border-blue-500/30 rounded-2xl sm:rounded-3xl p-5 sm:p-8 shadow-2xl shadow-blue-500/10 text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Ambient Top Glow */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/80 transition-colors cursor-pointer"
          title="Close (Esc)"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="flex items-center space-x-3 mb-5">
          <div className="w-12 h-12 rounded-2xl bg-blue-950/80 border border-blue-500/50 flex items-center justify-center text-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.3)]">
            <Share2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[11px] font-mono uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-blue-950/90 text-blue-300 border border-blue-800/60">
                Share Platform
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight mt-0.5">
              Share NexUP
            </h2>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-slate-300 mb-6 leading-relaxed">
          Share this link with your peers, campus clubs, and developer communities to help them discover high-impact student & early-career opportunities.
        </p>

        {/* Copy Link Input Group */}
        <div className="mb-6">
          <label className="block text-xs font-mono font-semibold text-slate-400 mb-2">
            DIRECT PLATFORM LINK
          </label>
          <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-slate-950/90 border border-slate-800 focus-within:border-blue-500/80 transition-colors shadow-inner">
            <div className="pl-3 text-slate-500">
              <Globe className="w-4 h-4 text-blue-400" />
            </div>
            <input
              type="text"
              readOnly
              value={url}
              className="flex-1 bg-transparent text-xs sm:text-sm text-slate-200 font-mono focus:outline-none px-2 select-all"
            />
            <button
              onClick={handleCopy}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                copied
                  ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25'
                  : 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/25 hover:scale-102'
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copy Link</span>
                </>
              )}
            </button>
          </div>
          {copied && (
            <p className="text-[11px] text-emerald-400 font-medium mt-1.5 flex items-center gap-1 animate-in fade-in">
              <Check className="w-3.5 h-3.5" />
              <span>Link copied to clipboard! Ready to paste.</span>
            </p>
          )}
        </div>

        {/* Quick Social Share Buttons */}
        <div className="mb-4">
          <label className="block text-xs font-mono font-semibold text-slate-400 mb-2.5">
            OR SHARE INSTANTLY TO
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {socialChannels.map((channel) => {
              const Icon = channel.icon;
              return (
                <a
                  key={channel.name}
                  href={channel.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border text-xs font-semibold transition-all ${channel.color}`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{channel.name}</span>
                </a>
              );
            })}
            
            {/* Native Share button */}
            {typeof navigator !== 'undefined' && 'share' in navigator && (
              <button
                type="button"
                onClick={handleNativeShare}
                className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 border-slate-700 text-xs font-semibold transition-all cursor-pointer"
              >
                <Share2 className="w-3.5 h-3.5 text-blue-400" />
                <span>More Options</span>
              </button>
            )}
          </div>
        </div>

        {/* Footer Note */}
        <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
          <span>Official deployment URL</span>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:text-blue-300 font-medium inline-flex items-center gap-1"
          >
            <span>nexup.onrender.com</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </div>
  );
};
