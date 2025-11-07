import User from "./user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// ------------------ AUTH ------------------
const register = async ({ name, email, password,role }) => {
  const existing = await User.findOne({ email });
  if (existing) throw new Error("User already exists");

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email, password: hashedPassword, role });
  return user;
};

const login = async ({ email, password }) => {
  const user = await User.findOne({ email });
  if (!user) throw new Error("Invalid credentials");

  const match = await bcrypt.compare(password, user.password);
  if (!match) throw new Error("Invalid credentials");

  const token = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );

  return { token, user };
};

// ------------------ PROFILE ------------------
const getProfile = async (userId) => {
  const user = await User.findById(userId).select('-password');
  if (!user) throw new Error("User not found");
  return user;
};


const updateProfile = async (userId, updates) => {
  try {
    // Only allow specific fields to be updated
    const allowedFields = ['name', 'email', 'password', 'bio', 'location', 'skills', 'avatar'];
    const sanitizedUpdates = {};

    for (const key of allowedFields) {
      if (updates[key] !== undefined) {
        sanitizedUpdates[key] = updates[key];
      }
    }

    // Ensure password is hashed if provided
    if (sanitizedUpdates.password) {
      sanitizedUpdates.password = await bcrypt.hash(sanitizedUpdates.password, 10);
    }

    // Ensure skills is always an array
    if (sanitizedUpdates.skills && !Array.isArray(sanitizedUpdates.skills)) {
      sanitizedUpdates.skills = Array.isArray(sanitizedUpdates.skills)
        ? sanitizedUpdates.skills
        : [sanitizedUpdates.skills];
    }

    const user = await User.findByIdAndUpdate(userId, sanitizedUpdates, {
      new: true,
      runValidators: true,
    }).select("-password");

    if (!user) throw new Error("User not found");
    return user;
  } catch (err) {
    console.error("Error in updateProfile:", err.message);
    throw err;
  }
};


const deleteProfile = async (userId) => {
  const user = await User.findByIdAndDelete(userId);
  if (!user) throw new Error("User not found");
  return user;
};

 const updatePassword = async (userId, currentPassword, newPassword) => {
  const user = await User.findById(userId);
  if (!user) throw new Error("User not found");

  const isMatch = await bcrypt.compare(currentPassword, user.password);
  if (!isMatch) throw new Error("Current password is incorrect");

  const hashed = await bcrypt.hash(newPassword, 10);
  user.password = hashed;
  await user.save();

  return user;
};

// ✅ Export as default object
export default {
  register,
  login,
  getProfile,
  updateProfile,
  deleteProfile,
  updatePassword
};
