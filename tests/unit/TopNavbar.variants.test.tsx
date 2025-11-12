import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { MemoryRouter } from 'react-router-dom'

import '../setup'

const useAuthMock = vi.fn()

vi.mock('@/context/AuthContext', () => ({
  useAuth: () => useAuthMock(),
}))

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom')
  return {
    ...actual,
    useNavigate: () => vi.fn(),
  }
})

import TopNavbar from '@/components/TopNavbar'

describe('TopNavbar route and theme variants', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useAuthMock.mockReturnValue({
      user: { id: 'u1' },
      role: 'user',
      isDark: false,
      toggleTheme: vi.fn(),
    })
  })

  it('marks dashboard button active when path is /dashboard', () => {
    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <TopNavbar />
      </MemoryRouter>
    )

    const dashboardBtn = screen.getByRole('button', { name: /dashboard/i })
    const leaderboardBtn = screen.getByRole('button', { name: /leaderboard/i })

    expect(dashboardBtn.className).toMatch(/text-primary-foreground/)
    expect(leaderboardBtn.className).toMatch(/hover:bg-accent/)
  })

  it('marks leaderboard button active when path is /leaderboard', () => {
    render(
      <MemoryRouter initialEntries={['/leaderboard']}>
        <TopNavbar />
      </MemoryRouter>
    )

    const dashboardBtn = screen.getByRole('button', { name: /dashboard/i })
    const leaderboardBtn = screen.getByRole('button', { name: /leaderboard/i })

    expect(leaderboardBtn.className).toMatch(/text-primary-foreground/)
    expect(dashboardBtn.className).toMatch(/hover:bg-accent/)
  })

  it('applies dark toggle styling when isDark is true', () => {
    useAuthMock.mockReturnValue({
      user: { id: 'u1' },
      role: 'user',
      isDark: true,
      toggleTheme: vi.fn(),
    })

    render(
      <MemoryRouter>
        <TopNavbar />
      </MemoryRouter>
    )

    const toggle = screen.getByRole('switch')
    expect(toggle.className).toMatch(/bg-slate-700/)
    const thumb = toggle.querySelector('span')
    expect(thumb?.className).toMatch(/translate-x-8/)
  })
})

