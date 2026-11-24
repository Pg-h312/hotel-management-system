const mongoose = require("mongoose");
const roomSchema = new mongoose.Schema({
  roomNumber: { type: String, required: true, unique: true, trim: true },
  type: { type: String, enum: ["Standard", "Deluxe", "Suite", "Family"], required: true },
  pricePerNight: { type: Number, required: true, min: 1 },
  capacity: { type: Number, default: 2, min: 1 },
  status: { type: String, enum: ["Available", "Occupied", "Maintenance"], default: "Available" }
}, { timestamps: true });
module.exports = mongoose.model("Room", roomSchema);
