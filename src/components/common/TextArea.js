import React from 'react';
import './TextArea.css';

const TextArea = ({
  label,
  name,
  value,
  onChange,
  placeholder,
  error,
  required = false,
  disabled = false,
  rows = 4,
  maxLength,
  className = '',
  ...props
}) => {
  return (
    <div className={`textarea-wrapper ${className}`}>
      {label && (
        <label htmlFor={name} className="textarea-label">
          {label}
          {required && <span className="textarea-required">*</span>}
        </label>
      )}
      <div className={`textarea-container ${error ? 'textarea-error' : ''} ${disabled ? 'textarea-disabled' : ''}`}>
        <textarea
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          rows={rows}
          maxLength={maxLength}
          className="textarea-field"
          {...props}
        />
      </div>
      <div className="textarea-footer">
        {error && <span className="textarea-error-message">{error}</span>}
        {maxLength && (
          <span className="textarea-counter">
            {value?.length || 0}/{maxLength}
          </span>
        )}
      </div>
    </div>
  );
};

export default TextArea;
