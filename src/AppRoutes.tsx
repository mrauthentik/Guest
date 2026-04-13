import { Routes, Route } from 'react-router-dom';
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
import ContactPage      from '@/pages/ContactPage';
import AboutPage        from '@/pages/AboutPage';
import {
  TermsPage, PrivacyPage, RefundPolicyPage,
  BookingConditionsPage, CookiePolicyPage,
} from '@/pages/LegalPages';

import AdminDashboard     from '@/pages/admin/AdminDashboard';
import AdminBookingsPage  from '@/pages/admin/AdminBookingsPage';
import AdminPaymentsPage  from '@/pages/admin/AdminPaymentsPage';
import AdminRoomsPage     from '@/pages/admin/AdminRoomsPage';
import AdminComplaintsPage from '@/pages/admin/AdminComplaintsPage';

function AdminRoutes() {
  return (
    <RequireAdmin>
      <AdminLayout>
        <Routes>
          <Route index              element={<AdminDashboard      />} />
          <Route path="bookings"    element={<AdminBookingsPage   />} />
          <Route path="payments"    element={<AdminPaymentsPage   />} />
          <Route path="rooms"       element={<AdminRoomsPage      />} />
          <Route path="complaints"  element={<AdminComplaintsPage />} />
        </Routes>
      </AdminLayout>
    </RequireAdmin>
  );
}

function PublicLayout() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">
        <Routes>
          {/* Core */}
          <Route path="/"            element={<HomePage />} />
          <Route path="/rooms"       element={<RoomsPage />} />
          <Route path="/rooms/:id"   element={<RoomDetailPage />} />
          <Route path="/about"       element={<AboutPage />} />
          <Route path="/contact"     element={<ContactPage />} />

          {/* Auth */}
          <Route path="/login"    element={<RedirectIfAuth><LoginPage /></RedirectIfAuth>} />
          <Route path="/register" element={<RedirectIfAuth><RegisterPage /></RedirectIfAuth>} />

          {/* Protected */}
          <Route path="/my-bookings"          element={<RequireAuth><MyBookingsPage /></RequireAuth>} />
          <Route path="/bookings/:id/payment" element={<RequireAuth><PaymentPage    /></RequireAuth>} />

          {/* Legal */}
          <Route path="/terms"               element={<TermsPage />} />
          <Route path="/privacy"             element={<PrivacyPage />} />
          <Route path="/refund-policy"       element={<RefundPolicyPage />} />
          <Route path="/booking-conditions"  element={<BookingConditionsPage />} />
          <Route path="/cookie-policy"       element={<CookiePolicyPage />} />

          {/* 404 */}
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
