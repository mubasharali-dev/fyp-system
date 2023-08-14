const mongoose = require("mongoose");

const teacherSchema = new mongoose.Schema({
  password: {
    type: String,
    required: true,
  },
  salt: {
    type: String,
    required: true,
  },
  _id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  name: {
    type: String,
    required: true,
    maxlength: 255,
  },
  empId: {
    type: String,
    unique: true,
    required: true,
  },
  designation: {
    type: String,
    maxlength: 255,
  },
  image: {
    type: String,
    required: true,
  },
  assignedProjectsCount: {
    type: Number,
    default: 0,
    max: 50,
    validate: {
      validator: function (value) {
        return value <= this.projectsLimit;
      },
      message: "assignedProjectsCount should be smaller than projectsLimit",
    },
  },
  projectsLimit: {
    type: Number,
    default: 10,
    max: 50,
  },
  assignedProjects: {
    type: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Project",
      },
    ],
    default: [],
    validate: {
      validator: function (value) {
        return value.length <= this.projectsLimit;
      },
      message: "assignedProjects limit is up, can't add!",
    },
    set: function (value) {
      this.undertakenForSupervision = value.length;
      return value;
    },
  },
  assignedClassesForSupervision: {
    type: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Class",
      },
    ],
    default: [],
  },
  assignedClassesForExamination: {
    type: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Class",
      },
    ],
    default: [],
  },
  notes: {
    type: [
      {
        note: String,
      },
    ],
  },
});

module.exports = mongoose.model("Teacher", teacherSchema);
