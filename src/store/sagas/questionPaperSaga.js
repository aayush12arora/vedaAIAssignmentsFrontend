import { call, put, takeLatest, select } from 'redux-saga/effects';
import { questionPaperApi } from '../../services/api';
import {
  fetchQuestionPaperRequest,
  fetchQuestionPaperSuccess,
  fetchQuestionPaperFailure,
  downloadPdfRequest,
  downloadPdfSuccess,
  downloadPdfFailure,
  generateQuestionsRequest,
  generateQuestionsFailure
} from '../slices/questionPaperSlice';
import toast from 'react-hot-toast';

const pdfBlobCache = new Map();

function* getPdfBlob(paperId) {
  if (pdfBlobCache.has(paperId)) {
    return pdfBlobCache.get(paperId);
  }

  const response = yield call(questionPaperApi.downloadPdf, paperId);
  const blob = response.data;
  pdfBlobCache.set(paperId, blob);
  return blob;
}

// Fetch question paper by assignment ID
function* fetchQuestionPaperSaga(action) {
  yield put(fetchQuestionPaperRequest());
  try {
    const response = yield call(questionPaperApi.getByAssignment, action.payload);
    yield put(fetchQuestionPaperSuccess(response.data.data));
  } catch (error) {
    const message = error.response?.data?.message || 'Failed to fetch question paper';
    yield put(fetchQuestionPaperFailure(message));
    // Don't show toast if paper doesn't exist yet (it's being generated)
    if (error.response?.status !== 404) {
      toast.error(message);
    }
  }
}

// Download PDF
function* downloadPdfSaga(action) {
  yield put(downloadPdfRequest());
  try {
    const paperId = action.payload;
    const state = yield select();
    const title = state.assignment.currentAssignment?.subject || 'Question_Paper';

    const blob = yield* getPdfBlob(paperId);

    // Create blob and download
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${title.replace(/[^a-zA-Z0-9]/g, '_')}_question_paper.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    
    yield put(downloadPdfSuccess());
    toast.success('PDF downloaded successfully!');
  } catch (error) {
    const message = error.response?.data?.message || 'Failed to download PDF';
    yield put(downloadPdfFailure(message));
    toast.error(message);
  }
}

function* prefetchPdfSaga(action) {
  try {
    const paperId = action.payload;
    if (!paperId) return;
    yield* getPdfBlob(paperId);
  } catch {
    // Silent prefetch failure: user can still trigger manual download.
  }
}

// Regenerate questions
function* regenerateQuestionsSaga(action) {
  yield put(generateQuestionsRequest());
  try {
    const { paperId, sectionIndex, questionIndex } = action.payload;
    yield call(questionPaperApi.regenerate, paperId, { sectionIndex, questionIndex });
    toast.success('Regenerating questions...');
  } catch (error) {
    const message = error.response?.data?.message || 'Failed to regenerate questions';
    yield put(generateQuestionsFailure(message));
    toast.error(message);
  }
}

// Watcher saga
export default function* questionPaperSaga() {
  yield takeLatest('questionPaper/fetchQuestionPaper', fetchQuestionPaperSaga);
  yield takeLatest('questionPaper/prefetchPDF', prefetchPdfSaga);
  yield takeLatest('questionPaper/downloadPDF', downloadPdfSaga);
  yield takeLatest('questionPaper/regenerateQuestions', regenerateQuestionsSaga);
}
