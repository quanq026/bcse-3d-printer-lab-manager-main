import React, { Suspense, lazy, useEffect, useState } from 'react';
import { Role } from './types';
import { Sidebar } from './components/Sidebar';
import { ThemeToggle } from './components/ThemeToggle';
import { StarRain } from './components/StarRain';
import { LandingPage } from './pages/LandingPage';
import { api } from './lib/api';
import { ArrowLeft, Loader2, Menu } from 'lucide-react';

const StudentDashboard = lazy(() => import('./pages/StudentDashboard').then((module) => ({ default: module.StudentDashboard })));
const BookingWizard = lazy(() => import('./pages/BookingWizard').then((module) => ({ default: module.BookingWizard })));
const ModeratorQueue = lazy(() => import('./pages/ModeratorQueue').then((module) => ({ default: module.ModeratorQueue })));
const AdminInventory = lazy(() => import('./pages/AdminInventory').then((module) => ({ default: module.AdminInventory })));
const AdminPricing = lazy(() => import('./pages/AdminPricing').then((module) => ({ default: module.AdminPricing })));
const AdminUsers = lazy(() => import('./pages/AdminUsers').then((module) => ({ default: module.AdminUsers })));
const AdminPrinters = lazy(() => import('./pages/AdminPrinters').then((module) => ({ default: module.AdminPrinters })));
const ChatPage = lazy(() => import('./pages/ChatPage').then((module) => ({ default: module.ChatPage })));
const BackupPage = lazy(() => import('./pages/BackupPage').then((module) => ({ default: module.BackupPage })));
const JobDetail = lazy(() => import('./pages/JobDetail').then((module) => ({ default: module.JobDetail })));
const AdminSettings = lazy(() => import('./pages/AdminSettings').then((module) => ({ default: module.AdminSettings })));
const PricingPage = lazy(() => import('./pages/PricingPage').then((module) => ({ default: module.PricingPage })));
const QueuePage = lazy(() => import('./pages/QueuePage').then((module) => ({ default: module.QueuePage })));

function PageLoader() {
  return (
    <div className="flex h-full min-h-[240px] items-center justify-center text-slate-400">
      <Loader2 size={22} className="mr-2 animate-spin" />
      <span className="text-sm">Loading...</span>
    </div>
  );
}

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [role, setRole] = useState<Role>(Role.STUDENT);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [activePage, setActivePage] = useState('dashboard');
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('lab_token');
    if (!token) return;

    api.me().then((user) => {
      setCurrentUser(user);
      setRole(user.role as Role);
      setIsLoggedIn(true);
    }).catch(() => {
      localStorage.removeItem('lab_token');
    });
  }, []);

  const handleLogin = (user: any) => {
    setCurrentUser(user);
    setRole(user.role as Role);
    setIsLoggedIn(true);
    setActivePage('dashboard');
    setMobileSidebarOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('lab_token');
    setIsLoggedIn(false);
    setCurrentUser(null);
    setSelectedJob(null);
    setActivePage('dashboard');
    setMobileSidebarOpen(false);
  };

  const handlePageChange = (page: string) => {
    setActivePage(page);
    setMobileSidebarOpen(false);
  };

  const navigateToJob = async (id: string) => {
    try {
      const job = await api.getJob(id);
      setSelectedJob(job);
      setActivePage('job-detail');
    } catch {
      setSelectedJob(null);
      setActivePage('job-detail');
    } finally {
      setMobileSidebarOpen(false);
    }
  };

  if (!isLoggedIn) {
    return <LandingPage onLogin={handleLogin} />;
  }

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard':
        return <StudentDashboard activePage="dashboard" onNewBooking={() => handlePageChange('booking')} onSelectJob={navigateToJob} onPageChange={handlePageChange} role={role} currentUser={currentUser} />;
      case 'booking':
        return <BookingWizard onComplete={() => handlePageChange('dashboard')} onCancel={() => handlePageChange('dashboard')} currentUser={currentUser} />;
      case 'history':
        return <StudentDashboard activePage="history" onNewBooking={() => handlePageChange('booking')} onSelectJob={navigateToJob} onPageChange={handlePageChange} role={role} currentUser={currentUser} />;
      case 'queue':
        return <ModeratorQueue onSelectJob={navigateToJob} />;
      case 'inventory':
        return <AdminInventory />;
      case 'analytics':
        return <AdminPricing />;
      case 'users':
        return <AdminUsers />;
      case 'printers':
        return <AdminPrinters />;
      case 'chat':
        return <ChatPage currentUser={currentUser} />;
      case 'backup':
        return <BackupPage />;
      case 'settings':
        return <AdminSettings />;
      case 'pricing':
        return <PricingPage />;
      case 'queue-status':
        return <QueuePage currentUser={currentUser} />;
      case 'job-detail':
        return selectedJob ? (
          <JobDetail job={selectedJob} onBack={() => handlePageChange('dashboard')} />
        ) : (
          <div className="flex min-h-[240px] items-center justify-center text-sm text-slate-400">
            Unable to load this job.
          </div>
        );
      default:
        return (
          <div className="flex h-full items-center justify-center text-slate-400">
            Page is under construction...
          </div>
        );
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900 transition-colors duration-200 dark:bg-slate-950 dark:text-slate-100">
      <StarRain />
      <div className="relative z-10 flex w-full flex-1">
        <Sidebar
          role={role}
          activePage={activePage}
          onPageChange={handlePageChange}
          onLogout={handleLogout}
          currentUser={currentUser}
          isMobileOpen={mobileSidebarOpen}
          onCloseMobile={() => setMobileSidebarOpen(false)}
        />

        <main className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-slate-200 bg-white px-4 transition-colors duration-200 dark:border-slate-800 dark:bg-slate-900 sm:h-16 sm:px-6 lg:px-8">
            <div className="flex min-w-0 items-center gap-2 sm:gap-4">
              <button
                onClick={() => setMobileSidebarOpen(true)}
                className="rounded-xl bg-slate-100 p-2 transition-colors hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 lg:hidden"
                aria-label="Open navigation"
              >
                <Menu size={18} />
              </button>
              {activePage !== 'dashboard' && (
                <button
                  onClick={() => handlePageChange('dashboard')}
                  className="rounded-xl bg-slate-100 p-2 text-slate-500 transition-all hover:bg-blue-50 hover:text-blue-600 dark:bg-slate-800 dark:hover:bg-blue-900/30"
                  title="Back to dashboard"
                  aria-label="Back to dashboard"
                >
                  <ArrowLeft size={18} />
                </button>
              )}
              <h2 className="truncate text-sm font-semibold capitalize sm:text-lg">{activePage.replace('-', ' ')}</h2>
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
              {currentUser && (
                <span className="hidden text-xs text-slate-500 dark:text-slate-400 xl:block">
                  {currentUser.fullName} · <span className="font-bold text-blue-600">{currentUser.role}</span>
                </span>
              )}
              <div className="hidden items-center gap-2 rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-400 sm:flex">
                <span className="h-2 w-2 rounded-full bg-green-500"></span>
                Lab Status: Online
              </div>
              <ThemeToggle />
            </div>
          </header>

          <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
            <Suspense fallback={<PageLoader />}>
              {renderPage()}
            </Suspense>
          </div>
        </main>
      </div>
    </div>
  );
}
