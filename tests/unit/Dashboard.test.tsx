import React from 'react'
import { render, screen, waitFor, fireEvent, within } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import { BrowserRouter } from 'react-router-dom'

// Ensure setup mocks (ui, supabase default) are applied
import '../setup'

// Mock AuthContext to provide a user id for the page module and component
vi.mock('@/context/AuthContext', () => ({
  useAuth: () => ({ user: { id: 'u1' } }),
}))

import Dashboard from '@/pages/Dashboard'

// Mock toast so we can assert calls
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

describe('Dashboard page', () => {
  beforeEach(() => {
    // Clear mock call counts but keep implementations from tests/setup
    vi.clearAllMocks()
  })

  it('renders user stats when user details are returned', async () => {
    // AuthContext is mocked at module top-level

    // Provide a fake user details object from supabase.rpc
    const userDetails = {
      problem_stats: { total_solved: 42, easy_solved: 20, medium_solved: 15, hard_solved: 7 },
      progress_stats: {
        streak_count: 3,
        total_active_days: 100,
        recent_submissions: JSON.stringify([{ id: 's1', title: 'Two Sum', titleSlug: 'two-sum', timestamp: `${Math.floor(Date.now()/1000) - 3600}` }]),
        submission_calendar_json: '{}'
      },
      topic_stats: [{ tag_name: 'arrays', difficulty_level: 'intermediate', problems_solved: 10 }],
      language_stats: [{ language_name: 'python', problems_solved: 20 }]
    }

  const lib = await import('@/lib/supabase')
  ;(lib.supabase.rpc as any).mockResolvedValueOnce({ data: userDetails, error: null })

    // Mock clipboard
    const writeMock = vi.fn().mockResolvedValue(undefined)
    const originalClipboard = typeof navigator !== 'undefined' ? (navigator as any).clipboard : undefined
    if (typeof navigator !== 'undefined') {
      Object.defineProperty(navigator, 'clipboard', {
        configurable: true,
        value: { writeText: writeMock },
      })
    }

    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    )

    // Wait for fetch to complete and UI to render stats
    await screen.findByText('Total Solved')

    // Total solved number should appear
    await screen.findByText('42')

  // Open the prompt hovercard (trigger button) and scope to the Dashboard card
  const trigger = screen.getByRole('button', { name: /Get Custom Prompt/i })
  fireEvent.click(trigger)

    const card = trigger.closest('[data-testid="mock-card"]') || document.body
    await waitFor(() => {
      const p = card.querySelector('.font-mono') || card.querySelector('[class*="font-mono"]')
      if (!p) throw new Error('formatted prompt not yet rendered')
    })

    const copyButton = within(card).getByRole('button', { name: /copy prompt/i })
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

  it('shows toast error when rpc returns error', async () => {

  const lib = await import('@/lib/supabase')
  ;(lib.supabase.rpc as any).mockResolvedValueOnce({ data: null, error: { message: 'boom' } })

    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    )

    const sonner = await import('sonner')
    await waitFor(() => {
      expect(sonner.toast.error).toHaveBeenCalledWith('boom')
    })
  })
})
