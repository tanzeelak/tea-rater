import React, { useState } from "react";
import { loginUser } from "../services/api";

interface LoginProps {
  setToken: (token: string) => void;
}

const Login: React.FC<LoginProps> = ({ setToken }) => {
  const [username, setUsername] = useState("");

  const handleLogin = async () => {
    try {
      const res: any = await loginUser(username);
      setToken(res.data.token);
      localStorage.setItem("authToken", res.data.token);
    } catch (error) {
      alert("Login failed!");
    }
  };

  return (
    <div>
      <input type="text" placeholder="Enter username" value={username} onChange={(e) => setUsername(e.target.value)} />
      <button onClick={handleLogin}>Login</button>
    </div>
  );
};

export default Login;
