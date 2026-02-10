import api from './api';

// Get all books - Paginated (public/user)
export const getAllBooks = async (page = 0, size = 10) => {
    const response = await api.get('/books', {
        params: { page, size }
    });
    return response.data;
};

// Get all books - Unpaginated (for dashboard stats)
export const getAllBooksUnpaginated = async () => {
    const response = await api.get('/books/all');
    return response.data;
};

// Get a book by ID (public/user)
export const getBookById = async (id) => {
    const response = await api.get(`/books/${id}`);
    return response.data;
};

// Add a new book (admin only) - multipart/form-data
export const addBook = async (formData) => {
    const response = await api.post('/books', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};

// Update an existing book (admin only) - multipart/form-data
export const updateBook = async (id, formData) => {
    const response = await api.put(`/books/${id}`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};
