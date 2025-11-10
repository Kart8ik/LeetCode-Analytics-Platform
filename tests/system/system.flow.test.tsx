import React from 'react'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import { MemoryRouter } from 'react-router-dom'

import '../setup'

// System-level: simulate admin download and user dashboard copy prompt flow

describe('System flows', () => {
  beforeEach(() => vi.clearAllMocks())

  it('admin downloads leaderboard CSV across navbar+page', async () => {
    // ensure the AuthContext hook returns admin (setup.ts may have already imported it)
    const authMod = await import('@/context/AuthContext')
    vi.spyOn(authMod, 'useAuth').mockImplementation(() => ({ user: { id: 'u1' }, role: 'admin' }))

    const data = [
      { user_id: 'u1', username: 'alice', real_name: 'Alice', easy_solved: 1, medium_solved: 0, hard_solved: 0, total_solved: 1, streak_count: 0, global_rank: 1, section: 'A', semester: '1' },
    ]

    const lib = await import('@/lib/supabase')
    ;(lib.supabase.rpc as any).mockResolvedValue({ data, error: null })

    const TopNavbar = (await import('@/components/TopNavbar')).default
    const Leaderboard = (await import('@/pages/Leaderboard')).default

    const originalCreateObjectURL = (URL as any).createObjectURL
    const createSpy = vi.fn(() => 'blob:fake')
    ;(URL as any).createObjectURL = createSpy
    const revokeOriginal = URL.revokeObjectURL
    const revokeSpy = revokeOriginal ? vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {}) : null

    try {
      render(
        <MemoryRouter>
          <TopNavbar />
          <Leaderboard />
        </MemoryRouter>
      )

      await waitFor(() => expect(screen.getByRole('heading', { name: 'Leaderboard' })).toBeInTheDocument())

      const downloadBtn = screen.getByRole('button', { name: /Download CSV/i })
      fireEvent.click(downloadBtn)

      await waitFor(() => expect(createSpy).toHaveBeenCalled())
      expect(downloadBtn).toBeEnabled()
    } finally {
      if (originalCreateObjectURL) {
        ;(URL as any).createObjectURL = originalCreateObjectURL
      } else {
        delete (URL as any).createObjectURL
      }
      if (revokeSpy) {
        revokeSpy.mockRestore()
      } else if (!revokeOriginal) {
        // restore by deleting if we created a stub earlier
        delete (URL as any).revokeObjectURL
      }
    }
  })

  it('user copies custom prompt on dashboard', async () => {
    const authMod = await import('@/context/AuthContext')
    vi.spyOn(authMod, 'useAuth').mockImplementation(() => ({ user: { id: 'u1' }, role: 'user' }))

    const userDetails = {
      problem_stats: { total_solved: 2, easy_solved: 1, medium_solved: 1, hard_solved: 0 },
      progress_stats: { streak_count: 1, total_active_days: 2, recent_submissions: '[]', submission_calendar_json: '{}' },
      topic_stats: [],
      language_stats: [],
    }

    const lib = await import('@/lib/supabase')
    ;(lib.supabase.rpc as any).mockResolvedValue({ data: userDetails, error: null })

    const Dashboard = (await import('@/pages/Dashboard')).default

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

    await waitFor(() => expect(screen.getByText('Total Solved')).toBeInTheDocument())

    const trigger = screen.getByRole('button', { name: /Get Custom Prompt/i })
    fireEvent.click(trigger)

    const copyButton = screen.getByRole('button', { name: /Copy prompt/i })
    fireEvent.click(copyButton)

    await waitFor(() => expect(writeMock).toHaveBeenCalled())

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
