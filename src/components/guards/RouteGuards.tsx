import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { PageLoader } from '@/components/ui/LoadingStates';

/** Requires authenticated user — redirects to /login if not. */
export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) return <PageLoader />;
  if (!user)     return <Navigate to="/login" state={{ from: location }} replace />;
  return <>{children}</>;
}

/** Requires admin role — redirects to home if not admin. */
export function RequireAdmin({ children }: { children: React.ReactNode }) {
  const { user, isAdmin, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) return <PageLoader />;
  if (!user)     return <Navigate to="/login" state={{ from: location }} replace />;
  if (!isAdmin)  return <Navigate to="/" replace />;
  return <>{children}</>;
}

/** Redirects authenticated users away from auth pages. */
export function RedirectIfAuth({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();

  if (isLoading) return <PageLoader />;
  if (user)      return <Navigate to="/" replace />;
  return <>{children}</>;
}
