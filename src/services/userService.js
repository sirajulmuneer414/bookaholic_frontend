import api from './api';

// ADMIN: Get all users
export const getAllUsers = async () => {
    const response = await api.get('/admin/users');
    return response.data;
};

// ADMIN: Get user by ID
export const getUserById = async (userId) => {
    const response = await api.get(`/admin/users/${userId}`);
    return response.data;
};

// ADMIN: Update user
export const updateUser = async (userId, data) => {
    const response = await api.put(`/admin/users/${userId}`, data);
    return response.data;
};

// ADMIN: Get user's borrow records
export const getUserBorrowRecords = async (userId) => {
    const response = await api.get(`/admin/users/${userId}/records`);
    return response.data;
};

// ADMIN: Update borrow record
export const updateBorrowRecord = async (recordId, data) => {
    const response = await api.put(`/admin/users/records/${recordId}`, data);
    return response.data;
};
