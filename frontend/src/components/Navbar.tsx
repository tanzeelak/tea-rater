import React, { useEffect, useState } from 'react';
import { logoutUser, getUser } from '../services/api';

interface NavbarProps {
  setToken: (token: string | null) => void;
  userId: number;
}

interface UserResponse {
  name: string;
}

const Navbar: React.FC<NavbarProps> = ({ setToken, userId }) => {
  const [username, setUsername] = useState<string>("");

  useEffect(() => {
    const fetchUsername = async () => {
      try {
        const res = await getUser(userId);
        const userData = res.data as UserResponse;
        setUsername(userData.name);
      } catch (error) {
        console.error('Error fetching username:', error);
      }
    };
    fetchUsername();
  }, [userId]);

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
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <span style={{ color: '#666' }}>Welcome, {username}!</span>
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
      </div>
    </nav>
  );
};

export default Navbar; 