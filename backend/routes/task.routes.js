// backend/routes/task.routes.js

import express from "express";
import Task from "../models/Task.js";
import EventTeam from "../models/EventTeam.js";
import auth from "../middleware/auth.js";

const router = express.Router();

/* ================= CREATE TASK (ADMIN + SUPER_ADMIN + TEAM MEMBER) ================= */
router.post("/", auth, async (req, res) => {
  try {
    const { title, description, eventId, assignedTo } = req.body;

    if (!title || !description || !eventId || !assignedTo) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // 1. Find team for this event
    const team = await EventTeam.findOne({ event: eventId });
    if (!team) {
      return res.status(400).json({ message: "Team not found for this event" });
    }

    // 2. Assigned user must be in the team
    const isAssigneeInTeam = team.members.some(
      (m) => m.toString() === assignedTo.toString()
    );

    if (!isAssigneeInTeam) {
      return res
        .status(400)
        .json({ message: "Assigned user must be a team member" });
    }

    // 3. Only ADMIN / SUPER_ADMIN or Team Member can assign task
    const isAssignerInTeam = team.members.some(
      (m) => m.toString() === req.user._id.toString()
    );

    const role = req.user.role.toUpperCase();

    if (!["ADMIN", "SUPER_ADMIN"].includes(role) && !isAssignerInTeam) {
      return res.status(403).json({
        message: "Only admin, super admin or team members can assign tasks",
      });
    }

    // 4. Create Task
    const task = await Task.create({
      title,
      description,
      eventId,
      assignedTo,               // ObjectId of user
      assignedBy: req.user._id, // 🔥 fixed
      status: "PENDING",
    });

    res.status(201).json(task);
  } catch (err) {
    console.error("CREATE TASK ERROR:", err);
    res.status(500).json({ message: "Failed to create task" });
  }
});

/* ================= ADMIN: GET ALL TASKS ================= */
router.get("/", auth, async (req, res) => {
  try {
    const tasks = await Task.find()
      .populate("eventId", "title venue")
      .populate("assignedTo", "name email")
      .populate("assignedBy", "name email")
      .sort({ createdAt: 1 });

    res.json(tasks);
  } catch (err) {
    console.error("GET TASKS ERROR:", err);
    res.status(500).json({ message: "Failed to fetch tasks" });
  }
});

/* ================= USER: MY TASKS ================= */
router.get("/my", auth, async (req, res) => {
  try {
    // 🔥 MAIN FIX: use req.user._id instead of req.user
    const tasks = await Task.find({ assignedTo: req.user._id })
      .populate("eventId", "title venue")
      .populate("assignedBy", "name email")
      .sort({ createdAt: -1 });

    res.json(tasks);
  } catch (err) {
    console.error("GET MY TASKS ERROR:", err);
    res.status(500).json({ message: "Failed to fetch my tasks" });
  }
});

/* ================= UPDATE STATUS ================= */
router.patch("/:id/status", auth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    if (task.status === "COMPLETED") {
      return res
        .status(400)
        .json({ message: "Completed task cannot be changed" });
    }

    task.status = "COMPLETED";
    await task.save();

    res.json(task);
  } catch (err) {
    console.error("UPDATE STATUS ERROR:", err);
    res.status(500).json({ message: "Failed to update task status" });
  }
});

export default router;
