// @ts-nocheck
import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import { BrowserRouter } from 'react-router-dom'

import '../setup'

vi.mock('@/context/AuthContext', () => ({ useAuth: () => ({ user: { id: 'u1' } }) }))
import Dashboard from '@/pages/Dashboard'

describe('Dashboard formatTimeAgo edge cases', () => {
  beforeEach(() => vi.clearAllMocks())

  const mountWithTimestamp = async (secondsAgo: number) => {
    const now = Math.floor(Date.now() / 1000)
    const ts = (now - secondsAgo).toString()
    const lib = await import('@/lib/supabase')
    const userDetails = {
      problem_stats: { total_solved: 0, easy_solved: 0, medium_solved: 0, hard_solved: 0 },
      progress_stats: { streak_count: 0, total_active_days: 0, recent_submissions: JSON.stringify([{ id: 's1', title: 'X', titleSlug: 'x', timestamp: ts }]), submission_calendar_json: '{}' },
      topic_stats: [],
      language_stats: [],
    }
    ;(lib.supabase.rpc as any).mockResolvedValueOnce({ data: userDetails, error: null })

    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    )
    await waitFor(() => expect(screen.getByText('Total Solved')).toBeInTheDocument())
  }

  // Helper: given a submission title, find the time element shown alongside it
  const findTimeForTitle = async (titleText: string) => {
    const p = await screen.findByText(titleText)
    let container: HTMLElement | null = p.parentElement
    while (container && container !== document.body) {
      const candidates = Array.from(container.querySelectorAll<HTMLElement>('div')).filter(
        (el) =>
          el !== container &&
          typeof el.className === 'string' &&
          el.className.includes('whitespace-nowrap') &&
          el.textContent?.trim()
      )

      const timeEl = candidates.find((el) => el.className.includes('text-xs'))
      if (timeEl) return timeEl

      container = container.parentElement
    }
    return null
  }

  const expectTimeLabel = async (secondsAgo: number, expected: string) => {
    await mountWithTimestamp(secondsAgo)
    const timeEl = await findTimeForTitle('X')
    expect(timeEl).toBeTruthy()
    expect(timeEl?.textContent?.trim()).toBe(expected)
  }

  it('shows just now for <60s', async () => {
    await expectTimeLabel(10, 'Just now')
  })

  it('shows minutes for <3600s', async () => {
    await expectTimeLabel(120, '2 minutes ago')
  })

  it('shows hours for <86400s', async () => {
    await expectTimeLabel(7200, '2 hours ago')
  })

  it('shows days for <604800s', async () => {
    await expectTimeLabel(2 * 86400, '2 days ago')
  })

  it('shows weeks for <2592000s', async () => {
    await expectTimeLabel(14 * 86400, '2 weeks ago')
  })

  it('shows months for <31536000s', async () => {
    await expectTimeLabel(60 * 86400, '2 months ago')
  })

  it('shows years for >=31536000s', async () => {
    await expectTimeLabel(2 * 31536000, '2 years ago')
  })
})
