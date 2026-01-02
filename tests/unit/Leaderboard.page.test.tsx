import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import { BrowserRouter } from 'react-router-dom'

// Ensure setup mocks are applied
import '../setup'

// Mock AuthContext before importing the page so hooks see the mocked role
vi.mock('@/context/AuthContext', () => ({
  useAuth: () => ({ user: { id: 'u1' }, role: 'user' }),
}))

import Leaderboard from '@/pages/Leaderboard'
// Mock sonner toast for assertions
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

describe('Leaderboard page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders leaderboard rows when RPC returns data', async () => {
    // Note: test fixtures may sometimes use `id` instead of `user_id`.
    // The Leaderboard component intentionally falls back to `id`/username/index
    // for the row key to avoid React missing-key warnings in tests.
    const data = [
      {
        user_id: 'u1',
        username: 'alice',
        real_name: 'Alice A',
        easy_solved: 5,
        medium_solved: 2,
        hard_solved: 1,
        total_solved: 8,
        streak_count: 2,
        global_rank: 1,
        section: 'A',
        semester: '1',
      },
      {
        user_id: 'u2',
        username: 'bob',
        real_name: 'Bob B',
        easy_solved: 3,
        medium_solved: 1,
        hard_solved: 0,
        total_solved: 4,
        streak_count: 0,
        global_rank: 2,
        section: 'B',
        semester: '2',
      },
    ]

  const lib = await import('@/lib/supabase')
  ;(lib.supabase.rpc as any).mockResolvedValue({ data, error: null })

    const { container } = render(
      <BrowserRouter>
        <Leaderboard />
      </BrowserRouter>
    )

    await waitFor(() => expect(screen.getByRole('heading', { name: 'Leaderboard' })).toBeInTheDocument())

    // Rows should contain the real names — check tbody textContent to be robust against nested elements
    const tbody = container.querySelector('tbody')
    expect(tbody).toBeTruthy()
    await waitFor(() => expect(tbody!.textContent).toContain('Alice'))
    await waitFor(() => expect(tbody!.textContent).toContain('Bob'))

    // Totals should be displayed (numbers may appear in multiple places; assert at least one occurrence)
    await waitFor(() => expect(tbody!.textContent).toContain('8'))
    await waitFor(() => expect(tbody!.textContent).toContain('4'))
  })

  it('renders no rows when rpc returns empty array', async () => {
  const lib = await import('@/lib/supabase')
  ;(lib.supabase.rpc as any).mockResolvedValue({ data: [], error: null })

    const { container } = render(
      <BrowserRouter>
        <Leaderboard />
      </BrowserRouter>
    )

  await waitFor(() => expect(screen.getByRole('heading', { name: 'Leaderboard' })).toBeInTheDocument())

    const tbody = container.querySelector('tbody')
    // tbody may exist but should have zero data rows
  const rows = tbody ? Array.from(tbody.querySelectorAll('tr')) : []
  expect(rows.length).toBe(0)
  })

  it('shows toast error when rpc returns error', async () => {
  const lib = await import('@/lib/supabase')
  ;(lib.supabase.rpc as any).mockResolvedValue({ data: null, error: { message: 'boom' } })

    render(
      <BrowserRouter>
        <Leaderboard />
      </BrowserRouter>
    )

    // Wait for the page to stabilize (ensure initial effects and Select setup complete)
    await waitFor(() => expect(screen.getByRole('heading', { name: 'Leaderboard' })).toBeInTheDocument())
    const sonner = await import('sonner')
    await waitFor(() => expect(sonner.toast.error).toHaveBeenCalledWith('boom'))
  })
})
