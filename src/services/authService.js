import api from './api';

export const registerUser = async (userData) => {
    // Expected userData: { firstname, lastname, email, password, role, adminCode? }
    const response = await api.post('/auth/register', userData);
    return response.data;
};

export const loginUser = async (credentials) => {
    // Expected credentials: { email, password }
    const response = await api.post('/auth/authenticate', credentials);
    return response.data;
};

// We will implement the specific Google Auth API call later if needed