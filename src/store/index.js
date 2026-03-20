import { configureStore } from '@reduxjs/toolkit';
import createSagaMiddleware from 'redux-saga';
import assignmentReducer from './slices/assignmentSlice';
import questionPaperReducer from './slices/questionPaperSlice';
import rootSaga from './sagas';

// Create saga middleware
const sagaMiddleware = createSagaMiddleware();

// Configure store
const store = configureStore({
  reducer: {
    assignment: assignmentReducer,
    questionPaper: questionPaperReducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      thunk: false,
      serializableCheck: false
    }).concat(sagaMiddleware),
  devTools: process.env.NODE_ENV !== 'production'
});

// Run saga middleware
sagaMiddleware.run(rootSaga);

export default store;
