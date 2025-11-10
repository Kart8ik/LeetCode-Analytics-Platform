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

describe('TopNavbar additional tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useAuthMock.mockReset()
    useAuthMock.mockReturnValue({ user: { id: 'u1' }, role: 'user' })
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
    useAuthMock.mockReturnValue({ user: { id: 'admin1' }, role: 'admin' })
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
  const signOutMock = vi.fn()
  // Ensure supabase.auth exists on the mocked client from tests/setup.ts
  if (!(supabase as any).auth) (supabase as any).auth = {}
  ;(supabase as any).auth.signOut = vi.fn().mockResolvedValueOnce({ error: { message: 'fail' } })
  // fallback call stub
  ;(supabase as any).auth.signOut.mockResolvedValueOnce({ error: null })

    const toastSuccess = vi.spyOn(toast, 'success')
    const toastError = vi.spyOn(toast, 'error')

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
})
