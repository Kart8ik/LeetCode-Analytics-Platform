// ✅ tests/setup.ts
import "@testing-library/jest-dom";
import { vi } from "vitest";
import React from "react";

// 🧩 Mock shadcn/ui components used by Leaderboard
vi.mock("@/components/ui/card", () => ({
  Card: ({ children }: any) => React.createElement("div", { "data-testid": "mock-card" }, children),
  CardContent: ({ children }: any) => React.createElement("div", null, children),
  CardHeader: ({ children }: any) => React.createElement("div", null, children),
  CardTitle: ({ children }: any) => React.createElement("h2", null, children),
  CardDescription: ({ children }: any) => React.createElement("p", null, children),
}));

vi.mock("@/components/ui/input", () => ({
  Input: (props: any) => React.createElement("input", props),
}));

vi.mock("@/components/ui/separator", () => ({
  Separator: () => React.createElement("hr"),
}));

// Mock hover-card so content is always rendered and accessible in tests
vi.mock('@/components/ui/hover-card', () => ({
  HoverCard: ({ children }: any) => React.createElement('div', null, children),
  HoverCardTrigger: ({ children }: any) => React.createElement('div', null, children),
  HoverCardContent: ({ children }: any) => React.createElement('div', null, children),
}));

// ✅ Mock Supabase client so it never tries to connect to the real database
vi.mock("@/lib/supabase", () => ({
  supabase: {
    rpc: vi.fn().mockResolvedValue({ data: [], error: null }),
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
  },
}));

// Suppress jsdom navigation warnings when tests create and click anchor elements.
// JSDOM throws "Not implemented: navigation (except hash changes)" for some anchor clicks
// which is noisy in test output. Override HTMLAnchorElement.prototype.click to a no-op
// so tests that simulate clicks (download link.click()) don't trigger navigation.
;(function disableAnchorNavigation() {
  try {
    // @ts-ignore
    const proto = HTMLAnchorElement && HTMLAnchorElement.prototype
    if (proto && typeof proto.click === 'function') {
      // keep original if needed later
      // @ts-ignore
      proto.__originalClick = proto.click
      // override
      // @ts-ignore
      proto.click = function () {
        // do nothing - prevents jsdom from attempting navigation
      }
    }
  } catch (e) {
    // ignore - best-effort suppression
  }
})()

// Provide a default clipboard mock so tests that rely on navigator.clipboard
// don't fail if they forget to set a per-test mock. Tests that need to assert
// writeText can override this with their own spy.
;(function ensureClipboard() {
  try {
    // @ts-ignore
    if (!global.navigator) (global.navigator as any) = {}
    // @ts-ignore
    if (!global.navigator.clipboard) {
      // @ts-ignore
      global.navigator.clipboard = { writeText: vi.fn().mockResolvedValue(undefined) }
    }
  } catch (e) {
    // ignore
  }
})()

// Filter noisy React 'act(...)' warnings coming from Tooltip updates in some tests.
// These warnings are benign in our tests where we wait for DOM updates via testing-library.
;(function filterActWarnings() {
  const origError = console.error.bind(console)
  // Pattern used in the React warning text emitted by jsdom/react when an update
  // is not wrapped in act(...). We only filter Tooltip-specific ones and the generic
  // act(...) guidance messages to keep other errors visible.
  const skipPatterns = [
    /An update to .*Tooltip inside a test was not wrapped in act\(/,
    /When testing, code that causes React state updates should be wrapped into act\(/,
  ]

  // @ts-ignore
  console.error = (...args: any[]) => {
    try {
      const msg = typeof args[0] === 'string' ? args[0] : ''
      for (const p of skipPatterns) {
        if (p.test(msg)) return
      }
    } catch (e) {
      // on any failure, fallback to original
    }
    origError(...args)
  }
})()
