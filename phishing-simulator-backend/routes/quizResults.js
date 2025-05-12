const express = require('express');
const router = express.Router();
const { QuizResult, User, Quiz } = require('../models');

router.get('/', async (req, res) => {
  try {
    const results = await QuizResult.findAll({
      include: [
        {
          model: User,
          as: 'user', // <--- CORRECTED: Changed from 'userAlias' to 'user'
          attributes: ['username']
        },
        {
          model: Quiz,
          as: 'quiz', // <--- CORRECTED: Changed from 'quizAlias' to 'quiz'
          attributes: ['title']
        }
      ],
      order: [['createdAt', 'DESC']] // Assuming 'createdAt' exists on QuizResult
    });

    // Adjust the mapping to use the correct alias paths
    const formatted = results.map(result => ({
      id: result.id,
      user: result.user ? result.user.username : 'Unknown', // <--- CORRECTED: Use result.user
      quizName: result.quiz ? result.quiz.title : 'Unknown', // <--- CORRECTED: Use result.quiz
      score: result.score,
      passed: result.passed,
      dateTaken: result.createdAt // Ensure this field exists and is what you want for "dateTaken"
    }));

    res.json(formatted);
  } catch (err) {
    console.error('Error fetching quiz results:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch quiz results', error: err.message });
  }
});

module.exports = router;