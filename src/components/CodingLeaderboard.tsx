import React, { useState, useEffect } from 'react';
import {
  Trophy,
  Medal,
  Flame,
  Award,
  Search,
  Sparkles,
  ChevronUp,
  CheckCircle2,
  Terminal,
  Zap,
  TrendingUp,
  Target,
  RefreshCw,
  Info
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export interface LeaderboardStudent {
  id: string;
  rank: number;
  name: string;
  avatar: string;
  classGrade: string;
  school: string;
  dailyPoints: number;
  solvedCount: number;
  streak: number;
  topLanguage: string;
  badges: string[];
  recentSolveDate?: string;
  isCurrentUser?: boolean;
}

interface CodingLeaderboardProps {
  userDailyPoints?: number;
  userSolvedCount?: number;
  userStreak?: number;
  onNavigateToProblems?: () => void;
}

export const CodingLeaderboard: React.FC<CodingLeaderboardProps> = ({
  userDailyPoints = 0,
  userSolvedCount = 0,
  userStreak = 5,
  onNavigateToProblems
}) => {
  const { profile } = useApp();
  const [students, setStudents] = useState<LeaderboardStudent[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('all');
  const [timeframe, setTimeframe] = useState<'all-time' | 'monthly' | 'weekly'>('all-time');
  const [cheeredStudents, setCheeredStudents] = useState<{ [id: string]: boolean }>({});

  const fetchLeaderboard = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/code/leaderboard?rollNumber=${profile?.rollNumber || ''}`);
      const data = await res.json();
      if (data.leaderboard && Array.isArray(data.leaderboard)) {
        setStudents(data.leaderboard);
      }
    } catch (err) {
      console.error('Error loading leaderboard:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, [profile?.rollNumber]);

  // Merge the current user into the standings
  const currentUserEffectivePoints = 350 + (userDailyPoints || 0);
  const currentUserEffectiveSolved = Math.max(userSolvedCount || 0, 5);

  // Combine and sort with current user
  const allEntries: LeaderboardStudent[] = React.useMemo(() => {
    const list: LeaderboardStudent[] = students.map(s => ({ ...s, isCurrentUser: false }));

    const currentUserName = profile?.name || 'You (Current Student)';
    const currentUserRoll = profile?.rollNumber ? `Roll #${profile.rollNumber}` : 'Class 10';
    const currentUserSchool = profile?.school || 'StudyAce Academy Scholar';

    const currentUserEntry: LeaderboardStudent = {
      id: 'current-user-student',
      rank: 0,
      name: currentUserName,
      avatar: profile?.avatar || '🌟',
      classGrade: profile?.classGrade || 'Class 10',
      school: currentUserSchool,
      dailyPoints: currentUserEffectivePoints,
      solvedCount: currentUserEffectiveSolved,
      streak: userStreak || 5,
      topLanguage: 'python',
      badges: ['Rising Star 🚀', 'Daily Contender 🎯'],
      isCurrentUser: true
    };

    // Remove any dummy Aarav if user is named Aarav to avoid duplicate
    const filteredList = list.filter(
      s => !(profile?.name && s.name.toLowerCase() === profile.name.toLowerCase())
    );

    filteredList.push(currentUserEntry);

    // Sort by dailyPoints descending
    filteredList.sort((a, b) => b.dailyPoints - a.dailyPoints);

    // Assign final ranks
    return filteredList.map((item, index) => ({
      ...item,
      rank: index + 1
    }));
  }, [students, currentUserEffectivePoints, currentUserEffectiveSolved, userStreak, profile]);

  // Filtered by language and search query
  const filteredStudents = allEntries.filter(student => {
    const matchesSearch =
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.school.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.classGrade.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesLanguage =
      selectedLanguage === 'all' ||
      student.topLanguage.toLowerCase() === selectedLanguage.toLowerCase() ||
      (selectedLanguage === 'web' && (student.topLanguage === 'html' || student.topLanguage === 'css'));

    return matchesSearch && matchesLanguage;
  });

  // Find current user's entry
  const userRankEntry = allEntries.find(s => s.isCurrentUser);
  const nextRankStudent = userRankEntry && userRankEntry.rank > 1
    ? allEntries.find(s => s.rank === userRankEntry.rank - 1)
    : null;
  const pointsToNextRank = nextRankStudent && userRankEntry
    ? nextRankStudent.dailyPoints - userRankEntry.dailyPoints + 10
    : 0;

  // Podium top 3 (from the current view's top students)
  const topThree = allEntries.slice(0, 3);
  const rank1 = topThree[0];
  const rank2 = topThree[1];
  const rank3 = topThree[2];

  const handleCheer = (studentId: string) => {
    setCheeredStudents(prev => ({ ...prev, [studentId]: !prev[studentId] }));
  };

  return (
    <div id="coding-leaderboard-container" className="space-y-6">
      {/* Header & Overview Banner */}
      <div className="bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-purple-500/10 dark:from-amber-950/40 dark:via-stone-900/60 dark:to-purple-950/30 border border-amber-500/20 rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-600 dark:text-amber-400 text-xs font-mono font-bold uppercase tracking-wider">
              <Trophy className="w-3.5 h-3.5 text-amber-500" />
              Global Daily Problem Hall of Fame
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 dark:text-white tracking-tight">
              Top Coding Problem Solvers
            </h2>
            <p className="text-sm text-stone-600 dark:text-stone-300 max-w-2xl leading-relaxed">
              Earn daily problem points by solving challenges in Python, JavaScript, HTML, C++, and Java. Daily streaks, accuracy, and solution tests elevate your ranking across classes 6th to 10th!
            </p>
          </div>

          {/* Action to solve more daily problems */}
          <div className="flex items-center gap-3">
            <button
              id="leaderboard-refresh-btn"
              onClick={fetchLeaderboard}
              disabled={isLoading}
              className="p-2.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-stone-600 dark:text-stone-300 hover:text-amber-500 transition-colors shadow-xs"
              title="Refresh Leaderboard"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>

            {onNavigateToProblems && (
              <button
                id="solve-more-problems-cta"
                onClick={onNavigateToProblems}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-stone-950 font-bold text-sm shadow-md shadow-amber-500/20 active:scale-95 transition-all"
              >
                <Zap className="w-4 h-4" />
                <span>Solve Today's Challenge (+50 Pts)</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Current User Standings Card */}
      {userRankEntry && (
        <div
          id="user-standing-card"
          className="bg-white dark:bg-stone-900 rounded-2xl p-5 border-2 border-amber-500/40 shadow-lg relative overflow-hidden"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-400 flex items-center justify-center text-2xl shadow-md text-stone-950 font-extrabold shrink-0">
                {userRankEntry.avatar || '🎓'}
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-extrabold text-stone-900 dark:text-white text-lg">
                    {userRankEntry.name}
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-700 dark:text-amber-300 text-xs font-bold font-mono">
                    YOU
                  </span>
                  <span className="text-xs text-stone-500 dark:text-stone-400">
                    • {userRankEntry.school}
                  </span>
                </div>
                <div className="flex items-center gap-4 mt-1 text-xs text-stone-600 dark:text-stone-400 flex-wrap">
                  <span className="flex items-center gap-1 font-semibold text-amber-600 dark:text-amber-400">
                    <Trophy className="w-3.5 h-3.5" />
                    Global Rank: #{userRankEntry.rank} of {allEntries.length}
                  </span>
                  <span className="flex items-center gap-1 font-semibold text-orange-500">
                    <Flame className="w-3.5 h-3.5" />
                    {userRankEntry.streak} Day Streak
                  </span>
                  <span className="flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {userRankEntry.solvedCount} Daily Problems Solved
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 self-end sm:self-center">
              <div className="text-right">
                <span className="text-[11px] uppercase tracking-wider text-stone-500 dark:text-stone-400 font-bold block">
                  Daily Problem Points
                </span>
                <span className="text-2xl font-black text-amber-500 font-mono">
                  {userRankEntry.dailyPoints} Pts
                </span>
              </div>
              {pointsToNextRank > 0 && (
                <div className="hidden md:block bg-stone-100 dark:bg-stone-800/80 px-3 py-1.5 rounded-xl text-[11px] text-stone-600 dark:text-stone-300 border border-stone-200 dark:border-stone-700 font-medium">
                  <span className="text-amber-600 dark:text-amber-400 font-bold">+{pointsToNextRank} pts</span> to reach Rank #{userRankEntry.rank - 1}!
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Top 3 Podium (Olympic Style) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
        {/* Silver - Rank 2 */}
        {rank2 && (
          <div
            id="podium-rank-2"
            className="bg-white dark:bg-stone-900 rounded-3xl p-5 border border-stone-200 dark:border-stone-800 shadow-md flex flex-col justify-between items-center text-center relative order-2 md:order-1 transform md:translate-y-4"
          >
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-slate-300 dark:bg-slate-700 text-slate-800 dark:text-slate-100 text-xs font-black font-mono shadow-sm flex items-center gap-1">
              <Medal className="w-3.5 h-3.5 text-slate-400" />
              RANK #2
            </div>
            <div className="mt-2 w-16 h-16 rounded-2xl bg-gradient-to-tr from-slate-300 to-slate-100 dark:from-slate-700 dark:to-slate-600 flex items-center justify-center text-3xl shadow-inner mb-3">
              {rank2.avatar}
            </div>
            <h3 className="font-bold text-stone-900 dark:text-white text-base truncate max-w-full">
              {rank2.name}
            </h3>
            <p className="text-xs text-stone-500 dark:text-stone-400 truncate max-w-full">
              {rank2.school}
            </p>
            <div className="mt-3 flex items-center justify-center gap-2">
              <span className="px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-mono font-bold uppercase">
                {rank2.topLanguage}
              </span>
              <span className="flex items-center gap-1 text-xs text-orange-500 font-bold">
                <Flame className="w-3.5 h-3.5" />
                {rank2.streak}d
              </span>
            </div>
            <div className="mt-4 pt-3 border-t border-stone-100 dark:border-stone-800 w-full flex items-center justify-between px-2 text-xs">
              <span className="text-stone-500 dark:text-stone-400">{rank2.solvedCount} Solved</span>
              <span className="font-extrabold text-stone-900 dark:text-stone-100 font-mono text-sm">
                {rank2.dailyPoints} Pts
              </span>
            </div>
          </div>
        )}

        {/* Gold - Rank 1 (Tallest / Highlighted) */}
        {rank1 && (
          <div
            id="podium-rank-1"
            className="bg-gradient-to-b from-amber-500/10 via-white to-white dark:from-amber-950/40 dark:via-stone-900 dark:to-stone-900 rounded-3xl p-6 border-2 border-amber-500/60 shadow-xl flex flex-col justify-between items-center text-center relative order-1 md:order-2"
          >
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 text-stone-950 text-xs font-black font-mono shadow-md flex items-center gap-1">
              <Trophy className="w-4 h-4 text-stone-950" />
              CHAMPION #1
            </div>
            <div className="mt-2 w-20 h-20 rounded-2xl bg-gradient-to-tr from-amber-400 to-yellow-300 flex items-center justify-center text-4xl shadow-lg shadow-amber-500/30 mb-3 relative">
              {rank1.avatar}
              <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-amber-500 flex items-center justify-center text-white text-xs font-bold shadow-sm">
                👑
              </div>
            </div>
            <h3 className="font-extrabold text-stone-900 dark:text-white text-lg truncate max-w-full">
              {rank1.name}
            </h3>
            <p className="text-xs text-stone-500 dark:text-stone-400 truncate max-w-full font-medium">
              {rank1.school}
            </p>
            <div className="mt-3 flex items-center justify-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300 text-xs font-mono font-bold uppercase">
                {rank1.topLanguage}
              </span>
              <span className="flex items-center gap-1 text-xs text-orange-500 font-bold">
                <Flame className="w-3.5 h-3.5" />
                {rank1.streak}d Streak
              </span>
            </div>
            <div className="mt-4 pt-3 border-t border-amber-500/20 w-full flex items-center justify-between px-2 text-xs">
              <span className="text-stone-500 dark:text-stone-400 font-medium">
                {rank1.solvedCount} Problems Solved
              </span>
              <span className="font-black text-amber-500 font-mono text-base">
                {rank1.dailyPoints} Pts
              </span>
            </div>
          </div>
        )}

        {/* Bronze - Rank 3 */}
        {rank3 && (
          <div
            id="podium-rank-3"
            className="bg-white dark:bg-stone-900 rounded-3xl p-5 border border-stone-200 dark:border-stone-800 shadow-md flex flex-col justify-between items-center text-center relative order-3 md:order-3 transform md:translate-y-6"
          >
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-amber-700/80 text-amber-100 text-xs font-black font-mono shadow-sm flex items-center gap-1">
              <Medal className="w-3.5 h-3.5 text-amber-300" />
              RANK #3
            </div>
            <div className="mt-2 w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-700 to-amber-600 flex items-center justify-center text-3xl shadow-inner mb-3">
              {rank3.avatar}
            </div>
            <h3 className="font-bold text-stone-900 dark:text-white text-base truncate max-w-full">
              {rank3.name}
            </h3>
            <p className="text-xs text-stone-500 dark:text-stone-400 truncate max-w-full">
              {rank3.school}
            </p>
            <div className="mt-3 flex items-center justify-center gap-2">
              <span className="px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-mono font-bold uppercase">
                {rank3.topLanguage}
              </span>
              <span className="flex items-center gap-1 text-xs text-orange-500 font-bold">
                <Flame className="w-3.5 h-3.5" />
                {rank3.streak}d
              </span>
            </div>
            <div className="mt-4 pt-3 border-t border-stone-100 dark:border-stone-800 w-full flex items-center justify-between px-2 text-xs">
              <span className="text-stone-500 dark:text-stone-400">{rank3.solvedCount} Solved</span>
              <span className="font-extrabold text-stone-900 dark:text-stone-100 font-mono text-sm">
                {rank3.dailyPoints} Pts
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-stone-900 rounded-2xl p-4 border border-stone-200 dark:border-stone-800 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            id="search-leaderboard-input"
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search student or school..."
            className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm rounded-xl bg-stone-100 dark:bg-stone-800 border-none focus:ring-2 focus:ring-amber-500 text-stone-900 dark:text-white placeholder-stone-400"
          />
        </div>

        {/* Language Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto no-scrollbar">
          {[
            { id: 'all', label: 'All Languages' },
            { id: 'python', label: 'Python' },
            { id: 'javascript', label: 'JavaScript' },
            { id: 'cpp', label: 'C++' },
            { id: 'java', label: 'Java' },
            { id: 'web', label: 'HTML/CSS' }
          ].map(lang => (
            <button
              key={lang.id}
              onClick={() => setSelectedLanguage(lang.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedLanguage === lang.id
                  ? 'bg-stone-900 dark:bg-white text-white dark:text-stone-900 shadow-xs'
                  : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700'
              }`}
            >
              {lang.label}
            </button>
          ))}
        </div>
      </div>

      {/* Leaderboard Table / List */}
      <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xs overflow-hidden">
        <div className="px-5 py-3.5 bg-stone-50 dark:bg-stone-800/50 border-b border-stone-200 dark:border-stone-800 grid grid-cols-12 text-xs font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
          <div className="col-span-1 text-center">#</div>
          <div className="col-span-5 sm:col-span-4">Student & School</div>
          <div className="hidden sm:block sm:col-span-2 text-center">Language & Badges</div>
          <div className="col-span-3 sm:col-span-2 text-center">Problems & Streak</div>
          <div className="col-span-3 text-right">Daily Points</div>
        </div>

        <div className="divide-y divide-stone-100 dark:divide-stone-800">
          {filteredStudents.length === 0 ? (
            <div className="p-8 text-center text-stone-500 text-sm">
              No students found matching "{searchQuery}".
            </div>
          ) : (
            filteredStudents.map((student) => {
              const isTop3 = student.rank <= 3;
              const isCheered = cheeredStudents[student.id];

              return (
                <div
                  key={student.id}
                  id={`leaderboard-row-${student.rank}`}
                  className={`px-5 py-3.5 grid grid-cols-12 items-center text-sm transition-colors ${
                    student.isCurrentUser
                      ? 'bg-amber-500/10 dark:bg-amber-500/15 font-semibold'
                      : 'hover:bg-stone-50 dark:hover:bg-stone-800/40'
                  }`}
                >
                  {/* Rank Badge */}
                  <div className="col-span-1 flex items-center justify-center">
                    {student.rank === 1 ? (
                      <span className="w-7 h-7 rounded-full bg-amber-400 text-stone-950 font-black flex items-center justify-center text-xs shadow-xs">
                        🥇
                      </span>
                    ) : student.rank === 2 ? (
                      <span className="w-7 h-7 rounded-full bg-slate-300 dark:bg-slate-600 text-stone-950 dark:text-white font-black flex items-center justify-center text-xs shadow-xs">
                        🥈
                      </span>
                    ) : student.rank === 3 ? (
                      <span className="w-7 h-7 rounded-full bg-amber-700 text-white font-black flex items-center justify-center text-xs shadow-xs">
                        🥉
                      </span>
                    ) : (
                      <span className="font-mono text-stone-500 dark:text-stone-400 font-bold text-xs">
                        #{student.rank}
                      </span>
                    )}
                  </div>

                  {/* Student Info */}
                  <div className="col-span-5 sm:col-span-4 flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-stone-100 dark:bg-stone-800 flex items-center justify-center text-lg shrink-0">
                      {student.avatar}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-bold text-stone-900 dark:text-white truncate">
                          {student.name}
                        </span>
                        {student.isCurrentUser && (
                          <span className="px-1.5 py-0.2 rounded bg-amber-500 text-stone-950 font-black text-[10px] font-mono">
                            YOU
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-stone-500 dark:text-stone-400 truncate">
                        {student.classGrade} • {student.school}
                      </p>
                    </div>
                  </div>

                  {/* Language & Badges */}
                  <div className="hidden sm:flex sm:col-span-2 flex-col items-center justify-center gap-1">
                    <span className="px-2 py-0.5 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 text-xs font-mono font-bold uppercase">
                      {student.topLanguage}
                    </span>
                    {student.badges[0] && (
                      <span className="text-[10px] text-stone-500 dark:text-stone-400 truncate max-w-[120px]">
                        {student.badges[0]}
                      </span>
                    )}
                  </div>

                  {/* Problems & Streak */}
                  <div className="col-span-3 sm:col-span-2 flex flex-col items-center justify-center">
                    <span className="font-mono text-xs font-bold text-stone-900 dark:text-stone-200">
                      {student.solvedCount} Solved
                    </span>
                    <span className="flex items-center gap-0.5 text-xs text-orange-500 font-medium font-mono">
                      <Flame className="w-3 h-3" />
                      {student.streak}d streak
                    </span>
                  </div>

                  {/* Daily Points & Cheer */}
                  <div className="col-span-3 flex items-center justify-end gap-2">
                    <div className="text-right">
                      <span className="font-mono font-black text-amber-600 dark:text-amber-400 text-sm sm:text-base">
                        {student.dailyPoints}
                      </span>
                      <span className="text-[10px] text-stone-400 block font-sans">Points</span>
                    </div>

                    {!student.isCurrentUser && (
                      <button
                        onClick={() => handleCheer(student.id)}
                        className={`p-1.5 rounded-lg text-xs transition-colors ${
                          isCheered
                            ? 'bg-red-500/10 text-red-500'
                            : 'text-stone-400 hover:text-red-500 hover:bg-stone-100 dark:hover:bg-stone-800'
                        }`}
                        title={isCheered ? 'Cheered!' : 'Cheer this student'}
                      >
                        {isCheered ? '❤️' : '🤍'}
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Rules / Point Scoring Reference Guide */}
      <div className="bg-stone-50 dark:bg-stone-800/40 rounded-2xl p-4 border border-stone-200 dark:border-stone-800 flex items-start gap-3 text-xs text-stone-600 dark:text-stone-400">
        <Info className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-stone-900 dark:text-white">How Daily Problem Points Work:</span>
          <div className="mt-1 grid grid-cols-2 sm:grid-cols-4 gap-2">
            <span className="bg-white dark:bg-stone-800 px-2 py-1 rounded border border-stone-200 dark:border-stone-700">
              🟢 Easy Problem: <strong>+50 Pts</strong>
            </span>
            <span className="bg-white dark:bg-stone-800 px-2 py-1 rounded border border-stone-200 dark:border-stone-700">
              🟡 Medium Problem: <strong>+75 Pts</strong>
            </span>
            <span className="bg-white dark:bg-stone-800 px-2 py-1 rounded border border-stone-200 dark:border-stone-700">
              🔴 Hard Problem: <strong>+100 Pts</strong>
            </span>
            <span className="bg-white dark:bg-stone-800 px-2 py-1 rounded border border-stone-200 dark:border-stone-700">
              🔥 Daily Streak Bonus: <strong>+30 Pts</strong>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
