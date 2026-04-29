import { notFound } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/server'
import { Phone, Wrench, Calendar, Star, CheckCircle2 } from 'lucide-react'
import type { Metadata } from 'next'
import ContactForm from './_components/contact-form'

interface Props {
  params: Promise<{ tenant: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { tenant: slug } = await params
  const supabase = await createAdminClient()
  const { data } = await supabase.from('tenants').select('business_name, tagline').eq('website_slug', slug).single()
  if (!data) return { title: 'Not Found' }
  return {
    title: data.business_name,
    description: data.tagline ?? `Book ${data.business_name} online`,
  }
}

export default async function TenantWebsitePage({ params }: Props) {
  const { tenant: slug } = await params
  const supabase = await createAdminClient()

  const { data: tenant } = await supabase
    .from('tenants')
    .select('id, business_name, tagline, about_text, services, primary_color, logo_url, twilio_number, google_review_link, website_slug')
    .eq('website_slug', slug)
    .single()

  if (!tenant) notFound()

  const primaryColor = tenant.primary_color || '#2563eb'
  const phone = tenant.twilio_number

  return (
    <div className="min-h-screen" style={{ fontFamily: 'Inter, system-ui, sans-serif', backgroundColor: '#0f172a', color: '#f8fafc' }}>

      {/* ── Header ── */}
      <header style={{ backgroundColor: '#0f172a', borderBottom: '1px solid #1e293b' }}>
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {tenant.logo_url
              ? <img src={tenant.logo_url} alt={tenant.business_name} className="h-9 w-auto" />
              : (
                <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-700 text-sm" style={{ backgroundColor: primaryColor }}>
                  {tenant.business_name[0]}
                </div>
              )
            }
            <span className="font-700 text-lg" style={{ letterSpacing: '-0.02em' }}>{tenant.business_name}</span>
          </div>
          {phone && (
            <a
              href={`tel:${phone}`}
              className="flex items-center gap-2 text-sm font-600 px-4 py-2 rounded-xl transition-colors"
              style={{ backgroundColor: primaryColor, color: 'white' }}
            >
              <Phone size={15} /> Call Now
            </a>
          )}
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="max-w-6xl mx-auto px-6 py-24 text-center">
        <div className="inline-flex items-center gap-2 text-sm px-3 py-1.5 rounded-full mb-6" style={{ backgroundColor: `${primaryColor}20`, color: primaryColor, border: `1px solid ${primaryColor}40` }}>
          <CheckCircle2 size={13} /> Licensed & Insured
        </div>
        <h1 className="text-5xl md:text-6xl font-800 mb-6" style={{ letterSpacing: '-0.03em', lineHeight: 1.1 }}>
          {tenant.tagline || `Expert Service from ${tenant.business_name}`}
        </h1>
        <p className="text-slate-400 text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
          {tenant.about_text?.slice(0, 150) || 'Fast, reliable, and affordable local service. We\'re here when you need us most.'}
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href="#book"
            className="text-base font-600 px-8 py-3.5 rounded-xl transition-all hover:opacity-90"
            style={{ backgroundColor: primaryColor, color: 'white' }}
          >
            Book Online
          </a>
          {phone && (
            <a
              href={`tel:${phone}`}
              className="flex items-center gap-2 text-base font-600 px-8 py-3.5 rounded-xl border transition-all hover:bg-slate-800"
              style={{ borderColor: '#334155', color: '#f1f5f9' }}
            >
              <Phone size={16} /> {phone}
            </a>
          )}
        </div>
      </section>

      {/* ── Services ── */}
      {tenant.services?.length > 0 && (
        <section className="max-w-6xl mx-auto px-6 py-16 border-t" style={{ borderColor: '#1e293b' }}>
          <h2 className="text-3xl font-700 text-center mb-10" style={{ letterSpacing: '-0.02em' }}>Our Services</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {tenant.services.map((service: string) => (
              <div
                key={service}
                className="rounded-xl p-4 flex items-center gap-3"
                style={{ backgroundColor: '#1e293b', border: '1px solid #334155' }}
              >
                <Wrench size={16} style={{ color: primaryColor }} />
                <span className="text-sm font-500 text-slate-200">{service}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── About ── */}
      {tenant.about_text && (
        <section className="max-w-4xl mx-auto px-6 py-16 border-t text-center" style={{ borderColor: '#1e293b' }}>
          <h2 className="text-3xl font-700 mb-6" style={{ letterSpacing: '-0.02em' }}>About Us</h2>
          <p className="text-slate-400 text-lg leading-relaxed">{tenant.about_text}</p>
        </section>
      )}

      {/* ── Booking widget ── */}
      <section id="book" className="max-w-5xl mx-auto px-6 py-16 border-t" style={{ borderColor: '#1e293b' }}>
        <h2 className="text-3xl font-700 text-center mb-3" style={{ letterSpacing: '-0.02em' }}>
          <Calendar className="inline-block mr-2 mb-1" size={28} style={{ color: primaryColor }} />
          Book an Appointment
        </h2>
        <p className="text-center text-slate-400 mb-10">Choose a time that works for you — we'll confirm within the hour.</p>

        {/* Cal.com embed — replace CALCOM_USERNAME in onboarding */}
        <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: '#1e293b', border: '1px solid #334155', minHeight: '600px' }}>
          <iframe
            src={`https://cal.com/${process.env.CALCOM_USERNAME ?? 'your-username'}?embed=true&theme=dark`}
            className="w-full"
            style={{ minHeight: '600px', border: 'none' }}
            title={`Book with ${tenant.business_name}`}
          />
        </div>
      </section>

      {/* ── Contact form ── */}
      <section className="max-w-2xl mx-auto px-6 py-16 border-t" style={{ borderColor: '#1e293b' }}>
        <h2 className="text-3xl font-700 text-center mb-3" style={{ letterSpacing: '-0.02em' }}>Send a Message</h2>
        <p className="text-center text-slate-400 mb-10">Not ready to book? Send us a quick note and we'll reach out.</p>
        <ContactForm tenantId={tenant.id} primaryColor={primaryColor} />
      </section>

      {/* ── Google reviews CTA ── */}
      {tenant.google_review_link && (
        <section className="max-w-4xl mx-auto px-6 py-12 text-center border-t" style={{ borderColor: '#1e293b' }}>
          <Star size={28} className="mx-auto mb-3" style={{ color: '#facc15' }} />
          <p className="text-lg font-600 mb-4">Happy with our service?</p>
          <a
            href={tenant.google_review_link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm font-600 px-6 py-3 rounded-xl transition-all hover:opacity-90"
            style={{ backgroundColor: '#facc15', color: '#0f172a' }}
          >
            Leave a Google Review
          </a>
        </section>
      )}

      {/* ── Footer ── */}
      <footer className="border-t py-8 text-center" style={{ borderColor: '#1e293b' }}>
        <p className="text-slate-600 text-sm">
          © {new Date().getFullYear()} {tenant.business_name}
          {phone && <span className="mx-2">·</span>}
          {phone && <a href={`tel:${phone}`} className="hover:text-slate-400 transition-colors">{phone}</a>}
          <span className="mx-2">·</span>
          <span className="text-slate-700">Powered by J2 Systems</span>
        </p>
      </footer>
    </div>
  )
}
