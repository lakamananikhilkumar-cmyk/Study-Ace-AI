import React, { useState, useRef } from 'react';
import confetti from 'canvas-confetti';
import {
  Award,
  CheckCircle2,
  Download,
  Printer,
  Share2,
  Copy,
  Sparkles,
  ShieldCheck,
  Calendar,
  User,
  ExternalLink,
  ChevronRight,
  Code2,
  Terminal,
  FileCode2,
  Cpu,
  Palette,
  Coffee,
  Layers,
  RotateCcw,
  Check
} from 'lucide-react';
import { ProgrammingLanguage } from '../types';
import { useApp } from '../context/AppContext';

export interface CodingCertificateGeneratorProps {
  completedModules: { [lessonId: string]: boolean };
  languages: any[];
  initialLanguage?: ProgrammingLanguage;
  onCompleteModule?: (lessonId: string) => void;
  onCompleteAllModulesForLanguage?: (langId: ProgrammingLanguage) => void;
}

export const CodingCertificateGenerator: React.FC<CodingCertificateGeneratorProps> = ({
  completedModules,
  languages,
  initialLanguage = 'python',
  onCompleteModule,
  onCompleteAllModulesForLanguage
}) => {
  const { profile } = useApp();

  const [selectedLang, setSelectedLang] = useState<ProgrammingLanguage>(initialLanguage);
  const [studentName, setStudentName] = useState<string>(() => profile?.name || 'Aarav Sharma');
  const [isEditingName, setIsEditingName] = useState<boolean>(false);
  const [theme, setTheme] = useState<'gold' | 'cyber' | 'royal' | 'emerald'>('gold');
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<boolean>(false);
  const certificateRef = useRef<HTMLDivElement>(null);

  const currentLangData = languages.find(l => l.id === selectedLang) || languages[0];
  const langLessons: any[] = currentLangData?.lessons || [];
  const totalLessons = langLessons.length || 3;

  // Count completed lessons for selected language
  const completedCount = langLessons.filter(l => completedModules[l.id]).length;
  const isLanguageFullyCompleted = completedCount >= totalLessons && totalLessons > 0;
  const completionPercentage = Math.round((completedCount / totalLessons) * 100);

  // Generate unique certificate ID for this language and student
  const certId = React.useMemo(() => {
    const langCode = selectedLang.toUpperCase();
    const hash = Math.abs(
      (studentName + selectedLang + '2026').split('').reduce((acc, c) => acc * 31 + c.charCodeAt(0), 7)
    ) % 90000 + 10000;
    return `SA-CERT-${langCode}-2026-${hash}`;
  }, [studentName, selectedLang]);

  const issueDate = new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  // Confetti trigger
  const triggerConfetti = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  // Print Certificate
  const handlePrint = () => {
    window.print();
  };

  // Copy Verification ID
  const handleCopyId = () => {
    navigator.clipboard.writeText(certId);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2500);
  };

  // Copy Shareable Link
  const handleCopyShareLink = () => {
    const shareUrl = `${window.location.origin}?verifyCert=${certId}`;
    navigator.clipboard.writeText(shareUrl);
    setCopiedLink(true);
    triggerConfetti();
    setTimeout(() => setCopiedLink(false), 3000);
  };

  // Helper for language titles
  const getCertificateTitle = (langId: ProgrammingLanguage) => {
    switch (langId) {
      case 'python':
        return 'Python Programming & Algorithmic Logic';
      case 'javascript':
        return 'Modern JavaScript & Web Interactivity';
      case 'html':
        return 'HTML5 Web Architecture & Semantics';
      case 'css':
        return 'CSS3 Responsive Styling & Visual Layouts';
      case 'cpp':
        return 'C++ High Performance & Object Systems';
      case 'java':
        return 'Java Object-Oriented Engineering';
      case 'c':
        return 'C Procedural Programming & Memory Architecture';
      default:
        return 'Computer Science & Software Development';
    }
  };

  return (
    <div id="coding-certificate-generator" className="space-y-6">
      {/* 1. Top Informational Banner */}
      <div className="bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-purple-500/15 dark:from-amber-950/40 dark:via-stone-900 dark:to-purple-950/30 border border-amber-500/30 rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-600 dark:text-amber-400 text-xs font-mono font-bold uppercase tracking-wider">
              <Award className="w-3.5 h-3.5 text-amber-500" />
              Official Verified Credentials
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 dark:text-white tracking-tight">
              StudyAce Digital Certificate Generator
            </h2>
            <p className="text-sm text-stone-600 dark:text-stone-300 max-w-2xl leading-relaxed">
              Complete all modules for any programming track to unlock an authenticated, verifiable Digital Certificate of Excellence signed by CodeAce AI and the StudyAce Academic Board.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              id="celebrate-confetti-btn"
              onClick={triggerConfetti}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-stone-950 font-bold text-xs sm:text-sm shadow-md shadow-amber-500/20 active:scale-95 transition-all"
            >
              <Sparkles className="w-4 h-4" />
              <span>Celebrate Achievement 🎊</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Language Track Selector & Progress Status */}
      <div className="bg-white dark:bg-stone-900 rounded-2xl p-5 border border-stone-200 dark:border-stone-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <span className="text-xs uppercase tracking-wider text-stone-500 dark:text-stone-400 font-bold">
            Select Language Certification Track:
          </span>
          <span className="text-xs text-amber-600 dark:text-amber-400 font-medium">
            Status: {completedCount}/{totalLessons} Modules Completed ({completionPercentage}%)
          </span>
        </div>

        {/* Language Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
          {languages.map(lang => {
            const isSel = selectedLang === lang.id;
            const lLessons = lang.lessons || [];
            const lComp = lLessons.filter((l: any) => completedModules[l.id]).length;
            const lTotal = lLessons.length || 3;
            const isFull = lComp >= lTotal && lTotal > 0;

            return (
              <button
                key={lang.id}
                id={`cert-track-${lang.id}`}
                onClick={() => setSelectedLang(lang.id)}
                className={`p-3 rounded-xl border text-left transition-all relative overflow-hidden ${
                  isSel
                    ? 'border-amber-500 bg-amber-500/10 dark:bg-amber-500/15 shadow-sm ring-1 ring-amber-500'
                    : 'border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-800/40 hover:bg-stone-100 dark:hover:bg-stone-800'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-stone-900 dark:text-white uppercase truncate">
                    {lang.shortName || lang.id}
                  </span>
                  {isFull ? (
                    <span className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px]">
                      ✓
                    </span>
                  ) : (
                    <span className="text-[10px] text-stone-400 font-mono">
                      {lComp}/{lTotal}
                    </span>
                  )}
                </div>
                <div className="w-full bg-stone-200 dark:bg-stone-700 h-1.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all ${isFull ? 'bg-emerald-500' : 'bg-amber-500'}`}
                    style={{ width: `${(lComp / lTotal) * 100}%` }}
                  />
                </div>
              </button>
            );
          })}
        </div>

        {/* Modules status for selected track */}
        <div className="pt-2 border-t border-stone-100 dark:border-stone-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold text-stone-700 dark:text-stone-300">
              {currentLangData?.name || selectedLang.toUpperCase()} Modules:
            </span>
            {langLessons.map((lesson: any, idx: number) => {
              const done = Boolean(completedModules[lesson.id]);
              return (
                <button
                  key={lesson.id}
                  id={`module-pill-${lesson.id}`}
                  onClick={() => onCompleteModule && onCompleteModule(lesson.id)}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${
                    done
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-semibold'
                      : 'bg-stone-100 dark:bg-stone-800 border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-400 hover:border-amber-400'
                  }`}
                  title={done ? "Click to toggle status" : "Click to mark as completed"}
                >
                  {done ? <Check className="w-3 h-3 text-emerald-500" /> : <span className="w-3 h-3 rounded-full border border-stone-400 inline-block" />}
                  <span>Mod {idx + 1}: {lesson.title.split(':')[0]}</span>
                </button>
              );
            })}
          </div>

          {/* Quick unlock button if not complete */}
          {!isLanguageFullyCompleted && onCompleteAllModulesForLanguage && (
            <button
              id="complete-all-track-modules-btn"
              onClick={() => {
                onCompleteAllModulesForLanguage(selectedLang);
                triggerConfetti();
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-700 dark:text-amber-300 font-bold text-xs border border-amber-500/30 transition-all self-start sm:self-auto"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-amber-500" />
              <span>Complete All Modules to Unlock Certificate 🎓</span>
            </button>
          )}
        </div>
      </div>

      {/* 3. Certificate Customization Controls & Actions Bar */}
      <div className="bg-white dark:bg-stone-900 rounded-2xl p-4 border border-stone-200 dark:border-stone-800 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Name on Certificate Editor */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <User className="w-4 h-4 text-stone-400" />
          <span className="text-xs text-stone-500 dark:text-stone-400 font-bold">Recipient:</span>
          {isEditingName ? (
            <div className="flex items-center gap-2">
              <input
                id="edit-cert-name-input"
                type="text"
                value={studentName}
                onChange={e => setStudentName(e.target.value)}
                className="px-3 py-1 text-sm rounded-lg bg-stone-100 dark:bg-stone-800 border border-amber-400 font-bold text-stone-900 dark:text-white"
              />
              <button
                onClick={() => setIsEditingName(false)}
                className="px-2.5 py-1 text-xs rounded-lg bg-amber-500 text-stone-950 font-bold"
              >
                Save
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-stone-900 dark:text-white text-sm">
                {studentName}
              </span>
              <button
                onClick={() => setIsEditingName(true)}
                className="text-[11px] text-amber-600 dark:text-amber-400 hover:underline font-semibold"
              >
                (Edit Name)
              </button>
            </div>
          )}
        </div>

        {/* Theme Picker */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-stone-500 dark:text-stone-400 font-bold">Theme:</span>
          {[
            { id: 'gold', label: 'Gold Academic', bg: 'bg-amber-400' },
            { id: 'cyber', label: 'Cyber Neon', bg: 'bg-cyan-400' },
            { id: 'royal', label: 'Royal Sapphire', bg: 'bg-indigo-500' },
            { id: 'emerald', label: 'Emerald Scholar', bg: 'bg-emerald-500' }
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setTheme(t.id as any)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                theme === t.id
                  ? 'bg-stone-900 dark:bg-white text-white dark:text-stone-900 shadow-xs'
                  : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${t.bg}`} />
              <span className="hidden sm:inline">{t.label}</span>
            </button>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-end flex-wrap">
          <button
            id="print-certificate-btn"
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 font-bold text-xs shadow-xs transition-all"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print / Save PDF</span>
          </button>

          <button
            id="copy-cert-id-btn"
            onClick={handleCopyId}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 font-bold text-xs shadow-xs transition-all"
          >
            {copiedId ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedId ? 'ID Copied!' : 'Copy ID'}</span>
          </button>

          <button
            id="share-cert-link-btn"
            onClick={handleCopyShareLink}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-stone-950 font-bold text-xs shadow-md shadow-amber-500/20 active:scale-95 transition-all"
          >
            {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Share2 className="w-3.5 h-3.5" />}
            <span>{copiedLink ? 'Link Copied!' : 'Share Credential'}</span>
          </button>
        </div>
      </div>

      {/* 4. THE AUTHENTIC DIGITAL CERTIFICATE (Printable Canvas Card) */}
      <div className="relative">
        {/* If language not completed yet, show an encouraging translucent overlay */}
        {!isLanguageFullyCompleted && (
          <div className="absolute inset-0 z-20 bg-stone-950/70 backdrop-blur-xs rounded-3xl flex flex-col items-center justify-center p-6 text-center text-white border-2 border-dashed border-amber-500/50">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-400 flex items-center justify-center text-amber-400 mb-3 shadow-lg">
              <Award className="w-8 h-8" />
            </div>
            <h3 className="text-xl sm:text-2xl font-black tracking-tight">
              Certificate Locked: Complete All {totalLessons} Modules
            </h3>
            <p className="text-sm text-stone-300 max-w-md mt-1 mb-4 leading-relaxed">
              You've finished <strong>{completedCount} of {totalLessons} modules</strong> for {currentLangData?.name || selectedLang.toUpperCase()}. Complete the remaining modules or click below to unlock your credential!
            </p>
            {onCompleteAllModulesForLanguage && (
              <button
                id="unlock-certificate-overlay-btn"
                onClick={() => {
                  onCompleteAllModulesForLanguage(selectedLang);
                  triggerConfetti();
                }}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-stone-950 font-black text-sm shadow-xl shadow-amber-500/30 hover:scale-105 active:scale-95 transition-all"
              >
                <Sparkles className="w-4 h-4" />
                <span>Mark Track Complete & Reveal Certificate 🎓</span>
              </button>
            )}
          </div>
        )}

        {/* Certificate Card Content */}
        <div
          ref={certificateRef}
          id="printable-digital-certificate"
          className={`rounded-3xl p-8 sm:p-12 transition-all relative overflow-hidden shadow-2xl border-4 ${
            theme === 'gold'
              ? 'bg-amber-50/90 text-stone-900 border-amber-600/60'
              : theme === 'cyber'
              ? 'bg-slate-950 text-slate-100 border-cyan-500/70'
              : theme === 'royal'
              ? 'bg-slate-900 text-white border-indigo-500/70'
              : 'bg-stone-900 text-stone-100 border-emerald-500/70'
          }`}
        >
          {/* Ornate Background Filigree Patterns */}
          <div className="absolute inset-2 sm:inset-4 border-2 border-dashed border-amber-500/30 pointer-events-none rounded-2xl" />
          <div className="absolute -top-12 -right-12 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Certificate Inner Container */}
          <div className="relative z-10 flex flex-col items-center text-center space-y-6 max-w-3xl mx-auto">
            {/* Academy Crest & Seal */}
            <div className="flex items-center gap-3">
              <div
                className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-lg ${
                  theme === 'gold'
                    ? 'bg-gradient-to-tr from-amber-500 to-yellow-400 text-stone-950'
                    : theme === 'cyber'
                    ? 'bg-gradient-to-tr from-cyan-500 to-blue-600 text-slate-950'
                    : theme === 'royal'
                    ? 'bg-gradient-to-tr from-indigo-500 to-purple-600 text-white'
                    : 'bg-gradient-to-tr from-emerald-500 to-teal-400 text-stone-950'
                }`}
              >
                🎓
              </div>
              <div className="text-left">
                <span className="text-xs uppercase tracking-widest font-black block opacity-75">
                  STUDYACE COMPUTING ACADEMY
                </span>
                <span className="text-[10px] font-mono opacity-60">
                  Accredited STEM & Computer Science Curriculum
                </span>
              </div>
            </div>

            {/* Certificate Big Headline */}
            <div className="space-y-1">
              <h1
                className={`text-2xl sm:text-4xl font-serif font-black tracking-tight uppercase ${
                  theme === 'gold'
                    ? 'text-stone-900'
                    : 'text-white'
                }`}
              >
                Certificate of Excellence
              </h1>
              <p className="text-xs uppercase tracking-widest font-mono opacity-70">
                PROUDLY PRESENTED IN RECOGNITION OF PROGRAMMING MASTERY
              </p>
            </div>

            {/* Student Name */}
            <div className="py-2 border-b-2 border-dashed border-stone-300 dark:border-stone-700 w-full max-w-lg">
              <span className="text-xs font-serif italic opacity-60 block">This is to certify that</span>
              <h2
                className={`text-3xl sm:text-4xl font-extrabold tracking-tight mt-1 mb-1 font-serif ${
                  theme === 'gold' ? 'text-amber-900' : 'text-amber-400'
                }`}
              >
                {studentName}
              </h2>
              <span className="text-xs font-mono opacity-70">
                {profile?.school || 'Modern High School Scholar'} • {profile?.classGrade || 'Classes 6th–10th'}
              </span>
            </div>

            {/* Description & Language Title */}
            <div className="space-y-2 max-w-xl">
              <p className="text-xs sm:text-sm leading-relaxed opacity-85">
                has successfully demonstrated proficiency, completed all practical coding modules, and solved computational challenges in
              </p>
              <h3
                className={`text-xl sm:text-2xl font-black font-mono tracking-tight uppercase ${
                  theme === 'gold' ? 'text-stone-900' : 'text-cyan-300'
                }`}
              >
                {getCertificateTitle(selectedLang)}
              </h3>
            </div>

            {/* Verified Curriculum Modules Badges */}
            <div className="bg-black/5 dark:bg-white/5 rounded-2xl p-4 w-full border border-black/10 dark:border-white/10">
              <span className="text-[10px] uppercase tracking-wider font-bold block mb-2 opacity-60">
                Curriculum Modules Verified & Completed:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-left">
                {langLessons.map((lesson: any, i: number) => (
                  <div
                    key={lesson.id}
                    className="flex items-start gap-2 bg-white/40 dark:bg-stone-800/40 p-2 rounded-xl text-xs"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                    <span className="font-medium truncate opacity-90">
                      Mod {i + 1}: {lesson.title.split(':')[0]}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Metadata Footer: Date, Cert ID, Signatures */}
            <div className="w-full pt-6 border-t border-dashed border-stone-300 dark:border-stone-700 grid grid-cols-1 sm:grid-cols-3 gap-6 items-center">
              {/* Issue Date & ID */}
              <div className="text-left space-y-1">
                <div className="flex items-center gap-1.5 text-xs opacity-75">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Date: {issueDate}</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-amber-600 dark:text-amber-400">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>ID: {certId}</span>
                </div>
              </div>

              {/* Official Gold Seal Graphic */}
              <div className="flex justify-center">
                <div className="w-20 h-20 rounded-full border-4 border-amber-500/80 bg-gradient-to-tr from-amber-400 to-yellow-300 text-stone-950 flex flex-col items-center justify-center p-1 shadow-lg transform rotate-6">
                  <span className="text-[9px] font-black uppercase tracking-tighter">STUDYACE</span>
                  <span className="text-lg">⭐</span>
                  <span className="text-[8px] font-bold uppercase tracking-widest">VERIFIED</span>
                </div>
              </div>

              {/* Mentors Signatures */}
              <div className="text-right space-y-1">
                <div className="font-serif italic font-bold text-base opacity-90">
                  CodeAce AI & Dr. V. Sen
                </div>
                <div className="text-[10px] uppercase tracking-wider opacity-60 font-mono">
                  Academic Director & AI Mentor
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
