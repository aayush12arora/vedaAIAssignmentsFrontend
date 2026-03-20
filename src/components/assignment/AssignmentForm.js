import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  updateFormData,
  updateDifficultyDistribution,
  addQuestionType,
  removeQuestionType,
  updateQuestionType,
  createAssignment,
  generateQuestionsSuccess,
  generateQuestionsFailure,
  updateGenerationProgress
} from '../../store/slices/assignmentSlice';
import { assignmentApi, questionPaperApi } from '../../services/api';
import FileUpload from './FileUpload';
import DifficultySlider from './DifficultySlider';
import QuestionTypeForm from './QuestionTypeForm';
import { GeneratingShimmer } from '../questionPaper';
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
  const {
    formData,
    creating,
    generating,
    error: assignmentError,
    currentAssignment,
    generationStatus,
    generationTracking
  } = useSelector((state) => state.assignment);
  const [errors, setErrors] = useState({});
  const [step, setStep] = useState(0);
  const [reviewPaper, setReviewPaper] = useState(null);
  const hasSeededDefaultQuestionType = useRef(false);
  const pollingRef = useRef(null);

  useEffect(() => {
    if (!hasSeededDefaultQuestionType.current && formData.questionTypes.length === 0) {
      dispatch(addQuestionType({ type: 'mcq', count: 4, marksPerQuestion: 1 }));
      hasSeededDefaultQuestionType.current = true;
    }
  }, [dispatch, formData.questionTypes.length]);

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

  const handleDifficultyChange = (nextDistribution) => {
    dispatch(updateDifficultyDistribution(nextDistribution));
  };

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

  const handleCreateAndGenerate = () => {
    if (!validate()) return;

    setStep(1);
    setReviewPaper(null);

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

  const handlePrev = () => {
    if (step === 0) {
      navigate('/');
      return;
    }
    if (step === 2) {
      setStep(1);
      return;
    }
    setStep(0);
  };

  // Poll backend job progress in step 2 using assignment + job id.
  useEffect(() => {
    const assignmentId = generationTracking?.assignmentId || currentAssignment?.id || currentAssignment?._id;
    const jobId = generationTracking?.jobId;

    if (step !== 1 || !assignmentId || !jobId) {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
      return;
    }

    const pollStatus = async () => {
      try {
        const response = await assignmentApi.getGenerationStatus(assignmentId, jobId);
        const statusData = response?.data?.data;

        if (!statusData) {
          return;
        }

        dispatch(updateGenerationProgress({
          progress: statusData.progress || 0,
          message: `Job ${statusData.state || 'processing'}...`
        }));

        if (statusData.status === 'completed') {
          const paperResponse = await questionPaperApi.getByAssignment(assignmentId);
          const paper = paperResponse?.data?.data || null;

          if (paper) {
            setReviewPaper(paper);
            dispatch(generateQuestionsSuccess({
              assignmentId,
              paperId: paper.id || paper._id
            }));
            setStep(2);
          }
        }

        if (statusData.status === 'failed') {
          dispatch(generateQuestionsFailure(statusData.errorMessage || 'Generation failed'));
        }
      } catch (error) {
        // Keep UI stable while socket/poll race settles.
      }
    };

    pollStatus();
    pollingRef.current = setInterval(pollStatus, 2000);

    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
    };
  }, [step, generationTracking, currentAssignment, dispatch]);

  const finishReview = () => {
    navigate('/');
  };

  return (
    <div className="af-shell">
      {/* Stepper */}
      <div className="af-stepper">
        {STEPS.map((label, i) => (
          <React.Fragment key={label}>
            <div className={`af-step${i <= step ? ' af-step--done' : ''}`}>
              <div className="af-step-dot" />
              <span className="af-step-label">{label}</span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`af-step-line${i < step ? ' af-step-line--done' : ''}`} />
            )}
          </React.Fragment>
        ))}
      </div>

      <form onSubmit={(e) => e.preventDefault()} className="af-form">
        {step === 0 && (
          <>
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

        <div className="af-field">
          <label className="af-label">Difficulty Distribution</label>
          <DifficultySlider
            distribution={formData.difficultyDistribution || { easy: 30, medium: 50, hard: 20 }}
            onChange={handleDifficultyChange}
          />
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
            onClick={handleCreateAndGenerate}
            disabled={creating}
          >
            {creating ? 'Creating...' : 'Next'} <ChevronRight size={16} style={{ pointerEvents: 'none' }} />
          </button>
        </div>
          </>
        )}

        {step === 1 && (
          <div className="af-processing-step">
            <GeneratingShimmer
              progress={generationStatus?.progress ?? 0}
              message={
                assignmentError
                  ? `Failed: ${assignmentError}`
                  : (generationStatus?.message || (creating ? 'Creating assignment...' : 'Generating questions...'))
              }
            />
            <div className="af-nav af-nav--single">
              <button
                type="button"
                className="af-nav-btn af-nav-btn--prev"
                onClick={handlePrev}
                disabled={creating || generating}
              >
                <ChevronLeft size={16} style={{ pointerEvents: 'none' }} /> Back to Details
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="af-review-step">
            <div className="af-section-header">
              <h2 className="af-section-title">Review Generated Paper</h2>
              <p className="af-section-sub">Your question paper is generated and ready for final review.</p>
            </div>

            {reviewPaper ? (
              <div className="af-review-card">
                <p><strong>Title:</strong> {reviewPaper.title}</p>
                <p><strong>Subject:</strong> {reviewPaper.subject}</p>
                <p><strong>Grade:</strong> {reviewPaper.grade}</p>
                <p><strong>Sections:</strong> {reviewPaper.sections?.length || 0}</p>
                <p><strong>Total Questions:</strong> {reviewPaper.totalQuestions || 0}</p>
              </div>
            ) : (
              <p className="af-review-empty">Review data is loading. You can still open the paper.</p>
            )}

            <div className="af-nav">
              <button
                type="button"
                className="af-nav-btn af-nav-btn--prev"
                onClick={() => navigate(
                  `/paper/${generationTracking.assignmentId || currentAssignment?.id || currentAssignment?._id}`,
                  { state: { fromReview: true } }
                )}
              >
                Open Full Paper
              </button>
              <button type="button" className="af-nav-btn af-nav-btn--next" onClick={finishReview}>
                Finish <ChevronRight size={16} style={{ pointerEvents: 'none' }} />
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

export default AssignmentForm;