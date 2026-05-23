import { Navigate, Route, Routes } from 'react-router-dom'
import { LiveClassesProvider } from '../contexts/LiveClassesContext'
import ScheduleClassPage from '../pages/academics/live-classes/ScheduleClassPage'
import RecordedClassesPage from '../pages/academics/live-classes/RecordedClassesPage'
import LiveSessionsPage from '../pages/academics/live-classes/LiveSessionsPage'
import CalendarViewPage from '../pages/academics/live-classes/CalendarViewPage'
import LiveClassDetailPage from '../pages/academics/live-classes/LiveClassDetailPage'

export default function LiveClassesLayout() {
  return (
    <LiveClassesProvider>
      <Routes>
        <Route index element={<Navigate to="schedule" replace />} />
        <Route path="schedule" element={<ScheduleClassPage />} />
        <Route path="recordings" element={<RecordedClassesPage />} />
        <Route path="live-sessions" element={<LiveSessionsPage />} />
        <Route path="calendar" element={<CalendarViewPage />} />
        <Route path=":id" element={<LiveClassDetailPage />} />
      </Routes>
    </LiveClassesProvider>
  )
}
