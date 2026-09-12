import React, { useState } from 'react';
import {
  FileQuestion,
  Sparkles,
  Upload,
  BookOpen,
  CheckCircle2,
  XCircle,
  RotateCw,
  HelpCircle,
  FileText,
  Layers,
  Award,
  ChevronLeft,
  ChevronRight,
  Send,
  Check
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useApp } from '../context/AppContext';
import { QuizDeck, MCQQuestion, ShortAnswerQuestion, Flashcard, SubjectName, ClassGrade } from '../types';
import { PRELOADED_SAMPLE_CHAPTERS } from '../data/defaultData';

export const QuizView: React.FC = () => {
  const {
    profile,
    quizDecks,
    activeQuizDeck,
    setActiveQuizDeck,
    addQuizDeck,
    recordQuizResult,
    addXP
  } = useApp();

  const [activeTabMode, setActiveTabMode] = useState<'create' | 'mcq' | 'shortAnswer' | 'flashcards'>('mcq');

  // Creation form state
  const [topic, setTopic] = useState<string>('Light: Reflection & Refraction');
  const [subject, setSubject] = useState<SubjectName>('Science');
  const [notesContent, setNotesContent] = useState<string>(PRELOADED_SAMPLE_CHAPTERS[0].notes);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  // MCQ Runner state
  const [currentMCQIndex, setCurrentMCQIndex] = useState<number>(0);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [qId: string]: number }>({});
  const [quizSubmitted, setQuizSubmitted] = useState<boolean>(false);

  // Short Answer Evaluator state
  const [studentAnswers, setStudentAnswers] = useState<{ [qId: string]: string }>({});
  const [evaluatingMap, setEvaluatingMap] = useState<{ [qId: string]: boolean }>({});
  const [evaluationResults, setEvaluationResults] = useState<{
    [qId: string]: { score: number; maxScore: number; feedback: string; strengths: string; improvements: string };
  }>({});

  // Flashcards state
  const [flashcardIndex, setFlashcardIndex] = useState<number>(0);
  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  const [masteredCards, setMasteredCards] = useState<{ [fcId: string]: boolean }>({});

  const deck = activeQuizDeck || quizDecks[0];

  // Handle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const content = evt.target?.result as string;
      if (content) {
        setNotesContent(content);
        setTopic(file.name.replace(/\.[^/.]+$/, ''));
      }
    };
    reader.readAsText(file);
  };

  // Generate Quiz from Notes
  const handleGenerateQuiz = async () => {
    if (!notesContent.trim() && !topic.trim()) {
      alert('Please enter notes or a topic.');
      return;
    }

    setIsGenerating(true);

    try {
      const res = await fetch('/api/quiz/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          notesContent,
          studentClass: profile.classGrade,
          subject,
          topic,
          difficulty: profile.level
        })
      });

      const data = await res.json();

      const newDeck: QuizDeck = {
        id: `deck-${Date.now()}`,
        title: data.title || `${topic} Assessment`,
        subject: data.subject || subject,
        classGrade: data.classGrade || profile.classGrade,
        topic: data.topic || topic,
        sourceNotesSnippet: notesContent.slice(0, 150),
        mcqs: data.mcqs || [],
        shortAnswers: data.shortAnswers || [],
        flashcards: data.flashcards || [],
        createdAt: new Date().toISOString()
      };

      addQuizDeck(newDeck);
      setSelectedAnswers({});
      setQuizSubmitted(false);
      setCurrentMCQIndex(0);
      setFlashcardIndex(0);
      setActiveTabMode('mcq');
    } catch (err) {
      console.error('Error generating quiz:', err);
      alert('Failed to generate quiz. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Submit MCQ Quiz
  const handleSubmitQuiz = () => {
    if (!deck) return;
    setQuizSubmitted(true);

    let correct = 0;
    const incorrects: string[] = [];

    deck.mcqs.forEach((mcq) => {
      if (selectedAnswers[mcq.id] === mcq.correctIndex) {
        correct++;
      } else {
        incorrects.push(mcq.question.slice(0, 40));
      }
    });

    const scorePercent = Math.round((correct / deck.mcqs.length) * 100);

    recordQuizResult({
      id: `attempt-${Date.now()}`,
      quizId: deck.id,
      quizTitle: deck.title,
      subject: deck.subject,
      topic: deck.topic,
      scorePercent,
      totalQuestions: deck.mcqs.length,
      correctAnswers: correct,
      date: new Date().toISOString().split('T')[0],
      incorrectTopics: incorrects
    });

    if (scorePercent >= 75) {
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
    }
  };

  // Evaluate Short Answer
  const handleEvaluateShortAnswer = async (sa: ShortAnswerQuestion) => {
    const studentAns = studentAnswers[sa.id];
    if (!studentAns || !studentAns.trim()) {
      alert('Please type your answer before submitting for evaluation.');
      return;
    }

    setEvaluatingMap(prev => ({ ...prev, [sa.id]: true }));

    try {
      const res = await fetch('/api/quiz/evaluate-short-answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: sa.question,
          modelAnswer: sa.modelAnswer,
          studentAnswer: studentAns,
          studentClass: profile.classGrade
        })
      });

      const data = await res.json();
      setEvaluationResults(prev => ({ ...prev, [sa.id]: data }));
      addXP(15, 'Evaluated Short Answer');
    } catch (err) {
      console.error('Error evaluating short answer:', err);
    } finally {
      setEvaluatingMap(prev => ({ ...prev, [sa.id]: false }));
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Top Header & Deck Picker */}
      <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-amber-100 text-amber-800 rounded-xl">
              <FileQuestion className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold text-stone-900 font-['Outfit']">
              Notes → AI Quiz & Flashcards
            </h1>
          </div>
          <p className="text-xs text-stone-500 mt-1">
            Generate multiple choice questions, short answers, and interactive flip flashcards from any chapter.
          </p>
        </div>

        {/* Action Tabs */}
        <div className="flex items-center bg-stone-100 p-1 rounded-xl border border-stone-200 text-xs">
          <button
            onClick={() => setActiveTabMode('create')}
            className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 ${
              activeTabMode === 'create' ? 'bg-amber-500 text-stone-950 shadow-xs' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Generate New</span>
          </button>
          <button
            onClick={() => setActiveTabMode('mcq')}
            className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 ${
              activeTabMode === 'mcq' ? 'bg-amber-500 text-stone-950 shadow-xs' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <span>MCQs ({deck?.mcqs?.length || 0})</span>
          </button>
          <button
            onClick={() => setActiveTabMode('shortAnswer')}
            className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 ${
              activeTabMode === 'shortAnswer' ? 'bg-amber-500 text-stone-950 shadow-xs' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <span>Short Answers ({deck?.shortAnswers?.length || 0})</span>
          </button>
          <button
            onClick={() => setActiveTabMode('flashcards')}
            className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 ${
              activeTabMode === 'flashcards' ? 'bg-amber-500 text-stone-950 shadow-xs' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <span>Flashcards ({deck?.flashcards?.length || 0})</span>
          </button>
        </div>
      </div>

      {/* MODE 1: CREATE / GENERATE FROM NOTES */}
      {activeTabMode === 'create' && (
        <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-xs space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-stone-900 font-['Outfit']">
              Create Quiz from Chapter Notes
            </h2>
            {/* Quick preloaded chapter loader */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-stone-400">Load NCERT Sample:</span>
              <select
                onChange={(e) => {
                  const selected = PRELOADED_SAMPLE_CHAPTERS.find(c => c.title === e.target.value);
                  if (selected) {
                    setTopic(selected.title);
                    setSubject(selected.subject);
                    setNotesContent(selected.notes);
                  }
                }}
                className="text-xs bg-stone-50 border border-stone-300 rounded-lg p-1.5 text-stone-700"
              >
                {PRELOADED_SAMPLE_CHAPTERS.map((ch, idx) => (
                  <option key={idx} value={ch.title}>
                    {ch.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-stone-700 mb-1">
                Chapter / Topic Title
              </label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g., Photosynthesis & Respiration"
                className="w-full text-xs font-semibold bg-stone-50 border border-stone-300 rounded-lg p-2.5 text-stone-800 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-stone-700 mb-1">
                Subject
              </label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value as SubjectName)}
                className="w-full text-xs font-semibold bg-stone-50 border border-stone-300 rounded-lg p-2.5 text-stone-800 focus:outline-none focus:border-amber-500"
              >
                <option value="Science">Science</option>
                <option value="Physics">Physics</option>
                <option value="Chemistry">Chemistry</option>
                <option value="Biology">Biology</option>
                <option value="Mathematics">Mathematics</option>
                <option value="Social Science">Social Science</option>
                <option value="English">English</option>
              </select>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold uppercase text-stone-700">
                Paste Chapter Notes or Upload Text File
              </label>
              <label className="cursor-pointer text-xs font-semibold text-amber-700 hover:text-amber-800 flex items-center gap-1">
                <Upload className="w-3.5 h-3.5" />
                <span>Upload .txt / .md</span>
                <input
                  type="file"
                  accept=".txt,.md"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            <textarea
              rows={8}
              value={notesContent}
              onChange={(e) => setNotesContent(e.target.value)}
              placeholder="Paste text from your NCERT book or class notebook here..."
              className="w-full text-xs font-mono bg-stone-50 border border-stone-300 rounded-xl p-3 text-stone-800 focus:outline-none focus:border-amber-500 leading-relaxed"
            />
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleGenerateQuiz}
              disabled={isGenerating}
              className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold px-6 py-2.5 rounded-xl text-xs transition shadow-sm"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isGenerating ? 'Analyzing Notes & Generating...' : 'Generate Quiz Deck'}</span>
            </button>
          </div>
        </div>
      )}

      {/* MODE 2: MCQ QUIZ RUNNER */}
      {activeTabMode === 'mcq' && deck && (
        <div className="space-y-6">
          {/* Deck info card */}
          <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-xs flex items-center justify-between flex-wrap gap-2">
            <div>
              <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                {deck.subject} • {deck.classGrade}
              </span>
              <h2 className="text-base font-bold text-stone-900 mt-1 font-['Outfit']">
                {deck.title}
              </h2>
            </div>

            <div className="flex items-center gap-2">
              {quizSubmitted ? (
                <button
                  onClick={() => {
                    setQuizSubmitted(false);
                    setSelectedAnswers({});
                  }}
                  className="text-xs font-semibold bg-stone-100 hover:bg-stone-200 text-stone-800 px-3 py-1.5 rounded-lg transition flex items-center gap-1"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                  <span>Retake Quiz</span>
                </button>
              ) : (
                <button
                  onClick={handleSubmitQuiz}
                  disabled={Object.keys(selectedAnswers).length === 0}
                  className="text-xs font-bold bg-amber-500 hover:bg-amber-400 text-stone-950 px-4 py-2 rounded-xl transition shadow-xs"
                >
                  Submit Answers
                </button>
              )}
            </div>
          </div>

          {/* MCQ Question List */}
          <div className="space-y-4">
            {deck.mcqs.map((mcq, idx) => {
              const isChosen = selectedAnswers[mcq.id];
              return (
                <div
                  key={mcq.id}
                  className="bg-white rounded-2xl p-5 border border-stone-200 shadow-xs space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <span className="text-xs font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full shrink-0">
                      Q{idx + 1}
                    </span>
                    <p className="font-semibold text-stone-900 text-sm flex-1 leading-snug">
                      {mcq.question}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                    {mcq.options.map((option, optIdx) => {
                      const isOptionSelected = isChosen === optIdx;
                      let btnClasses = 'border-stone-200 bg-stone-50 hover:border-amber-400 text-stone-800';

                      if (quizSubmitted) {
                        if (optIdx === mcq.correctIndex) {
                          btnClasses = 'bg-emerald-100 border-emerald-500 text-emerald-950 font-bold';
                        } else if (isOptionSelected) {
                          btnClasses = 'bg-rose-100 border-rose-400 text-rose-950 line-through';
                        } else {
                          btnClasses = 'opacity-40 border-stone-200 bg-stone-50 text-stone-500';
                        }
                      } else if (isOptionSelected) {
                        btnClasses = 'bg-amber-100 border-amber-500 text-amber-950 font-bold';
                      }

                      return (
                        <button
                          key={optIdx}
                          disabled={quizSubmitted}
                          onClick={() => setSelectedAnswers(prev => ({ ...prev, [mcq.id]: optIdx }))}
                          className={`p-3 rounded-xl border text-left text-xs transition flex items-center justify-between ${btnClasses}`}
                        >
                          <span>{option}</span>
                          {quizSubmitted && optIdx === mcq.correctIndex && (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          )}
                          {quizSubmitted && isOptionSelected && optIdx !== mcq.correctIndex && (
                            <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {quizSubmitted && (
                    <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-3 text-xs text-amber-950 mt-2">
                      <span className="font-bold text-amber-900 block mb-0.5">Explanation:</span>
                      <p>{mcq.explanation}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* MODE 3: SHORT ANSWER QUESTIONS & AI AUTO-EVALUATION */}
      {activeTabMode === 'shortAnswer' && deck && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-xs">
            <h2 className="text-base font-bold text-stone-900 font-['Outfit']">
              Short Answer Questions with AI Examiner Scoring
            </h2>
            <p className="text-xs text-stone-500 mt-1">
              Type your answer to test exam answer-writing skills. StudyAce AI examiner will score your answer out of 5 and provide constructive feedback!
            </p>
          </div>

          <div className="space-y-4">
            {deck.shortAnswers.map((sa, idx) => {
              const evalResult = evaluationResults[sa.id];
              const isEvaluating = evaluatingMap[sa.id];

              return (
                <div
                  key={sa.id}
                  className="bg-white rounded-2xl p-5 border border-stone-200 shadow-xs space-y-4"
                >
                  <div className="flex items-start gap-2.5">
                    <span className="text-xs font-bold text-indigo-700 bg-indigo-100 px-2.5 py-0.5 rounded-full shrink-0">
                      Question {idx + 1} (3-5 Marks)
                    </span>
                    <h3 className="font-bold text-stone-900 text-sm">
                      {sa.question}
                    </h3>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-600 mb-1">
                      Your Written Answer:
                    </label>
                    <textarea
                      rows={3}
                      value={studentAnswers[sa.id] || ''}
                      onChange={(e) => setStudentAnswers(prev => ({ ...prev, [sa.id]: e.target.value }))}
                      placeholder="Type your explanation here as you would in the board exam..."
                      className="w-full text-xs font-sans bg-stone-50 border border-stone-300 rounded-xl p-3 text-stone-800 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <button
                      onClick={() => handleEvaluateShortAnswer(sa)}
                      disabled={isEvaluating}
                      className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-4 py-2 rounded-xl text-xs transition shadow-2xs"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{isEvaluating ? 'Evaluating with AI...' : 'Evaluate My Answer'}</span>
                    </button>

                    <span className="text-[11px] text-stone-400">
                      Max Score: 5 Marks
                    </span>
                  </div>

                  {/* AI Evaluation Feedback Card */}
                  {evalResult && (
                    <div className="bg-indigo-50/60 border border-indigo-200 rounded-xl p-4 text-xs text-indigo-950 space-y-2">
                      <div className="flex items-center justify-between border-b border-indigo-200 pb-2">
                        <span className="font-bold text-indigo-950 text-sm">
                          Examiner Score: <span className="text-indigo-700 font-extrabold">{evalResult.score} / {evalResult.maxScore}</span>
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-200 text-indigo-800">
                          AI Evaluated
                        </span>
                      </div>
                      <p className="text-stone-700">{evalResult.feedback}</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                        <div className="bg-white/80 p-2.5 rounded-lg border border-indigo-100">
                          <span className="font-bold text-emerald-800 block mb-0.5">Strengths:</span>
                          <span className="text-stone-600">{evalResult.strengths}</span>
                        </div>
                        <div className="bg-white/80 p-2.5 rounded-lg border border-indigo-100">
                          <span className="font-bold text-amber-800 block mb-0.5">How to reach 5/5:</span>
                          <span className="text-stone-600">{evalResult.improvements}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Model Answer Toggle */}
                  <details className="text-xs text-stone-600 bg-stone-50 p-3 rounded-xl border border-stone-200">
                    <summary className="cursor-pointer font-bold text-stone-800 hover:text-amber-700">
                      Click to reveal Ideal Model Answer
                    </summary>
                    <div className="mt-2 pt-2 border-t border-stone-200 space-y-1">
                      <p className="text-stone-800 leading-normal">{sa.modelAnswer}</p>
                      <div className="mt-1 pt-1 text-[11px] text-stone-500">
                        <span className="font-semibold">Key Points to include: </span>
                        {sa.keyPoints.join(' • ')}
                      </div>
                    </div>
                  </details>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* MODE 4: INTERACTIVE FLIP FLASHCARDS */}
      {activeTabMode === 'flashcards' && deck && deck.flashcards.length > 0 && (
        <div className="max-w-xl mx-auto space-y-6">
          {/* Flashcard Header */}
          <div className="flex items-center justify-between text-xs text-stone-500">
            <span>Card {flashcardIndex + 1} of {deck.flashcards.length}</span>
            <span className="font-semibold text-amber-700">
              {Object.values(masteredCards).filter(Boolean).length} of {deck.flashcards.length} Mastered
            </span>
          </div>

          {/* Flip Card Container */}
          <div
            onClick={() => setIsFlipped(!isFlipped)}
            className="h-64 bg-white rounded-3xl border-2 border-amber-200/80 shadow-md p-6 flex flex-col justify-between items-center text-center cursor-pointer transition-all duration-300 hover:border-amber-400 group relative select-none"
          >
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
              {isFlipped ? 'Answer & Explanation' : 'Question / Concept'} (Click to flip)
            </span>

            <div className="my-auto px-4">
              <h3 className="text-lg sm:text-xl font-bold text-stone-900 font-['Outfit'] leading-snug">
                {isFlipped
                  ? deck.flashcards[flashcardIndex].back
                  : deck.flashcards[flashcardIndex].front}
              </h3>
            </div>

            <span className="text-xs text-stone-400 flex items-center gap-1">
              <RotateCw className="w-3.5 h-3.5 group-hover:rotate-180 transition duration-500" />
              <span>Tap anywhere to flip card</span>
            </span>
          </div>

          {/* Card Controls */}
          <div className="flex items-center justify-between gap-4">
            <button
              onClick={() => {
                setIsFlipped(false);
                setFlashcardIndex(prev => Math.max(0, prev - 1));
              }}
              disabled={flashcardIndex === 0}
              className="p-2.5 rounded-xl border border-stone-300 bg-white hover:bg-stone-50 disabled:opacity-30 text-stone-700 transition"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  const card = deck.flashcards[flashcardIndex];
                  setMasteredCards(prev => ({ ...prev, [card.id]: true }));
                  addXP(10, 'Mastered Flashcard');
                  if (flashcardIndex < deck.flashcards.length - 1) {
                    setIsFlipped(false);
                    setFlashcardIndex(prev => prev + 1);
                  }
                }}
                className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2 rounded-xl text-xs transition shadow-2xs"
              >
                <Check className="w-4 h-4" />
                <span>Got It (+10 XP)</span>
              </button>

              <button
                onClick={() => {
                  if (flashcardIndex < deck.flashcards.length - 1) {
                    setIsFlipped(false);
                    setFlashcardIndex(prev => prev + 1);
                  }
                }}
                className="flex items-center gap-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold px-4 py-2 rounded-xl text-xs transition"
              >
                <span>Review Later</span>
              </button>
            </div>

            <button
              onClick={() => {
                setIsFlipped(false);
                setFlashcardIndex(prev => Math.min(deck.flashcards.length - 1, prev + 1));
              }}
              disabled={flashcardIndex === deck.flashcards.length - 1}
              className="p-2.5 rounded-xl border border-stone-300 bg-white hover:bg-stone-50 disabled:opacity-30 text-stone-700 transition"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
