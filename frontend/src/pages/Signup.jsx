import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, ArrowRight, AlertCircle } from 'lucide-react';
import { authService, getErrorMessage } from '../services/api';
import '../styles/Auth.css';

function Signup({ onSignup }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    skillsTeach: '',
    skillsLearn: '',
  });

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
    if (serverError) {
      setServerError('');
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Full name is required.';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required.';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please provide a valid email address.';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required.';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters.';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Confirm your password.';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match.';
    }

    if (!formData.skillsTeach.trim()) {
      newErrors.skillsTeach = 'Please enter at least one skill you can teach.';
    }

    if (!formData.skillsLearn.trim()) {
      newErrors.skillsLearn = 'Please enter at least one skill you want to learn.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    if (!validate()) return;

    setIsSubmitting(true);

    // Parse comma-separated skills
    const teachArray = formData.skillsTeach
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const learnArray = formData.skillsLearn
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    try {
      // Connect to Express registration API: POST /api/auth/register
      const userData = await authService.register({
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        skillsToTeach: teachArray,
        skillsToLearn: learnArray,
      });

      onSignup(userData);
      navigate('/dashboard');
    } catch (err) {
      console.error('Registration Error:', err);
      const message = getErrorMessage(
        err,
        'Failed to register. Please check your network and backend server.'
      );
      setServerError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        {/* Header */}
        <div className="auth-header">
          <div className="auth-icon-badge">
            <UserPlus size={26} />
          </div>
          <h2 className="auth-title">Join SkillSwap</h2>
          <p className="auth-subtitle">
            Sign up in seconds to start trading skills with the community
          </p>
        </div>

        {/* Server Error Alert */}
        {serverError && (
          <div
            className="alert-banner alert-banner-error"
            style={{
              backgroundColor: '#fee2e2',
              color: '#b91c1c',
              border: '1px solid #f87171',
              marginBottom: '18px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertCircle size={18} />
              <span>{serverError}</span>
            </div>
          </div>
        )}

        {/* Signup Form */}
        <form className="auth-form" onSubmit={handleSubmit}>
          {/* Full Name & Email */}
          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="name">
                Full Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                className={`form-input ${errors.name ? 'input-error' : ''}`}
                placeholder="e.g. John Doe"
                value={formData.name}
                onChange={handleChange}
                disabled={isSubmitting}
              />
              {errors.name && <span className="error-message">{errors.name}</span>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="email">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                className={`form-input ${errors.email ? 'input-error' : ''}`}
                placeholder="e.g. john@example.com"
                value={formData.email}
                onChange={handleChange}
                disabled={isSubmitting}
              />
              {errors.email && <span className="error-message">{errors.email}</span>}
            </div>
          </div>

          {/* Password & Confirm Password */}
          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="password">
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                className={`form-input ${errors.password ? 'input-error' : ''}`}
                placeholder="At least 6 characters"
                value={formData.password}
                onChange={handleChange}
                disabled={isSubmitting}
              />
              {errors.password && (
                <span className="error-message">{errors.password}</span>
              )}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="confirmPassword">
                Confirm Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                className={`form-input ${
                  errors.confirmPassword ? 'input-error' : ''
                }`}
                placeholder="Re-enter password"
                value={formData.confirmPassword}
                onChange={handleChange}
                disabled={isSubmitting}
              />
              {errors.confirmPassword && (
                <span className="error-message">{errors.confirmPassword}</span>
              )}
            </div>
          </div>

          {/* Skills I Can Teach */}
          <div className="form-group">
            <label className="form-label" htmlFor="skillsTeach">
              Skills I Can Teach
            </label>
            <input
              type="text"
              id="skillsTeach"
              name="skillsTeach"
              className={`form-input ${errors.skillsTeach ? 'input-error' : ''}`}
              placeholder="e.g. Python, Graphic Design, Guitar (comma separated)"
              value={formData.skillsTeach}
              onChange={handleChange}
              disabled={isSubmitting}
            />
            <span className="form-input-help">
              List one or more skills separated by commas
            </span>
            {errors.skillsTeach && (
              <span className="error-message">{errors.skillsTeach}</span>
            )}
          </div>

          {/* Skills I Want to Learn */}
          <div className="form-group">
            <label className="form-label" htmlFor="skillsLearn">
              Skills I Want to Learn
            </label>
            <input
              type="text"
              id="skillsLearn"
              name="skillsLearn"
              className={`form-input ${errors.skillsLearn ? 'input-error' : ''}`}
              placeholder="e.g. Web Design, French, Data Analysis (comma separated)"
              value={formData.skillsLearn}
              onChange={handleChange}
              disabled={isSubmitting}
            />
            <span className="form-input-help">
              List the skills you hope to exchange for
            </span>
            {errors.skillsLearn && (
              <span className="error-message">{errors.skillsLearn}</span>
            )}
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-auth-submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Creating account...' : 'Create SkillSwap Account'}
            {!isSubmitting && <ArrowRight size={18} />}
          </button>
        </form>

        {/* Link to Login */}
        <div className="auth-footer">
          Already have an account? <Link to="/login">Log in here</Link>
        </div>
      </div>
    </div>
  );
}

export default Signup;
