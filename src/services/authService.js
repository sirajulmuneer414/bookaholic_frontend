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

export const googleAuth = async (token) => {
    const response = await api.post('/auth/google', { token });
    return response.data;
};

export const forgotPassword = async (email) => {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
};

export const resetPassword = async (token, newPassword) => {
    const response = await api.post('/auth/reset-password', { token, newPassword });
    return response.data;
};

export const verifyOtp = async (email, otp) => {
    const response = await api.post('/auth/verify-otp', { email, otp });
    return response.data;
};

export const resendOtp = async (email) => {
    const response = await api.post('/auth/resend-otp', { email });
    return response.data;
};
