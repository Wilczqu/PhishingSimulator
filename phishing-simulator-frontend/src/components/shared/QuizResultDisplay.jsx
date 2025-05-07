import React from 'react';
import { Link } from 'react-router-dom';
import { Card, Badge } from 'react-bootstrap';

const QuizResultDisplay = ({ score, total, resultText, showLink = true }) => {
  return (
    <Card className="mb-3">
      <Card.Body className="text-center">
        <h4 className="mb-3">Quiz Results</h4>
        <p>You answered <strong>{score}</strong> out of <strong>{total}</strong> questions correctly.</p>
        <h5>
          <Badge bg={resultText === "passed" ? "success" : "danger"}>
            {resultText === "passed" ? "PASSED" : "FAILED"}
          </Badge>
        </h5>
        {showLink && <Link to="/quizzes" className="btn btn-primary mt-3">Take Another Quiz</Link>}
      </Card.Body>
    </Card>
  );
};

export default QuizResultDisplay;