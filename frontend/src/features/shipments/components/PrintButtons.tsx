'use client';

import { Button } from '@/components/ui/button';
import { useDownloadLabel, useDownloadInvoice, usePrintLabel } from '../hooks';

interface PrintLabelButtonProps {
  shipmentId: string;
  variant?: 'download' | 'print';
}

export function PrintLabelButton({
  shipmentId,
  variant = 'download',
}: PrintLabelButtonProps) {
  const { mutate: download, isPending: isDownloading } = useDownloadLabel();
  const { mutate: print, isPending: isPrinting } = usePrintLabel();

  const handleClick = () => {
    if (variant === 'print') {
      print(shipmentId);
    } else {
      download(shipmentId);
    }
  };

  return (
    <Button
      onClick={handleClick}
      disabled={isDownloading || isPrinting}
      variant="outline"
    >
      {isDownloading || isPrinting
        ? 'Processing...'
        : variant === 'print'
          ? 'Print Label'
          : 'Download Label'}
    </Button>
  );
}

interface PrintInvoiceButtonProps {
  shipmentId: string;
}

export function PrintInvoiceButton({ shipmentId }: PrintInvoiceButtonProps) {
  const { mutate: downloadInvoice, isPending } = useDownloadInvoice();

  return (
    <Button
      onClick={() => downloadInvoice(shipmentId)}
      disabled={isPending}
      variant="outline"
    >
      {isPending ? 'Downloading...' : 'Download Invoice'}
    </Button>
  );
}
