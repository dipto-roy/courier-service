import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar, Filter } from 'lucide-react';
import type { AnalyticsFilters, MetricPeriod } from '@/src/services/analytics/types';

interface AnalyticsFilterBarProps {
  onFilterChange: (filters: AnalyticsFilters) => void;
  defaultFilters?: AnalyticsFilters;
}

export function AnalyticsFilterBar({
  onFilterChange,
  defaultFilters,
}: AnalyticsFilterBarProps) {
  const [period, setPeriod] = useState<MetricPeriod>(
    defaultFilters?.period || ('month' as MetricPeriod)
  );

  const handlePeriodChange = (newPeriod: MetricPeriod) => {
    setPeriod(newPeriod);

    // Calculate date range based on period
    const now = new Date();
    let startDate = new Date();

    switch (newPeriod) {
      case 'today':
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setDate(now.getDate() - 30);
        break;
      case 'year':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        startDate = now;
    }

    onFilterChange({
      period: newPeriod,
      startDate: startDate.toISOString(),
      endDate: now.toISOString(),
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Filter className="h-4 w-4" />
          Filters
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">
              Time Period
            </label>
            <Select value={period} onValueChange={handlePeriodChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">Last 7 Days</SelectItem>
                <SelectItem value="month">Last 30 Days</SelectItem>
                <SelectItem value="year">Last Year</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button
            variant="outline"
            className="w-full"
            onClick={() =>
              handlePeriodChange(defaultFilters?.period || ('month' as MetricPeriod))
            }
          >
            <Calendar className="mr-2 h-4 w-4" />
            Reset Filters
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
