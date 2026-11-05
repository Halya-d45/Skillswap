import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LogIn, ArrowRight, AlertCircle, CheckCircle2, ShieldAlert } from 'lucide-react';
import { authService, getErrorMessage } from '../services/api';
import '../styles/Auth.css';

function Login({ onLogin }) {
  const location = useLocation();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [unverifiedEmail, setUnverifiedEmail] = useState('');
  const [successBanner, setSuccessBanner] = useState(
    location.state?.successMessage || ''
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      setUnverifiedEmail('');
    }
    if (successBanner) {
      setSuccessBanner('');
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required.';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address.';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required.';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    setUnverifiedEmail('');
    setSuccessBanner('');
    if (!validate()) return;

    setIsSubmitting(true);

    try {
      // Connect login form to Express /api/auth/login API
      const userData = await authService.login({
        email: formData.email.trim(),
        password: formData.password,
      });

      onLogin(userData);
      navigate('/dashboard');
    } catch (err) {
      console.error('Login Error:', err);

      // Check if user is unverified (HTTP 403 with isUnverified flag)
      if (err.response?.status === 403 && err.response?.data?.isUnverified) {
        setUnverifiedEmail(err.response.data.email || formData.email.trim());
        setServerError(
          err.response.data.message ||
            'Your email address is not verified yet. Please enter your verification code.'
        );
      } else {
        const message = getErrorMessage(
          err,
          'Unable to connect to server. Please check your backend is running.'
        );
        setServerError(message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card auth-card-sm">
        {/* Header */}
        <div className="auth-header">
          <div className="auth-icon-badge">
            <LogIn size={26} />
          </div>
          <h2 className="auth-title">Welcome Back</h2>
          <p className="auth-subtitle">
            Log in to continue your skill exchange journey
          </p>
        </div>

        {/* Success Alert Banner (e.g. from password reset) */}
        {successBanner && (
          <div className="alert-banner alert-banner-success">
            <CheckCircle2 size={18} />
            <span>{successBanner}</span>
          </div>
        )}

        {/* Server Error Alert */}
        {serverError && (
          <div className="alert-banner alert-banner-error">
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', width: '100%' }}>
              {unverifiedEmail ? <ShieldAlert size={20} style={{ flexShrink: 0, marginTop: '2px' }} /> : <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />}
              <div style={{ flex: 1 }}>
                <div>{serverError}</div>
                {unverifiedEmail && (
                  <div style={{ marginTop: '8px' }}>
                    <Link
                      to="/verify-email"
                      state={{ email: unverifiedEmail }}
                      className="btn btn-primary"
                      style={{
                        display: 'inline-block',
                        fontSize: '0.82rem',
                        padding: '6px 12px',
                        textDecoration: 'none',
                      }}
                    >
                      Verify Email Now →
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Login Form */}
        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="email">
              <span>Email Address</span>
            </label>
            <input
              type="email"
              id="email"
              name="email"
              className={`form-input ${errors.email ? 'input-error' : ''}`}
              placeholder="e.g. sarah.chen@example.com"
              value={formData.email}
              onChange={handleChange}
              disabled={isSubmitting}
            />
            {errors.email && (
              <span className="error-message">{errors.email}</span>
            )}
          </div>

          <div className="form-group">
            <div className="form-label">
              <label htmlFor="password">Password</label>
              <Link to="/forgot-password" className="auth-field-action">
                Forgot password?
              </Link>
            </div>
            <input
              type="password"
              id="password"
              name="password"
              className={`form-input ${errors.password ? 'input-error' : ''}`}
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              disabled={isSubmitting}
            />
            {errors.password && (
              <span className="error-message">{errors.password}</span>
            )}
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-auth-submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Logging in...' : 'Log In'}
            {!isSubmitting && <ArrowRight size={18} />}
          </button>
        </form>

        {/* Link to Signup */}
        <div className="auth-footer">
          Don't have an account yet? <Link to="/signup">Sign up here</Link>
        </div>
      </div>
    </div>
  );
}

export default Login;
