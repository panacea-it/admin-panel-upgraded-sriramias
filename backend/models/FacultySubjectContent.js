import mongoose from 'mongoose'

const videoSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    videoUrl: { type: String, default: '' },
    thumbnail: { type: String, default: '' },
    duration: { type: String, default: '' },
    featured: { type: Boolean, default: false },
    orderIndex: { type: Number, default: 0 },
    sourceType: { type: String, enum: ['upload', 'youtube', 'vimeo'], default: 'upload' },
    views: { type: Number, default: 0 },
    watchProgress: { type: Number, default: 0 },
  },
  { timestamps: true },
)

const testSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    testType: {
      type: String,
      enum: ['mcq', 'descriptive', 'assignment'],
      default: 'mcq',
    },
    linkedTestId: { type: String, default: '' },
    instructions: { type: String, default: '' },
    durationMinutes: { type: Number, default: 0 },
    marks: { type: Number, default: 0 },
    difficulty: { type: String, default: 'medium' },
    status: { type: String, enum: ['draft', 'published'], default: 'draft' },
    orderIndex: { type: Number, default: 0 },
  },
  { timestamps: true },
)

const pdfSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    pdfUrl: { type: String, default: '' },
    fileName: { type: String, default: '' },
    fileSize: { type: Number, default: 0 },
    orderIndex: { type: Number, default: 0 },
  },
  { timestamps: true },
)

const noteSchema = new mongoose.Schema(
  {
    title: { type: String, default: 'Untitled Note' },
    content: { type: String, default: '' },
    status: { type: String, enum: ['draft', 'published'], default: 'draft' },
    attachments: { type: [mongoose.Schema.Types.Mixed], default: [] },
    lastAutosave: { type: Date },
  },
  { timestamps: true },
)

const topicSchema = new mongoose.Schema(
  {
    topicName: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    status: { type: String, enum: ['draft', 'published'], default: 'draft' },
    facultyName: { type: String, default: '' },
    orderIndex: { type: Number, default: 0 },
    videos: { type: [videoSchema], default: [] },
    tests: { type: [testSchema], default: [] },
    pdfs: { type: [pdfSchema], default: [] },
    notes: { type: [noteSchema], default: [] },
  },
  { timestamps: true },
)

const folderSchema = new mongoose.Schema(
  {
    parentFolderId: { type: String, default: null },
    folderName: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    orderIndex: { type: Number, default: 0 },
    topics: { type: [topicSchema], default: [] },
  },
  { timestamps: true },
)

const schema = new mongoose.Schema(
  {
    subjectId: { type: String, required: true, unique: true, index: true },
    subjectName: { type: String, default: '' },
    categoryIds: { type: [String], default: [] },
    facultyId: { type: String, default: '' },
    facultyName: { type: String, default: '' },
    folders: { type: [folderSchema], default: [] },
    publishStatus: { type: String, enum: ['draft', 'published'], default: 'draft' },
  },
  { timestamps: true, collection: 'faculty_subject_content' },
)

export default mongoose.models.FacultySubjectContent ||
  mongoose.model('FacultySubjectContent', schema)
