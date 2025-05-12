const express = require('express');
const router = express.Router();
const { User, QuizResult, Quiz } = require('../models');

// Get user profile
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: ['id', 'username', 'email', 'role', 'createdAt']
    });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get quiz results for a specific user
router.get('/:id/quiz-results', async (req, res) => {
  try {
    const quizResults = await QuizResult.findAll({
      where: { userId: req.params.id }
    });
    const quizIds = [...new Set(quizResults.map(result => result.quizId))];
    const quizzes = await Quiz.findAll({
      where: { id: quizIds },
      attributes: ['id', 'title']
    });
    const quizTitles = {};
    quizzes.forEach(quiz => {
      quizTitles[quiz.id] = quiz.title;
    });
    const resultsWithTitles = quizResults.map(result => ({
      ...result.get({ plain: true }),
      quiz: { title: quizTitles[result.quizId] || 'Unknown Quiz' }
    }));
    res.json(resultsWithTitles);
  } catch (error) {
    console.error('Error fetching user quiz results:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all users
router.get('/', async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ['id', 'username', 'email', 'lastLogin', 'role']
    });
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update user role
router.put('/:id/role', async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    await user.update({ role: req.body.role });
    res.json({ message: 'User role updated successfully' });
  } catch (error) {
    console.error('Error updating user role:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;