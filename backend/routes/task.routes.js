import express from "express";
import Task from "../models/Task.js";
import EventTeam from "../models/EventTeam.js";
import auth from "../middleware/auth.js";

const router = express.Router();

/* ================= CREATE TASK (ADMIN + TEAM MEMBER) ================= */
router.post("/", auth, async (req, res) => {
  try {
    const { title, description, eventId, assignedTo } = req.body;

    // 🔐 Check team
    const team = await EventTeam.findOne({ event: eventId });
    if (!team) {
      return res.status(400).json({ message: "Team not found for event" });
    }

    // 🔐 Check both users are in same team
    if (
      !team.members.includes(req.user.id) ||
      !team.members.includes(assignedTo)
    ) {
      return res
        .status(403)
        .json({ message: "Only team members can assign tasks" });
    }

    const task = await Task.create({
      title,
      description,
      eventId,
      assignedTo,
      assignedBy: req.user.id, // 🔥 IMPORTANT
    });

    res.status(201).json(task);
  } catch (err) {
    console.error("CREATE TASK ERROR:", err);
    res.status(500).json({ message: "Failed to create task" });
  }
});

/* ================= ADMIN: GET ALL TASKS ================= */
router.get("/", auth, async (req, res) => {
  const tasks = await Task.find()
    .populate("eventId", "title")
    .populate("assignedTo", "name")
    .populate("assignedBy", "name");

  res.json(tasks);
});

/* ================= USER: MY TASKS ================= */
router.get("/my", auth, async (req, res) => {
  const tasks = await Task.find({ assignedTo: req.user.id })
    .populate("eventId", "title")
    .populate("assignedBy", "name");

  res.json(tasks);
});

/* ================= UPDATE STATUS ================= */
router.patch("/:id/status", auth, async (req, res) => {
  const task = await Task.findById(req.params.id);

  // 🔒 once completed, cannot go back
  if (task.status === "COMPLETED") {
    return res
      .status(400)
      .json({ message: "Completed task cannot be changed" });
  }

  task.status = "COMPLETED";
  await task.save();

  res.json(task);
});

export default router;
