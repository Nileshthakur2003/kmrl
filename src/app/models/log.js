const mongoose = require('mongoose');
const { Schema, models } = mongoose;

/**
 * @typedef {import('../types/Log').Log} Log
 */

// This schema defines the structure for the 'logs' collection.
// It acts as a general-purpose audit trail for all significant system events.

const logSchema = new Schema({
  // Mongoose will automatically create an _id of type ObjectId

  timestamp: {
    type: Date,
    default: Date.now,
    index: true,
    comment: "The exact time the event occurred."
  },

  level: {
    type: String,
    enum: ['INFO', 'WARN', 'ERROR', 'FATAL'],
    required: true,
    comment: "The severity level of the log entry."
  },

  eventType: {
    type: String,
    required: true,
    trim: true,
    index: true,
    comment: "A specific code for the type of event, e.g., 'USER_LOGIN', 'TRAINSET_MOVE', 'SCHEDULE_FINALIZE'."
  },

  message: {
    type: String,
    required: true,
    trim: true,
    comment: "A human-readable summary of the event."
  },

  actor: {
    // Who or what initiated the event
    actorId: {
      type: Schema.Types.Mixed, // Can be ObjectId for User or String for system processes
      ref: 'User'
    },
    actorType: {
      type: String, // 'User', 'System', 'API'
      required: true
    }
  },

  target: {
    // The entity that was affected by the event
    targetId: {
        type: Schema.Types.Mixed, // Can be String for Trainset or ObjectId for other models
        required: true
    },
    targetType: {
        type: String, // 'Trainset', 'Job', 'Schedule', 'Depot'
        required: true
    }
  },

  details: {
    type: Schema.Types.Mixed,
    default: {},
    comment: "An open object to store any additional context-specific data, e.g., IP address for logins, or 'from' and 'to' locations for a move."
  }
});

const Log = models.Log || mongoose.model('Log', logSchema);

module.exports = Log;
