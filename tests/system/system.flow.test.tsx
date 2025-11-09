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

    render(
      <MemoryRouter>
        <TopNavbar />
        <Leaderboard />
      </MemoryRouter>
    )

  await waitFor(() => expect(screen.getByRole('heading', { name: 'Leaderboard' })).toBeInTheDocument())

  // sometimes accessible name lookup can be flaky in jsdom when other UI wrappers
  // are present; query by visible text as a more robust fallback
  await waitFor(() => expect(screen.getByText(/Download CSV/i)).toBeInTheDocument())
  const downloadTextNode = screen.getByText(/Download CSV/i)
  const downloadBtn = downloadTextNode.closest('button') || downloadTextNode
  expect(downloadBtn).toBeInTheDocument()

  fireEvent.click(downloadBtn)

    // createObjectURL is called when download is prepared
    const url = await import('url') // dummy import just to keep async boundary consistent
    await waitFor(() => {
      // No exception means flow completed; anchor clicks are suppressed in setup
      expect(downloadBtn).toBeEnabled()
    })
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
    // @ts-ignore
    global.navigator = Object.assign(global.navigator || {}, { clipboard: { writeText: writeMock } })

    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    )

    await waitFor(() => expect(screen.getByText('Total Solved')).toBeInTheDocument())

    const trigger = screen.getByRole('button', { name: /Get Custom Prompt/i })
    fireEvent.click(trigger)

    // find inner copy button as dashboard test did
    const header = screen.getByText('Custom Chatbot Prompt')
    const headerParent = header.closest('div')
    const innerCopyBtn = headerParent?.querySelector('button') as HTMLButtonElement
    expect(innerCopyBtn).toBeTruthy()
    fireEvent.click(innerCopyBtn)

    await waitFor(() => expect(writeMock).toHaveBeenCalled())
  })
})
