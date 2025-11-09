import React from 'react'
import { render, screen } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import { BrowserRouter } from 'react-router-dom'

import '../setup'

// Provide admin role and ensure matchMedia/localStorage behave
vi.mock('@/context/AuthContext', () => ({
  useAuth: () => ({ user: { id: 'u1' }, role: 'admin' }),
}))

// mock window.matchMedia used in TopNavbar
beforeEach(() => {
  // @ts-ignore
  window.matchMedia = window.matchMedia || (() => ({ matches: false, addListener: () => {}, removeListener: () => {} }))
  // localStorage safe stub
  const store: Record<string, string> = {}
  vi.stubGlobal('localStorage', {
    getItem: (k: string) => store[k] ?? null,
    setItem: (k: string, v: string) => (store[k] = v),
  })
})

describe('TopNavbar admin', () => {
  it('renders admin heading', async () => {
    const TopNavbar = (await import('@/components/TopNavbar')).default
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
