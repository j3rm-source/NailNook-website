'use client'

import { useState, useEffect } from 'react'
import { BookingState, Service, Staff, CustomerInfo } from '@/lib/types'
import { ServiceStep } from './ServiceStep'
import { StaffStep } from './StaffStep'
import { CalendarStep } from './CalendarStep'
import { TimeSlotsStep } from './TimeSlotsStep'
import { CustomerFormStep } from './CustomerFormStep'
import { ConfirmationStep } from './ConfirmationStep'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'

const STEPS = ['Service', 'Staff', 'Date', 'Time', 'Details', 'Confirmed']

const INITIAL_STATE: BookingState = {
  step: 0,
  selectedService: null,
  selectedStaff: null,
  selectedDate: null,
  selectedTime: null,
  customerInfo: null,
  completedBookingId: null,
}

export function BookingFlow() {
  const [state, setState] = useState<BookingState>(INITIAL_STATE)
  const [services, setServices] = useState<Service[]>([])
  const [staffList, setStaffList] = useState<Staff[]>([])
  const [loadingServices, setLoadingServices] = useState(false)
  const [loadingStaff, setLoadingStaff] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  useEffect(() => {
    setLoadingServices(true)
    fetch('/api/services')
      .then((r) => r.json())
      .then(setServices)
      .catch(console.error)
      .finally(() => setLoadingServices(false))

    setLoadingStaff(true)
    fetch('/api/staff')
      .then((r) => r.json())
      .then(setStaffList)
      .catch(console.error)
      .finally(() => setLoadingStaff(false))
  }, [])

  function goTo(step: number) {
    setState((s) => ({ ...s, step }))
  }

  function selectService(service: Service) {
    setState((s) => ({ ...s, selectedService: service, step: 1 }))
  }

  function selectStaff(staff: Staff | null) {
    setState((s) => ({ ...s, selectedStaff: staff, step: 2 }))
  }

  function selectDate(date: string) {
    setState((s) => ({ ...s, selectedDate: date, selectedTime: null, step: 3 }))
  }

  function selectTime(time: string) {
    setState((s) => ({ ...s, selectedTime: time, step: 4 }))
  }

  async function submitBooking(info: CustomerInfo) {
    if (!state.selectedService || !state.selectedDate || !state.selectedTime) return

    setSubmitting(true)
    setSubmitError(null)

    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          staffId: state.selectedStaff?.id ?? 'any',
          serviceId: state.selectedService.id,
          customerName: info.name,
          customerPhone: info.phone,
          customerEmail: info.email || undefined,
          customerNote: info.note || undefined,
          bookingDate: state.selectedDate,
          bookingTime: state.selectedTime,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setSubmitError(data.error ?? 'Something went wrong')
        return
      }

      setState((s) => ({
        ...s,
        customerInfo: info,
        completedBookingId: data.id,
        step: 5,
      }))
    } catch {
      setSubmitError('Network error — please try again')
    } finally {
      setSubmitting(false)
    }
  }

  function reset() {
    setState(INITIAL_STATE)
  }

  const { step } = state
  const showBack = step > 0 && step < 5

  return (
    <div className="w-full max-w-lg mx-auto">
      {/* Progress bar */}
      {step < 5 && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            {STEPS.slice(0, 5).map((label, i) => (
              <button
                key={label}
                onClick={() => i < step && goTo(i)}
                className={cn(
                  'flex flex-col items-center gap-1',
                  i < step ? 'cursor-pointer' : 'cursor-default'
                )}
              >
                <div
                  className={cn(
                    'h-2 w-2 rounded-full transition-all',
                    i === step ? 'bg-accent scale-125' : i < step ? 'bg-green-500' : 'bg-gray-200'
                  )}
                />
                <span
                  className={cn(
                    'text-xs hidden sm:block',
                    i === step ? 'text-accent font-semibold' : i < step ? 'text-green-600' : 'text-gray-400'
                  )}
                >
                  {label}
                </span>
              </button>
            ))}
          </div>
          <div className="h-1 rounded-full bg-gray-100 overflow-hidden">
            <div
              className="h-full bg-accent transition-all duration-500 ease-out"
              style={{ width: `${(step / 4) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Step content */}
      <div className="min-h-[400px]">
        {step === 0 && (
          <ServiceStep
            services={services}
            loading={loadingServices}
            selected={state.selectedService}
            onSelect={selectService}
          />
        )}
        {step === 1 && (
          <StaffStep
            staff={staffList}
            loading={loadingStaff}
            selected={state.selectedStaff}
            onSelect={selectStaff}
          />
        )}
        {step === 2 && (
          <CalendarStep
            staffId={state.selectedStaff?.id ?? null}
            selectedDate={state.selectedDate}
            onSelect={selectDate}
          />
        )}
        {step === 3 && state.selectedDate && state.selectedService && (
          <TimeSlotsStep
            staffId={state.selectedStaff?.id ?? null}
            serviceId={state.selectedService.id}
            selectedDate={state.selectedDate}
            selectedTime={state.selectedTime}
            onSelect={selectTime}
          />
        )}
        {step === 4 && (
          <>
            <CustomerFormStep
              initial={state.customerInfo}
              onSubmit={submitBooking}
              submitting={submitting}
            />
            {submitError && (
              <p className="mt-3 text-sm text-red-500 text-center">{submitError}</p>
            )}
          </>
        )}
        {step === 5 && state.completedBookingId && state.selectedService && state.selectedDate && state.selectedTime && state.customerInfo && (
          <ConfirmationStep
            bookingId={state.completedBookingId}
            service={state.selectedService}
            staff={state.selectedStaff}
            date={state.selectedDate}
            time={state.selectedTime}
            customerName={state.customerInfo.name}
            onBookAnother={reset}
          />
        )}
      </div>

      {/* Back button */}
      {showBack && (
        <div className="mt-6">
          <Button variant="ghost" onClick={() => goTo(step - 1)} className="text-gray-500">
            ← Back
          </Button>
        </div>
      )}
    </div>
  )
}
