import React from 'react';
import {
  Sparkles,
  Flame,
  Award,
  Clock,
  Play,
  Pause,
  RotateCcw,
  User,
  LayoutDashboard,
  Bot,
  Calendar,
  ShieldAlert,
  FileQuestion,
  Activity,
  RefreshCw
} from 'lucide-react';
import { useApp } from '../context/AppContext';

interface NavbarProps {
  onOpenProfileModal: () => void;
  onOpenBadgeModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenProfileModal,
  onOpenBadgeModal
}) => {
  const {
    profile,
    activeTab,
    setActiveTab,
    studyTimerMinutes,
    isTimerRunning,
    startTimer,
    pauseTimer,
    resetTimer
  } = useApp();

  const nextLevelXP = profile.levelRank * 150;
  const currentLevelBaseXP = (profile.levelRank - 1) * 150;
  const progressPercent = Math.min(
    100,
    Math.max(0, Math.round(((profile.xp - currentLevelBaseXP) / (nextLevelXP - currentLevelBaseXP)) * 100))
  );

  interface NavItem {
    id: 'dashboard' | 'tutor' | 'planner' | 'rescue' | 'quiz' | 'weakTopics' | 'revision';
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    highlight?: boolean;
  }

  const navItems: NavItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'tutor', label: 'AI Tutor & Voice', icon: Bot },
    { id: 'planner', label: 'Smart Planner', icon: Calendar },
    { id: 'rescue', label: 'Exam Rescue Mode', icon: ShieldAlert, highlight: true },
    { id: 'quiz', label: 'Notes → AI Quiz', icon: FileQuestion },
    { id: 'weakTopics', label: 'Weak Topics', icon: Activity },
    { id: 'revision', label: 'Spaced Revision', icon: RefreshCw },
  ];

  return (
    <header className="sticky top-0 z-40 bg-stone-900 text-stone-100 border-b border-stone-800 shadow-md">
      {/* Top Utility Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3">
        {/* Brand & Grade */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 font-bold text-lg shadow-inner">
            ⚡
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold tracking-tight text-white text-base sm:text-lg font-['Outfit']">
                StudyAce AI
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                {profile.classGrade} ({profile.board})
              </span>
            </div>
            <p className="text-[11px] text-stone-400 hidden sm:block">
              Classes 6th–10th Smart Learning Companion
            </p>
          </div>
        </div>

        {/* Live Study Timer & Gamification Stats */}
        <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
          {/* Study Stopwatch Widget */}
          <div className="flex items-center gap-1.5 bg-stone-800/80 px-2.5 py-1 rounded-lg border border-stone-700/60 text-xs">
            <Clock className="w-3.5 h-3.5 text-stone-400" />
            <span className="font-mono font-medium text-stone-200">
              {studyTimerMinutes}m studied
            </span>
            {isTimerRunning ? (
              <button
                onClick={pauseTimer}
                title="Pause study timer"
                className="p-1 hover:bg-stone-700 rounded text-amber-400 transition"
              >
                <Pause className="w-3 h-3" />
              </button>
            ) : (
              <button
                onClick={startTimer}
                title="Start study timer"
                className="p-1 hover:bg-stone-700 rounded text-emerald-400 transition"
              >
                <Play className="w-3 h-3" />
              </button>
            )}
            <button
              onClick={resetTimer}
              title="Reset timer"
              className="p-1 hover:bg-stone-700 rounded text-stone-400 hover:text-stone-200 transition"
            >
              <RotateCcw className="w-2.5 h-2.5" />
            </button>
          </div>

          {/* Streak Flame */}
          <div
            title={`${profile.streak} day consecutive study streak!`}
            className="flex items-center gap-1 bg-amber-950/40 border border-amber-600/40 text-amber-300 px-2.5 py-1 rounded-lg text-xs font-semibold"
          >
            <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500 animate-pulse" />
            <span>{profile.streak} Days</span>
          </div>

          {/* XP & Level Indicator */}
          <div
            onClick={onOpenBadgeModal}
            className="cursor-pointer group flex items-center gap-2 bg-stone-800/90 border border-stone-700 hover:border-amber-500/50 px-2.5 py-1 rounded-lg transition"
            title="Click to view Badges & XP"
          >
            <Award className="w-3.5 h-3.5 text-amber-400" />
            <div className="flex flex-col">
              <div className="flex items-center gap-1 text-xs">
                <span className="font-bold text-amber-300">Lvl {profile.levelRank}</span>
                <span className="text-[10px] text-stone-400">({profile.xp} XP)</span>
              </div>
              <div className="w-16 h-1 bg-stone-700 rounded-full overflow-hidden mt-0.5">
                <div
                  className="h-full bg-amber-400 transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          </div>

          {/* Student Profile Switcher Avatar */}
          <button
            onClick={onOpenProfileModal}
            className="flex items-center gap-2 bg-stone-800 hover:bg-stone-700 text-stone-200 px-2.5 py-1 rounded-lg border border-stone-700 transition text-xs font-medium"
            title="Switch student profile or update syllabus"
          >
            <span className="text-base">{profile.avatar || '👨‍🎓'}</span>
            <span className="hidden md:inline max-w-[100px] truncate">{profile.name}</span>
            <User className="w-3 h-3 text-stone-400" />
          </button>
        </div>
      </div>

      {/* Primary Navigation Tabs */}
      <div className="bg-stone-950/90 border-t border-stone-800/80 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex items-center gap-1 overflow-x-auto py-1.5 scrollbar-none">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap transition-all ${
                  isActive
                    ? item.highlight
                      ? 'bg-rose-500 text-white shadow-sm font-semibold'
                      : 'bg-amber-500 text-stone-950 shadow-sm font-semibold'
                    : item.highlight
                    ? 'text-rose-400 hover:bg-rose-950/40 hover:text-rose-300 border border-rose-800/40'
                    : 'text-stone-300 hover:bg-stone-800/80 hover:text-stone-100'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? (item.highlight ? 'text-white' : 'text-stone-950') : ''}`} />
                <span>{item.label}</span>
                {item.highlight && !isActive && (
                  <span className="px-1.5 py-0.2 text-[9px] font-bold bg-rose-500/20 text-rose-300 rounded uppercase">
                    SOS
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
