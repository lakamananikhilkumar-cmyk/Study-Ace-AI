import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  Clock,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Plus,
  Trash2,
  ListTodo,
  Check,
  ChevronRight,
  TrendingUp,
  Bookmark
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { StudyPlan, SubjectName } from '../types';

export const PlannerView: React.FC = () => {
  const {
    profile,
    studyPlan,
    setStudyPlan,
    toggleSlotCompleted,
    addXP
  } = useApp();

  const [examDate, setExamDate] = useState<string>(studyPlan?.examDate || profile.examDate || '2026-09-25');
  const [hoursPerDay, setHoursPerDay] = useState<number>(studyPlan?.hoursPerDay || profile.dailyStudyHours || 3.5);
  const [selectedSubjects, setSelectedSubjects] = useState<SubjectName[]>(profile.subjects || ['Mathematics', 'Science', 'Social Science', 'English']);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isRebalancing, setIsRebalancing] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Available subjects for selection
  const allSubjects: SubjectName[] = [
    'Mathematics',
    'Science',
    'Physics',
    'Chemistry',
    'Biology',
    'Social Science',
    'History',
    'Geography',
    'Civics/Political Science',
    'English',
    'Hindi',
    'Computer Science'
  ];

  const handleToggleSubject = (sub: SubjectName) => {
    setSelectedSubjects(prev =>
      prev.includes(sub) ? prev.filter(s => s !== sub) : [...prev, sub]
    );
  };

  // Generate new AI Timetable
  const handleGeneratePlan = async () => {
    if (selectedSubjects.length === 0) {
      alert('Please select at least one subject!');
      return;
    }
    setIsGenerating(true);
    setStatusMessage(null);

    try {
      const res = await fetch('/api/planner/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentClass: profile.classGrade,
          subjects: selectedSubjects,
          examDate,
          hoursPerDay,
          level: profile.level,
          weakAreas: []
        })
      });

      const data = await res.json();

      const newPlan: StudyPlan = {
        id: `plan-${Date.now()}`,
        title: `${profile.classGrade} AI Master Timetable`,
        examDate,
        hoursPerDay,
        generatedAt: new Date().toISOString(),
        summary: data.summary || 'Custom balanced plan generated for your upcoming exams.',
        dailySchedule: data.dailySchedule || [],
        examStrategyTips: data.examStrategyTips || [
          'Maintain regular breaks between intensive math problem-solving.',
          'Review notes right after waking up for maximum memory encoding.'
        ]
      };

      setStudyPlan(newPlan);
      setStatusMessage('🎉 New smart study schedule generated successfully!');
    } catch (err) {
      console.error('Error generating plan:', err);
      setStatusMessage('Could not connect to AI service. Try again in a moment.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Auto-Adjust Missed Tasks
  const handleAutoAdjustMissedTasks = async () => {
    if (!studyPlan) return;

    // Collect incomplete tasks from day 0 (today)
    const today = studyPlan.dailySchedule[0];
    const missed = today ? today.slots.filter(s => !s.completed) : [];

    if (missed.length === 0) {
      alert('Great job! You have no missed tasks today to reschedule.');
      return;
    }

    setIsRebalancing(true);
    setStatusMessage(null);

    try {
      const res = await fetch('/api/planner/rebalance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentSchedule: studyPlan.dailySchedule,
          missedSlots: missed
        })
      });

      const data = await res.json();

      if (data.rebalancedSchedule) {
        setStudyPlan({
          ...studyPlan,
          dailySchedule: data.rebalancedSchedule
        });
        setStatusMessage(data.adjustmentMessage || '✅ Automatically adjusted and redistributed missed tasks into tomorrow!');
        addXP(15, 'Rebalanced study schedule');
      }
    } catch (err) {
      console.error('Error rebalancing schedule:', err);
      // Client-side fallback: push to day 1
      const updated = studyPlan.dailySchedule.map((day, idx) => {
        if (idx === 1) {
          return {
            ...day,
            slots: [
              ...day.slots,
              ...missed.map(m => ({
                ...m,
                id: `rescheduled-${Date.now()}-${m.id}`,
                time: '08:30 PM - 09:15 PM (Rescheduled Catch-up)',
                notes: `[Auto-Adjusted] ${m.notes || ''}`
              }))
            ]
          };
        }
        return day;
      });

      setStudyPlan({ ...studyPlan, dailySchedule: updated });
      setStatusMessage('✅ Missed tasks redistributed into tomorrow\'s schedule!');
    } finally {
      setIsRebalancing(false);
    }
  };

  // Calculate days until exam
  const daysUntilExam = Math.max(
    0,
    Math.ceil((new Date(examDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
  );

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Header & Controls */}
      <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-xs space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-2 bg-amber-100 text-amber-800 rounded-xl">
                <CalendarIcon className="w-5 h-5" />
              </div>
              <h1 className="text-xl font-bold text-stone-900 font-['Outfit']">
                Smart Study Planner ({profile.classGrade})
              </h1>
            </div>
            <p className="text-xs text-stone-500 mt-1">
              AI-generated daily timetable tailored to your exam date, daily hours, and automatically adjusts missed tasks.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleAutoAdjustMissedTasks}
              disabled={isRebalancing || isGenerating}
              className="flex items-center gap-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 font-semibold px-3.5 py-2 rounded-xl text-xs transition border border-stone-300 shadow-2xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRebalancing ? 'animate-spin' : ''}`} />
              <span>Auto-Adjust Missed Tasks</span>
            </button>

            <button
              onClick={handleGeneratePlan}
              disabled={isGenerating}
              className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold px-4 py-2 rounded-xl text-xs transition shadow-sm"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isGenerating ? 'Generating...' : 'Generate New Timetable'}</span>
            </button>
          </div>
        </div>

        {/* Input Parameters: Exam Date, Study Hours, Subjects */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-stone-100">
          {/* Exam Date */}
          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
              Exam Date
            </label>
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={examDate}
                onChange={(e) => setExamDate(e.target.value)}
                className="w-full text-xs font-semibold bg-stone-50 border border-stone-300 rounded-lg p-2 text-stone-800 focus:outline-none focus:border-amber-500"
              />
              <span className="text-[11px] font-bold text-amber-700 whitespace-nowrap bg-amber-50 px-2 py-2 rounded-lg border border-amber-200">
                {daysUntilExam}d left
              </span>
            </div>
          </div>

          {/* Daily Study Hours */}
          <div>
            <div className="flex justify-between text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
              <span>Daily Study Hours</span>
              <span className="text-amber-700 font-extrabold">{hoursPerDay} hrs</span>
            </div>
            <input
              type="range"
              min="1"
              max="8"
              step="0.5"
              value={hoursPerDay}
              onChange={(e) => setHoursPerDay(parseFloat(e.target.value))}
              className="w-full accent-amber-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-stone-400 mt-1">
              <span>1h (Light)</span>
              <span>4h (Standard)</span>
              <span>8h (Intensive)</span>
            </div>
          </div>

          {/* Subjects Included */}
          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
              Included Subjects ({selectedSubjects.length})
            </label>
            <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto pr-1">
              {allSubjects.map((sub) => {
                const isSelected = selectedSubjects.includes(sub);
                return (
                  <button
                    key={sub}
                    type="button"
                    onClick={() => handleToggleSubject(sub)}
                    className={`text-[11px] font-medium px-2 py-0.5 rounded-md transition ${
                      isSelected
                        ? 'bg-amber-100 border border-amber-300 text-amber-900 font-bold'
                        : 'bg-stone-100 border border-stone-200 text-stone-500 hover:text-stone-800'
                    }`}
                  >
                    {sub}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {statusMessage && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-xs text-emerald-800 font-medium">
            {statusMessage}
          </div>
        )}
      </div>

      {/* Strategy Tips Card */}
      {studyPlan?.examStrategyTips && studyPlan.examStrategyTips.length > 0 && (
        <div className="bg-amber-50/80 border border-amber-200/90 rounded-2xl p-4 text-xs text-amber-950">
          <div className="flex items-center gap-2 font-bold text-sm text-amber-900 mb-2 font-['Outfit']">
            <Bookmark className="w-4 h-4 text-amber-700" />
            <span>AI Exam Strategy Tips for {profile.classGrade}:</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {studyPlan.examStrategyTips.map((tip, idx) => (
              <div key={idx} className="bg-white/90 p-2.5 rounded-xl border border-amber-200/60 flex items-start gap-2">
                <span className="font-bold text-amber-700">0{idx + 1}.</span>
                <span className="text-amber-900/90">{tip}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Daily Timetable Days */}
      <div className="space-y-6">
        {studyPlan?.dailySchedule?.map((daySchedule, dayIdx) => {
          const completedSlots = daySchedule.slots.filter(s => s.completed).length;
          const totalSlots = daySchedule.slots.length;
          const percent = totalSlots ? Math.round((completedSlots / totalSlots) * 100) : 0;

          return (
            <div
              key={daySchedule.id}
              className="bg-white rounded-2xl p-5 border border-stone-200 shadow-xs space-y-3"
            >
              {/* Day Header */}
              <div className="flex items-center justify-between flex-wrap gap-2 pb-2 border-b border-stone-100">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  <h2 className="font-bold text-stone-900 text-sm sm:text-base font-['Outfit']">
                    {daySchedule.dayName}
                  </h2>
                  <span className="text-xs text-stone-400 font-mono">
                    ({daySchedule.date})
                  </span>
                </div>

                <div className="flex items-center gap-3 text-xs">
                  <span className="font-medium text-stone-500">
                    {completedSlots} of {totalSlots} tasks completed
                  </span>
                  <div className="w-20 bg-stone-100 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-emerald-500 h-full transition-all"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Day Slots List */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                {daySchedule.slots.map((slot) => (
                  <div
                    key={slot.id}
                    onClick={() => toggleSlotCompleted(daySchedule.id, slot.id)}
                    className={`p-3.5 rounded-xl border transition cursor-pointer flex flex-col justify-between gap-2 ${
                      slot.completed
                        ? 'bg-stone-50 border-stone-200 opacity-60'
                        : 'bg-white border-stone-200 hover:border-amber-400 shadow-2xs'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-5 h-5 rounded-md flex items-center justify-center border ${
                            slot.completed
                              ? 'bg-emerald-500 border-emerald-500 text-white'
                              : 'border-stone-300 bg-white'
                          }`}
                        >
                          {slot.completed && <Check className="w-3.5 h-3.5" />}
                        </div>
                        <span className="text-xs font-bold text-stone-800 bg-stone-100 px-2 py-0.5 rounded">
                          {slot.subject}
                        </span>
                      </div>

                      <span className="text-[11px] font-mono text-stone-500">
                        {slot.time}
                      </span>
                    </div>

                    <div>
                      <p className={`text-xs font-semibold leading-snug ${slot.completed ? 'line-through text-stone-400' : 'text-stone-900'}`}>
                        {slot.topic}
                      </p>
                      {slot.notes && (
                        <p className="text-[11px] text-stone-500 mt-1">
                          {slot.notes}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-stone-100 text-[11px]">
                      <span className="text-stone-500">
                        {slot.durationMinutes} mins
                      </span>
                      <span className="font-bold text-amber-600">
                        +20 XP
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
