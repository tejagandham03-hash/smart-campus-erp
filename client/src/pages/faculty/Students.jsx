import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import FacultyNavbar from '../../components/common/FacultyNavbar';
import {
  Users,
  Search,
  Filter,
  GraduationCap,
  Eye,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Award,
  Clock,
  CreditCard,
  X,
  BookOpen,
} from 'lucide-react';

const FacultyStudents = () => {
  const [loading, setLoading] = useState(true);
  const [facultyData, setFacultyData] = useState(null);
  const [students, setStudents] = useState([]);
  const [totalStudents, setTotalStudents] = useState(0);

  // Filters
  const [search, setSearch] = useState('');
  const [semesterFilter, setSemesterFilter] = useState('');
  const [courseFilter, setCourseFilter] = useState('');
  const [courses, setCourses] = useState([]);

  // Selected student modal
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [studentDetails, setStudentDetails] = useState({
    attendance: null,
    results: [],
    fees: [],
  });

  // Load faculty profile and courses
  useEffect(() => {
    const init = async () => {
      try {
        const [profRes, courseRes] = await Promise.all([
          API.get('/user/profile'),
          API.get('/courses'),
        ]);
        setFacultyData(profRes.data?.data?.additionalData);
        setCourses(courseRes.data?.data || []);
      } catch (err) {
        console.error('Failed to initialize faculty student page', err);
      }
    };
    init();
  }, []);

  // Fetch students based on filters
  const fetchStudents = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (semesterFilter) params.append('semester', semesterFilter);
      if (courseFilter) params.append('course', courseFilter);
      params.append('limit', '50');

      const res = await API.get(`/students?${params.toString()}`);
      setStudents(res.data?.data || []);
      setTotalStudents(res.data?.pagination?.total || (res.data?.data || []).length);
    } catch (err) {
      console.error('Error fetching students', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [search, semesterFilter, courseFilter]);

  // Open modal and load complete dynamic details for this student
  const handleViewStudentDetails = async (student) => {
    setSelectedStudent(student);
    setModalLoading(true);
    try {
      const studentId = student._id;
      const [attRes, resultRes, feeRes] = await Promise.all([
        API.get(`/attendance/report/summary?student=${studentId}`).catch(() => ({ data: { data: null } })),
        API.get(`/results?student=${studentId}`).catch(() => ({ data: { data: [] } })),
        API.get(`/fees?student=${studentId}`).catch(() => ({ data: { data: [] } })),
      ]);

      setStudentDetails({
        attendance: attRes.data?.data,
        results: resultRes.data?.data || [],
        fees: feeRes.data?.data || [],
      });
    } catch (err) {
      console.error('Failed to load student full details', err);
    } finally {
      setModalLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100">
      <FacultyNavbar facultyData={facultyData} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
              <Users className="w-6 h-6 text-purple-600" />
              Student Academic Directory
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Comprehensive student profiles, 6-semester academic progress, attendance records, and examination performance.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="px-3.5 py-1.5 rounded-full bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 font-bold border border-purple-200 dark:border-purple-800">
              {totalStudents} Students Enrolled
            </span>
          </div>
        </div>

        {/* Filters Bar */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700 shadow-xs flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="flex-1 min-w-[240px] relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by student name or roll ID (e.g. PBS24BCA001)..."
              className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-750 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Semester Filter (1 to 6) */}
          <div className="w-40">
            <select
              value={semesterFilter}
              onChange={(e) => setSemesterFilter(e.target.value)}
              className="w-full py-2 px-3 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-750"
            >
              <option value="">All Semesters (1-6)</option>
              <option value="1">Semester 1 (Year 1)</option>
              <option value="2">Semester 2 (Year 1)</option>
              <option value="3">Semester 3 (Year 2)</option>
              <option value="4">Semester 4 (Year 2)</option>
              <option value="5">Semester 5 (Year 3)</option>
              <option value="6">Semester 6 (Year 3)</option>
            </select>
          </div>

          {/* Course Filter */}
          <div className="w-48">
            <select
              value={courseFilter}
              onChange={(e) => setCourseFilter(e.target.value)}
              className="w-full py-2 px-3 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-750"
            >
              <option value="">All Degree Courses</option>
              {courses.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.code} - {c.name}
                </option>
              ))}
            </select>
          </div>

          {(search || semesterFilter || courseFilter) && (
            <button
              onClick={() => {
                setSearch('');
                setSemesterFilter('');
                setCourseFilter('');
              }}
              className="px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition"
            >
              Clear Filters
            </button>
          )}
        </div>

        {/* Students Table */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs overflow-hidden">
          {loading ? (
            <p className="text-xs text-slate-500 py-12 text-center">Loading student records...</p>
          ) : students.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 dark:bg-slate-750 text-slate-600 dark:text-slate-400 uppercase font-semibold border-b border-slate-100 dark:border-slate-700">
                  <tr>
                    <th className="px-4 py-3.5">Roll ID</th>
                    <th className="px-4 py-3.5">Student Name</th>
                    <th className="px-4 py-3.5">Degree Program</th>
                    <th className="px-4 py-3.5">Semester & Year</th>
                    <th className="px-4 py-3.5">Section</th>
                    <th className="px-4 py-3.5">Status</th>
                    <th className="px-4 py-3.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                  {students.map((student) => (
                    <tr key={student._id} className="hover:bg-slate-50/70 dark:hover:bg-slate-750/50 transition">
                      <td className="px-4 py-3 font-mono font-bold text-purple-600 dark:text-purple-400">
                        {student.studentId}
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-bold text-slate-900 dark:text-white">
                          {student.userId?.name || '-'}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {student.userId?.email || '-'}
                        </div>
                      </td>
                      <td className="px-4 py-3 font-medium">
                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                          {student.course?.code || '-'}
                        </span>
                        <span className="block text-[11px] text-slate-400 truncate max-w-xs">
                          {student.course?.name}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-block font-bold text-indigo-600 dark:text-indigo-400">
                          Semester {student.semester} / 6
                        </span>
                        <span className="block text-[11px] text-slate-400">Year {student.year} of 3</span>
                      </td>
                      <td className="px-4 py-3 font-semibold text-slate-700 dark:text-slate-300">
                          {student.section ? `Sec ${student.section}` : '-'}
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                          Active
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => handleViewStudentDetails(student)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 hover:bg-purple-100 transition border border-purple-200/80 dark:border-purple-800"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-12 text-center">
              <Users className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-xs text-slate-500">No students matched the selected filters.</p>
            </div>
          )}
        </div>

        {/* Detailed Student Modal */}
        {selectedStudent && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-3xl w-full border border-slate-200 dark:border-slate-700 shadow-2xl my-8 overflow-hidden">
              {/* Modal Header */}
              <div className="px-6 py-4 bg-gradient-to-r from-purple-700 to-indigo-700 text-white flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/20 font-bold flex items-center justify-center text-base">
                    {selectedStudent.userId?.name?.charAt(0) || 'S'}
                  </div>
                  <div>
                    <h3 className="text-base font-bold leading-tight">
                      {selectedStudent.userId?.name}
                    </h3>
                    <p className="text-xs text-purple-200">
                      Roll No: {selectedStudent.studentId} • Semester {selectedStudent.semester} of 6
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedStudent(null)}
                  className="text-white/80 hover:text-white p-1 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
                {modalLoading ? (
                  <p className="text-xs text-slate-500 py-8 text-center">Loading comprehensive student data...</p>
                ) : (
                  <>
                    {/* Academic & Personal Details */}
                    <div>
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                        <GraduationCap className="w-4 h-4 text-purple-600" />
                        Program & Enrolment Information
                      </h4>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-750">
                          <span className="text-slate-400 block text-[11px]">Degree Program</span>
                          <span className="font-bold text-slate-800 dark:text-slate-200">{selectedStudent.course?.name}</span>
                        </div>
                        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-750">
                          <span className="text-slate-400 block text-[11px]">Department</span>
                          <span className="font-bold text-slate-800 dark:text-slate-200">{selectedStudent.department?.name || 'Computer Science'}</span>
                        </div>
                        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-750">
                          <span className="text-slate-400 block text-[11px]">Semester & Section</span>
                          <span className="font-bold text-purple-600 dark:text-purple-400">Sem {selectedStudent.semester} (Sec {selectedStudent.section})</span>
                        </div>
                        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-750">
                          <span className="text-slate-400 block text-[11px]">Contact Email</span>
                          <span className="font-semibold text-slate-700 dark:text-slate-300 truncate block">{selectedStudent.userId?.email}</span>
                        </div>
                      </div>
                    </div>

                    {/* Guardian & Contact */}
                    <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-750 text-xs space-y-2">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Guardian Name:</span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedStudent.guardianName || 'Guardian'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Guardian Phone:</span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedStudent.guardianPhone || '9848012345'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Residential Address:</span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedStudent.address || 'Vijayawada, AP'}</span>
                      </div>
                    </div>

                    {/* Attendance Record */}
                    <div>
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                        <Clock className="w-4 h-4 text-purple-600" />
                        Attendance Statistics
                      </h4>
                      {studentDetails.attendance ? (
                        <div className="grid grid-cols-3 gap-3 text-xs">
                          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-750 text-center">
                            <span className="text-slate-400 block text-[11px]">Total Lectures</span>
                            <span className="text-lg font-black text-slate-800 dark:text-slate-200">{studentDetails.attendance.total}</span>
                          </div>
                          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-750 text-center">
                            <span className="text-slate-400 block text-[11px]">Lectures Attended</span>
                            <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">{studentDetails.attendance.present}</span>
                          </div>
                          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-750 text-center">
                            <span className="text-slate-400 block text-[11px]">Percentage</span>
                            <span className="text-lg font-black text-purple-600 dark:text-purple-400">{studentDetails.attendance.percentage}%</span>
                          </div>
                        </div>
                      ) : (
                        <p className="text-xs text-slate-500">No attendance data logged.</p>
                      )}
                    </div>

                    {/* Examination Results */}
                    <div>
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                        <Award className="w-4 h-4 text-purple-600" />
                        Academic Results & Evaluated Papers
                      </h4>
                      {studentDetails.results.length > 0 ? (
                        <div className="space-y-2">
                          {studentDetails.results.map((res, i) => (
                            <div key={i} className="p-3 rounded-lg bg-slate-50 dark:bg-slate-750 flex items-center justify-between text-xs">
                              <div>
                                <span className="font-bold text-slate-800 dark:text-slate-200 block">{res.subject?.name || 'Subject'}</span>
                                <span className="text-[11px] text-slate-400">{res.examination?.name}</span>
                              </div>
                              <div className="text-right">
                                <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300">
                                  Grade {res.grade || 'A'}
                                </span>
                                <span className="block text-[11px] text-slate-500 font-mono mt-0.5">
                                  {res.marks} / {res.maxMarks} Marks
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-slate-500">No examination results recorded yet.</p>
                      )}
                    </div>

                    {/* Fees Dues */}
                    <div>
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                        <CreditCard className="w-4 h-4 text-purple-600" />
                        Tuition & Semester Fee Status
                      </h4>
                      {studentDetails.fees.length > 0 ? (
                        <div className="space-y-2">
                          {studentDetails.fees.map((fee, i) => (
                            <div key={i} className="p-3 rounded-lg bg-slate-50 dark:bg-slate-750 flex items-center justify-between text-xs">
                              <div>
                                <span className="font-bold text-slate-800 dark:text-slate-200">{fee.feeType}</span>
                                <span className="text-[11px] text-slate-400 block">Semester {fee.semester} • Due {new Date(fee.dueDate).toLocaleDateString()}</span>
                              </div>
                              <div className="text-right">
                                <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                                  fee.status === 'paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                                }`}>
                                  {fee.status.toUpperCase()}
                                </span>
                                <span className="block text-[11px] font-mono font-bold mt-0.5">
                                  ₹{fee.amount.toLocaleString()}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-slate-500">No fee records found.</p>
                      )}
                    </div>
                  </>
                )}
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-3 bg-slate-50 dark:bg-slate-750 border-t border-slate-200 dark:border-slate-700 flex justify-end">
                <button
                  onClick={() => setSelectedStudent(null)}
                  className="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-300"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default FacultyStudents;
