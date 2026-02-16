const Task = require('../models/Task');
const Board = require('../models/Board');
const Comment = require('../models/Comment');
const { validationResult } = require('express-validator');

// @desc    Create new board
// @route   POST /api/boards
// @access  Private
const createBoard = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { name, description, project } = req.body;

    // Check if user has access to project
    const Project = require('../models/Project');
    const projectDoc = await Project.findById(project);

    if (!projectDoc) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    const isOwner = projectDoc.owner.toString() === req.user._id.toString();
    const isMember = projectDoc.members.some(member =>
      member.user.toString() === req.user._id.toString()
    );

    if (!isOwner && !isMember) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You are not a member of this project.'
      });
    }

    const board = await Board.create({
      name,
      description,
      project,
      created_by: req.user._id,
      columns: [
        { name: 'Todo', order: 0 },
        { name: 'In Progress', order: 1 },
        { name: 'Done', order: 2 }
      ]
    });

    const populatedBoard = await Board.findById(board._id)
      .populate('project', 'name')
      .populate('created_by', 'username email');

    res.status(201).json({
      success: true,
      message: 'Board created successfully',
      data: {
        board: populatedBoard
      }
    });
  } catch (error) {
    console.error('Create board error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error creating board'
    });
  }
};

// @desc    Get boards for project
// @route   GET /api/projects/:projectId/boards
// @access  Private
const getBoards = async (req, res) => {
  try {
    const projectId = req.params.projectId;

    // Check if user has access to project
    const Project = require('../models/Project');
    const projectDoc = await Project.findById(projectId);

    if (!projectDoc) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    const isOwner = projectDoc.owner.toString() === req.user._id.toString();
    const isMember = projectDoc.members.some(member =>
      member.user.toString() === req.user._id.toString()
    );

    if (!isOwner && !isMember) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You are not a member of this project.'
      });
    }

    const boards = await Board.find({ project: projectId, isActive: true })
      .populate('created_by', 'username email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: {
        boards
      }
    });
  } catch (error) {
    console.error('Get boards error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching boards'
    });
  }
};

// @desc    Create new task
// @route   POST /api/tasks
// @access  Private
const createTask = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { title, description, status, priority, due_date, assigned_to, board, project } = req.body;

    // Check if user has access to project
    const Project = require('../models/Project');
    const projectDoc = await Project.findById(project);

    if (!projectDoc) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    const isOwner = projectDoc.owner.toString() === req.user._id.toString();
    const isMember = projectDoc.members.some(member =>
      member.user.toString() === req.user._id.toString()
    );

    if (!isOwner && !isMember) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You are not a member of this project.'
      });
    }

    // Get the highest position in the status column
    const maxPosition = await Task.findOne({
      board,
      status: status || 'Todo'
    }).sort({ position: -1 });

    const task = await Task.create({
      title,
      description,
      status: status || 'Todo',
      priority: priority || 'Medium',
      due_date,
      assigned_to,
      board,
      project,
      created_by: req.user._id,
      position: maxPosition ? maxPosition.position + 1 : 0
    });

    // Add activity
    await task.addActivity('Task created', req.user._id, {
      title,
      status: task.status
    });

    const populatedTask = await Task.findById(task._id)
      .populate('assigned_to', 'username email')
      .populate('board', 'name')
      .populate('project', 'name')
      .populate('created_by', 'username email');

    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      data: {
        task: populatedTask
      }
    });
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error creating task'
    });
  }
};

// @desc    Get tasks for board with filtering and pagination
// @route   GET /api/boards/:boardId/tasks
// @access  Private
const getTasks = async (req, res) => {
  try {
    const boardId = req.params.boardId;
    console.log('getTasks called with boardId:', boardId);
    const {
      page = 0,
      limit = 50,
      status,
      assigned_to,
      priority,
      due_date,
      search,
      sortBy = 'position',
      sortOrder = 'asc'
    } = req.query;

    // Check if user has access to board
    const board = await Board.findById(boardId).populate('project');
    console.log('Found board:', board);
    if (!board) {
      console.log('Board not found for ID:', boardId);
      return res.status(404).json({
        success: false,
        message: 'Board not found'
      });
    }

    const projectDoc = board.project;
    const isOwner = projectDoc.owner.toString() === req.user._id.toString();
    const isMember = projectDoc.members.some(member =>
      member.user.toString() === req.user._id.toString()
    );

    if (!isOwner && !isMember) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You are not a member of this project.'
      });
    }

    // Build query
    const query = { board: boardId };

    if (status) query.status = status;
    if (assigned_to) query.assigned_to = assigned_to;
    if (priority) query.priority = priority;
    if (due_date) {
      const date = new Date(due_date);
      query.due_date = {
        $gte: date.setHours(0, 0, 0, 0),
        $lt: date.setHours(23, 59, 59, 999)
      };
    }

    if (search) {
      query.$text = { $search: search };
    }

    // Sort options
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const skip = parseInt(page) * parseInt(limit);

    const tasks = await Task.find(query)
      .populate('assigned_to', 'username email')
      .populate('board', 'name')
      .populate('project', 'name')
      .populate('created_by', 'username email')
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Task.countDocuments(query);

    console.log('Found tasks:', tasks.length);
    console.log('Query:', query);

    res.json({
      success: true,
      data: {
        tasks,
        board,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching tasks'
    });
  }
};

// @desc    Update task
// @route   PUT /api/tasks/:id
// @access  Private
const updateTask = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    // Check if user has access to project
    const Project = require('../models/Project');
    const projectDoc = await Project.findById(task.project);

    const isOwner = projectDoc.owner.toString() === req.user._id.toString();
    const isMember = projectDoc.members.some(member =>
      member.user.toString() === req.user._id.toString()
    );

    if (!isOwner && !isMember) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You are not a member of this project.'
      });
    }

    const updates = req.body;
    const oldValues = {};

    // Track changes for activity log
    if (updates.status && updates.status !== task.status) {
      oldValues.oldStatus = task.status;
      oldValues.newStatus = updates.status;
    }

    if (updates.assigned_to && updates.assigned_to !== task.assigned_to?.toString()) {
      oldValues.oldAssigned = task.assigned_to;
      oldValues.newAssigned = updates.assigned_to;
    }

    if (updates.priority && updates.priority !== task.priority) {
      oldValues.oldPriority = task.priority;
      oldValues.newPriority = updates.priority;
    }

    const updatedTask = await Task.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    )
    .populate('assigned_to', 'username email')
    .populate('board', 'name')
    .populate('project', 'name')
    .populate('created_by', 'username email');

    // Add activity for significant changes
    if (Object.keys(oldValues).length > 0) {
      await updatedTask.addActivity('Task updated', req.user._id, oldValues);
    }

    res.json({
      success: true,
      message: 'Task updated successfully',
      data: {
        task: updatedTask
      }
    });
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating task'
    });
  }
};

// @desc    Delete task
// @route   DELETE /api/tasks/:id
// @access  Private
const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    // Check if user has access to project
    const Project = require('../models/Project');
    const projectDoc = await Project.findById(task.project);

    const isOwner = projectDoc.owner.toString() === req.user._id.toString();
    const isMember = projectDoc.members.some(member =>
      member.user.toString() === req.user._id.toString()
    );

    if (!isOwner && !isMember) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You are not a member of this project.'
      });
    }

    await Task.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Task deleted successfully'
    });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting task'
    });
  }
};

// @desc    Update task positions (for drag and drop)
// @route   PUT /api/tasks/update-positions
// @access  Private
const updateTaskPositions = async (req, res) => {
  try {
    const { tasks } = req.body; // Array of { id, status, position }

    if (!Array.isArray(tasks) || tasks.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Tasks array is required'
      });
    }

    // Get first task to check project access
    const firstTask = await Task.findById(tasks[0].id);
    if (!firstTask) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    // Check if user has access to project
    const Project = require('../models/Project');
    const projectDoc = await Project.findById(firstTask.project);

    const isOwner = projectDoc.owner.toString() === req.user._id.toString();
    const isMember = projectDoc.members.some(member =>
      member.user.toString() === req.user._id.toString()
    );

    if (!isOwner && !isMember) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You are not a member of this project.'
      });
    }

    // Update all tasks in bulk
    const bulkOps = tasks.map(task => ({
      updateOne: {
        filter: { _id: task.id },
        update: {
          status: task.status,
          position: task.position
        }
      }
    }));

    await Task.bulkWrite(bulkOps);

    res.json({
      success: true,
      message: 'Task positions updated successfully'
    });
  } catch (error) {
    console.error('Update task positions error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating task positions'
    });
  }
};

// @desc    Get task activity
// @route   GET /api/tasks/:id/activity
// @access  Private
const getTaskActivity = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('activity.performed_by', 'username email');

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    // Check if user has access to project
    const Project = require('../models/Project');
    const projectDoc = await Project.findById(task.project);

    const isOwner = projectDoc.owner.toString() === req.user._id.toString();
    const isMember = projectDoc.members.some(member =>
      member.user.toString() === req.user._id.toString()
    );

    if (!isOwner && !isMember) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You are not a member of this project.'
      });
    }

    res.json({
      success: true,
      data: {
        activity: task.activity.sort((a, b) => b.timestamp - a.timestamp)
      }
    });
  } catch (error) {
    console.error('Get task activity error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching task activity'
    });
  }
};

module.exports = {
  createBoard,
  getBoards,
  createTask,
  getTasks,
  updateTask,
  deleteTask,
  updateTaskPositions,
  getTaskActivity
};
