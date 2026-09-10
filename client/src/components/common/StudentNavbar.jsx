import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import {
  LayoutDashboard,
  Clock,
  Calendar,
  FileText,
  BookOpen,
  Award,
  CreditCard,
  Briefcase,
  Sparkles,
  User,
  LogOut,
  Bell,
  Menu,
  X,
  MessageSquare,
} from 'lucide-react';

const StudentNavbar = ({ studentData }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const navItems = [
    { label: 'Dashboard', path: '/student', icon: LayoutDashboard },
    { label: 'Attendance', path: '/student/attendance', icon: Clock },
    { label: 'Timetable', path: '/student/timetable', icon: Calendar },
    { label: 'Exams', path: '/student/examinations', icon: FileText },
    { label: 'Results', path: '/student/results', icon: Award },
    { label: 'Materials', path: '/student/materials', icon: BookOpen },
    { label: 'Fees', path: '/student/fees', icon: CreditCard },
    { label: 'Placements', path: '/student/placements', icon: Briefcase },
    { label: 'AI Assistant', path: '/student/ai-assistant', icon: Sparkles, highlight: true },
    { label: 'Profile', path: '/student/profile', icon: User },
    { label: 'Queries', path: '/student/queries', icon: MessageSquare },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-40 shadow-xs">
      {/* Top institution bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between border-b border-slate-100 dark:border-slate-750">
        <Link to="/student" className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-blue-600 text-white font-black text-base flex items-center justify-center shadow-xs">
            PBS
          </div>
          <div>
            <span className="text-sm sm:text-base font-bold text-slate-900 dark:text-white block leading-tight">
              PB Siddhartha College of Arts & Science
            </span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
              Autonomous • 6-Semester Degree Portal • Vijayawada
            </span>
          </div>
        </Link>

        {/* User profile info & logout */}
        <div className="flex items-center gap-3">
          {studentData && (
            <div className="hidden md:flex flex-col text-right">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                {user?.name}
              </span>
              <span className="text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold">
                {studentData.studentId} • Sem {studentData.semester || 1}/6
              </span>
            </div>
          )}
          <Link
            to="/student/notifications"
            className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
          </Link>
          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition border border-rose-200/60 dark:border-rose-900/60"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Navigation tabs */}
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 hidden md:flex items-center gap-1 overflow-x-auto py-1 scrollbar-none">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg transition whitespace-nowrap ${
                isActive
                  ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300'
                  : item.highlight
                  ? 'text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50/60 dark:hover:bg-indigo-900/20'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${item.highlight ? 'text-indigo-600 animate-pulse' : ''}`} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Mobile nav dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 dark:border-slate-700 px-4 py-3 space-y-1 bg-white dark:bg-slate-800">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-lg transition ${
                  isActive
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
};

export default StudentNavbar;
