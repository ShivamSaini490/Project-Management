const mongoose = require('mongoose');

const boardSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Board name is required'],
    trim: true,
    maxlength: [100, 'Board name cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  created_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  columns: [{
    name: {
      type: String,
      required: true,
      enum: ['Todo', 'In Progress', 'Done']
    },
    order: {
      type: Number,
      default: 0
    }
  }]
}, {
  timestamps: true
});

// Index for faster queries
boardSchema.index({ project: 1 });
boardSchema.index({ created_by: 1 });

module.exports = mongoose.model('Board', boardSchema);
