import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { UserCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Spinner } from '@/components/ui/spinner'
import { useAuth } from '@/context/AuthContext'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'

type Mode = 'setup' | 'edit'

type UniversityRow = Record<string, unknown>

type ProfileValues = {
  username: string
  realName: string
  universityId: string
}

type ProfileEditorPanelProps = {
  mode: Mode
  title: string
  description: string
  submitLabel: string
  showEmail?: boolean
  /** `card` = standalone panel (setup / profile page). `dropdown` = inside DropdownMenuSubContent (no outer chrome). */
  presentation?: 'card' | 'dropdown'
}

const initialValues: ProfileValues = {
  username: '',
  realName: '',
  universityId: '',
}

const getUniversityValue = (university: UniversityRow) => {
  const rawValue = university.id ?? university.university_id ?? university.value
  if (rawValue) {
    return String(rawValue)
  }

  return getUniversityLabel(university)
}

const getUniversityLabel = (university: UniversityRow) => {
  const rawLabel =
    university.name ??
    university.university_name ??
    university.title ??
    university.label ??
    university.value ??
    university.id

  return rawLabel ? String(rawLabel) : 'University'
}

function getFunctionHttpStatus(error: unknown): number | undefined {
  if (!error || typeof error !== 'object') return undefined
  const ctx = (error as { context?: unknown }).context
  if (typeof Response !== 'undefined' && ctx instanceof Response) {
    return ctx.status
  }
  if (ctx && typeof ctx === 'object' && 'status' in ctx) {
    const n = Number((ctx as { status: unknown }).status)
    return Number.isFinite(n) ? n : undefined
  }
  return undefined
}

function getFetchAndPushBodyError(data: unknown, error: unknown): string | undefined {
  if (data !== null && data !== undefined && typeof data === 'object') {
    const errField = (data as { error?: unknown }).error
    if (typeof errField === 'string' && errField.trim()) return errField.trim()
  }
  const ctx = error && typeof error === 'object' ? (error as { context?: unknown }).context : undefined
  if (ctx && typeof ctx === 'object') {
    const body = (ctx as { body?: unknown }).body
    try {
      const parsed =
        typeof body === 'string' ? (JSON.parse(body) as { error?: string }) : (body as { error?: string })
      if (typeof parsed?.error === 'string' && parsed.error.trim()) return parsed.error.trim()
    } catch {
      /* ignore */
    }
  }
  return undefined
}

function isProfileDuplicateError(err: { message?: string; code?: string } | null): boolean {
  if (!err) return false
  const code = err.code ?? ''
  const msg = (err.message ?? '').toLowerCase()
  return code === '23505' || msg.includes('duplicate') || msg.includes('unique')
}

export default function ProfileEditorPanel({
  mode,
  title,
  description,
  submitLabel,
  showEmail = false,
  presentation = 'card',
}: ProfileEditorPanelProps) {
  const { user, setLoading } = useAuth()
  const navigate = useNavigate()
  const [values, setValues] = useState<ProfileValues>(initialValues)
  const [universities, setUniversities] = useState<UniversityRow[]>([])
  const [saving, setSaving] = useState(false)
  /** Username last loaded from DB — compare on save to decide whether to sync LeetCode. */
  const [savedUsername, setSavedUsername] = useState('')

  useEffect(() => {
    let active = true

    const loadUniversities = async () => {
      const { data, error } = await supabase.from('universities').select('*')

      if (!active) return

      if (error) {
        console.error('Failed to load universities', error)
        toast.error('Failed to load universities')
      } else {
        setUniversities(data ?? [])
      }
    }

    const loadProfile = async () => {
      const { data: authData, error: authError } = await supabase.auth.getUser()

      if (!active) return

      if (authError || !authData.user) {
        navigate('/login', { replace: true })
        return
      }

      const currentUser = authData.user
      const defaultName = currentUser.user_metadata?.full_name || currentUser.user_metadata?.name || ''

      const { data, error } = await supabase
        .from('users')
        .select('username, real_name, university_id')
        .eq('user_id', currentUser.id)
        .single()

      if (!active) return

      if (error) {
        console.error('Failed to load profile', error)
        toast.error('Failed to load your profile')
        setValues({
          username: '',
          realName: defaultName,
          universityId: '',
        })
        setSavedUsername('')
        setLoading(false)
        return
      }

      if (mode === 'setup' && data?.username) {
        navigate('/leaderboard', { replace: true })
        return
      }

      setValues({
        username: data?.username ?? '',
        realName: data?.real_name ?? defaultName,
        universityId: data?.university_id ? String(data.university_id) : '',
      })
      setSavedUsername(String(data?.username ?? '').trim())
      setLoading(false)
    }

    loadUniversities()
    loadProfile()

    return () => {
      active = false
    }
  }, [mode, navigate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user?.id) {
      navigate('/login', { replace: true })
      return
    }

    const username = values.username.trim()
    if (!username) {
      toast.error('Username is required')
      return
    }

    const usernameRegex = /^[a-zA-Z0-9_]{3,24}$/;

    if (!usernameRegex.test(username)) {
      toast.error("Invalid username format");
      return;
    }

    const oldUsername = savedUsername

    setSaving(true)

    const { error } = await supabase
      .from('users')
      .update({
        username,
        real_name: values.realName.trim(),
        university_id: values.universityId || null,
      })
      .eq('user_id', user.id)

    setSaving(false)

    if (error) {
      console.error('Failed to save profile', error)
      toast.error(
        isProfileDuplicateError(error)
          ? 'That LeetCode username is already linked to another account.'
          : error.message
      )
      return
    }

    const usernameChanged = username !== oldUsername.trim()

    if (usernameChanged) {
      setLoading(true)
      const invokeResult = await supabase.functions.invoke('fetch-and-push')
      setLoading(false)

      const fnData = invokeResult.data as unknown
      const fnError = invokeResult.error
      const response =
        'response' in invokeResult && invokeResult.response instanceof Response
          ? invokeResult.response
          : undefined

      const status = response?.status ?? getFunctionHttpStatus(fnError)
      const bodyError = getFetchAndPushBodyError(fnData, fnError)
      const looksRateLimited =
        status === 429 || /too many sync|try again in/i.test(bodyError ?? '')

      const syncFailed = fnError != null || (status !== undefined && status >= 400)

      if (syncFailed) {
        console.error('fetch-and-push failed', fnError, fnData, status)
        if (looksRateLimited) {
          toast.warning(
            'Sync rate limit reached. Please wait about 15 minutes before trying again.'
          )
        } else if (status === 500 || (status !== undefined && status >= 500)) {
          toast.error(
            'Could not sync your LeetCode stats — the server failed to complete the request. Please try again later.'
          )
        } else {
          toast.error(
            bodyError ??
              (fnError instanceof Error ? fnError.message : null) ??
              'Could not sync your LeetCode stats. Please try again.'
          )
        }
        setSavedUsername(username)
        return
      }

      toast.success(mode === 'setup' ? 'Profile completed' : 'Profile updated')
      setSavedUsername(username)
      navigate('/leaderboard', { replace: true })
      return
    }

    toast.success(mode === 'setup' ? 'Profile completed' : 'Profile updated')
    navigate('/leaderboard', { replace: true })
  }

  const email = user?.email ?? ''

  const fieldClass =
    'h-10 border-border bg-background shadow-sm dark:bg-input/30 dark:hover:bg-input/50'

  const isDropdown = presentation === 'dropdown'
  const shellClass = isDropdown
    ? 'w-full min-w-0 bg-popover'
    : 'overflow-hidden rounded-xl border border-border bg-popover shadow-lg'
  const headerClass = isDropdown
    ? 'flex items-center justify-between gap-3 border-b border-border px-3 py-2.5 '
    : 'flex items-center justify-between gap-3 border-b border-border px-4 py-3'
  const formClass = isDropdown ? 'space-y-3 px-3 py-3' : 'space-y-4 px-4 py-4'

  const body = (
    <>
      <div className={headerClass}>
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <h1 className="text-base font-semibold leading-tight text-foreground">{title}</h1>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
        <div className="flex h-9 w-9 shrink-0 items-center justify-center bg-popover sm:h-10 sm:w-10" aria-hidden>
          <UserCircle2 className="h-7 w-7 stroke-[1] text-muted-foreground sm:h-8 sm:w-8" />
        </div>
      </div>

      <form onSubmit={handleSubmit} className={formClass}>
        {showEmail && (
          <>
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-sm font-medium text-foreground">
                Email
              </Label>
              <Input
                id="email"
                value={email}
                readOnly
                className={`${fieldClass} cursor-default opacity-90`}
              />
            </div>
            <Separator />
          </>
        )}

        <div className="space-y-1.5">
          <Label htmlFor="username" className="text-sm font-medium text-foreground">
            LeetCode Username
          </Label>
          <Input
            id="username"
            type="text"
            value={values.username}
            onChange={(e) => setValues((current) => ({ ...current, username: e.target.value }))}
            className={fieldClass}
            placeholder="your-handle"
            required
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="realName" className="text-sm font-medium text-foreground">
            Real name
          </Label>
          <Input
            id="realName"
            type="text"
            value={values.realName}
            onChange={(e) => setValues((current) => ({ ...current, realName: e.target.value }))}
            className={fieldClass}
            placeholder="John Doe"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="university" className="text-sm font-medium text-foreground">
            University
          </Label>
          <Select
            value={values.universityId || undefined}
            onValueChange={(value) => setValues((current) => ({ ...current, universityId: value }))}
            disabled={universities.length === 0}
          >
            <SelectTrigger id="university" className={`${fieldClass} w-full`}>
              <SelectValue
                placeholder={universities.length === 0 ? 'Loading universities...' : 'Select a university'}
              />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-border shadow-lg z-100">
              {universities.map((university) => {
                const value = getUniversityValue(university)
                return (
                  <SelectItem key={value || getUniversityLabel(university)} value={value}>
                    {getUniversityLabel(university)}
                  </SelectItem>
                )
              })}
            </SelectContent>
          </Select>
        </div>

        <Separator />

        <Button
          type="submit"
          variant="default"
          disabled={saving}
          className="w-full"
        >
          {saving ? <Spinner className="h-4 w-4" /> : submitLabel}
        </Button>
      </form>
    </>
  )

  return <div className={shellClass}>{body}</div>
}