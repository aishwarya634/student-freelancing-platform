const mongoose = require('mongoose')

const ProjectSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  outcome: {
    type: String,
    required: true
  },
  skills: [String],
  budget: {
    type: Number,
    required: true
  },
  type: {
    type: String,
    enum: ['solo', 'team'],
    required: true
  },
  status: {
    type: String,
    enum: ['open', 'in-progress', 'review', 'done'],
    default: 'open'
  },
  clientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  assignedTo: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  ],
  createdAt: {
    type: Date,
    default: Date.now
  }
})

module.exports = mongoose.model('Project', ProjectSchema)