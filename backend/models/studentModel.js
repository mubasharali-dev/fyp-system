const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema({
  password: {
    type: String,
    required: true,
  },
  salt: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
    maxlength: 255,
  },
  rollNo: {
    type: String,
    unique: true,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  classId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Class",
    required: true,
  },
  assignedProjectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Project",
  },
  cgpa: {
    type: Number,
    default: 0,
    required: true,
  },
  marks: {
    type: Number,
    default: 0,
  },
  status: {
    type: String,
    enum: ["Pending", "Failed", "Passed"],
    default: "Pending",
  },
  hasTopped: {
    type: Boolean,
    default: false,
  },
  notes: {
    type: [
      {
        note: {
          type: String,
          required: true,
        },
      },
    ],
  },
});

module.exports = mongoose.model("Student", studentSchema);
