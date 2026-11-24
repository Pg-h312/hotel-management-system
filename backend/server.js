require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const Room = require("./src/models/Room");
const Booking = require("./src/models/Booking");

const app = express();

// Middleware
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173"
  })
);

app.use(express.json());

// =====================================
// 1. HEALTH CHECK API
// =====================================

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Hotel Management API is running",
    database:
      mongoose.connection.readyState === 1
        ? "connected"
        : "disconnected"
  });
});

// =====================================
// 2. DASHBOARD API
// =====================================

app.get("/api/dashboard", async (req, res, next) => {
  try {
    const [
      totalRooms,
      availableRooms,
      occupiedRooms,
      totalBookings,
      activeBookings,
      cancelledBookings,
      checkedOutBookings,
      revenueData
    ] = await Promise.all([

      Room.countDocuments(),

      Room.countDocuments({
        status: "Available"
      }),

      Room.countDocuments({
        status: "Occupied"
      }),

      Booking.countDocuments(),

      Booking.countDocuments({
        status: {
          $nin: ["Cancelled", "Checked-out"]
        }
      }),

      Booking.countDocuments({
        status: "Cancelled"
      }),

      Booking.countDocuments({
        status: "Checked-out"
      }),

      Booking.aggregate([
        {
          $match: {
            status: { $ne: "Cancelled" }
          }
        },
        {
          $group: {
            _id: null,
            totalRevenue: {
              $sum: "$totalAmount"
            }
          }
        }
      ])

    ]);

    const revenue =
      revenueData.length > 0
        ? revenueData[0].totalRevenue
        : 0;

    res.status(200).json({
      success: true,
      message: "Dashboard data fetched successfully",

      stats: {
        totalRooms,
        availableRooms,
        occupiedRooms,
        totalBookings,
        activeBookings,
        cancelledBookings,
        checkedOutBookings,
        revenue
      }
    });

  } catch (error) {
    next(error);
  }
});

// =====================================
// 3. GET ALL ROOMS
// =====================================

app.get("/api/rooms", async (req, res, next) => {
  try {
    const filter = {};

    if (req.query.status && req.query.status !== "All") {
      filter.status = req.query.status;
    }

    if (req.query.type && req.query.type !== "All") {
      filter.type = req.query.type;
    }

    if (req.query.search) {
      filter.roomNumber = {
        $regex: req.query.search,
        $options: "i"
      };
    }

    const rooms = await Room.find(filter)
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: rooms.length,
      rooms
    });

  } catch (error) {
    next(error);
  }
});

// =====================================
// 4. CREATE NEW ROOM
// =====================================

app.post("/api/rooms", async (req, res, next) => {
  try {
    const {
      roomNumber,
      type,
      pricePerNight,
      capacity
    } = req.body;

    if (!roomNumber || !type || !pricePerNight) {
      return res.status(400).json({
        success: false,
        message: "Room number, type and price are required."
      });
    }

    const room = await Room.create({
      roomNumber,
      type,
      pricePerNight,
      capacity: capacity || 2
    });

    res.status(201).json({
      success: true,
      message: "Room created successfully",
      room
    });

  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Room number already exists."
      });
    }

    next(error);
  }
});

// =====================================
// 5. DELETE ROOM
// =====================================

app.delete("/api/rooms/:id", async (req, res, next) => {
  try {
    const room = await Room.findById(req.params.id);

    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Room not found."
      });
    }

    const linked = await Booking.exists({
      room: req.params.id,
      status: {
        $nin: ["Cancelled", "Checked-out"]
      }
    });

    if (linked) {
      return res.status(400).json({
        success: false,
        message: "Cancel or check out the active booking before deleting this room."
      });
    }

    await Room.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: "Room deleted successfully."
    });

  } catch (error) {
    next(error);
  }
});

// =====================================
// 6. GET ALL BOOKINGS
// =====================================

app.get("/api/bookings", async (req, res, next) => {
  try {
    const filter = {};

    if (req.query.status && req.query.status !== "All") {
      filter.status = req.query.status;
    }

    if (req.query.search) {
      filter.$or = [
        {
          guestName: {
            $regex: req.query.search,
            $options: "i"
          }
        },
        {
          email: {
            $regex: req.query.search,
            $options: "i"
          }
        }
      ];
    }

    const bookings = await Booking.find(filter)
      .populate("room")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: bookings.length,
      bookings
    });

  } catch (error) {
    next(error);
  }
});

// =====================================
// 7. CREATE NEW BOOKING
// =====================================

app.post("/api/bookings", async (req, res, next) => {
  try {
    const {
      guestName,
      email,
      roomId,
      checkIn,
      checkOut,
      guests
    } = req.body;

    if (
      !guestName ||
      !email ||
      !roomId ||
      !checkIn ||
      !checkOut
    ) {
      return res.status(400).json({
        success: false,
        message: "Guest, email, room, check-in and check-out are required."
      });
    }

    const start = new Date(checkIn);
    const end = new Date(checkOut);

    if (
      Number.isNaN(+start) ||
      Number.isNaN(+end) ||
      end <= start
    ) {
      return res.status(400).json({
        success: false,
        message: "Check-out must be after check-in."
      });
    }

    const room = await Room.findById(roomId);

    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Room not found."
      });
    }

    const conflict = await Booking.exists({
      room: roomId,
      status: {
        $nin: ["Cancelled", "Checked-out"]
      },
      checkIn: { $lt: end },
      checkOut: { $gt: start }
    });

    if (conflict) {
      return res.status(409).json({
        success: false,
        message: "Room is already booked for these dates."
      });
    }

    const nights = Math.ceil(
      (end - start) / 86400000
    );

    const booking = await Booking.create({
      guestName,
      email,
      room: roomId,
      checkIn: start,
      checkOut: end,
      guests: guests || 1,
      totalAmount: nights * room.pricePerNight
    });

    await Room.findByIdAndUpdate(roomId, {
      status: "Occupied"
    });

    res.status(201).json({
      success: true,
      message: "Booking created successfully",
      booking: await booking.populate("room")
    });

  } catch (error) {
    next(error);
  }
});

// =====================================
// 8. UPDATE BOOKING STATUS
// =====================================

app.patch("/api/bookings/:id/status", async (req, res, next) => {
  try {
    const allowed = [
      "Confirmed",
      "Checked-in",
      "Checked-out",
      "Cancelled"
    ];

    const { status } = req.body;

    if (!allowed.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid booking status."
      });
    }

    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status },
      {
        new: true,
        runValidators: true
      }
    ).populate("room");

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found."
      });
    }

    if (
      ["Cancelled", "Checked-out"].includes(status) &&
      booking.room
    ) {
      const other = await Booking.exists({
        room: booking.room._id,
        _id: { $ne: booking._id },
        status: {
          $nin: ["Cancelled", "Checked-out"]
        }
      });

      if (!other) {
        await Room.findByIdAndUpdate(
          booking.room._id,
          { status: "Available" }
        );
      }
    }

    res.json({
      success: true,
      message: "Booking status updated successfully",
      booking
    });

  } catch (error) {
    next(error);
  }
});

// =====================================
// 9. GLOBAL ERROR HANDLER
// =====================================

app.use((err, req, res, next) => {
  console.error("Server Error:", err);

  res.status(500).json({
    success: false,
    message: err.message || "Internal Server Error"
  });
});

// =====================================
// 10. DATABASE CONNECTION
// =====================================

const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("MongoDB connected successfully");

    app.listen(PORT, () => {
      console.log(
        `API running on http://localhost:${PORT}`
      );
    });
  })
  .catch((error) => {
    console.error(
      "MongoDB connection failed:",
      error.message
    );

    process.exit(1);
  });
