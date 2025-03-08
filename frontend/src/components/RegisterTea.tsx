import React, { useState } from 'react';
import { registerTea } from '../services/api';

interface RegisterTeaProps {
  onTeaRegistered: () => void;
}

const RegisterTea: React.FC<RegisterTeaProps> = ({ onTeaRegistered }) => {
  const [teaName, setTeaName] = useState('');
  const [provider, setProvider] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [isFormVisible, setIsFormVisible] = useState(false);

  const handleSubmit = async () => {
    if (!teaName.trim() || !provider.trim()) {
      setShowError(true);
      setTimeout(() => setShowError(false), 3000);
      return;
    }

    try {
      await registerTea(teaName, provider);
      setShowSuccess(true);
      setTeaName('');
      setProvider('');
      onTeaRegistered();
      
      setTimeout(() => {
        setShowSuccess(false);
        setIsFormVisible(false);
      }, 3000);
    } catch (error) {
      console.error('Error registering tea:', error);
      setShowError(true);
      setTimeout(() => setShowError(false), 3000);
    }
  };

  return (
    <div style={{ marginBottom: '2rem' }}>
      <button
        onClick={() => setIsFormVisible(!isFormVisible)}
        style={{
          padding: '0.5rem 1rem',
          backgroundColor: '#28a745',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          marginBottom: '1rem'
        }}
      >
        {isFormVisible ? 'Hide Tea Registration' : 'Register New Tea'}
      </button>

      {isFormVisible && (
        <div style={{
          backgroundColor: '#f8f9fa',
          padding: '1rem',
          borderRadius: '4px',
          marginTop: '1rem'
        }}>
          {showSuccess && (
            <div style={{
              backgroundColor: '#d4edda',
              color: '#155724',
              padding: '1rem',
              borderRadius: '4px',
              marginBottom: '1rem',
              textAlign: 'center'
            }}>
              Tea registered successfully!
            </div>
          )}
          {showError && (
            <div style={{
              backgroundColor: '#f8d7da',
              color: '#721c24',
              padding: '1rem',
              borderRadius: '4px',
              marginBottom: '1rem',
              textAlign: 'center'
            }}>
              Please fill in all fields
            </div>
          )}
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Tea Name:</label>
            <input
              type="text"
              value={teaName}
              onChange={(e) => setTeaName(e.target.value)}
              style={{
                width: '100%',
                padding: '0.5rem',
                borderRadius: '4px',
                border: '1px solid #ced4da'
              }}
            />
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Provider:</label>
            <input
              type="text"
              value={provider}
              onChange={(e) => setProvider(e.target.value)}
              style={{
                width: '100%',
                padding: '0.5rem',
                borderRadius: '4px',
                border: '1px solid #ced4da'
              }}
            />
          </div>
          <button
            onClick={handleSubmit}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Register Tea
          </button>
        </div>
      )}
    </div>
  );
};

export default RegisterTea; 