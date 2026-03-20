import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  // Form data
  formData: {
    title: '',
    subject: '',
    grade: '',
    dueDate: '',
    duration: 60,
    questionTypes: [],
    difficultyDistribution: { easy: 30, medium: 50, hard: 20 },
    additionalInstructions: '',
    uploadedFile: null,
    uploadedFileContent: ''
  },
  
  // Assignments list
  assignments: [],
  currentAssignment: null,
  
  // Loading states
  loading: false,
  creating: false,
  generating: false,
  
  // Error state
  error: null,
  
  // Generation status
  generationTracking: {
    assignmentId: null,
    jobId: null
  },
  generationStatus: {
    progress: 0,
    message: '',
    status: 'idle' // idle, processing, completed, failed
  }
};

const assignmentSlice = createSlice({
  name: 'assignment',
  initialState,
  reducers: {
    // Form actions
    updateFormData: (state, action) => {
      state.formData = { ...state.formData, ...action.payload };
    },
    resetFormData: (state) => {
      state.formData = initialState.formData;
    },
    addQuestionType: (state, action) => {
      state.formData.questionTypes.push(action.payload);
    },
    updateQuestionType: (state, action) => {
      const { index, data } = action.payload;
      if (state.formData.questionTypes[index]) {
        state.formData.questionTypes[index] = {
          ...state.formData.questionTypes[index],
          ...data
        };
      }
    },
    removeQuestionType: (state, action) => {
      state.formData.questionTypes.splice(action.payload, 1);
    },
    updateDifficultyDistribution: (state, action) => {
      state.formData.difficultyDistribution = action.payload;
    },
    
    // Fetch assignments
    fetchAssignmentsRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchAssignmentsSuccess: (state, action) => {
      state.loading = false;
      state.assignments = action.payload;
    },
    fetchAssignmentsFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    
    // Fetch single assignment
    fetchAssignmentRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchAssignmentSuccess: (state, action) => {
      state.loading = false;
      state.currentAssignment = action.payload;
    },
    fetchAssignmentFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    
    // Create assignment
    createAssignmentRequest: (state) => {
      state.creating = true;
      state.error = null;
    },
    createAssignmentSuccess: (state, action) => {
      state.creating = false;
      state.assignments.unshift(action.payload);
      state.currentAssignment = action.payload;
    },
    createAssignmentFailure: (state, action) => {
      state.creating = false;
      state.error = action.payload;
    },
    
    // Generate questions
    generateQuestionsRequest: (state) => {
      state.generating = true;
      state.error = null;
      state.generationStatus = {
        progress: 0,
        message: 'Starting question generation...',
        status: 'processing'
      };
    },
    setGenerationTracking: (state, action) => {
      state.generationTracking = {
        assignmentId: action.payload?.assignmentId || null,
        jobId: action.payload?.jobId || null
      };
    },
    generateQuestionsSuccess: (state, action) => {
      state.generating = false;
      state.generationStatus = {
        progress: 100,
        message: 'Questions generated successfully!',
        status: 'completed'
      };
      state.generationTracking.jobId = null;
      // Update the assignment in the list
      const index = state.assignments.findIndex(a => a.id === action.payload.assignmentId);
      if (index !== -1) {
        state.assignments[index].status = 'completed';
        state.assignments[index].generatedPaperId = action.payload.paperId;
      }
      if (state.currentAssignment?.id === action.payload.assignmentId) {
        state.currentAssignment.status = 'completed';
        state.currentAssignment.generatedPaperId = action.payload.paperId;
      }
    },
    generateQuestionsFailure: (state, action) => {
      state.generating = false;
      state.generationStatus = {
        progress: 0,
        message: action.payload,
        status: 'failed'
      };
      state.generationTracking.jobId = null;
    },
    
    // Update generation progress
    updateGenerationProgress: (state, action) => {
      state.generationStatus = {
        ...state.generationStatus,
        progress: action.payload.progress,
        message: action.payload.message
      };
    },
    
    // Reset generation status
    resetGenerationStatus: (state) => {
      state.generationStatus = initialState.generationStatus;
      state.generationTracking = initialState.generationTracking;
    },
    
    // Clear error
    clearError: (state) => {
      state.error = null;
    },
    
    // Set current assignment
    setCurrentAssignment: (state, action) => {
      state.currentAssignment = action.payload;
    },

    // Delete assignment
    deleteAssignmentRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    deleteAssignmentSuccess: (state, action) => {
      state.loading = false;
      state.assignments = state.assignments.filter(
        (a) => (a.id || a._id) !== action.payload
      );
      if ((state.currentAssignment?.id || state.currentAssignment?._id) === action.payload) {
        state.currentAssignment = null;
      }
    },
    deleteAssignmentFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    }
  }
});

export const {
  updateFormData,
  resetFormData,
  addQuestionType,
  updateQuestionType,
  removeQuestionType,
  updateDifficultyDistribution,
  fetchAssignmentsRequest,
  fetchAssignmentsSuccess,
  fetchAssignmentsFailure,
  fetchAssignmentRequest,
  fetchAssignmentSuccess,
  fetchAssignmentFailure,
  createAssignmentRequest,
  createAssignmentSuccess,
  createAssignmentFailure,
  generateQuestionsRequest,
  setGenerationTracking,
  generateQuestionsSuccess,
  generateQuestionsFailure,
  updateGenerationProgress,
  resetGenerationStatus,
  clearError,
  setCurrentAssignment,
  deleteAssignmentRequest,
  deleteAssignmentSuccess,
  deleteAssignmentFailure
} = assignmentSlice.actions;

// Action creators for saga triggers
export const fetchAssignments = () => ({ type: 'assignment/fetchAssignments' });
export const fetchAssignment = (id) => ({ type: 'assignment/fetchAssignment', payload: id });
export const createAssignment = (data) => ({ type: 'assignment/createAssignment', payload: data });
export const generateQuestions = (assignmentId) => ({ type: 'assignment/generateQuestions', payload: assignmentId });
export const deleteAssignment = (id) => ({ type: 'assignment/deleteAssignment', payload: id });

export default assignmentSlice.reducer;
