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
