import api from './api';

// USER: Borrow a book
export const borrowBook = async (bookId) => {
    const response = await api.post(`/borrow/${bookId}`);
    return response.data;
};

// USER: Return a book
export const returnBook = async (recordId) => {
    const response = await api.put(`/borrow/return/${recordId}`);
    return response.data;
};

// USER: Get my borrowing history
export const getMyHistory = async () => {
    const response = await api.get('/borrow/my-history');
    return response.data;
};

// ADMIN: Get all borrowing history
export const getAllHistory = async () => {
    const response = await api.get('/borrow/all');
    return response.data;
};

// ADMIN: Override borrow status
export const adminOverrideStatus = async (recordId, status) => {
    const response = await api.put(`/borrow/admin/override/${recordId}`, null, {
        params: { status }
    });
    return response.data;
};
