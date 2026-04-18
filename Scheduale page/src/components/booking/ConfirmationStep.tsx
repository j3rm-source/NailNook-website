'use client'

import { Service, Staff } from '@/lib/types'
import { formatDateLong, formatTime, formatPrice, formatDuration } from '@/lib/utils'
import { Button } from '@/components/ui/Button'

interface ConfirmationStepProps {
  bookingId: string
  service: Service
  staff: Staff | null
  date: string
  time: string
  customerName: string
  onBookAnother: () => void
}

export function ConfirmationStep({
  bookingId,
  service,
  staff,
  date,
  time,
  customerName,
  onBookAnother,
}: ConfirmationStepProps) {
  return (
    <div className="animate-slide-in text-center">
      {/* Success icon */}
      <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
        <svg className="h-10 w-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>

      <h2 className="text-2xl font-bold text-gray-900 mb-2">You're booked!</h2>
      <p className="text-gray-500 mb-8">
        A confirmation SMS has been sent to your phone.
      </p>

      {/* Booking summary card */}
      <div className="rounded-xl border border-gray-100 bg-gray-50 p-5 text-left mb-8 space-y-3">
        <SummaryRow label="Customer" value={customerName} />
        <SummaryRow label="Service" value={service.name} />
        <SummaryRow
          label="Price"
          value={`${formatPrice(service.price)} · ${formatDuration(service.duration_minutes)}`}
        />
        {staff && <SummaryRow label="With" value={staff.name} />}
        <SummaryRow label="Date" value={formatDateLong(date)} />
        <SummaryRow label="Time" value={formatTime(time)} />
        <div className="pt-2 border-t border-gray-200">
          <p className="text-xs text-gray-400">Booking ID: {bookingId.substring(0, 8).toUpperCase()}</p>
        </div>
      </div>

      <Button variant="primary" size="lg" className="w-full" onClick={onBookAnother}>
        Book Another Appointment
      </Button>
    </div>
  )
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-start gap-4">
      <span className="text-sm text-gray-500 shrink-0">{label}</span>
      <span className="text-sm font-medium text-gray-900 text-right">{value}</span>
    </div>
  )
}
