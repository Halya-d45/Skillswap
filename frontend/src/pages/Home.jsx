import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  Compass,
  ArrowLeftRight,
  BookOpen,
  Users,
  TrendingUp,
} from 'lucide-react';
import SkillCard from '../components/SkillCard';
import { skillService } from '../services/api';
import { initialSkillsList } from '../data/mockData';
import '../styles/Home.css';

function Home({ currentUser }) {
  const navigate = useNavigate();
  const [popularSkills, setPopularSkills] = useState(initialSkillsList.slice(0, 3));

  // Try fetching live skills from backend, fallback to initial sample
  useEffect(() => {
    const fetchTopSkills = async () => {
      try {
        const data = await skillService.getAllSkills();
        if (Array.isArray(data) && data.length > 0) {
          const mapped = data.slice(0, 3).map((item) => {
            const user = item.userId || item.user || {};
            return {
              id: item._id,
              userName: user.name || 'Community Member',
              userRole: user.bio ? user.bio.slice(0, 35) + '...' : 'SkillSwapper',
              userAvatar:
                user.profileImage ||
                user.avatar ||
                'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200',
              skillName: item.skillName,
              category: item.category,
              level: item.level || 'Intermediate',
              description: item.description,
              wantsToLearn: item.wantsToLearn || 'Web Design',
              rating: item.rating || 5.0,
              reviewsCount: item.reviewsCount || 12,
            };
          });
          setPopularSkills(mapped);
        }
      } catch {
        // Fallback to initial sample skills
      }
    };

    fetchTopSkills();
  }, []);

  const handleRequestClick = (skill) => {
    navigate(`/explore?search=${encodeURIComponent(skill.skillName)}`);
  };

  return (
    <div className="home-page">
      {/* 1. Hero Section */}
      <section className="hero-section">
        <div className="container hero-grid">
          <div className="hero-content">
            <div className="hero-badge">
              <Sparkles size={16} />
              <span>Peer-to-Peer Collaborative Learning</span>
            </div>

            <h1 className="hero-title">
              Share Your Skills, <br />
              <span className="hero-highlight">Learn Something New</span>
            </h1>

            <p className="hero-description">
              SkillSwap is a vibrant community where knowledge is the only currency.
              Teach what you are passionate about, connect with mentors worldwide,
              and trade skills without paying a dime.
            </p>

            <div className="hero-cta-group">
              <Link
                to={currentUser ? '/dashboard' : '/signup'}
                className="btn btn-primary btn-lg"
              >
                {currentUser ? 'Go to Dashboard' : 'Get Started Free'}
                <ArrowRight size={18} />
              </Link>
              <Link to="/explore" className="btn btn-outline btn-lg">
                <Compass size={18} />
                Explore Skills
              </Link>
            </div>
          </div>

          {/* Hero Visual Preview Card */}
          <div className="hero-visual">
            <div className="hero-card-stack">
              <div className="hero-floating-card">
                <div className="swap-preview-header">
                  <span className="swap-preview-title">Live Skill Exchange</span>
                  <span className="badge badge-purple">Mutual Match</span>
                </div>

                <div className="swap-nodes-container">
                  {/* Person 1 */}
                  <div className="swap-node">
                    <img
                      src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200"
                      alt="Alex"
                      className="swap-node-avatar"
                    />
                    <div className="swap-node-info">
                      <div className="swap-node-name">Alex Morgan</div>
                      <div className="swap-node-skill">Teaches: Python & Django</div>
                    </div>
                  </div>

                  {/* Swap Indicator */}
                  <div className="swap-icon-divider">
                    <ArrowLeftRight size={22} />
                  </div>

                  {/* Person 2 */}
                  <div className="swap-node">
                    <img
                      src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200"
                      alt="Sarah"
                      className="swap-node-avatar"
                    />
                    <div className="swap-node-info">
                      <div className="swap-node-name">Sarah Chen</div>
                      <div className="swap-node-skill">Teaches: UI/UX & Figma</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Key Stats Strip */}
      <section className="stats-section">
        <div className="container">
          <div className="stats-grid">
            <div className="stat-item">
              <span className="stat-number">2,500+</span>
              <span className="stat-label">Skills Offered</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">1,800+</span>
              <span className="stat-label">Active Learners</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">4,200+</span>
              <span className="stat-label">Successful Swaps</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">100%</span>
              <span className="stat-label">Free Peer-to-Peer</span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Popular Skills Section */}
      <section className="popular-skills-section">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">Explore Opportunities</span>
            <h2 className="section-title">Popular Skills Available Now</h2>
            <p className="section-subtitle">
              Browse top-rated skills offered by our community members and send your first exchange request today.
            </p>
          </div>

          <div className="skills-grid">
            {popularSkills.map((skill) => (
              <SkillCard
                key={skill.id}
                skill={skill}
                onRequest={handleRequestClick}
              />
            ))}
          </div>

          <div className="view-all-center">
            <Link to="/explore" className="btn btn-secondary btn-lg">
              View All Available Skills
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* 4. How SkillSwap Works Section */}
      <section className="how-it-works-section">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">Simple & Transparent</span>
            <h2 className="section-title">How SkillSwap Works</h2>
            <p className="section-subtitle">
              Exchange your expertise in three simple steps. No credit cards, no subscriptions.
            </p>
          </div>

          <div className="steps-grid">
            {/* Step 1 */}
            <div className="step-card">
              <div className="step-number-bubble">01</div>
              <div className="step-icon-wrapper">
                <BookOpen size={28} />
              </div>
              <h3 className="step-title">1. List Your Skills</h3>
              <p className="step-desc">
                Create a quick profile. Add the skills you can teach (like Python, Guitar, or Spanish) and what you are eager to learn.
              </p>
            </div>

            {/* Step 2 */}
            <div className="step-card">
              <div className="step-number-bubble">02</div>
              <div className="step-icon-wrapper">
                <Users size={28} />
              </div>
              <h3 className="step-title">2. Find A Match</h3>
              <p className="step-desc">
                Search through our catalog of community skills. When you find someone who teaches what you want, propose a skill exchange.
              </p>
            </div>

            {/* Step 3 */}
            <div className="step-card">
              <div className="step-number-bubble">03</div>
              <div className="step-icon-wrapper">
                <TrendingUp size={28} />
              </div>
              <h3 className="step-title">3. Swap & Grow</h3>
              <p className="step-desc">
                Once the other user accepts your request, schedule 1-on-1 virtual sessions, exchange knowledge, and level up together!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Call To Action Banner */}
      <section className="cta-banner-section">
        <div className="container">
          <div className="cta-banner">
            <h2 className="cta-title">Ready to Learn and Share?</h2>
            <p className="cta-desc">
              Join thousands of enthusiastic students, developers, designers, and creators who are trading their skills every day.
            </p>
            <Link
              to={currentUser ? '/dashboard' : '/signup'}
              className="btn btn-cta-white"
            >
              {currentUser ? 'Go to Dashboard' : 'Create Your Free Account'}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;
