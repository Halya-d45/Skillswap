import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogIn, ArrowRight, AlertCircle } from 'lucide-react';
import { authService, getErrorMessage } from '../services/api';
import '../styles/Auth.css';

function Login({ onLogin }) {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  // Quick fill button for testing
  const handleFillDemo = () => {
    setFormData({
      email: 'sarah.chen@example.com',
      password: 'password123',
    });
    setErrors({});
    setServerError('');
  };

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
      const message = getErrorMessage(
        err,
        'Unable to connect to server. Please check your backend is running.'
      );
      setServerError(message);
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

        {/* Server Error Alert */}
        {serverError && (
          <div className="alert-banner alert-banner-error" style={{ backgroundColor: '#fee2e2', color: '#b91c1c', border: '1px solid #f87171' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertCircle size={18} />
              <span>{serverError}</span>
            </div>
          </div>
        )}

        {/* Quick Demo Credentials Assistant */}
        <div className="demo-credentials-box">
          <div className="demo-credentials-text">
            <strong>Testing?</strong> Fill demo credentials with 1 click
          </div>
          <button
            type="button"
            className="btn-fill-demo"
            onClick={handleFillDemo}
          >
            Auto Fill
          </button>
        </div>

        {/* Login Form */}
        <form className="auth-form" onSubmit={handleSubmit} style={{ marginTop: '16px' }}>
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
            <label className="form-label" htmlFor="password">
              <span>Password</span>
            </label>
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
