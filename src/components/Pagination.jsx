import React from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@radix-ui/react-icons';
import './Pagination.css';

const Pagination = ({ currentPage, totalPages, onPageChange, hasPrev, hasNext, hideNumbers = false }) => {
  const showNumbers = Number.isFinite(totalPages) && totalPages > 1 && !hideNumbers;

  if (!showNumbers && !hasPrev && !hasNext) {
    // Si no hay números y no hay prev/next disponibles, no renderizar
    return null;
  }

  const pageNumbers = [];
  if (showNumbers) {
    for (let i = 1; i <= totalPages; i++) {
      pageNumbers.push(i);
    }
  }

  // Cálculo por defecto de prev/next si no se proveen
  const canPrev = hasPrev !== undefined ? hasPrev : currentPage > 1;
  const canNext = hasNext !== undefined ? hasNext : (showNumbers ? currentPage < totalPages : false);

  return (
    <nav className="pagination-container">
      <button
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={!canPrev}
        className="page-btn arrow"
        aria-label="Previous Page"
      >
        <ChevronLeftIcon />
      </button>

      {showNumbers && pageNumbers.map(number => (
        <button
          key={number}
          onClick={() => onPageChange(number)}
          className={`page-btn ${currentPage === number ? 'active' : ''}`}
        >
          {number}
        </button>
      ))}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={!canNext}
        className="page-btn arrow"
        aria-label="Next Page"
      >
        <ChevronRightIcon />
      </button>
    </nav>
  );
};

export default Pagination;