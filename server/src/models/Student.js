const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    studentId: {
      type: String,
      required: true,
      unique: true,
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      required: true,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
    },
    year: {
      type: Number,
      required: true,
      enum: [1, 2, 3],
    },
    semester: {
      type: Number,
      required: true,
      enum: [1, 2, 3, 4, 5, 6],
    },
    section: {
      type: String,
      required: true,
    },
    assignedFaculty: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Faculty',
    }],
    dateOfBirth: Date,
    address: String,
    guardianName: String,
    guardianPhone: String,
    status: {
      type: String,
      enum: ['active', 'inactive', 'graduated', 'suspended'],
      default: 'active',
    },
  },
  { timestamps: true }
);

studentSchema.index({ studentId: 1 });
studentSchema.index({ userId: 1 });
studentSchema.index({ department: 1 });
studentSchema.index({ course: 1 });
studentSchema.index({ status: 1 });

module.exports = mongoose.model('Student', studentSchema);
