const express = require('express');
const {
  createProject,
  getProjects,
  getProject,
  updateProject,
  deleteProject,
  inviteMember,
  removeMember
} = require('../controllers/projectController');
const { protect } = require('../middlewares/auth');
const {
  createProjectValidation,
  updateProjectValidation,
  inviteMemberValidation
} = require('../validations/project');

const router = express.Router();

// All routes are protected
router.use(protect);

// Project routes
router.post('/', createProjectValidation, createProject);
router.get('/', getProjects);
router.get('/:id', getProject);
router.put('/:id', updateProjectValidation, updateProject);
router.delete('/:id', deleteProject);

// Member management routes
router.post('/:id/invite', inviteMemberValidation, inviteMember);
router.delete('/:id/members/:memberId', removeMember);

module.exports = router;
