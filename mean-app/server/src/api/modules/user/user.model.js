import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, minlength: 3 },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true, minlength: 6 },

  // ✅ Profile fields
  bio: { type: String, maxlength: 200 },        // short description
  location: { type: String },                   // city/country
  skills: { type: [String], default: [] },      // array of skills
  avatar: { type: String },                     // profile picture URL
  role: { type: String, enum: ["user", "admin","volunteer"], default: "user" } // optional for admin features
}, 
{ timestamps: true });

export default mongoose.model("User", userSchema);