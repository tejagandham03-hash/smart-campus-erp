import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import StudentNavbar from '../../components/common/StudentNavbar';
import {
  FileText,
  Calendar,
  Clock,
  MapPin,
  Award,
  Download,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';

const ExaminationsPage = () => {
  const [loading, setLoading] = useState(true);
  const [studentData, setStudentData] = useState(null);
  const [examinations, setExaminations] = useState([]);
  const [filterType, setFilterType] = useState('all');
  const [hallTicketDownloaded, setHallTicketDownloaded] = useState(false);

  useEffect(() => {
    const fetchExams = async () => {
      try {
        setLoading(true);
        const profileRes = await API.get('/user/profile');
        const student = profileRes.data?.data?.additionalData;
        setStudentData(student);

        const courseId = student?.course?._id;
        const query = courseId ? `?course=${courseId}` : '';
        const examRes = await API.get(`/examinations${query}`);
        setExaminations(examRes.data?.data || []);
      } catch (err) {
        console.error('Error fetching exams', err);
      } finally {
        setLoading(false);
      }
    };

    fetchExams();
  }, []);

  const filteredExams = filterType === 'all'
    ? examinations
    : filterType === 'cia'
    ? examinations.filter((e) => e.name.toLowerCase().includes('cia') || e.name.toLowerCase().includes('internal') || e.name.toLowerCase().includes('midterm'))
    : examinations.filter((e) => e.name.toLowerCase().includes('see') || e.name.toLowerCase().includes('semester end') || e.name.toLowerCase().includes('endterm'));

  const handleDownloadHallTicket = () => {
    setHallTicketDownloaded(true);
    setTimeout(() => setHallTicketDownloaded(false), 4000);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100">
      <StudentNavbar studentData={studentData} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
              <FileText className="w-6 h-6 text-indigo-600" />
              Autonomous Examinations & Schedules
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Continuous Internal Assessment (CIA) & Semester End Examinations (SEE) • PB Siddhartha Examination Cell
            </p>
          </div>

          <button
            onClick={handleDownloadHallTicket}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-xs transition"
          >
            <Download className="w-4 h-4" />
            Download Digital Hall Ticket
          </button>
        </div>

        {hallTicketDownloaded && (
          <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            Digital Hall Ticket for {studentData?.studentId || 'Student'} generated successfully! Examination Center: Siddhartha Block, PB Siddhartha College of Arts & Science.
          </div>
        )}

        {/* Examination Cell Notice */}
        <div className="p-4 rounded-xl bg-indigo-50/70 dark:bg-slate-800 border border-indigo-200 dark:border-indigo-900/60 text-xs text-slate-700 dark:text-slate-300 flex items-start gap-3">
          <AlertCircle className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong>Important Exam Rules:</strong> Students must report 15 minutes prior to commencement with their College Identity Card and Hall Ticket. Minimum pass mark is 40% in internal and external components.
          </p>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-700 pb-2">
          {[
            { id: 'all', label: 'All Examinations' },
            { id: 'cia', label: 'CIA Internal Assessments' },
            { id: 'see', label: 'SEE Semester End Exams' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterType(tab.id)}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition ${
                filterType === tab.id
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Examinations List */}
        {loading ? (
          <p className="text-xs text-slate-500 py-8 text-center">Loading examination schedule...</p>
        ) : filteredExams.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredExams.map((exam, idx) => {
              const examDate = new Date(exam.date);
              const isPast = examDate < new Date();
              return (
                <div
                  key={idx}
                  className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700 shadow-xs flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between text-xs mb-2">
                      <span className="px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-bold text-[10px] uppercase">
                        Semester {exam.semester || 1}
                      </span>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        isPast
                          ? 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                          : 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300'
                      }`}>
                        {isPast ? 'Conducted' : 'Upcoming'}
                      </span>
                    </div>

                    <h4 className="text-base font-bold text-slate-900 dark:text-white mb-1.5">
                      {exam.name}
                    </h4>

                    <p className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold mb-4">
                      {exam.subject?.name || 'Subject Paper'}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-slate-100 dark:border-slate-700 space-y-2 text-xs text-slate-600 dark:text-slate-300">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>{examDate.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span className="font-mono">{exam.startTime} - {exam.endTime}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>{exam.room || 'Siddhartha Block 202'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200 font-bold pt-1">
                      <Award className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Maximum Marks: {exam.totalMarks || 75}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-800 rounded-xl p-12 text-center border border-slate-200 dark:border-slate-700">
            <FileText className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <h4 className="text-sm font-bold text-slate-700 dark:text-slate-200">No examinations found in this category</h4>
          </div>
        )}
      </main>
    </div>
  );
};

export default ExaminationsPage;