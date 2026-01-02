import React from 'react'
import { render, screen, waitFor, within } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import { BrowserRouter } from 'react-router-dom'

import '../setup'

vi.mock('@/context/AuthContext', () => ({ useAuth: () => ({ user: { id: 'u1' } }) }))
import Dashboard from '@/pages/Dashboard'

describe('Dashboard sorting', () => {
  beforeEach(() => vi.clearAllMocks())

  it('sorts languageStats descending by problems_solved', async () => {
    const lib = await import('@/lib/supabase')
    const userDetails = {
      problem_stats: { total_solved: 0, easy_solved: 0, medium_solved: 0, hard_solved: 0 },
      progress_stats: { streak_count: 0, total_active_days: 0, recent_submissions: '[]', submission_calendar_json: '{}' },
      topic_stats: [],
      language_stats: [
        { language_name: 'a', problems_solved: 1 },
        { language_name: 'b', problems_solved: 10 },
        { language_name: 'c', problems_solved: 5 },
      ],
    }
    ;(lib.supabase.rpc as any).mockResolvedValueOnce({ data: userDetails, error: null })

    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    )

    await waitFor(() => expect(screen.getByText('Language Stats')).toBeInTheDocument())

    // Instead of relying on DOM sibling traversal (which can vary), find the
    // rendered nodes that contain the language names and assert document order.
    const elB = screen.getByText((c) => c.trim() === 'b')
    const elC = screen.getByText((c) => c.trim() === 'c')
    const elA = screen.getByText((c) => c.trim() === 'a')

    // elB should appear before elC, and elC before elA in document order
    expect(Boolean(elB.compareDocumentPosition(elC) & Node.DOCUMENT_POSITION_FOLLOWING)).toBe(true)
    expect(Boolean(elC.compareDocumentPosition(elA) & Node.DOCUMENT_POSITION_FOLLOWING)).toBe(true)
  })

  it('sorts topicStats descending by problems_solved', async () => {
    const lib = await import('@/lib/supabase')
    const userDetails = {
      problem_stats: { total_solved: 0, easy_solved: 0, medium_solved: 0, hard_solved: 0 },
      progress_stats: { streak_count: 0, total_active_days: 0, recent_submissions: '[]', submission_calendar_json: '{}' },
      topic_stats: [
        { tag_name: 'x', difficulty_level: 'advanced', problems_solved: 2 },
        { tag_name: 'y', difficulty_level: 'fundamental', problems_solved: 8 },
      ],
      language_stats: [],
    }
    ;(lib.supabase.rpc as any).mockResolvedValueOnce({ data: userDetails, error: null })

    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    )

    await waitFor(() => expect(screen.getByText('Topic Stats')).toBeInTheDocument())
    // the first topic displayed should be 'y'
    expect(screen.getByText('y')).toBeInTheDocument()
  })
})
