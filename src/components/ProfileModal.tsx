import React, { useState } from 'react';
import {
  X,
  User,
  GraduationCap,
  Target,
  BookOpen,
  Calendar,
  Clock,
  Sparkles,
  Check,
  RotateCcw,
  IdCard,
  ShieldCheck,
  LogOut
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ClassGrade, LearningLevel, SubjectName, EducationBoard } from '../types';
import { SAMPLE_STUDENTS } from '../data/defaultData';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose }) => {
  const { profile, updateProfile, switchProfile, logout } = useApp();

  const [name, setName] = useState<string>(profile.name);
  const [classGrade, setClassGrade] = useState<ClassGrade>(profile.classGrade);
  const [board, setBoard] = useState<EducationBoard>(profile.board);
  const [level, setLevel] = useState<LearningLevel>(profile.level);
  const [dailyHours, setDailyHours] = useState<number>(profile.dailyStudyHours);
  const [targetExam, setTargetExam] = useState<string>(profile.targetExamName || '');
  const [examDate, setExamDate] = useState<string>(profile.examDate || '');
  const [selectedSubjects, setSelectedSubjects] = useState<SubjectName[]>(profile.subjects);
  const [goalsText, setGoalsText] = useState<string>(profile.studyGoals.join('\n'));

  if (!isOpen) return null;

  const allAvailableSubjects: SubjectName[] = [
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

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      name,
      classGrade,
      board,
      level,
      dailyStudyHours: dailyHours,
      targetExamName: targetExam,
      examDate,
      subjects: selectedSubjects,
      studyGoals: goalsText.split('\n').map(g => g.trim()).filter(Boolean)
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-stone-900 rounded-3xl max-w-2xl w-full border border-stone-200 dark:border-stone-800 shadow-2xl overflow-hidden my-8 transition-colors">
        {/* Modal Header */}
        <div className="bg-stone-900 dark:bg-stone-950 text-white p-6 flex items-center justify-between border-b border-stone-800">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500 text-stone-950 flex items-center justify-center font-bold text-xl shadow-md">
              {profile.avatar || '👨‍🎓'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold">Student Profile & Settings</h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 font-bold flex items-center gap-1 border border-amber-400/30">
                  <IdCard className="w-3 h-3 inline" /> Roll No: {profile.rollNumber || '48291'}
                </span>
              </div>
              <p className="text-xs text-stone-400">
                Personalized syllabus and difficulty configuration for classes 6th to 10th
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

        {/* Preset Student Switcher Bar */}
        <div className="bg-stone-100 dark:bg-stone-800/60 px-6 py-3 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between flex-wrap gap-2 text-xs">
          <span className="font-bold text-stone-700 dark:text-stone-300">Quick Switch Student:</span>
          <div className="flex items-center gap-2">
            {SAMPLE_STUDENTS.map(sample => (
              <button
                key={sample.id}
                type="button"
                onClick={() => {
                  switchProfile(sample);
                  setName(sample.name);
                  setClassGrade(sample.classGrade);
                  setBoard(sample.board);
                  setLevel(sample.level);
                  setDailyHours(sample.dailyStudyHours);
                  setTargetExam(sample.targetExamName || '');
                  setExamDate(sample.examDate || '');
                  setSelectedSubjects(sample.subjects);
                  setGoalsText(sample.studyGoals.join('\n'));
                }}
                className={`px-2.5 py-1 rounded-lg border transition font-medium ${
                  profile.id === sample.id
                    ? 'bg-amber-500 border-amber-600 text-stone-950 font-bold'
                    : 'bg-white dark:bg-stone-800 border-stone-300 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:bg-stone-50'
                }`}
              >
                {sample.avatar} {sample.name.split(' ')[0]} ({sample.classGrade})
              </button>
            ))}
          </div>
        </div>

        {/* Profile Edit Form */}
        <form onSubmit={handleSave} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto text-stone-800 dark:text-stone-200">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-stone-700 dark:text-stone-300 mb-1">
                Student Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full text-xs font-semibold bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-xl p-2.5 text-stone-800 dark:text-stone-100 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-stone-700 dark:text-stone-300 mb-1">
                Class / Grade (6th - 10th)
              </label>
              <select
                value={classGrade}
                onChange={e => setClassGrade(e.target.value as ClassGrade)}
                className="w-full text-xs font-semibold bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-xl p-2.5 text-stone-800 dark:text-stone-100 focus:outline-none focus:border-amber-500"
              >
                <option value="Class 6">Class 6</option>
                <option value="Class 7">Class 7</option>
                <option value="Class 8">Class 8</option>
                <option value="Class 9">Class 9</option>
                <option value="Class 10">Class 10 (Board Exam)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-stone-700 dark:text-stone-300 mb-1">
                Board Curriculum
              </label>
              <select
                value={board}
                onChange={e => setBoard(e.target.value as EducationBoard)}
                className="w-full text-xs font-semibold bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-xl p-2.5 text-stone-800 dark:text-stone-100 focus:outline-none focus:border-amber-500"
              >
                <option value="CBSE">CBSE</option>
                <option value="ICSE">ICSE</option>
                <option value="State Board">State Board</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-stone-700 dark:text-stone-300 mb-1">
                Learning Difficulty Level
              </label>
              <select
                value={level}
                onChange={e => setLevel(e.target.value as LearningLevel)}
                className="w-full text-xs font-semibold bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-xl p-2.5 text-stone-800 dark:text-stone-100 focus:outline-none focus:border-amber-500"
              >
                <option value="beginner">Beginner (Foundational)</option>
                <option value="intermediate">Intermediate (Standard)</option>
                <option value="advanced">Advanced (Olympiad / Deep)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-stone-700 dark:text-stone-300 mb-1">
                Daily Study Target (Hours)
              </label>
              <input
                type="number"
                min="0.5"
                max="10"
                step="0.5"
                value={dailyHours}
                onChange={e => setDailyHours(parseFloat(e.target.value))}
                className="w-full text-xs font-semibold bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-xl p-2.5 text-stone-800 dark:text-stone-100 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-stone-700 dark:text-stone-300 mb-1">
                Target Exam Name
              </label>
              <input
                type="text"
                value={targetExam}
                onChange={e => setTargetExam(e.target.value)}
                placeholder="e.g. CBSE Term 1 / Finals"
                className="w-full text-xs font-semibold bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-xl p-2.5 text-stone-800 dark:text-stone-100 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-stone-700 dark:text-stone-300 mb-1">
                Target Exam Date
              </label>
              <input
                type="date"
                value={examDate}
                onChange={e => setExamDate(e.target.value)}
                className="w-full text-xs font-semibold bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-xl p-2.5 text-stone-800 dark:text-stone-100 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Subjects Multi-Select */}
          <div>
            <label className="block text-xs font-bold uppercase text-stone-700 dark:text-stone-300 mb-1.5">
              Enrolled Subjects ({selectedSubjects.length})
            </label>
            <div className="flex flex-wrap gap-2">
              {allAvailableSubjects.map(sub => {
                const isSelected = selectedSubjects.includes(sub);
                return (
                  <button
                    key={sub}
                    type="button"
                    onClick={() => handleToggleSubject(sub)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition border flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-amber-500/15 border-amber-500 text-amber-700 dark:text-amber-300'
                        : 'bg-stone-50 dark:bg-stone-800/80 border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-400 hover:bg-stone-100'
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3 text-amber-600" />}
                    <span>{sub}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Study Goals */}
          <div>
            <label className="block text-xs font-bold uppercase text-stone-700 dark:text-stone-300 mb-1">
              Key Study Goals (One per line)
            </label>
            <textarea
              rows={3}
              value={goalsText}
              onChange={e => setGoalsText(e.target.value)}
              placeholder="Score 95%+ in Term Finals&#10;Master Trigonometry formulas"
              className="w-full text-xs font-medium bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-xl p-2.5 text-stone-800 dark:text-stone-100 focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Actions */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-stone-200 dark:border-stone-800">
            <button
              type="button"
              onClick={() => {
                logout();
                onClose();
              }}
              className="px-3.5 py-2 text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition flex items-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out / Switch Account</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-bold text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-xl transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 text-xs font-bold bg-amber-500 hover:bg-amber-600 text-stone-950 rounded-xl shadow-md transition cursor-pointer"
              >
                Save Profile Changes
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
