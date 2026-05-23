import mongoose from 'mongoose'

const communicationLogSchema = new mongoose.Schema(
  {
    logId: { type: String, unique: true, sparse: true, trim: true },
    recipient: { type: String, trim: true },
    type: { type: String, trim: true },
    channel: { type: String, trim: true },
    status: { type: String, trim: true, default: 'Queued' },
    timestamp: { type: Date, default: Date.now },
    meta: { type: mongoose.Schema.Types.Mixed, default: null },
  },
  { timestamps: true },
)

export default mongoose.model('CommunicationLog', communicationLogSchema)
