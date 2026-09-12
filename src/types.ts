export type ClassGrade = 'Class 6' | 'Class 7' | 'Class 8' | 'Class 9' | 'Class 10';

export type SubjectName = 
  | 'Mathematics'
  | 'Science'
  | 'Physics'
  | 'Chemistry'
  | 'Biology'
  | 'Social Science'
  | 'History'
  | 'Geography'
  | 'Civics/Political Science'
  | 'English'
  | 'Hindi'
  | 'Computer Science';

export type LearningLevel = 'beginner' | 'intermediate' | 'advanced';

export type EducationBoard = 'CBSE' | 'ICSE' | 'State Board';

export type ThemeMode = 'light' | 'dark';

export type NavTab = 
  | 'dashboard'
  | 'tutor'
  | 'computerCourses'
  | 'techNews'
  | 'planner'
  | 'rescue'
  | 'quiz'
  | 'weakTopics'
  | 'revision'
  | 'focus'
  | 'calendar'
  | 'alarms';

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt?: string;
  category: 'streak' | 'quiz' | 'tutor' | 'planner' | 'revision' | 'focus';
}

export interface DailyMission {
  id: string;
  title: string;
  xpReward: number;
  completed: boolean;
  target: number;
  current: number;
  icon: string;
}

export interface StudentEmailNotification {
  id: string;
  recipientEmail: string;
  recipientName: string;
  rollNumber: string;
  subject: string;
  sentAt: string;
  body: string;
}

export interface StudentProfile {
  id: string;
  name: string;
  email: string;
  rollNumber: string; // 5-digit roll number (e.g. 48291)
  password?: string;
  avatar: string;
  classGrade: ClassGrade;
  board: EducationBoard;
  subjects: SubjectName[];
  level: LearningLevel;
  studyGoals: string[];
  examDate?: string;
  targetExamName?: string;
  dailyStudyHours: number;
  xp: number;
  levelRank: number;
  streak: number;
  lastActiveDate: string;
  completedTasksCount: number;
  totalStudyMinutes: number;
  concentratedMinutes: number; // Deep focus room time
  badges: Badge[];
}

export interface StudySlot {
  id: string;
  time: string;
  subject: SubjectName;
  topic: string;
  durationMinutes: number;
  priority: 'high' | 'medium' | 'low';
  completed: boolean;
  missed?: boolean;
  notes?: string;
}

export interface DaySchedule {
  id: string;
  date: string;
  dayName: string;
  slots: StudySlot[];
}

export interface StudyPlan {
  id: string;
  title: string;
  examDate: string;
  hoursPerDay: number;
  generatedAt: string;
  summary: string;
  dailySchedule: DaySchedule[];
  examStrategyTips: string[];
}

export interface RescuePlan {
  id: string;
  subject: SubjectName;
  examDate: string;
  currentPrepPercent: number;
  daysRemaining: number;
  urgencyLevel: 'EXTREME' | 'HIGH' | 'MODERATE';
  mustKnowTopics: {
    topic: string;
    weightage: string;
    whyImportant: string;
    estimatedMinutes: number;
  }[];
  survivalDailyRoutine: {
    phase: string;
    focus: string;
    suggestedDuration: string;
    actionSteps: string[];
  }[];
  quickFormulasAndConcepts: {
    title: string;
    keyPoints: string[];
  }[];
  rapidChecklist: string[];
}

export interface MCQQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface ShortAnswerQuestion {
  id: string;
  question: string;
  modelAnswer: string;
  keyPoints: string[];
  studentAnswer?: string;
  evaluation?: {
    score: number;
    maxScore: number;
    feedback: string;
    strengths: string;
    improvements: string;
  };
}

export interface Flashcard {
  id: string;
  front: string;
  back: string;
  mastered?: boolean;
  category?: string;
}

export interface QuizDeck {
  id: string;
  title: string;
  subject: SubjectName;
  classGrade: ClassGrade;
  topic: string;
  sourceNotesSnippet?: string;
  mcqs: MCQQuestion[];
  shortAnswers: ShortAnswerQuestion[];
  flashcards: Flashcard[];
  createdAt: string;
  bestScore?: number;
  timesTaken?: number;
}

export interface QuizAttemptResult {
  id: string;
  quizId: string;
  quizTitle: string;
  subject: SubjectName;
  topic: string;
  scorePercent: number;
  totalQuestions: number;
  correctAnswers: number;
  date: string;
  incorrectTopics: string[];
}

export interface WeakTopicItem {
  id: string;
  subject: SubjectName;
  topic: string;
  accuracyPercent: number;
  totalQuestionsAttempted: number;
  status: 'critical' | 'moderate' | 'mastered';
  lastEncountered: string;
  recommendedAction: string;
  conceptSummary: string;
  youtubeUrl?: string;
}

export interface SpacedRevisionCard {
  id: string;
  topic: string;
  subject: SubjectName;
  stage: number; // 1 = Day 1, 2 = Day 3, 3 = Day 7, 4 = Day 14, 5 = Day 30
  stageLabel: string;
  nextDueDate: string;
  lastReviewedDate?: string;
  isDueToday: boolean;
  summaryKeyPoints: string[];
  completedReviewCount: number;
}

export interface YouTubeVideoResource {
  title: string;
  url: string;
  channelTitle?: string;
  searchQuery?: string;
  thumbnail?: string;
}

export interface TutorMessage {
  id: string;
  sender: 'student' | 'ai';
  text: string;
  timestamp: string;
  analogy?: string;
  stepByStep?: string[];
  solvedExample?: string;
  quickCheck?: {
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  };
  youtubeVideos?: YouTubeVideoResource[];
  audioUrl?: string;
  isGeminiPowered?: boolean;
  modelUsed?: string;
  problemSolution?: {
    given?: string;
    formula?: string;
    steps?: string[];
    finalAnswer?: string;
    verificationTip?: string;
  };
}

export interface TechNewsArticle {
  id: string;
  title: string;
  summary: string;
  simpleSummary?: string; // Small, easy-to-understand 1-sentence summary for school students
  whatItMeans?: string; // Quick bullet in plain English
  category: 'Artificial Intelligence' | 'Space & Astronomy' | 'Robotics & Hardware' | 'Cybersecurity' | 'Green Tech' | 'Student Coding';
  publishedDate: string;
  readTime: string;
  source: string;
  url: string;
  tags: string[];
  keyTakeaways: string[];
  studentRelevance: string; // Connection to school science / math
  youtubeQuery?: string;
  youtubeTitle?: string;
  likes?: number;
  featured?: boolean;
}

export interface StreakDay {
  date: string; // YYYY-MM-DD
  studied: boolean;
  minutes: number;
  concentratedMinutes: number;
  tasksCompleted: number;
  notes?: string;
}

export interface StudyAlarm {
  id: string;
  time: string; // "HH:MM" in 24h format e.g. "17:30"
  label: string;
  enabled: boolean;
  repeatDaily: boolean;
}

export type ProgrammingLanguage = 'html' | 'css' | 'python' | 'java' | 'javascript' | 'cpp' | 'c';

export interface CodingLesson {
  id: string;
  title: string;
  language: ProgrammingLanguage;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  duration: string;
  simpleExplanation: string;
  realWorldAnalogy: string;
  keyPoints: string[];
  starterCode: string;
  expectedOutput?: string;
  practiceTask: string;
}

export interface DailyCodingChallenge {
  id: string;
  title: string;
  language: ProgrammingLanguage;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  points: number;
  story: string;
  problemStatement: string;
  inputExample?: string;
  outputExample: string;
  starterCode: string;
  solutionCode?: string;
  hints: string[];
  completed?: boolean;
}

export interface CodingStreakData {
  streak: number;
  lastCodingDate: string;
  totalPoints: number;
  solvedProblems: string[];
  dailyActivity: { [dateKey: string]: number }; // date (YYYY-MM-DD) -> run count
  completedLessons: string[];
}

export interface CodeAssistantMessage {
  id: string;
  sender: 'student' | 'ai';
  text: string;
  timestamp: string;
  fixedCode?: string;
  analogy?: string;
  keyTakeaway?: string;
  isGeminiPowered?: boolean;
}

