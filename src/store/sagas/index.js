import { all, fork } from 'redux-saga/effects';
import assignmentSaga from './assignmentSaga';
import questionPaperSaga from './questionPaperSaga';

export default function* rootSaga() {
  yield all([
    fork(assignmentSaga),
    fork(questionPaperSaga)
  ]);
}
