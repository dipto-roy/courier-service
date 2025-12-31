import { LucideIcon, Package, FileX, Inbox, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/src/common/lib/utils';

interface EmptyProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export function Empty({
  icon: Icon = Inbox,
  title,
  description,
  action,
  className,
}: EmptyProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center',
        className
      )}
    >
      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-muted">
        <Icon className="h-10 w-10 text-muted-foreground" />
      </div>
      <h3 className="mt-4 text-lg font-semibold">{title}</h3>
      {description && (
        <p className="mt-2 text-sm text-muted-foreground max-w-sm">
          {description}
        </p>
      )}
      {action && (
        <Button onClick={action.onClick} className="mt-6">
          {action.label}
        </Button>
      )}
    </div>
  );
}

// Pre-configured empty states
export function EmptyShipments({ onCreateShipment }: { onCreateShipment?: () => void }) {
  return (
    <Empty
      icon={Package}
      title="No shipments found"
      description="Get started by creating your first shipment or adjust your filters."
      action={
        onCreateShipment
          ? {
              label: 'Create Shipment',
              onClick: onCreateShipment,
            }
          : undefined
      }
    />
  );
}

export function EmptySearch({ onClearSearch }: { onClearSearch?: () => void }) {
  return (
    <Empty
      icon={Search}
      title="No results found"
      description="Try adjusting your search criteria or filters to find what you're looking for."
      action={
        onClearSearch
          ? {
              label: 'Clear Search',
              onClick: onClearSearch,
            }
          : undefined
      }
    />
  );
}

export function EmptyData({ title, description }: { title?: string; description?: string }) {
  return (
    <Empty
      icon={FileX}
      title={title || 'No data available'}
      description={description || 'There is no data to display at the moment.'}
    />
  );
}
