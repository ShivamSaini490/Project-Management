const express = require('express');
const {
  createComment,
  getComments,
  updateComment,
  deleteComment
} = require('../controllers/commentController');
const { protect } = require('../middlewares/auth');
const {
  createCommentValidation
} = require('../validations/task');

const router = express.Router();

// All routes are protected
router.use(protect);

// Comment routes
router.post('/', createCommentValidation, createComment);
router.get('/tasks/:taskId/comments', getComments);
router.put('/:id', updateComment);
router.delete('/:id', deleteComment);

module.exports = router;
