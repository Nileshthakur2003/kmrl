const mongoose = require('mongoose');
const { Schema, models } = mongoose;

/**
 * @typedef {import('../types/Depot').Depot} Depot
 */

// This schema defines the structure for the 'depots' collection.
// Each document represents a physical train depot.

const depotSchema = new Schema({
  // Mongoose will automatically create an _id of type ObjectId

  depotId: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true,
    index: true,
    comment: "A human-readable unique identifier for the depot, e.g., 'MUTTOM-01'."
  },

  name: {
    type: String,
    required: true,
    trim: true,
  },

  location: {
    address: { type: String },
    city: { type: String, required: true },
    // GeoJSON for mapping capabilities
    geo: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        default: [0, 0],
      }
    }
  },

  layout: {
    // Defines the physical capacity of the depot
    stablingLines: {
      type: Number,
      required: true,
      min: 0,
    },
    maintenanceBays: {
      type: Number,
      required: true,
      min: 0,
    },
    washLines: {
      type: Number,
      required: true,
      min: 0,
    }
  },

  // --- References to other collections ---
  
  personnel: [{
    type: Schema.Types.ObjectId,
    ref: 'User',
    comment: "An array of references to users assigned to this depot."
  }],

  assignedFleet: [{
    type: String,
    ref: 'Trainset',
    comment: "An array of Trainset _ids assigned to this depot."
  }]

}, {
  timestamps: true, // Automatically adds createdAt and updatedAt
});

// Create a 2dsphere index on the geo field for geospatial queries
depotSchema.index({ 'location.geo': '2dsphere' });

const Depot = models.Depot || mongoose.model('Depot', depotSchema);

module.exports = Depot;
