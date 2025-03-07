import React, { useEffect, useState } from "react";
import { getRatings } from "../services/api";

interface Rating {
  id: number;
  tea_id: number;
  rating: number;
}

const RatingsTable: React.FC = () => {
  const [ratings, setRatings] = useState<Rating[]>([]);

  useEffect(() => {
    getRatings().then((res) => setRatings(res.data as Rating[]));
  }, []);

  return (
    <table>
      <thead>
        <tr>
          <th>Tea ID</th>
          <th>Rating</th>
        </tr>
      </thead>
      <tbody>
        {ratings.map((r) => (
          <tr key={r.id}>
            <td>{r.tea_id}</td>
            <td>{r.rating}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default RatingsTable;
