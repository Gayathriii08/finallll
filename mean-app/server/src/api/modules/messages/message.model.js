import mongoose from 'mongoose';


const messageSchema = new mongoose.Schema(
  {
    sender_id: {
      type: String,
      required: true,
      index: true,
    },
    receiver_id: {
      type: String,
      required: true,
      index: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

      // Compound index for fast querying
messageSchema.index({ sender_id: 1, receiver_id: 1, timestamp: -1 });

const Pickup = mongoose.models.Message || mongoose.model("Message", messageSchema);

export default Pickup;