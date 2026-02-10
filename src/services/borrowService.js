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

// USER: Get my borrowing history - Paginated
export const getMyHistory = async (page = 0, size = 10, status = null) => {
    const params = { page, size };
    if (status) {
        params.status = status;
    }
    const response = await api.get('/borrow/my-history', { params });
    return response.data;
};

// ADMIN: Get all borrowing history - Paginated
export const getAllHistory = async (page = 0, size = 10, status = null) => {
    const params = { page, size };
    if (status) {
        params.status = status;
    }
    const response = await api.get('/borrow/all', { params });
    return response.data;
};

// ADMIN: Get all borrowing history - Unpaginated (for dashboard stats)
export const getAllHistoryUnpaginated = async () => {
    const response = await api.get('/borrow/all/records');
    return response.data;
};

// USER: Get my borrowing history - Unpaginated (for dashboard stats)
export const getMyHistoryUnpaginated = async () => {
    const response = await api.get('/borrow/my-history/all');
    return response.data;
};

// ADMIN: Override borrow status
export const adminOverrideStatus = async (recordId, status) => {
    const response = await api.put(`/borrow/admin/override/${recordId}`, null, {
        params: { status }
    });
    return response.data;
};

// ADMIN: Get total count of all borrow records
export const getTotalRecordCount = async () => {
    const response = await api.get('/borrow/count');
    return response.data;
};
