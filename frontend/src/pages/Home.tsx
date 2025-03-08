import React, { useState } from "react";
import Login from "../components/Login";
import TeaRatingForm from "../components/TeaRatingForm";

const Home: React.FC = () => {
  const [token, setToken] = useState<string | null>(localStorage.getItem("authToken"));
  const userId = token ? Number(token.replace("user-", "")) : null;

  return (
    <div>
      {!token ? <Login setToken={setToken} /> : <TeaRatingForm userId={userId!} />}
    </div>
  );
};

export default Home;
