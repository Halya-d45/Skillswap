import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  GraduationCap,
  ArrowLeftRight,
  Clock,
  Plus,
  Compass,
  Inbox,
  User,
  ArrowRight,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import { authService, requestService, skillService } from '../services/api';
import '../styles/Dashboard.css';

function Dashboard({ currentUser, onUpdateUser }) {
  const [newTeachSkill, setNewTeachSkill] = useState('');
  const [newLearnSkill, setNewLearnSkill] = useState('');
  const [requestTab, setRequestTab] = useState('received');
  const [receivedRequests, setReceivedRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const onUpdateRef = useRef(onUpdateUser);
  useEffect(() => {
    onUpdateRef.current = onUpdateUser;
  }, [onUpdateUser]);

  // Fetch real requests & profile data from MongoDB backend
  useEffect(() => {
    let ignore = false;
    const fetchDashboardData = async () => {
      try {
        const [received, sent] = await Promise.allSettled([
          requestService.getReceivedRequests(),
          requestService.getSentRequests(),
        ]);

        if (ignore) return;

        if (received.status === 'fulfilled') {
          setReceivedRequests(received.value || []);
        }
        if (sent.status === 'fulfilled') {
          setSentRequests(sent.value || []);
        }

        // Refresh user profile if token is present
        if (localStorage.getItem('token')) {
          const freshUser = await authService.getProfile();
          if (!ignore && onUpdateRef.current) {
            onUpdateRef.current(freshUser);
          }
        }
      } catch (err) {
        console.warn('Dashboard fetch notice:', err.message);
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    fetchDashboardData();
    return () => {
      ignore = true;
    };
  }, []);

  // Display user skills fallback
  const skillsToTeach =
    currentUser?.skillsToTeach || currentUser?.skillsTeach || [];
  const skillsToLearn =
    currentUser?.skillsToLearn || currentUser?.skillsLearn || [];

  // Add new skill you can teach
  const handleAddTeachSkill = async (e) => {
    e.preventDefault();
    if (!newTeachSkill.trim()) return;

    const skillName = newTeachSkill.trim();
    const updatedSkills = [...skillsToTeach, skillName];

    try {
      if (localStorage.getItem('token')) {
        await authService.updateProfile({ skillsToTeach: updatedSkills });
        // Also create a skill listing in skills collection
        try {
          await skillService.createSkill({
            skillName,
            category: 'Programming',
            description: `I can teach ${skillName} and help you learn practical concepts.`,
            skillType: 'teaching',
            wantsToLearn: skillsToLearn[0] || 'Web Design',
          });
        } catch (sErr) {
          console.warn('Skill listing created in profile:', sErr.message);
        }
      }

      onUpdateUser({
        ...currentUser,
        skillsToTeach: updatedSkills,
        skillsTeach: updatedSkills,
      });

      setNewTeachSkill('');
      setNotification(`Added "${skillName}" to skills you can teach!`);
      setTimeout(() => setNotification(''), 4000);
    } catch {
      setErrorMsg('Failed to save skill to backend. Please check connection.');
      setTimeout(() => setErrorMsg(''), 4000);
    }
  };

  // Add new skill you want to learn
  const handleAddLearnSkill = async (e) => {
    e.preventDefault();
    if (!newLearnSkill.trim()) return;

    const skillName = newLearnSkill.trim();
    const updatedSkills = [...skillsToLearn, skillName];

    try {
      if (localStorage.getItem('token')) {
        await authService.updateProfile({ skillsToLearn: updatedSkills });
      }

      onUpdateUser({
        ...currentUser,
        skillsToLearn: updatedSkills,
        skillsLearn: updatedSkills,
      });

      setNewLearnSkill('');
      setNotification(`Added "${skillName}" to learning goals!`);
      setTimeout(() => setNotification(''), 4000);
    } catch {
      setErrorMsg('Failed to update learning goals.');
      setTimeout(() => setErrorMsg(''), 4000);
    }
  };

  // Remove skill to teach
  const handleRemoveTeachSkill = async (skillToRemove) => {
    const updated = skillsToTeach.filter((s) => s !== skillToRemove);
    try {
      if (localStorage.getItem('token')) {
        await authService.updateProfile({ skillsToTeach: updated });
      }
      onUpdateUser({
        ...currentUser,
        skillsToTeach: updated,
        skillsTeach: updated,
      });
    } catch (err) {
      console.error(err);
    }
  };

  // Remove skill to learn
  const handleRemoveLearnSkill = async (skillToRemove) => {
    const updated = skillsToLearn.filter((s) => s !== skillToRemove);
    try {
      if (localStorage.getItem('token')) {
        await authService.updateProfile({ skillsToLearn: updated });
      }
      onUpdateUser({
        ...currentUser,
        skillsToLearn: updated,
        skillsLearn: updated,
      });
    } catch (err) {
      console.error(err);
    }
  };

  const totalRequests = receivedRequests.length + sentRequests.length;
  const pendingCount =
    receivedRequests.filter((r) => String(r.status).toLowerCase() === 'pending').length +
    sentRequests.filter((r) => String(r.status).toLowerCase() === 'pending').length;

  return (
    <div className="dashboard-page">
      <div className="container">
        {/* Alerts */}
        {notification && (
          <div className="alert-banner alert-success">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle size={18} />
              <span>{notification}</span>
            </div>
            <button
              type="button"
              className="btn-remove-tag"
              onClick={() => setNotification('')}
            >
              ×
            </button>
          </div>
        )}

        {errorMsg && (
          <div
            className="alert-banner"
            style={{ backgroundColor: '#fee2e2', color: '#b91c1c', border: '1px solid #f87171' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertCircle size={18} />
              <span>{errorMsg}</span>
            </div>
          </div>
        )}

        {/* 1. Welcome Banner with User Profile Info */}
        <div className="dashboard-welcome-banner">
          <div className="welcome-user-info">
            <img
              src={
                currentUser?.profileImage ||
                currentUser?.avatar ||
                'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200'
              }
              alt={currentUser?.name || 'User'}
              className="welcome-avatar"
              onError={(e) => {
                e.target.src =
                  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200';
              }}
            />
            <div className="welcome-text">
              <h1>Welcome back, {currentUser?.name || 'SkillSwapper'}!</h1>
              <p>
                {currentUser?.bio ||
                  'Ready to exchange skills and learn something new today?'}
              </p>
            </div>
          </div>
          <div className="welcome-actions">
            <Link to="/explore" className="btn btn-welcome-light btn-sm">
              <Compass size={16} />
              Explore Skills
            </Link>
          </div>
        </div>

        {/* 2. Key Metrics Row */}
        <div className="dashboard-stats-grid">
          {/* Skills Offered */}
          <div className="dash-stat-card">
            <div className="dash-stat-icon-wrapper icon-blue">
              <BookOpen size={24} />
            </div>
            <div className="dash-stat-data">
              <span className="dash-stat-value">{skillsToTeach.length}</span>
              <span className="dash-stat-label">Skills Offered</span>
            </div>
          </div>

          {/* Skills Wanted */}
          <div className="dash-stat-card">
            <div className="dash-stat-icon-wrapper icon-purple">
              <GraduationCap size={24} />
            </div>
            <div className="dash-stat-data">
              <span className="dash-stat-value">{skillsToLearn.length}</span>
              <span className="dash-stat-label">Skills Wanted</span>
            </div>
          </div>

          {/* Total Exchange Requests */}
          <div className="dash-stat-card">
            <div className="dash-stat-icon-wrapper icon-green">
              <ArrowLeftRight size={24} />
            </div>
            <div className="dash-stat-data">
              <span className="dash-stat-value">{totalRequests}</span>
              <span className="dash-stat-label">Total Requests</span>
            </div>
          </div>

          {/* Pending Requests */}
          <div className="dash-stat-card">
            <div className="dash-stat-icon-wrapper icon-amber">
              <Clock size={24} />
            </div>
            <div className="dash-stat-data">
              <span className="dash-stat-value">{pendingCount}</span>
              <span className="dash-stat-label">Pending Requests</span>
            </div>
          </div>
        </div>

        {/* 3. Skills Management Two-Column Cards */}
        <div className="dashboard-main-grid">
          {/* Skills I Offer (Teach) */}
          <div className="card">
            <div className="section-card-header">
              <div className="section-card-title">
                <BookOpen size={20} color="var(--primary-blue)" />
                <span>Skills I Offer (Teach)</span>
              </div>
              <span className="badge badge-blue">
                {skillsToTeach.length} Skills
              </span>
            </div>

            <div className="skills-tags-container">
              {skillsToTeach.length > 0 ? (
                skillsToTeach.map((skill, index) => (
                  <span key={index} className="skill-tag skill-tag-teach">
                    {skill}
                    <button
                      type="button"
                      className="btn-remove-tag"
                      onClick={() => handleRemoveTeachSkill(skill)}
                      title="Remove skill"
                    >
                      ×
                    </button>
                  </span>
                ))
              ) : (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                  No skills listed to teach yet. Add one below!
                </p>
              )}
            </div>

            <form onSubmit={handleAddTeachSkill} className="add-skill-inline">
              <input
                type="text"
                placeholder="Add a skill you can teach..."
                value={newTeachSkill}
                onChange={(e) => setNewTeachSkill(e.target.value)}
                className="add-skill-input"
              />
              <button type="submit" className="btn btn-primary btn-sm">
                <Plus size={16} /> Add
              </button>
            </form>
          </div>

          {/* Skills I Want to Learn */}
          <div className="card">
            <div className="section-card-header">
              <div className="section-card-title">
                <GraduationCap size={20} color="var(--primary-purple)" />
                <span>Skills I Want to Learn</span>
              </div>
              <span className="badge badge-purple">
                {skillsToLearn.length} Goals
              </span>
            </div>

            <div className="skills-tags-container">
              {skillsToLearn.length > 0 ? (
                skillsToLearn.map((skill, index) => (
                  <span key={index} className="skill-tag skill-tag-learn">
                    {skill}
                    <button
                      type="button"
                      className="btn-remove-tag"
                      onClick={() => handleRemoveLearnSkill(skill)}
                      title="Remove skill"
                    >
                      ×
                    </button>
                  </span>
                ))
              ) : (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                  No learning goals added yet. Add what you want to learn!
                </p>
              )}
            </div>

            <form onSubmit={handleAddLearnSkill} className="add-skill-inline">
              <input
                type="text"
                placeholder="Add a skill you want to learn..."
                value={newLearnSkill}
                onChange={(e) => setNewLearnSkill(e.target.value)}
                className="add-skill-input"
              />
              <button type="submit" className="btn btn-secondary btn-sm">
                <Plus size={16} /> Add
              </button>
            </form>
          </div>
        </div>

        {/* 4. Requests Overview */}
        <div className="card" style={{ marginBottom: '32px' }}>
          <div className="section-card-header">
            <div className="section-card-title">
              <Inbox size={20} color="var(--primary-purple)" />
              <span>Recent Exchange Requests</span>
            </div>
            <Link to="/requests" className="btn btn-outline btn-sm">
              View All Requests
              <ArrowRight size={14} />
            </Link>
          </div>

          {/* Tab Selector */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
            <button
              type="button"
              className={`btn btn-sm ${
                requestTab === 'received' ? 'btn-primary' : 'btn-outline'
              }`}
              onClick={() => setRequestTab('received')}
            >
              Received ({receivedRequests.length})
            </button>
            <button
              type="button"
              className={`btn btn-sm ${
                requestTab === 'sent' ? 'btn-primary' : 'btn-outline'
              }`}
              onClick={() => setRequestTab('sent')}
            >
              Sent ({sentRequests.length})
            </button>
          </div>

          {/* List preview */}
          {loading ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Loading requests from database...
            </p>
          ) : (
            <div className="requests-preview-list">
              {requestTab === 'received' ? (
                receivedRequests.length > 0 ? (
                  receivedRequests.slice(0, 3).map((req) => {
                    const sender = req.senderId || req.sender || {};
                    const senderName = sender.name || 'Community Member';
                    const senderImg =
                      sender.profileImage ||
                      sender.avatar ||
                      'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200';

                    return (
                      <div key={req._id || req.id} className="request-preview-item">
                        <div className="request-preview-user">
                          <img
                            src={senderImg}
                            alt={senderName}
                            className="request-preview-avatar"
                          />
                          <div className="request-preview-details">
                            <span className="request-preview-title">
                              {senderName} offers: <strong>{req.skillOffered}</strong> for{' '}
                              <strong>{req.skillRequested}</strong>
                            </span>
                            <span className="request-preview-sub">
                              {new Date(req.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <span
                          className={`status-badge status-${String(
                            req.status
                          ).toLowerCase()}`}
                        >
                          {req.status}
                        </span>
                      </div>
                    );
                  })
                ) : (
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                    No received exchange requests at this moment.
                  </p>
                )
              ) : sentRequests.length > 0 ? (
                sentRequests.slice(0, 3).map((req) => {
                  const receiver = req.receiverId || req.recipient || {};
                  const receiverName = receiver.name || 'Mentor';
                  const receiverImg =
                    receiver.profileImage ||
                    receiver.avatar ||
                    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200';

                  return (
                    <div key={req._id || req.id} className="request-preview-item">
                      <div className="request-preview-user">
                        <img
                          src={receiverImg}
                          alt={receiverName}
                          className="request-preview-avatar"
                        />
                        <div className="request-preview-details">
                          <span className="request-preview-title">
                            To {receiverName}: Offered <strong>{req.skillOffered}</strong> for{' '}
                            <strong>{req.skillRequested}</strong>
                          </span>
                          <span className="request-preview-sub">
                            {new Date(req.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <span
                        className={`status-badge status-${String(
                          req.status
                        ).toLowerCase()}`}
                      >
                        {req.status}
                      </span>
                    </div>
                  );
                })
              ) : (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                  No sent requests yet. Check out Explore Skills!
                </p>
              )}
            </div>
          )}
        </div>

        {/* 5. Quick Navigation to Other Pages */}
        <div>
          <h3 style={{ marginBottom: '16px', fontSize: '1.2rem' }}>
            Quick Navigation
          </h3>
          <div className="quick-navigation-grid">
            <Link to="/explore" className="nav-shortcut-card">
              <div className="shortcut-icon">
                <Compass size={24} />
              </div>
              <div className="shortcut-info">
                <h4>Explore Skills</h4>
                <p>Browse community members and request swaps</p>
              </div>
            </Link>

            <Link to="/requests" className="nav-shortcut-card">
              <div className="shortcut-icon">
                <Inbox size={24} />
              </div>
              <div className="shortcut-info">
                <h4>My Requests</h4>
                <p>Manage, accept, and cancel exchange offers</p>
              </div>
            </Link>

            <Link to="/profile" className="nav-shortcut-card">
              <div className="shortcut-icon">
                <User size={24} />
              </div>
              <div className="shortcut-info">
                <h4>User Profile</h4>
                <p>Edit your personal bio, contact, and skills</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
