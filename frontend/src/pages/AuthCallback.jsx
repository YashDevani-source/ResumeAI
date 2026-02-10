import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function AuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      localStorage.setItem('token', token);
      // Fetch user data
      api.get('/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => {
          login(token, res.data.user);
          navigate('/dashboard');
        })
        .catch(() => navigate('/login'));
    } else {
      navigate('/login');
    }
  }, [searchParams, navigate, login]);

  return (
    <div className="loading-container">
      <div className="spinner" />
      <p>Authenticating...</p>
    </div>
  );
}
