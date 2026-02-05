import { useState, useEffect } from 'react';
import { getMyHistory, returnBook } from '../../services/borrowService';
import { toast } from 'react-toastify';
import Navbar from '../../components/Navbar';
import Card from '../../components/Card';
import Button from '../../components/Button';
import './MyBooks.css';

const MyBooks = () => {
    const [borrowedBooks, setBorrowedBooks] = useState([]);
    const [returnedBooks, setReturnedBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [returningId, setReturningId] = useState(null);

    useEffect(() => {
        fetchMyBooks();
    }, []);

    const fetchMyBooks = async () => {
        try {
            const history = await getMyHistory();
            const borrowed = history.filter(record => record.status === 'BORROWED');
            const returned = history.filter(record => record.status === 'RETURNED');

            // Sort borrowed books by due date (earliest first)
            borrowed.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
            returned.sort((a, b) => new Date(b.returnDate) - new Date(a.returnDate));

            setBorrowedBooks(borrowed);
            setReturnedBooks(returned);
        } catch (error) {
            console.error('Error fetching books:', error);
            toast.error('Failed to load your books');
        } finally {
            setLoading(false);
        }
    };

    const handleReturn = async (recordId) => {
        setReturningId(recordId);
        try {
            await returnBook(recordId);
            toast.success('Book returned successfully!');
            await fetchMyBooks(); // Refresh the lists
        } catch (error) {
            console.error('Error returning book:', error);
            toast.error(error.response?.data?.message || 'Failed to return book');
        } finally {
            setReturningId(null);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const getDaysUntilDue = (dueDate) => {
        const today = new Date();
        const due = new Date(dueDate);
        const diffTime = due - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    const getDueStatus = (dueDate) => {
        const daysLeft = getDaysUntilDue(dueDate);
        if (daysLeft < 0) return 'overdue';
        if (daysLeft <= 3) return 'due-soon';
        return 'ok';
    };

    const getDueStatusText = (dueDate) => {
        const daysLeft = getDaysUntilDue(dueDate);
        if (daysLeft < 0) return `Overdue by ${Math.abs(daysLeft)} ${Math.abs(daysLeft) === 1 ? 'day' : 'days'}`;
        if (daysLeft === 0) return 'Due today';
        if (daysLeft === 1) return 'Due tomorrow';
        return `${daysLeft} days left`;
    };

    if (loading) {
        return (
            <div className="my-books">
                <Navbar />
                <div className="container">
                    <div className="loading-container">
                        <div className="spinner spinner-primary"></div>
                        <p className="mt-md text-gray-600">Loading your books...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="my-books">
            <Navbar />

            <div className="mybooks-content">
                <div className="container">
                    <div className="mybooks-header">
                        <h1 className="mybooks-title">My Books</h1>
                        <p className="mybooks-subtitle">Manage your borrowed books and history</p>
                    </div>

                    {/* Currently Borrowed Books */}
                    <section className="section-borrowed mb-2xl">
                        <h2 className="section-title mb-lg">
                            Currently Borrowed ({borrowedBooks.length})
                        </h2>

                        {borrowedBooks.length > 0 ? (
                            <div className="books-list">
                                {borrowedBooks.map(record => {
                                    const dueStatus = getDueStatus(record.dueDate);
                                    return (
                                        <Card key={record.id} className="book-item">
                                            <div className="book-item-content">
                                                <div className="book-item-info">
                                                    <h3 className="book-item-title">{record.bookTitle}</h3>
                                                    <div className="book-item-dates">
                                                        <span className="date-item">
                                                            <strong>Borrowed:</strong> {formatDate(record.borrowDate)}
                                                        </span>
                                                        <span className="date-divider">•</span>
                                                        <span className="date-item">
                                                            <strong>Due:</strong> {formatDate(record.dueDate)}
                                                        </span>
                                                    </div>
                                                    <div className={`due-indicator ${dueStatus}`}>
                                                        {getDueStatusText(record.dueDate)}
                                                    </div>
                                                </div>
                                                <div className="book-item-actions">
                                                    <Button
                                                        variant="primary"
                                                        size="small"
                                                        loading={returningId === record.id}
                                                        onClick={() => handleReturn(record.id)}
                                                    >
                                                        {returningId === record.id ? 'Returning...' : 'Return Book'}
                                                    </Button>
                                                </div>
                                            </div>
                                        </Card>
                                    );
                                })}
                            </div>
                        ) : (
                            <Card className="empty-state">
                                <div className="empty-content">
                                    <div className="empty-icon">📚</div>
                                    <h3 className="empty-title">No borrowed books</h3>
                                    <p className="empty-text">
                                        You haven't borrowed any books yet. Browse our catalog to find your next read!
                                    </p>
                                </div>
                            </Card>
                        )}
                    </section>

                    {/* Borrowing History */}
                    <section className="section-history">
                        <h2 className="section-title mb-lg">
                            Borrowing History ({returnedBooks.length})
                        </h2>

                        {returnedBooks.length > 0 ? (
                            <div className="books-list">
                                {returnedBooks.map(record => (
                                    <Card key={record.id} className="book-item history-item">
                                        <div className="book-item-content">
                                            <div className="book-item-info">
                                                <h3 className="book-item-title">{record.bookTitle}</h3>
                                                <div className="book-item-dates">
                                                    <span className="date-item">
                                                        <strong>Borrowed:</strong> {formatDate(record.borrowDate)}
                                                    </span>
                                                    <span className="date-divider">•</span>
                                                    <span className="date-item">
                                                        <strong>Returned:</strong> {formatDate(record.returnDate)}
                                                    </span>
                                                </div>
                                            </div>
                                            <span className="badge badge-success">Returned</span>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        ) : (
                            <Card className="empty-state">
                                <div className="empty-content">
                                    <div className="empty-icon">📋</div>
                                    <h3 className="empty-title">No history yet</h3>
                                    <p className="empty-text">
                                        Your borrowing history will appear here once you return books.
                                    </p>
                                </div>
                            </Card>
                        )}
                    </section>
                </div>
            </div>
        </div>
    );
};

export default MyBooks;
