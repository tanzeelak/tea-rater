import React, { useEffect, useState } from "react";
import { getAdminData } from "../services/api";

const Dashboard: React.FC = () => {
    const [adminData, setAdminData] = useState<object[]>([]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
        getAdminData(token).then((res) => setAdminData(res.data as object[]));
    }
  }, []);

  return (
    <div>
      <h1>Admin Dashboard</h1>
      <pre>{JSON.stringify(adminData, null, 2)}</pre>
    </div>
  );
};

export default Dashboard;
