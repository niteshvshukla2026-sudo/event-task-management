// backend/routes/task.routes.js

import express from "express";
import User from "../models/User.js";   // 🔥 ADD TOP PE

import Task from "../models/Task.js";
import EventTeam from "../models/EventTeam.js";
import Notification from "../models/Notification.js";   // 🔔 Notification model
import auth from "../middleware/auth.js";

const router = express.Router();

/* ================= CREATE TASK ================= */
router.post("/", auth, async (req, res) => {
  try {
    // Frontend se status ignore
    delete req.body.status;

    let { title, description, eventId, assignedTo } = req.body;

    // Validation
    if (!title || !description || !eventId || !assignedTo) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // assignedTo object ho to id lo
    if (typeof assignedTo === "object" && assignedTo._id) {
      assignedTo = assignedTo._id;
    }

    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Unauthorized: user missing" });
    }

    // Team check
    const team = await EventTeam.findOne({ event: eventId });
    if (!team) {
      return res.status(400).json({ message: "Team not found for this event" });
    }

    const assignedUserId = String(assignedTo);
    const assignerId = String(req.user.id);

    // Assigned user must be team member
    const isAssigneeInTeam = team.members.some(
      (m) => String(m) === assignedUserId
    );
    if (!isAssigneeInTeam) {
      return res
        .status(400)
        .json({ message: "Assigned user must be a team member" });
    }

    // Assigner must be ADMIN / SUPER_ADMIN or team member
    const isAssignerInTeam = team.members.some(
      (m) => String(m) === assignerId
    );

    const role = (req.user.role || "").toUpperCase();

    if (!["ADMIN", "SUPER_ADMIN"].includes(role) && !isAssignerInTeam) {
      return res.status(403).json({
        message: "Only admin, super admin or team members can assign tasks",
      });
    }

    // Create task
    const task = await Task.create({
      title,
      description,
      eventId,
      assignedTo: assignedUserId,
      assignedBy: assignerId,
      status: "PENDING",
    });

    /* 🔔 NOTIFICATION → Assigned User */
    await Notification.create({
      user: assignedUserId,
      message: `New task assigned: ${title}`,
      type: "TASK_ASSIGNED",
      isRead: false,
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
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const tasks = await Task.find({ assignedTo: req.user.id })
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
    const { status, description } = req.body;

    // Remarks mandatory if completing
    if (status === "COMPLETED" && (!description || description.trim() === "")) {
      return res.status(400).json({
        message: "Remarks are required to complete the task",
      });
    }

    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    task.status = status;

    if (description) {
      task.description = description;
    }

    await task.save();

    // 🔥 Get completed user details
    const completedByUser = await User.findById(req.user.id);

    // 🔔 NOTIFICATION → Task Assigner
    await Notification.create({
      user: task.assignedBy,
      message: `${completedByUser.name} completed the task: ${task.title}`,
      type: "TASK_COMPLETED",
    });

    res.json(task);
  } catch (err) {
    console.error("UPDATE STATUS ERROR:", err);
    res.status(500).json({ message: "Failed to update task status" });
  }
});

export default router;
