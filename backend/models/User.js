import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: String,
  mobile: { 
    type: String, 
    unique: true, 
    required: true 
  },
  password: String,
  role: { 
    type: String, 
    enum: ["SUPER_ADMIN", "ADMIN", "USER"], 
    default: "USER" 
  },
});

export default mongoose.model("User", userSchema);
