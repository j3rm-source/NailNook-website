import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const adminEmail = process.env.ADMIN_EMAIL
  if (!user || !adminEmail || user.email !== adminEmail) {
    redirect('/dashboard')
  }

  return (
    <div style={{ backgroundColor: '#050505', minHeight: '100vh', color: '#fff', fontFamily: 'Inter, system-ui, sans-serif' }}>
      <nav style={{ borderBottom: '1px solid #111', backgroundColor: '#080808' }}>
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span style={{ color: '#00d4b8', fontWeight: 800, fontSize: 16, letterSpacing: '-0.03em' }}>J2 SYSTEMS</span>
            <span style={{ color: '#333', fontSize: 12 }}>|</span>
            <span style={{ color: '#555', fontSize: 13, fontWeight: 500 }}>Operator Admin</span>
          </div>
          <a href="/dashboard" style={{ color: '#555', fontSize: 13 }} className="hover:text-white transition-colors">
            ← Back to Dashboard
          </a>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto px-6 py-8">{children}</main>
    </div>
  )
}
