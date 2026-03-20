import React, { useState } from 'react';
import { ChevronDown, ChevronUp, RefreshCw } from 'lucide-react';
import { Card, Badge, Button } from '../common';
import QuestionItem from './QuestionItem';
import './Section.css';

const Section = ({ section, sectionIndex, onRegenerate }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const getQuestionTypeBadge = (type) => {
    const variants = {
      mcq: 'primary',
      'short-answer': 'secondary',
      'long-answer': 'warning',
      'true-false': 'success',
      'fill-blanks': 'info',
      numerical: 'warning',
      diagram: 'secondary'
    };
    return variants[type] || 'secondary';
  };

  const formatQuestionType = (type) => {
    const labels = {
      mcq: 'Multiple Choice',
      'short-answer': 'Short Answer',
      'long-answer': 'Long Answer',
      'true-false': 'True/False',
      'fill-blanks': 'Fill in the Blanks',
      numerical: 'Numerical',
      diagram: 'Diagram Based'
    };
    return labels[type] || type;
  };

  const getSectionMarks = () => {
    return section.questions.reduce((total, q) => total + (q.marks || 0), 0);
  };

  return (
    <Card className="section-card">
      <div 
        className="section-header"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="section-header-left">
          <span className="section-number">Section {sectionIndex + 1}</span>
          <Badge variant={getQuestionTypeBadge(section.type)}>
            {formatQuestionType(section.type)}
          </Badge>
        </div>
        <div className="section-header-right">
          <span className="section-stats">
            {section.questions.length} questions • {getSectionMarks()} marks
          </span>
          <button className="section-toggle">
            {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="section-content">
          {section.instructions && (
            <p className="section-instructions">{section.instructions}</p>
          )}
          
          <div className="questions-list">
            {section.questions.map((question, questionIndex) => (
              <QuestionItem
                key={questionIndex}
                question={question}
                questionNumber={
                  // Calculate overall question number
                  questionIndex + 1
                }
                sectionIndex={sectionIndex}
                questionIndex={questionIndex}
                onRegenerate={onRegenerate}
              />
            ))}
          </div>

          <div className="section-actions">
            <Button
              variant="ghost"
              size="small"
              onClick={() => onRegenerate(sectionIndex, null)}
            >
              <RefreshCw size={14} />
              Regenerate Section
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
};

export default Section;
