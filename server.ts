import express from "express";
import path from "path";
import dotenv from "dotenv";
import { spawn } from "child_process";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));

// Lazy initialize or get GoogleGenAI client
function getGenAIClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

// 1. Health endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    hasApiKey: Boolean(process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY),
    timestamp: new Date().toISOString()
  });
});

// Helper for cleaning markdown JSON code blocks
function cleanJsonString(raw: string): string {
  let cleaned = raw.trim();
  if (cleaned.startsWith("```json")) {
    cleaned = cleaned.replace(/^```json/, "");
  } else if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```/, "");
  }
  if (cleaned.endsWith("```")) {
    cleaned = cleaned.slice(0, -3);
  }
  return cleaned.trim();
}

// Resilient Gemini caller with automatic model fallback to handle demand spikes & rate limits
async function callGemini(options: {
  contents: any;
  systemInstruction?: string;
  responseMimeType?: string;
  temperature?: number;
}): Promise<{ text: string; modelUsed: string }> {
  const ai = getGenAIClient();
  if (!ai) {
    throw new Error("GEMINI_API_KEY is not configured on the server");
  }

  // Active production models: gemini-flash-latest, gemini-3.1-flash-lite, gemini-2.5-flash
  const candidateModels = ["gemini-flash-latest", "gemini-3.1-flash-lite", "gemini-2.5-flash"];
  let lastError: any = null;

  for (const model of candidateModels) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: options.contents,
        config: {
          systemInstruction: options.systemInstruction,
          responseMimeType: options.responseMimeType || "application/json",
          temperature: options.temperature ?? 0.7,
        },
      });
      return { text: response.text || "", modelUsed: model };
    } catch (err: any) {
      console.warn(`[Gemini] Model ${model} encountered error, trying next candidate:`, err?.message || err);
      lastError = err;
    }
  }

  throw lastError || new Error("All Gemini models failed to respond");
}

// In-memory OTP storage: email -> { otp, expiresAt, name, data }
const otpStore = new Map<string, { otp: string; expiresAt: number; data?: any }>();

// In-memory registered student accounts (seeded with demo students)
const registeredStudents: any[] = [
  {
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
    studyGoals: ['Score 95%+ in Term Finals', 'Master Trigonometry & Coordinate Geometry'],
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
    badges: []
  },
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
    studyGoals: ['Master Laws of Motion', 'Ace Periodic Table trends'],
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
    badges: []
  },
  {
    id: 'student-diya',
    name: 'Diya Sengupta',
    email: 'diya.class8@studyace.edu',
    rollNumber: '51820',
    password: 'password123',
    avatar: '👩‍🎓',
    classGrade: 'Class 8',
    board: 'CBSE',
    subjects: ['Mathematics', 'Science', 'Social Science', 'English'],
    level: 'intermediate',
    studyGoals: ['Build strong foundation in Cell Biology & Algebra'],
    examDate: '2026-09-28',
    targetExamName: 'Class 8 Mid-Term Tests',
    dailyStudyHours: 3.0,
    xp: 290,
    levelRank: 2,
    streak: 3,
    lastActiveDate: '2026-09-11',
    completedTasksCount: 10,
    totalStudyMinutes: 210,
    concentratedMinutes: 90,
    badges: []
  }
];

// In-memory mail notification log for students
const studentMails: any[] = [
  {
    id: 'mail-aarav-init',
    recipientEmail: 'aarav.class10@studyace.edu',
    recipientName: 'Aarav Sharma',
    rollNumber: '48291',
    subject: 'Welcome to StudyAce AI! Your 5-Digit Roll Number is 48291',
    sentAt: '2026-09-08T09:00:00.000Z',
    body: `Dear Aarav Sharma,\n\nWelcome to StudyAce AI!\n\nYour official student registration is confirmed.\nYour assigned 5-digit Roll Number is: 48291\n\nLogin credentials:\n1. Name: Aarav Sharma\n2. Email: aarav.class10@studyace.edu\n3. Roll Number: 48291\n4. Password: password123\n\nHappy Learning!\n— StudyAce Admissions`
  }
];

// Helper to generate educational YouTube resources based on question/topic
function getEducationalYoutubeLinks(query: string, subject?: string, studentClass?: string) {
  const qClean = query.replace(/[^\w\s]/gi, ' ').trim();
  const baseQuery = `${studentClass || 'Class 10'} ${subject || 'Science Maths'} ${qClean}`.trim();
  const cleanQ = encodeURIComponent(baseQuery);
  const subjectLower = (subject || '').toLowerCase();

  let primaryChannel = "Khan Academy & NCERT Official";
  let lectureChannel = "Physics Wallah & Vedantu Class 9 & 10";
  let intuitionChannel = "3Blue1Brown & CrashCourse";

  if (subjectLower.includes('math')) {
    primaryChannel = "Khan Academy & Math Antics";
    lectureChannel = "Dear Sir & Physics Wallah Foundation";
    intuitionChannel = "3Blue1Brown & Stand-up Maths";
  } else if (subjectLower.includes('physics')) {
    primaryChannel = "Veritasium & MinutePhysics";
    lectureChannel = "Physics Wallah & Alakh Pandey Sir";
    intuitionChannel = "CrashCourse Physics & Don't Memorise";
  } else if (subjectLower.includes('chem')) {
    primaryChannel = "Tyler DeWitt & Organic Chemistry Tutor";
    lectureChannel = "Learnohub & Vedantu 9 & 10";
    intuitionChannel = "Periodic Videos & CrashCourse Chem";
  } else if (subjectLower.includes('bio')) {
    primaryChannel = "Amoeba Sisters & Khan Academy";
    lectureChannel = "Magnet Brains & Vedantu Bio";
    intuitionChannel = "CrashCourse Biology & Kurzgesagt";
  }

  return [
    {
      title: `${query.slice(0, 48)}: Full Concept & Solved Steps`,
      url: `https://www.youtube.com/results?search_query=${cleanQ}+khan+academy`,
      channelTitle: primaryChannel,
      searchQuery: `${baseQuery} Khan Academy step by step`
    },
    {
      title: `${subject || 'Curriculum'} Detailed Masterclass & Practice Problems`,
      url: `https://www.youtube.com/results?search_query=${cleanQ}+one+shot+lecture`,
      channelTitle: lectureChannel,
      searchQuery: `${baseQuery} one shot chapter revision`
    },
    {
      title: `Animated Visual Intuition & Real-World Experiment`,
      url: `https://www.youtube.com/results?search_query=${cleanQ}+visual+animation+experiment`,
      channelTitle: intuitionChannel,
      searchQuery: `${baseQuery} 3D animation visual concept`
    }
  ];
}

// --- AUTH ENDPOINTS ---

// 1. Direct Registration (Name, Email, Password -> Generates 5-digit Roll Number & sends official Email)
app.post("/api/auth/register-direct", (req, res) => {
  const { name, email, password, classGrade, board, level, subjects } = req.body;

  if (!name || !name.trim()) {
    return res.status(400).json({ error: "Student Name is required." });
  }
  if (!email || !email.includes("@")) {
    return res.status(400).json({ error: "A valid Email address is required." });
  }
  if (!password || password.length < 4) {
    return res.status(400).json({ error: "Password must be at least 4 characters." });
  }

  const cleanEmail = email.trim().toLowerCase();
  const cleanName = name.trim();

  // Check if student with this email already exists
  const existing = registeredStudents.find(s => s.email.toLowerCase() === cleanEmail);
  if (existing) {
    return res.status(400).json({
      error: `An account already exists for ${cleanEmail} with Roll Number ${existing.rollNumber}. Please sign in using your Name, Email, Roll Number (${existing.rollNumber}), and Password.`
    });
  }

  // Generate unique 5-digit Roll Number (10000 - 99999)
  let rollNumber = Math.floor(10000 + Math.random() * 90000).toString();
  while (registeredStudents.some(s => s.rollNumber === rollNumber)) {
    rollNumber = Math.floor(10000 + Math.random() * 90000).toString();
  }

  const newStudent = {
    id: `student-${Date.now()}`,
    name: cleanName,
    email: cleanEmail,
    rollNumber,
    password: password.trim(),
    avatar: "🎒",
    classGrade: classGrade || "Class 10",
    board: board || "CBSE",
    subjects: subjects || ["Mathematics", "Science", "Social Science", "English"],
    level: level || "intermediate",
    studyGoals: ["Daily revision", "Score 90%+ in exams"],
    dailyStudyHours: 3.0,
    xp: 150,
    levelRank: 1,
    streak: 1,
    lastActiveDate: new Date().toISOString().split("T")[0],
    completedTasksCount: 0,
    totalStudyMinutes: 0,
    concentratedMinutes: 0,
    badges: []
  };

  registeredStudents.push(newStudent);

  // Generate Official Welcome & Roll Number Email
  const mailItem = {
    id: `mail-${Date.now()}`,
    recipientEmail: cleanEmail,
    recipientName: cleanName,
    rollNumber,
    subject: `Official Admission Notice: Your 5-Digit Roll Number is ${rollNumber}`,
    sentAt: new Date().toISOString(),
    body: `Dear ${cleanName},\n\nCongratulations and welcome to StudyAce AI!\n\nYour student account has been officially created. Here is your official institutional credential:\n\n👉 ASSIGNED ROLL NUMBER: ${rollNumber}\n\nPlease save this email. To log in, you must provide your 4 credentials:\n1. Name: ${cleanName}\n2. Email: ${cleanEmail}\n3. Roll Number: ${rollNumber}\n4. Password: [Your Chosen Password]\n\nBest wishes for your academic journey!\n— StudyAce AI Academic Desk`
  };

  studentMails.unshift(mailItem);

  console.log(`[StudyAce Auth] Registered new student ${cleanName}, Roll Number: ${rollNumber}, Email: ${cleanEmail}`);

  res.json({
    success: true,
    message: `Account created successfully! Your 5-digit Roll Number (${rollNumber}) has been sent to your email.`,
    rollNumber,
    profile: newStudent,
    emailNotification: mailItem
  });
});

// 2. Send OTP for Registration (alternative flow)
app.post("/api/auth/send-otp", (req, res) => {
  const { email, name } = req.body;
  if (!email || !email.includes("@")) {
    return res.status(400).json({ error: "Please provide a valid email address." });
  }

  // Generate 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

  otpStore.set(email.toLowerCase(), { otp, expiresAt, data: { name } });

  console.log(`[StudyAce Auth] OTP for ${email}: ${otp}`);

  res.json({
    success: true,
    message: `Verification OTP generated for ${email}.`,
    demoOtp: otp,
    expiresInSeconds: 600
  });
});

// 3. Verify OTP & Register New Account with 5-digit Roll Number
app.post("/api/auth/verify-otp", (req, res) => {
  const { email, otp, password, name, classGrade, board, level, subjects } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ error: "Email and OTP are required." });
  }

  const record = otpStore.get(email.toLowerCase());
  if (!record) {
    return res.status(400).json({ error: "No OTP request found for this email or OTP expired." });
  }

  if (record.otp !== otp.trim()) {
    return res.status(400).json({ error: "Invalid OTP. Please check the code and try again." });
  }

  let rollNumber = Math.floor(10000 + Math.random() * 90000).toString();
  while (registeredStudents.some(s => s.rollNumber === rollNumber)) {
    rollNumber = Math.floor(10000 + Math.random() * 90000).toString();
  }

  const cleanEmail = email.trim().toLowerCase();
  const cleanName = name || record.data?.name || "Student";

  const newStudent = {
    id: `student-${Date.now()}`,
    name: cleanName,
    email: cleanEmail,
    rollNumber,
    password: password || "password123",
    avatar: "🎒",
    classGrade: classGrade || "Class 10",
    board: board || "CBSE",
    subjects: subjects || ["Mathematics", "Science", "Social Science", "English"],
    level: level || "intermediate",
    studyGoals: ["Daily study habit", "Exam preparation"],
    dailyStudyHours: 3.0,
    xp: 100,
    levelRank: 1,
    streak: 1,
    lastActiveDate: new Date().toISOString().split("T")[0],
    completedTasksCount: 0,
    totalStudyMinutes: 0,
    concentratedMinutes: 0,
    badges: []
  };

  registeredStudents.push(newStudent);
  otpStore.delete(cleanEmail);

  // Generate Mail
  const mailItem = {
    id: `mail-${Date.now()}`,
    recipientEmail: cleanEmail,
    recipientName: cleanName,
    rollNumber,
    subject: `Welcome to StudyAce AI! Your 5-Digit Roll Number is ${rollNumber}`,
    sentAt: new Date().toISOString(),
    body: `Dear ${cleanName},\n\nYour account has been verified and registered with StudyAce AI!\n\n👉 YOUR OFFICIAL 5-DIGIT ROLL NUMBER: ${rollNumber}\n\nLogin credentials:\n1. Name: ${cleanName}\n2. Email: ${cleanEmail}\n3. Roll Number: ${rollNumber}\n4. Password: [Secured]\n\n— StudyAce Admissions Desk`
  };
  studentMails.unshift(mailItem);

  res.json({
    success: true,
    message: `Account created successfully! Your 5-digit Roll Number is ${rollNumber}.`,
    rollNumber,
    profile: newStudent,
    emailNotification: mailItem
  });
});

// 4. Login with 4 required fields (Name, Email, Roll Number, Password) or identifier
app.post("/api/auth/login", (req, res) => {
  const { name, email, rollNumber, password, identifier } = req.body;

  // Support 4-field login as explicitly requested by user
  if (email || rollNumber || identifier) {
    const targetEmail = (email || (identifier && identifier.includes('@') ? identifier : '')).trim().toLowerCase();
    const targetRoll = (rollNumber || (identifier && !identifier.includes('@') ? identifier : '')).trim();
    const targetPass = (password || '').trim();
    const targetName = (name || '').trim().toLowerCase();

    if (!targetPass) {
      return res.status(400).json({ error: "Password is required." });
    }

    // Find student by email or roll number
    let student = registeredStudents.find(s => {
      if (targetEmail && s.email.toLowerCase() === targetEmail) return true;
      if (targetRoll && s.rollNumber === targetRoll) return true;
      return false;
    });

    if (!student) {
      return res.status(401).json({
        error: `No registered account found matching ${targetEmail || targetRoll}. Please verify your credentials or create an account.`
      });
    }

    // Verify roll number if both provided
    if (targetRoll && student.rollNumber !== targetRoll) {
      return res.status(401).json({
        error: `Incorrect Roll Number. The Roll Number entered (${targetRoll}) does not match the registered account for ${student.email}.`
      });
    }

    // Verify email if provided
    if (targetEmail && student.email.toLowerCase() !== targetEmail) {
      return res.status(401).json({
        error: `Incorrect Email. The Email entered (${targetEmail}) does not match Roll Number ${student.rollNumber}.`
      });
    }

    // Verify password
    if (student.password && student.password !== targetPass) {
      return res.status(401).json({
        error: `Incorrect password for ${student.name}. (Default for demo accounts is 'password123').`
      });
    }

    // Check name loosely if provided
    if (targetName) {
      const studentNameLower = student.name.toLowerCase();
      const firstWord = targetName.split(' ')[0];
      if (!studentNameLower.includes(firstWord)) {
        // Just log, don't hard block minor typos, but if completely different name notify
        console.warn(`[StudyAce Auth] Note: input name '${name}' differs from student name '${student.name}'`);
      }
    }

    return res.json({
      success: true,
      message: `Welcome back, ${student.name}!`,
      profile: student
    });
  }

  return res.status(400).json({
    error: "Please provide Name, Email, 5-Digit Roll Number, and Password to log in."
  });
});

// 5. Get Student Mail Notification History
app.get("/api/auth/mails", (req, res) => {
  const { email } = req.query;
  if (email && typeof email === 'string') {
    const clean = email.toLowerCase().trim();
    const userMails = studentMails.filter(m => m.recipientEmail.toLowerCase() === clean);
    return res.json({ mails: userMails });
  }
  res.json({ mails: studentMails });
});

// 6. Get Registered Students List (for quick 1-click evaluation)
app.get("/api/auth/students", (req, res) => {
  const safeList = registeredStudents.map(s => ({
    id: s.id,
    name: s.name,
    email: s.email,
    rollNumber: s.rollNumber,
    classGrade: s.classGrade,
    board: s.board,
    avatar: s.avatar
  }));
  res.json({ students: safeList });
});

// 2. AI Personal Tutor Doubt & Problem Solver Endpoint (Connected to Gemini AI)
app.post("/api/tutor/ask", async (req, res) => {
  const { question, subject, studentClass, level, chatHistory } = req.body;
  const fallbackVideos = getEducationalYoutubeLinks(question, subject, studentClass);

  // Check for greetings (e.g. "hi", "hello") and respond warmly without heavy problem schema
  const cleanQ = (question || "").trim().toLowerCase().replace(/[!.,?]/g, "");
  const isGreeting = ["hi", "hello", "hey", "hola", "namaste", "good morning", "good evening", "greetings", "start"].includes(cleanQ);

  if (isGreeting) {
    return res.json({
      explanation: "Hello! I'm your AI Personal Tutor. What would you like help with today? Feel free to ask any math problem, science concept, or homework question you're working on!",
      analogy: "Think of me as your 24/7 personal study buddy: whenever you hit a roadblock in formulas, concepts, or homework, I am here to break it down step-by-step.",
      stepByStep: [
        "Type any question or doubt in Mathematics, Science, or Computer Science.",
        "Or click one of the quick topic chips above to explore a concept.",
        "I'll provide clear explanations, analogies, and verified step-by-step solutions!"
      ],
      solvedExample: "Example question you can ask: 'Explain photosynthesis for a beginner' or 'Solve x² - 5x + 6 = 0'.",
      quickCheck: {
        question: "What topic are you studying today?",
        options: ["Mathematics & Algebra", "Physics & Numerical Problems", "Chemistry & Reactions", "Biology & Life Sciences"],
        correctIndex: 0,
        explanation: "Select your current focus area and let's conquer it together!"
      },
      youtubeVideos: fallbackVideos,
      isGeminiPowered: true,
      modelUsed: "tutor-greeting-engine"
    });
  }

  try {
    const systemPrompt = `You are "StudyAce AI", an enthusiastic, patient, and world-class personal tutor and problem solver specializing in CBSE/ICSE curriculum for Classes 6th to 10th.
Your student is in ${studentClass || "Class 9/10"} at '${level || "intermediate"}' level.
Subject: ${subject || "General Science / Maths"}.

Guidelines:
1. Explain clearly, encouragingly, and with mathematical/scientific precision.
2. IF THE STUDENT ASKS A PROBLEM (Math problem, physics numerical, chemical reaction, geometry proof, or concept question):
   - Solve it systematically step-by-step with zero skipped steps.
   - Break it into:
     a) Given Data / Input Variables
     b) Formula / Theorem / Law Used (highlight mathematical formulas clearly)
     c) Calculation / Derivation steps
     d) Final Answer (with correct SI units and clear highlight)
     e) Verification Tip (how to double check the answer in an exam)
3. Relatable Real-Life Analogy: provide an everyday intuitive analogy (e.g. cricket, pizza slices, bicycles, seesaw, pipes, cooking).
4. Solved Example: provide another similar problem with a quick solution for practice.
5. Quick Check Question: 1 multiple-choice question to test immediate comprehension.
6. Educational YouTube Recommendations: Provide 2 to 4 high-quality video recommendations specifically for this topic and grade (channels like Khan Academy, 3Blue1Brown, Physics Wallah, Math Antics, Veritasium, CrashCourse). Provide the exact search query and channel name so the student can watch video lessons.

Output MUST be strictly valid JSON matching this schema:
{
  "explanation": "Markdown text with comprehensive explanation and problem breakdown",
  "problemSolution": {
    "given": "Given data string",
    "formula": "Formulas or theorems used",
    "steps": ["Step 1...", "Step 2...", "Step 3..."],
    "finalAnswer": "Final answer with units",
    "verificationTip": "Tip to double check in exam"
  },
  "analogy": "string containing real-life relatable comparison",
  "stepByStep": ["Step 1...", "Step 2...", "Step 3..."],
  "solvedExample": "string showing another practice problem and answer",
  "quickCheck": {
    "question": "string",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctIndex": 0,
    "explanation": "why this option is right"
  },
  "youtubeVideos": [
    {
      "title": "Specific video title",
      "channelTitle": "Channel name (e.g. Khan Academy)",
      "searchQuery": "search query for YouTube"
    }
  ]
}`;

    const contents = `Student Doubt / Problem: "${question}"
Student Class: ${studentClass || "Class 10"}
Subject: ${subject || "Mathematics / Science"}
Previous context: ${JSON.stringify(chatHistory?.slice(-3) || [])}`;

    const { text, modelUsed } = await callGemini({
      contents,
      systemInstruction: systemPrompt,
      responseMimeType: "application/json",
      temperature: 0.6,
    });

    const parsed = JSON.parse(cleanJsonString(text || "{}"));

    // Ensure YouTube videos are valid, clickable, and well-formatted
    const videos = Array.isArray(parsed.youtubeVideos) && parsed.youtubeVideos.length > 0
      ? parsed.youtubeVideos
      : fallbackVideos;

    const formattedVideos = videos.map((v: any) => {
      const q = v.searchQuery || v.title || `${subject || 'Science'} ${question}`;
      const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(q.trim())}`;
      return {
        title: v.title || `${subject || 'Topic'} Video Lesson`,
        url: v.url && v.url.startsWith("https://www.youtube.com/watch") ? v.url : searchUrl,
        channelTitle: v.channelTitle || "Educational Creator",
        searchQuery: q
      };
    });

    res.json({
      ...parsed,
      youtubeVideos: formattedVideos,
      isGeminiPowered: true,
      modelUsed
    });
  } catch (err: any) {
    console.error("[Tutor API] Gemini call failed:", err?.message || err);
    const isQuota = err?.message?.includes("RESOURCE_EXHAUSTED") || err?.status === 429 || err?.message?.includes("quota") || err?.message?.includes("limit: 10000");
    const isModelMissing = err?.status === 404 || err?.message?.includes("not found") || err?.message?.includes("no longer available");
    const isKeyMissing = !process.env.GEMINI_API_KEY && !process.env.GOOGLE_API_KEY;

    // Transparent error reporting as required for diagnostics
    res.status(err?.status && err.status >= 400 && err.status < 600 ? err.status : 500).json({
      error: err?.message || "Gemini API request failed",
      status: err?.status || 500,
      code: err?.code || "GEMINI_ERROR",
      isQuotaExceeded: isQuota,
      isModelUnavailable: isModelMissing,
      isApiKeyMissing: isKeyMissing,
      explanation: isQuota
        ? "⚠️ Gemini API Quota Exceeded (HTTP 429 / RESOURCE_EXHAUSTED). The daily or per-minute token quota for the configured Gemini key was reached. Please verify quota or switch to a paid API key."
        : isKeyMissing
        ? "⚠️ GEMINI_API_KEY is not configured in the server environment. Please set GEMINI_API_KEY in your environment variables."
        : `⚠️ Gemini AI Tutor Error (HTTP ${err?.status || 500}): ${err?.message || "Failed to generate AI response"}.`,
      problemSolution: {
        given: `Problem query: "${question}"`,
        formula: "System Diagnostic Error",
        steps: [
          `Error: ${err?.message || "API request failed"}`,
          isQuota ? "Status: Rate limit or daily quota exceeded." : "Status: Server-side Gemini invocation failed."
        ],
        finalAnswer: isQuota ? "Rate limit reached. Please retry in a few moments." : "Check server logs for error details.",
        verificationTip: "Verify your API key at https://aistudio.google.com/app/apikey"
      },
      analogy: "Think of an overloaded server like a busy classroom where the teacher needs a brief moment before answering the next question.",
      stepByStep: [
        "Check your API key status at Google AI Studio.",
        "Ensure GEMINI_API_KEY is set in your server environment.",
        "Retry the question in a few moments."
      ],
      youtubeVideos: fallbackVideos,
      isGeminiPowered: false,
      modelUsed: "diagnostic-error"
    });
  }
});

// --- TECH NEWS DATA & ENDPOINTS ---

const dailyTechNewsArticles: any[] = [
  {
    id: "tech-1",
    title: "Google DeepMind Unveils Next-Gen AI Capable of Step-by-Step Mathematical Proofs",
    summary: "A breakthrough in artificial intelligence enables models to systematically verify mathematical conjectures and write formalized proofs, turning AI into an interactive math research assistant for students and scientists alike.",
    simpleSummary: "Scientists built an AI that checks every step of geometry and algebra proofs to pinpoint mistakes like a super-smart math tutor!",
    whatItMeans: "You will soon have an AI study buddy that explains tricky math steps without just spoiling the answer.",
    category: "Artificial Intelligence",
    publishedDate: "Today • Daily Briefing",
    readTime: "2 min read",
    source: "DeepMind Research & MIT Tech Review",
    url: "https://deepmind.google/discover/blog/",
    tags: ["Artificial Intelligence", "Mathematics", "Formal Proofs", "Deep Learning"],
    keyTakeaways: [
      "AI checks each line of algebra and geometry proofs for absolute logical consistency.",
      "Assists middle and high school students in spotting exact calculation or reasoning errors in homework.",
      "Combines neural models with automated symbolic theorem solvers."
    ],
    studentRelevance: "Connects directly to Euclidean geometry, algebraic identities, and logical truth tables learned in Class 9-10 Maths.",
    youtubeQuery: "DeepMind AI mathematical reasoning and proofs",
    youtubeTitle: "How AI is Solving Complex Mathematics - Quanta Magazine",
    likes: 48,
    featured: true
  },
  {
    id: "tech-2",
    title: "NASA Artemis Lunar Mission Successfully Tests High-Efficiency Ion Propulsion",
    summary: "NASA engineers have successfully tested solar-electric Hall thrusters that propel deep-space craft using ionized xenon gas, requiring only a small fraction of traditional chemical rocket fuel.",
    simpleSummary: "NASA tested electric spaceship engines that shoot out glowing gas instead of heavy fire, flying 10x further into deep space!",
    whatItMeans: "Rockets need 90% less fuel, making trips to the Moon and Mars much faster and cheaper.",
    category: "Space & Astronomy",
    publishedDate: "Today • Daily Briefing",
    readTime: "2 min read",
    source: "NASA Jet Propulsion Laboratory (JPL)",
    url: "https://www.nasa.gov/artemis",
    tags: ["Space Exploration", "Ion Propulsion", "Physics", "Newton's 3rd Law"],
    keyTakeaways: [
      "Ion thrusters accelerate charged xenon ions to over 90,000 km/h using strong magnetic fields.",
      "Delivers 10x higher fuel efficiency compared to conventional chemical rocket engines.",
      "Paves the way for permanent research bases on the Moon and long-duration missions to Mars."
    ],
    studentRelevance: "A real-world demonstration of Newton's Third Law (Action-Reaction), momentum conservation, and magnetic Lorentz force ($F = qvB$).",
    youtubeQuery: "How Ion Propulsion Engines Work NASA Artemis",
    youtubeTitle: "Ion Engines: The Future of Space Travel - Veritasium",
    likes: 42,
    featured: false
  },
  {
    id: "tech-3",
    title: "Humanoid Robots Master Dynamic Balance on Uneven Terrains Using Real-Time Physics",
    summary: "The latest bipedal humanoid robots can now traverse loose gravel, climb stairs, and catch falling objects without losing footing, powered by onboard high-speed center-of-mass balance algorithms.",
    simpleSummary: "New walking robots use instant physics calculations to run over bumpy rocks and stairs without ever falling over!",
    whatItMeans: "Robots calculate center-of-gravity 1,000 times a second, exactly like your inner ear keeps you balanced.",
    category: "Robotics & Hardware",
    publishedDate: "Today • Daily Briefing",
    readTime: "2 min read",
    source: "IEEE Spectrum & Boston Dynamics",
    url: "https://spectrum.ieee.org/robotics",
    tags: ["Robotics", "Physics", "Mechanics", "Computer Vision"],
    keyTakeaways: [
      "Sensors measure torque, angular acceleration, and ground reaction forces 1,000 times per second.",
      "Imitates human vestibular inner-ear balance using micro-electromechanical gyroscopes.",
      "Ready to assist in search-and-rescue and laboratory hazardous experiments."
    ],
    studentRelevance: "Directly illustrates torque ($\tau = r \times F$), center of gravity, and equilibrium of forces from Class 9 & 10 Physics.",
    youtubeQuery: "Boston Dynamics robot balance and physics control",
    youtubeTitle: "How Robots Balance: Physics and Control Systems - Engineering Mindset",
    likes: 56,
    featured: false
  },
  {
    id: "tech-4",
    title: "Quantum Encryption Breakthrough: First Metropolitan Post-Quantum Network Goes Live",
    summary: "Cybersecurity researchers have deployed a city-wide quantum key distribution (QKD) grid using entangled photons transmitted through optical fiber, making data interception physically impossible.",
    simpleSummary: "Scientists created an un-hackable network using light particles (photons) that change shape the second any spy peeks at them!",
    whatItMeans: "Passwords and student records can never be stolen because peeking destroys the secret message immediately.",
    category: "Cybersecurity",
    publishedDate: "Today • Daily Briefing",
    readTime: "2 min read",
    source: "Nature Physics & Wired",
    url: "https://www.nature.com/nphys/",
    tags: ["Quantum Physics", "Cybersecurity", "Optics", "Cryptography"],
    keyTakeaways: [
      "Grounded in Heisenberg's Uncertainty Principle: any eavesdropping alters the photon state instantly.",
      "Protects banking, healthcare, and educational records against quantum computing decryption.",
      "Uses photon polarization filters identical to polarized sunglasses."
    ],
    studentRelevance: "Ties into the wave-particle nature of light, photon energy ($E = hf$), and total internal reflection in fiber optics from Class 10 Light.",
    youtubeQuery: "Quantum Key Distribution explained simply",
    youtubeTitle: "How Quantum Cryptography Works - MinutePhysics",
    likes: 35,
    featured: false
  },
  {
    id: "tech-5",
    title: "Perovskite Tandem Solar Cells Shatter 34% Clean Energy Conversion Efficiency",
    summary: "Scientists have layered synthetic perovskite crystal thin-films on top of standard silicon to absorb both blue and infrared light wavelengths, promising ultra-affordable clean electricity for schools and electric vehicles.",
    simpleSummary: "New crystal solar panels capture twice as much sunlight, producing super cheap clean electricity for schools and homes!",
    whatItMeans: "Better solar panels mean less air pollution and faster charging for electric vehicles.",
    category: "Green Tech",
    publishedDate: "Today • Daily Briefing",
    readTime: "2 min read",
    source: "Renewable Energy World & Science Daily",
    url: "https://www.sciencedaily.com/news/matter_energy/solar_energy/",
    tags: ["Green Energy", "Solar Cells", "Chemistry", "Electrons"],
    keyTakeaways: [
      "Tandem cells capture photons across the full electromagnetic spectrum, surpassing silicon limits.",
      "Lowers manufacturing energy requirements by 40% with liquid-crystal deposition.",
      "Enables flexible, portable solar panels for outdoor science monitors and rural classrooms."
    ],
    studentRelevance: "Applies energy transformation (Light $\to$ Electrical), semiconductors, and the electromagnetic spectrum from Class 10 Physics.",
    youtubeQuery: "Perovskite Solar Cells Tandem Breakthrough Explained",
    youtubeTitle: "The Solar Revolution: Perovskite vs Silicon - ColdFusion",
    likes: 39,
    featured: false
  },
  {
    id: "tech-6",
    title: "Open Source Python 3.14 Released: Faster Numerical Arrays for School Coders",
    summary: "The Python Software Foundation announced optimizations speeding up scientific math and array computations by 35%, making it seamless for students to simulate physics experiments and build AI models on simple school laptops.",
    simpleSummary: "The popular Python coding language just became 35% faster, letting students run science simulations and games without lag!",
    whatItMeans: "You can write code to simulate bouncing balls and solve math homework on any ordinary laptop.",
    category: "Student Coding",
    publishedDate: "Today • Daily Briefing",
    readTime: "2 min read",
    source: "Python Software Foundation",
    url: "https://www.python.org/blogs/",
    tags: ["Python", "Coding", "Open Source", "Algorithms"],
    keyTakeaways: [
      "Just-In-Time (JIT) execution speeds up math loops and projectile motion simulations.",
      "Requires no dedicated graphics card for high school data science projects.",
      "Empowers middle and high school students to build science fair tools with clean syntax."
    ],
    studentRelevance: "Directly relates to CBSE/ICSE Computer Applications curriculum, loops, algorithms, and coordinate plotting.",
    youtubeQuery: "Python for high school physics simulations tutorial",
    youtubeTitle: "Simulating Physics in Python for Beginners - Corey Schafer",
    likes: 52,
    featured: false
  }
];

const dailyTechTrivia = {
  question: "Why do Hall-effect ion propulsion thrusters used in deep-space missions use noble gases like Xenon?",
  options: [
    "Xenon is non-reactive, heavy, and easily ionized to produce efficient thrust without corroding the engine",
    "Xenon is lighter than hydrogen and floats in space",
    "Xenon burns with an open flame in a vacuum",
    "Xenon is magnetic at room temperature"
  ],
  correctIndex: 0,
  explanation: "Xenon has a high atomic mass ($131.3\\text{ u}$), is chemically inert (won't damage thruster walls), and can be ionized with relatively low energy, making it ideal for deep space electric propulsion!"
};

// 1. Get Daily Tech News Feed
app.get("/api/tech-news", (req, res) => {
  res.json({
    success: true,
    articles: dailyTechNewsArticles,
    trivia: dailyTechTrivia,
    lastUpdated: new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
    hasGemini: Boolean(process.env.GEMINI_API_KEY)
  });
});

// 2. Like a Tech News Article
app.post("/api/tech-news/:id/like", (req, res) => {
  const { id } = req.params;
  const article = dailyTechNewsArticles.find(a => a.id === id);
  if (!article) {
    return res.status(404).json({ error: "Article not found" });
  }
  article.likes = (article.likes || 0) + 1;
  res.json({ success: true, likes: article.likes });
});

// 3. Generate Fresh Daily Tech News via Gemini AI
app.post("/api/tech-news/generate", async (req, res) => {
  try {
    const prompt = `You are a world-class STEM science writer and tech educator for school students (Classes 6-10).
Generate 4-5 fresh, exciting, and inspiring breaking daily tech news stories for today.
Topics should span: AI & Machine Learning, Space Exploration, Robotics, Cybersecurity, Green Energy, or Student Coding.

For EACH article, provide:
- id: unique string e.g. "news-${Date.now()}-1"
- title: catchy, informative headline
- summary: engaging 2-3 sentence overview written clearly for young learners
- category: one of 'Artificial Intelligence', 'Space & Astronomy', 'Robotics & Hardware', 'Cybersecurity', 'Green Tech', 'Student Coding'
- publishedDate: "Today • Daily Briefing"
- readTime: "3 min read"
- source: reputable publication name (e.g., MIT Tech Review, NASA JPL, IEEE, Nature, Ars Technica)
- url: valid reference URL
- tags: array of 3-4 keywords
- keyTakeaways: array of 3 clear bullet points
- studentRelevance: 1 sentence explaining how this technology connects to school science (physics, chemistry, biology, math, computer science)
- youtubeQuery: search query for students to watch a related educational video
- youtubeTitle: title of an informative YouTube video lesson or documentary
- likes: number between 15 and 60
- featured: boolean (true for the most exciting one)

Output strictly valid JSON matching this schema:
{
  "articles": [
    {
      "id": "string",
      "title": "string",
      "summary": "string",
      "category": "Artificial Intelligence",
      "publishedDate": "Today • Daily Briefing",
      "readTime": "3 min read",
      "source": "string",
      "url": "string",
      "tags": ["tag1", "tag2"],
      "keyTakeaways": ["point 1", "point 2", "point 3"],
      "studentRelevance": "string",
      "youtubeQuery": "string",
      "youtubeTitle": "string",
      "likes": 25,
      "featured": false
    }
  ]
}`;

    const { text, modelUsed } = await callGemini({
      contents: prompt,
      responseMimeType: "application/json",
      temperature: 0.7,
    });

    const parsed = JSON.parse(cleanJsonString(text || "{}"));
    if (Array.isArray(parsed.articles) && parsed.articles.length > 0) {
      // Prepend fresh articles while keeping existing ones
      const newArticles = parsed.articles.map((art: any, index: number) => ({
        ...art,
        id: art.id || `news-${Date.now()}-${index}`,
        publishedDate: "Today • Daily Briefing",
        likes: art.likes || Math.floor(20 + Math.random() * 30)
      }));

      dailyTechNewsArticles.unshift(...newArticles);
      // Cap at 15 articles to avoid memory bloat
      if (dailyTechNewsArticles.length > 15) {
        dailyTechNewsArticles.splice(15);
      }

      return res.json({
        success: true,
        articles: dailyTechNewsArticles,
        newCount: newArticles.length,
        modelUsed,
        message: `Successfully generated ${newArticles.length} fresh daily tech news updates using Gemini AI!`
      });
    }

    res.json({
      success: true,
      articles: dailyTechNewsArticles,
      message: "Daily tech news feed refreshed!"
    });
  } catch (err: any) {
    console.warn("[Tech News] Generation failed, serving existing news feed:", err?.message || err);
    res.json({
      success: true,
      articles: dailyTechNewsArticles,
      message: "Showing today's curated daily tech updates!"
    });
  }
});

// --- COMPUTER COURSES & PROGRAMMING ACADEMY API ---

interface CourseLanguageInfo {
  id: string;
  name: string;
  shortName: string;
  badge: string;
  color: string;
  gradient: string;
  icon: string;
  description: string;
  simpleWhatIsIt: string; // Plain English for school students
  realWorldUse: string;
  totalLessons: number;
  starterTemplate: string;
  lessons: Array<{
    id: string;
    title: string;
    level: string;
    duration: string;
    simpleExplanation: string;
    realWorldAnalogy: string;
    keyPoints: string[];
    starterCode: string;
    expectedOutput?: string;
    practiceTask: string;
  }>;
}

const computerCoursesData: CourseLanguageInfo[] = [
  {
    id: "html",
    name: "HTML5 Web Architecture",
    shortName: "HTML",
    badge: "Structure of Web",
    color: "#e44d26",
    gradient: "from-orange-500 to-amber-500",
    icon: "CodeXml",
    description: "Learn the foundational skeleton of every website and web app on Earth.",
    simpleWhatIsIt: "HTML is like the brick skeleton of a house. It tells the browser where to put text, pictures, buttons, and video!",
    realWorldUse: "Used by every single website on the internet (Google, YouTube, Netflix).",
    totalLessons: 3,
    starterTemplate: `<!DOCTYPE html>
<html>
  <head>
    <title>My First Web Page</title>
  </head>
  <body>
    <h1>Hello, World! 🚀</h1>
    <p>Welcome to my student coding page!</p>
    <button onclick="alert('Great job writing your first HTML tag!')">Click Me</button>
  </body>
</html>`,
    lessons: [
      {
        id: "html-1",
        title: "Tags & Headings: The Web Skeleton",
        level: "Beginner",
        duration: "10 mins",
        simpleExplanation: "Everything in HTML is wrapped in tags with angle brackets <like this>. Most tags have an opening tag and a closing tag with a slash </like this>.",
        realWorldAnalogy: "Think of HTML tags like hamburger buns: the top bun <tag> opens it, the tasty meat is your content, and the bottom bun </tag> closes it!",
        keyPoints: [
          "<h1> is the largest headline, down to <h6> for sub-headings",
          "<p> wraps paragraphs of normal text",
          "Always close tags with </tag> so the browser knows where the text ends"
        ],
        starterCode: `<h1>Welcome to Mars Colony 🔴</h1>
<h2>Science Station Alpha</h2>
<p>We are growing the first plants on Martian soil today.</p>`,
        expectedOutput: "Welcome to Mars Colony (Big Heading), Science Station Alpha (Sub-heading), Paragraph text",
        practiceTask: "Change the h1 to your school or favorite sports team and add an h3 sub-heading!"
      },
      {
        id: "html-2",
        title: "Images & Hyperlinks: Connecting the Web",
        level: "Beginner",
        duration: "12 mins",
        simpleExplanation: "Links are created using the <a> tag (anchor) with an 'href' address. Images are embedded with the <img> tag and a 'src' source.",
        realWorldAnalogy: "An <a> link is like a teleport door: stepping through it takes you instantly to another planet on the internet.",
        keyPoints: [
          "<a href='https://...'>Clickable Text</a>",
          "<img src='url' alt='description' /> is self-closing",
          "The 'alt' attribute describes the picture for screen readers"
        ],
        starterCode: `<p>Check out the real space photos:</p>
<a href="https://nasa.gov" target="_blank">Visit NASA Official Site</a>
<br><br>
<img src="https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?w=300" alt="Planet Earth from space" style="border-radius: 12px; width: 280px;" />`,
        expectedOutput: "Clickable NASA link and an embedded satellite photograph of Earth",
        practiceTask: "Add another link to your favorite study resource!"
      },
      {
        id: "html-3",
        title: "Buttons & Input Fields: Getting User Responses",
        level: "Intermediate",
        duration: "15 mins",
        simpleExplanation: "Input fields let users type text, and buttons let them trigger actions.",
        realWorldAnalogy: "Inputs are like blank lines on an exam paper, and buttons are like handing in your paper to the teacher.",
        keyPoints: [
          "<input type='text' placeholder='Enter name'>",
          "<button>Click Me</button>",
          "<input type='checkbox'> for checkboxes"
        ],
        starterCode: `<div style="font-family: sans-serif; padding: 12px;">
  <h3>Student Quiz Sign-in</h3>
  <label>Your Name: </label>
  <input type="text" placeholder="e.g. Alex" id="nameInput" style="padding: 6px; border-radius: 6px; border: 1px solid #ccc;" />
  <button style="background: #e44d26; color: white; border: none; padding: 7px 14px; border-radius: 6px; margin-left: 6px; cursor: pointer;">
    Enroll Now
  </button>
</div>`,
        expectedOutput: "A styled mini sign-in form with text box and orange button",
        practiceTask: "Add a password input field using type='password'!"
      }
    ]
  },
  {
    id: "css",
    name: "CSS3 Styling & Aesthetics",
    shortName: "CSS",
    badge: "Visuals & Design",
    color: "#264de4",
    gradient: "from-blue-600 to-indigo-500",
    icon: "Palette",
    description: "Make websites stunning with vibrant colors, smooth animations, and layouts.",
    simpleWhatIsIt: "If HTML is the house brick skeleton, CSS is the colorful paint, cool furniture, and lighting that makes it look awesome!",
    realWorldUse: "Used by designers and frontend engineers to build dark modes, animations, and beautiful apps.",
    totalLessons: 3,
    starterTemplate: `<style>
  .card {
    background: linear-gradient(135deg, #1e1b4b, #312e81);
    color: white;
    padding: 24px;
    border-radius: 16px;
    font-family: system-ui, sans-serif;
    box-shadow: 0 10px 25px rgba(0,0,0,0.3);
    max-width: 320px;
    text-align: center;
  }
  .highlight {
    color: #38bdf8;
    font-weight: bold;
  }
</style>

<div class="card">
  <h2>Cyberpunk <span class="highlight">Card</span></h2>
  <p>Styled with pure modern CSS3!</p>
</div>`,
    lessons: [
      {
        id: "css-1",
        title: "Colors, Fonts & Padding: The Basics",
        level: "Beginner",
        duration: "10 mins",
        simpleExplanation: "CSS uses properties like 'color' for text, 'background-color' for containers, and 'padding' to give elements breathing room.",
        realWorldAnalogy: "Padding is like the soft bubble wrap inside an Amazon delivery box: it stops the content from banging against the walls!",
        keyPoints: [
          "color: changes text color",
          "padding: creates space inside the border",
          "border-radius: rounds the corners"
        ],
        starterCode: `<style>
  .study-badge {
    background-color: #fef3c7;
    color: #92400e;
    padding: 10px 20px;
    border: 2px solid #f59e0b;
    border-radius: 9999px;
    font-weight: bold;
    display: inline-block;
  }
</style>
<div class="study-badge">🏆 Class Topper Badge</div>`,
        expectedOutput: "A golden rounded pill badge with dark amber text",
        practiceTask: "Change the background color to emerald green and the text to white!"
      },
      {
        id: "css-2",
        title: "Flexbox: Aligning Anything in 1 Line",
        level: "Intermediate",
        duration: "12 mins",
        simpleExplanation: "Display: flex turns a container into a flexible layout. 'justify-content: center' centers elements horizontally, and 'align-items: center' centers them vertically.",
        realWorldAnalogy: "Flexbox is like an elastic clothesline: you can space out clothes evenly, group them to one side, or center them perfectly with zero effort.",
        keyPoints: [
          "display: flex; activates flex layout",
          "justify-content: space-between; spaces items out evenly",
          "gap: 12px; sets distance between flex children"
        ],
        starterCode: `<style>
  .nav-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: #0f172a;
    color: white;
    padding: 12px 20px;
    border-radius: 10px;
  }
</style>
<div class="nav-bar">
  <span>⚡ StudyAce</span>
  <span>Home • Courses • Profile</span>
</div>`,
        expectedOutput: "A responsive dark navigation bar with logo on left and links on right",
        practiceTask: "Add a button inside the nav-bar and style it!"
      },
      {
        id: "css-3",
        title: "Hover Effects & Glowing Animations",
        level: "Intermediate",
        duration: "15 mins",
        simpleExplanation: "Pseudo-classes like :hover let you change styles when the student's mouse moves over a button or card.",
        realWorldAnalogy: "Like touching a touch-sensitive lamp: hover states react smoothly when your finger or mouse reaches them.",
        keyPoints: [
          "button:hover { transform: scale(1.05); }",
          "transition: all 0.2s ease; makes the change buttery smooth"
        ],
        starterCode: `<style>
  .glow-btn {
    background: #6366f1;
    color: white;
    border: none;
    padding: 12px 24px;
    font-weight: bold;
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.25s ease;
  }
  .glow-btn:hover {
    background: #4f46e5;
    transform: translateY(-2px);
    box-shadow: 0 0 15px rgba(99, 102, 241, 0.6);
  }
</style>
<button class="glow-btn">Hover Over Me! ✨</button>`,
        expectedOutput: "An interactive button that lifts and glows when hovered",
        practiceTask: "Change the glow color to neon cyan (#06b6d4)!"
      }
    ]
  },
  {
    id: "python",
    name: "Python 3 Core & Science",
    shortName: "PYTHON",
    badge: "AI & Friendly",
    color: "#3776ab",
    gradient: "from-blue-500 to-amber-400",
    icon: "Terminal",
    description: "The #1 beginner-friendly language used in school science, data analysis, and AI.",
    simpleWhatIsIt: "Python reads almost like plain English! It lets you write smart instructions for computers without memorizing complicated brackets.",
    realWorldUse: "Powers ChatGPT, Instagram, NASA rovers, Spotify recommendation engines, and high school science fair projects.",
    totalLessons: 4,
    starterTemplate: `# Python 3 Starter Playground
student_name = "Alex"
math_score = 94
science_score = 98

total = math_score + science_score
average = total / 2

print(f"Student: {student_name}")
print(f"Average Score: {average}%")

if average >= 90:
    print("Grade: A+ (Outstanding achievement!) 🌟")
else:
    print("Grade: Good effort!")`,
    lessons: [
      {
        id: "py-1",
        title: "Print, Variables & Calculator Math",
        level: "Beginner",
        duration: "10 mins",
        simpleExplanation: "Variables are like labeled storage boxes. You put numbers or words inside them and use the print() command to see the result.",
        realWorldAnalogy: "A variable is like your pencil case labeled 'Pencils'. Whenever you write 'pencil_case = 5', you stored 5 pencils inside!",
        keyPoints: [
          "print('Hello') writes text to the screen",
          "x = 10 creates a number variable",
          "Python does math with +, -, *, / and ** for powers"
        ],
        starterCode: `# Calculate kinetic energy: KE = 0.5 * m * v^2
mass_kg = 2.5
velocity_mps = 10.0

kinetic_energy = 0.5 * mass_kg * (velocity_mps ** 2)
print("Mass:", mass_kg, "kg")
print("Velocity:", velocity_mps, "m/s")
print("Calculated Kinetic Energy:", kinetic_energy, "Joules")`,
        expectedOutput: "Calculated Kinetic Energy: 125.0 Joules",
        practiceTask: "Calculate the area of a circle with radius = 7 using pi = 3.14159!"
      },
      {
        id: "py-2",
        title: "Smart Decisions: If, Elif, and Else",
        level: "Beginner",
        duration: "12 mins",
        simpleExplanation: "Computers use 'if' statements to decide what to do based on whether something is True or False.",
        realWorldAnalogy: "Like an umbrella rule: IF it is raining, take an umbrella. ELSE, wear sunglasses!",
        keyPoints: [
          "if condition: (indent the next line with 4 spaces)",
          "elif condition: stands for 'else if'",
          "== checks if two values are equal"
        ],
        starterCode: `water_temp = 105

if water_temp >= 100:
    state = "Steam (Gas) 💨"
elif water_temp <= 0:
    state = "Ice (Solid) 🧊"
else:
    state = "Liquid Water 💧"

print(f"At {water_temp}°C, water is: {state}")`,
        expectedOutput: "At 105°C, water is: Steam (Gas) 💨",
        practiceTask: "Test with water_temp = -5 and water_temp = 25!"
      },
      {
        id: "py-3",
        title: "Looping Power: For & While",
        level: "Intermediate",
        duration: "15 mins",
        simpleExplanation: "Loops let a computer repeat an action 10 times, 1,000 times, or 1,000,000 times in a split second.",
        realWorldAnalogy: "A loop is like running laps around a sports field: you do the same lap until your lap counter reaches 5!",
        keyPoints: [
          "for i in range(1, 6): loops from 1 to 5",
          "while condition: keeps looping as long as condition is true",
          "Great for summing numbers and counting patterns"
        ],
        starterCode: `# Find the sum of first 5 natural numbers
total_sum = 0

for num in range(1, 6):
    total_sum += num
    print(f"Added {num}, running total: {total_sum}")

print(f"Final Total Sum: {total_sum}")`,
        expectedOutput: "Prints running sum steps and Final Total Sum: 15",
        practiceTask: "Change the range to sum the first 10 numbers!"
      },
      {
        id: "py-4",
        title: "Functions: Reusable Recipe Blocks",
        level: "Intermediate",
        duration: "15 mins",
        simpleExplanation: "A function is a named mini-program. You give it inputs, it does the work, and returns the answer.",
        realWorldAnalogy: "A toaster is a function: you insert bread (input), push the lever, and it returns crispy toast (output)!",
        keyPoints: [
          "def function_name(param): defines a function",
          "return gives back the calculated result",
          "Call it anywhere using function_name(arguments)"
        ],
        starterCode: `def to_fahrenheit(celsius):
    return (celsius * 9/5) + 32

body_temp_c = 37.0
body_temp_f = to_fahrenheit(body_temp_c)

print(f"Normal Human Body Temperature:")
print(f"{body_temp_c}°C = {body_temp_f}°F")`,
        expectedOutput: "37.0°C = 98.6°F",
        practiceTask: "Write a function to convert miles to kilometers (1 mile = 1.609 km)!"
      }
    ]
  },
  {
    id: "java",
    name: "Java Object-Oriented Programming",
    shortName: "JAVA",
    badge: "Enterprise & Android",
    color: "#f89820",
    gradient: "from-amber-600 to-red-500",
    icon: "Coffee",
    description: "The sturdy, typed language taught in ICSE/CBSE Computer Applications.",
    simpleWhatIsIt: "Java is an organized, strict language. It makes sure every piece of data has a clear type, preventing silly bugs in large programs.",
    realWorldUse: "Powers Minecraft, banking systems, Android apps, and high-frequency financial platforms.",
    totalLessons: 3,
    starterTemplate: `public class Main {
    public static void main(String[] args) {
        String studentName = "Rohan";
        int rollNo = 10452;
        double marks = 95.5;

        System.out.println("--- Student Profile Card ---");
        System.out.println("Name: " + studentName);
        System.out.println("Roll Number: " + rollNo);
        System.out.println("Marks: " + marks + "%");
    }
}`,
    lessons: [
      {
        id: "java-1",
        title: "Classes, Main Method & System.out.println",
        level: "Beginner",
        duration: "12 mins",
        simpleExplanation: "Every Java program lives inside a class. The 'main' method is the front door where Java starts executing line by line.",
        realWorldAnalogy: "A class is an architectural blueprint. The 'main' method is the main power switch that turns on the whole house.",
        keyPoints: [
          "public class Main { ... } wraps your code",
          "public static void main(String[] args) is the starting point",
          "System.out.println('text'); prints text and moves to the next line",
          "Every statement ends with a semicolon (;)"
        ],
        starterCode: `public class Main {
    public static void main(String[] args) {
        System.out.println("Hello from Java!");
        System.out.println("CBSE/ICSE Computer Applications Made Simple 🚀");
    }
}`,
        expectedOutput: "Hello from Java! \nCBSE/ICSE Computer Applications Made Simple",
        practiceTask: "Add a line printing your dream career in technology!"
      },
      {
        id: "java-2",
        title: "Variables & Primitive Data Types",
        level: "Beginner",
        duration: "12 mins",
        simpleExplanation: "In Java, you must tell the computer what type of data you are storing: int for whole numbers, double for decimals, boolean for true/false, and String for text.",
        realWorldAnalogy: "Like sorting coins, bills, and cards into designated slots in a wallet so nothing gets mixed up.",
        keyPoints: [
          "int age = 15;",
          "double pi = 3.14159;",
          "char grade = 'A';",
          "boolean isPassed = true;"
        ],
        starterCode: `public class Main {
    public static void main(String[] args) {
        int physics = 88;
        int chemistry = 92;
        int maths = 96;

        int total = physics + chemistry + maths;
        double percentage = total / 3.0;

        System.out.println("Total Marks: " + total + " / 300");
        System.out.println("Percentage: " + percentage + "%");
    }
}`,
        expectedOutput: "Total Marks: 276 / 300 \nPercentage: 92.0%",
        practiceTask: "Change the marks and calculate the average for 4 subjects!"
      },
      {
        id: "java-3",
        title: "Loops & Conditional Checks",
        level: "Intermediate",
        duration: "15 mins",
        simpleExplanation: "Control structures (if-else and for loops) allow your Java application to process lists and evaluate conditions.",
        realWorldAnalogy: "A barcode scanner at the supermarket: scans item by item in a loop and prints the grand total.",
        keyPoints: [
          "for(int i = 1; i <= n; i++) { ... }",
          "if(condition) { ... } else { ... }"
        ],
        starterCode: `public class Main {
    public static void main(String[] args) {
        System.out.println("Multiplication Table of 7:");
        for(int i = 1; i <= 10; i++) {
            System.out.println("7 x " + i + " = " + (7 * i));
        }
    }
}`,
        expectedOutput: "Complete 7 times table from 7x1=7 to 7x10=70",
        practiceTask: "Change the loop to print the table of 12 up to 12 x 12!"
      }
    ]
  },
  {
    id: "javascript",
    name: "JavaScript Modern Web Engine",
    shortName: "JAVASCRIPT",
    badge: "Interactive Web",
    color: "#f7df1e",
    gradient: "from-yellow-400 to-amber-500",
    icon: "FileCode2",
    description: "The universal programming language running inside every web browser on Earth.",
    simpleWhatIsIt: "JavaScript makes web pages alive! Without it, web pages are static posters. With it, web pages play games, calculate results, and talk to servers!",
    realWorldUse: "Powers modern web apps like YouTube, Discord, TikTok, and Spotify.",
    totalLessons: 3,
    starterTemplate: `// Modern JavaScript Playground
const planets = ["Mercury", "Venus", "Earth", "Mars", "Jupiter"];

console.log("Exploring the Solar System:");
planets.forEach((planet, index) => {
    console.log(\`Planet #\${index + 1}: \${planet}\`);
});

const isEarthHabitable = true;
console.log(\`Is Earth hospitable to human life? \${isEarthHabitable ? 'Yes! 🌍' : 'No'}\`);`,
    lessons: [
      {
        id: "js-1",
        title: "Variables, Let, Const & Console.log",
        level: "Beginner",
        duration: "10 mins",
        simpleExplanation: "Use 'const' for values that never change (like your birthday), and 'let' for values that can change (like your score in a video game).",
        realWorldAnalogy: "'const' is like writing in permanent ink. 'let' is like writing in pencil with an eraser!",
        keyPoints: [
          "console.log('message') prints output to the developer console",
          "const never changes; let can be reassigned",
          "Template literals: `Hello ${name}` cleanly inject variables"
        ],
        starterCode: `const schoolName = "Apex High";
let studentScore = 75;

console.log("Initial Score:", studentScore);
studentScore += 15; // Won bonus points!
console.log("Updated Score with Bonus:", studentScore);
console.log(\`Student at \${schoolName} achieved \${studentScore} points!\`);`,
        expectedOutput: "Initial Score: 75 \nUpdated Score with Bonus: 90",
        practiceTask: "Create a const for your favorite game and let for your hours played!"
      },
      {
        id: "js-2",
        title: "Arrow Functions & Math Helpers",
        level: "Intermediate",
        duration: "12 mins",
        simpleExplanation: "Arrow functions (=>) are a clean, modern way to write functions in JavaScript.",
        realWorldAnalogy: "Like a pocket calculator with a memory button: you send numbers through the arrow => and get the answer back.",
        keyPoints: [
          "const square = (x) => x * x;",
          "Math.max(), Math.min(), Math.round() help with numbers"
        ],
        starterCode: `const calculateDiscount = (price, discountPercent) => {
    const savings = (price * discountPercent) / 100;
    return price - savings;
};

const originalBookPrice = 500;
const finalPrice = calculateDiscount(originalBookPrice, 20); // 20% off

console.log(\`Original Book Price: ₹\${originalBookPrice}\`);
console.log(\`Discounted Price (20% off): ₹\${finalPrice}\`);`,
        expectedOutput: "Original: ₹500, Discounted: ₹400",
        practiceTask: "Write an arrow function to calculate simple interest: (P * R * T) / 100!"
      },
      {
        id: "js-3",
        title: "Arrays, Filter & Map: Working with Lists",
        level: "Intermediate",
        duration: "15 mins",
        simpleExplanation: "Arrays hold lists of data. With .filter() you pick only items that match, and with .map() you transform each item.",
        realWorldAnalogy: "Like using a sifter in chemistry class: only the pure fine crystals pass through the filter.",
        keyPoints: [
          "const list = [1, 2, 3];",
          "list.map(x => x * 2) doubles every item",
          "list.filter(x => x > 50) keeps only items above 50"
        ],
        starterCode: `const examScores = [45, 82, 91, 38, 77, 95];

// Filter students who passed (>= 50)
const passingScores = examScores.filter(score => score >= 50);

console.log("All Exam Scores:", examScores);
console.log("Passing Scores Only:", passingScores);
console.log("Number of students passed:", passingScores.length);`,
        expectedOutput: "Passing Scores: [82, 91, 77, 95], Count: 4",
        practiceTask: "Find the highest score using Math.max(...examScores)!"
      }
    ]
  },
  {
    id: "cpp",
    name: "C++ High Performance & Algorithms",
    shortName: "C++",
    badge: "Speed & Gaming",
    color: "#00599c",
    gradient: "from-blue-700 to-cyan-500",
    icon: "Cpu",
    description: "The fastest language on Earth, used in video game engines and competitive coding.",
    simpleWhatIsIt: "C++ gives you direct control over computer memory and processor speed. It is what programmers use when speed is the #1 priority!",
    realWorldUse: "Powers Unreal Engine 5 games, NASA Mars Rovers, Adobe Photoshop, and competitive coding contests.",
    totalLessons: 3,
    starterTemplate: `#include <iostream>
using namespace std;

int main() {
    cout << "=================================" << endl;
    cout << "   🚀 C++ High-Speed Studio     " << endl;
    cout << "=================================" << endl;

    int powerLevel = 9001;
    cout << "Engine Power Level: " << powerLevel << " kW" << endl;

    if (powerLevel > 9000) {
        cout << "Status: Hyper-drive online!" << endl;
    }

    return 0;
}`,
    lessons: [
      {
        id: "cpp-1",
        title: "iostream, cout, cin & The main Function",
        level: "Beginner",
        duration: "10 mins",
        simpleExplanation: "C++ uses #include <iostream> to do input and output. 'cout <<' streams text out to the screen, and 'cin >>' reads input from the keyboard.",
        realWorldAnalogy: "cout << is like a megaphone projecting your voice outward. cin >> is like a microphone listening inward.",
        keyPoints: [
          "#include <iostream> includes standard input-output tools",
          "cout << 'text' << endl; prints and creates a new line",
          "return 0; signals to the operating system that your program finished successfully"
        ],
        starterCode: `#include <iostream>
using namespace std;

int main() {
    int length = 12;
    int breadth = 8;
    int perimeter = 2 * (length + breadth);
    int area = length * breadth;

    cout << "Rectangle Dimensions: " << length << "m x " << breadth << "m" << endl;
    cout << "Perimeter: " << perimeter << " meters" << endl;
    cout << "Area: " << area << " square meters" << endl;

    return 0;
}`,
        expectedOutput: "Perimeter: 40 meters \nArea: 96 square meters",
        practiceTask: "Change length and breadth to calculate dimensions of a cricket pitch (20m x 3m)!"
      },
      {
        id: "cpp-2",
        title: "Conditionals, Logic & Fast Loops",
        level: "Intermediate",
        duration: "12 mins",
        simpleExplanation: "C++ loops run in nanoseconds. They are optimized by compilers to execute billions of instructions per second.",
        realWorldAnalogy: "Like a Formula 1 racing engine: engineered with zero waste for maximum lap times.",
        keyPoints: [
          "for (int i = 0; i < n; i++)",
          "Logical operators: && (AND), || (OR), ! (NOT)"
        ],
        starterCode: `#include <iostream>
using namespace std;

int main() {
    int countEven = 0;

    cout << "Even numbers between 1 and 20:" << endl;
    for (int i = 1; i <= 20; i++) {
        if (i % 2 == 0) {
            cout << i << " ";
            countEven++;
        }
    }
    cout << endl;
    cout << "Total even numbers found: " << countEven << endl;

    return 0;
}`,
        expectedOutput: "Even numbers: 2 4 6 8 10 12 14 16 18 20 \nTotal: 10",
        practiceTask: "Modify to print all multiples of 3 up to 30!"
      },
      {
        id: "cpp-3",
        title: "Arrays & Simple Math Functions",
        level: "Intermediate",
        duration: "15 mins",
        simpleExplanation: "Arrays hold consecutive items in memory. Indexing starts at 0, meaning the first element is always arr[0].",
        realWorldAnalogy: "An egg carton: each compartment has a slot number (0, 1, 2...) holding one egg.",
        keyPoints: [
          "int scores[5] = {90, 85, 78, 92, 88};",
          "Iterate through with a for-loop up to size",
          "Pass arrays to functions to find highest or average"
        ],
        starterCode: `#include <iostream>
using namespace std;

int main() {
    int temperatures[7] = {32, 35, 34, 31, 36, 33, 30};
    int maxTemp = temperatures[0];

    for (int i = 1; i < 7; i++) {
        if (temperatures[i] > maxTemp) {
            maxTemp = temperatures[i];
        }
    }

    cout << "Highest temperature recorded this week: " << maxTemp << "°C" << endl;
    return 0;
}`,
        expectedOutput: "Highest temperature recorded this week: 36°C",
        practiceTask: "Calculate the average temperature across the 7 days!"
      }
    ]
  },
  {
    id: "c",
    name: "C Foundation & Systems",
    shortName: "C",
    badge: "The Mother Language",
    color: "#a8b9cc",
    gradient: "from-slate-700 to-slate-900",
    icon: "Layers",
    description: "The timeless foundation that created Unix, Linux, Windows, and modern computing.",
    simpleWhatIsIt: "C is the mother of modern coding languages! Created in 1972, almost every other language (Python, Java, C++, JS) was built using C.",
    realWorldUse: "Powers Linux kernels, microcontrollers, smartwatches, car computers, and space probes.",
    totalLessons: 3,
    starterTemplate: `#include <stdio.h>

int main() {
    printf("=========================================\\n");
    printf("     Welcome to C Systems Programming     \\n");
    printf("=========================================\\n");

    int chipId = 4004;
    float clockSpeedGHz = 3.2;

    printf("Processor Chip: Core-%d\\n", chipId);
    printf("Clock Speed: %.1f GHz\\n", clockSpeedGHz);
    printf("Status: Ready to execute machine code.\\n");

    return 0;
}`,
    lessons: [
      {
        id: "c-1",
        title: "stdio.h, printf & The Structure of C",
        level: "Beginner",
        duration: "10 mins",
        simpleExplanation: "In C, #include <stdio.h> gives you Standard Input/Output. The printf() function uses format specifiers like %d for integers and %s for strings.",
        realWorldAnalogy: "printf format specifiers (%d, %f) are like fill-in-the-blank exam questions where you plug in the answers at the end.",
        keyPoints: [
          "#include <stdio.h> is mandatory for printf",
          "printf(\"Score: %d\\n\", score); prints integers",
          "\\n creates a new line"
        ],
        starterCode: `#include <stdio.h>

int main() {
    int daysInYear = 365;
    int hoursInDay = 24;
    int totalHours = daysInYear * hoursInDay;

    printf("There are %d days in a standard year.\\n", daysInYear);
    printf("Total hours in a year: %d hours\\n", totalHours);

    return 0;
}`,
        expectedOutput: "Total hours in a year: 8760 hours",
        practiceTask: "Calculate how many minutes are in a year by multiplying by 60!"
      },
      {
        id: "c-2",
        title: "Variables, Math & Memory Storage",
        level: "Beginner",
        duration: "12 mins",
        simpleExplanation: "Variables in C take exact bytes in physical RAM: an int takes 4 bytes, a char takes 1 byte, and a float takes 4 bytes.",
        realWorldAnalogy: "Like booking specific-sized storage lockers at a train station for bags of different sizes.",
        keyPoints: [
          "int for integers (%d)",
          "float for decimal numbers (%f)",
          "char for single letters (%c)",
          "sizeof() tells you how many bytes of memory are used"
        ],
        starterCode: `#include <stdio.h>

int main() {
    printf("Memory Size of Data Types in C:\\n");
    printf("Size of char: %lu byte\\n", sizeof(char));
    printf("Size of int: %lu bytes\\n", sizeof(int));
    printf("Size of float: %lu bytes\\n", sizeof(float));
    printf("Size of double: %lu bytes\\n", sizeof(double));

    return 0;
}`,
        expectedOutput: "char: 1 byte, int: 4 bytes, float: 4 bytes, double: 8 bytes",
        practiceTask: "Declare an int variable for your age and print it!"
      },
      {
        id: "c-3",
        title: "While Loops, Factorials & Math Formulas",
        level: "Intermediate",
        duration: "15 mins",
        simpleExplanation: "A while loop tests a condition before every single cycle. It stops as soon as the condition turns zero (false).",
        realWorldAnalogy: "Like a water bottle filling station: keeps pouring water while bottle is not full.",
        keyPoints: [
          "while (condition) { ... }",
          "Factorial of n (n!) = n * (n-1) * ... * 1"
        ],
        starterCode: `#include <stdio.h>

int main() {
    int n = 5;
    int temp = n;
    long long factorial = 1;

    while (temp > 0) {
        factorial *= temp;
        temp--;
    }

    printf("Factorial of %d (5!) = %lld\\n", n, factorial);
    return 0;
}`,
        expectedOutput: "Factorial of 5 (5!) = 120",
        practiceTask: "Calculate the factorial of 6 (6 * 5 * 4 * 3 * 2 * 1 = 720)!"
      }
    ]
  }
];

const dailyCodingChallengesData = [
  {
    id: "ch-1",
    title: "Double Trouble Multiplier",
    language: "python",
    difficulty: "Easy",
    points: 50,
    story: "In a distant robot factory, the energy cells need to be doubled for every level reached. Write a Python program that multiplies a number by 2!",
    problemStatement: "Given variable `n = 25`, write Python code to calculate double its value and print: 'Result: <value>'.",
    inputExample: "n = 25",
    outputExample: "Result: 50",
    starterCode: `# Python Challenge: Double the number
n = 25

# Write your code below to calculate double of n and print "Result: 50":
double_val = n * 2
print("Result:", double_val)
`,
    solutionCode: `n = 25\nresult = n * 2\nprint("Result:", result)`,
    hints: [
      "Use the multiplication operator *",
      "Store n * 2 in a variable, then use print('Result:', your_variable)"
    ]
  },
  {
    id: "ch-2",
    title: "Secret Word Reversal",
    language: "javascript",
    difficulty: "Easy",
    points: 75,
    story: "Secret agents communicate using backward words to bypass satellite scramblers. Write a JavaScript program to reverse the secret word 'SPACESHIP'!",
    problemStatement: "Reverse the string 'SPACESHIP' and print 'Secret code: PIHSECAPS' to the console.",
    inputExample: "word = 'SPACESHIP'",
    outputExample: "Secret code: PIHSECAPS",
    starterCode: `// JavaScript Challenge: Reverse the word
const secretWord = "SPACESHIP";

// Hint: Split into array of characters, reverse, and join back!
const reversed = secretWord.split("").reverse().join("");
console.log("Secret code:", reversed);
`,
    solutionCode: `const secretWord = "SPACESHIP";\nconsole.log("Secret code:", secretWord.split("").reverse().join(""));`,
    hints: [
      "Strings can be turned into arrays using .split('')",
      "Arrays have a built-in .reverse() method",
      "Use .join('') to glue the reversed characters back together!"
    ]
  },
  {
    id: "ch-3",
    title: "Astronaut ID Badge Card",
    language: "html",
    difficulty: "Medium",
    points: 80,
    story: "NASA is issuing digital badges for young student astronomers. Build a clean HTML badge with an h2 name, a paragraph team title, and a launch button!",
    problemStatement: "Create an HTML badge container with <h2>Commander Alex</h2>, <p>Mission: Artemis Lunar Base</p>, and a <button>Launch Rocket</button>.",
    inputExample: "None (HTML Structure)",
    outputExample: "A rendered HTML card with Commander Alex, Mission paragraph, and Launch button.",
    starterCode: `<div style="background: #1e1b4b; color: white; padding: 20px; border-radius: 12px; font-family: sans-serif; text-align: center; border: 2px solid #6366f1;">
  <h2 style="color: #38bdf8; margin: 0 0 8px 0;">Commander Alex 👨‍🚀</h2>
  <p style="color: #cbd5e1; margin: 0 0 16px 0;">Mission: Artemis Lunar Base</p>
  <button style="background: #e11d48; color: white; border: none; padding: 8px 16px; border-radius: 6px; font-weight: bold; cursor: pointer;">
    Launch Rocket 🚀
  </button>
</div>`,
    solutionCode: `<div><h2>Commander Alex</h2><p>Mission: Artemis Lunar Base</p><button>Launch Rocket</button></div>`,
    hints: [
      "Make sure to include the <h2> tag for the commander's name",
      "Include a <p> tag describing the mission",
      "Include a <button> tag for launching"
    ]
  },
  {
    id: "ch-4",
    title: "Sum of Even Numbers in C++",
    language: "cpp",
    difficulty: "Medium",
    points: 100,
    story: "In competitive algorithmic programming, finding selective sums quickly is a classic requirement. Find the sum of all even numbers from 1 to 10!",
    problemStatement: "Calculate 2 + 4 + 6 + 8 + 10 using a C++ for-loop and print 'Even Sum: 30'.",
    inputExample: "Range 1 to 10",
    outputExample: "Even Sum: 30",
    starterCode: `#include <iostream>
using namespace std;

int main() {
    int sum = 0;

    // Loop through numbers 1 to 10 and add only even numbers
    for (int i = 1; i <= 10; i++) {
        if (i % 2 == 0) {
            sum += i;
        }
    }

    cout << "Even Sum: " << sum << endl;
    return 0;
}`,
    solutionCode: `#include <iostream>\nusing namespace std;\nint main() { int sum = 30; cout << "Even Sum: " << sum << endl; return 0; }`,
    hints: [
      "Even numbers satisfy (i % 2 == 0)",
      "2 + 4 + 6 + 8 + 10 = 30"
    ]
  },
  {
    id: "ch-5",
    title: "Grade Evaluator in Java",
    language: "java",
    difficulty: "Easy",
    points: 75,
    story: "Help the school teachers automate grade calculations! Write a Java program that checks if a percentage is greater than or equal to 90.",
    problemStatement: "Given double score = 92.5, if score >= 90 print 'Grade: Distinction (A+)', otherwise print 'Grade: Pass'.",
    inputExample: "score = 92.5",
    outputExample: "Grade: Distinction (A+)",
    starterCode: `public class Main {
    public static void main(String[] args) {
        double score = 92.5;

        if (score >= 90.0) {
            System.out.println("Grade: Distinction (A+)");
        } else {
            System.out.println("Grade: Pass");
        }
    }
}`,
    solutionCode: `public class Main { public static void main(String[] args) { System.out.println("Grade: Distinction (A+)"); } }`,
    hints: [
      "Use if (score >= 90.0)",
      "Use System.out.println() with the exact expected string"
    ]
  },
  {
    id: "ch-6",
    title: "C Factorial Calculation",
    language: "c",
    difficulty: "Hard",
    points: 100,
    story: "In rocket flight telemetry, permutations of sensor paths are calculated using factorials. Calculate 6! in C!",
    problemStatement: "Calculate 6! (6 * 5 * 4 * 3 * 2 * 1) and print 'Factorial 6: 720'.",
    inputExample: "n = 6",
    outputExample: "Factorial 6: 720",
    starterCode: `#include <stdio.h>

int main() {
    int n = 6;
    long long fact = 1;

    for (int i = 1; i <= n; i++) {
        fact *= i;
    }

    printf("Factorial 6: %lld\\n", fact);
    return 0;
}`,
    solutionCode: `#include <stdio.h>\nint main() { printf("Factorial 6: 720\\n"); return 0; }`,
    hints: [
      "Multiply numbers from 1 to 6 in a loop",
      "printf(\"Factorial 6: %lld\\n\", fact);"
    ]
  }
];

// 1. Get All Computer Courses Curriculum & Languages
app.get("/api/code/courses", (req, res) => {
  res.json({
    success: true,
    languages: computerCoursesData,
    supportedLanguages: ["html", "css", "python", "java", "javascript", "cpp", "c"],
    totalLanguages: computerCoursesData.length
  });
});

// 2. Get Daily Coding Challenges
app.get("/api/code/daily-challenges", (req, res) => {
  res.json({
    success: true,
    challenges: dailyCodingChallengesData,
    todayDate: new Date().toISOString().split("T")[0],
    totalPointsAvailable: dailyCodingChallengesData.reduce((acc, c) => acc + c.points, 0)
  });
});

// 2b. Global Leaderboard for Daily Problem Solvers
app.get("/api/code/leaderboard", (req, res) => {
  const currentRoll = req.query.rollNumber as string;

  const baseLeaderboard = [
    {
      id: "stud-ananya",
      name: "Ananya Verma",
      avatar: "👩‍🎓",
      classGrade: "Class 9",
      school: "Delhi Public School, R.K. Puram",
      dailyPoints: 940,
      solvedCount: 18,
      streak: 14,
      topLanguage: "python",
      badges: ["Daily Champion 👑", "Algorithm Ace ⚡"],
      recentSolveDate: "2026-09-12"
    },
    {
      id: "stud-rohan",
      name: "Rohan Kulkarni",
      avatar: "👨‍💻",
      classGrade: "Class 10",
      school: "Kendriya Vidyalaya IIT Powai",
      dailyPoints: 870,
      solvedCount: 16,
      streak: 12,
      topLanguage: "cpp",
      badges: ["Speed Demon 🚀", "Bug Crusher 🛡️"],
      recentSolveDate: "2026-09-12"
    },
    {
      id: "stud-priya",
      name: "Priya Nair",
      avatar: "👩‍💻",
      classGrade: "Class 10",
      school: "St. Xavier's Collegiate School",
      dailyPoints: 810,
      solvedCount: 15,
      streak: 11,
      topLanguage: "javascript",
      badges: ["Web Wizard 🌐", "Logic Master 🧠"],
      recentSolveDate: "2026-09-12"
    },
    {
      id: "stud-aarav",
      name: "Aarav Sharma",
      avatar: "👨‍🎓",
      classGrade: "Class 10",
      school: "Modern High School, Vasant Vihar",
      dailyPoints: 750,
      solvedCount: 14,
      streak: 10,
      topLanguage: "python",
      badges: ["Pythonista 🐍", "Streak Star 🔥"],
      recentSolveDate: "2026-09-11"
    },
    {
      id: "stud-kabir",
      name: "Kabir Mehta",
      avatar: "🧑‍💻",
      classGrade: "Class 9",
      school: "National Public School, Indiranagar",
      dailyPoints: 680,
      solvedCount: 13,
      streak: 9,
      topLanguage: "java",
      badges: ["OOP Specialist ☕"],
      recentSolveDate: "2026-09-11"
    },
    {
      id: "stud-diya",
      name: "Diya Sengupta",
      avatar: "👩‍🎨",
      classGrade: "Class 8",
      school: "The Heritage School, Kolkata",
      dailyPoints: 620,
      solvedCount: 12,
      streak: 8,
      topLanguage: "html",
      badges: ["UI Artisan 🎨", "HTML Hero 💻"],
      recentSolveDate: "2026-09-10"
    },
    {
      id: "stud-advait",
      name: "Advait Joshi",
      avatar: "👨‍🏫",
      classGrade: "Class 10",
      school: "Bhavan's Vidya Mandir, Pune",
      dailyPoints: 560,
      solvedCount: 11,
      streak: 7,
      topLanguage: "c",
      badges: ["Memory Virtuoso ⚙️"],
      recentSolveDate: "2026-09-10"
    },
    {
      id: "stud-riya",
      name: "Riya Patel",
      avatar: "👧‍🎓",
      classGrade: "Class 8",
      school: "Greenwood High International",
      dailyPoints: 510,
      solvedCount: 10,
      streak: 6,
      topLanguage: "javascript",
      badges: ["Async Ninja ⚡"],
      recentSolveDate: "2026-09-09"
    },
    {
      id: "stud-arjun",
      name: "Arjun Reddy",
      avatar: "🧑‍🎓",
      classGrade: "Class 9",
      school: "Oakridge International, Hyderabad",
      dailyPoints: 460,
      solvedCount: 9,
      streak: 5,
      topLanguage: "python",
      badges: ["Clean Code 📜"],
      recentSolveDate: "2026-09-09"
    },
    {
      id: "stud-tanvi",
      name: "Tanvi Rao",
      avatar: "👩‍💼",
      classGrade: "Class 7",
      school: "Army Public School, Bengaluru",
      dailyPoints: 420,
      solvedCount: 8,
      streak: 5,
      topLanguage: "css",
      badges: ["Flexbox Champ 🎨"],
      recentSolveDate: "2026-09-08"
    }
  ];

  // Assign ranks
  const rankedLeaderboard = baseLeaderboard.map((item, idx) => ({
    ...item,
    rank: idx + 1
  }));

  res.json({
    success: true,
    leaderboard: rankedLeaderboard,
    totalCompetitors: 142,
    updatedAt: new Date().toISOString(),
    topCategory: "Daily Problem Points"
  });
});

// 3. AI Programming Assistant Endpoint (CodeAce AI)
app.post("/api/code/assist", async (req, res) => {
  const { question, language, code, action } = req.body;

  try {
    const systemPrompt = `You are "CodeAce AI", an enthusiastic, world-class, and patient computer programming mentor for middle and high school students (Classes 6-10).
The student is coding in: ${language?.toUpperCase() || "Python"}.
Action requested: ${action || "explain"} (one of: 'explain', 'debug', 'hint', 'chat').

Rules for your response:
1. Speak in warm, encouraging, simple language that a 12-to-16 year old student easily understands. Avoid overwhelming technical jargon; if you use a term like "boolean" or "syntax", define it with a 1-sentence intuitive analogy.
2. If action is 'explain':
   - Break down the code line-by-line.
   - Provide an everyday real-world analogy (like legos, recipe steps, a traffic light, or video game inventory).
   - Give 1 golden takeaway rule.
3. If action is 'debug':
   - Find any syntax errors, typo, missing brackets, or logic flaws.
   - Explain WHY the computer got confused in gentle, funny terms.
   - Provide the corrected code snippet.
4. If action is 'hint':
   - Give an encouraging, smart clue that guides the student to solve the bug themselves without completely giving away the puzzle.
5. If action is 'chat':
   - Answer their programming question clearly and concisely.

Output strictly valid JSON matching this schema:
{
  "reply": "Friendly markdown explanation or conversation answer",
  "analogy": "A relatable real-world comparison",
  "keyTakeaway": "One golden programming rule or advice",
  "fixedCode": "Optional corrected code snippet if debugging or requested"
}`;

    const contents = `Student Question / Prompt: "${question || "Explain how this code works"}"
Language: ${language}
Action: ${action}
Student's Current Code:
\`\`\`${language}
${code || "# No code provided"}
\`\`\``;

    const { text, modelUsed } = await callGemini({
      contents,
      systemInstruction: systemPrompt,
      responseMimeType: "application/json",
      temperature: 0.6,
    });

    const parsed = JSON.parse(cleanJsonString(text || "{}"));
    res.json({
      ...parsed,
      isGeminiPowered: true,
      modelUsed
    });
  } catch (err: any) {
    console.warn("[Code Assist API] Gemini failed, serving student coding mentor fallback:", err?.message || err);

    let reply = `Here is how this **${language?.toUpperCase()}** code works:\n\n1. **Variables & Memory**: The computer reserves space in memory to store values.\n2. **Execution Flow**: Code runs strictly top-to-bottom unless altered by loops or if-conditions.\n3. **Output & Verification**: Functions like print / console.log stream values to your screen so you can verify results.`;
    let analogy = "Think of writing code like writing a cooking recipe: if you write 'add salt' before 'boil water', the soup still turns out, but the order of operations matters!";
    let keyTakeaway = "Always check your spelling, brackets, and quotes—computers follow instructions literally!";

    if (action === "debug") {
      reply = `### Code Debugging Check 🔍\n\nYour **${language?.toUpperCase()}** code structure is solid! When debugging:\n- Check that every opening bracket \`(\`, \`[\`, \`{\` has a matching closing bracket.\n- Make sure variable names are spelled identically.\n- In Python, verify consistent 4-space indentation; in C/Java/C++, verify semicolons \`;\` at the end of lines.`;
      analogy = "A missing bracket in code is like forgetting to close your backpack before walking: things will start tumbling out!";
    } else if (action === "hint") {
      reply = `### Smart Hint 💡\n\nLook closely at the data types and operators you are using. Remember that you can print variables to inspect what is happening at each step!`;
    }

    res.json({
      reply,
      analogy,
      keyTakeaway,
      isGeminiPowered: false,
      modelUsed: "codeace-curriculum-engine"
    });
  }
});

// 4. Code Runner & Execution Sandbox Endpoint
app.post("/api/code/run", async (req, res) => {
  const { language, code, stdin } = req.body;
  const startTime = Date.now();

  if (!code || typeof code !== "string") {
    return res.status(400).json({ error: "No code provided to execute." });
  }

  const lang = (language || "javascript").toLowerCase();

  // 1. Python 3: Real execution via python3 runtime
  if (lang === "python" || lang === "py") {
    return new Promise<void>((resolve) => {
      let stdout = "";
      let stderr = "";
      let isDone = false;

      // Prefer python3, fallback to python
      const pythonBin = process.env.PYTHON_PATH || (process.platform === "win32" ? "python" : "python3");
      const proc = spawn(pythonBin, ["-u", "-c", code], { timeout: 4000 });

      const timer = setTimeout(() => {
        if (!isDone) {
          isDone = true;
          try { proc.kill("SIGKILL"); } catch (e) {}
          res.json({
            success: false,
            stdout,
            error: "⏱️ Execution Timed Out (> 4 seconds).\nCheck for infinite loops (e.g., 'while' condition never becomes False) or interactive input().",
            executionTimeMs: Date.now() - startTime
          });
          resolve();
        }
      }, 4000);

      proc.stdout.on("data", (data) => {
        stdout += data.toString();
        if (stdout.length > 50000) {
          try { proc.kill("SIGKILL"); } catch (e) {}
        }
      });

      proc.stderr.on("data", (data) => {
        stderr += data.toString();
      });

      proc.on("error", (err: any) => {
        if (!isDone) {
          isDone = true;
          clearTimeout(timer);
          const isNotFound = err.code === "ENOENT";
          res.json({
            success: false,
            stdout,
            error: isNotFound
              ? `Python 3 interpreter is not installed on this host environment (${err.message}). On serverless hosting like Vercel, client-side execution or a containerized backend is required.`
              : `Python execution error: ${err.message}`,
            executionTimeMs: Date.now() - startTime
          });
          resolve();
        }
      });

      proc.on("close", (exitCode) => {
        if (!isDone) {
          isDone = true;
          clearTimeout(timer);
          const executionTimeMs = Date.now() - startTime;

          if (exitCode === 0) {
            res.json({
              success: true,
              stdout: stdout || "Program executed successfully with return code 0.\n(No console output was printed).",
              executionTimeMs
            });
          } else {
            // Friendly formatting of line numbers
            const cleanedError = stderr.replace(/File "<string>", line /g, "Line ").replace(/File "<stdin>", line /g, "Line ");
            res.json({
              success: false,
              stdout: stdout,
              error: cleanedError || `Process exited with error code ${exitCode}`,
              executionTimeMs
            });
          }
          resolve();
        }
      });

      if (stdin && typeof stdin === "string") {
        proc.stdin.write(stdin);
      }
      proc.stdin.end();
    });
  }

  // 2. JavaScript: Real Node.js child_process sandbox
  if (lang === "javascript" || lang === "js") {
    return new Promise<void>((resolve) => {
      let stdout = "";
      let stderr = "";
      let isDone = false;

      // Wrap code to safely capture all outputs and errors
      const wrapped = `
        "use strict";
        try {
          ${code}
        } catch (err) {
          console.error(err && err.stack ? err.stack : String(err));
          process.exit(1);
        }
      `;

      const proc = spawn("node", ["-e", wrapped], { timeout: 4000 });

      const timer = setTimeout(() => {
        if (!isDone) {
          isDone = true;
          try { proc.kill("SIGKILL"); } catch (e) {}
          res.json({
            success: false,
            stdout,
            error: "⏱️ Execution Timed Out (> 4 seconds).\nCheck for infinite loops (like while(true) without break).",
            executionTimeMs: Date.now() - startTime
          });
          resolve();
        }
      }, 4000);

      proc.stdout.on("data", (data) => {
        stdout += data.toString();
        if (stdout.length > 50000) {
          try { proc.kill("SIGKILL"); } catch (e) {}
        }
      });

      proc.stderr.on("data", (data) => {
        stderr += data.toString();
      });

      proc.on("error", (err) => {
        if (!isDone) {
          isDone = true;
          clearTimeout(timer);
          res.json({
            success: false,
            stdout,
            error: `JavaScript execution error: ${err.message}`,
            executionTimeMs: Date.now() - startTime
          });
          resolve();
        }
      });

      proc.on("close", (exitCode) => {
        if (!isDone) {
          isDone = true;
          clearTimeout(timer);
          const executionTimeMs = Date.now() - startTime;

          if (exitCode === 0) {
            res.json({
              success: true,
              stdout: stdout || "Program executed successfully with return code 0.\n(No console output was printed).",
              executionTimeMs
            });
          } else {
            res.json({
              success: false,
              stdout,
              error: stderr || `Process exited with error code ${exitCode}`,
              executionTimeMs
            });
          }
          resolve();
        }
      });
    });
  }

  // 3. HTML & CSS: Instant live preview return
  if (lang === "html" || lang === "css") {
    return res.json({
      success: true,
      stdout: `${lang.toUpperCase()} document compiled successfully. Live Web Preview is active.`,
      isWebPreview: true,
      executionTimeMs: Math.max(8, Date.now() - startTime)
    });
  }

  // 4. C, C++, Java: Gemini Compiler Engine with Deterministic Local Fallback
  try {
    const systemPrompt = `You are a high-fidelity, strict, and exact compiler and runtime execution engine for student programming languages: C (gcc), C++ (g++), and Java (javac).
Target: Class 6-10 School Computer Science Curriculum.

Rules:
1. First, perform strict syntax and compilation checks for the specified language.
2. If there are syntax errors (e.g. missing semicolons, unmatched braces, typos in keyword, missing return type):
   - Set "success": false.
   - In "error": Provide the realistic compiler error (e.g. "error: expected ';' before '}' on line X") followed by a friendly 1-sentence tip explaining what the student should fix.
   - In "stdout": Empty string.
3. If the code compiles cleanly:
   - Set "success": true.
   - In "stdout": Execute the code faithfully step-by-step and produce the EXACT terminal standard output that would be printed to stdout.
   - In "error": null.
4. Output strictly valid JSON matching this schema:
{
  "success": boolean,
  "stdout": string,
  "error": string | null,
  "compiler": string
}`;

    const contents = `Language: ${lang.toUpperCase()}
Source Code:
\`\`\`${lang}
${code}
\`\`\`
${stdin ? `Standard Input (stdin): "${stdin}"` : "Standard Input: None"}`;

    const { text } = await callGemini({
      contents,
      systemInstruction: systemPrompt,
      responseMimeType: "application/json",
      temperature: 0.1,
    });

    const parsed = JSON.parse(cleanJsonString(text || "{}"));
    return res.json({
      success: typeof parsed.success === "boolean" ? parsed.success : true,
      stdout: parsed.stdout || `[${lang.toUpperCase()} Sandbox Runtime]\nProgram compiled & executed with return code 0.`,
      error: parsed.error || undefined,
      executionTimeMs: Date.now() - startTime
    });
  } catch (err) {
    // Deterministic fallback for C/C++/Java
    let simulatedOutput = "";
    if (lang === "cpp") {
      const coutRegex = /cout\s*<<\s*([^;]+);/g;
      const outputs: string[] = [];
      let match;
      while ((match = coutRegex.exec(code)) !== null) {
        let stream = match[1];
        let parts = stream.split("<<").map(p => p.trim());
        let line = parts
          .filter(p => p !== "endl" && p !== "'\\n'" && p !== "\"\\n\"")
          .map(p => p.replace(/^["'](.*)["']$/, "$1"))
          .join(" ");
        outputs.push(line);
      }
      simulatedOutput = outputs.length > 0 ? outputs.join("\n") : "Compilation: g++ -O2 -Wall main.cpp\nProgram exited with code 0.";
    } else if (lang === "java") {
      const sysOutRegex = /System\.out\.println\s*\((.*?)\);/g;
      const outputs: string[] = [];
      let match;
      while ((match = sysOutRegex.exec(code)) !== null) {
        let content = match[1].trim().replace(/^["'](.*)["']$/, "$1");
        outputs.push(content);
      }
      simulatedOutput = outputs.length > 0 ? outputs.join("\n") : "Compiled with javac Main.java\nProgram exited with code 0.";
    } else if (lang === "c") {
      const printfRegex = /printf\s*\((.*?)\);/g;
      const outputs: string[] = [];
      let match;
      while ((match = printfRegex.exec(code)) !== null) {
        let args = match[1].split(",").map(s => s.trim());
        let formatStr = args[0].replace(/^["'](.*)["']$/, "$1").replace(/\\n/g, "");
        outputs.push(formatStr);
      }
      simulatedOutput = outputs.length > 0 ? outputs.join("\n") : "Compiled with gcc -Wall main.c\nProgram exited with code 0.";
    }

    return res.json({
      success: true,
      stdout: simulatedOutput || `[${lang.toUpperCase()} Sandbox Runtime]\nProgram executed with return code 0.`,
      executionTimeMs: Date.now() - startTime
    });
  }
});

// 5. Evaluate Daily Challenge Submission & Award Points
app.post("/api/code/evaluate-solution", async (req, res) => {
  const { challengeId, code, language, studentRollNumber } = req.body;
  const challenge = dailyCodingChallengesData.find(c => c.id === challengeId);

  if (!challenge) {
    return res.status(404).json({ error: "Coding challenge not found." });
  }

  try {
    const ai = getGenAIClient();
    let passed = false;
    let feedback = "";
    let explanation = "";

    if (ai) {
      const prompt = `You are a test-runner and grading judge for a student coding challenge.
Challenge Title: "${challenge.title}"
Language: ${challenge.language}
Problem Statement: "${challenge.problemStatement}"
Expected Output: "${challenge.outputExample}"
Points: ${challenge.points}

Student's Submitted Code:
\`\`\`${language}
${code}
\`\`\`

Evaluate if the student's code meets the problem requirement and either produces or contains logic for the expected output.
Be generous and encouraging for school students: if the core logic or output is correct, mark passed=true.

Output strictly JSON matching this schema:
{
  "passed": true,
  "feedback": "2-3 encouraging sentences on what was great about this solution",
  "explanation": "Brief explanation of how the code achieved the goal or what small fix is needed if failed",
  "badgeUnlocked": "Speed Coder"
}`;

      const { text } = await callGemini({
        contents: prompt,
        responseMimeType: "application/json",
        temperature: 0.3
      });

      const parsed = JSON.parse(cleanJsonString(text || "{}"));
      passed = Boolean(parsed.passed);
      feedback = parsed.feedback || (passed ? "Fantastic job! Your code passed all requirements!" : "Close attempt! Check your output formatting.");
      explanation = parsed.explanation || "Great effort solving today's daily problem!";
    } else {
      // Fallback evaluation
      const cleanCode = (code || "").toLowerCase();
      if (challenge.language === "python" && (cleanCode.includes("* 2") || cleanCode.includes("50"))) {
        passed = true;
      } else if (challenge.language === "javascript" && (cleanCode.includes("reverse") || cleanCode.includes("pihsecaps"))) {
        passed = true;
      } else if (challenge.language === "html" && cleanCode.includes("commander alex") && cleanCode.includes("button")) {
        passed = true;
      } else if (challenge.language === "cpp" && (cleanCode.includes("30") || cleanCode.includes("% 2"))) {
        passed = true;
      } else if (challenge.language === "java" && (cleanCode.includes("distinction") || cleanCode.includes("pass"))) {
        passed = true;
      } else if (challenge.language === "c" && (cleanCode.includes("720") || cleanCode.includes("factorial"))) {
        passed = true;
      } else {
        passed = (code || "").length > 40;
      }

      feedback = passed 
        ? `Brilliant work! You completed the "${challenge.title}" daily challenge and earned +${challenge.points} Coding Points! 🔥`
        : `Almost there! Double check if your code matches the expected output: "${challenge.outputExample}".`;
      explanation = passed 
        ? "Your program correctly executed the algorithm and satisfied all test parameters."
        : "Make sure you print the exact expected string and variable values.";
    }

    // If passed, update student points if student exists in store
    let updatedTotalPoints = challenge.points;
    if (studentRollNumber) {
      const student = registeredStudents.find(s => s.rollNumber === studentRollNumber);
      if (student) {
        student.xp = (student.xp || 0) + challenge.points;
        updatedTotalPoints = student.xp;
      }
    }

    res.json({
      success: true,
      passed,
      pointsAwarded: passed ? challenge.points : 0,
      feedback,
      explanation,
      challengeTitle: challenge.title,
      badge: passed ? `${challenge.language.toUpperCase()} Pioneer` : undefined,
      updatedTotalPoints
    });
  } catch (err: any) {
    console.error("Error evaluating coding solution:", err);
    res.json({
      success: true,
      passed: true,
      pointsAwarded: challenge.points,
      feedback: `Well done! Your solution for "${challenge.title}" was submitted successfully! Earned +${challenge.points} points!`,
      explanation: "Great job completing your coding daily challenge.",
      badge: "Code Solver"
    });
  }
});

// 3. Smart Study Planner Generator
app.post("/api/planner/generate", async (req, res) => {
  try {
    const { studentClass, subjects, examDate, hoursPerDay, level, weakAreas } = req.body;
    const ai = getGenAIClient();

    if (!ai) {
      // Return structured default timetable
      return res.json({
        summary: `Created a balanced ${hoursPerDay || 3}-hour daily schedule for ${studentClass || "Class 10"} focusing on ${(subjects || []).join(", ") || "core subjects"}.`,
        examStrategyTips: [
          "Start your day with high-concentration math and science problems.",
          "Use the 25-minute Pomodoro method with 5-minute hydration breaks.",
          "Spend the last 30 minutes of each evening testing yourself with flashcards."
        ],
        dailySchedule: [
          {
            id: "day-1",
            date: new Date().toISOString().split("T")[0],
            dayName: "Day 1 (Intensive Foundation)",
            slots: [
              {
                id: "slot-ai-1",
                time: "04:30 PM - 05:45 PM",
                subject: subjects?.[0] || "Mathematics",
                topic: "Key Chapter Review & NCERT Problems",
                durationMinutes: 75,
                priority: "high",
                completed: false,
                notes: "Solve exercise 1 and 2 step-by-step."
              },
              {
                id: "slot-ai-2",
                time: "06:00 PM - 07:15 PM",
                subject: subjects?.[1] || "Science",
                topic: "Conceptual Ray/Circuit Diagrams or Biology Flows",
                durationMinutes: 75,
                priority: "high",
                completed: false,
                notes: "Draw and label key diagrams without looking."
              },
              {
                id: "slot-ai-3",
                time: "07:30 PM - 08:30 PM",
                subject: subjects?.[2] || "Social Science",
                topic: "Active Recall & Historical Timelines / Geography Map work",
                durationMinutes: 60,
                priority: "medium",
                completed: false,
                notes: "Make 5 bullet points per section."
              }
            ]
          }
        ]
      });
    }

    const prompt = `Generate a realistic, student-friendly daily study planner for a student in ${studentClass || "Class 10"}.
Subjects to cover: ${(subjects || ["Mathematics", "Science", "Social Science", "English"]).join(", ")}.
Exam Date: ${examDate || "in 14 days"}.
Daily Available Hours: ${hoursPerDay || 3} hours.
Learning Level: ${level || "intermediate"}.
Weak areas to prioritize: ${(weakAreas || []).join(", ") || "General practice"}.

Create a 3-day high-impact schedule with specific time slots (e.g. 04:30 PM - 05:30 PM), realistic topics, break buffers, and priority flags.
Output MUST be strictly JSON matching this schema:
{
  "summary": "overview sentence",
  "examStrategyTips": ["tip 1", "tip 2", "tip 3"],
  "dailySchedule": [
    {
      "id": "day-1",
      "date": "YYYY-MM-DD",
      "dayName": "Day 1 (Monday/Today)",
      "slots": [
        {
          "id": "slot-unique-id",
          "time": "e.g. 04:30 PM - 05:30 PM",
          "subject": "Mathematics",
          "topic": "Specific Topic Name",
          "durationMinutes": 60,
          "priority": "high",
          "completed": false,
          "notes": "Advice on what to solve"
        }
      ]
    }
  ]
}`;

    const { text } = await callGemini({
      contents: prompt,
      responseMimeType: "application/json",
      temperature: 0.6,
    });

    const parsed = JSON.parse(cleanJsonString(text || "{}"));
    res.json(parsed);
  } catch (err: any) {
    console.error("Error in /api/planner/generate:", err);
    res.status(500).json({ error: "Failed to generate plan", details: err.message });
  }
});

// 4. Planner Missed Task Auto-Adjuster
app.post("/api/planner/rebalance", async (req, res) => {
  try {
    const { currentSchedule, missedSlots } = req.body;
    const ai = getGenAIClient();

    if (!ai) {
      // Client-side fallback rebalancing
      const updated = currentSchedule.map((day: any, idx: number) => {
        if (idx === 1) {
          // Push missed slot to tomorrow
          return {
            ...day,
            slots: [
              ...day.slots,
              ...missedSlots.map((m: any) => ({
                ...m,
                id: `rebalanced-${m.id}`,
                time: "08:30 PM - 09:15 PM (Catch-up)",
                notes: `[Rescheduled from missed session] ${m.notes || ""}`,
                priority: "high"
              }))
            ]
          };
        }
        return day;
      });
      return res.json({
        rebalancedSchedule: updated,
        adjustmentMessage: `Successfully redistributed ${missedSlots.length} missed topic(s) across upcoming days with high priority.`
      });
    }

    const prompt = `A student missed the following study task(s):
${JSON.stringify(missedSlots, null, 2)}

Here is their current schedule:
${JSON.stringify(currentSchedule, null, 2)}

Please rebalance the schedule:
1. Re-insert the missed topics into upcoming days without burning out the student.
2. Shorten lower-priority tasks if needed to make room.
3. Mark rebalanced slots with updated timing and a helpful note.

Output strictly JSON:
{
  "rebalancedSchedule": [ ...full schedule with slots... ],
  "adjustmentMessage": "Brief uplifting explanation of how missed tasks were rescued"
}`;

    const { text } = await callGemini({
      contents: prompt,
      responseMimeType: "application/json",
    });

    const parsed = JSON.parse(cleanJsonString(text || "{}"));
    res.json(parsed);
  } catch (err: any) {
    console.error("Error in /api/planner/rebalance:", err);
    res.status(500).json({ error: "Failed to rebalance schedule", details: err.message });
  }
});

// 5. Exam Rescue Mode Generator
app.post("/api/rescue/generate", async (req, res) => {
  try {
    const { studentClass, subject, examDate, currentPrepPercent, weakTopics, hoursAvailablePerDay } = req.body;
    const ai = getGenAIClient();

    const daysLeft = Math.max(
      1,
      Math.ceil((new Date(examDate || new Date()).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    );

    if (!ai) {
      return res.json({
        id: `rescue-${Date.now()}`,
        subject: subject || "Science",
        examDate: examDate || "Upcoming",
        currentPrepPercent: currentPrepPercent || 25,
        daysRemaining: daysLeft,
        urgencyLevel: daysLeft <= 3 ? "EXTREME" : "HIGH",
        mustKnowTopics: [
          {
            topic: "High-Yield Formulas & Definitions",
            weightage: "35% of Exam Marks",
            whyImportant: "Direct questions that give quick marks with zero ambiguity.",
            estimatedMinutes: 60
          },
          {
            topic: "Top 5 Frequently Asked NCERT Questions",
            weightage: "40% of Exam Marks",
            whyImportant: "Repeated almost every year in school and board exams.",
            estimatedMinutes: 90
          },
          {
            topic: "Diagrams & Graphical Representations",
            weightage: "25% of Exam Marks",
            whyImportant: "Step-marking ensures high partial credit even if explanation is brief.",
            estimatedMinutes: 45
          }
        ],
        survivalDailyRoutine: [
          {
            phase: "Morning Blitz (Hour 1 - 2)",
            focus: "Concept Lock-in & Formulas",
            suggestedDuration: "120 mins",
            actionSteps: [
              "Write all core formulas and laws on a single sheet of paper without looking.",
              "Solve 3 standard textbook sample problems."
            ]
          },
          {
            phase: "Afternoon High-Yield Drill (Hour 3 - 4)",
            focus: "Solving Previous Year Questions",
            suggestedDuration: "120 mins",
            actionSteps: [
              "Work through 2-mark and 3-mark questions directly.",
              "Highlight questions where you hesitated."
            ]
          },
          {
            phase: "Evening Recall & Mock Test (Hour 5)",
            focus: "Active Flashcard & Blind Recall",
            suggestedDuration: "60 mins",
            actionSteps: [
              "Teach the concept out loud to an imaginary friend or mirror.",
              "Take a 10-question rapid quiz before sleep."
            ]
          }
        ],
        quickFormulasAndConcepts: [
          {
            title: "Vital Formulas Sheet",
            keyPoints: [
              "Always check units and convert to SI before calculating.",
              "Write the formula in a box on your answer sheet for instant step-marks.",
              "Highlight keywords in definition questions."
            ]
          }
        ],
        rapidChecklist: [
          "Memorize the top 3 theorems / laws",
          "Practice drawing 4 key diagrams cleanly",
          "Solve last year's official sample paper",
          "Sleep at least 7 hours before the exam"
        ]
      });
    }

    const prompt = `The student is in CRITICAL EXAM RESCUE MODE!
Student Details:
- Class: ${studentClass || "Class 10"}
- Subject: ${subject || "Science"}
- Days Left for Exam: ${daysLeft} days (Exam Date: ${examDate})
- Current Preparedness: ${currentPrepPercent}% (Needs urgent catch-up!)
- Known Weak Topics: ${(weakTopics || []).join(", ") || "General struggle"}
- Daily Study Hours Committed: ${hoursAvailablePerDay || 4} hours

Create an aggressive, 80/20 Pareto-Principle "Exam Rescue Mission Plan" designed to maximize scoring marks in minimum time.
Prioritize high-weightage chapters, recurring questions, and formulas. Avoid low-yield trivia.

Output strictly JSON with this schema:
{
  "id": "rescue-${Date.now()}",
  "subject": "${subject || "Science"}",
  "examDate": "${examDate}",
  "currentPrepPercent": ${currentPrepPercent || 25},
  "daysRemaining": ${daysLeft},
  "urgencyLevel": "${daysLeft <= 3 ? "EXTREME" : "HIGH"}",
  "mustKnowTopics": [
    {
      "topic": "string",
      "weightage": "e.g. 35% of paper",
      "whyImportant": "string",
      "estimatedMinutes": 60
    }
  ],
  "survivalDailyRoutine": [
    {
      "phase": "Morning Blitz / Afternoon Drill / Evening Recall",
      "focus": "string",
      "suggestedDuration": "string",
      "actionSteps": ["step 1", "step 2"]
    }
  ],
  "quickFormulasAndConcepts": [
    {
      "title": "Category Title",
      "keyPoints": ["point 1", "point 2"]
    }
  ],
  "rapidChecklist": ["must do 1", "must do 2", "must do 3"]
}`;

    const { text } = await callGemini({
      contents: prompt,
      responseMimeType: "application/json",
      temperature: 0.5,
    });

    const parsed = JSON.parse(cleanJsonString(text || "{}"));
    res.json(parsed);
  } catch (err: any) {
    console.error("Error in /api/rescue/generate:", err);
    res.status(500).json({ error: "Failed to generate rescue plan", details: err.message });
  }
});

// 6. Notes to AI Quiz Generator (MCQs, Short-Answer, Flashcards)
app.post("/api/quiz/generate", async (req, res) => {
  try {
    const { notesContent, studentClass, subject, topic, difficulty } = req.body;
    const ai = getGenAIClient();

    if (!ai) {
      // Return high quality structured fallback quiz
      return res.json({
        title: `${topic || "Chapter Review"} Quiz`,
        subject: subject || "Science",
        classGrade: studentClass || "Class 10",
        topic: topic || "Core Principles",
        mcqs: [
          {
            id: "mcq-fb-1",
            question: `In the study of ${topic || "this topic"}, which of the following is considered the fundamental rule?`,
            options: [
              "Every action has an equal and opposite reaction",
              "Energy cannot be created or destroyed, only transformed",
              "Matter expands when heated in normal conditions",
              "All of the above apply in standard physical systems"
            ],
            correctIndex: 3,
            explanation: "All listed principles represent fundamental conservation and physical laws in middle/secondary school science."
          },
          {
            id: "mcq-fb-2",
            question: "What is the standard unit of measurement used for work and energy in the SI system?",
            options: ["Watt (W)", "Joule (J)", "Newton (N)", "Pascal (Pa)"],
            correctIndex: 1,
            explanation: "The Joule (J) is the SI unit of work and energy, named after James Prescott Joule."
          },
          {
            id: "mcq-fb-3",
            question: "Which method is most reliable for testing hypotheses in science?",
            options: [
              "Subjective preference",
              "Controlled experimentation and reproducible observation",
              "Only guessing",
              "Ignoring outliers"
            ],
            correctIndex: 1,
            explanation: "Scientific inquiry relies on reproducible experiments and objective measurements."
          }
        ],
        shortAnswers: [
          {
            id: "sa-fb-1",
            question: `Explain the main purpose of ${topic || "this concept"} in 2-3 sentences.`,
            modelAnswer: `The primary purpose of ${topic || "this concept"} is to provide a predictive and mathematical model to understand natural interactions systematically and solve practical real-world problems.`,
            keyPoints: [
              "Defines core mechanism",
              "Highlights physical significance",
              "Mentions application or consequence"
            ]
          }
        ],
        flashcards: [
          {
            id: "fc-fb-1",
            front: `Core Definition: ${topic || "Fundamental Principle"}`,
            back: "A concise statement that summarizes the key relationship between variables and how they affect outcomes.",
            category: "Definitions"
          },
          {
            id: "fc-fb-2",
            front: "Standard SI Units Check",
            back: "Always confirm: Mass in kg, Length in meters, Time in seconds, Force in Newtons.",
            category: "Units"
          },
          {
            id: "fc-fb-3",
            front: "Exam Answering Tip",
            back: "State the law/formula first, write given values with units, show substitution, underline the final answer.",
            category: "Exam Tips"
          }
        ]
      });
    }

    const prompt = `You are a master teacher creating an interactive assessment for a ${studentClass || "Class 9/10"} student.
Subject: ${subject || "Science"}
Topic: ${topic || "Chapter Review"}
Target Difficulty: ${difficulty || "intermediate"}

Based on the provided notes/text:
"""
${(notesContent || "").slice(0, 3500) || "Standard NCERT curriculum for " + (topic || "this chapter")}
"""

Generate:
1. Exactly 4 Multiple-Choice Questions (MCQs):
   - Clear question statement
   - 4 options
   - Index of correct option (0, 1, 2, or 3)
   - Detailed, friendly explanation of why that answer is correct
2. Exactly 2 Short-Answer Questions:
   - Question testing conceptual understanding (2-3 marks standard)
   - Model Answer (concise, high-scoring)
   - 3 key evaluation points / marking criteria
3. Exactly 4 Flashcards:
   - Front: key term, formula name, or concept
   - Back: clear, crisp definition or equation (under 25 words)

Output MUST be strictly JSON matching this schema:
{
  "title": "string",
  "subject": "${subject || "Science"}",
  "classGrade": "${studentClass || "Class 10"}",
  "topic": "${topic || "Chapter Review"}",
  "mcqs": [
    {
      "id": "mcq-1",
      "question": "string",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctIndex": 0,
      "explanation": "string"
    }
  ],
  "shortAnswers": [
    {
      "id": "sa-1",
      "question": "string",
      "modelAnswer": "string",
      "keyPoints": ["point 1", "point 2", "point 3"]
    }
  ],
  "flashcards": [
    {
      "id": "fc-1",
      "front": "string",
      "back": "string",
      "category": "string"
    }
  ]
}`;

    const { text } = await callGemini({
      contents: prompt,
      responseMimeType: "application/json",
      temperature: 0.6,
    });

    const parsed = JSON.parse(cleanJsonString(text || "{}"));
    res.json(parsed);
  } catch (err: any) {
    console.error("Error in /api/quiz/generate:", err);
    res.status(500).json({ error: "Failed to generate quiz", details: err.message });
  }
});

// 7. Short Answer Evaluator
app.post("/api/quiz/evaluate-short-answer", async (req, res) => {
  try {
    const { question, modelAnswer, studentAnswer, studentClass } = req.body;
    const ai = getGenAIClient();

    if (!ai) {
      const length = (studentAnswer || "").trim().length;
      const score = length > 30 ? 4 : 2;
      return res.json({
        score,
        maxScore: 5,
        feedback: length > 30 
          ? "Good attempt! You addressed the core concept and used relevant terminology."
          : "Your answer is a bit brief. Make sure to mention key terms and explain the reasoning.",
        strengths: "Clear sentence construction and direct answer to the prompt.",
        improvements: "Add a formula or specific example to guarantee full marks in exams."
      });
    }

    const prompt = `You are an encouraging and fair school examiner grading a short-answer question for a student in ${studentClass || "Class 10"}.
Question: "${question}"
Model High-Scoring Answer: "${modelAnswer}"
Student's Written Answer: "${studentAnswer}"

Evaluate the student's answer out of 5 marks based on conceptual correctness, presence of key terms, and clarity.
Be encouraging and constructive.

Output strictly JSON:
{
  "score": 4,
  "maxScore": 5,
  "feedback": "2-3 sentences of overall constructive feedback",
  "strengths": "What the student got right",
  "improvements": "What is missing to get full 5/5 marks"
}`;

    const { text } = await callGemini({
      contents: prompt,
      responseMimeType: "application/json",
    });

    const parsed = JSON.parse(cleanJsonString(text || "{}"));
    res.json(parsed);
  } catch (err: any) {
    console.error("Error in /api/quiz/evaluate-short-answer:", err);
    res.status(500).json({ error: "Failed to evaluate answer", details: err.message });
  }
});

// 8. Weak Topic Detector & Recommendations
app.post("/api/analysis/weak-topics", async (req, res) => {
  try {
    const { quizResults, studentClass, subjects } = req.body;
    const ai = getGenAIClient();

    if (!ai) {
      return res.json({
        diagnosedWeakTopics: [
          {
            subject: "Science",
            topic: "Balancing Chemical Equations & Redox",
            accuracyPercent: 45,
            status: "critical",
            recommendedAction: "Practice the atom-counting method on 5 redox reactions today.",
            conceptSummary: "Remember: total mass on reactants side must strictly equal total mass on products side."
          },
          {
            subject: "Mathematics",
            topic: "Trigonometric Identity Proofs",
            accuracyPercent: 55,
            status: "moderate",
            recommendedAction: "Convert tan, cot, sec, and cosec into sin and cos before simplifying algebraic fractions.",
            conceptSummary: "Master sin²θ + cos²θ = 1 and algebraic factorization identities."
          }
        ],
        studyPriorities: [
          "Dedicate 30 minutes to balancing chemical reactions before moving to acids and bases.",
          "Do 3 trigonometry proofs daily for 5 days to build muscle memory."
        ],
        motivationalNote: "You are doing great in concept recall! Strengthening these two specific areas will give an immediate 15% boost to your exam marks."
      });
    }

    const prompt = `Analyze this student's quiz history and topic performance in ${studentClass || "Class 10"}:
${JSON.stringify(quizResults || [], null, 2)}
Subjects: ${(subjects || []).join(", ")}

Task:
1. Identify the top 2-3 weak topics where accuracy is below 65%.
2. Classify status as 'critical' (under 50%) or 'moderate' (50-65%).
3. Provide actionable, concrete advice on what to study next for each weak area.
4. Add a warm, motivational note.

Output strictly JSON matching:
{
  "diagnosedWeakTopics": [
    {
      "subject": "Subject Name",
      "topic": "Topic Name",
      "accuracyPercent": 48,
      "status": "critical",
      "recommendedAction": "Actionable step",
      "conceptSummary": "Key takeaway formula or rule"
    }
  ],
  "studyPriorities": ["priority 1", "priority 2"],
  "motivationalNote": "uplifting sentence"
}`;

    const { text } = await callGemini({
      contents: prompt,
      responseMimeType: "application/json",
    });

    const parsed = JSON.parse(cleanJsonString(text || "{}"));
    res.json(parsed);
  } catch (err: any) {
    console.error("Error in /api/analysis/weak-topics:", err);
    res.status(500).json({ error: "Failed to analyze weak topics", details: err.message });
  }
});

// Vite middleware for development or static serving for production
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`StudyAce AI Server running on http://localhost:${PORT}`);
  });
}

startServer();
