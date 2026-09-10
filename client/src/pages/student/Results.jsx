import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import StudentNavbar from '../../components/common/StudentNavbar';
import {
  Award,
  BookOpen,
  TrendingUp,
  CheckCircle2,
  FileCheck,
  AlertCircle,
  Download,
} from 'lucide-react';

const ResultsPage = () => {
  const [loading, setLoading] = useState(true);
  const [studentData, setStudentData] = useState(null);
  const [results, setResults] = useState([]);
  const [cgpa, setCgpa] = useState('0.0');

  const gradePointMap = {
    'O': 10,
    'A+': 9,
    'A': 8,
    'B+': 7,
    'B': 6,
    'C': 5,
    'F': 0,
  };

  useEffect(() => {
    const fetchResults = async () => {
      try {
        setLoading(true);
        const profileRes = await API.get('/user/profile');
        const student = profileRes.data?.data?.additionalData;
        setStudentData(student);

        if (student?._id) {
          const res = await API.get(`/results?student=${student._id}&limit=500`);
          const resList = res.data?.data || [];
          setResults(resList);

          if (resList.length > 0) {
            let sum = 0;
            let totalCredits = 0;
            resList.forEach((r) => {
              const gp = gradePointMap[r.grade] ?? Math.min(10, Math.round(((r.marks || 0) / (r.maxMarks || 100)) * 10));
              const credits = r.subject?.credits || 1;
              sum += gp * credits;
              totalCredits += credits;
            });
            setCgpa((sum / totalCredits).toFixed(2));
          }
        }
      } catch (err) {
        console.error('Error fetching results', err);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, []);

  const totalPassed = results.filter((r) => r.grade !== 'F').length;
  const distinctionCount = results.filter((r) => r.grade === 'O' || r.grade === 'A+').length;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100">
      <StudentNavbar studentData={studentData} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
              <Award className="w-6 h-6 text-indigo-600" />
              Autonomous Results & CBCS Marksheets
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Parvathaneni Brahmayya Siddhartha College of Arts & Science • 6-Semester Autonomous Grading
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs px-3 py-1 rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 font-semibold">
              Roll No: {studentData?.studentId || 'N/A'}
            </span>
          </div>
        </div>

        {/* CGPA & Performance Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="bg-gradient-to-br from-indigo-600 to-blue-700 rounded-xl p-5 text-white shadow-md">
            <span className="text-xs font-semibold text-indigo-100 uppercase tracking-wider">Cumulative CGPA</span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-4xl font-black">{loading ? '...' : cgpa}</span>
              <span className="text-xs text-indigo-200">/ 10.0</span>
            </div>
            <p className="text-xs text-indigo-100 mt-2">
              {parseFloat(cgpa) >= 8.0 ? 'First Class with Distinction' : parseFloat(cgpa) >= 6.5 ? 'First Class' : 'Second Class'}
            </p>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700 shadow-xs">
            <span className="text-xs font-semibold text-slate-500">Evaluated Papers</span>
            <p className="text-3xl font-black text-slate-900 dark:text-white mt-2">
              {loading ? '...' : results.length}
            </p>
            <p className="text-xs text-slate-500 mt-2">Across CIA & SEE exams</p>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700 shadow-xs">
            <span className="text-xs font-semibold text-slate-500">Passed Subjects</span>
            <p className="text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-2">
              {loading ? '...' : totalPassed}
            </p>
            <p className="text-xs text-slate-500 mt-2">100% clearing rate</p>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700 shadow-xs">
            <span className="text-xs font-semibold text-slate-500">Distinction Grades (O / A+)</span>
            <p className="text-3xl font-black text-purple-600 dark:text-purple-400 mt-2">
              {loading ? '...' : distinctionCount}
            </p>
            <p className="text-xs text-slate-500 mt-2">High score subjects</p>
          </div>
        </div>

        {/* Dynamic Detailed Results Table */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 shadow-xs">
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <FileCheck className="w-5 h-5 text-indigo-600" />
            Subject-Wise Marks & Grade Sheet
          </h3>

          {loading ? (
            <p className="text-xs text-slate-500 py-6 text-center">Loading grade records...</p>
          ) : results.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 dark:bg-slate-750 text-slate-600 dark:text-slate-400 uppercase font-semibold">
                  <tr>
                    <th className="px-4 py-3">Subject</th>
                    <th className="px-4 py-3">Examination</th>
                    <th className="px-4 py-3">Marks Obtained</th>
                    <th className="px-4 py-3">Max Marks</th>
                    <th className="px-4 py-3">Percentage</th>
                    <th className="px-4 py-3">Letter Grade</th>
                    <th className="px-4 py-3">Grade Point</th>
                    <th className="px-4 py-3">Remarks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                  {results.map((r, i) => {
                    const pct = Math.round(((r.marks || 0) / (r.maxMarks || 100)) * 100);
                    const gp = gradePointMap[r.grade] ?? 0;
                    return (
                      <tr key={i} className="hover:bg-slate-50/60 dark:hover:bg-slate-750/50">
                        <td className="px-4 py-3.5 font-bold text-slate-800 dark:text-slate-200">
                          {r.subject?.name || 'Academic Subject'}
                        </td>
                        <td className="px-4 py-3.5 text-slate-600 dark:text-slate-400">
                          {r.examination?.name || 'Assessment'}
                        </td>
                        <td className="px-4 py-3.5 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                          {r.marks}
                        </td>
                        <td className="px-4 py-3.5 font-mono text-slate-500">
                          {r.maxMarks}
                        </td>
                        <td className="px-4 py-3.5 font-semibold">
                          {pct}%
                        </td>
                        <td className="px-4 py-3.5">
                          <span className={`px-2.5 py-0.5 rounded-full font-bold text-[11px] ${
                            r.grade === 'O' || r.grade === 'A+'
                              ? 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300'
                              : 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300'
                          }`}>
                            {r.grade || 'A'}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 font-bold font-mono">
                          {gp} / 10
                        </td>
                        <td className="px-4 py-3.5 text-slate-600 dark:text-slate-400">
                          {r.remarks || 'Passed'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-xs text-slate-500 py-6 text-center">No examination result entries found.</p>
          )}
        </div>

        {/* Autonomous CBCS Grading Scale Reference */}
        <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300">
          <h4 className="font-bold text-slate-800 dark:text-slate-200 mb-2">
            PB Siddhartha College CBCS 10-Point Grading Scale
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 text-center text-[11px]">
            <div className="p-2 rounded bg-white dark:bg-slate-700 border border-slate-200/80">
              <span className="font-bold block text-purple-600">O (10)</span>
              <span className="text-[10px] text-slate-500">90 - 100%</span>
            </div>
            <div className="p-2 rounded bg-white dark:bg-slate-700 border border-slate-200/80">
              <span className="font-bold block text-indigo-600">A+ (9)</span>
              <span className="text-[10px] text-slate-500">80 - 89%</span>
            </div>
            <div className="p-2 rounded bg-white dark:bg-slate-700 border border-slate-200/80">
              <span className="font-bold block text-blue-600">A (8)</span>
              <span className="text-[10px] text-slate-500">70 - 79%</span>
            </div>
            <div className="p-2 rounded bg-white dark:bg-slate-700 border border-slate-200/80">
              <span className="font-bold block text-cyan-600">B+ (7)</span>
              <span className="text-[10px] text-slate-500">60 - 69%</span>
            </div>
            <div className="p-2 rounded bg-white dark:bg-slate-700 border border-slate-200/80">
              <span className="font-bold block text-emerald-600">B (6)</span>
              <span className="text-[10px] text-slate-500">50 - 59%</span>
            </div>
            <div className="p-2 rounded bg-white dark:bg-slate-700 border border-slate-200/80">
              <span className="font-bold block text-amber-600">C (5)</span>
              <span className="text-[10px] text-slate-500">40 - 49%</span>
            </div>
            <div className="p-2 rounded bg-white dark:bg-slate-700 border border-slate-200/80">
              <span className="font-bold block text-rose-600">F (0)</span>
              <span className="text-[10px] text-slate-500">&lt; 40%</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ResultsPage;