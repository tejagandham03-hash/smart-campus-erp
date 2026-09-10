const mongoose = require('mongoose');

const materialSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: String,
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  subject: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
  semester: { type: Number, required: true, enum: [1, 2, 3, 4, 5, 6] },
  faculty: { type: mongoose.Schema.Types.ObjectId, ref: 'Faculty', required: true },
  fileUrl: { type: String, required: true },
  fileName: { type: String, required: true },
  mimeType: String,
  size: Number,
  fileData: { type: Buffer, select: false },
}, { timestamps: true });

materialSchema.index({ course: 1, subject: 1, semester: 1 });

module.exports = mongoose.model('Material', materialSchema);
