import React from 'react';
import {
  Flame,
  Clock,
  Award,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  RefreshCw,
  BookOpen,
  Zap,
  Target,
  FileQuestion,
  Bot,
  ShieldAlert,
  Code2
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const DashboardView: React.FC = () => {
  const {
    profile,
    studyPlan,
    toggleSlotCompleted,
    quizHistory,
    weakTopics,
    spacedRevisions,
    dailyMissions,
    setActiveTab,
    startTimer,
    isTimerRunning
  } = useApp();

  // Compute metrics
  const avgQuizScore = quizHistory.length
    ? Math.round(quizHistory.reduce((acc, curr) => acc + curr.scorePercent, 0) / quizHistory.length)
    : 80;

  const criticalWeakCount = weakTopics.filter(w => w.status === 'critical').length;
  const dueRevisions = spacedRevisions.filter(r => r.isDueToday);

  // Today's schedule slots
  const todaySchedule = studyPlan?.dailySchedule?.[0];
  const todayCompletedSlots = todaySchedule?.slots?.filter(s => s.completed).length || 0;
  const todayTotalSlots = todaySchedule?.slots?.length || 0;

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 py-6 text-stone-800">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-stone-900 via-stone-850 to-stone-900 rounded-2xl p-6 text-white border border-stone-800 shadow-sm relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-2xl">{profile.avatar}</span>
              <h1 className="text-2xl font-bold font-['Outfit'] tracking-tight text-white">
                Welcome back, {profile.name}!
              </h1>
            </div>
            <p className="text-stone-300 text-sm max-w-2xl">
              Targeting <span className="font-semibold text-amber-300">{profile.targetExamName || 'Final Exams'}</span> ({profile.classGrade}, {profile.board}).
              Learning Level is set to <span className="capitalize text-amber-300 font-semibold">{profile.level}</span>.
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={() => setActiveTab('computerCourses')}
              className="flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white font-bold px-4 py-2.5 rounded-xl text-sm transition shadow-md shadow-indigo-500/20 active:scale-95"
            >
              <Code2 className="w-4 h-4" />
              <span>Computer Courses 💻</span>
            </button>
            <button
              onClick={() => setActiveTab('tutor')}
              className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold px-4 py-2.5 rounded-xl text-sm transition shadow-sm"
            >
              <Bot className="w-4 h-4" />
              <span>Ask AI Tutor</span>
            </button>
            <button
              onClick={() => setActiveTab('rescue')}
              className="flex items-center gap-2 bg-rose-600 hover:bg-rose-500 text-white font-semibold px-4 py-2.5 rounded-xl text-sm transition border border-rose-500/40"
            >
              <ShieldAlert className="w-4 h-4" />
              <span>Exam Rescue SOS</span>
            </button>
          </div>
        </div>
      </div>

      {/* Featured Computer Courses Interactive Banner */}
      <div 
        onClick={() => setActiveTab('computerCourses')}
        className="cursor-pointer bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-900 text-white rounded-2xl p-5 sm:p-6 border border-indigo-500/40 hover:border-indigo-400 shadow-lg hover:shadow-indigo-500/20 transition-all group relative overflow-hidden"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/30 text-indigo-300 font-bold text-xs uppercase tracking-wider font-mono border border-indigo-400/30">
                ★ Newly Added Section
              </span>
              <span className="text-xs text-amber-400 font-bold flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" /> HTML • CSS • Python • Java • JS • C++ • C
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight font-['Outfit'] group-hover:text-indigo-200 transition-colors">
              Computer Courses & CodeAce AI Mentor 🚀
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm max-w-2xl leading-relaxed">
              Step into our attractive coding academy with live code runners, daily problems to earn points, streak calendar, and AI code assistance.
            </p>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              setActiveTab('computerCourses');
            }}
            className="self-start md:self-auto inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-extrabold text-xs sm:text-sm shadow-md transition group-hover:scale-105"
          >
            <span>Start Learning Courses</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Spaced Revision Alert (if due) */}
      {dueRevisions.length > 0 && (
        <div className="bg-amber-50 border border-amber-200/80 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 text-amber-800 rounded-lg">
              <RefreshCw className="w-5 h-5 animate-spin-slow" />
            </div>
            <div>
              <h3 className="font-bold text-amber-950 text-sm">
                Spaced Revision Due Today ({dueRevisions.length} topics)
              </h3>
              <p className="text-xs text-amber-800">
                Scientifically timed reviews for maximum retention: {dueRevisions.map(r => r.topic).join(', ')}.
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveTab('revision')}
            className="flex items-center gap-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition"
          >
            <span>Review Now (+30 XP)</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 4 Core Vital Stat Tiles */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Study Hours */}
        <div className="bg-white rounded-xl p-4 border border-stone-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Study Time</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div>
            <div className="text-2xl font-black text-stone-900 font-['Outfit']">
              {(profile.totalStudyMinutes / 60).toFixed(1)} <span className="text-sm font-normal text-stone-500">hrs</span>
            </div>
            <p className="text-xs text-stone-500 mt-0.5">
              Goal: {profile.dailyStudyHours} hrs / day
            </p>
          </div>
          <div className="mt-3 pt-2 border-t border-stone-100 flex items-center justify-between text-[11px]">
            <span className="text-stone-500">Timer status</span>
            <span className={`font-semibold ${isTimerRunning ? 'text-emerald-600' : 'text-stone-400'}`}>
              {isTimerRunning ? 'Active (Counting)' : 'Paused'}
            </span>
          </div>
        </div>

        {/* Study Streak */}
        <div className="bg-white rounded-xl p-4 border border-stone-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Streak</span>
            <Flame className="w-4 h-4 text-orange-500" />
          </div>
          <div>
            <div className="text-2xl font-black text-stone-900 font-['Outfit'] flex items-center gap-1.5">
              <span>{profile.streak}</span>
              <span className="text-sm font-normal text-stone-500">days active</span>
            </div>
            <p className="text-xs text-stone-500 mt-0.5">
              Keep going to earn 7-Day Badge!
            </p>
          </div>
          <div className="mt-3 pt-2 border-t border-stone-100 text-[11px] text-orange-600 font-medium">
            🔥 Next Milestone: 7 Days (+50 XP)
          </div>
        </div>

        {/* Quiz Mastery Score */}
        <div className="bg-white rounded-xl p-4 border border-stone-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Quiz Accuracy</span>
            <Award className="w-4 h-4 text-indigo-600" />
          </div>
          <div>
            <div className="text-2xl font-black text-stone-900 font-['Outfit']">
              {avgQuizScore}%
            </div>
            <p className="text-xs text-stone-500 mt-0.5">
              Across {quizHistory.length} quiz assessments
            </p>
          </div>
          <div className="mt-3 pt-2 border-t border-stone-100 text-[11px] text-stone-500">
            Level: <span className="font-semibold text-stone-800 capitalize">{profile.level}</span>
          </div>
        </div>

        {/* Weak Topics Alert */}
        <div
          onClick={() => setActiveTab('weakTopics')}
          className="bg-white rounded-xl p-4 border border-stone-200 hover:border-rose-300 shadow-xs flex flex-col justify-between cursor-pointer transition group"
        >
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Weak Areas</span>
            <AlertTriangle className={`w-4 h-4 ${criticalWeakCount > 0 ? 'text-rose-500' : 'text-stone-400'}`} />
          </div>
          <div>
            <div className="text-2xl font-black text-stone-900 font-['Outfit'] flex items-center gap-2">
              <span className={criticalWeakCount > 0 ? 'text-rose-600' : 'text-emerald-600'}>
                {criticalWeakCount}
              </span>
              <span className="text-sm font-normal text-stone-500">critical</span>
            </div>
            <p className="text-xs text-stone-500 mt-0.5">
              {weakTopics.length} total monitored topics
            </p>
          </div>
          <div className="mt-3 pt-2 border-t border-stone-100 text-[11px] text-rose-600 font-medium group-hover:underline flex items-center justify-between">
            <span>Fix weak topics</span>
            <ArrowRight className="w-3 h-3" />
          </div>
        </div>
      </div>

      {/* Middle Layout: Today's Schedule & Daily Missions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Study Schedule (2 columns) */}
        <div className="lg:col-span-2 bg-white rounded-xl p-5 border border-stone-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-amber-600" />
              <h2 className="text-base font-bold text-stone-900 font-['Outfit']">
                Today's Study Timetable ({todayCompletedSlots}/{todayTotalSlots} Completed)
              </h2>
            </div>
            <button
              onClick={() => setActiveTab('planner')}
              className="text-xs font-semibold text-amber-700 hover:text-amber-800 flex items-center gap-1"
            >
              <span>View Full Plan</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-stone-100 h-2 rounded-full overflow-hidden">
            <div
              className="bg-amber-500 h-full transition-all duration-300"
              style={{ width: `${todayTotalSlots ? (todayCompletedSlots / todayTotalSlots) * 100 : 0}%` }}
            />
          </div>

          {/* Slots List */}
          <div className="space-y-2.5">
            {todaySchedule?.slots?.map((slot) => (
              <div
                key={slot.id}
                onClick={() => toggleSlotCompleted(todaySchedule.id, slot.id)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start justify-between gap-3 ${
                  slot.completed
                    ? 'bg-stone-50 border-stone-200 opacity-75'
                    : 'bg-white border-stone-200 hover:border-amber-400 shadow-xs'
                }`}
              >
                <div className="flex items-start gap-3">
                  <button
                    className={`mt-0.5 w-5 h-5 rounded-md flex items-center justify-center border transition ${
                      slot.completed
                        ? 'bg-emerald-500 border-emerald-500 text-white'
                        : 'border-stone-300 bg-white hover:border-amber-500'
                    }`}
                  >
                    {slot.completed && <CheckCircle2 className="w-4 h-4" />}
                  </button>

                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold px-2 py-0.5 rounded bg-stone-100 text-stone-700">
                        {slot.subject}
                      </span>
                      <span className="text-xs font-medium text-stone-500">
                        {slot.time} ({slot.durationMinutes} mins)
                      </span>
                      {slot.priority === 'high' && (
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-rose-100 text-rose-700">
                          HIGH PRIORITY
                        </span>
                      )}
                    </div>
                    <p className={`text-sm font-semibold mt-1 ${slot.completed ? 'line-through text-stone-400' : 'text-stone-800'}`}>
                      {slot.topic}
                    </p>
                    {slot.notes && (
                      <p className="text-xs text-stone-500 mt-0.5">
                        💡 {slot.notes}
                      </p>
                    )}
                  </div>
                </div>

                <span className="text-xs font-bold text-amber-600 shrink-0">
                  +20 XP
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Daily Challenges / Missions (1 column) */}
        <div className="bg-white rounded-xl p-5 border border-stone-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-500 fill-amber-500" />
              <h2 className="text-base font-bold text-stone-900 font-['Outfit']">
                Daily Challenges
              </h2>
            </div>
            <span className="text-xs text-stone-400">Resets daily</span>
          </div>

          <div className="space-y-3">
            {dailyMissions.map((mission) => (
              <div
                key={mission.id}
                className={`p-3 rounded-xl border ${
                  mission.completed
                    ? 'bg-emerald-50/50 border-emerald-200'
                    : 'bg-stone-50 border-stone-200'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className={`text-xs font-bold ${mission.completed ? 'text-emerald-800' : 'text-stone-800'}`}>
                    {mission.title}
                  </span>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                    +{mission.xpReward} XP
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs text-stone-500 mb-1">
                  <span>Progress</span>
                  <span>{mission.current} / {mission.target}</span>
                </div>
                <div className="w-full bg-stone-200 h-1.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${mission.completed ? 'bg-emerald-500' : 'bg-amber-500'}`}
                    style={{ width: `${Math.min(100, (mission.current / mission.target) * 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Quick Study Goals */}
          <div className="pt-3 border-t border-stone-100">
            <div className="flex items-center gap-1.5 text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
              <Target className="w-3.5 h-3.5 text-amber-600" />
              <span>Target Study Goals</span>
            </div>
            <ul className="space-y-1.5">
              {profile.studyGoals.map((goal, idx) => (
                <li key={idx} className="text-xs text-stone-600 flex items-start gap-1.5">
                  <span className="text-amber-500 font-bold">•</span>
                  <span>{goal}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Quick Launch Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div
          onClick={() => setActiveTab('tutor')}
          className="bg-stone-900 text-white rounded-xl p-4 border border-stone-800 hover:border-amber-500/60 cursor-pointer transition shadow-xs group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="p-2 bg-stone-800 rounded-lg text-amber-400 group-hover:scale-105 transition">
              <Bot className="w-5 h-5" />
            </span>
            <ArrowRight className="w-4 h-4 text-stone-400 group-hover:text-amber-400 group-hover:translate-x-1 transition" />
          </div>
          <h3 className="font-bold text-sm text-white">AI Personal Tutor</h3>
          <p className="text-xs text-stone-400 mt-1">
            Voice doubts, real-world analogies, and step-by-step solutions for classes 6–10.
          </p>
        </div>

        <div
          onClick={() => setActiveTab('quiz')}
          className="bg-white rounded-xl p-4 border border-stone-200 hover:border-amber-400 cursor-pointer transition shadow-xs group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="p-2 bg-amber-50 rounded-lg text-amber-600 group-hover:scale-105 transition">
              <FileQuestion className="w-5 h-5" />
            </span>
            <ArrowRight className="w-4 h-4 text-stone-400 group-hover:text-amber-600 group-hover:translate-x-1 transition" />
          </div>
          <h3 className="font-bold text-sm text-stone-900">Notes → AI Quiz</h3>
          <p className="text-xs text-stone-500 mt-1">
            Paste textbook notes to generate instant MCQs, short answers, and flashcards.
          </p>
        </div>

        <div
          onClick={() => setActiveTab('rescue')}
          className="bg-rose-50/50 rounded-xl p-4 border border-rose-200 hover:border-rose-400 cursor-pointer transition shadow-xs group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="p-2 bg-rose-100 rounded-lg text-rose-700 group-hover:scale-105 transition">
              <ShieldAlert className="w-5 h-5" />
            </span>
            <ArrowRight className="w-4 h-4 text-rose-400 group-hover:text-rose-700 group-hover:translate-x-1 transition" />
          </div>
          <h3 className="font-bold text-sm text-rose-950">Exam Rescue SOS</h3>
          <p className="text-xs text-rose-800/80 mt-1">
            Approaching exams with low prep? AI creates a crash 80/20 survival timetable.
          </p>
        </div>
      </div>
    </div>
  );
};
