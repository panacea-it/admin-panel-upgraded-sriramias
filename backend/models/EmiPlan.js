import mongoose from 'mongoose'

const installmentSchema = new mongoose.Schema(
  {
    emiNo: Number,
    emiDate: String,
    emiAmount: Number,
    status: { type: String, enum: ['Paid', 'Due', 'Overdue'], default: 'Due' },
    dueDate: String,
    paidDate: { type: String, default: '' },
    paymentMode: { type: String, default: '' },
    receipt: { type: String, default: null },
  },
  { _id: false },
)

const emiPlanSchema = new mongoose.Schema(
  {
    planId: { type: String, unique: true, sparse: true, trim: true },
    studentId: { type: String, trim: true },
    studentName: { type: String, trim: true },
    courseId: { type: String, trim: true },
    courseName: { type: String, trim: true },
    totalFees: { type: Number, default: 0 },
    totalPaid: { type: Number, default: 0 },
    pendingAmount: { type: Number, default: 0 },
    completionPercent: { type: Number, default: 0 },
    installments: { type: [installmentSchema], default: [] },
  },
  { timestamps: true },
)

export default mongoose.model('EmiPlan', emiPlanSchema)
