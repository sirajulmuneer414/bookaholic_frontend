import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { getMyHistory } from '../../services/borrowService';
import { toast } from 'react-toastify';
import Navbar from '../../components/Navbar';
import Card from '../../components/Card';
import Button from '../../components/Button';
import './UserDashboard.css';

const UserDashboard = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        borrowed: 0,
        dueSoon: 0,
        returned: 0
    });
    const [recentActivity, setRecentActivity] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchUserStats();
    }, []);

    const fetchUserStats = async () => {
        try {
            const history = await getMyHistory();
            const borrowed = history.filter(record => record.status === 'BORROWED');
            const returned = history.filter(record => record.status === 'RETURNED');

            // Calculate books due soon (within 3 days)
            const today = new Date();
            const threeDaysFromNow = new Date(today);
            threeDaysFromNow.setDate(today.getDate() + 3);

            const dueSoon = borrowed.filter(record => {
                const dueDate = new Date(record.dueDate);
                return dueDate <= threeDaysFromNow && dueDate >= today;
            });

            setStats({
                borrowed: borrowed.length,
                dueSoon: dueSoon.length,
                returned: returned.length
            });

            // Get recent 3 activities
            setRecentActivity(history.slice(0, 3));
        } catch (error) {
            console.error('Error fetching user stats:', error);
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
        <div className="user-dashboard">
            <Navbar />

            <div className="dashboard-content">
                <div className="container">
                    {/* Welcome Section */}
                    <div className="welcome-section">
                        <h1 className="dashboard-title">
                            Welcome back, <span className="text-primary">{user?.email.split('@')[0]}</span>! 📚
                        </h1>
                        <p className="dashboard-subtitle">
                            Your personal library dashboard
                        </p>
                    </div>

                    {/* Stats Cards */}
                    <div className="stats-grid grid grid-cols-3 gap-lg">
                        <Card className="stat-card">
                            <div className="stat-icon borrowed">📖</div>
                            <div className="stat-info">
                                <div className="stat-value">{stats.borrowed}</div>
                                <div className="stat-label">Currently Borrowed</div>
                            </div>
                        </Card>

                        <Card className="stat-card">
                            <div className="stat-icon due-soon">⏰</div>
                            <div className="stat-info">
                                <div className="stat-value">{stats.dueSoon}</div>
                                <div className="stat-label">Due Soon</div>
                            </div>
                        </Card>

                        <Card className="stat-card">
                            <div className="stat-icon returned">✅</div>
                            <div className="stat-info">
                                <div className="stat-value">{stats.returned}</div>
                                <div className="stat-label">Books Returned</div>
                            </div>
                        </Card>
                    </div>

                    {/* Quick Actions */}
                    <div className="quick-actions mt-2xl">
                        <h2 className="section-title mb-lg">Quick Actions</h2>
                        <div className="actions-grid grid grid-cols-2 gap-lg">
                            <Card className="action-card" hover>
                                <div className="action-content" onClick={() => navigate('/user/books')}>
                                    <div className="action-icon">📚</div>
                                    <div>
                                        <h3 className="action-title">Browse Books</h3>
                                        <p className="action-description">Explore our collection and find your next read</p>
                                    </div>
                                </div>
                            </Card>

                            <Card className="action-card" hover>
                                <div className="action-content" onClick={() => navigate('/user/my-books')}>
                                    <div className="action-icon">📋</div>
                                    <div>
                                        <h3 className="action-title">My Books</h3>
                                        <p className="action-description">View your borrowed books and due dates</p>
                                    </div>
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
                            <div className="activity-list">
                                {recentActivity.map(record => (
                                    <Card key={record.id} className="activity-item">
                                        <div className="activity-content">
                                            <div className="activity-book">
                                                <h4 className="activity-book-title">{record.bookTitle}</h4>
                                                <p className="activity-dates text-sm text-gray-600">
                                                    Borrowed: {formatDate(record.borrowDate)}
                                                    {record.returnDate && ` • Returned: ${formatDate(record.returnDate)}`}
                                                    {!record.returnDate && ` • Due: ${formatDate(record.dueDate)}`}
                                                </p>
                                            </div>
                                            <span className={`badge ${record.status === 'BORROWED' ? 'badge-warning' : 'badge-success'}`}>
                                                {record.status}
                                            </span>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        ) : (
                            <Card className="text-center p-xl">
                                <p className="text-gray-600">No activity yet. Start by browsing books!</p>
                                <Button
                                    variant="primary"
                                    className="mt-md"
                                    onClick={() => navigate('/user/books')}
                                >
                                    Browse Books
                                </Button>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserDashboard;
