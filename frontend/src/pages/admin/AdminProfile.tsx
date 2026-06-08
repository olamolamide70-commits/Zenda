import { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { toast } from 'react-toastify';
import { Shield, Key, User, Edit2, CheckCircle2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import api from '@/services/api';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function AdminProfile() {
  const { user } = useApp();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  // Super Admin specific state
  const [staffUsers, setStaffUsers] = useState<any[]>([]);
  const [isLoadingStaff, setIsLoadingStaff] = useState(false);
  const [editingRoleUser, setEditingRoleUser] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<string>('');

  const fetchStaffUsers = async () => {
    if (user?.role !== 'super_admin') return;
    try {
      setIsLoadingStaff(true);
      const { data } = await api.get('/admin/users');
      // Filter out standard users and merchants, show only internal roles
      const filtered = data.users.filter((u: any) => 
        ['admin', 'manager', 'customer_care', 'customer_service', 'staff', 'super_admin'].includes(u.role)
      );
      setStaffUsers(filtered);
    } catch (error) {
      toast.error('Failed to load staff users');
    } finally {
      setIsLoadingStaff(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'super_admin') {
      fetchStaffUsers();
    }
  }, [user]);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      return toast.error("Passwords don't match!");
    }
    try {
      setIsUpdatingPassword(true);
      await api.put('/auth/update-password', { newPassword });
      toast.success('Password updated successfully');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to update password');
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handleUpdateRole = async (userId: string) => {
    if (!selectedRole) return;
    try {
      await api.put(`/admin/users/${userId}`, { role: selectedRole });
      toast.success('Role updated successfully');
      setEditingRoleUser(null);
      fetchStaffUsers(); // refresh
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to update role');
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-5xl mx-auto">
      <div>
        <h1 className="text-3xl font-black text-foreground tracking-tight mb-2">My Profile</h1>
        <p className="text-muted-foreground font-medium">Manage your administrative account settings.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Personal Details */}
        <div className="bg-white border border-border rounded-2xl p-6 lg:p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <User className="h-5 w-5" />
            </div>
            <h2 className="text-xl font-bold text-foreground">Personal Information</h2>
          </div>
          
          <div className="space-y-4">
            <div>
              <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Full Name</Label>
              <div className="mt-1 h-12 bg-secondary/30 rounded-xl px-4 flex items-center border border-border font-medium text-foreground">
                {user?.name}
              </div>
            </div>
            <div>
              <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Email Address</Label>
              <div className="mt-1 h-12 bg-secondary/30 rounded-xl px-4 flex items-center border border-border font-medium text-foreground">
                {user?.email}
              </div>
            </div>
            <div>
              <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Role</Label>
              <div className="mt-1 h-12 bg-primary/5 rounded-xl px-4 flex items-center border border-primary/20 font-bold text-primary capitalize">
                {user?.role?.replace('_', ' ')}
              </div>
            </div>
          </div>
        </div>

        {/* Change Password */}
        <div className="bg-white border border-border rounded-2xl p-6 lg:p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-10 w-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500">
              <Key className="h-5 w-5" />
            </div>
            <h2 className="text-xl font-bold text-foreground">Change Password</h2>
          </div>
          
          <form onSubmit={handleUpdatePassword} className="space-y-4">
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">New Password</Label>
              <Input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="h-12 border-border focus:ring-primary/20 bg-background"
                required
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Confirm Password</Label>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="h-12 border-border focus:ring-primary/20 bg-background"
                required
              />
            </div>
            <Button 
              type="submit" 
              className="w-full h-12 rounded-xl font-bold mt-4"
              disabled={isUpdatingPassword}
            >
              {isUpdatingPassword ? 'Updating...' : 'Update Password'}
            </Button>
          </form>
        </div>
      </div>

      {/* Super Admin Section: Manage Team Roles */}
      {user?.role === 'super_admin' && (
        <div className="bg-white border border-border rounded-2xl p-6 lg:p-8 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-destructive/10 flex items-center justify-center text-destructive">
                <Shield className="h-5 w-5" />
              </div>
              <h2 className="text-xl font-bold text-foreground">Team Role Management</h2>
            </div>
          </div>

          <p className="text-sm text-muted-foreground font-medium mb-6">
            As a Super Admin, you can assign, upgrade, or downgrade the roles of your administrative team members below.
          </p>

          <div className="border border-border rounded-xl overflow-hidden bg-background">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-secondary/50 text-xs uppercase font-bold text-muted-foreground">
                  <tr>
                    <th className="px-6 py-4">Name</th>
                    <th className="px-6 py-4">Email</th>
                    <th className="px-6 py-4">Current Role</th>
                    <th className="px-6 py-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {isLoadingStaff ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-8 text-center text-muted-foreground">
                        Loading team members...
                      </td>
                    </tr>
                  ) : staffUsers.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-8 text-center text-muted-foreground">
                        No team members found.
                      </td>
                    </tr>
                  ) : (
                    staffUsers.map((staff) => (
                      <tr key={staff.id} className="hover:bg-secondary/30 transition-colors">
                        <td className="px-6 py-4 font-bold text-foreground">{staff.name}</td>
                        <td className="px-6 py-4 font-medium text-muted-foreground">{staff.email}</td>
                        <td className="px-6 py-4">
                          {editingRoleUser === staff.id ? (
                            <Select 
                              value={selectedRole} 
                              onValueChange={setSelectedRole}
                            >
                              <SelectTrigger className="h-9 border-border bg-white w-40">
                                <SelectValue placeholder="Select Role" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="super_admin">Super Admin</SelectItem>
                                <SelectItem value="admin">Admin</SelectItem>
                                <SelectItem value="manager">Manager</SelectItem>
                                <SelectItem value="customer_care">Customer Care</SelectItem>
                                <SelectItem value="staff">Staff</SelectItem>
                                <SelectItem value="user">User (Downgrade)</SelectItem>
                              </SelectContent>
                            </Select>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-primary/10 text-primary capitalize">
                              {staff.role.replace('_', ' ')}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          {editingRoleUser === staff.id ? (
                            <div className="flex items-center justify-end gap-2">
                              <Button 
                                size="sm" 
                                variant="default" 
                                onClick={() => handleUpdateRole(staff.id)}
                                className="h-8 w-8 p-0 rounded-lg"
                              >
                                <CheckCircle2 className="h-4 w-4" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline" 
                                onClick={() => setEditingRoleUser(null)}
                                className="h-8 w-8 p-0 rounded-lg"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 rounded-lg font-bold text-xs gap-1.5"
                              onClick={() => {
                                setEditingRoleUser(staff.id);
                                setSelectedRole(staff.role);
                              }}
                              disabled={staff.id === user?.id} // Prevent self-downgrade
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                              Edit Role
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

