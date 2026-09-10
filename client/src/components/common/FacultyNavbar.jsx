import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import {
  LayoutDashboard,
  Users,
  Clock,
  FileCheck,
  LogOut,
  Bell,
  Menu,
  X,
  BookOpen,
  GraduationCap,
  Settings2,
} from 'lucide-react';

const FacultyNavbar = ({ facultyData }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = [
    { label: 'Faculty Dashboard', path: '/faculty', icon: LayoutDashboard },
    { label: 'Students Directory', path: '/faculty/students', icon: Users, highlight: true },
    { label: 'Mark Attendance', path: '/faculty/attendance', icon: Clock },
    { label: 'Examinations & Marks', path: '/faculty/examinations', icon: FileCheck },
    { label: 'Operations', path: '/faculty/operations', icon: Settings2 },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-40 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between border-b border-slate-100 dark:border-slate-750">
        <Link to="/faculty" className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white font-black text-base flex items-center justify-center shadow-xs">
            PBS
          </div>
          <div>
            <span className="text-sm sm:text-base font-bold text-slate-900 dark:text-white block leading-tight">
              PB Siddhartha College of Arts & Science
            </span>
            <span className="text-[11px] text-purple-600 dark:text-purple-400 font-semibold block">
              Autonomous • Faculty & Academic Management Portal
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-3">
          <div className="hidden md:flex flex-col text-right">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
              {user?.name || '-'}
            </span>
            <span className="text-[11px] text-slate-500">
              {[facultyData?.employeeId, facultyData?.designation].filter(Boolean).join(' • ') || '-'}
            </span>
          </div>

          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition border border-rose-200/60 dark:border-rose-900/60"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Sign Out</span>
          </button>

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Desktop Navigation Tabs */}
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 hidden md:flex items-center gap-1 overflow-x-auto py-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition whitespace-nowrap ${
                isActive
                  ? 'bg-purple-50 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300'
                  : item.highlight
                  ? 'text-purple-600 dark:text-purple-400 hover:bg-purple-50/60 dark:hover:bg-purple-900/20'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-slate-200 dark:border-slate-700 px-4 py-3 space-y-1 bg-white dark:bg-slate-800">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-lg transition ${
                  isActive
                    ? 'bg-purple-600 text-white'
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

export default FacultyNavbar;
