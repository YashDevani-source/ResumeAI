import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sparkles, FileText, FolderGit2, Target, Zap } from 'lucide-react';
import './Landing.css';

export default function Landing() {
  const { user } = useAuth();

  return (
    <div className="landing">
      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <div className="hero-content fade-in">
            <div className="hero-badge"><Sparkles size={16} /> AI-Powered Resume Generator</div>
            <h1 className="hero-title">
              Build <span className="gradient-text">ATS-Optimized</span><br />
              Resumes in Minutes
            </h1>
            <p className="hero-subtitle">
              Upload your resume once, paste any job description, and let AI generate
              a perfectly tailored, template-preserving resume every time.
            </p>
            <div className="hero-cta">
              {user ? (
                <Link to="/dashboard" className="btn btn-primary btn-lg">
                  Go to Dashboard →
                </Link>
              ) : (
                <>
                  <Link to="/register" className="btn btn-primary btn-lg">
                    Start Free →
                  </Link>
                  <Link to="/login" className="btn btn-secondary btn-lg">
                    Sign In
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
        <div className="hero-glow" />
      </section>

      {/* Features Section */}
      <section className="features">
        <div className="container">
          <h2 className="section-title">How It Works</h2>
          <div className="features-grid">
            <div className="feature-card card fade-in">
              <div className="feature-icon"><FileText size={32} /></div>
              <h3>Upload Resume</h3>
              <p>Upload your existing PDF or DOCX resume. We extract your experience, skills, and template design.</p>
            </div>
            <div className="feature-card card fade-in" style={{ animationDelay: '0.1s' }}>
              <div className="feature-icon"><FolderGit2 size={32} /></div>
              <h3>Connect GitHub</h3>
              <p>Import your projects automatically. AI converts repos into resume-ready bullet points.</p>
            </div>
            <div className="feature-card card fade-in" style={{ animationDelay: '0.2s' }}>
              <div className="feature-icon"><Target size={32} /></div>
              <h3>Paste Job Description</h3>
              <p>Paste any job posting. Our AI extracts keywords and requirements for optimal matching.</p>
            </div>
            <div className="feature-card card fade-in" style={{ animationDelay: '0.3s' }}>
              <div className="feature-icon"><Zap size={32} /></div>
              <h3>Generate & Export</h3>
              <p>Get a tailored, ATS-optimized resume that preserves your original template. Export as PDF or DOCX.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="stats-section">
        <div className="container">
          <div className="stats-grid">
            <div className="stat-card">
              <span className="stat-number">95%</span>
              <span className="stat-label">ATS Pass Rate</span>
            </div>
            <div className="stat-card">
              <span className="stat-number">10x</span>
              <span className="stat-label">Faster Than Manual</span>
            </div>
            <div className="stat-card">
              <span className="stat-number">∞</span>
              <span className="stat-label">Resume Versions</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="container">
          <p>Built with <Zap size={16} style={{ display: 'inline', verticalAlign: 'middle' }} /> ResumeAI — Powered by ZnapAI</p>
        </div>
      </footer>
    </div>
  );
}
