'use client';

import type { BulkShipmentRow } from '../types';

interface ValidationPreviewProps {
  data: BulkShipmentRow[];
  maxRows?: number;
}

export function ValidationPreview({ data, maxRows = 10 }: ValidationPreviewProps) {
  const displayData = data.slice(0, maxRows);
  const hasMore = data.length > maxRows;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-900">
          Preview ({data.length} rows)
        </h3>
        {hasMore && (
          <p className="text-sm text-gray-500">
            Showing first {maxRows} of {data.length} rows
          </p>
        )}
      </div>

      {/* Table */}
      <div className="border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-2 text-left font-medium text-gray-700">
                  #
                </th>
                <th className="px-4 py-2 text-left font-medium text-gray-700">
                  Sender Name
                </th>
                <th className="px-4 py-2 text-left font-medium text-gray-700">
                  Receiver Name
                </th>
                <th className="px-4 py-2 text-left font-medium text-gray-700">
                  Receiver City
                </th>
                <th className="px-4 py-2 text-left font-medium text-gray-700">
                  Service Type
                </th>
                <th className="px-4 py-2 text-left font-medium text-gray-700">
                  Payment
                </th>
                <th className="px-4 py-2 text-right font-medium text-gray-700">
                  Weight (kg)
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {displayData.map((row, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-4 py-2 text-gray-600">{index + 1}</td>
                  <td className="px-4 py-2">{row.senderName}</td>
                  <td className="px-4 py-2">{row.receiverName}</td>
                  <td className="px-4 py-2">{row.receiverCity}</td>
                  <td className="px-4 py-2">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {row.serviceType}
                    </span>
                  </td>
                  <td className="px-4 py-2">
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        row.paymentMethod === 'COD'
                          ? 'bg-orange-100 text-orange-800'
                          : 'bg-green-100 text-green-800'
                      }`}
                    >
                      {row.paymentMethod}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-right">{row.weight}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {hasMore && (
        <p className="text-sm text-gray-500 text-center">
          ... and {data.length - maxRows} more rows
        </p>
      )}
    </div>
  );
}
