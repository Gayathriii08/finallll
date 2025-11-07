import express from "express";
import * as adminController from "./adminpanel.controller.js";
import auth from "../../middleware/auth.js";

const router = express.Router();

// All admin routes require authentication
router.use(auth);

// Dashboard statistics
router.get("/stats", adminController.getDashboardStats);

// User management
router.get("/users", adminController.getUsers);
router.get("/users/:id", adminController.getUserById);
router.put("/users/:id", adminController.updateUser);
router.delete("/users/:id", adminController.deleteUser);

// Pickups and Opportunities
router.get("/pickups", adminController.getAllPickups);
router.get("/opportunities", adminController.getAllOpportunities);

// Reports
router.get("/reports/users", adminController.generateUsersReport);
router.get("/reports/pickups", adminController.generatePickupsReport);
router.get("/reports/opportunities", adminController.generateOpportunitiesReport);
router.get("/reports/full-activity", adminController.generateFullActivityReport);

// Admin logs
router.get("/logs", adminController.getAdminLogs);
router.post("/logs", adminController.createAdminLog);

// Sample data creation (for testing)
router.post("/sample-data", adminController.createSampleData);

export default router;
