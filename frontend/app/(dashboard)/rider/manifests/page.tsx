'use client';

import { ManifestList } from '@/src/features/rider/components';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function RiderManifestsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Manifests</h1>
          <p className="text-gray-600 mt-1">
            View and manage your assigned manifests
          </p>
        </div>
        <Link href="/rider">
          <Button variant="outline">
            <svg
              className="w-4 h-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Back to Dashboard
          </Button>
        </Link>
      </div>

      <ManifestList />
    </div>
  );
}
