import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ShuttleProvider } from "@/contexts/ShuttleContext";
import { NotificationProvider } from "@/contexts/NotificationContext";

import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

import CustomerLogin from "./pages/customer/CustomerLogin";
import CustomerLayout from "./layouts/CustomerLayout";
import CustomerHome from "./pages/customer/CustomerHome";
import CustomerRouteDetail from "./pages/customer/CustomerRouteDetail";
import CustomerBookingNew from "./pages/customer/CustomerBookingNew";
import CustomerBookingDetail from "./pages/customer/CustomerBookingDetail";
import CustomerHistory from "./pages/customer/CustomerHistory";
import CustomerTickets from "./pages/customer/CustomerTickets";
import CustomerProfile from "./pages/customer/CustomerProfile";

import DriverLogin from "./pages/driver/DriverLogin";
import DriverLayout from "./layouts/DriverLayout";
import DriverDashboard from "./pages/driver/DriverDashboard";
import DriverTripDetail from "./pages/driver/DriverTripDetail";
import DriverTrips from "./pages/driver/DriverTrips";
import DriverTracking from "./pages/driver/DriverTracking";

import AdminLogin from "./pages/admin/AdminLogin";
import AdminLayout from "./layouts/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminRoutes from "./pages/admin/AdminRoutes";

import AdminSchedules from "./pages/admin/AdminSchedules";
import AdminDrivers from "./pages/admin/AdminDrivers";
import AdminVehicles from "./pages/admin/AdminVehicles";
import AdminAssign from "./pages/admin/AdminAssign";
import AdminBookings from "./pages/admin/AdminBookings";
import AdminReports from "./pages/admin/AdminReports";
import AdminTracking from "./pages/admin/AdminTracking";
import AdminAnalytics from "./pages/admin/AdminAnalytics";
import AdminPaymentSettings from "./pages/admin/AdminPaymentSettings";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <ShuttleProvider>
        <NotificationProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />

              {/* Customer */}
              <Route path="/customer/login" element={<CustomerLogin />} />
              <Route path="/customer" element={<CustomerLayout />}>
                <Route index element={<CustomerHome />} />
                <Route path="route/:routeId" element={<CustomerRouteDetail />} />
                <Route path="booking/new" element={<CustomerBookingNew />} />
                <Route path="booking/:bookingId" element={<CustomerBookingDetail />} />
                <Route path="history" element={<CustomerHistory />} />
                <Route path="tickets" element={<CustomerTickets />} />
                <Route path="profile" element={<CustomerProfile />} />
              </Route>

              {/* Driver */}
              <Route path="/driver/login" element={<DriverLogin />} />
              <Route path="/driver" element={<DriverLayout />}>
                <Route index element={<DriverDashboard />} />
                <Route path="trips" element={<DriverTrips />} />
                <Route path="trip/:scheduleId" element={<DriverTripDetail />} />
                <Route path="tracking" element={<DriverTracking />} />
              </Route>

              {/* Admin */}
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<AdminDashboard />} />
                <Route path="routes" element={<AdminRoutes />} />
                
                <Route path="schedules" element={<AdminSchedules />} />
                <Route path="drivers" element={<AdminDrivers />} />
                <Route path="vehicles" element={<AdminVehicles />} />
                <Route path="assign" element={<AdminAssign />} />
                <Route path="bookings" element={<AdminBookings />} />
                <Route path="reports" element={<AdminReports />} />
                <Route path="tracking" element={<AdminTracking />} />
                <Route path="analytics" element={<AdminAnalytics />} />
                <Route path="payment-settings" element={<AdminPaymentSettings />} />
              </Route>

              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </NotificationProvider>
      </ShuttleProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
