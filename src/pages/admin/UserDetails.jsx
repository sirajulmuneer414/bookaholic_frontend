import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getUserById, updateUser, getUserBorrowRecords, updateBorrowRecord } from '../../services/userService';
import { toast } from 'react-toastify';
import Navbar from '../../components/Navbar';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Modal from '../../components/Modal';
import Pagination from '../../components/Pagination';
import './UserDetails.css';

const UserDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);

    // Edit User Modal
    const [isEditUserModalOpen, setIsEditUserModalOpen] = useState(false);
    const [editUserData, setEditUserData] = useState({ fullName: '', role: '', isVerified: false });
    const [updatingUser, setUpdatingUser] = useState(false);

    // Edit Record Modal
    const [isEditRecordModalOpen, setIsEditRecordModalOpen] = useState(false);
    const [selectedRecord, setSelectedRecord] = useState(null);
    const [editRecordData, setEditRecordData] = useState({ status: '', dueDate: '' });
    const [updatingRecord, setUpdatingRecord] = useState(false);
    const [currentPage, setCurrentPage] = useState(0);
    const [paginationData, setPaginationData] = useState(null);

    useEffect(() => {
        fetchUserData();
    }, [id, currentPage]);

    const fetchUserData = async () => {
        setLoading(true);
        try {
            const [userData, recordsData] = await Promise.all([
                getUserById(id),
                getUserBorrowRecords(id, currentPage, 10)
            ]);
            setUser(userData);
            setPaginationData(recordsData);
            setRecords(recordsData.content.sort((a, b) => new Date(b.borrowDate) - new Date(a.borrowDate)));
        } catch (error) {
            console.error('Error fetching user data:', error);
            toast.error('Failed to load user data');
            navigate('/admin/users');
        } finally {
            setLoading(false);
        }
    };

    const handlePageChange = (newPage) => {
        setCurrentPage(newPage);
    };

    // User Edit Handlers
    const openEditUserModal = () => {
        setEditUserData({
            fullName: user.fullName || '',
            role: user.role,
            isVerified: user.verified
        });
        setIsEditUserModalOpen(true);
    };

    const handleUpdateUser = async () => {
        setUpdatingUser(true);
        try {
            const updatedUser = await updateUser(id, editUserData);
            setUser(updatedUser);
            toast.success('User updated successfully');
            setIsEditUserModalOpen(false);
        } catch (error) {
            console.error('Error updating user:', error);
            toast.error(error.response?.data?.message || 'Failed to update user');
        } finally {
            setUpdatingUser(false);
        }
    };

    // Record Edit Handlers
    const openEditRecordModal = (record) => {
        setSelectedRecord(record);
        setEditRecordData({
            status: record.status,
            dueDate: record.dueDate || ''
        });
        setIsEditRecordModalOpen(true);
    };

    const handleUpdateRecord = async () => {
        setUpdatingRecord(true);
        try {
            await updateBorrowRecord(selectedRecord.id, editRecordData);
            toast.success('Record updated successfully');
            setIsEditRecordModalOpen(false);
            setSelectedRecord(null);
            await fetchUserData();
        } catch (error) {
            console.error('Error updating record:', error);
            toast.error(error.response?.data?.message || 'Failed to update record');
        } finally {
            setUpdatingRecord(false);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    if (loading) {
        return (
            <div className="user-details">
                <Navbar />
                <div className="details-content">
                    <div className="container">
                        <Card className="text-center p-xl">
                            <div className="spinner spinner-primary"></div>
                            <p className="mt-md text-gray-600">Loading user details...</p>
                        </Card>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="user-details">
            <Navbar />

            <div className="details-content">
                <div className="container">
                    {/* Back Button */}
                    <button className="back-btn mb-lg" onClick={() => navigate('/admin/users')}>
                        ← Back to Users
                    </button>

                    {/* User Info Card */}
                    <Card className="user-info-card mb-xl">
                        <div className="user-info-header">
                            <div className="user-avatar">
                                {user.fullName ? user.fullName.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
                            </div>
                            <div className="user-info-main">
                                <h1 className="user-name">{user.fullName || 'No Name'}</h1>
                                <p className="user-email">{user.email}</p>
                            </div>
                            <Button variant="outline" onClick={openEditUserModal}>
                                Edit User
                            </Button>
                        </div>

                        <div className="user-info-grid">
                            <div className="info-item">
                                <span className="info-label">Role</span>
                                <span className={`badge ${user.role === 'ADMIN' ? 'badge-info' : 'badge-success'}`}>
                                    {user.role}
                                </span>
                            </div>
                            <div className="info-item">
                                <span className="info-label">Auth Provider</span>
                                <span className="info-value">{user.authProvider}</span>
                            </div>
                            <div className="info-item">
                                <span className="info-label">Verified</span>
                                <span className={`badge ${user.verified ? 'badge-success' : 'badge-warning'}`}>
                                    {user.verified ? 'Yes' : 'No'}
                                </span>
                            </div>
                            <div className="info-item">
                                <span className="info-label">Active Borrows</span>
                                <span className="info-value font-semibold">{user.activeBorrows}</span>
                            </div>
                        </div>
                    </Card>

                    {/* Borrow Records Section */}
                    <div className="records-section">
                        <h2 className="section-title mb-lg">Borrow History</h2>

                        {records.length > 0 ? (
                            <div className="records-table-container">
                                <table className="records-table">
                                    <thead>
                                        <tr>
                                            <th>ID</th>
                                            <th>Book</th>
                                            <th>Borrowed</th>
                                            <th>Due Date</th>
                                            <th>Returned</th>
                                            <th>Status</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {records.map(record => (
                                            <tr key={record.id}>
                                                <td className="font-semibold">#{record.id}</td>
                                                <td className="font-semibold">{record.bookTitle}</td>
                                                <td>{formatDate(record.borrowDate)}</td>
                                                <td>{formatDate(record.dueDate)}</td>
                                                <td>{formatDate(record.returnDate)}</td>
                                                <td>
                                                    <span className={`badge ${record.status === 'BORROWED' ? 'badge-warning' : 'badge-success'}`}>
                                                        {record.status}
                                                    </span>
                                                </td>
                                                <td>
                                                    <Button
                                                        variant="outline"
                                                        size="small"
                                                        onClick={() => openEditRecordModal(record)}
                                                    >
                                                        Edit
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <Card className="text-center p-xl">
                                <div className="empty-icon">📚</div>
                                <h3 className="empty-title">No borrow history</h3>
                                <p className="empty-text">This user hasn't borrowed any books yet</p>
                            </Card>
                        )}

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

            {/* Edit User Modal */}
            <Modal
                isOpen={isEditUserModalOpen}
                onClose={() => !updatingUser && setIsEditUserModalOpen(false)}
                title="Edit User"
                size="medium"
            >
                <div className="edit-form">
                    <div className="input-group">
                        <label className="input-label">Full Name</label>
                        <input
                            type="text"
                            className="input-field"
                            value={editUserData.fullName}
                            onChange={(e) => setEditUserData({ ...editUserData, fullName: e.target.value })}
                            placeholder="Enter full name"
                        />
                    </div>

                    <div className="input-group">
                        <label className="input-label">Role</label>
                        <select
                            className="input-field"
                            value={editUserData.role}
                            onChange={(e) => setEditUserData({ ...editUserData, role: e.target.value })}
                        >
                            <option value="USER">USER</option>
                            <option value="ADMIN">ADMIN</option>
                        </select>
                    </div>

                    <div className="input-group">
                        <label className="checkbox-label">
                            <input
                                type="checkbox"
                                checked={editUserData.isVerified}
                                onChange={(e) => setEditUserData({ ...editUserData, isVerified: e.target.checked })}
                            />
                            <span>Email Verified</span>
                        </label>
                    </div>

                    <div className="modal-actions">
                        <Button
                            variant="secondary"
                            onClick={() => setIsEditUserModalOpen(false)}
                            disabled={updatingUser}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="primary"
                            onClick={handleUpdateUser}
                            loading={updatingUser}
                        >
                            Save Changes
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* Edit Record Modal */}
            <Modal
                isOpen={isEditRecordModalOpen}
                onClose={() => !updatingRecord && setIsEditRecordModalOpen(false)}
                title="Edit Borrow Record"
                size="medium"
            >
                {selectedRecord && (
                    <div className="edit-form">
                        <div className="modal-record-info mb-lg">
                            <p><strong>Book:</strong> {selectedRecord.bookTitle}</p>
                            <p><strong>Borrowed:</strong> {formatDate(selectedRecord.borrowDate)}</p>
                        </div>

                        <div className="input-group">
                            <label className="input-label">Status</label>
                            <select
                                className="input-field"
                                value={editRecordData.status}
                                onChange={(e) => setEditRecordData({ ...editRecordData, status: e.target.value })}
                            >
                                <option value="BORROWED">BORROWED</option>
                                <option value="RETURNED">RETURNED</option>
                            </select>
                        </div>

                        <div className="input-group">
                            <label className="input-label">Due Date</label>
                            <input
                                type="date"
                                className="input-field"
                                value={editRecordData.dueDate}
                                onChange={(e) => setEditRecordData({ ...editRecordData, dueDate: e.target.value })}
                            />
                        </div>

                        <div className="modal-actions">
                            <Button
                                variant="secondary"
                                onClick={() => setIsEditRecordModalOpen(false)}
                                disabled={updatingRecord}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="primary"
                                onClick={handleUpdateRecord}
                                loading={updatingRecord}
                            >
                                Save Changes
                            </Button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default UserDetails;
