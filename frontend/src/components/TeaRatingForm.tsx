import React, { useState, useEffect } from "react";
import { getTeas, submitRating } from "../services/api";

interface Tea {
  id: number;
  tea_name: string;
  provider: string;
}

interface TeaRatingFormProps {
  userId: number;
}

const TeaRatingForm: React.FC<TeaRatingFormProps> = ({ userId }) => {
  const [teaList, setTeaList] = useState<Tea[]>([]);
  const [teaId, setTeaId] = useState<number>(0);
  const [rating, setRating] = useState<number>(0);

  useEffect(() => {
    getTeas().then((res) => setTeaList(res.data as Tea[]));
  }, []);

  const handleSubmit = async () => {
    await submitRating(userId, teaId, { rating });
    alert("Rating submitted!");
  };

  return (
    <div>
      <select value={teaId} onChange={(e) => setTeaId(Number(e.target.value))}>
        <option value="0">Select a Tea</option>
        {teaList.map((tea) => (
          <option key={tea.id} value={tea.id}>
            {tea.tea_name} ({tea.provider})
          </option>
        ))}
      </select>
      <input type="number" value={rating} onChange={(e) => setRating(Number(e.target.value))} />
      <button onClick={handleSubmit}>Submit Rating</button>
    </div>
  );
};

export default TeaRatingForm;
