import type { Metadata } from 'next'
import Link from 'next/link'
import { login } from '../actions'
import AuthForm from '../_components/auth-form'

export const metadata: Metadata = {
  title: 'Sign In',
  description: 'Sign in to your TradeDesk account.',
}

export default function LoginPage({
  searchParams,
}: {
  searchParams: { redirect?: string }
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4">
      {/* Background glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-orange-600/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md animate-fade-in">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2.5 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-lg shadow-blue-500/30">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
                <polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
            </div>
            <span className="text-2xl font-800 text-white" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
              Trade<span className="gradient-text">Desk</span>
            </span>
          </div>
          <h1 className="text-2xl font-700 text-white">Welcome back</h1>
          <p className="text-slate-400 mt-1 text-sm">Sign in to your dashboard</p>
        </div>

        {/* Card */}
        <div className="card border-slate-700/60">
          <AuthForm mode="login" action={login} />

          <div className="mt-6 text-center text-sm text-slate-500">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="text-blue-400 hover:text-blue-300 font-500 transition-colors">
              Start free trial
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
