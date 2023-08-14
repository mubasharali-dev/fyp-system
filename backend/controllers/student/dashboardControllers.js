const HttpError = require("../../models/HttpError");
const NoticeBoard = require("../../models/noticeBoardModel");
const Project = require("../../models/projectModel");

const getDashboard = async (req, res, next) => {
  const { studentId } = req.query;
  let myTodoList = [],
    notices = [];

  try {
    const project = await Project.findOne({
      memberNames: {
        $elemMatch: {
          id: studentId,
        },
      },
    });
    if (!project) {
      throw new Error("Project not found");
    }

    notices = await NoticeBoard.find({
      receiverEntity: "class",
      receiverId: project.classId,
    });

    myTodoList = project.tasks.filter(
      (task) => task.assignedToId.equals(studentId) && !task.endDate
    );

    res.send({
      myTodoList: myTodoList.map((t) => t.toObject({ getters: true })),
      notices: notices.map((n) => n.toObject({ getters: true })),
    });
  } catch (err) {
    console.error(err);
    return next(new HttpError("Couldn't retrieve dashboard data", 500));
  }
};

module.exports = {
  getDashboard,
};
