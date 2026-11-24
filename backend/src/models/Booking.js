const mongoose = require("mongoose");
const bookingSchema = new mongoose.Schema({
  guestName: { type: String, required: true, trim: true },
  email: { type: String, required: true, lowercase: true, trim: true },
  room: { type: mongoose.Schema.Types.ObjectId, ref: "Room", required: true },
  checkIn: { type: Date, required: true },
  checkOut: { type: Date, required: true },
  guests: { type: Number, default: 1, min: 1 },
  totalAmount: { type: Number, required: true },
  status: { type: String, enum: ["Confirmed", "Checked-in", "Checked-out", "Cancelled"], default: "Confirmed" }
}, { timestamps: true });
module.exports = mongoose.model("Booking", bookingSchema);
