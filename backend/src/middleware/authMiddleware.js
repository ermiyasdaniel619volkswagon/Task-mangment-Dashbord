import jwt from "jsonwebtoken";
import User from "../models/User.js";
import TokenBlacklist from "../models/TokenBlacklist.js";

const authenticateRole = (requiredRole) => async (req, res, next) => {
  let token =
    req.cookies?.jwt ||
    (req.headers.authorization?.startsWith("Bearer")
      ? req.headers.authorization.split(" ")[1]
      : null);

  if (!token) {
    return res.status(401).json({ msg: "No token, authorization denied" });
  }

  try {
    const blacklisted = await TokenBlacklist.findOne({ token });
    if (blacklisted) return res.status(401).json({ msg: "Token revoked" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // CRITICAL: DO NOT USE .select("role") — IT REMOVES _id!
    const user = await User.findById(decoded.user.id); // ← FULL USER

    if (!user) return res.status(401).json({ msg: "User not found" });
    if (user.role !== requiredRole) {
      return res
        .status(403)
        .json({ msg: `Access denied. ${requiredRole} only.` });
    }

    req.user = user; // ← NOW HAS _id, email, name, role
    req.token = token;

    next();
  } catch (err) {
    return res.status(401).json({ msg: "Token invalid" });
  }
};

export const authProtect = async (req, res, next) => {
  let token =
    req.cookies?.jwt ||
    (req.headers.authorization?.startsWith("Bearer")
      ? req.headers.authorization.split(" ")[1]
      : null);

  if (!token) return res.status(401).json({ msg: "Not authorized" });

  try {
    const blacklisted = await TokenBlacklist.findOne({ token });
    if (blacklisted) return res.status(401).json({ msg: "Token revoked" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.user.id); // ← FULL USER

    if (!user) return res.status(401).json({ msg: "User not found" });

    req.user = user;
    req.token = token;
    next();
  } catch (err) {
    return res.status(401).json({ msg: "Token invalid" });
  }
};

// Export role middlewares
export const authAdmin = authenticateRole("admin");
export const authNurse = authenticateRole("nurse");
export const authDonor = authenticateRole("donor");
export const authLabTechnician = authenticateRole("lab_technician");
export const authPostCounselor = authenticateRole("post_counselor");
export const authHospitalStaff = authenticateRole("hospital_staff");
