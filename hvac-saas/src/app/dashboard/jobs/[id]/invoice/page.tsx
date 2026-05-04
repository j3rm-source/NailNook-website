import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { formatCurrency, formatDate } from '@/lib/utils'

export default async function InvoicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase
    .from('user_profiles').select('tenant_id').eq('id', user!.id).single()

  const [{ data: job }, { data: tenant }] = await Promise.all([
    supabase
      .from('jobs')
      .select('*, contact:contacts(first_name, last_name, phone, email, address)')
      .eq('id', id)
      .eq('tenant_id', profile!.tenant_id)
      .single(),
    supabase
      .from('tenants')
      .select('business_name, twilio_number, primary_color')
      .eq('id', profile!.tenant_id)
      .single(),
  ])

  if (!job) notFound()

  const contact = job.contact as {
    first_name: string; last_name: string | null
    phone: string | null; email: string | null; address: string | null
  } | null

  const invoiceNum = `INV-${job.id.slice(0, 8).toUpperCase()}`
  const amount = job.invoice_amount ?? job.quoted_amount
  const accentColor = tenant?.primary_color ?? '#3b82f6'

  return (
    <>
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; }
          .invoice-root { box-shadow: none !important; margin: 0 !important; max-width: 100% !important; }
        }
      `}</style>

      {/* Print button — hidden on print */}
      <div className="no-print flex justify-end gap-3 p-6 max-w-3xl mx-auto">
        <a href="/dashboard/jobs" className="btn-secondary text-sm">← Back to Jobs</a>
        <button onClick={() => window.print()} className="btn-primary text-sm">Print / Save PDF</button>
      </div>

      <div className="invoice-root max-w-3xl mx-auto mb-16 bg-white text-slate-900 rounded-2xl shadow-2xl overflow-hidden print:shadow-none print:rounded-none">
        {/* Header bar */}
        <div style={{ background: accentColor }} className="h-2 w-full" />

        <div className="p-10 space-y-8">
          {/* Top: business + invoice meta */}
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">{tenant?.business_name ?? 'Your Business'}</h1>
              {tenant?.twilio_number && (
                <p className="text-sm text-slate-500 mt-1">{tenant.twilio_number}</p>
              )}
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold" style={{ color: accentColor }}>INVOICE</p>
              <p className="text-sm text-slate-500 mt-1">{invoiceNum}</p>
              <p className="text-sm text-slate-500">Date: {formatDate(job.created_at)}</p>
            </div>
          </div>

          <hr className="border-slate-200" />

          {/* Bill To */}
          {contact && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-2">Bill To</p>
              <p className="font-semibold text-slate-800">{contact.first_name} {contact.last_name}</p>
              {contact.address && <p className="text-sm text-slate-600">{contact.address}</p>}
              {contact.phone && <p className="text-sm text-slate-600">{contact.phone}</p>}
              {contact.email && <p className="text-sm text-slate-600">{contact.email}</p>}
            </div>
          )}

          {/* Line items table */}
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: `${accentColor}15` }}>
                <th className="text-left py-3 px-4 font-semibold text-slate-700 rounded-l-lg">Description</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-700">Date</th>
                <th className="text-right py-3 px-4 font-semibold text-slate-700 rounded-r-lg">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-slate-100">
                <td className="py-4 px-4 text-slate-800">{job.title}</td>
                <td className="py-4 px-4 text-slate-500">
                  {job.scheduled_at ? formatDate(job.scheduled_at) : formatDate(job.created_at)}
                </td>
                <td className="py-4 px-4 text-right text-slate-800">
                  {amount ? formatCurrency(amount) : '—'}
                </td>
              </tr>
              {job.description && (
                <tr>
                  <td colSpan={3} className="px-4 pt-2 pb-4 text-xs text-slate-500 italic">{job.description}</td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Total */}
          <div className="flex justify-end">
            <div className="w-64 space-y-2">
              {job.quoted_amount && job.invoice_amount && job.quoted_amount !== job.invoice_amount && (
                <div className="flex justify-between text-sm text-slate-500">
                  <span>Quoted</span>
                  <span>{formatCurrency(job.quoted_amount)}</span>
                </div>
              )}
              <div className="flex justify-between text-base font-bold text-slate-900 pt-2 border-t border-slate-200">
                <span>Total Due</span>
                <span style={{ color: accentColor }}>{amount ? formatCurrency(amount) : '—'}</span>
              </div>
            </div>
          </div>

          {/* Status badge */}
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
              job.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'
            }`}>
              {job.status.replace('_', ' ').toUpperCase()}
            </span>
          </div>

          {/* Footer */}
          <div className="text-center text-xs text-slate-400 pt-4 border-t border-slate-100">
            Thank you for your business!
          </div>
        </div>
      </div>
    </>
  )
}
