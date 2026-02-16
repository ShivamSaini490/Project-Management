const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Task title is required'],
    trim: true,
    maxlength: [200, 'Task title cannot exceed 200 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  status: {
    type: String,
    enum: ['Todo', 'In Progress', 'Done'],
    default: 'Todo'
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High'],
    default: 'Medium'
  },
  due_date: {
    type: Date
  },
  assigned_to: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  board: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Board',
    required: true
  },
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  created_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  position: {
    type: Number,
    default: 0
  },
  labels: [{
    name: {
      type: String,
      required: true
    },
    color: {
      type: String,
      default: '#007bff'
    }
  }],
  attachments: [{
    filename: String,
    url: String,
    size: Number,
    uploaded_at: {
      type: Date,
      default: Date.now
    }
  }],
  activity: [{
    action: {
      type: String,
      required: true
    },
    performed_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    details: mongoose.Schema.Types.Mixed
  }]
}, {
  timestamps: true
});

// Index for faster queries
taskSchema.index({ board: 1 });
taskSchema.index({ project: 1 });
taskSchema.index({ assigned_to: 1 });
taskSchema.index({ status: 1 });
taskSchema.index({ priority: 1 });
taskSchema.index({ due_date: 1 });

// Text index for search functionality
taskSchema.index({
  title: 'text',
  description: 'text'
});

// Add activity method
taskSchema.methods.addActivity = function(action, performedBy, details = {}) {
  this.activity.push({
    action,
    performed_by: performedBy,
    details
  });
  return this.save();
};

module.exports = mongoose.model('Task', taskSchema);
