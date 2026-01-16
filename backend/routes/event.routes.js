import express from "express";
import Event from "../models/Event.js";
import EventTeam from "../models/EventTeam.js";
import auth from "../middleware/auth.js";

const router = express.Router();

/* CREATE EVENT */
router.post("/", auth, async (req, res) => {
  const event = await Event.create(req.body);
  res.json(event);
});

/* GET EVENTS (Admin / All Events) */
router.get("/", auth, async (req, res) => {
  const events = await Event.find();
  res.json(events);
});

/* GET MY EVENTS (User ke sirf wahi events jisme wo member hai) */
router.get("/my", auth, async (req, res) => {
  try {
    const teams = await EventTeam.find({
      members: req.user.id,
    }).populate("event");

    const events = teams.map((t) => t.event);
    res.json(events);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
