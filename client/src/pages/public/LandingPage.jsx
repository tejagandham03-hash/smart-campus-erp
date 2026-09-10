import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  BookOpen,
  Users,
  Clock,
  FileText,
  BarChart3,
  Bell,
  Briefcase,
  Sparkles,
  ArrowRight,
  Check,
  Award,
  GraduationCap,
  Calendar,
  Layers,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

const LandingPage = () => {
  const { user, logout } = useAuth();
  const highlights = [
    { label: 'Autonomous Institution', sub: 'Affiliated to Krishna University' },
    { label: 'NAAC Accredited', sub: "Re-accredited with 'A+' Grade" },
    { label: 'Academic Structure', sub: '3-Year Degree • 6 Semesters' },
    { label: 'Sponsored By', sub: 'Siddhartha Academy (SAGTE)' },
  ];

  const features = [
    {
      icon: BookOpen,
      title: '6-Semester CBCS Curriculum',
      description: 'Streamlined academic records for 3-year autonomous degree programs (Semesters 1 to 6).',
    },
    {
      icon: FileText,
      title: 'Autonomous Examinations',
      description: 'CIA midterms, Semester End Examinations (SEE), grading, and digital hall ticket tracking.',
    },
    {
      icon: Clock,
      title: 'Attendance & Timetables',
      description: 'Real-time period-wise attendance, 75% eligibility alerts, and dynamic section schedules.',
    },
    {
      icon: Briefcase,
      title: 'Campus Placements',
      description: 'Recruitment drives with top hiring partners: TCS, Wipro, Infosys, Deloitte, and Tech Mahindra.',
    },
    {
      icon: Sparkles,
      title: 'Siddhartha AI Assistant',
      description: 'AI-powered instant helper for college schedules, syllabus inquiries, and student assistance.',
    },
    {
      icon: BarChart3,
      title: 'Fee & Finance Portal',
      description: 'Autonomous semester fee management, partial dues tracking, and instant payment receipts.',
    },
    {
      icon: Users,
      title: 'Faculty & Department Hub',
      description: 'Faculty assignment across CSA, Commerce, Physical Sciences, and Humanities.',
    },
    {
      icon: Bell,
      title: 'Real-time Campus Circulars',
      description: 'Instant broadcasts for exam timetables, Siddhartha Youth Fest, and cultural activities.',
    },
  ];

  const programs = [
    {
      name: 'Computer Applications & Data Science',
      dept: 'Dept of Computer Science',
      duration: '3 Years (6 Semesters)',
      degrees: ['BCA - Bachelor of Computer Applications', 'B.Sc Computer Science & Data Science'],
      tag: 'BCA / B.Sc',
    },
    {
      name: 'Commerce & Business Administration',
      dept: 'Dept of Commerce & Management',
      duration: '3 Years (6 Semesters)',
      degrees: ['B.Com (Honours & Computer Applications)', 'BBA - Bachelor of Business Administration'],
      tag: 'B.Com / BBA',
    },
    {
      name: 'Physical, Mathematical & Social Sciences',
      dept: 'Dept of Sciences & Humanities',
      duration: '3 Years (6 Semesters)',
      degrees: ['B.Sc MPCs (Maths, Physics, CS)', 'BA English, Economics & Political Science'],
      tag: 'B.Sc / BA',
    },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100">
      {/* Navigation */}
      <nav className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-blue-500 flex items-center justify-center text-white shadow-md font-bold text-lg">
              PBS
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white leading-tight">
                PB Siddhartha College of Arts & Science
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Autonomous • Affiliated to Krishna University • Vijayawada
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {user ? (
              <>
                <Link to={`/${user.role}`} className="px-4 py-2 text-sm font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm transition">Open dashboard</Link>
                <button onClick={logout} className="px-4 py-2 text-sm font-medium rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition">Sign out</button>
              </>
            ) : (
              <>
                <Link to="/login" className="px-4 py-2 text-sm font-medium rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition">Sign in</Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-16 lg:py-24 px-4 bg-gradient-to-b from-indigo-50/60 via-white to-white dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 overflow-hidden">
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 text-xs font-semibold mb-6 border border-indigo-200 dark:border-indigo-800">
              <Award className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              Autonomous College • NAAC 'A+' Grade • 6 Semesters Undergraduate Model
            </div>

            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-6">
              Empowering Minds at <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-500">
                PB Siddhartha College
              </span>
            </h2>

            <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 mb-8 max-w-3xl mx-auto leading-relaxed">
              Unified Campus ERP for Parvathaneni Brahmayya Siddhartha College of Arts & Science.
              Purpose-built for our 3-year autonomous degree curriculum across 6 comprehensive semesters.
            </p>

          </motion.div>

          {/* Quick Institutional Highlights */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16 pt-10 border-t border-slate-200 dark:border-slate-800 text-left">
            {highlights.map((item, index) => (
              <div key={index} className="p-4 rounded-xl bg-white/70 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 shadow-xs">
                <p className="font-bold text-sm text-slate-900 dark:text-white">{item.label}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{item.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Programs (6-Semesters) Section */}
      <section className="py-16 px-4 max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white">
            6-Semester Degree Programs
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mt-2 text-sm max-w-2xl mx-auto">
            Our 3-year autonomous undergraduate curriculum is structured into six focused semesters with Continuous Internal Assessments (CIA) and Semester End Examinations (SEE).
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {programs.map((prog, index) => (
            <div
              key={index}
              className="rounded-2xl p-6 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex flex-col justify-between hover:shadow-md transition"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300">
                    {prog.tag}
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-indigo-500" /> {prog.duration}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">{prog.name}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">{prog.dept}</p>
                <ul className="space-y-2 mb-6">
                  {prog.degrees.map((deg, i) => (
                    <li key={i} className="text-xs text-slate-700 dark:text-slate-300 flex items-start gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-500 mt-0.5 shrink-0" />
                      <span>{deg}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="pt-4 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs font-medium text-indigo-600 dark:text-indigo-400">
                <span>Semesters 1 through 6</span>
                <span>Autonomous CBCS</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-slate-50 dark:bg-slate-800/50 border-y border-slate-200 dark:border-slate-800">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white">
              Campus ERP Capabilities
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mt-2 text-sm max-w-xl mx-auto">
              Everything students, faculty, and administrators need to operate efficiently on a single integrated system.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="p-5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-600 transition shadow-xs"
                >
                  <div className="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-3.5">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-semibold text-sm text-slate-900 dark:text-white mb-1.5">{feature.title}</h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-gradient-to-r from-indigo-600 to-blue-700 text-white text-center">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-4">
            PB Siddhartha College of Arts & Science
          </h2>
          <p className="text-base text-indigo-100 mb-8 max-w-xl mx-auto">
            Access your 6-semester grades, attendance records, exam schedules, and career placement opportunities now.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-10 px-4 text-xs border-t border-slate-800">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-center md:text-left">
            <p className="text-sm font-semibold text-white">PB Siddhartha College of Arts & Science</p>
            <p className="text-slate-400 mt-1">
              Autonomous College • Siddhartha Nagar, Moghalrajpuram, Vijayawada - 520010, AP
            </p>
          </div>
          <p>&copy; {new Date().getFullYear()} PB Siddhartha College ERP. 6-Semester Autonomous Degree Program.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
