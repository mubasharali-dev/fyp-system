const bcrypt = require("bcrypt");
const { validationResult } = require("express-validator");
const mongoose = require("mongoose");

const sourceDB = mongoose.createConnection(
  "mongodb+srv://jamshaidjavaid:rollcasting@cluster0.hfeosn9.mongodb.net/externaledatabase?retryWrites=true&w=majority"
);

const HttpError = require("../../models/HttpError");
const Teacher = require("../../models/teacherModel");
const Class = require("../../models/classModel");
const Project = require("../../models/projectModel");
const NoticeBoard = require("../../models/noticeBoardModel");

let resume_token = null;

const sourceTeacherCollection = sourceDB.collection("teachers");

const updateTeachers = async () => {
  const changeStream = sourceTeacherCollection.watch({
    resumeAfter: resume_token,
  });

  const stream = await changeStream;
  stream
    .on("change", async (change) => {
      console.log(new Date() + " watching teachers ");
      try {
        resume_token = change._id;
        if (change.operationType === "insert") {
          const { _id, name, empId, image, designation } = change.fullDocument;
          const salt = await bcrypt.genSalt(10);
          const hashedPassword = await bcrypt.hash(empId, salt);
          const createdTeacher = new Teacher({
            salt,
            password: hashedPassword,
            _id,
            name,
            empId,
            image,
            designation,
          });
          await createdTeacher.save();
        } else if (change.operationType === "delete") {
          const { _id } = change.documentKey;
          await Teacher.findOneAndDelete({ _id });
        }
      } catch (error) {
        console.error(error);
        return new HttpError("Couldn't modify the teachers", 500);
      }
    })
    .on("error", (err) => {
      console.log(new Date() + " error: " + err);
      updateTeachers();
    });
};
async function run() {
  updateTeachers();
}

run();

const getTeachers = async (req, res, next) => {
  let teachers;
  try {
    teachers = await Teacher.find({}, "name empId designation image");
    if (!teachers.length) {
      return next(new HttpError("No teachers in database", 200));
    }

    res.json({
      teachers: teachers.map((t) => t.toObject({ getters: true })),
    });
  } catch (err) {
    console.error(err);
    return next(
      new HttpError("Something went wrong, couldn't find teachers", 500)
    );
  }
};

// GET TEACHER BY ID
const getTeacherById = async (req, res, next) => {
  const { teacherId } = req.params;
  let teacher;
  try {
    teacher = await Teacher.findById(teacherId);

    if (!teacher) {
      return next(new HttpError("Couldn't find the teacher", 404));
    }
    const assignedClassesforSupervisionArray = [];
    const assignedClassesforExaminationArray = [];

    for (const classId of teacher.assignedClassesForSupervision) {
      try {
        const myClass = await Class.findById(classId);
        assignedClassesforSupervisionArray.push({
          classId,
          className: myClass.name,
        });
      } catch (err) {
        console.error(err);
        return next(
          new HttpError(
            "Couldn't find the associated classes for supervision",
            404
          )
        );
      }
    }

    for (const classId of teacher.assignedClassesForExamination) {
      try {
        const myClass = await Class.findById(classId);
        assignedClassesforExaminationArray.push({
          classId,
          className: myClass.name,
        });
      } catch (err) {
        console.error(err);
        return next(
          new HttpError(
            "Couldn't find the associated classes for examination",
            404
          )
        );
      }
    }

    const noticesForTeacher = await NoticeBoard.find({ receiverId: teacherId })
      .sort({
        createdAt: -1,
      })
      .limit(25);

    const projects = await Project.find({ supervisorId: teacherId });

    res.json({
      teacher: teacher.toObject({ getters: true }),
      assignedForSupervision: assignedClassesforSupervisionArray,
      assignedForExamination: assignedClassesforExaminationArray,
      notices: noticesForTeacher.map((n) => n.toObject({ getters: true })),
      projects: projects.map((p) => p.toObject({ getters: true })),
    });
  } catch (err) {
    console.error(err);
    return next(
      new HttpError("Issue in getting teacher, internal server error", 500)
    );
  }
};

// UN-ASSIGNING A TEACHER TO CLASS AS SUPERVISOR

const unAssignSupervisorToClass = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { teacherId } = req.params;
  const { classId } = req.body;

  const sess = await mongoose.startSession();
  sess.startTransaction();
  try {
    // Check if class exists or not. check with classId
    const foundClass = await Class.findById(classId);
    if (!foundClass) {
      return next(new HttpError("Class not found", 404));
    }

    // Check if teacher exists or not. check with teacherId, with findById method.
    const foundTeacher = await Teacher.findById(teacherId);
    if (!foundTeacher) {
      return next(new HttpError("Teacher not found", 404));
    }

    // then check in the assignedClassesForSupervision of Teacher that wether classId is already in the array or not.
    if (!foundTeacher.assignedClassesForSupervision.includes(classId)) {
      return next(
        new HttpError("Class already not assigned to the for supervision", 400)
      );
    }

    // check wether project with this supervisor with classId exists or not
    const projects = await Project.find({
      classId: classId,
      supervisorId: teacherId,
    });
    if (projects.length > 0) {
      return next(
        new HttpError("Supervisor is assigned to projects of the class", 400)
      );
    }
    // then pull the classId from the assignedClassesForSupervision array of Teacher we get
    foundTeacher.assignedClassesForSupervision =
      foundTeacher.assignedClassesForSupervision.pull(classId);
    await foundTeacher.save({ session: sess });
    foundClass.assignedSupervisors -= 1;
    await foundClass.save({ session: sess });

    await sess.commitTransaction();
    sess.endSession();
    res.json({ message: "Class un-assigned to a supervisor" });
  } catch (err) {
    await sess.abortTransaction();
    sess.endSession();
    console.log(err);
    return next(new HttpError("Internal server error", 500));
  }
};

// UN-ASSIGNING A TEACHER TO CLASS AS EXAMINER

const unAssignExaminerToClass = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { teacherId } = req.params;
  const { classId } = req.body;

  const sess = await mongoose.startSession();
  sess.startTransaction();
  try {
    // Check if class exists or not. check with classId
    const foundClass = await Class.findById(classId);
    if (!foundClass) {
      return next(new HttpError("Class not found", 404));
    }

    // Check if teacher exists or not. check with teacherId, with findById method.
    const foundTeacher = await Teacher.findById(teacherId);
    if (!foundTeacher) {
      return next(new HttpError("Teacher not found", 404));
    }

    // then check in the assignedClassesForExamination of Teacher that wether classId is already in the array or not.
    if (!foundTeacher.assignedClassesForExamination.includes(classId)) {
      return next(
        new HttpError("Class already not assigned to the for Examination", 400)
      );
    }

    // then push the classId into the assignedClassesForExamination array of Teacher we get
    foundTeacher.assignedClassesForExamination =
      foundTeacher.assignedClassesForExamination.pull(classId);
    await foundTeacher.save({ session: sess });
    foundClass.assignedSupervisors -= 1;
    await foundClass.save({ session: sess });

    await sess.commitTransaction();
    sess.endSession();
    res.json({ message: "Class un-assigned to an examiner" });
  } catch (err) {
    await sess.abortTransaction();
    sess.endSession();
    console.log(err);
    return next(new HttpError("Internal server error", 500));
  }
};

module.exports = {
  getTeachers,
  unAssignSupervisorToClass,
  unAssignExaminerToClass,
  getTeacherById,
};
