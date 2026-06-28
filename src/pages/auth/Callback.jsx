import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

export default function AuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  useEffect(() => {
    if (token) {
      try {
        
        const decoded = JSON.parse(atob(token));
        const role = decoded.role || 'student';
        const email = decoded.email || '';
        
        
        const name = email.split('@')[0].replace(/\./g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        
        
        const userData = {
          email: email,
          role: role,
          name: name
        };
        localStorage.setItem('user', JSON.stringify(userData));
        
        console.log(' User data stored in localStorage:', userData);
        console.log(' Role:', role);

        
        if (role === 'landlord') {
          navigate('/landlord-dashboard');
        } else {
          navigate('/student-dashboard');
        }
      } catch (error) {
        console.error('Invalid token:', error);
        navigate('/');
      }
    } else {
      console.log('No token found, redirecting to login');
      navigate('/');
    }
  }, [token, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Authenticating...</p>
      </div>
    </div>
  );
}