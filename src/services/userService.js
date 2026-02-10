import api from './api';

// ADMIN: Get all users - Paginated
export const getAllUsers = async (page = 0, size = 10, role = null) => {
    const params = { page, size };
    if (role) {
        params.role = role;
    }
    const response = await api.get('/admin/users', { params });
    return response.data;
};

// ADMIN: Get total count of all users
export const getTotalUserCount = async () => {
    const response = await api.get('/admin/users/count');
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

// ADMIN: Get user's borrow records - Paginated
export const getUserBorrowRecords = async (userId, page = 0, size = 10) => {
    const response = await api.get(`/admin/users/${userId}/records`, {
        params: { page, size }
    });
    return response.data;
};

// ADMIN: Update borrow record
export const updateBorrowRecord = async (recordId, data) => {
    const response = await api.put(`/admin/users/records/${recordId}`, data);
    return response.data;
};
