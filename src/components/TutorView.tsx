import React, { useState, useEffect, useRef } from 'react';
import {
  Send,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Sparkles,
  HelpCircle,
  CheckCircle,
  XCircle,
  Lightbulb,
  BookOpen,
  ArrowRight,
  Bot,
  User,
  RotateCcw,
  PlaySquare,
  ExternalLink,
  Tv
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { SubjectName, LearningLevel, TutorMessage } from '../types';

export const TutorView: React.FC = () => {
  const { profile, tutorInitialTopic, setTutorInitialTopic, addXP, completeMission } = useApp();

  const [subject, setSubject] = useState<SubjectName>('Science');
  const [level, setLevel] = useState<LearningLevel>(profile.level || 'intermediate');
  const [inputQuestion, setInputQuestion] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [speechRate, setSpeechRate] = useState<number>(1.0);
  const [selectedQuizAnswer, setSelectedQuizAnswer] = useState<{ [msgId: string]: number }>({});
  const [speechSupported, setSpeechSupported] = useState<boolean>(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Initial tutor conversation
  const [messages, setMessages] = useState<TutorMessage[]>([
    {
      id: 'msg-welcome',
      sender: 'ai',
      text: `Hello ${profile.name}! I am your StudyAce AI Tutor for **${profile.classGrade}**. I explain every concept step-by-step with simple real-life analogies, solved examples, and quick concept checks. What would you like to understand today?`,
      timestamp: 'Just now',
      analogy: 'Learning difficult STEM concepts is like leveling up in a video game: you start with the tutorial mechanics, master the controls, and then defeat the exam boss!',
      stepByStep: [
        'Select your subject (Maths, Science, Social Science, etc.)',
        'Type your doubt or click the microphone to speak',
        'Review the intuitive analogy and take the quick check question'
      ]
    }
  ]);

  // Handle incoming topic navigation (e.g. from Weak Topic Detector)
  useEffect(() => {
    if (tutorInitialTopic) {
      setInputQuestion(`Please explain "${tutorInitialTopic}" step-by-step with simple real-world examples and formulas for ${profile.classGrade}.`);
      setTutorInitialTopic(null);
    }
  }, [tutorInitialTopic, profile.classGrade, setTutorInitialTopic]);

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      setSpeechSupported(true);
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-IN'; // Good for English with Indian or international accents

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputQuestion(prev => (prev ? `${prev} ${transcript}` : transcript));
        setIsListening(false);
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) return;
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.error('Error starting speech recognition:', err);
      }
    }
  };

  // Text-To-Speech
  const speakText = (text: string) => {
    if (!('speechSynthesis' in window)) return;
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    window.speechSynthesis.cancel();
    // Strip markdown formatting for cleaner speech
    const cleanText = text.replace(/[*_#`[\]()]/g, ' ');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = speechRate;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleAsk = async (questionText?: string) => {
    const q = (questionText || inputQuestion).trim();
    if (!q || isLoading) return;

    stopSpeaking();

    const userMsg: TutorMessage = {
      id: `user-${Date.now()}`,
      sender: 'student',
      text: q,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputQuestion('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/tutor/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: q,
          subject,
          studentClass: profile.classGrade,
          level,
          chatHistory: messages.slice(-4).map(m => ({ sender: m.sender, text: m.text }))
        })
      });

      const contentType = res.headers.get('content-type') || '';
      let data: any = {};

      if (contentType.includes('application/json')) {
        data = await res.json();
      } else {
        const rawText = await res.text();
        throw new Error(`Server returned non-JSON response (HTTP ${res.status}): ${rawText.slice(0, 100)}`);
      }

      if (!res.ok && !data.explanation) {
        throw new Error(`HTTP ${res.status}: ${data.error || res.statusText || 'Request failed'}`);
      }

      const aiMsg: TutorMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: data.explanation || (data.error ? `Error: ${data.error}` : 'Here is the explanation for your doubt.'),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        problemSolution: data.problemSolution,
        analogy: data.analogy,
        stepByStep: data.stepByStep,
        solvedExample: data.solvedExample,
        quickCheck: data.quickCheck,
        youtubeVideos: data.youtubeVideos,
        isGeminiPowered: data.isGeminiPowered,
        modelUsed: data.modelUsed
      };

      setMessages(prev => [...prev, aiMsg]);
      addXP(15, 'Asked a doubt to AI Tutor');
      completeMission('mission-doubt');

      // Auto-read if voice user
      if (isListening && data.explanation) {
        speakText(data.explanation);
      }
    } catch (err: any) {
      console.error('Failed to get answer from AI Tutor:', err);
      const errorMsg: TutorMessage = {
        id: `ai-err-${Date.now()}`,
        sender: 'ai',
        text: `⚠️ AI Tutor Diagnostic Error: ${err?.message || 'Connection or upstream failure.'}\n\nPlease verify that the server is running and GEMINI_API_KEY is configured in your environment.`,
        timestamp: 'Just now'
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  // Sample prompt chips for classes 6th to 10th
  const samplePrompts = [
    { label: 'Quadratic Equation Factorization', prompt: 'Solve x² - 5x + 6 = 0 using step-by-step factorization with formula and roots.' },
    { label: 'Refractive Index Numerical', prompt: 'Speed of light in glass is 2×10⁸ m/s and in vacuum is 3×10⁸ m/s. Calculate refractive index of glass.' },
    { label: 'Balance Chemical Equation', prompt: 'Balance this chemical equation with step-by-step atom counting: Fe + H2O -> Fe3O4 + H2' },
    { label: 'Ohm’s Law & Resistance', prompt: 'Explain V=IR and calculate current if 12V battery is connected across 4 ohm resistor.' },
    { label: "Snell's Law Analogy", prompt: "Explain Snell's law of refraction using an everyday analogy." },
    { label: 'Cell Mitochondria', prompt: 'Why is mitochondria called the powerhouse of the cell?' }
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-4">
      {/* Top Tutor Controls Bar */}
      <div className="bg-white dark:bg-stone-900 rounded-2xl p-4 border border-stone-200 dark:border-stone-800 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-600 dark:text-amber-400">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-stone-900 dark:text-stone-100 font-['Outfit']">
              AI Personal Tutor & Voice Learning
            </h2>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              Personalized for {profile.classGrade} ({profile.board}) • Step-by-step answers with analogies
            </p>
          </div>
        </div>

        {/* Subject & Level Filters */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Subject Selector */}
          <select
            value={subject}
            onChange={(e) => setSubject(e.target.value as SubjectName)}
            className="text-xs font-semibold bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 text-stone-800 dark:text-stone-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-amber-500"
          >
            <option value="Mathematics">Mathematics</option>
            <option value="Science">Science (General)</option>
            <option value="Physics">Physics</option>
            <option value="Chemistry">Chemistry</option>
            <option value="Biology">Biology</option>
            <option value="Social Science">Social Science</option>
            <option value="English">English Grammar & Lit</option>
          </select>

          {/* Difficulty Tier Adapter */}
          <div className="flex items-center bg-stone-100 dark:bg-stone-800 p-0.5 rounded-lg border border-stone-200 dark:border-stone-700 text-xs">
            {(['beginner', 'intermediate', 'advanced'] as LearningLevel[]).map((lvl) => (
              <button
                key={lvl}
                onClick={() => setLevel(lvl)}
                className={`capitalize px-2.5 py-1 rounded-md transition font-medium ${
                  level === lvl
                    ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 shadow-xs font-bold'
                    : 'text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200'
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>

          {/* TTS Speed Toggle */}
          {isSpeaking && (
            <button
              onClick={stopSpeaking}
              className="flex items-center gap-1 bg-rose-100 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 hover:bg-rose-200 dark:hover:bg-rose-900/50 px-2 py-1 rounded-lg text-xs font-semibold transition"
            >
              <VolumeX className="w-3.5 h-3.5" />
              <span>Stop Audio</span>
            </button>
          )}
        </div>
      </div>

      {/* Suggested Prompt Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <span className="text-xs font-bold text-stone-400 dark:text-stone-500 shrink-0 flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          Quick Ideas:
        </span>
        {samplePrompts.map((item, idx) => (
          <button
            key={idx}
            onClick={() => handleAsk(item.prompt)}
            className="text-xs bg-white dark:bg-stone-900 hover:bg-amber-50 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300 hover:text-amber-900 dark:hover:text-amber-300 border border-stone-200 dark:border-stone-800 hover:border-amber-300 dark:hover:border-amber-600 rounded-full px-3 py-1 shrink-0 transition"
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Chat Messages Feed */}
      <div className="bg-stone-50/60 dark:bg-stone-900/40 rounded-2xl border border-stone-200 dark:border-stone-800 p-4 sm:p-6 min-h-[440px] max-h-[600px] overflow-y-auto space-y-6">
        {messages.map((msg) => {
          const isUser = msg.sender === 'student';
          return (
            <div
              key={msg.id}
              className={`flex gap-3 max-w-3xl ${isUser ? 'ml-auto flex-row-reverse' : ''}`}
            >
              {/* Avatar */}
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-sm font-bold shadow-xs ${
                  isUser
                    ? 'bg-stone-800 text-white'
                    : 'bg-amber-500 text-stone-950 font-bold'
                }`}
              >
                {isUser ? profile.avatar || <User className="w-4 h-4" /> : <Bot className="w-4.5 h-4.5" />}
              </div>

              {/* Message Content Bubble */}
              <div className="space-y-3 w-full">
                <div
                  className={`p-4 rounded-2xl text-sm leading-relaxed ${
                    isUser
                      ? 'bg-stone-900 text-white rounded-tr-xs'
                      : 'bg-white text-stone-900 border border-stone-200 shadow-xs rounded-tl-xs'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-[11px] font-bold uppercase tracking-wider opacity-60">
                      {isUser ? profile.name : `StudyAce AI Tutor (${level})`}
                    </span>
                    <div className="flex items-center gap-2">
                      {!isUser && msg.isGeminiPowered && (
                        <span className="text-[10px] font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 px-2 py-0.5 rounded-full flex items-center gap-1 border border-amber-300 dark:border-amber-800">
                          <Sparkles className="w-2.5 h-2.5 text-amber-600 dark:text-amber-400" />
                          Gemini AI
                        </span>
                      )}
                      <span className="text-[10px] opacity-50">{msg.timestamp}</span>
                      {!isUser && (
                        <button
                          onClick={() => speakText(msg.text)}
                          title="Read explanation out loud (Voice Learning)"
                          className="p-1 hover:bg-stone-100 dark:hover:bg-stone-800 rounded text-stone-500 hover:text-amber-600 transition"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="whitespace-pre-line font-normal text-stone-800 dark:text-stone-200">
                    {msg.text}
                  </div>
                </div>

                {/* Systematic Problem Solution & Mathematical Working */}
                {!isUser && msg.problemSolution && (
                  <div className="bg-emerald-50/70 dark:bg-emerald-950/25 border border-emerald-300 dark:border-emerald-800 rounded-xl p-4 text-xs text-stone-800 dark:text-stone-200 shadow-xs space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-emerald-200 dark:border-emerald-800/80">
                      <span className="font-bold text-emerald-900 dark:text-emerald-300 flex items-center gap-1.5 text-xs sm:text-sm">
                        <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        Step-by-Step Problem Solution & Working:
                      </span>
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200 px-2 py-0.5 rounded-full">
                        Curriculum Verified
                      </span>
                    </div>

                    {/* Given & Formula */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      {msg.problemSolution.given && (
                        <div className="bg-white dark:bg-stone-900 p-2.5 rounded-lg border border-emerald-200 dark:border-emerald-900">
                          <span className="font-bold text-stone-500 dark:text-stone-400 block mb-0.5">Given Data / Parameters:</span>
                          <span className="font-mono text-stone-900 dark:text-stone-100">{msg.problemSolution.given}</span>
                        </div>
                      )}
                      {msg.problemSolution.formula && (
                        <div className="bg-white dark:bg-stone-900 p-2.5 rounded-lg border border-emerald-200 dark:border-emerald-900">
                          <span className="font-bold text-stone-500 dark:text-stone-400 block mb-0.5">Formula / Theorem Used:</span>
                          <span className="font-mono text-stone-900 dark:text-stone-100">{msg.problemSolution.formula}</span>
                        </div>
                      )}
                    </div>

                    {/* Calculation Steps */}
                    {msg.problemSolution.steps && msg.problemSolution.steps.length > 0 && (
                      <div className="space-y-1.5 pt-1">
                        <span className="font-bold text-emerald-950 dark:text-emerald-200 block">Calculation & Derivation Steps:</span>
                        <ol className="space-y-1 pl-2 list-decimal list-inside text-stone-700 dark:text-stone-300">
                          {msg.problemSolution.steps.map((step, stIdx) => (
                            <li key={stIdx} className="leading-relaxed">
                              <span className="font-mono text-xs">{step}</span>
                            </li>
                          ))}
                        </ol>
                      </div>
                    )}

                    {/* Final Answer Box */}
                    {msg.problemSolution.finalAnswer && (
                      <div className="bg-emerald-100/90 dark:bg-emerald-900/50 border-2 border-emerald-400 dark:border-emerald-600 rounded-xl p-3 text-emerald-950 dark:text-emerald-100">
                        <span className="text-[10px] uppercase tracking-wider font-extrabold text-emerald-700 dark:text-emerald-300 block mb-0.5">
                          Final Answer:
                        </span>
                        <div className="font-bold text-sm sm:text-base font-mono">
                          {msg.problemSolution.finalAnswer}
                        </div>
                      </div>
                    )}

                    {/* Verification Tip */}
                    {msg.problemSolution.verificationTip && (
                      <div className="text-[11px] text-emerald-800 dark:text-emerald-300 bg-white/80 dark:bg-stone-900/80 p-2 rounded-lg border border-emerald-200 dark:border-emerald-900 flex items-center gap-1.5">
                        <Lightbulb className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span><strong>Exam Verification Tip:</strong> {msg.problemSolution.verificationTip}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Additional Tutor Cards: Analogy, Step-by-Step, Solved Example, Mini Quiz */}
                {!isUser && msg.analogy && (
                  <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-3.5 text-xs text-amber-950 flex items-start gap-2.5">
                    <div className="p-1 bg-amber-200 text-amber-900 rounded-md shrink-0 mt-0.5">
                      <Lightbulb className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <span className="font-bold text-amber-900 block mb-0.5">
                        🌟 Real-World Intuition / Analogy:
                      </span>
                      <p className="text-amber-900/90 leading-normal">{msg.analogy}</p>
                    </div>
                  </div>
                )}

                {!isUser && msg.stepByStep && msg.stepByStep.length > 0 && (
                  <div className="bg-white border border-stone-200 rounded-xl p-3.5 text-xs text-stone-800 shadow-xs">
                    <span className="font-bold text-stone-900 block mb-2 flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5 text-amber-600" />
                      Step-by-Step Breakdown:
                    </span>
                    <ol className="space-y-1.5 pl-2 list-decimal list-inside text-stone-700">
                      {msg.stepByStep.map((step, sIdx) => (
                        <li key={sIdx} className="leading-normal">
                          <span className="font-medium text-stone-800">{step}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                )}

                {!isUser && msg.solvedExample && (
                  <div className="bg-stone-100/80 border border-stone-200 rounded-xl p-3.5 text-xs font-mono text-stone-800">
                    <span className="font-bold text-stone-900 font-sans block mb-1">
                      💡 Solved Practice Example:
                    </span>
                    <pre className="whitespace-pre-wrap font-sans text-stone-700">{msg.solvedExample}</pre>
                  </div>
                )}

                {/* Interactive Mini Concept Check */}
                {!isUser && msg.quickCheck && (
                  <div className="bg-indigo-50/60 border border-indigo-200/80 rounded-xl p-4 text-xs text-indigo-950 space-y-2.5 shadow-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-indigo-900 flex items-center gap-1.5">
                        <HelpCircle className="w-4 h-4 text-indigo-600" />
                        Quick Concept Check (Test your understanding):
                      </span>
                      <span className="text-[10px] bg-indigo-100 text-indigo-800 font-bold px-2 py-0.5 rounded-full">
                        +10 XP
                      </span>
                    </div>

                    <p className="font-semibold text-stone-800 text-xs sm:text-sm">
                      {msg.quickCheck.question}
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                      {msg.quickCheck.options.map((option, optIdx) => {
                        const isChosen = selectedQuizAnswer[msg.id] === optIdx;
                        const hasAnswered = selectedQuizAnswer[msg.id] !== undefined;
                        const isCorrect = optIdx === msg.quickCheck?.correctIndex;

                        let btnClasses = 'border-stone-200 bg-white hover:border-indigo-400 text-stone-800';
                        if (hasAnswered) {
                          if (isCorrect) {
                            btnClasses = 'bg-emerald-100 border-emerald-400 text-emerald-950 font-bold';
                          } else if (isChosen) {
                            btnClasses = 'bg-rose-100 border-rose-300 text-rose-950 line-through';
                          } else {
                            btnClasses = 'opacity-50 border-stone-200 bg-stone-50 text-stone-500';
                          }
                        }

                        return (
                          <button
                            key={optIdx}
                            disabled={hasAnswered}
                            onClick={() => {
                              setSelectedQuizAnswer(prev => ({ ...prev, [msg.id]: optIdx }));
                              if (isCorrect) {
                                addXP(10, 'Correct concept check in tutor');
                              }
                            }}
                            className={`p-2.5 rounded-lg border text-left text-xs transition flex items-center justify-between ${btnClasses}`}
                          >
                            <span>{option}</span>
                            {hasAnswered && isCorrect && (
                              <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            )}
                            {hasAnswered && isChosen && !isCorrect && (
                              <XCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {selectedQuizAnswer[msg.id] !== undefined && (
                      <p className="text-[11px] text-indigo-900 bg-indigo-100/70 p-2 rounded-md mt-2">
                        <span className="font-bold">Explanation: </span>
                        {msg.quickCheck.explanation}
                      </p>
                    )}
                  </div>
                )}

                {/* Recommended Educational YouTube Videos */}
                {!isUser && msg.youtubeVideos && msg.youtubeVideos.length > 0 && (
                  <div className="bg-red-50/50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 rounded-xl p-3.5 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-red-700 dark:text-red-400 flex items-center gap-1.5">
                        <PlaySquare className="w-4 h-4 text-red-600" />
                        Recommended Video Lessons for this Topic:
                      </span>
                      <span className="text-[10px] uppercase font-bold text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/40 px-2 py-0.5 rounded-full">
                        YouTube
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {msg.youtubeVideos.map((video, vIdx) => (
                        <a
                          key={vIdx}
                          href={video.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2.5 rounded-lg bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 hover:border-red-400 hover:shadow-xs transition group flex items-start gap-2.5 text-left"
                        >
                          <div className="w-7 h-7 rounded-md bg-red-600 text-white flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-105 transition-transform">
                            <Tv className="w-3.5 h-3.5" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-bold text-stone-900 dark:text-stone-100 line-clamp-1 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
                              {video.title}
                            </p>
                            <p className="text-[10px] text-stone-500 dark:text-stone-400 flex items-center gap-1 mt-0.5">
                              <span>{video.channelTitle || 'Educational Video'}</span>
                              <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                            </p>
                          </div>
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex gap-3 max-w-xl">
            <div className="w-8 h-8 rounded-xl bg-amber-500 text-stone-950 flex items-center justify-center font-bold text-sm shrink-0 animate-pulse">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-4 shadow-xs flex items-center gap-2 text-stone-600 dark:text-stone-300 text-xs">
              <Sparkles className="w-4 h-4 text-amber-500 animate-spin" />
              <span>StudyAce AI is preparing a step-by-step explanation with analogies...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Box & Voice Controls */}
      <div className="bg-white dark:bg-stone-900 rounded-2xl p-3 border border-stone-300 dark:border-stone-700 shadow-sm space-y-2">
        {/* Voice Listening Banner */}
        {isListening && (
          <div className="flex items-center justify-between px-3 py-1.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 rounded-xl text-xs text-rose-700 dark:text-rose-300">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
              </span>
              <span className="font-semibold">Listening to your doubt... Speak clearly into your mic</span>
            </div>
            <button
              onClick={toggleListening}
              className="text-rose-600 dark:text-rose-400 font-bold hover:underline"
            >
              Cancel
            </button>
          </div>
        )}

        <div className="flex items-center gap-2">
          {/* Voice input button */}
          <button
            type="button"
            onClick={toggleListening}
            title={isListening ? 'Stop listening' : 'Ask doubt using Voice (Speech Recognition)'}
            className={`p-3 rounded-xl transition ${
              isListening
                ? 'bg-rose-600 text-white animate-pulse'
                : 'bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300'
            }`}
          >
            {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          <input
            type="text"
            value={inputQuestion}
            onChange={(e) => setInputQuestion(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleAsk();
            }}
            placeholder={`Ask any doubt in ${subject} for ${profile.classGrade}... (e.g., "Solve x² - 5x + 6 = 0")`}
            className="flex-1 bg-transparent border-none text-stone-900 dark:text-stone-100 placeholder:text-stone-400 dark:placeholder:text-stone-500 text-sm focus:outline-none px-2"
          />

          <button
            disabled={!inputQuestion.trim() || isLoading}
            onClick={() => handleAsk()}
            className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-40 disabled:hover:bg-amber-500 text-stone-950 font-bold px-4 py-2.5 rounded-xl text-sm transition shadow-xs"
          >
            <span>Ask</span>
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
