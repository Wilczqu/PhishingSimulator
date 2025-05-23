const express = require('express');
const router = express.Router();
const { Quiz, QuizResult, User } = require('../models');

// Get all quizzes
router.get('/', async (req, res) => {
  try {
    const quizzes = await Quiz.findAll({
      attributes: ['id', 'title', 'questions', 'active']
    });
    res.json(quizzes);
  } catch (err) {
    console.error('Error fetching quizzes:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch quizzes' });
  }
});

// Get specific quiz by ID
router.get('/:id', async (req, res) => {
  try {
    const quiz = await Quiz.findByPk(req.params.id);
    if (!quiz) {
      return res.status(404).json({ success: false, message: 'Quiz not found' });
    }
    res.json(quiz);
  } catch (err) {
    console.error('Error fetching quiz:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch quiz' });
  }
});

// Submit quiz results
router.post('/:id/submit', async (req, res) => {
  try {
    const { userId, score, totalQuestions, passed, answers } = req.body;
    
    // Create quiz result
    const quizResult = await QuizResult.create({
      userId,
      quizId: req.params.id,
      score,
      totalQuestions,
      passed,
      answers,
      completedAt: new Date()
    });
    
    res.status(201).json({ success: true, result: quizResult });
  } catch (err) {
    console.error('Error submitting quiz result:', err);
    res.status(500).json({ success: false, message: 'Failed to submit quiz result' });
  }
});

// Get all quiz results (for admin dashboard)
router.get('/results/all', async (req, res) => {
  try {
    const results = await QuizResult.findAll({
      include: [
        { model: User, as: 'user', attributes: ['username'] },  // Added 'as: user'
        { model: Quiz, as: 'quiz', attributes: ['title'] }      // Added 'as: quiz'
      ],
      order: [['createdAt', 'DESC']]
    });

    const formatted = results.map(result => ({
      id: result.id,
      user: result.user ? result.user.username : 'Unknown',
      quizName: result.quiz ? result.quiz.title : 'Unknown',
      score: result.score,
      passed: result.passed,
      dateTaken: result.createdAt
    }));

    res.json(formatted);
  } catch (err) {
    console.error('Error fetching quiz results:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch quiz results' });
  }
});

// Get quiz statistics (for Admin)
router.get('/stats', async (req, res) => {
  try {
    const totalAttempts = await QuizResult.count();
    const passCount = await QuizResult.count({ where: { passed: true } });
    const failCount = await QuizResult.count({ where: { passed: false } });
    
    res.json({
      totalAttempts,
      passCount,
      failCount
    });
  } catch (err) {
    console.error('Error fetching quiz stats:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch quiz statistics' });
  }
});

module.exports = router;