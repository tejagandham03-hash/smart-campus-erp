import React, { useEffect, useState } from 'react';
import { BookOpen, Download, FileText } from 'lucide-react';
import API from '../../services/api';
import StudentNavbar from '../../components/common/StudentNavbar';

export default function StudentMaterials() {
  const [studentData, setStudentData] = useState(null);
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  const downloadMaterial = async (material) => {
    try {
      const response = await API.get(material.fileUrl, { responseType: 'blob' });
      const url = URL.createObjectURL(response.data);
      const link = document.createElement('a');
      link.href = url;
      link.download = material.fileName || material.title;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Unable to download this material.');
    }
  };

  useEffect(() => {
    const load = async () => {
      try {
        const [profileResult, materialsResult] = await Promise.allSettled([
          API.get('/user/profile'),
          API.get('/materials'),
        ]);
        if (profileResult.status === 'fulfilled') {
          setStudentData(profileResult.value.data?.data?.additionalData || null);
        }
        if (materialsResult.status === 'fulfilled') {
          setMaterials(materialsResult.value.data?.data || []);
        } else {
          const error = materialsResult.reason;
          setMessage(error.response?.data?.message || 'Unable to load learning materials.');
        }
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-white">
      <StudentNavbar studentData={studentData} />
      <main className="mx-auto max-w-7xl space-y-6 p-4 sm:p-8">
        <header className="rounded-2xl bg-indigo-700 p-6 text-white sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-200">Academic resources</p>
          <h1 className="mt-2 text-3xl font-black">Learning materials</h1>
          <p className="mt-2 text-sm text-indigo-100">Materials uploaded by your faculty for your course and semester.</p>
        </header>
        {message && <p className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-700 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-300">{message}</p>}
        {loading ? <p className="py-10 text-center text-sm text-slate-500">Loading materials...</p> : materials.length === 0 ? <section className="rounded-xl border border-slate-200 bg-white p-10 text-center dark:border-slate-800 dark:bg-slate-900"><BookOpen className="mx-auto h-10 w-10 text-slate-400" /><h2 className="mt-3 text-lg font-bold">No materials available yet</h2><p className="mt-1 text-sm text-slate-500">Faculty materials for your current course and semester will appear here.</p></section> : <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{materials.map((material) => <article key={material._id} className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900"><div className="flex items-start justify-between gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300"><FileText className="h-5 w-5" /></div><span className="text-xs font-semibold text-slate-500">Sem {material.semester}</span></div><h2 className="mt-4 font-bold">{material.title}</h2><p className="mt-1 text-sm text-slate-500">{material.subject?.code || 'Subject'}{material.subject?.name ? ` - ${material.subject.name}` : ''}</p><p className="mt-1 text-xs text-slate-400">{material.course?.code || material.course?.name || 'Course'}{material.faculty?.userId?.name ? ` · ${material.faculty.userId.name}` : ''}</p><button type="button" onClick={() => downloadMaterial(material)} className="mt-5 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-3 py-2 text-xs font-bold text-white hover:bg-indigo-700"><Download className="h-4 w-4" /> Download material</button></article>)}</section>}
      </main>
    </div>
  );
}
