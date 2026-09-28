import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const RequireVerifiedEmail = ({ children }) => {
  const { currentUser } = useAuth();

  if (currentUser && !currentUser.emailVerified) {
    return <Navigate to="/verify-email" replace />;
  }

  return children;
};

export default RequireVerifiedEmail;
