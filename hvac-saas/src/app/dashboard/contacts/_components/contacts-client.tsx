'use client'

import { useState, useMemo } from 'react'
import { Search, Plus, Phone, Mail, Filter, X } from 'lucide-react'
import { formatDate, formatPhone, cn } from '@/lib/utils'
import type { Contact, ContactStatus, ContactSource } from '@/lib/types'
import AddContactModal from './add-contact-modal'

const STATUS_COLORS: Record<ContactStatus, string> = {
  new: 'badge-blue',
  contacted: 'badge-gray',
  qualified: 'badge-orange',
  booked: 'badge-green',
  won: 'badge-green',
  lost: 'badge-red',
}

const SOURCE_LABELS: Record<ContactSource, string> = {
  website_form: 'Website',
  ai_call: 'AI Call',
  sms_reply: 'SMS',
  manual: 'Manual',
  cal_booking: 'Booking',
}

interface ContactsClientProps {
  initialContacts: Contact[]
  tenantId: string
}

export default function ContactsClient({ initialContacts, tenantId }: ContactsClientProps) {
  const [contacts, setContacts] = useState<Contact[]>(initialContacts)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<ContactStatus | 'all'>('all')
  const [showAddModal, setShowAddModal] = useState(false)

  const filtered = useMemo(() => {
    return contacts.filter((c) => {
      const name = `${c.first_name} ${c.last_name ?? ''}`.toLowerCase()
      const matchSearch = !search ||
        name.includes(search.toLowerCase()) ||
        c.phone?.includes(search) ||
        c.email?.toLowerCase().includes(search.toLowerCase())
      const matchStatus = statusFilter === 'all' || c.status === statusFilter
      return matchSearch && matchStatus
    })
  }, [contacts, search, statusFilter])

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-700 text-white">Contacts</h1>
          <p className="text-slate-400 text-sm mt-0.5">{contacts.length} total leads & customers</p>
        </div>
        <button
          id="btn-add-contact"
          onClick={() => setShowAddModal(true)}
          className="btn-primary"
        >
          <Plus size={16} /> Add Contact
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            id="contacts-search"
            type="search"
            placeholder="Search name, phone, email…"
            className="input pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter size={14} className="text-slate-500" />
          {(['all', 'new', 'contacted', 'qualified', 'booked', 'won', 'lost'] as const).map((s) => (
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

      {/* Table */}
      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700/60">
                <th className="text-left px-5 py-3.5 text-xs font-600 uppercase tracking-wider text-slate-500">Name</th>
                <th className="text-left px-5 py-3.5 text-xs font-600 uppercase tracking-wider text-slate-500">Contact</th>
                <th className="text-left px-5 py-3.5 text-xs font-600 uppercase tracking-wider text-slate-500">Source</th>
                <th className="text-left px-5 py-3.5 text-xs font-600 uppercase tracking-wider text-slate-500">Status</th>
                <th className="text-left px-5 py-3.5 text-xs font-600 uppercase tracking-wider text-slate-500">Added</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/30">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center text-slate-500 text-sm">
                    {search ? 'No contacts match your search.' : 'No contacts yet. Add your first lead!'}
                  </td>
                </tr>
              ) : (
                filtered.map((contact) => (
                  <tr key={contact.id} className="table-row-hover">
                    <td className="px-5 py-4">
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
                    <td className="px-5 py-4">
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
                    <td className="px-5 py-4">
                      <span className="badge-gray text-xs">
                        {SOURCE_LABELS[contact.source]}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className={cn('badge text-xs capitalize', STATUS_COLORS[contact.status])}>
                        {contact.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-slate-500 text-xs">
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
          onAdded={(c) => setContacts((prev) => [c, ...prev])}
        />
      )}
    </div>
  )
}
