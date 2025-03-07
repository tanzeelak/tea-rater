import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerUser } from "../services/api";

interface RegisterProps {
  setToken: (token: string) => void;
}

const Register: React.FC<RegisterProps> = ({ setToken }) => {
  const [username, setUsername] = useState("");
  const navigate = useNavigate();

  const handleRegister = async () => {
    try {
        const res: any = await registerUser(username);
        if (res.data.token) {
            setToken(res.data.token);
            localStorage.setItem("token", res.data.token);
            navigate("/"); // Redirect to home after successful registration
        }
    } catch (error) {
      alert("Registration failed!");
    }
  };

  return (
    <div>
      <h2>Register</h2>
      <input
        type="text"
        placeholder="Enter username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <button onClick={handleRegister}>Register</button>
    </div>
  );
};

export default Register;