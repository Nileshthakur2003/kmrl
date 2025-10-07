const mongoose = require('mongoose');
const { Schema, models } = mongoose;

/**
 * @typedef {import('../types/Job').Job} Job
 */

// This schema defines the structure for the 'jobs' collection in MongoDB.
// It is designed to handle both maintenance and cleaning tasks.

const jobSchema = new Schema({
  // Mongoose will automatically create an _id of type ObjectId

  jobType: {
    type: String,
    enum: ['maintenance', 'cleaning'],
    required: true,
    index: true,
  },

  trainsetId: {
    type: String,     // This will be "TS-01", "TS-02", etc.
    ref: 'Trainset',  // Establishes a reference to the Trainset model
    required: true,
    index: true,      // Index for faster lookups by trainset
  },

  description: {
    type: String,
    required: true,
    trim: true,
  },

  status: {
    type: String,
    enum: ['Open', 'In Progress', 'Completed', 'Closed'],
    default: 'Open',
    required: true,
  },

  priority: {
    type: String,
    enum: ['Critical', 'High', 'Medium', 'Low'],
    default: 'Medium',
    // This is more relevant for maintenance jobs, but can be used for prioritizing cleaning
  },

  assignedTo: {
    type: Schema.Types.ObjectId,
    ref: 'User', // Reference to the User model
    default: null,
  },

  // --- Fields specific to job types ---
  details: {
    // For maintenance jobs
    estimatedHours: {
      type: Number
    },
    // For cleaning jobs
    cleaningType: {
      type: String,
      enum: ['Exterior Cleaning', 'Daily Cleaning', 'Deep Cleaning']
    },
    bayId: {
      type: Number
    }
  },

  // --- Optional Notes/Log ---
  notes: [{
    text: String,
    author: { type: Schema.Types.ObjectId, ref: 'User' },
    timestamp: { type: Date, default: Date.now }
  }],

  dateOpened: {
    type: Date,
    default: Date.now,
  },

  dateCompleted: {
    type: Date,
  },

}, {
  timestamps: true, // Automatically adds createdAt and updatedAt
});

const Job = models.Job || mongoose.model('Job', jobSchema);

module.exports = Job;
