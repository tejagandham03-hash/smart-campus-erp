import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import StudentNavbar from '../../components/common/StudentNavbar';
import {
  User,
  Mail,
  Phone,
  MapPin,
  GraduationCap,
  Award,
  Calendar,
  Shield,
  CheckCircle2,
  Save,
} from 'lucide-react';

const ProfilePage = () => {
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState(null);
  const [studentData, setStudentData] = useState(null);
  const [formData, setFormData] = useState({ phone: '', name: '' });
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const res = await API.get('/user/profile');
        const user = res.data?.data?.user;
        const student = res.data?.data?.additionalData;
        setUserProfile(user);
        setStudentData(student);
        setFormData({
          phone: user?.phone || student?.guardianPhone || '',
          name: user?.name || '',
        });
      } catch (err) {
        console.error('Error fetching profile', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await API.put('/user/profile', {
        name: formData.name,
        phone: formData.phone,
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err) {
      console.error('Failed to update profile', err);
      alert('Failed to update profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100">
      <StudentNavbar studentData={studentData} />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
            <User className="w-6 h-6 text-indigo-600" />
            Student Academic Profile
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Official Institutional Records • PB Siddhartha College of Arts & Science
          </p>
        </div>

        {saveSuccess && (
          <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            Profile details updated successfully!
          </div>
        )}

        {/* Profile Card */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 sm:p-8 border border-slate-200 dark:border-slate-700 shadow-xs">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 pb-6 border-b border-slate-100 dark:border-slate-700">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-indigo-600 to-blue-600 text-white font-black text-2xl flex items-center justify-center shadow-md shrink-0">
              {userProfile?.name ? userProfile.name.charAt(0) : 'S'}
            </div>
            <div className="flex-1 text-center sm:text-left">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  {userProfile?.name}
                </h3>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-xs font-semibold">
                  Active Student
                </span>
              </div>
              <p className="text-xs text-slate-500 mb-2">
                Roll Number: <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">{studentData?.studentId || 'N/A'}</span>
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                {studentData?.course?.name || 'Undergraduate Degree'} • 
                Department of {studentData?.department?.name || 'Computer Science & Applications'}
              </p>
            </div>
          </div>

          {/* Academic Progression Info */}
          <div className="py-6 border-b border-slate-100 dark:border-slate-700">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-indigo-600" />
              6-Semester Academic Enrolment
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-750 text-xs">
                <span className="text-slate-400 block mb-1">Degree Program</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{studentData?.course?.code || 'BCA'} (3 Years)</span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-750 text-xs">
                <span className="text-slate-400 block mb-1">Academic Year</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">Year {studentData?.year || 1} of 3</span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-750 text-xs">
                <span className="text-slate-400 block mb-1">Current Semester</span>
                <span className="font-bold text-indigo-600 dark:text-indigo-400">Semester {studentData?.semester || 1} / 6</span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-750 text-xs">
                <span className="text-slate-400 block mb-1">Class Section</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">Section {studentData?.section || 'A'}</span>
              </div>
            </div>
          </div>

          {/* Guardian & Contact Info Form */}
          <form onSubmit={handleUpdate} className="pt-6 space-y-4">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Shield className="w-4 h-4 text-indigo-600" />
              Personal & Contact Details
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-750"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  College Email (Institutional)
                </label>
                <input
                  type="text"
                  disabled
                  value={userProfile?.email || ''}
                  className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-700 text-slate-500 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Contact Phone
                </label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="e.g. 9848012345"
                  className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-750"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Guardian Name
                </label>
                <input
                  type="text"
                  disabled
                  value={studentData?.guardianName || 'Parent / Guardian'}
                  className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-700 text-slate-500 cursor-not-allowed"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Residential Address
                </label>
                <input
                  type="text"
                  disabled
                  value={studentData?.address || 'Vijayawada, Andhra Pradesh'}
                  className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-700 text-slate-500 cursor-not-allowed"
                />
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button
                type="submit"
                disabled={isSaving}
                className="px-5 py-2.5 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white transition flex items-center gap-2 shadow-xs"
              >
                <Save className="w-3.5 h-3.5" />
                {isSaving ? 'Saving Changes...' : 'Save Profile Changes'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default ProfilePage;
