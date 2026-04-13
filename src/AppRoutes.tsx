import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import AdminLayout from '@/components/layout/AdminLayout';
import { RequireAuth, RequireAdmin, RedirectIfAuth } from '@/components/guards/RouteGuards';

import HomePage         from '@/pages/HomePage';
import RoomsPage        from '@/pages/RoomsPage';
import RoomDetailPage   from '@/pages/RoomDetailPage';
import LoginPage        from '@/pages/LoginPage';
import RegisterPage     from '@/pages/RegisterPage';
import MyBookingsPage   from '@/pages/MyBookingsPage';
import PaymentPage      from '@/pages/PaymentPage';
import NotFoundPage     from '@/pages/NotFoundPage';

import AdminDashboard    from '@/pages/admin/AdminDashboard';
import AdminBookingsPage from '@/pages/admin/AdminBookingsPage';
import AdminPaymentsPage from '@/pages/admin/AdminPaymentsPage';
import AdminRoomsPage    from '@/pages/admin/AdminRoomsPage';

/** Pages that render without the public Navbar/Footer */
function AdminRoutes() {
  return (
    <RequireAdmin>
      <AdminLayout>
        <Routes>
          <Route index          element={<AdminDashboard    />} />
          <Route path="bookings" element={<AdminBookingsPage />} />
          <Route path="payments" element={<AdminPaymentsPage />} />
          <Route path="rooms"    element={<AdminRoomsPage    />} />
        </Routes>
      </AdminLayout>
    </RequireAdmin>
  );
}

/** All public-facing routes wrapped in Navbar + Footer */
function PublicLayout() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/"            element={<HomePage />} />
          <Route path="/rooms"       element={<RoomsPage />} />
          <Route path="/rooms/:id"   element={<RoomDetailPage />} />

          <Route path="/login"    element={<RedirectIfAuth><LoginPage /></RedirectIfAuth>} />
          <Route path="/register" element={<RedirectIfAuth><RegisterPage /></RedirectIfAuth>} />

          <Route path="/my-bookings"          element={<RequireAuth><MyBookingsPage /></RequireAuth>} />
          <Route path="/bookings/:id/payment" element={<RequireAuth><PaymentPage    /></RequireAuth>} />

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/admin/*" element={<AdminRoutes />} />
      <Route path="/*"       element={<PublicLayout />} />
    </Routes>
  );
}
