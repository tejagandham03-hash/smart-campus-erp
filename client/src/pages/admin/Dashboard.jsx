import React, { useEffect, useState } from 'react';
import { Activity, BookOpen, Building2, GraduationCap, Users } from 'lucide-react';
import API from '../../services/api';
import AdminNavbar from '../../components/common/AdminNavbar';

const AdminDashboard = () => {
	const [counts, setCounts] = useState({ students: 0, faculty: 0, departments: 0, courses: 0 });
	const [loading, setLoading] = useState(true);
	const [loadError, setLoadError] = useState('');
	useEffect(() => {
		Promise.all([API.get('/students?limit=1'), API.get('/faculty?limit=1'), API.get('/departments'), API.get('/courses')])
			.then(([students, faculty, departments, courses]) => setCounts({
				students: students.data?.pagination?.total ?? students.data?.data?.length ?? 0,
				faculty: faculty.data?.pagination?.total ?? faculty.data?.data?.length ?? 0,
				departments: departments.data?.data?.length ?? 0,
				courses: courses.data?.data?.length ?? 0,
			}))
			.catch((error) => setLoadError(error.response?.data?.message || 'Unable to load live administration totals. Please sign in again.'))
			.finally(() => setLoading(false));
	}, []);
	const cards = [['Students', counts.students, GraduationCap], ['Faculty', counts.faculty, Users], ['Departments', counts.departments, Building2], ['Courses', counts.courses, BookOpen]];
	return <div className="min-h-screen bg-slate-50 dark:bg-slate-950"><AdminNavbar /><main className="p-4 text-slate-900 sm:p-8 dark:text-white"><div className="mx-auto max-w-7xl space-y-6"><section className="rounded-2xl bg-slate-900 p-6 text-white sm:p-8"><div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300"><Activity className="h-4 w-4" /> Operations overview</div><h1 className="mt-3 text-3xl font-black">Campus administration</h1><p className="mt-2 text-sm text-slate-300">Live totals from the academic, people, and curriculum services.</p></section>{loadError && <p className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-700 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-300">{loadError}</p>}<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{cards.map(([label, value, Icon]) => <div key={label} className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900"><Icon className="h-5 w-5 text-cyan-600" /><p className="mt-5 text-sm text-slate-500">{label}</p><p className="mt-1 text-3xl font-black">{loading ? '...' : loadError ? '-' : value}</p></div>)}</div><p className="rounded-xl border border-slate-200 bg-white p-5 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">Use the navigation above to manage students, faculty, departments, courses, subjects, timetable, fees, notifications, and placements.</p></div></main></div>;
};

export default AdminDashboard;