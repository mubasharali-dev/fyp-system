const mongoose = require("mongoose");
const { validationResult } = require("express-validator");

const HttpError = require("../../models/HttpError");
const Teacher = require("../../models/teacherModel");
const Notification = require("../../models/notificationModel");

const getNotifications = async (req, res, next) => {
  let notifications;
  try {
    notifications = await Notification.find().sort({ createdAt: -1 }).limit(25);
    res.json({
      notifications: notifications.map((n) => n.toObject({ getters: true })),
    });
  } catch (err) {
    console.log(err);
    return next(new HttpError("Couldn't fetch notifications", 500));
  }
};

// CREATING A Notifications
const createNotification = async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return next(
      new HttpError("Invalid inputs passed, please check your data.", 422)
    );
  }

  const { headline, description, senderName, senderId } = req.body;

  const teacher = await Teacher.findById(senderId);
  if (!teacher) {
    return next(new HttpError("Your teacher doesn't exist", 404));
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  const createdNotification = new Notification({
    headline,
    description,
    senderName,
    senderId,
  });

  try {
    console.log(createdNotification);
    await createdNotification.save({ session });
    await session.commitTransaction();
    session.endSession();
    res.status(200).json({
      notification: createdNotification.toObject({ getters: true }),
      message: "Saved Successfully",
    });
  } catch (err) {
    console.error(err);
    await session.abortTransaction();
    session.endSession();
    return next(
      new HttpError("Invalid inputs passed, please check your data.", 422)
    );
  }
};

const deleteNotification = async (req, res, next) => {
  const { notificationId } = req.params;

  const session = await mongoose.startSession();
  session.startTransaction();

  let notification;
  try {
    notification = await Notification.findOneAndDelete(
      { _id: notificationId },
      { session: session }
    );

    if (!notification) {
      await session.abortTransaction();
      session.endSession();
      return next(new HttpError("Couldn't find the notification", 404));
    }

    await session.commitTransaction();
    session.endSession();
    res.json({
      notification: notification.toObject({ getters: true }),
      message: "Deleted Successfully",
    });
  } catch (err) {
    console.error(err);
    await session.abortTransaction();
    session.endSession();
    return next(
      new HttpError(
        "Something went wrong, couldn't delete the notification",
        500
      )
    );
  }
};

module.exports = {
  getNotifications,
  deleteNotification,
  createNotification,
};
