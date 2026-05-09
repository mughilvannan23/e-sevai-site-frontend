import React, { useState, useEffect } from 'react';

const LiveClock = () => {
  const [dateTime, setDateTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setDateTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatDate = (date) => {
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).replace(/\//g, '-');
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    }).toUpperCase();
  };

  return (
    <div style={styles.container}>
      <div style={styles.date}>{formatDate(dateTime)}</div>
      <div style={styles.time}>{formatTime(dateTime)}</div>
    </div>
  );
};

const styles = {
  container: {
    position: 'fixed',
    bottom: '15px',
    right: '15px',
    backgroundColor: 'rgba(59, 129, 50, 0.9)',
    color: '#ffffff',
    padding: '8px 12px',
    borderRadius: '10px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    zIndex: 9999,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    pointerEvents: 'none',
    border: '1px solid rgba(255,255,255,0.2)',
    backdropFilter: 'blur(4px)',
    minWidth: '120px'
  },
  date: {
    fontSize: '11px',
    fontWeight: '500',
    opacity: 0.9,
    letterSpacing: '0.5px'
  },
  time: {
    fontSize: '14px',
    fontWeight: '700',
    fontFamily: 'monospace',
    marginTop: '2px'
  }
};

export default LiveClock;
