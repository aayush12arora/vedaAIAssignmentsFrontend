import React from 'react';
import { X } from 'lucide-react';
import './QuestionTypeForm.css';

const QUESTION_TYPES = [
  { value: 'mcq', label: 'Multiple Choice Questions' },
  { value: 'short-answer', label: 'Short Questions' },
  { value: 'long-answer', label: 'Long Answer Questions' },
  { value: 'true-false', label: 'True/False Questions' },
  { value: 'fill-blanks', label: 'Fill in the Blanks' },
  { value: 'diagram', label: 'Diagram/Graph-Based Questions' },
  { value: 'numerical', label: 'Numerical Problems' },
];

const Counter = ({ value, onChange, min = 1, max = 50 }) => (
  <div className="qt-counter">
    <button
      type="button"
      className="qt-counter-btn"
      onClick={() => onChange(Math.max(min, value - 1))}
      disabled={value <= min}
    >
      −
    </button>
    <span className="qt-counter-val">{value}</span>
    <button
      type="button"
      className="qt-counter-btn"
      onClick={() => onChange(Math.min(max, value + 1))}
      disabled={value >= max}
    >
      +
    </button>
  </div>
);

const QuestionTypeForm = ({ index, data, onUpdate, onRemove }) => {
  const handleTypeChange = (e) => onUpdate(index, { type: e.target.value });

  return (
    <div className="qt-row">
      {/* Dropdown */}
      <div className="qt-select-wrap">
        <select
          className="qt-select"
          value={data.type}
          onChange={handleTypeChange}
        >
          {QUESTION_TYPES.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
      </div>

      {/* Remove */}
      <button
        type="button"
        className="qt-remove-btn"
        onClick={() => onRemove(index)}
        aria-label="Remove"
      >
        <X size={14} />
      </button>

      {/* Count */}
      <Counter
        value={data.count || 1}
        onChange={(v) => onUpdate(index, { count: v })}
      />

      {/* Marks */}
      <Counter
        value={data.marksPerQuestion || 1}
        onChange={(v) => onUpdate(index, { marksPerQuestion: v })}
        max={20}
      />
    </div>
  );
};

export default QuestionTypeForm;
