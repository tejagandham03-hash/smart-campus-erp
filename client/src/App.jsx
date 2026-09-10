import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { NotificationProvider } from './context/NotificationContext';
import { useAuth } from './hooks/useAuth';
import ProtectedRoute from './routes/ProtectedRoute';
import RoleGuard from './routes/RoleGuard';
import NotificationCenter from './components/common/NotificationCenter';

// Pages
import LandingPage from './pages/public/LandingPage';
import LoginPage from './pages/auth/LoginPage';
import StudentDashboard from './pages/student/Dashboard';
import StudentProfile from './pages/student/Profile';
import StudentAttendance from './pages/student/Attendance';
import StudentTimetable from './pages/student/Timetable';
import StudentExaminations from './pages/student/Examinations';
import StudentResults from './pages/student/Results';
import StudentMaterials from './pages/student/Materials';
import StudentFees from './pages/student/Fees';
import StudentNotifications from './pages/student/Notifications';
import StudentPlacements from './pages/student/Placements';
import StudentAIAssistant from './pages/student/AIAssistant';
import StudentQueries from './pages/student/Queries';
import FacultyDashboard from './pages/faculty/Dashboard';
import FacultyStudents from './pages/faculty/Students';
import FacultyOperations from './pages/faculty/Operations';
import FacultyAttendance from './pages/faculty/Attendance';
import FacultyExaminations from './pages/faculty/Examinations';
import AdminDashboard from './pages/admin/Dashboard';
import AdminStudents from './pages/admin/Students';
import AdminFaculty from './pages/admin/Faculty';
import AdminDepartments from './pages/admin/Departments';
import AdminCourses from './pages/admin/Courses';
import AdminSubjects from './pages/admin/Subjects';
import AdminTimetable from './pages/admin/Timetable';
import AdminNotifications from './pages/admin/Notifications';
import AdminPlacements from './pages/admin/Placements';
import AdminFees from './pages/admin/Fees';
import NotFoundPage from './pages/public/NotFoundPage';

const AppRoutes = () => {
  const { user, isAuthLoading, token } = useAuth();

  if (isAuthLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin">
          <div className="h-12 w-12 border-4 border-primary-500 border-t-transparent rounded-full"></div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={token ? <Navigate to="/dashboard" /> : <LoginPage />} />
        <Route path="/admin/login" element={token ? <Navigate to="/admin" replace /> : <LoginPage restrictedRole="admin" />} />
        <Route path="/register" element={<Navigate to="/login" replace />} />

        {/* Dashboard redirect */}
        <Route
          path="/dashboard"
          element={
            user ? (
              <Navigate to={`/${user.role}`} />
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        {/* Student routes */}
        <Route
          path="/student"
          element={
            <ProtectedRoute>
              <RoleGuard requiredRole="student">
                <StudentDashboard />
              </RoleGuard>
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/profile"
          element={
            <ProtectedRoute>
              <RoleGuard requiredRole="student">
                <StudentProfile />
              </RoleGuard>
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/attendance"
          element={
            <ProtectedRoute>
              <RoleGuard requiredRole="student">
                <StudentAttendance />
              </RoleGuard>
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/timetable"
          element={
            <ProtectedRoute>
              <RoleGuard requiredRole="student">
                <StudentTimetable />
              </RoleGuard>
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/examinations"
          element={
            <ProtectedRoute>
              <RoleGuard requiredRole="student">
                <StudentExaminations />
              </RoleGuard>
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/results"
          element={
            <ProtectedRoute>
              <RoleGuard requiredRole="student">
                <StudentResults />
              </RoleGuard>
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/materials"
          element={
            <ProtectedRoute>
              <RoleGuard requiredRole="student">
                <StudentMaterials />
              </RoleGuard>
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/fees"
          element={
            <ProtectedRoute>
              <RoleGuard requiredRole="student">
                <StudentFees />
              </RoleGuard>
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/notifications"
          element={
            <ProtectedRoute>
              <RoleGuard requiredRole="student">
                <StudentNotifications />
              </RoleGuard>
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/placements"
          element={
            <ProtectedRoute>
              <RoleGuard requiredRole="student">
                <StudentPlacements />
              </RoleGuard>
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/ai-assistant"
          element={
            <ProtectedRoute>
              <RoleGuard requiredRole="student">
                <StudentAIAssistant />
              </RoleGuard>
            </ProtectedRoute>
          }
        />
        <Route path="/student/queries" element={<ProtectedRoute><RoleGuard requiredRole="student"><StudentQueries /></RoleGuard></ProtectedRoute>} />

        {/* Faculty routes */}
        <Route
          path="/faculty"
          element={
            <ProtectedRoute>
              <RoleGuard requiredRole="faculty">
                <FacultyDashboard />
              </RoleGuard>
            </ProtectedRoute>
          }
        />
        <Route
          path="/faculty/attendance"
          element={
            <ProtectedRoute>
              <RoleGuard requiredRole="faculty">
                <FacultyAttendance />
              </RoleGuard>
            </ProtectedRoute>
          }
        />
        <Route
          path="/faculty/students"
          element={
            <ProtectedRoute>
              <RoleGuard requiredRole="faculty">
                <FacultyStudents />
              </RoleGuard>
            </ProtectedRoute>
          }
        />
        <Route
          path="/faculty/operations"
          element={
            <ProtectedRoute>
              <RoleGuard requiredRole="faculty">
                <FacultyOperations />
              </RoleGuard>
            </ProtectedRoute>
          }
        />
        <Route
          path="/faculty/examinations"
          element={
            <ProtectedRoute>
              <RoleGuard requiredRole="faculty">
                <FacultyExaminations />
              </RoleGuard>
            </ProtectedRoute>
          }
        />

        {/* Admin routes */}
        <Route
          path="/admin"
          element={
            user?.role === 'admin' && token ? (
              <ProtectedRoute>
                <RoleGuard requiredRole="admin">
                  <AdminDashboard />
                </RoleGuard>
              </ProtectedRoute>
            ) : <LoginPage restrictedRole="admin" />
          }
        />
        <Route
          path="/admin/students"
          element={
            <ProtectedRoute>
              <RoleGuard requiredRole="admin">
                <AdminStudents />
              </RoleGuard>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/faculty"
          element={
            <ProtectedRoute>
              <RoleGuard requiredRole="admin">
                <AdminFaculty />
              </RoleGuard>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/departments"
          element={
            <ProtectedRoute>
              <RoleGuard requiredRole="admin">
                <AdminDepartments />
              </RoleGuard>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/courses"
          element={
            <ProtectedRoute>
              <RoleGuard requiredRole="admin">
                <AdminCourses />
              </RoleGuard>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/subjects"
          element={
            <ProtectedRoute>
              <RoleGuard requiredRole="admin">
                <AdminSubjects />
              </RoleGuard>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/timetable"
          element={
            <ProtectedRoute>
              <RoleGuard requiredRole="admin">
                <AdminTimetable />
              </RoleGuard>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/notifications"
          element={
            <ProtectedRoute>
              <RoleGuard requiredRole="admin">
                <AdminNotifications />
              </RoleGuard>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/placements"
          element={
            <ProtectedRoute>
              <RoleGuard requiredRole="admin">
                <AdminPlacements />
              </RoleGuard>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/fees"
          element={
            <ProtectedRoute>
              <RoleGuard requiredRole="admin">
                <AdminFees />
              </RoleGuard>
            </ProtectedRoute>
          }
        />

        {/* Catch-all */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>

      <NotificationCenter />
    </>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <ThemeProvider>
          <NotificationProvider>
            <AppRoutes />
          </NotificationProvider>
        </ThemeProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
