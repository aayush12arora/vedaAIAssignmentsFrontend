import React from 'react';
import './GeneratingShimmer.css';

const GeneratingShimmer = ({ progress = 0, message = '' }) => {
  return (
    <div className="gs-wrapper">
      {/* Status card */}
      <div className="gs-status-card">
        <div className="gs-pulse-ring">
          <span className="gs-pulse-dot" />
        </div>
        <h2 className="gs-title">Generating Question Paper</h2>
        <p className="gs-subtitle">
          {message || 'AI is crafting your questions. Please wait a while…'}
        </p>

        {/* Progress bar */}
        <div className="gs-progress-wrap">
          <div className="gs-progress-track">
            <div className="gs-progress-fill" style={{ width: `${Math.min(progress, 100)}%` }} />
          </div>
          <span className="gs-percent">{Math.round(progress)}%</span>
        </div>
      </div>

      {/* Shimmer skeleton preview */}
      <div className="gs-skeleton-card">
        {/* Fake header */}
        <div className="gs-skel-header">
          <div className="gs-skel gs-skel--title" />
          <div className="gs-skel gs-skel--subtitle" />
          <div className="gs-skel gs-skel--subtitle gs-skel--short" />
        </div>

        <div className="gs-skel-divider" />

        {/* Fake meta row */}
        <div className="gs-skel-meta-row">
          <div className="gs-skel gs-skel--meta" />
          <div className="gs-skel gs-skel--meta" />
        </div>

        <div className="gs-skel gs-skel--instruction" />
        <div className="gs-skel gs-skel--fields" />

        <div className="gs-skel-divider" />

        {/* Fake section */}
        {[1, 2].map((s) => (
          <div key={s} className="gs-skel-section">
            <div className="gs-skel-section-header">
              <div className="gs-skel gs-skel--section-title" />
              <div className="gs-skel gs-skel--badge" />
            </div>
            {[1, 2, 3].map((q) => (
              <div key={q} className="gs-skel-question">
                <div className="gs-skel gs-skel--q-num" />
                <div className="gs-skel-q-body">
                  <div className="gs-skel gs-skel--q-text" />
                  <div className="gs-skel gs-skel--q-text gs-skel--q-text-short" />
                  <div className="gs-skel-options">
                    {[1, 2, 3, 4].map((o) => (
                      <div key={o} className="gs-skel gs-skel--option" />
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default GeneratingShimmer;
