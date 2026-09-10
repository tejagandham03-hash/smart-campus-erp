import React, { useEffect, useState } from 'react';
import { Plus, RefreshCw, Search, Trash2 } from 'lucide-react';
import API from '../../services/api';
import { useNotification } from '../../hooks/useNotification';
import AdminBulkImport from './AdminBulkImport';
import AdminNavbar from './AdminNavbar';

const resourceConfig = {
  students: {
    title: 'Students',
    description: 'Manage active student records and their academic placement.',
    endpoint: '/students',
    columns: [['studentId', 'Student ID'], ['userId.name', 'Name'], ['userId.email', 'Email'], ['course.name', 'Course'], ['semester', 'Semester'], ['status', 'Status']],
    fields: [['studentId', 'Student ID', 'text'], ['name', 'Full name', 'text'], ['email', 'Email', 'email'], ['password', 'Temporary password', 'password'], ['department', 'Department ID, code, or name', 'text'], ['course', 'Course ID, code, or name', 'text'], ['semester', 'Semester (1-6)', 'number'], ['section', 'Section', 'text'], ['assignedFaculty', 'Assigned faculty IDs (comma separated)', 'text']],
  },
  faculty: {
    title: 'Faculty',
    description: 'Manage faculty accounts, assignments, and status.',
    endpoint: '/faculty',
    columns: [['employeeId', 'Employee ID'], ['userId.name', 'Name'], ['userId.email', 'Email'], ['department.name', 'Department'], ['designation', 'Designation'], ['status', 'Status']],
    fields: [['employeeId', 'Employee ID', 'text'], ['name', 'Full name', 'text'], ['email', 'Email', 'email'], ['password', 'Temporary password', 'password'], ['department', 'Department ID', 'text'], ['designation', 'Designation', 'text'], ['qualification', 'Qualification', 'text'], ['joiningDate', 'Joining date', 'date']],
  },
  departments: {
    title: 'Departments',
    description: 'Maintain the academic departments available across campus.',
    endpoint: '/departments',
    columns: [['code', 'Code'], ['name', 'Name'], ['description', 'Description'], ['status', 'Status']],
    fields: [['code', 'Code', 'text'], ['name', 'Name', 'text'], ['description', 'Description', 'text']],
  },
  courses: {
    title: 'Courses',
    description: 'Manage degree programmes and their academic metadata.',
    endpoint: '/courses',
    columns: [['code', 'Code'], ['name', 'Name'], ['degree', 'Degree'], ['duration', 'Duration'], ['department.name', 'Department']],
    fields: [['code', 'Code', 'text'], ['name', 'Name', 'text'], ['department', 'Department ID', 'text'], ['degree', 'Degree', 'text'], ['duration', 'Duration', 'number'], ['description', 'Description', 'text']],
  },
  subjects: {
    title: 'Subjects',
    description: 'Maintain the subject catalogue used by attendance and examinations.',
    endpoint: '/subjects',
    columns: [['code', 'Code'], ['name', 'Name'], ['semester', 'Semester'], ['course.name', 'Course'], ['credits', 'Credits']],
    fields: [['code', 'Code', 'text'], ['name', 'Name', 'text'], ['course', 'Course ID', 'text'], ['semester', 'Semester', 'number'], ['credits', 'Credits', 'number'], ['faculty', 'Faculty ID', 'text']],
  },
  timetable: {
    title: 'Timetable',
    description: 'Review the published schedule currently stored by the campus.',
    endpoint: '/timetable',
    columns: [['day', 'Day'], ['period', 'Period'], ['subject.name', 'Subject'], ['room', 'Room'], ['faculty.name', 'Faculty']],
    fields: [],
  },
  fees: {
    title: 'Fees',
    description: 'Review fee accounts and payment status from the finance records.',
    endpoint: '/fees',
    columns: [['student.studentId', 'Student'], ['feeType', 'Fee type'], ['amount', 'Amount'], ['paidAmount', 'Paid'], ['status', 'Status']],
    fields: [],
  },
  notifications: {
    title: 'Notifications',
    description: 'Review campus messages sent through the notification service.',
    endpoint: '/notifications',
    columns: [['title', 'Title'], ['type', 'Type'], ['priority', 'Priority'], ['createdAt', 'Created']],
    fields: [],
  },
  placements: {
    title: 'Placements',
    description: 'Review recruitment drives and their current publication status.',
    endpoint: '/placements',
    columns: [['company', 'Company'], ['jobTitle', 'Role'], ['location', 'Location'], ['deadline', 'Deadline'], ['status', 'Status']],
    fields: [],
  },
};

const valueAt = (item, path) => path.split('.').reduce((value, key) => value?.[key], item);

export default function RoleWorkspace({ resource }) {
  const config = resourceConfig[resource];
  const { addNotification } = useNotification();
  const [records, setRecords] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({});
  const [departments, setDepartments] = useState([]);
  const [courses, setCourses] = useState([]);

  const loadRecords = async () => {
    setLoading(true);
    try {
      const response = await API.get(config.endpoint, { params: search ? { search } : undefined });
      setRecords(response.data?.data || []);
    } catch (error) {
      addNotification(error.response?.data?.message || `Unable to load ${config.title.toLowerCase()}.`, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadRecords(); }, [resource, search]);

  useEffect(() => {
    if (!['students', 'faculty', 'courses'].includes(resource)) return;
    API.get('/departments?status=active')
      .then((response) => setDepartments(response.data?.data || []))
      .catch((error) => addNotification(error.response?.data?.message || 'Unable to load departments.', 'error'));
  }, [resource]);

  useEffect(() => {
    if (resource !== 'students' && resource !== 'subjects') return;
    API.get('/courses?status=active')
      .then((response) => setCourses(response.data?.data || []))
      .catch((error) => addNotification(error.response?.data?.message || 'Unable to load courses.', 'error'));
  }, [resource]);

  const createRecord = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form };
      if (resource === 'students' && typeof payload.assignedFaculty === 'string') {
        payload.assignedFaculty = payload.assignedFaculty.split(',').map((item) => item.trim()).filter(Boolean);
      }
      await API.post(config.endpoint, payload);
      addNotification(`${config.title.slice(0, -1)} created successfully.`, 'success');
      setForm({});
      setShowForm(false);
      loadRecords();
    } catch (error) {
      addNotification(error.response?.data?.message || 'The record could not be created.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const deleteRecord = async (record) => {
    if (!record?._id || !window.confirm('Delete this record? This action cannot be undone.')) return;
    try {
      await API.delete(`${config.endpoint}/${record._id}`);
      addNotification('Record deleted successfully.', 'success');
      loadRecords();
    } catch (error) {
      addNotification(error.response?.data?.message || 'The record could not be deleted.', 'error');
    }
  };

  if (!config) return null;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950"><AdminNavbar /><section className="p-4 text-slate-900 sm:p-8 dark:text-white">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="flex flex-col gap-4 rounded-2xl bg-slate-900 p-6 text-white sm:flex-row sm:items-center sm:justify-between">
          <div><p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">Administration</p><h1 className="mt-2 text-3xl font-black">{config.title}</h1><p className="mt-1 text-sm text-slate-300">{config.description}</p></div>
          {config.fields.length > 0 && <button onClick={() => setShowForm(!showForm)} className="inline-flex items-center justify-center gap-2 rounded-lg bg-cyan-400 px-4 py-2 text-sm font-bold text-slate-950 hover:bg-cyan-300"><Plus className="h-4 w-4" /> Add record</button>}
        </header>
        {(resource === 'students' || resource === 'faculty') && <AdminBulkImport type={resource === 'students' ? 'students' : 'faculty'} />}

        {showForm && <form onSubmit={createRecord} className="grid gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:grid-cols-2">
          {resource === 'subjects' && <datalist id="subject-code-options">{records.map((subject) => <option key={subject._id} value={subject.code} />)}</datalist>}
          {config.fields.map(([key, label, type]) => <label key={key} className="text-sm font-semibold text-slate-700 dark:text-slate-200">{label}{(resource === 'students' || resource === 'faculty' || resource === 'courses') && key === 'department' ? <select required value={form[key] || ''} onChange={(event) => setForm({ ...form, [key]: event.target.value, ...(resource === 'students' ? { course: '' } : {}) })} className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 font-normal outline-none focus:border-cyan-500 dark:border-slate-700 dark:bg-slate-800"><option value="">Select department</option>{departments.map((department) => <option key={department._id} value={department._id}>{department.code} - {department.name}</option>)}</select> : (resource === 'students' || resource === 'subjects') && key === 'course' ? <select required value={form[key] || ''} onChange={(event) => setForm({ ...form, [key]: event.target.value })} className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 font-normal outline-none focus:border-cyan-500 dark:border-slate-700 dark:bg-slate-800"><option value="">Select course</option>{courses.filter((course) => resource !== 'students' || !form.department || String(course.department?._id || course.department) === String(form.department)).map((course) => <option key={course._id} value={course._id}>{course.code} - {course.name}</option>)}</select> : <input list={resource === 'subjects' && key === 'code' ? 'subject-code-options' : undefined} required={!['description', 'phone', 'assignedFaculty'].includes(key)} type={type} value={form[key] || ''} onChange={(event) => setForm({ ...form, [key]: type === 'number' ? Number(event.target.value) : event.target.value })} className="mt-1 w-full rounded-lg border border-slate-300 bg-transparent px-3 py-2 font-normal outline-none focus:border-cyan-500 dark:border-slate-700" />}</label>)}
          <div className="flex items-end gap-2"><button disabled={saving} className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-bold text-white disabled:opacity-50 dark:bg-cyan-400 dark:text-slate-950">{saving ? 'Saving...' : 'Save record'}</button><button type="button" onClick={() => setShowForm(false)} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold dark:border-slate-700">Cancel</button></div>
        </form>}

        <div className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex flex-col gap-3 border-b border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800"><label className="relative flex-1 sm:max-w-sm"><Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search records" className="w-full rounded-lg border border-slate-300 bg-transparent py-2 pl-9 pr-3 text-sm outline-none focus:border-cyan-500 dark:border-slate-700" /></label><button onClick={loadRecords} className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold dark:border-slate-700"><RefreshCw className="h-4 w-4" /> Refresh</button></div>
          <div className="overflow-x-auto"><table className="w-full min-w-[700px] text-left text-sm"><thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500 dark:bg-slate-950 dark:text-slate-400"><tr>{config.columns.map(([, label]) => <th key={label} className="px-4 py-3 font-semibold">{label}</th>)}<th className="px-4 py-3">Actions</th></tr></thead><tbody className="divide-y divide-slate-100 dark:divide-slate-800">{loading ? <tr><td colSpan={config.columns.length + 1} className="px-4 py-10 text-center text-slate-500">Loading live records...</td></tr> : records.length === 0 ? <tr><td colSpan={config.columns.length + 1} className="px-4 py-10 text-center text-slate-500">No records found in the database.</td></tr> : records.map((record) => <tr key={record._id} className="hover:bg-slate-50 dark:hover:bg-slate-950">{config.columns.map(([path, label]) => <td key={label} className="px-4 py-3 text-slate-700 dark:text-slate-300">{String(valueAt(record, path) ?? '-')}</td>)}<td className="px-4 py-3"><button onClick={() => deleteRecord(record)} className="rounded p-2 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30" title="Delete"><Trash2 className="h-4 w-4" /></button></td></tr>)}</tbody></table></div>
        </div>
      </div>
    </section></div>
  );
}
