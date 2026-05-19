import mongoose from 'mongoose'

const attemptSchema = new mongoose.Schema(
  {
    attemptNo: Number,
    transactionId: String,
    gatewayResponse: String,
    status: String,
    dateTime: Date,
    failureReason: String,
    paymentMode: String,
  },
  { _id: false },
)

const adminLogSchema = new mongoose.Schema(
  {
    adminName: String,
    action: String,
    comment: String,
    timestamp: { type: Date, default: Date.now },
  },
  { _id: false },
)

const timelineEventSchema = new mongoose.Schema(
  {
    event: String,
    timestamp: { type: Date, default: Date.now },
  },
  { _id: false },
)

const paymentSchema = new mongoose.Schema(
  {
    paymentId: { type: String, unique: true, sparse: true, trim: true },
    studentId: { type: String, trim: true },
    studentName: { type: String, trim: true },
    mobile: { type: String, trim: true },
    email: { type: String, trim: true },
    courseId: { type: String, trim: true },
    courseName: { type: String, trim: true },
    courseType: { type: String, trim: true },
    paymentStatus: {
      type: String,
      enum: ['Paid', 'Partial', 'Pending', 'Failed', 'Refunded'],
      default: 'Pending',
    },
    paymentType: { type: String, enum: ['Full', 'EMI', 'Partial'], default: 'Full' },
    paymentMode: { type: String, trim: true, default: '' },
    amountPaid: { type: Number, default: 0 },
    pendingAmount: { type: Number, default: 0 },
    totalFees: { type: Number, default: 0 },
    gst: { type: Number, default: 0 },
    transactionId: { type: String, trim: true, default: '' },
    paymentDate: { type: Date, default: null },
    branch: { type: String, trim: true, default: '' },
    attempts: { type: [attemptSchema], default: [] },
    adminLogs: { type: [adminLogSchema], default: [] },
    timeline: { type: [timelineEventSchema], default: [] },
    receiptNumber: { type: String, default: null },
    /** Offline approval workflow */
    isOfflineRequest: { type: Boolean, default: false },
    offlineStatus: {
      type: String,
      enum: ['Pending', 'Approved', 'Rejected'],
      default: 'Pending',
    },
    paymentProof: { type: String, default: '' },
    requestedDate: { type: Date, default: null },
  },
  { timestamps: true },
)

export default mongoose.model('Payment', paymentSchema)
