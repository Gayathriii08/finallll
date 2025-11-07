import express from "express";
import * as userController from "./user.controller.js"; 
import auth from "../../middleware/auth.js";

const router = express.Router();

// -------- AUTH --------
router.post("/auth/signup", userController.register);
router.post("/auth/login", userController.login);

// -------- PROFILE --------
router.get("/profile", auth, userController.getProfile);
router.put("/profile", auth, userController.updateProfile);
router.delete("/profile", auth, userController.deleteProfile);
// Password update
router.put('/profile/password', auth, userController.updatePassword);
export default router;