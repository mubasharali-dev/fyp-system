const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema({
  startDate: { type: Date, required: true },
  endDate: { type: Date },
  deadline: { type: Date, required: true },
  assignedToName: { type: String, required: true, maxlength: 255 },
  assignedToId: { type: mongoose.Schema.Types.ObjectId, required: true },
  title: { type: String, required: true, maxlength: 255 },
  phase: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    default: "In Progress",
  },
});

const projectSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    maxlength: 255,
  },
  memberNames: [
    {
      name: {
        type: String,
        required: true,
        maxlength: 255,
      },
      id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Student",
        required: true,
      },
    },
  ],
  members: {
    type: Number,
    min: 1,
  },
  supervisorName: {
    type: String,
    required: true,
    maxlength: 255,
  },
  supervisorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Teacher",
    required: true,
  },
  classId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Class",
    required: true,
  },
  className: {
    type: String,
    required: true,
    maxlength: 255,
  },
  status: {
    type: String,
    enum: ["in_progress", "completed", "passed", "failed"],
    default: "in_progress",
  },
  submissions: [
    {
      type: String,
      maxlength: 255,
    },
  ],
  description: {
    type: String,
    default: "",
  },
  tasks: [taskSchema],
});

projectSchema.path("memberNames").set(function (memberNames) {
  this.members = memberNames.length;
  return memberNames;
});

taskSchema.pre("save", function (next) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (this.endDate) {
    this.status = "Completed";
  } else if (new Date(this.deadline) < today) {
    this.status = "Late";
  } else if (new Date(this.startDate) > today) {
    this.status = "Not Started";
  } else if (
    new Date(this.startDate) <= today &&
    today < new Date(this.deadline)
  ) {
    this.status = "In Progress";
  }
  next();
});

module.exports = mongoose.model("Project", projectSchema);
