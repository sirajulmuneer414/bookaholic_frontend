import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { loginUser } from '../services/authService';
import { toast } from 'react-toastify';
import { jwtDecode } from "jwt-decode";

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const data = await loginUser({ email, password });
            
            // 1. Save Token
            login(data.token);
            
            // 2. Decode to check Role for redirect
            const decoded = jwtDecode(data.token);
            
            // If the decoded token has a 'role' field, we can use it for more specific redirects
            if (decoded.role && decoded.role.includes("ADMIN")) {
                navigate('/admin');
            } else {
                navigate('/home');
            }   


            toast.success("Login Successful!");
            
            // Simple redirect logic
            // (You can check decoded.sub or decoded.roles here to be more specific)
            navigate('/dashboard'); 
            
        } catch (error) {
            toast.error("Invalid Credentials");
        }
    };

    return (
        <div style={styles.container}>
            <h2>Login</h2>
            <form onSubmit={handleSubmit} style={styles.form}>
                <input 
                    type="email" 
                    placeholder="Email" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    style={styles.input}
                    required
                />
                <input 
                    type="password" 
                    placeholder="Password" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    style={styles.input}
                    required
                />
                <button type="submit" style={styles.button}>Login</button>
            </form>
            <p>Don't have an account? <Link to="/register">Register here</Link></p>
        </div>
    );
};

const styles = {
    container: { maxWidth: '400px', margin: '50px auto', textAlign: 'center', padding: '20px', border: '1px solid #ddd', borderRadius: '8px' },
    form: { display: 'flex', flexDirection: 'column', gap: '15px' },
    input: { padding: '10px', fontSize: '16px' },
    button: { padding: '10px', backgroundColor: '#007BFF', color: '#fff', border: 'none', cursor: 'pointer', fontSize: '16px' }
};

export default Login;