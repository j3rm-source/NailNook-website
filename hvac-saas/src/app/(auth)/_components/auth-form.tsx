'use client'

import { useState, useTransition } from 'react'
import { Eye, EyeOff, Loader2 } from 'lucide-react'

interface AuthFormProps {
  mode: 'login' | 'signup'
  action: (formData: FormData) => Promise<{ error: string } | undefined>
}

export default function AuthForm({ mode, action }: AuthFormProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const formData = new FormData(e.currentTarget)

    startTransition(async () => {
      const result = await action(formData)
      if (result?.error) setError(result.error)
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {mode === 'signup' && (
        <div>
          <label htmlFor="full_name" className="label">Full Name</label>
          <input
            id="full_name"
            name="full_name"
            type="text"
            required
            placeholder="John Smith"
            className="input"
            autoComplete="name"
          />
        </div>
      )}

      <div>
        <label htmlFor="email" className="label">Email</label>
        <input
          id="email"
          name="email"
          type="email"
          required
          placeholder="you@business.com"
          className="input"
          autoComplete="email"
        />
      </div>

      <div>
        <label htmlFor="password" className="label">Password</label>
        <div className="relative">
          <input
            id="password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            required
            placeholder={mode === 'signup' ? 'Min. 8 characters' : '••••••••'}
            minLength={mode === 'signup' ? 8 : undefined}
            className="input pr-11"
            autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={isPending}
        id={mode === 'login' ? 'btn-login' : 'btn-signup'}
        className="btn-primary w-full mt-2"
      >
        {isPending ? (
          <><Loader2 size={16} className="animate-spin" /> {mode === 'login' ? 'Signing in…' : 'Creating account…'}</>
        ) : (
          mode === 'login' ? 'Sign in' : 'Create account'
        )}
      </button>
    </form>
  )
}
