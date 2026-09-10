const mongoose = require('mongoose');

const facultySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    employeeId: {
      type: String,
      required: true,
      unique: true,
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      required: true,
    },
    designation: {
      type: String,
      required: true,
    },
    subjects: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Subject',
      },
    ],
    qualification: String,
    joiningDate: Date,
    status: {
      type: String,
      enum: ['active', 'inactive', 'retired', 'suspended'],
      default: 'active',
    },
  },
  { timestamps: true }
);

facultySchema.index({ employeeId: 1 });
facultySchema.index({ userId: 1 });
facultySchema.index({ department: 1 });
facultySchema.index({ status: 1 });

module.exports = mongoose.model('Faculty', facultySchema);
