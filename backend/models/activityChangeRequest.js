const mongoose = require("mongoose");

const activityChangeRequestSchema = new mongoose.Schema({
  activityID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Activity",
    required: true,
  },
  tripID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Trip",
    required: true,
  },
  requestedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  changeType: {
    type: String,
    enum: ["update", "delete", "create"],
    required: true,
  },
  changeDetails: {
    title: String,
    description: String,
    location: String,
    startTime: Date,
    endTime: Date,
    note: String,
    category: String,
  },
  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  respondedAt: Date,
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  rejectReason: String,
});

exports = mongoose.model("ActivityChangeRequest", activityChangeRequestSchema);
