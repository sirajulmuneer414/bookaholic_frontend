import { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const ProtectedRoute = ({ children, requiredRole }) => {
    const { user, token } = useContext(AuthContext);

    // If no token, redirect to login
    if (!token) {
        return <Navigate to="/login" replace />;
    }

    // If no user (token is invalid), redirect to login
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // If requiredRole is specified and user doesn't have it
    if (requiredRole && user.role !== requiredRole) {
        // Redirect based on actual role
        if (user.role === 'ADMIN') {
            return <Navigate to="/admin/dashboard" replace />;
        } else {
            return <Navigate to="/user/dashboard" replace />;
        }
    }

    return children;
};

export default ProtectedRoute;
