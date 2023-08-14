const mongoose = require("mongoose");

const HttpError = require("../../models/HttpError");
const Student = require("../../models/studentModel");

const getNotes = async (req, res, next) => {
  const { userId } = req.query;
  let notes;
  try {
    const student = await Student.findById(userId);
    notes = student.notes;
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
    const student = await Student.findById(userId);
    if (!student) {
      return next(new HttpError("This student doesn't exist", 404));
    }
    const createdNote = {
      note,
    };
    student.notes.push(createdNote);
    await student.save({ session });

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
    await Student.updateOne(
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
