const HttpError = require("../../models/HttpError");
const Teacher = require("../../models/teacherModel");
const Class = require("../../models/classModel");
const Student = require("../../models/studentModel");
const Project = require("../../models/projectModel");

const getTasks = async (req, res, next) => {
  const { studentId } = req.query;
  let allTasks = [],
    myTodoList = [],
    myCompletedTasks = [],
    isLeader = false;
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

    const student = await Student.findById(studentId, "hasTopped");
    if (!student) {
      throw new Error("Student not found");
    }

    if (student.hasTopped) {
      isLeader = true;
    }

    allTasks = project.tasks;

    myTodoList = project.tasks.filter(
      (task) => task.assignedToId.equals(student._id) && !task.endDate
    );

    myCompletedTasks = project.tasks.filter(
      (task) => task.assignedToId.equals(student._id) && task.endDate
    );

    res.send({
      isLeader,
      allTasks: allTasks.map((t) => t.toObject({ getters: true })),
      myTodoList: myTodoList.map((t) => t.toObject({ getters: true })),
      myCompletedTasks: myCompletedTasks.map((t) =>
        t.toObject({ getters: true })
      ),
    });
  } catch (err) {
    console.error(err);
    return next(new HttpError("Couldn't retrieve tasks", 500));
  }
};

const createTask = async (req, res, next) => {
  const {
    phase,
    title,
    startDate,
    deadline,
    assignedToName,
    assignedToId,
    studentId,
  } = req.body;

  try {
    const project = await Project.findOne({
      memberNames: {
        $elemMatch: {
          id: studentId,
        },
      },
    });

    const task = {
      phase,
      title,
      startDate,
      deadline,
      assignedToName,
      assignedToId,
    };

    console.log(task);

    project.tasks.push(task);
    await project.save();

    res.send({ message: "Task is created" });
  } catch (err) {
    console.error(err);
    return next(new HttpError("Couldn't create tasks", 500));
  }
};

const completeTask = async (req, res, next) => {
  const { studentId, endDate } = req.body;
  const { taskId } = req.params;

  try {
    const project = await Project.findOne({
      memberNames: {
        $elemMatch: {
          id: studentId,
        },
      },
    });

    const task = project.tasks.find((t) => t._id.toString() === taskId);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // update task with the endDate
    task.endDate = endDate;
    await project.save();

    res.json({
      task: task.toObject({ getters: true }),
      message: "task is marked as completed",
    });
  } catch (err) {
    console.error(err);
    return next(new HttpError("Couldn't complete task", 500));
  }
};

const deleteTask = async (req, res, next) => {
  const { studentId } = req.query;
  const { taskId } = req.params;

  try {
    const project = await Project.findOneAndUpdate(
      {
        memberNames: {
          $elemMatch: {
            id: studentId,
          },
        },
      },
      { $pull: { tasks: { _id: taskId } } },
      { new: true }
    );

    if (!project) {
      return next(new HttpError("Project not found", 404));
    }

    res.json({ message: "task is deleted" });
  } catch (err) {
    console.error(err);
    return next(new HttpError("Couldn't delete task", 500));
  }
};

const getTaskFormData = async (req, res, next) => {
  const { studentId } = req.query;
  let projectMembers = [];
  try {
    const project = await Project.findOne({
      memberNames: {
        $elemMatch: {
          id: studentId,
        },
      },
    });

    for (const member of project.memberNames) {
      const student = await Student.findById(member.id, "name");
      if (student) {
        projectMembers.push(student);
      }
    }
    res.send({
      projectMembers: projectMembers.map((m) => m.toObject({ getters: true })),
    });
  } catch (err) {
    return next(new HttpError("Couldn't retrieve form data", 500));
  }
};

module.exports = {
  getTasks,
  createTask,
  completeTask,
  deleteTask,
  getTaskFormData,
};
