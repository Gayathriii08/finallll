import * as adminService from "./adminpanel.service.js";

async function getUsers(req, res) {
  try {
    const users = await adminService.getAllUsers();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch users" });
  }
}

async function getUserById(req, res) {
  try {
    const user = await adminService.getUserById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch user" });
  }
}

async function updateUser(req, res) {
  try {
    const user = await adminService.updateUser(req.params.id, req.body);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: "Failed to update user" });
  }
}

async function deleteUser(req, res) {
  try {
    const user = await adminService.deleteUser(req.params.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json({ message: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete user" });
  }
}

async function createAdminLog(req, res) {
  try {
    const newLog = await adminService.addAdminLog(req.body);
    res.status(201).json(newLog);
  } catch (err) {
    res.status(500).json({ error: "Failed to log admin action" });
  }
}

async function getAdminLogs(req, res) {
  try {
    const logs = await adminService.getAdminLogs();
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch admin logs" });
  }
}

async function getDashboardStats(req, res) {
  try {
    const stats = await adminService.getDashboardStats();
    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch dashboard statistics" });
  }
}

async function getAllPickups(req, res) {
  try {
    const pickups = await adminService.getAllPickups();
    res.json(pickups);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch pickups" });
  }
}

async function getAllOpportunities(req, res) {
  try {
    const opportunities = await adminService.getAllOpportunities();
    res.json(opportunities);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch opportunities" });
  }
}

async function generateUsersReport(req, res) {
  try {
    const report = await adminService.generateUsersReport();
    res.json(report);
  } catch (err) {
    res.status(500).json({ error: "Failed to generate users report" });
  }
}

async function generatePickupsReport(req, res) {
  try {
    const report = await adminService.generatePickupsReport();
    res.json(report);
  } catch (err) {
    res.status(500).json({ error: "Failed to generate pickups report" });
  }
}

async function generateOpportunitiesReport(req, res) {
  try {
    const report = await adminService.generateOpportunitiesReport();
    res.json(report);
  } catch (err) {
    res.status(500).json({ error: "Failed to generate opportunities report" });
  }
}

async function generateFullActivityReport(req, res) {
  try {
    const report = await adminService.generateFullActivityReport();
    res.json(report);
  } catch (err) {
    res.status(500).json({ error: "Failed to generate full activity report" });
  }
}

async function createSampleData(req, res) {
  try {
    const result = await adminService.createSampleData();
    res.status(201).json(result);
  } catch (err) {
    res.status(500).json({ error: "Failed to create sample data" });
  }
}

export { 
  getUsers, 
  getUserById,
  updateUser,
  deleteUser,
  createAdminLog, 
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
