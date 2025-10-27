/**
 * Generate a unique AWB (Air Waybill) number for shipments
 * Format: FX + YYYYMMDD + 6 random digits
 * Example: FX202510275438921
 */
export function generateAWB(): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  const dateStr = `${year}${month}${day}`;
  const randomDigits = Math.floor(100000 + Math.random() * 900000);
  
  return `FX${dateStr}${randomDigits}`;
}

/**
 * Generate a manifest number
 * Format: MN + YYYYMMDD + 4 random digits
 * Example: MN202510274523
 */
export function generateManifestNumber(): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  const dateStr = `${year}${month}${day}`;
  const randomDigits = Math.floor(1000 + Math.random() * 9000);
  
  return `MN${dateStr}${randomDigits}`;
}
