import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Sidebar } from './components/Sidebar';
import { TopBar } from './components/TopBar';
import { LoginPage } from './components/LoginPage';
import { DashboardView } from './components/DashboardView';
import { TutorView } from './components/TutorView';
import { PlannerView } from './components/PlannerView';
import { RescueView } from './components/RescueView';
import { QuizView } from './components/QuizView';
import { WeakTopicsView } from './components/WeakTopicsView';
import { RevisionView } from './components/RevisionView';
import { FocusRoomView } from './components/FocusRoomView';
import { StreakCalendarView } from './components/StreakCalendarView';
import { AlarmsView } from './components/AlarmsView';
import { TechNewsView } from './components/TechNewsView';
import { ComputerCoursesView } from './components/ComputerCoursesView';
import { ProfileModal } from './components/ProfileModal';
import { BadgeModal } from './components/BadgeModal';
import { AlarmTriggerDialog } from './components/AlarmTriggerDialog';
import { Footer } from './components/Footer';

function MainContent() {
  const { isAuthenticated, activeTab } = useApp();
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isBadgeModalOpen, setIsBadgeModalOpen] = useState(false);

  // If not logged in, show student login & OTP registration screen
  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return (
    <div className="min-h-screen bg-stone-100 dark:bg-stone-950 text-stone-900 dark:text-stone-100 flex font-sans selection:bg-amber-200 selection:text-stone-900 transition-colors duration-200">
      {/* Side Menu Bar */}
      <Sidebar
        onOpenProfile={() => setIsProfileModalOpen(true)}
        onOpenBadges={() => setIsBadgeModalOpen(true)}
      />

      {/* Main Workspace Column */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
        {/* Top Utility Bar */}
        <TopBar
          onOpenProfile={() => setIsProfileModalOpen(true)}
          onOpenBadges={() => setIsBadgeModalOpen(true)}
        />

        {/* Dynamic View Panels */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {activeTab === 'dashboard' && <DashboardView />}
          {activeTab === 'computerCourses' && <ComputerCoursesView />}
          {activeTab === 'tutor' && <TutorView />}
          {activeTab === 'techNews' && <TechNewsView />}
          {activeTab === 'planner' && <PlannerView />}
          {activeTab === 'rescue' && <RescueView />}
          {activeTab === 'quiz' && <QuizView />}
          {activeTab === 'weakTopics' && <WeakTopicsView />}
          {activeTab === 'revision' && <RevisionView />}
          {activeTab === 'focus' && <FocusRoomView />}
          {(activeTab === 'calendar' || (activeTab as string) === 'streak') && <StreakCalendarView />}
          {activeTab === 'alarms' && <AlarmsView />}
        </main>

        {/* Professional Modern Footer */}
        <Footer />
      </div>

      {/* Global Modals & Notifications */}
      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />

      <BadgeModal
        isOpen={isBadgeModalOpen}
        onClose={() => setIsBadgeModalOpen(false)}
      />

      <AlarmTriggerDialog />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}
