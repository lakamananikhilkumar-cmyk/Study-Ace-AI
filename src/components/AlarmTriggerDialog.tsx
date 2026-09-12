import React from 'react';
import { Bell, Zap, X, Volume2 } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const AlarmTriggerDialog: React.FC = () => {
  const { triggeredAlarm, dismissTriggeredAlarm, setActiveTab, playAlarmChime } = useApp();

  if (!triggeredAlarm) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white dark:bg-stone-900 border-2 border-amber-500 rounded-2xl shadow-2xl p-6 text-center space-y-4 animate-in zoom-in-95 duration-200">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-500 mx-auto flex items-center justify-center animate-bounce">
          <Bell className="w-8 h-8" />
        </div>

        <div>
          <span className="text-xs uppercase font-black tracking-widest text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-950/60 px-3 py-1 rounded-full">
            Study Hour Alarm Alert!
          </span>
          <h3 className="text-2xl font-black font-mono text-stone-900 dark:text-stone-100 mt-2">
            {triggeredAlarm.time}
          </h3>
          <p className="text-sm font-semibold text-stone-700 dark:text-stone-300 mt-1">
            {triggeredAlarm.label}
          </p>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
            Time to dedicate yourself to your scheduled learning slot and stay ahead for your exams.
          </p>
        </div>

        <div className="pt-2 flex flex-col gap-2">
          <button
            id="alarm-action-deep-focus"
            onClick={() => {
              dismissTriggeredAlarm();
              setActiveTab('focus');
            }}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-stone-950 font-bold text-sm shadow-md flex items-center justify-center gap-2 cursor-pointer transition"
          >
            <Zap className="w-4 h-4 fill-current" />
            Start Concentrated Study (Deep Focus)
          </button>

          <div className="flex gap-2">
            <button
              onClick={playAlarmChime}
              className="w-1/2 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 text-xs font-semibold text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 flex items-center justify-center gap-1.5"
            >
              <Volume2 className="w-4 h-4 text-amber-500" /> Replay Chime
            </button>
            <button
              id="alarm-action-dismiss"
              onClick={dismissTriggeredAlarm}
              className="w-1/2 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 text-xs font-semibold text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 flex items-center justify-center gap-1.5"
            >
              <X className="w-4 h-4" /> Dismiss
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
