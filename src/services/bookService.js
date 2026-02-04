import api from './api';

// Add a new book (with image)
export const addBook = async (bookData) => {
    // bookData must be a FormData object, not a plain JSON object
    const response = await api.post('/books', bookData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};

// Get all books
export const getAllBooks = async () => {
    const response = await api.get('/books');
    return response.data;
};