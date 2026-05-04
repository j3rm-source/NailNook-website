'use client'

import { useState, useMemo } from 'react'
import { Search, Plus, Phone, Mail, Filter, X, Download, CheckSquare } from 'lucide-react'
import { formatDate, formatPhone, cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import type { Contact, ContactStatus, ContactSource } from '@/lib/types'
import AddContactModal from './add-contact-modal'
import EditContactModal from './edit-contact-modal'

const STATUS_COLORS: Record<ContactStatus, string> = {
  new:       'badge-blue',
  contacted: 'badge-gray',
  qualified: 'badge-orange',
  booked:    'badge-green',
  won:       'badge-green',
  lost:      'badge-red',
}

const SOURCE_LABELS: Record<ContactSource, string> = {
  website_form: 'Website',
  ai_call:      'AI Call',
  sms_reply:    'SMS',
  manual:       'Manual',
  cal_booking:  'Booking',
}

const BULK_STATUSES: { value: ContactStatus; label: string }[] = [
  { value: 'new',       label: 'New' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'qualified', label: 'Qualified' },
  { value: 'booked',    label: 'Booked' },
  { value: 'won',       label: 'Won' },
  { value: 'lost',      label: 'Lost' },
]

interface ContactsClientProps {
  initialContacts: Contact[]
  tenantId: string
}

export default function ContactsClient({ initialContacts, tenantId }: ContactsClientProps) {
  const [contacts, setContacts] = useState<Contact[]>(initialContacts)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<ContactStatus | 'all'>('all')
  const [showAddModal, setShowAddModal] = useState(false)
  const [editContact, setEditContact] = useState<Contact | null>(null)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [bulkWorking, setBulkWorking] = useState(false)

  const supabase = createClient()

  const filtered = useMemo(() => {
    return contacts.filter(c => {
      const name = `${c.first_name} ${c.last_name ?? ''}`.toLowerCase()
      const matchSearch = !search ||
        name.includes(search.toLowerCase()) ||
        c.phone?.includes(search) ||
        c.email?.toLowerCase().includes(search.toLowerCase())
      const matchStatus = statusFilter === 'all' || c.status === statusFilter
      return matchSearch && matchStatus
    })
  }, [contacts, search, statusFilter])

  const allFilteredSelected = filtered.length > 0 && filtered.every(c => selectedIds.has(c.id))

  function toggleSelectAll() {
    if (allFilteredSelected) {
      setSelectedIds(prev => {
        const next = new Set(prev)
        filtered.forEach(c => next.delete(c.id))
        return next
      })
    } else {
      setSelectedIds(prev => {
        const next = new Set(prev)
        filtered.forEach(c => next.add(c.id))
        return next
      })
    }
  }

  function toggleSelect(id: string) {
    setSelectedIds(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  async function bulkSetStatus(status: ContactStatus) {
    const ids = [...selectedIds]
    if (!ids.length) return
    setBulkWorking(true)
    await supabase.from('contacts').update({ status }).in('id', ids)
    setContacts(prev => prev.map(c => selectedIds.has(c.id) ? { ...c, status } : c))
    setSelectedIds(new Set())
    setBulkWorking(false)
  }

  function exportCsv() {
    const rows = [
      ['First Name', 'Last Name', 'Phone', 'Email', 'Source', 'Status', 'Issue Type', 'Notes', 'Address', 'Added'],
      ...contacts.map(c => [
        c.first_name,
        c.last_name ?? '',
        c.phone ?? '',
        c.email ?? '',
        SOURCE_LABELS[c.source] ?? c.source,
        c.status,
        c.issue_type ?? '',
        c.notes ?? '',
        c.address ?? '',
        formatDate(c.created_at),
      ]),
    ]
    const csv = rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `contacts-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-700 text-white">Contacts</h1>
          <p className="text-slate-400 text-sm mt-0.5">{contacts.length} total leads & customers</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={exportCsv} className="btn-secondary gap-2">
            <Download size={14} /> Export CSV
          </button>
          <button onClick={() => setShowAddModal(true)} className="btn-primary">
            <Plus size={16} /> Add Contact
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="search"
            placeholder="Search name, phone, email…"
            className="input pl-9"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter size={14} className="text-slate-500" />
          {(['all', 'new', 'contacted', 'qualified', 'booked', 'won', 'lost'] as const).map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={cn(
                'text-xs px-3 py-1.5 rounded-lg font-500 transition-colors capitalize',
                statusFilter === s
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700'
              )}
            >
              {s === 'all' ? 'All' : s}
            </button>
          ))}
        </div>

        {search && (
          <button onClick={() => setSearch('')} className="btn-ghost text-xs gap-1">
            <X size={13} /> Clear
          </button>
        )}
      </div>

      {/* Bulk action bar */}
      {selectedIds.size > 0 && (
        <div className="flex items-center gap-3 bg-blue-500/10 border border-blue-500/30 rounded-xl px-4 py-3">
          <CheckSquare size={15} className="text-blue-400 shrink-0" />
          <span className="text-sm text-blue-300 font-500">{selectedIds.size} selected</span>
          <span className="text-slate-600 text-xs">—</span>
          <span className="text-xs text-slate-400">Set status:</span>
          <div className="flex items-center gap-1.5 flex-wrap">
            {BULK_STATUSES.map(s => (
              <button
                key={s.value}
                onClick={() => bulkSetStatus(s.value)}
                disabled={bulkWorking}
                className="text-xs px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700 transition-colors disabled:opacity-40 capitalize"
              >
                {s.label}
              </button>
            ))}
          </div>
          <button
            onClick={() => setSelectedIds(new Set())}
            className="ml-auto btn-ghost text-xs gap-1"
          >
            <X size={12} /> Deselect
          </button>
        </div>
      )}

      {/* Table */}
      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700/60">
                <th className="px-4 py-3.5 w-10">
                  <input
                    type="checkbox"
                    checked={allFilteredSelected}
                    onChange={toggleSelectAll}
                    className="rounded border-slate-600 bg-slate-800 text-blue-500 cursor-pointer"
                  />
                </th>
                <th className="text-left px-4 py-3.5 text-xs font-600 uppercase tracking-wider text-slate-500">Name</th>
                <th className="text-left px-4 py-3.5 text-xs font-600 uppercase tracking-wider text-slate-500">Contact</th>
                <th className="text-left px-4 py-3.5 text-xs font-600 uppercase tracking-wider text-slate-500">Source</th>
                <th className="text-left px-4 py-3.5 text-xs font-600 uppercase tracking-wider text-slate-500">Status</th>
                <th className="text-left px-4 py-3.5 text-xs font-600 uppercase tracking-wider text-slate-500">Score</th>
                <th className="text-left px-4 py-3.5 text-xs font-600 uppercase tracking-wider text-slate-500">Added</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/30">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-slate-500 text-sm">
                    {search ? 'No contacts match your search.' : 'No contacts yet. Add your first lead!'}
                  </td>
                </tr>
              ) : (
                filtered.map(contact => (
                  <tr
                    key={contact.id}
                    className={cn(
                      'table-row-hover cursor-pointer',
                      selectedIds.has(contact.id) && 'bg-blue-500/5'
                    )}
                  >
                    <td className="px-4 py-4" onClick={e => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={selectedIds.has(contact.id)}
                        onChange={() => toggleSelect(contact.id)}
                        className="rounded border-slate-600 bg-slate-800 text-blue-500 cursor-pointer"
                      />
                    </td>
                    <td className="px-4 py-4" onClick={() => setEditContact(contact)}>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-blue-500/15 flex items-center justify-center text-blue-300 text-xs font-700 shrink-0">
                          {contact.first_name[0]}{contact.last_name?.[0] ?? ''}
                        </div>
                        <div>
                          <p className="font-500 text-slate-200">
                            {contact.first_name} {contact.last_name}
                          </p>
                          {contact.issue_type && (
                            <p className="text-xs text-slate-500 mt-0.5">{contact.issue_type}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4" onClick={() => setEditContact(contact)}>
                      <div className="space-y-1">
                        {contact.phone && (
                          <div className="flex items-center gap-1.5 text-slate-400 text-xs">
                            <Phone size={11} />{formatPhone(contact.phone)}
                          </div>
                        )}
                        {contact.email && (
                          <div className="flex items-center gap-1.5 text-slate-400 text-xs">
                            <Mail size={11} />{contact.email}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4" onClick={() => setEditContact(contact)}>
                      <span className="badge-gray text-xs">{SOURCE_LABELS[contact.source]}</span>
                    </td>
                    <td className="px-4 py-4" onClick={() => setEditContact(contact)}>
                      <span className={cn('badge text-xs capitalize', STATUS_COLORS[contact.status])}>
                        {contact.status}
                      </span>
                    </td>
                    <td className="px-4 py-4" onClick={() => setEditContact(contact)}>
                      {contact.lead_score != null ? (
                        <span className={cn('badge text-xs font-600 tabular-nums',
                          contact.lead_score >= 7 ? 'badge-green' :
                          contact.lead_score >= 4 ? 'badge-orange' : 'badge-red'
                        )}>
                          {contact.lead_score}/10
                        </span>
                      ) : (
                        <span className="text-slate-600 text-xs">—</span>
                      )}
                    </td>
                    <td className="px-4 py-4 text-slate-500 text-xs" onClick={() => setEditContact(contact)}>
                      {formatDate(contact.created_at)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showAddModal && (
        <AddContactModal
          tenantId={tenantId}
          onClose={() => setShowAddModal(false)}
          onAdded={c => setContacts(prev => [c, ...prev])}
        />
      )}

      {editContact && (
        <EditContactModal
          contact={editContact}
          onClose={() => setEditContact(null)}
          onSaved={updated => {
            setContacts(prev => prev.map(c => c.id === updated.id ? updated : c))
            setEditContact(null)
          }}
        />
      )}
    </div>
  )
}
