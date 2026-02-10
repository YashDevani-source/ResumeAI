import { useState, useEffect } from 'react';
import api from '../services/api';
import { Github, FolderGit2, Star, GitFork, ExternalLink, RefreshCw, AlertCircle } from 'lucide-react';
import './Projects.css';

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', techStack: '', description: '', impact: '' });
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const fetchProjects = async () => {
    try {
      const res = await api.get('/projects');
      setProjects(res.data.projects);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProjects(); }, []);

  const handleSync = async () => {
    setSyncing(true);
    setError('');
    try {
      const res = await api.post('/projects/github/sync');
      setSuccessMsg(`Imported ${res.data.imported} projects from GitHub!`);
      fetchProjects();
    } catch (err) {
      setError(err.response?.data?.message || 'GitHub sync failed.');
    } finally {
      setSyncing(false);
    }
  };

  const handleAddProject = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/projects', {
        ...form,
        techStack: form.techStack.split(',').map((s) => s.trim()).filter(Boolean),
      });
      setForm({ title: '', techStack: '', description: '', impact: '' });
      setShowForm(false);
      setSuccessMsg('Project added!');
      fetchProjects();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add project.');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this project?')) return;
    try {
      await api.delete(`/projects/${id}`);
      setProjects((p) => p.filter((x) => x._id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="loading-container"><div className="spinner" /><p>Loading...</p></div>;

  return (
    <div className="page">
      <div className="container">
        <div className="page-header fade-in">
          <div className="header-row">
            <div>
              <h1>Projects</h1>
              <p>Manage your GitHub and manual projects for resume generation.</p>
            </div>
            <div className="header-actions">
              <button onClick={handleSync} className="btn btn-secondary" disabled={syncing}>
                {syncing ? <><RefreshCw size={16} className="spin" /> Syncing...</> : <><Github size={16} /> Sync GitHub</>}
              </button>
              <button onClick={() => setShowForm(!showForm)} className="btn btn-primary">
                + Add Project
              </button>
            </div>
          </div>
        </div>

        {error && <div className="alert alert-error">{error}</div>}
        {successMsg && <div className="alert alert-success">{successMsg}</div>}

        {showForm && (
          <form onSubmit={handleAddProject} className="project-form card fade-in">
            <h3>Add New Project</h3>
            <div className="form-group">
              <label>Title</label>
              <input className="form-input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>Tech Stack (comma-separated)</label>
              <input className="form-input" value={form.techStack} onChange={(e) => setForm({ ...form, techStack: e.target.value })} placeholder="React, Node.js, MongoDB" />
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea className="form-textarea" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Impact / Results</label>
              <input className="form-input" value={form.impact} onChange={(e) => setForm({ ...form, impact: e.target.value })} placeholder="e.g. Reduced load time by 40%" />
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button type="submit" className="btn btn-primary">Save Project</button>
              <button type="button" className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
        )}

        {projects.length === 0 ? (
          <div className="empty-state">
            <h3>No projects yet</h3>
            <p>Connect your GitHub or add projects manually.</p>
          </div>
        ) : (
          <div className="projects-grid grid grid-2">
            {projects.map((p) => (
              <div key={p._id} className="project-card card fade-in">
                <div className="project-header">
                  <h3>{p.title}</h3>
                  <span className={`tag ${p.source === 'github' ? '' : 'tag-warning'}`}>
                    {p.source === 'github' ? <><Github size={12} /> GitHub</> : <><FolderGit2 size={12} /> Manual</>}
                  </span>
                </div>
                {p.description && <p className="project-desc">{p.description}</p>}
                {p.techStack?.length > 0 && (
                  <div className="project-tech">
                    {p.techStack.map((t, i) => <span key={i} className="tag">{t}</span>)}
                  </div>
                )}
                {p.bullets?.length > 0 && (
                  <ul className="project-bullets">
                    {p.bullets.map((b, i) => <li key={i}>{b}</li>)}
                  </ul>
                )}
                 {p.githubData?.stars > 0 && (
                   <div className="project-meta"><Star size={12} /> {p.githubData.stars} • <GitFork size={12} /> {p.githubData.forks}</div>
                 )}
                <button onClick={() => handleDelete(p._id)} className="btn btn-danger btn-sm" style={{ marginTop: '12px' }}>
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
