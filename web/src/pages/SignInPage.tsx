import { ArrowLeft, KeyRound, Mail, Smartphone } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom'
import { LogoMark } from '../components/Logo'
import { DEMO_CODE } from '../lib/demoAuth'
import { useAuth } from '../lib/authContext'

const RESEND_SECONDS = 60

/** Only allow in-app paths as the post-login destination. */
function safeNext(next: string | null): string {
  return next && next.startsWith('/') && !next.startsWith('//') ? next : '/account'
}

export default function SignInPage() {
  const [params] = useSearchParams()
  const next = safeNext(params.get('next'))
  const navigate = useNavigate()
  const { user, loading, method, isDemo, sendCode, verifyCode } = useAuth()

  const [target, setTarget] = useState('')
  const [code, setCode] = useState('')
  const [step, setStep] = useState<'target' | 'code'>('target')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [cooldown, setCooldown] = useState(0)
  const codeRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!cooldown) return
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000)
    return () => clearTimeout(t)
  }, [cooldown])

  useEffect(() => {
    if (step === 'code') codeRef.current?.focus()
  }, [step])

  if (!loading && user) return <Navigate to={next} replace />

  const isEmail = method === 'email'
  const Icon = isEmail ? Mail : Smartphone

  async function send() {
    setError('')
    setBusy(true)
    try {
      await sendCode(target)
      setStep('code')
      setCooldown(RESEND_SECONDS)
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setBusy(false)
    }
  }

  async function verify() {
    setError('')
    setBusy(true)
    try {
      await verifyCode(target, code)
      navigate(next, { replace: true })
    } catch (e) {
      setError((e as Error).message)
      setBusy(false)
    }
  }

  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-4 py-10">
      <LogoMark className="size-14" />
      <h1 className="mt-4 text-center text-3xl font-extrabold">{step === 'target' ? 'Sign in to Fundi' : 'Enter your code'}</h1>
      <p className="mt-1 text-center text-muted">
        {step === 'target'
          ? `We’ll ${isEmail ? 'email' : 'SMS'} you a 6-digit code. No password needed.`
          : `We sent a code to ${target}. It expires in 1 hour.`}
      </p>

      {isDemo && (
        <p className="mt-4 w-full rounded-xl bg-marigold-100 p-3 text-center text-sm text-marigold-700">
          <b>Demo mode:</b> no codes are sent. Use any {isEmail ? 'email' : 'number'} and the code <b>{DEMO_CODE}</b>.
        </p>
      )}

      <form
        noValidate
        className="card mt-5 w-full space-y-4 p-5"
        onSubmit={(e) => {
          e.preventDefault()
          if (step === 'target') send()
          else verify()
        }}
      >
        {step === 'target' ? (
          <label className="block space-y-1.5">
            <span className="label">{isEmail ? 'Email address' : 'Cellphone number'}</span>
            <div className="relative">
              <Icon className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-faint" aria-hidden />
              <input
                id="signin-target"
                className="field pl-10"
                type={isEmail ? 'email' : 'tel'}
                inputMode={isEmail ? 'email' : 'tel'}
                autoComplete={isEmail ? 'email' : 'tel'}
                placeholder={isEmail ? 'you@example.com' : '082 123 4567'}
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                autoFocus
              />
            </div>
          </label>
        ) : (
          <label className="block space-y-1.5">
            <span className="label">6-digit code</span>
            <div className="relative">
              <KeyRound className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-faint" aria-hidden />
              <input
                id="signin-code"
                ref={codeRef}
                className="field pl-10 font-display text-xl tracking-[0.4em] tabular-nums"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                placeholder="••••••"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
              />
            </div>
          </label>
        )}

        {error && <p className="rounded-xl bg-alert-50 p-3 text-sm text-alert-600">{error}</p>}

        <button className="btn-primary w-full py-3" disabled={busy || (step === 'target' ? !target.trim() : code.length !== 6)}>
          {busy ? 'Please wait…' : step === 'target' ? 'Send my code' : 'Sign in'}
        </button>

        {step === 'code' && (
          <div className="flex items-center justify-between text-sm">
            <button
              type="button"
              onClick={() => {
                setStep('target')
                setCode('')
                setError('')
              }}
              className="inline-flex items-center gap-1 font-medium text-muted hover:text-ink"
            >
              <ArrowLeft className="size-4" aria-hidden /> Change {isEmail ? 'email' : 'number'}
            </button>
            <button type="button" onClick={send} disabled={cooldown > 0 || busy} className="font-medium text-brand-600 disabled:text-faint">
              {cooldown > 0 ? `Resend in ${cooldown}s` : 'Send a new code'}
            </button>
          </div>
        )}
      </form>

      <p className="mt-5 max-w-sm text-center text-xs text-faint">
        By signing in you agree that Fundi stores your {isEmail ? 'email address' : 'number'} to keep you signed in. We never share
        it or show it on your reviews.
      </p>
    </div>
  )
}
