import { useAuth } from './useAuth';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Enhanced auth hook with security checks
export const useSecureAuth = (requireAuth = true, allowedRoles?: string[]) => {
  const auth = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Security check: Block dev bypass in production
    if (!import.meta.env.DEV && (window as any).__DEV_BYPASS_ENABLED) {
      console.warn('Development bypass detected in production environment');
      (window as any).__DEV_BYPASS_ENABLED = false;
    }

    // Redirect unauthenticated users with return path
    if (requireAuth && !auth.loading && !auth.user) {
      navigate('/auth', { state: { returnTo: window.location.pathname + window.location.search } });
      return;
    }

    // Role-based access control
    if (allowedRoles && auth.user && auth.currentRole) {
      if (!allowedRoles.includes(auth.currentRole)) {
        navigate('/');
        return;
      }
    }
  }, [auth.user, auth.loading, auth.currentRole, requireAuth, allowedRoles, navigate]);

  return auth;
};

// Helper to check if user has permission for an action
export const usePermissions = () => {
  const { user, currentRole } = useAuth();

  const canCreateExperience = () => {
    return user && currentRole === 'host';
  };

  const canViewHostDashboard = () => {
    return user && currentRole === 'host';
  };

  const canAccessUserData = (targetUserId: string) => {
    return user && user.id === targetUserId;
  };

  const canModerateContent = () => {
    // Future: implement moderation roles
    return false;
  };

  return {
    canCreateExperience,
    canViewHostDashboard,
    canAccessUserData,
    canModerateContent
  };
};