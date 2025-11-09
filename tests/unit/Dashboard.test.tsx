import React from 'react'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import { BrowserRouter } from 'react-router-dom'

// Ensure setup mocks (ui, supabase default) are applied
import '../setup'

// Mock AuthContext to provide a user id for the page module and component
vi.mock('@/context/AuthContext', () => ({
  useAuth: () => ({ user: { id: 'u1' } }),
}))

import Dashboard from '@/pages/Dashboard'

// Mock toast so we can assert calls
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

describe('Dashboard page', () => {
  beforeEach(() => {
    // Clear mock call counts but keep implementations from tests/setup
    vi.clearAllMocks()
  })

  it('renders user stats when user details are returned', async () => {
    // AuthContext is mocked at module top-level

    // Provide a fake user details object from supabase.rpc
    const userDetails = {
      problem_stats: { total_solved: 42, easy_solved: 20, medium_solved: 15, hard_solved: 7 },
      progress_stats: {
        streak_count: 3,
        total_active_days: 100,
        recent_submissions: JSON.stringify([{ id: 's1', title: 'Two Sum', titleSlug: 'two-sum', timestamp: `${Math.floor(Date.now()/1000) - 3600}` }]),
        submission_calendar_json: '{}'
      },
      topic_stats: [{ tag_name: 'arrays', difficulty_level: 'intermediate', problems_solved: 10 }],
      language_stats: [{ language_name: 'python', problems_solved: 20 }]
    }

  const lib = await import('@/lib/supabase')
  ;(lib.supabase.rpc as any).mockResolvedValueOnce({ data: userDetails, error: null })

    // Mock clipboard
    const writeMock = vi.fn().mockResolvedValue(undefined)
    // @ts-ignore - add to global
    global.navigator = Object.assign(global.navigator || {}, { clipboard: { writeText: writeMock } })

    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    )

    // Wait for fetch to complete and UI to render stats
    await waitFor(() => {
      expect(screen.getByText('Total Solved')).toBeInTheDocument()
    })

    // Total solved number should appear
    expect(screen.getByText('42')).toBeInTheDocument()

  // Open the prompt hovercard (trigger button)
  const trigger = screen.getByRole('button', { name: /Get Custom Prompt/i })
  fireEvent.click(trigger)

  // Find the copy button inside the hover content by locating the header and its first button
  const header = screen.getByText('Custom Chatbot Prompt')
  const headerParent = header.closest('div')
  const innerCopyBtn = headerParent?.querySelector('button') as HTMLButtonElement
  expect(innerCopyBtn).toBeTruthy()
  fireEvent.click(innerCopyBtn)

  // The copy action should call clipboard.writeText
  await waitFor(() => expect(writeMock).toHaveBeenCalled())
  })

  it('shows toast error when rpc returns error', async () => {

  const lib = await import('@/lib/supabase')
  ;(lib.supabase.rpc as any).mockResolvedValueOnce({ data: null, error: { message: 'boom' } })

    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    )

    const sonner = await import('sonner')
    await waitFor(() => {
      expect(sonner.toast.error).toHaveBeenCalledWith('boom')
    })
  })
})
