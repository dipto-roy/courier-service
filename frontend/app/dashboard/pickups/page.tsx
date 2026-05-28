'use client';

import { useState } from 'react';
import {
  usePickups,
  usePickupStatistics,
  useCancelPickup,
  useStartPickup,
  useCompletePickup,
} from '@/src/features/pickups/hooks/usePickups';
import { PickupStatus } from '@/src/features/pickups/types';
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
import { MapPin, CheckCircle, Clock, TrendingUp, XCircle } from 'lucide-react';
import { formatDateTime } from '@/src/common/lib/utils';

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  ASSIGNED: 'bg-blue-100 text-blue-800',
  IN_PROGRESS: 'bg-purple-100 text-purple-800',
  COMPLETED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-800',
};

interface Pickup {
  id: string;
  merchantName?: string;
  address?: string;
  scheduledTime?: string;
  status: string;
  agentId?: string;
}

export default function PickupsPage() {
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const { data: stats } = usePickupStatistics();
  const { data: pickupsData, isLoading } = usePickups(
    filterStatus === 'all' ? undefined : { status: filterStatus as PickupStatus },
  );
  const startPickup = useStartPickup();
  const completePickup = useCompletePickup();
  const cancelPickup = useCancelPickup();

  const pickups: Pickup[] = (pickupsData?.data ?? []) as unknown as Pickup[];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Pickups</h1>
        <p className="text-sm text-gray-500">Manage pickup requests</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Pending</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-yellow-600">{stats?.pending ?? 0}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Assigned</CardTitle>
            <MapPin className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-blue-600">{stats?.assigned ?? 0}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">In Progress</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-purple-600">{stats?.inProgress ?? 0}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-600">{stats?.completed ?? 0}</p>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            All Pickups
          </CardTitle>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="ASSIGNED">Assigned</SelectItem>
              <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
              <SelectItem value="COMPLETED">Completed</SelectItem>
              <SelectItem value="CANCELLED">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-10 text-gray-500">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-3" />
              Loading…
            </div>
          ) : pickups.length === 0 ? (
            <div className="text-center py-10 text-gray-500">
              <MapPin className="h-10 w-10 mx-auto mb-3 text-gray-300" />
              <p>No pickups found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Merchant</TableHead>
                    <TableHead>Address</TableHead>
                    <TableHead>Scheduled</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pickups.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="font-medium">{p.merchantName ?? '—'}</TableCell>
                      <TableCell className="text-gray-500 max-w-[200px] truncate">
                        {p.address ?? '—'}
                      </TableCell>
                      <TableCell className="text-sm text-gray-500">
                        {p.scheduledTime ? formatDateTime(p.scheduledTime) : '—'}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={`text-xs ${STATUS_COLORS[p.status] ?? 'bg-gray-100 text-gray-700'}`}
                        >
                          {p.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          {p.status === 'ASSIGNED' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => startPickup.mutate(p.id)}
                              disabled={startPickup.isPending}
                            >
                              Start
                            </Button>
                          )}
                          {p.status === 'IN_PROGRESS' && (
                            <Button
                              size="sm"
                              className="bg-green-600 hover:bg-green-700"
                              onClick={() => completePickup.mutate({ id: p.id, data: {} as never })}
                              disabled={completePickup.isPending}
                            >
                              Complete
                            </Button>
                          )}
                          {(p.status === 'PENDING' || p.status === 'ASSIGNED') && (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-red-500"
                              onClick={() => cancelPickup.mutate(p.id)}
                              disabled={cancelPickup.isPending}
                            >
                              <XCircle className="h-4 w-4" />
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
    </div>
  );
}
