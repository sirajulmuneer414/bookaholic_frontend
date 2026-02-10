import React from 'react';
import './Pagination.css';

const Pagination = ({ currentPage, totalPages, onPageChange, hasNext, hasPrevious }) => {
    const handlePrevious = () => {
        if (hasPrevious) {
            onPageChange(currentPage - 1);
        }
    };

    const handleNext = () => {
        if (hasNext) {
            onPageChange(currentPage + 1);
        }
    };

    const handlePageClick = (page) => {
        onPageChange(page);
    };

    // Generate page numbers with ellipsis logic
    const getPageNumbers = () => {
        const pages = [];
        const maxVisible = 5; // Max page buttons to show

        if (totalPages <= maxVisible + 2) {
            // Show all pages if total is small
            for (let i = 0; i < totalPages; i++) {
                pages.push(i);
            }
        } else {
            // Show first, last, and pages around current
            pages.push(0); // First page

            const start = Math.max(1, currentPage - 1);
            const end = Math.min(totalPages - 2, currentPage + 1);

            if (start > 1) {
                pages.push('...');
            }

            for (let i = start; i <= end; i++) {
                pages.push(i);
            }

            if (end < totalPages - 2) {
                pages.push('...');
            }

            pages.push(totalPages - 1); // Last page
        }

        return pages;
    };

    if (totalPages <= 1) {
        return null; // Don't render pagination if only 1 page
    }

    return (
        <div className="pagination-container">
            <button
                className="pagination-btn"
                onClick={handlePrevious}
                disabled={!hasPrevious}
                aria-label="Previous page"
            >
                &laquo; Previous
            </button>

            <div className="pagination-numbers">
                {getPageNumbers().map((page, index) => {
                    if (page === '...') {
                        return (
                            <span key={`ellipsis-${index}`} className="pagination-ellipsis">
                                ...
                            </span>
                        );
                    }

                    return (
                        <button
                            key={page}
                            className={`pagination-number ${page === currentPage ? 'active' : ''}`}
                            onClick={() => handlePageClick(page)}
                            aria-label={`Page ${page + 1}`}
                            aria-current={page === currentPage ? 'page' : undefined}
                        >
                            {page + 1}
                        </button>
                    );
                })}
            </div>

            <button
                className="pagination-btn"
                onClick={handleNext}
                disabled={!hasNext}
                aria-label="Next page"
            >
                Next &raquo;
            </button>
        </div>
    );
};

export default Pagination;
