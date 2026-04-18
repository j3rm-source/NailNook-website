'use client'

import { Service } from '@/lib/types'
import { formatPrice, formatDuration, cn } from '@/lib/utils'
import { ServiceCardSkeleton } from '@/components/ui/Skeleton'

interface ServiceStepProps {
  services: Service[]
  loading: boolean
  selected: Service | null
  onSelect: (service: Service) => void
}

export function ServiceStep({ services, loading, selected, onSelect }: ServiceStepProps) {
  return (
    <div className="animate-slide-in">
      <h2 className="text-xl font-semibold text-gray-900 mb-1">Choose a Service</h2>
      <p className="text-sm text-gray-500 mb-6">Select the service you'd like to book</p>

      {loading ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {[1, 2, 3].map((i) => <ServiceCardSkeleton key={i} />)}
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {services.map((service) => (
            <button
              key={service.id}
              onClick={() => onSelect(service)}
              className={cn(
                'text-left rounded-xl border-2 bg-white p-5 transition-all duration-200 hover:border-accent hover:shadow-md',
                selected?.id === service.id
                  ? 'border-accent shadow-md ring-2 ring-accent/10'
                  : 'border-gray-100'
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-semibold text-gray-900">{service.name}</h3>
                {selected?.id === service.id && (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-accent text-white">
                    <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </span>
                )}
              </div>
              {service.description && (
                <p className="mt-1 text-sm text-gray-500 line-clamp-2">{service.description}</p>
              )}
              <div className="mt-3 flex items-center gap-3">
                <span className="text-lg font-bold text-accent">{formatPrice(service.price)}</span>
                <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                  {formatDuration(service.duration_minutes)}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
