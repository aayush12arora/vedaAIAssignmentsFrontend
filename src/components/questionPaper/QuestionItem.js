import React, { useState } from 'react';
import { RefreshCw, Eye, EyeOff, CheckCircle } from 'lucide-react';
import { Badge, Button } from '../common';
import './QuestionItem.css';

const QuestionItem = ({ 
  question, 
  questionNumber, 
  sectionIndex, 
  questionIndex, 
  onRegenerate 
}) => {
  const [showAnswer, setShowAnswer] = useState(false);

  const getDifficultyBadge = (difficulty) => {
    const variants = {
      easy: 'success',
      medium: 'warning',
      hard: 'danger'
    };
    return variants[difficulty] || 'secondary';
  };

  const resolveTrueFalseAnswer = () => {
    const raw = question.correctAnswer ?? question.answer;

    if (typeof raw === 'boolean') {
      return raw;
    }

    if (typeof raw === 'number') {
      if (raw === 1) return true;
      if (raw === 0) return false;
    }

    if (typeof raw === 'string') {
      const normalized = raw.trim().toLowerCase();
      if (['true', 't', 'yes', 'a', '1'].includes(normalized)) return true;
      if (['false', 'f', 'no', 'b', '0'].includes(normalized)) return false;
    }

    return null;
  };

  const renderQuestionContent = () => {
    switch (question.type) {
      case 'mcq':
        const correctOption = typeof question.correctAnswer === 'string'
          ? question.options?.[question.correctAnswer.charCodeAt(0) - 65] || question.correctAnswer
          : question.correctAnswer;

        return (
          <div className="mcq-options">
            {question.options?.map((option, index) => (
              <div 
                key={index} 
                className={`mcq-option ${showAnswer && option === correctOption ? 'correct' : ''}`}
              >
                <span className="option-letter">
                  {String.fromCharCode(65 + index)}
                </span>
                <span className="option-text">{option}</span>
                {showAnswer && option === correctOption && (
                  <CheckCircle size={16} className="correct-icon" />
                )}
              </div>
            ))}
          </div>
        );

      case 'true-false': {
        const trueFalseAnswer = resolveTrueFalseAnswer();
        return (
          <div className="true-false-options">
            <div className={`tf-option ${showAnswer && trueFalseAnswer === true ? 'correct' : ''}`}>
              <span>True</span>
              {showAnswer && trueFalseAnswer === true && (
                <CheckCircle size={16} className="correct-icon" />
              )}
            </div>
            <div className={`tf-option ${showAnswer && trueFalseAnswer === false ? 'correct' : ''}`}>
              <span>False</span>
              {showAnswer && trueFalseAnswer === false && (
                <CheckCircle size={16} className="correct-icon" />
              )}
            </div>
          </div>
        );
      }

      case 'fill-blanks':
        return (
          <div className="fill-blanks">
            {question.blanks?.map((blank, index) => (
              <div key={index} className="blank-item">
                <span className="blank-label">Blank {index + 1}:</span>
                {showAnswer ? (
                  <span className="blank-answer">{blank}</span>
                ) : (
                  <span className="blank-placeholder">____________</span>
                )}
              </div>
            ))}
          </div>
        );

      case 'short-answer':
      case 'long-answer':
      case 'numerical':
      case 'diagram':
        return (
          <div className="text-answer">
            {showAnswer && question.answer && (
              <div className="sample-answer">
                <span className="answer-label">Answer:</span>
                <p className="answer-text">{question.answer}</p>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="question-item">
      <div className="question-header">
        <span className="question-number">Q{questionNumber}.</span>
        <div className="question-meta">
          <Badge variant={getDifficultyBadge(question.difficulty)} size="small">
            {question.difficulty}
          </Badge>
          <span className="question-marks">{question.marks} marks</span>
        </div>
      </div>

      <div className="question-body">
        <p className="question-text">{question.questionText || question.text}</p>
        {renderQuestionContent()}
      </div>

      {question.explanation && showAnswer && (
        <div className="question-explanation">
          <span className="explanation-label">Explanation:</span>
          <p>{question.explanation}</p>
        </div>
      )}

      <div className="question-actions">
        <Button
          variant="ghost"
          size="small"
          onClick={() => setShowAnswer(!showAnswer)}
        >
          {showAnswer ? (
            <>
              <EyeOff size={14} />
              Hide Answer
            </>
          ) : (
            <>
              <Eye size={14} />
              Show Answer
            </>
          )}
        </Button>
        <Button
          variant="ghost"
          size="small"
          onClick={() => onRegenerate(sectionIndex, questionIndex)}
        >
          <RefreshCw size={14} />
          Regenerate
        </Button>
      </div>
    </div>
  );
};

export default QuestionItem;
