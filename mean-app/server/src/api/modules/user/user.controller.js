import userService from "./user.service.js";

// ------------------ AUTH ------------------
export const register = async (req, res, next) => {
  try {
    const user = await userService.register(req.body);
    res.status(201).json({ success: true, user });
  } catch (err) {
    next(err);
  }
};

export const login = async (req, res, next) => {
  try {
    const data = await userService.login(req.body);
    res.status(200).json({ success: true, ...data });
  } catch (err) {
    next(err);
  }
};

// ------------------ PROFILE ------------------
export const getProfile = async (req, res, next) => {
  try {
    const user = await userService.getProfile(req.user.id);
    res.status(200).json({ success: true, user });
  } catch (err) {
    next(err);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const user = await userService.updateProfile(req.user.id, req.body);
    res.status(200).json({ success: true, user });
  } catch (err) {
    next(err);
  }
};

export const deleteProfile = async (req, res, next) => {
  try {
    await userService.deleteProfile(req.user.id);
    res.status(200).json({ success: true, message: "Profile deleted successfully" });
  } catch (err) {
    next(err);
  }
};

// ------------------ PROFILE PASSWORD ------------------
export const updatePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: "Both fields required" });
    }

    const user = await userService.updatePassword(req.user.id, currentPassword, newPassword);

    res.status(200).json({ success: true, message: "Password updated successfully" });
  } catch (err) {
    next(err);
  }
};

// ------------------ HEALTH ------------------
export const healthCheck = (req, res) => {
  res.json({ status: "API is working" });
};
