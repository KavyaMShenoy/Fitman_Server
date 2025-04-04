const mongoose = require("mongoose");

const ReminderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  type: { type: String, enum: ["workout", "meal"], required: true },
  message: { type: String, required: true },
  time: { type: String, required: true },  // HH:MM format
  days: [{ type: String, enum: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"] }],
  snoozeUntil: { type: Date, default: null },
  frequency: { type: Number, default: 1 },
}, { timestamps: true });

module.exports = mongoose.model("Reminder", ReminderSchema);
