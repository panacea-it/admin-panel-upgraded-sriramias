const ts = '2026-05-16T10:30:00'

export const CATEGORIES_HUB_INITIAL = {
  'exam-category': [
    { id: '001', name: 'UPSC', status: 'Active', parentCategory: '', subject: '', createdAt: ts, modifiedAt: ts },
    { id: '002', name: 'MH PSC', status: 'Active', parentCategory: '', subject: '', createdAt: ts, modifiedAt: ts },
    { id: '003', name: 'TNPSC', status: 'In Active', parentCategory: '', subject: '', createdAt: ts, modifiedAt: ts },
  ],
  'exam-sub-category': [
    { id: '001', name: 'Foundation', status: 'Active', parentCategory: 'UPSC', subject: '', createdAt: ts, modifiedAt: ts },
    { id: '002', name: 'Prelims', status: 'Active', parentCategory: 'UPSC', subject: '', createdAt: ts, modifiedAt: ts },
    { id: '003', name: 'Mains', status: 'Active', parentCategory: 'MH PSC', subject: '', createdAt: ts, modifiedAt: ts },
  ],
  subject: [
    { id: '001', name: 'Polity', status: 'Active', parentCategory: '', subject: '', createdAt: ts, modifiedAt: ts },
    { id: '002', name: 'Economy', status: 'Active', parentCategory: '', subject: '', createdAt: ts, modifiedAt: ts },
    { id: '003', name: 'History', status: 'In Active', parentCategory: '', subject: '', createdAt: ts, modifiedAt: ts },
  ],
  topic: [
    { id: '001', name: 'Fundamental Rights', status: 'Active', parentCategory: '', subject: 'Polity', createdAt: ts, modifiedAt: ts },
    { id: '002', name: 'GDP & Growth', status: 'Active', parentCategory: '', subject: 'Economy', createdAt: ts, modifiedAt: ts },
    { id: '003', name: 'Ancient India', status: 'Active', parentCategory: '', subject: 'History', createdAt: ts, modifiedAt: ts },
  ],
  teachers: [
    { id: '001', name: 'Dr. Rajesh Kumar', status: 'Active', parentCategory: '', subject: 'Polity', createdAt: ts, modifiedAt: ts },
    { id: '002', name: 'Prof. Anita Sharma', status: 'Active', parentCategory: '', subject: 'Economy', createdAt: ts, modifiedAt: ts },
    { id: '003', name: 'Mr. Vikram Singh', status: 'In Active', parentCategory: '', subject: 'History', createdAt: ts, modifiedAt: ts },
  ],
}

export const PARENT_CATEGORY_OPTIONS = ['UPSC', 'MH PSC', 'TNPSC']
export const SUBJECT_OPTIONS = ['Polity', 'Economy', 'History']
