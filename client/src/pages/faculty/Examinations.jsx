import React, { useEffect, useState } from 'react';
import * as XLSX from 'xlsx';
import { Download, Upload } from 'lucide-react';
import API from '../../services/api';
import FacultyNavbar from '../../components/common/FacultyNavbar';

const semesters = [1, 2, 3, 4, 5, 6];
const templateHeaders = ['Student ID', 'Student Name', 'Marks', 'Max Marks', 'Remarks'];
const emptyExamination = { name: '', course: '', subject: '', semester: '', date: '', startTime: '', endTime: '', room: '', totalMarks: 100 };

const FacultyExaminations = () => {
  const [examinations, setExaminations] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [courses, setCourses] = useState([]);
  const [students, setStudents] = useState([]);
  const [examinationForm, setExaminationForm] = useState(emptyExamination);
  const [selection, setSelection] = useState({ examination: '', subject: '', semester: '' });
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    Promise.all([API.get('/examinations?limit=500'), API.get('/subjects'), API.get('/courses?status=active')])
      .then(([examResponse, subjectResponse, courseResponse]) => {
        setExaminations(examResponse.data?.data || []);
        setSubjects(subjectResponse.data?.data || []);
        setCourses(courseResponse.data?.data || []);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!selection.semester) {
      setStudents([]);
      return;
    }
    API.get(`/students?semester=${selection.semester}&limit=500`)
      .then((response) => setStudents(response.data?.data || []))
      .catch(() => setStudents([]));
  }, [selection.semester]);

  const updateSelection = (event) => {
    setSelection({ ...selection, [event.target.name]: event.target.value });
  };

  const createExamination = async (event) => {
    event.preventDefault();
    try {
      await API.post('/examinations', { ...examinationForm, semester: Number(examinationForm.semester), totalMarks: Number(examinationForm.totalMarks) });
      setExaminationForm(emptyExamination);
      const response = await API.get('/examinations?limit=500');
      setExaminations(response.data?.data || []);
      setMessage('Examination created successfully.');
    } catch (error) {
      setMessage(error.response?.data?.message || 'The examination could not be created.');
    }
  };

  const downloadTemplate = () => {
    const rows = students.map((student) => ({
      'Student ID': student.studentId,
      'Student Name': student.userId?.name || '',
      Marks: '',
      'Max Marks': 100,
      Remarks: '',
    }));
    const worksheet = XLSX.utils.json_to_sheet(rows.length ? rows : [Object.fromEntries(templateHeaders.map((header) => [header, '']))]);
    worksheet['!cols'] = templateHeaders.map(() => ({ wch: 22 }));
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Marks');
    XLSX.writeFile(workbook, `marks-semester-${selection.semester || 'all'}.xlsx`);
  };

  const uploadMarks = async (event) => {
    event.preventDefault();
    setMessage('');
    if (!selection.examination || !selection.subject || !selection.semester || !file) {
      setMessage('Select an examination, subject, semester, and Excel file first.');
      return;
    }
    try {
      const workbook = XLSX.read(await file.arrayBuffer(), { type: 'array' });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' }).map((row) => ({
        studentId: row['Student ID'] || row.studentId,
        marks: row.Marks ?? row.marks,
        maxMarks: row['Max Marks'] || row.maxMarks || 100,
        remarks: row.Remarks || row.remarks || '',
      }));
      const response = await API.post('/results/bulk', { ...selection, rows });
      setMessage(response.data?.message || 'Marks uploaded successfully.');
      setFile(null);
      event.target.reset();
    } catch (error) {
      const details = error.response?.data?.errors;
      setMessage(details?.length ? details.join(' ') : error.response?.data?.message || 'The spreadsheet could not be uploaded.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <FacultyNavbar />
      <main className="mx-auto max-w-7xl space-y-6 p-4 sm:p-8">
        <header>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-600">Assessment management</p>
          <h1 className="mt-2 text-3xl font-black">Examinations and marks</h1>
          <p className="mt-1 text-sm text-slate-500">Upload subject-wise marks for a semester. Existing results for the same student, subject, and examination are updated.</p>
        </header>
        <section className="rounded-xl border border-violet-200 bg-violet-50 p-6 dark:border-violet-900 dark:bg-violet-950/30">
          <h2 className="text-lg font-bold">Bulk marks upload</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <label className="text-sm font-semibold">Semester
              <select name="semester" value={selection.semester} onChange={updateSelection} className="mt-1 w-full rounded-lg border border-slate-300 bg-white p-2.5 font-normal dark:border-slate-700 dark:bg-slate-900">
                <option value="">Select semester</option>{semesters.map((semester) => <option key={semester} value={semester}>Semester {semester}</option>)}
              </select>
            </label>
            <label className="text-sm font-semibold">Subject
              <select name="subject" value={selection.subject} onChange={updateSelection} className="mt-1 w-full rounded-lg border border-slate-300 bg-white p-2.5 font-normal dark:border-slate-700 dark:bg-slate-900">
                <option value="">Select subject</option>{subjects.filter((subject) => !selection.semester || String(subject.semester) === String(selection.semester)).map((subject) => <option key={subject._id} value={subject._id}>{subject.code} - {subject.name}</option>)}
              </select>
            </label>
            <label className="text-sm font-semibold">Examination
              <select name="examination" value={selection.examination} onChange={updateSelection} className="mt-1 w-full rounded-lg border border-slate-300 bg-white p-2.5 font-normal dark:border-slate-700 dark:bg-slate-900">
                <option value="">Select examination</option>{examinations.map((exam) => <option key={exam._id} value={exam._id}>{exam.name || exam.title || exam._id}</option>)}
              </select>
            </label>
          </div>
          <div className="mt-5 flex flex-wrap gap-3">
            <button type="button" onClick={downloadTemplate} className="inline-flex items-center gap-2 rounded-lg border border-violet-300 bg-white px-4 py-2 text-sm font-bold text-violet-700 hover:bg-violet-100 dark:border-violet-800 dark:bg-slate-900 dark:text-violet-300"><Download className="h-4 w-4" /> Download Excel template</button>
            <form onSubmit={uploadMarks} className="flex flex-wrap items-center gap-3">
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold dark:border-slate-700 dark:bg-slate-900"><Upload className="h-4 w-4" /> Choose Excel file<input type="file" accept=".xlsx,.xls,.csv" onChange={(event) => setFile(event.target.files?.[0] || null)} className="hidden" /></label>
              <button className="rounded-lg bg-violet-700 px-4 py-2 text-sm font-bold text-white hover:bg-violet-800">Upload marks</button>
            </form>
          </div>
          {message && <p className="mt-4 text-sm font-semibold text-slate-700 dark:text-slate-200">{message}</p>}
        </section>
        <form onSubmit={createExamination} className="grid gap-4 rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 sm:grid-cols-2">
          <h2 className="sm:col-span-2 text-lg font-bold">Create examination</h2>
          <input required placeholder="Examination name" value={examinationForm.name} onChange={(event) => setExaminationForm({ ...examinationForm, name: event.target.value })} className="rounded-lg border border-slate-300 bg-transparent p-2.5 dark:border-slate-700" />
          <select required value={examinationForm.course} onChange={(event) => setExaminationForm({ ...examinationForm, course: event.target.value, subject: '' })} className="rounded-lg border border-slate-300 bg-transparent p-2.5 dark:border-slate-700"><option value="">Select course</option>{courses.map((course) => <option key={course._id} value={course._id}>{course.code} - {course.name}</option>)}</select>
          <select required value={examinationForm.subject} onChange={(event) => setExaminationForm({ ...examinationForm, subject: event.target.value })} className="rounded-lg border border-slate-300 bg-transparent p-2.5 dark:border-slate-700"><option value="">Select subject</option>{subjects.filter((subject) => !examinationForm.course || String(subject.course?._id || subject.course) === String(examinationForm.course)).map((subject) => <option key={subject._id} value={subject._id}>{subject.code} - {subject.name}</option>)}</select>
          <select required value={examinationForm.semester} onChange={(event) => setExaminationForm({ ...examinationForm, semester: event.target.value })} className="rounded-lg border border-slate-300 bg-transparent p-2.5 dark:border-slate-700"><option value="">Select semester</option>{semesters.map((semester) => <option key={semester} value={semester}>Semester {semester}</option>)}</select>
          <input required type="date" value={examinationForm.date} onChange={(event) => setExaminationForm({ ...examinationForm, date: event.target.value })} className="rounded-lg border border-slate-300 bg-transparent p-2.5 dark:border-slate-700" />
          <input required type="time" value={examinationForm.startTime} onChange={(event) => setExaminationForm({ ...examinationForm, startTime: event.target.value })} className="rounded-lg border border-slate-300 bg-transparent p-2.5 dark:border-slate-700" />
          <input required type="time" value={examinationForm.endTime} onChange={(event) => setExaminationForm({ ...examinationForm, endTime: event.target.value })} className="rounded-lg border border-slate-300 bg-transparent p-2.5 dark:border-slate-700" />
          <input placeholder="Room (optional)" value={examinationForm.room} onChange={(event) => setExaminationForm({ ...examinationForm, room: event.target.value })} className="rounded-lg border border-slate-300 bg-transparent p-2.5 dark:border-slate-700" />
          <input required type="number" min="1" value={examinationForm.totalMarks} onChange={(event) => setExaminationForm({ ...examinationForm, totalMarks: event.target.value })} className="rounded-lg border border-slate-300 bg-transparent p-2.5 dark:border-slate-700" />
          <button className="rounded-lg bg-violet-700 px-4 py-2 text-sm font-bold text-white sm:col-span-2">Create examination</button>
        </form>
        <section className="overflow-x-auto rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
          <table className="w-full min-w-[700px] text-left text-sm"><thead className="bg-slate-100 text-xs uppercase text-slate-500 dark:bg-slate-950"><tr><th className="px-4 py-3">Name</th><th className="px-4 py-3">Type</th><th className="px-4 py-3">Course</th><th className="px-4 py-3">Date</th><th className="px-4 py-3">Status</th></tr></thead><tbody className="divide-y divide-slate-100 dark:divide-slate-800">{loading ? <tr><td colSpan="5" className="px-4 py-10 text-center text-slate-500">Loading examinations...</td></tr> : examinations.length === 0 ? <tr><td colSpan="5" className="px-4 py-10 text-center text-slate-500">No examinations found in the database.</td></tr> : examinations.map((exam) => <tr key={exam._id}><td className="px-4 py-3 font-semibold">{exam.name || exam.title || '-'}</td><td className="px-4 py-3">{exam.type || '-'}</td><td className="px-4 py-3">{exam.course?.name || '-'}</td><td className="px-4 py-3">{exam.date ? new Date(exam.date).toLocaleDateString() : '-'}</td><td className="px-4 py-3">{exam.status || '-'}</td></tr>)}</tbody></table>
        </section>
      </main>
    </div>
  );
};

export default FacultyExaminations;
