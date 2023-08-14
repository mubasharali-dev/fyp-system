const express = require("express");
const { body } = require("express-validator");

const {
  getDashboard,
  updateLimit,
  getSupervisionProjects,
  getExaminationProjects,
} = require("../controllers/teacher/dashboardControllers");

// const {
// } = require("../controllers/teacher/projectControllers");

const {
  getNotes,
  createNote,
  deleteNote,
} = require("../controllers/teacher/notesControllers");

const {
  getNotifications,
  createNotification,
  deleteNotification,
} = require("../controllers/teacher/notificationsControllers");

const router = express.Router();

// Routes assigned here.

// DASHBOARD ROUTE
router.get("/dashboard", getDashboard);
router.patch("/dashboard/projects-limit", updateLimit);

router.get("/supervision-projects", getSupervisionProjects);
router.get("/examination-projects", getExaminationProjects);

// MY PROJECT ROUTES
// router.get("/projects", getProjectPage);
// router.patch("/project/:projectId/edit", editProjectDescription);

// NOTES ROUTES
router.get("/personal-notes", getNotes);
router.post("/personal-notes/new-note", createNote);
router.delete("/personal-notes/:noteId/delete", deleteNote);

// NOTIFICATIONS ROUTES
router.get("/notifications", getNotifications);
router.post("/notifications/new-notification", createNotification);
router.delete("/notifications/:notificationId/delete", deleteNotification);

module.exports = router;
