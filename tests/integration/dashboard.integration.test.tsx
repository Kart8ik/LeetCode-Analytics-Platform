import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import { MemoryRouter } from 'react-router-dom'

import '../setup'

vi.mock('@/context/AuthContext', () => ({
  useAuth: () => ({ user: { id: 'u1' }, role: 'user' }),
}))

import Dashboard from '@/pages/Dashboard'
import { ExampleChart } from '@/components/ExampleChart'

describe('Dashboard integration', () => {
  beforeEach(() => vi.clearAllMocks())

  it('renders dashboard stats and example chart', async () => {
    const userDetails = {
      problem_stats: { total_solved: 7, easy_solved: 3, medium_solved: 2, hard_solved: 2 },
      progress_stats: { streak_count: 1, total_active_days: 10, recent_submissions: '[]', submission_calendar_json: '{}' },
      topic_stats: [],
      language_stats: [],
    }

    const lib = await import('@/lib/supabase')
    ;(lib.supabase.rpc as any).mockResolvedValue({ data: userDetails, error: null })

    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    )

    await waitFor(() => expect(screen.getByText('Total Solved')).toBeInTheDocument())
    expect(screen.getByText('7')).toBeInTheDocument()

    // ExampleChart can be rendered standalone to ensure parsing works
    const chart = render(<ExampleChart submissionCalendar={'{}'} />)
    expect(chart.container).toBeTruthy()
  })
})
