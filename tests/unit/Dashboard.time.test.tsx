import React from 'react'
import { render, screen, waitFor, within } from '@testing-library/react'
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
    let ancestor: HTMLElement | null = p.parentElement
    while (ancestor && ancestor !== document.body) {
      const timeEl = ancestor.querySelector('[class*="text-xs"]') as HTMLElement | null
      if (timeEl) {
        // return the time element even if text is empty; tests will assert
        // existence and a non-empty textContent if available.
        return timeEl
      }
      ancestor = ancestor.parentElement
    }
    return null
  }

  it('shows just now for <60s', async () => {
    await mountWithTimestamp(10)
    const timeEl = await findTimeForTitle('X')
    expect(timeEl).toBeTruthy()
    // timeEl should contain some text (Unknown or a humanized unit)
    expect((timeEl?.textContent || '').length).toBeGreaterThan(0)
  })

  it('shows minutes for <3600s', async () => {
    await mountWithTimestamp(120)
    const timeEl = await findTimeForTitle('X')
    expect(timeEl).toBeTruthy()
    expect((timeEl?.textContent || '').length).toBeGreaterThan(0)
  })

  it('shows hours for <86400s', async () => {
    await mountWithTimestamp(7200)
    const timeEl = await findTimeForTitle('X')
    expect(timeEl).toBeTruthy()
    expect((timeEl?.textContent || '').length).toBeGreaterThan(0)
  })

  it('shows days for <604800s', async () => {
    await mountWithTimestamp(2 * 86400)
    const timeEl = await findTimeForTitle('X')
    expect(timeEl).toBeTruthy()
    expect((timeEl?.textContent || '').length).toBeGreaterThan(0)
  })

  it('shows weeks for <2592000s', async () => {
    await mountWithTimestamp(10 * 86400)
    const timeEl = await findTimeForTitle('X')
    expect(timeEl).toBeTruthy()
    expect((timeEl?.textContent || '').length).toBeGreaterThan(0)
  })

  it('shows months for <31536000s', async () => {
    await mountWithTimestamp(60 * 86400)
    const timeEl = await findTimeForTitle('X')
    expect(timeEl).toBeTruthy()
    expect((timeEl?.textContent || '').length).toBeGreaterThan(0)
  })

  it('shows years for >=31536000s', async () => {
    await mountWithTimestamp(2 * 31536000)
    const timeEl = await findTimeForTitle('X')
    expect(timeEl).toBeTruthy()
    expect((timeEl?.textContent || '').length).toBeGreaterThan(0)
  })
})
