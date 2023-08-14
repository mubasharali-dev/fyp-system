const mongoose = require("mongoose");

const HttpError = require("../../models/HttpError");
const Teacher = require("../../models/teacherModel");

const getNotes = async (req, res, next) => {
  const { userId } = req.query;
  let notes;
  try {
    const teacher = await Teacher.findById(userId);
    notes = teacher.notes;
    res.json({ notes: notes.map((n) => n.toObject({ getters: true })) });
  } catch (err) {
    console.error(err);
    return next(
      new HttpError("Something went wrong, couldn't find notes", 500)
    );
  }
};

// CREATING A NOte
const createNote = async (req, res, next) => {
  const { note, userId } = req.body;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const teacher = await Teacher.findById(userId);
    if (!teacher) {
      return next(new HttpError("This teacher doesn't exist", 404));
    }
    const createdNote = {
      note,
    };
    teacher.notes.push(createdNote);
    await teacher.save({ session });

    await session.commitTransaction();
    session.endSession();
    res.json({
      message: "Saved Successfully",
    });
  } catch (error) {
    console.error(error);
    await session.abortTransaction();
    session.endSession();
    return next(
      new HttpError("Something went wrong, couldn't save the note", 500)
    );
  }
};

//  delete A NOte
const deleteNote = async (req, res, next) => {
  const { userId } = req.query;
  const { noteId } = req.params;
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    await Teacher.updateOne(
      { _id: userId },
      { $pull: { notes: { _id: noteId } } },
      { session }
    );

    await session.commitTransaction();
    session.endSession();
    res.json({
      message: "Deleted Successfully",
    });
  } catch (error) {
    console.error(error);
    await session.abortTransaction();
    session.endSession();
    return next(
      new HttpError("Something went wrong, couldn't save the note", 500)
    );
  }
};

module.exports = {
  getNotes,
  createNote,
  deleteNote,
};
