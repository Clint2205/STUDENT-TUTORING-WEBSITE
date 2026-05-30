// controllers/sessionController.js

import Session from "../models/Sessions.js";
import Resource from "../models/Resource.js";

export const updateSessionProgress = async (req, res) => {
  try {

    const { id } = req.params;

    const {
      completionStatus,
      understandingLevel,
      tutorNotes,
      skills,
      resourceId
    } = req.body;

    // ✅ Update session
    const session = await Session.findByIdAndUpdate(
      id,
      {
        $set: {
          "progress.completionStatus": completionStatus,
          "progress.understandingLevel": understandingLevel,
          "progress.tutorNotes": tutorNotes,
          "progress.skills": skills
        }
      },
      { new: true }
    );

    // ✅ ALSO update linked resource
    if (resourceId) {

      const resource = await Resource.findById(resourceId);

      if (resource) {

        // find existing student progress
        const existing =
          resource.progress.find(
            p =>
              p.studentId.toString() ===
              session.studentId.toString()
          );

        if (existing) {

          existing.completionStatus =
            completionStatus;

          existing.understandingLevel =
            understandingLevel;

          existing.tutorNotes =
            tutorNotes;

          existing.updatedBy =
            req.user._id;

          existing.updatedAt =
            new Date();

        } else {

          resource.progress.push({
            studentId: session.studentId,
            completionStatus,
            understandingLevel,
            tutorNotes,
            updatedBy: req.user._id
          });

        }

        await resource.save();
      }
    }

    res.json({
      message: "Progress updated",
      session
    });

  } catch (err) {

    res.status(500).json({
      message: err.message
    });

  }
};