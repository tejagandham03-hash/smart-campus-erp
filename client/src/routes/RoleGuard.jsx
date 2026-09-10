import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const RoleGuard = ({ children, requiredRole }) => {
  const { user } = useAuth();

  if (!user || user.role !== requiredRole) {
    // Redirect to appropriate dashboard based on user role
    const roleRoutes = {
      student: '/student',
      faculty: '/faculty',
      admin: '/admin',
    };
    const redirectTo = user ? roleRoutes[user.role] || '/' : '/login';
    return <Navigate to={redirectTo} replace />;
  }

  return children;
};

export default RoleGuard;
