import { describe, it, expect } from 'vitest';
import { cn, formatCurrency, formatDate, formatDateTime } from './utils';

describe('cn', () => {
  it('merges class names', () => {
    expect(cn('a', 'b')).toBe('a b');
  });

  it('handles conditional classes', () => {
    expect(cn('base', false && 'hidden', 'visible')).toBe('base visible');
  });

  it('resolves tailwind conflicts', () => {
    // twMerge should keep the last conflicting class
    const result = cn('px-2', 'px-4');
    expect(result).toBe('px-4');
  });

  it('handles undefined/null gracefully', () => {
    expect(cn(undefined, null, 'active')).toBe('active');
  });
});

describe('formatCurrency', () => {
  it('formats a positive number as BDT currency', () => {
    const result = formatCurrency(1500);
    expect(result).toContain('1,500');
  });

  it('formats zero correctly', () => {
    const result = formatCurrency(0);
    expect(result).toContain('0');
  });

  it('formats decimal amounts', () => {
    const result = formatCurrency(99.5);
    expect(result).toContain('99');
  });
});

describe('formatDate', () => {
  it('formats an ISO string to readable date', () => {
    const result = formatDate('2025-06-15T00:00:00.000Z');
    expect(result).toMatch(/Jun/);
    expect(result).toMatch(/15/);
    expect(result).toMatch(/2025/);
  });

  it('accepts a Date object', () => {
    const result = formatDate(new Date('2025-01-01'));
    expect(result).toMatch(/Jan/);
  });
});

describe('formatDateTime', () => {
  it('formats date with time component', () => {
    const result = formatDateTime('2025-06-15T10:30:00.000Z');
    expect(result).toMatch(/Jun/);
    expect(result).toMatch(/2025/);
  });
});
