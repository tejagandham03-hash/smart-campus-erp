import React, { useEffect, useState } from 'react';
import { KeyRound, Save, User } from 'lucide-react';
import API from '../../services/api';
import AdminNavbar from '../../components/common/AdminNavbar';

export default function AdminProfile() {
  const [form, setForm] = useState({ name: '', username: '', currentPassword: '', password: '', confirmPassword: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  useEffect(() => {
    API.get('/user/profile')
      .then((response) => {
        const user = response.data?.data?.user;
        setForm((current) => ({ ...current, name: user?.name || '', username: user?.username || '' }));
      })
      .catch((error) => setMessage({ text: error.response?.data?.message || 'Unable to load your profile.', type: 'error' }))
      .finally(() => setLoading(false));
  }, []);

  const updateField = (event) => setForm({ ...form, [event.target.name]: event.target.value });

  const saveProfile = async (event) => {
    event.preventDefault();

    if (form.password || form.currentPassword) {
      if (!form.currentPassword) {
        setMessage({ text: 'Current password is required to change the password.', type: 'error' });
        return;
      }
      if (form.password.length < 6) {
        setMessage({ text: 'New password must be at least 6 characters.', type: 'error' });
        return;
      }
      if (form.password !== form.confirmPassword) {
        setMessage({ text: 'Passwords do not match.', type: 'error' });
        return;
      }
    }

    setSaving(true);
    setMessage({ text: '', type: '' });
    try {
      await API.put('/user/profile', {
        name: form.name,
        username: form.username,
        ...(form.password ? { currentPassword: form.currentPassword, password: form.password } : {}),
      });
      setForm({ ...form, currentPassword: '', password: '', confirmPassword: '' });
      setMessage({ text: 'Admin profile updated successfully.', type: 'success' });
    } catch (error) {
      setMessage({ text: error.response?.data?.message || 'The profile could not be updated.', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-white">
      <AdminNavbar />
      <main className="mx-auto max-w-3xl space-y-6 p-4 sm:p-8">
        <header>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-600">Administration</p>
          <h1 className="mt-2 text-3xl font-black">Admin account</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Update your display name, username, or password.</p>
        </header>
        {message.text && <p className={`rounded-lg p-3 text-sm font-semibold ${message.type === 'error' ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-300' : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300'}`}>{message.text}</p>}
        <form onSubmit={saveProfile} className="space-y-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <section className="space-y-4">
            <h2 className="flex items-center gap-2 text-lg font-bold"><User className="h-5 w-5 text-cyan-600" /> Account identity</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="text-sm font-semibold">Display name<input required name="name" value={form.name} onChange={updateField} disabled={loading} className="mt-1 w-full rounded-lg border border-slate-300 bg-transparent px-3 py-2 font-normal outline-none focus:border-cyan-500 dark:border-slate-700" /></label>
              <label className="text-sm font-semibold">Username<input name="username" value={form.username} onChange={updateField} disabled={loading} className="mt-1 w-full rounded-lg border border-slate-300 bg-transparent px-3 py-2 font-normal outline-none focus:border-cyan-500 dark:border-slate-700" /></label>
            </div>
          </section>
          <section className="space-y-4 border-t border-slate-200 pt-5 dark:border-slate-800">
            <h2 className="flex items-center gap-2 text-lg font-bold"><KeyRound className="h-5 w-5 text-cyan-600" /> Change password</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="text-sm font-semibold">Current password<input name="currentPassword" type="password" value={form.currentPassword} onChange={updateField} placeholder="Enter current password" className="mt-1 w-full rounded-lg border border-slate-300 bg-transparent px-3 py-2 font-normal outline-none focus:border-cyan-500 dark:border-slate-700" /></label>
              <label className="text-sm font-semibold">New password<input name="password" type="password" minLength="6" value={form.password} onChange={updateField} placeholder="Minimum 6 characters" className="mt-1 w-full rounded-lg border border-slate-300 bg-transparent px-3 py-2 font-normal outline-none focus:border-cyan-500 dark:border-slate-700" /></label>
              <label className="text-sm font-semibold sm:col-span-2">Confirm new password<input name="confirmPassword" type="password" minLength="6" value={form.confirmPassword} onChange={updateField} className="mt-1 w-full rounded-lg border border-slate-300 bg-transparent px-3 py-2 font-normal outline-none focus:border-cyan-500 dark:border-slate-700" /></label>
            </div>
          </section>
          <button disabled={saving || loading} className="inline-flex items-center gap-2 rounded-lg bg-cyan-600 px-4 py-2 text-sm font-bold text-white disabled:opacity-50"><Save className="h-4 w-4" />{saving ? 'Saving...' : 'Save changes'}</button>
        </form>
      </main>
    </div>
  );
}
