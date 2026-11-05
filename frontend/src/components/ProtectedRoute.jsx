import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

// Only shows the page to logged-in users, everyone else goes to /login
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <p className="page-note">Checking your session...</p>;
  }

  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location.pathname, needLogin: true }}
      />
    );
  }

  return children;
}

export default ProtectedRoute;
