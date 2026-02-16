const Comment = require('../models/Comment');
const Task = require('../models/Task');
const { validationResult } = require('express-validator');

// @desc    Create new comment
// @route   POST /api/comments
// @access  Private
const createComment = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { content, task, parent_comment } = req.body;

    // Check if task exists and user has access
    const taskDoc = await Task.findById(task).populate('project');
    if (!taskDoc) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    // Check if user has access to project
    const Project = require('../models/Project');
    const projectDoc = await Project.findById(taskDoc.project._id);
    
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

    // If parent_comment is provided, check if it exists
    if (parent_comment) {
      const parentComment = await Comment.findById(parent_comment);
      if (!parentComment) {
        return res.status(404).json({
          success: false,
          message: 'Parent comment not found'
        });
      }

      if (parentComment.task.toString() !== task) {
        return res.status(400).json({
          success: false,
          message: 'Parent comment does not belong to this task'
        });
      }
    }

    const comment = await Comment.create({
      content,
      task,
      author: req.user._id,
      parent_comment
    });

    const populatedComment = await Comment.findById(comment._id)
      .populate('author', 'username email')
      .populate('parent_comment', 'content author');

    // Add activity to task
    await taskDoc.addActivity('Comment added', req.user._id, {
      commentId: comment._id,
      isReply: !!parent_comment
    });

    res.status(201).json({
      success: true,
      message: 'Comment created successfully',
      data: {
        comment: populatedComment
      }
    });
  } catch (error) {
    console.error('Create comment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error creating comment'
    });
  }
};

// @desc    Get comments for task
// @route   GET /api/tasks/:taskId/comments
// @access  Private
const getComments = async (req, res) => {
  try {
    const taskId = req.params.taskId;
    const page = parseInt(req.query.page) || 0;
    const limit = parseInt(req.query.limit) || 20;
    const skip = page * limit;

    // Check if task exists and user has access
    const taskDoc = await Task.findById(taskId).populate('project');
    if (!taskDoc) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    // Check if user has access to project
    const Project = require('../models/Project');
    const projectDoc = await Project.findById(taskDoc.project._id);
    
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

    // Get top-level comments (no parent)
    const comments = await Comment.find({ 
      task: taskId, 
      parent_comment: null 
    })
    .populate('author', 'username email')
    .populate({
      path: 'parent_comment',
      populate: {
        path: 'author',
        select: 'username email'
      }
    })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

    // Get replies for each comment
    const commentsWithReplies = await Promise.all(
      comments.map(async (comment) => {
        const replies = await Comment.find({ parent_comment: comment._id })
          .populate('author', 'username email')
          .sort({ createdAt: 1 });

        return {
          ...comment.toObject(),
          replies
        };
      })
    );

    const total = await Comment.countDocuments({ 
      task: taskId, 
      parent_comment: null 
    });

    res.json({
      success: true,
      data: {
        comments: commentsWithReplies,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get comments error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching comments'
    });
  }
};

// @desc    Update comment
// @route   PUT /api/comments/:id
// @access  Private
const updateComment = async (req, res) => {
  try {
    const { content } = req.body;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Comment content is required'
      });
    }

    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }

    // Check if user is the author
    if (comment.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only edit your own comments.'
      });
    }

    // Update comment
    comment.content = content.trim();
    comment.isEdited = true;
    comment.editedAt = new Date();
    await comment.save();

    const populatedComment = await Comment.findById(comment._id)
      .populate('author', 'username email')
      .populate('parent_comment', 'content author');

    res.json({
      success: true,
      message: 'Comment updated successfully',
      data: {
        comment: populatedComment
      }
    });
  } catch (error) {
    console.error('Update comment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating comment'
    });
  }
};

// @desc    Delete comment
// @route   DELETE /api/comments/:id
// @access  Private
const deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }

    // Check if user has access to project
    const taskDoc = await Task.findById(comment.task).populate('project');
    const Project = require('../models/Project');
    const projectDoc = await Project.findById(taskDoc.project._id);
    
    const isOwner = projectDoc.owner.toString() === req.user._id.toString();
    const isAuthor = comment.author.toString() === req.user._id.toString();
    const isMember = projectDoc.members.some(member => 
      member.user.toString() === req.user._id.toString()
    );

    if (!isOwner && !isAuthor && !isMember) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only delete your own comments or project owners can delete any comment.'
      });
    }

    // Delete all replies if this is a parent comment
    if (!comment.parent_comment) {
      await Comment.deleteMany({ parent_comment: comment._id });
    }

    await Comment.findByIdAndDelete(comment._id);

    res.json({
      success: true,
      message: 'Comment deleted successfully'
    });
  } catch (error) {
    console.error('Delete comment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting comment'
    });
  }
};

module.exports = {
  createComment,
  getComments,
  updateComment,
  deleteComment
};
