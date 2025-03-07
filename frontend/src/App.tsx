import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./components/Login";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Register from "./components/RegisterUser";

const App: React.FC = () => {
  const [token, setToken] = useState<string | null>(localStorage.getItem("token"));

  const handleLogin = (newToken: string) => {
    localStorage.setItem("token", newToken);
    setToken(newToken);
  };
  return (
    <Router>
      <Routes>
        <Route path="/" element={token ? <Home /> : <Login setToken={setToken} />} />
        <Route path="/register" element={<Register setToken={handleLogin} />} />
        <Route path="/admin" element={token ? <Dashboard /> : <Login setToken={setToken} />} />
      </Routes>
    </Router>
  );
};

export default App;
