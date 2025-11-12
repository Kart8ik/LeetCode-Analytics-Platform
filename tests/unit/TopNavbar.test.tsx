import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import TopNavbar from '@/components/TopNavbar'
import { toast } from 'sonner'

// Mock Supabase for auth.signOut used in TopNavbar
vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      signOut: vi.fn(),
    },
    rpc: vi.fn().mockResolvedValue({ data: [], error: null }),
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
  },
}))
import { BrowserRouter } from 'react-router-dom'
import { supabase } from '@/lib/supabase'

const mockNavigate = vi.fn()

// Mock react-router hooks to capture navigation
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => ({ pathname: '/' }),
  }
})

const useAuthMock = vi.fn()

// Mock AuthContext to avoid RPC calls
vi.mock('@/context/AuthContext', () => ({
  useAuth: () => useAuthMock(),
}))

// Mock toast so we can assert on it
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

describe('TopNavbar', () => {
  beforeEach(() => {
    mockNavigate.mockClear()
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
      user: null,
      loading: false,
      role: 'user',
      isDark: currentIsDark,
      toggleTheme,
    }))
    // @ts-ignore
    window.matchMedia = vi.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }))
  })

  it('renders header and toggles theme', () => {
    // Ensure no dark class initially
    document.documentElement.classList.remove('dark')

    render(
      <BrowserRouter>
        <TopNavbar />
      </BrowserRouter>
    )

    // Header text
    expect(screen.getByText(/LeetTrack/i)).toBeInTheDocument()

    // Find the theme switch by role
    const toggle = screen.getByRole('switch')
    expect(toggle).toBeInTheDocument()

    // Click the toggle to enable dark
    fireEvent.click(toggle)
    expect(document.documentElement.classList.contains('dark')).toBe(true)

    // Click again to disable
    fireEvent.click(toggle)
    expect(document.documentElement.classList.contains('dark')).toBe(false)
  })

  it('calls supabase signOut and navigates on logout success', async () => {
    // make signOut resolve with no error
    const lib = await import('@/lib/supabase')
    ;(lib.supabase.auth.signOut as any).mockResolvedValueOnce({ error: null })

    render(
      <BrowserRouter>
        <TopNavbar />
      </BrowserRouter>
    )

    const logoutButton = screen.getByRole('button', { name: /logout/i })
    fireEvent.click(logoutButton)

    // wait for navigation to be called (component updates happen asynchronously)
    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/login'))
  })

  it('shows error toast when signOut throws', async () => {
    const lib = await import('@/lib/supabase')
    ;(lib.supabase.auth.signOut as any).mockRejectedValueOnce(new Error('boom'))

    render(
      <BrowserRouter>
        <TopNavbar />
      </BrowserRouter>
    )

    const logoutButton = screen.getByRole('button', { name: /logout/i })
    fireEvent.click(logoutButton)

    // wait for the error toast to be called
    await waitFor(() => expect(toast.error).toHaveBeenCalled())
  })
})
