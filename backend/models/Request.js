import mongoose from 'mongoose';

/**
 * Request Schema
 * Represents a skill exchange proposal between two users
 */
const requestSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Request must have a sender'],
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Request must have a receiver'],
    },
    skillOffered: {
      type: String,
      required: [true, 'Please specify the skill offered'],
      trim: true,
    },
    skillRequested: {
      type: String,
      required: [true, 'Please specify the skill requested'],
      trim: true,
    },
    message: {
      type: String,
      default: 'Hi, I would love to exchange skills with you!',
      trim: true,
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected'],
      default: 'pending',
      lowercase: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual aliases so existing queries using sender/recipient continue to work
requestSchema.virtual('sender').get(function () {
  return this.senderId;
});

requestSchema.virtual('recipient').get(function () {
  return this.receiverId;
});

requestSchema.virtual('receiver').get(function () {
  return this.receiverId;
});

const Request = mongoose.model('Request', requestSchema);
export default Request;
