import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useNotification } from '../../hooks/useNotification';

export default function AdminForgotPasswordPage() {
  const { requestPasswordReset } = useAuth();
  const { addNotification } = useNotification();
  const [form, setForm] = useState({ identifier: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [resetLink, setResetLink] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.identifier.trim()) {
      setError('Please enter your admin username or email.');
      return;
    }

    setLoading(true);
    setError('');

    const result = await requestPasswordReset(form.identifier.trim(), 'admin');
    if (result.success) {
      setSuccess(true);
      setResetLink(result.data?.resetUrl || '/admin/reset-password');
      addNotification(result.message, 'success');
    } else {
      setError(result.message);
      addNotification(result.message, 'error');
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-soft-lg dark:border-slate-700 dark:bg-slate-800">
        <div className="mb-6 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 font-black text-xl text-white">PBS</div>
          <h1 className="mt-4 text-2xl font-bold text-slate-900 dark:text-white">Forgot admin password</h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
            Enter your username or email to generate a reset link.
          </p>
        </div>

        {error && (
          <div className="mb-4 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-300">
              <CheckCircle2 className="h-4 w-4" />
              <span>Reset link prepared successfully.</span>
            </div>

            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 break-all">
              <p className="font-medium text-slate-900 dark:text-white">Next step:</p>
              <a href={resetLink} className="mt-2 inline-block text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300">
                {resetLink}
              </a>
            </div>

            <Link to="/admin/login" className="block text-center text-sm font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300">
              Back to admin login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Username or email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                <input
                  type="text"
                  value={form.identifier}
                  onChange={(e) => {
                    setForm({ identifier: e.target.value });
                    if (error) setError('');
                  }}
                  placeholder="admin or admin@college.edu"
                  className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-indigo-400"
            >
              {loading ? 'Preparing reset...' : 'Send reset link'}
            </button>
          </form>
        )}

        <div className="mt-6 text-center">
          <Link to="/admin/login" className="text-sm text-slate-600 hover:text-primary-600 dark:text-slate-400 dark:hover:text-primary-400">
            ← Back to admin login
          </Link>
        </div>
      </div>
    </div>
  );
}
