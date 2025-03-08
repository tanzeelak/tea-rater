import React, { useState } from "react";
import { loginUser, registerUser } from "../services/api";

interface LoginProps {
  setToken: (token: string) => void;
}

const Login: React.FC<LoginProps> = ({ setToken }) => {
  const [username, setUsername] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);

  const handleSubmit = async () => {
    try {
      if (isRegistering) {
        const res: any = await registerUser(username);
        if (res.data.token) {
          setToken(res.data.token);
          localStorage.setItem("authToken", res.data.token);
        }
      } else {
        const res: any = await loginUser(username);
        setToken(res.data.token);
        localStorage.setItem("authToken", res.data.token);
      }
    } catch (error) {
      alert(isRegistering ? "Registration failed!" : "Login failed!");
    }
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '2rem',
      maxWidth: '400px',
      margin: '0 auto',
      backgroundColor: '#f8f9fa',
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    }}>
      <h1 style={{ marginBottom: '2rem' }}>Tea Rater</h1>
      <h2>{isRegistering ? 'Register' : 'Login'}</h2>
      <input
        type="text"
        placeholder="Enter username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        style={{
          padding: '0.5rem',
          marginBottom: '1rem',
          width: '100%',
          borderRadius: '4px',
          border: '1px solid #ced4da'
        }}
      />
      <div style={{ display: 'flex', gap: '1rem', width: '100%' }}>
        <button
          onClick={handleSubmit}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            flex: 1
          }}
        >
          {isRegistering ? 'Register' : 'Login'}
        </button>
        <button
          onClick={() => setIsRegistering(!isRegistering)}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            flex: 1
          }}
        >
          {isRegistering ? 'Switch to Login' : 'Switch to Register'}
        </button>
      </div>
    </div>
  );
};

export default Login;
