'use client';

import { useState } from 'react';
import { ManifestCard } from './ManifestCard';
import { useManifests, useStartManifest, useCompleteManifest } from '../hooks';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

export function ManifestList() {
  const router = useRouter();
  const [filter, setFilter] = useState<string>('');
  const { data: manifests, isLoading } = useManifests(filter);
  const startManifest = useStartManifest();
  const completeManifest = useCompleteManifest();

  const handleStart = async (manifestId: number) => {
    try {
      await startManifest.mutateAsync(manifestId);
    } catch (error) {
      console.error('Failed to start manifest:', error);
    }
  };

  const handleComplete = async (manifestId: number) => {
    try {
      await completeManifest.mutateAsync(manifestId);
    } catch (error) {
      console.error('Failed to complete manifest:', error);
    }
  };

  const handleView = (manifestId: number) => {
    router.push(`/rider/manifests/${manifestId}`);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="h-64 bg-gray-100 rounded-lg animate-pulse"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        <Button
          variant={filter === '' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('')}
        >
          All
        </Button>
        <Button
          variant={filter === 'PENDING' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('PENDING')}
        >
          Pending
        </Button>
        <Button
          variant={filter === 'IN_PROGRESS' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('IN_PROGRESS')}
        >
          In Progress
        </Button>
        <Button
          variant={filter === 'COMPLETED' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('COMPLETED')}
        >
          Completed
        </Button>
      </div>

      {/* Manifest Cards */}
      {manifests && manifests.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {manifests.map((manifest: any) => (
            <ManifestCard
              key={manifest.id}
              manifest={manifest}
              onStart={handleStart}
              onComplete={handleComplete}
              onView={handleView}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500">No manifests found</p>
        </div>
      )}
    </div>
  );
}
