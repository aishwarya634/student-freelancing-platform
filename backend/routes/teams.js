const express = require('express')
const router = express.Router()
const Team = require('../models/Team')
const authMiddleware = require('../middleware/authMiddleware')

// Create a team
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { name, projectId } = req.body

    const team = new Team({
      name,
      projectId,
      members: [req.user.id]
    })

    await team.save()
    res.status(201).json({ message: 'Team created successfully', team })

  } catch (error) {
    res.status(500).json({ message: 'Server error', error })
  }
})

// Get my team
router.get('/my', authMiddleware, async (req, res) => {
  try {
    const team = await Team.findOne({ members: req.user.id })
      .populate('members', 'name email skills')
      .populate('projectId', 'title description outcome')

    if (!team) {
      return res.status(404).json({ message: 'You are not in any team' })
    }

    res.status(200).json(team)

  } catch (error) {
    res.status(500).json({ message: 'Server error', error })
  }
})

// Join a team
router.post('/join', authMiddleware, async (req, res) => {
  try {
    const { teamId } = req.body

    const team = await Team.findById(teamId)

    if (!team) {
      return res.status(404).json({ message: 'Team not found' })
    }

    if (team.members.includes(req.user.id)) {
      return res.status(400).json({ message: 'You are already in this team' })
    }

    team.members.push(req.user.id)
    await team.save()

    res.status(200).json({ message: 'Joined team successfully', team })

  } catch (error) {
    res.status(500).json({ message: 'Server error', error })
  }
})

module.exports = router