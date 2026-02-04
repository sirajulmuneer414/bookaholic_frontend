import { createContext, useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem("token"));
    // We can't use useNavigate here directly if this component wraps Router, 
    // but usually, we structure it so we can, or we handle redirects in components.

    useEffect(() => {
        if (token) {
            try {
                const decoded = jwtDecode(token);
                // The JWT usually has "sub" (email) and "roles" or "authorities"
                // Let's assume our backend sends roles nicely, or we check the decoded object structure
                setUser({
                    email: decoded.sub,
                    // Check how your backend sends roles. It might be decoded.role or decoded.authorities
                    role: decoded.role || "USER" 
                });
            } catch (error) {
                logout();
            }
        }
    }, [token]);

    const login = (newToken) => {
        localStorage.setItem("token", newToken);
        setToken(newToken);
    };

    const logout = () => {
        localStorage.removeItem("token");
        setToken(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, token }}>
            {children}
        </AuthContext.Provider>
    );
};