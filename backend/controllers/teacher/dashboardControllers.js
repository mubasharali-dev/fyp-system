const HttpError = require("../../models/HttpError");
const NoticeBoard = require("../../models/noticeBoardModel");
const Notification = require("../../models/notificationModel");
const Teacher = require("../../models/teacherModel");
const Project = require("../../models/projectModel");
const Class = require("../../models/classModel");

const getDashboard = async (req, res, next) => {
  const { userId } = req.query;
  let notifications = [],
    notices = [],
    classesSupervision = 0,
    classesExamination = 0,
    projectsSupervision = 0,
    projectsExamination = 0,
    projectsSupervisionLimit = 0;

  try {
    const teacher = await Teacher.findById(userId);

    if (!teacher) {
      return next(new HttpError("Couldn't find teacher", 401));
    }

    classesExamination = teacher.assignedClassesForExamination.length;
    classesSupervision = teacher.assignedClassesForSupervision.length;
    projectsSupervision = teacher.assignedProjectsCount;
    projectsSupervisionLimit = teacher.projectsLimit;
    let projectsAll = 0;
    for (const aClass of teacher.assignedClassesForExamination) {
      const myClassProjects = await Class.findById(aClass, "totalProjects");
      if (myClassProjects.totalProjects) {
        projectsAll += myClassProjects.totalProjects;
      }
    }

    console.log(projectsAll);
    notifications = await Notification.find({
      senderId: userId,
    });
    notices = await NoticeBoard.find({
      receiverEntity: "teacher",
      receiverId: userId,
    });

    res.send({
      notices: notices.map((n) => n.toObject({ getters: true })),
      notifications: notifications.map((n) => n.toObject({ getters: true })),
      classesExamination,
      classesSupervision,
      projectsSupervision,
      projectsSupervisionLimit,
      projectsExamination: projectsAll,
    });
  } catch (err) {
    console.error(err);
    return next(new HttpError("Couldn't retrieve dashboard data", 500));
  }
};

const updateLimit = async (req, res, next) => {
  const { userId, limit } = req.body;

  try {
    const teacher = await Teacher.findById(userId);

    if (!teacher) {
      return next(new HttpError("Couldn't find teacher", 401));
    }

    if (teacher.assignedProjectsCount > limit) {
      return next(
        new HttpError(
          "Can't assign new limit when projects assigned already more",
          401
        )
      );
    }

    teacher.projectsLimit = limit;
    await teacher.save();

    res.send({
      message: "Projects Limit Updated",
    });
  } catch (err) {
    console.error(err);
    return next(new HttpError("Couldn't retrieve dashboard data", 500));
  }
};

const getSupervisionProjects = async (req, res, next) => {
  const { userId } = req.query;

  try {
    const teacher = await Teacher.findById(userId);

    if (!teacher) {
      return next(new HttpError("Couldn't find teacher", 400));
    }

    const classes = teacher.assignedClassesForSupervision;
    const allClasses = [];
    const allProjects = [];
    for (const myClass of classes) {
      const currentClass = await Class.findById(myClass);
      allClasses.push({
        id: currentClass._id,
        name: currentClass.name,
      });
      const projects = await Project.find({
        supervisorId: userId,
        classId: currentClass._id,
      });
      allProjects.push({
        className: currentClass.name,
        classProjects: projects,
      });
    }

    res.send({
      allClasses,
      allProjects,
    });
  } catch (err) {
    console.error(err);
    return next(new HttpError("Couldn't retrieve projects data", 500));
  }
};

const getExaminationProjects = async (req, res, next) => {
  const { userId } = req.query;

  try {
    const teacher = await Teacher.findById(userId);

    if (!teacher) {
      return next(new HttpError("Couldn't find teacher", 400));
    }

    const classes = teacher.assignedClassesForExamination;
    const allClasses = [];
    const allProjects = [];
    for (const myClass of classes) {
      const currentClass = await Class.findById(myClass);
      allClasses.push({
        id: currentClass._id,
        name: currentClass.name,
      });
      const projects = await Project.find({
        classId: currentClass._id,
      });
      allProjects.push({
        className: currentClass.name,
        classProjects: projects,
      });
    }

    res.send({
      allClasses,
      allProjects,
    });
  } catch (err) {
    console.error(err);
    return next(new HttpError("Couldn't retrieve projects data", 500));
  }
};

module.exports = {
  getDashboard,
  updateLimit,
  getSupervisionProjects,
  getExaminationProjects,
};
