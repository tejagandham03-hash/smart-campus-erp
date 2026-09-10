import React, { useEffect, useState } from 'react';
import { BookOpen, CalendarDays, ClipboardCheck, Users } from 'lucide-react';
import API from '../../services/api';
import FacultyNavbar from '../../components/common/FacultyNavbar';

const FacultyDashboard = () => {
	const [profile, setProfile] = useState(null);
	const [counts, setCounts] = useState({ students: 0, subjects: 0, examinations: 0, timetable: 0 });
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const load = async () => {
			const [profileRes, studentsRes, subjectsRes, examinationsRes, timetableRes] = await Promise.allSettled([
				API.get('/user/profile'), API.get('/students?limit=1'), API.get('/subjects'), API.get('/examinations?limit=1'), API.get('/timetable'),
			]);
			if (profileRes.status === 'fulfilled') setProfile(profileRes.value.data?.data?.additionalData);
			setCounts({
				students: studentsRes.status === 'fulfilled' ? studentsRes.value.data?.pagination?.total ?? studentsRes.value.data?.data?.length ?? 0 : 0,
				subjects: subjectsRes.status === 'fulfilled' ? subjectsRes.value.data?.pagination?.total ?? subjectsRes.value.data?.data?.length ?? 0 : 0,
				examinations: examinationsRes.status === 'fulfilled' ? examinationsRes.value.data?.pagination?.total ?? examinationsRes.value.data?.data?.length ?? 0 : 0,
				timetable: timetableRes.status === 'fulfilled' ? timetableRes.value.data?.pagination?.total ?? timetableRes.value.data?.data?.length ?? 0 : 0,
			});
			setLoading(false);
		};
		load().catch(() => setLoading(false));
		window.addEventListener('focus', load);
		return () => window.removeEventListener('focus', load);
	}, []);

	const cards = [['Students', counts.students, Users], ['Subjects', counts.subjects, BookOpen], ['Examinations', counts.examinations, ClipboardCheck], ['Scheduled classes', counts.timetable, CalendarDays]];
	return <div className="min-h-screen bg-slate-50 dark:bg-slate-950"><FacultyNavbar facultyData={profile} /><main className="mx-auto max-w-7xl space-y-6 p-4 sm:p-8"><section className="rounded-2xl bg-gradient-to-r from-violet-700 to-indigo-700 p-6 text-white sm:p-8"><p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-200">Faculty workspace</p><h1 className="mt-2 text-3xl font-black">Welcome, {profile?.userId?.name || 'Faculty member'}</h1><p className="mt-2 text-sm text-violet-100">{profile?.designation || 'Academic operations'}{profile?.employeeId ? ` · ${profile.employeeId}` : ''}</p></section><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{cards.map(([label, value, Icon]) => <div key={label} className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900"><Icon className="h-5 w-5 text-violet-600" /><p className="mt-5 text-sm text-slate-500">{label}</p><p className="mt-1 text-3xl font-black">{loading ? '...' : value}</p></div>)}</div><section className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900"><h2 className="text-lg font-bold">Today&apos;s operations</h2><p className="mt-1 text-sm text-slate-500">Use the navigation to review assigned students, record attendance, and manage examination data from the live campus records.</p></section></main></div>;
};

export default FacultyDashboard;