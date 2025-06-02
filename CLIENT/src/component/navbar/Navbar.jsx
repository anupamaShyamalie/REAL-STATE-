import { useState, useEffect, useContext } from 'react';
import './navbar.scss';
import { Link } from 'react-router';
import { AuthContext } from '../../context/AuthContext';


const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
   const {currentUser} = useContext(AuthContext);

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

  

  return (
    <>
      <div className='nav'>
        <div className="left">
          <a href="/" className='logo'>
            <img src="logo.png" alt="" />
            <span>
              VougeEstate
            </span>
          </a>
          <a href="">Home</a>
          <a href="">About</a>
          <a href="">Contact</a>
          <a href="">Agents</a>
        </div>
        <div className="right">
          {currentUser ? (
            <div className='user'>
              <img src={currentUser.avatar||"https://cdn.pixabay.com/photo/2016/08/08/09/17/avatar-1577909_640.png"} alt="" />
              <span>{currentUser.username}</span>
              <Link to="/profile" className='profile'>
                <div className="notifications">3</div>
                Profile
              </Link>
            </div>
          ) : (
            <>
              <a href="/register">SignUp</a>
              <a href="/login" className='register'>SignIn</a>
            </>
          )}

          <div className="menuIcon" onClick={() => setMenuOpen(true)}>
            <img src="menu.png" alt="Menu" />
          </div>
          <div className={`menu ${menuOpen ? 'active' : ''}`}>
            <div className="closeIcon" onClick={() => setMenuOpen(false)}>

            </div>
            <a href="">Home</a>
            <a href="">About</a>
            <a href="">Contact</a>
            <a href="">Agents</a>
            <a href="">SignUp</a>
            <a href="" className='register'>SignIn</a>
          </div>
        </div>
      </div>

      {/* Add overlay for better UX */}
      <div
        className={`menuOverlay ${menuOpen ? 'active' : ''}`}
        onClick={() => setMenuOpen(false)}
      />
    </>
  );
};

export default Navbar;