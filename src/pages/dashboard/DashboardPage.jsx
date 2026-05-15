import DashboardHero from '../../components/dashboard/DashboardHero'
import DashboardStatCard from '../../components/dashboard/DashboardStatCard'
import CenterPerformanceSection from '../../components/dashboard/CenterPerformanceSection'
import PopularCoursesSection from '../../components/dashboard/PopularCoursesSection'
import RevenueTrendsSection from '../../components/dashboard/RevenueTrendsSection'
import RecentActivitiesSection from '../../components/dashboard/RecentActivitiesSection'
import TopFacultySection from '../../components/dashboard/TopFacultySection'
import DemographicsSection from '../../components/dashboard/DemographicsSection'
import ExamSuccessSection from '../../components/dashboard/ExamSuccessSection'
import {
  dashboardStats,
  centerPerformance,
  popularCourses,
  revenueTrends,
  activities,
  topFaculty,
  demographics,
  examSuccess,
} from '../../data/dashboardData'

export default function DashboardPage() {
  return (
    <div className="figma-admin-section min-h-screen bg-[#f7f7f7] px-4 py-5 sm:px-6 lg:px-7">
      <div className="mx-auto max-w-screen-xl space-y-5 sm:space-y-6">
        <DashboardHero />

        <section className="grid grid-cols-1 gap-4 min-[480px]:grid-cols-2 lg:grid-cols-4 lg:gap-4">
          {dashboardStats.map((item) => (
            <DashboardStatCard key={item.title} {...item} />
          ))}
        </section>

        <CenterPerformanceSection centers={centerPerformance} />

        <section className="grid grid-cols-1 gap-5 lg:grid-cols-2 lg:gap-6">
          <PopularCoursesSection courses={popularCourses} />
          <RevenueTrendsSection trends={revenueTrends} />
        </section>

        <RecentActivitiesSection activities={activities} />

        <section className="grid grid-cols-1 gap-5 lg:grid-cols-2 lg:gap-6">
          <TopFacultySection faculty={topFaculty} />
          <div className="space-y-5 sm:space-y-6">
            <DemographicsSection demographics={demographics} />
            <ExamSuccessSection exams={examSuccess} />
          </div>
        </section>
      </div>
    </div>
  )
}
