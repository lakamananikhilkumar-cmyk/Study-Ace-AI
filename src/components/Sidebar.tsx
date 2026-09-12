import React from 'react';
import {
  LayoutDashboard,
  Bot,
  Calendar,
  ShieldAlert,
  FileQuestion,
  Activity,
  RefreshCw,
  Zap,
  CalendarDays,
  Bell,
  Sun,
  Moon,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Award,
  IdCard,
  Newspaper,
  Code2
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { NavTab } from '../types';

interface SidebarProps {
  onOpenProfile: () => void;
  onOpenBadges: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onOpenProfile, onOpenBadges }) => {
  const {
    theme,
    toggleTheme,
    isSidebarOpen,
    toggleSidebar,
    activeTab,
    setActiveTab,
    profile,
    logout,
    alarms
  } = useApp();

  const enabledAlarmsCount = alarms.filter(a => a.enabled).length;

  const navGroups: {
    title: string;
    items: {
      id: NavTab;
      label: string;
      icon: React.ComponentType<{ className?: string }>;
      badge?: string | number;
      highlight?: boolean;
    }[];
  }[] = [
    {
      title: 'CORE LEARNING',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'computerCourses', label: 'Computer Courses', icon: Code2, badge: 'NEW', highlight: true },
        { id: 'tutor', label: 'AI Tutor & Voice', icon: Bot },
        { id: 'techNews', label: 'Tech News', icon: Newspaper, badge: 'Daily' },
        { id: 'planner', label: 'Smart Planner', icon: Calendar },
        { id: 'rescue', label: 'Exam Rescue (SOS)', icon: ShieldAlert, highlight: true }
      ]
    },
    {
      title: 'PRACTICE & MASTERY',
      items: [
        { id: 'quiz', label: 'Notes → AI Quiz', icon: FileQuestion },
        { id: 'weakTopics', label: 'Weak Topic Scan', icon: Activity },
        { id: 'revision', label: 'Spaced Revision', icon: RefreshCw }
      ]
    },
    {
      title: 'PRODUCTIVITY & HABITS',
      items: [
        { id: 'focus', label: 'Deep Focus Room', icon: Zap },
        { id: 'calendar', label: 'Streak Calendar', icon: CalendarDays },
        {
          id: 'alarms',
          label: 'Study Alarms',
          icon: Bell,
          badge: enabledAlarmsCount > 0 ? enabledAlarmsCount : undefined
        }
      ]
    }
  ];

  const handleNavSelect = (tabId: NavTab) => {
    setActiveTab(tabId);
    if (typeof window !== 'undefined' && window.innerWidth < 1024 && isSidebarOpen) {
      toggleSidebar();
    }
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isSidebarOpen && (
        <div
          id="sidebar-mobile-backdrop"
          onClick={toggleSidebar}
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside
        id="main-sidebar"
        className={`fixed lg:static top-0 left-0 bottom-0 z-50 lg:z-auto flex flex-col bg-stone-900 dark:bg-stone-950 text-stone-200 border-r border-stone-800 transition-all duration-300 shadow-2xl lg:shadow-none h-screen shrink-0 ${
          isSidebarOpen ? 'w-64 translate-x-0' : 'w-20 -translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 px-4 flex items-center justify-between border-b border-stone-800 bg-stone-900/90 dark:bg-stone-950/90 backdrop-blur shrink-0">
          <div
            onClick={() => handleNavSelect('dashboard')}
            className="flex items-center gap-3 cursor-pointer select-none overflow-hidden"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-400 flex items-center justify-center text-stone-950 shadow-md shadow-amber-500/20 shrink-0">
              <Sparkles className="w-5 h-5 text-stone-950" />
            </div>
            {isSidebarOpen && (
              <div className="flex flex-col">
                <span className="font-bold text-lg tracking-tight text-stone-100 flex items-center gap-1">
                  Study<span className="text-amber-400">Ace</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-400/20 text-amber-300 font-semibold uppercase">
                    AI
                  </span>
                </span>
                <span className="text-[10px] text-stone-400 font-medium">Classes 6–10 Smart Hub</span>
              </div>
            )}
          </div>

          {/* Desktop Collapse Toggle */}
          <button
            id="sidebar-collapse-toggle"
            onClick={toggleSidebar}
            title={isSidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
            className="hidden lg:flex w-7 h-7 rounded-lg items-center justify-center text-stone-400 hover:text-stone-100 hover:bg-stone-800 transition-colors"
          >
            {isSidebarOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
        </div>

        {/* Student Mini Profile Card */}
        <div className="p-3 border-b border-stone-800/80 bg-stone-900/50">
          <div
            onClick={onOpenProfile}
            className={`flex items-center gap-3 p-2 rounded-xl hover:bg-stone-800/70 transition cursor-pointer border border-stone-800/40 ${
              !isSidebarOpen && 'justify-center'
            }`}
            title="Click to view & edit student profile"
          >
            <div className="w-10 h-10 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-xl shrink-0">
              {profile.avatar || '👨‍🎓'}
            </div>
            {isSidebarOpen && (
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-stone-100 truncate">{profile.name}</h4>
                  <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold">
                    Lvl {profile.levelRank}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 mt-0.5 text-[10px] text-stone-400">
                  <span className="font-medium text-amber-300">{profile.classGrade}</span>
                  <span>•</span>
                  <span className="truncate flex items-center gap-0.5 text-stone-300">
                    <IdCard className="w-3 h-3 text-stone-400 inline" />
                    Roll: <strong className="text-white">{profile.rollNumber || '48291'}</strong>
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6 custom-scrollbar">
          {navGroups.map((group, gIdx) => (
            <div key={gIdx} className="space-y-1">
              {isSidebarOpen && (
                <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-stone-300 mb-1.5">
                  {group.title}
                </p>
              )}
              {group.items.map(item => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    id={`sidebar-nav-${item.id}`}
                    onClick={() => handleNavSelect(item.id as NavTab)}
                    title={!isSidebarOpen ? item.label : undefined}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group relative ${
                      isActive
                        ? item.highlight
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-sm'
                          : 'bg-amber-500/15 text-amber-300 border border-amber-500/30 font-semibold'
                        : item.highlight
                        ? 'text-rose-400 hover:bg-rose-500/10 hover:text-rose-300'
                        : 'text-stone-300 hover:bg-stone-800/60 hover:text-stone-100'
                    } ${!isSidebarOpen ? 'justify-center px-2' : ''}`}
                  >
                    <Icon
                      className={`w-5 h-5 shrink-0 transition-transform group-hover:scale-110 ${
                        isActive
                          ? item.highlight
                            ? 'text-rose-400'
                            : 'text-amber-400'
                          : item.highlight
                          ? 'text-rose-400'
                          : 'text-stone-400 group-hover:text-stone-200'
                      }`}
                    />
                    {isSidebarOpen && (
                      <span className="flex-1 text-left truncate">{item.label}</span>
                    )}

                    {/* Badge */}
                    {item.badge !== undefined && isSidebarOpen && (
                      <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-amber-500 text-stone-950">
                        {item.badge}
                      </span>
                    )}

                    {/* SOS Pulse Dot */}
                    {item.highlight && (
                      <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping absolute right-2" />
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* Footer Actions */}
        <div className="p-3 border-t border-stone-800 bg-stone-900/60 dark:bg-stone-950 space-y-2">
          {/* Dark / Light Mode Toggle */}
          <button
            id="theme-toggle-button"
            onClick={toggleTheme}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-stone-300 hover:text-stone-100 hover:bg-stone-800 transition ${
              !isSidebarOpen ? 'justify-center px-2' : ''
            }`}
            title={`Switch to ${theme === 'light' ? 'Dark Mode (Late Night Study)' : 'Light Mode'}`}
          >
            {theme === 'light' ? (
              <Moon className="w-4 h-4 text-indigo-400 shrink-0" />
            ) : (
              <Sun className="w-4 h-4 text-amber-400 shrink-0" />
            )}
            {isSidebarOpen && (
              <div className="flex-1 flex items-center justify-between">
                <span>{theme === 'light' ? 'Night Study Mode' : 'Light Mode'}</span>
                <span className="text-[10px] uppercase font-bold text-stone-300 px-1.5 py-0.5 rounded bg-stone-800">
                  {theme}
                </span>
              </div>
            )}
          </button>

          {/* Gamification Badges modal shortcut */}
          <button
            id="sidebar-badges-button"
            onClick={onOpenBadges}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-stone-300 hover:text-amber-300 hover:bg-stone-800/80 transition ${
              !isSidebarOpen ? 'justify-center px-2' : ''
            }`}
            title="View XP & Badges"
          >
            <Award className="w-4 h-4 text-amber-400 shrink-0" />
            {isSidebarOpen && (
              <div className="flex-1 flex items-center justify-between">
                <span>XP & Badges</span>
                <span className="text-[10px] font-bold text-amber-400">{profile.xp} XP</span>
              </div>
            )}
          </button>

          {/* Logout button */}
          <button
            id="sidebar-logout-button"
            onClick={logout}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-stone-300 hover:text-rose-300 hover:bg-rose-500/10 transition ${
              !isSidebarOpen ? 'justify-center px-2' : ''
            }`}
            title="Sign out from student account"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            {isSidebarOpen && <span>Sign Out</span>}
          </button>
        </div>
      </aside>
    </>
  );
};
