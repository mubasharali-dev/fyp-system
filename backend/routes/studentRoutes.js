const express = require("express");
const { body } = require("express-validator");

const { getDashboard } = require("../controllers/student/dashboardControllers");

const {
  getProjectPage,
  editProjectDescription,
} = require("../controllers/student/projectControllers");

const {
  getTasks,
  createTask,
  completeTask,
  deleteTask,
  getTaskFormData,
} = require("../controllers/student/taskControllers");

const {
  getNotes,
  createNote,
  deleteNote,
} = require("../controllers/student/notesControllers");

const router = express.Router();

// Routes assigned here.

// DASHBOARD ROUTE
router.get("/dashboard", getDashboard);

// MY PROJECT ROUTES
router.get("/project", getProjectPage);
router.patch("/project/:projectId/edit", editProjectDescription);

// PROJECT MANAGEMENT ROUTES
router.get("/tasks", getTasks);
router.patch("/tasks/new-task", createTask);
router.get("/tasks/form-data", getTaskFormData);
router.patch("/tasks/:taskId/complete", completeTask);
router.delete("/tasks/:taskId/delete", deleteTask);

// NOTES ROUTES
router.get("/personal-notes", getNotes);
router.post("/personal-notes/new-note", createNote);
router.delete("/personal-notes/:noteId/delete", deleteNote);

module.exports = router;
