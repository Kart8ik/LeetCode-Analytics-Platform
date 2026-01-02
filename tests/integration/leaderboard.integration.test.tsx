import React from 'react'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import { MemoryRouter } from 'react-router-dom'

import '../setup'

// Integration: render TopNavbar + Leaderboard as admin and perform CSV download
vi.mock('@/context/AuthContext', () => ({
  useAuth: () => ({ user: { id: 'u1' }, role: 'admin' }),
}))

import Leaderboard from '@/pages/Leaderboard'
import TopNavbar from '@/components/TopNavbar'

describe('Leaderboard integration (admin)', () => {
  beforeEach(() => vi.clearAllMocks())

  it('renders navbar and leaderboard and triggers download', async () => {
    const data = [
      { user_id: 'u1', username: 'alice', real_name: 'Alice', easy_solved: 1, medium_solved: 0, hard_solved: 0, total_solved: 1, streak_count: 0, global_rank: 1, section: 'A', semester: '1' },
    ]

    const lib = await import('@/lib/supabase')
    ;(lib.supabase.rpc as any).mockResolvedValue({ data, error: null })

    // Spy URL.createObjectURL
    const origCreate = URL.createObjectURL
    ;(URL as any).createObjectURL = vi.fn(() => 'blob:fake')

    const { container } = render(
      <MemoryRouter>
        <TopNavbar />
        <Leaderboard />
      </MemoryRouter>
    )

    await waitFor(() => expect(screen.getByRole('heading', { name: 'Leaderboard' })).toBeInTheDocument())

    const downloadBtn = screen.getByRole('button', { name: /Download CSV/i })
    fireEvent.click(downloadBtn)

    await waitFor(() => expect(URL.createObjectURL).toHaveBeenCalled())

    ;(URL as any).createObjectURL = origCreate
  })
})
