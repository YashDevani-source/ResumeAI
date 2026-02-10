import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import './ResumePreview.css';

export default function ResumePreview() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [resume, setResume] = useState(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState('');

  useEffect(() => {
    api.get(`/generate/${id}`)
      .then((res) => setResume(res.data.resume))
      .catch(() => navigate('/my-resumes'))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  const handleExport = async (format) => {
    setExporting(format);
    try {
      const res = await api.get(`/generate/${id}/export?format=${format}`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.download = `${resume.roleTag}-resume.${format}`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export failed:', err);
    } finally {
      setExporting('');
    }
  };

  if (loading) return <div className="loading-container"><div className="spinner" /><p>Loading resume...</p></div>;
  if (!resume) return null;

  const c = resume.generatedContent;

  return (
    <div className="page">
      <div className="container">
        {/* Header bar */}
        <div className="preview-header fade-in">
          <div>
            <h1>{resume.roleTag}</h1>
            <p className="preview-date">
              Generated {new Date(resume.createdAt).toLocaleDateString()} • 
              Base: {resume.baseResumeId?.title || 'Resume'}
            </p>
          </div>
          <div className="preview-actions">
            {resume.atsScore && (
              <span className={`ats-score ${resume.atsScore >= 80 ? 'high' : resume.atsScore >= 60 ? 'medium' : 'low'}`}>
                ATS: {resume.atsScore}%
              </span>
            )}
            <button onClick={() => handleExport('pdf')} className="btn btn-primary btn-sm" disabled={!!exporting}>
              {exporting === 'pdf' ? '⏳' : '📄'} PDF
            </button>
            <button onClick={() => handleExport('docx')} className="btn btn-secondary btn-sm" disabled={!!exporting}>
              {exporting === 'docx' ? '⏳' : '📝'} DOCX
            </button>
          </div>
        </div>

        {/* Keywords */}
        {resume.extractedKeywords?.length > 0 && (
          <div className="keywords-section fade-in" style={{ animationDelay: '0.05s' }}>
            <h4>Matched Keywords</h4>
            <div className="keywords-list">
              {resume.extractedKeywords.map((kw, i) => (
                <span key={i} className="tag">{kw}</span>
              ))}
            </div>
          </div>
        )}

        {/* Resume content preview */}
        <div className="resume-paper fade-in" style={{ animationDelay: '0.1s' }}>
          {/* Summary */}
          {c.summary && (
            <section className="resume-section">
              <h2>Professional Summary</h2>
              <p>{c.summary}</p>
            </section>
          )}

          {/* Education */}
          {c.education?.length > 0 && (
            <section className="resume-section">
              <h2>Education</h2>
              {c.education.map((edu, i) => (
                <div key={i} className="resume-entry">
                  <div className="entry-header">
                    <strong>{edu.institution}</strong>
                    <span className="entry-date">{edu.startDate} — {edu.endDate}</span>
                  </div>
                  <div className="entry-sub">{edu.degree} {edu.field && `in ${edu.field}`}{edu.gpa && ` • GPA: ${edu.gpa}`}</div>
                  {edu.details && <p className="entry-details">{edu.details}</p>}
                </div>
              ))}
            </section>
          )}

          {/* Experience */}
          {c.experience?.length > 0 && (
            <section className="resume-section">
              <h2>Experience</h2>
              {c.experience.map((exp, i) => (
                <div key={i} className="resume-entry">
                  <div className="entry-header">
                    <strong>{exp.role} — {exp.company}</strong>
                    <span className="entry-date">{exp.startDate} — {exp.endDate}</span>
                  </div>
                  {exp.location && <div className="entry-sub">{exp.location}</div>}
                  {exp.bullets?.length > 0 && (
                    <ul className="entry-bullets">
                      {exp.bullets.map((b, j) => <li key={j}>{b}</li>)}
                    </ul>
                  )}
                </div>
              ))}
            </section>
          )}

          {/* Skills */}
          {c.skills && (
            <section className="resume-section">
              <h2>Skills</h2>
              <div className="skills-grid">
                {c.skills.technical?.length > 0 && (
                  <div><strong>Technical:</strong> {c.skills.technical.join(', ')}</div>
                )}
                {c.skills.tools?.length > 0 && (
                  <div><strong>Tools:</strong> {c.skills.tools.join(', ')}</div>
                )}
                {c.skills.languages?.length > 0 && (
                  <div><strong>Languages:</strong> {c.skills.languages.join(', ')}</div>
                )}
                {c.skills.soft?.length > 0 && (
                  <div><strong>Soft Skills:</strong> {c.skills.soft.join(', ')}</div>
                )}
              </div>
            </section>
          )}

          {/* Projects */}
          {c.projects?.length > 0 && (
            <section className="resume-section">
              <h2>Projects</h2>
              {c.projects.map((proj, i) => (
                <div key={i} className="resume-entry">
                  <div className="entry-header">
                    <strong>{proj.title}</strong>
                  </div>
                  {proj.techStack?.length > 0 && (
                    <div className="entry-sub">Tech: {proj.techStack.join(', ')}</div>
                  )}
                  {proj.bullets?.length > 0 && (
                    <ul className="entry-bullets">
                      {proj.bullets.map((b, j) => <li key={j}>{b}</li>)}
                    </ul>
                  )}
                </div>
              ))}
            </section>
          )}

          {/* Certifications */}
          {c.certifications?.length > 0 && (
            <section className="resume-section">
              <h2>Certifications</h2>
              {c.certifications.map((cert, i) => (
                <p key={i} className="entry-details">
                  {cert.name}{cert.issuer && ` — ${cert.issuer}`}{cert.date && ` (${cert.date})`}
                </p>
              ))}
            </section>
          )}

          {/* Achievements */}
          {c.achievements?.length > 0 && (
            <section className="resume-section">
              <h2>Achievements</h2>
              <ul className="entry-bullets">
                {c.achievements.map((a, i) => <li key={i}>{a}</li>)}
              </ul>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
