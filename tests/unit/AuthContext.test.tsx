import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach } from 'vitest'

import '../setup'

// Import the module under test
import * as AuthModule from '@/context/AuthContext'

describe('AuthContext utilities and provider', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('AuthProvider picks up role from user_metadata.role', async () => {
    const lib = await import('@/lib/supabase')
    const fakeUser = { id: 'u1', user_metadata: { role: 'admin' }, app_metadata: {} }
    lib.supabase.auth = lib.supabase.auth || {}
    lib.supabase.auth.getSession = vi.fn().mockResolvedValue({ data: { session: { user: fakeUser } }, error: null })
    lib.supabase.auth.onAuthStateChange = vi.fn().mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } })

    const TestConsumer = () => {
      const ctx = AuthModule.useAuth()
      return (
        <div>
          <div>loading:{String(ctx.loading)}</div>
          <div>role:{String(ctx.role)}</div>
        </div>
      )
    }

    render(
      <AuthModule.AuthProvider>
        <TestConsumer />
      </AuthModule.AuthProvider>
    )

    await waitFor(() => expect(screen.getByText(/loading:false/i)).toBeInTheDocument())
    expect(screen.getByText(/role:admin/i)).toBeInTheDocument()
  })

  it('AuthProvider picks up role from app_metadata.role', async () => {
    const lib = await import('@/lib/supabase')
    const fakeUser = { id: 'u2', user_metadata: {}, app_metadata: { role: 'moderator' } }
    lib.supabase.auth = lib.supabase.auth || {}
    lib.supabase.auth.getSession = vi.fn().mockResolvedValue({ data: { session: { user: fakeUser } }, error: null })
    lib.supabase.auth.onAuthStateChange = vi.fn().mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } })

    const TestConsumer = () => {
      const ctx = AuthModule.useAuth()
      return (
        <div>
          <div>loading:{String(ctx.loading)}</div>
          <div>role:{String(ctx.role)}</div>
        </div>
      )
    }

    render(
      <AuthModule.AuthProvider>
        <TestConsumer />
      </AuthModule.AuthProvider>
    )

    await waitFor(() => expect(screen.getByText(/loading:false/i)).toBeInTheDocument())
    expect(screen.getByText(/role:moderator/i)).toBeInTheDocument()
  })

  it('AuthProvider initializes session/user/role from supabase and exposes via context', async () => {
    const lib = await import('@/lib/supabase')

    // Mock getSession to return a session with a user that has a role
    const fakeUser = { id: 'u1', user_metadata: { role: 'admin' }, app_metadata: {} }
    lib.supabase.auth = lib.supabase.auth || {}
    lib.supabase.auth.getSession = vi.fn().mockResolvedValue({ data: { session: { user: fakeUser } }, error: null })

    // Provide a dummy onAuthStateChange that returns an object with subscription.unsubscribe
    lib.supabase.auth.onAuthStateChange = vi.fn().mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } })

    const TestConsumer = () => {
      const ctx = AuthModule.useAuth()
      return (
        <div>
          <div>loading:{String(ctx.loading)}</div>
          <div>role:{String(ctx.role)}</div>
          <div>user_id:{String(ctx.user?.id ?? '')}</div>
        </div>
      )
    }

    render(
      <AuthModule.AuthProvider>
        <TestConsumer />
      </AuthModule.AuthProvider>
    )

    await waitFor(() => expect(screen.getByText(/loading:false/i)).toBeInTheDocument())
    expect(screen.getByText(/role:admin/i)).toBeInTheDocument()
    expect(screen.getByText(/user_id:u1/i)).toBeInTheDocument()
  })

  it('AuthProvider handles getSession error by setting nulls and loading false', async () => {
    const lib = await import('@/lib/supabase')
    lib.supabase.auth = lib.supabase.auth || {}
    lib.supabase.auth.getSession = vi.fn().mockRejectedValue(new Error('boom'))
    lib.supabase.auth.onAuthStateChange = vi.fn().mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } })

    const TestConsumer = () => {
      const ctx = AuthModule.useAuth()
      return (
        <div>
          <div>loading:{String(ctx.loading)}</div>
          <div>role:{String(ctx.role)}</div>
          <div>user:{String(ctx.user)}</div>
        </div>
      )
    }

    render(
      <AuthModule.AuthProvider>
        <TestConsumer />
      </AuthModule.AuthProvider>
    )

    await waitFor(() => expect(screen.getByText(/loading:false/i)).toBeInTheDocument())
    expect(screen.getByText(/role:null/i)).toBeInTheDocument()
    expect(screen.getByText(/user:null/i)).toBeInTheDocument()
  })
})
