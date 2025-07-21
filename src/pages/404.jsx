import React from 'react';
import { Link } from 'react-router-dom';
import errorImg from '../assets/images/error-img.png';

const NotFound = () => {
  React.useEffect(() => {
    document.title = '404 Not Found | Skote - Vite React Admin & Dashboard Template';
  }, []);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8f9fa' }}>
      <div style={{ textAlign: 'center', maxWidth: 480, padding: 32, background: '#fff', borderRadius: 16, boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>
        <img src={errorImg} alt="404 Not Found" style={{ width: 180, marginBottom: 24 }} />
        <h1 style={{ fontSize: 56, margin: 0, color: '#556ee6' }}>404</h1>
        <h2 style={{ fontWeight: 700, margin: '16px 0 8px', color: '#343a40' }}>Page Not Found</h2>
        <p style={{ color: '#6c757d', marginBottom: 32 }}>
          Sorry, the page you are looking for does not exist or has been moved.<br />
          Please check the URL or return to the dashboard.
        </p>
        <Link to="/dashboard" style={{
          display: 'inline-block',
          padding: '12px 32px',
          background: '#556ee6',
          color: '#fff',
          borderRadius: 8,
          textDecoration: 'none',
          fontWeight: 600,
          fontSize: 16,
          boxShadow: '0 2px 8px rgba(85,110,230,0.12)'
        }}>
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
};

export default NotFound; 