import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { AuthContext } from '../context/AuthContext';
import { registerUser, googleAuth } from '../services/authService';
import { toast } from 'react-toastify';
import Input from '../components/Input';
import Button from '../components/Button';
import Card from '../components/Card';
import './Auth.css';

const Register = () => {
    const [formData, setFormData] = useState({
        firstname: '',
        lastname: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'USER', // Default to USER
        adminCode: ''
    });
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        // Clear error for this field
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validate = () => {
        const newErrors = {};

        if (!formData.firstname.trim()) {
            newErrors.firstname = 'First name is required';
        }

        if (!formData.lastname.trim()) {
            newErrors.lastname = 'Last name is required';
        }

        if (!formData.email) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Email is invalid';
        }

        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else if (formData.password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
        }

        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        // Validate admin code if registering as ADMIN
        if (formData.role === 'ADMIN' && !formData.adminCode.trim()) {
            newErrors.adminCode = 'Admin secret code is required';
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
            const response = await registerUser(formData);
            toast.success(response || 'Registration successful! Please check your email for OTP.');

            // Navigate to OTP verification page with email
            navigate('/verify-otp?email=' + encodeURIComponent(formData.email), {
                state: { email: formData.email }
            });
        } catch (error) {
            console.error('Registration error:', error);
            toast.error(error.response?.data?.message || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSuccess = async (credentialResponse) => {
        try {
            const response = await googleAuth(credentialResponse.credential);
            login(response.token);
            toast.success('Registered successfully with Google!');
            navigate('/user/dashboard');
        } catch (error) {
            console.error('Google registration error:', error);
            toast.error(error.response?.data?.message || 'Google authentication failed');
        }
    };

    const handleGoogleError = () => {
        toast.error('Google Sign-In failed. Please try again.');
    };

    return (
        <div className="auth-page">
            <div className="auth-container">
                <Card className="auth-card">
                    <div className="auth-header">
                        <h1 className="auth-title">Create Account</h1>
                        <p className="auth-subtitle">Join Bookaholic today</p>
                    </div>

                    <form onSubmit={handleSubmit} className="auth-form">
                        {/* Google Sign-In Button - Only for USER role */}
                        {formData.role === 'USER' && (
                            <>
                                <div style={{ marginBottom: 'var(--spacing-md)' }}>
                                    <GoogleLogin
                                        onSuccess={handleGoogleSuccess}
                                        onError={handleGoogleError}
                                        useOneTap={false}
                                        text="continue_with"
                                        shape="pill"
                                        size="large"
                                        width="100%"
                                    />
                                </div>
                                <div className="auth-divider">
                                    <span>OR continue with email</span>
                                </div>
                            </>
                        )}

                        <div className="form-row">
                            <Input
                                label="First Name"
                                type="text"
                                name="firstname"
                                value={formData.firstname}
                                onChange={handleChange}
                                placeholder="John"
                                error={errors.firstname}
                                required
                            />

                            <Input
                                label="Last Name"
                                type="text"
                                name="lastname"
                                value={formData.lastname}
                                onChange={handleChange}
                                placeholder="Doe"
                                error={errors.lastname}
                                required
                            />
                        </div>

                        <Input
                            label="Email"
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="john.doe@example.com"
                            error={errors.email}
                            required
                        />

                        {/* Role Selection */}
                        <div className="input-group">
                            <label className="input-label">
                                Register as <span className="text-error">*</span>
                            </label>
                            <div className="role-selection">
                                <label className="role-option">
                                    <input
                                        type="radio"
                                        name="role"
                                        value="USER"
                                        checked={formData.role === 'USER'}
                                        onChange={handleChange}
                                    />
                                    <span className="role-label">
                                        <span className="role-icon">👤</span>
                                        <span>
                                            <strong>User</strong>
                                            <small>Browse and borrow books</small>
                                        </span>
                                    </span>
                                </label>
                                <label className="role-option">
                                    <input
                                        type="radio"
                                        name="role"
                                        value="ADMIN"
                                        checked={formData.role === 'ADMIN'}
                                        onChange={handleChange}
                                    />
                                    <span className="role-label">
                                        <span className="role-icon">👨‍💼</span>
                                        <span>
                                            <strong>Admin</strong>
                                            <small>Manage library system</small>
                                        </span>
                                    </span>
                                </label>
                            </div>
                        </div>

                        {/* Admin Code Input - Only show if ADMIN is selected */}
                        {formData.role === 'ADMIN' && (
                            <Input
                                label="Admin Secret Code"
                                type="password"
                                name="adminCode"
                                value={formData.adminCode}
                                onChange={handleChange}
                                placeholder="Enter admin secret code"
                                error={errors.adminCode}
                                required
                            />
                        )}

                        <Input
                            label="Password"
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="At least 6 characters"
                            error={errors.password}
                            required
                        />

                        <Input
                            label="Confirm Password"
                            type="password"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            placeholder="Re-enter your password"
                            error={errors.confirmPassword}
                            required
                        />

                        <Button
                            type="submit"
                            variant="primary"
                            loading={loading}
                            className="auth-submit"
                        >
                            {loading ? 'Creating Account...' : 'Register'}
                        </Button>
                    </form>

                    <div className="auth-footer">
                        <p>
                            Already have an account?{' '}
                            <Link to="/login" className="auth-link">
                                Login here
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

export default Register;