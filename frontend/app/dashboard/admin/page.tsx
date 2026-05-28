'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/src/common/lib/apiClient';
import { useUsers, useDeleteUser, useRestoreUser } from '@/src/features/users/hooks/useUsers';
import { UserRole } from '@/src/common/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Users, Package, DollarSign, Shield, Trash2, RefreshCw } from 'lucide-react';

interface AdminStats {
  users: { total: number; byRole: Record<string, number> };
  shipments: { total: number };
  transactions: { total: number; totalAmount: number };
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  isVerified: boolean;
  createdAt: string;
  deletedAt?: string | null;
}

function useAdminStats() {
  return useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: async () => {
      const res = await apiClient.get<{ data: AdminStats }>('/admin/stats');
      return res.data.data;
    },
    staleTime: 60000,
  });
}

function useAssignRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: string }) =>
      apiClient.patch(`/admin/users/${userId}/role`, { role }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] });
    },
  });
}

const ROLE_COLORS: Record<string, string> = {
  admin: 'bg-red-100 text-red-800',
  finance: 'bg-yellow-100 text-yellow-800',
  support: 'bg-blue-100 text-blue-800',
  agent: 'bg-purple-100 text-purple-800',
  hub_staff: 'bg-orange-100 text-orange-800',
  rider: 'bg-green-100 text-green-800',
  merchant: 'bg-indigo-100 text-indigo-800',
  customer: 'bg-gray-100 text-gray-800',
};

export default function AdminDashboardPage() {
  const { data: stats, isLoading: statsLoading, refetch: refetchStats } = useAdminStats();
  const { data: usersData, isLoading: usersLoading } = useUsers({ limit: 50 });
  const assignRole = useAssignRole();
  const deleteUser = useDeleteUser();
  const restoreUser = useRestoreUser();

  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [newRole, setNewRole] = useState('');

  const users: User[] = (usersData?.data ?? []) as unknown as User[];

  function openRoleDialog(user: User) {
    setSelectedUser(user);
    setNewRole(user.role);
  }

  async function handleAssignRole() {
    if (!selectedUser) return;
    await assignRole.mutateAsync({ userId: selectedUser.id, role: newRole });
    setSelectedUser(null);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-sm text-gray-500">System overview and user management</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetchStats()} disabled={statsLoading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${statsLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Users</CardTitle>
            <Users className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{statsLoading ? '…' : (stats?.users.total ?? 0)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Shipments</CardTitle>
            <Package className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{statsLoading ? '…' : (stats?.shipments.total ?? 0)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Transactions</CardTitle>
            <DollarSign className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{statsLoading ? '…' : (stats?.transactions.total ?? 0)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              ৳{statsLoading ? '…' : ((stats?.transactions.totalAmount ?? 0) / 100).toLocaleString()}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Role breakdown */}
      {stats?.users.byRole && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Users by Role
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {Object.entries(stats.users.byRole).map(([role, count]) => (
                <span
                  key={role}
                  className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ${ROLE_COLORS[role] ?? 'bg-gray-100 text-gray-800'}`}
                >
                  {role}: {count as number}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Users table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">All Users</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {usersLoading ? (
            <div className="flex items-center justify-center py-12 text-gray-500">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-3" />
              Loading users…
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id} className={user.deletedAt ? 'opacity-50' : ''}>
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell className="text-gray-500">{user.email}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={`text-xs ${ROLE_COLORS[user.role] ?? ''}`}
                        >
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {user.deletedAt ? (
                          <Badge variant="outline" className="text-xs bg-red-50 text-red-600">
                            Deleted
                          </Badge>
                        ) : user.isVerified ? (
                          <Badge variant="outline" className="text-xs bg-green-50 text-green-700">
                            Active
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-xs bg-yellow-50 text-yellow-700">
                            Unverified
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openRoleDialog(user)}
                            disabled={!!user.deletedAt}
                          >
                            Change Role
                          </Button>
                          {user.deletedAt ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-green-600"
                              onClick={() => restoreUser.mutate(user.id)}
                            >
                              Restore
                            </Button>
                          ) : (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-500"
                              onClick={() => deleteUser.mutate(user.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Role assignment dialog */}
      <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Role — {selectedUser?.name}</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Select value={newRole} onValueChange={setNewRole}>
              <SelectTrigger>
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                {Object.values(UserRole).map((role) => (
                  <SelectItem key={role} value={role}>
                    {role}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedUser(null)}>
              Cancel
            </Button>
            <Button
              onClick={handleAssignRole}
              disabled={assignRole.isPending || newRole === selectedUser?.role}
            >
              {assignRole.isPending ? 'Saving…' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
