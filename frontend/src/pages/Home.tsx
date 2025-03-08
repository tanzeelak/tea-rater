import React, { useState } from "react";
import Login from "../components/Login";
import TeaRatingForm from "../components/TeaRatingForm";
import UserRatings from "../components/UserRatings";
import Navbar from "../components/Navbar";

const Home: React.FC = () => {
  const [token, setToken] = useState<string | null>(localStorage.getItem("authToken"));
  const userId = token ? Number(token.replace("user-", "")) : null;

  return (
    <div>
      {!token ? (
        <Login setToken={setToken} />
      ) : (
        <>
          <Navbar setToken={setToken} />
          <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
            <div style={{ marginBottom: '40px' }}>
              <h2>Rate a New Tea</h2>
              <TeaRatingForm userId={userId!} />
            </div>
            <UserRatings userId={userId!} />
          </div>
        </>
      )}
    </div>
  );
};

export default Home;
