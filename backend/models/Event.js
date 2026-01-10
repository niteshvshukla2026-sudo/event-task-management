import mongoose from "mongoose";

const eventSchema = new mongoose.Schema({
  title: String,
  venue: String,
  description: String,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
});

export default mongoose.model("Event", eventSchema);
