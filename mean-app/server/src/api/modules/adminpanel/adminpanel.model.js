import mongoose from "mongoose";

const AdminLogSchema = new mongoose.Schema({
  action: String,
  target_id: Number,
  timestamp: { type: Date, default: Date.now },
  admin_id: Number,
});

const AdminLog = mongoose.model("AdminLog", AdminLogSchema);

export { AdminLog };
