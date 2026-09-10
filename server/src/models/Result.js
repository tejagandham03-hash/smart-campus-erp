const mongoose = require('mongoose');

const resultSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
    },
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
      required: true,
    },
    examination: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Examination',
      required: true,
    },
    marks: {
      type: Number,
      required: true,
      min: 0,
    },
    maxMarks: {
      type: Number,
      default: 100,
    },
    grade: {
      type: String,
    },
    remarks: String,
  },
  { timestamps: true }
);

resultSchema.index({ student: 1 });
resultSchema.index({ subject: 1 });
resultSchema.index({ examination: 1 });

module.exports = mongoose.model('Result', resultSchema);
