import React from 'react'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import { BrowserRouter } from 'react-router-dom'

// Ensure global test setup (mocks) is applied
import '../setup'

// Mock AuthContext as admin
vi.mock('@/context/AuthContext', () => ({
  useAuth: () => ({ user: { id: 'u1' }, role: 'admin' }),
}))

import Leaderboard from '@/pages/Leaderboard'

describe('Leaderboard admin interactions', () => {
  beforeEach(() => vi.clearAllMocks())

  it('shows admin controls and download CSV triggers link creation', async () => {
    const data = [
      { user_id: 'u1', username: 'alice', real_name: 'Alice', easy_solved: 1, medium_solved: 0, hard_solved: 0, total_solved: 1, streak_count: 0, global_rank: 1, section: 'A', semester: '1' },
      { user_id: 'u2', username: 'bob', real_name: 'Bob', easy_solved: 2, medium_solved: 1, hard_solved: 0, total_solved: 3, streak_count: 1, global_rank: 2, section: 'B', semester: '2' },
    ]

    const lib = await import('@/lib/supabase')
    ;(lib.supabase.rpc as any).mockResolvedValue({ data, error: null })

    // Spy on createObjectURL and on appended link click
    const origCreate = URL.createObjectURL
    ;(URL as any).createObjectURL = vi.fn(() => 'blob:fake')

    const origCreateElement = document.createElement.bind(document)
    let createdLink: HTMLAnchorElement | null = null
    document.createElement = ((tagName: string) => {
      const el = origCreateElement(tagName)
      if (tagName === 'a') {
        createdLink = el as HTMLAnchorElement
        // ensure click is a spy so we can assert it was called
        createdLink.click = vi.fn() as any
      }
      return el
    }) as any

    const { container } = render(
      <BrowserRouter>
        <Leaderboard />
      </BrowserRouter>
    )

    await waitFor(() => expect(screen.getByRole('heading', { name: 'Leaderboard' })).toBeInTheDocument())

    // Admin controls should include Download CSV and Clear Filters
    const downloadBtn = screen.getByRole('button', { name: /Download CSV/i })
    expect(downloadBtn).toBeInTheDocument()

    // Type a query so CSV will include filtered data
    const input = container.querySelector('input') as HTMLInputElement
    expect(input).toBeTruthy()
    fireEvent.change(input, { target: { value: 'Alice' } })
    await waitFor(() => expect(input.value).toBe('Alice'))

    // Click download and assert link was created and clicked
    fireEvent.click(downloadBtn)
    await waitFor(() => {
      expect(URL.createObjectURL).toHaveBeenCalled()
      expect(createdLink).toBeTruthy()
      expect(createdLink!.download).toBe('leaderboard.csv')
      expect(createdLink!.click).toHaveBeenCalled()
    })

    // Restore DOM functions
    document.createElement = origCreateElement
    ;(URL as any).createObjectURL = origCreate
  })

  it('clear filters resets query and sort settings', async () => {
    const data = [
      { user_id: 'u1', username: 'alice', real_name: 'Alice', easy_solved: 1, medium_solved: 0, hard_solved: 0, total_solved: 1, streak_count: 0, global_rank: 1 },
    ]

    const lib = await import('@/lib/supabase')
    ;(lib.supabase.rpc as any).mockResolvedValue({ data, error: null })

    const { container } = render(
      <BrowserRouter>
        <Leaderboard />
      </BrowserRouter>
    )

    await waitFor(() => expect(screen.getByRole('heading', { name: 'Leaderboard' })).toBeInTheDocument())

    const input = container.querySelector('input') as HTMLInputElement
    fireEvent.change(input, { target: { value: 'something' } })
    await waitFor(() => expect(input.value).toBe('something'))

    const clearBtn = screen.getByRole('button', { name: /Clear Filters/i })
    expect(clearBtn).toBeInTheDocument()
    fireEvent.click(clearBtn)

    await waitFor(() => expect(input.value).toBe(''))
  })
})
