import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { User, UserRoleTier } from '../../types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  /** Optional role check. When it fails, the user is redirected (no error screen). */
  allow?: (tier: UserRoleTier, user: User) => boolean;
  /** Where to send logged-in users who fail `allow`. */
  deniedRedirect?: string;
}

/**
 * ProtectedRoute | wraps portal pages and redirects unauthenticated
 * visitors to the portal login page, preserving the intended destination
 * so they are automatically redirected after a successful login.
 * With `allow`, also redirects logged-in users who lack the required role.
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allow,
  deniedRedirect = '/portal',
}) => {
  const { isAuthenticated, currentTier, currentUser } = useApp();
  const location = useLocation();

  if (!isAuthenticated) {
    // Preserve the path the user tried to visit so we can redirect after login
    return <Navigate to="/portal/login" state={{ from: location }} replace />;
  }

  if (allow && !allow(currentTier, currentUser)) {
    return <Navigate to={deniedRedirect} replace />;
  }

  return <>{children}</>;
};
