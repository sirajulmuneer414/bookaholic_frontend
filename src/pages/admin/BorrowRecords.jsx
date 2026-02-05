import { useState, useEffect } from 'react';
import { getAllHistory, adminOverrideStatus } from '../../services/borrowService';
import { toast } from 'react-toastify';
import Navbar from '../../components/Navbar';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Modal from '../../components/Modal';
import './BorrowRecords.css';

const BorrowRecords = () => {
    const [records, setRecords] = useState([]);
    const [filteredRecords, setFilteredRecords] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('ALL');
    const [loading, setLoading] = useState(true);
    const [selectedRecord, setSelectedRecord] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [updating, setUpdating] = useState(false);

    useEffect(() => {
        fetchRecords();
    }, []);

    useEffect(() => {
        applyFilters();
    }, [searchTerm, filterStatus, records]);

    const fetchRecords = async () => {
        try {
            const data = await getAllHistory();
            // Sort by borrow date (most recent first)
            data.sort((a, b) => new Date(b.borrowDate) - new Date(a.borrowDate));
            setRecords(data);
        } catch (error) {
            console.error('Error fetching records:', error);
            toast.error('Failed to load borrow records');
        } finally {
            setLoading(false);
        }
    };

    const applyFilters = () => {
        let filtered = [...records];

        // Apply status filter
        if (filterStatus !== 'ALL') {
            filtered = filtered.filter(record => record.status === filterStatus);
        }

        // Apply search filter
        if (searchTerm) {
            filtered = filtered.filter(record =>
                record.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
                record.bookTitle.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        setFilteredRecords(filtered);
    };

    const handleOverride = async (newStatus) => {
        setUpdating(true);
        try {
            await adminOverrideStatus(selectedRecord.id, newStatus);
            toast.success(`Status updated to ${newStatus}`);
            setIsModalOpen(false);
            setSelectedRecord(null);
            await fetchRecords();
        } catch (error) {
            console.error('Error updating status:', error);
            toast.error(error.response?.data?.message || 'Failed to update status');
        } finally {
            setUpdating(false);
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

    const openOverrideModal = (record) => {
        setSelectedRecord(record);
        setIsModalOpen(true);
    };

    return (
        <div className="borrow-records">
            <Navbar />

            <div className="records-content">
                <div className="container">
                    {/* Header */}
                    <div className="records-header">
                        <div>
                            <h1 className="records-title">Borrow Records</h1>
                            <p className="records-subtitle">Manage all borrowing activity</p>
                        </div>
                        <div className="records-count">
                            <span className="count-number">{filteredRecords.length}</span>
                            <span className="count-label">Records</span>
                        </div>
                    </div>

                    {/* Filters */}
                    <Card className="filters-card mb-lg">
                        <div className="filters-row">
                            <div className="search-container">
                                <input
                                    type="text"
                                    placeholder="Search by user email or book title..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="search-input"
                                />
                            </div>
                            <div className="status-filters">
                                <button
                                    className={`filter-btn ${filterStatus === 'ALL' ? 'active' : ''}`}
                                    onClick={() => setFilterStatus('ALL')}
                                >
                                    All
                                </button>
                                <button
                                    className={`filter-btn ${filterStatus === 'BORROWED' ? 'active' : ''}`}
                                    onClick={() => setFilterStatus('BORROWED')}
                                >
                                    Borrowed
                                </button>
                                <button
                                    className={`filter-btn ${filterStatus === 'RETURNED' ? 'active' : ''}`}
                                    onClick={() => setFilterStatus('RETURNED')}
                                >
                                    Returned
                                </button>
                            </div>
                        </div>
                    </Card>

                    {/* Records Table */}
                    {loading ? (
                        <Card className="text-center p-xl">
                            <div className="spinner spinner-primary"></div>
                            <p className="mt-md text-gray-600">Loading records...</p>
                        </Card>
                    ) : filteredRecords.length > 0 ? (
                        <div className="records-table-container">
                            <table className="records-table">
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>User</th>
                                        <th>Book</th>
                                        <th>Borrowed</th>
                                        <th>Due Date</th>
                                        <th>Returned</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredRecords.map(record => (
                                        <tr key={record.id}>
                                            <td className="font-semibold">#{record.id}</td>
                                            <td>{record.userEmail}</td>
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
                                                    onClick={() => openOverrideModal(record)}
                                                >
                                                    Override
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <Card className="text-center p-xl">
                            <div className="empty-icon">📋</div>
                            <h3 className="empty-title">No records found</h3>
                            <p className="empty-text">
                                {searchTerm || filterStatus !== 'ALL'
                                    ? 'Try adjusting your filters'
                                    : 'No borrowing activity yet'}
                            </p>
                        </Card>
                    )}
                </div>
            </div>

            {/* Override Status Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => !updating && setIsModalOpen(false)}
                title="Override Borrow Status"
                size="medium"
            >
                {selectedRecord && (
                    <div>
                        <div className="modal-record-info mb-lg">
                            <p><strong>User:</strong> {selectedRecord.userEmail}</p>
                            <p><strong>Book:</strong> {selectedRecord.bookTitle}</p>
                            <p><strong>Current Status:</strong>
                                <span className={`badge ml-sm ${selectedRecord.status === 'BORROWED' ? 'badge-warning' : 'badge-success'}`}>
                                    {selectedRecord.status}
                                </span>
                            </p>
                        </div>

                        <p className="mb-lg text-gray-600">
                            Select the new status for this borrow record:
                        </p>

                        <div className="status-buttons">
                            <Button
                                variant="secondary"
                                onClick={() => handleOverride('BORROWED')}
                                loading={updating}
                                disabled={selectedRecord.status === 'BORROWED'}
                            >
                                Mark as BORROWED
                            </Button>
                            <Button
                                variant="primary"
                                onClick={() => handleOverride('RETURNED')}
                                loading={updating}
                                disabled={selectedRecord.status === 'RETURNED'}
                            >
                                Mark as RETURNED
                            </Button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default BorrowRecords;
