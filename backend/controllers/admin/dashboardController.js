const Class = require("../../models/classModel");
const Student = require("../../models/studentModel");
const Teacher = require("../../models/teacherModel");
const Project = require("../../models/projectModel");
const NoticeBoard = require("../../models/noticeBoardModel");
const Notification = require("../../models/notificationModel");

const getDashboard = async (req, res, next) => {
  let projects, supervisors, students, notices, classes, notifications;
  try {
    classes = await Class.countDocuments();
    projects = await Project.countDocuments();
    supervisors = await Teacher.find({
      assignedClassesForSupervision: { $ne: [] },
    }).countDocuments();
    students = await Student.countDocuments();
    notices = await NoticeBoard.find();
    notifications = await Notification.find();

    res.json({
      classes,
      projects,
      supervisors,
      students,
      notices: notices.map((n) => n.toObject({ getters: true })),
      notifications: notifications.map((n) => n.toObject({ getters: true })),
    });
  } catch (err) {
    console.error(err);
    return next(new HttpError("Sorry, couldn't load your dashboard", 500));
  }
};

module.exports = {
  getDashboard,
};
