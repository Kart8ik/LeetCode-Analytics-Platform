import React from 'react'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import { MemoryRouter } from 'react-router-dom'

import '../setup'

describe('System: admin clear filters and download', () => {
  beforeEach(() => vi.clearAllMocks())

  it('admin clears filters then downloads CSV on leaderboard', async () => {
    const authMod = await import('@/context/AuthContext')
    vi.spyOn(authMod, 'useAuth').mockImplementation(() => ({ user: { id: 'u1' }, role: 'admin' }))

    const lib = await import('@/lib/supabase')
    const data = [ { user_id: 'u1', username: 'alice', real_name: 'Alice', easy_solved:1, medium_solved:0, hard_solved:0, total_solved:1, streak_count:0, global_rank:1 } ]
    ;(lib.supabase.rpc as any).mockResolvedValue({ data, error: null })

    const TopNavbar = (await import('@/components/TopNavbar')).default
    const Leaderboard = (await import('@/pages/Leaderboard')).default

    render(
      <MemoryRouter>
        <TopNavbar />
        <Leaderboard />
      </MemoryRouter>
    )

    await waitFor(() => expect(screen.getByRole('heading', { name: 'Leaderboard' })).toBeInTheDocument())

    const clearBtn = screen.getByRole('button', { name: /Clear Filters/i })
    expect(clearBtn).toBeInTheDocument()
    fireEvent.click(clearBtn)

    const downloadBtnText = await screen.findByText(/Download CSV/i)
    const downloadBtn = downloadBtnText.closest('button') || downloadBtnText
    fireEvent.click(downloadBtn as HTMLElement)

    await waitFor(() => expect(downloadBtn).toBeEnabled())
  })
})
