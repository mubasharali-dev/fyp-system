const mongoose = require("mongoose");

const classSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    maxlength: 255,
    unique: true,
  },
  program: {
    type: String,
    enum: ["BSIT", "MSc.IT", "BSCS"],
    required: true,
  },
  session: {
    type: String,
    required: true,
    maxlength: 255,
  },
  shift: {
    type: String,
    enum: ["Mor", "Eve"],
    required: true,
  },
  totalStudents: {
    type: Number,
    max: 150,
    // required: true,
    default: 0,
  },
  totalProjects: {
    type: Number,
    default: 0,
  },
  assignedSupervisors: {
    type: Number,
    max: 30,
    default: 0,
  },
  assignedExaminers: {
    type: Number,
    max: 30,
    default: 0,
  },
  minAllowed: {
    type: Number,
    required: true,
    max: 5,
    default: 0,
  },
  maxAllowed: {
    type: Number,
    required: true,
    max: 10,
    default: 0,
  },
  timetable: {
    titleSubmission: {
      type: Date,
      default: Date.now() + 7 * 24 * 60 * 60 * 1000, // set the default value to 7 days ahead of the current date
    },
    proposalSubmission: {
      type: Date,
      default: Date.now() + 25 * 24 * 60 * 60 * 1000, // set the default value to 25 days ahead of the current date
    },
    proposalDefense: {
      type: Date,
      default: Date.now() + 30 * 24 * 60 * 60 * 1000, // set the default value to 30 days ahead of the current date
    },
    deliverable1: {
      type: Date,
      default: Date.now() + 90 * 24 * 60 * 60 * 1000, // set the default value to 90 days ahead of the current date
    },
    deliverable1Evalutaion: {
      type: Date,
      default: Date.now() + 105 * 24 * 60 * 60 * 1000, // set the default value to 105 days ahead of the current date
    },
    deliverable2: {
      type: Date,
      default: Date.now() + 200 * 24 * 60 * 60 * 1000, // set the default value to 200 days ahead of the current date
    },
    deliverable2Evalutaion: {
      type: Date,
      default: Date.now() + 220 * 24 * 60 * 60 * 1000, // set the default value to 220 days ahead of the current date
    },
  },
});

module.exports = mongoose.model("Class", classSchema);
