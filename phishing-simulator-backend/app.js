const phishingRoutes = require('./routes/phishing');
app.use('/api/phishing', phishingRoutes);

const quizResultsRouter = require('./routes/quizResults');
app.use('/api/quiz-results', quizResultsRouter);
