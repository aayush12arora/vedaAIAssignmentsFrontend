import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  updateFormData,
  resetFormData,
  addQuestionType,
  removeQuestionType,
  updateQuestionType,
  createAssignment
} from '../../store/slices/assignmentSlice';
import FileUpload from './FileUpload';
import QuestionTypeForm from './QuestionTypeForm';
import { Plus, Mic, ChevronLeft, ChevronRight } from 'lucide-react';
import './AssignmentForm.css';

const STEPS = ['Details', 'Questions', 'Review'];
const GRADE_OPTIONS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];

const QUESTION_TYPE_VALUE_MAP = {
  'Multiple Choice Questions': 'mcq',
  'Short Questions': 'short-answer',
  'Long Answer Questions': 'long-answer',
  'True/False Questions': 'true-false',
  'Fill in the Blanks': 'fill-blanks',
  'Diagram/Graph-Based Questions': 'diagram',
  'Numerical Problems': 'numerical'
};

const normalizeQuestionTypeValue = (type) => QUESTION_TYPE_VALUE_MAP[type] || type;

const AssignmentForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { formData, creating, error: assignmentError, currentAssignment } = useSelector((state) => state.assignment);
  const [errors, setErrors] = useState({});
  const hasSeededDefaultQuestionType = useRef(false);
  const prevCreating = useRef(false);

  useEffect(() => {
    if (!hasSeededDefaultQuestionType.current && formData.questionTypes.length === 0) {
      dispatch(addQuestionType({ type: 'mcq', count: 4, marksPerQuestion: 1 }));
      hasSeededDefaultQuestionType.current = true;
    }
  }, [dispatch, formData.questionTypes.length]);

  // Navigate to home after successful creation (creating: true → false with no error)
  useEffect(() => {
    if (prevCreating.current && !creating && !assignmentError && currentAssignment) {
      dispatch(resetFormData());
      navigate('/');
    }
    prevCreating.current = creating;
  }, [creating, assignmentError, currentAssignment, dispatch, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    dispatch(updateFormData({ [name]: value }));
    if (errors[name]) setErrors((p) => ({ ...p, [name]: null }));
  };

  const handleAddQuestionType = () => {
    dispatch(addQuestionType({ type: 'mcq', count: 4, marksPerQuestion: 1 }));
  };

  const handleRemoveQuestionType = (index) => dispatch(removeQuestionType(index));

  const handleUpdateQuestionType = (index, data) =>
    dispatch(updateQuestionType({ index, data }));

  const calculateTotalMarks = () =>
    formData.questionTypes.reduce((s, qt) => s + qt.count * qt.marksPerQuestion, 0);

  const calculateTotalQuestions = () =>
    formData.questionTypes.reduce((s, qt) => s + qt.count, 0);

  const validate = () => {
    const errs = {};
    if (!formData.subject?.trim()) errs.subject = 'Subject is required';
    if (!formData.grade) errs.grade = 'Grade is required';
    if (!formData.dueDate) errs.dueDate = 'Due date is required';
    if (formData.questionTypes.length === 0)
      errs.questionTypes = 'At least one question type is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Validate and submit immediately — no fake multi-step incrementing
  const handleNext = () => {
    if (!validate()) return;
    dispatch(
      createAssignment({
        ...formData,
        questionTypes: (formData.questionTypes || []).map((qt) => ({
          ...qt,
          type: normalizeQuestionTypeValue(qt.type)
        })),
        totalMarks: calculateTotalMarks()
      })
    );
  };

  const handlePrev = () => navigate('/');

  return (
    <div className="af-shell">
      {/* Stepper */}
      <div className="af-stepper">
        {STEPS.map((label, i) => (
          <React.Fragment key={label}>
            <div className={`af-step${i === 0 ? ' af-step--done' : ''}`}>
              <div className="af-step-dot" />
              <span className="af-step-label">{label}</span>
            </div>
            {i < STEPS.length - 1 && (
              <div className="af-step-line" />
            )}
          </React.Fragment>
        ))}
      </div>

      <form onSubmit={(e) => e.preventDefault()} className="af-form">
        {/* Section title */}
        <div className="af-section-header">
          <h2 className="af-section-title">Assignment Details</h2>
          <p className="af-section-sub">Basic information about your assignment</p>
        </div>

        {/* File upload */}
        <FileUpload />

        {/* Required assignment fields */}
        <div className="af-two-col">
          <div className="af-field">
            <label className="af-label">Subject</label>
            <input
              type="text"
              name="subject"
              value={formData.subject || ''}
              onChange={handleInputChange}
              className={`af-input${errors.subject ? ' af-input--error' : ''}`}
              placeholder="e.g. Science"
            />
            {errors.subject && <p className="af-error">{errors.subject}</p>}
          </div>

          <div className="af-field">
            <label className="af-label">Grade</label>
            <select
              name="grade"
              value={formData.grade || ''}
              onChange={handleInputChange}
              className={`af-input${errors.grade ? ' af-input--error' : ''}`}
            >
              <option value="" disabled>Select grade</option>
              {GRADE_OPTIONS.map((g) => (
                <option key={g} value={g}>Grade {g}</option>
              ))}
            </select>
            {errors.grade && <p className="af-error">{errors.grade}</p>}
          </div>
        </div>

        <div className="af-field">
          <label className="af-label">Due Date</label>
          <div className="af-date-wrap">
            <input
              type="date"
              name="dueDate"
              value={formData.dueDate || ''}
              onChange={handleInputChange}
              className={`af-input${errors.dueDate ? ' af-input--error' : ''}`}
              min={new Date().toISOString().split('T')[0]}
            />
          </div>
          {errors.dueDate && <p className="af-error">{errors.dueDate}</p>}
        </div>

        {/* Question types */}
        <div className="af-field">
          <div className="af-qt-header">
            <span className="af-label" style={{flex:1}}>Question Type</span>
            <span className="af-qt-col-label">No. of Questions</span>
            <span className="af-qt-col-label">Marks</span>
          </div>

          {errors.questionTypes && <p className="af-error">{errors.questionTypes}</p>}

          <div className="af-qt-list">
            {formData.questionTypes.map((qt, i) => (
              <QuestionTypeForm
                key={i}
                index={i}
                data={qt}
                onUpdate={handleUpdateQuestionType}
                onRemove={handleRemoveQuestionType}
              />
            ))}
          </div>

          <button
            type="button"
            className="af-add-qt-btn"
            onClick={handleAddQuestionType}
          >
            <Plus size={15} /> Add Question Type
          </button>

          {formData.questionTypes.length > 0 && (
            <div className="af-totals">
              <span>Total Questions : <strong>{calculateTotalQuestions()}</strong></span>
              <span>Total Marks : <strong>{calculateTotalMarks()}</strong></span>
            </div>
          )}
        </div>

        {/* Additional info */}
        <div className="af-field">
          <label className="af-label">Additional Information <span className="af-label-hint">(For better output)</span></label>
          <div className="af-textarea-wrap">
            <textarea
              name="additionalInstructions"
              value={formData.additionalInstructions || ''}
              onChange={handleInputChange}
              className="af-textarea"
              rows={4}
              placeholder="e.g. Generate a question paper for 3 hour exam duration..."
            />
            <button type="button" className="af-mic-btn" aria-label="Voice input">
              <Mic size={18} />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <div className="af-nav">
          <button type="button" className="af-nav-btn af-nav-btn--prev" onClick={handlePrev}>
            <ChevronLeft size={16} style={{ pointerEvents: 'none' }} /> Previous
          </button>
          <button
            type="button"
            className="af-nav-btn af-nav-btn--next"
            onClick={handleNext}
            disabled={creating}
          >
            {creating ? 'Creating...' : 'Next'} <ChevronRight size={16} style={{ pointerEvents: 'none' }} />
          </button>
        </div>
      </form>
    </div>
  );
};

export default AssignmentForm;