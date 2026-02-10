import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import './UploadResume.css';

export default function UploadResume() {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const fileRef = useRef();
  const navigate = useNavigate();

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
    else if (e.type === 'dragleave') setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const dropped = e.dataTransfer?.files?.[0];
    if (dropped) setFile(dropped);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) { setError('Please select a file.'); return; }
    setError('');
    setUploading(true);

    const formData = new FormData();
    formData.append('resume', file);
    if (title) formData.append('title', title);

    try {
      await api.post('/resumes/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setSuccess('Resume uploaded and parsed successfully!');
      setTimeout(() => navigate('/dashboard'), 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: '640px' }}>
        <div className="page-header fade-in">
          <h1>Upload Resume</h1>
          <p>Upload your existing resume as a base template. We'll extract and structure your content using AI.</p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <form onSubmit={handleSubmit} className="fade-in">
          <div className="form-group">
            <label>Resume Title (optional)</label>
            <input
              type="text"
              className="form-input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. My Main Resume"
            />
          </div>

          <div
            className={`upload-zone ${dragActive ? 'active' : ''} ${file ? 'has-file' : ''}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileRef.current?.click()}
          >
            <input
              ref={fileRef}
              type="file"
              accept=".pdf,.docx"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              hidden
            />
            {file ? (
              <div className="upload-file-info">
                <span className="upload-file-icon">📄</span>
                <span className="upload-file-name">{file.name}</span>
                <span className="upload-file-size">({(file.size / 1024).toFixed(0)} KB)</span>
              </div>
            ) : (
              <div className="upload-placeholder">
                <span className="upload-icon">⬆️</span>
                <p><strong>Drop your resume here</strong> or click to browse</p>
                <span className="upload-hint">Supports PDF, DOCX (max 10MB)</span>
              </div>
            )}
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-block"
            disabled={uploading || !file}
          >
            {uploading ? '⏳ Uploading & Parsing...' : '🚀 Upload & Parse Resume'}
          </button>
        </form>
      </div>
    </div>
  );
}
