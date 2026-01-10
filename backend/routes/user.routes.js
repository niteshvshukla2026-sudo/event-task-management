import express from "express";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import auth from "../middleware/auth.js";

const router = express.Router();

/* ================= CREATE USER (ADMIN ONLY) ================= */
router.post("/", auth, async (req, res) => {
  try {
    // Role check
    if (!["ADMIN", "SUPER_ADMIN"].includes(req.user.role)) {
      return res.status(403).json({ message: "Access denied" });
    }

    const { name, email, password, role } = req.body;

    // Check duplicate email
    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const hashed = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashed,
      role: role || "USER",
    });

    res.json(user);
  } catch (err) {
    console.error("Create user error:", err);
    res.status(500).json({ message: "Failed to create user" });
  }
});

/* ================= GET ALL USERS (ADMIN ONLY) ================= */
router.get("/", auth, async (req, res) => {
  try {
    if (!["ADMIN", "SUPER_ADMIN"].includes(req.user.role)) {
      return res.status(403).json({ message: "Access denied" });
    }

    const users = await User.find({ role: "USER" }).select("-password");
    res.json(users);
  } catch (err) {
    console.error("Get users error:", err);
    res.status(500).json({ message: "Failed to fetch users" });
  }
});

/* ================= GET LOGGED IN USER ================= */
router.get("/me", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json(user);
  } catch (err) {
    console.error("Get me error:", err);
    res.status(500).json({ message: "Failed to get user" });
  }
});

export default router;
