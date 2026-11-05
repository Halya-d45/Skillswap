import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, ArrowRight, RotateCw, AlertCircle, CheckCircle2, Mail } from 'lucide-react';
import { authService, getErrorMessage } from '../services/api';
import '../styles/Auth.css';

function VerifyOtp({ onLogin }) {
  const location = useLocation();
  const navigate = useNavigate();

  // Retrieve email from navigation state or URL query parameter
  const searchParams = new URLSearchParams(location.search);
  const initialEmail = location.state?.email || searchParams.get('email') || '';

  const [email, setEmail] = useState(initialEmail);
  const [digits, setDigits] = useState(['', '', '', '', '', '']);
  const [serverError, setServerError] = useState('');
  const [serverSuccess, setServerSuccess] = useState(
    location.state?.message || ''
  );
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [cooldown, setCooldown] = useState(60);

  const inputRefs = useRef([]);

  // 60-second countdown timer for resending OTP
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  // Handle individual digit input
  const handleDigitChange = (index, value) => {
    // Only allow numbers
    const cleanVal = value.replace(/\D/g, '');

    if (!cleanVal) {
      const newDigits = [...digits];
      newDigits[index] = '';
      setDigits(newDigits);
      return;
    }

    // If pasted multiple digits into one field
    if (cleanVal.length > 1) {
      handlePasteDigits(cleanVal);
      return;
    }

    const newDigits = [...digits];
    newDigits[index] = cleanVal.slice(-1);
    setDigits(newDigits);
    setServerError('');

    // Auto-advance to next input
    if (index < 5 && cleanVal) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePasteDigits = (pastedText) => {
    const numericOnly = pastedText.replace(/\D/g, '').slice(0, 6);
    if (!numericOnly) return;

    const newDigits = [...digits];
    for (let i = 0; i < 6; i++) {
      newDigits[i] = numericOnly[i] || '';
    }
    setDigits(newDigits);
    setServerError('');

    const focusIdx = Math.min(numericOnly.length, 5);
    inputRefs.current[focusIdx]?.focus();
  };

  const fullOtp = digits.join('');

  // Handle OTP Submission & Email Verification
  const handleVerify = async (e) => {
    e.preventDefault();
    setServerError('');
    setServerSuccess('');

    if (!email.trim()) {
      setServerError('Please provide your email address.');
      return;
    }

    if (fullOtp.length !== 6) {
      setServerError('Please enter the complete 6-digit verification code.');
      return;
    }

    setIsVerifying(true);

    try {
      const userData = await authService.verifyEmail({
        email: email.trim().toLowerCase(),
        otp: fullOtp,
      });

      setServerSuccess('Email verified successfully! Logging you in...');

      if (onLogin && userData) {
        onLogin(userData);
      }

      setTimeout(() => {
        navigate('/dashboard');
      }, 800);
    } catch (err) {
      console.error('Email Verification Failed:', err);
      const msg = getErrorMessage(
        err,
        'Invalid or expired verification code. Please check and try again.'
      );
      setServerError(msg);
    } finally {
      setIsVerifying(false);
    }
  };

  // Handle Resending OTP
  const handleResend = async () => {
    if (cooldown > 0 || isResending) return;

    if (!email.trim()) {
      setServerError('Please enter your email address to receive a new code.');
      return;
    }

    setIsResending(true);
    setServerError('');
    setServerSuccess('');

    try {
      const response = await authService.resendVerificationOtp({
        email: email.trim().toLowerCase(),
      });

      setServerSuccess(
        response.message || 'A new 6-digit code has been sent to your email.'
      );
      setCooldown(60);
      setDigits(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } catch (err) {
      console.error('Resend OTP Error:', err);
      const msg = getErrorMessage(
        err,
        'Failed to resend code. Please try again later.'
      );
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
            <ShieldCheck size={28} />
          </div>
          <h2 className="auth-title">Verify Your Email</h2>
          <p className="auth-subtitle">
            Enter the 6-digit code sent to your registered email address
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

        {/* Verification Form */}
        <form className="auth-form" onSubmit={handleVerify}>
          {/* Email field if not prefilled or user wants to edit */}
          <div className="form-group">
            <label className="form-label" htmlFor="verify-email">
              <span>Account Email</span>
              <Mail size={16} color="var(--text-muted)" />
            </label>
            <input
              type="email"
              id="verify-email"
              className="form-input"
              placeholder="e.g. your.email@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isVerifying}
              required
            />
          </div>

          {/* 6-Digit OTP Inputs */}
          <div className="form-group" style={{ textAlign: 'center' }}>
            <label className="form-label" style={{ justifyContent: 'center' }}>
              <span>6-Digit Verification Code</span>
            </label>
            
            <div
              className="otp-boxes-group"
              onPaste={(e) => {
                e.preventDefault();
                handlePasteDigits(e.clipboardData.getData('text'));
              }}
            >
              {digits.map((digit, idx) => (
                <input
                  key={idx}
                  ref={(el) => (inputRefs.current[idx] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={2}
                  className={`otp-digit-input ${digit ? 'has-value' : ''}`}
                  value={digit}
                  onChange={(e) => handleDigitChange(idx, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(idx, e)}
                  disabled={isVerifying}
                  autoFocus={idx === 0}
                />
              ))}
            </div>
            <span className="form-input-help">
              Code expires in 5 minutes. Paste or type digits.
            </span>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-auth-submit"
            disabled={isVerifying || fullOtp.length !== 6}
          >
            {isVerifying ? 'Verifying Code...' : 'Verify & Continue'}
            {!isVerifying && <ArrowRight size={18} />}
          </button>
        </form>

        {/* Resend Cooldown Section */}
        <div className="otp-resend-row">
          <span style={{ color: 'var(--text-muted)' }}>Didn't receive code?</span>
          <button
            type="button"
            className="btn-resend"
            onClick={handleResend}
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

        {/* Footer Link */}
        <div className="auth-footer">
          Already verified? <Link to="/login">Back to Login</Link>
        </div>
      </div>
    </div>
  );
}

export default VerifyOtp;
