import React, { useState } from 'react';
import {
  RefreshCw,
  Calendar,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
  BookmarkCheck,
  Brain,
  HelpCircle,
  Plus
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { SpacedRevisionCard, SubjectName } from '../types';

export const RevisionView: React.FC = () => {
  const {
    profile,
    spacedRevisions,
    markRevisionCompleted,
    setSpacedRevisions,
    addXP
  } = useApp();

  const [newTopic, setNewTopic] = useState<string>('');
  const [newSubject, setNewSubject] = useState<SubjectName>('Science');
  const [newKeyPoints, setNewKeyPoints] = useState<string>('');
  const [showAddModal, setShowAddModal] = useState<boolean>(false);

  const dueTodayCards = spacedRevisions.filter(r => r.isDueToday);
  const upcomingCards = spacedRevisions.filter(r => !r.isDueToday);

  const handleAddNewRevisionCard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTopic.trim()) return;

    const newCard: SpacedRevisionCard = {
      id: `rev-${Date.now()}`,
      topic: newTopic.trim(),
      subject: newSubject,
      stage: 1,
      stageLabel: 'Day 1 Recall',
      nextDueDate: new Date().toISOString().split('T')[0],
      isDueToday: true,
      completedReviewCount: 0,
      summaryKeyPoints: newKeyPoints
        ? newKeyPoints.split('\n').filter(p => p.trim())
        : [`Core review notes for ${newTopic}`]
    };

    setSpacedRevisions(prev => [newCard, ...prev]);
    setNewTopic('');
    setNewKeyPoints('');
    setShowAddModal(false);
    addXP(15, 'Added Spaced Revision Card');
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Header & Science Explanation */}
      <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-amber-100 text-amber-800 rounded-xl">
              <RefreshCw className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold text-stone-900 font-['Outfit']">
              Smart Spaced Revision Schedule
            </h1>
          </div>
          <p className="text-xs text-stone-500 mt-1 max-w-2xl">
            Based on the Ebbinghaus Forgetting Curve: reviewing on Day 1, 3, 7, 14, and 30 cements concepts into permanent long-term memory with minimal study effort.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold px-4 py-2.5 rounded-xl text-xs transition shadow-xs self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Custom Topic</span>
        </button>
      </div>

      {/* Due Today Queue */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping" />
            <h2 className="text-base font-bold text-stone-900 font-['Outfit']">
              Important Topics for Today's Revision ({dueTodayCards.length} Due)
            </h2>
          </div>
          <span className="text-xs text-amber-800 font-semibold bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
            Earn +30 XP per completed review
          </span>
        </div>

        {dueTodayCards.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 border border-stone-200 text-center space-y-2">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
            <h3 className="font-bold text-stone-900 text-sm">
              All Caught Up for Today!
            </h3>
            <p className="text-xs text-stone-500">
              No pending spaced reviews due right now. You can check upcoming schedule cards below.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {dueTodayCards.map((card) => (
              <div
                key={card.id}
                className="bg-white rounded-2xl p-5 border border-amber-300/80 shadow-xs flex flex-col justify-between gap-4"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-stone-100 text-stone-800">
                      {card.subject}
                    </span>
                    <span className="text-xs font-bold text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full">
                      {card.stageLabel} (Stage {card.stage}/5)
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-stone-900 font-['Outfit']">
                    {card.topic}
                  </h3>

                  {/* Summary key points */}
                  <div className="mt-3 p-3 bg-stone-50 border border-stone-200 rounded-xl space-y-1.5 text-xs">
                    <span className="font-bold text-stone-700 block mb-1">
                      Quick Recall Key Points:
                    </span>
                    {card.summaryKeyPoints.map((pt, pIdx) => (
                      <div key={pIdx} className="text-stone-600 flex items-start gap-1.5">
                        <span className="text-amber-600 font-bold">•</span>
                        <span>{pt}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
                  <span className="text-[11px] text-stone-400">
                    Reviewed {card.completedReviewCount} times
                  </span>

                  <button
                    onClick={() => markRevisionCompleted(card.id)}
                    className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2 rounded-xl text-xs transition shadow-2xs"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Mark Revised (+30 XP)</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Upcoming Spaced Schedule */}
      <div className="space-y-4 pt-4">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-stone-500" />
          <h2 className="text-base font-bold text-stone-900 font-['Outfit']">
            Upcoming Spaced Review Queue
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {upcomingCards.map((card) => (
            <div
              key={card.id}
              className="bg-white rounded-xl p-4 border border-stone-200 shadow-xs flex flex-col justify-between gap-3"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="text-[11px] font-bold text-stone-700 bg-stone-100 px-2 py-0.5 rounded">
                    {card.subject}
                  </span>
                  <span className="text-[11px] font-mono text-stone-500">
                    Due: {card.nextDueDate}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-stone-900 font-['Outfit']">
                  {card.topic}
                </h4>
                <p className="text-xs text-stone-500 mt-1">
                  Next milestone: <span className="font-semibold text-stone-700">{card.stageLabel}</span>
                </p>
              </div>

              <div className="pt-2 border-t border-stone-100 text-[11px] text-stone-400 flex items-center justify-between">
                <span>Stage {card.stage} of 5</span>
                <span>{card.completedReviewCount} past reviews</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Custom Topic Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 border border-stone-200 shadow-xl space-y-4">
            <h3 className="font-bold text-base text-stone-900 font-['Outfit']">
              Add Topic to Spaced Revision Schedule
            </h3>
            <form onSubmit={handleAddNewRevisionCard} className="space-y-3">
              <div>
                <label className="block text-xs font-bold uppercase text-stone-700 mb-1">
                  Topic Name
                </label>
                <input
                  type="text"
                  required
                  value={newTopic}
                  onChange={(e) => setNewTopic(e.target.value)}
                  placeholder="e.g. Pythagoras Theorem Proof"
                  className="w-full text-xs font-semibold bg-stone-50 border border-stone-300 rounded-lg p-2.5 text-stone-800 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-stone-700 mb-1">
                  Subject
                </label>
                <select
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value as SubjectName)}
                  className="w-full text-xs font-semibold bg-stone-50 border border-stone-300 rounded-lg p-2.5 text-stone-800 focus:outline-none focus:border-amber-500"
                >
                  <option value="Mathematics">Mathematics</option>
                  <option value="Science">Science</option>
                  <option value="Social Science">Social Science</option>
                  <option value="English">English</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-stone-700 mb-1">
                  Quick Recall Notes (one per line)
                </label>
                <textarea
                  rows={3}
                  value={newKeyPoints}
                  onChange={(e) => setNewKeyPoints(e.target.value)}
                  placeholder="Hypotenuse² = Base² + Perpendicular²&#10;Used in right angled triangles"
                  className="w-full text-xs bg-stone-50 border border-stone-300 rounded-lg p-2.5 text-stone-800 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-stone-600 hover:bg-stone-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-stone-950 shadow-xs"
                >
                  Save to Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
