//backend/src/routes/bookingRoutes.js

import express from "express";

import {
  createBooking,
  getMyBookings,
  approveBooking,
  updateAvailability
}
from "../controllers/bookingController.js";

import { protect }
from "../middleware/auth.middleware.js";

import Notification from "../models/Notification.js";

const router = express.Router();

router.post(
  "/",
  protect,
  createBooking
);

router.get(
  "/my",
  protect,
  getMyBookings
);

router.put(
  "/:id/approve",
  protect,
  approveBooking
);

router.put(
  "/availability",
  protect,
  updateAvailability
);

router.get(
  "/notifications",
  protect,
  async (req, res) => {

    const notifications =
      await Notification.find({
        userId: req.user.id
      })
      .sort({ createdAt: -1 })

    res.json(notifications)
  }
)

router.get(
  "/s/my",
  protect,
  async (req, res) => {

    const bookings =
      await Booking.find({
        $or: [
          { studentId: req.user.id },
          { bookedBy: req.user.id }
        ]
      })
      .populate("tutorId", "name email")
      .sort({ startTime: 1 })

    res.json(bookings)
  }
)

router.get(
  "/availability/:tutorId",
  protect,
  async (req, res) => {

    const bookings =
      await Booking.find({
        tutorId: req.params.tutorId,
        status: "approved"
      })

    res.json(bookings)
  }
)

export default router;