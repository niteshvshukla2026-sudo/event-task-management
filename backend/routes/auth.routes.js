import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const router = express.Router();

/* ================= REGISTER ================= */
// (Agar tum SUPER_ADMIN se hi user bana rahe ho, to ye route optional hai)
router.post("/register", async (req, res) => {
  try {
    const { name, mobile, password, role } = req.body;

    if (!mobile || !password) {
      return res.status(400).json({ message: "Mobile and password are required" });
    }

    const exists = await User.findOne({ mobile });
    if (exists) {
      return res.status(400).json({ message: "Mobile number already exists" });
    }

    const hashed = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      mobile,
      password: hashed,
      role: role || "USER",
    });

    res.json(user);
  } catch (err) {
    console.error("REGISTER ERROR:", err);
    res.status(500).json({ message: "Register failed" });
  }
});

/* ================= LOGIN ================= */
router.post("/login", async (req, res) => {
  try {
    const { mobile, password } = req.body;

    if (!mobile || !password) {
      return res
        .status(400)
        .json({ message: "Mobile number and password are required" });
    }

    // 🔴 email → mobile
    const user = await User.findOne({ mobile });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      token,
      role: user.role,
      mobile: user.mobile,
      name: user.name,
    });
  } catch (err) {
    console.error("LOGIN ERROR:", err);
    res.status(500).json({ message: "Login failed" });
  }
});

export default router;
