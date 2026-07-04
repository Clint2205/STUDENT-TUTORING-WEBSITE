import Booking from "../models/Booking.js";
import User from "../models/User.js";
import Notification from "../models/Notification.js"


// CREATE BOOKING
export const createBooking = async (req, res) => {
  try {

    const {
      tutorId,
      studentId,
      startTime,
      endTime,
      subject,
      notes
    } = req.body;

    // prevent double booking
    const existing = await Booking.findOne({
      tutorId,

      startTime: {
        $lt: endTime
      },

      endTime: {
        $gt: startTime
      },

      status: {
        $in: ["pending", "approved"]
      }
    });

    if (existing) {
      return res.status(400).json({
        message: "Time slot already booked"
      });
    }

    if (
  new Date(req.body.endTime) <=
  new Date(req.body.startTime)
) {

  return res.status(400).json({
    message:
      "End time must be after start time"
  })
}

    const clash = await Booking.findOne({
  tutorId: req.body.tutorId,

  status: {
    $in: ["pending", "approved"]
  },

  startTime: {
    $lt: req.body.endTime
  },

  endTime: {
    $gt: req.body.startTime
  }
})

if (clash) {

  return res.status(400).json({
    message:
      "Tutor already booked for that time"
  })
}

    const booking = await Booking.create({
      tutorId,
      bookedBy: req.user._id,
      studentId,
      startTime,
      endTime,
      subject,
      notes
    });

    res.status(201).json(booking);

  } catch (err) {

    console.error(err);

    res.status(500).json({
      message: err.message
    });

  }
};


// GET MY BOOKINGS
export const getMyBookings = async (req, res) => {
  try {

    let filter = {};

    if (req.user.role === "tutor") {
      filter.tutorId = req.user._id;
    }

    if (
      req.user.role === "student" ||
      req.user.role === "parent"
    ) {
      filter.bookedBy = req.user._id;
    }

    const user = await User.findById(req.user._id);

    const bookings = await Booking.find({
      ...filter,
      _id: {
        $nin: user.hiddenBookings || []
      }
    })
      .populate("studentId", "name email")
      .populate("tutorId", "name email")
      .populate("bookedBy", "name email role")
      .sort({ startTime: 1 });

    res.json(bookings);

  } catch (err) {

    console.error(err);

    res.status(500).json({
      message: err.message
    });

  }
};


// APPROVE BOOKING
export const approveBooking = async (req, res) => {

  try {

    const booking = await Booking.findById(req.params.id)

    if (!booking) {

      return res.status(404).json({
        message: "Booking not found"
      })

    }

    booking.status = "approved"

    booking.meetingLink =
      `https://meet.jit.si/tutorbridge-${booking._id}`

    await booking.save()

    // ✅ notify student

    await Notification.create({
      userId: booking.studentId,

      title: "Lesson Approved",

      message:
        `Your ${booking.subject} lesson was approved.`,

      bookingId: booking._id
    })

    // ✅ notify parent if parent booked

    if (
      booking.bookedBy &&
      booking.bookedBy.toString() !==
      booking.studentId.toString()
    ) {

      await Notification.create({
        userId: booking.bookedBy,

        title: "Lesson Approved",

        message:
          `Your child's lesson was approved.`,

        bookingId: booking._id
      })

    }

    res.json({
      message: "Booking approved",
      booking
    })

  } catch (error) {

    console.log(error)

    res.status(500).json({
      message: "Server error"
    })

  }

}

// UPDATE AVAILABILITY
export const updateAvailability =
async (req, res) => {

  try {

    const {
      availability,
      timezone
    } = req.body;

    const user =
      await User.findByIdAndUpdate(
        req.user._id,
        {
          availability,
          timezone
        },
        { new: true }
      );

    res.json(user);

  } catch (err) {

    res.status(500).json({
      message: err.message
    });

  }

};
export const hideNotification = async (req, res) => {
  try {
    await User.findByIdAndUpdate(
      req.user._id,
      {
        $addToSet: {
          hiddenNotifications: req.params.id
        }
      }
    );

    res.json({
      message: "Notification hidden"
    });

  } catch (err) {
    console.error(err);

    res.status(500).json({
      message: "Failed to hide notification"
    });
  }
};
export const hideBooking = async (req, res) => {
  try {
    await User.findByIdAndUpdate(
      req.user._id,
      {
        $addToSet: {
          hiddenBookings: req.params.id
        }
      }
    );

    res.json({
      message: "Booking hidden"
    });

  } catch (err) {
    console.error(err);

    res.status(500).json({
      message: "Failed to hide booking"
    });
  }
};
export const getNotifications = async (req, res) => {
  try {

    const user = await User.findById(
      req.user._id
    );

    const notifications =
      await Notification.find({
        userId: req.user._id,
        _id: {
          $nin:
            user.hiddenNotifications || []  
        }
      })
      .sort({
        createdAt: -1
      });

    res.json(
      notifications
    );

  } catch (err) {
    console.error(err);

    res.status(500).json({
      message:
        "Failed to fetch notifications"
    });
  }
};