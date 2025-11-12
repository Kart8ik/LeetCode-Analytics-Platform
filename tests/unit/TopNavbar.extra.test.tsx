import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import { MemoryRouter } from 'react-router-dom'

import '../setup'

// Mock useAuth to return different roles per test
const useAuthMock = vi.fn()
vi.mock('@/context/AuthContext', () => ({
  useAuth: () => useAuthMock(),
}))

import TopNavbar from '@/components/TopNavbar'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'

const createDeferred = <T,>() => {
  let resolve!: (value: T) => void
  const promise = new Promise<T>((res) => {
    resolve = res
  })
  return { promise, resolve }
}

describe('TopNavbar additional tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useAuthMock.mockReset()
    let currentIsDark = false
    const toggleTheme = vi.fn(() => {
      currentIsDark = !currentIsDark
      if (currentIsDark) {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
    })
    useAuthMock.mockImplementation(() => ({
      user: { id: 'u1' },
      role: 'user',
      isDark: currentIsDark,
      toggleTheme,
    }))
    // ensure localStorage is available and clear
    try { localStorage.clear() } catch {}
    document.documentElement.classList.remove('dark')
  })

  it('toggles theme on click and keyboard, persists preference when possible', async () => {
    render(
      <MemoryRouter>
        <TopNavbar />
      </MemoryRouter>
    )

    const toggle = screen.getByRole('switch')
    // initial should be not dark
    expect(document.documentElement.classList.contains('dark')).toBe(false)

    // click to toggle dark
    fireEvent.click(toggle)
    expect(document.documentElement.classList.contains('dark')).toBe(true)

    // trigger via keyboard (Space)
    fireEvent.keyDown(toggle, { key: ' ' })
    expect(document.documentElement.classList.contains('dark')).toBe(false)
  })

  it('renders admin heading when role is admin', async () => {
    useAuthMock.mockReturnValue({
      user: { id: 'admin1' },
      role: 'admin',
      isDark: false,
      toggleTheme: vi.fn(),
    })
    const { default: AdminTopNav } = await import('@/components/TopNavbar')

    render(
      <MemoryRouter>
        <AdminTopNav />
      </MemoryRouter>
    )

    expect(screen.getByText(/LeetTrack/i)).toBeTruthy()
    expect(screen.getByText(/Admin/i)).toBeTruthy()
  })

  it('handles logout fallback when supabase returns error', async () => {
    // make signOut return an error first, then succeed on fallback
    if (!(supabase as any).auth) (supabase as any).auth = {}
    ;(supabase as any).auth.signOut = vi.fn().mockResolvedValueOnce({ error: { message: 'fail' } })
    // fallback call stub
    ;(supabase as any).auth.signOut.mockResolvedValueOnce({ error: null })

    const toastSuccess = vi.spyOn(toast, 'success')

    render(
      <MemoryRouter>
        <TopNavbar />
      </MemoryRouter>
    )

    const logoutBtn = screen.getByRole('button', { name: /Logout/i })
    fireEvent.click(logoutBtn)

    // wait a tick for async logout
    await new Promise((r) => setTimeout(r, 50))

    expect(toastSuccess).toHaveBeenCalled()
  })

  it('short-circuits logout when a request is already in flight', async () => {
    const deferred = createDeferred<{ error: null }>()
    if (!(supabase as any).auth) (supabase as any).auth = {}
    ;(supabase as any).auth.signOut = vi.fn().mockImplementation(() => deferred.promise)

    render(
      <MemoryRouter>
        <TopNavbar />
      </MemoryRouter>
    )

    const logoutBtn = screen.getByRole('button', { name: /Logout/i })
    fireEvent.click(logoutBtn)
    expect((supabase as any).auth.signOut).toHaveBeenCalledTimes(1)
    expect(logoutBtn).toHaveTextContent(/Logging out.../i)

    fireEvent.click(logoutBtn)
    expect((supabase as any).auth.signOut).toHaveBeenCalledTimes(1)

    deferred.resolve({ error: null })
    await new Promise((r) => setTimeout(r, 0))

    expect(logoutBtn).toHaveTextContent(/Logout/i)
  })
})
