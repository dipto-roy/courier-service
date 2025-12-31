'use client';

import { ManifestDetails } from '@/src/features/hub/components';
import { useRouter } from 'next/navigation';

export default function ManifestDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();

  const handleReceive = () => {
    // Navigate to receive page or open dialog
    router.push(`/dashboard/hub/manifests/${params.id}/receive`);
  };

  return (
    <div className="container mx-auto py-6">
      <ManifestDetails id={params.id} onReceive={handleReceive} />
    </div>
  );
}
