import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import StudentNavbar from '../../components/common/StudentNavbar';
import {
  Briefcase,
  MapPin,
  Calendar,
  Award,
  CheckCircle2,
  Building2,
  Sparkles,
  ExternalLink,
} from 'lucide-react';

const PlacementsPage = () => {
  const [loading, setLoading] = useState(true);
  const [studentData, setStudentData] = useState(null);
  const [placements, setPlacements] = useState([]);
  const [appliedJobs, setAppliedJobs] = useState({});
  const [successToast, setSuccessToast] = useState('');

  useEffect(() => {
    const fetchPlacements = async () => {
      try {
        setLoading(true);
        const profileRes = await API.get('/user/profile');
        const student = profileRes.data?.data?.additionalData;
        setStudentData(student);

        const res = await API.get('/placements');
        setPlacements(res.data?.data || []);
      } catch (err) {
        console.error('Error fetching placements', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPlacements();
  }, []);

  const handleApply = async (id, companyName) => {
    try {
      await API.post(`/placements/${id}/apply`, { placement: id });
      setAppliedJobs((prev) => ({ ...prev, [id]: true }));
      setSuccessToast(`Application submitted successfully for ${companyName}! Placement Cell will notify you of drive dates.`);
      setTimeout(() => setSuccessToast(''), 5000);
    } catch (error) {
      setSuccessToast(error.response?.data?.message || 'Unable to submit the placement application.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100">
      <StudentNavbar studentData={studentData} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
              <Briefcase className="w-6 h-6 text-indigo-600" />
              Career Guidance & Campus Placement Cell
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              PB Siddhartha College of Arts & Science • Exclusive campus drives for 3-year undergraduate degree students
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="px-3 py-1 rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 font-semibold">
              Final Year (Semester 5 & 6) Placement Drives
            </span>
          </div>
        </div>

        {successToast && (
          <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            {successToast}
          </div>
        )}

        {/* Highlight Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700 shadow-xs">
            <span className="text-xs font-semibold text-slate-500">Active Campus Drives</span>
            <p className="text-3xl font-black text-slate-900 dark:text-white mt-2">
              {loading ? '...' : placements.length} Companies
            </p>
            <p className="text-xs text-slate-500 mt-2">Tier-1 IT & Corporate recruiters</p>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700 shadow-xs">
            <span className="text-xs font-semibold text-slate-500">Highest Package Offered</span>
            <p className="text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-2">
              ₹4.5 LPA
            </p>
            <p className="text-xs text-slate-500 mt-2">Undergraduate BCA / B.Sc / B.Com</p>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700 shadow-xs">
            <span className="text-xs font-semibold text-slate-500">Placement Training</span>
            <p className="text-3xl font-black text-indigo-600 dark:text-indigo-400 mt-2">
              Active
            </p>
            <p className="text-xs text-slate-500 mt-2">Aptitude, Soft Skills, Technical Mock Tests</p>
          </div>
        </div>

        {/* Placement Drives List */}
        <div className="space-y-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Available Campus Recruitment Openings
          </h3>

          {loading ? (
            <p className="text-xs text-slate-500 py-8 text-center">Loading recruitment drives...</p>
          ) : placements.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {placements.map((p) => {
                const isApplied = appliedJobs[p._id];
                return (
                  <div
                    key={p._id}
                    className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 shadow-xs flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div>
                          <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5 mb-1">
                            <Building2 className="w-3.5 h-3.5" />
                            {p.companyName}
                          </span>
                          <h4 className="text-lg font-bold text-slate-900 dark:text-white">
                            {p.jobTitle}
                          </h4>
                        </div>
                        <span className="px-3 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 font-bold text-xs border border-emerald-200 dark:border-emerald-800">
                          ₹{(p.salary / 100000).toFixed(2)} LPA
                        </span>
                      </div>

                      <p className="text-xs text-slate-600 dark:text-slate-300 mb-4 leading-relaxed">
                        {p.description}
                      </p>

                      <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-750 text-xs space-y-1.5 mb-4">
                        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span><strong>Location:</strong> {p.location || 'Multiple Locations'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                          <Award className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span><strong>Eligibility:</strong> {p.eligibility}</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                          <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span><strong>Application Deadline:</strong> {new Date(p.deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                        </div>
                      </div>

                      {p.requirements && (
                        <div className="mb-4">
                          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                            Required Skills
                          </span>
                          <p className="text-xs text-slate-700 dark:text-slate-300">
                            {p.requirements}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="pt-4 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between">
                      <span className="text-xs text-slate-500">Autonomous Placement Cell</span>
                      {isApplied ? (
                        <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold text-xs">
                          <CheckCircle2 className="w-4 h-4" /> Applied
                        </span>
                      ) : (
                        <button
                          onClick={() => handleApply(p._id, p.companyName)}
                          className="px-5 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition shadow-xs"
                        >
                          Apply for Drive
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-xs text-slate-500 py-6 text-center">No active campus recruitment drives found.</p>
          )}
        </div>
      </main>
    </div>
  );
};

export default PlacementsPage;