import React, { useEffect } from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach } from 'vitest'

import '../setup'

// Import the module under test
import * as AuthModule from '@/context/AuthContext'

const storageProto = Object.getPrototypeOf(window.localStorage)

const applyMatchMedia = (matches: boolean) => {
  const matchMediaMock = vi.fn().mockImplementation((query) => ({
    matches,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }))
  // @ts-ignore
  window.matchMedia = matchMediaMock
  return matchMediaMock
}

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

    // Silence expected console.error from AuthProvider when getSession fails to keep CI logs clean
    const origConsoleError = console.error
    // @ts-ignore
    console.error = () => {}

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

    // restore console.error
    // @ts-ignore
    console.error = origConsoleError
  })

  it('updates role from app_metadata.roles array via auth state change', async () => {
    const lib = await import('@/lib/supabase')
    const subscription = { unsubscribe: vi.fn() }
    let stateChangeHandler: ((event: string, session: any) => void) | undefined

    lib.supabase.auth = {
      ...(lib.supabase.auth || {}),
      getSession: vi
        .fn()
        .mockResolvedValue({ data: { session: { user: { id: 'u3', user_metadata: {}, app_metadata: {} } } }, error: null }),
      onAuthStateChange: vi.fn().mockImplementation((handler) => {
        stateChangeHandler = handler
        return { data: { subscription } }
      }),
    }

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
    await waitFor(() => expect(lib.supabase.auth?.onAuthStateChange).toHaveBeenCalled())
    expect(stateChangeHandler).toBeTypeOf('function')

    stateChangeHandler?.('SIGNED_IN', { user: { id: 'u3', user_metadata: {}, app_metadata: { roles: ['member'] } } })

    await waitFor(() => expect(screen.getByText(/role:member/i)).toBeInTheDocument())
  })

  it('initializes theme from stored preference', async () => {
    const lib = await import('@/lib/supabase')
    lib.supabase.auth = {
      ...(lib.supabase.auth || {}),
      getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
      onAuthStateChange: vi.fn().mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } }),
    }

    const getItemSpy = vi.spyOn(storageProto, 'getItem').mockImplementation(() => 'dark')
    const setItemSpy = vi.spyOn(storageProto, 'setItem').mockImplementation(() => undefined)

    applyMatchMedia(false)

    const TestConsumer = () => {
      const ctx = AuthModule.useAuth()
      return <div>dark:{String(ctx.isDark)}</div>
    }

    render(
      <AuthModule.AuthProvider>
        <TestConsumer />
      </AuthModule.AuthProvider>
    )

    await waitFor(() => expect(screen.getByText(/dark:true/i)).toBeInTheDocument())
    await waitFor(() => expect(setItemSpy).toHaveBeenCalledWith('theme', 'dark'))
    expect(document.documentElement.classList.contains('dark')).toBe(true)

    setItemSpy.mockRestore()
    getItemSpy.mockRestore()
    document.documentElement.classList.remove('dark')
  })

  it('falls back to system preference when no stored theme', async () => {
    const lib = await import('@/lib/supabase')
    lib.supabase.auth = {
      ...(lib.supabase.auth || {}),
      getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
      onAuthStateChange: vi.fn().mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } }),
    }

    const getItemSpy = vi.spyOn(storageProto, 'getItem').mockImplementation(() => null)
    const setItemSpy = vi.spyOn(storageProto, 'setItem').mockImplementation(() => undefined)

    applyMatchMedia(false)

    const TestConsumer = () => {
      const ctx = AuthModule.useAuth()
      return <div>dark:{String(ctx.isDark)}</div>
    }

    render(
      <AuthModule.AuthProvider>
        <TestConsumer />
      </AuthModule.AuthProvider>
    )

    await waitFor(() => expect(screen.getByText(/dark:false/i)).toBeInTheDocument())
    await waitFor(() => expect(setItemSpy).toHaveBeenCalledWith('theme', 'light'))
    expect(document.documentElement.classList.contains('dark')).toBe(false)

    setItemSpy.mockRestore()
    getItemSpy.mockRestore()
  })

  it('swallows localStorage getItem errors during theme initialization', async () => {
    const lib = await import('@/lib/supabase')
    lib.supabase.auth = {
      ...(lib.supabase.auth || {}),
      getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
      onAuthStateChange: vi.fn().mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } }),
    }

    const getItemSpy = vi.spyOn(storageProto, 'getItem').mockImplementation(() => {
      throw new Error('denied')
    })
    const setItemSpy = vi.spyOn(storageProto, 'setItem').mockImplementation(() => undefined)

    applyMatchMedia(false)

    expect(() =>
      render(
        <AuthModule.AuthProvider>
          <div />
        </AuthModule.AuthProvider>
      )
    ).not.toThrow()

    await waitFor(() => expect(setItemSpy).toHaveBeenCalled())

    setItemSpy.mockRestore()
    getItemSpy.mockRestore()
    document.documentElement.classList.remove('dark')
  })

})
