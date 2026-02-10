import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FileText, LayoutDashboard, Upload, FolderGit2, Wand2, Files, LogOut, User, LogIn } from 'lucide-react';
import './Navbar.css';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="navbar-inner container">
        <Link to="/" className="navbar-brand">
          <span className="brand-icon"><FileText size={24} /></span>
          <span className="brand-text">ResumeAI</span>
        </Link>

        <div className="navbar-links">
          {user ? (
            <>
              <Link to="/dashboard" className="nav-link"><LayoutDashboard size={18} /> Dashboard</Link>
              <Link to="/upload" className="nav-link"><Upload size={18} /> Upload</Link>
              <Link to="/projects" className="nav-link"><FolderGit2 size={18} /> Projects</Link>
              <Link to="/generate" className="nav-link"><Wand2 size={18} /> Generate</Link>
              <Link to="/my-resumes" className="nav-link"><Files size={18} /> My Resumes</Link>
              <div className="nav-user">
                <span className="nav-user-name"><User size={18} /> {user.name}</span>
                <button onClick={handleLogout} className="btn btn-ghost btn-sm">
                  <LogOut size={18} /> Logout
                </button>
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link"><LogIn size={18} /> Login</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Get Started</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
