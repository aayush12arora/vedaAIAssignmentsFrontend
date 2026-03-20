import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { QuestionPaperView, GeneratingShimmer } from '../../components/questionPaper';
import { fetchQuestionPaper, downloadPDF, prefetchPDF } from '../../store/slices/questionPaperSlice';
import { fetchAssignment } from '../../store/slices/assignmentSlice';
import { Loading } from '../../components/common';
import { useSocket } from '../../hooks';
import './ViewPaperPage.css';

const ViewPaperPage = () => {
  const navigate = useNavigate();
  const { assignmentId } = useParams();
  const dispatch = useDispatch();
  
  const { currentPaper, loading, generating } = useSelector((state) => state.questionPaper);
  const { generating: assignmentGenerating, generationStatus } = useSelector((state) => state.assignment);

  // Subscribe to socket events for real-time updates
  useSocket(assignmentId);

  useEffect(() => {
    if (assignmentId) {
      // Fetch both assignment and question paper
      dispatch(fetchAssignment(assignmentId));
      dispatch(fetchQuestionPaper(assignmentId));
    }
  }, [assignmentId, dispatch]);

  useEffect(() => {
    if (currentPaper?.id) {
      dispatch(prefetchPDF(currentPaper.id));
    }
  }, [currentPaper?.id, dispatch]);

  const handleBack = () => {
    navigate('/');
  };

  const handleDownload = () => {
    if (currentPaper?.id) {
      dispatch(downloadPDF(currentPaper.id));
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // Show shimmer when generating and no completed paper yet
  const isGenerating = (generating || assignmentGenerating) &&
    (!currentPaper || !currentPaper.sections || currentPaper.sections.length === 0);

  // Show loading state only if not generating (QuestionPaperView handles generating state)
  if (loading && !isGenerating && !currentPaper) {
    return (
      <div className="view-paper-page loading">
        <Loading size="large" text="Loading question paper..." />
      </div>
    );
  }

  if (isGenerating) {
    return (
      <div className="view-paper-page">
        <GeneratingShimmer
          progress={generationStatus?.progress ?? 0}
          message={generationStatus?.message || ''}
        />
      </div>
    );
  }

  return (
    <div className="view-paper-page">
      <QuestionPaperView
        onBack={handleBack}
        onDownload={handleDownload}
        onPrint={handlePrint}
      />
    </div>
  );
};

export default ViewPaperPage;
