import React from 'react';

const Loading = ({ size = 'medium', text = 'Loading...' }) => {
  const getSizes = () => {
    switch (size) {
      case 'small':
        return { spinner: 20, text: 12 };
      case 'medium':
        return { spinner: 40, text: 14 };
      case 'large':
        return { spinner: 60, text: 16 };
      default:
        return { spinner: 40, text: 14 };
    }
  };

  const sizes = getSizes();

  return (
    <div style={styles.container}>
      <div 
        style={{
          ...styles.spinner,
          width: sizes.spinner,
          height: sizes.spinner
        }}
      />
      {text && <p style={{ ...styles.text, fontSize: sizes.text }}>{text}</p>}
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px 20px',
    gap: '16px'
  },
  spinner: {
    border: '3px solid #f3f3f3',
    borderTop: '3px solid #3498db',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  },
  text: {
    color: '#666',
    fontWeight: '500',
    margin: 0
  },
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999
  },
  inlineLoading: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  inlineSpinner: {
    width: '16px',
    height: '16px',
    border: '2px solid #f3f3f3',
    borderTop: '2px solid #3498db',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  },
  inlineText: {
    color: '#666',
    fontSize: '14px'
  }
};

// Full page loading overlay
export const LoadingOverlay = ({ text = 'Loading...' }) => {
  return (
    <div style={styles.overlay}>
      <Loading size="large" text={text} />
    </div>
  );
};

// Inline loading text
export const LoadingText = ({ text = 'Loading...' }) => {
  return (
    <div style={styles.inlineLoading}>
      <div style={styles.inlineSpinner} />
      <span style={styles.inlineText}>{text}</span>
    </div>
  );
};

export default Loading;