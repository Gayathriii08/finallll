import { AdminLog } from "./adminpanel.model.js";
import User from "../user/user.model.js";
import Opportunity from "../opportunity/opportunity.model.js";
import Pickup from "../pickup/Pickup.model.js";

async function getAllUsers() {
  return User.find({}).select('-password');
}

async function getUserById(id) {
  return User.findById(id).select('-password');
}

async function updateUser(id, updateData) {
  return User.findByIdAndUpdate(id, updateData, { new: true }).select('-password');
}

async function deleteUser(id) {
  return User.findByIdAndDelete(id);
}

async function addAdminLog(log) {
  const adminLog = new AdminLog(log);
  return adminLog.save();
}

async function getAdminLogs() {
  return AdminLog.find({}).sort({ timestamp: -1 });
}

async function getDashboardStats() {
  const totalUsers = await User.countDocuments();
  const completedPickups = await Pickup.countDocuments({ status: 'Completed' });
  const pendingPickups = await Pickup.countDocuments({ status: 'Scheduled' });
  const activeOpportunities = await Opportunity.countDocuments({ status: 'Open' });
  
  return {
    totalUsers,
    completedPickups,
    pendingPickups,
    activeOpportunities
  };
}

async function getAllPickups() {
  return Pickup.find({}).sort({ createdAt: -1 });
}

async function getAllOpportunities() {
  return Opportunity.find({}).sort({ createdAt: -1 });
}

async function generateUsersReport() {
  const users = await User.find({}).select('-password');
  return {
    reportType: 'users',
    generatedAt: new Date(),
    data: users,
    summary: {
      totalUsers: users.length,
      admins: users.filter(u => u.role === 'admin').length,
      regularUsers: users.filter(u => u.role === 'user').length
    }
  };
}

async function generatePickupsReport() {
  const pickups = await Pickup.find({});
  return {
    reportType: 'pickups',
    generatedAt: new Date(),
    data: pickups,
    summary: {
      totalPickups: pickups.length,
      completed: pickups.filter(p => p.status === 'Completed').length,
      pending: pickups.filter(p => p.status === 'Scheduled').length,
      cancelled: pickups.filter(p => p.status === 'Cancelled').length
    }
  };
}

async function generateOpportunitiesReport() {
  const opportunities = await Opportunity.find({});
  return {
    reportType: 'opportunities',
    generatedAt: new Date(),
    data: opportunities,
    summary: {
      totalOpportunities: opportunities.length,
      open: opportunities.filter(o => o.status === 'Open').length,
      closed: opportunities.filter(o => o.status === 'Closed').length
    }
  };
}

async function generateFullActivityReport() {
  const [users, pickups, opportunities, logs] = await Promise.all([
    User.find({}).select('-password'),
    Pickup.find({}),
    Opportunity.find({}),
    AdminLog.find({}).sort({ timestamp: -1 }).limit(100)
  ]);

  return {
    reportType: 'full_activity',
    generatedAt: new Date(),
    data: {
      users,
      pickups,
      opportunities,
      recentLogs: logs
    },
    summary: {
      totalUsers: users.length,
      totalPickups: pickups.length,
      totalOpportunities: opportunities.length,
      recentAdminActions: logs.length
    }
  };
}

async function createSampleData() {
  try {
    // Create sample users
    const sampleUsers = [
      {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
        role: 'user',
        location: 'New York',
        bio: 'Environmental enthusiast',
        skills: ['Recycling', 'Composting']
      },
      {
        name: 'Jane Smith',
        email: 'jane@example.com',
        password: 'password123',
        role: 'admin',
        location: 'California',
        bio: 'Admin user',
        skills: ['Management', 'Leadership']
      },
      {
        name: 'Bob Wilson',
        email: 'bob@example.com',
        password: 'password123',
        role: 'user',
        location: 'Texas',
        bio: 'Waste management expert',
        skills: ['Waste Reduction', 'Sustainability']
      }
    ];

    // Create sample pickups
    const samplePickups = [
      {
        name: 'Alice Johnson',
        address: '123 Main St, New York',
        contactNumber: '555-0123',
        pickupDate: new Date(Date.now() + 86400000), // Tomorrow
        items: 'Plastic bottles, Cardboard boxes',
        status: 'Scheduled'
      },
      {
        name: 'Charlie Brown',
        address: '456 Oak Ave, California',
        contactNumber: '555-0456',
        pickupDate: new Date(Date.now() - 86400000), // Yesterday
        items: 'Metal cans, Glass bottles',
        status: 'Completed'
      }
    ];

    // Create sample opportunities
    const sampleOpportunities = [
      {
        ngo_id: 1,
        title: 'Community Cleanup Drive',
        description: 'Join us for a community cleanup event',
        required_skills: ['Teamwork', 'Physical fitness'],
        duration: '4 hours',
        location: 'Central Park',
        status: 'Open',
        date: new Date(Date.now() + 7 * 86400000) // Next week
      },
      {
        ngo_id: 2,
        title: 'Recycling Education Program',
        description: 'Help educate children about recycling',
        required_skills: ['Teaching', 'Communication'],
        duration: '2 hours',
        location: 'Local School',
        status: 'Open',
        date: new Date(Date.now() + 14 * 86400000) // Two weeks
      }
    ];

    // Create sample admin logs
    const sampleLogs = [
      {
        action: 'User created',
        target_id: 1,
        admin_id: 2,
        timestamp: new Date()
      },
      {
        action: 'User updated',
        target_id: 1,
        admin_id: 2,
        timestamp: new Date(Date.now() - 3600000) // 1 hour ago
      }
    ];

    // Insert sample data
    const createdUsers = await User.insertMany(sampleUsers);
    const createdPickups = await Pickup.insertMany(samplePickups);
    const createdOpportunities = await Opportunity.insertMany(sampleOpportunities);
    const createdLogs = await AdminLog.insertMany(sampleLogs);

    return {
      message: 'Sample data created successfully',
      counts: {
        users: createdUsers.length,
        pickups: createdPickups.length,
        opportunities: createdOpportunities.length,
        logs: createdLogs.length
      }
    };
  } catch (error) {
    throw new Error('Failed to create sample data: ' + error.message);
  }
}

export { 
  getAllUsers, 
  getUserById,
  updateUser,
  deleteUser,
  addAdminLog, 
  getAdminLogs,
  getDashboardStats,
  getAllPickups,
  getAllOpportunities,
  generateUsersReport,
  generatePickupsReport,
  generateOpportunitiesReport,
  generateFullActivityReport,
  createSampleData
};
