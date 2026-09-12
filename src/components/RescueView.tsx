import React, { useState } from 'react';
import {
  ShieldAlert,
  AlertTriangle,
  Zap,
  Flame,
  Clock,
  Target,
  FileText,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  BookOpen
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { RescuePlan, SubjectName } from '../types';

export const RescueView: React.FC = () => {
  const { profile, addXP } = useApp();

  const [subject, setSubject] = useState<SubjectName>('Science');
  const [examDate, setExamDate] = useState<string>(profile.examDate || '2026-09-18');
  const [prepPercent, setPrepPercent] = useState<number>(25);
  const [hoursPerDay, setHoursPerDay] = useState<number>(5);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [rescuePlan, setRescuePlan] = useState<RescuePlan | null>(null);

  const daysLeft = Math.max(
    1,
    Math.ceil((new Date(examDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
  );

  const handleGenerateRescue = async () => {
    setIsLoading(true);

    try {
      const res = await fetch('/api/rescue/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentClass: profile.classGrade,
          subject,
          examDate,
          currentPrepPercent: prepPercent,
          weakTopics: ['Trigonometry Identities', 'Redox Balancing', 'Ray Diagrams'],
          hoursAvailablePerDay: hoursPerDay
        })
      });

      const data = await res.json();
      setRescuePlan(data);
      addXP(40, 'Activated Exam Rescue Mode');
    } catch (err) {
      console.error('Error generating rescue plan:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* SOS Header */}
      <div className="bg-gradient-to-r from-rose-950 via-stone-900 to-rose-950 text-white rounded-2xl p-6 border border-rose-800 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 bg-rose-600/30 text-rose-400 rounded-xl border border-rose-500/40">
                <ShieldAlert className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-rose-400">
                  CRITICAL RESCUE MODE
                </span>
                <h1 className="text-xl sm:text-2xl font-black font-['Outfit'] tracking-tight text-white">
                  Exam Rescue SOS ({profile.classGrade})
                </h1>
              </div>
            </div>
            <p className="text-stone-300 text-xs sm:text-sm mt-2 max-w-2xl">
              Running out of time with low preparation? AI applies the 80/20 Pareto principle to extract the absolute highest-weightage questions, formulas, and emergency routines to maximize marks.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-rose-900/40 border border-rose-700/60 px-4 py-2.5 rounded-xl text-rose-200">
            <Clock className="w-4 h-4 text-rose-400" />
            <span className="text-sm font-bold">{daysLeft} Days Remaining</span>
          </div>
        </div>

        {/* Input Parameters: Subject, Exam Date, Preparation %, Daily Hours */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mt-6 pt-5 border-t border-rose-900/80">
          <div>
            <label className="block text-xs font-bold uppercase text-stone-300 mb-1.5">
              Target Subject
            </label>
            <select
              value={subject}
              onChange={(e) => setSubject(e.target.value as SubjectName)}
              className="w-full text-xs font-semibold bg-stone-900 border border-rose-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-rose-500"
            >
              <option value="Science">Science (General)</option>
              <option value="Physics">Physics</option>
              <option value="Chemistry">Chemistry</option>
              <option value="Biology">Biology</option>
              <option value="Mathematics">Mathematics</option>
              <option value="Social Science">Social Science</option>
              <option value="English">English</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-stone-300 mb-1.5">
              Exam Date
            </label>
            <input
              type="date"
              value={examDate}
              onChange={(e) => setExamDate(e.target.value)}
              className="w-full text-xs font-semibold bg-stone-900 border border-rose-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-rose-500"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs font-bold uppercase text-stone-300 mb-1.5">
              <span>Preparedness:</span>
              <span className="text-rose-400 font-extrabold">{prepPercent}%</span>
            </div>
            <input
              type="range"
              min="5"
              max="70"
              step="5"
              value={prepPercent}
              onChange={(e) => setPrepPercent(parseInt(e.target.value))}
              className="w-full accent-rose-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-stone-400 mt-1">
              <span>10% (Panic)</span>
              <span>30% (Low)</span>
              <span>60% (Moderate)</span>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs font-bold uppercase text-stone-300 mb-1.5">
              <span>Crash Study Hours:</span>
              <span className="text-rose-400 font-extrabold">{hoursPerDay}h / day</span>
            </div>
            <input
              type="range"
              min="3"
              max="10"
              step="1"
              value={hoursPerDay}
              onChange={(e) => setHoursPerDay(parseInt(e.target.value))}
              className="w-full accent-rose-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-stone-400 mt-1">
              <span>3h</span>
              <span>6h (Intensive)</span>
              <span>10h (Crash)</span>
            </div>
          </div>
        </div>

        <div className="mt-5 flex justify-end">
          <button
            onClick={handleGenerateRescue}
            disabled={isLoading}
            className="flex items-center gap-2 bg-rose-600 hover:bg-rose-500 text-white font-bold px-6 py-3 rounded-xl text-sm transition shadow-md border border-rose-500"
          >
            <Zap className="w-4 h-4 fill-white" />
            <span>{isLoading ? 'Crafting Crash Rescue Plan...' : 'Activate Rescue Mission'}</span>
          </button>
        </div>
      </div>

      {/* Generated Rescue Plan Results */}
      {rescuePlan ? (
        <div className="space-y-6">
          {/* Urgency Alert Bar */}
          <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 flex items-center justify-between gap-3 text-rose-950">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-rose-200 text-rose-800 rounded-xl">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold">
                  Rescue Strategy: {rescuePlan.urgencyLevel} Urgency ({daysLeft} Days to {subject} Exam)
                </h3>
                <p className="text-xs text-rose-800">
                  Target: Jump from {prepPercent}% to safe 75%+ passing/scoring tier by focusing purely on high-frequency questions.
                </p>
              </div>
            </div>
            <span className="px-3 py-1 bg-rose-600 text-white font-black text-xs rounded-full uppercase">
              {rescuePlan.urgencyLevel} PRIORITY
            </span>
          </div>

          {/* 80/20 Must-Know High Weightage Topics */}
          <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-xs space-y-4">
            <div className="flex items-center gap-2 font-bold text-base text-stone-900 font-['Outfit']">
              <Target className="w-5 h-5 text-rose-600" />
              <h2>Pareto 80/20: Must-Know High Weightage Topics</h2>
            </div>
            <p className="text-xs text-stone-500">
              Skip obscure theory. These topics represent the bulk of standard school/board questions.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {rescuePlan.mustKnowTopics.map((item, idx) => (
                <div
                  key={idx}
                  className="bg-rose-50/40 border border-rose-200/80 rounded-xl p-4 flex flex-col justify-between gap-2"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className="text-xs font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded">
                        {item.weightage}
                      </span>
                      <span className="text-[11px] font-mono text-stone-500">
                        ~{item.estimatedMinutes} mins
                      </span>
                    </div>
                    <h3 className="font-bold text-stone-900 text-sm">
                      {item.topic}
                    </h3>
                    <p className="text-xs text-stone-600 mt-1">
                      {item.whyImportant}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-rose-100 text-[11px] text-rose-700 font-semibold flex items-center gap-1">
                    <span>Priority {idx + 1} Focus</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Daily Survival Crash Routine */}
          <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-xs space-y-4">
            <div className="flex items-center gap-2 font-bold text-base text-stone-900 font-['Outfit']">
              <Clock className="w-5 h-5 text-amber-600" />
              <h2>Daily Crash Survival Routine</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {rescuePlan.survivalDailyRoutine.map((routine, idx) => (
                <div
                  key={idx}
                  className="bg-stone-50 border border-stone-200 rounded-xl p-4 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-700">
                      {routine.phase}
                    </span>
                    <span className="text-[11px] font-mono text-stone-500">
                      {routine.suggestedDuration}
                    </span>
                  </div>
                  <h4 className="font-bold text-stone-900 text-sm">
                    {routine.focus}
                  </h4>
                  <ul className="space-y-1.5 pt-1 text-xs text-stone-600">
                    {routine.actionSteps.map((step, sIdx) => (
                      <li key={sIdx} className="flex items-start gap-1.5">
                        <span className="text-rose-500 font-bold">•</span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Rapid Checklist & Quick Formulas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Rapid Emergency Checklist */}
            <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-xs space-y-3">
              <div className="flex items-center gap-2 font-bold text-sm text-stone-900 font-['Outfit']">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <h3>Last-Minute Survival Checklist</h3>
              </div>
              <div className="space-y-2">
                {rescuePlan.rapidChecklist.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-800 flex items-start gap-2.5 font-medium"
                  >
                    <input type="checkbox" className="mt-0.5 accent-emerald-600 rounded" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Concept & Formulas Box */}
            <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-xs space-y-3">
              <div className="flex items-center gap-2 font-bold text-sm text-stone-900 font-['Outfit']">
                <BookOpen className="w-4 h-4 text-indigo-600" />
                <h3>Formulas & Definitions Crash Sheet</h3>
              </div>
              <div className="space-y-2">
                {rescuePlan.quickFormulasAndConcepts.map((cat, idx) => (
                  <div key={idx} className="p-3 bg-indigo-50/50 border border-indigo-200 rounded-xl space-y-1 text-xs">
                    <span className="font-bold text-indigo-950 block">
                      {cat.title}
                    </span>
                    <ul className="space-y-1 text-stone-700">
                      {cat.keyPoints.map((pt, pIdx) => (
                        <li key={pIdx} className="flex items-start gap-1.5">
                          <span className="text-indigo-600 font-bold">✓</span>
                          <span>{pt}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Empty State / Prompt to Activate */
        <div className="bg-white rounded-2xl p-10 border border-stone-200 text-center space-y-3">
          <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-2xl mx-auto flex items-center justify-center">
            <Flame className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-base text-stone-900 font-['Outfit']">
            Ready to Turn Your Grades Around?
          </h3>
          <p className="text-xs text-stone-500 max-w-md mx-auto">
            Select your target subject and exam date above, then click <span className="font-bold text-rose-600">"Activate Rescue Mission"</span> to generate an intensive 80/20 crash plan.
          </p>
        </div>
      )}
    </div>
  );
};
