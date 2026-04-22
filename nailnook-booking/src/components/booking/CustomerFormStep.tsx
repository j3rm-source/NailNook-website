'use client'

import { useState } from 'react'
import { CustomerInfo } from '@/lib/types'
import { Input, Textarea } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

interface CustomerFormStepProps {
  initial: CustomerInfo | null
  onSubmit: (info: CustomerInfo) => void
  submitting: boolean
}

export function CustomerFormStep({ initial, onSubmit, submitting }: CustomerFormStepProps) {
  const [form, setForm] = useState<CustomerInfo>(
    initial ?? { name: '', phone: '+1 ', email: '', note: '' }
  )
  const [errors, setErrors] = useState<Partial<CustomerInfo>>({})

  function validate(): boolean {
    const newErrors: Partial<CustomerInfo> = {}
    if (!form.name.trim()) newErrors.name = 'Name is required'
    if (!form.phone.trim()) newErrors.phone = 'Phone number is required'
    else if (!/^\+?[\d\s\-().]{7,15}$/.test(form.phone))
      newErrors.phone = 'Enter a valid phone number'
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      newErrors.email = 'Enter a valid email'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (validate()) onSubmit(form)
  }

  return (
    <div className="animate-slide-in">
      <h2 className="text-xl font-semibold text-gray-900 mb-1">Your Information</h2>
      <p className="text-sm text-gray-500 mb-4">
        We'll send your confirmation via SMS
      </p>
      <div className="flex items-start gap-2 bg-pink-50 border border-pink-200 rounded-xl px-4 py-3 mb-6">
        <span className="text-pink-500 mt-0.5 flex-shrink-0">💅</span>
        <p className="text-sm text-pink-700">
          <span className="font-semibold">New clients:</span> A $20 deposit is required at the time of your appointment to reserve your spot with a specialist.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Full Name"
          placeholder="Jane Smith"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          error={errors.name}
          autoComplete="name"
        />
        <Input
          label="Phone Number"
          type="tel"
          placeholder="+1 (928) 000-0000"
          value={form.phone}
          onChange={(e) => {
            const val = e.target.value
            setForm({ ...form, phone: val.startsWith('+1') ? val : '+1 ' })
          }}
          error={errors.phone}
          autoComplete="off"
        />
        <Input
          label="Email (optional)"
          type="email"
          placeholder="jane@example.com"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          error={errors.email}
          autoComplete="email"
        />
        <Textarea
          label="Note (optional)"
          placeholder="Anything we should know?"
          value={form.note}
          onChange={(e) => setForm({ ...form, note: e.target.value })}
          rows={3}
        />

        <Button
          type="submit"
          variant="primary"
          size="lg"
          loading={submitting}
          className="w-full mt-2"
        >
          Confirm Booking
        </Button>
      </form>
    </div>
  )
}
