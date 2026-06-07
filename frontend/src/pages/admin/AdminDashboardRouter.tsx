import { useApp } from '@/context/AppContext';
import SuperAdminDashboard from './SuperAdminDashboard';
import AdminDashboard from './AdminDashboard';
import ManagerDashboard from './ManagerDashboard';
import SupportDashboard from '@/pages/dashboard/SupportDashboard';
import StaffDashboard from './StaffDashboard';

export default function AdminDashboardRouter() {
  const { user } = useApp();

  if (!user) return null;

  switch (user.role) {
    case 'super_admin':
      return <SuperAdminDashboard />;
    case 'admin':
      return <AdminDashboard />;
    case 'manager':
      return <ManagerDashboard />;
    case 'customer_care':
    case 'customer_service':
      return <SupportDashboard />;
    case 'staff':
      return <StaffDashboard />;
    default:
      return <AdminDashboard />;
  }
}
