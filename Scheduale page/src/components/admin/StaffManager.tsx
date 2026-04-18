'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Staff } from '@/lib/types'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'

interface StaffManagerProps {
  staff: Staff[]
  onRefresh: () => void
}

interface StaffForm {
  name: string
  pin: string
  phone: string
  color: string
  role: 'staff' | 'admin'
}

const EMPTY_FORM: StaffForm = { name: '', pin: '', phone: '', color: '#4ECDC4', role: 'staff' }
const COLORS = ['#E94560', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8']

export function StaffManager({ staff, onRefresh }: StaffManagerProps) {
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Staff | null>(null)
  const [form, setForm] = useState<StaffForm>(EMPTY_FORM)
  const [saving, setSaving] = useState(false)

  function openCreate() {
    setEditing(null)
    setForm(EMPTY_FORM)
    setModalOpen(true)
  }

  function openEdit(member: Staff) {
    setEditing(member)
    setForm({ name: member.name, pin: '', phone: member.phone ?? '', color: member.color, role: member.role })
    setModalOpen(true)
  }

  async function handleSave() {
    setSaving(true)
    try {
      const body: Record<string, unknown> = {
        name: form.name,
        phone: form.phone || null,
        color: form.color,
        role: form.role,
      }
      if (form.pin) body.pin = form.pin

      if (editing) {
        await fetch(`/api/staff/${editing.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        })
      } else {
        if (!form.pin) return
        body.pin = form.pin
        await fetch('/api/staff', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        })
      }
      setModalOpen(false)
      onRefresh()
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Remove this staff member? All their bookings will remain.')) return
    await fetch(`/api/staff/${id}`, { method: 'DELETE' })
    onRefresh()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900">Staff Members</h3>
        <Button variant="primary" size="sm" onClick={openCreate}>
          + Add Staff
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {staff.map((member) => (
          <div key={member.id} className="rounded-xl border border-gray-100 bg-white p-4 flex items-center gap-3">
            {member.photo_url ? (
              <Image
                src={member.photo_url}
                alt={member.name}
                width={44}
                height={44}
                className="h-11 w-11 rounded-full object-cover"
              />
            ) : (
              <div
                className="flex h-11 w-11 items-center justify-center rounded-full text-white font-bold text-lg shrink-0"
                style={{ backgroundColor: member.color }}
              >
                {member.name.charAt(0)}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900 truncate">{member.name}</p>
              <p className="text-xs text-gray-400 capitalize">{member.role}</p>
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={() => openEdit(member)}>Edit</Button>
              <Button variant="danger" size="sm" onClick={() => handleDelete(member.id)}>Remove</Button>
            </div>
          </div>
        ))}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Staff' : 'Add Staff'}>
        <div className="space-y-4">
          <Input
            label="Full Name"
            placeholder="Jane Smith"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <Input
            label={editing ? 'New PIN (leave blank to keep current)' : 'PIN (4 digits)'}
            type="password"
            maxLength={4}
            placeholder="••••"
            value={form.pin}
            onChange={(e) => setForm({ ...form, pin: e.target.value })}
          />
          <Input
            label="Phone Number (for SMS)"
            type="tel"
            placeholder="+1 555 000 0000"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />

          {/* Color picker */}
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-2">Color</label>
            <div className="flex gap-2 flex-wrap">
              {COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setForm({ ...form, color: c })}
                  className="h-8 w-8 rounded-full border-2 transition-all"
                  style={{
                    backgroundColor: c,
                    borderColor: form.color === c ? '#000' : 'transparent',
                  }}
                />
              ))}
            </div>
          </div>

          {/* Role */}
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-2">Role</label>
            <div className="flex gap-3">
              {(['staff', 'admin'] as const).map((r) => (
                <label key={r} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="role"
                    value={r}
                    checked={form.role === r}
                    onChange={() => setForm({ ...form, role: r })}
                    className="accent-accent"
                  />
                  <span className="text-sm text-gray-700 capitalize">{r}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button variant="secondary" className="flex-1" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" className="flex-1" loading={saving} onClick={handleSave}>
              {editing ? 'Save Changes' : 'Add Staff'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
