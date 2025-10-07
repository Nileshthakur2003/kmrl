const mongoose = require('mongoose');
const { Schema, models } = mongoose;

/**
 * @typedef {import('../types/Alert').Alert} Alert
 */

// This schema defines the structure for the 'alerts' collection.
// It stores actionable notifications for depot staff regarding critical issues.

const alertSchema = new Schema({
  // Mongoose will automatically create an _id of type ObjectId

  trainsetId: {
    type: String,     // This will be "TS-01", "TS-02", etc.
    ref: 'Trainset',  // Establishes a reference to the Trainset model
    required: [true, 'Trainset ID is required for an alert.'],
    index: true,
  },

  message: {
    type: String,
    required: [true, 'Alert message is required.'],
    trim: true,
  },

  level: {
    type: String,
    required: true,
    enum: ['high', 'medium', 'low'],
    comment: "The severity level of the alert.",
  },

  timestamp: {
    type: Date,
    default: Date.now,
    required: true,
    index: true, // Index for sorting by time
  },

  isAcknowledged: {
    type: Boolean,
    default: false,
    comment: "True if a user has acknowledged or is handling the alert.",
  },

  acknowledgedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User', // Reference to the user who acknowledged the alert
    default: null,
  },

  acknowledgedAt: {
    type: Date,
    default: null,
  }

}, {
  timestamps: true, // Automatically adds createdAt and updatedAt
});

const Alert = models.Alert || mongoose.model('Alert', alertSchema);

module.exports = Alert;
