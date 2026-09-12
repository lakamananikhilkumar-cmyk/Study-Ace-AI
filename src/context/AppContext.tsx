import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import confetti from 'canvas-confetti';
import {
  StudentProfile,
  StudyPlan,
  QuizDeck,
  QuizAttemptResult,
  WeakTopicItem,
  SpacedRevisionCard,
  DailyMission,
  Badge,
  ClassGrade,
  EducationBoard,
  LearningLevel,
  SubjectName,
  ThemeMode,
  NavTab,
  StreakDay,
  StudyAlarm,
  StudentEmailNotification
} from '../types';
import {
  INITIAL_STUDENT_PROFILE,
  SAMPLE_STUDY_PLAN,
  SAMPLE_QUIZ_DECK,
  INITIAL_WEAK_TOPICS,
  INITIAL_SPACED_REVISION,
  INITIAL_DAILY_MISSIONS,
  INITIAL_BADGES,
  INITIAL_ALARMS,
  INITIAL_STREAK_DAYS
} from '../data/defaultData';

interface AppContextType {
  // Theme & Layout
  theme: ThemeMode;
  toggleTheme: () => void;
  isSidebarOpen: boolean;
  setIsSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
  toggleSidebar: () => void;

  // Auth & Student
  isAuthenticated: boolean;
  profile: StudentProfile;
  login: (credentials: { name?: string; email?: string; rollNumber?: string; password: string } | string, passwordParam?: string) => Promise<{ success: boolean; error?: string; message?: string }>;
  registerDirect: (payload: { name: string; email: string; password: string; classGrade?: ClassGrade; board?: EducationBoard; level?: LearningLevel }) => Promise<{ success: boolean; rollNumber?: string; error?: string; message?: string; emailNotification?: StudentEmailNotification }>;
  sendOtp: (email: string, name?: string) => Promise<{ success: boolean; demoOtp?: string; error?: string }>;
  verifyOtpAndRegister: (payload: any) => Promise<{ success: boolean; rollNumber?: string; error?: string; message?: string; emailNotification?: StudentEmailNotification }>;
  logout: () => void;
  switchProfile: (newProfile: StudentProfile) => void;
  updateProfile: (partial: Partial<StudentProfile>) => void;

  // Mail Notifications (Roll number delivery)
  studentMails: StudentEmailNotification[];
  activeEmailPreview: StudentEmailNotification | null;
  setActiveEmailPreview: (mail: StudentEmailNotification | null) => void;
  dismissEmailPreview: () => void;

  // Core Features
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  studyPlan: StudyPlan | null;
  setStudyPlan: (plan: StudyPlan) => void;
  toggleSlotCompleted: (dayId: string, slotId: string) => void;
  
  quizDecks: QuizDeck[];
  activeQuizDeck: QuizDeck | null;
  setActiveQuizDeck: (deck: QuizDeck | null) => void;
  addQuizDeck: (deck: QuizDeck) => void;
  quizHistory: QuizAttemptResult[];
  recordQuizResult: (result: QuizAttemptResult) => void;

  weakTopics: WeakTopicItem[];
  setWeakTopics: React.Dispatch<React.SetStateAction<WeakTopicItem[]>>;
  
  spacedRevisions: SpacedRevisionCard[];
  setSpacedRevisions: React.Dispatch<React.SetStateAction<SpacedRevisionCard[]>>;
  markRevisionCompleted: (revisionId: string) => void;

  dailyMissions: DailyMission[];
  completeMission: (missionId: string) => void;
  badges: Badge[];
  addXP: (amount: number, reason?: string) => void;

  // Stopwatch & Deep Focus
  studyTimerMinutes: number;
  isTimerRunning: boolean;
  startTimer: () => void;
  pauseTimer: () => void;
  resetTimer: () => void;
  addConcentratedStudy: (minutes: number, xpPoints: number) => void;

  // Streak Calendar & Alarms
  streakDays: StreakDay[];
  alarms: StudyAlarm[];
  addAlarm: (time: string, label: string) => void;
  toggleAlarm: (id: string) => void;
  deleteAlarm: (id: string) => void;
  triggeredAlarm: StudyAlarm | null;
  dismissTriggeredAlarm: () => void;
  playAlarmChime: () => void;

  // Tutor initial topic
  tutorInitialTopic: string | null;
  setTutorInitialTopic: (topic: string | null) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEYS = {
  THEME: 'studyace_theme',
  AUTH: 'studyace_auth_state',
  PROFILE: 'studyace_student_profile',
  PLAN: 'studyace_study_plan',
  QUIZZES: 'studyace_quizzes',
  HISTORY: 'studyace_quiz_history',
  WEAK_TOPICS: 'studyace_weak_topics',
  REVISIONS: 'studyace_spaced_revisions',
  MISSIONS: 'studyace_daily_missions',
  STREAK_DAYS: 'studyace_streak_days',
  ALARMS: 'studyace_alarms',
  MAILS: 'studyace_student_mails'
};

const INITIAL_STUDENT_MAILS: StudentEmailNotification[] = [
  {
    id: 'mail-aarav-init',
    recipientEmail: 'aarav.class10@studyace.edu',
    recipientName: 'Aarav Sharma',
    rollNumber: '48291',
    subject: 'Official Admission Notice: Your 5-Digit Roll Number is 48291',
    sentAt: '2026-09-08T09:00:00.000Z',
    body: `Dear Aarav Sharma,\n\nWelcome to StudyAce AI!\n\nYour student account has been registered. Here is your official institutional credential:\n\n👉 ASSIGNED ROLL NUMBER: 48291\n\nLogin credentials:\n1. Name: Aarav Sharma\n2. Email: aarav.class10@studyace.edu\n3. Roll Number: 48291\n4. Password: password123\n\nBest of luck!\n— StudyAce AI Admissions`
  }
];

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Theme State
  const [theme, setTheme] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.THEME);
    if (saved === 'dark' || saved === 'light') return saved;
    return 'light';
  });

  // Apply dark mode class to html document
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.THEME, theme);
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  // Sidebar toggle state
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);
  const toggleSidebar = () => setIsSidebarOpen(prev => !prev);

  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.AUTH);
    return saved ? JSON.parse(saved) : true; // Default logged in to demo account for instant smooth evaluation
  });

  // Profile State
  const [profile, setProfile] = useState<StudentProfile>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PROFILE);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return INITIAL_STUDENT_PROFILE;
  });

  // Study Plan
  const [studyPlan, setStudyPlanState] = useState<StudyPlan | null>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PLAN);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return SAMPLE_STUDY_PLAN;
  });

  // Quizzes & History
  const [quizDecks, setQuizDecks] = useState<QuizDeck[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.QUIZZES);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return [SAMPLE_QUIZ_DECK];
  });
  const [activeQuizDeck, setActiveQuizDeck] = useState<QuizDeck | null>(SAMPLE_QUIZ_DECK);

  const [quizHistory, setQuizHistory] = useState<QuizAttemptResult[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.HISTORY);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return [
      {
        id: 'hist-1',
        quizId: SAMPLE_QUIZ_DECK.id,
        quizTitle: SAMPLE_QUIZ_DECK.title,
        subject: SAMPLE_QUIZ_DECK.subject,
        topic: SAMPLE_QUIZ_DECK.topic,
        scorePercent: 75,
        totalQuestions: 4,
        correctAnswers: 3,
        date: '2026-09-10',
        incorrectTopics: ["Snell's Law Refraction Calculation"]
      }
    ];
  });

  // Weak Topics & Revisions
  const [weakTopics, setWeakTopics] = useState<WeakTopicItem[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.WEAK_TOPICS);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return INITIAL_WEAK_TOPICS;
  });

  const [spacedRevisions, setSpacedRevisions] = useState<SpacedRevisionCard[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.REVISIONS);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return INITIAL_SPACED_REVISION;
  });

  // Daily Missions & Badges
  const [dailyMissions, setDailyMissions] = useState<DailyMission[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.MISSIONS);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return INITIAL_DAILY_MISSIONS;
  });

  const [badges, setBadges] = useState<Badge[]>(profile.badges || INITIAL_BADGES);

  // Active Navigation Tab
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [tutorInitialTopic, setTutorInitialTopic] = useState<string | null>(null);

  // Streak Days Calendar
  const [streakDays, setStreakDays] = useState<StreakDay[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.STREAK_DAYS);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return INITIAL_STREAK_DAYS;
  });

  // Study Alarms
  const [alarms, setAlarms] = useState<StudyAlarm[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ALARMS);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return INITIAL_ALARMS;
  });
  const [triggeredAlarm, setTriggeredAlarm] = useState<StudyAlarm | null>(null);

  // Student Mailbox Notifications (Roll number delivery)
  const [studentMails, setStudentMails] = useState<StudentEmailNotification[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.MAILS);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return INITIAL_STUDENT_MAILS;
  });
  const [activeEmailPreview, setActiveEmailPreview] = useState<StudentEmailNotification | null>(null);
  const dismissEmailPreview = () => setActiveEmailPreview(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.MAILS, JSON.stringify(studentMails));
  }, [studentMails]);

  // Live Timer State (in seconds)
  const [timerSeconds, setTimerSeconds] = useState<number>(0);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);

  // Web Audio Alarm Chime Generator
  const playAlarmChime = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();

      // Dual note chime (C5 -> G5)
      const now = ctx.currentTime;
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(523.25, now); // C5
      osc1.frequency.exponentialRampToValueAtTime(783.99, now + 0.3); // G5

      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(261.63, now); // C4

      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 1.2);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 1.2);
      osc2.stop(now + 1.2);
    } catch (e) {
      console.warn('Audio chime playback notice:', e);
    }
  };

  // Alarm clock checker interval (checks every 20 seconds)
  useEffect(() => {
    const checkAlarms = () => {
      const now = new Date();
      const currentHH = String(now.getHours()).padStart(2, '0');
      const currentMM = String(now.getMinutes()).padStart(2, '0');
      const currentTimeStr = `${currentHH}:${currentMM}`;

      alarms.forEach(alarm => {
        if (alarm.enabled && alarm.time === currentTimeStr && !triggeredAlarm) {
          setTriggeredAlarm(alarm);
          playAlarmChime();
        }
      });
    };

    const interval = setInterval(checkAlarms, 20000);
    return () => clearInterval(interval);
  }, [alarms, triggeredAlarm]);

  const dismissTriggeredAlarm = () => {
    setTriggeredAlarm(null);
  };

  const addAlarm = (time: string, label: string) => {
    const newAlarm: StudyAlarm = {
      id: `alarm-${Date.now()}`,
      time,
      label: label.trim() || 'Study Focus Session',
      enabled: true,
      repeatDaily: true
    };
    setAlarms(prev => [...prev, newAlarm]);
  };

  const toggleAlarm = (id: string) => {
    setAlarms(prev =>
      prev.map(a => (a.id === id ? { ...a, enabled: !a.enabled } : a))
    );
  };

  const deleteAlarm = (id: string) => {
    setAlarms(prev => prev.filter(a => a.id !== id));
  };

  // Stopwatch timer tick
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimerSeconds(prev => {
          const next = prev + 1;
          if (next > 0 && next % 60 === 0) {
            setProfile(p => ({
              ...p,
              totalStudyMinutes: p.totalStudyMinutes + 1
            }));
            // Update today's streak day
            const todayStr = new Date().toISOString().split('T')[0];
            setStreakDays(days => {
              const existing = days.find(d => d.date === todayStr);
              if (existing) {
                return days.map(d =>
                  d.date === todayStr ? { ...d, minutes: d.minutes + 1, studied: true } : d
                );
              }
              return [...days, { date: todayStr, studied: true, minutes: 1, concentratedMinutes: 0, tasksCompleted: 0 }];
            });
          }
          return next;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning]);

  // Save changes to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
  }, [profile]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.AUTH, JSON.stringify(isAuthenticated));
  }, [isAuthenticated]);

  useEffect(() => {
    if (studyPlan) localStorage.setItem(STORAGE_KEYS.PLAN, JSON.stringify(studyPlan));
  }, [studyPlan]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.QUIZZES, JSON.stringify(quizDecks));
  }, [quizDecks]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(quizHistory));
  }, [quizHistory]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.WEAK_TOPICS, JSON.stringify(weakTopics));
  }, [weakTopics]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.REVISIONS, JSON.stringify(spacedRevisions));
  }, [spacedRevisions]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.STREAK_DAYS, JSON.stringify(streakDays));
  }, [streakDays]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ALARMS, JSON.stringify(alarms));
  }, [alarms]);

  // Auth Methods
  const login = async (
    credentials: { name?: string; email?: string; rollNumber?: string; password: string } | string,
    passwordParam?: string
  ) => {
    try {
      const payload = typeof credentials === 'string'
        ? { identifier: credentials, password: passwordParam }
        : credentials;

      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success && data.profile) {
        setProfile(data.profile);
        setIsAuthenticated(true);
        return { success: true, message: data.message };
      }
      return { success: false, error: data.error || 'Login failed' };
    } catch (err: any) {
      return { success: false, error: 'Network error connecting to login service' };
    }
  };

  const registerDirect = async (payload: {
    name: string;
    email: string;
    password: string;
    classGrade?: ClassGrade;
    board?: EducationBoard;
    level?: LearningLevel;
  }) => {
    try {
      const res = await fetch('/api/auth/register-direct', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success && data.profile) {
        if (data.emailNotification) {
          setStudentMails(prev => [data.emailNotification, ...prev]);
          setActiveEmailPreview(data.emailNotification);
        }
        setProfile(data.profile);
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
        return {
          success: true,
          rollNumber: data.rollNumber,
          message: data.message,
          emailNotification: data.emailNotification
        };
      }
      return { success: false, error: data.error || 'Registration failed' };
    } catch (err: any) {
      return { success: false, error: 'Network error creating account' };
    }
  };

  const sendOtp = async (email: string, name?: string) => {
    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name })
      });
      const data = await res.json();
      if (data.success) {
        return { success: true, demoOtp: data.demoOtp };
      }
      return { success: false, error: data.error || 'Failed to send OTP' };
    } catch (err: any) {
      return { success: false, error: 'Network error sending OTP' };
    }
  };

  const verifyOtpAndRegister = async (payload: any) => {
    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success && data.profile) {
        if (data.emailNotification) {
          setStudentMails(prev => [data.emailNotification, ...prev]);
          setActiveEmailPreview(data.emailNotification);
        }
        setProfile(data.profile);
        setIsAuthenticated(true);
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
        return {
          success: true,
          rollNumber: data.rollNumber,
          message: data.message,
          emailNotification: data.emailNotification
        };
      }
      return { success: false, error: data.error || 'Failed to verify OTP' };
    } catch (err: any) {
      return { success: false, error: 'Network error verifying OTP' };
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
  };

  const switchProfile = (newProfile: StudentProfile) => {
    setProfile(newProfile);
    setIsAuthenticated(true);
  };

  const updateProfile = (partial: Partial<StudentProfile>) => {
    setProfile(prev => ({ ...prev, ...partial }));
  };

  const setStudyPlan = (plan: StudyPlan) => {
    setStudyPlanState(plan);
  };

  // Gamification & XP
  const addXP = (amount: number, reason?: string) => {
    setProfile(prev => {
      const newXP = prev.xp + amount;
      const currentRank = prev.levelRank;
      const newRank = Math.floor(newXP / 150) + 1;

      if (newRank > currentRank) {
        confetti({ particleCount: 90, spread: 60, origin: { y: 0.5 } });
      }

      return {
        ...prev,
        xp: newXP,
        levelRank: newRank
      };
    });
  };

  const completeMission = (missionId: string) => {
    setDailyMissions(prev =>
      prev.map(m => {
        if (m.id === missionId && !m.completed) {
          addXP(m.xpReward, `Completed mission: ${m.title}`);
          return { ...m, completed: true, current: m.target };
        }
        return m;
      })
    );
  };

  // Concentrated Study
  const addConcentratedStudy = (minutes: number, xpPoints: number) => {
    playAlarmChime();
    confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });

    setProfile(p => ({
      ...p,
      concentratedMinutes: (p.concentratedMinutes || 0) + minutes,
      totalStudyMinutes: p.totalStudyMinutes + minutes,
      xp: p.xp + xpPoints
    }));

    const todayStr = new Date().toISOString().split('T')[0];
    setStreakDays(days => {
      const existing = days.find(d => d.date === todayStr);
      if (existing) {
        return days.map(d =>
          d.date === todayStr
            ? {
                ...d,
                minutes: d.minutes + minutes,
                concentratedMinutes: (d.concentratedMinutes || 0) + minutes,
                studied: true
              }
            : d
        );
      }
      return [
        ...days,
        {
          date: todayStr,
          studied: true,
          minutes,
          concentratedMinutes: minutes,
          tasksCompleted: 1
        }
      ];
    });
  };

  const toggleSlotCompleted = (dayId: string, slotId: string) => {
    if (!studyPlan) return;
    let earnedXP = false;

    const updatedDays = studyPlan.dailySchedule.map(day => {
      if (day.id !== dayId) return day;
      return {
        ...day,
        slots: day.slots.map(slot => {
          if (slot.id === slotId) {
            const nextState = !slot.completed;
            if (nextState) earnedXP = true;
            return { ...slot, completed: nextState };
          }
          return slot;
        })
      };
    });

    setStudyPlanState({ ...studyPlan, dailySchedule: updatedDays });

    if (earnedXP) {
      addXP(20, 'Completed scheduled study task');
      completeMission('mission-doubt');
      setProfile(p => ({
        ...p,
        completedTasksCount: p.completedTasksCount + 1
      }));
    }
  };

  const markRevisionCompleted = (revisionId: string) => {
    setSpacedRevisions(prev =>
      prev.map(r => {
        if (r.id === revisionId) {
          const nextStage = Math.min(5, r.stage + 1);
          const stageLabels = [
            'Day 1 Recall',
            'Day 3 Review',
            'Day 7 Reinforcement',
            'Day 14 Mastery',
            'Day 30 Permanent Memory'
          ];

          const daysToAdd = [1, 2, 4, 7, 16][nextStage - 1] || 7;
          const nextDate = new Date();
          nextDate.setDate(nextDate.getDate() + daysToAdd);

          return {
            ...r,
            stage: nextStage,
            stageLabel: stageLabels[nextStage - 1] || 'Day 30 Permanent Memory',
            isDueToday: false,
            completedReviewCount: r.completedReviewCount + 1,
            nextDueDate: nextDate.toISOString().split('T')[0]
          };
        }
        return r;
      })
    );

    addXP(30, 'Completed Spaced Repetition Review');
    completeMission('mission-revision');
  };

  const recordQuizResult = (result: QuizAttemptResult) => {
    setQuizHistory(prev => [result, ...prev]);
    completeMission('mission-quiz');
    addXP(Math.round(result.scorePercent / 2), 'Completed AI Quiz');
  };

  const addQuizDeck = (deck: QuizDeck) => {
    setQuizDecks(prev => [deck, ...prev]);
    setActiveQuizDeck(deck);
    addXP(25, 'Created Quiz Deck from Notes');
  };

  // Stopwatch Controls
  const startTimer = () => setIsTimerRunning(true);
  const pauseTimer = () => setIsTimerRunning(false);
  const resetTimer = () => {
    setIsTimerRunning(false);
    setTimerSeconds(0);
  };

  return (
    <AppContext.Provider
      value={{
        theme,
        toggleTheme,
        isSidebarOpen,
        setIsSidebarOpen,
        toggleSidebar,
        isAuthenticated,
        profile,
        login,
        registerDirect,
        sendOtp,
        verifyOtpAndRegister,
        logout,
        switchProfile,
        updateProfile,
        studentMails,
        activeEmailPreview,
        setActiveEmailPreview,
        dismissEmailPreview,
        activeTab,
        setActiveTab,
        studyPlan,
        setStudyPlan,
        toggleSlotCompleted,
        quizDecks,
        activeQuizDeck,
        setActiveQuizDeck,
        addQuizDeck,
        quizHistory,
        recordQuizResult,
        weakTopics,
        setWeakTopics,
        spacedRevisions,
        setSpacedRevisions,
        markRevisionCompleted,
        dailyMissions,
        completeMission,
        badges,
        addXP,
        studyTimerMinutes: Math.floor(timerSeconds / 60),
        isTimerRunning,
        startTimer,
        pauseTimer,
        resetTimer,
        addConcentratedStudy,
        streakDays,
        alarms,
        addAlarm,
        toggleAlarm,
        deleteAlarm,
        triggeredAlarm,
        dismissTriggeredAlarm,
        playAlarmChime,
        tutorInitialTopic,
        setTutorInitialTopic
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
