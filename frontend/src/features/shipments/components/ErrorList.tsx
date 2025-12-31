'use client';

interface ValidationError {
  row: number;
  field?: string;
  message: string;
}

interface ErrorListProps {
  errors: ValidationError[];
  maxErrors?: number;
}

export function ErrorList({ errors, maxErrors = 20 }: ErrorListProps) {
  const displayErrors = errors.slice(0, maxErrors);
  const hasMore = errors.length > maxErrors;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-red-900">
          Validation Errors ({errors.length})
        </h3>
        {hasMore && (
          <p className="text-sm text-red-600">
            Showing first {maxErrors} of {errors.length} errors
          </p>
        )}
      </div>

      {/* Error List */}
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {displayErrors.map((error, index) => (
          <div
            key={index}
            className="flex items-start gap-3 p-3 bg-red-50 border border-red-200 rounded-lg"
          >
            <svg
              className="w-5 h-5 text-red-600 shrink-0 mt-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-red-900">
                Row {error.row}
                {error.field && (
                  <span className="text-red-700"> - {error.field}</span>
                )}
              </p>
              <p className="text-sm text-red-700 mt-1">{error.message}</p>
            </div>
          </div>
        ))}
      </div>

      {hasMore && (
        <p className="text-sm text-red-600 text-center">
          ... and {errors.length - maxErrors} more errors
        </p>
      )}

      {/* Summary */}
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-sm text-red-900">
          <strong>Please fix these errors and upload the file again.</strong>
        </p>
        <p className="text-sm text-red-700 mt-1">
          Check the CSV template for the correct format and required fields.
        </p>
      </div>
    </div>
  );
}
