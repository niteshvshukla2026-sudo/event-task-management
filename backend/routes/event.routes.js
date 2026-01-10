import express from "express";
import Event from "../models/Event.js";
import auth from "../middleware/auth.js";

const router = express.Router();

/* CREATE EVENT */
router.post("/", auth, async (req, res) => {
  const event = await Event.create(req.body);
  res.json(event);
});

/* GET EVENTS */
router.get("/", auth, async (req, res) => {
  const events = await Event.find();
  res.json(events);
});

export default router;
