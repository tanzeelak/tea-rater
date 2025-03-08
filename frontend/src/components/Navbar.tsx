import React from 'react';
import { logoutUser } from '../services/api';

interface NavbarProps {
  setToken: (token: string | null) => void;
}

const Navbar: React.FC<NavbarProps> = ({ setToken }) => {
  const handleLogout = async () => {
    try {
      await logoutUser();
      localStorage.removeItem('authToken');
      setToken(null);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <nav style={{
      padding: '1rem',
      backgroundColor: '#f8f9fa',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '2rem'
    }}>
      <h1 style={{ margin: 0 }}>Tea Rater</h1>
      <button
        onClick={handleLogout}
        style={{
          padding: '0.5rem 1rem',
          backgroundColor: '#dc3545',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        Logout
      </button>
    </nav>
  );
};

export default Navbar; 