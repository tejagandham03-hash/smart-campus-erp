const mongoose = require('mongoose');

const examinationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
    },
    semester: {
      type: Number,
      required: true,
    },
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    startTime: {
      type: String,
      required: true,
    },
    endTime: {
      type: String,
      required: true,
    },
    room: String,
    totalMarks: {
      type: Number,
      default: 100,
    },
  },
  { timestamps: true }
);

examinationSchema.index({ course: 1 });
examinationSchema.index({ subject: 1 });
examinationSchema.index({ date: 1 });

module.exports = mongoose.model('Examination', examinationSchema);
