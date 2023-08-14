const mongoose = require("mongoose");
const { validationResult } = require("express-validator");

const HttpError = require("../../models/HttpError");
const Class = require("../../models/classModel");
const Teacher = require("../../models/teacherModel");
const NoticeBoard = require("../../models/noticeBoardModel");

const getNoticeBoard = async (req, res, next) => {
  let notices;
  try {
    notices = await NoticeBoard.find().sort({ createdAt: -1 }).limit(25);
    res.json({ notices: notices.map((n) => n.toObject({ getters: true })) });
  } catch (err) {
    console.error(err);
    return next(
      new HttpError("Something went wrong, couldn't find notices", 500)
    );
  }
};

// CREATING A NOTICE
const createNotice = async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return next(
      new HttpError("Invalid inputs passed, please check your data.", 422)
    );
  }

  const { headline, description, receiverEntity, receiverName, receiverId } =
    req.body;

  // --Improvement - SHOULD CHECK WETHER RECEIVERID AND NAME IS ACTUALLY EXISTS IN RECEIVER DATA-done
  if (receiverEntity === "class") {
    const myClass = await Class.findById(receiverId);
    if (!myClass) {
      return next(new HttpError("Your class doesn't exist", 404));
    }
  } else if (receiverEntity === "teacher") {
    const teacher = await Teacher.findById(receiverId);
    if (!teacher) {
      return next(new HttpError("Your teacher doesn't exist", 404));
    }
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  const createdNotice = new NoticeBoard({
    headline,
    description,
    receiverEntity,
    receiverName,
    receiverId,
  });

  try {
    await createdNotice.save({ session });
    await session.commitTransaction();
    session.endSession();
  } catch (err) {
    console.error(err);
    await session.abortTransaction();
    session.endSession();
    return next(
      new HttpError("Invalid inputs passed, please check your data.", 422)
    );
  }
  res.status(200).json({
    notice: createdNotice.toObject({ getters: true }),
    message: "Saved Successfully",
  });
};

const deleteNotice = async (req, res, next) => {
  const { noticeId } = req.params;

  const session = await mongoose.startSession();
  session.startTransaction();

  let notice;
  try {
    notice = await NoticeBoard.findOneAndDelete(
      { _id: noticeId },
      { session: session }
    );

    if (!notice) {
      await session.abortTransaction();
      session.endSession();
      return next(new HttpError("Couldn't find the notice", 404));
    }

    await session.commitTransaction();
    session.endSession();
    res.json({
      notice: notice.toObject({ getters: true }),
      message: "Deleted Successfully",
    });
  } catch (err) {
    console.error(err);
    await session.abortTransaction();
    session.endSession();
    return next(
      new HttpError("Something went wrong, couldn't delete the notice", 500)
    );
  }
};

module.exports = {
  createNotice,
  getNoticeBoard,
  deleteNotice,
};
