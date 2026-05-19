import mongoose from 'mongoose'

const branchGstSchema = new mongoose.Schema(
  {
    branchId: String,
    branchName: String,
    gstEnabled: { type: Boolean, default: true },
    gstNumber: String,
  },
  { _id: false },
)

const gstSettingsSchema = new mongoose.Schema(
  {
    key: { type: String, unique: true, default: 'default' },
    gstPercent: { type: Number, default: 18 },
    invoicePrefix: { type: String, default: 'INV-SRI-' },
    receiptPrefix: { type: String, default: 'RCP-SRI-' },
    taxEnabled: { type: Boolean, default: true },
    branchGst: { type: [branchGstSchema], default: [] },
  },
  { timestamps: true },
)

export default mongoose.model('GstSettings', gstSettingsSchema)
