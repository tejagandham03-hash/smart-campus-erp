const mongoose = require('mongoose');
const { PLACEMENT_STATUS } = require('../config/constants');

const placementApplicationSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
    },
    placement: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Placement',
      required: true,
    },
    resume: String,
    status: {
      type: String,
      enum: Object.values(PLACEMENT_STATUS),
      default: PLACEMENT_STATUS.APPLIED,
    },
    appliedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

placementApplicationSchema.index({ student: 1 });
placementApplicationSchema.index({ placement: 1 });
placementApplicationSchema.index({ status: 1 });

module.exports = mongoose.model('PlacementApplication', placementApplicationSchema);
