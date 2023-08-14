const express = require("express");
const verifyToken = require("../middlewares/verifyToken");

const {
  login,
  updateStudentPassword,
  updateTeacherPassword,
  updateAdminPassword,
} = require("../controllers/authControllers");

const router = express.Router();

router.post("/login", login);
router.put("/student/update-password", verifyToken, updateStudentPassword);
router.put("/teacher/update-password", verifyToken, updateTeacherPassword);
router.put("/admin/update-password", verifyToken, updateAdminPassword);

module.exports = router;
