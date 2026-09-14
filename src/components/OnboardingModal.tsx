import React, { useState } from 'react';
import { 
  Sparkles, 
  X, 
  Check, 
  Code2, 
  Briefcase, 
  GraduationCap, 
  ArrowRight,
  Globe,
  Tag
} from 'lucide-react';
import { User } from '../types';

interface OnboardingModalProps {
  currentUser: User | null;
  onClose: () => void;
  onSavePreferences: (prefs: { interests: string[]; skills: string[] }) => Promise<void>;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  currentUser,
  onClose,
  onSavePreferences,
}) => {
  const [selectedInterests, setSelectedInterests] = useState<string[]>(
    currentUser?.interests || ['AI/ML', 'Software Development']
  );
  const [selectedSkills, setSelectedSkills] = useState<string[]>(
    currentUser?.skills || ['Python', 'React', 'TypeScript']
  );
  const [saving, setSaving] = useState(false);

  const interestOptions = [
    'AI/ML',
    'Data Science',
    'Software Development',
    'Web Development',
    'Robotics',
    'Cybersecurity',
    'FinTech',
    'Blockchain',
    'Healthcare & BioTech',
    'Theoretical Research',
    'Hardware & Systems',
  ];

  const skillOptions = [
    'Python',
    'TypeScript',
    'React',
    'PyTorch',
    'C++',
    'Rust',
    'TensorFlow',
    'Go',
    'SQL',
    'Docker',
    'Next.js',
    'ROS (Robotics)',
  ];

  const toggleInterest = (interest: string) => {
    if (selectedInterests.includes(interest)) {
      setSelectedInterests(selectedInterests.filter((i) => i !== interest));
    } else {
      setSelectedInterests([...selectedInterests, interest]);
    }
  };

  const toggleSkill = (skill: string) => {
    if (selectedSkills.includes(skill)) {
      setSelectedSkills(selectedSkills.filter((s) => s !== skill));
    } else {
      setSelectedSkills([...selectedSkills, skill]);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSavePreferences({
        interests: selectedInterests,
        skills: selectedSkills,
      });
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
      <div
        className="bg-slate-900 rounded-2xl max-w-lg w-full shadow-2xl border border-slate-800 text-slate-100 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-slate-800 flex items-start justify-between bg-slate-950/60">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-blue-950 text-blue-400 flex items-center justify-center border border-blue-800">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Personalize Your Nexup Feed</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Tailor opportunity recommendations and deadline alerts to your focus areas.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-6 text-xs">
          {/* Areas of Interest */}
          <div>
            <label className="font-bold text-slate-300 block mb-2">
              Select Your Domains of Interest:
            </label>
            <div className="flex flex-wrap gap-1.5">
              {interestOptions.map((opt) => {
                const isSelected = selectedInterests.includes(opt);
                return (
                  <button
                    key={opt}
                    onClick={() => toggleInterest(opt)}
                    className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                      isSelected
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-750 border border-slate-700'
                    }`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Technical Skills */}
          <div>
            <label className="font-bold text-slate-300 block mb-2">
              Your Primary Technical Skills:
            </label>
            <div className="flex flex-wrap gap-1.5">
              {skillOptions.map((skill) => {
                const isSelected = selectedSkills.includes(skill);
                return (
                  <button
                    key={skill}
                    onClick={() => toggleSkill(skill)}
                    className={`px-3 py-1.5 rounded-lg font-mono font-medium transition-all ${
                      isSelected
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-750 border border-slate-700'
                    }`}
                  >
                    {skill}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="px-6 py-4 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between">
          <button
            onClick={onClose}
            className="text-xs font-semibold text-slate-400 hover:text-white transition-colors"
          >
            Skip for now
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center space-x-1.5 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-sm shadow-blue-500/20 disabled:opacity-50 transition-colors"
          >
            <span>{saving ? 'Saving...' : 'Save & Update Radar'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
