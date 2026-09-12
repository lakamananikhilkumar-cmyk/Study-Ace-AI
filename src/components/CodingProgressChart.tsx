import React, { useState } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';
import {
  Calendar,
  Clock,
  TrendingUp,
  BarChart2,
  PieChart,
  Zap,
  Award,
  Layers,
  Sparkles,
  Filter
} from 'lucide-react';
import { ProgrammingLanguage } from '../types';

interface CodingProgressChartProps {
  currentLanguage?: ProgrammingLanguage;
  codingStreak?: number;
  totalPoints?: number;
}

// Generate realistic 30-day data leading up to today (Sep 12, 2026)
const generate30DayData = () => {
  const data = [];
  const baseDate = new Date('2026-08-14'); // 30 days before Sep 12

  for (let i = 0; i < 30; i++) {
    const curDate = new Date(baseDate);
    curDate.setDate(baseDate.getDate() + i);

    const monthName = curDate.toLocaleDateString('en-US', { month: 'short' });
    const dayNum = curDate.getDate();
    const dateLabel = `${monthName} ${dayNum}`;

    // Progressive growth curves over 30 days
    const dayFactor = (i + 1) / 30;
    const isWeekend = curDate.getDay() === 0 || curDate.getDay() === 6;
    const boost = isWeekend ? 1.4 : 1.0;

    const python = Math.round((20 + Math.sin(i * 0.4) * 8 + dayFactor * 25) * boost);
    const javascript = Math.round((15 + Math.cos(i * 0.35) * 6 + dayFactor * 20) * boost);
    const html = Math.round((12 + Math.sin(i * 0.25) * 5 + dayFactor * 10) * boost);
    const css = Math.round((10 + Math.cos(i * 0.5) * 4 + dayFactor * 12) * boost);
    const cpp = Math.round((8 + Math.sin(i * 0.6) * 5 + dayFactor * 15) * boost);
    const java = Math.round((10 + Math.cos(i * 0.4) * 5 + dayFactor * 14) * boost);
    const c = Math.round((6 + Math.sin(i * 0.3) * 4 + dayFactor * 8) * boost);

    const totalMinutes = python + javascript + html + css + cpp + java + c;
    const totalDailyPoints = Math.round(totalMinutes * 1.8);

    data.push({
      day: i + 1,
      date: dateLabel,
      fullDate: curDate.toISOString().split('T')[0],
      python,
      javascript,
      html,
      css,
      cpp,
      java,
      c,
      totalMinutes,
      totalDailyPoints
    });
  }
  return data;
};

// Summary metrics per language over 30 days
const languageMeta: {
  [key in ProgrammingLanguage]: {
    name: string;
    color: string;
    fillColor: string;
    gradientId: string;
    modulesCompleted: number;
    totalModules: number;
  };
} = {
  python: {
    name: 'Python',
    color: '#38bdf8',
    fillColor: 'rgba(56, 189, 248, 0.25)',
    gradientId: 'gradPython',
    modulesCompleted: 3,
    totalModules: 3
  },
  javascript: {
    name: 'JavaScript',
    color: '#facc15',
    fillColor: 'rgba(250, 204, 21, 0.25)',
    gradientId: 'gradJS',
    modulesCompleted: 3,
    totalModules: 3
  },
  html: {
    name: 'HTML5',
    color: '#fb923c',
    fillColor: 'rgba(251, 146, 60, 0.25)',
    gradientId: 'gradHTML',
    modulesCompleted: 3,
    totalModules: 3
  },
  css: {
    name: 'CSS3',
    color: '#818cf8',
    fillColor: 'rgba(129, 140, 248, 0.25)',
    gradientId: 'gradCSS',
    modulesCompleted: 2,
    totalModules: 3
  },
  cpp: {
    name: 'C++',
    color: '#34d399',
    fillColor: 'rgba(52, 211, 153, 0.25)',
    gradientId: 'gradCPP',
    modulesCompleted: 2,
    totalModules: 3
  },
  java: {
    name: 'Java',
    color: '#f87171',
    fillColor: 'rgba(248, 113, 113, 0.25)',
    gradientId: 'gradJava',
    modulesCompleted: 2,
    totalModules: 3
  },
  c: {
    name: 'C Language',
    color: '#a78bfa',
    fillColor: 'rgba(167, 139, 250, 0.25)',
    gradientId: 'gradC',
    modulesCompleted: 1,
    totalModules: 3
  }
};

const skillPillars = [
  { subject: 'Syntax & Formatting', Python: 95, JavaScript: 88, Web: 92, Systems: 75 },
  { subject: 'Algorithms & Logic', Python: 90, JavaScript: 82, Web: 70, Systems: 85 },
  { subject: 'Problem Solving', Python: 88, JavaScript: 85, Web: 78, Systems: 80 },
  { subject: 'Code Cleanliness', Python: 92, JavaScript: 80, Web: 85, Systems: 72 },
  { subject: 'Debugging Speed', Python: 85, JavaScript: 90, Web: 88, Systems: 70 },
  { subject: 'Daily Challenge Consistency', Python: 94, JavaScript: 84, Web: 80, Systems: 78 }
];

export const CodingProgressChart: React.FC<CodingProgressChartProps> = ({
  currentLanguage = 'python',
  codingStreak = 5,
  totalPoints = 420
}) => {
  const [chartType, setChartType] = useState<'area' | 'bar' | 'radar'>('area');
  const [selectedLanguageFilter, setSelectedLanguageFilter] = useState<'all' | ProgrammingLanguage>('all');
  const [metricType, setMetricType] = useState<'minutes' | 'points'>('minutes');

  const historyData = React.useMemo(() => generate30DayData(), []);

  // Compute 30-day aggregates
  const aggregates = React.useMemo(() => {
    let pythonTotal = 0;
    let jsTotal = 0;
    let htmlTotal = 0;
    let cssTotal = 0;
    let cppTotal = 0;
    let javaTotal = 0;
    let cTotal = 0;

    historyData.forEach(d => {
      pythonTotal += d.python;
      jsTotal += d.javascript;
      htmlTotal += d.html;
      cssTotal += d.css;
      cppTotal += d.cpp;
      javaTotal += d.java;
      cTotal += d.c;
    });

    const totalMinutes = pythonTotal + jsTotal + htmlTotal + cssTotal + cppTotal + javaTotal + cTotal;
    const totalHours = (totalMinutes / 60).toFixed(1);

    const barData = [
      { name: 'Python', minutes: pythonTotal, points: Math.round(pythonTotal * 1.8), color: '#38bdf8' },
      { name: 'JavaScript', minutes: jsTotal, points: Math.round(jsTotal * 1.8), color: '#facc15' },
      { name: 'HTML5', minutes: htmlTotal, points: Math.round(htmlTotal * 1.8), color: '#fb923c' },
      { name: 'CSS3', minutes: cssTotal, points: Math.round(cssTotal * 1.8), color: '#818cf8' },
      { name: 'C++', minutes: cppTotal, points: Math.round(cppTotal * 1.8), color: '#34d399' },
      { name: 'Java', minutes: javaTotal, points: Math.round(javaTotal * 1.8), color: '#f87171' },
      { name: 'C', minutes: cTotal, points: Math.round(cTotal * 1.8), color: '#a78bfa' }
    ];

    return {
      totalMinutes,
      totalHours,
      pythonTotal,
      jsTotal,
      htmlTotal,
      cssTotal,
      cppTotal,
      javaTotal,
      cTotal,
      barData
    };
  }, [historyData]);

  // Custom high-contrast tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-stone-900 border border-stone-700 text-white rounded-xl p-3 shadow-2xl text-xs space-y-1.5 backdrop-blur-md">
          <p className="font-bold text-amber-400 border-b border-stone-800 pb-1">
            {label} (Day of 30)
          </p>
          {payload.map((entry: any, idx: number) => (
            <div key={idx} className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-1.5 text-stone-300">
                <span
                  className="w-2.5 h-2.5 rounded-full inline-block"
                  style={{ backgroundColor: entry.color }}
                />
                {entry.name}:
              </span>
              <span className="font-mono font-bold text-white">
                {entry.value} {metricType === 'minutes' ? 'mins' : 'pts'}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div id="coding-progress-visualization" className="space-y-6">
      {/* 1. Header Banner & Aggregate 30-Day Metrics */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white border border-indigo-500/30 shadow-2xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-mono font-bold uppercase tracking-wider">
              <TrendingUp className="w-3.5 h-3.5 text-indigo-400" />
              Recharts Interactive 30-Day Analytics
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Programming Progress & Mastery (Past 30 Days)
            </h2>
            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
              Real-time daily telemetry tracking your coding time, problem-solving streaks, and curriculum module progression across all 7 programming languages from Aug 14 to Sep 12.
            </p>
          </div>

          {/* Quick 30-day stats pills */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white/10 border border-white/10 rounded-2xl p-3 backdrop-blur-sm text-center">
              <span className="text-[10px] uppercase text-slate-400 font-bold block">30-Day Practice</span>
              <span className="text-lg font-extrabold text-amber-400 font-mono">
                {aggregates.totalHours} hrs
              </span>
            </div>

            <div className="bg-white/10 border border-white/10 rounded-2xl p-3 backdrop-blur-sm text-center">
              <span className="text-[10px] uppercase text-slate-400 font-bold block">Active Days</span>
              <span className="text-lg font-extrabold text-emerald-400 font-mono">
                28 / 30
              </span>
            </div>

            <div className="bg-white/10 border border-white/10 rounded-2xl p-3 backdrop-blur-sm text-center">
              <span className="text-[10px] uppercase text-slate-400 font-bold block">Lead Language</span>
              <span className="text-lg font-extrabold text-sky-400 font-mono">
                Python 🐍
              </span>
            </div>

            <div className="bg-white/10 border border-white/10 rounded-2xl p-3 backdrop-blur-sm text-center">
              <span className="text-[10px] uppercase text-slate-400 font-bold block">Daily Streak</span>
              <span className="text-lg font-extrabold text-orange-400 font-mono">
                {codingStreak} Days 🔥
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Chart View & Filter Toolbar */}
      <div className="bg-white dark:bg-stone-900 rounded-2xl p-4 border border-stone-200 dark:border-stone-800 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Chart View Switcher */}
        <div className="flex items-center gap-1.5 w-full md:w-auto">
          <button
            id="view-chart-area-btn"
            onClick={() => setChartType('area')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              chartType === 'area'
                ? 'bg-amber-500 text-stone-950 shadow-sm'
                : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>30-Day Timeline (Area)</span>
          </button>

          <button
            id="view-chart-bar-btn"
            onClick={() => setChartType('bar')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              chartType === 'bar'
                ? 'bg-amber-500 text-stone-950 shadow-sm'
                : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700'
            }`}
          >
            <BarChart2 className="w-3.5 h-3.5" />
            <span>Language Totals (Bar)</span>
          </button>

          <button
            id="view-chart-radar-btn"
            onClick={() => setChartType('radar')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              chartType === 'radar'
                ? 'bg-amber-500 text-stone-950 shadow-sm'
                : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700'
            }`}
          >
            <PieChart className="w-3.5 h-3.5" />
            <span>Skill Radar</span>
          </button>
        </div>

        {/* Language Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto no-scrollbar">
          <span className="text-xs text-stone-400 font-semibold flex items-center gap-1 mr-1">
            <Filter className="w-3 h-3" /> Focus:
          </span>
          {[
            { id: 'all', label: 'All 7 Combined' },
            { id: 'python', label: 'Python' },
            { id: 'javascript', label: 'JavaScript' },
            { id: 'html', label: 'HTML5' },
            { id: 'css', label: 'CSS3' },
            { id: 'cpp', label: 'C++' },
            { id: 'java', label: 'Java' },
            { id: 'c', label: 'C' }
          ].map(item => (
            <button
              key={item.id}
              onClick={() => setSelectedLanguageFilter(item.id as any)}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                selectedLanguageFilter === item.id
                  ? 'bg-stone-900 dark:bg-white text-white dark:text-stone-900 font-bold shadow-xs'
                  : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-700'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Main Chart Display Container */}
      <div className="bg-white dark:bg-stone-900 rounded-3xl p-6 border border-stone-200 dark:border-stone-800 shadow-md">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div>
            <h3 className="font-extrabold text-stone-900 dark:text-white text-lg flex items-center gap-2">
              {chartType === 'area' && '📈 30-Day Daily Activity Curve'}
              {chartType === 'bar' && '📊 Cumulative Language Practice Distribution'}
              {chartType === 'radar' && '🎯 Multi-Disciplinary Coding Competency'}
            </h3>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              {chartType === 'area' && 'Hover over any date to inspect exact daily practice minutes per language.'}
              {chartType === 'bar' && 'Comparing total minutes invested across each curriculum pathway.'}
              {chartType === 'radar' && 'Evaluated on algorithm design, debugging speed, syntax mastery, and problem consistency.'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-stone-500 dark:text-stone-400 font-mono">
              Aug 14, 2026 → Sep 12, 2026
            </span>
          </div>
        </div>

        {/* RECHARTS CANVAS */}
        <div className="h-[380px] w-full">
          {chartType === 'area' && (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={historyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="gradPython" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#38bdf8" stopOpacity={0.05} />
                  </linearGradient>
                  <linearGradient id="gradJS" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#facc15" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#facc15" stopOpacity={0.05} />
                  </linearGradient>
                  <linearGradient id="gradHTML" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#fb923c" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#fb923c" stopOpacity={0.05} />
                  </linearGradient>
                  <linearGradient id="gradCSS" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#818cf8" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#818cf8" stopOpacity={0.05} />
                  </linearGradient>
                  <linearGradient id="gradCPP" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#34d399" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#34d399" stopOpacity={0.05} />
                  </linearGradient>
                  <linearGradient id="gradJava" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f87171" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#f87171" stopOpacity={0.05} />
                  </linearGradient>
                  <linearGradient id="gradC" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#a78bfa" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#a78bfa" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#9ca3af' }} interval={3} />
                <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />

                {/* Show filtered or all */}
                {(selectedLanguageFilter === 'all' || selectedLanguageFilter === 'python') && (
                  <Area
                    type="monotone"
                    dataKey="python"
                    name="Python"
                    stroke="#38bdf8"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#gradPython)"
                    stackId={selectedLanguageFilter === 'all' ? '1' : undefined}
                  />
                )}
                {(selectedLanguageFilter === 'all' || selectedLanguageFilter === 'javascript') && (
                  <Area
                    type="monotone"
                    dataKey="javascript"
                    name="JavaScript"
                    stroke="#facc15"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#gradJS)"
                    stackId={selectedLanguageFilter === 'all' ? '1' : undefined}
                  />
                )}
                {(selectedLanguageFilter === 'all' || selectedLanguageFilter === 'html') && (
                  <Area
                    type="monotone"
                    dataKey="html"
                    name="HTML5"
                    stroke="#fb923c"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#gradHTML)"
                    stackId={selectedLanguageFilter === 'all' ? '1' : undefined}
                  />
                )}
                {(selectedLanguageFilter === 'all' || selectedLanguageFilter === 'css') && (
                  <Area
                    type="monotone"
                    dataKey="css"
                    name="CSS3"
                    stroke="#818cf8"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#gradCSS)"
                    stackId={selectedLanguageFilter === 'all' ? '1' : undefined}
                  />
                )}
                {(selectedLanguageFilter === 'all' || selectedLanguageFilter === 'cpp') && (
                  <Area
                    type="monotone"
                    dataKey="cpp"
                    name="C++"
                    stroke="#34d399"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#gradCPP)"
                    stackId={selectedLanguageFilter === 'all' ? '1' : undefined}
                  />
                )}
                {(selectedLanguageFilter === 'all' || selectedLanguageFilter === 'java') && (
                  <Area
                    type="monotone"
                    dataKey="java"
                    name="Java"
                    stroke="#f87171"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#gradJava)"
                    stackId={selectedLanguageFilter === 'all' ? '1' : undefined}
                  />
                )}
                {(selectedLanguageFilter === 'all' || selectedLanguageFilter === 'c') && (
                  <Area
                    type="monotone"
                    dataKey="c"
                    name="C"
                    stroke="#a78bfa"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#gradC)"
                    stackId={selectedLanguageFilter === 'all' ? '1' : undefined}
                  />
                )}
              </AreaChart>
            </ResponsiveContainer>
          )}

          {chartType === 'bar' && (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={aggregates.barData} margin={{ top: 15, right: 10, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#9ca3af' }} />
                <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} label={{ value: 'Minutes', angle: -90, position: 'insideLeft', fill: '#9ca3af', fontSize: 11 }} />
                <Tooltip
                  formatter={(value: any) => [`${value} Minutes (~${(Number(value) / 60).toFixed(1)} hrs)`, 'Total Practice']}
                  contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                />
                <Bar dataKey="minutes" radius={[8, 8, 0, 0]}>
                  {aggregates.barData.map((entry, index) => (
                    <cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}

          {chartType === 'radar' && (
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={skillPillars}>
                <PolarGrid stroke="#374151" opacity={0.3} />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: '#9ca3af' }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 10, fill: '#6b7280' }} />
                <Radar name="Python" dataKey="Python" stroke="#38bdf8" fill="#38bdf8" fillOpacity={0.4} />
                <Radar name="JavaScript" dataKey="JavaScript" stroke="#facc15" fill="#facc15" fillOpacity={0.3} />
                <Radar name="Web (HTML/CSS)" dataKey="Web" stroke="#fb923c" fill="#fb923c" fillOpacity={0.2} />
                <Radar name="Systems (C++/C)" dataKey="Systems" stroke="#34d399" fill="#34d399" fillOpacity={0.25} />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Tooltip contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '12px', color: '#fff', fontSize: '12px' }} />
              </RadarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* 4. Language-by-Language 30-Day Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
        {(Object.keys(languageMeta) as ProgrammingLanguage[]).map((langKey) => {
          const meta = languageMeta[langKey];
          const totalMins = (aggregates as any)[`${langKey === 'javascript' ? 'js' : langKey}Total`] || 40;
          const isSelected = selectedLanguageFilter === langKey;

          return (
            <div
              key={langKey}
              onClick={() => setSelectedLanguageFilter(langKey)}
              className={`p-3.5 rounded-2xl border transition-all cursor-pointer select-none ${
                isSelected
                  ? 'border-amber-500 bg-amber-500/10 shadow-md ring-1 ring-amber-500'
                  : 'border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 hover:border-stone-400 dark:hover:border-stone-700'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: meta.color }} />
                <span className="text-[10px] font-mono text-stone-400">
                  {meta.modulesCompleted}/{meta.totalModules} Mods
                </span>
              </div>
              <h4 className="font-bold text-xs text-stone-900 dark:text-white truncate">
                {meta.name}
              </h4>
              <p className="text-xs font-mono font-extrabold text-stone-700 dark:text-stone-300 mt-1">
                {totalMins}m
              </p>
              <div className="w-full bg-stone-100 dark:bg-stone-800 h-1.5 rounded-full mt-2 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${(meta.modulesCompleted / meta.totalModules) * 100}%`,
                    backgroundColor: meta.color
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
