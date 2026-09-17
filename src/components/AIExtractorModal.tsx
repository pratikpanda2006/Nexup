import React, { useState, useEffect, useRef } from 'react';
import { 
  FileText, 
  UploadCloud, 
  Link as LinkIcon, 
  Sparkles, 
  Key, 
  AlertTriangle, 
  CheckCircle2, 
  X, 
  Loader2, 
  ArrowRight,
  Database,
  ExternalLink,
  Info
} from 'lucide-react';

interface AIExtractorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (count: number, message: string) => void;
}

export const AIExtractorModal: React.FC<AIExtractorModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [activeTab, setActiveTab] = useState<'pdf' | 'text'>('pdf');
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfBase64, setPdfBase64] = useState<string>('');
  const [pastedText, setPastedText] = useState<string>('');
  const [category, setCategory] = useState<string>('hackathon');
  
  // API Key State
  const [apiKeyConfigured, setApiKeyConfigured] = useState<boolean>(false);
  const [maskedKey, setMaskedKey] = useState<string | null>(null);
  const [customApiKey, setCustomApiKey] = useState<string>('');
  const [showKeyInput, setShowKeyInput] = useState<boolean>(false);
  const [savingKey, setSavingKey] = useState<boolean>(false);

  // Status & Error
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingStage, setLoadingStage] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLimitExceeded, setIsLimitExceeded] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Fetch current API key status
  const checkApiKeyStatus = async () => {
    try {
      const res = await fetch('/api/admin/config/gemini-key');
      if (res.ok) {
        const data = await res.json();
        setApiKeyConfigured(data.configured);
        setMaskedKey(data.maskedKey);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (isOpen) {
      checkApiKeyStatus();
      setErrorMsg(null);
      setIsLimitExceeded(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.pdf') && file.type !== 'application/pdf') {
      setErrorMsg('Please select a valid PDF document (.pdf)');
      return;
    }

    setPdfFile(file);
    setErrorMsg(null);
    setIsLimitExceeded(false);

    const reader = new FileReader();
    reader.onload = () => {
      const resultStr = reader.result as string;
      // Extract base64 payload after data:application/pdf;base64,
      const base64 = resultStr.includes('base64,') ? resultStr.split('base64,')[1] : resultStr;
      setPdfBase64(base64);
    };
    reader.onerror = () => {
      setErrorMsg('Failed to read PDF file from disk');
    };
    reader.readAsDataURL(file);
  };

  const handleSaveApiKey = async (keyToSave?: string) => {
    const key = (keyToSave || customApiKey).trim();
    if (!key) {
      setErrorMsg('Please enter a valid Gemini API Key');
      return;
    }

    setSavingKey(true);
    try {
      const res = await fetch('/api/admin/config/gemini-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey: key }),
      });
      const data = await res.json();
      if (res.ok) {
        setApiKeyConfigured(true);
        setMaskedKey(data.maskedKey);
        setIsLimitExceeded(false);
        setErrorMsg(null);
        setShowKeyInput(false);
      } else {
        setErrorMsg(data.error || 'Failed to save Gemini API key');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error updating API key');
    } finally {
      setSavingKey(false);
    }
  };

  const handleExtract = async (useFallbackSample: boolean = false) => {
    setLoading(true);
    setErrorMsg(null);
    setIsLimitExceeded(false);
    setLoadingStage('Initializing extraction pipeline...');

    try {
      let payload: any = {
        category,
        apiKey: customApiKey.trim() || undefined,
        useFallbackSample,
      };

      if (useFallbackSample) {
        setLoadingStage('Loading sample September 2026 Hackathons into Review Queue...');
      } else if (activeTab === 'pdf') {
        if (!pdfBase64) {
          setErrorMsg('Please select or drop a PDF file first.');
          setLoading(false);
          return;
        }
        setLoadingStage('Parsing PDF and analyzing with AI...');
        payload.pdfBase64 = pdfBase64;
      } else {
        if (!pastedText.trim()) {
          setErrorMsg('Please paste opportunity URLs or text first.');
          setLoading(false);
          return;
        }
        setLoadingStage('Analyzing text and extracting links with AI...');
        payload.text = pastedText;
      }

      const res = await fetch('/api/admin/extract-opportunities', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': 'admin-demo-1',
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.status === 429 || data.limitExceeded) {
        setIsLimitExceeded(true);
        setErrorMsg('limit of ai exceeded pls use new api key');
        setShowKeyInput(true);
        setLoading(false);
        return;
      }

      if (res.ok && data.success) {
        const count = data.discoveredCount || 0;
        const msg = `Successfully extracted ${count} opportunities from source and pushed to AI Review Queue!`;
        onSuccess(count, msg);
        onClose();
      } else {
        const err = data.error || data.message || 'Extraction failed';
        if (err.toLowerCase().includes('limit') || err.toLowerCase().includes('quota')) {
          setIsLimitExceeded(true);
          setErrorMsg('limit of ai exceeded pls use new api key');
          setShowKeyInput(true);
        } else {
          setErrorMsg(err);
        }
      }
    } catch (err: any) {
      console.error(err);
      const msg = (err.message || '').toLowerCase();
      if (msg.includes('limit') || msg.includes('quota') || msg.includes('429')) {
        setIsLimitExceeded(true);
        setErrorMsg('limit of ai exceeded pls use new api key');
        setShowKeyInput(true);
      } else {
        setErrorMsg(err.message || 'An error occurred during extraction');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-950/80 border border-indigo-800/80 flex items-center justify-center text-indigo-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  AI Opportunity Extractor
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800 font-bold uppercase">
                  PDF & Links Ingestion
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Extract hackathons from PDFs or raw links and push to the AI Review Queue for human verification.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 space-y-5">
          {/* AI Limit Alert Box: EXACT REQUIREMENT FROM USER */}
          {(isLimitExceeded || errorMsg === 'limit of ai exceeded pls use new api key') && (
            <div className="p-4 rounded-xl bg-rose-950/70 border border-rose-800 text-rose-200 space-y-3 shadow-lg animate-in fade-in">
              <div className="flex items-start space-x-2.5">
                <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h4 className="text-sm font-bold text-rose-100 uppercase tracking-wide">
                    limit of ai exceeded pls use new api key
                  </h4>
                  <p className="text-xs text-rose-300/90 mt-1">
                    Your Gemini API quota or rate limit has been exceeded. Please paste an active Gemini API Key below to continue extracting immediately.
                  </p>
                </div>
              </div>

              {/* Inline API Key Input */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-1">
                <div className="relative flex-1">
                  <Key className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    placeholder="Enter new Gemini API Key (e.g. AIzaSy...)"
                    value={customApiKey}
                    onChange={(e) => setCustomApiKey(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs bg-slate-900/90 border border-rose-700/80 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-rose-500"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => handleSaveApiKey()}
                  disabled={savingKey || !customApiKey.trim()}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white text-xs font-semibold rounded-lg transition-colors flex items-center justify-center space-x-1.5 shrink-0"
                >
                  {savingKey ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                  <span>Save Key & Retry</span>
                </button>
              </div>
            </div>
          )}

          {/* Regular non-limit error */}
          {errorMsg && !isLimitExceeded && errorMsg !== 'limit of ai exceeded pls use new api key' && (
            <div className="p-3.5 rounded-xl bg-rose-950/50 border border-rose-800/80 text-rose-300 text-xs flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{errorMsg}</span>
              </div>
              <button onClick={() => setErrorMsg(null)} className="text-slate-400 hover:text-white">✕</button>
            </div>
          )}

          {/* Quick Preset: Load Sample September 2026 Hackathons from PDF */}
          <div className="bg-slate-950/60 p-3.5 rounded-xl border border-indigo-900/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-start space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-950/80 border border-indigo-800/60 text-indigo-400 flex items-center justify-center shrink-0 mt-0.5">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-white block">
                  Quick Load: September 2026 Hackathons Schedule
                </span>
                <span className="text-[11px] text-slate-400 block">
                  Load all 15+ verified hackathons directly from the attached schedule PDF into the review queue.
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleExtract(true)}
              disabled={loading}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-indigo-600/90 hover:bg-indigo-500 text-white text-xs font-semibold shadow-xs transition-colors shrink-0 disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Load 38+ Hackathons</span>
            </button>
          </div>

          {/* Tabs: PDF Upload vs Raw Links/Text */}
          <div className="flex items-center space-x-2 border-b border-slate-800 pb-2">
            <button
              type="button"
              onClick={() => { setActiveTab('pdf'); setErrorMsg(null); }}
              className={`flex items-center space-x-2 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'pdf'
                  ? 'bg-indigo-950 text-indigo-300 border border-indigo-800'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Upload PDF Document</span>
            </button>

            <button
              type="button"
              onClick={() => { setActiveTab('text'); setErrorMsg(null); }}
              className={`flex items-center space-x-2 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'text'
                  ? 'bg-indigo-950 text-indigo-300 border border-indigo-800'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <LinkIcon className="w-3.5 h-3.5" />
              <span>Paste Links / Raw Text</span>
            </button>
          </div>

          {/* Tab 1: PDF Upload */}
          {activeTab === 'pdf' && (
            <div className="space-y-3">
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,application/pdf"
                onChange={handleFileChange}
                className="hidden"
              />

              {!pdfFile ? (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-700 hover:border-indigo-500/80 rounded-2xl p-8 text-center cursor-pointer transition-colors bg-slate-950/40 hover:bg-slate-950/70 group"
                >
                  <div className="w-12 h-12 rounded-2xl bg-slate-800 group-hover:bg-indigo-950/80 border border-slate-700 group-hover:border-indigo-800 text-slate-400 group-hover:text-indigo-400 flex items-center justify-center mx-auto mb-3 transition-colors">
                    <UploadCloud className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-semibold text-white">Click or drag & drop PDF here</h4>
                  <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                    Upload your hackathon list PDF (e.g. September 2026 Hackathon schedule). AI will extract table columns, links, deadlines, and requirements.
                  </p>
                  <span className="inline-block mt-3 text-[11px] font-mono px-2.5 py-1 rounded-md bg-slate-800 text-slate-300 border border-slate-700">
                    Supports .pdf files up to 25MB
                  </span>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <div className="flex items-center space-x-3 truncate">
                    <div className="w-10 h-10 rounded-lg bg-rose-950/80 border border-rose-800/80 flex items-center justify-center text-rose-400 shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div className="truncate">
                      <div className="text-xs font-semibold text-white truncate">{pdfFile.name}</div>
                      <div className="text-[11px] text-slate-400">
                        {(pdfFile.size / 1024).toFixed(1)} KB • PDF Document Ready
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => { setPdfFile(null); setPdfBase64(''); }}
                    className="text-xs text-slate-400 hover:text-rose-400 px-2.5 py-1 rounded-lg hover:bg-slate-800 transition-colors"
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Tab 2: Paste Links / Text */}
          {activeTab === 'text' && (
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 block">
                Paste Opportunity URLs or Raw Text
              </label>
              <textarea
                rows={6}
                value={pastedText}
                onChange={(e) => setPastedText(e.target.value)}
                placeholder="Paste hackathon website URLs, Devpost links, Unstop links, or raw text table rows:&#10;https://fundmycrazy.com/index.html&#10;https://www.shipaton.com/&#10;https://amazonappdev2026.devpost.com/&#10;https://aibuildercup.com/"
                className="w-full p-3 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
              />
              <p className="text-[11px] text-slate-500">
                AI will crawl the links or parse the text structure into organized candidate opportunities.
              </p>
            </div>
          )}

          {/* Extraction Settings & API Key Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div>
              <label className="text-[11px] font-mono uppercase text-slate-400 font-bold block mb-1.5">
                Target Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full p-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 capitalize"
              >
                <option value="hackathon">Hackathons (Competitions / Challenges)</option>
                <option value="internship">Internships (Industry Roles)</option>
                <option value="research">Research (Fellowships / Labs)</option>
                <option value="opensource">Open Source (Programs / Fellowships / Sprints)</option>
                <option value="all">Auto-detect All Categories</option>
              </select>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[11px] font-mono uppercase text-slate-400 font-bold block">
                  Gemini AI Engine
                </label>
                <button
                  type="button"
                  onClick={() => setShowKeyInput(!showKeyInput)}
                  className="text-[11px] text-indigo-400 hover:text-indigo-300 font-medium"
                >
                  {showKeyInput ? 'Hide Key' : 'Change Key'}
                </button>
              </div>

              <div className="p-2 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${apiKeyConfigured ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                  <span className="text-slate-300">
                    {apiKeyConfigured ? (maskedKey || 'Configured') : 'No Key Set (Using Fallback)'}
                  </span>
                </div>
                <span className="text-[10px] font-mono text-slate-500">Gemini 2.5</span>
              </div>
            </div>
          </div>

          {/* Optional API Key Input Expander */}
          {showKeyInput && (
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2.5 animate-in fade-in">
              <label className="text-xs font-semibold text-slate-300 block">
                Update Gemini API Key
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="password"
                  placeholder="Paste AI Studio API Key (AIzaSy...)"
                  value={customApiKey}
                  onChange={(e) => setCustomApiKey(e.target.value)}
                  className="flex-1 px-3 py-1.5 text-xs bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
                />
                <button
                  type="button"
                  onClick={() => handleSaveApiKey()}
                  disabled={savingKey || !customApiKey.trim()}
                  className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold transition-colors"
                >
                  {savingKey ? 'Saving...' : 'Save'}
                </button>
              </div>
              <p className="text-[10px] text-slate-400">
                Key will be used for PDF extraction, opportunity parsing, and student eligibility analysis.
              </p>
            </div>
          )}

          {/* Processing Indicator */}
          {loading && (
            <div className="p-4 rounded-xl bg-indigo-950/40 border border-indigo-800/60 flex items-center space-x-3 text-xs text-indigo-300 animate-pulse">
              <Loader2 className="w-5 h-5 animate-spin text-indigo-400 shrink-0" />
              <div>
                <span className="font-semibold block text-white">{loadingStage}</span>
                <span className="text-[11px] text-indigo-400/80">
                  Analyzing deadlines, organizers, prizes, eligibility, and links...
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-800 bg-slate-900/90 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-1.5 text-[11px] text-slate-400">
            <Info className="w-3.5 h-3.5 text-slate-500" />
            <span>Parsed items route to AI Review Queue before public listing</span>
          </div>

          <div className="flex items-center space-x-2.5 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-xs font-semibold text-slate-300 border border-slate-700 transition-colors"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={() => handleExtract(false)}
              disabled={loading || (activeTab === 'pdf' && !pdfBase64) || (activeTab === 'text' && !pastedText.trim())}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 disabled:opacity-50 text-white text-xs font-semibold transition-all shadow-md shadow-indigo-600/20 flex items-center space-x-1.5"
            >
              {loading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Extracting...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Extract & Push to Review Queue</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
