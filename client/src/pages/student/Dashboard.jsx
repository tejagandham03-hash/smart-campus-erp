import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import API from '../../services/api';
import StudentNavbar from '../../components/common/StudentNavbar';
import {
  Clock,
  Calendar,
  Award,
  CreditCard,
  Briefcase,
  Sparkles,
  FileText,
  Bell,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  BookOpen,
  GraduationCap,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [studentData, setStudentData] = useState(null);
  
  // Real dynamic metrics
  const [attendanceStats, setAttendanceStats] = useState({ percentage: 0, total: 0, present: 0, absent: 0 });
  const [feeStats, setFeeStats] = useState({ totalAmount: 0, paidAmount: 0, dueAmount: 0, status: 'Loading' });
  const [cgpaStats, setCgpaStats] = useState({ cgpa: '0.0', totalExams: 0, distinction: false });
  
  // Real dynamic hub lists
  const [timetable, setTimetable] = useState([]);
  const [examinations, setExaminations] = useState([]);
  const [results, setResults] = useState([]);
  const [fees, setFees] = useState([]);
  const [placements, setPlacements] = useState([]);
  const [notifications, setNotifications] = useState([]);

  // Grade point mapping for autonomous CBCS
  const gradePoints = {
    'O': 10,
    'A+': 9,
    'A': 8,
    'B+': 7,
    'B': 6,
    'C': 5,
    'F': 0,
  };

  useEffect(() => {
    let active = true;
    const fetchAllDynamicData = async () => {
      setLoading(true);
      const profileRequest = await Promise.allSettled([API.get('/user/profile')]);
      const student = profileRequest[0].status === 'fulfilled'
        ? profileRequest[0].value.data?.data?.additionalData
        : user?.additionalData || null;
      if (!active) return;
      setStudentData(student);
      const courseId = student?.course?._id;

      const requests = await Promise.allSettled([
        API.get('/attendance/report/summary'),
        API.get('/fees'),
        API.get('/results?limit=500'),
        API.get(courseId ? `/timetable?course=${courseId}` : '/timetable'),
        API.get(courseId ? `/examinations?course=${courseId}&limit=500` : '/examinations?limit=500'),
        API.get('/placements'),
        API.get('/notifications?limit=4'),
      ]);
      const data = requests.map((request) => request.status === 'fulfilled' ? request.value.data?.data : null);
      if (data[0]) setAttendanceStats({
        percentage: Number(data[0].percentage || 0),
        total: Number(data[0].total || 0),
        present: Number(data[0].present || 0),
        absent: Number(data[0].absent || 0),
      });
      const feeList = data[1] || [];
      setFees(feeList);
      if (feeList.length) {
        const totalAmount = feeList.reduce((sum, fee) => sum + Number(fee.amount || 0), 0);
        const paidAmount = feeList.reduce((sum, fee) => sum + Number(fee.paidAmount || 0), 0);
        setFeeStats({ totalAmount, paidAmount, dueAmount: totalAmount - paidAmount, status: totalAmount === paidAmount ? 'Paid' : paidAmount ? 'Partially Paid' : 'Pending' });
      } else {
        setFeeStats({ totalAmount: 0, paidAmount: 0, dueAmount: 0, status: 'No fees' });
      }
      const resultList = data[2] || [];
      setResults(resultList);
      if (resultList.length) {
        const total = resultList.reduce((sum, result) => {
          const point = gradePoints[result.grade] ?? Math.min(10, Math.round(((result.marks || 0) / (result.maxMarks || 100)) * 10));
          return sum + point * (result.subject?.credits || 1);
        }, 0);
        const credits = resultList.reduce((sum, result) => sum + (result.subject?.credits || 1), 0);
        const cgpa = (total / credits).toFixed(2);
        setCgpaStats({ cgpa, totalExams: resultList.length, distinction: Number(cgpa) >= 8 });
      }
      setTimetable(data[3] || []);
      setExaminations(data[4] || []);
      setPlacements(data[5] || []);
      setNotifications(data[6] || []);
      setLoading(false);
    };

    const refresh = () => fetchAllDynamicData().catch((error) => {
      console.error('Error loading dashboard data', error);
      setLoading(false);
    });
    refresh();
    window.addEventListener('focus', refresh);
    return () => {
      active = false;
      window.removeEventListener('focus', refresh);
    };
  }, []);

  const currentDayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][new Date().getDay()];
  const todayClasses = timetable.filter((t) => t.day === currentDayName);
  const displayClasses = todayClasses.length > 0 ? todayClasses : timetable.slice(0, 3);

  const currentSemester = studentData?.semester || 1;
  const semesterProgressPct = Math.round((currentSemester / 6) * 100);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100">
      <StudentNavbar studentData={studentData} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Welcome Header */}
        <div className="bg-gradient-to-r from-indigo-700 via-indigo-600 to-blue-700 rounded-2xl p-6 sm:p-8 text-white shadow-md relative overflow-hidden">
          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-white/20 backdrop-blur-xs text-xs font-semibold uppercase tracking-wider mb-3">
              <GraduationCap className="w-4 h-4" />
              {studentData?.course?.name || 'Undergraduate Degree Program'} • 6 Semesters
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-2">
              Welcome back, {user?.name}!
            </h2>
            <p className="text-indigo-100 text-xs sm:text-sm leading-relaxed">
              Roll No: <span className="font-semibold">{studentData?.studentId || 'N/A'}</span> • 
              Department of <span className="font-semibold">{studentData?.department?.name || 'Computer Science & Applications'}</span> • 
              Section <span className="font-semibold">{studentData?.section || 'A'}</span>
            </p>
          </div>
        </div>

        {/* 4 Dynamic Metric Cards (NO HARDCODED DUMMIES) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Dynamic Attendance */}
          <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-medium mb-2">
                <span>Dynamic Attendance</span>
                <Clock className="w-4 h-4 text-indigo-500" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-slate-900 dark:text-white">
                  {loading ? '...' : `${attendanceStats.percentage}%`}
                </span>
                {attendanceStats.percentage >= 75 ? (
                  <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Eligible
                  </span>
                ) : (
                  <span className="text-xs text-amber-600 dark:text-amber-400 font-bold flex items-center gap-0.5">
                    <AlertTriangle className="w-3.5 h-3.5" /> Low (&lt;75%)
                  </span>
                )}
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700 text-xs text-slate-500 dark:text-slate-400 flex justify-between">
              <span>Attended: {attendanceStats.present || 0} / {attendanceStats.total || 0}</span>
              <Link to="/student/attendance" className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline">
                View Log →
              </Link>
            </div>
          </div>

          {/* Dynamic 6-Semester Progress */}
          <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-medium mb-2">
                <span>Current Progression</span>
                <Award className="w-4 h-4 text-blue-500" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-indigo-600 dark:text-indigo-400">
                  {currentSemester} / 6
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Semesters</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-700 h-2 rounded-full mt-3 overflow-hidden">
                <div
                  className="bg-indigo-600 h-full rounded-full transition-all duration-700"
                  style={{ width: `${semesterProgressPct}%` }}
                ></div>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700 text-xs text-slate-500 dark:text-slate-400 flex justify-between">
              <span>Year {studentData?.year || Math.ceil(currentSemester / 2)} of 3</span>
              <span className="text-slate-600 dark:text-slate-300 font-medium">{semesterProgressPct}% Complete</span>
            </div>
          </div>

          {/* Dynamic Real Fees Status */}
          <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-medium mb-2">
                <span>Fee Account</span>
                <CreditCard className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="flex items-baseline gap-2">
                <span
                  className={`text-2xl sm:text-3xl font-black ${
                    feeStats.status === 'Paid'
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : feeStats.status === 'Partially Paid'
                      ? 'text-amber-600 dark:text-amber-400'
                      : 'text-rose-600 dark:text-rose-400'
                  }`}
                >
                  {loading ? '...' : feeStats.status}
                </span>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700 text-xs text-slate-500 dark:text-slate-400 flex justify-between">
              <span>Due: ₹{feeStats.dueAmount.toLocaleString()}</span>
              <Link to="/student/fees" className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline">
                Pay / Receipts →
              </Link>
            </div>
          </div>

          {/* Dynamic CGPA calculated from real results */}
          <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-medium mb-2">
                <span>Calculated CGPA</span>
                <TrendingUp className="w-4 h-4 text-purple-500" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-slate-900 dark:text-white">
                  {loading ? '...' : cgpaStats.cgpa}
                </span>
                <span className="text-xs text-purple-600 dark:text-purple-400 font-semibold">
                  / 10.0 Scale
                </span>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700 text-xs text-slate-500 dark:text-slate-400 flex justify-between">
              <span>{cgpaStats.totalExams} Assessments</span>
              <Link to="/student/results" className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline">
                Grade Sheet →
              </Link>
            </div>
          </div>
        </div>

        {/* Dynamic Campus Services & Academic Hub (LIVE DATA) */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Campus Services & Academic Hub
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Live interactive academic modules synchronized with your 6-semester student records
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Live Timetable Hub */}
            <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-indigo-600" />
                    Today's Classes ({currentDayName})
                  </span>
                  <Link to="/student/timetable" className="text-xs font-semibold text-indigo-600 hover:underline">
                    Full Week
                  </Link>
                </div>

                {displayClasses.length > 0 ? (
                  <div className="space-y-2.5">
                    {displayClasses.slice(0, 3).map((item, idx) => (
                      <div key={idx} className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-750 text-xs border border-slate-100 dark:border-slate-700">
                        <div className="flex justify-between items-center font-bold text-slate-800 dark:text-slate-200">
                          <span>{item.subject?.name || 'Class Subject'}</span>
                          <span className="text-indigo-600 dark:text-indigo-400 font-mono text-[11px]">{item.startTime} - {item.endTime}</span>
                        </div>
                        <div className="flex justify-between text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                          <span>{item.room || 'Siddhartha Block'}</span>
                          <span>{item.faculty?.name || 'Faculty'}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 p-4 text-center">No scheduled lectures for today.</p>
                )}
              </div>
              <Link to="/student/timetable" className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700 text-xs text-indigo-600 dark:text-indigo-400 font-semibold flex items-center justify-between">
                <span>View Complete Timetable</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Live Upcoming Examinations Hub */}
            <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <FileText className="w-4 h-4 text-indigo-600" />
                    Autonomous Examinations
                  </span>
                  <Link to="/student/examinations" className="text-xs font-semibold text-indigo-600 hover:underline">
                    All Schedules
                  </Link>
                </div>

                {examinations.length > 0 ? (
                  <div className="space-y-2.5">
                    {examinations.slice(0, 3).map((exam, idx) => (
                      <div key={idx} className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-750 text-xs border border-slate-100 dark:border-slate-700">
                        <div className="font-bold text-slate-800 dark:text-slate-200 truncate">
                          {exam.name}
                        </div>
                        <div className="flex justify-between text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                          <span>{new Date(exam.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} • {exam.startTime}</span>
                          <span className="text-indigo-600 dark:text-indigo-400 font-semibold">{exam.room || 'Exam Hall'}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 p-4 text-center">No active examination schedules.</p>
                )}
              </div>
              <Link to="/student/examinations" className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700 text-xs text-indigo-600 dark:text-indigo-400 font-semibold flex items-center justify-between">
                <span>Download Hall Tickets & Schedule</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Live Placement Drives Hub */}
            <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-indigo-600" />
                    Campus Placements
                  </span>
                  <Link to="/student/placements" className="text-xs font-semibold text-indigo-600 hover:underline">
                    View All
                  </Link>
                </div>

                {placements.length > 0 ? (
                  <div className="space-y-2.5">
                    {placements.slice(0, 3).map((p, idx) => (
                      <div key={idx} className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-750 text-xs border border-slate-100 dark:border-slate-700">
                        <div className="flex justify-between font-bold text-slate-800 dark:text-slate-200">
                          <span className="truncate">{p.companyName}</span>
                          <span className="text-emerald-600 dark:text-emerald-400 font-semibold">₹{(p.salary / 100000).toFixed(1)} LPA</span>
                        </div>
                        <div className="flex justify-between text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                          <span>{p.jobTitle}</span>
                          <span>Apply by {new Date(p.deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 p-4 text-center">No active recruitment drives.</p>
                )}
              </div>
              <Link to="/student/placements" className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700 text-xs text-indigo-600 dark:text-indigo-400 font-semibold flex items-center justify-between">
                <span>View Eligibility & Apply</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Secondary Services Hub Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            {/* Live Results & Grades Hub */}
            <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Award className="w-4 h-4 text-indigo-600" />
                  Recent Marks & Grade Cards
                </span>
                <Link to="/student/results" className="text-xs font-semibold text-indigo-600 hover:underline">
                  Full Marksheet
                </Link>
              </div>

              {results.length > 0 ? (
                <div className="divide-y divide-slate-100 dark:divide-slate-700">
                  {results.slice(0, 3).map((res, i) => (
                    <div key={i} className="py-2 flex items-center justify-between text-xs">
                      <div>
                        <p className="font-semibold text-slate-800 dark:text-slate-200">{res.subject?.name || 'Subject'}</p>
                        <p className="text-[11px] text-slate-500">{res.examination?.name || 'Assessment'}</p>
                      </div>
                      <div className="text-right">
                        <span className="inline-block px-2 py-0.5 rounded text-[11px] font-bold bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300">
                          Grade {res.grade || 'A'}
                        </span>
                        <p className="text-[11px] text-slate-500 mt-0.5">{res.marks} / {res.maxMarks}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500 py-3 text-center">No published results available yet.</p>
              )}
            </div>

            {/* Interactive Siddhartha AI Assistant Banner Hub */}
            <div className="bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-slate-800 dark:to-indigo-950/40 rounded-xl p-5 border border-indigo-200 dark:border-indigo-800 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-300 font-bold text-xs mb-2">
                  <Sparkles className="w-4 h-4 text-indigo-600 animate-spin" />
                  Siddhartha AI Campus Assistant
                </div>
                <h4 className="text-base font-bold text-slate-900 dark:text-white mb-2">
                  Have questions about 6-semester exams or campus rules?
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  Ask our AI Assistant about attendance requirements, CBCS grading points, campus placement eligibility, or course regulations at PB Siddhartha College.
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-indigo-100 dark:border-indigo-900/60 flex items-center justify-between">
                <span className="text-[11px] text-indigo-600 dark:text-indigo-400 font-medium">Powered by Groq LLaMA 3.1</span>
                <Link
                  to="/student/ai-assistant"
                  className="px-4 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition shadow-xs flex items-center gap-1.5"
                >
                  Chat with AI <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Notifications Hub */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Bell className="w-4 h-4 text-indigo-600" />
              PB Siddhartha College Circulars
            </h3>
            <Link to="/student/notifications" className="text-xs font-semibold text-indigo-600 hover:underline">
              View All Circulars
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {notifications.map((n) => (
              <div key={n._id} className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-750 border border-slate-200/80 dark:border-slate-700 text-xs">
                <div className="flex items-center justify-between font-semibold text-slate-800 dark:text-slate-200 mb-1">
                  <span className="truncate">{n.title}</span>
                  <span className="text-[10px] uppercase font-bold text-indigo-600 px-2 py-0.5 rounded bg-indigo-100 dark:bg-indigo-900/50">
                    {n.type}
                  </span>
                </div>
                <p className="text-slate-600 dark:text-slate-400 line-clamp-2">{n.message}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default StudentDashboard;
