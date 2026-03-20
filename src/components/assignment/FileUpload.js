import React, { useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { updateFormData } from '../../store/slices/assignmentSlice';
import { UploadCloud, X, ImageIcon } from 'lucide-react';
import './FileUpload.css';

const FileUpload = () => {
  const dispatch = useDispatch();
  const fileInputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [error, setError] = useState(null);
  const [dragging, setDragging] = useState(false);

  const handleClick = () => fileInputRef.current?.click();

  const handleDragOver = (e) => { e.preventDefault(); setDragging(true); };
  const handleDragLeave = () => setDragging(false);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) processFile(dropped);
  };

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) processFile(selected);
  };

  const processFile = (selectedFile) => {
    if (selectedFile.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB');
      return;
    }
    setError(null);
    setFile(selectedFile);
    dispatch(updateFormData({ uploadedFile: selectedFile, uploadedFileContent: '' }));
  };

  const removeFile = () => {
    setFile(null);
    dispatch(updateFormData({ uploadedFile: null, uploadedFileContent: '' }));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const formatSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="fu-wrapper">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="*/*"
        className="fu-hidden-input"
      />

      {!file ? (
        <div
          className={`fu-zone${dragging ? ' fu-zone--drag' : ''}`}
          onClick={handleClick}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <UploadCloud size={32} className="fu-cloud-icon" />
          <p className="fu-primary-text">Choose a file or drag &amp; drop it here</p>
          <p className="fu-secondary-text">Any file type upto 10MB</p>
          <button type="button" className="fu-browse-btn" onClick={(e) => { e.stopPropagation(); handleClick(); }}>
            Browse Files
          </button>
        </div>
      ) : (
        <div className="fu-preview">
          <ImageIcon size={20} className="fu-file-icon" />
          <div className="fu-file-info">
            <span className="fu-file-name">{file.name}</span>
            <span className="fu-file-size">{formatSize(file.size)}</span>
          </div>
          <button type="button" className="fu-remove-btn" onClick={removeFile} aria-label="Remove file">
            <X size={16} />
          </button>
        </div>
      )}

      {error && <p className="fu-error">{error}</p>}
      <p className="fu-hint">Upload any document, image, or resource file</p>
    </div>
  );
};

export default FileUpload;




