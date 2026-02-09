import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllUsers } from '../../services/userService';
import { toast } from 'react-toastify';
import Navbar from '../../components/Navbar';
import Card from '../../components/Card';
import './ManageUsers.css';

const ManageUsers = () => {
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterRole, setFilterRole] = useState('ALL');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchUsers();
    }, []);

    useEffect(() => {
        applyFilters();
    }, [searchTerm, filterRole, users]);

    const fetchUsers = async () => {
        try {
            const data = await getAllUsers();
            setUsers(data);
        } catch (error) {
            console.error('Error fetching users:', error);
            toast.error('Failed to load users');
        } finally {
            setLoading(false);
        }
    };

    const applyFilters = () => {
        let filtered = [...users];

        // Apply role filter
        if (filterRole !== 'ALL') {
            filtered = filtered.filter(user => user.role === filterRole);
        }

        // Apply search filter
        if (searchTerm) {
            filtered = filtered.filter(user =>
                user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (user.fullName && user.fullName.toLowerCase().includes(searchTerm.toLowerCase()))
            );
        }

        setFilteredUsers(filtered);
    };

    const handleRowClick = (userId) => {
        navigate(`/admin/users/${userId}`);
    };

    return (
        <div className="manage-users">
            <Navbar />

            <div className="users-content">
                <div className="container">
                    {/* Header */}
                    <div className="users-header">
                        <div>
                            <h1 className="users-title">Manage Users</h1>
                            <p className="users-subtitle">View and manage library members</p>
                        </div>
                        <div className="users-count">
                            <span className="count-number">{filteredUsers.length}</span>
                            <span className="count-label">Users</span>
                        </div>
                    </div>

                    {/* Filters */}
                    <Card className="filters-card mb-lg">
                        <div className="filters-row">
                            <div className="search-container">
                                <input
                                    type="text"
                                    placeholder="Search by email or name..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="search-input"
                                />
                            </div>
                            <div className="role-filters">
                                <button
                                    className={`filter-btn ${filterRole === 'ALL' ? 'active' : ''}`}
                                    onClick={() => setFilterRole('ALL')}
                                >
                                    All
                                </button>
                                <button
                                    className={`filter-btn ${filterRole === 'USER' ? 'active' : ''}`}
                                    onClick={() => setFilterRole('USER')}
                                >
                                    Users
                                </button>
                                <button
                                    className={`filter-btn ${filterRole === 'ADMIN' ? 'active' : ''}`}
                                    onClick={() => setFilterRole('ADMIN')}
                                >
                                    Admins
                                </button>
                            </div>
                        </div>
                    </Card>

                    {/* Users Table */}
                    {loading ? (
                        <Card className="text-center p-xl">
                            <div className="spinner spinner-primary"></div>
                            <p className="mt-md text-gray-600">Loading users...</p>
                        </Card>
                    ) : filteredUsers.length > 0 ? (
                        <div className="users-table-container">
                            <table className="users-table">
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Email</th>
                                        <th>Name</th>
                                        <th>Role</th>
                                        <th>Provider</th>
                                        <th>Verified</th>
                                        <th>Active Borrows</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredUsers.map(user => (
                                        <tr
                                            key={user.id}
                                            onClick={() => handleRowClick(user.id)}
                                            className="clickable-row"
                                        >
                                            <td className="font-semibold">#{user.id}</td>
                                            <td>{user.email}</td>
                                            <td>{user.fullName || '-'}</td>
                                            <td>
                                                <span className={`badge ${user.role === 'ADMIN' ? 'badge-info' : 'badge-success'}`}>
                                                    {user.role}
                                                </span>
                                            </td>
                                            <td>{user.authProvider}</td>
                                            <td>
                                                <span className={`badge ${user.verified ? 'badge-success' : 'badge-warning'}`}>
                                                    {user.verified ? 'Yes' : 'No'}
                                                </span>
                                            </td>
                                            <td className="font-semibold">{user.activeBorrows}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <Card className="text-center p-xl">
                            <div className="empty-icon">👥</div>
                            <h3 className="empty-title">No users found</h3>
                            <p className="empty-text">
                                {searchTerm || filterRole !== 'ALL'
                                    ? 'Try adjusting your filters'
                                    : 'No registered users yet'}
                            </p>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ManageUsers;
