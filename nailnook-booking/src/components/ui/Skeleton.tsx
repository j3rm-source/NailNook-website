import { cn } from '@/lib/utils'

interface SkeletonProps {
  className?: string
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-lg bg-gray-200',
        className
      )}
      aria-hidden="true"
    />
  )
}

export function ServiceCardSkeleton() {
  return (
    <div className="rounded-xl border border-gray-100 bg-white p-5">
      <Skeleton className="h-5 w-2/3 mb-3" />
      <Skeleton className="h-4 w-full mb-2" />
      <Skeleton className="h-4 w-1/2 mb-4" />
      <div className="flex gap-2">
        <Skeleton className="h-6 w-16" />
        <Skeleton className="h-6 w-14" />
      </div>
    </div>
  )
}

export function StaffCardSkeleton() {
  return (
    <div className="rounded-xl border border-gray-100 bg-white p-5 flex items-center gap-4">
      <Skeleton className="h-14 w-14 rounded-full" />
      <div className="flex-1">
        <Skeleton className="h-5 w-32 mb-2" />
        <Skeleton className="h-4 w-20" />
      </div>
    </div>
  )
}

export function TimeSlotSkeleton() {
  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
      {Array.from({ length: 12 }).map((_, i) => (
        <Skeleton key={i} className="h-10" />
      ))}
    </div>
  )
}
