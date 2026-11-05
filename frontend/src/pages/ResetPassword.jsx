import { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { Lock, ArrowRight, RotateCw, AlertCircle, CheckCircle2 } from 'lucide-react';
import { authService, getErrorMessage } from '../services/api';
import '../styles/Auth.css';

function ResetPassword() {
  const location = useLocation();
  const navigate = useNavigate();

  const searchParams = new URLSearchParams(location.search);
  const initialEmail = location.state?.email || searchParams.get('email') || '';

  const [formData, setFormData] = useState({
    email: initialEmail,
    otp: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [serverSuccess, setServerSuccess] = useState(
    location.state?.infoMessage || ''
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  // 60-second timer for resending reset code
  useEffect(() => {
    if (cooldown <= 0) return;
    const interval = setInterval(() => {
      setCooldown((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [cooldown]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
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
      newErrors.email = 'Please provide a valid email address.';
    }

    const cleanOtp = formData.otp.trim().replace(/\D/g, '');
    if (!cleanOtp) {
      newErrors.otp = '6-digit OTP code is required.';
    } else if (cleanOtp.length !== 6) {
      newErrors.otp = 'OTP must be exactly 6 digits.';
    }

    if (!formData.newPassword) {
      newErrors.newPassword = 'New password is required.';
    } else if (formData.newPassword.length < 6) {
      newErrors.newPassword = 'Password must be at least 6 characters.';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Confirm your new password.';
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    setServerSuccess('');

    if (!validate()) return;

    setIsSubmitting(true);

    try {
      const response = await authService.resetPassword({
        email: formData.email.trim().toLowerCase(),
        otp: formData.otp.trim().replace(/\D/g, ''),
        newPassword: formData.newPassword,
      });

      setServerSuccess(
        response.message ||
          'Password has been reset successfully! Redirecting to login...'
      );

      setTimeout(() => {
        navigate('/login', {
          state: {
            successMessage:
              'Password reset successfully! Please log in with your new password.',
          },
        });
      }, 1500);
    } catch (err) {
      console.error('Password Reset Error:', err);
      const msg = getErrorMessage(
        err,
        'Failed to reset password. Please check your OTP and try again.'
      );
      setServerError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendOtp = async () => {
    if (cooldown > 0 || isResending) return;

    if (!formData.email.trim()) {
      setServerError('Please enter your email address to request a new code.');
      return;
    }

    setIsResending(true);
    setServerError('');

    try {
      await authService.forgotPassword({
        email: formData.email.trim().toLowerCase(),
      });

      setServerSuccess('A fresh reset code has been sent to your email.');
      setCooldown(60);
    } catch (err) {
      console.error('Resend Reset Code Error:', err);
      const msg = getErrorMessage(err, 'Failed to request new reset code.');
      setServerError(msg);
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card auth-card-sm">
        {/* Header */}
        <div className="auth-header">
          <div className="auth-icon-badge">
            <Lock size={26} />
          </div>
          <h2 className="auth-title">Reset Password</h2>
          <p className="auth-subtitle">
            Enter your OTP code and create a new secure password
          </p>
        </div>

        {/* Success Alert */}
        {serverSuccess && (
          <div className="alert-banner alert-banner-success">
            <CheckCircle2 size={18} />
            <span>{serverSuccess}</span>
          </div>
        )}

        {/* Error Alert */}
        {serverError && (
          <div className="alert-banner alert-banner-error">
            <AlertCircle size={18} />
            <span>{serverError}</span>
          </div>
        )}

        {/* Reset Form */}
        <form className="auth-form" onSubmit={handleSubmit}>
          {/* Email */}
          <div className="form-group">
            <label className="form-label" htmlFor="reset-email">
              <span>Account Email</span>
            </label>
            <input
              type="email"
              id="reset-email"
              name="email"
              className={`form-input ${errors.email ? 'input-error' : ''}`}
              placeholder="e.g. sarah.chen@example.com"
              value={formData.email}
              onChange={handleChange}
              disabled={isSubmitting}
            />
            {errors.email && <span className="error-message">{errors.email}</span>}
          </div>

          {/* 6-Digit OTP */}
          <div className="form-group">
            <label className="form-label" htmlFor="reset-otp">
              <span>6-Digit Reset Code (OTP)</span>
            </label>
            <input
              type="text"
              id="reset-otp"
              name="otp"
              inputMode="numeric"
              maxLength={6}
              className={`form-input otp-input-single ${
                errors.otp ? 'input-error' : ''
              }`}
              placeholder="123456"
              value={formData.otp}
              onChange={handleChange}
              disabled={isSubmitting}
            />
            {errors.otp && <span className="error-message">{errors.otp}</span>}
          </div>

          {/* New Password */}
          <div className="form-group">
            <label className="form-label" htmlFor="newPassword">
              <span>New Password</span>
            </label>
            <input
              type="password"
              id="newPassword"
              name="newPassword"
              className={`form-input ${errors.newPassword ? 'input-error' : ''}`}
              placeholder="At least 6 characters"
              value={formData.newPassword}
              onChange={handleChange}
              disabled={isSubmitting}
            />
            {errors.newPassword && (
              <span className="error-message">{errors.newPassword}</span>
            )}
          </div>

          {/* Confirm New Password */}
          <div className="form-group">
            <label className="form-label" htmlFor="confirmPassword">
              <span>Confirm New Password</span>
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              className={`form-input ${
                errors.confirmPassword ? 'input-error' : ''
              }`}
              placeholder="Re-enter new password"
              value={formData.confirmPassword}
              onChange={handleChange}
              disabled={isSubmitting}
            />
            {errors.confirmPassword && (
              <span className="error-message">{errors.confirmPassword}</span>
            )}
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-auth-submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Updating Password...' : 'Reset Password'}
            {!isSubmitting && <ArrowRight size={18} />}
          </button>
        </form>

        {/* Resend OTP Row */}
        <div className="otp-resend-row">
          <span style={{ color: 'var(--text-muted)' }}>Didn't receive code?</span>
          <button
            type="button"
            className="btn-resend"
            onClick={handleResendOtp}
            disabled={cooldown > 0 || isResending}
          >
            {isResending ? (
              'Sending...'
            ) : cooldown > 0 ? (
              `Resend code in ${cooldown}s`
            ) : (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <RotateCw size={14} /> Resend OTP
              </span>
            )}
          </button>
        </div>

        {/* Footer */}
        <div className="auth-footer">
          Remember your password? <Link to="/login">Back to Login</Link>
        </div>
      </div>
    </div>
  );
}

export default ResetPassword;
