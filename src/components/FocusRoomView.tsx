import React, { useState, useEffect, useRef } from 'react';
import {
  Zap,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Sparkles,
  Award,
  CheckCircle2,
  ShieldCheck,
  Flame,
  Maximize2,
  Minimize2,
  Headphones
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const FocusRoomView: React.FC = () => {
  const { profile, addConcentratedStudy } = useApp();

  const presets = [
    { label: '15m Sprint', minutes: 15, xp: 30 },
    { label: '25m Pomodoro', minutes: 25, xp: 50 },
    { label: '45m Deep Drill', minutes: 45, xp: 90 },
    { label: '60m Exam Mock', minutes: 60, xp: 130 }
  ];

  const [selectedDuration, setSelectedDuration] = useState(25);
  const [totalSeconds, setTotalSeconds] = useState(25 * 60);
  const [secondsRemaining, setSecondsRemaining] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [sessionSubject, setSessionSubject] = useState(profile.subjects[0] || 'Mathematics');
  const [sessionTopic, setSessionTopic] = useState('');
  const [ambientSound, setAmbientSound] = useState<'none' | 'white' | 'rain' | 'alpha'>('none');
  const [volume, setVolume] = useState(0.5);
  const [completedSessions, setCompletedSessions] = useState(0);
  const [isZenMode, setIsZenMode] = useState(false);

  // Web Audio Context for generating ambient soundscapes
  const audioCtxRef = useRef<AudioContext | null>(null);
  const noiseNodeRef = useRef<AudioNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);

  // Change duration preset
  const handleSelectPreset = (mins: number) => {
    if (isActive) return;
    setSelectedDuration(mins);
    setTotalSeconds(mins * 60);
    setSecondsRemaining(mins * 60);
  };

  // Timer Tick
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isActive && secondsRemaining > 0) {
      interval = setInterval(() => {
        setSecondsRemaining(prev => prev - 1);
      }, 1000);
    } else if (secondsRemaining === 0 && isActive) {
      setIsActive(false);
      stopAmbientSound();
      const presetObj = presets.find(p => p.minutes === selectedDuration);
      const earnedXP = presetObj ? presetObj.xp : Math.round(selectedDuration * 2);
      addConcentratedStudy(selectedDuration, earnedXP);
      setCompletedSessions(prev => prev + 1);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, secondsRemaining]);

  // Ambient sound synthesizer handler
  const startAmbientSound = (type: 'white' | 'rain' | 'alpha') => {
    stopAmbientSound();

    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      audioCtxRef.current = ctx;

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(volume * 0.15, ctx.currentTime);
      gainNodeRef.current = gain;
      gain.connect(ctx.destination);

      if (type === 'white' || type === 'rain') {
        // Buffer source for noise
        const bufferSize = ctx.sampleRate * 2;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        let lastOut = 0.0;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          if (type === 'rain') {
            // Pink/brown filtered for rain
            lastOut = (lastOut + 0.02 * white) / 1.02;
            data[i] = lastOut * 3.5;
          } else {
            data[i] = white * 0.5;
          }
        }

        const noise = ctx.createBufferSource();
        noise.buffer = buffer;
        noise.loop = true;

        // Bandpass filter for soft soothing tone
        const filter = ctx.createBiquadFilter();
        filter.type = type === 'rain' ? 'lowpass' : 'bandpass';
        filter.frequency.setValueAtTime(type === 'rain' ? 800 : 1200, ctx.currentTime);

        noise.connect(filter);
        filter.connect(gain);
        noise.start();
        noiseNodeRef.current = noise;
      } else if (type === 'alpha') {
        // Binaural focus 432Hz sine wave
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(432, ctx.currentTime);

        const lfo = ctx.createOscillator();
        lfo.type = 'sine';
        lfo.frequency.setValueAtTime(10, ctx.currentTime); // 10Hz Alpha rhythm

        const lfoGain = ctx.createGain();
        lfoGain.gain.setValueAtTime(15, ctx.currentTime);
        lfo.connect(lfoGain);
        lfoGain.connect(osc.frequency);

        osc.connect(gain);
        osc.start();
        lfo.start();
        noiseNodeRef.current = osc;
      }
    } catch (e) {
      console.warn('Ambient audio notice:', e);
    }
  };

  const stopAmbientSound = () => {
    try {
      if (audioCtxRef.current) {
        audioCtxRef.current.close();
        audioCtxRef.current = null;
      }
    } catch (e) {
      // Ignored
    }
  };

  // Change sound
  useEffect(() => {
    if (ambientSound === 'none') {
      stopAmbientSound();
    } else {
      startAmbientSound(ambientSound);
    }
    return () => {
      stopAmbientSound();
    };
  }, [ambientSound]);

  // Volume change
  useEffect(() => {
    if (gainNodeRef.current && audioCtxRef.current) {
      gainNodeRef.current.gain.setValueAtTime(volume * 0.15, audioCtxRef.current.currentTime);
    }
  }, [volume]);

  // Timer format
  const mins = Math.floor(secondsRemaining / 60);
  const secs = secondsRemaining % 60;
  const progressPercent = ((totalSeconds - secondsRemaining) / totalSeconds) * 100;

  return (
    <div className={`space-y-6 max-w-5xl mx-auto pb-12 transition-all ${isZenMode ? 'p-6 fixed inset-0 z-50 bg-stone-950 overflow-y-auto' : ''}`}>
      {/* Zen Mode Header / Return Button */}
      {isZenMode && (
        <div className="flex justify-between items-center text-stone-200 mb-6">
          <span className="font-bold flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-400" /> Deep Focus Zen Mode
          </span>
          <button
            onClick={() => setIsZenMode(false)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-800 text-stone-300 hover:text-white"
          >
            <Minimize2 className="w-4 h-4" /> Exit Zen
          </button>
        </div>
      )}

      {/* Hero Banner */}
      {!isZenMode && (
        <div className="rounded-2xl bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/5 dark:from-amber-950/40 dark:via-orange-950/20 dark:to-stone-900 border border-amber-500/20 p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="p-2 rounded-xl bg-amber-500 text-stone-950 shadow-sm">
                  <Zap className="w-5 h-5" />
                </span>
                <h2 className="text-xl font-bold text-stone-900 dark:text-stone-100">
                  Deep Focus Concentrated Study Room
                </h2>
              </div>
              <p className="text-sm text-stone-600 dark:text-stone-400 max-w-2xl">
                Enter dedicated single-task study sprints without distractions. Complete concentrated focus blocks to earn high-tier XP rewards and build strong study habits.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-xs text-stone-500 dark:text-stone-400">Total Concentrated Time</p>
                <p className="text-lg font-bold text-amber-600 dark:text-amber-400">
                  {profile.concentratedMinutes || 0} Minutes
                </p>
              </div>
              <button
                id="focus-zen-toggle-btn"
                onClick={() => setIsZenMode(true)}
                className="px-3 py-2 rounded-xl bg-stone-900 dark:bg-stone-800 text-stone-100 text-xs font-bold flex items-center gap-1.5 hover:bg-stone-800 transition"
              >
                <Maximize2 className="w-4 h-4" /> Full Screen Zen
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Focus Console */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Timer Ring & Controls */}
        <div className="lg:col-span-2 bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-8 flex flex-col items-center justify-center text-center shadow-sm relative overflow-hidden">
          {/* Preset Buttons */}
          <div className="flex flex-wrap justify-center gap-2 mb-8 z-10">
            {presets.map(preset => (
              <button
                key={preset.minutes}
                id={`focus-preset-${preset.minutes}`}
                disabled={isActive}
                onClick={() => handleSelectPreset(preset.minutes)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  selectedDuration === preset.minutes
                    ? 'bg-amber-500 text-stone-950 shadow-md shadow-amber-500/20'
                    : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700 disabled:opacity-50'
                }`}
              >
                <span>{preset.label}</span>
                <span className="text-[10px] opacity-80">+{preset.xp}XP</span>
              </button>
            ))}
          </div>

          {/* Circular Visual Countdown */}
          <div className="relative w-64 h-64 sm:w-72 sm:h-72 flex items-center justify-center mb-8">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="50%"
                cy="50%"
                r="45%"
                className="text-stone-200 dark:text-stone-800"
                strokeWidth="10"
                stroke="currentColor"
                fill="transparent"
              />
              <circle
                cx="50%"
                cy="50%"
                r="45%"
                className="text-amber-500 transition-all duration-1000 ease-linear"
                strokeWidth="10"
                strokeDasharray={2 * Math.PI * 120}
                strokeDashoffset={2 * Math.PI * 120 * (1 - progressPercent / 100)}
                strokeLinecap="round"
                stroke="currentColor"
                fill="transparent"
              />
            </svg>

            {/* Center Time Display */}
            <div className="absolute flex flex-col items-center">
              <span className="text-5xl sm:text-6xl font-black font-mono tracking-tighter text-stone-900 dark:text-stone-100">
                {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
              </span>
              <span className="text-xs uppercase font-bold tracking-widest text-stone-500 dark:text-stone-400 mt-2">
                {isActive ? 'Deep Focus Active' : 'Ready to Concentrate'}
              </span>
              <span className="text-xs text-amber-600 dark:text-amber-400 font-semibold mt-1">
                {sessionSubject} • {sessionTopic || 'Focus Session'}
              </span>
            </div>
          </div>

          {/* Primary Action Buttons */}
          <div className="flex items-center gap-4 z-10">
            <button
              id="focus-play-pause-btn"
              onClick={() => setIsActive(!isActive)}
              className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-stone-950 font-bold text-base shadow-lg shadow-amber-500/20 transition flex items-center gap-2 cursor-pointer"
            >
              {isActive ? (
                <>
                  <Pause className="w-5 h-5" /> Pause Focus
                </>
              ) : (
                <>
                  <Play className="w-5 h-5 fill-current" /> Start Deep Focus
                </>
              )}
            </button>

            <button
              id="focus-reset-btn"
              onClick={() => {
                setIsActive(false);
                setSecondsRemaining(totalSeconds);
              }}
              className="p-3.5 rounded-2xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-600 dark:text-stone-300 transition"
              title="Reset timer"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Right Col: Topic Setup & Ambient Audio */}
        <div className="space-y-6">
          {/* Target Topic Input */}
          <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-stone-900 dark:text-stone-100 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              Focus Intent Pledge
            </h3>

            <div>
              <label className="block text-xs text-stone-500 dark:text-stone-400 mb-1">Subject</label>
              <select
                id="focus-subject-select"
                value={sessionSubject}
                onChange={e => setSessionSubject(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 text-xs font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
              >
                {profile.subjects.map(s => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs text-stone-500 dark:text-stone-400 mb-1">
                Specific Topic or Exercise
              </label>
              <input
                id="focus-topic-input"
                type="text"
                value={sessionTopic}
                onChange={e => setSessionTopic(e.target.value)}
                placeholder="e.g. NCERT Ex 8.2 Trig proofs or Chemistry Balance"
                className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Ambient Sound Synthesizer */}
          <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-wider text-stone-900 dark:text-stone-100 flex items-center gap-2">
                <Headphones className="w-4 h-4 text-indigo-500" />
                Focus Soundscape
              </h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-500 dark:text-indigo-400 font-bold">
                Synthesizer
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'none', label: 'Off / Silence' },
                { id: 'white', label: 'White Noise' },
                { id: 'rain', label: 'Soft Rain' },
                { id: 'alpha', label: 'Alpha Waves 432Hz' }
              ].map(sound => (
                <button
                  key={sound.id}
                  id={`ambient-${sound.id}`}
                  onClick={() => setAmbientSound(sound.id as any)}
                  className={`p-2.5 rounded-xl text-xs font-semibold border transition text-center ${
                    ambientSound === sound.id
                      ? 'bg-indigo-500/10 dark:bg-indigo-500/20 border-indigo-500 text-indigo-700 dark:text-indigo-300 shadow-sm'
                      : 'border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-800/60'
                  }`}
                >
                  {sound.label}
                </button>
              ))}
            </div>

            {ambientSound !== 'none' && (
              <div className="space-y-1.5 pt-2">
                <div className="flex justify-between text-xs text-stone-500">
                  <span>Volume</span>
                  <span>{Math.round(volume * 100)}%</span>
                </div>
                <input
                  id="ambient-volume-slider"
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={volume}
                  onChange={e => setVolume(parseFloat(e.target.value))}
                  className="w-full accent-indigo-500"
                />
              </div>
            )}
          </div>

          {/* Streak reward card */}
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center gap-3">
            <Flame className="w-6 h-6 text-orange-500 shrink-0" />
            <div className="text-xs">
              <p className="font-bold text-stone-900 dark:text-stone-100">
                Concentrated Study Bonus
              </p>
              <p className="text-stone-600 dark:text-stone-400">
                Completing a 25-minute concentrated block adds <strong>+50 XP</strong> and registers as an active study session in your streak calendar!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
