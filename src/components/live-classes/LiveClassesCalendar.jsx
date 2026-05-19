import { Fragment, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '../../utils/cn'

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const HOURS = Array.from({ length: 14 }, (_, i) => i + 7)

function parseLessonDate(lesson) {
  if (!lesson.scheduledDate) return null
  const [y, m, d] = lesson.scheduledDate.split('-').map(Number)
  const [hh = 0, mm = 0] = (lesson.scheduledTime || '00:00').split(':').map(Number)
  return new Date(y, m - 1, d, hh, mm)
}

function startOfWeek(date) {
  const d = new Date(date)
  d.setDate(d.getDate() - d.getDay())
  d.setHours(0, 0, 0, 0)
  return d
}

function addDays(date, n) {
  const d = new Date(date)
  d.setDate(d.getDate() + n)
  return d
}

function sameDay(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

function eventColor(lesson) {
  if (lesson.lessonType === 'Recording') return 'bg-[#8b98bb] border-[#246392]'
  if (lesson.status === 'Live') return 'bg-[#55ace7] border-[#246392]'
  return 'bg-[#55ace7] border-[#1a3a5c]'
}

function EventChip({ lesson, onDragStart, compact }) {
  return (
    <motion.div
      layout
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData('lessonId', lesson.id)
        onDragStart?.(lesson)
      }}
      title={`${lesson.lessonName} · ${lesson.teacher} · ${lesson.subjectName}`}
      className={cn(
        'cursor-grab truncate rounded-md border-l-4 px-1.5 py-0.5 text-[10px] font-semibold text-white shadow-sm active:cursor-grabbing sm:text-xs',
        eventColor(lesson),
        compact ? 'mb-0.5' : '',
      )}
      whileHover={{ scale: 1.02 }}
    >
      {lesson.lessonName}
    </motion.div>
  )
}

export default function LiveClassesCalendar({ lessons, onReschedule }) {
  const [view, setView] = useState('month')
  const [cursor, setCursor] = useState(() => new Date())
  const [dragLesson, setDragLesson] = useState(null)

  const liveLessons = useMemo(
    () => lessons.filter((l) => l.lessonType === 'Live' && l.scheduledDate),
    [lessons],
  )

  const monthGrid = useMemo(() => {
    const year = cursor.getFullYear()
    const month = cursor.getMonth()
    const first = new Date(year, month, 1)
    const start = new Date(first)
    start.setDate(start.getDate() - start.getDay())
    const cells = []
    for (let i = 0; i < 42; i++) {
      const day = addDays(start, i)
      const dayLessons = liveLessons.filter((l) => {
        const dt = parseLessonDate(l)
        return dt && sameDay(dt, day)
      })
      cells.push({ date: day, inMonth: day.getMonth() === month, lessons: dayLessons })
    }
    return cells
  }, [cursor, liveLessons])

  const weekDays = useMemo(() => {
    const start = startOfWeek(cursor)
    return Array.from({ length: 7 }, (_, i) => {
      const day = addDays(start, i)
      const dayLessons = liveLessons.filter((l) => {
        const dt = parseLessonDate(l)
        return dt && sameDay(dt, day)
      })
      return { date: day, lessons: dayLessons }
    })
  }, [cursor, liveLessons])

  const dayLessons = useMemo(() => {
    return liveLessons
      .filter((l) => {
        const dt = parseLessonDate(l)
        return dt && sameDay(dt, cursor)
      })
      .sort((a, b) => (a.scheduledTime || '').localeCompare(b.scheduledTime || ''))
  }, [cursor, liveLessons])

  const navLabel = () => {
    if (view === 'month') {
      return cursor.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })
    }
    if (view === 'week') {
      const s = startOfWeek(cursor)
      const e = addDays(s, 6)
      return `${s.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} – ${e.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}`
    }
    return cursor.toLocaleDateString('en-IN', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  }

  const shift = (dir) => {
    const d = new Date(cursor)
    if (view === 'month') d.setMonth(d.getMonth() + dir)
    else if (view === 'week') d.setDate(d.getDate() + dir * 7)
    else d.setDate(d.getDate() + dir)
    setCursor(d)
  }

  const onDropDay = (targetDate, e) => {
    e.preventDefault()
    const id = e.dataTransfer.getData('lessonId') || dragLesson?.id
    if (!id) return
    const y = targetDate.getFullYear()
    const m = String(targetDate.getMonth() + 1).padStart(2, '0')
    const day = String(targetDate.getDate()).padStart(2, '0')
    onReschedule?.(id, {
      scheduledDate: `${y}-${m}-${day}`,
      scheduledTime: dragLesson?.scheduledTime || '10:00',
    })
    setDragLesson(null)
  }

  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-[0_11px_25px_rgba(15,23,42,0.06)] ring-1 ring-[#e8f4fc]">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#f0ebfa] px-4 py-3 sm:px-6">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => shift(-1)}
            className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#eef2fc] text-[#246392] hover:bg-[#e8f4fc]"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => shift(1)}
            className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#eef2fc] text-[#246392] hover:bg-[#e8f4fc]"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
          <h2 className="text-lg font-bold text-[#1a3a5c]">{navLabel()}</h2>
          <button
            type="button"
            onClick={() => setCursor(new Date())}
            className="ml-2 rounded-lg px-3 py-1 text-xs font-semibold text-[#246392] hover:bg-[#eef2fc]"
          >
            Today
          </button>
        </div>
        <div className="flex rounded-lg bg-[#eef2fc] p-1">
          {['month', 'week', 'day'].map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setView(v)}
              className={cn(
                'rounded-md px-3 py-1.5 text-xs font-semibold capitalize transition sm:text-sm',
                view === v
                  ? 'bg-[#55ace7] text-white shadow'
                  : 'text-[#246392] hover:bg-white/60',
              )}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {view === 'month' && (
          <motion.div
            key="month"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="p-4 sm:p-6"
          >
            <div className="mb-2 grid grid-cols-7 gap-1">
              {WEEKDAYS.map((d) => (
                <div key={d} className="py-1 text-center text-xs font-bold text-[#9ca0a8]">
                  {d}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {monthGrid.map(({ date, inMonth, lessons: dayLs }) => (
                <div
                  key={date.toISOString()}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => onDropDay(date, e)}
                  className={cn(
                    'min-h-[88px] rounded-lg border p-1 transition sm:min-h-[100px]',
                    inMonth ? 'border-[#e8f4fc] bg-white' : 'border-transparent bg-[#fafafa] opacity-60',
                    sameDay(date, new Date()) && 'ring-2 ring-[#55ace7]/40',
                  )}
                >
                  <span
                    className={cn(
                      'mb-1 inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold',
                      sameDay(date, new Date()) ? 'bg-[#55ace7] text-white' : 'text-[#686868]',
                    )}
                  >
                    {date.getDate()}
                  </span>
                  <div className="space-y-0.5">
                    {dayLs.slice(0, 3).map((l) => (
                      <EventChip key={l.id} lesson={l} onDragStart={setDragLesson} compact />
                    ))}
                    {dayLs.length > 3 && (
                      <span className="text-[10px] text-[#55ace7]">+{dayLs.length - 3} more</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {view === 'week' && (
          <motion.div
            key="week"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="overflow-x-auto p-4 sm:p-6"
          >
            <div className="grid min-w-[640px] grid-cols-8 gap-1">
              <div />
              {weekDays.map(({ date }) => (
                <div
                  key={date.toISOString()}
                  className={cn(
                    'py-2 text-center text-xs font-bold',
                    sameDay(date, new Date()) ? 'text-[#55ace7]' : 'text-[#686868]',
                  )}
                >
                  {WEEKDAYS[date.getDay()]} {date.getDate()}
                </div>
              ))}
              {HOURS.map((hour) => (
                <Fragment key={hour}>
                  <div className="py-2 pr-2 text-right text-xs text-[#9ca0a8]">
                    {hour}:00
                  </div>
                  {weekDays.map(({ date, lessons: dayLs }) => {
                    const slot = dayLs.filter((l) => {
                      const h = parseInt(l.scheduledTime?.split(':')[0] || '0', 10)
                      return h === hour
                    })
                    return (
                      <div
                        key={`${date}-${hour}`}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => onDropDay(date, e)}
                        className="min-h-[48px] rounded border border-[#f0ebfa] bg-[#fafafa]/50 p-0.5"
                      >
                        {slot.map((l) => (
                          <EventChip key={l.id} lesson={l} onDragStart={setDragLesson} />
                        ))}
                      </div>
                    )
                  })}
                </Fragment>
              ))}
            </div>
          </motion.div>
        )}

        {view === 'day' && (
          <motion.div
            key="day"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-3 p-4 sm:p-6"
          >
            {dayLessons.length === 0 ? (
              <p className="py-12 text-center text-sm text-[#9ca0a8]">No live sessions this day</p>
            ) : (
              dayLessons.map((l) => (
                <div
                  key={l.id}
                  className="flex flex-wrap items-center gap-4 rounded-xl border border-[#e8f4fc] bg-gradient-to-r from-[#f5f0ff] to-white p-4 shadow-sm"
                >
                  <div className="text-sm font-mono font-bold text-[#55ace7]">
                    {l.scheduledTime}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-[#222]">{l.lessonName}</p>
                    <p className="text-xs text-[#686868]">
                      {l.teacher} · {l.subjectName} · {l.duration} min
                    </p>
                  </div>
                  <EventChip lesson={l} onDragStart={setDragLesson} />
                </div>
              ))
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-wrap gap-4 border-t border-[#f0ebfa] px-4 py-3 text-xs text-[#686868] sm:px-6">
        <span className="flex items-center gap-2">
          <span className="h-3 w-3 rounded bg-[#60a5fa]" /> Live scheduled
        </span>
        <span className="flex items-center gap-2">
          <span className="h-3 w-3 rounded bg-[#a78bfa]" /> Recording
        </span>
        <span>Drag events to reschedule</span>
      </div>
    </div>
  )
}
