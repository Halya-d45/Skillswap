import { useState } from 'react';
import {
  Mail,
  MapPin,
  Calendar,
  BookOpen,
  GraduationCap,
  Edit3,
  Save,
  X,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import { authService } from '../services/api';
import '../styles/Profile.css';

function Profile({ currentUser, onUpdateUser }) {
  const [isEditing, setIsEditing] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const skillsToTeach =
    currentUser?.skillsToTeach || currentUser?.skillsTeach || [];
  const skillsToLearn =
    currentUser?.skillsToLearn || currentUser?.skillsLearn || [];

  // Edit form state
  const [editData, setEditData] = useState({
    name: currentUser?.name || '',
    email: currentUser?.email || '',
    bio: currentUser?.bio || '',
    location: currentUser?.location || '',
    skillsTeachText: skillsToTeach.join(', '),
    skillsLearnText: skillsToLearn.join(', '),
  });

  const handleStartEditing = () => {
    const teach = currentUser?.skillsToTeach || currentUser?.skillsTeach || [];
    const learn = currentUser?.skillsToLearn || currentUser?.skillsLearn || [];
    setEditData({
      name: currentUser?.name || '',
      email: currentUser?.email || '',
      bio: currentUser?.bio || '',
      location: currentUser?.location || '',
      skillsTeachText: teach.join(', '),
      skillsLearnText: learn.join(', '),
    });
    setIsEditing(true);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setErrorMessage('');

    // Parse comma-separated skills
    const teachArr = editData.skillsTeachText
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const learnArr = editData.skillsLearnText
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const payload = {
      name: editData.name.trim() || currentUser?.name,
      bio: editData.bio.trim() || currentUser?.bio,
      location: editData.location.trim() || currentUser?.location,
      skillsToTeach: teachArr,
      skillsToLearn: learnArr,
    };

    try {
      if (localStorage.getItem('token')) {
        // Connect to Express API: PUT /api/auth/profile
        const updated = await authService.updateProfile(payload);
        onUpdateUser(updated);
      } else {
        onUpdateUser({ ...currentUser, ...payload });
      }

      setIsEditing(false);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 4500);
    } catch (err) {
      console.error('Update profile error:', err);
      setErrorMessage(
        err.response?.data?.message || 'Failed to update profile. Please check connection.'
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    const teach = currentUser?.skillsToTeach || currentUser?.skillsTeach || [];
    const learn = currentUser?.skillsToLearn || currentUser?.skillsLearn || [];
    setEditData({
      name: currentUser?.name || '',
      email: currentUser?.email || '',
      bio: currentUser?.bio || '',
      location: currentUser?.location || '',
      skillsTeachText: teach.join(', '),
      skillsLearnText: learn.join(', '),
    });
    setIsEditing(false);
    setErrorMessage('');
  };

  const avatarUrl =
    currentUser?.profileImage ||
    currentUser?.avatar ||
    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200';

  return (
    <div className="profile-page">
      <div className="container profile-container">
        {/* Success Alert Banner */}
        {savedSuccess && (
          <div className="alert-banner alert-success">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle size={20} />
              <span>Your profile has been updated and saved to MongoDB!</span>
            </div>
            <button
              type="button"
              className="btn-remove-tag"
              onClick={() => setSavedSuccess(false)}
            >
              ×
            </button>
          </div>
        )}

        {/* Error Alert */}
        {errorMessage && (
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
              <span>{errorMessage}</span>
            </div>
            <button
              type="button"
              className="btn-remove-tag"
              onClick={() => setErrorMessage('')}
            >
              ×
            </button>
          </div>
        )}

        {!isEditing ? (
          /* View Mode */
          <>
            {/* Header Card with User Details */}
            <div className="profile-hero-card">
              <div className="profile-top-row">
                <div className="profile-identity">
                  <img
                    src={avatarUrl}
                    alt={currentUser?.name || 'Profile'}
                    className="profile-avatar-large"
                    onError={(e) => {
                      e.target.src =
                        'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200';
                    }}
                  />
                  <div>
                    <h1 className="profile-name">
                      {currentUser?.name || 'SkillSwap Member'}
                    </h1>
                    <div className="profile-role">
                      Community Member & Mentor
                    </div>

                    <div className="profile-meta-list">
                      <div className="profile-meta-item">
                        <Mail size={16} />
                        <span>{currentUser?.email || 'user@example.com'}</span>
                      </div>
                      <div className="profile-meta-item">
                        <MapPin size={16} />
                        <span>{currentUser?.location || 'Remote'}</span>
                      </div>
                      <div className="profile-meta-item">
                        <Calendar size={16} />
                        <span>Member on SkillSwap</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Edit Profile Button */}
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  onClick={handleStartEditing}
                >
                  <Edit3 size={16} /> Edit Profile
                </button>
              </div>

              {/* Bio */}
              <div className="profile-bio-box">
                <h4 className="profile-bio-heading">About Me</h4>
                <p className="profile-bio-text">
                  {currentUser?.bio ||
                    'Welcome to my SkillSwap profile! I am enthusiastic about exchanging skills and growing together.'}
                </p>
              </div>
            </div>

            {/* Skills Cards Grid */}
            <div className="profile-skills-grid">
              {/* Skills I Can Teach */}
              <div className="profile-section-card">
                <div className="profile-card-header">
                  <div className="profile-card-title">
                    <BookOpen size={20} color="var(--primary-blue)" />
                    <span>Skills I Can Teach</span>
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
                      </span>
                    ))
                  ) : (
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                      No skills added to teach yet. Click "Edit Profile" to add some!
                    </p>
                  )}
                </div>
              </div>

              {/* Skills I Want to Learn */}
              <div className="profile-section-card">
                <div className="profile-card-header">
                  <div className="profile-card-title">
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
                      </span>
                    ))
                  ) : (
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                      No learning goals specified yet. Click "Edit Profile" to list them!
                    </p>
                  )}
                </div>
              </div>
            </div>
          </>
        ) : (
          /* Edit Mode Form */
          <div className="profile-edit-card">
            <div className="profile-card-header">
              <h2 className="profile-card-title">Edit Profile Information</h2>
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={handleCancel}
              >
                <X size={16} /> Cancel
              </button>
            </div>

            <form onSubmit={handleSaveProfile}>
              <div className="edit-form-grid">
                <div className="form-group">
                  <label className="form-label" htmlFor="name">
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    className="form-input"
                    value={editData.name}
                    onChange={handleEditChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="location">
                    Location
                  </label>
                  <input
                    type="text"
                    id="location"
                    name="location"
                    className="form-input"
                    value={editData.location}
                    onChange={handleEditChange}
                    placeholder="e.g. San Francisco, CA"
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginTop: '18px' }}>
                <label className="form-label" htmlFor="bio">
                  About Me / Bio
                </label>
                <textarea
                  id="bio"
                  name="bio"
                  rows="3"
                  className="form-input"
                  value={editData.bio}
                  onChange={handleEditChange}
                  placeholder="Tell other learners about your background and what you are passionate about..."
                />
              </div>

              <div className="form-group" style={{ marginTop: '18px' }}>
                <label className="form-label" htmlFor="skillsTeachText">
                  Skills I Can Teach (comma-separated)
                </label>
                <input
                  type="text"
                  id="skillsTeachText"
                  name="skillsTeachText"
                  className="form-input"
                  value={editData.skillsTeachText}
                  onChange={handleEditChange}
                  placeholder="e.g. Python Programming, Django, Git & GitHub"
                />
                <span className="form-input-help">
                  Example: Python Programming, Django, Git & GitHub
                </span>
              </div>

              <div className="form-group" style={{ marginTop: '18px' }}>
                <label className="form-label" htmlFor="skillsLearnText">
                  Skills I Want to Learn (comma-separated)
                </label>
                <input
                  type="text"
                  id="skillsLearnText"
                  name="skillsLearnText"
                  className="form-input"
                  value={editData.skillsLearnText}
                  onChange={handleEditChange}
                  placeholder="e.g. Figma Prototyping, React.js, Mobile App Development"
                />
                <span className="form-input-help">
                  Example: Figma Prototyping, React.js, Mobile App Development
                </span>
              </div>

              <div className="edit-actions">
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={handleCancel}
                  disabled={isSaving}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isSaving}
                >
                  <Save size={16} /> {isSaving ? 'Saving to Database...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

export default Profile;
