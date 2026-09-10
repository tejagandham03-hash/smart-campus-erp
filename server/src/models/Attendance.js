const mongoose = require('mongoose');
const { ATTENDANCE_STATUS } = require('../config/constants');

const attendanceSchema = new mongoose.Schema(
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
    faculty: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Faculty',
    },
    date: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(ATTENDANCE_STATUS),
      required: true,
    },
  },
  { timestamps: true }
);

attendanceSchema.index({ student: 1 });
attendanceSchema.index({ subject: 1 });
attendanceSchema.index({ date: 1 });
attendanceSchema.index({ student: 1, subject: 1 });

module.exports = mongoose.model('Attendance', attendanceSchema);
