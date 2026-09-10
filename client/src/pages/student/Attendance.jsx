import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import StudentNavbar from '../../components/common/StudentNavbar';
import {
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Calendar,
  BookOpen,
  Filter,
} from 'lucide-react';

const AttendancePage = () => {
  const [loading, setLoading] = useState(true);
  const [studentData, setStudentData] = useState(null);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [summary, setSummary] = useState({ total: 0, present: 0, absent: 0, percentage: 0 });
  const [filterSubject, setFilterSubject] = useState('all');

  useEffect(() => {
    const fetchAttendanceData = async () => {
      try {
        setLoading(true);
        const profileRes = await API.get('/user/profile');
        const student = profileRes.data?.data?.additionalData;
        setStudentData(student);

        if (student?._id) {
          // Fetch summary
          const summaryRes = await API.get(`/attendance/report/summary?student=${student._id}`);
          if (summaryRes.data?.data) {
            setSummary(summaryRes.data.data);
          }

          // Fetch full attendance history
          const recordsRes = await API.get(`/attendance?student=${student._id}&limit=100`);
          setAttendanceRecords(recordsRes.data?.data || []);
        }
      } catch (err) {
        console.error('Error fetching attendance', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAttendanceData();
  }, []);

  // Compute subject-wise breakdown
  const subjectMap = {};
  attendanceRecords.forEach((r) => {
    const subName = r.subject?.name || 'General Academic';
    if (!subjectMap[subName]) {
      subjectMap[subName] = { name: subName, code: r.subject?.code || 'N/A', total: 0, present: 0 };
    }
    subjectMap[subName].total += 1;
    if (r.status === 'present') subjectMap[subName].present += 1;
  });

  const subjectBreakdown = Object.values(subjectMap).map((s) => ({
    ...s,
    percentage: s.total > 0 ? Math.round((s.present / s.total) * 100) : 0,
  }));

  const filteredRecords = filterSubject === 'all'
    ? attendanceRecords
    : attendanceRecords.filter((r) => r.subject?.name === filterSubject);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100">
      <StudentNavbar studentData={studentData} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
            <Clock className="w-6 h-6 text-indigo-600" />
            Attendance & Eligibility Dashboard
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Autonomous examination eligibility requires minimum 75% attendance across all 6 semesters.
          </p>
        </div>

        {/* 4 Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700 shadow-xs">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Aggregate Attendance</span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-black text-slate-900 dark:text-white">
                {loading ? '...' : `${summary.percentage}%`}
              </span>
              {summary.percentage >= 75 ? (
                <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold">Eligible</span>
              ) : (
                <span className="text-xs text-rose-600 dark:text-rose-400 font-bold">Shortage</span>
              )}
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-700 h-2 rounded-full mt-3 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ${summary.percentage >= 75 ? 'bg-emerald-500' : 'bg-rose-500'}`}
                style={{ width: `${Math.min(100, summary.percentage)}%` }}
              ></div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700 shadow-xs">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Lectures Held</span>
            <p className="text-3xl font-black text-slate-900 dark:text-white mt-2">
              {loading ? '...' : summary.total}
            </p>
            <p className="text-xs text-slate-500 mt-2">Working days logged</p>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700 shadow-xs">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Lectures Attended</span>
            <p className="text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-2">
              {loading ? '...' : summary.present}
            </p>
            <p className="text-xs text-slate-500 mt-2">Present in class</p>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700 shadow-xs">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Lectures Missed</span>
            <p className="text-3xl font-black text-rose-600 dark:text-rose-400 mt-2">
              {loading ? '...' : summary.absent}
            </p>
            <p className="text-xs text-slate-500 mt-2">Leaves or unexcused</p>
          </div>
        </div>

        {/* Subject-Wise Attendance Breakdown */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 shadow-xs">
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-600" />
            Subject-Wise Attendance Breakdown
          </h3>

          {subjectBreakdown.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 dark:bg-slate-750 text-slate-600 dark:text-slate-400 uppercase font-semibold">
                  <tr>
                    <th className="px-4 py-3">Subject Name</th>
                    <th className="px-4 py-3">Code</th>
                    <th className="px-4 py-3">Attended / Total</th>
                    <th className="px-4 py-3">Percentage</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                  {subjectBreakdown.map((sub, i) => (
                    <tr key={i} className="hover:bg-slate-50/60 dark:hover:bg-slate-750/50">
                      <td className="px-4 py-3.5 font-bold text-slate-800 dark:text-slate-200">{sub.name}</td>
                      <td className="px-4 py-3.5 font-mono text-indigo-600 dark:text-indigo-400">{sub.code}</td>
                      <td className="px-4 py-3.5 font-semibold">{sub.present} / {sub.total}</td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2">
                          <span className="font-bold">{sub.percentage}%</span>
                          <div className="w-16 bg-slate-100 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${sub.percentage >= 75 ? 'bg-emerald-500' : 'bg-rose-500'}`}
                              style={{ width: `${sub.percentage}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        {sub.percentage >= 75 ? (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 font-semibold text-[10px]">
                            Eligible
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300 font-semibold text-[10px]">
                            Low
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-xs text-slate-500 py-4 text-center">No subject attendance records found.</p>
          )}
        </div>

        {/* Date-Wise Detailed Attendance Log */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 shadow-xs">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-indigo-600" />
              Day-by-Day Attendance Log
            </h3>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-400" />
              <select
                value={filterSubject}
                onChange={(e) => setFilterSubject(e.target.value)}
                className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-750 text-slate-700 dark:text-slate-200"
              >
                <option value="all">All Subjects</option>
                {subjectBreakdown.map((s, i) => (
                  <option key={i} value={s.name}>{s.name}</option>
                ))}
              </select>
            </div>
          </div>

          {filteredRecords.length > 0 ? (
            <div className="overflow-x-auto max-h-96">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 dark:bg-slate-750 text-slate-600 dark:text-slate-400 uppercase font-semibold sticky top-0">
                  <tr>
                    <th className="px-4 py-2.5">Date</th>
                    <th className="px-4 py-2.5">Subject</th>
                    <th className="px-4 py-2.5">Faculty</th>
                    <th className="px-4 py-2.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                  {filteredRecords.map((rec, i) => (
                    <tr key={i} className="hover:bg-slate-50/60 dark:hover:bg-slate-750/50">
                      <td className="px-4 py-2.5 font-medium">
                        {new Date(rec.date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="px-4 py-2.5 font-semibold text-slate-800 dark:text-slate-200">
                        {rec.subject?.name || 'Class Lecture'}
                      </td>
                      <td className="px-4 py-2.5 text-slate-500 dark:text-slate-400">
                        {rec.faculty?.name || 'Assigned Faculty'}
                      </td>
                      <td className="px-4 py-2.5">
                        {rec.status === 'present' ? (
                          <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Present
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-rose-600 dark:text-rose-400 font-bold">
                            <XCircle className="w-3.5 h-3.5" /> Absent
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-xs text-slate-500 py-6 text-center">No attendance history records.</p>
          )}
        </div>
      </main>
    </div>
  );
};

export default AttendancePage;
