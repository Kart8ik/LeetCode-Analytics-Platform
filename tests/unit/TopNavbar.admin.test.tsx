import React from 'react'
import { render, screen } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest'
import { BrowserRouter } from 'react-router-dom'

import '../setup'

// Provide admin role and ensure matchMedia/localStorage behave
const useAuthMock = vi.fn()
vi.mock('@/context/AuthContext', () => ({
  useAuth: () => useAuthMock(),
}))

// mock window.matchMedia used in TopNavbar
beforeEach(() => {
  // @ts-ignore
  window.matchMedia = window.matchMedia || (() => ({ matches: false, addListener: () => {}, removeListener: () => {} }))
  // localStorage safe stub
  const store: Record<string, string> = {}
  useAuthMock.mockReset()
  useAuthMock.mockReturnValue({ user: { id: 'u1' }, role: 'admin' })
  vi.stubGlobal('localStorage', {
    getItem: (k: string) => store[k] ?? null,
    setItem: (k: string, v: string) => (store[k] = v),
  })
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('TopNavbar admin', () => {
  it('renders admin heading', async () => {
    const TopNavbar = (await import('@/components/TopNavbar')).default
    useAuthMock.mockReturnValue({ user: { id: 'u1' }, role: 'admin' })
    render(
      <BrowserRouter>
        <TopNavbar />
      </BrowserRouter>
    )

    expect(screen.getByText(/LeetTrack/i)).toBeInTheDocument()
    // Admin specific text
    expect(screen.getByText(/Admin/)).toBeInTheDocument()
  })
})
