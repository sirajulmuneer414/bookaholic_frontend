import { useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const isActive = (path) => location.pathname === path;

    return (
        <nav className="navbar">
            <div className="container">
                <div className="navbar-content">
                    <Link to="/" className="navbar-brand">
                        <span className="brand-icon">📚</span>
                        <span className="brand-text">Bookaholic</span>
                    </Link>

                    {user && (
                        <div className="navbar-menu">
                            {user.role === 'ADMIN' ? (
                                <>
                                    <Link
                                        to="/admin/dashboard"
                                        className={`nav-link ${isActive('/admin/dashboard') ? 'active' : ''}`}
                                    >
                                        Dashboard
                                    </Link>
                                    <Link
                                        to="/admin/books"
                                        className={`nav-link ${isActive('/admin/books') ? 'active' : ''}`}
                                    >
                                        Manage Books
                                    </Link>
                                    <Link
                                        to="/admin/records"
                                        className={`nav-link ${isActive('/admin/records') ? 'active' : ''}`}
                                    >
                                        Borrow Records
                                    </Link>
                                </>
                            ) : (
                                <>
                                    <Link
                                        to="/user/dashboard"
                                        className={`nav-link ${isActive('/user/dashboard') ? 'active' : ''}`}
                                    >
                                        Home
                                    </Link>
                                    <Link
                                        to="/user/books"
                                        className={`nav-link ${isActive('/user/books') ? 'active' : ''}`}
                                    >
                                        Browse Books
                                    </Link>
                                    <Link
                                        to="/user/my-books"
                                        className={`nav-link ${isActive('/user/my-books') ? 'active' : ''}`}
                                    >
                                        My Books
                                    </Link>
                                </>
                            )}

                            <div className="navbar-user">
                                <span className="user-email">{user.email}</span>
                                <button onClick={handleLogout} className="btn btn-sm btn-outline">
                                    Logout
                                </button>
                            </div>
                        </div>
                    )}

                    {!user && location.pathname !== '/login' && location.pathname !== '/register' && (
                        <div className="navbar-menu">
                            <Link to="/login" className="btn btn-sm btn-outline">
                                Login
                            </Link>
                            <Link to="/register" className="btn btn-sm btn-primary">
                                Register
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
