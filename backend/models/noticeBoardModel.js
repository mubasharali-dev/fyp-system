const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const noticeBoardSchema = new Schema({
  headline: {
    type: String,
    required: true,
    maxlength: 255,
  },
  description: {
    type: String,
    required: true,
  },
  receiverEntity: {
    type: String,
    enum: ["class", "teacher"],
    required: true,
  },
  receiverName: {
    type: String,
    required: true,
    maxlength: 255,
  },
  receiverId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Class" || "Teacher",
  },
});

// noticeBoardSchema.set("toObject", { getters: true });

module.exports = mongoose.model("NoticeBoard", noticeBoardSchema);
