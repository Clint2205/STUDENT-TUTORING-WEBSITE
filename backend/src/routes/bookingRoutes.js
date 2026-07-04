//backend/src/routes/bookingRoutes.js

import express from "express";

import {
  createBooking,
  getMyBookings,
  approveBooking,
  updateAvailability,
  getNotifications,
  hideNotification,
  hideBooking
}
from "../controllers/bookingController.js";

import { protect }
from "../middleware/auth.middleware.js";
import User from "../models/User.js";
import Booking from "../models/Booking.js";
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
  getNotifications
);

router.put(
  "/notifications/:id/hide",
  protect,
  hideNotification
);

router.put(
  "/bookings/:id/hide",
  protect,
  hideBooking
);

router.get(
  "/s/my",
  protect,
  async (req, res) => {

    const user =
      await User.findById(
        req.user.id
      );

    const bookings =
      await Booking.find({
        $or: [
          { studentId: req.user.id },
          { bookedBy: req.user.id }
        ],

        _id: {
          $nin:
            user.hiddenBookings || []
        }
      })
      .populate(
        "tutorId",
        "name email"
      )
      .sort({
        startTime: 1
      });

    res.json(bookings);
  }
);

router.get(
  "/availability/:tutorId",
  protect,
  async (req, res) => {
    try {
      const tutor = await User.findById(req.params.tutorId).select("availability");

      if (!tutor) {
        return res.status(404).json({ message: "Tutor not found" });
      }

      const bookings = await Booking.find({
        tutorId: req.params.tutorId,
        status: "approved"
      }).select("startTime endTime");

      res.json({
        availability: tutor.availability,
        bookings
      });

    } catch (err) {
      res.status(500).json({ message: "Failed to load availability" });
    }
  }
);

export default router;