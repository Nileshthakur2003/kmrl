const mongoose = require('mongoose');
const { Schema, models } = mongoose;

/**
 * @typedef {import('../types/Trainset').Trainset} Trainset
 */

// This schema defines the structure for the 'trainsets' collection in MongoDB.
// Mongoose uses this to enforce data types, validation rules (like required fields and enums),
// and to create references to other collections.

const carSchema = new Schema({
  carId: { type: Number, required: true },
  type: { type: String, enum: ['Driving Motor Car', 'Trailer Car'], required: true },
  serialNumber: { type: String, required: true, unique: true },
}, { _id: false });

const trainsetSchema = new Schema({
  _id: { type: String, required: true }, // Using the trainset ID as the primary key
  model: { type: String, default: 'Alstom Metropolis' },
  commissionDate: { type: Date, required: true },
  currentStatus: {
    type: String,
    enum: ['Ready', 'Standby', 'Awaiting Cleaning', 'Under Repair', 'Washing', 'In Service'],
    required: true,
  },
  location: {
    type: { type: String, enum: ['stabling', 'maintenance', 'wash', 'in_service', 'siding'], required: true },
    line: { type: Number, required: true },
    slot: { type: Number, required: true },
    lastMoved: { type: Date, default: Date.now },
  },
  composition: {
    carCount: { type: Number, required: true },
    cars: [carSchema],
  },
  health: {
    componentWear: {
      brakes: { type: Number, default: 0 },
      wheels: { type: Number, default: 0 },
    },
    hvac: {
      averageTemp: { type: Number, default: 24 },
      status: { type: String, enum: ['Nominal', 'Warning', 'Critical'], default: 'Nominal' },
    },
    odometerKm: { type: Number, default: 0 },
    lastIotUpdate: { type: Date },
  },
  maintenance: {
    status: { type: String, enum: ['Nominal', 'Scheduled', 'Fault Reported'], default: 'Nominal' },
    activeJobIds: [{ type: Schema.Types.ObjectId, ref: 'Job' }], // Reference to the 'jobs' collection
  },
  cleaning: {
    status: { type: String, enum: ['Clean', 'Due Daily', 'Due Deep Clean'], default: 'Clean' },
    activeJobId: { type: Schema.Types.ObjectId, ref: 'Job', default: null },
  },
  branding: {
    isBranded: { type: Boolean, default: false },
    campaignId: { type: Schema.Types.ObjectId, ref: 'BrandingCampaign', default: null }, // Reference to the 'branding_campaigns' collection
  },
}, {
  _id: false, // We are using our own _id
  timestamps: true, // Automatically add createdAt and updatedAt fields
});

// This prevents Mongoose from redefining the model on every hot-reload in Next.js development
const Trainset = models.Trainset || mongoose.model('Trainset', trainsetSchema);

module.exports = Trainset;
