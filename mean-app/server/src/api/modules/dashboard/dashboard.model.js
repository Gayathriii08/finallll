import mongoose from 'mongoose';

const PickupSchema = new mongoose.Schema({
  address: { type: String, required: true },
  city: String,
  pickupDate: { type: Date, required: true },
  time: String,
  status: { type: String, enum: ['Scheduled', 'Completed', 'Cancelled'], default: 'Scheduled' },
  wasteTypes: [{ type: String }],
});

const RecyclingSchema = new mongoose.Schema({
  materialType: { type: String, required: true },
  quantity: { type: Number, required: true },
  co2SavedKg: { type: Number, required: true },
  date: { type: Date, required: true },
});

const VolunteerSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  hours: { type: Number, required: true },
  date: { type: Date, required: true },
});

const Pickup = mongoose.model('Pickup', PickupSchema);
const Recycling = mongoose.model('Recycling', RecyclingSchema);
const Volunteer = mongoose.model('Volunteer', VolunteerSchema);

export { Pickup, Recycling, Volunteer };
