import React, { useState } from 'react';
import {
  CalendarDays,
  Flame,
  Clock,
  Zap,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Trophy,
  Award
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { StreakDay } from '../types';

export const StreakCalendarView: React.FC = () => {
  const { profile, streakDays, addConcentratedStudy } = useApp();

  // Reference date: September 2026
  const [selectedDay, setSelectedDay] = useState<StreakDay | null>(
    streakDays.find(d => d.date === '2026-09-11') || streakDays[streakDays.length - 1] || null
  );

  // Calendar generation for September 2026 (1st is Tuesday)
  const daysInMonth = 30;
  const startDayOffset = 2; // Tuesday is 2 (0 = Sun, 1 = Mon, 2 = Tue)

  const monthName = 'September 2026';

  const totalMonthlyMinutes = streakDays.reduce((acc, d) => acc + (d.minutes || 0), 0);
  const totalMonthlyConcentrated = streakDays.reduce(
    (acc, d) => acc + (d.concentratedMinutes || 0),
    0
  );
  const activeDaysCount = streakDays.filter(d => d.studied).length;

  const calendarCells = [];
  // Empty offset days
  for (let i = 0; i < startDayOffset; i++) {
    calendarCells.push({ empty: true, id: `empty-${i}` });
  }

  // Days 1 to 30
  for (let dayNum = 1; dayNum <= daysInMonth; dayNum++) {
    const dateStr = `2026-09-${String(dayNum).padStart(2, '0')}`;
    const logged = streakDays.find(d => d.date === dateStr);
    calendarCells.push({
      empty: false,
      dayNum,
      dateStr,
      data: logged || {
        date: dateStr,
        studied: false,
        minutes: 0,
        concentratedMinutes: 0,
        tasksCompleted: 0
      },
      isToday: dateStr === '2026-09-11'
    });
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-orange-500/15 via-amber-500/10 to-orange-500/5 dark:from-orange-950/40 dark:via-amber-950/20 dark:to-stone-900 border border-orange-500/20 p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-400 flex items-center justify-center text-stone-950 shadow-lg shadow-orange-500/20">
              <Flame className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                Daily Streak & Activity Calendar
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-orange-500 text-stone-950 font-black uppercase">
                  {profile.streak} Days Active
                </span>
              </h2>
              <p className="text-xs text-stone-600 dark:text-stone-400">
                Track consistency, daily focus time, and build lasting study habits toward your exams.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 bg-white/60 dark:bg-stone-900/60 backdrop-blur px-4 py-2 rounded-xl border border-stone-200 dark:border-stone-800">
            <div className="text-center">
              <p className="text-[10px] uppercase font-bold text-stone-500">Current Streak</p>
              <p className="text-lg font-black text-orange-500 flex items-center justify-center gap-1">
                <Flame className="w-4 h-4 fill-current" /> {profile.streak} Days
              </p>
            </div>
            <div className="w-px h-8 bg-stone-300 dark:bg-stone-700" />
            <div className="text-center">
              <p className="text-[10px] uppercase font-bold text-stone-500">Best Record</p>
              <p className="text-lg font-black text-amber-500 flex items-center justify-center gap-1">
                <Trophy className="w-4 h-4" /> 14 Days
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-stone-500 dark:text-stone-400 font-medium">Monthly Study Time</p>
            <p className="text-lg font-bold text-stone-900 dark:text-stone-100">
              {Math.floor(totalMonthlyMinutes / 60)}h {totalMonthlyMinutes % 60}m
            </p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-500/10 text-orange-500 flex items-center justify-center">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-stone-500 dark:text-stone-400 font-medium">Concentrated Deep Focus</p>
            <p className="text-lg font-bold text-stone-900 dark:text-stone-100">
              {totalMonthlyConcentrated} Minutes
            </p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-stone-500 dark:text-stone-400 font-medium">Attendance Rate</p>
            <p className="text-lg font-bold text-stone-900 dark:text-stone-100">
              {Math.round((activeDaysCount / 11) * 100)}% Consistency
            </p>
          </div>
        </div>
      </div>

      {/* Calendar Grid Container */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar Grid (2 Cols) */}
        <div className="lg:col-span-2 bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-stone-200 dark:border-stone-800">
            <h3 className="font-bold text-base text-stone-900 dark:text-stone-100 flex items-center gap-2">
              <CalendarDays className="w-5 h-5 text-amber-500" />
              {monthName}
            </h3>
            <div className="flex items-center gap-2 text-xs text-stone-500 dark:text-stone-400">
              <span className="inline-flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-orange-500" /> Studied
              </span>
              <span className="inline-flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-stone-300 dark:bg-stone-700" /> Rest Day
              </span>
            </div>
          </div>

          {/* Weekday headers */}
          <div className="grid grid-cols-7 text-center text-xs font-bold text-stone-400 uppercase tracking-wider py-1">
            <span>Sun</span>
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
          </div>

          {/* Calendar Day Cells */}
          <div className="grid grid-cols-7 gap-2">
            {calendarCells.map((cell, idx) => {
              if (cell.empty) {
                return (
                  <div
                    key={cell.id}
                    className="h-16 rounded-xl bg-stone-50/50 dark:bg-stone-950/20 border border-transparent"
                  />
                );
              }

              const isSelected = selectedDay?.date === cell.dateStr;
              const hasStudied = cell.data?.studied;

              return (
                <button
                  key={cell.dateStr}
                  id={`streak-day-${cell.dayNum}`}
                  onClick={() => setSelectedDay(cell.data as StreakDay)}
                  className={`h-16 rounded-xl p-1.5 flex flex-col justify-between text-left transition relative border ${
                    isSelected
                      ? 'border-amber-500 ring-2 ring-amber-500/20 bg-amber-500/10'
                      : hasStudied
                      ? 'border-orange-500/30 bg-orange-500/5 dark:bg-orange-950/20 hover:border-orange-500/50'
                      : 'border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-800/40 hover:bg-stone-100 dark:hover:bg-stone-800'
                  }`}
                >
                  <div className="flex justify-between items-center w-full">
                    <span
                      className={`text-xs font-bold ${
                        cell.isToday
                          ? 'w-5 h-5 rounded-full bg-amber-500 text-stone-950 flex items-center justify-center font-black'
                          : 'text-stone-700 dark:text-stone-300'
                      }`}
                    >
                      {cell.dayNum}
                    </span>
                    {hasStudied && (
                      <Flame className="w-3.5 h-3.5 text-orange-500 fill-current animate-pulse" />
                    )}
                  </div>

                  {hasStudied ? (
                    <div className="text-[10px] font-semibold text-orange-700 dark:text-orange-400 truncate">
                      {cell.data.minutes}m
                    </div>
                  ) : (
                    <div className="text-[9px] text-stone-400">
                      {cell.dayNum > 11 ? 'Upcoming' : 'Rest'}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Col: Selected Day Detail */}
        <div className="space-y-4">
          <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-stone-900 dark:text-stone-100 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              Day Inspection
            </h3>

            {selectedDay ? (
              <div className="space-y-4">
                <div className="p-3 rounded-xl bg-stone-100 dark:bg-stone-800">
                  <p className="text-xs text-stone-500 dark:text-stone-400">Selected Date</p>
                  <p className="text-base font-bold text-stone-900 dark:text-stone-100">
                    {new Date(selectedDay.date + 'T00:00:00').toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs py-2 border-b border-stone-200 dark:border-stone-800">
                    <span className="text-stone-600 dark:text-stone-400">Study Status</span>
                    <span
                      className={`font-bold px-2 py-0.5 rounded-full ${
                        selectedDay.studied
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                          : 'bg-stone-200 dark:bg-stone-800 text-stone-600 dark:text-stone-400'
                      }`}
                    >
                      {selectedDay.studied ? 'Completed Session' : 'Rest Day'}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-xs py-2 border-b border-stone-200 dark:border-stone-800">
                    <span className="text-stone-600 dark:text-stone-400">Total Study Time</span>
                    <span className="font-bold text-stone-900 dark:text-stone-100">
                      {selectedDay.minutes} minutes
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-xs py-2 border-b border-stone-200 dark:border-stone-800">
                    <span className="text-stone-600 dark:text-stone-400">Concentrated Deep Focus</span>
                    <span className="font-bold text-amber-600 dark:text-amber-400">
                      {selectedDay.concentratedMinutes || 0} minutes
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-xs py-2">
                    <span className="text-stone-600 dark:text-stone-400">Completed Tasks</span>
                    <span className="font-bold text-stone-900 dark:text-stone-100">
                      {selectedDay.tasksCompleted} tasks
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-xs text-stone-500">Click any calendar cell to view daily records.</p>
            )}
          </div>

          {/* Motivation Quote */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/20 space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
              <Award className="w-4 h-4" /> Study Habit Formula
            </span>
            <p className="text-xs text-stone-700 dark:text-stone-300 italic leading-relaxed">
              "We are what we repeatedly do. Excellence, then, is not an act, but a habit."
            </p>
            <p className="text-[10px] text-stone-500 dark:text-stone-400 text-right">
              — Aristotle / NCERT Preparation Philosophy
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
