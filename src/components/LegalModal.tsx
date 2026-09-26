import React, { useState } from 'react';
import { Shield, FileText, AlertCircle, X, CheckCircle, ExternalLink } from 'lucide-react';

interface LegalModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'privacy' | 'terms' | 'disclaimer';
}

export const LegalModal: React.FC<LegalModalProps> = ({ 
  isOpen, 
  onClose, 
  initialTab = 'disclaimer' 
}) => {
  const [activeTab, setActiveTab] = useState<'disclaimer' | 'privacy' | 'terms'>(initialTab);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-2xl max-h-[88vh] overflow-y-auto bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl text-slate-100 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between sticky top-0 bg-slate-900/95 backdrop-blur-md z-10">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-600/20 border border-blue-500/30 text-blue-400 flex items-center justify-center">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">NexUP Trust & Transparency</h3>
              <p className="text-xs text-slate-400">Independent Student Educational Resource</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 bg-slate-950/60 px-5 pt-3 gap-2">
          <button
            onClick={() => setActiveTab('disclaimer')}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'disclaimer'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Independent Disclaimer
          </button>
          <button
            onClick={() => setActiveTab('privacy')}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'privacy'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Privacy Policy
          </button>
          <button
            onClick={() => setActiveTab('terms')}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'terms'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Terms of Service
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4 text-xs text-slate-300 leading-relaxed overflow-y-auto">
          {activeTab === 'disclaimer' && (
            <div className="space-y-3.5">
              <div className="p-3.5 rounded-2xl bg-blue-950/40 border border-blue-800/60 text-blue-200 space-y-1.5">
                <span className="font-bold flex items-center gap-1.5 text-blue-300 text-sm">
                  <AlertCircle className="w-4 h-4 text-blue-400 shrink-0" />
                  Independent Student Directory Notice
                </span>
                <p>
                  NexUP is an open, non-commercial directory maintained by student builders to help fellow undergraduates discover upcoming hackathons, internships, fellowships, and research appointments.
                </p>
              </div>

              <h4 className="text-sm font-bold text-white pt-1">No Brand Affiliation or Endorsement</h4>
              <p>
                All company names, institutional logos, product marks, and hackathon event names (such as Google, Anthropic, MIT, Amazon, Stanford, Cloudflare, etc.) displayed on this website are the property of their respective trademark and copyright holders.
              </p>
              <p>
                The display of these names and marks is strictly for descriptive, identification, and educational reference purposes under Fair Use. NexUP is <strong>not sponsored by, endorsed by, or directly affiliated with</strong> any listed company, foundation, or academic institution unless explicitly stated.
              </p>

              <h4 className="text-sm font-bold text-white pt-1">External Applications &amp; Security</h4>
              <p>
                NexUP does not process job applications, evaluate hackathon submissions, or charge application fees. All application and registration links route students directly to the official external websites (e.g. Devpost, Unstop, official university lab pages, or official company job portals). Always verify that you are on the official domain before submitting personal resumes or documents.
              </p>
            </div>
          )}

          {activeTab === 'privacy' && (
            <div className="space-y-3.5">
              <div className="p-3.5 rounded-2xl bg-emerald-950/40 border border-emerald-800/60 text-emerald-200 space-y-1.5">
                <span className="font-bold flex items-center gap-1.5 text-emerald-300 text-sm">
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                  We Value Your Privacy &amp; Data Security
                </span>
                <p>
                  NexUP does not sell, license, or monetize any user data. We collect only minimal information necessary to deliver bookmarking and deadline notification features.
                </p>
              </div>

              <h4 className="text-sm font-bold text-white pt-1">What Information We Collect</h4>
              <ul className="list-disc pl-5 space-y-1.5 text-slate-300">
                <li><strong>Account Information:</strong> If you sign up as a student, we store your chosen display name and email address to manage your saved opportunities and reminders.</li>
                <li><strong>No Password Harvesting:</strong> We do NOT collect, harvest, or request your Google, email, or university account passwords.</li>
                <li><strong>Local Session Data:</strong> Preferences like dark mode, filters, and opportunity bookmarks are stored in your browser session and cloud database for synchronization across your devices.</li>
                <li><strong>No Advertising Trackers:</strong> NexUP does not run third-party ad networks, tracking pixels, or cross-site tracking cookies.</li>
              </ul>

              <h4 className="text-sm font-bold text-white pt-1">Data Retention &amp; Deletion</h4>
              <p>
                You can delete your saved bookmarks, dismiss notifications, or request account removal at any time through the feedback form or by contacting the platform maintainer.
              </p>
            </div>
          )}

          {activeTab === 'terms' && (
            <div className="space-y-3.5">
              <h4 className="text-sm font-bold text-white">1. Acceptance of Terms</h4>
              <p>
                By accessing or using NexUP (https://nexup.onrender.com), you agree to use the service for lawful educational purposes and in accordance with these terms.
              </p>

              <h4 className="text-sm font-bold text-white">2. Informational Accuracy</h4>
              <p>
                While we strive to keep opportunity deadlines, prize amounts, and eligibility requirements up to date, event organizers and hiring managers may alter schedules at their discretion. NexUP does not guarantee the availability or outcome of any external listing.
              </p>

              <h4 className="text-sm font-bold text-white">3. User Conduct</h4>
              <p>
                Users agree not to attempt to disrupt platform services, submit malicious links or spam, or misuse automated scripts against our endpoints.
              </p>

              <h4 className="text-sm font-bold text-white">4. Open Contact</h4>
              <p>
                For questions, concerns, or listing takedown requests by original copyright owners, please submit a report via the platform Feedback link or email the maintainer directly.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between text-xs text-slate-400">
          <span>NexUP Platform Documentation</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
