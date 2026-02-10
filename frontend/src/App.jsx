import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import AuthCallback from './pages/AuthCallback';
import Dashboard from './pages/Dashboard';
import UploadResume from './pages/UploadResume';
import Projects from './pages/Projects';
import GenerateResume from './pages/GenerateResume';
import ResumePreview from './pages/ResumePreview';
import MyResumes from './pages/MyResumes';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Navbar />
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/upload" element={<ProtectedRoute><UploadResume /></ProtectedRoute>} />
          <Route path="/projects" element={<ProtectedRoute><Projects /></ProtectedRoute>} />
          <Route path="/generate" element={<ProtectedRoute><GenerateResume /></ProtectedRoute>} />
          <Route path="/preview/:id" element={<ProtectedRoute><ResumePreview /></ProtectedRoute>} />
          <Route path="/my-resumes" element={<ProtectedRoute><MyResumes /></ProtectedRoute>} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
