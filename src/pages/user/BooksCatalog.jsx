import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllBooks } from '../../services/bookService';
import { toast } from 'react-toastify';
import Navbar from '../../components/Navbar';
import Card from '../../components/Card';
import './BooksCatalog.css';

const BooksCatalog = () => {
    const [books, setBooks] = useState([]);
    const [filteredBooks, setFilteredBooks] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchBooks();
    }, []);

    useEffect(() => {
        filterBooks();
    }, [searchTerm, books]);

    const fetchBooks = async () => {
        try {
            const data = await getAllBooks();
            setBooks(data);
            setFilteredBooks(data);
        } catch (error) {
            console.error('Error fetching books:', error);
            toast.error('Failed to load books');
        } finally {
            setLoading(false);
        }
    };

    const filterBooks = () => {
        if (!searchTerm) {
            setFilteredBooks(books);
            return;
        }

        const filtered = books.filter(book =>
            book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            book.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
            book.isbn.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredBooks(filtered);
    };

    const handleBookClick = (bookId) => {
        navigate(`/user/books/${bookId}`);
    };

    return (
        <div className="books-catalog">
            <Navbar />

            <div className="catalog-content">
                <div className="container">
                    {/* Header */}
                    <div className="catalog-header">
                        <div>
                            <h1 className="catalog-title">Browse Books</h1>
                            <p className="catalog-subtitle">Explore our extensive collection</p>
                        </div>
                        <div className="books-count">
                            <span className="count-number">{filteredBooks.length}</span>
                            <span className="count-label">Books Available</span>
                        </div>
                    </div>

                    {/* Search Bar */}
                    <div className="search-bar">
                        <input
                            type="text"
                            placeholder="Search by title, author, or ISBN..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="search-input"
                        />
                        <span className="search-icon">🔍</span>
                    </div>

                    {/* Books Grid */}
                    {loading ? (
                        <div className="loading-container">
                            <div className="spinner spinner-primary"></div>
                            <p className="mt-md text-gray-600">Loading books...</p>
                        </div>
                    ) : filteredBooks.length > 0 ? (
                        <div className="books-grid grid grid-cols-4 gap-lg">
                            {filteredBooks.map(book => (
                                <Card
                                    key={book.id}
                                    className="book-card"
                                    hover
                                    onClick={() => handleBookClick(book.id)}
                                >
                                    <div className="book-image">
                                        {book.imageUrl ? (
                                            <img src={book.imageUrl} alt={book.title} />
                                        ) : (
                                            <div className="book-placeholder">📚</div>
                                        )}
                                        <div className="book-availability">
                                            {book.availableCopies > 0 ? (
                                                <span className="badge badge-success">Available</span>
                                            ) : (
                                                <span className="badge badge-error">Out of Stock</span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="book-info">
                                        <h3 className="book-title">{book.title}</h3>
                                        <p className="book-author">by {book.author}</p>
                                        <div className="book-meta">
                                            <span className="book-copies">
                                                {book.availableCopies}/{book.totalCopies} available
                                            </span>
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <Card className="no-results">
                            <div className="no-results-content">
                                <div className="no-results-icon">📭</div>
                                <h3 className="no-results-title">No books found</h3>
                                <p className="no-results-text">
                                    Try adjusting your search terms
                                </p>
                            </div>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BooksCatalog;
