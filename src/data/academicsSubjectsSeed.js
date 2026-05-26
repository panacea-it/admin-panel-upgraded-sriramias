/** Seed data for Academics → Subjects module */
export const ACADEMICS_SUBJECTS_SEED = [
  {
    id: '001',
    subjectName: 'Polity',
    topic: 'Topic 1',
    topics: ['Topic 1', 'Fundamentals'],
    categories: ['Live Class', 'Recorded Class'],
    category: 'Live Class',
    teacher: 'Darshan Kotla',
    batch: 'Batch A',
    status: 'Active',
    createdAt: '2026-01-15T10:00:00.000Z',
    liveClasses: [
      {
        id: '001',
        classTitle: 'Class Title 1',
        center: 'New Delhi',
        classroomId: 'cr-001',
        classroom: 'Class Room 1',
        date: '2026-05-22',
        startTime: '10:00',
        scheduledTime: '10:00',
        durationMinutes: 120,
        duration: '10 AM to 12 AM',
        status: 'Active',
      },
      {
        id: '002',
        classTitle: 'Class Title 2',
        center: 'New Delhi',
        classroomId: 'cr-002',
        classroom: 'Class Room 2',
        date: '2026-05-22',
        startTime: '14:00',
        scheduledTime: '14:00',
        durationMinutes: 120,
        duration: '2 PM to 4 PM',
        status: 'Active',
      },
    ],
    recordings: [
      {
        id: '001',
        lessonName: 'Polity Intro Recording',
        center: 'New Delhi',
        topic: 'Topic 1',
        teacher: 'Darshan Kotla',
        videoFileName: 'polity-intro.mp4',
        status: 'Active',
        visibility: 'Published',
        createdAt: '2026-02-01T08:00:00.000Z',
      },
    ],
  },
  {
    id: '002',
    subjectName: 'History',
    topic: 'Ancient India',
    topics: ['Ancient India'],
    categories: ['Live Class'],
    category: 'Live Class',
    teacher: 'Priya Sharma',
    batch: '',
    status: 'Active',
    createdAt: '2026-02-10T10:00:00.000Z',
    liveClasses: [],
    recordings: [],
  },
  {
    id: '003',
    subjectName: 'Geography',
    topic: 'World Maps',
    topics: ['World Maps'],
    categories: ['Recorded Class'],
    category: 'Recorded Class',
    teacher: 'Rahul Verma',
    batch: 'Batch B',
    status: 'In Active',
    createdAt: '2026-03-01T10:00:00.000Z',
    liveClasses: [],
    recordings: [],
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
