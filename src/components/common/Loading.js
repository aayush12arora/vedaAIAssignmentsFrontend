import React from 'react';
import './Loading.css';

const Loading = ({ 
  size = 'medium', 
  text = 'Loading...',
  fullScreen = false 
}) => {
  const sizeClass = `loading-${size}`;
  
  const content = (
    <div className={`loading-container ${sizeClass}`}>
      <div className="loading-spinner">
        <div className="spinner-ring"></div>
        <div className="spinner-ring"></div>
        <div className="spinner-ring"></div>
      </div>
      {text && <p className="loading-text">{text}</p>}
    </div>
  );

  if (fullScreen) {
    return <div className="loading-fullscreen">{content}</div>;
  }

  return content;
};

export default Loading;
