import { StudentProfile, Badge, DailyMission, StudyPlan, QuizDeck, WeakTopicItem, SpacedRevisionCard } from '../types';

export const INITIAL_BADGES: Badge[] = [
  {
    id: 'badge-first-step',
    name: 'Curious Mind',
    description: 'Asked your first doubt to AI Personal Tutor',
    icon: 'Sparkles',
    unlockedAt: '2026-09-08T10:00:00.000Z',
    category: 'tutor'
  },
  {
    id: 'badge-quiz-ace',
    name: 'Quiz Explorer',
    description: 'Scored 80%+ on any AI-generated Quiz',
    icon: 'Award',
    unlockedAt: '2026-09-09T14:30:00.000Z',
    category: 'quiz'
  },
  {
    id: 'badge-streak-3',
    name: '3-Day Streak Fighter',
    description: 'Maintained study habits for 3 consecutive days',
    icon: 'Flame',
    unlockedAt: '2026-09-10T18:00:00.000Z',
    category: 'streak'
  },
  {
    id: 'badge-rescue-hero',
    name: 'Exam Rescuer',
    description: 'Generated a crash rescue plan for an approaching exam',
    icon: 'ShieldAlert',
    category: 'planner'
  },
  {
    id: 'badge-spaced-master',
    name: 'Revision Champion',
    description: 'Completed 5 Spaced Repetition review cycles',
    icon: 'RotateCcw',
    category: 'revision'
  },
  {
    id: 'badge-level-up',
    name: 'Scholar Rising',
    description: 'Advanced to Level 3 in the StudyAce Rank',
    icon: 'TrendingUp',
    category: 'quiz'
  }
];

export const INITIAL_DAILY_MISSIONS: DailyMission[] = [
  {
    id: 'mission-doubt',
    title: 'Ask 1 Doubt to AI Personal Tutor',
    xpReward: 25,
    completed: true,
    target: 1,
    current: 1,
    icon: 'MessageSquare'
  },
  {
    id: 'mission-quiz',
    title: 'Complete a 5-Question Quiz',
    xpReward: 35,
    completed: false,
    target: 1,
    current: 0,
    icon: 'CheckCircle2'
  },
  {
    id: 'mission-revision',
    title: 'Complete 1 Spaced Revision Item',
    xpReward: 30,
    completed: false,
    target: 1,
    current: 0,
    icon: 'RefreshCw'
  }
];

export const INITIAL_STUDENT_PROFILE: StudentProfile = {
  id: 'student-aarav',
  name: 'Aarav Sharma',
  email: 'aarav.class10@studyace.edu',
  rollNumber: '48291',
  password: 'password123',
  avatar: '👨‍🎓',
  classGrade: 'Class 10',
  board: 'CBSE',
  subjects: ['Mathematics', 'Science', 'Social Science', 'English'],
  level: 'intermediate',
  studyGoals: ['Score 95%+ in Term Finals', 'Master Trigonometry & Coordinate Geometry', 'Strengthen Chemistry Reactions'],
  examDate: '2026-09-25',
  targetExamName: 'CBSE Mid-Term Exams',
  dailyStudyHours: 3.5,
  xp: 380,
  levelRank: 3,
  streak: 4,
  lastActiveDate: '2026-09-11',
  completedTasksCount: 14,
  totalStudyMinutes: 285,
  concentratedMinutes: 125,
  badges: INITIAL_BADGES
};

export const SAMPLE_STUDENTS: StudentProfile[] = [
  INITIAL_STUDENT_PROFILE,
  {
    id: 'student-ananya',
    name: 'Ananya Verma',
    email: 'ananya.class9@studyace.edu',
    rollNumber: '39104',
    password: 'password123',
    avatar: '👩‍🎓',
    classGrade: 'Class 9',
    board: 'ICSE',
    subjects: ['Physics', 'Chemistry', 'Biology', 'Mathematics', 'English'],
    level: 'advanced',
    studyGoals: ['Master Laws of Motion', 'Ace Periodic Table trends', 'Complete weekly practice mock tests'],
    examDate: '2026-09-22',
    targetExamName: 'ICSE Term 1 Assessments',
    dailyStudyHours: 4.0,
    xp: 520,
    levelRank: 4,
    streak: 6,
    lastActiveDate: '2026-09-11',
    completedTasksCount: 22,
    totalStudyMinutes: 410,
    concentratedMinutes: 180,
    badges: INITIAL_BADGES
  },
  {
    id: 'student-rohan',
    name: 'Rohan Patel',
    email: 'rohan.class7@studyace.edu',
    rollNumber: '71825',
    password: 'password123',
    avatar: '👦',
    classGrade: 'Class 7',
    board: 'CBSE',
    subjects: ['Mathematics', 'Science', 'Social Science', 'English', 'Hindi'],
    level: 'beginner',
    studyGoals: ['Understand fractions and decimals visually', 'Learn plant and animal cell differences', 'Build a 30-min daily study habit'],
    examDate: '2026-10-05',
    targetExamName: 'Periodic Test 2',
    dailyStudyHours: 2.0,
    xp: 190,
    levelRank: 2,
    streak: 3,
    lastActiveDate: '2026-09-11',
    completedTasksCount: 8,
    totalStudyMinutes: 150,
    concentratedMinutes: 60,
    badges: INITIAL_BADGES
  }
];

export const INITIAL_ALARMS = [
  {
    id: 'alarm-1',
    time: '16:30',
    label: 'Maths & Science Focus Slot',
    enabled: true,
    repeatDaily: true
  },
  {
    id: 'alarm-2',
    time: '19:45',
    label: 'Evening Spaced Revision Drill',
    enabled: true,
    repeatDaily: true
  },
  {
    id: 'alarm-3',
    time: '21:15',
    label: 'Formula Flashcards Review',
    enabled: false,
    repeatDaily: true
  }
];

export const INITIAL_STREAK_DAYS = [
  { date: '2026-09-06', studied: true, minutes: 120, concentratedMinutes: 50, tasksCompleted: 3 },
  { date: '2026-09-07', studied: true, minutes: 180, concentratedMinutes: 75, tasksCompleted: 4 },
  { date: '2026-09-08', studied: true, minutes: 150, concentratedMinutes: 60, tasksCompleted: 3 },
  { date: '2026-09-09', studied: false, minutes: 0, concentratedMinutes: 0, tasksCompleted: 0 },
  { date: '2026-09-10', studied: true, minutes: 210, concentratedMinutes: 90, tasksCompleted: 5 },
  { date: '2026-09-11', studied: true, minutes: 160, concentratedMinutes: 65, tasksCompleted: 4 }
];

export const SAMPLE_STUDY_PLAN: StudyPlan = {
  id: 'plan-aarav-midterm',
  title: 'Mid-Term Board Prep Timetable',
  examDate: '2026-09-25',
  hoursPerDay: 3.5,
  generatedAt: '2026-09-10T08:00:00.000Z',
  summary: 'Balanced high-yield timetable prioritizing Mathematics & Physics formulas with regular active recall blocks.',
  examStrategyTips: [
    'Always solve NCERT exemplar problems for Mathematics before reference guides.',
    'Draw clean labeled ray diagrams for optics in Science.',
    'Use bullet points and dates for Modern History answers in Social Science.'
  ],
  dailySchedule: [
    {
      id: 'day-today',
      date: '2026-09-11',
      dayName: 'Today (Friday)',
      slots: [
        {
          id: 'slot-1',
          time: '04:30 PM - 05:30 PM',
          subject: 'Mathematics',
          topic: 'Quadratic Equations (Roots by Quadratic Formula)',
          durationMinutes: 60,
          priority: 'high',
          completed: true,
          notes: 'Standard form ax² + bx + c = 0, discriminant D = b² - 4ac'
        },
        {
          id: 'slot-2',
          time: '05:45 PM - 06:45 PM',
          subject: 'Science',
          topic: 'Light: Reflection & Refraction (Spherical Mirrors & Ray Diagrams)',
          durationMinutes: 60,
          priority: 'high',
          completed: false,
          notes: 'Focus on concave mirror object placed between F and C'
        },
        {
          id: 'slot-3',
          time: '07:00 PM - 08:00 PM',
          subject: 'Social Science',
          topic: 'Nationalism in India (Non-Cooperation Movement)',
          durationMinutes: 60,
          priority: 'medium',
          completed: false,
          notes: 'Causes, spread in towns vs countryside, Chauri Chaura withdrawal'
        },
        {
          id: 'slot-4',
          time: '08:15 PM - 08:45 PM',
          subject: 'English',
          topic: 'Reported Speech & Direct-Indirect Conversion',
          durationMinutes: 30,
          priority: 'low',
          completed: false,
          notes: 'Tense shift rules & pronoun modifications'
        }
      ]
    },
    {
      id: 'day-tomorrow',
      date: '2026-09-12',
      dayName: 'Tomorrow (Saturday)',
      slots: [
        {
          id: 'slot-5',
          time: '10:00 AM - 11:30 AM',
          subject: 'Science',
          topic: 'Chemical Reactions & Equations (Balancing Redox)',
          durationMinutes: 90,
          priority: 'high',
          completed: false
        },
        {
          id: 'slot-6',
          time: '02:00 PM - 03:30 PM',
          subject: 'Mathematics',
          topic: 'Trigonometric Identities (sin²θ + cos²θ = 1 proofs)',
          durationMinutes: 90,
          priority: 'high',
          completed: false
        },
        {
          id: 'slot-7',
          time: '04:30 PM - 05:30 PM',
          subject: 'Social Science',
          topic: 'Resources and Development (Soil Types of India)',
          durationMinutes: 60,
          priority: 'medium',
          completed: false
        }
      ]
    },
    {
      id: 'day-sunday',
      date: '2026-09-13',
      dayName: 'Sunday',
      slots: [
        {
          id: 'slot-8',
          time: '10:00 AM - 12:00 PM',
          subject: 'Mathematics',
          topic: 'Full Chapter Revision & Practice Paper: Polynomials & Algebra',
          durationMinutes: 120,
          priority: 'high',
          completed: false
        },
        {
          id: 'slot-9',
          time: '03:00 PM - 04:30 PM',
          subject: 'Science',
          topic: 'Life Processes (Nutrition & Cellular Respiration)',
          durationMinutes: 90,
          priority: 'high',
          completed: false
        }
      ]
    }
  ]
};

export const SAMPLE_QUIZ_DECK: QuizDeck = {
  id: 'quiz-light-optics',
  title: 'Light: Reflection and Refraction (Class 10)',
  subject: 'Science',
  classGrade: 'Class 10',
  topic: 'Spherical Mirrors, Lenses, and Snell\'s Law',
  createdAt: '2026-09-10T12:00:00.000Z',
  bestScore: 80,
  timesTaken: 2,
  mcqs: [
    {
      id: 'mcq-1',
      question: 'Where should an object be placed in front of a concave mirror to obtain an image which is real, inverted, and of the exact same size as the object?',
      options: [
        'At the Principal Focus (F)',
        'At the Centre of Curvature (C)',
        'Between Focus (F) and Pole (P)',
        'Beyond Centre of Curvature (C)'
      ],
      correctIndex: 1,
      explanation: 'When an object is placed at the Centre of Curvature (C) of a concave mirror, the reflected rays converge at C itself, forming a real, inverted image with magnification m = -1 (same size).'
    },
    {
      id: 'mcq-2',
      question: 'The power of a lens is -2.0 D. What is its focal length and what type of lens is it?',
      options: [
        '+0.5 m, Convex lens',
        '-0.5 m, Concave lens',
        '-2.0 m, Concave lens',
        '+2.0 m, Convex lens'
      ],
      correctIndex: 1,
      explanation: 'Power P = 1 / f (in meters). So f = 1 / P = 1 / (-2.0) = -0.5 m (-50 cm). Negative focal length indicates a concave (diverging) lens.'
    },
    {
      id: 'mcq-3',
      question: 'When a ray of light travels from an optically denser medium (like glass) to an optically rarer medium (like air), it bends:',
      options: [
        'Towards the normal',
        'Away from the normal',
        'Does not bend at all',
        'Reflects back completely at all angles'
      ],
      correctIndex: 1,
      explanation: 'Moving into a rarer medium increases the speed of light, causing the wavefront to refract away from the normal line.'
    },
    {
      id: 'mcq-4',
      question: 'Which mirror is standardly used as a rear-view mirror in vehicles and why?',
      options: [
        'Concave mirror, because it magnifies faraway cars',
        'Plane mirror, because it gives 1:1 scale',
        'Convex mirror, because it always gives an erect, diminished image and wider field of view',
        'Cylindrical mirror, because it reduces glare'
      ],
      correctIndex: 2,
      explanation: 'Convex mirrors always form virtual, erect, and diminished images, enabling drivers to view a much larger area of traffic behind them.'
    }
  ],
  shortAnswers: [
    {
      id: 'sa-1',
      question: 'State Snell’s law of refraction and write its mathematical formula.',
      modelAnswer: 'Snell\'s law states that the ratio of the sine of the angle of incidence (i) to the sine of the angle of refraction (r) is a constant for a given pair of media and color of light: sin(i) / sin(r) = constant = n₂₁ (refractive index of medium 2 with respect to medium 1).',
      keyPoints: [
        'Ratio of sin(i) to sin(r) is constant',
        'Formula: sin(i) / sin(r) = n₂₁',
        'Depends on the pair of media and light wavelength'
      ]
    },
    {
      id: 'sa-2',
      question: 'Why does a pencil dipped obliquely in a beaker of water appear bent at the water surface?',
      modelAnswer: 'Light rays coming from the submerged portion of the pencil travel from denser water into rarer air. As they pass the boundary, they speed up and bend away from the normal before reaching our eyes. The eye traces them back along straight lines, causing the submerged part to appear elevated and bent.',
      keyPoints: [
        'Light travels from denser water to rarer air',
        'Refracts away from the normal',
        'Virtual image formed higher than actual position'
      ]
    }
  ],
  flashcards: [
    {
      id: 'fc-1',
      front: 'Mirror Formula for Spherical Mirrors',
      back: '1/f = 1/v + 1/u (where f = focal length, v = image distance, u = object distance)',
      mastered: true,
      category: 'Formulas'
    },
    {
      id: 'fc-2',
      front: 'Lens Formula for Spherical Lenses',
      back: '1/f = 1/v - 1/u (Note the minus sign compared to mirror formula)',
      mastered: true,
      category: 'Formulas'
    },
    {
      id: 'fc-3',
      front: 'Linear Magnification (m) for Mirrors',
      back: 'm = height of image (h\') / height of object (h) = -v / u',
      mastered: false,
      category: 'Formulas'
    },
    {
      id: 'fc-4',
      front: 'Sign Convention Rule for Object Distance (u)',
      back: 'By convention, object is placed to the left of mirror/lens, so object distance (u) is ALWAYS negative.',
      mastered: true,
      category: 'Concepts'
    },
    {
      id: 'fc-5',
      front: 'What does a refractive index n = 1.5 for glass signify?',
      back: 'It means the speed of light in vacuum is 1.5 times faster than its speed in glass (v = c / 1.5 = 2 × 10⁸ m/s).',
      mastered: false,
      category: 'Concepts'
    }
  ]
};

export const INITIAL_WEAK_TOPICS: WeakTopicItem[] = [
  {
    id: 'weak-chem-reactions',
    subject: 'Science',
    topic: 'Balancing Chemical Redox Equations',
    accuracyPercent: 42,
    totalQuestionsAttempted: 12,
    status: 'critical',
    lastEncountered: '2026-09-10',
    recommendedAction: 'Review oxidation states and count element atoms on reactant vs product sides using the algebraic method.',
    conceptSummary: 'Loss of electrons is oxidation, gain of electrons is reduction. Ensure both mass and charge balance.'
  },
  {
    id: 'weak-trig-identities',
    subject: 'Mathematics',
    topic: 'Trigonometric Identities & Algebraic Proofs',
    accuracyPercent: 55,
    totalQuestionsAttempted: 16,
    status: 'moderate',
    lastEncountered: '2026-09-09',
    recommendedAction: 'Practice converting all terms to sin θ and cos θ when stuck on LHS to RHS proofs.',
    conceptSummary: 'Remember key identity triad: sin²θ + cos²θ = 1; 1 + tan²θ = sec²θ; 1 + cot²θ = cosec²θ.'
  },
  {
    id: 'weak-optics-sign',
    subject: 'Science',
    topic: 'Cartesian Sign Convention for Lens Calculations',
    accuracyPercent: 58,
    totalQuestionsAttempted: 10,
    status: 'moderate',
    lastEncountered: '2026-09-08',
    recommendedAction: 'Memorize: Concave lens focal length is always negative; Convex lens focal length is always positive.',
    conceptSummary: 'Distances measured in direction of incident ray are positive; against are negative.'
  },
  {
    id: 'weak-history-dates',
    subject: 'Social Science',
    topic: 'Timeline of Non-Cooperation & Civil Disobedience',
    accuracyPercent: 88,
    totalQuestionsAttempted: 18,
    status: 'mastered',
    lastEncountered: '2026-09-07',
    recommendedAction: 'Well mastered! Keep in spaced review rotation for long-term retention.',
    conceptSummary: '1919 (Rowlatt & Jallianwala), 1920 (Nagpur Congress), 1922 (Chauri Chaura), 1930 (Dandi Salt March).'
  }
];

export const INITIAL_SPACED_REVISION: SpacedRevisionCard[] = [
  {
    id: 'rev-quad-formula',
    topic: 'Quadratic Formula & Nature of Roots',
    subject: 'Mathematics',
    stage: 2,
    stageLabel: 'Day 3 Review',
    nextDueDate: '2026-09-11',
    isDueToday: true,
    completedReviewCount: 1,
    summaryKeyPoints: [
      'x = (-b ± √(b² - 4ac)) / (2a)',
      'If D > 0: Two distinct real roots',
      'If D = 0: Two equal real roots (-b/2a)',
      'If D < 0: No real roots'
    ]
  },
  {
    id: 'rev-redox',
    topic: 'Oxidation, Reduction, and Rancidity',
    subject: 'Science',
    stage: 1,
    stageLabel: 'Day 1 Recall',
    nextDueDate: '2026-09-11',
    isDueToday: true,
    completedReviewCount: 0,
    summaryKeyPoints: [
      'Oxidation = Addition of Oxygen or Removal of Hydrogen',
      'Reduction = Addition of Hydrogen or Removal of Oxygen',
      'Rancidity = aerial oxidation of fats/oils prevented by antioxidants or nitrogen flushing'
    ]
  },
  {
    id: 'rev-resources',
    topic: 'Black Soil vs Alluvial Soil Features',
    subject: 'Social Science',
    stage: 3,
    stageLabel: 'Day 7 Reinforcement',
    nextDueDate: '2026-09-13',
    isDueToday: false,
    completedReviewCount: 2,
    summaryKeyPoints: [
      'Alluvial soil: Deposited by Indus, Ganga, Brahmaputra; rich in potash and lime; ideal for sugarcane and paddy',
      'Black soil (Regur): Formed from volcanic basalt rocks; high moisture retention; best for cotton cultivation in Deccan trap'
    ]
  }
];

export const PRELOADED_SAMPLE_CHAPTERS = [
  {
    title: 'Class 10 Science: Light - Reflection and Refraction',
    subject: 'Science' as const,
    grade: 'Class 10' as const,
    notes: `Light travels in straight lines in a homogeneous medium.
1. Reflection of Light:
- Angle of incidence equals angle of reflection (∠i = ∠r).
- The incident ray, the reflected ray, and the normal at the point of incidence all lie in the same plane.
- Concave mirrors converge light. When object is at infinity, image is formed at focus F. When object is at C, image is at C (real, inverted, equal size). When object is between F and P, image is behind the mirror (virtual, erect, magnified).
- Convex mirrors diverge light and always form virtual, erect, and diminished images. Used in vehicle rear-view mirrors for wide field of view.
- Mirror formula: 1/f = 1/v + 1/u. Magnification m = h'/h = -v/u.

2. Refraction of Light:
- The change in direction of light when it passes obliquely from one medium to another.
- Snell's law: sin(i) / sin(r) = n₂ / n₁ (constant for given media pair).
- Optical density: Speed of light is 3 × 10⁸ m/s in vacuum. In glass (n=1.5), v = 2 × 10⁸ m/s.
- Lenses: Convex lens converges rays (focal length is positive). Concave lens diverges rays (focal length is negative).
- Lens formula: 1/f = 1/v - 1/u. Power P = 1 / f(in meters), unit is Dioptre (D).`
  },
  {
    title: 'Class 9 Science: Force and Laws of Motion',
    subject: 'Science' as const,
    grade: 'Class 9' as const,
    notes: `1. Newton's First Law of Motion (Law of Inertia):
An object remains in a state of rest or of uniform motion in a straight line unless acted upon by an external unbalanced force. Inertia is directly proportional to mass.

2. Newton's Second Law of Motion:
The rate of change of momentum of an object is directly proportional to the applied unbalanced force in the direction of force.
Momentum p = m × v (kg·m/s).
Mathematical formulation: F = m × a (Force = mass × acceleration).
SI unit of Force is Newton (N) = kg·m/s².
Applications: A cricketer pulls his hands backward while catching a ball to increase time, thereby reducing impact force.

3. Newton's Third Law of Motion:
To every action, there is an equal and opposite reaction, and they act on two different bodies.
Examples: Recoil of gun, walking on ground, rocket propulsion.

4. Law of Conservation of Momentum:
Total momentum of an isolated system remains constant in any collision: m₁u₁ + m₂u₂ = m₁v₁ + m₂v₂.`
  },
  {
    title: 'Class 10 Mathematics: Quadratic Equations',
    subject: 'Mathematics' as const,
    grade: 'Class 10' as const,
    notes: `Standard Form of a Quadratic Equation:
ax² + bx + c = 0, where a, b, c are real numbers and a ≠ 0.

Methods of Solving:
1. Factorization Method (Splitting the middle term):
Find two numbers p and q such that p + q = b and p × q = a × c.

2. Quadratic Formula (Sridharacharya's Rule):
x = (-b ± √(b² - 4ac)) / (2a)

Nature of Roots depends on Discriminant D = b² - 4ac:
- Case 1: If D > 0, the equation has two distinct real roots.
- Case 2: If D = 0, the equation has two equal real roots (each root = -b / 2a).
- Case 3: If D < 0, the equation has no real roots (roots are imaginary/complex).

Word Problem Strategies:
- Consecutive integers: x and x + 1.
- Speed, distance, time: Time = Distance / Speed.
- Area & geometry: Area of rectangle = length × breadth.`
  },
  {
    title: 'Class 8 Science: Cell - Structure and Functions',
    subject: 'Science' as const,
    grade: 'Class 8' as const,
    notes: `1. Discovery of Cell: Robert Hooke in 1665 observed cork cells under a simple magnifying lens.
2. Cell Theory: All living organisms are composed of cells, and the cell is the basic structural and functional unit of life.
3. Prokaryotes vs Eukaryotes:
- Prokaryotic cells lack a well-defined membrane-bound nucleus (e.g. Bacteria, Blue-green algae).
- Eukaryotic cells possess a true nucleus with nuclear membrane (e.g. Onion cell, Human cheek cell).
4. Key Cell Organelles:
- Cell Wall: Rigid outer boundary present ONLY in plant cells for protection against temperature and wind.
- Cell Membrane: Semi-permeable layer regulating entry and exit of substances.
- Cytoplasm: Jelly-like matrix where chemical reactions take place.
- Nucleus: Control centre of the cell containing genetic material (DNA/chromosomes) and nucleolus.
- Mitochondria: Powerhouse of the cell, generates ATP energy.
- Chloroplasts: Plastids containing chlorophyll for photosynthesis, present only in plant cells.
- Vacuoles: Large and central in plant cells; small or absent in animal cells.`
  }
];
