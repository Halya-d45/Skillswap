import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { KeyRound, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import { authService, getErrorMessage } from '../services/api';
import '../styles/Auth.css';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    if (!email.trim()) {
      setError('Please provide your registered email address.');
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await authService.forgotPassword({
        email: email.trim().toLowerCase(),
      });

      setSuccessMessage(
        res.message ||
          'If an account with that email exists and is verified, a password reset code has been sent.'
      );

      // Offer smooth navigation to Reset Password page after short delay
      setTimeout(() => {
        navigate('/reset-password', {
          state: {
            email: email.trim().toLowerCase(),
            infoMessage: 'Enter the 6-digit reset code sent to your email.',
          },
        });
      }, 1500);
    } catch (err) {
      console.error('Forgot Password Error:', err);
      const msg = getErrorMessage(err, 'Failed to process password reset request.');
      setError(msg);
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
            <KeyRound size={26} />
          </div>
          <h2 className="auth-title">Forgot Password?</h2>
          <p className="auth-subtitle">
            Enter your email to receive a 6-digit password reset OTP
          </p>
        </div>

        {/* Success Alert */}
        {successMessage && (
          <div className="alert-banner alert-banner-success">
            <CheckCircle2 size={18} />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="alert-banner alert-banner-error">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {/* Request Form */}
        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="forgot-email">
              <span>Account Email Address</span>
            </label>
            <input
              type="email"
              id="forgot-email"
              className={`form-input ${error ? 'input-error' : ''}`}
              placeholder="e.g. your.email@example.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (error) setError('');
              }}
              disabled={isSubmitting}
              required
            />
            <span className="form-input-help">
              We'll send a 6-digit OTP to this email if an active account exists.
            </span>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-auth-submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Sending Code...' : 'Send Reset Code'}
            {!isSubmitting && <ArrowRight size={18} />}
          </button>
        </form>

        <div className="otp-resend-row" style={{ marginTop: '20px' }}>
          <span style={{ color: 'var(--text-muted)' }}>Already have a code?</span>
          <Link
            to="/reset-password"
            state={{ email: email.trim().toLowerCase() }}
            className="btn-resend"
            style={{ textDecoration: 'none' }}
          >
            Enter Reset Code →
          </Link>
        </div>

        {/* Footer */}
        <div className="auth-footer">
          Remembered your password? <Link to="/login">Back to Login</Link>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;
