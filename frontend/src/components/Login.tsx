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
      if (!username.trim()) {
        alert("Please enter a username");
        return;
      }

      let res: any;
      if (isRegistering) {
        res = await registerUser(username);
        console.log("Registration response:", res.data); // For debugging
      } else {
        res = await loginUser(username);
      }
      
      const token = res.data.token;
      if (token) {
        setToken(token);
        localStorage.setItem("authToken", token);
      } else {
        throw new Error("No token received");
      }
    } catch (error) {
      console.error("Error:", error);
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
