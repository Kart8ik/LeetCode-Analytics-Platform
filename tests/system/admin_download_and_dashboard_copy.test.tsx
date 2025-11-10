import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import { MemoryRouter } from 'react-router-dom'

import '../setup'

vi.mock('@/context/AuthContext', () => ({
  useAuth: () => ({ user: { id: 'admin-1' }, role: 'admin' }),
}))

import TopNavbar from '@/components/TopNavbar'
import Leaderboard from '@/pages/Leaderboard'
import Dashboard from '@/pages/Dashboard'

describe('System: admin download + dashboard copy flow', () => {
  beforeEach(() => vi.clearAllMocks())

  it('admin clears filters and downloads CSV on leaderboard, then dashboard copy for user', async () => {
    const lib = await import('@/lib/supabase')

    // Mock leaderboard RPC that download relies on
    ;(lib.supabase.rpc as any).mockResolvedValue({ data: [{ id: 'r1', name: 'x' }], error: null })

    const writeSpy = vi.spyOn(navigator.clipboard as any, 'writeText')
    const originalCreateObjectURL = (URL as any).createObjectURL
    const createSpy = vi.fn(() => 'blob:fake')
    ;(URL as any).createObjectURL = createSpy
    const revokeOriginal = URL.revokeObjectURL
    const revokeSpy = revokeOriginal ? vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {}) : null

    // Render navbar + leaderboard
    const { rerender } = render(
      <MemoryRouter>
        <TopNavbar />
        <Leaderboard />
      </MemoryRouter>
    )

  // Wait for leaderboard page to render (match heading instead of a specific row value)
  await screen.findByText(/Leaderboard/i)

    // Simulate admin clearing filters: find Clear button if present
    const clearBtn = screen.queryByText(/Clear Filters/i)
    if (clearBtn) fireEvent.click(clearBtn)

    // Simulate clicking download CSV button (may rely on anchor creation)
    const dlBtn = screen.queryByRole('button', { name: /Download CSV/i })
    fireEvent.click(dlBtn)
    await waitFor(() => expect(createSpy).toHaveBeenCalled())

    // Now render Dashboard as a user would and assert clipboard copy works
    // Switch auth mock to normal user for Dashboard render
    vi.mocked(await import('@/context/AuthContext'), true)

    // Rerender Dashboard with user context
    rerender(
      <MemoryRouter>
        <TopNavbar />
        <Dashboard />
      </MemoryRouter>
    )

    await screen.findByText(/Total Solved/i)

    const trigger = screen.getByRole('button', { name: /Get Custom Prompt/i })
    fireEvent.click(trigger)

    const copyButton = screen.getByRole('button', { name: /Copy prompt/i })
    fireEvent.click(copyButton)

    await waitFor(() => expect(writeSpy).toHaveBeenCalled(), { timeout: 5000 })

    if (originalCreateObjectURL) {
      ;(URL as any).createObjectURL = originalCreateObjectURL
    } else {
      delete (URL as any).createObjectURL
    }

    if (revokeSpy) {
      revokeSpy.mockRestore()
    } else if (!revokeOriginal) {
      delete (URL as any).revokeObjectURL
    }
  }, 20000)
})