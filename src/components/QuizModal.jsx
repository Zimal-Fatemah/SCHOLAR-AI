import React, { useState, useEffect } from 'react';
import { X, Clock, CheckCircle, XCircle, Award } from 'lucide-react';

const QuizModal = ({ 
  questions = [], 
  onClose, 
  timePerQuestion = 30,
  onComplete 
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(timePerQuestion);
  const [showResults, setShowResults] = useState(false);
  const [answers, setAnswers] = useState([]);

  const currentQuestion = questions[currentQuestionIndex];

  const moveToNext = React.useCallback(() => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setIsAnswered(false);
      setTimeLeft(timePerQuestion);
    } else {
      setShowResults(true);
      if (onComplete) {
        onComplete(score + (selectedAnswer === currentQuestion.correctAnswer ? 1 : 0), questions.length);
      }
    }
  }, [currentQuestionIndex, questions.length, timePerQuestion, onComplete, score, selectedAnswer, currentQuestion.correctAnswer]);

  const handleTimeout = React.useCallback(() => {
    setIsAnswered(true);
    setAnswers(prev => [...prev, { 
      question: currentQuestion.question,
      selected: null,
      correct: currentQuestion.correctAnswer,
      isCorrect: false
    }]);
    
    setTimeout(() => {
      moveToNext();
    }, 2000);
  }, [currentQuestion, moveToNext]);

  useEffect(() => {
    if (showResults || isAnswered) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleTimeout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [currentQuestionIndex, isAnswered, showResults, handleTimeout]);

  const handleAnswerSelect = (optionIndex) => {
    if (isAnswered) return;
    
    setSelectedAnswer(optionIndex);
    setIsAnswered(true);

    const isCorrect = optionIndex === currentQuestion.correctAnswer;
    
    if (isCorrect) {
      setScore(prev => prev + 1);
    }

    setAnswers(prev => [...prev, {
      question: currentQuestion.question,
      selected: currentQuestion.options[optionIndex],
      correct: currentQuestion.options[currentQuestion.correctAnswer],
      isCorrect
    }]);

    setTimeout(() => {
      moveToNext();
    }, 2000);
  };

  const getOptionClass = (index) => {
    if (!isAnswered) {
      return 'bg-gray-50 hover:bg-gray-100 border-gray-200';
    }
    
    if (index === currentQuestion.correctAnswer) {
      return 'bg-green-50 border-green-500 text-green-900';
    }
    
    if (index === selectedAnswer && selectedAnswer !== currentQuestion.correctAnswer) {
      return 'bg-red-50 border-red-500 text-red-900';
    }
    
    return 'bg-gray-50 border-gray-200 opacity-50';
  };

  const percentage = Math.round((score / questions.length) * 100);

  if (questions.length === 0) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl max-w-md w-full p-6">
          <div className="text-center">
            <p className="text-gray-600">No questions available</p>
            <button
              onClick={onClose}
              className="mt-4 px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-bold text-gray-900">Quiz Mode</h2>
            {!showResults && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span className="font-medium">Question {currentQuestionIndex + 1}</span>
                <span className="text-gray-400">/</span>
                <span>{questions.length}</span>
              </div>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {showResults ? (
          <div className="p-8 text-center">
            <div className="mb-6">
              <Award className={`w-20 h-20 mx-auto mb-4 ${
                percentage >= 70 ? 'text-green-500' : percentage >= 50 ? 'text-yellow-500' : 'text-red-500'
              }`} />
              <h3 className="text-3xl font-bold mb-2">Quiz Complete!</h3>
              <p className="text-gray-600">Here's how you performed</p>
            </div>

            <div className="bg-gray-50 rounded-xl p-6 mb-6">
              <div className="text-5xl font-bold mb-2 text-gray-900">
                {score} / {questions.length}
              </div>
              <div className="text-lg text-gray-600">
                {percentage}% Correct
              </div>
            </div>

            <div className="text-left space-y-3 mb-6">
              <h4 className="font-semibold text-gray-900 mb-3">Review Answers:</h4>
              {answers.map((answer, idx) => (
                <div key={idx} className={`p-4 rounded-lg border ${
                  answer.isCorrect ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                }`}>
                  <div className="flex items-start gap-2">
                    {answer.isCorrect ? (
                      <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 mb-1">
                        Q{idx + 1}: {answer.question}
                      </p>
                      {!answer.isCorrect && (
                        <div className="text-xs space-y-1">
                          <p className="text-red-700">
                            Your answer: {answer.selected || 'No answer'}
                          </p>
                          <p className="text-green-700">
                            Correct answer: {answer.correct}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={onClose}
              className="w-full py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
            >
              Close Quiz
            </button>
          </div>
        ) : (
          <div className="p-6">
            <div className="mb-6 flex items-center justify-between">
              <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                timeLeft <= 10 ? 'bg-red-50 text-red-700' : 'bg-gray-50 text-gray-700'
              }`}>
                <Clock className="w-5 h-5" />
                <span className="font-mono font-bold text-lg">{timeLeft}s</span>
              </div>
              <div className="text-sm text-gray-600">
                Score: <span className="font-bold text-gray-900">{score}</span>
              </div>
            </div>

            <div className="mb-8">
              <h3 className="text-2xl font-semibold text-gray-900 mb-6 leading-relaxed">
                {currentQuestion.question}
              </h3>

              <div className="space-y-3">
                {currentQuestion.options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handleAnswerSelect(index)}
                    disabled={isAnswered}
                    className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                      getOptionClass(index)
                    } ${!isAnswered && 'cursor-pointer hover:scale-[1.02]'} ${
                      isAnswered && 'cursor-not-allowed'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex-shrink-0 w-8 h-8 rounded-full bg-white border-2 border-gray-300 flex items-center justify-center font-semibold text-sm">
                        {String.fromCharCode(65 + index)}
                      </span>
                      <span className="flex-1 font-medium">{option}</span>
                      {isAnswered && index === currentQuestion.correctAnswer && (
                        <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
                      )}
                      {isAnswered && index === selectedAnswer && selectedAnswer !== currentQuestion.correctAnswer && (
                        <XCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {isAnswered && (
              <div className={`p-4 rounded-lg ${
                selectedAnswer === currentQuestion.correctAnswer
                  ? 'bg-green-50 text-green-800'
                  : 'bg-red-50 text-red-800'
              }`}>
                {selectedAnswer === currentQuestion.correctAnswer ? (
                  <p className="font-medium">✓ Correct! Great job!</p>
                ) : selectedAnswer === null ? (
                  <p className="font-medium">⏱ Time's up! The correct answer was: {currentQuestion.options[currentQuestion.correctAnswer]}</p>
                ) : (
                  <p className="font-medium">✗ Wrong! The correct answer is: {currentQuestion.options[currentQuestion.correctAnswer]}</p>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizModal;