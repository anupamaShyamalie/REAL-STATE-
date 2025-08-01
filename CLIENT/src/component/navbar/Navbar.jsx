import { useState, useEffect, useContext } from 'react';
import './navbar.scss';
import { Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { 
  Menu, 
  X, 
  Home, 
  User, 
  LogOut, 
  Bell, 
  Search,
  MapPin,
  Phone,
  Users
} from 'lucide-react';

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const { currentUser, updateUser } = useContext(AuthContext);
  const { unreadCount } = useSocket();
  const location = useLocation();
  
  // Close menu when clicking outside or on escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        setMenuOpen(false);
      }
    };

    const handleClickOutside = (e) => {
      if (menuOpen && e.target.classList.contains('menuOverlay')) {
        setMenuOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    document.addEventListener('click', handleClickOutside);

    // Prevent scrolling when menu is open
    if (menuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('click', handleClickOutside);
      document.body.style.overflow = 'auto';
    };
  }, [menuOpen]);

  // Close menu when route changes
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });
      if (response.ok) {
        updateUser(null);
      }
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const isActiveLink = (path) => {
    return location.pathname === path;
  };

  return (
    <>
      <nav className="navbar">
        <div className="navbar-container">
          {/* Logo Section */}
          <div className="navbar-brand">
            <Link to="/" className="logo">
              <img src="logo.png" alt="VougeEstate" />
              <span className="logo-text">VougeEstate</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="navbar-nav desktop-nav">
            <Link 
              to="/" 
              className={`nav-link ${isActiveLink('/') ? 'active' : ''}`}
            >
              <Home size={18} />
              <span>Home</span>
            </Link>
            <Link 
              to="/list" 
              className={`nav-link ${isActiveLink('/list') ? 'active' : ''}`}
            >
              <Search size={18} />
              <span>Properties</span>
            </Link>
            <Link 
              to="/about" 
              className={`nav-link ${isActiveLink('/about') ? 'active' : ''}`}
            >
              <MapPin size={18} />
              <span>About</span>
            </Link>
            <Link 
              to="/contact" 
              className={`nav-link ${isActiveLink('/contact') ? 'active' : ''}`}
            >
              <Phone size={18} />
              <span>Contact</span>
            </Link>
            <Link 
              to="/agents" 
              className={`nav-link ${isActiveLink('/agents') ? 'active' : ''}`}
            >
              <Users size={18} />
              <span>Agents</span>
            </Link>
          </div>

          {/* User Section */}
          <div className="navbar-user">
            {currentUser ? (
              <div className="user-section">
                {/* Notification Badge */}
                {unreadCount > 0 && (
                  <div className="notification-badge">
                    <Bell size={20} />
                    <span className="badge-count">{unreadCount}</span>
                  </div>
                )}
                
                {/* User Profile */}
                <div className="user-profile">
                  <img 
                    src={currentUser.avatar || "https://cdn.pixabay.com/photo/2016/08/08/09/17/avatar-1577909_640.png"} 
                    alt={currentUser.username} 
                    className="user-avatar"
                  />
                  <span className="user-name">{currentUser.username}</span>
                </div>
                
                {/* Profile Dropdown */}
                <div className="profile-dropdown">
                  <Link to="/profile" className="dropdown-item">
                    <User size={16} />
                    <span>Profile</span>
                  </Link>
                  <button onClick={handleLogout} className="dropdown-item logout-btn">
                    <LogOut size={16} />
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="auth-buttons">
                <Link to="/register" className="btn btn-outline">
                  Sign Up
                </Link>
                <Link to="/login" className="btn btn-primary">
                  Sign In
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button 
              className="mobile-menu-btn"
              onClick={() => setMenuOpen(true)}
              aria-label="Open menu"
            >
              <Menu size={24} />
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div className={`mobile-menu ${menuOpen ? 'active' : ''}`}>
          <div className="mobile-menu-header">
            <div className="mobile-logo">
              <img src="logo.png" alt="VougeEstate" />
              <span>VougeEstate</span>
            </div>
            <button 
              className="close-menu-btn"
              onClick={() => setMenuOpen(false)}
              aria-label="Close menu"
            >
              <X size={24} />
            </button>
          </div>

          <div className="mobile-menu-nav">
            <Link 
              to="/" 
              className={`mobile-nav-link ${isActiveLink('/') ? 'active' : ''}`}
              onClick={() => setMenuOpen(false)}
            >
              <Home size={20} />
              <span>Home</span>
            </Link>
            <Link 
              to="/list" 
              className={`mobile-nav-link ${isActiveLink('/list') ? 'active' : ''}`}
              onClick={() => setMenuOpen(false)}
            >
              <Search size={20} />
              <span>Properties</span>
            </Link>
            <Link 
              to="/about" 
              className={`mobile-nav-link ${isActiveLink('/about') ? 'active' : ''}`}
              onClick={() => setMenuOpen(false)}
            >
              <MapPin size={20} />
              <span>About</span>
            </Link>
            <Link 
              to="/contact" 
              className={`mobile-nav-link ${isActiveLink('/contact') ? 'active' : ''}`}
              onClick={() => setMenuOpen(false)}
            >
              <Phone size={20} />
              <span>Contact</span>
            </Link>
            <Link 
              to="/agents" 
              className={`mobile-nav-link ${isActiveLink('/agents') ? 'active' : ''}`}
              onClick={() => setMenuOpen(false)}
            >
              <Users size={20} />
              <span>Agents</span>
            </Link>
          </div>

          {currentUser ? (
            <div className="mobile-user-section">
              <div className="mobile-user-info">
                <img 
                  src={currentUser.avatar || "https://cdn.pixabay.com/photo/2016/08/08/09/17/avatar-1577909_640.png"} 
                  alt={currentUser.username} 
                  className="mobile-user-avatar"
                />
                <div className="mobile-user-details">
                  <span className="mobile-user-name">{currentUser.username}</span>
                  <span className="mobile-user-email">{currentUser.email}</span>
                </div>
              </div>
              
              <div className="mobile-user-actions">
                <Link to="/profile" className="mobile-action-btn">
                  <User size={18} />
                  <span>Profile</span>
                </Link>
                <button onClick={handleLogout} className="mobile-action-btn logout">
                  <LogOut size={18} />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="mobile-auth-buttons">
              <Link to="/register" className="mobile-btn btn-outline">
                Sign Up
              </Link>
              <Link to="/login" className="mobile-btn btn-primary">
                Sign In
              </Link>
            </div>
          )}
        </div>

        {/* Overlay */}
        <div
          className={`menuOverlay ${menuOpen ? 'active' : ''}`}
          onClick={() => setMenuOpen(false)}
        />
      </nav>
    </>
  );
};

export default Navbar;