import express from "express";
import EventTeam from "../models/EventTeam.js";
import auth from "../middleware/auth.js";

const router = express.Router();

/* ================= GET ALL TEAMS ================= */
router.get("/", auth, async (req, res) => {
  try {
    const teams = await EventTeam.find()
      .populate("event", "title venue")
      .populate("members", "name email");

    res.json(teams);
  } catch (err) {
    console.error("GET TEAMS ERROR:", err);
    res.status(500).json({ message: "Failed to load teams" });
  }
});

/* ================= CREATE EVENT TEAM ================= */
router.post("/", auth, async (req, res) => {
  try {
    // 🔥 Frontend se { event, members } aa raha hai
    const { event, members } = req.body;

    if (!event || !Array.isArray(members) || members.length === 0) {
      return res.status(400).json({ message: "Event & members required" });
    }

    // 🔒 prevent duplicate team for same event
    const already = await EventTeam.findOne({ event });
    if (already) {
      return res
        .status(400)
        .json({ message: "Team already exists for this event" });
    }

    const team = await EventTeam.create({
      event,       // event id
      members,     // array of user ids
    });

    res.status(201).json(team);
  } catch (err) {
    console.error("CREATE TEAM ERROR:", err);
    res.status(500).json({ message: "Failed to create team" });
  }
});

/* ================= GET MEMBERS OF EVENT TEAM ================= */
router.get("/event/:eventId/members", auth, async (req, res) => {
  try {
    const team = await EventTeam.findOne({
      event: req.params.eventId,
    }).populate("members", "name email");

    if (!team) return res.json([]);

    res.json(team.members);
  } catch (err) {
    console.error("GET TEAM MEMBERS ERROR:", err);
    res.status(500).json({ message: "Failed to load team members" });
  }
});

export default router;
