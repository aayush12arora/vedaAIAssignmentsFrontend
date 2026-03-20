import React, { useRef, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Download, ArrowLeft } from 'lucide-react';
import { Loading, ProgressBar } from '../common';
import Section from './Section';
import { regenerateQuestions } from '../../store/slices/questionPaperSlice';
import './QuestionPaperView.css';

const QuestionPaperView = ({ onBack, onDownload, showFinish = false, onFinish }) => {
  const dispatch = useDispatch();
  const paperRef = useRef(null);
  const [pdfGenerating, setPdfGenerating] = useState(false);
  const { currentPaper, loading, error } = useSelector((state) => state.questionPaper);
  const { currentAssignment, generating, generationStatus } = useSelector((state) => state.assignment);

  if (generating && (!currentPaper || !currentPaper.sections || currentPaper.sections.length === 0)) {
    return (
      <div className="qpv-center">
        <div className="qpv-generating-card">
          <Loading size="large" text="Generating question paper..." />
          <ProgressBar
            value={generationStatus.progress}
            max={100}
            label="Generation Progress"
            showPercentage
          />
          <p className="qpv-gen-status">{generationStatus.message}</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="qpv-center">
        <Loading size="large" text="Loading question paper..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="qpv-center">
        <div className="qpv-msg-card">
          <h3>Failed to generate questions</h3>
          <p>{error}</p>
          <button className="qpv-back-btn" onClick={onBack}>
            <ArrowLeft size={16} /> Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!currentPaper || !currentPaper.sections) {
    return (
      <div className="qpv-center">
        <div className="qpv-msg-card">
          <h3>No Question Paper</h3>
          <p>Create an assignment to generate a question paper</p>
          <button className="qpv-back-btn" onClick={onBack}>
            <ArrowLeft size={16} /> Create Assignment
          </button>
        </div>
      </div>
    );
  }

  const handleDownloadPdf = async () => {
    if (!paperRef.current || pdfGenerating) return;
    setPdfGenerating(true);
    const el = paperRef.current;
    el.classList.add('pdf-mode');
    try {
      const html2pdf = (await import('html2pdf.js')).default;
      const filename = `${subject}_Grade_${grade}_Question_Paper.pdf`
        .replace(/[^a-zA-Z0-9_.]/g, '_');
      await html2pdf()
        .set({
          margin: [14, 14, 14, 14],
          filename,
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: {
            scale: 2,
            useCORS: true,
            letterRendering: true,
            backgroundColor: '#ffffff',
          },
          jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
          pagebreak: { mode: ['avoid-all', 'css', 'legacy'] },
        })
        .from(el)
        .save();
    } catch (err) {
      console.error('PDF generation failed:', err);
    } finally {
      el.classList.remove('pdf-mode');
      setPdfGenerating(false);
    }
  };

  const handleRegenerate = (sectionIndex, questionIndex) => {
    dispatch(regenerateQuestions({ paperId: currentPaper.id, sectionIndex, questionIndex }));
  };

  const getTotalMarks = () =>
    currentPaper.sections.reduce(
      (t, s) => t + s.questions.reduce((st, q) => st + (q.marks || 0), 0),
      0
    );

  const schoolName = currentAssignment?.schoolName || 'Delhi Public School, Sector-4, Bokaro';
  const subject = currentPaper?.subject || currentAssignment?.subject || 'English';
  const grade = currentPaper?.grade || currentAssignment?.grade || '5th';
  const duration = currentPaper?.duration || currentAssignment?.duration || 45;
  const maxMarks = getTotalMarks() || 20;

  /* AI intro message */
  const aiMessage = `Certainly! Here are customized Question Paper for your CBSE Grade ${grade} ${subject} classes on the NCERT chapters:`;

  return (
    <div className="qpv-page">
      {/* Dark AI banner */}
      <div className="qpv-ai-banner">
        <p className="qpv-ai-message">{aiMessage}</p>
        <div className="qpv-banner-actions">
          <button className="qpv-download-btn" onClick={handleDownloadPdf} disabled={pdfGenerating}>
            <Download size={15} /> {pdfGenerating ? 'Generating PDF…' : 'Download as PDF'}
          </button>
          {showFinish && (
            <button className="qpv-finish-btn" onClick={onFinish}>
              Finish Review
            </button>
          )}
        </div>
      </div>

      {/* Formal paper */}
      <div className="qpv-paper-card" ref={paperRef}>
        {/* School header */}
        <div className="qpv-school-header">
          <h2 className="qpv-school-name">{schoolName}</h2>
          <p className="qpv-school-meta">Subject: {subject}</p>
          <p className="qpv-school-meta">Class: {grade}</p>
        </div>

        <div className="qpv-paper-meta-row">
          <span>Time Allowed: {duration} minutes</span>
          <span>Maximum Marks: {maxMarks}</span>
        </div>

        <p className="qpv-instructions">All questions are compulsory unless stated otherwise.</p>

        <div className="qpv-fields-row">
          <span>Name: <span className="qpv-blank">________________</span></span>
          <span>Roll Number: <span className="qpv-blank">__________</span></span>
          <span>Class: {grade} Section: <span className="qpv-blank">________</span></span>
        </div>

        {/* Sections */}
        <div className="qpv-sections">
          {currentPaper.sections.map((section, index) => (
            <Section
              key={index}
              section={section}
              sectionIndex={index}
              onRegenerate={handleRegenerate}
            />
          ))}
        </div>

        <p className="qpv-end-note">End of Question Paper</p>
      </div>

      {/* Mobile floating toolbar */}
      <div className="qpv-mobile-toolbar">
        <button className="qpv-mob-btn" onClick={onBack} aria-label="Back">
          <ArrowLeft size={18} />
        </button>
        <button className="qpv-mob-btn qpv-mob-ask" onClick={onDownload}>
          <Download size={16} /> Ask to edit
        </button>
      </div>
    </div>
  );
};

export default QuestionPaperView;