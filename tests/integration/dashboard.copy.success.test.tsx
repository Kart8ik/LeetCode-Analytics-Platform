import React from 'react'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import { MemoryRouter } from 'react-router-dom'

import '../setup'

vi.mock('@/context/AuthContext', () => ({
  useAuth: () => ({ user: { id: 'u-copy-ok' }, role: 'user' }),
}))

import Dashboard from '@/pages/Dashboard'

describe('Integration: Dashboard copy success', () => {
  beforeEach(() => vi.clearAllMocks())

  it('calls navigator.clipboard.writeText with formatted prompt', async () => {
    const lib = await import('@/lib/supabase')
    const userDetails = {
      problem_stats: { total_solved: 2, easy_solved: 1, medium_solved: 1, hard_solved: 0 },
      progress_stats: { streak_count: 1, total_active_days: 2, recent_submissions: '[]', submission_calendar_json: '{}' },
      topic_stats: [],
      language_stats: [],
    }
    ;(lib.supabase.rpc as any).mockResolvedValue({ data: userDetails, error: null })

    const writeMock = vi.fn().mockResolvedValue(undefined)
    const originalClipboard = typeof navigator !== 'undefined' ? (navigator as any).clipboard : undefined
    if (typeof navigator !== 'undefined') {
      Object.defineProperty(navigator, 'clipboard', {
        configurable: true,
        value: { writeText: writeMock },
      })
    }

    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    )

    // Wait for dashboard content and for the formatted prompt area to be rendered
    await screen.findByText(/Total Solved/i)

    const trigger = screen.getByRole('button', { name: /Get Custom Prompt/i })
    fireEvent.click(trigger)

    const copyButton = screen.getByRole('button', { name: /Copy prompt/i })
    fireEvent.click(copyButton)

    await waitFor(() => expect(writeMock).toHaveBeenCalledWith(expect.stringContaining('I am a LeetCode user')))

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