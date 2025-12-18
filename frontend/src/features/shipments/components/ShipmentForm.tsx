'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { AddressForm } from './AddressForm';
import { PackageDetailsForm } from './PackageDetailsForm';
import { useCreateShipment } from '../hooks';
import type {
  ShipmentFormStep,
  CreateShipmentFormData,
  AddressFormData,
  PackageDetailsFormData,
} from '../types';

export function ShipmentForm() {
  const [currentStep, setCurrentStep] = useState<ShipmentFormStep>('sender');
  const [formData, setFormData] = useState<Partial<CreateShipmentFormData>>({});
  
  const { mutate: createShipment, isPending, error } = useCreateShipment();

  const handleSenderSubmit = (data: AddressFormData) => {
    setFormData((prev) => ({ ...prev, sender: data }));
    setCurrentStep('receiver');
  };

  const handleReceiverSubmit = (data: AddressFormData) => {
    setFormData((prev) => ({ ...prev, receiver: data }));
    setCurrentStep('package');
  };

  const handlePackageSubmit = (data: PackageDetailsFormData) => {
    const completeData = {
      ...formData,
      package: data,
      // Default values - these should come from hub selection
      pickupHubId: formData.pickupHubId || '1',
      deliveryHubId: formData.deliveryHubId || '1',
      paymentMethod: formData.paymentMethod || ('PREPAID' as const),
      serviceType: formData.serviceType || ('STANDARD' as const),
    } as CreateShipmentFormData;

    createShipment(completeData);
  };

  const steps = [
    { key: 'sender', label: 'Sender Details' },
    { key: 'receiver', label: 'Receiver Details' },
    { key: 'package', label: 'Package Details' },
  ];

  const currentStepIndex = steps.findIndex((s) => s.key === currentStep);

  return (
    <div className="max-w-3xl mx-auto">
      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div
              key={step.key}
              className="flex items-center flex-1 last:flex-none"
            >
              <div className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                    index <= currentStepIndex
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {index + 1}
                </div>
                <span
                  className={`text-sm mt-2 ${
                    index <= currentStepIndex
                      ? 'text-blue-600 font-medium'
                      : 'text-gray-500'
                  }`}
                >
                  {step.label}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`flex-1 h-1 mx-4 ${
                    index < currentStepIndex ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <Card className="mb-6 p-4 bg-red-50 border-red-200">
          <p className="text-sm text-red-600">
            {error instanceof Error ? error.message : 'Failed to create shipment'}
          </p>
        </Card>
      )}

      {/* Form Steps */}
      <Card className="p-6">
        {currentStep === 'sender' && (
          <AddressForm
            title="Sender Details"
            defaultValues={formData.sender}
            onSubmit={handleSenderSubmit}
            submitLabel="Next: Receiver Details"
          />
        )}

        {currentStep === 'receiver' && (
          <AddressForm
            title="Receiver Details"
            defaultValues={formData.receiver}
            onSubmit={handleReceiverSubmit}
            onBack={() => setCurrentStep('sender')}
            submitLabel="Next: Package Details"
          />
        )}

        {currentStep === 'package' && (
          <PackageDetailsForm
            defaultValues={formData.package}
            onSubmit={handlePackageSubmit}
            onBack={() => setCurrentStep('receiver')}
            submitLabel={isPending ? 'Creating...' : 'Create Shipment'}
          />
        )}
      </Card>
    </div>
  );
}
