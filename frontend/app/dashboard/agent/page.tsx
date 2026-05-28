'use client';

import { usePickups, usePickupStatistics, useTodayPickups, useStartPickup, useCompletePickup } from '@/src/features/pickups/hooks/usePickups';
import { PickupStatus } from '@/src/features/pickups/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { MapPin, CheckCircle, Clock, TrendingUp, Play, Check } from 'lucide-react';
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
}

export default function AgentDashboardPage() {
  const { data: stats } = usePickupStatistics();
  const { data: todayPickups, isLoading: todayLoading } = useTodayPickups();
  const { data: allPickups, isLoading: allLoading } = usePickups({ status: PickupStatus.PENDING });
  const startPickup = useStartPickup();
  const completePickup = useCompletePickup();

  const today = (todayPickups ?? []) as unknown as Pickup[];
  const pending = (allPickups?.data ?? []) as unknown as Pickup[];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Agent Dashboard</h1>
        <p className="text-sm text-gray-500">Your pickup queue and daily summary</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Today&apos;s Pickups</CardTitle>
            <MapPin className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{today.length}</p>
          </CardContent>
        </Card>

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
            <CardTitle className="text-sm font-medium text-gray-600">In Progress</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-blue-600">{stats?.inProgress ?? 0}</p>
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

      {/* Today's schedule */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Today&apos;s Schedule
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {todayLoading ? (
            <div className="flex items-center justify-center py-10 text-gray-500">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-3" />
              Loading…
            </div>
          ) : today.length === 0 ? (
            <div className="text-center py-10 text-gray-500">
              <MapPin className="h-10 w-10 mx-auto mb-3 text-gray-300" />
              <p>No pickups scheduled for today</p>
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
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {today.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="font-medium">{p.merchantName ?? '—'}</TableCell>
                      <TableCell className="text-gray-500 max-w-[200px] truncate">{p.address ?? '—'}</TableCell>
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
                        {p.status === 'ASSIGNED' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => startPickup.mutate(p.id)}
                            disabled={startPickup.isPending}
                          >
                            <Play className="h-3 w-3 mr-1" />
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
                            <Check className="h-3 w-3 mr-1" />
                            Complete
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

      {/* Pending queue */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Pending Pickup Queue
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {allLoading ? (
            <div className="flex items-center justify-center py-10 text-gray-500">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-3" />
              Loading…
            </div>
          ) : pending.length === 0 ? (
            <div className="text-center py-10 text-gray-500">
              <CheckCircle className="h-10 w-10 mx-auto mb-3 text-gray-300" />
              <p>No pending pickups</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Merchant</TableHead>
                    <TableHead>Address</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pending.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="font-medium">{p.merchantName ?? '—'}</TableCell>
                      <TableCell className="text-gray-500 max-w-[300px] truncate">{p.address ?? '—'}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={`text-xs ${STATUS_COLORS[p.status] ?? 'bg-gray-100 text-gray-700'}`}
                        >
                          {p.status}
                        </Badge>
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
