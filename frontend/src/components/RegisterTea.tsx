import React, { useState } from 'react';
import { registerTea } from '../services/api';

interface RegisterTeaProps {
  onTeaRegistered: () => void;
}

const RegisterTea: React.FC<RegisterTeaProps> = ({ onTeaRegistered }) => {
  const [teaName, setTeaName] = useState('');
  const [provider, setProvider] = useState('');
  const [source, setSource] = useState('');
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
      setSource('');
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
    <div style={{
      position: 'absolute',
      top: '100%',
      right: '0',
      marginTop: '0.5rem',
      zIndex: 1000,
      backgroundColor: 'white',
      boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
      borderRadius: '4px',
      padding: '1.5rem',
      minWidth: '300px'
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
        <label style={{ display: 'block', marginBottom: '0.5rem' }}>Source:</label>
        <input
          type="text"
          value={source}
          onChange={(e) => setSource(e.target.value)}
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
          cursor: 'pointer',
          width: '100%'
        }}
      >
        Register Tea
      </button>
    </div>
  );
};

export default RegisterTea; 