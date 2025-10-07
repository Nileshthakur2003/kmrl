const mongoose = require('mongoose');
const { Schema, models } = mongoose;

/**
 * @typedef {import('../types/BrandingProposal').BrandingProposal} BrandingProposal
 */

// This schema defines the structure for the 'branding_proposals' collection.
// It acts as a staging area for new branding requests before they become active campaigns.

const brandingProposalSchema = new Schema({
  // Mongoose will automatically create an _id of type ObjectId

  companyName: {
    type: String,
    required: true,
    trim: true,
    index: true,
  },

  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected'],
    default: 'Pending',
    required: true,
    index: true,
  },

  proposedRatePerKm: {
    type: Number,
    required: true,
    min: 0,
  },

  trainsetsRequested: {
    type: Number,
    required: true,
    min: 1,
  },

  submittedDate: {
    type: Date,
    default: Date.now,
  },

  contactPerson: {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String },
  },

  notes: {
    type: String,
    trim: true,
  },

}, {
  timestamps: true, // Automatically adds createdAt and updatedAt
});

const BrandingProposal = models.BrandingProposal || mongoose.model('BrandingProposal', brandingProposalSchema);

module.exports = BrandingProposal;
