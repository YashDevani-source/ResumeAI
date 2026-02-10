import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Upload, FolderGit2, Wand2, FileText, Plus, Clock, Download } from 'lucide-react';
import './Dashboard.css';

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ resumes: 0, projects: 0, generated: 0 });
  const [recentGenerated, setRecentGenerated] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resumes, projects, generated] = await Promise.all([
          api.get('/resumes'),
          api.get('/projects'),
          api.get('/generate'),
        ]);
        setStats({
          resumes: resumes.data.count,
          projects: projects.data.count,
          generated: generated.data.count,
        });
        setRecentGenerated(generated.data.resumes?.slice(0, 5) || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return <div className="loading-container"><div className="spinner" /><p>Loading dashboard...</p></div>;
  }

  return (
    <div className="page">
      <div className="container">
        <div className="page-header fade-in">
          <h1>Welcome back, {user?.name?.split(' ')[0]} 👋</h1>
          <p>Manage your resumes and generate new ones tailored to any job.</p>
        </div>

        {/* Quick actions */}
        <div className="quick-actions-grid">
          <Link to="/upload" className="action-card fade-in">
            <div className="action-icon"><Upload size={32} /></div>
            <h3>Upload Resume</h3>
            <p>Start with your existing resume</p>
          </Link>
          <Link to="/projects" className="action-card fade-in" style={{ animationDelay: '0.1s' }}>
            <div className="action-icon"><FolderGit2 size={32} /></div>
            <h3>Import Projects</h3>
            <p>Connect GitHub repositories</p>
          </Link>
          <Link to="/generate" className="action-card fade-in" style={{ animationDelay: '0.2s' }}>
            <div className="action-icon"><Wand2 size={32} /></div>
            <h3>Generate Resume</h3>
            <p>Tailor for a specific job</p>
          </Link>
        </div>

        {/* Stats */}
        <div className="dashboard-stats fade-in" style={{ animationDelay: '0.1s' }}>
          <div className="stat-box card">
            <div className="stat-val">{stats.resumes}</div>
            <div className="stat-lbl">Base Resumes</div>
          </div>
          <div className="stat-box card">
            <div className="stat-val">{stats.projects}</div>
            <div className="stat-lbl">Projects</div>
          </div>
          <div className="stat-box card">
            <div className="stat-val">{stats.generated}</div>
            <div className="stat-lbl">Generated Resumes</div>
          </div>
        </div>

        {/* Recent generated */}
        <div className="recent-section fade-in" style={{ animationDelay: '0.2s' }}>
          <div className="section-header">
            <h2>Recent Resumes</h2>
            <Link to="/my-resumes" className="btn btn-ghost">View All</Link>
          </div>
          {recentGenerated.length === 0 ? (
            <div className="recent-list">
              <div className="empty-state">
                <div className="empty-icon"><FileText size={48} /></div>
                <p>No resumes generated yet.</p>
                <Link to="/generate" className="btn btn-primary btn-sm">
                  <Plus size={16} /> Create First Resume
                </Link>
              </div>
            </div>
          ) : (
            <div className="recent-list">
              {recentGenerated.map((r) => (
                <Link key={r._id} to={`/preview/${r._id}`} className="recent-item card">
                  <div>
                    <div className="recent-role">{r.roleTag}</div>
                    <div className="recent-date">{new Date(r.createdAt).toLocaleDateString()}</div>
                  </div>
                  {r.atsScore && (
                    <span className={`ats-score ${r.atsScore >= 80 ? 'high' : r.atsScore >= 60 ? 'medium' : 'low'}`}>
                      ATS: {r.atsScore}%
                    </span>
                  )}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
