import { createContext, useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem("token"));
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (token) {
            try {
                const decoded = jwtDecode(token);

                // Check if token is expired
                const currentTime = Date.now() / 1000;
                if (decoded.exp && decoded.exp < currentTime) {
                    console.warn("Token expired, logging out");
                    logout();
                    setLoading(false);
                    return;
                }

                // Extract role from JWT - backend sends it in authorities array
                let role = "USER";
                if (decoded.authorities) {
                    // authorities is usually an array like ["ROLE_USER"] or ["ROLE_ADMIN"]
                    const authorities = Array.isArray(decoded.authorities)
                        ? decoded.authorities
                        : [decoded.authorities];

                    if (authorities.some(auth => auth === 'ROLE_ADMIN' || auth === 'ADMIN')) {
                        role = 'ADMIN';
                    }
                } else if (decoded.role) {
                    // If role is directly in the token
                    role = decoded.role;
                }

                setUser({
                    email: decoded.sub,
                    role: role
                });
            } catch (error) {
                console.error("Invalid token:", error);
                logout();
            }
        }
        setLoading(false);
    }, [token]);

    // Listen for storage changes (when interceptor clears token)
    useEffect(() => {
        const handleStorageChange = (e) => {
            if (e.key === 'token' && !e.newValue) {
                // Token was removed
                setToken(null);
                setUser(null);
            }
        };
        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    const login = (newToken) => {
        localStorage.setItem("token", newToken);
        setToken(newToken);
    };

    const logout = () => {
        localStorage.removeItem("token");
        setToken(null);
        setUser(null);
    };

    const isAdmin = () => {
        return user?.role === 'ADMIN';
    };

    const isUser = () => {
        return user?.role === 'USER';
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, token, loading, isAdmin, isUser }}>
            {children}
        </AuthContext.Provider>
    );
};
