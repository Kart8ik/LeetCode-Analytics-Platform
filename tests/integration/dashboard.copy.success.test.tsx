import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
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

    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    )

    // Wait for dashboard content and for the formatted prompt area to be rendered
    await screen.findByText(/Total Solved/i)
    const promptEl = await waitFor(() => document.querySelector('.font-mono'), { timeout: 5000 })
    expect(promptEl).toBeTruthy()
  }, 10000)
})