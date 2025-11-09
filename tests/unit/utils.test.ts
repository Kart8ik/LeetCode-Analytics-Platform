import { describe, it, expect } from 'vitest';
import { cn } from '../../src/lib/utils';  // check actual utils path

describe('Utility Function Tests', () => {
  it('combines class names correctly', () => {
    const result = cn('text-sm', 'font-bold');
    expect(result).toBe('text-sm font-bold');
  });

  it('handles undefined gracefully', () => {
    const result = cn('p-2', undefined);
    expect(result).toBe('p-2');
  });
});
