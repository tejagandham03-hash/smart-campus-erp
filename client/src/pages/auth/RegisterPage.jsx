import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Phone, Briefcase, AlertCircle, GraduationCap } from 'lucide-react';
import API from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import { useNotification } from '../../hooks/useNotification';

const RegisterPage = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const { addNotification } = useNotification();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    role: 'student',
    department: '',
    course: '',
    semester: '',
    studentId: '',
    section: '',
    employeeId: '',
    designation: '',
    qualification: '',
    joiningDate: '',
  });
  const [errors, setErrors] = useState({});
  const [departments, setDepartments] = useState([]);
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    Promise.all([API.get('/departments?status=active'), API.get('/courses?status=active')])
      .then(([departmentResponse, courseResponse]) => {
        setDepartments(departmentResponse.data?.data || []);
        setCourses(courseResponse.data?.data || []);
      })
      .catch(() => {
        setDepartments([]);
        setCourses([]);
      });
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setErrors((prev) => ({
      ...prev,
      [name]: '',
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const newErrors = {};
    if (!formData.name) newErrors.name = 'Full name is required';
    if (!formData.email) newErrors.email = 'Email is required';
    if (formData.email && !/^\S+@\S+\.\S+$/.test(formData.email.trim())) newErrors.email = 'Enter a valid email address';
    if (!formData.password) newErrors.password = 'Password is required';
    if (formData.password.length < 8) newErrors.password = 'Password must be at least 8 characters';
    if (formData.role === 'student') {
      if (!formData.department) newErrors.department = 'Department is required';
      if (!formData.course) newErrors.course = 'Course is required';
      if (!formData.semester) newErrors.semester = 'Semester is required';
      if (!formData.studentId.trim()) newErrors.studentId = 'Roll number is required';
      if (!formData.section.trim()) newErrors.section = 'Section is required';
    }
    if (formData.role === 'faculty') {
      if (!formData.department) newErrors.department = 'Department is required';
      if (!formData.employeeId.trim()) newErrors.employeeId = 'Employee ID is required';
      if (!formData.designation.trim()) newErrors.designation = 'Designation is required';
      if (!formData.qualification.trim()) newErrors.qualification = 'Qualification is required';
      if (!formData.joiningDate) newErrors.joiningDate = 'Joining date is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsLoading(false);
      return;
    }

    try {
      const result = await register({
        ...formData,
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
      });
      if (result.success) {
        addNotification('Registration successful!', 'success');
        navigate('/dashboard');
      } else {
        addNotification(result.message, 'error');
      }
    } catch (error) {
      addNotification('An unexpected error occurred', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-indigo-600 text-white font-black text-xl mb-3 shadow-md">
            PBS
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
            PB Siddhartha College
          </h1>
          <p className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold uppercase tracking-wider">
            Arts & Science • Student & Faculty Portal
          </p>
        </div>

        {/* Register Card */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-soft-lg p-8">
          <h2 className="text-2xl font-bold mb-6 text-slate-900 dark:text-white">Get Started</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name Field */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
                    errors.name ? 'border-red-500' : 'border-slate-200 dark:border-slate-600'
                  } bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500`}
                  placeholder="John Doe"
                />
              </div>
              {errors.name && (
                <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {errors.name}
                </p>
              )}
            </div>

            {/* Email Field */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
                    errors.email ? 'border-red-500' : 'border-slate-200 dark:border-slate-600'
                  } bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500`}
                  placeholder="your.email@example.com"
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {errors.email}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
                    errors.password ? 'border-red-500' : 'border-slate-200 dark:border-slate-600'
                  } bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500`}
                  placeholder="••••••••"
                />
              </div>
              {errors.password && (
                <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {errors.password}
                </p>
              )}
            </div>

            {/* Phone Field */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Phone (Optional)
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="+91 98765 43210"
                />
              </div>
            </div>

            {/* Role Field */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Role
              </label>
              <div className="relative">
                <Briefcase className="absolute left-3 top-3 w-5 h-5 text-slate-400 pointer-events-none" />
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="student">Student</option>
                  <option value="faculty">Faculty</option>
                </select>
              </div>
            </div>

            {formData.role === 'student' && (
              <div className="space-y-4 rounded-xl border border-indigo-100 bg-indigo-50/50 p-4 dark:border-indigo-900/60 dark:bg-indigo-950/20">
                <p className="flex items-center gap-2 text-sm font-bold text-indigo-700 dark:text-indigo-300"><GraduationCap className="h-4 w-4" /> Academic details</p>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Department
                  <select name="department" value={formData.department} onChange={handleInputChange} className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 dark:border-slate-600 dark:bg-slate-700">
                    <option value="">Select department</option>{departments.map((department) => <option key={department._id} value={department._id}>{department.name}</option>)}
                  </select>{errors.department && <span className="text-xs text-red-500">{errors.department}</span>}
                </label>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Course
                  <select name="course" value={formData.course} onChange={handleInputChange} className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 dark:border-slate-600 dark:bg-slate-700">
                    <option value="">Select course</option>{courses.filter((course) => !formData.department || course.department?._id === formData.department || course.department === formData.department).map((course) => <option key={course._id} value={course._id}>{course.code} - {course.name}</option>)}
                  </select>{errors.course && <span className="text-xs text-red-500">{errors.course}</span>}
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Semester
                    <select name="semester" value={formData.semester} onChange={handleInputChange} className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 dark:border-slate-600 dark:bg-slate-700"><option value="">Select</option>{[1, 2, 3, 4, 5, 6].map((semester) => <option key={semester} value={semester}>{semester}</option>)}</select>{errors.semester && <span className="text-xs text-red-500">{errors.semester}</span>}
                  </label>
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Section
                    <input name="section" value={formData.section} onChange={handleInputChange} className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 dark:border-slate-600 dark:bg-slate-700" placeholder="A" />{errors.section && <span className="text-xs text-red-500">{errors.section}</span>}
                  </label>
                </div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Roll number / Student ID
                  <input name="studentId" value={formData.studentId} onChange={handleInputChange} className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 dark:border-slate-600 dark:bg-slate-700" placeholder="Your institutional roll number" />{errors.studentId && <span className="text-xs text-red-500">{errors.studentId}</span>}
                </label>
              </div>
            )}

            {formData.role === 'faculty' && (
              <div className="space-y-4 rounded-xl border border-violet-100 bg-violet-50/50 p-4 dark:border-violet-900/60 dark:bg-violet-950/20">
                <p className="flex items-center gap-2 text-sm font-bold text-violet-700 dark:text-violet-300"><Briefcase className="h-4 w-4" /> Faculty professional details</p>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Department
                  <select name="department" value={formData.department} onChange={handleInputChange} className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 dark:border-slate-600 dark:bg-slate-700"><option value="">Select department</option>{departments.map((department) => <option key={department._id} value={department._id}>{department.name}</option>)}</select>{errors.department && <span className="text-xs text-red-500">{errors.department}</span>}
                </label>
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Employee ID<input name="employeeId" value={formData.employeeId} onChange={handleInputChange} className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 dark:border-slate-600 dark:bg-slate-700" placeholder="Institutional employee ID" />{errors.employeeId && <span className="text-xs text-red-500">{errors.employeeId}</span>}</label>
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Designation<input name="designation" value={formData.designation} onChange={handleInputChange} className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 dark:border-slate-600 dark:bg-slate-700" placeholder="Assistant Professor" />{errors.designation && <span className="text-xs text-red-500">{errors.designation}</span>}</label>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Qualification<input name="qualification" value={formData.qualification} onChange={handleInputChange} className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 dark:border-slate-600 dark:bg-slate-700" placeholder="M.Tech, PhD" />{errors.qualification && <span className="text-xs text-red-500">{errors.qualification}</span>}</label>
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Joining date<input type="date" name="joiningDate" value={formData.joiningDate} onChange={handleInputChange} className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 dark:border-slate-600 dark:bg-slate-700" />{errors.joiningDate && <span className="text-xs text-red-500">{errors.joiningDate}</span>}</label>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white font-semibold py-2.5 rounded-lg transition-colors mt-6"
            >
              {isLoading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          {/* Login Link */}
          <p className="mt-6 text-center text-slate-600 dark:text-slate-400">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-600 dark:text-primary-400 font-semibold hover:underline">
              Login here
            </Link>
          </p>
        </div>

        {/* Back to Home */}
        <div className="mt-6 text-center">
          <Link to="/" className="text-slate-600 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400">
            ← Back to Home
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default RegisterPage;
