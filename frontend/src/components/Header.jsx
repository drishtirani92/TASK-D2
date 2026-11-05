import { Link, useNavigate, useLocation } from 'react-router-dom';
import Swal from 'sweetalert2';
import { useAuth } from '../context/AuthContext.jsx';
import SectionNav from './SectionNav.jsx';

function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isHome = location.pathname === '/';

  const handleLogout = () => {
    logout(); // clears the token from localStorage
    navigate('/');
    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: 'success',
      title: 'You have been logged out',
      showConfirmButton: false,
      timer: 2000,
    });
  };

  return (
    <div className="site-top">
      <header className="header">
        <Link to="/" className="logo">
          DEV@Deakin
        </Link>

        <input type="text" className="search" placeholder="Search..." />

        <nav className="header-links">
          <Link to="/browse">Browse Posts</Link>
          <Link to="/pricing">Pricing</Link>
        </nav>

        <div className="header-buttons">
          <Link to="/post" className="btn">
            Post
          </Link>

          {user ? (
            <>
              <span className="user-name">
                Hi, {user.firstName}
                <span className={`plan-badge ${user.plan}`}>
                  {user.plan === 'paid' ? 'Paid' : 'Free'}
                </span>
              </span>
              <button type="button" className="btn" onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn">
                Login
              </Link>
              <Link to="/signup" className="btn btn-main">
                Sign up
              </Link>
            </>
          )}
        </div>
      </header>
      {/* the section menu only makes sense on the home page */}
      {isHome && <SectionNav />}
    </div>
  );
}

export default Header;
