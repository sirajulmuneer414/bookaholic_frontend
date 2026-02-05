import { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import './Landing.css';

const Landing = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    // Redirect if already logged in
    if (user) {
        if (user.role === 'ADMIN') {
            navigate('/admin/dashboard');
        } else {
            navigate('/user/dashboard');
        }
        return null;
    }

    return (
        <div className="landing-page">
            {/* Hero Section */}
            <section className="hero">
                <div className="container">
                    <div className="hero-content">
                        <div className="hero-text">
                            <h1 className="hero-title">
                                Welcome to <span className="text-primary">Bookaholic</span>
                            </h1>
                            <p className="hero-subtitle">
                                Your Digital Library Management System
                            </p>
                            <p className="hero-description">
                                Discover, borrow, and manage books with ease. Join our community of book lovers and get instant access to thousands of titles.
                            </p>
                            <div className="hero-actions">
                                <Link to="/register" className="btn btn-primary btn-lg">
                                    Get Started
                                </Link>
                                <Link to="/login" className="btn btn-outline btn-lg">
                                    Login
                                </Link>
                            </div>
                        </div>
                        <div className="hero-image">
                            <div className="book-stack">
                                <div className="book book-1">📚</div>
                                <div className="book book-2">📖</div>
                                <div className="book book-3">📕</div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="features">
                <div className="container">
                    <h2 className="section-title text-center mb-xl">
                        Why Choose Bookaholic?
                    </h2>
                    <div className="features-grid grid grid-cols-3 gap-xl">
                        <div className="feature-card card text-center">
                            <div className="feature-icon">📚</div>
                            <h3 className="feature-title">Browse Books</h3>
                            <p className="feature-description">
                                Explore our extensive collection of books across various genres and authors.
                            </p>
                        </div>
                        <div className="feature-card card text-center">
                            <div className="feature-icon">⏰</div>
                            <h3 className="feature-title">Easy Borrowing</h3>
                            <p className="feature-description">
                                Borrow books instantly and track your reading progress with due date reminders.
                            </p>
                        </div>
                        <div className="feature-card card text-center">
                            <div className="feature-icon">📊</div>
                            <h3 className="feature-title">Track Returns</h3>
                            <p className="feature-description">
                                Never miss a return date with our automated tracking and notification system.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* How It Works Section */}
            <section className="how-it-works">
                <div className="container">
                    <h2 className="section-title text-center mb-xl">
                        How It Works
                    </h2>
                    <div className="steps-grid grid grid-cols-4 gap-lg">
                        <div className="step text-center">
                            <div className="step-number">1</div>
                            <h4 className="step-title">Sign Up</h4>
                            <p className="step-description">Create your free account</p>
                        </div>
                        <div className="step text-center">
                            <div className="step-number">2</div>
                            <h4 className="step-title">Browse</h4>
                            <p className="step-description">Explore available books</p>
                        </div>
                        <div className="step text-center">
                            <div className="step-number">3</div>
                            <h4 className="step-title">Borrow</h4>
                            <p className="step-description">Select and borrow books</p>
                        </div>
                        <div className="step text-center">
                            <div className="step-number">4</div>
                            <h4 className="step-title">Enjoy</h4>
                            <p className="step-description">Read and return on time</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="cta">
                <div className="container">
                    <div className="cta-content text-center">
                        <h2 className="cta-title">Ready to Start Your Reading Journey?</h2>
                        <p className="cta-description">
                            Join thousands of readers who trust Bookaholic for their reading needs.
                        </p>
                        <Link to="/register" className="btn btn-primary btn-lg">
                            Create Free Account
                        </Link>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="footer">
                <div className="container text-center">
                    <p className="footer-text">
                        © 2026 Bookaholic. Your Digital Library Management System.
                    </p>
                </div>
            </footer>
        </div>
    );
};

export default Landing;
