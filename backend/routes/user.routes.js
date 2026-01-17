import express from "express";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import auth from "../middleware/auth.js";

const router = express.Router();

/* ================= CREATE USER (SUPER ADMIN ONLY) ================= */
router.post("/", auth, async (req, res) => {
  try {
    // 🔥 Sirf SUPER_ADMIN ko user create karne ka right
    if (req.user.role !== "SUPER_ADMIN") {
      return res.status(403).json({
        message: "Only Super Admin can create users",
      });
    }

    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

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
      // Agar role na bheja ho to default USER
      role: role || "USER",
    });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    });
  } catch (err) {
    console.error("CREATE USER ERROR:", err);
    res.status(500).json({ message: "Failed to create user" });
  }
});

/* ================= GET ALL USERS (ADMIN + SUPER_ADMIN) ================= */
router.get("/", auth, async (req, res) => {
  try {
    // ADMIN aur SUPER_ADMIN dono dekh sakte hain
    if (!["ADMIN", "SUPER_ADMIN"].includes(req.user.role)) {
      return res.status(403).json({ message: "Access denied" });
    }

    // Sirf normal USERS list karo (Admin/SuperAdmin nahi)
    const users = await User.find({ role: "USER" }).select("-password");
    res.json(users);
  } catch (err) {
    console.error("GET USERS ERROR:", err);
    res.status(500).json({ message: "Failed to fetch users" });
  }
});

/* ================= GET LOGGED IN USER ================= */
router.get("/me", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json(user);
  } catch (err) {
    console.error("GET ME ERROR:", err);
    res.status(500).json({ message: "Failed to get user" });
  }
});

export default router;
