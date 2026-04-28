import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { Globe, ExternalLink, Pencil } from 'lucide-react'
import Link from 'next/link'

export const metadata: Metadata = { title: 'Website' }

export default async function WebsitePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase
    .from('user_profiles').select('tenant_id').eq('id', user!.id).single()

  const { data: tenant } = await supabase
    .from('tenants')
    .select('business_name, website_slug, primary_color')
    .eq('id', profile!.tenant_id)
    .single()

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
  const siteUrl = tenant?.website_slug ? `${appUrl}/${tenant.website_slug}` : null

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-700 text-white">Your Website</h1>
          <p className="text-slate-400 text-sm mt-0.5">
            {siteUrl ? (
              <a href={siteUrl} target="_blank" rel="noopener noreferrer" className="hover:text-blue-400 transition-colors flex items-center gap-1.5">
                {siteUrl} <ExternalLink size={12} />
              </a>
            ) : 'Set up your website slug in settings'}
          </p>
        </div>
        <Link href="/dashboard/settings/website" className="btn-secondary flex items-center gap-2">
          <Pencil size={14} /> Customize
        </Link>
      </div>

      {!tenant?.website_slug ? (
        <div className="card text-center py-16">
          <Globe size={32} className="text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400 font-500">Website not set up yet</p>
          <p className="text-slate-600 text-sm mt-1 mb-6">Add a website slug to publish your public booking page.</p>
          <Link href="/dashboard/settings/website" className="btn-primary">Set Up Website</Link>
        </div>
      ) : (
        <div className="card p-0 overflow-hidden" style={{ height: '700px' }}>
          <div className="flex items-center gap-2 px-4 py-2.5 border-b border-slate-700/50 bg-slate-900/60">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-500/60" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
              <div className="w-3 h-3 rounded-full bg-green-500/60" />
            </div>
            <div className="flex-1 mx-4 bg-slate-800/60 rounded-lg px-3 py-1.5 text-xs text-slate-400 border border-slate-700/40">
              {siteUrl}
            </div>
            <a href={siteUrl!} target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-slate-300 transition-colors">
              <ExternalLink size={14} />
            </a>
          </div>
          <iframe
            src={siteUrl!}
            className="w-full h-full border-none"
            title={`${tenant.business_name} website preview`}
          />
        </div>
      )}
    </div>
  )
}
