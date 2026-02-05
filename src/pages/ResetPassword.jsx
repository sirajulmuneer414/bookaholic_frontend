import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { resetPassword } from '../services/authService';
import { toast } from 'react-toastify';
import Input from '../components/Input';
import Button from '../components/Button';
import Card from '../components/Card';
import './Auth.css';

const ResetPassword = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        newPassword: '',
        confirmPassword: ''
    });
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [token, setToken] = useState('');

    useEffect(() => {
        const tokenParam = searchParams.get('token');
        if (!tokenParam) {
            toast.error('Invalid reset link');
            navigate('/login');
        } else {
            setToken(tokenParam);
        }
    }, [searchParams, navigate]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validate = () => {
        const newErrors = {};

        if (!formData.newPassword) {
            newErrors.newPassword = 'Password is required';
        } else if (formData.newPassword.length < 6) {
            newErrors.newPassword = 'Password must be at least 6 characters';
        }

        if (formData.newPassword !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        return newErrors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const newErrors = validate();
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setLoading(true);
        try {
            await resetPassword(token, formData.newPassword);
            toast.success('Password reset successful! Please login with your new password.');
            navigate('/login');
        } catch (error) {
            console.error('Reset password error:', error);
            const message = error.response?.data?.message || error.message || 'Failed to reset password';

            if (message.includes('expired')) {
                toast.error('Reset link has expired. Please request a new one.');
                setTimeout(() => navigate('/forgot-password'), 2000);
            } else if (message.includes('Invalid')) {
                toast.error('Invalid reset link. Please request a new one.');
                setTimeout(() => navigate('/forgot-password'), 2000);
            } else {
                toast.error(message);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-container">
                <Card className="auth-card">
                    <div className="auth-header">
                        <h1 className="auth-title">Reset Password</h1>
                        <p className="auth-subtitle">
                            Enter your new password below
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="auth-form">
                        <Input
                            label="New Password"
                            type="password"
                            name="newPassword"
                            value={formData.newPassword}
                            onChange={handleChange}
                            placeholder="At least 6 characters"
                            error={errors.newPassword}
                            required
                        />

                        <Input
                            label="Confirm New Password"
                            type="password"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            placeholder="Re-enter your new password"
                            error={errors.confirmPassword}
                            required
                        />

                        <Button
                            type="submit"
                            variant="primary"
                            loading={loading}
                            className="auth-submit"
                        >
                            {loading ? 'Resetting Password...' : 'Reset Password'}
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

export default ResetPassword;
