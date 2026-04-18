'use client'

import { useState, useEffect, useCallback } from 'react'
import { format, addDays, startOfWeek, addWeeks } from 'date-fns'
import { generateDayTimeLabels, formatTime, cn } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import { WeekNav } from './WeekNav'

interface AvailabilityGridProps {
  staffId: string
}

type SlotKey = string // `${dateStr}-${time}` e.g. "2024-07-15-09:00"

export function AvailabilityGrid({ staffId }: AvailabilityGridProps) {
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date(), { weekStartsOn: 1 }))
  const [slots, setSlots] = useState<Set<SlotKey>>(new Set())
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const timeLabels = generateDayTimeLabels()

  // Build the 7 dates of the current week
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))

  // Load availability for this staff
  useEffect(() => {
    fetch(`/api/availability?staffId=${staffId}`)
      .then((r) => r.json())
      .then((avail: Array<{ specific_date?: string; day_of_week?: number; start_time: string; end_time: string; is_available: boolean }>) => {
        const active = new Set<SlotKey>()
        weekDays.forEach((day) => {
          const dateStr = format(day, 'yyyy-MM-dd')
          const dow = day.getDay()

          // Find applicable rule: specific_date takes priority
          const specific = avail.find((a) => a.specific_date === dateStr)
          const recurring = avail.find((a) => a.day_of_week === dow && !a.specific_date)
          const rule = specific ?? recurring

          if (rule && rule.is_available) {
            // Mark all 30-min slots within the window as available
            timeLabels.forEach((t) => {
              if (t >= rule.start_time.substring(0, 5) && t < rule.end_time.substring(0, 5)) {
                active.add(`${dateStr}-${t}`)
              }
            })
          }
        })
        setSlots(active)
      })
      .catch(console.error)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [staffId, weekStart])

  function toggleSlot(dateStr: string, time: string) {
    const key = `${dateStr}-${time}`
    setSlots((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
    setSaved(false)
  }

  function markDayOff(dateStr: string) {
    setSlots((prev) => {
      const next = new Set(prev)
      timeLabels.forEach((t) => next.delete(`${dateStr}-${t}`))
      return next
    })
    setSaved(false)
  }

  async function save() {
    setSaving(true)
    try {
      // Build availability rows from the current slot grid
      const slotRows: Array<{
        specific_date: string
        start_time: string
        end_time: string
        is_available: boolean
      }> = []

      weekDays.forEach((day) => {
        const dateStr = format(day, 'yyyy-MM-dd')
        const activeForDay = timeLabels.filter((t) => slots.has(`${dateStr}-${t}`))

        if (activeForDay.length === 0) {
          slotRows.push({
            specific_date: dateStr,
            start_time: '00:00',
            end_time: '00:00',
            is_available: false,
          })
        } else {
          // Merge consecutive blocks into ranges
          let start = activeForDay[0]
          let prev = activeForDay[0]
          for (let i = 1; i <= activeForDay.length; i++) {
            const cur = activeForDay[i]
            // Check if consecutive (30-min apart)
            if (cur) {
              const [ph, pm] = prev.split(':').map(Number)
              const [ch, cm] = cur.split(':').map(Number)
              if (ch * 60 + cm - (ph * 60 + pm) === 30) {
                prev = cur
                continue
              }
            }
            // End of a run
            const [eh, em] = prev.split(':').map(Number)
            const endTime = `${String(eh).padStart(2, '0')}:${String(em + 30).padStart(2, '0')}`
            slotRows.push({
              specific_date: dateStr,
              start_time: start,
              end_time: endTime,
              is_available: true,
            })
            if (cur) { start = cur; prev = cur }
          }
        }
      })

      await fetch('/api/availability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ staffId, slots: slotRows }),
      })
      setSaved(true)
    } catch (e) {
      console.error(e)
    } finally {
      setSaving(false)
    }
  }

  function copyToNextWeek() {
    const nextWeekStart = addWeeks(weekStart, 1)
    const nextWeekDays = Array.from({ length: 7 }, (_, i) => addDays(nextWeekStart, i))
    const additions = new Set<SlotKey>()

    weekDays.forEach((day, i) => {
      const srcDate = format(day, 'yyyy-MM-dd')
      const dstDate = format(nextWeekDays[i], 'yyyy-MM-dd')
      timeLabels.forEach((t) => {
        if (slots.has(`${srcDate}-${t}`)) {
          additions.add(`${dstDate}-${t}`)
        }
      })
    })

    setSlots((prev) => new Set([...prev, ...additions]))
    setSaved(false)
  }

  return (
    <div>
      <WeekNav
        weekStart={weekStart}
        onPrev={() => setWeekStart((w) => addDays(w, -7))}
        onNext={() => setWeekStart((w) => addDays(w, 7))}
        onCopyToNextWeek={copyToNextWeek}
      />

      {/* Grid */}
      <div className="overflow-x-auto rounded-xl border border-gray-100 bg-white">
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr>
              <th className="w-16 p-2 text-left text-gray-400 font-normal border-b border-gray-100">Time</th>
              {weekDays.map((day) => {
                const dateStr = format(day, 'yyyy-MM-dd')
                return (
                  <th key={dateStr} className="p-2 border-b border-gray-100 text-center min-w-[48px]">
                    <p className="font-semibold text-gray-700">{format(day, 'EEE')}</p>
                    <p className="text-gray-400">{format(day, 'd')}</p>
                    <button
                      onClick={() => markDayOff(dateStr)}
                      className="text-[10px] text-red-400 hover:text-red-600 mt-0.5"
                    >
                      off
                    </button>
                  </th>
                )
              })}
            </tr>
          </thead>
          <tbody>
            {timeLabels.map((time) => (
              <tr key={time} className="border-b border-gray-50 last:border-0">
                <td className="p-1 pl-2 text-gray-400 whitespace-nowrap">
                  {time.endsWith(':00') ? formatTime(time) : ''}
                </td>
                {weekDays.map((day) => {
                  const dateStr = format(day, 'yyyy-MM-dd')
                  const key = `${dateStr}-${time}`
                  const active = slots.has(key)
                  return (
                    <td key={key} className="p-0.5">
                      <button
                        onClick={() => toggleSlot(dateStr, time)}
                        className={cn(
                          'w-full h-6 rounded transition-colors duration-100',
                          active
                            ? 'bg-green-400 hover:bg-green-500'
                            : 'bg-gray-100 hover:bg-gray-200'
                        )}
                        aria-label={`${active ? 'Remove' : 'Add'} availability ${dateStr} ${time}`}
                      />
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex items-center gap-3">
        <Button variant="primary" onClick={save} loading={saving}>
          Save Availability
        </Button>
        {saved && <span className="text-sm text-green-600 font-medium">✓ Saved</span>}
        <div className="ml-auto flex items-center gap-3 text-xs text-gray-500">
          <span className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded bg-green-400 inline-block" /> Available
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded bg-gray-100 inline-block" /> Unavailable
          </span>
        </div>
      </div>
    </div>
  )
}
