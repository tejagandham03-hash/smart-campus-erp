const mongoose = require('mongoose');
const { FEE_STATUS } = require('../config/constants');

const feeSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
    },
    academicYear: {
      type: String,
      required: true,
    },
    semester: {
      type: Number,
      required: true,
    },
    feeType: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    dueDate: {
      type: Date,
      required: true,
    },
    paidAmount: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: Object.values(FEE_STATUS),
      default: FEE_STATUS.PENDING,
    },
    paymentDate: Date,
    transactionId: String,
  },
  { timestamps: true }
);

feeSchema.index({ student: 1 });
feeSchema.index({ status: 1 });
feeSchema.index({ dueDate: 1 });

module.exports = mongoose.model('Fee', feeSchema);
