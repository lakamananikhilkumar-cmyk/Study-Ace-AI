import React, { useState } from 'react';
import { Mail, Copy, Check, ArrowRight, Sparkles, X, ShieldCheck, Calendar, User, IdCard, Lock } from 'lucide-react';
import { StudentEmailNotification } from '../types';

interface EmailNotificationModalProps {
  isOpen: boolean;
  email: StudentEmailNotification | null;
  onClose: () => void;
  onProceedToLogin?: (rollNumber: string, name?: string, emailAddr?: string) => void;
  onDirectSignIn?: () => void;
}

export const EmailNotificationModal: React.FC<EmailNotificationModalProps> = ({
  isOpen,
  email,
  onClose,
  onProceedToLogin,
  onDirectSignIn
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !email) return null;

  const handleCopyRollNumber = () => {
    navigator.clipboard.writeText(email.rollNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        id="email-notification-modal"
        className="bg-white dark:bg-stone-900 w-full max-w-xl rounded-2xl shadow-2xl border border-stone-200 dark:border-stone-800 overflow-hidden text-stone-900 dark:text-stone-100 transition-colors"
      >
        {/* Email Header Banner */}
        <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 p-5 text-stone-950 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center shadow-inner">
              <Mail className="w-6 h-6 text-stone-950" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider bg-stone-950/20 px-2 py-0.5 rounded-full w-fit mb-1 text-stone-950">
                <Sparkles className="w-3 h-3" />
                <span>Official Email Delivered</span>
              </div>
              <h3 className="text-lg font-extrabold leading-tight">
                Your 5-Digit Roll Number Has Arrived!
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-stone-950/10 hover:bg-stone-950/20 text-stone-950 transition"
            title="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Email Metadata Bar */}
        <div className="px-6 py-3 bg-stone-50 dark:bg-stone-800/60 border-b border-stone-200 dark:border-stone-800 text-xs text-stone-600 dark:text-stone-300 space-y-1">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <strong className="text-stone-900 dark:text-stone-100">From:</strong> StudyAce AI Admissions &lt;admissions@studyace.edu&gt;
            </div>
            <div className="flex items-center gap-1 text-[11px] text-stone-500 dark:text-stone-400">
              <Calendar className="w-3.5 h-3.5" />
              <span>{new Date(email.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}, Today</span>
            </div>
          </div>
          <div>
            <strong className="text-stone-900 dark:text-stone-100">To:</strong> {email.recipientName} &lt;{email.recipientEmail}&gt;
          </div>
          <div className="truncate">
            <strong className="text-stone-900 dark:text-stone-100">Subject:</strong> {email.subject}
          </div>
        </div>

        {/* Email Body Content */}
        <div className="p-6 space-y-5 max-h-[55vh] overflow-y-auto">
          <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-400">
                Official Assigned Student ID
              </p>
              <div className="text-3xl font-black font-mono tracking-widest text-stone-900 dark:text-stone-100 mt-1">
                {email.rollNumber}
              </div>
              <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5">
                5-Digit institutional roll number for student logins
              </p>
            </div>
            <button
              id="copy-roll-number-btn"
              onClick={handleCopyRollNumber}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-stone-800 border border-amber-300 dark:border-amber-700 text-xs font-bold text-amber-700 dark:text-amber-300 shadow-sm hover:bg-amber-100/50 transition cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copy Roll Number</span>
                </>
              )}
            </button>
          </div>

          <div className="text-xs leading-relaxed text-stone-700 dark:text-stone-300 whitespace-pre-line border-l-2 border-amber-500 pl-4 py-1">
            {email.body}
          </div>

          {/* Login Checklist Reminder */}
          <div className="rounded-xl p-4 bg-stone-100 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700 text-xs space-y-2">
            <h4 className="font-bold text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Your 4 Credentials for Already-Registered Login:</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
              <div className="flex items-center gap-1.5 p-2 rounded bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800">
                <User className="w-3.5 h-3.5 text-stone-400" />
                <span>1. Name: <strong>{email.recipientName}</strong></span>
              </div>
              <div className="flex items-center gap-1.5 p-2 rounded bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800">
                <Mail className="w-3.5 h-3.5 text-stone-400" />
                <span className="truncate">2. Email: <strong>{email.recipientEmail}</strong></span>
              </div>
              <div className="flex items-center gap-1.5 p-2 rounded bg-white dark:bg-stone-900 border border-amber-300/80 dark:border-amber-800">
                <IdCard className="w-3.5 h-3.5 text-amber-500" />
                <span>3. Roll Number: <strong className="font-mono text-amber-600 dark:text-amber-400">{email.rollNumber}</strong></span>
              </div>
              <div className="flex items-center gap-1.5 p-2 rounded bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800">
                <Lock className="w-3.5 h-3.5 text-stone-400" />
                <span>4. Password: <strong>(Your password)</strong></span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-stone-50 dark:bg-stone-800/50 border-t border-stone-200 dark:border-stone-800 flex flex-col sm:flex-row items-center justify-end gap-2.5">
          {onProceedToLogin && (
            <button
              id="email-modal-prefill-login"
              type="button"
              onClick={() => {
                onProceedToLogin(email.rollNumber, email.recipientName, email.recipientEmail);
                onClose();
              }}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-xs font-bold text-stone-800 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-700 transition"
            >
              Pre-fill 4 Login Fields
            </button>
          )}

          {onDirectSignIn ? (
            <button
              id="email-modal-direct-signin"
              type="button"
              onClick={() => {
                onDirectSignIn();
                onClose();
              }}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-stone-950 font-bold text-xs shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Sign In Directly Now</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-amber-500 text-stone-950 font-bold text-xs"
            >
              Done
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
