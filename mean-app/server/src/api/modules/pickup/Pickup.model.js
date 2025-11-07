import mongoose from "mongoose";

const pickupSchema = new mongoose.Schema({
    userId: { type: String }, // User who created the pickup (optional for backward compatibility)
    name: { type: String, required: true },
    address: { type: String, required: true },
    contactNumber: { type: String, required: true },
    pickupDate: { type: Date, required: true },
    items: { type: String, required: true }, // e.g., "Plastic, Metal"
    status: { type: String, default: 'Scheduled' }, // Scheduled / Completed / Cancelled
    assignedVolunteer: { type: String, default: null }, // volunteer user id who accepted the pickup
    completedAt: { type: Date }
}, { timestamps: true });

const Pickup = mongoose.models.Pickup || mongoose.model("Pickup", pickupSchema);

export default Pickup;