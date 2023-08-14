const dotenv = require("dotenv");
const fs = require("fs");
const path = require("path");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const HttpError = require("../models/HttpError");

const Student = require("../models/studentModel");
const Teacher = require("../models/teacherModel");

const login = async (req, res, next) => {
  const { userID, loginAs, password } = req.body;

  if (!loginAs || !password || !userID) {
    return next(new HttpError("Please provide a username and password", 400));
  }

  const findUserByLoginAs = async (loginAs, identifier, value) => {
    let user = null;
    let idField = null;

    switch (loginAs) {
      case "Student":
        user = await Student.findOne({ [identifier]: value });
        idField = "_id";
        break;
      case "Teacher":
        user = await Teacher.findOne({ [identifier]: value });
        idField = "_id";
        break;
      default:
        return null;
    }

    return { user, idField };
  };

  try {
    if (loginAs === "Admin") {
      const user = process.env.ADMIN_ID === userID;
      if (!user) {
        return next(new HttpError("Invalid username or password", 401));
      }

      const isValidPassword = process.env.ADMIN_PASSWORD === password;
      if (!isValidPassword) {
        return next(new HttpError("Invalid username or password", 401));
      }

      const token = jwt.sign({ _id: userID }, process.env.JWT_SECRET, {
        expiresIn: "2h",
      });
      return res.status(200).json({
        userId: userID,
        token,
        message: "Logged in successfully",
        userName: "Admin",
      });
    }

    const { user, idField } = await findUserByLoginAs(
      loginAs,
      loginAs === "Student" ? "rollNo" : "empId",
      userID
    );

    if (!user) {
      return next(new HttpError("Invalid username or password", 401));
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return next(new HttpError("Invalid username or password", 401));
    }

    const token = jwt.sign({ _id: user[idField] }, process.env.JWT_SECRET, {
      expiresIn: "2h",
    });

    return res.status(200).json({
      userId: user[idField],
      token,
      userName: user.name,
      message: "Logged in successfully",
    });
  } catch (error) {
    console.log(error);
    return next(new HttpError("Can't login due to server error", 500));
  }
};

const updatePassword = async (req, res, next, Model) => {
  const { newPassword, oldPassword, confirmPassword, userId } = req.body;

  try {
    if (!newPassword || !oldPassword || !confirmPassword) {
      return next(new HttpError("Complete all inputs", 400));
    }

    if (newPassword !== confirmPassword) {
      return next(new HttpError("Passwords not the same", 400));
    }

    const userFound = await Model.findById(userId);

    if (!userFound) {
      return res.status(404).json({ error: "User not found" });
    }

    const isValidPassword = await bcrypt.compare(
      oldPassword,
      userFound.password
    );
    if (!isValidPassword) {
      return next(new HttpError("Invalid old password", 400));
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    await Model.findByIdAndUpdate(
      userId,
      { password: hashedPassword },
      { new: true }
    );

    res.status(200).json({ message: "Password updated" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const updateAdminPassword = async (req, res, next) => {
  const { newPassword, oldPassword, confirmPassword, userId } = req.body;

  try {
    if (!newPassword || !oldPassword || !confirmPassword) {
      return next(new HttpError("Complete all inputs", 400));
    }

    if (newPassword !== confirmPassword) {
      return next(new HttpError("New passwords not same", 400));
    }

    if (process.env.ADMIN_ID !== userId) {
      return next(new HttpError("User doesn't exist", 400));
    }

    // Read the contents of the .env file
    const envPath = path.resolve(".env");
    const envContents = fs.readFileSync(envPath, "utf8");

    // Update the value of the ADMIN_PASSWORD variable
    const updatedEnvContents = envContents.replace(
      /^ADMIN_PASSWORD=.*/m,
      `ADMIN_PASSWORD=${newPassword}`
    );

    // Write the updated contents back to the .env file
    fs.writeFileSync(envPath, updatedEnvContents);

    res.status(200).json({ message: "Password updated" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = {
  login,
  updateStudentPassword: (req, res, next) =>
    updatePassword(req, res, next, Student),
  updateTeacherPassword: (req, res, next) =>
    updatePassword(req, res, next, Teacher),
  updateAdminPassword,
};
