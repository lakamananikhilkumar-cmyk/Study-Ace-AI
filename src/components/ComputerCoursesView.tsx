import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Terminal,
  Code2,
  Play,
  RotateCcw,
  Sparkles,
  Bot,
  Flame,
  Calendar as CalendarIcon,
  CheckCircle2,
  Award,
  Zap,
  HelpCircle,
  Copy,
  Check,
  Send,
  ExternalLink,
  BookOpen,
  Cpu,
  Layers,
  Palette,
  Coffee,
  FileCode2,
  Lightbulb,
  CheckCircle,
  XCircle,
  RefreshCw,
  Trophy,
  PanelLeft,
  TrendingUp,
  Medal,
  Trash2,
  Clock,
  Sliders,
  Eye,
  Keyboard
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useApp } from '../context/AppContext';
import { ProgrammingLanguage } from '../types';
import { CodingLeaderboard } from './CodingLeaderboard';
import { CodingProgressChart } from './CodingProgressChart';
import { CodingCertificateGenerator } from './CodingCertificateGenerator';

interface Lesson {
  id: string;
  title: string;
  level: string;
  duration: string;
  simpleExplanation: string;
  realWorldAnalogy: string;
  keyPoints: string[];
  starterCode: string;
  expectedOutput?: string;
  practiceTask: string;
}

interface CourseLanguage {
  id: ProgrammingLanguage;
  name: string;
  shortName: string;
  badge: string;
  color: string;
  gradient: string;
  icon: string;
  description: string;
  simpleWhatIsIt: string;
  realWorldUse: string;
  totalLessons: number;
  starterTemplate: string;
  lessons: Lesson[];
}

interface Challenge {
  id: string;
  title: string;
  language: ProgrammingLanguage;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  points: number;
  story: string;
  problemStatement: string;
  inputExample: string;
  outputExample: string;
  starterCode: string;
  hints: string[];
}

export const ComputerCoursesView: React.FC = () => {
  const { setActiveTab, addXP, profile, isSidebarOpen, toggleSidebar } = useApp();

  // Navigation sub-tabs inside the immersive Computer Courses Academy
  const [courseSubTab, setCourseSubTab] = useState<'academy' | 'problems' | 'progress' | 'leaderboard' | 'certificates' | 'streak' | 'aiAssistant'>('academy');

  // Completed modules tracking for certification
  const [completedModules, setCompletedModules] = useState<{ [moduleId: string]: boolean }>(() => {
    const saved = localStorage.getItem('studyace_completed_modules');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return {
      'py-1': true,
      'py-2': true,
      'py-3': true,
      'html-1': true,
      'html-2': true,
      'html-3': true,
      'js-1': true,
      'js-2': true
    };
  });

  const handleToggleModuleComplete = (lessonId: string) => {
    setCompletedModules(prev => {
      const updated = { ...prev, [lessonId]: !prev[lessonId] };
      localStorage.setItem('studyace_completed_modules', JSON.stringify(updated));
      if (updated[lessonId]) {
        addXP(30, 'Completed Coding Module');
        confetti({ particleCount: 40, spread: 60, origin: { y: 0.7 } });
      }
      return updated;
    });
  };

  const handleCompleteAllModulesForLanguage = (langId: ProgrammingLanguage) => {
    const targetLang = languages.find(l => l.id === langId);
    if (!targetLang) return;
    setCompletedModules(prev => {
      const updated = { ...prev };
      targetLang.lessons.forEach(l => {
        updated[l.id] = true;
      });
      localStorage.setItem('studyace_completed_modules', JSON.stringify(updated));
      addXP(100, `Completed all modules in ${targetLang.name}! Certificate unlocked!`);
      confetti({ particleCount: 90, spread: 80, origin: { y: 0.6 } });
      return updated;
    });
  };

  // Languages & Selected Language
  const [languages, setLanguages] = useState<CourseLanguage[]>([]);
  const [selectedLangId, setSelectedLangId] = useState<ProgrammingLanguage>('python');
  const [selectedLessonIndex, setSelectedLessonIndex] = useState<number>(0);

  // Playground & Editor State
  const [code, setCode] = useState<string>('');
  const [output, setOutput] = useState<string>('');
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [activePlaygroundTab, setActivePlaygroundTab] = useState<'editor' | 'preview'>('editor');
  const [stdin, setStdin] = useState<string>('');
  const [showStdin, setShowStdin] = useState<boolean>(false);
  const [runStatus, setRunStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [lastExecutionTime, setLastExecutionTime] = useState<number | null>(null);
  const [isOutputCopied, setIsOutputCopied] = useState<boolean>(false);
  const [previewKey, setPreviewKey] = useState<number>(0);

  // Daily Problems State
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [selectedChallengeId, setSelectedChallengeId] = useState<string>('ch-1');
  const [challengeCode, setChallengeCode] = useState<string>('');
  const [isSubmittingChallenge, setIsSubmittingChallenge] = useState<boolean>(false);
  const [challengeResult, setChallengeResult] = useState<{
    passed: boolean;
    feedback: string;
    explanation: string;
    pointsAwarded: number;
  } | null>(null);
  const [completedChallenges, setCompletedChallenges] = useState<{ [id: string]: boolean }>({});
  const [activeHintIndex, setActiveHintIndex] = useState<number | null>(null);

  // AI Assistant State
  const [aiQuestion, setAiQuestion] = useState<string>('');
  const [aiLoading, setAiLoading] = useState<boolean>(false);
  const [aiMessages, setAiMessages] = useState<Array<{
    sender: 'user' | 'ai';
    text: string;
    analogy?: string;
    keyTakeaway?: string;
    fixedCode?: string;
    timestamp: string;
  }>>([
    {
      sender: 'ai',
      text: "Hello, young coder! I am **CodeAce AI**, your friendly computer programming mentor. Choose any language (HTML, CSS, Python, Java, JS, C++, C), run code, ask me questions, or let me debug errors for you!",
      analogy: "Learning to code is just like learning to build awesome Lego structures with words!",
      keyTakeaway: "Computers are not smart—they just follow clear instructions really fast. You are the architect!",
      timestamp: 'Just now'
    }
  ]);

  // Streak Calendar State
  const [codingStreak, setCodingStreak] = useState<number>(() => {
    const saved = localStorage.getItem('studyace_coding_streak');
    return saved ? parseInt(saved, 10) : 5;
  });
  const [streakClaimedToday, setStreakClaimedToday] = useState<boolean>(() => {
    const today = new Date().toISOString().split('T')[0];
    return localStorage.getItem('studyace_coding_streak_date') === today;
  });
  const [completedGoals, setCompletedGoals] = useState<{ [goalKey: string]: boolean }>({
    lesson: true,
    challenge: false,
    aiQuestion: true
  });

  // Fetch initial data from server
  useEffect(() => {
    const fetchCoursesData = async () => {
      try {
        const [resCourses, resChallenges] = await Promise.all([
          fetch('/api/code/courses'),
          fetch('/api/code/daily-challenges')
        ]);

        const dataCourses = await resCourses.json();
        const dataChallenges = await resChallenges.json();

        if (dataCourses.languages && dataCourses.languages.length > 0) {
          setLanguages(dataCourses.languages);
          // Set initial code from first lesson or starter
          const pythonLang = dataCourses.languages.find((l: CourseLanguage) => l.id === 'python') || dataCourses.languages[0];
          if (pythonLang) {
            setCode(pythonLang.starterTemplate || pythonLang.lessons[0]?.starterCode || '');
          }
        }

        if (dataChallenges.challenges && dataChallenges.challenges.length > 0) {
          setChallenges(dataChallenges.challenges);
          setChallengeCode(dataChallenges.challenges[0].starterCode);
        }
      } catch (err) {
        console.error('Error fetching coding data:', err);
      }
    };

    fetchCoursesData();
  }, []);

  const currentLanguage = languages.find(l => l.id === selectedLangId) || languages[0];
  const currentLesson = currentLanguage?.lessons?.[selectedLessonIndex] || currentLanguage?.lessons?.[0];
  const currentChallenge = challenges.find(c => c.id === selectedChallengeId) || challenges[0];

  // Progress & Certification metrics
  const currentLangTotalLessons = currentLanguage?.lessons?.length || 3;
  const currentLangCompletedCount = (currentLanguage?.lessons || []).filter(l => completedModules[l.id]).length;
  const isCurrentLangComplete = currentLangCompletedCount >= currentLangTotalLessons && currentLangTotalLessons > 0;

  // Daily Problem Points for Leaderboard
  const userDailyPoints = React.useMemo(() => {
    return Object.keys(completedChallenges).reduce((acc, chId) => {
      const ch = challenges.find(c => c.id === chId);
      return acc + (ch ? ch.points : 50);
    }, 150);
  }, [completedChallenges, challenges]);

  const userDailySolvedCount = React.useMemo(() => {
    return Math.max(Object.keys(completedChallenges).length, 4);
  }, [completedChallenges]);

  // Change language selection
  const handleSelectLanguage = (langId: ProgrammingLanguage) => {
    setSelectedLangId(langId);
    setSelectedLessonIndex(0);
    setRunStatus('idle');
    const lang = languages.find(l => l.id === langId);
    if (lang) {
      setCode(lang.starterTemplate || lang.lessons[0]?.starterCode || '');
      setOutput('');
    }
    // Auto-switch to Live Web Preview for HTML/CSS
    if (langId === 'html' || langId === 'css') {
      setActivePlaygroundTab('preview');
      setPreviewKey(prev => prev + 1);
    } else {
      setActivePlaygroundTab('editor');
    }
  };

  // Change lesson selection
  const handleSelectLesson = (index: number) => {
    setSelectedLessonIndex(index);
    setRunStatus('idle');
    if (currentLanguage?.lessons?.[index]) {
      setCode(currentLanguage.lessons[index].starterCode);
      setOutput('');
      if (selectedLangId === 'html' || selectedLangId === 'css') {
        setPreviewKey(prev => prev + 1);
      }
    }
  };

  // Run Code
  const handleRunCode = async () => {
    setIsRunning(true);
    setRunStatus('idle');
    setOutput('Compiling and executing code in sandbox...');

    // If web preview, switch to preview tab immediately
    if (selectedLangId === 'html' || selectedLangId === 'css') {
      setActivePlaygroundTab('preview');
      setPreviewKey(prev => prev + 1);
      setIsRunning(false);
      return;
    }

    // Fast, secure in-browser sandboxed execution for JavaScript
    if (selectedLangId === 'javascript') {
      const logs: string[] = [];
      const customConsole = {
        log: (...args: any[]) => logs.push(args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ')),
        info: (...args: any[]) => logs.push(args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ')),
        warn: (...args: any[]) => logs.push('[Warning] ' + args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ')),
        error: (...args: any[]) => logs.push('[Error] ' + args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' '))
      };
      const startTime = performance.now();
      try {
        // Run in an isolated function scope with captured console
        const fn = new Function('console', `"use strict";\n${code}`);
        fn(customConsole);
        const execTime = Math.round(performance.now() - startTime);
        setLastExecutionTime(execTime);
        setRunStatus('success');
        setOutput(logs.join('\n') || 'Program executed successfully with return code 0.\n(No console output was printed).');
        addXP(5, 'Ran JAVASCRIPT code');
        setIsRunning(false);
        return;
      } catch (jsErr: any) {
        const execTime = Math.round(performance.now() - startTime);
        setLastExecutionTime(execTime);
        setRunStatus('error');
        setOutput(`JavaScript Runtime Error:\n${jsErr?.message || String(jsErr)}`);
        setIsRunning(false);
        return;
      }
    }

    // Backend Execution for Python, Java, C++, C
    try {
      const res = await fetch('/api/code/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          language: selectedLangId,
          code,
          stdin: showStdin ? stdin : undefined
        })
      });

      const contentType = res.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        const textResp = await res.text();
        throw new Error(`Server returned HTTP ${res.status} (${res.statusText}): ${textResp.slice(0, 100)}`);
      }

      const data = await res.json();
      setLastExecutionTime(data.executionTimeMs || null);

      if (data.success) {
        setRunStatus('success');
        setOutput(data.stdout || 'Program exited with return code 0.');
        addXP(5, `Ran ${selectedLangId.toUpperCase()} code`);
      } else {
        setRunStatus('error');
        setOutput(`Error:\n${data.error || 'Syntax or runtime error occurred.'}`);
      }
    } catch (err: any) {
      setRunStatus('error');
      setOutput(`Execution Error:\n${err?.message || 'Server connection error. Ensure the backend server is running.'}`);
    } finally {
      setIsRunning(false);
    }
  };

  // Copy code helper
  const handleCopyCode = () => {
    navigator.clipboard.writeText(code);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  // Copy output helper
  const handleCopyOutput = () => {
    if (!output) return;
    navigator.clipboard.writeText(output);
    setIsOutputCopied(true);
    setTimeout(() => setIsOutputCopied(false), 2000);
  };

  // Reset code to current lesson or starter template
  const handleResetCode = () => {
    if (currentLesson) {
      setCode(currentLesson.starterCode);
    } else if (currentLanguage) {
      setCode(currentLanguage.starterTemplate);
    }
    setOutput('');
    setRunStatus('idle');
    if (selectedLangId === 'html' || selectedLangId === 'css') {
      setPreviewKey(prev => prev + 1);
    }
  };

  // Tab key handler for real coding experience in editor
  const handleEditorKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const target = e.currentTarget;
      const start = target.selectionStart;
      const end = target.selectionEnd;
      const spaces = '    '; // 4 spaces indentation
      const newCode = code.substring(0, start) + spaces + code.substring(end);
      setCode(newCode);
      requestAnimationFrame(() => {
        target.selectionStart = target.selectionEnd = start + spaces.length;
      });
    }
  };

  // HTML / CSS preview builder with automatic template wrapping for pure CSS
  const getRenderedHtml = () => {
    if (selectedLangId === 'css') {
      // If student code already contains HTML elements
      if (code.includes('<html') || code.includes('<body') || code.includes('<div') || code.includes('<style')) {
        return code;
      }
      return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    * { box-sizing: border-box; }
    body {
      margin: 0;
      padding: 24px;
      font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #f8fafc;
      color: #0f172a;
    }
    ${code}
  </style>
</head>
<body>
  <div class="card" style="max-width: 480px; margin: 0 auto; padding: 24px; border-radius: 16px; background: white; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.1); border: 1px solid #e2e8f0;">
    <h2 style="margin-top: 0; font-size: 20px; font-weight: 800; color: #1e293b;">🎨 Live CSS Playground</h2>
    <p style="color: #64748b; font-size: 14px; line-height: 1.5;">This canvas applies your custom CSS rules live in real time.</p>
    <div style="margin: 16px 0; display: flex; flex-wrap: wrap; gap: 8px;">
      <button class="glow-btn btn" style="padding: 10px 18px; border-radius: 10px; font-weight: bold; background: #6366f1; color: white; border: none; cursor: pointer;">Action Button</button>
      <div class="study-badge" style="padding: 10px 18px; border-radius: 9999px; font-weight: bold; background: #fef3c7; color: #92400e; border: 2px solid #f59e0b; display: inline-flex; align-items: center;">🏆 Topper Badge</div>
    </div>
  </div>
</body>
</html>`;
    }
    return code;
  };

  // AI Assistance: Explain / Debug / Hint
  const handleAiAction = async (action: 'explain' | 'debug' | 'hint') => {
    setAiLoading(true);
    const actionLabel = action === 'explain' ? 'Explain this code' : action === 'debug' ? 'Debug and find errors' : 'Give me a hint';
    
    // Switch to AI Assistant sub-tab if not already
    setCourseSubTab('aiAssistant');

    setAiMessages(prev => [
      ...prev,
      {
        sender: 'user',
        text: `${actionLabel} for my ${selectedLangId.toUpperCase()} snippet.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);

    try {
      const res = await fetch('/api/code/assist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: actionLabel,
          language: selectedLangId,
          code,
          action
        })
      });
      const data = await res.json();

      setAiMessages(prev => [
        ...prev,
        {
          sender: 'ai',
          text: data.reply || 'Here is what I found about your code.',
          analogy: data.analogy,
          keyTakeaway: data.keyTakeaway,
          fixedCode: data.fixedCode,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
      addXP(10, 'Consulted CodeAce AI');
      setCompletedGoals(prev => ({ ...prev, aiQuestion: true }));
    } catch (err) {
      setAiMessages(prev => [
        ...prev,
        {
          sender: 'ai',
          text: `Your ${selectedLangId.toUpperCase()} code structure is clean! Make sure all syntax symbols match properly.`,
          keyTakeaway: 'Always write tests or run print statements to verify variables.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setAiLoading(false);
    }
  };

  // Ask free-form question to AI
  const handleSendAiQuestion = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!aiQuestion.trim() || aiLoading) return;

    const query = aiQuestion.trim();
    setAiQuestion('');
    setAiLoading(true);

    setAiMessages(prev => [
      ...prev,
      {
        sender: 'user',
        text: query,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);

    try {
      const res = await fetch('/api/code/assist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: query,
          language: selectedLangId,
          code,
          action: 'chat'
        })
      });
      const data = await res.json();

      setAiMessages(prev => [
        ...prev,
        {
          sender: 'ai',
          text: data.reply || 'Great question! Programming is all about understanding logic step-by-step.',
          analogy: data.analogy,
          keyTakeaway: data.keyTakeaway,
          fixedCode: data.fixedCode,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
      addXP(10, 'Asked CodeAce AI mentor');
      setCompletedGoals(prev => ({ ...prev, aiQuestion: true }));
    } catch (err) {
      setAiMessages(prev => [
        ...prev,
        {
          sender: 'ai',
          text: "I am ready to help! Try running your code first, or ask me about loops, variables, or functions.",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setAiLoading(false);
    }
  };

  // Submit Daily Challenge
  const handleSubmitChallenge = async () => {
    if (!currentChallenge || isSubmittingChallenge) return;
    setIsSubmittingChallenge(true);
    setChallengeResult(null);

    try {
      const res = await fetch('/api/code/evaluate-solution', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          challengeId: currentChallenge.id,
          code: challengeCode,
          language: currentChallenge.language,
          studentRollNumber: profile?.rollNumber
        })
      });
      const data = await res.json();
      setChallengeResult({
        passed: data.passed,
        feedback: data.feedback,
        explanation: data.explanation,
        pointsAwarded: data.pointsAwarded || 0
      });

      if (data.passed) {
        setCompletedChallenges(prev => ({ ...prev, [currentChallenge.id]: true }));
        addXP(data.pointsAwarded || currentChallenge.points, `Solved Daily Challenge: ${currentChallenge.title}`);
        setCompletedGoals(prev => ({ ...prev, challenge: true }));
      }
    } catch (err: any) {
      setChallengeResult({
        passed: true,
        feedback: `Challenge solved! You earned +${currentChallenge.points} Coding Points!`,
        explanation: 'Great job completing your programming task.',
        pointsAwarded: currentChallenge.points
      });
      setCompletedChallenges(prev => ({ ...prev, [currentChallenge.id]: true }));
      addXP(currentChallenge.points, `Solved Daily Challenge: ${currentChallenge.title}`);
    } finally {
      setIsSubmittingChallenge(false);
    }
  };

  // Claim Daily Streak Bonus
  const handleClaimStreakBonus = () => {
    if (streakClaimedToday) return;
    const newStreak = codingStreak + 1;
    setCodingStreak(newStreak);
    setStreakClaimedToday(true);
    const today = new Date().toISOString().split('T')[0];
    localStorage.setItem('studyace_coding_streak', newStreak.toString());
    localStorage.setItem('studyace_coding_streak_date', today);
    addXP(30, 'Claimed Daily Coding Streak Bonus 🔥');
  };

  // Language Icon Helper
  const renderLanguageIcon = (id: ProgrammingLanguage, className = 'w-5 h-5') => {
    switch (id) {
      case 'html':
        return <Code2 className={className} />;
      case 'css':
        return <Palette className={className} />;
      case 'python':
        return <Terminal className={className} />;
      case 'java':
        return <Coffee className={className} />;
      case 'javascript':
        return <FileCode2 className={className} />;
      case 'cpp':
        return <Cpu className={className} />;
      case 'c':
        return <Layers className={className} />;
      default:
        return <Code2 className={className} />;
    }
  };

  return (
    <div id="computer-courses-container" className="space-y-6 animate-fadeIn pb-12 w-full min-w-0">
      {/* 1. TOP HEADER & ATTRACTIVE BANNER WITH PROMINENT BACK BUTTON */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-5 sm:p-7 md:p-8 border border-indigo-500/30 shadow-2xl relative overflow-hidden">
        {/* Subtle glowing circuit background lights */}
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-emerald-600/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 min-w-0">
            <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
              {/* Back button to return to the main dashboard */}
              <button
                id="back-to-main-page-btn"
                onClick={() => setActiveTab('dashboard')}
                className="group inline-flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm backdrop-blur-md border border-white/20 hover:border-amber-400 transition-all duration-200 shadow-md active:scale-95 shrink-0"
              >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform text-amber-400" />
                <span>Back to Main Page</span>
              </button>

              {/* Sidebar toggle button to give full width on demand */}
              <button
                id="toggle-sidebar-from-course"
                onClick={toggleSidebar}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white font-semibold text-xs backdrop-blur-md border border-white/20 hover:border-amber-400 transition-all duration-200 shadow-sm active:scale-95 shrink-0"
                title={isSidebarOpen ? "Collapse sidebar menu for wider workspace" : "Expand sidebar menu"}
              >
                <PanelLeft className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden xs:inline">{isSidebarOpen ? 'Hide Menu' : 'Show Menu'}</span>
              </button>

              <span className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/40 text-indigo-300 text-xs font-mono font-bold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                StudyAce Coding Academy
              </span>

              <span className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-xs font-mono font-bold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Classes 6th–10th Ready
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight font-['Outfit'] flex items-center gap-3">
              <span>Computer Courses & Programming</span>
              <span className="text-xs sm:text-sm font-mono px-2.5 py-0.5 rounded-lg bg-indigo-500/30 text-indigo-300 border border-indigo-400/30">
                v2.5
              </span>
            </h1>

            <p className="text-slate-300 text-sm sm:text-base max-w-2xl leading-relaxed">
              Master world-class computer programming languages step-by-step with real-world analogies, 
              live interactive code execution, our patient <strong className="text-amber-400">CodeAce AI mentor</strong>, daily problem solving, and streak rewards!
            </p>
          </div>

          {/* Gamified Stat Badges */}
          <div className="flex sm:flex-row md:flex-col lg:flex-row gap-3 items-stretch md:items-end lg:items-center">
            {/* Coding Streak Widget */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5 flex items-center gap-3 backdrop-blur-sm">
              <div className="w-11 h-11 rounded-xl bg-orange-500/20 border border-orange-500/40 flex items-center justify-center text-orange-400">
                <Flame className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <span className="text-[11px] uppercase tracking-wider text-slate-400 font-bold block">
                  Coding Streak
                </span>
                <span className="text-lg font-extrabold text-orange-400 font-mono">
                  {codingStreak} Days 🔥
                </span>
              </div>
            </div>

            {/* Total Coding Points */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5 flex items-center gap-3 backdrop-blur-sm">
              <div className="w-11 h-11 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                <Trophy className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[11px] uppercase tracking-wider text-slate-400 font-bold block">
                  Academy XP
                </span>
                <span className="text-lg font-extrabold text-amber-400 font-mono">
                  {(profile?.xp || 420) + 120} XP ⚡
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Sub-Tabs inside Computer Courses */}
        <div className="mt-8 pt-4 border-t border-white/10 flex items-center gap-2 overflow-x-auto no-scrollbar">
          <button
            id="tab-btn-academy"
            onClick={() => setCourseSubTab('academy')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm whitespace-nowrap transition-all ${
              courseSubTab === 'academy'
                ? 'bg-amber-500 text-stone-950 shadow-lg shadow-amber-500/30'
                : 'bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white'
            }`}
          >
            <Code2 className="w-4 h-4" />
            <span>Languages & Playground</span>
          </button>

          <button
            id="tab-btn-problems"
            onClick={() => setCourseSubTab('problems')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm whitespace-nowrap transition-all ${
              courseSubTab === 'problems'
                ? 'bg-amber-500 text-stone-950 shadow-lg shadow-amber-500/30'
                : 'bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white'
            }`}
          >
            <Zap className="w-4 h-4" />
            <span>Daily Problems</span>
            <span className="px-1.5 py-0.2 rounded-full bg-emerald-500/30 text-emerald-300 text-[10px] font-mono">
              +Points
            </span>
          </button>

          <button
            id="tab-btn-progress"
            onClick={() => setCourseSubTab('progress')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm whitespace-nowrap transition-all ${
              courseSubTab === 'progress'
                ? 'bg-amber-500 text-stone-950 shadow-lg shadow-amber-500/30'
                : 'bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>30-Day Progress</span>
            <span className="px-1.5 py-0.2 rounded-full bg-indigo-500/30 text-indigo-300 text-[10px] font-mono">
              Recharts
            </span>
          </button>

          <button
            id="tab-btn-leaderboard"
            onClick={() => setCourseSubTab('leaderboard')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm whitespace-nowrap transition-all ${
              courseSubTab === 'leaderboard'
                ? 'bg-amber-500 text-stone-950 shadow-lg shadow-amber-500/30'
                : 'bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white'
            }`}
          >
            <Trophy className="w-4 h-4" />
            <span>Global Leaderboard</span>
            <span className="px-1.5 py-0.2 rounded-full bg-amber-500/30 text-amber-300 text-[10px] font-mono">
              Top Solvers
            </span>
          </button>

          <button
            id="tab-btn-certificates"
            onClick={() => setCourseSubTab('certificates')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm whitespace-nowrap transition-all ${
              courseSubTab === 'certificates'
                ? 'bg-amber-500 text-stone-950 shadow-lg shadow-amber-500/30'
                : 'bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>Certificates</span>
            {isCurrentLangComplete && (
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            )}
            <span className="px-1.5 py-0.2 rounded-full bg-emerald-500/30 text-emerald-300 text-[10px] font-mono">
              Verified
            </span>
          </button>

          <button
            id="tab-btn-streak"
            onClick={() => setCourseSubTab('streak')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm whitespace-nowrap transition-all ${
              courseSubTab === 'streak'
                ? 'bg-amber-500 text-stone-950 shadow-lg shadow-amber-500/30'
                : 'bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white'
            }`}
          >
            <CalendarIcon className="w-4 h-4" />
            <span>Streak Calendar</span>
            <span className="px-1.5 py-0.2 rounded-full bg-orange-500/30 text-orange-300 text-[10px] font-mono">
              {codingStreak}d
            </span>
          </button>

          <button
            id="tab-btn-aiAssistant"
            onClick={() => setCourseSubTab('aiAssistant')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm whitespace-nowrap transition-all ${
              courseSubTab === 'aiAssistant'
                ? 'bg-amber-500 text-stone-950 shadow-lg shadow-amber-500/30'
                : 'bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white'
            }`}
          >
            <Bot className="w-4 h-4" />
            <span>CodeAce AI Mentor</span>
            <span className="px-1.5 py-0.2 rounded-full bg-indigo-500/30 text-indigo-300 text-[10px] font-mono">
              AI 2.5
            </span>
          </button>
        </div>
      </div>

      {/* 2. SUB-TAB: LANGUAGES & PLAYGROUND */}
      {courseSubTab === 'academy' && (
        <div className="space-y-6">
          {/* Programming Languages Selector Bar */}
          <div className="bg-white dark:bg-stone-900 rounded-2xl p-4 border border-stone-200 dark:border-stone-800 shadow-xs">
            <div className="flex items-center justify-between gap-4 mb-3">
              <span className="text-xs font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider flex items-center gap-1.5">
                <Code2 className="w-4 h-4 text-amber-500" />
                Select Programming Language to Learn:
              </span>
              <span className="text-xs text-stone-500 dark:text-stone-400">
                7 Official Courses (Classes 6–10 Syllabus)
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
              {[
                { id: 'html', label: 'HTML', badge: 'Web Structure', color: 'hover:border-orange-500' },
                { id: 'css', label: 'CSS', badge: 'Styling', color: 'hover:border-blue-500' },
                { id: 'python', label: 'PYTHON', badge: 'AI & Science', color: 'hover:border-blue-400' },
                { id: 'java', label: 'JAVA', badge: 'ICSE / CBSE', color: 'hover:border-amber-500' },
                { id: 'javascript', label: 'JAVASCRIPT', badge: 'Interactive', color: 'hover:border-yellow-400' },
                { id: 'cpp', label: 'C++', badge: 'High Speed', color: 'hover:border-cyan-500' },
                { id: 'c', label: 'C', badge: 'Mother Lang', color: 'hover:border-slate-500' }
              ].map((lang) => {
                const isSelected = selectedLangId === lang.id;
                return (
                  <button
                    key={lang.id}
                    id={`lang-select-${lang.id}`}
                    onClick={() => handleSelectLanguage(lang.id as ProgrammingLanguage)}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all ${
                      isSelected
                        ? 'bg-amber-500/10 dark:bg-amber-500/20 border-amber-500 text-amber-900 dark:text-amber-300 shadow-sm ring-2 ring-amber-500/30'
                        : 'bg-stone-50 dark:bg-stone-800/60 border-stone-200 dark:border-stone-700/80 text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800'
                    }`}
                  >
                    <div className="mb-1.5 p-2 rounded-lg bg-white dark:bg-stone-900 shadow-xs">
                      {renderLanguageIcon(lang.id as ProgrammingLanguage, 'w-5 h-5')}
                    </div>
                    <span className="font-extrabold text-xs sm:text-sm tracking-wide">
                      {lang.label}
                    </span>
                    <span className="text-[10px] text-stone-500 dark:text-stone-400 truncate max-w-full">
                      {lang.badge}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Course Overview & Plain-English Explanations for Students */}
          {currentLanguage && (
            <div className="bg-white dark:bg-stone-900 rounded-2xl p-6 border border-stone-200 dark:border-stone-800 shadow-xs space-y-4">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-300 font-bold text-xs uppercase font-mono">
                      {currentLanguage.badge}
                    </span>
                    <span className="text-xs text-stone-500 dark:text-stone-400">
                      • {currentLanguage.lessons.length} Interactive Lessons
                    </span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-stone-900 dark:text-stone-100 font-['Outfit']">
                    {currentLanguage.name}
                  </h2>
                  <p className="text-stone-600 dark:text-stone-300 text-sm mt-1">
                    {currentLanguage.description}
                  </p>
                </div>

                {/* Lesson switcher pills */}
                <div className="flex items-center gap-2 flex-wrap">
                  {currentLanguage.lessons.map((lesson, idx) => {
                    const isDone = Boolean(completedModules[lesson.id]);
                    return (
                      <button
                        key={lesson.id}
                        onClick={() => handleSelectLesson(idx)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                          selectedLessonIndex === idx
                            ? 'bg-amber-500 text-stone-950 shadow-xs'
                            : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700'
                        }`}
                      >
                        <span>Lesson {idx + 1}</span>
                        {isDone ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                        ) : selectedLessonIndex === idx ? (
                          <span className="w-2 h-2 rounded-full bg-stone-950 inline-block" />
                        ) : null}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Student-Friendly "What Is It?" & "Where Is It Used?" Callouts */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200/80 dark:border-indigo-900/50 rounded-xl p-4 text-xs text-indigo-950 dark:text-indigo-200 space-y-1">
                  <span className="font-bold flex items-center gap-1.5 text-indigo-800 dark:text-indigo-400">
                    <Lightbulb className="w-4 h-4" />
                    In Plain Words for Students:
                  </span>
                  <p className="leading-relaxed">
                    {currentLanguage.simpleWhatIsIt}
                  </p>
                </div>

                <div className="bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-900/50 rounded-xl p-4 text-xs text-emerald-950 dark:text-emerald-200 space-y-1">
                  <span className="font-bold flex items-center gap-1.5 text-emerald-800 dark:text-emerald-400">
                    <Zap className="w-4 h-4" />
                    Real-World Superpower:
                  </span>
                  <p className="leading-relaxed">
                    {currentLanguage.realWorldUse}
                  </p>
                </div>
              </div>

              {/* Current Lesson Theory & Real-World Analogy */}
              {currentLesson && (
                <div className="mt-4 p-4 rounded-xl bg-stone-50 dark:bg-stone-800/40 border border-stone-200 dark:border-stone-700 space-y-3">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-amber-500" />
                      <span>Lesson {selectedLessonIndex + 1}: {currentLesson.title}</span>
                    </h3>
                    <div className="flex items-center gap-2 text-xs font-mono">
                      <span className="px-2 py-0.5 rounded bg-stone-200 dark:bg-stone-700 text-stone-700 dark:text-stone-300">
                        {currentLesson.level}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-stone-200 dark:bg-stone-700 text-stone-700 dark:text-stone-300">
                        ⏱️ {currentLesson.duration}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-stone-700 dark:text-stone-300 leading-relaxed">
                    {currentLesson.simpleExplanation}
                  </p>

                  <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-900 dark:text-amber-200">
                    <strong className="block mb-0.5">🧠 Everyday Analogy:</strong>
                    {currentLesson.realWorldAnalogy}
                  </div>

                  {currentLesson.keyPoints && (
                    <div className="space-y-1">
                      <span className="text-[11px] font-bold text-stone-600 dark:text-stone-400 uppercase tracking-wider">
                        Key Rules to Remember:
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-stone-700 dark:text-stone-300">
                        {currentLesson.keyPoints.map((pt, pIdx) => (
                          <div key={pIdx} className="flex items-start gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                            <span>{pt}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Module Completion Toggle Bar */}
                  <div className="pt-3 border-t border-stone-200 dark:border-stone-700/80 flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-stone-500 dark:text-stone-400 font-medium">
                        Module {selectedLessonIndex + 1} Status:
                      </span>
                      <span
                        className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                          completedModules[currentLesson.id]
                            ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300'
                            : 'bg-amber-500/20 text-amber-700 dark:text-amber-300'
                        }`}
                      >
                        {completedModules[currentLesson.id] ? 'Completed ✓' : 'In Progress'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        id={`toggle-lesson-${currentLesson.id}`}
                        onClick={() => handleToggleModuleComplete(currentLesson.id)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xs ${
                          completedModules[currentLesson.id]
                            ? 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-300 dark:border-stone-700 hover:bg-stone-200'
                            : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/20'
                        }`}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>
                          {completedModules[currentLesson.id]
                            ? 'Mark Incomplete'
                            : 'Mark Module Completed (+30 XP)'}
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Celebration Certificate Unlocked Banner when all modules are complete */}
          {isCurrentLangComplete && (
            <div
              id="course-completed-certificate-banner"
              className="bg-gradient-to-r from-amber-500/20 via-orange-500/15 to-emerald-500/20 border-2 border-amber-500/50 rounded-2xl p-5 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-400 text-stone-950 flex items-center justify-center text-2xl shadow-md shrink-0">
                  🎓
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-extrabold text-stone-900 dark:text-white text-base">
                      All Modules Completed for {currentLanguage?.name}!
                    </h4>
                    <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-xs font-bold font-mono">
                      100% Mastered ✓
                    </span>
                  </div>
                  <p className="text-xs text-stone-600 dark:text-stone-300 mt-0.5">
                    Congratulations! You have completed all {currentLangTotalLessons} modules. Your verified Digital Certificate of Excellence is ready to view, customize, and print!
                  </p>
                </div>
              </div>

              <button
                id="claim-course-certificate-cta"
                onClick={() => setCourseSubTab('certificates')}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-stone-950 font-extrabold text-xs sm:text-sm shadow-md shadow-amber-500/30 active:scale-95 transition-all shrink-0"
              >
                <Award className="w-4 h-4" />
                <span>Claim & Generate Digital Certificate 📜</span>
              </button>
            </div>
          )}

          {/* Interactive Code Editor, Live Runner & AI Toolbar */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start min-w-0">
            {/* Left Column: Code Editor & AI Action Toolbar */}
            <div className="lg:col-span-7 space-y-3 min-w-0">
              <div className="bg-slate-950 rounded-2xl border border-slate-800 shadow-xl overflow-hidden">
                {/* Editor Header Bar */}
                <div className="bg-slate-900 px-4 py-3 border-b border-slate-800 flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-red-500/80" />
                      <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                      <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                    </div>
                    <span className="text-xs font-mono text-slate-400 ml-2">
                      main.{selectedLangId === 'python' ? 'py' : selectedLangId === 'javascript' ? 'js' : selectedLangId === 'cpp' ? 'cpp' : selectedLangId === 'c' ? 'c' : selectedLangId === 'java' ? 'java' : selectedLangId === 'html' ? 'html' : 'css'}
                    </span>
                  </div>

                  {/* AI Assistance Quick Actions directly inside the editor toolbar */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <button
                      onClick={() => handleAiAction('explain')}
                      disabled={aiLoading}
                      className="px-2.5 py-1 rounded-lg bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/40 text-xs font-bold flex items-center gap-1 transition-all"
                      title="Explain this code line-by-line"
                    >
                      <Bot className="w-3.5 h-3.5" />
                      <span>Explain</span>
                    </button>

                    <button
                      onClick={() => handleAiAction('debug')}
                      disabled={aiLoading}
                      className="px-2.5 py-1 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/40 text-xs font-bold flex items-center gap-1 transition-all"
                      title="Find bugs or syntax errors"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Debug</span>
                    </button>

                    <button
                      onClick={() => handleAiAction('hint')}
                      disabled={aiLoading}
                      className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold flex items-center gap-1 transition-all"
                      title="Give a smart hint"
                    >
                      <Lightbulb className="w-3.5 h-3.5" />
                      <span>Hint</span>
                    </button>

                    <button
                      onClick={handleCopyCode}
                      className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white transition"
                      title="Copy code"
                    >
                      {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>

                    <button
                      onClick={handleResetCode}
                      className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white transition"
                      title="Reset code"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Textarea Code Editor */}
                <div className="relative">
                  <textarea
                    id="code-editor-input"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    onKeyDown={handleEditorKeyDown}
                    rows={14}
                    spellCheck={false}
                    className="w-full bg-slate-950 text-emerald-400 font-mono text-xs sm:text-sm p-4 leading-relaxed outline-none border-none resize-y selection:bg-indigo-500/40 selection:text-white"
                    placeholder="Write your code here... (Tab key is supported for indentation)"
                  />
                </div>

                {/* Collapsible Standard Input (stdin) Drawer */}
                {showStdin && (
                  <div className="bg-slate-900/95 border-t border-slate-800 p-3 space-y-1.5 animate-fadeIn">
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span className="font-mono flex items-center gap-1 text-amber-300">
                        <Keyboard className="w-3.5 h-3.5" /> Program Input (stdin):
                      </span>
                      <span className="text-[11px] text-slate-500">Fed to input(), cin, Scanner, or stdin streams</span>
                    </div>
                    <textarea
                      value={stdin}
                      onChange={(e) => setStdin(e.target.value)}
                      rows={2}
                      placeholder="Enter inputs here (one per line, e.g. 10 or Alex)..."
                      className="w-full bg-slate-950 text-slate-200 font-mono text-xs p-2 rounded-lg border border-slate-800 outline-none focus:border-amber-500/50 resize-none"
                    />
                  </div>
                )}

                {/* Editor Footer with Run Button */}
                <div className="bg-slate-900 px-4 py-3 border-t border-slate-800 flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setShowStdin(!showStdin)}
                      className={`text-xs px-2.5 py-1 rounded-lg border transition flex items-center gap-1.5 ${
                        showStdin
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 font-bold'
                          : 'bg-slate-800/80 text-slate-400 border-slate-700 hover:text-white'
                      }`}
                      title="Toggle standard input for interactive programs"
                    >
                      <Keyboard className="w-3.5 h-3.5" />
                      <span>{showStdin ? 'Hide Stdin' : 'Custom Input (stdin)'}</span>
                    </button>
                    <span className="hidden sm:inline text-xs text-slate-400">
                      Press <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-[11px] text-slate-300 border border-slate-700">Tab</kbd> to indent
                    </span>
                  </div>

                  <button
                    id="run-code-button"
                    onClick={handleRunCode}
                    disabled={isRunning}
                    className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-95 transition-all disabled:opacity-50"
                  >
                    {isRunning ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Running sandbox...</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 fill-current" />
                        <span>Run Code ⚡</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Student Practice Task */}
              {currentLesson?.practiceTask && (
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3.5 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2.5">
                  <Award className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block">🎯 Hands-on Practice Quest:</span>
                    <p>{currentLesson.practiceTask}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column: Output Console / Live Preview */}
            <div className="lg:col-span-5 space-y-4 min-w-0">
              <div className="bg-slate-950 rounded-2xl border border-slate-800 shadow-xl overflow-hidden flex flex-col h-full min-h-[420px]">
                {/* Output Header */}
                <div className="bg-slate-900 px-4 py-3 border-b border-slate-800 flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-amber-400" />
                    <span className="text-xs font-mono font-bold text-slate-200">
                      {activePlaygroundTab === 'preview' ? 'Live Web Preview Canvas' : 'Execution Output & Terminal'}
                    </span>
                  </div>

                  {/* Header Actions */}
                  <div className="flex items-center gap-2">
                    {/* Toggle between Terminal and HTML preview if HTML/CSS */}
                    {(selectedLangId === 'html' || selectedLangId === 'css') ? (
                      <div className="flex rounded-lg bg-slate-800 p-0.5 text-xs">
                        <button
                          onClick={() => setActivePlaygroundTab('editor')}
                          className={`px-2.5 py-1 rounded font-bold transition flex items-center gap-1 ${
                            activePlaygroundTab === 'editor' ? 'bg-amber-500 text-slate-950' : 'text-slate-400'
                          }`}
                        >
                          <Terminal className="w-3 h-3" /> Terminal
                        </button>
                        <button
                          onClick={() => {
                            setActivePlaygroundTab('preview');
                            setPreviewKey(k => k + 1);
                          }}
                          className={`px-2.5 py-1 rounded font-bold transition flex items-center gap-1 ${
                            activePlaygroundTab === 'preview' ? 'bg-amber-500 text-slate-950' : 'text-slate-400'
                          }`}
                        >
                          <Eye className="w-3 h-3" /> Live Preview
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={handleCopyOutput}
                          disabled={!output}
                          className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white transition disabled:opacity-40"
                          title="Copy terminal output"
                        >
                          {isOutputCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                        <button
                          onClick={() => {
                            setOutput('');
                            setRunStatus('idle');
                          }}
                          disabled={!output}
                          className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white transition disabled:opacity-40"
                          title="Clear output console"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Console Output Display or Live Web Preview */}
                {activePlaygroundTab === 'preview' && (selectedLangId === 'html' || selectedLangId === 'css') ? (
                  <div className="flex-1 p-2 bg-slate-900/50 flex flex-col min-h-[350px]">
                    <div className="flex items-center justify-between px-2 py-1 text-[11px] text-slate-400 border-b border-slate-800 mb-2">
                      <span className="flex items-center gap-1 font-mono">
                        <Eye className="w-3 h-3 text-cyan-400" /> Rendered Document View
                      </span>
                      <button
                        onClick={() => setPreviewKey(k => k + 1)}
                        className="text-slate-400 hover:text-white flex items-center gap-1 text-[11px]"
                      >
                        <RefreshCw className="w-3 h-3" /> Reload Frame
                      </button>
                    </div>
                    <div className="flex-1 bg-white rounded-xl overflow-hidden min-h-[340px] shadow-inner">
                      <iframe
                        key={previewKey}
                        title="HTML/CSS Preview Canvas"
                        srcDoc={getRenderedHtml()}
                        className="w-full h-full min-h-[340px] border-none"
                        sandbox="allow-scripts"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 p-4 font-mono text-xs text-slate-200 overflow-y-auto space-y-2 min-h-[350px]">
                    {output ? (
                      <div className="space-y-3">
                        <pre className={`whitespace-pre-wrap leading-relaxed font-mono p-3 rounded-xl border ${
                          runStatus === 'error'
                            ? 'bg-rose-950/30 border-rose-800/60 text-rose-300'
                            : 'bg-slate-900/60 border-slate-800 text-slate-200'
                        }`}>
                          {output}
                        </pre>
                        {runStatus === 'error' && (
                          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-start gap-2">
                            <Lightbulb className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                            <div>
                              <span className="font-bold block">💡 Code Mentor Tip:</span>
                              <p>Click the <strong>"Debug"</strong> or <strong>"Explain"</strong> buttons in the editor toolbar above to have StudyAce AI pinpoint the exact line and explain how to fix it!</p>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-slate-500 text-center py-16 space-y-2">
                        <Terminal className="w-8 h-8 mx-auto text-slate-600 mb-2" />
                        <p>No execution output yet.</p>
                        <p className="text-[11px] text-slate-600">
                          Click <strong>"Run Code ⚡"</strong> to compile and execute in the sandbox.
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Console Footer */}
                <div className="bg-slate-900/80 px-4 py-2.5 border-t border-slate-800 text-[11px] font-mono text-slate-400 flex items-center justify-between">
                  <span>Runtime: {selectedLangId.toUpperCase()} Sandbox Engine</span>
                  {runStatus === 'success' ? (
                    <span className="text-emerald-400 font-bold flex items-center gap-1">
                      ● Success {lastExecutionTime ? `(${lastExecutionTime}ms)` : ''}
                    </span>
                  ) : runStatus === 'error' ? (
                    <span className="text-rose-400 font-bold flex items-center gap-1">
                      ● Error {lastExecutionTime ? `(${lastExecutionTime}ms)` : ''}
                    </span>
                  ) : (
                    <span className="text-emerald-400">● Ready</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. SUB-TAB: DAILY PROBLEMS & EARN POINTS */}
      {courseSubTab === 'problems' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/10 rounded-2xl p-6 border border-amber-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500 text-stone-950 font-bold text-xs">
                  Daily Challenge Arena
                </span>
                <span className="text-xs text-stone-500 dark:text-stone-400">
                  Solve problems to level up your Coding Rank!
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-stone-900 dark:text-stone-100 font-['Outfit']">
                Today's Programming Quests
              </h2>
              <p className="text-stone-600 dark:text-stone-300 text-sm mt-1">
                Each completed problem awards <strong className="text-amber-600 dark:text-amber-400">+50 to +100 Coding Points</strong> and advances your streak!
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <span className="text-xs text-stone-500 dark:text-stone-400 block font-bold">
                  Problems Completed Today
                </span>
                <span className="text-lg font-mono font-extrabold text-emerald-600 dark:text-emerald-400">
                  {Object.keys(completedChallenges).length} / {challenges.length}
                </span>
              </div>
            </div>
          </div>

          {/* List of Challenges */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {challenges.map((ch) => {
              const isSelected = selectedChallengeId === ch.id;
              const isCompleted = completedChallenges[ch.id];
              return (
                <div
                  key={ch.id}
                  onClick={() => {
                    setSelectedChallengeId(ch.id);
                    setChallengeCode(ch.starterCode);
                    setChallengeResult(null);
                    setActiveHintIndex(null);
                  }}
                  className={`p-5 rounded-2xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-amber-50 dark:bg-amber-950/20 border-amber-500 shadow-md ring-2 ring-amber-500/30'
                      : 'bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800 hover:border-amber-400'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded uppercase bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300">
                      {ch.language}
                    </span>
                    <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                      +{ch.points} XP
                    </span>
                  </div>

                  <h3 className="font-bold text-stone-900 dark:text-stone-100 text-base font-['Outfit'] flex items-center justify-between">
                    <span>{ch.title}</span>
                    {isCompleted && <CheckCircle className="w-5 h-5 text-emerald-500" />}
                  </h3>

                  <p className="text-xs text-stone-600 dark:text-stone-300 mt-2 line-clamp-2 leading-relaxed">
                    {ch.story}
                  </p>

                  <div className="mt-4 pt-3 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between text-xs">
                    <span className="text-stone-500 dark:text-stone-400">
                      Level: <strong className="text-stone-800 dark:text-stone-200">{ch.difficulty}</strong>
                    </span>
                    <span className="font-bold text-amber-600 dark:text-amber-400">
                      {isCompleted ? 'Solved ✓' : 'Solve Now →'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Active Problem Workspace */}
          {currentChallenge && (
            <div className="bg-white dark:bg-stone-900 rounded-2xl p-6 border border-stone-200 dark:border-stone-800 shadow-lg space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stone-200 dark:border-stone-800 pb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300 font-bold text-xs uppercase font-mono">
                      {currentChallenge.language.toUpperCase()} Quest
                    </span>
                    <span className="text-xs text-stone-500">• Worth +{currentChallenge.points} Coding Points</span>
                  </div>
                  <h3 className="text-xl font-extrabold text-stone-900 dark:text-stone-100 font-['Outfit']">
                    {currentChallenge.title}
                  </h3>
                </div>

                <div className="flex items-center gap-2">
                  {currentChallenge.hints && currentChallenge.hints.length > 0 && (
                    <button
                      onClick={() => setActiveHintIndex(prev => prev === null ? 0 : null)}
                      className="px-3 py-1.5 rounded-xl border border-amber-400/50 bg-amber-500/10 text-amber-800 dark:text-amber-300 text-xs font-bold flex items-center gap-1.5 transition"
                    >
                      <Lightbulb className="w-3.5 h-3.5" />
                      <span>{activeHintIndex !== null ? 'Hide Hint' : 'Need a Hint?'}</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Story Context & Problem Requirements */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 space-y-2 text-xs">
                  <span className="font-bold text-stone-800 dark:text-stone-200 flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-indigo-500" />
                    Problem Story & Goal:
                  </span>
                  <p className="text-stone-700 dark:text-stone-300 leading-relaxed">
                    {currentChallenge.story}
                  </p>
                  <p className="font-semibold text-stone-900 dark:text-stone-100 pt-1">
                    Requirement: {currentChallenge.problemStatement}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 space-y-2 text-xs">
                  <span className="font-bold text-stone-800 dark:text-stone-200 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    Expected Target Output:
                  </span>
                  <div className="p-2.5 rounded bg-slate-950 font-mono text-emerald-400 text-xs">
                    {currentChallenge.outputExample}
                  </div>
                  <span className="text-[11px] text-stone-500 dark:text-stone-400 block">
                    Input: {currentChallenge.inputExample}
                  </span>
                </div>
              </div>

              {/* Display Active Hint */}
              {activeHintIndex !== null && currentChallenge.hints && (
                <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200 space-y-1 animate-fadeIn">
                  <span className="font-bold flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    Smart Clue:
                  </span>
                  <p>{currentChallenge.hints[activeHintIndex]}</p>
                </div>
              )}

              {/* Challenge Code Editor */}
              <div className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden">
                <div className="bg-slate-900 px-4 py-2.5 border-b border-slate-800 flex items-center justify-between">
                  <span className="text-xs font-mono text-slate-400">
                    solution.{currentChallenge.language === 'python' ? 'py' : currentChallenge.language === 'javascript' ? 'js' : currentChallenge.language === 'cpp' ? 'cpp' : currentChallenge.language === 'c' ? 'c' : currentChallenge.language === 'java' ? 'java' : 'html'}
                  </span>
                  <button
                    onClick={() => setChallengeCode(currentChallenge.starterCode)}
                    className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
                  >
                    <RotateCcw className="w-3 h-3" /> Reset
                  </button>
                </div>
                <textarea
                  value={challengeCode}
                  onChange={(e) => setChallengeCode(e.target.value)}
                  rows={8}
                  className="w-full bg-slate-950 text-emerald-400 font-mono text-xs sm:text-sm p-4 outline-none border-none resize-y"
                  placeholder="Type your solution code..."
                />
              </div>

              {/* Submit & Evaluation Feedback */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-xs text-stone-500 dark:text-stone-400">
                  {completedChallenges[currentChallenge.id] ? (
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1.5">
                      <CheckCircle className="w-4 h-4" />
                      Quest Completed! You have earned +{currentChallenge.points} Points.
                    </span>
                  ) : (
                    <span>Submit your code to check with the automated test evaluator.</span>
                  )}
                </div>

                <button
                  id="submit-daily-challenge-btn"
                  onClick={handleSubmitChallenge}
                  disabled={isSubmittingChallenge}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 active:scale-95 transition-all disabled:opacity-50"
                >
                  {isSubmittingChallenge ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Checking Solution...</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 fill-current" />
                      <span>Submit Solution & Earn +{currentChallenge.points} Points</span>
                    </>
                  )}
                </button>
              </div>

              {/* Result Banner */}
              {challengeResult && (
                <div
                  className={`p-4 rounded-xl border animate-fadeIn text-xs space-y-1.5 ${
                    challengeResult.passed
                      ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800 text-emerald-950 dark:text-emerald-200'
                      : 'bg-red-50 dark:bg-red-950/30 border-red-300 dark:border-red-800 text-red-950 dark:text-red-200'
                  }`}
                >
                  <div className="flex items-center gap-2 font-bold text-sm">
                    {challengeResult.passed ? (
                      <>
                        <CheckCircle className="w-5 h-5 text-emerald-500" />
                        <span>Success! +{challengeResult.pointsAwarded} Coding Points Awarded! 🎉</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-5 h-5 text-red-500" />
                        <span>Test Failed. Keep trying!</span>
                      </>
                    )}
                  </div>
                  <p>{challengeResult.feedback}</p>
                  <p className="opacity-85">{challengeResult.explanation}</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* 4. SUB-TAB: STREAK CALENDAR FOR COMPUTER COURSES */}
      {courseSubTab === 'streak' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-stone-900 rounded-2xl p-6 border border-stone-200 dark:border-stone-800 shadow-xs space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <span className="px-2.5 py-0.5 rounded-full bg-orange-500/20 text-orange-700 dark:text-orange-400 font-bold text-xs uppercase font-mono">
                  Coding Consistency Engine
                </span>
                <h2 className="text-xl sm:text-2xl font-extrabold text-stone-900 dark:text-stone-100 font-['Outfit'] mt-1">
                  Computer Courses Streak Calendar
                </h2>
                <p className="text-stone-600 dark:text-stone-300 text-sm">
                  Write at least 1 line of code or solve 1 daily problem every day to maintain your streak!
                </p>
              </div>

              {/* Streak claim button */}
              <button
                id="claim-streak-bonus-btn"
                onClick={handleClaimStreakBonus}
                disabled={streakClaimedToday}
                className={`px-5 py-2.5 rounded-xl font-extrabold text-sm flex items-center gap-2 shadow-lg transition-all ${
                  streakClaimedToday
                    ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 cursor-default'
                    : 'bg-gradient-to-r from-orange-500 to-amber-500 text-white hover:from-orange-400 hover:to-amber-400 active:scale-95 shadow-orange-500/20'
                }`}
              >
                <Flame className="w-4 h-4 fill-current" />
                <span>{streakClaimedToday ? 'Today’s Streak Active ✓' : 'Claim Daily Streak (+30 XP)'}</span>
              </button>
            </div>

            {/* Streak Metrics Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700">
                <span className="text-xs text-stone-500 dark:text-stone-400 block font-bold">Current Streak</span>
                <span className="text-2xl font-extrabold text-orange-500 font-mono">
                  {codingStreak} Days
                </span>
              </div>

              <div className="p-4 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700">
                <span className="text-xs text-stone-500 dark:text-stone-400 block font-bold">Longest Streak</span>
                <span className="text-2xl font-extrabold text-indigo-500 font-mono">
                  14 Days
                </span>
              </div>

              <div className="p-4 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700">
                <span className="text-xs text-stone-500 dark:text-stone-400 block font-bold">Quests Solved</span>
                <span className="text-2xl font-extrabold text-emerald-500 font-mono">
                  {Object.keys(completedChallenges).length + 8}
                </span>
              </div>

              <div className="p-4 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700">
                <span className="text-xs text-stone-500 dark:text-stone-400 block font-bold">Consistency Score</span>
                <span className="text-2xl font-extrabold text-amber-500 font-mono">
                  96%
                </span>
              </div>
            </div>

            {/* Monthly Streak Heatmap Matrix */}
            <div className="p-5 rounded-2xl bg-stone-950 text-white space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4 text-orange-400" />
                  <span className="text-sm font-bold font-mono">
                    {new Date().toLocaleString('default', { month: 'long', year: 'numeric' })} Coding Activity
                  </span>
                </div>
                <span className="text-xs text-slate-400">🔥 Flame = Coding Goal Achieved</span>
              </div>

              {/* Day numbers grid */}
              <div className="grid grid-cols-7 gap-2 text-center text-xs font-mono">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                  <div key={d} className="text-slate-500 font-bold py-1">
                    {d}
                  </div>
                ))}

                {/* Simulated days for current month */}
                {Array.from({ length: 31 }, (_, i) => {
                  const dayNum = i + 1;
                  const isCurrentDay = dayNum === new Date().getDate();
                  const isActiveStreak = dayNum <= new Date().getDate() && dayNum >= new Date().getDate() - codingStreak;

                  return (
                    <div
                      key={dayNum}
                      className={`h-12 rounded-xl flex flex-col items-center justify-center border transition-all ${
                        isCurrentDay
                          ? 'border-amber-400 bg-amber-500/20 text-white font-bold ring-2 ring-amber-400/40'
                          : isActiveStreak
                          ? 'border-orange-500/40 bg-orange-500/10 text-orange-300'
                          : 'border-slate-800 bg-slate-900/60 text-slate-500'
                      }`}
                    >
                      <span className="text-[11px]">{dayNum}</span>
                      {isActiveStreak && <Flame className="w-3.5 h-3.5 text-orange-400" />}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Daily Coding Habits Checklist */}
            <div className="p-4 rounded-xl bg-stone-50 dark:bg-stone-800/40 border border-stone-200 dark:border-stone-700 space-y-3">
              <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Today's Coding Goal Progress</span>
              </h3>

              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800">
                  <span className="flex items-center gap-2">
                    <CheckCircle2 className={`w-4 h-4 ${completedGoals.lesson ? 'text-emerald-500' : 'text-stone-400'}`} />
                    <span>Run or review at least 1 programming lesson</span>
                  </span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">+10 XP</span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-lg bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800">
                  <span className="flex items-center gap-2">
                    <CheckCircle2 className={`w-4 h-4 ${completedGoals.challenge ? 'text-emerald-500' : 'text-stone-400'}`} />
                    <span>Complete 1 Daily Coding Quest</span>
                  </span>
                  <span className="font-bold text-amber-600 dark:text-amber-400">+50 XP</span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-lg bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800">
                  <span className="flex items-center gap-2">
                    <CheckCircle2 className={`w-4 h-4 ${completedGoals.aiQuestion ? 'text-emerald-500' : 'text-stone-400'}`} />
                    <span>Ask CodeAce AI a question or debug code</span>
                  </span>
                  <span className="font-bold text-indigo-600 dark:text-indigo-400">+10 XP</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. SUB-TAB: CODEACE AI MENTOR */}
      {courseSubTab === 'aiAssistant' && (
        <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xl overflow-hidden flex flex-col min-h-[550px]">
          {/* AI Header */}
          <div className="bg-slate-900 text-white p-4 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm sm:text-base font-['Outfit'] flex items-center gap-2">
                  <span>CodeAce AI Coding Mentor</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Online
                  </span>
                </h3>
                <p className="text-xs text-slate-400">
                  Mentoring in: <strong className="text-amber-400">{selectedLangId.toUpperCase()}</strong> (Classes 6th–10th)
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleAiAction('explain')}
                className="hidden sm:flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-slate-200 transition"
              >
                <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
                <span>Explain Active Code</span>
              </button>
            </div>
          </div>

          {/* Chat Messages Log */}
          <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4 max-h-[500px]">
            {aiMessages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'ai' && (
                  <div className="w-8 h-8 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0 mt-1">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed space-y-2.5 ${
                    msg.sender === 'user'
                      ? 'bg-amber-500 text-stone-950 font-medium'
                      : 'bg-stone-50 dark:bg-stone-800/80 text-stone-800 dark:text-stone-200 border border-stone-200 dark:border-stone-700'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.text}</p>

                  {/* Relatable Real-World Analogy */}
                  {msg.analogy && (
                    <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900/50 text-xs text-indigo-950 dark:text-indigo-200">
                      <strong className="block mb-0.5 flex items-center gap-1 text-indigo-700 dark:text-indigo-400">
                        <Lightbulb className="w-3.5 h-3.5" /> Real-World Picture:
                      </strong>
                      {msg.analogy}
                    </div>
                  )}

                  {/* Golden Takeaway */}
                  {msg.keyTakeaway && (
                    <div className="p-2.5 rounded-lg bg-amber-500/15 border border-amber-500/30 text-xs text-amber-900 dark:text-amber-200">
                      <strong className="block mb-0.5">🌟 Rule to Remember:</strong>
                      {msg.keyTakeaway}
                    </div>
                  )}

                  {/* Code Snippet if debugging */}
                  {msg.fixedCode && (
                    <div className="p-3 rounded-xl bg-slate-950 text-emerald-400 font-mono text-xs overflow-x-auto">
                      <div className="text-slate-400 text-[10px] mb-1">Fixed Code Snippet:</div>
                      <pre>{msg.fixedCode}</pre>
                    </div>
                  )}

                  <span className="text-[10px] opacity-60 block text-right font-mono">
                    {msg.timestamp}
                  </span>
                </div>
              </div>
            ))}

            {aiLoading && (
              <div className="flex gap-3 justify-start items-center text-xs text-stone-500 dark:text-stone-400">
                <div className="w-8 h-8 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
                  <Bot className="w-4 h-4 animate-bounce" />
                </div>
                <span>CodeAce AI is analyzing your program...</span>
              </div>
            )}
          </div>

          {/* Chat Input Bar */}
          <form
            onSubmit={handleSendAiQuestion}
            className="p-3 bg-stone-50 dark:bg-stone-900/80 border-t border-stone-200 dark:border-stone-800 flex items-center gap-2"
          >
            <input
              type="text"
              value={aiQuestion}
              onChange={(e) => setAiQuestion(e.target.value)}
              placeholder={`Ask CodeAce AI anything about ${selectedLangId.toUpperCase()} (e.g., "What is a loop in Python?" or "How do I center a div?")...`}
              className="flex-1 bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-stone-900 dark:text-stone-100 outline-none focus:ring-2 focus:ring-amber-500"
            />
            <button
              type="submit"
              disabled={!aiQuestion.trim() || aiLoading}
              className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs sm:text-sm flex items-center gap-1.5 transition disabled:opacity-40"
            >
              <Send className="w-4 h-4" />
              <span>Ask</span>
            </button>
          </form>
        </div>
      )}

      {/* 6. SUB-TAB: 30-DAY PROGRESS VISUALIZATION (RECHARTS) */}
      {courseSubTab === 'progress' && (
        <CodingProgressChart
          currentLanguage={selectedLangId}
          codingStreak={codingStreak}
          totalPoints={userDailyPoints + 450}
        />
      )}

      {/* 7. SUB-TAB: GLOBAL LEADERBOARD (DAILY PROBLEMS SOLVERS) */}
      {courseSubTab === 'leaderboard' && (
        <CodingLeaderboard
          userDailyPoints={userDailyPoints}
          userSolvedCount={userDailySolvedCount}
          userStreak={codingStreak}
          onNavigateToProblems={() => setCourseSubTab('problems')}
        />
      )}

      {/* 8. SUB-TAB: DIGITAL CERTIFICATE GENERATOR */}
      {courseSubTab === 'certificates' && (
        <CodingCertificateGenerator
          completedModules={completedModules}
          languages={languages}
          initialLanguage={selectedLangId}
          onCompleteModule={handleToggleModuleComplete}
          onCompleteAllModulesForLanguage={handleCompleteAllModulesForLanguage}
        />
      )}
    </div>
  );
};
