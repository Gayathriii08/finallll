import Pickup from "../pickup/Pickup.model.js";

/* 🧾 CREATE NEW PICKUP (Admin/User schedules pickup + optional volunteer assignment) */
export const createPickup = async (req, res) => {
  try {
    console.log("=== Creating Pickup ===");
    console.log("Request body:", req.body);
    console.log("User:", req.user);

    const {
      name,
      address,
      contactNumber,
      pickupDate,
      items,
      additionalNotes,
      assignedVolunteerId,
      assignedVolunteerName
    } = req.body;

    const userId = req.user?.id;

    if (!name || !address || !contactNumber || !pickupDate || !items) {
      console.log("Validation failed - missing fields");
      return res.status(400).json({ message: "All fields are required" });
    }

    const pickupData = {
      name,
      address,
      contactNumber,
      pickupDate,
      items,
      additionalNotes: additionalNotes || "",
      status: "Scheduled",
    };

    if (userId) pickupData.userId = userId;
    if (assignedVolunteerId) pickupData.assignedVolunteerId = assignedVolunteerId;
    if (assignedVolunteerName) pickupData.assignedVolunteerName = assignedVolunteerName;

    const newPickup = new Pickup(pickupData);
    const savedPickup = await newPickup.save();

    console.log('Saved pickup:', savedPickup);

    res.status(201).json({ message: "Pickup scheduled successfully", pickup: savedPickup });
  } catch (error) {
    console.error('Error creating pickup:', error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
}

// Get pickups for current user
export const getUserPickups = async (req, res) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    console.log('Fetching pickups for user:', userId);

    // Get pickups where userId matches, OR where userId doesn't exist (old records)
    const pickups = await Pickup.find({ 
      $or: [
        { userId: userId },
        { userId: { $exists: false } }
      ]
    }).sort({ pickupDate: -1 });
    
    console.log('Found pickups:', pickups.length);
    console.log('Pickup data:', pickups);
    
    res.json(pickups);
  } catch (error) {
    console.error('Error fetching pickups:', error);
    res.status(500).json({ message: "Server error" });
  }
};

/* 🧹 ADMIN FETCH ALL PICKUPS */
export const getAllPickups = async (req, res) => {
  try {
    const pickups = await Pickup.find().sort({ pickupDate: 1 });
    res.json(pickups);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

/* 🧍 VOLUNTEER FETCH THEIR OWN PICKUPS */
export const getVolunteerPickups = async (req, res) => {
  try {
    const volunteerId = req.user._id; // populated from JWT middleware
    const pickups = await Pickup.find({ assignedVolunteerId: volunteerId })
      .sort({ pickupDate: -1 });
    res.status(200).json(pickups);
  } catch (error) {
    console.error("Error fetching volunteer pickups:", error);
    res.status(500).json({ message: "Failed to fetch volunteer pickups" });
  }
};

/* 🔍 GET PICKUP BY ID */
export const getPickupById = async (req, res) => {
  try {
    const { id } = req.params;
    const pickup = await Pickup.findById(id);

    if (!pickup)
      return res.status(404).json({ message: "Pickup not found" });

    res.json({ success: true, pickup });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
export const cancelPickup = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const pickup = await Pickup.findById(id);
    
    if (!pickup) {
      return res.status(404).json({ message: "Pickup not found" });
    }
    
    if (pickup.userId && pickup.userId !== userId) {
      return res.status(403).json({ message: "You can only cancel your own pickups" });
    }
    
    if (pickup.status === 'Cancelled') {
      return res.status(400).json({ message: "Pickup is already cancelled" });
    }
    
    if (pickup.status === 'Completed') {
      return res.status(400).json({ message: "Cannot cancel completed pickup" });
    }
    
    pickup.status = 'Cancelled';
    await pickup.save();
    
    res.json({ success: true, message: "Pickup cancelled successfully", pickup });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};


export const acceptPickup = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const role = req.user?.role;

    if (!userId) return res.status(401).json({ message: "User not authenticated" });
    if (role !== "volunteer")
      return res.status(403).json({ message: "Only volunteers can accept pickups" });

    const pickup = await Pickup.findById(id);
    if (!pickup)
      return res.status(404).json({ message: "Pickup not found" });

    if (pickup.status === "Cancelled")
      return res.status(400).json({ message: "Cannot accept a cancelled pickup" });

    if (pickup.status === "Completed")
      return res.status(400).json({ message: "Pickup already completed" });

    pickup.status = "Completed";
    pickup.assignedVolunteerId = userId;
    pickup.completedAt = new Date();

    await pickup.save();

    res.json({ success: true, message: "Pickup marked as completed", pickup });
  } catch (error) {
    console.error("Error accepting pickup:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/* 🗑️ DELETE PICKUP (Permanent) */
export const deletePickup = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    const pickup = await Pickup.findById(id);
    if (!pickup) {
      return res.status(404).json({ message: "Pickup not found" });
    }

    // Ensure user owns this pickup if userId is present on the document
    if (pickup.userId && pickup.userId !== userId) {
      return res.status(403).json({ message: "You can only delete your own pickups" });
    }

    if (pickup.status === 'Completed') {
      return res.status(400).json({ message: "Cannot delete completed pickup" });
    }

    await Pickup.findByIdAndDelete(id);

    res.json({ success: true, message: "Pickup deleted successfully" });
  } catch (error) {
    console.error('Error deleting pickup:', error);
    res.status(500).json({ message: "Server error" });
  }
};
