import express from "express";
import  Pickup  from "../pickup/Pickup.model.js";


export const createPickup = async (req, res) => {
  try {
    console.log('=== Creating Pickup ===');
    console.log('Request body:', req.body);
    console.log('User:', req.user);
    
    const { name, address, contactNumber, pickupDate, items } = req.body;
    const userId = req.user?.id;

    console.log('Extracted data:', { name, address, contactNumber, pickupDate, items, userId });

    if (!name || !address || !contactNumber || !pickupDate || !items) {
      console.log('Validation failed - missing fields');
      return res.status(400).json({ message: "All fields are required" });
    }

    // userId is optional for backward compatibility with old clients
    const pickupData = { name, address, contactNumber, pickupDate, items };
    if (userId) {
      pickupData.userId = userId;
    }

    console.log('Pickup data to save:', pickupData);

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

// Get all pickups (for admin)
export const getAllPickups =  async (req, res) => {
  try {
    const pickups = await Pickup.find().sort({ pickupDate: 1 });
    res.json(pickups);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get pickup by ID
export const getPickupById = async (req, res) => {
  try {
    const { id } = req.params;
    const pickup = await Pickup.findById(id);
    
    if (!pickup) {
      return res.status(404).json({ message: "Pickup not found" });
    }
    
    res.json({ success: true, pickup });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Cancel pickup
export const cancelPickup = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const pickup = await Pickup.findById(id);
    
    if (!pickup) {
      return res.status(404).json({ message: "Pickup not found" });
    }
    
    // Check if user owns this pickup (only if pickup has userId)
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

// Volunteer accepts (completes) a pickup
export const acceptPickup = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const role = req.user?.role;

    if (!userId) return res.status(401).json({ message: 'User not authenticated' });

    // Only volunteers can accept pickups
    if (role !== 'volunteer') {
      return res.status(403).json({ message: 'Only volunteers can accept pickups' });
    }

    const pickup = await Pickup.findById(id);
    if (!pickup) return res.status(404).json({ message: 'Pickup not found' });

    if (pickup.status === 'Cancelled') {
      return res.status(400).json({ message: 'Cannot accept a cancelled pickup' });
    }

    if (pickup.status === 'Completed') {
      return res.status(400).json({ message: 'Pickup is already completed' });
    }

    // Mark as completed and assign volunteer
    pickup.status = 'Completed';
    pickup.assignedVolunteer = userId;
    pickup.completedAt = new Date();

    await pickup.save();

    res.json({ success: true, message: 'Pickup marked as completed', pickup });
  } catch (error) {
    console.error('Error accepting pickup:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete pickup (permanent removal)
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