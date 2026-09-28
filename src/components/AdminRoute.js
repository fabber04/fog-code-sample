import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const AdminRoute = ({ children }) => {
  const { currentUser, isAdmin, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <div className="text-white text-sm animate-pulse">Verifying access...</div>
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!currentUser.emailVerified) {
    return <Navigate to="/verify-email" replace />;
  }

  if (!isAdmin()) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default AdminRoute;
