import React from 'react'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import { BrowserRouter } from 'react-router-dom'

import '../setup'

// Mock AuthContext to provide a user id
vi.mock('@/context/AuthContext', () => ({
  useAuth: () => ({ user: { id: 'u1' } }),
}))

// Mock toast so we can assert calls
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

import Dashboard from '@/pages/Dashboard'

describe('Dashboard edge cases', () => {
  beforeEach(() => vi.clearAllMocks())

  it('shows toast error when clipboard is unavailable', async () => {
    const lib = await import('@/lib/supabase')
    const userDetails = {
      problem_stats: { total_solved: 1, easy_solved: 1, medium_solved: 0, hard_solved: 0 },
      progress_stats: { streak_count: 0, total_active_days: 0, recent_submissions: '[]', submission_calendar_json: '{}' },
      topic_stats: [],
      language_stats: [],
    }
    ;(lib.supabase.rpc as any).mockResolvedValueOnce({ data: userDetails, error: null })

    // Ensure navigator.clipboard is undefined
    // @ts-ignore
    global.navigator = Object.assign(global.navigator || {}, { clipboard: undefined })

    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    )

    await waitFor(() => expect(screen.getByText('Total Solved')).toBeInTheDocument())

    const trigger = screen.getByRole('button', { name: /Get Custom Prompt/i })
    fireEvent.click(trigger)

    const copyButton = screen.getByRole('button', { name: /Copy prompt/i })
    fireEvent.click(copyButton)

    const sonner = await import('sonner')
    await waitFor(() => expect(sonner.toast.error).toHaveBeenCalledWith('Failed to copy prompt'))
  })

  it('gracefully handles malformed recent_submissions JSON', async () => {
    const lib = await import('@/lib/supabase')
    const userDetails = {
      problem_stats: { total_solved: 0, easy_solved: 0, medium_solved: 0, hard_solved: 0 },
      progress_stats: { streak_count: 0, total_active_days: 0, recent_submissions: 'NOT_JSON', submission_calendar_json: '{}' },
      topic_stats: [],
      language_stats: [],
    }
    ;(lib.supabase.rpc as any).mockResolvedValueOnce({ data: userDetails, error: null })

    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    )

    // The Recent Submissions card should show the fallback text
    await waitFor(() => expect(screen.getByText('No recent submissions found')).toBeInTheDocument())
  })
})
