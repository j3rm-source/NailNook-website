'use client'

import Image from 'next/image'
import { Staff } from '@/lib/types'
import { cn } from '@/lib/utils'
import { StaffCardSkeleton } from '@/components/ui/Skeleton'

interface StaffStepProps {
  staff: Staff[]
  loading: boolean
  selected: Staff | null
  onSelect: (staff: Staff | null) => void
}

const ANY_STAFF_ID = 'any'

export function StaffStep({ staff, loading, selected, onSelect }: StaffStepProps) {
  const isAnySelected = selected === null

  return (
    <div className="animate-slide-in">
      <h2 className="text-xl font-semibold text-gray-900 mb-1">Choose a Team Member</h2>
      <p className="text-sm text-gray-500 mb-6">Select who you'd like to book with</p>

      {loading ? (
        <div className="grid gap-3">
          {[0, 1, 2].map((i) => <StaffCardSkeleton key={i} />)}
        </div>
      ) : (
        <div className="grid gap-3">
          {/* Any available option */}
          <button
            onClick={() => onSelect(null)}
            className={cn(
              'text-left rounded-xl border-2 bg-white p-4 flex items-center gap-4 transition-all duration-200 hover:border-accent hover:shadow-md',
              isAnySelected ? 'border-accent shadow-md ring-2 ring-accent/10' : 'border-gray-100'
            )}
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-navy to-accent text-white text-lg font-bold">
              ✦
            </div>
            <div className="flex-1">
              <p className="font-semibold text-gray-900">Any Available</p>
              <p className="text-sm text-gray-500">First available team member</p>
            </div>
            {isAnySelected && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-accent text-white">
                <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </span>
            )}
          </button>

          {staff.filter((s) => s.role === 'staff').map((member) => (
            <button
              key={member.id}
              onClick={() => onSelect(member)}
              className={cn(
                'text-left rounded-xl border-2 bg-white p-4 flex items-center gap-4 transition-all duration-200 hover:border-accent hover:shadow-md',
                selected?.id === member.id
                  ? 'border-accent shadow-md ring-2 ring-accent/10'
                  : 'border-gray-100'
              )}
            >
              {member.photo_url ? (
                <Image
                  src={member.photo_url}
                  alt={member.name}
                  width={48}
                  height={48}
                  className="h-12 w-12 rounded-full object-cover"
                />
              ) : (
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-full text-white text-lg font-bold"
                  style={{ backgroundColor: member.color }}
                >
                  {member.name.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="flex-1">
                <p className="font-semibold text-gray-900">{member.name}</p>
                <p className="text-sm text-gray-500">Staff member</p>
              </div>
              {selected?.id === member.id && (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-accent text-white">
                  <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
