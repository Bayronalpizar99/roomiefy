import React from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@radix-ui/react-icons';
import './Pagination.css';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  const pageNumbers = [];
  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i);
  }

  if (totalPages <= 1) {
    return null; // No mostrar el paginador si solo hay una página
  }

  return (
    <nav className="pagination-container">
      <button 
        onClick={() => onPageChange(currentPage - 1)} 
        disabled={currentPage === 1}
        className="page-btn arrow"
        aria-label="Previous Page"
      >
        <ChevronLeftIcon />
      </button>
      
      {pageNumbers.map(number => (
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
        disabled={currentPage === totalPages}
        className="page-btn arrow"
        aria-label="Next Page"
      >
        <ChevronRightIcon />
      </button>
    </nav>
  );
};

export default Pagination;