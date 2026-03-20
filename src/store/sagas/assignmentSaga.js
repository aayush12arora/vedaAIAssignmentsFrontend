import { call, put, takeLatest } from 'redux-saga/effects';
import { assignmentApi } from '../../services/api';
import socketService from '../../services/socket';
import {
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
  generateQuestionsFailure,
  deleteAssignmentRequest,
  deleteAssignmentSuccess,
  deleteAssignmentFailure
} from '../slices/assignmentSlice';
import toast from 'react-hot-toast';

const buildAssignmentPayload = (assignment) => {
  if (!assignment.uploadedFile) {
    return {
      ...assignment,
      uploadedFile: undefined
    };
  }

  const formData = new FormData();
  formData.append('title', assignment.title || '');
  formData.append('subject', assignment.subject || '');
  formData.append('grade', assignment.grade || '');
  formData.append('dueDate', assignment.dueDate || '');
  formData.append('duration', String(assignment.duration || 60));
  formData.append('totalMarks', String(assignment.totalMarks || 0));
  formData.append('additionalInstructions', assignment.additionalInstructions || '');
  formData.append('questionTypes', JSON.stringify(assignment.questionTypes || []));
  formData.append(
    'difficultyDistribution',
    JSON.stringify(assignment.difficultyDistribution || { easy: 30, medium: 50, hard: 20 })
  );
  formData.append('file', assignment.uploadedFile);

  return formData;
};

// Fetch all assignments
function* fetchAssignmentsSaga() {
  yield put(fetchAssignmentsRequest());
  try {
    const response = yield call(assignmentApi.getAll);
    yield put(fetchAssignmentsSuccess(response.data.data));
  } catch (error) {
    const message = error.response?.data?.message || 'Failed to fetch assignments';
    yield put(fetchAssignmentsFailure(message));
    toast.error(message);
  }
}

// Fetch single assignment
function* fetchAssignmentSaga(action) {
  yield put(fetchAssignmentRequest());
  try {
    const response = yield call(assignmentApi.getById, action.payload);
    yield put(fetchAssignmentSuccess(response.data.data));
  } catch (error) {
    const message = error.response?.data?.message || 'Failed to fetch assignment';
    yield put(fetchAssignmentFailure(message));
    toast.error(message);
  }
}

// Create assignment and trigger question generation
function* createAssignmentSaga(action) {
  yield put(createAssignmentRequest());
  try {
    const payload = buildAssignmentPayload(action.payload);
    const response = yield call(assignmentApi.create, payload);
    const assignment = response.data.data;
    yield put(createAssignmentSuccess(assignment));
    toast.success('Assignment created successfully!');
    
    // Automatically start question generation
    const assignmentId = assignment.id || assignment._id;
    yield put(generateQuestionsRequest());

    // Ensure client is subscribed to this assignment room before generation starts.
    socketService.subscribeToAssignment(assignmentId);

    const generationResponse = yield call(assignmentApi.generate, assignmentId);
    const jobId = generationResponse?.data?.data?.jobId || null;
    yield put(setGenerationTracking({ assignmentId, jobId }));
    toast.success('Question generation started!');
  } catch (error) {
    const message = error.response?.data?.message || 'Failed to create assignment';
    yield put(createAssignmentFailure(message));
    toast.error(message);
  }
}

// Generate questions
function* generateQuestionsSaga(action) {
  yield put(generateQuestionsRequest());
  try {
    const assignmentId = action.payload;

    // Keep listening for progress events for this assignment from Home/View pages.
    socketService.subscribeToAssignment(assignmentId);

    const generationResponse = yield call(assignmentApi.generate, assignmentId);
    const jobId = generationResponse?.data?.data?.jobId || null;
    yield put(setGenerationTracking({ assignmentId, jobId }));
    // Success will be handled by WebSocket
    toast.success('Question generation started!');
  } catch (error) {
    const message = error.response?.data?.message || 'Failed to start question generation';
    yield put(generateQuestionsFailure(message));
    toast.error(message);
  }
}

// Delete assignment
function* deleteAssignmentSaga(action) {
  yield put(deleteAssignmentRequest());
  try {
    const id = action.payload;
    yield call(assignmentApi.delete, id);
    yield put(deleteAssignmentSuccess(id));
    toast.success('Assignment deleted successfully!');
  } catch (error) {
    const message = error.response?.data?.message || 'Failed to delete assignment';
    yield put(deleteAssignmentFailure(message));
    toast.error(message);
  }
}

// Watcher saga
export default function* assignmentSaga() {
  yield takeLatest('assignment/fetchAssignments', fetchAssignmentsSaga);
  yield takeLatest('assignment/fetchAssignment', fetchAssignmentSaga);
  yield takeLatest('assignment/createAssignment', createAssignmentSaga);
  yield takeLatest('assignment/generateQuestions', generateQuestionsSaga);
  yield takeLatest('assignment/deleteAssignment', deleteAssignmentSaga);
}
