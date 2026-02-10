import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import './GenerateResume.css';

export default function GenerateResume() {
  const [resumes, setResumes] = useState([]);
  const [projects, setProjects] = useState([]);
  const [selectedResume, setSelectedResume] = useState('');
  const [selectedProjects, setSelectedProjects] = useState([]);
  const [jobDescription, setJobDescription] = useState('');
  const [roleTag, setRoleTag] = useState('');
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [r, p] = await Promise.all([
          api.get('/resumes'),
          api.get('/projects'),
        ]);
        setResumes(r.data.resumes);
        setProjects(p.data.projects);
        if (r.data.resumes.length > 0) setSelectedResume(r.data.resumes[0]._id);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const toggleProject = (id) => {
    setSelectedProjects((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!selectedResume || !jobDescription || !roleTag) {
      setError('Please fill in all required fields.');
      return;
    }
    setError('');
    setGenerating(true);

    try {
      const res = await api.post('/generate', {
        baseResumeId: selectedResume,
        jobDescription,
        roleTag,
        selectedProjectIds: selectedProjects,
      });
      navigate(`/preview/${res.data.generatedResume._id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Generation failed.');
    } finally {
      setGenerating(false);
    }
  };

  if (loading) return <div className="loading-container"><div className="spinner" /><p>Loading...</p></div>;

  if (resumes.length === 0) {
    return (
      <div className="page">
        <div className="container">
          <div className="empty-state">
            <h3>No base resume found</h3>
            <p>You need to upload a resume before you can generate tailored versions.</p>
            <button onClick={() => navigate('/upload')} className="btn btn-primary">Upload Resume</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: '800px' }}>
        <div className="page-header fade-in">
          <h1>⚡ Generate Resume</h1>
          <p>Select your base resume, paste a job description, and let AI create a tailored version.</p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleGenerate} className="fade-in">
          {/* Base Resume Selection */}
          <div className="form-group">
            <label>Base Resume *</label>
            <select
              className="form-select"
              value={selectedResume}
              onChange={(e) => setSelectedResume(e.target.value)}
            >
              {resumes.map((r) => (
                <option key={r._id} value={r._id}>{r.title}</option>
              ))}
            </select>
          </div>

          {/* Role Tag */}
          <div className="form-group">
            <label>Role Tag *</label>
            <input
              type="text"
              className="form-input"
              value={roleTag}
              onChange={(e) => setRoleTag(e.target.value)}
              placeholder="e.g. Frontend Engineer, ML Engineer, Full-Stack Developer"
              required
            />
          </div>

          {/* Job Description */}
          <div className="form-group">
            <label>Job Description *</label>
            <textarea
              className="form-textarea"
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste the full job description here..."
              style={{ minHeight: '200px' }}
              required
            />
          </div>

          {/* Project Selection */}
          {projects.length > 0 && (
            <div className="form-group">
              <label>Select Projects to Include (optional — all included if none selected)</label>
              <div className="project-select-grid">
                {projects.map((p) => (
                  <label key={p._id} className={`project-select-item card ${selectedProjects.includes(p._id) ? 'selected' : ''}`}>
                    <input
                      type="checkbox"
                      checked={selectedProjects.includes(p._id)}
                      onChange={() => toggleProject(p._id)}
                    />
                    <div>
                      <strong>{p.title}</strong>
                      {p.techStack?.length > 0 && (
                        <span className="project-select-tech">{p.techStack.slice(0, 3).join(', ')}</span>
                      )}
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}

          <button type="submit" className="btn btn-primary btn-lg btn-block" disabled={generating}>
            {generating ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div className="spinner" style={{ width: '20px', height: '20px', borderWidth: '2px' }} />
                Generating... (this may take 30-60s)
              </span>
            ) : (
              '⚡ Generate Tailored Resume'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
