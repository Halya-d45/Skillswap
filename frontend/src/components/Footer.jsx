import { Link } from 'react-router-dom';
import { ArrowLeftRight, Heart } from 'lucide-react';
import '../styles/Footer.css';

function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          {/* Brand info */}
          <div className="footer-brand">
            <Link to="/" className="footer-logo">
              <div className="brand-icon-wrapper" style={{ width: 34, height: 34 }}>
                <ArrowLeftRight size={18} />
              </div>
              <span className="brand-name">SkillSwap</span>
            </Link>
            <p className="footer-desc">
              SkillSwap is a community-driven peer learning platform where you can teach what you love and master what you need. Zero money exchanged—pure mutual growth.
            </p>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="footer-heading">Quick Links</h4>
            <ul className="footer-links">
              <li>
                <Link to="/">Home</Link>
              </li>
              <li>
                <Link to="/explore">Explore Skills</Link>
              </li>
              <li>
                <Link to="/dashboard">My Dashboard</Link>
              </li>
              <li>
                <Link to="/requests">My Requests</Link>
              </li>
              <li>
                <Link to="/profile">User Profile</Link>
              </li>
            </ul>
          </div>

          {/* Popular Categories */}
          <div>
            <h4 className="footer-heading">Top Skills</h4>
            <ul className="footer-links">
              <li>
                <Link to="/explore?category=Programming">Programming & Tech</Link>
              </li>
              <li>
                <Link to="/explore?category=Design">UI/UX & Design</Link>
              </li>
              <li>
                <Link to="/explore?category=Languages">Language Exchange</Link>
              </li>
              <li>
                <Link to="/explore?category=Marketing">Digital Marketing</Link>
              </li>
              <li>
                <Link to="/explore?category=Music">Music & Audio</Link>
              </li>
            </ul>
          </div>

          {/* Stay Updated */}
          <div className="footer-newsletter">
            <h4 className="footer-heading">Join the Community</h4>
            <p>Get notified when mentors offering skills you want join SkillSwap.</p>
            <form onSubmit={(e) => { e.preventDefault(); alert('Thanks for subscribing to updates!'); }}>
              <div className="newsletter-input-group">
                <input
                  type="email"
                  className="newsletter-input"
                  placeholder="Enter your email"
                  required
                />
                <button type="submit" className="btn btn-primary btn-sm">
                  Join
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} SkillSwap Platform. All rights reserved.</p>
          <p>
            Made with <Heart size={14} className="footer-heart" /> for peer-to-peer learners
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
