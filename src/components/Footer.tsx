import React, { useState } from 'react';
import {
  Sparkles,
  ArrowRight,
  HelpCircle,
  Mail,
  MessageSquare,
  AlertCircle,
  ShieldCheck,
  FileText,
  X,
  CheckCircle2,
  Send,
  ExternalLink,
  GraduationCap
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { NavTab } from '../types';

type InfoModalType = 'privacy' | 'terms' | 'help' | 'contact' | 'feedback' | 'report' | null;

export const Footer: React.FC = () => {
  const { setActiveTab } = useApp();
  const [activeModal, setActiveModal] = useState<InfoModalType>(null);
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [reportText, setReportText] = useState('');
  const [reportSubmitted, setReportSubmitted] = useState(false);

  // Navigate smoothly using app's tab routing and scroll to top of content
  const handleNavigate = (tab: NavTab) => {
    setActiveTab(tab);
    const mainContainer = document.querySelector('.overflow-y-auto');
    if (mainContainer) {
      mainContainer.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleFeedbackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackText.trim()) return;
    setFeedbackSubmitted(true);
    setTimeout(() => {
      setFeedbackSubmitted(false);
      setFeedbackText('');
      setActiveModal(null);
    }, 1800);
  };

  const handleReportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportText.trim()) return;
    setReportSubmitted(true);
    setTimeout(() => {
      setReportSubmitted(false);
      setReportText('');
      setActiveModal(null);
    }, 1800);
  };

  return (
    <>
      <footer
        id="app-global-footer"
        className="mt-auto border-t border-stone-200 dark:border-stone-800 bg-white/90 dark:bg-stone-900/90 text-stone-700 dark:text-stone-300 backdrop-blur transition-colors"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-12">
          {/* Main Footer Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-10">
            {/* 1. BRAND COLUMN */}
            <div className="lg:col-span-2 space-y-4">
              <div
                onClick={() => handleNavigate('dashboard')}
                className="flex items-center gap-3 cursor-pointer select-none group w-fit"
                title="Go to Home"
              >
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-400 flex items-center justify-center text-stone-950 shadow-md shadow-amber-500/20 shrink-0 group-hover:scale-105 transition-transform">
                  <Sparkles className="w-5 h-5 text-stone-950" />
                </div>
                <div className="flex flex-col">
                  <span className="font-extrabold text-lg sm:text-xl tracking-tight text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                    Smart <span className="text-amber-500 dark:text-amber-400">Education</span>
                  </span>
                  <span className="text-[11px] text-stone-500 dark:text-stone-400 font-medium">
                    AI-Powered Learning Platform
                  </span>
                </div>
              </div>

              <p className="text-sm text-stone-600 dark:text-stone-400 font-medium leading-relaxed max-w-sm">
                Learn smarter. Study better. Achieve more.
              </p>

              <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed max-w-sm">
                Empowering students across Classes 6th–10th with personalized AI tutoring, interactive quizzes, automated study schedules, and intelligent revision tools.
              </p>

              <div className="pt-2 flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  AI Study Assistant Online
                </span>
              </div>
            </div>

            {/* 2. QUICK LINKS */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-stone-900 dark:text-stone-100">
                Quick Links
              </h3>
              <ul className="space-y-2.5 text-sm">
                <li>
                  <button
                    type="button"
                    onClick={() => handleNavigate('dashboard')}
                    className="text-stone-600 dark:text-stone-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors flex items-center gap-1.5 group text-left"
                  >
                    <span className="group-hover:translate-x-0.5 transition-transform">Home</span>
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => handleNavigate('computerCourses')}
                    className="text-stone-600 dark:text-stone-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors flex items-center gap-1.5 group text-left"
                  >
                    <span className="group-hover:translate-x-0.5 transition-transform">My Learning</span>
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => handleNavigate('tutor')}
                    className="text-stone-600 dark:text-stone-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors flex items-center gap-1.5 group text-left"
                  >
                    <span className="group-hover:translate-x-0.5 transition-transform">AI Tutor</span>
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => handleNavigate('quiz')}
                    className="text-stone-600 dark:text-stone-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors flex items-center gap-1.5 group text-left"
                  >
                    <span className="group-hover:translate-x-0.5 transition-transform">Quizzes</span>
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => handleNavigate('planner')}
                    className="text-stone-600 dark:text-stone-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors flex items-center gap-1.5 group text-left"
                  >
                    <span className="group-hover:translate-x-0.5 transition-transform">Study Planner</span>
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => handleNavigate('calendar')}
                    className="text-stone-600 dark:text-stone-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors flex items-center gap-1.5 group text-left"
                  >
                    <span className="group-hover:translate-x-0.5 transition-transform">Progress</span>
                  </button>
                </li>
              </ul>
            </div>

            {/* 3. AI TOOLS */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-stone-900 dark:text-stone-100">
                AI Tools
              </h3>
              <ul className="space-y-2.5 text-sm">
                <li>
                  <button
                    type="button"
                    onClick={() => handleNavigate('tutor')}
                    className="text-stone-600 dark:text-stone-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors flex items-center gap-1.5 group text-left"
                  >
                    <span className="group-hover:translate-x-0.5 transition-transform">AI Doubt Solver</span>
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => handleNavigate('revision')}
                    className="text-stone-600 dark:text-stone-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors flex items-center gap-1.5 group text-left"
                  >
                    <span className="group-hover:translate-x-0.5 transition-transform">Notes Summarizer</span>
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => handleNavigate('quiz')}
                    className="text-stone-600 dark:text-stone-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors flex items-center gap-1.5 group text-left"
                  >
                    <span className="group-hover:translate-x-0.5 transition-transform">Quiz Generator</span>
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => handleNavigate('computerCourses')}
                    className="text-stone-600 dark:text-stone-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors flex items-center gap-1.5 group text-left"
                  >
                    <span className="group-hover:translate-x-0.5 transition-transform">Coding Tutor</span>
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => handleNavigate('rescue')}
                    className="text-stone-600 dark:text-stone-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors flex items-center gap-1.5 group text-left"
                  >
                    <span className="group-hover:translate-x-0.5 transition-transform">Exam Rescue Mode</span>
                  </button>
                </li>
              </ul>
            </div>

            {/* 4. SUPPORT */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-stone-900 dark:text-stone-100">
                Support
              </h3>
              <ul className="space-y-2.5 text-sm">
                <li>
                  <button
                    type="button"
                    onClick={() => setActiveModal('help')}
                    className="text-stone-600 dark:text-stone-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors flex items-center gap-1.5 group text-left"
                  >
                    <span className="group-hover:translate-x-0.5 transition-transform">Help Center</span>
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => setActiveModal('contact')}
                    className="text-stone-600 dark:text-stone-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors flex items-center gap-1.5 group text-left"
                  >
                    <span className="group-hover:translate-x-0.5 transition-transform">Contact Us</span>
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => setActiveModal('feedback')}
                    className="text-stone-600 dark:text-stone-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors flex items-center gap-1.5 group text-left"
                  >
                    <span className="group-hover:translate-x-0.5 transition-transform">Feedback</span>
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => setActiveModal('report')}
                    className="text-stone-600 dark:text-stone-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors flex items-center gap-1.5 group text-left"
                  >
                    <span className="group-hover:translate-x-0.5 transition-transform">Report a Problem</span>
                  </button>
                </li>
              </ul>
            </div>
          </div>

          {/* BOTTOM BAR */}
          <div className="mt-10 pt-6 border-t border-stone-200 dark:border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-500 dark:text-stone-400">
            <p className="font-normal text-center sm:text-left">
              &copy; 2026 Smart Education. All rights reserved.
            </p>

            <div className="flex items-center gap-6">
              <button
                type="button"
                onClick={() => setActiveModal('privacy')}
                className="hover:text-stone-900 dark:hover:text-stone-100 transition-colors underline-offset-4 hover:underline"
              >
                Privacy Policy
              </button>
              <span className="text-stone-300 dark:text-stone-700">•</span>
              <button
                type="button"
                onClick={() => setActiveModal('terms')}
                className="hover:text-stone-900 dark:hover:text-stone-100 transition-colors underline-offset-4 hover:underline"
              >
                Terms of Service
              </button>
            </div>
          </div>
        </div>
      </footer>

      {/* SUPPORT & LEGAL MODALS */}
      {activeModal && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-fadeIn"
          onClick={() => setActiveModal(null)}
        >
          <div
            className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 max-w-lg w-full p-6 shadow-2xl space-y-4 text-stone-800 dark:text-stone-200 relative my-8"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-800 pb-3">
              <div className="flex items-center gap-2 font-bold text-base sm:text-lg text-stone-900 dark:text-stone-100">
                {activeModal === 'privacy' && <ShieldCheck className="w-5 h-5 text-amber-500" />}
                {activeModal === 'terms' && <FileText className="w-5 h-5 text-amber-500" />}
                {activeModal === 'help' && <HelpCircle className="w-5 h-5 text-amber-500" />}
                {activeModal === 'contact' && <Mail className="w-5 h-5 text-amber-500" />}
                {activeModal === 'feedback' && <MessageSquare className="w-5 h-5 text-amber-500" />}
                {activeModal === 'report' && <AlertCircle className="w-5 h-5 text-rose-500" />}
                <span>
                  {activeModal === 'privacy' && 'Privacy Policy'}
                  {activeModal === 'terms' && 'Terms of Service'}
                  {activeModal === 'help' && 'Help Center'}
                  {activeModal === 'contact' && 'Contact Us'}
                  {activeModal === 'feedback' && 'Send Feedback'}
                  {activeModal === 'report' && 'Report a Problem'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="text-sm text-stone-600 dark:text-stone-300 leading-relaxed max-h-[65vh] overflow-y-auto pr-1 space-y-3">
              {/* Privacy Policy */}
              {activeModal === 'privacy' && (
                <div className="space-y-3">
                  <p className="font-semibold text-stone-900 dark:text-stone-100">
                    Your Privacy Matters at Smart Education
                  </p>
                  <p>
                    Smart Education is dedicated to safeguarding student privacy. We comply with educational privacy standards (COPPA and student data safety protocols) to ensure a safe learning space for grades 6 through 10.
                  </p>
                  <div className="p-3 bg-stone-50 dark:bg-stone-800/60 rounded-xl space-y-1.5 border border-stone-200 dark:border-stone-700/60 text-xs">
                    <p className="font-bold text-stone-800 dark:text-stone-200">Key Commitments:</p>
                    <ul className="list-disc pl-4 space-y-1 text-stone-600 dark:text-stone-400">
                      <li>No personal student data is ever sold or shared with third-party advertisers.</li>
                      <li>Study logs, quiz results, and streak records are securely encrypted.</li>
                      <li>All AI tutoring prompts are filtered for child-safe educational content.</li>
                    </ul>
                  </div>
                  <p className="text-xs text-stone-500 dark:text-stone-400">
                    Last updated: September 2026. For privacy questions, reach us at privacy@smarteducation.app.
                  </p>
                </div>
              )}

              {/* Terms of Service */}
              {activeModal === 'terms' && (
                <div className="space-y-3">
                  <p className="font-semibold text-stone-900 dark:text-stone-100">
                    Terms of Educational Service
                  </p>
                  <p>
                    Welcome to Smart Education. By accessing our platform, students, parents, and educators agree to engage in constructive, academic learning.
                  </p>
                  <div className="p-3 bg-stone-50 dark:bg-stone-800/60 rounded-xl space-y-1.5 border border-stone-200 dark:border-stone-700/60 text-xs">
                    <p className="font-bold text-stone-800 dark:text-stone-200">Guidelines:</p>
                    <ul className="list-disc pl-4 space-y-1 text-stone-600 dark:text-stone-400">
                      <li>Accounts are designated for individual student study and academic progression.</li>
                      <li>AI tools are designed to facilitate comprehension, homework help, and self-evaluation.</li>
                      <li>Cheating or misuse of computational resources is strictly prohibited.</li>
                    </ul>
                  </div>
                  <p className="text-xs text-stone-500 dark:text-stone-400">
                    Effective date: 2026. All curriculum alignments follow standard CBSE, ICSE, and State Board syllabi.
                  </p>
                </div>
              )}

              {/* Help Center */}
              {activeModal === 'help' && (
                <div className="space-y-3">
                  <p className="font-semibold text-stone-900 dark:text-stone-100">
                    Frequently Asked Questions
                  </p>
                  <div className="space-y-2">
                    <div className="p-2.5 rounded-lg bg-stone-50 dark:bg-stone-800/50 border border-stone-200 dark:border-stone-800">
                      <p className="font-bold text-xs text-stone-900 dark:text-stone-100">How does the AI Tutor work?</p>
                      <p className="text-xs text-stone-600 dark:text-stone-400 mt-1">
                        Type or speak any homework doubt or topic. Our AI explains concepts step-by-step using relatable examples and simple language suited to your grade.
                      </p>
                    </div>
                    <div className="p-2.5 rounded-lg bg-stone-50 dark:bg-stone-800/50 border border-stone-200 dark:border-stone-800">
                      <p className="font-bold text-xs text-stone-900 dark:text-stone-100">How do I generate an instant quiz?</p>
                      <p className="text-xs text-stone-600 dark:text-stone-400 mt-1">
                        Go to Quizzes, paste your textbook notes or type a topic title, and click Generate Quiz to get instant MCQs with explanations!
                      </p>
                    </div>
                    <div className="p-2.5 rounded-lg bg-stone-50 dark:bg-stone-800/50 border border-stone-200 dark:border-stone-800">
                      <p className="font-bold text-xs text-stone-900 dark:text-stone-100">What is Exam Rescue Mode?</p>
                      <p className="text-xs text-stone-600 dark:text-stone-400 mt-1">
                        Facing an exam tomorrow? Exam Rescue Mode prioritizes the 20% highest-yield concepts that yield 80% of test marks.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Contact Us */}
              {activeModal === 'contact' && (
                <div className="space-y-3">
                  <p className="font-semibold text-stone-900 dark:text-stone-100">
                    We're Here to Help
                  </p>
                  <p className="text-xs">
                    Need support with your account, syllabus, or technical issues? Reach out to our dedicated student success team.
                  </p>
                  <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl space-y-2 text-xs">
                    <div className="flex items-center gap-2 text-amber-700 dark:text-amber-300">
                      <Mail className="w-4 h-4" />
                      <span className="font-semibold">support@smarteducation.app</span>
                    </div>
                    <p className="text-stone-600 dark:text-stone-400">
                      Available Monday–Saturday, 8:00 AM – 8:00 PM. Typical response time under 2 hours.
                    </p>
                  </div>
                </div>
              )}

              {/* Feedback Form */}
              {activeModal === 'feedback' && (
                <div>
                  {feedbackSubmitted ? (
                    <div className="py-6 text-center space-y-2">
                      <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto animate-bounce" />
                      <p className="font-bold text-stone-900 dark:text-stone-100">Thank You for Your Feedback!</p>
                      <p className="text-xs text-stone-500">Your suggestions help make Smart Education better for every student.</p>
                    </div>
                  ) : (
                    <form onSubmit={handleFeedbackSubmit} className="space-y-3">
                      <p className="text-xs text-stone-600 dark:text-stone-400">
                        Share what you love about Smart Education or what we should improve next:
                      </p>
                      <textarea
                        rows={4}
                        value={feedbackText}
                        onChange={(e) => setFeedbackText(e.target.value)}
                        placeholder="Tell us your suggestions, favourite features, or ideas..."
                        className="w-full text-xs p-3 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 outline-none focus:ring-2 focus:ring-amber-500"
                        required
                      />
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setActiveModal(null)}
                          className="px-3 py-1.5 rounded-xl text-xs font-semibold text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-1.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-600 text-stone-950 flex items-center gap-1.5 shadow-md shadow-amber-500/20"
                        >
                          <Send className="w-3.5 h-3.5" /> Submit Feedback
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              )}

              {/* Report a Problem */}
              {activeModal === 'report' && (
                <div>
                  {reportSubmitted ? (
                    <div className="py-6 text-center space-y-2">
                      <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto animate-bounce" />
                      <p className="font-bold text-stone-900 dark:text-stone-100">Report Received</p>
                      <p className="text-xs text-stone-500">Our engineering team has logged this issue and will investigate right away.</p>
                    </div>
                  ) : (
                    <form onSubmit={handleReportSubmit} className="space-y-3">
                      <p className="text-xs text-stone-600 dark:text-stone-400">
                        Encountered a bug or an incorrect explanation? Describe what happened below:
                      </p>
                      <textarea
                        rows={4}
                        value={reportText}
                        onChange={(e) => setReportText(e.target.value)}
                        placeholder="Describe the issue, subject, or unexpected behavior..."
                        className="w-full text-xs p-3 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 outline-none focus:ring-2 focus:ring-rose-500"
                        required
                      />
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setActiveModal(null)}
                          className="px-3 py-1.5 rounded-xl text-xs font-semibold text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-1.5 rounded-xl text-xs font-bold bg-rose-500 hover:bg-rose-600 text-white flex items-center gap-1.5 shadow-md shadow-rose-500/20"
                        >
                          <Send className="w-3.5 h-3.5" /> Submit Report
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
