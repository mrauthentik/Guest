import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { useEffect } from 'react';
import { AuthProvider } from '@/context/AuthContext';
import AppRoutes from '@/AppRoutes';
import ScrollToTop from '@/components/ScrollToTop';
import { useAutoConfirmReviews } from '@/hooks/useQueries';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry:              1,
      staleTime:          60_000,
      refetchOnWindowFocus: false,
    },
  },
});

/** Silently auto-confirms any PENDING_REVIEW bookings past the 72h window on mount */
function AppInit() {
  const autoConfirm = useAutoConfirmReviews();
  useEffect(() => {
    autoConfirm.mutate();
  // run once on mount only
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return null;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ScrollToTop />
        <AuthProvider>
          <AppInit />
          <AppRoutes />
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#0d0d1a',
                color:      '#ffffff',
                border:     '1px solid rgba(255,255,255,0.1)',
                borderRadius: '12px',
                fontSize:   '14px',
                fontFamily: 'Inter, sans-serif',
              },
              success: {
                iconTheme: { primary: '#10bc96', secondary: '#020207' },
              },
              error: {
                iconTheme: { primary: '#ef4444', secondary: '#020207' },
              },
            }}
          />
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
