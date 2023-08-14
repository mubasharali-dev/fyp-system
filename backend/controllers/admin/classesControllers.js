const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const sourceDB = mongoose.createConnection(
  "mongodb+srv://jamshaidjavaid:rollcasting@cluster0.hfeosn9.mongodb.net/externaledatabase?retryWrites=true&w=majority"
);

const sourceStudentsCollection = sourceDB.collection("students");
const sourceClassesCollection = sourceDB.collection("classes");

const { validationResult } = require("express-validator");

const HttpError = require("../../models/HttpError");
const Class = require("../../models/classModel");
const Student = require("../../models/studentModel");
const Teacher = require("../../models/teacherModel");
const Project = require("../../models/projectModel");
const NoticeBoard = require("../../models/noticeBoardModel");

// ///////////////////////////////////////////////////////////////////////////////////////////
// get all the classes
const getClasses = async (req, res, next) => {
  let classes;
  try {
    classes = await Class.find(
      {},
      "name totalStudents totalProjects assignedSupervisors"
    );
    res.json({ classes: classes.map((n) => n.toObject({ getters: true })) });
  } catch (err) {
    console.error(err);
    return next(new HttpError("Sorry, couldn't load your classes", 500));
  }
};

// create a new class
const createClass = async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return next(
      new HttpError("Invalid inputs passed, please check your data.", 422)
    );
  }

  const { program, session, shift, minAllowed, maxAllowed } = req.body;

  const classname = `${program}-${shift}-${session}`;

  try {
    const existingClass = await Class.findOne({ name: classname });
    if (existingClass) {
      return next(new HttpError("Classname already exists.", 422));
    }
    // Find the source class
    const sourceClass = await sourceClassesCollection.findOne({
      name: classname,
    });
    if (!sourceClass) {
      return next(
        new HttpError("Source class not found, so can't be created", 404)
      );
    }

    const sess = await mongoose.startSession();
    sess.startTransaction();

    // Create the class in our database
    const createdClass = new Class({
      name: classname,
      program,
      session,
      shift,
      minAllowed,
      maxAllowed,
    });
    // Get students from the source database and add them to our database
    let classStudents = [];
    for await (const student of sourceStudentsCollection.find({
      className: classname,
    })) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(student.rollNo, salt);
      const newStudent = new Student({
        salt,
        password: hashedPassword,
        name: student.name,
        rollNo: student.rollNo,
        classId: createdClass._id,
        image: student.image,
        cgpa: student.cgpa,
      });
      await newStudent.save({ session: sess });
      ++createdClass.totalStudents;
      classStudents.push(newStudent);
    }

    await createdClass.save({ session: sess });
    try {
      const topStudents = classStudents
        .filter((student) => student.classId === createdClass._id)
        .sort((a, b) => b.cgpa - a.cgpa)
        .slice(0, Math.ceil(classStudents.length / maxAllowed));

      if (topStudents.length === 0) {
        await sess.abortTransaction();
        sess.endSession();
        return next(new HttpError("Top students were not found", 404));
      }

      for (const student of topStudents) {
        student.hasTopped = true;
        await student.save({ session: sess });
      }
    } catch (err) {
      await sess.abortTransaction();
      sess.endSession();
      console.error(err);
      return next(
        new HttpError("Couldn't get top students, please try again later", 500)
      );
    }
    await sess.commitTransaction();
    sess.endSession();
    res.status(200).json({
      createdClass,
      message: "Class and Students Saved Successfully",
    });
  } catch (err) {
    await sess.abortTransaction();
    sess.endSession();
    console.error(err);
    return next(new HttpError("Error occurred while creating class.", 500));
  }
};

// delete a created class
const deleteClass = async (req, res, next) => {
  const { classId } = req.params;
  let myClass;
  const sess = await mongoose.startSession();
  sess.startTransaction();
  try {
    myClass = await Class.findOneAndDelete({ _id: classId }, { session: sess });
    await Teacher.updateMany(
      { assignedClassesForSupervision: myClass._id },
      { $pull: { assignedClassesForSupervision: myClass._id } },
      { session: sess }
    );
    await Teacher.updateMany(
      { assignedClassesForExamination: myClass._id },
      { $pull: { assignedClassesForExamination: myClass._id } },
      { session: sess }
    );

    const projectsToDelete = await Project.find({
      classId: myClass._id,
    });
    for (const project of projectsToDelete) {
      const supervisorId = project.supervisorId;
      await Teacher.updateOne(
        { _id: supervisorId },
        {
          $inc: { assignedProjectsCount: -1 },
          $pull: { assignedProjects: project._id },
        },
        { session: sess }
      );
    }

    await Project.deleteMany({ classId: myClass._id }, { session: sess });
    await NoticeBoard.deleteMany(
      { receiverEntity: "class", receiverId: myClass._id },
      { session: sess }
    );
    await Student.deleteMany({ classId: myClass._id }, { session: sess });
    res.json({ message: "Deleted Successfully" });
    await sess.commitTransaction();
    sess.endSession();
  } catch (err) {
    await sess.abortTransaction();
    sess.endSession();
    console.error(err);
    return next(
      new HttpError("Something went wrong, couldn't delete the class", 422)
    );
  }
};

const getClassById = async (req, res, next) => {
  const { classId } = req.params;

  const myClass = await Class.findById(
    classId,
    "name minAllowed maxAllowed timetable"
  );

  if (!myClass) {
    return next(new HttpError("Your chosen class doesn't exist", 404));
  }

  let projects, supervisors, examiners, students, notices, timetable;

  try {
    projects = await Project.find(
      { classId: classId },
      "title supervisorName supervisorId members status"
    );
    supervisors = await Teacher.find(
      {
        assignedClassesForSupervision: { $in: classId },
      },
      "name empId assignedProjectsCount projectsLimit"
    );
    examiners = await Teacher.find(
      {
        assignedClassesForExamination: { $in: classId },
      },
      "name empId designation"
    );
    students = await Student.find(
      { classId: classId },
      "name rollNo marks status hasTopped"
    );
    notices = await NoticeBoard.find({
      receiverEntity: "class",
      receiverId: classId,
    });

    res.json({
      myClass: myClass.toObject({ getters: true }),
      projects: projects.map((p) => p.toObject({ getters: true })),
      supervisors: supervisors.map((s) => s.toObject({ getters: true })),
      examiners: examiners.map((e) => e.toObject({ getters: true })),
      students: students.map((s) => s.toObject({ getters: true })),
      notices: notices.map((n) => n.toObject({ getters: true })),
    });
  } catch (err) {
    console.error(err);
    return next(
      new HttpError("Something went wrong, couldn't load class", 500)
    );
  }
};

const editTimeTable = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { classId } = req.params;

  const {
    titleSubmission,
    proposalSubmission,
    proposalDefense,
    deliverable1,
    deliverable1Evalutaion,
    deliverable2,
    deliverable2Evalutaion,
  } = req.body;

  let updatedClass;

  console.log(req.body);

  try {
    updatedClass = await Class.findByIdAndUpdate(
      classId,
      {
        timetable: {
          titleSubmission,
          proposalSubmission,
          proposalDefense,
          deliverable1,
          deliverable1Evalutaion,
          deliverable2,
          deliverable2Evalutaion,
        },
      },
      { runValidators: true, new: true }
    );
    res.json({ updatedClass, message: "timetable has been updated" });
  } catch (err) {
    console.error(err);
    return next(
      new HttpError("Something went wrong, or maybe class doesn't exists", 500)
    );
  }
};

// ASSIGNING A TEACHER TO CLASS AS SUPERVISOR

const assignSupervisorToClass = async (req, res, next) => {
  const { classId } = req.params;
  const { supervisors } = req.body;

  const sess = await mongoose.startSession();
  sess.startTransaction();

  try {
    // Check if class exists or not. check with classId
    const foundClass = await Class.findById(classId);
    if (!foundClass) {
      return next(new HttpError("Class not found", 404));
    }
    for (const supervisor of supervisors) {
      // Check if teacher exists or not. check with teacherId, with findById method.
      const foundTeacher = await Teacher.findById(supervisor.id);
      if (!foundTeacher) {
        return next(new HttpError("Teacher not found", 404));
      }

      // then check in the assignedClassesForSupervision of Teacher that wether classId is already in the array or not.
      if (foundTeacher.assignedClassesForSupervision.includes(classId)) {
        continue; // skip to the next iteration
      }
      foundTeacher.assignedClassesForSupervision.push(classId);
      await foundTeacher.save({ session: sess });
      foundClass.assignedSupervisors += 1;
      await foundClass.save({ session: sess });
    }
    await sess.commitTransaction();
    sess.endSession();

    const updatedSupervisors = await Teacher.find({
      assignedClassesForSupervision: classId,
    });
    res.json({
      updatedSupervisors: updatedSupervisors.map((s) =>
        s.toObject({ getters: true })
      ),
      message: "Class assigned to a supervisor",
    });
  } catch (err) {
    await sess.abortTransaction();
    sess.endSession();
    console.log(err);
    return next(new HttpError("Internal server error", 500));
  }
};

// ASSIGNING EXAMINER TO CLASS

const assignExaminerToClass = async (req, res, next) => {
  const { classId } = req.params;
  const { examiners } = req.body;

  const sess = await mongoose.startSession();
  sess.startTransaction();

  try {
    // Check if class exists or not. check with classId
    const foundClass = await Class.findById(classId);
    if (!foundClass) {
      return next(new HttpError("Class not found", 404));
    }
    for (const examiner of examiners) {
      // Check if teacher exists or not. check with teacherId, with findById method.
      const foundTeacher = await Teacher.findById(examiner.id);
      if (!foundTeacher) {
        return next(new HttpError("Teacher not found", 404));
      }

      // then check in the assignedClassesForExamination of Teacher that wether classId is already in the array or not.
      if (foundTeacher.assignedClassesForExamination.includes(classId)) {
        return next(
          new HttpError(
            "Class already assigned to the teacher for examination",
            400
          )
        );
      }

      // then push the classId into the assignedClassesForExamination array of Teacher we get
      foundTeacher.assignedClassesForExamination.push(classId);
      await foundTeacher.save({ session: sess });
      foundClass.assignedExaminers += 1;
      await foundClass.save({ session: sess });
    }
    await sess.commitTransaction();
    sess.endSession();

    const updatedExaminers = await Teacher.find({
      assignedClassesForExamination: classId,
    });
    res.json({
      updatedExaminers: updatedExaminers.map((e) =>
        e.toObject({ getters: true })
      ),
      message: "Class assigned to an examiner",
    });
  } catch (err) {
    await sess.abortTransaction();
    sess.endSession();
    console.log(err);
    return next(new HttpError("Internal server error", 500));
  }
};

module.exports = {
  getClasses,
  createClass,
  deleteClass,
  getClassById,
  editTimeTable,
  assignSupervisorToClass,
  assignExaminerToClass,
};
