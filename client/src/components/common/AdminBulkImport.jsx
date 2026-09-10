import React, { useState } from 'react';
import { Download, Upload } from 'lucide-react';
import * as XLSX from 'xlsx';
import API from '../../services/api';

export default function AdminBulkImport({ type }) {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState('');
  const label = type === 'faculty' ? 'faculty' : 'student';

  const downloadTemplate = () => {
    try {
      const headers = type === 'faculty'
        ? ['Name', 'Email', 'Password', 'Phone', 'Employee ID', 'Department Code', 'Designation', 'Qualification', 'Joining Date']
        : ['Name', 'Email', 'Password', 'Phone', 'Student ID', 'Department Code', 'Course Code', 'Semester', 'Section', 'Assigned Faculty IDs'];
      const worksheet = XLSX.utils.aoa_to_sheet([headers]);
      worksheet['!cols'] = headers.map(() => ({ wch: 22 }));
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, type === 'faculty' ? 'Faculty' : 'Students');
      const buffer = XLSX.write(workbook, { type: 'array', bookType: 'xlsx' });
      const url = URL.createObjectURL(new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }));
      const link = document.createElement('a');
      link.href = url;
      link.download = `${label}-import-template.xlsx`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
      setMessage('Template downloaded.');
    } catch {
      setMessage('Template download failed.');
    }
  };

  const upload = async (event) => {
    event.preventDefault();
    if (!file) return setMessage('Choose an Excel file first.');
    const body = new FormData();
    body.append('file', file);
    try {
      const response = await API.post(`/admin/import/bulk/${type}`, body, { headers: { 'Content-Type': 'multipart/form-data' } });
      setMessage(response.data?.message || 'Import completed.');
      setFile(null);
      event.target.reset();
    } catch (error) {
      const details = error.response?.data?.errors;
      setMessage(details?.length ? details.join(' ') : error.response?.data?.message || 'Import failed.');
    }
  };

  return <section className="rounded-xl border border-cyan-200 bg-cyan-50 p-4 dark:border-cyan-900 dark:bg-cyan-950/20"><h2 className="text-sm font-bold capitalize">Bulk {label} import</h2><p className="mt-1 text-xs text-slate-600 dark:text-slate-300">Download the live template, fill it with your records, then upload it for validation.</p><div className="mt-3 flex flex-wrap gap-2"><button type="button" onClick={downloadTemplate} className="inline-flex items-center gap-2 rounded-lg border border-cyan-300 bg-white px-3 py-2 text-xs font-bold text-cyan-800 dark:border-cyan-800 dark:bg-slate-900 dark:text-cyan-300"><Download className="h-4 w-4" /> Download template</button><form onSubmit={upload} className="flex flex-wrap gap-2"><input required type="file" accept=".xlsx,.xls,.csv" onChange={(event) => setFile(event.target.files?.[0] || null)} className="max-w-full rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-xs dark:border-slate-700 dark:bg-slate-900" /><button className="inline-flex items-center gap-2 rounded-lg bg-cyan-700 px-3 py-2 text-xs font-bold text-white"><Upload className="h-4 w-4" /> Import</button></form></div>{message && <p className="mt-2 text-xs font-semibold text-slate-700 dark:text-slate-200">{message}</p>}</section>;
}
