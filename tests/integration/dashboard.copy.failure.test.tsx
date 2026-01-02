import React from 'react'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import { MemoryRouter } from 'react-router-dom'

import '../setup'

vi.mock('@/context/AuthContext', () => ({
  useAuth: () => ({ user: { id: 'u-copy-fail' }, role: 'user' }),
}))

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

import Dashboard from '@/pages/Dashboard'

describe('Integration: Dashboard copy failure', () => {
  beforeEach(() => vi.clearAllMocks())

  it('shows toast/error when clipboard is not available', async () => {
    // Ensure clipboard is undefined for this test
    const originalClipboard = typeof navigator !== 'undefined' ? (navigator as any).clipboard : undefined
    if (typeof navigator !== 'undefined') {
      // @ts-ignore
      delete navigator.clipboard
    }

    const lib = await import('@/lib/supabase')
    const userDetails = {
      problem_stats: { total_solved: 1, easy_solved: 1, medium_solved: 0, hard_solved: 0 },
      progress_stats: { streak_count: 0, total_active_days: 0, recent_submissions: '[]', submission_calendar_json: '{}' },
      topic_stats: [],
      language_stats: [],
    }
    ;(lib.supabase.rpc as any).mockResolvedValue({ data: userDetails, error: null })

    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    )

    // Wait for dashboard prompt area to appear (if present)
    await screen.findByText(/Total Solved/i)

    const trigger = screen.getByRole('button', { name: /Get Custom Prompt/i })
    fireEvent.click(trigger)

    const copyButton = screen.getByRole('button', { name: /Copy prompt/i })
    fireEvent.click(copyButton)

    const sonner = await import('sonner')
    await waitFor(() => expect(sonner.toast.error).toHaveBeenCalledWith('Failed to copy prompt'))

    if (typeof navigator !== 'undefined') {
      if (originalClipboard !== undefined) {
        Object.defineProperty(navigator, 'clipboard', {
          configurable: true,
          value: originalClipboard,
        })
      } else {
        delete (navigator as any).clipboard
      }
    }
  }, 30000)
})