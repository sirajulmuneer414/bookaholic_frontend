import { useState, useEffect } from 'react';
import { getMyHistory, getMyHistoryUnpaginated, returnBook } from '../../services/borrowService';
import { toast } from 'react-toastify';
import Navbar from '../../components/Navbar';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Pagination from '../../components/Pagination';
import './MyBooks.css';

const MyBooks = () => {
    const [borrowedBooks, setBorrowedBooks] = useState([]);
    const [returnedBooks, setReturnedBooks] = useState([]);
    const [borrowedLoading, setBorrowedLoading] = useState(true);
    const [returnedLoading, setReturnedLoading] = useState(true);
    const [returningId, setReturningId] = useState(null);
    const [currentPage, setCurrentPage] = useState(0);
    const [paginationData, setPaginationData] = useState(null);

    // Fetch borrowed books on mount (no pagination, max 3 books)
    useEffect(() => {
        fetchBorrowedBooks();
    }, []);

    // Fetch returned books when page changes
    useEffect(() => {
        fetchReturnedBooks(currentPage);
    }, [currentPage]);

    const fetchBorrowedBooks = async () => {
        setBorrowedLoading(true);
        try {
            // Use unpaginated endpoint and filter for BORROWED status
            const allRecords = await getMyHistoryUnpaginated();
            const borrowed = allRecords.filter(record => record.status === 'BORROWED');

            // Sort borrowed books by due date (earliest first)
            borrowed.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

            setBorrowedBooks(borrowed);
        } catch (error) {
            console.error('Error fetching borrowed books:', error);
            toast.error('Failed to load borrowed books');
        } finally {
            setBorrowedLoading(false);
        }
    };

    const fetchReturnedBooks = async (page) => {
        setReturnedLoading(true);
        try {
            // Use paginated endpoint with status filter for RETURNED
            const data = await getMyHistory(page, 10, 'RETURNED');
            setPaginationData(data);

            // Sort returned books by return date (most recent first)
            const returned = data.content.sort((a, b) =>
                new Date(b.returnDate) - new Date(a.returnDate)
            );

            setReturnedBooks(returned);
        } catch (error) {
            console.error('Error fetching returned books:', error);
            toast.error('Failed to load borrowing history');
        } finally {
            setReturnedLoading(false);
        }
    };

    const handlePageChange = (newPage) => {
        setCurrentPage(newPage);
    };

    const handleReturn = async (recordId) => {
        setReturningId(recordId);
        try {
            await returnBook(recordId);
            toast.success('Book returned successfully!');
            // Refresh both lists - borrowed books will decrease, returned will increase
            await Promise.all([
                fetchBorrowedBooks(),
                fetchReturnedBooks(currentPage)
            ]);
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

    // Show loading spinner only on initial page load when both are loading
    if (borrowedLoading && returnedLoading) {
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

                        {borrowedLoading ? (
                            <div className="loading-container" style={{ padding: '2rem' }}>
                                <div className="spinner spinner-primary"></div>
                            </div>
                        ) : borrowedBooks.length > 0 ? (
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
                            Borrowing History ({paginationData?.totalElements || 0})
                        </h2>

                        {returnedLoading ? (
                            <div className="loading-container" style={{ padding: '2rem' }}>
                                <div className="spinner spinner-primary"></div>
                            </div>
                        ) : returnedBooks.length > 0 ? (
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

                    {/* Pagination */}
                    {paginationData && paginationData.totalPages > 1 && (
                        <Pagination
                            currentPage={paginationData.currentPage}
                            totalPages={paginationData.totalPages}
                            hasNext={paginationData.hasNext}
                            hasPrevious={paginationData.hasPrevious}
                            onPageChange={handlePageChange}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

export default MyBooks;
