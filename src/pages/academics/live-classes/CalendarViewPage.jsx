import { CalendarDays } from 'lucide-react'
import { toast } from '@/utils/toast'
import PageBanner from '../../../components/figma/PageBanner'
import LiveClassesPageShell from '../../../components/live-classes/LiveClassesPageShell'
import LiveClassesCalendar from '../../../components/live-classes/LiveClassesCalendar'
import { useLiveClasses } from '../../../contexts/LiveClassesContext'

const BREADCRUMB = [
  { label: 'Academics' },
  { label: 'Live Classes' },
  { label: 'Calendar View' },
]

export default function CalendarViewPage() {
  const { lessons, loading, rescheduleLesson } = useLiveClasses()

  return (
    <LiveClassesPageShell
      breadcrumb={BREADCRUMB}
      banner={
        <PageBanner
          icon={CalendarDays}
          title="Calendar View"
          className="from-[#55ace7] via-[#8b98bb] to-[#b8887a]"
          iconClassName="text-[#246392]"
        />
      }
    >
      {loading ? (
        <div className="animate-pulse rounded-2xl bg-white p-12 shadow">
          <div className="h-64 rounded-xl bg-[#f0ebfa]" />
        </div>
      ) : (
        <LiveClassesCalendar
          lessons={lessons}
          onReschedule={(id, patch) => {
            rescheduleLesson(id, patch)
            toast.success('Session rescheduled')
          }}
        />
      )}
    </LiveClassesPageShell>
  )
}
