import React from 'react'
import { render, screen, waitFor, fireEvent, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { vi, describe, it, expect, beforeEach } from 'vitest'

import '../setup'

// Ensure AuthContext provides a user for Dashboard to fetch details
vi.mock('@/context/AuthContext', () => ({
  useAuth: () => ({ user: { id: 'u1' }, role: 'user' }),
}))

const TopNavbar = (await import('@/components/TopNavbar')).default
const Dashboard = (await import('@/pages/Dashboard')).default

describe('Integration: Navbar + Dashboard copy flow', () => {
  beforeEach(() => vi.clearAllMocks())

  it('copies prompt via Dashboard when mounted with TopNavbar', async () => {
    const lib = await import('@/lib/supabase')
    const userDetails = {
      problem_stats: { total_solved: 1, easy_solved: 1, medium_solved: 0, hard_solved: 0 },
      progress_stats: { streak_count: 0, total_active_days: 0, recent_submissions: '[]', submission_calendar_json: '{}' },
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
        <TopNavbar />
        <Dashboard />
      </MemoryRouter>
    )

    await waitFor(() => expect(screen.getByText('Total Solved')).toBeInTheDocument())

  // Scope to the specific Dashboard card that hosts the prompt so TopNavbar
  // doesn't interfere. The mocked Card component exposes data-testid="mock-card".
    const trigger = screen.getByRole('button', { name: /Get Custom Prompt/i })
    fireEvent.click(trigger)
    const card = trigger.closest('[data-testid="mock-card"]') || document.body

    await waitFor(() => {
      const p = card.querySelector('.font-mono') || card.querySelector('[class*="font-mono"]')
      if (!p) throw new Error('formatted prompt not yet rendered')
    })

    const copyButton = within(card).getByRole('button', { name: /Copy prompt/i })
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
  })
})
