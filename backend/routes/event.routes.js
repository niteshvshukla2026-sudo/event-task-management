// backend/routes/event.routes.js

import express from "express";
import Event from "../models/Event.js";
import EventTeam from "../models/EventTeam.js";
import Notification from "../models/Notification.js";   // 🔔 ADD
import User from "../models/User.js";                   // 🔔 For admin users
import auth from "../middleware/auth.js";

const router = express.Router();

/* ================= CREATE EVENT ================= */
router.post("/", auth, async (req, res) => {
  try {
    const event = await Event.create(req.body);

    // 🔔 NOTIFICATION → All Admins & Super Admins
    const admins = await User.find({
      role: { $in: ["ADMIN", "SUPER_ADMIN"] },
    });

    for (let admin of admins) {
      await Notification.create({
        user: admin._id,
        message: `New event created: ${event.title}`,
        type: "EVENT_CREATED",
      });
    }

    res.json(event);
  } catch (err) {
    console.error("CREATE EVENT ERROR:", err);
    res.status(500).json({ message: "Failed to create event" });
  }
});

/* ================= GET EVENTS (Admin / All Events) ================= */
router.get("/", auth, async (req, res) => {
  try {
    const events = await Event.find();
    res.json(events);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch events" });
  }
});

/* ================= GET MY EVENTS ================= */
router.get("/my", auth, async (req, res) => {
  try {
    const teams = await EventTeam.find({
      members: req.user.id,
    }).populate("event");

    const events = teams.map((t) => t.event);
    res.json(events);
  } catch (err) {
    console.error("GET MY EVENTS ERROR:", err);
    res.status(500).json({ message: err.message });
  }
});

export default router;
