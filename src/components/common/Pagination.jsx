import React from 'react';

const Pagination = ({ currentPage, totalPages, onPageChange, totalItems, itemsPerPage }) => {
  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);

    if (end - start < maxVisible - 1) {
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div style={styles.container}>
      <div style={styles.info}>
        Showing {Math.min((currentPage - 1) * itemsPerPage + 1, totalItems)} to{' '}
        {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} items
      </div>
      <div style={styles.pagination}>
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          style={{
            ...styles.pageBtn,
            ...(currentPage === 1 ? styles.disabledBtn : {})
          }}
        >
          ← Previous
        </button>

        {pageNumbers[0] > 1 && (
          <>
            <button
              onClick={() => onPageChange(1)}
              style={styles.pageBtn}
            >
              1
            </button>
            {pageNumbers[0] > 2 && <span style={styles.ellipsis}>...</span>}
          </>
        )}

        {pageNumbers.map(page => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            style={{
              ...styles.pageBtn,
              ...(currentPage === page ? styles.activePage : {})
            }}
          >
            {page}
          </button>
        ))}

        {pageNumbers[pageNumbers.length - 1] < totalPages && (
          <>
            {pageNumbers[pageNumbers.length - 1] < totalPages - 1 && (
              <span style={styles.ellipsis}>...</span>
            )}
            <button
              onClick={() => onPageChange(totalPages)}
              style={styles.pageBtn}
            >
              {totalPages}
            </button>
          </>
        )}

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          style={{
            ...styles.pageBtn,
            ...(currentPage === totalPages ? styles.disabledBtn : {})
          }}
        >
          Next →
        </button>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 0',
    flexWrap: 'wrap',
    gap: '16px'
  },
  info: {
    color: '#666',
    fontSize: '14px'
  },
  pagination: {
    display: 'flex',
    gap: '4px',
    alignItems: 'center'
  },
  pageBtn: {
    padding: '8px 12px',
    border: '1px solid #ddd',
    backgroundColor: 'white',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    transition: 'all 0.2s ease',
    minWidth: '36px'
  },
  activePage: {
    backgroundColor: '#3498db',
    color: 'white',
    border: '1px solid #3498db'
  },
  disabledBtn: {
    opacity: 0.5,
    cursor: 'not-allowed'
  },
  ellipsis: {
    padding: '0 8px',
    color: '#666'
  }
};

export default Pagination;