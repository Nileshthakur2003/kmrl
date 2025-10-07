const mongoose = require('mongoose');
const { Schema, models } = mongoose;

/**
 * @typedef {import('../types/Schedule').Schedule} Schedule
 */

// This sub-schema defines the structure for a single manual override event.
// These will be stored as an array within a daily schedule document.
const manualOverrideSchema = new Schema({
  trainsetId: {
    type: String,
    ref: 'Trainset',
    required: true,
    comment: "The trainset that was affected by the override."
  },
  originalAssignment: {
    type: String,
    enum: ['readyForService', 'onStandby', 'heldForMaintenance'],
    required: true,
    comment: "The assignment category the trainset was in before the override."
  },
  newAssignment: {
    type: String,
    enum: ['readyForService', 'onStandby', 'heldForMaintenance', 'removedFromService'],
    required: true,
    comment: "The new assignment category for the trainset."
  },
  reason: {
    type: String,
    required: true,
    trim: true,
    comment: "A mandatory justification for why the override was made."
  },
  overriddenBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    comment: "Reference to the admin/manager who performed the override."
  },
  timestamp: {
    type: Date,
    default: Date.now,
    comment: "The exact time the override occurred."
  }
}, { _id: false }); // Using _id: false as these are embedded sub-documents.

// This schema defines the structure for the 'schedules' collection.
// Each document represents the finalized operational plan for a single day.

const scheduleSchema = new Schema({
  // Mongoose will automatically create an _id of type ObjectId

  date: {
    type: Date,
    required: true,
    index: true,
    comment: "The date for which this schedule is valid. Should be unique per depot."
  },

  depotId: {
    type: String,
    ref: 'Depot', // Reference to the Depot's human-readable ID
    required: true,
  },

  status: {
    type: String,
    enum: ['Draft', 'Finalized', 'Executed'],
    default: 'Draft',
    required: true,
  },

  assignments: {
    readyForService: [{
      type: String,
      ref: 'Trainset',
      comment: "Array of Trainset IDs scheduled for revenue service."
    }],
    onStandby: [{
      type: String,
      ref: 'Trainset',
      comment: "Array of Trainset IDs held in reserve."
    }],
    heldForMaintenance: [{
      type: String,
      ref: 'Trainset',
      comment: "Array of Trainset IDs held in the IBL for maintenance."
    }],
  },

  // --- NEWLY ADDED SCHEMA FOR MANUAL OVERRIDES ---
  manualOverrides: {
    type: [manualOverrideSchema],
    default: [],
    comment: "An audit log of any manual changes made after the schedule was finalized."
  },

  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    comment: "Reference to the User (Depot Manager/Supervisor) who created/finalized the schedule."
  },

  finalizedAt: {
    type: Date,
    comment: "Timestamp for when the schedule was confirmed."
  },

  notes: {
    type: String,
    trim: true,
    comment: "Operational notes or comments for the day's schedule."
  }
}, {
  timestamps: true, // Automatically adds createdAt and updatedAt
});

// Create a compound unique index to ensure only one schedule exists per depot per day.
scheduleSchema.index({ date: 1, depotId: 1 }, { unique: true });

const Schedule = models.Schedule || mongoose.model('Schedule', scheduleSchema);

module.exports = Schedule;

