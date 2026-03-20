import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Plus, Search, SlidersHorizontal, MoreVertical, Eye, Trash2, Zap, Loader2 } from 'lucide-react';
import { Loading } from '../../components/common';
import { fetchAssignments, deleteAssignment, generateQuestions } from '../../store/slices/assignmentSlice';
import './HomePage.css';

const AssignmentCard = ({ assignment, onView, onDelete, onGenerate, isGeneratingId, generationStatus }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    return `${String(d.getDate()).padStart(2,'0')}-${String(d.getMonth()+1).padStart(2,'0')}-${d.getFullYear()}`;
  };

  // Assignment status helpers — also check live Redux generating state
  const id = assignment.id || assignment._id;
  const status = assignment.status || 'pending';
  const hasQuestions = status === 'completed' || !!assignment.generatedPaperId;
  const isProcessing = status === 'processing' || status === 'generating' || isGeneratingId === id;
  // Live progress for this card
  const liveProgress = isGeneratingId === id ? (generationStatus?.progress ?? 0) : 0;
  const liveMessage = isGeneratingId === id ? (generationStatus?.message || '') : '';

  // Close menu on outside click
  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div
      className={`asgn-card${isProcessing ? ' asgn-card--processing' : ''}`}
      onClick={() => !isProcessing && onView(assignment)}
    >
      <div className="asgn-card-top">
        <div className="asgn-card-title-row">
          <h3 className="asgn-card-title">{assignment.title || assignment.subject || 'Untitled'}</h3>
          {isProcessing && (
            <span className="asgn-status-badge asgn-status-badge--processing">
              <Loader2 size={11} className="asgn-spinner" /> Processing
            </span>
          )}
          {hasQuestions && !isProcessing && (
            <span className="asgn-status-badge asgn-status-badge--done">Ready</span>
          )}
        </div>
        <div className="asgn-menu-wrap" ref={menuRef}>
          <button
            className="asgn-menu-btn"
            onClick={(e) => { e.stopPropagation(); setMenuOpen(!menuOpen); }}
            aria-label="More options"
          >
            <MoreVertical size={18} />
          </button>
          {menuOpen && (
            <div className="asgn-dropdown">
              {hasQuestions && (
                <button
                  className="asgn-dd-item"
                  onClick={(e) => { e.stopPropagation(); setMenuOpen(false); onView(assignment); }}
                >
                  <Eye size={15} /> View Assignment
                </button>
              )}
              <button
                className="asgn-dd-item asgn-dd-item--danger"
                onClick={(e) => { e.stopPropagation(); setMenuOpen(false); onDelete(assignment); }}
              >
                <Trash2 size={15} /> Delete
              </button>
            </div>
          )}
        </div>
      </div>
      <div className="asgn-card-dates">
        <span className="asgn-date-label">Assigned on&nbsp;:&nbsp;</span>
        <span className="asgn-date-val">{formatDate(assignment.createdAt || assignment.assigned_at)}</span>
        <span className="asgn-date-sep" />
        <span className="asgn-date-label">Due&nbsp;:&nbsp;</span>
        <span className="asgn-date-val">{formatDate(assignment.dueDate || assignment.due_date)}</span>
      </div>

      {/* Generate questions CTA for assignments without questions */}
      {!hasQuestions && !isProcessing && (
        <button
          className="asgn-generate-btn"
          onClick={(e) => { e.stopPropagation(); onGenerate(assignment); }}
        >
          <Zap size={13} /> Generate Questions
        </button>
      )}

      {/* Processing mini progress bar */}
      {isProcessing && (
        <div className="asgn-processing-wrap">
          <div className="asgn-processing-bar">
            <div
              className="asgn-processing-fill"
              style={liveProgress > 0 ? { width: `${liveProgress}%`, animation: 'none' } : undefined}
            />
          </div>
          {liveProgress > 0 && (
            <span className="asgn-processing-pct">{Math.round(liveProgress)}%</span>
          )}
          {liveMessage && (
            <p className="asgn-processing-msg">{liveMessage}</p>
          )}
        </div>
      )}
    </div>
  );
};

const HomePage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { assignments, loading, generating, currentAssignment, generationStatus } = useSelector(
    (state) => state.assignment
  );
  const [search, setSearch] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  // ID of the assignment currently being generated (from Redux live state)
  const generatingId = generating && currentAssignment
    ? (currentAssignment.id || currentAssignment._id)
    : null;

  useEffect(() => {
    dispatch(fetchAssignments());
  }, [dispatch]);

  const filtered = assignments.filter((a) => {
    const t = (a.title || a.subject || '').toLowerCase();
    return t.includes(search.toLowerCase());
  });

  const handleView = (a) => navigate(`/paper/${a.id || a._id}`);

  const handleDelete = (a) => {
    const id = a.id || a._id;
    if (window.confirm(`Delete "${a.title || a.subject || 'this assignment'}"? This cannot be undone.`)) {
      setDeletingId(id);
      dispatch(deleteAssignment(id));
      setDeletingId(null);
    }
  };

  const handleGenerate = (a) => {
    const id = a.id || a._id;
    dispatch(generateQuestions(id));
    navigate(`/paper/${id}`);
  };

  return (
    <div className="assignments-page">
      {/* Page heading */}
      <div className="ap-heading">
        <div className="ap-heading-left">
          <span className="ap-status-dot" />
          <div>
            <h1 className="ap-title">Assignments</h1>
            <p className="ap-subtitle">Manage and create assignments for your classes.</p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="ap-loading">
          <Loading text="Loading assignments..." />
        </div>
      ) : assignments.length === 0 ? (
        /* ── Empty state ── */
        <div className="ap-empty">
          <div className="ap-empty-illustration">
            <svg viewBox="0 0 180 160" fill="none" xmlns="http://www.w3.org/2000/svg" width="180" height="160">
              <ellipse cx="90" cy="80" rx="70" ry="65" fill="#EBEBEB" />
              <rect x="55" y="35" width="70" height="85" rx="8" fill="#fff" stroke="#D1D5DB" strokeWidth="1.5"/>
              <rect x="65" y="50" width="30" height="5" rx="2.5" fill="#D1D5DB"/>
              <rect x="65" y="62" width="40" height="4" rx="2" fill="#E5E7EB"/>
              <rect x="65" y="72" width="35" height="4" rx="2" fill="#E5E7EB"/>
              <circle cx="108" cy="103" r="28" fill="#fff" stroke="#D1D5DB" strokeWidth="2"/>
              <circle cx="108" cy="103" r="20" fill="#F9FAFB" stroke="#E5E7EB" strokeWidth="1.5"/>
              <line x1="120" y1="115" x2="135" y2="130" stroke="#9CA3AF" strokeWidth="3" strokeLinecap="round"/>
              <circle cx="108" cy="103" r="10" fill="#FEE2E2" />
              <line x1="103" y1="98" x2="113" y2="108" stroke="#EF4444" strokeWidth="2.5" strokeLinecap="round"/>
              <line x1="113" y1="98" x2="103" y2="108" stroke="#EF4444" strokeWidth="2.5" strokeLinecap="round"/>
              <circle cx="70" cy="47" r="5" fill="#BFDBFE"/>
              <circle cx="132" cy="62" r="4" fill="#FDE68A"/>
              <circle cx="58" cy="115" r="3" fill="#BFDBFE"/>
            </svg>
          </div>
          <h2 className="ap-empty-title">No assignments yet</h2>
          <p className="ap-empty-desc">
            Create your first assignment to start collecting and grading student
            submissions. You can set up rubrics, define marking criteria, and let AI
            assist with grading.
          </p>
          <button className="ap-create-btn" onClick={() => navigate('/create')}>
            <Plus size={16} /> Create Your First Assignment
          </button>
        </div>
      ) : (
        /* ── Filled state ── */
        <>
          {/* Filter + search bar */}
          <div className="ap-toolbar">
            <button className="ap-filter-btn">
              <SlidersHorizontal size={15} /> Filter By
            </button>
            <div className="ap-search-wrap">
              <Search size={15} className="ap-search-icon" />
              <input
                className="ap-search-input"
                placeholder="Search Assignment"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          {/* Grid */}
          <div className="ap-grid">
            {filtered.map((a) => (
              <AssignmentCard
                key={a.id || a._id}
                assignment={a}
                onView={handleView}
                onDelete={handleDelete}
                onGenerate={handleGenerate}
                isGeneratingId={generatingId}
                generationStatus={generationStatus}
              />
            ))}
          </div>

          {filtered.length === 0 && (
            <p className="ap-no-results">No assignments match your search.</p>
          )}
        </>
      )}

      {/* Floating create button (filled state) */}
      {assignments.length > 0 && (
        <button className="ap-fab" onClick={() => navigate('/create')}>
          <Plus size={16} /> Create Assignment
        </button>
      )}
    </div>
  );
};

export default HomePage;
