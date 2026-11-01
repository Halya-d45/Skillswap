import { useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeftRight,
  Compass,
  LayoutDashboard,
  Inbox,
  MessageSquare,
  User,
  LogIn,
  UserPlus,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import '../styles/Navbar.css';

function Navbar({ currentUser, onLogout }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  const handleLogoutClick = () => {
    onLogout();
    closeMobileMenu();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="container navbar-container">
        {/* Brand Logo */}
        <Link to="/" className="navbar-brand" onClick={closeMobileMenu}>
          <div className="brand-icon-wrapper">
            <ArrowLeftRight size={22} />
          </div>
          <span className="brand-name">SkillSwap</span>
        </Link>

        {/* Desktop Navigation Links */}
        <ul className="nav-links">
          <li>
            <NavLink
              to="/"
              className={({ isActive }) =>
                isActive ? 'nav-link active' : 'nav-link'
              }
              end
            >
              Home
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/explore"
              className={({ isActive }) =>
                isActive ? 'nav-link active' : 'nav-link'
              }
            >
              <Compass size={18} />
              Explore Skills
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/dashboard"
              className={({ isActive }) =>
                isActive ? 'nav-link active' : 'nav-link'
              }
            >
              <LayoutDashboard size={18} />
              Dashboard
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/requests"
              className={({ isActive }) =>
                isActive ? 'nav-link active' : 'nav-link'
              }
            >
              <Inbox size={18} />
              My Requests
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/chats"
              className={({ isActive }) =>
                isActive ? 'nav-link active' : 'nav-link'
              }
            >
              <MessageSquare size={18} />
              Chats
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/profile"
              className={({ isActive }) =>
                isActive ? 'nav-link active' : 'nav-link'
              }
            >
              <User size={18} />
              Profile
            </NavLink>
          </li>
        </ul>

        {/* Desktop Auth Controls */}
        <div className="navbar-actions">
          {currentUser ? (
            <>
              <Link to="/profile" className="user-profile-badge">
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="user-avatar-mini"
                />
                <span className="user-name-mini">{currentUser.name}</span>
              </Link>
              <button
                type="button"
                className="btn-logout"
                onClick={handleLogoutClick}
                title="Log out"
              >
                <LogOut size={16} />
                <span>Logout</span>
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-outline btn-sm">
                <LogIn size={16} />
                Login
              </Link>
              <Link to="/signup" className="btn btn-primary btn-sm">
                <UserPlus size={16} />
                Sign Up
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Hamburger Toggle */}
        <button
          type="button"
          className="mobile-toggle-btn"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? <X size={26} /> : <Menu size={26} />}
        </button>
      </div>

      {/* Mobile Drawer Menu */}
      <div className={`mobile-nav ${mobileMenuOpen ? 'open' : ''}`}>
        <ul className="mobile-nav-links">
          <li>
            <NavLink
              to="/"
              className={({ isActive }) =>
                isActive ? 'mobile-nav-link active' : 'mobile-nav-link'
              }
              onClick={closeMobileMenu}
              end
            >
              Home
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/explore"
              className={({ isActive }) =>
                isActive ? 'mobile-nav-link active' : 'mobile-nav-link'
              }
              onClick={closeMobileMenu}
            >
              <Compass size={18} />
              Explore Skills
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/dashboard"
              className={({ isActive }) =>
                isActive ? 'mobile-nav-link active' : 'mobile-nav-link'
              }
              onClick={closeMobileMenu}
            >
              <LayoutDashboard size={18} />
              Dashboard
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/requests"
              className={({ isActive }) =>
                isActive ? 'mobile-nav-link active' : 'mobile-nav-link'
              }
              onClick={closeMobileMenu}
            >
              <Inbox size={18} />
              My Requests
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/chats"
              className={({ isActive }) =>
                isActive ? 'mobile-nav-link active' : 'mobile-nav-link'
              }
              onClick={closeMobileMenu}
            >
              <MessageSquare size={18} />
              Chats
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/profile"
              className={({ isActive }) =>
                isActive ? 'mobile-nav-link active' : 'mobile-nav-link'
              }
              onClick={closeMobileMenu}
            >
              <User size={18} />
              Profile
            </NavLink>
          </li>
        </ul>

        <div className="mobile-auth-actions">
          {currentUser ? (
            <>
              <Link
                to="/profile"
                className="user-profile-badge"
                onClick={closeMobileMenu}
              >
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="user-avatar-mini"
                />
                <span className="user-name-mini">{currentUser.name}</span>
              </Link>
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={handleLogoutClick}
              >
                <LogOut size={16} />
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="btn btn-outline"
                onClick={closeMobileMenu}
              >
                <LogIn size={16} />
                Login
              </Link>
              <Link
                to="/signup"
                className="btn btn-primary"
                onClick={closeMobileMenu}
              >
                <UserPlus size={16} />
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
