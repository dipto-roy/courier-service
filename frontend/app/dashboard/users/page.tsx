'use client';

import { useState } from 'react';
import { useUsers, useDeleteUser, useRestoreUser } from '@/src/features/users/hooks/useUsers';
import { UserRole } from '@/src/common/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { Users, Search, Trash2, RefreshCw } from 'lucide-react';
import { formatDateTime } from '@/src/common/lib/utils';

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

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  isVerified: boolean;
  createdAt: string;
  deletedAt?: string | null;
}

export default function UsersPage() {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');

  const { data: usersData, isLoading } = useUsers({
    role: roleFilter === 'all' ? undefined : (roleFilter as UserRole),
    limit: 100,
  });
  const deleteUser = useDeleteUser();
  const restoreUser = useRestoreUser();

  const allUsers: User[] = (usersData?.data ?? []) as unknown as User[];

  const filtered = allUsers.filter((u) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
        <p className="text-sm text-gray-500">View and manage all system users</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search by name or email…"
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-full sm:w-44">
            <SelectValue placeholder="Filter by role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            {Object.values(UserRole).map((role) => (
              <SelectItem key={role} value={role}>
                {role}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Users className="h-4 w-4" />
            {filtered.length} Users
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-10 text-gray-500">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-3" />
              Loading…
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-10 text-gray-500">
              <Users className="h-10 w-10 mx-auto mb-3 text-gray-300" />
              <p>No users found</p>
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
                    <TableHead className="hidden md:table-cell">Joined</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((user) => (
                    <TableRow key={user.id} className={user.deletedAt ? 'opacity-50' : ''}>
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell className="text-gray-500 text-sm">{user.email}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={`text-xs ${ROLE_COLORS[user.role] ?? 'bg-gray-100 text-gray-700'}`}
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
                      <TableCell className="hidden md:table-cell text-sm text-gray-500">
                        {formatDateTime(user.createdAt)}
                      </TableCell>
                      <TableCell className="text-right">
                        {user.deletedAt ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-green-600"
                            onClick={() => restoreUser.mutate(user.id)}
                            disabled={restoreUser.isPending}
                          >
                            <RefreshCw className="h-4 w-4" />
                          </Button>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-500"
                            onClick={() => deleteUser.mutate(user.id)}
                            disabled={deleteUser.isPending}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
