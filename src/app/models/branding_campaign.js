const mongoose = require('mongoose');
const { Schema, models } = mongoose;

/**
 * @typedef {import('../types/BrandingCampaign').BrandingCampaign} BrandingCampaign
 */

// This schema defines the structure for the 'branding_campaigns' collection in MongoDB.
// It tracks active advertising contracts, SLAs, and performance.

const brandingCampaignSchema = new Schema({
  // Mongoose will automatically create an _id of type ObjectId

  trainsetId: {
    type: String,     // This will be "TS-01", "TS-02", etc.
    ref: 'Trainset',  // Establishes a reference to the Trainset model
    required: true,
    unique: true,     // A trainset can only have one active campaign at a time
    index: true,
  },

  companyName: {
    type: String,
    required: true,
    trim: true,
  },

  status: {
    type: String,
    enum: ['Active', 'Completed', 'Terminated'],
    default: 'Active',
    required: true,
  },

  contract: {
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    ratePerKm: { type: Number, required: true },
    contractValue: { type: Number }, // Optional total contract value
  },

  sla: {
    // Service Level Agreement details
    requiredVisibility: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
      comment: "The target percentage of operational time the branding must be visible.",
    },
  },

  performance: {
    // Live tracking of performance against the SLA
    currentVisibility: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
      comment: "The actual, live-tracked visibility percentage.",
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
  },

  // Reference to the original proposal for historical tracking
  proposalId: {
    type: Schema.Types.ObjectId,
    ref: 'BrandingProposal',
  }

}, {
  timestamps: true, // Automatically adds createdAt and updatedAt
});

const BrandingCampaign = models.BrandingCampaign || mongoose.model('BrandingCampaign', brandingCampaignSchema);

module.exports = BrandingCampaign;
