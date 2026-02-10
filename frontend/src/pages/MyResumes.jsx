import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { FileText, Download, Eye, Edit, Trash2, Calendar, Plus, AlertCircle, RefreshCw, Wand2 } from 'lucide-react';
import './MyResumes.css';

export default function MyResumes() {
  const [generated, setGenerated] = useState([]);
  const [baseResumes, setBaseResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('generated');
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [g, b] = await Promise.all([
          api.get('/generate'),
          api.get('/resumes'),
        ]);
        setGenerated(g.data.resumes);
        setBaseResumes(b.data.resumes);
      } catch (err) {
        console.error(err);
        setError('Failed to load resumes. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleDeleteGenerated = async (id) => {
    if (!confirm('Delete this generated resume?')) return;
    try {
      api.delete(`/generate/${id}`);
      setGenerated((prev) => prev.filter((r) => r._id !== id));
    } catch (err) {
      console.error(err);
      setError('Failed to delete generated resume.');
    }
  };

  const handleDeleteBase = async (id) => {
    if (!confirm('Delete this base resume?')) return;
    try {
      api.delete(`/resumes/${id}`);
      setBaseResumes((prev) => prev.filter((r) => r._id !== id));
    } catch (err) {
      console.error(err);
      setError('Failed to delete base resume.');
    }
  };

  if (loading) return <div className="loading-container"><div className="spinner" /><p>Loading...</p></div>;

  return (
    <div className="page">
      <div className="container">
        <div className="page-header fade-in">
          <h1><FileText size={32} /> My Resumes</h1>
          <p>Manage your base and generated resume versions.</p>
        </div>

        {/* Tabs */}
        <div className="tabs fade-in">
          <button
            className={`tab ${activeTab === 'generated' ? 'active' : ''}`}
            onClick={() => setActiveTab('generated')}
          >
            Generated Resumes ({generated.length})
          </button>
          <button
            className={`tab ${activeTab === 'base' ? 'active' : ''}`}
            onClick={() => setActiveTab('base')}
          >
            Base Resumes ({baseResumes.length})
          </button>
        </div>

        {error && (
            <div className="error-message fade-in">
            <AlertCircle size={20} /> {error}
            </div>
        )}

        {/* Generated tab */}
        {activeTab === 'generated' && (
          <div className="fade-in">
            {generated.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon"><FileText size={48} /></div>
                <h3>No generated resumes</h3>
                <p>Generate your first tailored resume.</p>
                <Link to="/generate" className="btn btn-primary"><Wand2 size={18} /> Generate Resume</Link>
              </div>
            ) : (
              <div className="resumes-grid grid grid-2">
                {generated.map((r) => (
                  <div key={r._id} className="resume-card card">
                    <div className="resume-card-header">
                      <h3>{r.roleTag}</h3>
                      {r.atsScore && (
                        <span className={`ats-score ${r.atsScore >= 80 ? 'high' : r.atsScore >= 60 ? 'medium' : 'low'}`}>
                          {r.atsScore}%
                        </span>
                      )}
                    </div>
                    <div className="resume-card-meta">
                      <span>Base: {r.baseResumeId?.title || '—'}</span>
                      <span><Calendar size={14} /> {new Date(r.createdAt).toLocaleDateString()}</span>
                    </div>
                    {r.extractedKeywords?.length > 0 && (
                      <div className="resume-card-tags">
                        {r.extractedKeywords.slice(0, 5).map((kw, i) => (
                          <span key={i} className="tag">{kw}</span>
                        ))}
                        {r.extractedKeywords.length > 5 && (
                          <span className="tag">+{r.extractedKeywords.length - 5}</span>
                        )}
                      </div>
                    )}
                    <div className="resume-card-actions">
                      <Link to={`/preview/${r._id}`} className="btn btn-secondary btn-sm" title="View & Export">
                        <Eye size={16} /> View
                      </Link>
                      <button onClick={() => handleDeleteGenerated(r._id)} className="btn btn-danger btn-sm" title="Delete">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Base tab */}
        {activeTab === 'base' && (
          <div className="fade-in">
            {baseResumes.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon"><FileText size={48} /></div>
                <h3>No base resumes</h3>
                <p>Upload your first resume to get started.</p>
                <Link to="/upload" className="btn btn-primary"><Plus size={18} /> Upload Resume</Link>
              </div>
            ) : (
              <div className="resumes-grid grid grid-2">
                {baseResumes.map((r) => (
                  <div key={r._id} className="resume-card card">
                    <h3>{r.title}</h3>
                    <div className="resume-card-meta">
                      <span>{r.originalFileName}</span>
                      <span><Calendar size={14} /> {new Date(r.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="resume-card-actions">
                      <button onClick={() => handleDeleteBase(r._id)} className="btn btn-danger btn-sm" title="Delete">
                        <Trash2 size={16} /> Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
