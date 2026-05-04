'use client'

import { useState } from 'react'
import { Plus, DollarSign, User, Calendar, X, Pencil, Download, Star, FileText } from 'lucide-react'
import JobNotes from './job-notes'
import { createClient } from '@/lib/supabase/client'
import { cn, formatCurrency, formatDate } from '@/lib/utils'
import type { Job, JobStatus } from '@/lib/types'

const COLUMNS: { status: JobStatus; label: string; color: string; dot: string }[] = [
  { status: 'new',         label: 'New',         color: 'border-slate-600',     dot: 'bg-slate-400' },
  { status: 'quoted',      label: 'Quoted',       color: 'border-blue-500/40',   dot: 'bg-blue-400' },
  { status: 'scheduled',   label: 'Scheduled',    color: 'border-purple-500/40', dot: 'bg-purple-400' },
  { status: 'in_progress', label: 'In Progress',  color: 'border-orange-500/40', dot: 'bg-orange-400' },
  { status: 'completed',   label: 'Completed',    color: 'border-green-500/40',  dot: 'bg-green-400' },
]

const ALL_STATUSES: JobStatus[] = ['new', 'quoted', 'scheduled', 'in_progress', 'completed', 'cancelled']

type JobWithContact = Job & {
  contact?: { first_name: string; last_name: string | null; phone: string | null }
}

interface JobsKanbanProps {
  initialJobs: JobWithContact[]
  contacts: { id: string; first_name: string; last_name: string | null }[]
  tenantId: string
  googleReviewLink: string | null
  twilioNumber: string | null
}

export default function JobsKanban({ initialJobs, contacts, tenantId, googleReviewLink, twilioNumber }: JobsKanbanProps) {
  const [jobs, setJobs] = useState(initialJobs)
  const [dragging, setDragging] = useState<string | null>(null)
  const [dragOver, setDragOver] = useState<JobStatus | null>(null)
  const [showAdd, setShowAdd] = useState(false)
  const [editJob, setEditJob] = useState<JobWithContact | null>(null)
  const [reviewSent, setReviewSent] = useState<Record<string, 'sending' | 'done' | 'error'>>({})

  const canSendReview = !!(googleReviewLink && twilioNumber)

  async function sendReviewRequest(jobId: string) {
    setReviewSent(prev => ({ ...prev, [jobId]: 'sending' }))
    const res = await fetch('/api/review-request/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jobId }),
    })
    setReviewSent(prev => ({ ...prev, [jobId]: res.ok ? 'done' : 'error' }))
  }

  const supabase = createClient()

  function exportCsv() {
    const rows = [
      ['Title', 'Status', 'Contact', 'Phone', 'Quoted ($)', 'Invoice ($)', 'Scheduled', 'Description', 'Created'],
      ...jobs.map(j => [
        j.title,
        j.status,
        j.contact ? `${j.contact.first_name} ${j.contact.last_name ?? ''}`.trim() : '',
        j.contact?.phone ?? '',
        j.quoted_amount  ? (j.quoted_amount  / 100).toFixed(2) : '',
        j.invoice_amount ? (j.invoice_amount / 100).toFixed(2) : '',
        j.scheduled_at   ? formatDate(j.scheduled_at) : '',
        j.description    ?? '',
        formatDate(j.created_at),
      ]),
    ]
    const csv = rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `jobs-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  async function moveJob(jobId: string, newStatus: JobStatus) {
    setJobs(prev => prev.map(j => j.id === jobId ? { ...j, status: newStatus } : j))
    if (newStatus === 'completed') {
      await fetch('/api/jobs/complete', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId }),
      })
    } else {
      await supabase.from('jobs').update({ status: newStatus }).eq('id', jobId)
    }
  }

  function handleDragStart(e: React.DragEvent, jobId: string) {
    setDragging(jobId)
    e.dataTransfer.effectAllowed = 'move'
  }

  function handleDrop(e: React.DragEvent, status: JobStatus) {
    e.preventDefault()
    if (dragging) moveJob(dragging, status)
    setDragging(null)
    setDragOver(null)
  }

  async function addJob(fd: FormData) {
    const { data } = await supabase.from('jobs').insert({
      tenant_id: tenantId,
      contact_id: fd.get('contact_id') as string,
      title: fd.get('title') as string,
      description: (fd.get('description') as string) || null,
      quoted_amount: fd.get('quoted_amount') ? Number(fd.get('quoted_amount')) * 100 : null,
      status: 'new',
    }).select('*, contact:contacts(first_name, last_name, phone)').single()
    if (data) setJobs(prev => [data as JobWithContact, ...prev])
    setShowAdd(false)
  }

  async function saveEditJob(fd: FormData) {
    if (!editJob) return
    const patch = {
      title:          fd.get('title') as string,
      description:    (fd.get('description') as string) || null,
      status:         fd.get('status') as JobStatus,
      quoted_amount:  fd.get('quoted_amount')  ? Number(fd.get('quoted_amount'))  * 100 : null,
      invoice_amount: fd.get('invoice_amount') ? Number(fd.get('invoice_amount')) * 100 : null,
      scheduled_at:   (fd.get('scheduled_at') as string) || null,
    }

    await supabase.from('jobs').update(patch).eq('id', editJob.id)
    if (patch.status === 'completed' && editJob.status !== 'completed') {
      await fetch('/api/jobs/complete', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId: editJob.id }),
      })
    }

    setJobs(prev => prev.map(j => j.id === editJob.id ? { ...j, ...patch } : j))
    setEditJob(null)
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-700 text-white">Jobs Pipeline</h1>
          <p className="text-slate-400 text-sm mt-0.5">{jobs.filter(j => j.status !== 'cancelled').length} active jobs</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={exportCsv} className="btn-secondary gap-2">
            <Download size={14} /> Export CSV
          </button>
          <button onClick={() => setShowAdd(true)} className="btn-primary">
            <Plus size={16} /> New Job
          </button>
        </div>
      </div>

      {/* Kanban board */}
      <div className="grid grid-cols-5 gap-4 min-h-[600px]">
        {COLUMNS.map(col => {
          const colJobs = jobs.filter(j => j.status === col.status)
          const isOver = dragOver === col.status
          return (
            <div
              key={col.status}
              onDragOver={e => { e.preventDefault(); setDragOver(col.status) }}
              onDragLeave={() => setDragOver(null)}
              onDrop={e => handleDrop(e, col.status)}
              className={cn(
                'rounded-2xl border p-3 transition-all duration-150',
                col.color,
                isOver ? 'bg-slate-700/40 scale-[1.01]' : 'bg-slate-800/30'
              )}
            >
              <div className="flex items-center gap-2 mb-3 px-1">
                <div className={cn('w-2 h-2 rounded-full', col.dot)} />
                <span className="text-xs font-600 text-slate-300 uppercase tracking-wide">{col.label}</span>
                <span className="ml-auto text-xs text-slate-600 bg-slate-700/50 rounded-full px-2 py-0.5">
                  {colJobs.length}
                </span>
              </div>

              <div className="space-y-2">
                {colJobs.map(job => (
                  <div
                    key={job.id}
                    draggable
                    onDragStart={e => handleDragStart(e, job.id)}
                    onDragEnd={() => setDragging(null)}
                    onClick={() => setEditJob(job)}
                    className={cn(
                      'card p-3 cursor-pointer active:cursor-grabbing transition-all duration-150 group',
                      dragging === job.id && 'opacity-40 scale-95'
                    )}
                  >
                    <div className="flex items-start justify-between gap-1 mb-2">
                      <p className="text-sm font-500 text-slate-200 leading-snug">{job.title}</p>
                      <Pencil size={11} className="text-slate-600 group-hover:text-slate-400 transition-colors shrink-0 mt-0.5" />
                    </div>
                    {job.contact && (
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
                        <User size={11} />
                        {job.contact.first_name} {job.contact.last_name}
                      </div>
                    )}
                    {job.quoted_amount && (
                      <div className="flex items-center gap-1.5 text-xs text-green-400 mb-1">
                        <DollarSign size={11} />{formatCurrency(job.quoted_amount)}
                      </div>
                    )}
                    {job.scheduled_at && (
                      <div className="flex items-center gap-1.5 text-xs text-slate-500">
                        <Calendar size={11} />{formatDate(job.scheduled_at)}
                      </div>
                    )}
                    {job.status === 'completed' && canSendReview && job.contact?.phone && (
                      <div className="mt-2 pt-2 border-t border-slate-700/60" onClick={e => e.stopPropagation()}>
                        {reviewSent[job.id] === 'done' ? (
                          <span className="text-xs text-green-400 flex items-center gap-1"><Star size={10} /> Review sent</span>
                        ) : reviewSent[job.id] === 'error' ? (
                          <span className="text-xs text-red-400">Failed to send</span>
                        ) : (
                          <button
                            onClick={() => sendReviewRequest(job.id)}
                            disabled={reviewSent[job.id] === 'sending'}
                            className="text-xs text-slate-500 hover:text-yellow-400 flex items-center gap-1 transition-colors disabled:opacity-40"
                          >
                            <Star size={10} />
                            {reviewSent[job.id] === 'sending' ? 'Sending…' : 'Send review request'}
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                ))}
                {colJobs.length === 0 && (
                  <div className="text-center py-8 text-slate-700 text-xs">Drop jobs here</div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Add Job Modal */}
      {showAdd && (
        <Modal title="New Job" onClose={() => setShowAdd(false)}>
          <form
            onSubmit={e => { e.preventDefault(); addJob(new FormData(e.currentTarget)) }}
            className="p-6 space-y-4"
          >
            <div>
              <label className="label">Job Title *</label>
              <input name="title" required className="input" placeholder="e.g. AC unit repair" />
            </div>
            <div>
              <label className="label">Contact *</label>
              <select name="contact_id" required className="input">
                <option value="">Select contact…</option>
                {contacts.map(c => (
                  <option key={c.id} value={c.id}>{c.first_name} {c.last_name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Quoted Amount ($)</label>
              <input name="quoted_amount" type="number" min="0" step="0.01" className="input" placeholder="0.00" />
            </div>
            <div>
              <label className="label">Description</label>
              <textarea name="description" className="input resize-none h-20" placeholder="Job details…" />
            </div>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setShowAdd(false)} className="btn-secondary flex-1">Cancel</button>
              <button type="submit" className="btn-primary flex-1">Create Job</button>
            </div>
          </form>
        </Modal>
      )}

      {/* Edit Job Modal */}
      {editJob && (
        <Modal title="Edit Job" onClose={() => setEditJob(null)}>
          <form
            onSubmit={e => { e.preventDefault(); saveEditJob(new FormData(e.currentTarget)) }}
            className="p-6 space-y-4"
          >
            <div>
              <label className="label">Job Title *</label>
              <input name="title" required defaultValue={editJob.title} className="input" />
            </div>
            <div>
              <label className="label">Status</label>
              <select name="status" defaultValue={editJob.status} className="input">
                {ALL_STATUSES.map(s => (
                  <option key={s} value={s} className="capitalize">{s.replace('_', ' ')}</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Quoted ($)</label>
                <input
                  name="quoted_amount"
                  type="number" min="0" step="0.01"
                  defaultValue={editJob.quoted_amount ? editJob.quoted_amount / 100 : ''}
                  className="input" placeholder="0.00"
                />
              </div>
              <div>
                <label className="label">Invoice ($)</label>
                <input
                  name="invoice_amount"
                  type="number" min="0" step="0.01"
                  defaultValue={editJob.invoice_amount ? editJob.invoice_amount / 100 : ''}
                  className="input" placeholder="0.00"
                />
              </div>
            </div>
            <div>
              <label className="label">Scheduled Date</label>
              <input
                name="scheduled_at"
                type="datetime-local"
                defaultValue={editJob.scheduled_at ? editJob.scheduled_at.slice(0, 16) : ''}
                className="input"
              />
            </div>
            <div>
              <label className="label">Description</label>
              <textarea
                name="description"
                defaultValue={editJob.description ?? ''}
                className="input resize-none h-20"
                placeholder="Job details…"
              />
            </div>
            {editJob.contact && (
              <div className="rounded-xl bg-slate-800/60 border border-slate-700/60 px-4 py-3 text-sm">
                <p className="text-xs text-slate-500 mb-1">Contact</p>
                <p className="text-slate-200 font-500">{editJob.contact.first_name} {editJob.contact.last_name}</p>
                {editJob.contact.phone && <p className="text-slate-400 text-xs mt-0.5">{editJob.contact.phone}</p>}
              </div>
            )}
            <div className="border-t border-slate-700/50 pt-4">
              <JobNotes jobId={editJob.id} />
            </div>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setEditJob(null)} className="btn-secondary flex-1">Cancel</button>
              <a
                href={`/dashboard/jobs/${editJob.id}/invoice`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary flex items-center gap-1.5"
                onClick={e => e.stopPropagation()}
              >
                <FileText size={13} /> Invoice
              </a>
              <button type="submit" className="btn-primary flex-1">Save Changes</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-md animate-fade-in max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-slate-700 sticky top-0 bg-slate-800">
          <h2 className="text-lg font-700 text-white">{title}</h2>
          <button onClick={onClose} className="btn-ghost w-8 h-8 p-0 rounded-lg text-slate-400">
            <X size={16} />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
