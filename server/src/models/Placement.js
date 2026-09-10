const mongoose = require('mongoose');

const placementSchema = new mongoose.Schema(
  {
    companyName: {
      type: String,
      required: true,
    },
    jobTitle: {
      type: String,
      required: true,
    },
    description: String,
    location: String,
    salary: {
      type: Number,
    },
    eligibility: String,
    deadline: Date,
    requirements: String,
    status: {
      type: String,
      enum: ['active', 'closed'],
      default: 'active',
    },
  },
  { timestamps: true }
);

placementSchema.index({ status: 1 });
placementSchema.index({ deadline: 1 });

module.exports = mongoose.model('Placement', placementSchema);
