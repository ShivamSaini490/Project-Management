const express = require('express');
const {
  createBoard,
  getBoards,
  createTask,
  getTasks,
  updateTask,
  deleteTask,
  updateTaskPositions,
  getTaskActivity
} = require('../controllers/taskController');
const { protect } = require('../middlewares/auth');
const {
  createTaskValidation,
  updateTaskValidation,
  createBoardValidation
} = require('../validations/task');

const router = express.Router();

// All routes are protected
router.use(protect);

// Board routes
router.post('/boards', createBoardValidation, createBoard);
router.get('/projects/:projectId/boards', getBoards);

// Task routes
router.post('/tasks', createTaskValidation, createTask);
router.get('/boards/:boardId/tasks', getTasks);
router.put('/tasks/:id', updateTaskValidation, updateTask);
router.delete('/tasks/:id', deleteTask);
router.put('/tasks/update-positions', updateTaskPositions);
router.get('/tasks/:id/activity', getTaskActivity);

module.exports = router;
