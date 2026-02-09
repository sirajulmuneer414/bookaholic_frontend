import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllBooks } from '../../services/bookService';
import { getAllHistory } from '../../services/borrowService';
import { toast } from 'react-toastify';
import Navbar from '../../components/Navbar';
import Card from '../../components/Card';
import './AdminDashboard.css';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        totalBooks: 0,
        totalCopies: 0,
        borrowedBooks: 0,
        availableBooks: 0
    });
    const [recentActivity, setRecentActivity] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const [booksData, historyData] = await Promise.all([
                getAllBooks(),
                getAllHistory()
            ]);

            // Calculate stats
            const totalBooks = booksData.length;
            const totalCopies = booksData.reduce((sum, book) => sum + book.totalCopies, 0);
            const availableBooks = booksData.reduce((sum, book) => sum + book.availableCopies, 0);
            const borrowedBooks = totalCopies - availableBooks;

            setStats({
                totalBooks,
                totalCopies,
                borrowedBooks,
                availableBooks
            });

            // Get recent 5 activities
            const sorted = historyData.sort((a, b) =>
                new Date(b.borrowDate) - new Date(a.borrowDate)
            );
            setRecentActivity(sorted.slice(0, 5));
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            toast.error('Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    return (
        <div className="admin-dashboard">
            <Navbar />

            <div className="dashboard-content">
                <div className="container">
                    {/* Header */}
                    <div className="admin-header">
                        <div>
                            <h1 className="admin-title">Admin Dashboard</h1>
                            <p className="admin-subtitle">Library Management Overview</p>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="admin-stats-grid grid grid-cols-4 gap-lg">
                        <Card className="admin-stat-card">
                            <div className="stat-icon books">📚</div>
                            <div className="stat-info">
                                <div className="stat-value">{stats.totalBooks}</div>
                                <div className="stat-label">Total Books</div>
                            </div>
                        </Card>

                        <Card className="admin-stat-card">
                            <div className="stat-icon copies">📖</div>
                            <div className="stat-info">
                                <div className="stat-value">{stats.totalCopies}</div>
                                <div className="stat-label">Total Copies</div>
                            </div>
                        </Card>

                        <Card className="admin-stat-card">
                            <div className="stat-icon borrowed">⏰</div>
                            <div className="stat-info">
                                <div className="stat-value">{stats.borrowedBooks}</div>
                                <div className="stat-label">Currently Borrowed</div>
                            </div>
                        </Card>

                        <Card className="admin-stat-card">
                            <div className="stat-icon available">✅</div>
                            <div className="stat-info">
                                <div className="stat-value">{stats.availableBooks}</div>
                                <div className="stat-label">Available Copies</div>
                            </div>
                        </Card>
                    </div>

                    {/* Quick Actions */}
                    <div className="admin-actions mt-2xl">
                        <h2 className="section-title mb-lg">Quick Actions</h2>
                        <div className="actions-grid grid grid-cols-3 gap-lg">
                            <Card className="action-card" hover onClick={() => navigate('/admin/books')}>
                                <div className="action-content">
                                    <div className="action-icon">📚</div>
                                    <h3 className="action-title">Manage Books</h3>
                                    <p className="action-description">Add new books or view existing collection</p>
                                </div>
                            </Card>

                            <Card className="action-card" hover onClick={() => navigate('/admin/records')}>
                                <div className="action-content">
                                    <div className="action-icon">📋</div>
                                    <h3 className="action-title">Borrow Records</h3>
                                    <p className="action-description">View and manage all borrowing records</p>
                                </div>
                            </Card>

                            <Card className="action-card" hover onClick={() => navigate('/admin/users')}>
                                <div className="action-content">
                                    <div className="action-icon">👥</div>
                                    <h3 className="action-title">Manage Users</h3>
                                    <p className="action-description">View and manage library members</p>
                                </div>
                            </Card>
                        </div>
                    </div>

                    {/* Recent Activity */}
                    <div className="recent-activity mt-2xl">
                        <h2 className="section-title mb-lg">Recent Activity</h2>
                        {loading ? (
                            <Card className="text-center p-xl">
                                <div className="spinner spinner-primary"></div>
                                <p className="mt-md text-gray-600">Loading...</p>
                            </Card>
                        ) : recentActivity.length > 0 ? (
                            <div className="activity-table-container">
                                <table className="activity-table">
                                    <thead>
                                        <tr>
                                            <th>User</th>
                                            <th>Book</th>
                                            <th>Borrowed</th>
                                            <th>Due Date</th>
                                            <th>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {recentActivity.map(record => (
                                            <tr key={record.id}>
                                                <td>{record.userEmail}</td>
                                                <td className="font-semibold">{record.bookTitle}</td>
                                                <td>{formatDate(record.borrowDate)}</td>
                                                <td>{record.returnDate ? formatDate(record.returnDate) : formatDate(record.dueDate)}</td>
                                                <td>
                                                    <span className={`badge ${record.status === 'BORROWED' ? 'badge-warning' : 'badge-success'}`}>
                                                        {record.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <Card className="text-center p-xl">
                                <p className="text-gray-600">No activity yet</p>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;