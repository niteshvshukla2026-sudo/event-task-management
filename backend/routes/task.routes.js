// backend/routes/task.routes.js

import express from "express";
import Task from "../models/Task.js";
import EventTeam from "../models/EventTeam.js";
import auth from "../middleware/auth.js";

const router = express.Router();

/* ================= CREATE TASK (ADMIN + TEAM MEMBER) ================= */
router.post("/", auth, async (req, res) => {
  try {
    const { title, description, eventId, assignedTo } = req.body;

    if (!title || !description || !eventId || !assignedTo) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Team check
    const team = await EventTeam.findOne({ event: eventId });
    if (!team) {
      return res.status(400).json({ message: "Team not found for this event" });
    }

    // Assigned user must be in team
    const isAssigneeInTeam = team.members.some(
      (m) => m.toString() === assignedTo.toString()
    );

    if (!isAssigneeInTeam) {
      return res
        .status(400)
        .json({ message: "Assigned user must be a team member" });
    }

   // 4. Only admin OR team member can assign task
const isAssignerInTeam = team.members.some(
  (m) => m.toString() === req.user.id.toString()
);

if (req.user.role.toLowerCase() !== "admin" && !isAssignerInTeam) {
  return res.status(403).json({
    message: "Only team members can assign tasks",
  });
}


    // Create task
    const task = await Task.create({
      title,
      description,
      eventId,
      assignedTo,
      assignedBy: req.user.id,   // 🔥 correct
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
    const tasks = await Task.find({ assignedTo: req.user })
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
