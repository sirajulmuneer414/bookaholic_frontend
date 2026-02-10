import { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const PublicRoute = ({ children }) => {
    const { user, loading } = useContext(AuthContext);

    // Wait for auth to load before making decisions
    if (loading) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
                background: 'var(--color-gray-50)'
            }}>
                <div className="spinner spinner-primary"></div>
            </div>
        );
    }

    // If user is logged in, redirect to their dashboard
    if (user) {
        if (user.role === 'ADMIN') {
            return <Navigate to="/admin/dashboard" replace />;
        } else {
            return <Navigate to="/user/dashboard" replace />;
        }
    }

    // User is not logged in, show the public page
    return children;
};

export default PublicRoute;
