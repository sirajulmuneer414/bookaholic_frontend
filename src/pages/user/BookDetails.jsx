import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getBookById } from '../../services/bookService';
import { borrowBook } from '../../services/borrowService';
import { toast } from 'react-toastify';
import Navbar from '../../components/Navbar';
import Card from '../../components/Card';
import Button from '../../components/Button';
import './BookDetails.css';

const BookDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [book, setBook] = useState(null);
    const [loading, setLoading] = useState(true);
    const [borrowing, setBorrowing] = useState(false);

    useEffect(() => {
        fetchBookDetails();
    }, [id]);

    const fetchBookDetails = async () => {
        try {
            const data = await getBookById(id);
            setBook(data);
        } catch (error) {
            console.error('Error fetching book details:', error);
            toast.error('Failed to load book details');
            navigate('/user/books');
        } finally {
            setLoading(false);
        }
    };

    const handleBorrow = async () => {
        setBorrowing(true);
        try {
            await borrowBook(book.id);
            toast.success(`Successfully borrowed "${book.title}"!`);
            // Refresh book details to update available copies
            await fetchBookDetails();
            navigate('/user/my-books');
        } catch (error) {
            console.error('Error borrowing book:', error);
            toast.error(error.response?.data?.message || 'Failed to borrow book. You might have already borrowed it or it might be unavailable.');
        } finally {
            setBorrowing(false);
        }
    };

    if (loading) {
        return (
            <div className="book-details">
                <Navbar />
                <div className="container">
                    <div className="loading-container">
                        <div className="spinner spinner-primary"></div>
                        <p className="mt-md text-gray-600">Loading book details...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (!book) return null;

    return (
        <div className="book-details">
            <Navbar />

            <div className="details-content">
                <div className="container">
                    <Button
                        variant="secondary"
                        onClick={() => navigate('/user/books')}
                        className="back-button mb-lg"
                    >
                        ← Back to Catalog
                    </Button>

                    <Card className="details-card">
                        <div className="details-layout">
                            {/* Book Image */}
                            <div className="details-image-section">
                                {book.imageUrl ? (
                                    <img src={book.imageUrl} alt={book.title} className="details-image" />
                                ) : (
                                    <div className="details-image-placeholder">📚</div>
                                )}
                            </div>

                            {/* Book Info */}
                            <div className="details-info-section">
                                <div>
                                    <h1 className="details-title">{book.title}</h1>
                                    <p className="details-author">by {book.author}</p>

                                    <div className="details-meta mt-lg">
                                        <div className="meta-item">
                                            <span className="meta-label">ISBN:</span>
                                            <span className="meta-value">{book.isbn}</span>
                                        </div>
                                        <div className="meta-item">
                                            <span className="meta-label">Total Copies:</span>
                                            <span className="meta-value">{book.totalCopies}</span>
                                        </div>
                                        <div className="meta-item">
                                            <span className="meta-label">Available:</span>
                                            <span className="meta-value text-primary font-bold">
                                                {book.availableCopies}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="availability-status mt-lg">
                                        {book.availableCopies > 0 ? (
                                            <>
                                                <span className="badge badge-success status-badge">
                                                    ✓ Available for Borrowing
                                                </span>
                                                <p className="status-text text-gray-600 mt-sm">
                                                    {book.availableCopies} {book.availableCopies === 1 ? 'copy' : 'copies'} available now
                                                </p>
                                            </>
                                        ) : (
                                            <>
                                                <span className="badge badge-error status-badge">
                                                    ✗ Currently Unavailable
                                                </span>
                                                <p className="status-text text-gray-600 mt-sm">
                                                    All copies are currently borrowed
                                                </p>
                                            </>
                                        )}
                                    </div>
                                </div>

                                <div className="details-actions">
                                    {book.availableCopies > 0 ? (
                                        <Button
                                            variant="primary"
                                            size="large"
                                            loading={borrowing}
                                            onClick={handleBorrow}
                                            className="borrow-button"
                                        >
                                            {borrowing ? 'Borrowing...' : 'Borrow This Book'}
                                        </Button>
                                    ) : (
                                        <Button
                                            variant="secondary"
                                            size="large"
                                            disabled
                                            className="borrow-button"
                                        >
                                            Out of Stock
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* Additional Info */}
                    <div className="grid grid-cols-3 gap-lg mt-xl">
                        <Card className="info-card text-center">
                            <div className="info-icon">📖</div>
                            <h3 className="info-title">Easy Borrowing</h3>
                            <p className="info-text">Click to borrow and start reading immediately</p>
                        </Card>
                        <Card className="info-card text-center">
                            <div className="info-icon">📅</div>
                            <h3 className="info-title">14 Days</h3>
                            <p className="info-text">Standard borrowing period for all books</p>
                        </Card>
                        <Card className="info-card text-center">
                            <div className="info-icon">🔄</div>
                            <h3 className="info-title">Easy Returns</h3>
                            <p className="info-text">Return anytime from your dashboard</p>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BookDetails;
