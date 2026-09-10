import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import StudentNavbar from '../../components/common/StudentNavbar';
import {
  Calendar,
  Clock,
  MapPin,
  User,
  BookOpen,
  GraduationCap,
} from 'lucide-react';

const TimetablePage = () => {
  const [loading, setLoading] = useState(true);
  const [studentData, setStudentData] = useState(null);
  const [timetable, setTimetable] = useState([]);
  
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const todayName = days.includes(new Date().toLocaleDateString('en-US', { weekday: 'long' }))
    ? new Date().toLocaleDateString('en-US', { weekday: 'long' })
    : 'Monday';
  const [selectedDay, setSelectedDay] = useState(todayName);

  useEffect(() => {
    const fetchTimetable = async () => {
      try {
        setLoading(true);
        const profileRes = await API.get('/user/profile');
        const student = profileRes.data?.data?.additionalData;
        setStudentData(student);

        const courseId = student?.course?._id;
        const query = courseId ? `?course=${courseId}` : '';
        const ttRes = await API.get(`/timetable${query}`);
        setTimetable(ttRes.data?.data || []);
      } catch (err) {
        console.error('Error fetching timetable', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTimetable();
  }, []);

  const daySchedule = timetable.filter((item) => item.day === selectedDay);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100">
      <StudentNavbar studentData={studentData} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
              <Calendar className="w-6 h-6 text-indigo-600" />
              Academic Weekly Timetable
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              6-Semester Autonomous Degree Schedule • Siddhartha Academic Block
            </p>
          </div>

          {studentData && (
            <div className="flex flex-wrap gap-2 text-xs">
              <span className="px-3 py-1 rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 font-semibold">
                {studentData.course?.code || 'DEG'} • Semester {studentData.semester || 1}/6
              </span>
              <span className="px-3 py-1 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium">
                Section {studentData.section || 'A'}
              </span>
            </div>
          )}
        </div>

        {/* Day Selector Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200 dark:border-slate-700">
          {days.map((day) => {
            const isSelected = selectedDay === day;
            const count = timetable.filter((t) => t.day === day).length;
            return (
              <button
                key={day}
                onClick={() => setSelectedDay(day)}
                className={`px-5 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap flex items-center gap-2 ${
                  isSelected
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                }`}
              >
                <span>{day}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isSelected ? 'bg-white/20' : 'bg-slate-100 dark:bg-slate-700 text-slate-500'}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Selected Day Schedule */}
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Schedule for {selectedDay} ({daySchedule.length} lectures)</span>
            <span>Academic Year 2024-2025</span>
          </div>

          {loading ? (
            <p className="text-xs text-slate-500 py-8 text-center">Loading timetable schedule...</p>
          ) : daySchedule.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {daySchedule.map((entry, idx) => (
                <div
                  key={idx}
                  className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700 shadow-xs hover:border-indigo-300 transition flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between text-xs text-indigo-600 dark:text-indigo-400 font-bold mb-2">
                      <span className="flex items-center gap-1.5 font-mono">
                        <Clock className="w-3.5 h-3.5" /> {entry.startTime} - {entry.endTime}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950 text-[10px] uppercase font-semibold">
                        Sem {entry.semester || 1}
                      </span>
                    </div>

                    <h4 className="text-base font-bold text-slate-900 dark:text-white mb-1">
                      {entry.subject?.name || 'Class Subject'}
                    </h4>
                    <p className="text-xs text-slate-500 font-mono mb-4">
                      {entry.subject?.code || 'SUB001'} • {entry.subject?.credits || 4} Credits
                    </p>
                  </div>

                  <div className="pt-4 border-t border-slate-100 dark:border-slate-700/80 space-y-2 text-xs text-slate-600 dark:text-slate-300">
                    <div className="flex items-center gap-2">
                      <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{entry.faculty?.name || 'Faculty Lecturer'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{entry.room || 'Siddhartha Block Room 101'}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-800 rounded-xl p-12 text-center border border-slate-200 dark:border-slate-700">
              <Calendar className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <h4 className="text-sm font-bold text-slate-700 dark:text-slate-200">No lectures scheduled for {selectedDay}</h4>
              <p className="text-xs text-slate-500 mt-1">Enjoy your study hours or lab project work.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default TimetablePage;