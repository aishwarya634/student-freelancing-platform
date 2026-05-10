const express = require('express')
const router = express.Router()
const Project = require('../models/Project')
const authMiddleware = require('../middleware/authMiddleware')

// Create a project (client only)
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { title, description, outcome, skills, budget, type } = req.body

    if (req.user.role !== 'client') {
      return res.status(403).json({ message: 'Only clients can post projects' })
    }

    const project = new Project({
      title,
      description,
      outcome,
      skills,
      budget,
      type,
      clientId: req.user.id
    })

    await project.save()
    res.status(201).json({ message: 'Project created successfully', project })

  } catch (error) {
    res.status(500).json({ message: 'Server error', error })
  }
})

// Get all open projects
router.get('/', authMiddleware, async (req, res) => {
  try {
    const projects = await Project.find({ status: 'open' })
    res.status(200).json(projects)

  } catch (error) {
    res.status(500).json({ message: 'Server error', error })
  }
})

module.exports = router