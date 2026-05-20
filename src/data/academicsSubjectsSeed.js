/** Seed data for Academics → Subjects module */
export const ACADEMICS_SUBJECTS_SEED = [
  {
    id: '001',
    subjectName: 'Polity',
    topic: 'Topic 1',
    teacher: 'Darshan Kotla',
    status: 'Active',
    liveClasses: [
      {
        id: '001',
        classTitle: 'Class Title 1',
        center: 'New Delhi',
        classroom: 'Class Room 1',
        date: '2026-05-16',
        duration: '10 AM to 12 AM',
        status: 'Active',
      },
      {
        id: '002',
        classTitle: 'Class Title 2',
        center: 'New Delhi',
        classroom: 'Class Room 2',
        date: '2026-05-17',
        duration: '2 PM to 4 PM',
        status: 'Active',
      },
    ],
  },
  {
    id: '002',
    subjectName: 'History',
    topic: 'Ancient India',
    teacher: 'Priya Sharma',
    status: 'Active',
    liveClasses: [],
  },
  {
    id: '003',
    subjectName: 'Geography',
    topic: 'World Maps',
    teacher: 'Rahul Verma',
    status: 'In Active',
    liveClasses: [],
  },
]

export const SUBJECT_DROPDOWN_OPTIONS = [
  'Polity',
  'History',
  'Geography',
  'Economics',
  'Science',
]

export const TOPIC_DROPDOWN_OPTIONS = [
  'Topic 1',
  'Topic 2',
  'Ancient India',
  'World Maps',
  'Fundamentals',
]

export const TEACHER_DROPDOWN_OPTIONS = [
  'Darshan Kotla',
  'Priya Sharma',
  'Rahul Verma',
  'Anita Singh',
]

export const CENTER_DROPDOWN_OPTIONS = [
  'New Delhi',
  'Mumbai',
  'Bangalore',
  'Hyderabad',
]

export const CLASSROOM_DROPDOWN_OPTIONS = [
  'Class Room 1',
  'Class Room 2',
  'Class Room 3',
  'Hall A',
]

export const CATEGORY_OPTIONS = [
  { value: 'Live Class', label: 'Live Class' },
  { value: 'Recorded Class', label: 'Recorded Class' },
  { value: 'Test Series', label: 'Test Series' },
]
