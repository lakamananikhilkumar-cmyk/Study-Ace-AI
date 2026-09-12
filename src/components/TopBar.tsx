import React from 'react';
import {
  Menu,
  Sun,
  Moon,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Flame,
  Award,
  Bell,
  IdCard,
  User,
  Newspaper
} from 'lucide-react';
import { useApp } from '../context/AppContext';

interface TopBarProps {
  onOpenProfile: () => void;
  onOpenBadges: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({ onOpenProfile, onOpenBadges }) => {
  const {
    theme,
    toggleTheme,
    toggleSidebar,
    activeTab,
    setActiveTab,
    profile,
    studyTimerMinutes,
    isTimerRunning,
    startTimer,
    pauseTimer,
    resetTimer,
    alarms
  } = useApp();

  const enabledAlarms = alarms.filter(a => a.enabled).length;

  const tabTitles: Record<string, { title: string; subtitle: string }> = {
    dashboard: { title: 'Student Dashboard', subtitle: 'Overview & Daily Missions' },
    tutor: { title: 'AI Personal Tutor', subtitle: 'Step-by-step Explanations & Voice Learning' },
    planner: { title: 'Smart Study Planner', subtitle: 'AI Timetable & Missed Task Auto-Adjust' },
    rescue: { title: 'Exam Rescue Mode (SOS)', subtitle: 'High-Yield 80/20 Crash Plan' },
    quiz: { title: 'Notes → AI Quiz & Cards', subtitle: 'MCQs, Written Scoring & Flashcards' },
    weakTopics: { title: 'Weak Topic Detector', subtitle: 'Diagnostic Analytics & Next Steps' },
    revision: { title: 'Spaced Revision Hub', subtitle: 'Ebbinghaus Forgetting Curve Schedule' },
    focus: { title: 'Deep Focus Room', subtitle: 'Concentrated Study & Ambient Sound Synthesizer' },
    calendar: { title: 'Streak & Activity Calendar', subtitle: 'Daily Attendance & Study Consistency' },
    alarms: { title: 'Study Reminders & Alarms', subtitle: 'Scheduled Alert Chimes for Dedicated Focus' },
    techNews: { title: 'Daily Tech News Updates', subtitle: 'Inspiring STEM & Computing Breakthroughs Every Day' },
    computerCourses: { title: 'Computer Courses & Programming', subtitle: 'HTML, CSS, Python, Java, JS, C++, C & CodeAce AI Mentor' }
  };

  const activeMeta = tabTitles[activeTab] || { title: 'StudyAce AI', subtitle: 'Smart Learning' };

  // Calculate XP progress to next level
  const nextLevelXP = profile.levelRank * 150;
  const currentLevelBaseXP = (profile.levelRank - 1) * 150;
  const progressPercent = Math.min(
    100,
    Math.max(0, Math.round(((profile.xp - currentLevelBaseXP) / (nextLevelXP - currentLevelBaseXP)) * 100))
  );

  return (
    <header className="sticky top-0 z-30 bg-stone-100/90 dark:bg-stone-900/90 backdrop-blur border-b border-stone-200 dark:border-stone-800 transition-colors duration-200">
      <div className="px-4 lg:px-6 h-16 flex items-center justify-between gap-4">
        {/* Left: Sidebar Toggle & Page Title */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            id="topbar-sidebar-toggle"
            onClick={toggleSidebar}
            className="w-10 h-10 rounded-xl flex items-center justify-center text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-800 transition-colors"
            title="Toggle Sidebar Menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="min-w-0">
            <h1 className="text-base font-bold text-stone-900 dark:text-stone-100 tracking-tight truncate flex items-center gap-2">
              <span>{activeMeta.title}</span>
              {activeTab === 'rescue' && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500 text-white font-black uppercase tracking-wider animate-pulse">
                  SOS
                </span>
              )}
            </h1>
            <p className="hidden sm:block text-xs text-stone-500 dark:text-stone-400 truncate">
              {activeMeta.subtitle}
            </p>
          </div>
        </div>

        {/* Right: Stopwatch, Streaks, Alarms, Dark Mode, Profile */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Study Stopwatch Widget */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-stone-200/80 dark:bg-stone-800/80 border border-stone-300 dark:border-stone-700 text-xs font-mono">
            <div className="flex items-center gap-1.5 text-stone-800 dark:text-stone-200">
              <span className={`w-2 h-2 rounded-full ${isTimerRunning ? 'bg-emerald-500 animate-pulse' : 'bg-stone-400'}`} />
              <span className="font-semibold">{studyTimerMinutes}m session</span>
            </div>
            <div className="flex items-center gap-1 border-l border-stone-300 dark:border-stone-700 pl-2">
              {!isTimerRunning ? (
                <button
                  id="topbar-timer-start"
                  onClick={startTimer}
                  className="p-1 text-emerald-600 dark:text-emerald-400 hover:bg-stone-300 dark:hover:bg-stone-700 rounded transition"
                  title="Start study timer"
                >
                  <Play className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  id="topbar-timer-pause"
                  onClick={pauseTimer}
                  className="p-1 text-amber-600 dark:text-amber-400 hover:bg-stone-300 dark:hover:bg-stone-700 rounded transition"
                  title="Pause study timer"
                >
                  <Pause className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                id="topbar-timer-reset"
                onClick={resetTimer}
                className="p-1 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 hover:bg-stone-300 dark:hover:bg-stone-700 rounded transition"
                title="Reset timer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Streak pill (clicks to calendar) */}
          <button
            id="topbar-streak-button"
            onClick={() => setActiveTab('calendar')}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-orange-500/10 dark:bg-orange-500/15 border border-orange-500/30 text-orange-700 dark:text-orange-400 text-xs font-bold hover:bg-orange-500/20 transition"
            title="View Daily Streak Calendar"
          >
            <Flame className="w-4 h-4 text-orange-500 animate-bounce" />
            <span>{profile.streak} Days</span>
          </button>

          {/* XP & Level Button */}
          <button
            id="topbar-xp-button"
            onClick={onOpenBadges}
            className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/30 text-xs text-stone-800 dark:text-stone-100 hover:bg-amber-500/20 transition group"
            title="View Level & Badges"
          >
            <Award className="w-4 h-4 text-amber-500 group-hover:scale-110 transition-transform" />
            <div className="flex flex-col text-left">
              <div className="flex items-center gap-1.5 leading-none">
                <span className="font-bold text-amber-600 dark:text-amber-400">{profile.xp} XP</span>
                <span className="text-[10px] text-stone-500 dark:text-stone-400">Lvl {profile.levelRank}</span>
              </div>
              <div className="w-16 h-1 bg-stone-300 dark:bg-stone-700 rounded-full mt-1 overflow-hidden">
                <div
                  className="h-full bg-amber-500 rounded-full"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          </button>

          {/* Tech News Section Shortcut */}
          <button
            id="topbar-technews-button"
            onClick={() => setActiveTab('techNews')}
            className={`relative p-2 rounded-xl transition flex items-center gap-1.5 text-xs font-semibold ${
              activeTab === 'techNews'
                ? 'bg-amber-500 text-stone-950 font-bold'
                : 'text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-800'
            }`}
            title="Open Daily Tech News Section"
          >
            <Newspaper className="w-5 h-5" />
            <span className="hidden xl:inline">Tech News</span>
          </button>

          {/* Study Alarms Shortcut */}
          <button
            id="topbar-alarms-button"
            onClick={() => setActiveTab('alarms')}
            className="relative p-2 rounded-xl text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-800 transition"
            title="Study Alarms & Reminders"
          >
            <Bell className="w-5 h-5" />
            {enabledAlarms > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-amber-500 ring-2 ring-stone-100 dark:ring-stone-900" />
            )}
          </button>

          {/* Dark Mode Quick Toggle */}
          <button
            id="topbar-theme-toggle"
            onClick={toggleTheme}
            className="p-2 rounded-xl text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-800 transition"
            title={theme === 'light' ? 'Switch to Dark Mode (Late-Night Study)' : 'Switch to Light Mode'}
          >
            {theme === 'light' ? (
              <Moon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            ) : (
              <Sun className="w-5 h-5 text-amber-400" />
            )}
          </button>

          {/* Student Profile Pill */}
          <button
            id="topbar-profile-button"
            onClick={onOpenProfile}
            className="flex items-center gap-2 pl-2 pr-2.5 py-1 rounded-xl bg-stone-200 dark:bg-stone-800 hover:bg-stone-300 dark:hover:bg-stone-700 transition border border-stone-300/80 dark:border-stone-700"
            title="Student Profile & ID Card"
          >
            <span className="text-lg">{profile.avatar || '👨‍🎓'}</span>
            <div className="hidden lg:flex flex-col text-left">
              <span className="text-xs font-bold text-stone-900 dark:text-stone-100 leading-tight">
                {profile.name.split(' ')[0]}
              </span>
              <span className="text-[10px] text-stone-500 dark:text-stone-400 flex items-center gap-0.5">
                <IdCard className="w-3 h-3 inline text-amber-500" />
                {profile.rollNumber || '48291'}
              </span>
            </div>
          </button>
        </div>
      </div>
    </header>
  );
};
