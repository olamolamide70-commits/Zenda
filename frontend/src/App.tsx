import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Route, Routes } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { TooltipProvider } from "@radix-ui/react-tooltip";
import { AppProvider } from "@/context/AppContext";
import { Toaster } from "@/components/ui/sonner";

// Layouts
import MainLayout from "@/layouts/MainLayout";
import DashboardLayout from "@/layouts/DashboardLayout";
import AdminLayout from "@/layouts/AdminLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import AssistantChat from "@/components/AssistantChat";
import SearchPalette from "@/components/SearchPalette";

// Public pages
import Home from "@/pages/public/Home";
import Marketplace from "@/pages/public/Marketplace";
import ProductDetails from "@/pages/public/ProductDetails";
import InstallmentCalculator from "@/pages/public/InstallmentCalculator";
import About from "@/pages/public/About";
import Contact from "@/pages/public/Contact";
import Terms from "@/pages/public/Terms";
import Privacy from "@/pages/public/Privacy";
import Cart from "@/pages/public/Cart";
import Checkout from "@/pages/public/Checkout";

// Auth pages
import Login from "@/pages/auth/Login";
import Register from "@/pages/auth/Register";
import VerifyOTP from "@/pages/auth/VerifyOTP";
import ForgotPassword from "@/pages/auth/ForgotPassword";
import ResetPassword from "@/pages/auth/ResetPassword";

// Dashboard pages
import DashboardHome from "@/pages/dashboard/DashboardHome";
import Orders from "@/pages/dashboard/Orders";
import Installments from "@/pages/dashboard/Installments";
import Payments from "@/pages/dashboard/Payments";
import Receipts from "@/pages/dashboard/Receipts";
import Wishlist from "@/pages/dashboard/Wishlist";
import Profile from "@/pages/dashboard/Profile";
import PaymentMethods from "@/pages/dashboard/PaymentMethods";
import Notifications from "@/pages/dashboard/Notifications";
import ReferralHistory from "@/pages/dashboard/ReferralHistory";
import VendorDashboard from "@/pages/dashboard/VendorDashboard";

// Admin pages
import AdminDashboardRouter from "@/pages/admin/AdminDashboardRouter";
import AdminProducts from "@/pages/admin/AdminProducts";
import AdminUsers from "@/pages/admin/AdminUsers";
import AdminOrders from "@/pages/admin/AdminOrders";
import AdminInstallments from "@/pages/admin/AdminInstallments";
import AdminTransactions from "@/pages/admin/AdminTransactions";
import SuperAdminDashboard from "@/pages/admin/SuperAdminDashboard";
import SupportDashboard from "@/pages/dashboard/SupportDashboard";
import AdminAnalytics from "@/pages/admin/AdminAnalytics";
import AdminProfile from "@/pages/admin/AdminProfile";
import Developers from "@/pages/public/Developers";
import ApiSettings from "@/pages/dashboard/ApiSettings";
import B2BProcurementDashboard from "@/pages/dashboard/B2BProcurementDashboard";


import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AppProvider>
      <TooltipProvider>
        <ToastContainer 
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
        <Toaster />
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<MainLayout><Home /></MainLayout>} />
          <Route path="/marketplace" element={<MainLayout><Marketplace /></MainLayout>} />
          <Route path="/product/:id" element={<MainLayout><ProductDetails /></MainLayout>} />
          <Route path="/calculator" element={<MainLayout><InstallmentCalculator /></MainLayout>} />
          <Route path="/about" element={<MainLayout><About /></MainLayout>} />
          <Route path="/contact" element={<MainLayout><Contact /></MainLayout>} />
          <Route path="/terms" element={<MainLayout><Terms /></MainLayout>} />
          <Route path="/privacy" element={<MainLayout><Privacy /></MainLayout>} />
          <Route path="/developers" element={<MainLayout><Developers /></MainLayout>} />
          <Route path="/cart" element={<MainLayout><Cart /></MainLayout>} />
          <Route path="/checkout" element={<MainLayout><Checkout /></MainLayout>} />

          {/* Auth routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify-otp" element={<VerifyOTP />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* Dashboard routes */}
          <Route path="/dashboard" element={<ProtectedRoute><DashboardLayout><DashboardHome /></DashboardLayout></ProtectedRoute>} />
          <Route path="/dashboard/orders" element={<ProtectedRoute><DashboardLayout><Orders /></DashboardLayout></ProtectedRoute>} />
          <Route path="/dashboard/installments" element={<ProtectedRoute><DashboardLayout><Installments /></DashboardLayout></ProtectedRoute>} />
          <Route path="/dashboard/payments" element={<ProtectedRoute><DashboardLayout><Payments /></DashboardLayout></ProtectedRoute>} />
          <Route path="/dashboard/receipts" element={<ProtectedRoute><DashboardLayout><Receipts /></DashboardLayout></ProtectedRoute>} />
          <Route path="/dashboard/wishlist" element={<ProtectedRoute><DashboardLayout><Wishlist /></DashboardLayout></ProtectedRoute>} />
          <Route path="/dashboard/profile" element={<ProtectedRoute><DashboardLayout><Profile /></DashboardLayout></ProtectedRoute>} />
          <Route path="/dashboard/payment-methods" element={<ProtectedRoute><DashboardLayout><PaymentMethods /></DashboardLayout></ProtectedRoute>} />
          <Route path="/dashboard/notifications" element={<ProtectedRoute><DashboardLayout><Notifications /></DashboardLayout></ProtectedRoute>} />
          <Route path="/dashboard/referrals" element={<ProtectedRoute><DashboardLayout><ReferralHistory /></DashboardLayout></ProtectedRoute>} />
            <Route path="/dashboard/api" element={<ProtectedRoute allowedRoles={['vendor', 'merchant', 'super_admin']}><DashboardLayout><ApiSettings /></DashboardLayout></ProtectedRoute>} />
          <Route path="/dashboard/procurement" element={<ProtectedRoute><DashboardLayout><B2BProcurementDashboard /></DashboardLayout></ProtectedRoute>} />
          <Route path="/dashboard/vendor" element={<ProtectedRoute allowedRoles={['vendor', 'merchant', 'super_admin']}><DashboardLayout><VendorDashboard /></DashboardLayout></ProtectedRoute>} />
          <Route path="/dashboard/support" element={<ProtectedRoute allowedRoles={['customer_care', 'customer_service', 'super_admin']}><DashboardLayout><SupportDashboard /></DashboardLayout></ProtectedRoute>} />
          <Route path="/admin/super" element={<ProtectedRoute allowedRoles={['super_admin']}><AdminLayout><SuperAdminDashboard /></AdminLayout></ProtectedRoute>} />

          {/* Merchant routes */}
          <Route path="/merchant/products" element={<ProtectedRoute allowedRoles={['vendor', 'merchant', 'admin', 'super_admin']}><DashboardLayout><AdminProducts /></DashboardLayout></ProtectedRoute>} />
          <Route path="/merchant/analytics" element={<ProtectedRoute allowedRoles={['vendor', 'merchant', 'admin', 'super_admin']}><DashboardLayout><AdminAnalytics /></DashboardLayout></ProtectedRoute>} />

          {/* Admin routes */}
          <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin', 'super_admin', 'manager', 'customer_care', 'customer_service', 'staff']}><AdminLayout><AdminDashboardRouter /></AdminLayout></ProtectedRoute>} />
          <Route path="/admin/products" element={<ProtectedRoute allowedRoles={['admin', 'super_admin', 'manager', 'staff']}><AdminLayout><AdminProducts /></AdminLayout></ProtectedRoute>} />
          <Route path="/admin/users" element={<ProtectedRoute allowedRoles={['admin', 'super_admin', 'customer_care', 'customer_service']}><AdminLayout><AdminUsers /></AdminLayout></ProtectedRoute>} />
          <Route path="/admin/orders" element={<ProtectedRoute allowedRoles={['admin', 'super_admin', 'manager', 'staff']}><AdminLayout><AdminOrders /></AdminLayout></ProtectedRoute>} />
          <Route path="/admin/installments" element={<ProtectedRoute allowedRoles={['admin', 'super_admin', 'customer_care', 'customer_service']}><AdminLayout><AdminInstallments /></AdminLayout></ProtectedRoute>} />
          <Route path="/admin/transactions" element={<ProtectedRoute allowedRoles={['admin', 'super_admin', 'manager']}><AdminLayout><AdminTransactions /></AdminLayout></ProtectedRoute>} />
          <Route path="/admin/analytics" element={<ProtectedRoute allowedRoles={['admin', 'super_admin']}><AdminLayout><AdminAnalytics /></AdminLayout></ProtectedRoute>} />
          <Route path="/admin/profile" element={<ProtectedRoute allowedRoles={['admin', 'super_admin', 'manager', 'customer_care', 'customer_service', 'staff']}><AdminLayout><AdminProfile /></AdminLayout></ProtectedRoute>} />
          <Route path="*" element={<MainLayout><NotFound /></MainLayout>} />
        </Routes>
        <AssistantChat />
        <SearchPalette />
      </TooltipProvider>
    </AppProvider>
  </QueryClientProvider>
);

export default App;
