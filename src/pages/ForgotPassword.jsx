import { useState } from 'react';
import { Link } from 'react-router-dom';
import { forgotPassword } from '../services/authService';
import { toast } from 'react-toastify';
import Input from '../components/Input';
import Button from '../components/Button';
import Card from '../components/Card';
import './Auth.css';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [emailSent, setEmailSent] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation
        if (!email) {
            setError('Email is required');
            return;
        }

        if (!/\S+@\S+\.\S+/.test(email)) {
            setError('Please enter a valid email');
            return;
        }

        setLoading(true);
        setError('');

        try {
            await forgotPassword(email);
            setEmailSent(true);
            toast.success('Password reset instructions sent to your email!');
        } catch (error) {
            console.error('Forgot password error:', error);
            toast.error(error.response?.data?.message || 'Failed to process request. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (emailSent) {
        return (
            <div className="auth-page">
                <div className="auth-container">
                    <Card className="auth-card">
                        <div className="auth-header">
                            <div className="success-icon">✓</div>
                            <h1 className="auth-title">Check Your Email</h1>
                            <p className="auth-subtitle">
                                We've sent password reset instructions to <strong>{email}</strong>
                            </p>
                        </div>

                        <div className="auth-form">
                            <div className="info-box">
                                <p>📧 Check your inbox for an email from Bookaholic</p>
                                <p>⏰ The reset link will expire in 1 hour</p>
                                <p>📁 Don't forget to check your spam folder</p>
                            </div>

                            <Link to="/login" className="auth-link-button">
                                <Button variant="primary" className="auth-submit">
                                    Back to Login
                                </Button>
                            </Link>
                        </div>
                    </Card>

                    <div className="auth-decoration">
                        <div className="decoration-circle circle-1"></div>
                        <div className="decoration-circle circle-2"></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="auth-page">
            <div className="auth-container">
                <Card className="auth-card">
                    <div className="auth-header">
                        <h1 className="auth-title">Forgot Password?</h1>
                        <p className="auth-subtitle">
                            Enter your email and we'll send you a link to reset your password
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="auth-form">
                        <Input
                            label="Email Address"
                            type="email"
                            name="email"
                            value={email}
                            onChange={(e) => {
                                setEmail(e.target.value);
                                setError('');
                            }}
                            placeholder="your.email@example.com"
                            error={error}
                            required
                        />

                        <Button
                            type="submit"
                            variant="primary"
                            loading={loading}
                            className="auth-submit"
                        >
                            {loading ? 'Sending...' : 'Send Reset Link'}
                        </Button>
                    </form>

                    <div className="auth-footer">
                        <p>
                            Remember your password?{' '}
                            <Link to="/login" className="auth-link">
                                Back to Login
                            </Link>
                        </p>
                    </div>
                </Card>

                <div className="auth-decoration">
                    <div className="decoration-circle circle-1"></div>
                    <div className="decoration-circle circle-2"></div>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
