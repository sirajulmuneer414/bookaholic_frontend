import api from './api';

// Get all books (public/user)
export const getAllBooks = async () => {
    const response = await api.get('/books');
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
