const mongoose = require('mongoose');
const { Schema, models } = mongoose;

/**
 * @typedef {import('../types/User').User} User
 */

// This schema defines the structure for the 'users' collection.
// It manages login credentials, roles, and permissions for all depot personnel.

const userSchema = new Schema({
  // Mongoose will automatically create an _id of type ObjectId

  employeeId: {
    type: String,
    required: [true, 'Employee ID is required.'],
    unique: true,
    index: true,
    trim: true,
    comment: "The unique, human-readable identifier for the employee (e.g., 'KMRL-101')."
  },

  name: {
    type: String,
    required: [true, 'User name is required.'],
    trim: true,
  },

  passwordHash: {
    type: String,
    required: [true, 'Password is required.'],
    comment: "The hashed password for the user. NEVER store plain text passwords."
  },

  role: {
    type: String,
    required: true,
    enum: [
      'Depot Manager (Admin)',
      'Operations Supervisor',
      'Maintenance Technician',
      'Commercial Manager',
      'Read-Only Viewer'
    ],
    comment: "The role assigned to the user, which determines their permissions on the dashboard."
  },

  contact: {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      match: [/\S+@\S+\.\S+/, 'is invalid']
    },
    phone: {
      type: String,
      trim: true
    }
  },

  isActive: {
    type: Boolean,
    default: true,
    comment: "A flag to easily disable a user's account without deleting them."
  }
}, {
  timestamps: true // Automatically adds createdAt and updatedAt
});

const User = models.User || mongoose.model('User', userSchema);

module.exports = User;
