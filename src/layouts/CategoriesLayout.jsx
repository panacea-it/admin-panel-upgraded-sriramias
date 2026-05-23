import { Navigate, Route, Routes } from 'react-router-dom'
import CategoryHubShell from '../components/categories/CategoryHubShell'
import ProgramsPage from '../pages/academics/categories/ProgramsPage'
import CategorySectionPage from '../pages/academics/categories/CategorySectionPage'
import CategoryCoursesSection from '../pages/academics/categories/CategoryCoursesSection'
import ClassRoomsPage from '../pages/academics/categories/ClassRoomsPage'

export default function CategoriesLayout() {
  return (
    <CategoryHubShell>
      <Routes>
        <Route index element={<Navigate to="programs" replace />} />
        <Route path="programs" element={<ProgramsPage />} />
        <Route path="programs/:id" element={<ProgramsPage />} />
        <Route path="programs/edit/:id" element={<ProgramsPage />} />
        <Route path="exam-category" element={<CategorySectionPage />} />
        <Route path="exam-sub-category" element={<CategorySectionPage />} />
        <Route path="courses" element={<CategoryCoursesSection />} />
        <Route path="subject" element={<CategorySectionPage />} />
        <Route path="topic" element={<CategorySectionPage />} />
        <Route path="teachers" element={<CategorySectionPage />} />
        <Route path="class-rooms" element={<ClassRoomsPage />} />
        <Route path="*" element={<Navigate to="programs" replace />} />
      </Routes>
    </CategoryHubShell>
  )
}
