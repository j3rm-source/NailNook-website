import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import DashboardSidebar from './_components/sidebar'
import DashboardTopbar from './_components/topbar'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Get tenant info
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('tenant_id, full_name, role')
    .eq('id', user.id)
    .single()

  // New users who haven't completed checkout yet
  if (!profile) redirect('/signup/plan')

  const { data: tenant } = await supabase
    .from('tenants')
    .select('business_name, plan_tier, stripe_subscription_status')
    .eq('id', profile.tenant_id)
    .single()

  return (
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: '#050505' }}>
      <DashboardSidebar
        businessName={tenant?.business_name ?? 'My Business'}
        planTier={(tenant?.plan_tier ?? 1) as 1 | 2 | 3}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardTopbar
          userEmail={user.email ?? ''}
          userName={profile.full_name ?? user.email ?? ''}
        />

        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
