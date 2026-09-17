import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Code2, 
  Briefcase, 
  GraduationCap, 
  ArrowRight, 
  ArrowLeft,
  CheckCircle2, 
  CalendarClock, 
  User,
  Mail,
  Lock,
  ShieldCheck,
  Award,
  ChevronLeft,
  ChevronRight,
  Pause,
  Play,
  Eye,
  EyeOff,
  Heart
} from 'lucide-react';
import { NexUpLogo } from './NexUpLogo';
import { User as UserType } from '../types';
import { AdminSignInCard } from './AdminSignInCard';

interface LandingPageProps {
  onExplore: (category?: string) => void;
  onGetStarted: () => void;
  onSignInAsStudent?: (credentials?: { username?: string; email?: string }) => void;
  onSignInAsAdmin?: (adminUser?: UserType) => void;
  onOpenAuth?: () => void;
  onOpenContribute?: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ 
  onExplore, 
  onGetStarted,
  onSignInAsStudent,
  onSignInAsAdmin,
  onOpenAuth,
  onOpenContribute
}) => {
  // Navigation step in landing flow: 'welcome' (Image 2) | 'signin' (Image 3) | 'showcase'
  const [step, setStep] = useState<'welcome' | 'signin' | 'showcase'>('welcome');
  
  // Selected role for sign-in: 'student' | 'admin'
  const [selectedRole, setSelectedRole] = useState<'student' | 'admin'>('student');

  // Sign-in form fields (starts empty with placeholders per user request)
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSignUpMode, setIsSignUpMode] = useState(false);

  // When clicking role buttons on Welcome screen:
  const handleSelectRole = (role: 'student' | 'admin') => {
    setSelectedRole(role);
    // Reset fields so they show placeholders instead of pre-filled values
    setUsername('');
    setEmail('');
    setPassword('');
    setStep('signin');
  };

  // Sign in submit handler
  const handleSignInSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedRole === 'student') {
      if (onSignInAsStudent) {
        onSignInAsStudent({ 
          username: username.trim() || 'Student', 
          email: email.trim() || 'student@nexup.io' 
        });
      } else {
        onGetStarted();
      }
    } else {
      if (onSignInAsAdmin) {
        onSignInAsAdmin({ 
          username: username.trim() || 'Admin', 
          email: email.trim() 
        });
      } else {
        onGetStarted();
      }
    }
  };

  // Slideshow state for showcase view
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(true);

  const slides = [
    {
      id: 'hackathons',
      category: 'HACKATHONS & SPRINTS',
      categoryBadgeColor: 'bg-violet-950/80 text-violet-300 border-violet-800/80',
      title: 'Build, Ship & Win at Top Collegiate & Global Hackathons',
      tagline: 'Track registration deadlines, team formations, and $400k+ in student prize tracks before spots close.',
      icon: Award,
      accentColor: 'from-violet-500/20 to-purple-600/10',
      borderColor: 'border-violet-800/60',
      cards: [
        {
          name: 'HackMIT 2026',
          org: 'Massachusetts Institute of Technology',
          badge: 'Hybrid • Cambridge, MA',
          reward: '$45,000 Prize Pool',
          deadline: 'Closes in 4 days',
          tags: ['AI/ML', 'Robotics', 'Web3'],
        },
        {
          name: 'Agentic AI Systems Hackathon',
          org: 'Anthropic & AWS Bedrock',
          badge: 'Virtual Worldwide',
          reward: '$65,000 + AWS Credits',
          deadline: 'Sep 26, 2026',
          tags: ['Multi-Agent', 'Claude 3.7', 'Cloud'],
        },
      ],
    },
    {
      id: 'internships',
      category: 'INDUSTRY INTERNSHIPS',
      categoryBadgeColor: 'bg-blue-950/80 text-blue-300 border-blue-800/80',
      title: 'Frontier SWE & AI Internships with Transparent Stipends',
      tagline: 'Verified roles from Google DeepMind, Cloudflare, and OpenAI with confirmed application links.',
      icon: Briefcase,
      accentColor: 'from-blue-500/20 to-cyan-600/10',
      borderColor: 'border-blue-800/60',
      cards: [
        {
          name: 'AI Research Scientist Intern',
          org: 'Google DeepMind',
          badge: 'Mountain View, CA',
          reward: '$11,200/mo + Housing',
          deadline: 'Rolling Review',
          tags: ['PyTorch', 'JAX', 'Reasoning'],
        },
        {
          name: 'Distributed Systems Intern (R2)',
          org: 'Cloudflare',
          badge: 'San Francisco, CA / Remote',
          reward: '$8,400/mo + Equipment',
          deadline: 'Oct 15, 2026',
          tags: ['Rust', 'Storage', 'Go'],
        },
      ],
    },
    {
      id: 'research',
      category: 'RESEARCH LAB FELLOWSHIPS',
      categoryBadgeColor: 'bg-emerald-950/80 text-emerald-300 border-emerald-800/80',
      title: 'Funded Lab Appointments at Stanford, Berkeley & MIT',
      tagline: 'Direct-to-faculty undergraduate research positions with confirmed stipends and NSF eligibility.',
      icon: GraduationCap,
      accentColor: 'from-emerald-500/20 to-teal-600/10',
      borderColor: 'border-emerald-800/60',
      cards: [
        {
          name: 'Stanford HAI Frontier AI Fellow',
          org: 'Stanford Institute for Human-Centered AI',
          badge: 'Stanford, CA',
          reward: '$9,500 Summer Grant',
          deadline: 'Oct 01, 2026',
          tags: ['Alignment', 'Safety', 'NLP'],
        },
        {
          name: 'Princeton NLP Reasoning Lab',
          org: 'Princeton University Computer Science',
          badge: 'Princeton, NJ',
          reward: '$8,800 + Campus Housing',
          deadline: 'Sep 19, 2026',
          tags: ['Language Models', 'Reasoning', 'Neuro-Symbolic'],
        },
      ],
    },
  ];

  useEffect(() => {
    if (!isAutoPlay || step !== 'showcase') return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5500);
    return () => clearInterval(timer);
  }, [isAutoPlay, slides.length, step]);

  const activeSlide = slides[currentSlide];

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col justify-between text-slate-100 relative overflow-hidden bg-slate-950">
      {/* Refined Executive Ambient Mesh Backdrop */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-50"
        style={{
          background: `radial-gradient(circle 700px at 50% 35%, rgba(59, 130, 246, 0.12), transparent 70%),
                       radial-gradient(circle 500px at 15% 85%, rgba(99, 102, 241, 0.10), transparent 60%),
                       radial-gradient(circle 600px at 85% 15%, rgba(14, 165, 233, 0.08), transparent 60%)`
        }}
      />

      {/* Subtle background grid pattern */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-15"
        style={{
          backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.2) 1px, transparent 1px)',
          backgroundSize: '32px 32px'
        }}
      />

      {/* =========================================================================
          SCREEN 1: WELCOME SCREEN (Directly matching user image 2 & image 1)
         ========================================================================= */}
      {step === 'welcome' && (
        <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 py-16 text-center max-w-2xl mx-auto w-full animate-in fade-in duration-500">
          {/* Centered Logo with Glowing Halo */}
          <div className="relative mb-4 group">
            <div className="absolute -inset-8 bg-blue-500/20 rounded-full blur-3xl group-hover:bg-blue-400/30 transition-all duration-700 pointer-events-none" />
            <div className="relative transform hover:scale-[1.02] transition-transform duration-300">
              <NexUpLogo size="hero" showTagline={false} glow={true} />
            </div>
          </div>

          {/* Subtitle / Prompt */}
          <div className="mt-4 mb-8">
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Select Your Access Mode
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1.5 max-w-md mx-auto leading-relaxed">
              Choose your role to enter the NexUP opportunity intelligence network.
            </p>
          </div>

          {/* TWO PRIMARY BUTTONS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 w-full max-w-lg mx-auto">
            {/* 1. Sign in as Student */}
            <button
              onClick={() => handleSelectRole('student')}
              className="py-4 px-5 rounded-2xl bg-slate-900/90 hover:bg-slate-850 text-white font-medium text-sm border border-slate-800 hover:border-blue-500/80 shadow-xl shadow-black/40 hover:shadow-blue-500/10 transition-all flex flex-col items-start space-y-1.5 group cursor-pointer text-left"
            >
              <div className="flex items-center space-x-2 text-blue-400 font-semibold text-sm">
                <User className="w-4 h-4 group-hover:scale-110 transition-transform" />
                <span>Student Access</span>
              </div>
              <span className="text-xs text-slate-400 font-normal">Explore hackathons, internships & research</span>
            </button>

            {/* 2. Sign in as Admin */}
            <button
              onClick={() => handleSelectRole('admin')}
              className="py-4 px-5 rounded-2xl bg-slate-900/90 hover:bg-slate-850 text-white font-medium text-sm border border-slate-800 hover:border-rose-500/80 shadow-xl shadow-black/40 hover:shadow-rose-500/10 transition-all flex flex-col items-start space-y-1.5 group cursor-pointer text-left"
            >
              <div className="flex items-center space-x-2 text-rose-400 font-semibold text-sm">
                <ShieldCheck className="w-4 h-4 group-hover:scale-110 transition-transform" />
                <span>Admin Console</span>
              </div>
              <span className="text-xs text-slate-400 font-normal">Manage listings, AI parser & authorizations</span>
            </button>
          </div>

          {/* Quick guest explorer & contribute links */}
          <div className="mt-8 pt-4 border-t border-slate-850/80 w-full max-w-xs mx-auto flex flex-col items-center space-y-2.5">
            <button
              onClick={() => onExplore()}
              className="inline-flex items-center space-x-1.5 text-xs text-slate-400 hover:text-blue-400 transition-colors cursor-pointer"
            >
              <span>Browse Live Opportunity Catalog</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            {onOpenContribute && (
              <button
                type="button"
                onClick={onOpenContribute}
                className="inline-flex items-center space-x-1.5 text-xs text-rose-400/90 hover:text-rose-300 transition-colors cursor-pointer"
              >
                <Heart className="w-3 h-3 fill-rose-500/20 text-rose-400" />
                <span>Support &amp; Contribute to NexUP</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
          SCREEN 2: CUSTOM SIGN-IN CARD (Matching Image 1 / Image 3 layout)
         ========================================================================= */}
      {step === 'signin' && selectedRole === 'admin' && (
        <AdminSignInCard
          onSuccess={(adminUser) => {
            if (onSignInAsAdmin) {
              onSignInAsAdmin(adminUser);
            } else {
              onGetStarted();
            }
          }}
          onBack={() => setStep('welcome')}
          initialEmail=""
          initialUsername=""
        />
      )}

      {step === 'signin' && selectedRole === 'student' && (
        <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 py-12 animate-in fade-in zoom-in-95 duration-300">
          {/* Card Container with sleek top gradient accent border matching Image 3 */}
          <div className="w-full max-w-md bg-slate-900/95 backdrop-blur-xl border border-slate-800 rounded-3xl shadow-2xl overflow-hidden relative">
            {/* Top Glowing Gradient Accent Line */}
            <div className="h-1.5 w-full bg-gradient-to-r from-purple-600 via-indigo-500 to-cyan-400" />

            <div className="p-6 sm:p-8 space-y-6">
              {/* Header bar: "← Change options" & Role Badge */}
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setStep('welcome')}
                  className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Change options</span>
                </button>

                <div className="inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-mono font-bold bg-purple-950/80 text-purple-300 border border-purple-800/80">
                  <span>Student • Explorer</span>
                </div>
              </div>

              {/* Icon badge + Title */}
              <div className="flex items-center space-x-3.5">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-md bg-gradient-to-br from-purple-500 to-indigo-600 shadow-purple-500/20">
                  S
                </div>

                <div>
                  <h3 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                    {isSignUpMode ? 'Create Student Account' : 'Sign In as Student'}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {isSignUpMode ? 'Register to personalize your tracking' : 'Enter your email & password to continue'}
                  </p>
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleSignInSubmit} className="space-y-4">
                {/* 1. USERNAME */}
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-400 font-bold">
                    USERNAME
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <User className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="e.g. PRATIK"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-950/80 border border-slate-700/80 text-white font-medium rounded-xl text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all"
                    />
                  </div>
                </div>

                {/* 2. EMAIL */}
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-400 font-bold">
                    EMAIL
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. user@gmail.com"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-950/80 border border-slate-700/80 text-white font-medium rounded-xl text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all"
                    />
                  </div>
                </div>

                {/* 3. PASSWORD */}
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-400 font-bold">
                    PASSWORD
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      className="w-full pl-10 pr-10 py-2.5 bg-slate-950/80 border border-slate-700/80 text-white font-medium rounded-xl text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-200 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Quick Auto-Fill helper badge */}
                <div className="pt-1 flex items-center justify-between text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      setUsername('PRATIK');
                      setEmail('user@gmail.com');
                      setPassword('student2026');
                    }}
                    className="text-[11px] text-blue-400 hover:text-blue-300 font-medium underline cursor-pointer"
                  >
                    Quick-fill Student Credentials
                  </button>

                  <span className="text-[10px] text-slate-500">
                    Student Privileges
                  </span>
                </div>

                {/* SIGN IN BUTTON */}
                <div className="pt-3">
                  <button
                    type="submit"
                    className="w-full py-3 px-6 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm shadow-lg shadow-blue-600/20 transition-all cursor-pointer transform active:scale-[0.99] flex items-center justify-center space-x-2"
                  >
                    <span>{isSignUpMode ? 'Create Account & Continue' : 'Sign In'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </form>

              {/* Bottom toggle */}
              <div className="text-center pt-2 text-xs text-slate-400">
                {isSignUpMode ? (
                  <p>
                    Already have an account?{' '}
                    <button
                      type="button"
                      onClick={() => setIsSignUpMode(false)}
                      className="text-blue-400 hover:text-blue-300 font-bold ml-1 cursor-pointer"
                    >
                      Sign In
                    </button>
                  </p>
                ) : (
                  <p>
                    Need an account?{' '}
                    <button
                      type="button"
                      onClick={() => setIsSignUpMode(true)}
                      className="text-blue-400 hover:text-blue-300 font-bold ml-1 cursor-pointer"
                    >
                      Create Account
                    </button>
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          SCREEN 3: SHOWCASE & OPPORTUNITY SLIDESHOW (Accessible via link)
         ========================================================================= */}
      {step === 'showcase' && (
        <div className="relative z-10 py-12 px-4 max-w-6xl mx-auto w-full animate-in fade-in duration-300">
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => setStep('welcome')}
              className="inline-flex items-center space-x-2 text-xs font-semibold text-slate-400 hover:text-white px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Portal Entrance</span>
            </button>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleSelectRole('student')}
                className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-colors"
              >
                Sign In as Student
              </button>
              <button
                onClick={() => handleSelectRole('admin')}
                className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs border border-slate-700 transition-colors"
              >
                Sign In as Admin
              </button>
            </div>
          </div>

          {/* Slide Box */}
          <div className={`rounded-3xl border ${activeSlide.borderColor} bg-gradient-to-br ${activeSlide.accentColor} bg-slate-900/90 p-6 sm:p-8 backdrop-blur-xl shadow-2xl transition-all`}>
            <div className="space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className={`text-[11px] font-mono font-bold tracking-wider px-3 py-1 rounded-full border ${activeSlide.categoryBadgeColor}`}>
                  {activeSlide.category}
                </span>

                <div className="flex items-center space-x-1.5 bg-slate-900/80 px-2.5 py-1 rounded-xl border border-slate-800 text-xs text-slate-400">
                  <button
                    onClick={() => setIsAutoPlay(!isAutoPlay)}
                    className="p-1 hover:text-white transition-colors"
                  >
                    {isAutoPlay ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  </button>
                  <div className="w-px h-3 bg-slate-800 mx-0.5"></div>
                  <button
                    onClick={() => setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1))}
                    className="p-1 hover:text-white transition-colors"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-[10px] font-mono font-semibold px-1 text-slate-300">
                    0{currentSlide + 1} / 0{slides.length}
                  </span>
                  <button
                    onClick={() => setCurrentSlide((prev) => (prev + 1) % slides.length)}
                    className="p-1 hover:text-white transition-colors"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                  {activeSlide.title}
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
                  {activeSlide.tagline}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                {activeSlide.cards.map((card, idx) => (
                  <div
                    key={idx}
                    className="bg-slate-950/80 border border-slate-800/90 rounded-2xl p-4 hover:border-slate-700 transition-all space-y-2.5 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="font-bold text-sm text-white">{card.name}</h4>
                        <p className="text-[11px] text-slate-400 mt-0.5 font-medium">{card.org}</p>
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-slate-300">
                        {card.badge}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-900">
                      <span className="font-semibold text-emerald-400 text-xs font-mono">{card.reward}</span>
                      <span className="text-[11px] font-mono text-amber-400">{card.deadline}</span>
                    </div>

                    <div className="flex flex-wrap gap-1 pt-1">
                      {card.tags.map((t, ti) => (
                        <span key={ti} className="text-[9px] font-mono bg-slate-900 text-slate-400 px-1.5 py-0.5 rounded border border-slate-800">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
