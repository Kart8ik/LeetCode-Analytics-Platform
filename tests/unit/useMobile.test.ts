import { renderHook } from "@testing-library/react";
import { useIsMobile } from "../../src/hooks/use-mobile.ts";
import { describe, it, expect, vi, beforeEach } from 'vitest';

describe("useIsMobile Hook", () => {
  beforeEach(() => {
    // Mock window.matchMedia
    window.matchMedia = vi.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));
  });

  it("returns true for small window width", () => {
    // Mock small window width
    Object.defineProperty(window, 'innerWidth', { value: 400, writable: true });
    window.matchMedia = vi.fn().mockImplementation((query) => ({
      matches: true,  // Small screen, so matches will be true
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));
    
    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(true);
  });

  it("returns false for large window width", () => {
    // Mock large window width
    Object.defineProperty(window, 'innerWidth', { value: 1200, writable: true });
    window.matchMedia = vi.fn().mockImplementation((query) => ({
      matches: false,  // Large screen, so matches will be false
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));
    
    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(false);
  });
});
