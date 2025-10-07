const mongoose = require('mongoose');
const { Schema, models } = mongoose;

/**
 * @typedef {import('../types/Message').Message} Message
 */

// This schema defines the structure for a 'related entity' that can be attached to a message.
// It allows a conversation to be linked directly to any other document in the database,
// such as a specific Trainset, Job, or Schedule, providing context.
const relatedEntitySchema = new Schema({
  model: {
    type: String,
    required: true,
    enum: ['Trainset', 'Job', 'Schedule', 'BrandingCampaign', 'AISuggestion'],
    comment: "The name of the Mongoose model this entity refers to."
  },
  refId: {
    type: Schema.Types.Mixed, // Can be ObjectId or String depending on the referenced model
    refPath: 'relatedEntity.model',
    required: true,
    comment: "The ID of the referenced document."
  }
}, { _id: false });


// This schema defines the structure for the 'messages' collection.
// It stores communications between users within the depot command center.
const messageSchema = new Schema({
  // Mongoose will automatically create an _id of type ObjectId

  senderId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
    comment: "The user who sent the message."
  },

  recipientId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
    comment: "The user who is the recipient of the message."
  },

  // A threadId allows grouping messages into a single conversation thread.
  threadId: {
    type: Schema.Types.ObjectId,
    index: true,
    comment: "A shared ID to group messages into a conversation thread."
  },

  content: {
    type: String,
    required: true,
    trim: true,
    comment: "The text content of the message."
  },

  status: {
    type: String,
    required: true,
    enum: ['Sent', 'Delivered', 'Read'],
    default: 'Sent',
  },

  // The contextual reference to another document.
  relatedEntity: {
    type: relatedEntitySchema,
    default: null,
  },

}, {
  timestamps: true // Automatically adds createdAt and updatedAt
});

const Message = models.Message || mongoose.model('Message', messageSchema);

module.exports = Message;
