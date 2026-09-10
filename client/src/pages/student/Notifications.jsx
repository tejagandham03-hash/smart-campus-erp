import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import StudentNavbar from '../../components/common/StudentNavbar';
import {
  Bell,
  Calendar,
  Filter,
  FileText,
  CreditCard,
  Briefcase,
  Megaphone,
} from 'lucide-react';

const NotificationsPage = () => {
  const [loading, setLoading] = useState(true);
  const [studentData, setStudentData] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [activeFilter, setActiveFilter] = useState('all');

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoading(true);
        const profileRes = await API.get('/user/profile');
        setStudentData(profileRes.data?.data?.additionalData);

        const notifRes = await API.get('/notifications');
        setNotifications(notifRes.data?.data || []);
      } catch (err) {
        console.error('Failed to load notifications', err);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  const filteredNotifs = activeFilter === 'all'
    ? notifications
    : notifications.filter((n) => n.type === activeFilter);

  const getCategoryIcon = (type) => {
    switch (type) {
      case 'examination':
        return <FileText className="w-4 h-4 text-indigo-600" />;
      case 'fees':
        return <CreditCard className="w-4 h-4 text-emerald-600" />;
      case 'placement':
        return <Briefcase className="w-4 h-4 text-blue-600" />;
      default:
        return <Megaphone className="w-4 h-4 text-purple-600" />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100">
      <StudentNavbar studentData={studentData} />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
            <Bell className="w-6 h-6 text-indigo-600" />
            PB Siddhartha College Circulars & Notifications
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Official announcements from the Principal, Examination Cell, Placement Officer, and Department HODs.
          </p>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-slate-200 dark:border-slate-700">
          {[
            { id: 'all', label: 'All Circulars' },
            { id: 'examination', label: 'Examinations' },
            { id: 'fees', label: 'Fees & Accounts' },
            { id: 'placement', label: 'Placement Drives' },
            { id: 'general', label: 'Campus & Cultural' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveFilter(cat.id)}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition whitespace-nowrap ${
                activeFilter === cat.id
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Notifications list */}
        {loading ? (
          <p className="text-xs text-slate-500 py-8 text-center">Loading official circulars...</p>
        ) : filteredNotifs.length > 0 ? (
          <div className="space-y-4">
            {filteredNotifs.map((n) => (
              <div
                key={n._id}
                className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700 shadow-xs"
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 rounded-lg bg-slate-50 dark:bg-slate-750 border border-slate-100 dark:border-slate-700">
                      {getCategoryIcon(n.type)}
                    </span>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      {n.title}
                    </h4>
                  </div>
                  <span className="text-[10px] uppercase font-bold text-indigo-600 dark:text-indigo-400 px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-900/60">
                    {n.type}
                  </span>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-3">
                  {n.message}
                </p>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-700/80 flex items-center justify-between text-[11px] text-slate-400">
                  <span>Issued by: PB Siddhartha Administration</span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(n.createdAt || Date.now()).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-800 rounded-xl p-12 text-center border border-slate-200 dark:border-slate-700">
            <Bell className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <h4 className="text-sm font-bold text-slate-700 dark:text-slate-200">No circulars in this category</h4>
          </div>
        )}
      </main>
    </div>
  );
};

export default NotificationsPage;