import React from 'react';
import './ProgressBar.css';

const ProgressBar = ({
  progress = 0,
  showLabel = true,
  label,
  size = 'medium',
  color = 'primary',
  animated = true,
  className = ''
}) => {
  const clampedProgress = Math.min(100, Math.max(0, progress));

  return (
    <div className={`progress-container ${className}`}>
      {showLabel && (
        <div className="progress-label">
          <span>{label || 'Progress'}</span>
          <span>{clampedProgress}%</span>
        </div>
      )}
      <div className={`progress-bar progress-${size}`}>
        <div
          className={`progress-fill progress-${color} ${animated ? 'progress-animated' : ''}`}
          style={{ width: `${clampedProgress}%` }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;
