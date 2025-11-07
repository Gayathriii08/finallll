import jwt from "jsonwebtoken";
import User from '../modules/user/user.model.js';
const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) throw new Error('No token provided');

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: decoded.id, role: decoded.role };

    next();
  } catch (err) {
    res.status(401).json({ success: false, message: 'Unauthorized' });
  }
};

export default auth;
