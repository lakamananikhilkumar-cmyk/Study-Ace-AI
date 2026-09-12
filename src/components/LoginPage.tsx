import React, { useState } from 'react';
import {
  Sparkles,
  Lock,
  Mail,
  User,
  GraduationCap,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  IdCard,
  Sun,
  Moon,
  Eye,
  EyeOff,
  Inbox,
  Send,
  HelpCircle,
  Copy,
  Check
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { SAMPLE_STUDENTS } from '../data/defaultData';
import { ClassGrade, EducationBoard, LearningLevel, StudentEmailNotification } from '../types';
import { EmailNotificationModal } from './EmailNotificationModal';

export const LoginPage: React.FC = () => {
  const {
    login,
    registerDirect,
    sendOtp,
    verifyOtpAndRegister,
    switchProfile,
    theme,
    toggleTheme,
    studentMails,
    activeEmailPreview,
    setActiveEmailPreview,
    dismissEmailPreview
  } = useApp();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isMailboxOpen, setIsMailboxOpen] = useState(false);

  // 4 Fields for Already-Registered Login
  // 1. Name
  const [loginName, setLoginName] = useState('Aarav Sharma');
  // 2. Email
  const [loginEmail, setLoginEmail] = useState('aarav.class10@studyace.edu');
  // 3. Roll Number
  const [loginRollNumber, setLoginRollNumber] = useState('48291');
  // 4. Password
  const [loginPassword, setLoginPassword] = useState('password123');

  // Fields for Unregistered Students:
  // 1. Name
  const [regName, setRegName] = useState('');
  // 2. Email
  const [regEmail, setRegEmail] = useState('');
  // 3. Password
  const [regPassword, setRegPassword] = useState('');
  // Class & Board options
  const [classGrade, setClassGrade] = useState<ClassGrade>('Class 10');
  const [board, setBoard] = useState<EducationBoard>('CBSE');
  const [level, setLevel] = useState<LearningLevel>('intermediate');

  // Alternative OTP flow toggle
  const [useOtpVerification, setUseOtpVerification] = useState(false);
  const [otpStep, setOtpStep] = useState<'details' | 'verify'>('details');
  const [otpCode, setOtpCode] = useState('');
  const [demoOtpNotice, setDemoOtpNotice] = useState<string | null>(null);

  // Handle Login for Already Registered Students (1. Name, 2. Email, 3. Roll Number, 4. Password)
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!loginName.trim()) {
      setErrorMessage('Please enter your Registered Student Name.');
      return;
    }
    if (!loginEmail.trim() || !loginEmail.includes('@')) {
      setErrorMessage('Please enter a valid Registered Email Address.');
      return;
    }
    if (!loginRollNumber.trim()) {
      setErrorMessage('Please enter your 5-Digit Student Roll Number.');
      return;
    }
    if (!loginPassword) {
      setErrorMessage('Please enter your Password.');
      return;
    }

    setLoading(true);
    const res = await login({
      name: loginName.trim(),
      email: loginEmail.trim(),
      rollNumber: loginRollNumber.trim(),
      password: loginPassword
    });
    setLoading(false);

    if (!res.success) {
      setErrorMessage(res.error || 'Login failed. Please verify your credentials.');
    }
  };

  // Handle Registration for Unregistered Students (1. Name, 2. Email, 3. Password -> Roll Number sent to Mail)
  const handleDirectRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!regName.trim()) {
      setErrorMessage('Please enter your Full Name.');
      return;
    }
    if (!regEmail.trim() || !regEmail.includes('@')) {
      setErrorMessage('Please enter a valid Email address to receive your 5-digit Roll Number.');
      return;
    }
    if (!regPassword || regPassword.length < 4) {
      setErrorMessage('Password must be at least 4 characters long.');
      return;
    }

    setLoading(true);
    const res = await registerDirect({
      name: regName.trim(),
      email: regEmail.trim(),
      password: regPassword,
      classGrade,
      board,
      level
    });
    setLoading(false);

    if (res.success) {
      setSuccessMessage(`Account created! Official Roll Number (${res.rollNumber}) sent to ${regEmail}.`);
      // Update login fields so they can test 4-field login anytime
      setLoginName(regName.trim());
      setLoginEmail(regEmail.trim());
      setLoginRollNumber(res.rollNumber || '');
      setLoginPassword(regPassword);
    } else {
      setErrorMessage(res.error || 'Failed to create account.');
    }
  };

  // Optional OTP Flow
  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!regEmail || !regEmail.includes('@')) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }
    if (!regName.trim()) {
      setErrorMessage('Please enter your name.');
      return;
    }
    if (!regPassword || regPassword.length < 4) {
      setErrorMessage('Password must be at least 4 characters long.');
      return;
    }

    setLoading(true);
    const res = await sendOtp(regEmail, regName);
    setLoading(false);

    if (res.success) {
      setOtpStep('verify');
      if (res.demoOtp) {
        setDemoOtpNotice(res.demoOtp);
        setOtpCode(res.demoOtp);
      }
      setSuccessMessage(`Verification OTP dispatched to ${regEmail}.`);
    } else {
      setErrorMessage(res.error || 'Failed to send OTP.');
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!otpCode || otpCode.length < 4) {
      setErrorMessage('Please enter the 6-digit OTP code.');
      return;
    }

    setLoading(true);
    const res = await verifyOtpAndRegister({
      email: regEmail,
      otp: otpCode,
      password: regPassword,
      name: regName,
      classGrade,
      board,
      level,
      subjects: ['Mathematics', 'Science', 'Social Science', 'English']
    });
    setLoading(false);

    if (res.success) {
      setSuccessMessage(`Verified! Your 5-digit Roll Number is ${res.rollNumber}. Sent to your mail.`);
      setLoginName(regName);
      setLoginEmail(regEmail);
      setLoginRollNumber(res.rollNumber || '');
      setLoginPassword(regPassword);
    } else {
      setErrorMessage(res.error || 'OTP verification failed.');
    }
  };

  // Quick fill student credentials into the 4 login fields
  const handleQuickFill = (student: typeof SAMPLE_STUDENTS[0]) => {
    setLoginName(student.name);
    setLoginEmail(student.email);
    setLoginRollNumber(student.rollNumber);
    setLoginPassword('password123');
    setMode('login');
    setErrorMessage(null);
    setSuccessMessage(`Loaded ${student.name}'s credentials into all 4 fields.`);
  };

  return (
    <div className="min-h-screen bg-stone-100 dark:bg-stone-950 text-stone-900 dark:text-stone-100 flex flex-col justify-between transition-colors duration-300 selection:bg-amber-500 selection:text-stone-950">
      {/* Top Utility Header with Theme Toggle & Mailbox */}
      <header className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-400 text-stone-950 flex items-center justify-center font-black shadow-md shadow-amber-500/20">
            <Sparkles className="w-5 h-5 text-stone-950" />
          </div>
          <div>
            <span className="font-extrabold text-base tracking-tight text-stone-900 dark:text-stone-100">
              Study<span className="text-amber-500">Ace</span> AI
            </span>
            <span className="hidden sm:inline-block ml-2 text-xs text-stone-500 dark:text-stone-400 font-medium">
              Academic Portal
            </span>
          </div>
        </div>

        {/* Action Controls: Theme Switcher & Student Mailbox */}
        <div className="flex items-center gap-2.5">
          {/* Theme Mode Toggle */}
          <button
            id="login-theme-toggle-button"
            type="button"
            onClick={toggleTheme}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800 text-xs font-semibold shadow-sm transition cursor-pointer"
            title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
          >
            {theme === 'light' ? (
              <>
                <Moon className="w-4 h-4 text-amber-500" />
                <span className="hidden sm:inline">Dark Mode</span>
              </>
            ) : (
              <>
                <Sun className="w-4 h-4 text-amber-400" />
                <span className="hidden sm:inline">Light Mode</span>
              </>
            )}
          </button>

          {/* Student Mailbox (where Roll Number emails arrive) */}
          <button
            id="login-mailbox-button"
            type="button"
            onClick={() => setIsMailboxOpen(true)}
            className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/60 text-xs font-bold shadow-sm transition cursor-pointer"
            title="View Student Inbox & Roll Number Notifications"
          >
            <Inbox className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <span>Student Mails</span>
            {studentMails.length > 0 && (
              <span className="w-5 h-5 rounded-full bg-amber-500 text-stone-950 font-black text-[10px] flex items-center justify-center">
                {studentMails.length}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* Main Authentication Card Container */}
      <main className="w-full max-w-xl mx-auto px-4 sm:px-6 py-6 flex-1 flex flex-col justify-center">
        <div className="bg-white dark:bg-stone-900 shadow-xl rounded-2xl p-6 sm:p-8 border border-stone-200 dark:border-stone-800 transition-colors">
          
          {/* Header Description */}
          <div className="text-center mb-6">
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-stone-900 dark:text-stone-100">
              {mode === 'login' ? 'Student Sign In' : 'Create Student Account'}
            </h1>
            <p className="mt-1.5 text-xs sm:text-sm text-stone-600 dark:text-stone-400">
              {mode === 'login'
                ? 'For already registered students: Enter your 4 credentials below'
                : 'For new students: Register with Name, Email & Password (Roll Number sent via mail)'}
            </p>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="grid grid-cols-2 gap-1.5 p-1 rounded-xl bg-stone-100 dark:bg-stone-800 mb-6 border border-stone-200/80 dark:border-stone-700/80">
            <button
              id="auth-tab-registered-login"
              type="button"
              onClick={() => {
                setMode('login');
                setErrorMessage(null);
                setSuccessMessage(null);
              }}
              className={`py-2.5 px-3 text-xs font-bold rounded-lg transition flex items-center justify-center gap-1.5 cursor-pointer ${
                mode === 'login'
                  ? 'bg-white dark:bg-stone-900 text-amber-600 dark:text-amber-400 shadow-sm'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
              }`}
            >
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>Already Registered</span>
            </button>
            <button
              id="auth-tab-create-account"
              type="button"
              onClick={() => {
                setMode('register');
                setOtpStep('details');
                setErrorMessage(null);
                setSuccessMessage(null);
              }}
              className={`py-2.5 px-3 text-xs font-bold rounded-lg transition flex items-center justify-center gap-1.5 cursor-pointer ${
                mode === 'register'
                  ? 'bg-white dark:bg-stone-900 text-amber-600 dark:text-amber-400 shadow-sm'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
              }`}
            >
              <GraduationCap className="w-4 h-4 shrink-0" />
              <span>Create Account</span>
            </button>
          </div>

          {/* Feedback Messages */}
          {errorMessage && (
            <div
              id="auth-error-alert"
              className="mb-5 p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs flex items-start gap-2.5"
            >
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="flex-1 font-medium">{errorMessage}</div>
            </div>
          )}

          {successMessage && (
            <div
              id="auth-success-alert"
              className="mb-5 p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-900 text-emerald-700 dark:text-emerald-300 text-xs flex items-start gap-2.5"
            >
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600 dark:text-emerald-400" />
              <div className="flex-1 font-medium">{successMessage}</div>
            </div>
          )}

          {/* ============================================================ */}
          {/* 1. LOGIN FOR ALREADY REGISTERED USERS                        */}
          {/* Requires: 1. Name, 2. Email, 3. Roll Number, 4. Password     */}
          {/* ============================================================ */}
          {mode === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-900 dark:text-amber-300 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                <span>Enter your <strong>4 registered student credentials</strong> below:</span>
              </div>

              {/* Field 1: Name */}
              <div>
                <label
                  htmlFor="login-name-input"
                  className="block text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300 mb-1"
                >
                  1. Student Full Name <span className="text-amber-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    id="login-name-input"
                    type="text"
                    required
                    value={loginName}
                    onChange={e => setLoginName(e.target.value)}
                    placeholder="e.g. Aarav Sharma"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none transition"
                  />
                </div>
              </div>

              {/* Field 2: Email */}
              <div>
                <label
                  htmlFor="login-email-input"
                  className="block text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300 mb-1"
                >
                  2. Registered Email Address <span className="text-amber-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    id="login-email-input"
                    type="email"
                    required
                    value={loginEmail}
                    onChange={e => setLoginEmail(e.target.value)}
                    placeholder="e.g. aarav.class10@studyace.edu"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none transition"
                  />
                </div>
              </div>

              {/* Field 3: Roll Number */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label
                    htmlFor="login-roll-input"
                    className="block text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300"
                  >
                    3. 5-Digit Roll Number <span className="text-amber-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsMailboxOpen(true)}
                    className="text-[11px] text-amber-600 dark:text-amber-400 hover:underline font-semibold flex items-center gap-1"
                  >
                    <HelpCircle className="w-3 h-3" />
                    <span>Forgot/Find Roll No?</span>
                  </button>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                    <IdCard className="w-4 h-4" />
                  </div>
                  <input
                    id="login-roll-input"
                    type="text"
                    required
                    maxLength={5}
                    value={loginRollNumber}
                    onChange={e => setLoginRollNumber(e.target.value.replace(/\D/g, ''))}
                    placeholder="e.g. 48291"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 text-sm font-mono tracking-wider focus:ring-2 focus:ring-amber-500 focus:outline-none transition"
                  />
                </div>
                <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-1">
                  This 5-digit number was sent to your email during admission registration.
                </p>
              </div>

              {/* Field 4: Password */}
              <div>
                <label
                  htmlFor="login-password-input"
                  className="block text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300 mb-1"
                >
                  4. Password <span className="text-amber-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    id="login-password-input"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={loginPassword}
                    onChange={e => setLoginPassword(e.target.value)}
                    placeholder="Enter account password"
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(prev => !prev)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                id="login-submit-button"
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-stone-950 font-bold text-sm shadow-md hover:shadow-lg transition flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {loading ? 'Authenticating Credentials...' : 'Sign In with 4 Credentials'}
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => setMode('register')}
                  className="text-xs text-stone-500 dark:text-stone-400 hover:text-amber-600 dark:hover:text-amber-400 font-medium transition"
                >
                  Don't have an account yet? <span className="font-bold underline">Create one here</span>
                </button>
              </div>
            </form>
          ) : (
            /* ============================================================ */
            /* 2. REGISTRATION FOR UNREGISTERED USERS                        */
            /* Requires: 1. Name, 2. Email, 3. Password                     */
            /* "and roll number the user will get mail"                    */
            /* ============================================================ */
            <div>
              {!useOtpVerification ? (
                /* Direct Registration Mode (Instant Roll Number Generation & Mail Delivery) */
                <form onSubmit={handleDirectRegister} className="space-y-4">
                  {/* Institutional Admission Notice */}
                  <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 text-xs text-stone-700 dark:text-stone-300 space-y-1">
                    <div className="font-bold text-amber-800 dark:text-amber-400 flex items-center gap-1.5">
                      <Mail className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                      <span>Automatic 5-Digit Roll Number Allotment:</span>
                    </div>
                    <p className="text-[11px] text-stone-600 dark:text-stone-400 leading-relaxed">
                      Enter your <strong>Name</strong>, <strong>Email</strong>, and <strong>Password</strong>. Our admissions system will instantly generate your unique 5-digit Roll Number and send the confirmation directly to your email!
                    </p>
                  </div>

                  {/* Field 1: Name */}
                  <div>
                    <label
                      htmlFor="reg-name-input"
                      className="block text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300 mb-1"
                    >
                      1. Student Full Name <span className="text-amber-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                        <User className="w-4 h-4" />
                      </div>
                      <input
                        id="reg-name-input"
                        type="text"
                        required
                        value={regName}
                        onChange={e => setRegName(e.target.value)}
                        placeholder="e.g. Diya Sengupta"
                        className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none transition"
                      />
                    </div>
                  </div>

                  {/* Field 2: Email */}
                  <div>
                    <label
                      htmlFor="reg-email-input"
                      className="block text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300 mb-1"
                    >
                      2. Email Address (To Receive Your Roll Number) <span className="text-amber-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                        <Mail className="w-4 h-4" />
                      </div>
                      <input
                        id="reg-email-input"
                        type="email"
                        required
                        value={regEmail}
                        onChange={e => setRegEmail(e.target.value)}
                        placeholder="student@example.com"
                        className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none transition"
                      />
                    </div>
                  </div>

                  {/* Field 3: Password */}
                  <div>
                    <label
                      htmlFor="reg-password-input"
                      className="block text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300 mb-1"
                    >
                      3. Create Password <span className="text-amber-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                        <Lock className="w-4 h-4" />
                      </div>
                      <input
                        id="reg-password-input"
                        type={showPassword ? 'text' : 'password'}
                        required
                        minLength={4}
                        value={regPassword}
                        onChange={e => setRegPassword(e.target.value)}
                        placeholder="At least 4 characters"
                        className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none transition"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(prev => !prev)}
                        className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
                        title={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Academic Preferences */}
                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300 mb-1">
                        Class / Grade
                      </label>
                      <select
                        id="reg-class-select"
                        value={classGrade}
                        onChange={e => setClassGrade(e.target.value as ClassGrade)}
                        className="w-full px-3 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none transition"
                      >
                        <option value="Class 6">Class 6th</option>
                        <option value="Class 7">Class 7th</option>
                        <option value="Class 8">Class 8th</option>
                        <option value="Class 9">Class 9th</option>
                        <option value="Class 10">Class 10th (Board)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300 mb-1">
                        Board
                      </label>
                      <select
                        id="reg-board-select"
                        value={board}
                        onChange={e => setBoard(e.target.value as EducationBoard)}
                        className="w-full px-3 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none transition"
                      >
                        <option value="CBSE">CBSE</option>
                        <option value="ICSE">ICSE</option>
                        <option value="State Board">State Board</option>
                      </select>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    id="reg-create-account-button"
                    type="submit"
                    disabled={loading}
                    className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-stone-950 font-bold text-sm shadow-md hover:shadow-lg transition flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                  >
                    {loading ? 'Creating Student Account...' : 'Create Account & Receive Roll Number in Mail'}
                    <Send className="w-4 h-4" />
                  </button>

                  {/* Toggle to OTP mode if user prefers */}
                  <div className="flex items-center justify-between pt-2 text-xs">
                    <button
                      type="button"
                      onClick={() => setUseOtpVerification(true)}
                      className="text-stone-500 dark:text-stone-400 hover:text-amber-600 dark:hover:text-amber-400"
                    >
                      Prefer email verification code first? <span className="underline font-semibold">Use OTP</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setMode('login')}
                      className="text-stone-500 dark:text-stone-400 hover:text-amber-600 dark:hover:text-amber-400 font-semibold underline"
                    >
                      Already registered? Sign In
                    </button>
                  </div>
                </form>
              ) : (
                /* Alternative 2-step OTP Verification Flow */
                <div>
                  {otpStep === 'details' ? (
                    <form onSubmit={handleRequestOtp} className="space-y-4">
                      <div className="p-3 rounded-xl bg-stone-100 dark:bg-stone-800 text-xs text-stone-600 dark:text-stone-300 flex items-center justify-between">
                        <span>Verifying with 6-digit OTP code</span>
                        <button
                          type="button"
                          onClick={() => setUseOtpVerification(false)}
                          className="text-amber-600 dark:text-amber-400 font-bold underline"
                        >
                          Switch to Direct Registration
                        </button>
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300 mb-1">
                          1. Student Full Name
                        </label>
                        <input
                          type="text"
                          required
                          value={regName}
                          onChange={e => setRegName(e.target.value)}
                          placeholder="e.g. Diya Sengupta"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300 mb-1">
                          2. Email Address
                        </label>
                        <input
                          type="email"
                          required
                          value={regEmail}
                          onChange={e => setRegEmail(e.target.value)}
                          placeholder="student@example.com"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300 mb-1">
                          3. Choose Password
                        </label>
                        <input
                          type="password"
                          required
                          value={regPassword}
                          onChange={e => setRegPassword(e.target.value)}
                          placeholder="At least 4 characters"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
                        />
                      </div>

                      <button
                        id="reg-send-otp-button"
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-stone-950 font-bold text-sm shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
                      >
                        {loading ? 'Sending OTP...' : 'Send Verification OTP'}
                        <ShieldCheck className="w-4 h-4" />
                      </button>
                    </form>
                  ) : (
                    /* Step 2: Verify OTP */
                    <form onSubmit={handleVerifyOtp} className="space-y-4">
                      <div className="text-center p-4 bg-amber-50 dark:bg-amber-950/30 rounded-xl border border-amber-200 dark:border-amber-900/50">
                        <KeyRound className="w-8 h-8 text-amber-500 mx-auto mb-2" />
                        <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100">
                          Enter 6-Digit OTP Code
                        </h3>
                        <p className="text-xs text-stone-600 dark:text-stone-400 mt-1">
                          We sent a verification code to <strong>{regEmail}</strong>
                        </p>
                        {demoOtpNotice && (
                          <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-amber-200 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200 font-mono font-bold text-sm">
                            <span>Demo OTP: {demoOtpNotice}</span>
                          </div>
                        )}
                      </div>

                      <div>
                        <input
                          id="reg-otp-input"
                          type="text"
                          maxLength={6}
                          required
                          value={otpCode}
                          onChange={e => setOtpCode(e.target.value)}
                          placeholder="e.g. 123456"
                          className="w-full py-3 px-4 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 text-center font-mono text-xl tracking-widest font-bold focus:ring-2 focus:ring-amber-500 focus:outline-none"
                        />
                      </div>

                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => setOtpStep('details')}
                          className="w-1/3 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 text-xs font-bold text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 cursor-pointer"
                        >
                          Back
                        </button>
                        <button
                          id="reg-verify-otp-button"
                          type="submit"
                          disabled={loading}
                          className="w-2/3 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold text-sm shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
                        >
                          {loading ? 'Verifying...' : 'Verify & Send Roll Number'}
                          <CheckCircle2 className="w-4 h-4" />
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Quick 1-Click Demo Accounts & Pre-fill */}
          <div className="mt-8 pt-6 border-t border-stone-200 dark:border-stone-800">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
                Registered Demo Students:
              </span>
              <span className="text-[11px] text-stone-400 dark:text-stone-500">
                Click to prefill 4 credentials
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {SAMPLE_STUDENTS.map(student => (
                <button
                  key={student.id}
                  id={`quick-prefill-${student.id}`}
                  type="button"
                  onClick={() => handleQuickFill(student)}
                  className="p-3 rounded-xl border border-stone-200 dark:border-stone-700/80 bg-stone-50 dark:bg-stone-800/60 hover:bg-amber-500/10 hover:border-amber-500/50 transition text-left cursor-pointer group"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-xl">{student.avatar}</span>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-stone-900 dark:text-stone-100 truncate group-hover:text-amber-500">
                        {student.name}
                      </p>
                      <p className="text-[11px] text-stone-500 dark:text-stone-400">
                        Roll: <span className="font-mono font-bold text-amber-600 dark:text-amber-400">{student.rollNumber}</span>
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

        </div>
      </main>

      {/* Footer Branding & Disclaimer */}
      <footer className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-4 text-center text-xs text-stone-500 dark:text-stone-400">
        <span>StudyAce AI • Adaptive Learning Companion for Indian School Curricula (CBSE / ICSE / State)</span>
      </footer>

      {/* Official Email Notification Modal (Pops up automatically when registered!) */}
      <EmailNotificationModal
        isOpen={Boolean(activeEmailPreview)}
        email={activeEmailPreview}
        onClose={dismissEmailPreview}
        onProceedToLogin={(rollNumber, name, email) => {
          setMode('login');
          if (name) setLoginName(name);
          if (email) setLoginEmail(email);
          setLoginRollNumber(rollNumber);
          setSuccessMessage(`Loaded Roll Number ${rollNumber} into Login credentials.`);
        }}
        onDirectSignIn={() => {
          dismissEmailPreview();
        }}
      />

      {/* Student Mailbox Modal (Accessible anytime to check received roll number emails) */}
      {isMailboxOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            id="student-mailbox-drawer"
            className="bg-white dark:bg-stone-900 w-full max-w-xl rounded-2xl shadow-2xl border border-stone-200 dark:border-stone-800 overflow-hidden text-stone-900 dark:text-stone-100 flex flex-col max-h-[85vh]"
          >
            {/* Mailbox Header */}
            <div className="p-4 bg-stone-100 dark:bg-stone-800 border-b border-stone-200 dark:border-stone-700 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-500 text-stone-950 flex items-center justify-center">
                  <Inbox className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-stone-900 dark:text-stone-100">
                    Student Email Inbox
                  </h3>
                  <p className="text-[11px] text-stone-500 dark:text-stone-400">
                    Official emails with 5-digit Student Roll Numbers
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsMailboxOpen(false)}
                className="px-2.5 py-1 rounded-lg text-xs font-semibold hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-600 dark:text-stone-300"
              >
                Close
              </button>
            </div>

            {/* Email List */}
            <div className="p-4 overflow-y-auto space-y-3 flex-1">
              {studentMails.length === 0 ? (
                <div className="text-center py-10 text-stone-500 dark:text-stone-400 text-xs">
                  <Mail className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  <p>No emails in inbox yet.</p>
                  <p className="text-[11px] mt-1">Create an account to receive your official Roll Number email.</p>
                </div>
              ) : (
                studentMails.map(mail => (
                  <div
                    key={mail.id}
                    className="p-4 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-800/60 space-y-2 hover:border-amber-400/50 transition"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full">
                          Admissions Notice
                        </span>
                        <h4 className="text-xs font-bold text-stone-900 dark:text-stone-100 mt-1">
                          {mail.subject}
                        </h4>
                      </div>
                      <span className="text-[10px] text-stone-400 shrink-0">
                        {new Date(mail.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <div className="text-[11px] text-stone-600 dark:text-stone-300 flex items-center justify-between p-2 rounded-lg bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800">
                      <div>
                        <span className="text-stone-400">Recipient: </span>
                        <strong>{mail.recipientName}</strong> ({mail.recipientEmail})
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-stone-400 text-[10px]">Roll No:</span>
                        <span className="font-mono font-extrabold text-xs text-amber-600 dark:text-amber-400">
                          {mail.rollNumber}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          setActiveEmailPreview(mail);
                          setIsMailboxOpen(false);
                        }}
                        className="px-3 py-1 rounded-lg text-xs font-bold text-amber-600 dark:text-amber-400 hover:bg-amber-500/10 transition"
                      >
                        Read Full Email
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setMode('login');
                          setLoginName(mail.recipientName);
                          setLoginEmail(mail.recipientEmail);
                          setLoginRollNumber(mail.rollNumber);
                          setSuccessMessage(`Credentials for ${mail.recipientName} loaded into login.`);
                          setIsMailboxOpen(false);
                        }}
                        className="px-3 py-1 rounded-lg text-xs font-bold bg-amber-500 text-stone-950 hover:bg-amber-600 transition"
                      >
                        Use to Login
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
