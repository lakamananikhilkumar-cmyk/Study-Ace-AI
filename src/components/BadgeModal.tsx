import React from 'react';
import {
  X,
  Award,
  Flame,
  Zap,
  Lock,
  CheckCircle2,
  Sparkles,
  Trophy
} from 'lucide-react';
import { useApp } from '../context/AppContext';

interface BadgeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BadgeModal: React.FC<BadgeModalProps> = ({ isOpen, onClose }) => {
  const { profile, badges, dailyMissions } = useApp();

  if (!isOpen) return null;

  const nextLevelXP = profile.levelRank * 150;
  const currentLevelBaseXP = (profile.levelRank - 1) * 150;
  const progressPercent = Math.min(
    100,
    Math.max(0, Math.round(((profile.xp - currentLevelBaseXP) / (nextLevelXP - currentLevelBaseXP)) * 100))
  );

  const getRankTitle = (lvl: number) => {
    if (lvl >= 10) return 'Grandmaster Scholar';
    if (lvl >= 7) return 'Academic Master';
    if (lvl >= 5) return 'Senior Scholar';
    if (lvl >= 3) return 'Ace Apprentice';
    return 'Junior Explorer';
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-stone-900 rounded-3xl max-w-2xl w-full border border-stone-200 dark:border-stone-800 shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="bg-stone-950 text-white p-6 flex items-center justify-between border-b border-stone-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold font-['Outfit'] text-white">
                Gamification, XP & Badges
              </h2>
              <p className="text-xs text-stone-400">
                Reward system designed to build daily study consistency and concept mastery
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-stone-800 rounded-xl text-stone-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Level & XP Overview Banner */}
        <div className="p-6 bg-stone-900 text-white border-b border-stone-800 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                {getRankTitle(profile.levelRank)}
              </span>
              <h3 className="text-2xl font-black font-['Outfit'] text-white">
                Level {profile.levelRank} • <span className="text-amber-400">{profile.xp} XP</span>
              </h3>
            </div>

            <div className="flex items-center gap-2 bg-stone-800/80 px-3 py-1.5 rounded-xl border border-stone-700/80 self-start sm:self-auto">
              <Flame className="w-4 h-4 text-orange-500 fill-orange-500" />
              <span className="text-xs font-bold text-orange-300">
                {profile.streak} Days Consecutive Streak
              </span>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs text-stone-400 mb-1 font-mono">
              <span>{profile.xp - currentLevelBaseXP} / {nextLevelXP - currentLevelBaseXP} XP to Level {profile.levelRank + 1}</span>
              <span>{progressPercent}%</span>
            </div>
            <div className="w-full bg-stone-800 h-2.5 rounded-full overflow-hidden">
              <div
                className="bg-amber-400 h-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Content Body: Badges & Daily Challenges */}
        <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto text-stone-800 dark:text-stone-200">
          {/* Badges Showcase */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase text-stone-700 dark:text-stone-300 tracking-wider flex items-center gap-1.5">
              <Award className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span>Earned & Locked Badges ({badges.filter(b => b.unlocked).length}/{badges.length} Unlocked)</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {badges.map((badge) => (
                <div
                  key={badge.id}
                  className={`p-3.5 rounded-2xl border transition flex items-start gap-3 ${
                    badge.unlocked
                      ? 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-300/80 dark:border-amber-900/50 shadow-2xs'
                      : 'bg-stone-50 dark:bg-stone-800/40 border-stone-200 dark:border-stone-800 opacity-60'
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0 ${
                      badge.unlocked ? 'bg-amber-100 dark:bg-amber-900/60 border border-amber-300 dark:border-amber-700' : 'bg-stone-200 dark:bg-stone-700 grayscale'
                    }`}
                  >
                    {badge.unlocked ? badge.icon : <Lock className="w-4 h-4 text-stone-500" />}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-stone-900 dark:text-stone-100">
                        {badge.name}
                      </span>
                      {badge.unlocked ? (
                        <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/60 px-1.5 py-0.2 rounded">
                          Unlocked
                        </span>
                      ) : (
                        <span className="text-[10px] text-stone-400">
                          Locked
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5 leading-tight">
                      {badge.description}
                    </p>
                    {badge.unlockedDate && (
                      <span className="text-[10px] text-stone-400 mt-1 block">
                        Achieved on {badge.unlockedDate}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Daily Challenges */}
          <div className="space-y-3 pt-3 border-t border-stone-100 dark:border-stone-800">
            <h4 className="text-xs font-bold uppercase text-stone-700 dark:text-stone-300 tracking-wider flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
              <span>Today's Challenges (Complete for bonus XP)</span>
            </h4>

            <div className="space-y-2">
              {dailyMissions.map((mission) => (
                <div
                  key={mission.id}
                  className={`p-3 rounded-xl border flex items-center justify-between gap-3 text-xs ${
                    mission.completed
                      ? 'bg-emerald-50/70 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900 text-emerald-950 dark:text-emerald-300 font-medium'
                      : 'bg-white dark:bg-stone-800 border-stone-200 dark:border-stone-700 text-stone-800 dark:text-stone-200'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {mission.completed ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border border-stone-300 dark:border-stone-600 shrink-0" />
                    )}
                    <span>{mission.title}</span>
                  </div>

                  <span className="font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full shrink-0">
                    +{mission.xpReward} XP
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="p-4 bg-stone-50 border-t border-stone-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
