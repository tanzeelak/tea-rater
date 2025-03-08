import React, { useEffect, useState } from 'react';
import { logoutUser, getUser } from '../services/api';
import RegisterTea from './RegisterTea';

interface NavbarProps {
  setToken: (token: string | null) => void;
  userId: number;
  onTeaRegistered?: () => void;
}

interface UserResponse {
  name: string;
}

const Navbar: React.FC<NavbarProps> = ({ setToken, userId, onTeaRegistered }) => {
  const [username, setUsername] = useState<string>("");
  const [isFormVisible, setIsFormVisible] = useState(false);

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
      marginBottom: '1rem'
    }}>
      <h1 style={{ margin: 0 }}>Tea Rater</h1>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <span style={{ color: '#666' }}>Welcome, <strong>{username}</strong>!</span>
        <button
          onClick={() => setIsFormVisible(!isFormVisible)}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          {isFormVisible ? 'Hide Tea Registration' : 'Register New Tea'}
        </button>
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
      {isFormVisible && <RegisterTea onTeaRegistered={() => {
        setIsFormVisible(false);
        onTeaRegistered?.();
      }} />}
    </nav>
  );
};

export default Navbar; 