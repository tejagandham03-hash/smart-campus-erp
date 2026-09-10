import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import {
  Bell,
  BookOpen,
  Building2,
  CalendarDays,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Menu,
  School,
  Users,
  WalletCards,
  X,
} from 'lucide-react';

const navItems = [
  ['Dashboard', '/admin', LayoutDashboard],
  ['Students', '/admin/students', GraduationCap],
  ['Faculty', '/admin/faculty', Users],
  ['Departments', '/admin/departments', Building2],
  ['Courses', '/admin/courses', School],
  ['Subjects', '/admin/subjects', BookOpen],
  ['Timetable', '/admin/timetable', CalendarDays],
  ['Fees', '/admin/fees', WalletCards],
  ['Notifications', '/admin/notifications', Bell],
  ['Placements', '/admin/placements', Users],
];

export default function AdminNavbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const signOut = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Link to="/admin" className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-500 text-sm font-black text-slate-950">PBS</span>
          <span>
            <span className="block text-sm font-bold text-slate-900 dark:text-white">Campus Administration</span>
            <span className="block text-[11px] font-semibold text-cyan-700 dark:text-cyan-300">{user?.name || 'Administrator'}</span>
          </span>
        </Link>
        <div className="flex items-center gap-2">
          <button onClick={signOut} className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200 px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:border-rose-900 dark:text-rose-400 dark:hover:bg-rose-950/30">
            <LogOut className="h-3.5 w-3.5" /> <span className="hidden sm:inline">Sign Out</span>
          </button>
          <button onClick={() => setMobileOpen(!mobileOpen)} className="rounded-lg p-1.5 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 md:hidden" aria-label="Toggle admin navigation">
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>
      <nav className="mx-auto hidden max-w-7xl items-center gap-1 overflow-x-auto px-4 pb-2 sm:px-6 lg:px-8 md:flex">
        {navItems.map(([label, path, Icon]) => (
          <Link key={path} to={path} className={`inline-flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold ${location.pathname === path ? 'bg-cyan-100 text-cyan-800 dark:bg-cyan-950/60 dark:text-cyan-300' : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'}`}>
            <Icon className="h-3.5 w-3.5" />{label}
          </Link>
        ))}
      </nav>
      {mobileOpen && <nav className="grid gap-1 border-t border-slate-200 px-4 py-3 dark:border-slate-800 md:hidden">
        {navItems.map(([label, path, Icon]) => (
          <Link key={path} to={path} onClick={() => setMobileOpen(false)} className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold ${location.pathname === path ? 'bg-cyan-600 text-white' : 'text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800'}`}>
            <Icon className="h-4 w-4" />{label}
          </Link>
        ))}
      </nav>}
    </header>
  );
}
