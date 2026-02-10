import { useState, useEffect } from 'react';
import { getAllBooks, addBook, updateBook } from '../../services/bookService';
import { toast } from 'react-toastify';
import Navbar from '../../components/Navbar';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Input from '../../components/Input';
import Modal from '../../components/Modal';
import Pagination from '../../components/Pagination';
import './ManageBooks.css';

const ManageBooks = () => {
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [editingBook, setEditingBook] = useState(null); // Track which book we're editing
    const [currentPage, setCurrentPage] = useState(0);
    const [paginationData, setPaginationData] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        author: '',
        isbn: '',
        copies: '',
        image: null
    });
    const [errors, setErrors] = useState({});

    useEffect(() => {
        fetchBooks(currentPage);
    }, [currentPage]);

    const fetchBooks = async (page) => {
        setLoading(true);
        try {
            const data = await getAllBooks(page, 10);
            setPaginationData(data);
            setBooks(data.content);
        } catch (error) {
            console.error('Error fetching books:', error);
            toast.error('Failed to load books');
        } finally {
            setLoading(false);
        }
    };

    const handlePageChange = (newPage) => {
        setCurrentPage(newPage);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData(prev => ({ ...prev, image: file }));
            if (errors.image) {
                setErrors(prev => ({ ...prev, image: '' }));
            }
        }
    };

    const validate = () => {
        const newErrors = {};
        if (!formData.title.trim()) newErrors.title = 'Title is required';
        if (!formData.author.trim()) newErrors.author = 'Author is required';
        if (!formData.isbn.trim()) newErrors.isbn = 'ISBN is required';
        if (!formData.copies || formData.copies < 1) newErrors.copies = 'Copies must be at least 1';
        // Image is only required when adding new book, not when editing
        if (!editingBook && !formData.image) newErrors.image = 'Book image is required';
        return newErrors;
    };

    const handleEditClick = (book) => {
        setEditingBook(book);
        setFormData({
            title: book.title,
            author: book.author,
            isbn: book.isbn,
            copies: book.totalCopies,
            image: null // Don't pre-fill image, user can optionally upload new one
        });
        setIsModalOpen(true);
    };

    const handleAddClick = () => {
        setEditingBook(null);
        setFormData({ title: '', author: '', isbn: '', copies: '', image: null });
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const newErrors = validate();
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setSubmitting(true);
        try {
            const formDataToSend = new FormData();
            formDataToSend.append('title', formData.title);
            formDataToSend.append('author', formData.author);
            formDataToSend.append('isbn', formData.isbn);

            if (editingBook) {
                // When editing, use totalCopies parameter
                formDataToSend.append('totalCopies', formData.copies);
                // Image is optional when editing
                if (formData.image) {
                    formDataToSend.append('image', formData.image);
                }
                await updateBook(editingBook.id, formDataToSend);
                toast.success('Book updated successfully!');
            } else {
                // When adding, use copies parameter
                formDataToSend.append('copies', formData.copies);
                formDataToSend.append('image', formData.image);
                await addBook(formDataToSend);
                toast.success('Book added successfully!');
            }

            setIsModalOpen(false);
            setEditingBook(null);
            setFormData({ title: '', author: '', isbn: '', copies: '', image: null });
            await fetchBooks();
        } catch (error) {
            console.error('Error saving book:', error);
            toast.error(error.response?.data?.message || `Failed to ${editingBook ? 'update' : 'add'} book`);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="manage-books">
            <Navbar />

            <div className="books-content">
                <div className="container">
                    {/* Header */}
                    <div className="books-header">
                        <div>
                            <h1 className="books-title">Manage Books</h1>
                            <p className="books-subtitle">Add new books or click to edit</p>
                        </div>
                        <Button variant="primary" onClick={handleAddClick}>
                            + Add New Book
                        </Button>
                    </div>

                    {/* Books Grid */}
                    {loading ? (
                        <div className="loading-container">
                            <div className="spinner spinner-primary"></div>
                            <p className="mt-md text-gray-600">Loading books...</p>
                        </div>
                    ) : books.length > 0 ? (
                        <div className="admin-books-grid grid grid-cols-4 gap-lg">
                            {books.map(book => (
                                <Card
                                    key={book.id}
                                    className="admin-book-card"
                                    onClick={() => handleEditClick(book)}
                                >
                                    <div className="admin-book-image">
                                        {book.imageUrl ? (
                                            <img src={book.imageUrl} alt={book.title} />
                                        ) : (
                                            <div className="book-placeholder">📚</div>
                                        )}
                                    </div>
                                    <div className="admin-book-info">
                                        <h3 className="admin-book-title">{book.title}</h3>
                                        <p className="admin-book-author">by {book.author}</p>
                                        <div className="admin-book-meta">
                                            <div className="meta-row">
                                                <span className="meta-label">ISBN:</span>
                                                <span className="meta-value">{book.isbn}</span>
                                            </div>
                                            <div className="meta-row">
                                                <span className="meta-label">Available:</span>
                                                <span className="meta-value text-primary font-bold">
                                                    {book.availableCopies}/{book.totalCopies}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    ) : null}

                    {/* Books Grid - Show Pagination or Empty State */}
                    {!loading && books.length > 0 && paginationData && paginationData.totalPages > 1 && (
                        <Pagination
                            currentPage={paginationData.currentPage}
                            totalPages={paginationData.totalPages}
                            hasNext={paginationData.hasNext}
                            hasPrevious={paginationData.hasPrevious}
                            onPageChange={handlePageChange}
                        />
                    )}

                    {!loading && books.length === 0 && (
                        <Card className="text-center p-xl">
                            <div className="empty-icon">📚</div>
                            <h3 className="empty-title">No books in collection</h3>
                            <p className="empty-text">Click "Add New Book" to get started</p>
                        </Card>
                    )}
                </div>
            </div>

            {/* Add Book Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => !submitting && setIsModalOpen(false)}
                title={editingBook ? "Edit Book" : "Add New Book"}
                size="medium"
            >
                <form onSubmit={handleSubmit}>
                    <Input
                        label="Book Title"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        placeholder="Enter book title"
                        error={errors.title}
                        required
                    />

                    <Input
                        label="Author"
                        name="author"
                        value={formData.author}
                        onChange={handleChange}
                        placeholder="Enter author name"
                        error={errors.author}
                        required
                    />

                    <Input
                        label="ISBN"
                        name="isbn"
                        value={formData.isbn}
                        onChange={handleChange}
                        placeholder="Enter ISBN number"
                        error={errors.isbn}
                        required
                    />

                    <Input
                        label="Number of Copies"
                        type="number"
                        name="copies"
                        value={formData.copies}
                        onChange={handleChange}
                        placeholder="Enter number of copies"
                        error={errors.copies}
                        required
                        min="1"
                    />

                    <div className="input-group">
                        <label className="input-label">
                            Book Cover Image {!editingBook && <span className="text-error">*</span>}
                        </label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="input-field"
                            required={!editingBook}
                        />
                        {errors.image && <span className="input-error">{errors.image}</span>}
                        {editingBook && !formData.image && (
                            <p className="text-sm text-gray-600 mt-xs">
                                Leave empty to keep current image
                            </p>
                        )}
                        {formData.image && (
                            <p className="text-sm text-gray-600 mt-xs">
                                Selected: {formData.image.name}
                            </p>
                        )}
                    </div>

                    <div className="flex justify-end gap-md mt-xl">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() => setIsModalOpen(false)}
                            disabled={submitting}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" variant="primary" loading={submitting}>
                            {submitting
                                ? (editingBook ? 'Updating...' : 'Adding...')
                                : (editingBook ? 'Update Book' : 'Add Book')
                            }
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default ManageBooks;
