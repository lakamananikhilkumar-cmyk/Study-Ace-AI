import React, { useState } from 'react';
import {
  Activity,
  AlertTriangle,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Bot,
  HelpCircle,
  TrendingDown,
  TrendingUp,
  RefreshCw
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { WeakTopicItem } from '../types';

export const WeakTopicsView: React.FC = () => {
  const {
    profile,
    weakTopics,
    setWeakTopics,
    quizHistory,
    setActiveTab,
    setTutorInitialTopic
  } = useApp();

  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [filter, setFilter] = useState<'all' | 'critical' | 'moderate' | 'mastered'>('all');

  const filteredTopics = weakTopics.filter(t => {
    if (filter === 'all') return true;
    return t.status === filter;
  });

  const criticalCount = weakTopics.filter(t => t.status === 'critical').length;
  const moderateCount = weakTopics.filter(t => t.status === 'moderate').length;
  const masteredCount = weakTopics.filter(t => t.status === 'mastered').length;

  // Run AI Diagnostic analysis
  const handleRunAIDiagnosis = async () => {
    setIsScanning(true);

    try {
      const res = await fetch('/api/analysis/weak-topics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quizResults: quizHistory,
          studentClass: profile.classGrade,
          subjects: profile.subjects
        })
      });

      const data = await res.json();
      if (data.diagnosedWeakTopics && data.diagnosedWeakTopics.length > 0) {
        setWeakTopics(prev => {
          const newItems: WeakTopicItem[] = data.diagnosedWeakTopics.map((d: any, idx: number) => ({
            id: `diag-${Date.now()}-${idx}`,
            subject: d.subject || 'Science',
            topic: d.topic,
            accuracyPercent: d.accuracyPercent || 45,
            totalQuestionsAttempted: 8,
            status: d.status || 'critical',
            lastEncountered: new Date().toISOString().split('T')[0],
            recommendedAction: d.recommendedAction || 'Practice step-by-step with tutor.',
            conceptSummary: d.conceptSummary || 'Core concept review needed.'
          }));
          return [...newItems, ...prev];
        });
      }
    } catch (err) {
      console.error('Error running diagnosis:', err);
    } finally {
      setIsScanning(false);
    }
  };

  const handleStudyWithTutor = (topicName: string) => {
    setTutorInitialTopic(topicName);
    setActiveTab('tutor');
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Header Bar */}
      <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-rose-100 text-rose-700 rounded-xl">
              <Activity className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold text-stone-900 font-['Outfit']">
              Weak Topic Detector & Recommendations
            </h1>
          </div>
          <p className="text-xs text-stone-500 mt-1">
            Continuously analyzes quiz mistakes and practice performance to identify weak concepts and suggest targeted study steps.
          </p>
        </div>

        <button
          onClick={handleRunAIDiagnosis}
          disabled={isScanning}
          className="flex items-center gap-2 bg-stone-900 hover:bg-stone-800 text-white font-bold px-4 py-2.5 rounded-xl text-xs transition shadow-2xs self-start md:self-auto"
        >
          <Sparkles className={`w-4 h-4 text-amber-400 ${isScanning ? 'animate-spin' : ''}`} />
          <span>{isScanning ? 'Analyzing Performance...' : 'Run AI Diagnostic Scan'}</span>
        </button>
      </div>

      {/* Summary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div
          onClick={() => setFilter('critical')}
          className={`p-4 rounded-xl border cursor-pointer transition ${
            filter === 'critical' ? 'bg-rose-50 border-rose-400 ring-2 ring-rose-200' : 'bg-white border-stone-200 hover:border-rose-300'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-bold text-rose-700 uppercase">
            <span>Critical Weakness (&lt;50%)</span>
            <AlertTriangle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-black text-rose-950 mt-1 font-['Outfit']">
            {criticalCount} Topics
          </div>
          <p className="text-[11px] text-stone-500 mt-0.5">High probability of losing exam marks</p>
        </div>

        <div
          onClick={() => setFilter('moderate')}
          className={`p-4 rounded-xl border cursor-pointer transition ${
            filter === 'moderate' ? 'bg-amber-50 border-amber-400 ring-2 ring-amber-200' : 'bg-white border-stone-200 hover:border-amber-300'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-bold text-amber-700 uppercase">
            <span>Moderate (50% - 70%)</span>
            <TrendingDown className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-amber-950 mt-1 font-['Outfit']">
            {moderateCount} Topics
          </div>
          <p className="text-[11px] text-stone-500 mt-0.5">Needs 1 more revision cycle</p>
        </div>

        <div
          onClick={() => setFilter('mastered')}
          className={`p-4 rounded-xl border cursor-pointer transition ${
            filter === 'mastered' ? 'bg-emerald-50 border-emerald-400 ring-2 ring-emerald-200' : 'bg-white border-stone-200 hover:border-emerald-300'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-bold text-emerald-700 uppercase">
            <span>Mastered (&gt;75%)</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-emerald-950 mt-1 font-['Outfit']">
            {masteredCount} Topics
          </div>
          <p className="text-[11px] text-stone-500 mt-0.5">Retained in spaced review queue</p>
        </div>
      </div>

      {/* Filter Chips */}
      <div className="flex items-center gap-2 text-xs">
        <span className="font-bold text-stone-500">Filter:</span>
        {(['all', 'critical', 'moderate', 'mastered'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`capitalize px-3 py-1 rounded-lg transition font-medium ${
              filter === f
                ? 'bg-stone-900 text-white font-bold shadow-xs'
                : 'bg-white border border-stone-200 text-stone-600 hover:bg-stone-50'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Weak Topics List */}
      <div className="space-y-4">
        {filteredTopics.map((item) => {
          const isCritical = item.status === 'critical';
          const isMastered = item.status === 'mastered';

          return (
            <div
              key={item.id}
              className={`bg-white rounded-2xl p-5 border transition shadow-xs space-y-3 ${
                isCritical
                  ? 'border-rose-300 hover:border-rose-400'
                  : isMastered
                  ? 'border-emerald-200'
                  : 'border-stone-200 hover:border-amber-400'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold px-2 py-0.5 rounded bg-stone-100 text-stone-800">
                    {item.subject}
                  </span>
                  <span
                    className={`text-[11px] font-extrabold px-2.5 py-0.5 rounded-full uppercase ${
                      isCritical
                        ? 'bg-rose-100 text-rose-800'
                        : isMastered
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {item.status} ({item.accuracyPercent}% Accuracy)
                  </span>
                  <span className="text-[11px] text-stone-400">
                    Tested across {item.totalQuestionsAttempted} questions
                  </span>
                </div>

                <button
                  onClick={() => handleStudyWithTutor(item.topic)}
                  className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold px-3 py-1.5 rounded-xl text-xs transition shadow-2xs self-start sm:self-auto"
                >
                  <Bot className="w-3.5 h-3.5" />
                  <span>Ask AI Tutor to Explain</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>

              <div>
                <h3 className="text-base font-bold text-stone-900 font-['Outfit']">
                  {item.topic}
                </h3>
                <p className="text-xs text-stone-600 mt-1">
                  💡 <span className="font-semibold text-stone-800">Core Rule: </span>{item.conceptSummary}
                </p>
              </div>

              {/* Action Recommendation Box */}
              <div className="bg-stone-50 border border-stone-200 rounded-xl p-3 text-xs flex items-start gap-2.5">
                <span className="font-bold text-amber-800 shrink-0">
                  🎯 What to study next:
                </span>
                <span className="text-stone-700 leading-normal">
                  {item.recommendedAction}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
