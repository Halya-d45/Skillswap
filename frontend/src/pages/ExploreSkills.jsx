import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Search,
  X,
  Filter,
  CheckCircle,
  Send,
  AlertCircle,
  Plus,
} from 'lucide-react';
import SkillCard from '../components/SkillCard';
import { skillService, requestService } from '../services/api';
import { initialSkillsList } from '../data/mockData';
import '../styles/ExploreSkills.css';

const CATEGORIES = [
  'All',
  'Programming',
  'Design',
  'Languages',
  'Marketing',
  'Music',
  'Business',
];

function ExploreSkills({ currentUser }) {
  const [searchParams] = useSearchParams();
  const initialSearch = searchParams.get('search') || '';
  const initialCategory = searchParams.get('category') || 'All';

  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);

  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State for Requesting Skill Exchange
  const [selectedSkillForExchange, setSelectedSkillForExchange] = useState(null);
  const [offeredSkill, setOfferedSkill] = useState('');
  const [message, setMessage] = useState('');
  const [notification, setNotification] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Modal State for Adding a New Skill Listing
  const [showAddSkillModal, setShowAddSkillModal] = useState(false);
  const [newSkillForm, setNewSkillForm] = useState({
    skillName: '',
    category: 'Programming',
    description: '',
    wantsToLearn: '',
    level: 'Intermediate',
  });
  const [isSubmittingNewSkill, setIsSubmittingNewSkill] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Fetch skills from MongoDB Atlas backend
  useEffect(() => {
    let ignore = false;
    const fetchSkillsData = async () => {
      try {
        const params = {};
        if (selectedCategory && selectedCategory !== 'All') {
          params.category = selectedCategory;
        }
        if (searchQuery.trim()) {
          params.search = searchQuery.trim();
        }

        const data = await skillService.getAllSkills(params);

        if (ignore) return;

        // If backend returned skills from MongoDB, use them
        if (Array.isArray(data) && data.length > 0) {
          // Map backend schema to format needed by SkillCard
          const mappedSkills = data.map((item) => {
            const user = item.userId || item.user || {};
            return {
              id: item._id,
              rawItem: item,
              receiverId: user._id || item.userId,
              userName: user.name || 'Community Member',
              userRole: user.bio ? user.bio.slice(0, 35) + '...' : 'SkillSwapper',
              userAvatar:
                user.profileImage ||
                user.avatar ||
                'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200',
              skillName: item.skillName,
              category: item.category,
              level: item.level || 'All Levels',
              description: item.description,
              wantsToLearn: item.wantsToLearn || 'Web Design',
              rating: item.rating || 5.0,
              reviewsCount: item.reviewsCount || 12,
            };
          });
          setSkills(mappedSkills);
        } else if (!searchQuery && selectedCategory === 'All') {
          // Fallback to sample catalog if database has 0 items initially
          setSkills(initialSkillsList);
        } else {
          setSkills([]);
        }
      } catch (err) {
        if (!ignore) {
          console.warn('Backend fetch skills fallback to local data:', err.message);
          // Filter local fallback data
          const filtered = initialSkillsList.filter((s) => {
            const matchesCategory =
              selectedCategory === 'All' || s.category === selectedCategory;
            const q = searchQuery.toLowerCase().trim();
            const matchesSearch =
              !q ||
              s.skillName.toLowerCase().includes(q) ||
              s.userName.toLowerCase().includes(q) ||
              s.description.toLowerCase().includes(q);
            return matchesCategory && matchesSearch;
          });
          setSkills(filtered);
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    fetchSkillsData();
    return () => {
      ignore = true;
    };
  }, [selectedCategory, searchQuery, refreshTrigger]);

  // Open exchange modal
  const handleOpenRequestModal = (skill) => {
    if (!currentUser) {
      setErrorMsg('Please log in or sign up to send skill exchange proposals!');
      setTimeout(() => setErrorMsg(''), 4000);
      return;
    }

    const teachSkills =
      currentUser?.skillsToTeach || currentUser?.skillsTeach || [];

    setSelectedSkillForExchange(skill);
    setOfferedSkill(teachSkills[0] || 'My Expertise');
    setMessage(
      `Hi ${skill.userName}, I would love to exchange skills! I can teach you ${
        teachSkills[0] || 'my skill'
      } in exchange for ${skill.skillName}.`
    );
  };

  const handleCloseModal = () => {
    setSelectedSkillForExchange(null);
  };

  // Submit Skill Exchange Proposal
  const handleSendRequestSubmit = async (e) => {
    e.preventDefault();
    if (!selectedSkillForExchange) return;

    try {
      const receiverId =
        selectedSkillForExchange.receiverId ||
        selectedSkillForExchange.rawItem?.userId?._id ||
        selectedSkillForExchange.rawItem?.userId;

      if (localStorage.getItem('token') && receiverId) {
        await requestService.sendRequest({
          receiverId,
          skillOffered: offeredSkill,
          skillRequested: selectedSkillForExchange.skillName,
          message,
        });
      }

      setNotification(
        `Skill exchange proposal for "${selectedSkillForExchange.skillName}" sent successfully!`
      );
      handleCloseModal();
      setTimeout(() => setNotification(''), 4500);
    } catch (err) {
      console.error('Send request error:', err);
      const msg =
        err.response?.data?.message ||
        'Failed to send exchange request. Make sure you are logged in.';
      setErrorMsg(msg);
      handleCloseModal();
      setTimeout(() => setErrorMsg(''), 4500);
    }
  };

  // Submit New Skill Creation
  const handleCreateSkillSubmit = async (e) => {
    e.preventDefault();
    if (!newSkillForm.skillName || !newSkillForm.description) return;

    setIsSubmittingNewSkill(true);
    try {
      await skillService.createSkill(newSkillForm);
      setNotification(`Skill "${newSkillForm.skillName}" successfully posted!`);
      setShowAddSkillModal(false);
      setNewSkillForm({
        skillName: '',
        category: 'Programming',
        description: '',
        wantsToLearn: '',
        level: 'Intermediate',
      });
      setRefreshTrigger((prev) => prev + 1); // Trigger updated skills reload
      setTimeout(() => setNotification(''), 4500);
    } catch (err) {
      console.error('Error creating skill:', err);
      setErrorMsg(
        err.response?.data?.message || 'Failed to post skill. Please log in first.'
      );
      setTimeout(() => setErrorMsg(''), 4500);
    } finally {
      setIsSubmittingNewSkill(false);
    }
  };

  const userTeachSkills =
    currentUser?.skillsToTeach || currentUser?.skillsTeach || [];

  return (
    <div className="explore-page">
      <div className="container">
        {/* Header */}
        <div className="explore-header">
          <h1 className="explore-title">Explore Skills & Mentors</h1>
          <p className="explore-subtitle">
            Discover passionate creators and experts. Find the perfect partner to
            exchange knowledge and grow your skillset.
          </p>
        </div>

        {/* Notifications / Alerts */}
        {notification && (
          <div className="alert-banner alert-success">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle size={20} />
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
            style={{
              backgroundColor: '#fee2e2',
              color: '#b91c1c',
              border: '1px solid #f87171',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertCircle size={20} />
              <span>{errorMsg}</span>
            </div>
            <button
              type="button"
              className="btn-remove-tag"
              onClick={() => setErrorMsg('')}
            >
              ×
            </button>
          </div>
        )}

        {/* Search & Filter Controls */}
        <div className="explore-controls-card">
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            {/* Search Input */}
            <div className="search-input-wrapper" style={{ flex: 1 }}>
              <Search size={20} className="search-icon" />
              <input
                type="text"
                className="search-input"
                placeholder="Search skills by name (e.g. Python, Figma), mentor name, or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  type="button"
                  className="search-clear-btn"
                  onClick={() => setSearchQuery('')}
                  title="Clear search"
                >
                  <X size={18} />
                </button>
              )}
            </div>

            {/* Post a Skill Button */}
            {currentUser && (
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => setShowAddSkillModal(true)}
              >
                <Plus size={18} /> Offer a Skill
              </button>
            )}
          </div>

          {/* Category Filter Pills */}
          <div className="categories-filter-wrapper">
            <span
              style={{
                fontSize: '0.88rem',
                fontWeight: 600,
                color: 'var(--text-muted)',
                marginRight: '6px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <Filter size={16} /> Category:
            </span>
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                className={`category-filter-btn ${
                  selectedCategory === cat ? 'active' : ''
                }`}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Results Header */}
        <div className="explore-results-header">
          <span className="results-count">
            {loading
              ? 'Loading skills...'
              : `${skills.length} ${
                  skills.length === 1 ? 'skill found' : 'skills available'
                }`}
          </span>
          {(searchQuery || selectedCategory !== 'All') && (
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('All');
              }}
            >
              Reset Filters
            </button>
          )}
        </div>

        {/* Skills Grid */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
            Loading skills from MongoDB Atlas...
          </div>
        ) : skills.length > 0 ? (
          <div className="explore-grid">
            {skills.map((skill) => (
              <SkillCard
                key={skill.id}
                skill={skill}
                onRequest={handleOpenRequestModal}
              />
            ))}
          </div>
        ) : (
          <div className="explore-empty-state">
            <div className="empty-state-icon">
              <AlertCircle size={32} />
            </div>
            <h3 className="empty-state-title">No matching skills found</h3>
            <p className="empty-state-text">
              Try searching with different keywords or choosing another category filter.
            </p>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('All');
              }}
            >
              Clear All Filters
            </button>
          </div>
        )}

        {/* Modal 1: Request Skill Exchange */}
        {selectedSkillForExchange && (
          <div className="modal-overlay" onClick={handleCloseModal}>
            <div
              className="exchange-modal"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header">
                <h3 className="modal-title">Request Skill Exchange</h3>
                <button
                  type="button"
                  className="btn-close-modal"
                  onClick={handleCloseModal}
                >
                  <X size={20} />
                </button>
              </div>

              {/* Summary of target skill */}
              <div className="modal-target-summary">
                <img
                  src={selectedSkillForExchange.userAvatar}
                  alt={selectedSkillForExchange.userName}
                  className="modal-target-avatar"
                />
                <div>
                  <div style={{ fontWeight: 700, color: 'var(--text-heading)' }}>
                    {selectedSkillForExchange.userName}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--primary-blue)' }}>
                    Skill: <strong>{selectedSkillForExchange.skillName}</strong>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    They want: {selectedSkillForExchange.wantsToLearn}
                  </div>
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleSendRequestSubmit} className="modal-form">
                <div className="form-group">
                  <label className="form-label" htmlFor="offeredSkill">
                    Which skill will you teach in return?
                  </label>
                  {userTeachSkills.length > 0 ? (
                    <select
                      id="offeredSkill"
                      className="form-input"
                      value={offeredSkill}
                      onChange={(e) => setOfferedSkill(e.target.value)}
                    >
                      {userTeachSkills.map((s, idx) => (
                        <option key={idx} value={s}>
                          {s}
                        </option>
                      ))}
                      <option value="Custom Skill">Other Skill (Specify in message)</option>
                    </select>
                  ) : (
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. Python, Graphic Design"
                      value={offeredSkill}
                      onChange={(e) => setOfferedSkill(e.target.value)}
                      required
                    />
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="exchangeMsg">
                    Personal Message / Intro Note
                  </label>
                  <textarea
                    id="exchangeMsg"
                    rows="3"
                    className="form-input"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Introduce yourself and propose how you'd like to structure the exchange sessions..."
                  />
                </div>

                <div className="modal-actions">
                  <button
                    type="button"
                    className="btn btn-outline btn-sm"
                    onClick={handleCloseModal}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary btn-sm">
                    <Send size={16} /> Send Exchange Proposal
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal 2: Add New Skill Offering */}
        {showAddSkillModal && (
          <div className="modal-overlay" onClick={() => setShowAddSkillModal(false)}>
            <div className="exchange-modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3 className="modal-title">Offer a New Skill</h3>
                <button
                  type="button"
                  className="btn-close-modal"
                  onClick={() => setShowAddSkillModal(false)}
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleCreateSkillSubmit} className="modal-form">
                <div className="form-group">
                  <label className="form-label" htmlFor="newSkillName">
                    Skill Name
                  </label>
                  <input
                    type="text"
                    id="newSkillName"
                    className="form-input"
                    placeholder="e.g. Python for Data Science"
                    value={newSkillForm.skillName}
                    onChange={(e) =>
                      setNewSkillForm({ ...newSkillForm, skillName: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="newCategory">
                    Category
                  </label>
                  <select
                    id="newCategory"
                    className="form-input"
                    value={newSkillForm.category}
                    onChange={(e) =>
                      setNewSkillForm({ ...newSkillForm, category: e.target.value })
                    }
                  >
                    {CATEGORIES.filter((c) => c !== 'All').map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="newDescription">
                    Description
                  </label>
                  <textarea
                    id="newDescription"
                    rows="3"
                    className="form-input"
                    placeholder="Explain what you will teach, prerequisites, and what learners will achieve..."
                    value={newSkillForm.description}
                    onChange={(e) =>
                      setNewSkillForm({
                        ...newSkillForm,
                        description: e.target.value,
                      })
                    }
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="newWantsToLearn">
                    Skill You Want in Exchange
                  </label>
                  <input
                    type="text"
                    id="newWantsToLearn"
                    className="form-input"
                    placeholder="e.g. UI/UX Design with Figma"
                    value={newSkillForm.wantsToLearn}
                    onChange={(e) =>
                      setNewSkillForm({
                        ...newSkillForm,
                        wantsToLearn: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="modal-actions">
                  <button
                    type="button"
                    className="btn btn-outline btn-sm"
                    onClick={() => setShowAddSkillModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary btn-sm"
                    disabled={isSubmittingNewSkill}
                  >
                    {isSubmittingNewSkill ? 'Posting...' : 'Post Skill Listing'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ExploreSkills;
