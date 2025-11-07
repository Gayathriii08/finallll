import mongoose from "mongoose";

const opportunitySchema = new mongoose.Schema({
  ngo_id: Number,
  title: { type: String, required: true },
  description: String,
  required_skills: [String],
  duration: String,
  location: String,
  status: { type: String, default: "Open" },
  date: Date,
  imageUrl: String,
  // in opportunity.model.js schema
applicants: [{
  userId: { type: String },
  message: String,
  appliedAt: Date
}]
}, { timestamps: true });


export default mongoose.model("Opportunity", opportunitySchema);
