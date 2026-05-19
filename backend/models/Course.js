import mongoose from 'mongoose'

const courseSchema = new mongoose.Schema(
  {
    courseName: {
      type: String,
      required: [true, 'Course name is required'],
      trim: true,
      maxlength: [300, 'Course name cannot exceed 300 characters'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
    },
    center: {
      type: String,
      required: [true, 'Center is required'],
      trim: true,
      default: 'Delhi',
    },
    price: {
      type: String,
      required: [true, 'Price is required'],
      trim: true,
    },
    status: {
      type: String,
      enum: ['Active', 'In Active', 'Draft'],
      default: 'Active',
    },
    /** Full modal form payload for edit prefill */
    formData: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: true },
  },
)

export default mongoose.model('Course', courseSchema)
