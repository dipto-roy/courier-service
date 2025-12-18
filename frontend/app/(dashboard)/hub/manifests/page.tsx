'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ManifestList, ManifestCreation } from '@/src/features/hub/components';
import { ManifestStatus } from '@/src/services/hub/types';
import { Plus, List } from 'lucide-react';

export default function HubManifestsPage() {
  const [hubLocation] = useState('Dhaka Hub'); // TODO: Get from user context
  const [activeTab, setActiveTab] = useState('list');

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Manifest Management</h1>
        <p className="text-gray-600 mt-1">
          Create and manage hub-to-hub transfer manifests
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="list" className="flex items-center gap-2">
            <List className="h-4 w-4" />
            Manifest List
          </TabsTrigger>
          <TabsTrigger value="create" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Create Manifest
          </TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="mt-6">
          <ManifestList />
        </TabsContent>

        <TabsContent value="create" className="mt-6">
          <ManifestCreation
            originHub={hubLocation}
            onSuccess={(id) => {
              console.log('Manifest created:', id);
              setActiveTab('list');
            }}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
