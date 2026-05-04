import { notFound } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/server'
import { CalendarCheck, CheckCircle2, Clock, XCircle, Phone } from 'lucide-react'
import type { Metadata } from 'next'
import PortalForm from './_components/portal-form'

interface Props {
  params: Promise<{ tenant: string }>
  searchParams: Promise<{ phone?: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { tenant: slug } = await params
  const supabase = await createAdminClient()
  const { data } = await supabase.from('tenants').select('business_name').eq('website_slug', slug).single()
  return { title: data ? `My Bookings · ${data.business_name}` : 'Customer Portal' }
}

const STATUS_ICON = {
  upcoming:  <Clock size={15} className="text-blue-400" />,
  completed: <CheckCircle2 size={15} className="text-green-400" />,
  cancelled: <XCircle size={15} className="text-red-400" />,
  no_show:   <XCircle size={15} className="text-red-400" />,
}

const STATUS_LABEL: Record<string, string> = {
  upcoming:  'Upcoming',
  completed: 'Completed',
  cancelled: 'Cancelled',
  no_show:   'No Show',
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric',
    hour: 'numeric', minute: '2-digit',
  })
}

// Normalise phone: strip everything non-digit then prefix with +1 for US, or keep as-is
function normalisePhone(raw: string): string[] {
  const digits = raw.replace(/\D/g, '')
  const candidates = [raw.trim()]
  if (digits.length === 10) candidates.push(`+1${digits}`, digits)
  else if (digits.length === 11 && digits[0] === '1') candidates.push(`+${digits}`, digits)
  return [...new Set(candidates)]
}

export default async function CustomerPortalPage({ params, searchParams }: Props) {
  const { tenant: slug } = await params
  const { phone: rawPhone } = await searchParams

  const supabase = await createAdminClient()

  const { data: tenant } = await supabase
    .from('tenants')
    .select('id, business_name, primary_color, logo_url, twilio_number, calcom_link')
    .eq('website_slug', slug)
    .single()

  if (!tenant) notFound()

  const primaryColor = tenant.primary_color || '#2563eb'
  const searched = !!rawPhone?.trim()

  let contact: { id: string; first_name: string; last_name: string | null } | null = null
  let bookings: Array<{
    id: string
    starts_at: string
    ends_at: string
    status: string
    calcom_booking_id: string | null
  }> = []

  if (searched) {
    const candidates = normalisePhone(rawPhone!)
    const { data: contacts } = await supabase
      .from('contacts')
      .select('id, first_name, last_name')
      .eq('tenant_id', tenant.id)
      .in('phone', candidates)
      .limit(1)

    contact = contacts?.[0] ?? null

    if (contact) {
      const { data: rows } = await supabase
        .from('bookings')
        .select('id, starts_at, ends_at, status, calcom_booking_id')
        .eq('tenant_id', tenant.id)
        .eq('contact_id', contact.id)
        .order('starts_at', { ascending: false })
      bookings = rows ?? []
    }
  }

  return (
    <div className="min-h-screen" style={{ fontFamily: 'Inter, system-ui, sans-serif', backgroundColor: '#0f172a', color: '#f8fafc' }}>
      {/* Header */}
      <header style={{ backgroundColor: '#0f172a', borderBottom: '1px solid #1e293b' }}>
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {tenant.logo_url
              ? <img src={tenant.logo_url} alt={tenant.business_name} className="h-8 w-auto" />
              : (
                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-700 text-sm" style={{ backgroundColor: primaryColor }}>
                  {tenant.business_name[0]}
                </div>
              )
            }
            <span className="font-700 text-base" style={{ letterSpacing: '-0.02em' }}>{tenant.business_name}</span>
          </div>
          <a
            href={`/${slug}`}
            className="text-sm text-slate-400 hover:text-slate-200 transition-colors"
          >
            ← Back to website
          </a>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-16">
        {/* Title */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-5" style={{ backgroundColor: `${primaryColor}20` }}>
            <CalendarCheck size={24} style={{ color: primaryColor }} />
          </div>
          <h1 className="text-3xl font-700 mb-2" style={{ letterSpacing: '-0.02em' }}>My Bookings</h1>
          <p className="text-slate-400">Enter the phone number you used when booking to view your appointments.</p>
        </div>

        {/* Lookup form */}
        <div className="mb-10">
          <PortalForm slug={slug} primaryColor={primaryColor} />
        </div>

        {/* Results */}
        {searched && !contact && (
          <div className="rounded-2xl border border-slate-700 bg-slate-800/50 p-10 text-center">
            <Phone size={32} className="text-slate-600 mx-auto mb-3" />
            <p className="font-500 text-slate-300 mb-1">No bookings found</p>
            <p className="text-sm text-slate-500">We couldn't find any bookings for that number. Try the number you gave us when scheduling.</p>
          </div>
        )}

        {contact && (
          <div className="space-y-4">
            <p className="text-sm text-slate-400">
              Showing bookings for <span className="text-slate-200 font-500">{contact.first_name} {contact.last_name ?? ''}</span>
            </p>

            {bookings.length === 0 ? (
              <div className="rounded-2xl border border-slate-700 bg-slate-800/50 p-10 text-center">
                <CalendarCheck size={32} className="text-slate-600 mx-auto mb-3" />
                <p className="text-sm text-slate-500">No bookings on record yet.</p>
              </div>
            ) : (
              bookings.map(booking => (
                <div
                  key={booking.id}
                  className="rounded-xl border p-5 flex items-center gap-4"
                  style={{ backgroundColor: '#1e293b', borderColor: '#334155' }}
                >
                  <div className="shrink-0 mt-0.5">
                    {STATUS_ICON[booking.status as keyof typeof STATUS_ICON] ?? STATUS_ICON.upcoming}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-500 text-slate-200">{formatDateTime(booking.starts_at)}</p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {STATUS_LABEL[booking.status] ?? booking.status}
                      {booking.status === 'upcoming' && (
                        <> · ends {new Date(booking.ends_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}</>
                      )}
                    </p>
                  </div>
                  {booking.status === 'upcoming' && booking.calcom_booking_id && (
                    <a
                      href={`https://cal.com/reschedule/${booking.calcom_booking_id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="shrink-0 text-xs font-600 px-4 py-2 rounded-lg border transition-colors hover:bg-slate-700"
                      style={{ borderColor: '#475569', color: '#94a3b8' }}
                    >
                      Reschedule
                    </a>
                  )}
                </div>
              ))
            )}

            {tenant.calcom_link && (
              <div className="mt-6 text-center">
                <a
                  href={tenant.calcom_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm font-600 px-6 py-3 rounded-xl transition-all hover:opacity-90"
                  style={{ backgroundColor: primaryColor, color: 'white' }}
                >
                  <CalendarCheck size={15} /> Book a New Appointment
                </a>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
