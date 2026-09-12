import React, { useState } from 'react';
import {
  Bell,
  Clock,
  Plus,
  Trash2,
  Volume2,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
  Zap
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const AlarmsView: React.FC = () => {
  const {
    alarms,
    addAlarm,
    toggleAlarm,
    deleteAlarm,
    playAlarmChime,
    setActiveTab
  } = useApp();

  const [newTime, setNewTime] = useState('17:00');
  const [newLabel, setNewLabel] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTime) return;
    addAlarm(newTime, newLabel || 'Daily Study Hour Alert');
    setNewLabel('');
    setIsAdding(false);
  };

  const quickPresets = [
    { time: '07:00', label: 'Morning Formula Flashcards' },
    { time: '16:30', label: 'After-School Math & Science Slot' },
    { time: '19:00', label: 'Evening NCERT Doubt Solving' },
    { time: '21:00', label: 'Night Spaced Revision' }
  ];

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/5 dark:from-amber-950/40 dark:via-orange-950/20 dark:to-stone-900 border border-amber-500/20 p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-400 flex items-center justify-center text-stone-950 shadow-lg shadow-amber-500/20">
              <Bell className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                Study Hour Reminders & Alarms
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500 text-stone-950 font-bold">
                  {alarms.filter(a => a.enabled).length} Active
                </span>
              </h2>
              <p className="text-xs text-stone-600 dark:text-stone-400">
                Set dedicated daily alarms to stay on track with scheduled study slots and revision routines.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="test-alarm-chime-btn"
              onClick={playAlarmChime}
              className="px-3 py-2 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700 text-xs font-semibold flex items-center gap-1.5 transition"
              title="Preview the alarm sound"
            >
              <Volume2 className="w-4 h-4 text-amber-500" />
              Test Audio Chime
            </button>
            <button
              id="add-alarm-btn"
              onClick={() => setIsAdding(!isAdding)}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-stone-950 text-xs font-bold flex items-center gap-1.5 transition shadow-sm"
            >
              <Plus className="w-4 h-4" />
              New Alarm
            </button>
          </div>
        </div>
      </div>

      {/* Add Alarm Form */}
      {isAdding && (
        <form
          onSubmit={handleAdd}
          className="p-6 rounded-2xl bg-white dark:bg-stone-900 border border-amber-500/40 shadow-md space-y-4 animate-in fade-in duration-200"
        >
          <h3 className="text-sm font-bold uppercase tracking-wider text-stone-900 dark:text-stone-100 flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-500" />
            Set New Study Alarm
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-stone-600 dark:text-stone-400 mb-1">
                Alarm Time (24h format)
              </label>
              <input
                id="alarm-time-input"
                type="time"
                required
                value={newTime}
                onChange={e => setNewTime(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 text-base font-mono font-bold focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-600 dark:text-stone-400 mb-1">
                Alarm Label / Subject Target
              </label>
              <input
                id="alarm-label-input"
                type="text"
                value={newLabel}
                onChange={e => setNewLabel(e.target.value)}
                placeholder="e.g. Maths Trigonometry Practice"
                className="w-full px-3 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800"
            >
              Cancel
            </button>
            <button
              id="save-alarm-btn"
              type="submit"
              className="px-6 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-stone-950 text-xs font-bold shadow-sm"
            >
              Save Alarm
            </button>
          </div>
        </form>
      )}

      {/* Alarm List */}
      <div className="space-y-3">
        {alarms.length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-stone-500">
            <Bell className="w-8 h-8 mx-auto mb-2 text-stone-400" />
            <p className="text-sm font-semibold">No study alarms configured.</p>
            <p className="text-xs text-stone-400 mt-1">
              Add a reminder so you never miss your daily focus sessions.
            </p>
          </div>
        ) : (
          alarms.map(alarm => (
            <div
              key={alarm.id}
              id={`alarm-card-${alarm.id}`}
              className={`p-4 rounded-2xl border transition flex items-center justify-between gap-4 ${
                alarm.enabled
                  ? 'bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800 shadow-sm'
                  : 'bg-stone-100/60 dark:bg-stone-900/40 border-stone-200/50 dark:border-stone-800/40 opacity-60'
              }`}
            >
              <div className="flex items-center gap-4">
                <button
                  id={`alarm-toggle-${alarm.id}`}
                  onClick={() => toggleAlarm(alarm.id)}
                  className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                    alarm.enabled ? 'bg-amber-500' : 'bg-stone-300 dark:bg-stone-700'
                  }`}
                  title={alarm.enabled ? 'Disable alarm' : 'Enable alarm'}
                >
                  <span
                    className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-transform ${
                      alarm.enabled ? 'left-6' : 'left-1'
                    }`}
                  />
                </button>

                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-black font-mono text-stone-900 dark:text-stone-100">
                      {alarm.time}
                    </span>
                    <span className="text-[10px] uppercase font-bold text-stone-400">
                      Daily Routine
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-stone-600 dark:text-stone-300">
                    {alarm.label}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  id={`alarm-start-focus-${alarm.id}`}
                  onClick={() => setActiveTab('focus')}
                  className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-400 text-xs font-bold transition"
                  title="Open Deep Focus Room for this alarm"
                >
                  <Zap className="w-3.5 h-3.5" /> Start Focus
                </button>
                <button
                  id={`alarm-delete-${alarm.id}`}
                  onClick={() => deleteAlarm(alarm.id)}
                  className="p-2 text-stone-400 hover:text-rose-500 rounded-xl transition"
                  title="Delete alarm"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Suggested Timing Presets */}
      <div className="p-6 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          Recommended Study Alarm Times for Classes 6–10
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {quickPresets.map((preset, idx) => (
            <div
              key={idx}
              className="p-3 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700/60 flex items-center justify-between"
            >
              <div>
                <span className="text-xs font-mono font-bold text-amber-600 dark:text-amber-400 mr-2">
                  {preset.time}
                </span>
                <span className="text-xs text-stone-700 dark:text-stone-300">{preset.label}</span>
              </div>
              <button
                onClick={() => addAlarm(preset.time, preset.label)}
                className="px-2 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 text-[11px] font-bold"
              >
                + Add
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
