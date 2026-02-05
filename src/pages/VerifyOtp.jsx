import { useState, useEffect } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { verifyOtp, resendOtp } from '../services/authService';
import { toast } from 'react-toastify';
import OtpInput from '../components/OtpInput';
import Button from '../components/Button';
import Card from '../components/Card';
import './Auth.css';

const VerifyOtp = () => {
    const [searchParams] = useSearchParams();
    const location = useLocation();
    const navigate = useNavigate();

    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const [resending, setResending] = useState(false);
    const [error, setError] = useState('');
    const [countdown, setCountdown] = useState(0);
    const [timeLeft, setTimeLeft] = useState(600); // 10 minutes in seconds

    useEffect(() => {
        // Get email from URL params or location state
        const emailParam = searchParams.get('email') || location.state?.email;

        if (!emailParam) {
            toast.error('Email not provided. Please register again.');
            navigate('/register');
        } else {
            setEmail(emailParam);
        }
    }, [searchParams, location.state, navigate]);

    // Countdown timer for resend button
    useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [countdown]);

    // OTP expiry countdown
    useEffect(() => {
        if (timeLeft > 0) {
            const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [timeLeft]);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (otp.length !== 6) {
            setError('Please enter all 6 digits');
            return;
        }

        setLoading(true);
        setError('');

        try {
            await verifyOtp(email, otp);
            toast.success('Email verified successfully! Please login.');
            navigate('/login');
        } catch (error) {
            console.error('OTP verification error:', error);
            const message = error.response?.data?.message || error.message || 'Invalid OTP code';

            if (message.includes('expired')) {
                setError('OTP has expired. Please request a new one.');
                toast.error('OTP expired. Click "Resend OTP" to get a new code.');
            } else {
                setError(message);
                toast.error(message);
            }
            setOtp(''); // Clear OTP on error
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        if (countdown > 0) return;

        setResending(true);
        setError('');

        try {
            await resendOtp(email);
            toast.success('New OTP sent to your email!');
            setCountdown(60); // 60 second cooldown
            setTimeLeft(600); // Reset 10 minute timer
            setOtp(''); // Clear current OTP
        } catch (error) {
            console.error('Resend OTP error:', error);
            toast.error(error.response?.data?.message || 'Failed to resend OTP. Please try again.');
        } finally {
            setResending(false);
        }
    };

    // Auto-submit when 6 digits are entered
    useEffect(() => {
        if (otp.length === 6 && !loading) {
            handleSubmit(new Event('submit'));
        }
    }, [otp]);

    return (
        <div className="auth-page">
            <div className="auth-container">
                <Card className="auth-card">
                    <div className="auth-header">
                        <h1 className="auth-title">Verify Your Email</h1>
                        <p className="auth-subtitle">
                            We sent a 6-digit code to
                        </p>
                        <p className="auth-subtitle" style={{ fontWeight: 'bold', color: 'var(--color-primary)' }}>
                            {email}
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="auth-form">
                        <OtpInput
                            length={6}
                            value={otp}
                            onChange={setOtp}
                            error={error}
                        />

                        {timeLeft > 0 && (
                            <div style={{ textAlign: 'center', marginBottom: 'var(--spacing-md)' }}>
                                <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-gray-600)' }}>
                                    Code expires in: <strong style={{ color: timeLeft < 60 ? 'var(--color-danger)' : 'var(--color-primary)' }}>
                                        {formatTime(timeLeft)}
                                    </strong>
                                </p>
                            </div>
                        )}

                        <Button
                            type="submit"
                            variant="primary"
                            loading={loading}
                            disabled={otp.length !== 6}
                            className="auth-submit"
                        >
                            {loading ? 'Verifying...' : 'Verify Email'}
                        </Button>

                        <div style={{ textAlign: 'center', marginTop: 'var(--spacing-md)' }}>
                            <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-gray-600)' }}>
                                Didn't receive the code?{' '}
                                <button
                                    type="button"
                                    onClick={handleResend}
                                    disabled={countdown > 0 || resending}
                                    className="auth-link"
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        cursor: countdown > 0 || resending ? 'not-allowed' : 'pointer',
                                        opacity: countdown > 0 || resending ? 0.5 : 1
                                    }}
                                >
                                    {resending ? 'Sending...' : countdown > 0 ? `Resend (${countdown}s)` : 'Resend OTP'}
                                </button>
                            </p>
                        </div>
                    </form>
                </Card>

                <div className="auth-decoration">
                    <div className="decoration-circle circle-1"></div>
                    <div className="decoration-circle circle-2"></div>
                </div>
            </div>
        </div>
    );
};

export default VerifyOtp;
