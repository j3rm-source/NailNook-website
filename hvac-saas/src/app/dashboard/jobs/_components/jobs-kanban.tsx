'use client'

import { useState } from 'react'
import { Plus, DollarSign, User, Calendar } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { cn, formatCurrency, formatDate } from '@/lib/utils'
import type { Job, JobStatus } from '@/lib/types'

const COLUMNS: { status: JobStatus; label: string; color: string; dot: string }[] = [
  { status: 'new',         label: 'New',         color: 'border-slate-600',   dot: 'bg-slate-400' },
  { status: 'quoted',      label: 'Quoted',       color: 'border-blue-500/40', dot: 'bg-blue-400' },
  { status: 'scheduled',   label: 'Scheduled',    color: 'border-purple-500/40', dot: 'bg-purple-400' },
  { status: 'in_progress', label: 'In Progress',  color: 'border-orange-500/40', dot: 'bg-orange-400' },
  { status: 'completed',   label: 'Completed',    color: 'border-green-500/40',  dot: 'bg-green-400' },
]

interface JobsKanbanProps {
  initialJobs: (Job & { contact?: { first_name: string; last_name: string | null; phone: string | null } })[]
  contacts: { id: string; first_name: string; last_name: string | null }[]
  tenantId: string
}

export default function JobsKanban({ initialJobs, contacts, tenantId }: JobsKanbanProps) {
  const [jobs, setJobs] = useState(initialJobs)
  const [dragging, setDragging] = useState<string | null>(null)
  const [dragOver, setDragOver] = useState<JobStatus | null>(null)
  const [showAdd, setShowAdd] = useState(false)

  const supabase = createClient()

  async function moveJob(jobId: string, newStatus: JobStatus) {
    setJobs((prev) => prev.map((j) => j.id === jobId ? { ...j, status: newStatus } : j))

    if (newStatus === 'completed') {
      // Complete API triggers review request SMS (2hr delay)
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

    if (data) setJobs((prev) => [data as typeof initialJobs[0], ...prev])
    setShowAdd(false)
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-700 text-white">Jobs Pipeline</h1>
          <p className="text-slate-400 text-sm mt-0.5">{jobs.length} total jobs</p>
        </div>
        <button id="btn-add-job" onClick={() => setShowAdd(true)} className="btn-primary">
          <Plus size={16} /> New Job
        </button>
      </div>

      {/* Kanban board */}
      <div className="grid grid-cols-5 gap-4 min-h-[600px]">
        {COLUMNS.map((col) => {
          const colJobs = jobs.filter((j) => j.status === col.status)
          const isOver = dragOver === col.status

          return (
            <div
              key={col.status}
              onDragOver={(e) => { e.preventDefault(); setDragOver(col.status) }}
              onDragLeave={() => setDragOver(null)}
              onDrop={(e) => handleDrop(e, col.status)}
              className={cn(
                'rounded-2xl border p-3 transition-all duration-150',
                col.color,
                isOver ? 'bg-slate-700/40 scale-[1.01]' : 'bg-slate-800/30'
              )}
            >
              {/* Column header */}
              <div className="flex items-center gap-2 mb-3 px-1">
                <div className={cn('w-2 h-2 rounded-full', col.dot)} />
                <span className="text-xs font-600 text-slate-300 uppercase tracking-wide">{col.label}</span>
                <span className="ml-auto text-xs text-slate-600 bg-slate-700/50 rounded-full px-2 py-0.5">
                  {colJobs.length}
                </span>
              </div>

              {/* Job cards */}
              <div className="space-y-2">
                {colJobs.map((job) => (
                  <div
                    key={job.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, job.id)}
                    onDragEnd={() => setDragging(null)}
                    className={cn(
                      'card p-3 cursor-grab active:cursor-grabbing transition-all duration-150',
                      dragging === job.id && 'opacity-40 scale-95'
                    )}
                  >
                    <p className="text-sm font-500 text-slate-200 leading-snug mb-2">{job.title}</p>

                    {job.contact && (
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
                        <User size={11} />
                        {job.contact.first_name} {job.contact.last_name}
                      </div>
                    )}

                    {job.quoted_amount && (
                      <div className="flex items-center gap-1.5 text-xs text-green-400 mb-1">
                        <DollarSign size={11} />
                        {formatCurrency(job.quoted_amount)}
                      </div>
                    )}

                    {job.scheduled_at && (
                      <div className="flex items-center gap-1.5 text-xs text-slate-500">
                        <Calendar size={11} />
                        {formatDate(job.scheduled_at)}
                      </div>
                    )}
                  </div>
                ))}

                {colJobs.length === 0 && (
                  <div className="text-center py-8 text-slate-700 text-xs">
                    Drop jobs here
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Add Job Modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-md animate-fade-in">
            <div className="flex items-center justify-between p-6 border-b border-slate-700">
              <h2 className="text-lg font-700 text-white">New Job</h2>
              <button onClick={() => setShowAdd(false)} className="btn-ghost w-8 h-8 p-0 rounded-lg text-slate-400">✕</button>
            </div>
            <form
              onSubmit={(e) => { e.preventDefault(); addJob(new FormData(e.currentTarget)) }}
              className="p-6 space-y-4"
            >
              <div>
                <label className="label">Job Title *</label>
                <input id="job-title" name="title" required className="input" placeholder="e.g. AC unit repair" />
              </div>
              <div>
                <label className="label">Contact *</label>
                <select id="job-contact" name="contact_id" required className="input">
                  <option value="">Select contact…</option>
                  {contacts.map((c) => (
                    <option key={c.id} value={c.id}>{c.first_name} {c.last_name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Quoted Amount ($)</label>
                <input id="job-amount" name="quoted_amount" type="number" min="0" step="0.01" className="input" placeholder="0.00" />
              </div>
              <div>
                <label className="label">Description</label>
                <textarea id="job-description" name="description" className="input resize-none h-20" placeholder="Job details…" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowAdd(false)} className="btn-secondary flex-1">Cancel</button>
                <button id="btn-save-job" type="submit" className="btn-primary flex-1">Create Job</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
