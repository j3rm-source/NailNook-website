'use client'

import { useState } from 'react'
import { Service } from '@/lib/types'
import { formatPrice, formatDuration } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import { Input, Textarea } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'

interface ServicesManagerProps {
  services: Service[]
  onRefresh: () => void
}

interface ServiceForm {
  name: string
  price: string
  duration_minutes: string
  description: string
}

const EMPTY_FORM: ServiceForm = { name: '', price: '', duration_minutes: '', description: '' }

export function ServicesManager({ services, onRefresh }: ServicesManagerProps) {
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Service | null>(null)
  const [form, setForm] = useState<ServiceForm>(EMPTY_FORM)
  const [saving, setSaving] = useState(false)

  function openCreate() {
    setEditing(null)
    setForm(EMPTY_FORM)
    setModalOpen(true)
  }

  function openEdit(service: Service) {
    setEditing(service)
    setForm({
      name: service.name,
      price: String(service.price),
      duration_minutes: String(service.duration_minutes),
      description: service.description ?? '',
    })
    setModalOpen(true)
  }

  async function handleSave() {
    setSaving(true)
    try {
      const body = {
        name: form.name,
        price: parseFloat(form.price),
        duration_minutes: parseInt(form.duration_minutes),
        description: form.description || null,
      }

      if (editing) {
        await fetch(`/api/services/${editing.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        })
      } else {
        await fetch('/api/services', {
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
    if (!confirm('Delete this service? It will be hidden from new bookings.')) return
    await fetch(`/api/services/${id}`, { method: 'DELETE' })
    onRefresh()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900">Services</h3>
        <Button variant="primary" size="sm" onClick={openCreate}>
          + Add Service
        </Button>
      </div>

      <div className="rounded-xl border border-gray-100 bg-white overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-left p-3 font-medium text-gray-500">Name</th>
              <th className="text-left p-3 font-medium text-gray-500">Price</th>
              <th className="text-left p-3 font-medium text-gray-500 hidden sm:table-cell">Duration</th>
              <th className="p-3" />
            </tr>
          </thead>
          <tbody>
            {services.map((service) => (
              <tr key={service.id} className="border-b border-gray-50 last:border-0">
                <td className="p-3">
                  <p className="font-medium text-gray-900">{service.name}</p>
                  {service.description && (
                    <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{service.description}</p>
                  )}
                </td>
                <td className="p-3 text-gray-700">{formatPrice(service.price)}</td>
                <td className="p-3 text-gray-700 hidden sm:table-cell">
                  {formatDuration(service.duration_minutes)}
                </td>
                <td className="p-3">
                  <div className="flex items-center gap-2 justify-end">
                    <Button variant="ghost" size="sm" onClick={() => openEdit(service)}>Edit</Button>
                    <Button variant="danger" size="sm" onClick={() => handleDelete(service.id)}>Delete</Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Service' : 'Add Service'}>
        <div className="space-y-4">
          <Input
            label="Service Name"
            placeholder="Haircut"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Price ($)"
              type="number"
              min="0"
              step="0.01"
              placeholder="45.00"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
            />
            <Input
              label="Duration (min)"
              type="number"
              min="15"
              step="15"
              placeholder="45"
              value={form.duration_minutes}
              onChange={(e) => setForm({ ...form, duration_minutes: e.target.value })}
            />
          </div>
          <Textarea
            label="Description (optional)"
            placeholder="Describe the service..."
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={2}
          />
          <div className="flex gap-3 pt-2">
            <Button variant="secondary" className="flex-1" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" className="flex-1" loading={saving} onClick={handleSave}>
              {editing ? 'Save Changes' : 'Add Service'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
