const express = require('express');
const router = express.Router();
const { User, QuizResult, Quiz } = require('../models');

// Get user profile
router.get('/:id', async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findByPk(userId, {
      attributes: ['id', 'username', 'role', 'createdAt']
    });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get quiz results for a specific user - simplified to avoid association errors
router.get('/:id/quiz-results', async (req, res) => {
  try {
    const userId = req.params.id;
    
    // First get the quiz results
    const quizResults = await QuizResult.findAll({
      where: { userId: userId }
    });
    
    // Then fetch the quiz titles in a separate query
    const quizIds = [...new Set(quizResults.map(result => result.quizId))];
    const quizzes = await Quiz.findAll({
      where: { id: quizIds },
      attributes: ['id', 'title']
    });
    
    // Map quiz titles to results
    const quizTitles = {};
    quizzes.forEach(quiz => {
      quizTitles[quiz.id] = quiz.title;
    });
    
    // Combine the data
    const resultsWithTitles = quizResults.map(result => {
      const plainResult = result.get({ plain: true });
      return {
        ...plainResult,
        quiz: {
          title: quizTitles[result.quizId] || 'Unknown Quiz'
        }
      };
    });
    
    res.json(resultsWithTitles);
  } catch (error) {
    console.error('Error fetching user quiz results:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;