import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  currentPaper: null,
  papers: [],
  loading: false,
  generating: false,
  progress: {
    current: 0,
    total: 100,
    status: 'idle'
  },
  error: null,
  downloadingPdf: false
};

const questionPaperSlice = createSlice({
  name: 'questionPaper',
  initialState,
  reducers: {
    // Fetch question paper
    fetchQuestionPaperRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchQuestionPaperSuccess: (state, action) => {
      state.loading = false;
      state.currentPaper = action.payload;
    },
    fetchQuestionPaperFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    
    // Generate questions
    generateQuestionsRequest: (state) => {
      state.generating = true;
      state.error = null;
      state.progress = {
        current: 0,
        total: 100,
        status: 'Starting generation...'
      };
    },
    generateQuestionsSuccess: (state, action) => {
      state.generating = false;
      state.currentPaper = action.payload;
      state.progress = {
        current: 100,
        total: 100,
        status: 'Complete!'
      };
    },
    generateQuestionsFailure: (state, action) => {
      state.generating = false;
      state.error = action.payload;
      state.progress = {
        current: 0,
        total: 100,
        status: 'Failed'
      };
    },
    
    // Update generation progress
    updateProgress: (state, action) => {
      state.progress = {
        ...state.progress,
        ...action.payload
      };
    },
    
    // Set question paper (from WebSocket)
    setQuestionPaper: (state, action) => {
      state.currentPaper = action.payload;
      state.loading = false;
      state.generating = false;
    },
    
    // Download PDF
    downloadPdfRequest: (state) => {
      state.downloadingPdf = true;
    },
    downloadPdfSuccess: (state) => {
      state.downloadingPdf = false;
    },
    downloadPdfFailure: (state, action) => {
      state.downloadingPdf = false;
      state.error = action.payload;
    },
    
    // Clear state
    clearQuestionPaper: (state) => {
      state.currentPaper = null;
      state.error = null;
      state.progress = initialState.progress;
    },
    
    // Clear error
    clearError: (state) => {
      state.error = null;
    }
  }
});

export const {
  fetchQuestionPaperRequest,
  fetchQuestionPaperSuccess,
  fetchQuestionPaperFailure,
  generateQuestionsRequest,
  generateQuestionsSuccess,
  generateQuestionsFailure,
  updateProgress,
  setQuestionPaper,
  downloadPdfRequest,
  downloadPdfSuccess,
  downloadPdfFailure,
  clearQuestionPaper,
  clearError
} = questionPaperSlice.actions;

// Action creators for saga triggers
export const fetchQuestionPaper = (assignmentId) => ({ 
  type: 'questionPaper/fetchQuestionPaper', 
  payload: assignmentId 
});
export const prefetchPDF = (paperId) => ({
  type: 'questionPaper/prefetchPDF',
  payload: paperId
});
export const downloadPDF = (paperId) => ({ 
  type: 'questionPaper/downloadPDF', 
  payload: paperId 
});
export const regenerateQuestions = (params) => ({ 
  type: 'questionPaper/regenerateQuestions', 
  payload: params 
});

export default questionPaperSlice.reducer;
