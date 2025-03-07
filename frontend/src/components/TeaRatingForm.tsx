import React, { useState, useEffect } from "react";
import { getTeas, submitRating } from "../services/api";
import { Rating, Tea } from "../types";


interface TeaRatingFormProps {
  userId: number;
}

const TeaRatingForm: React.FC<TeaRatingFormProps> = ({ userId }) => {
  const [teaList, setTeaList] = useState<Tea[]>([]);
  const [teaId, setTeaId] = useState<number>(0);
  const [rating, setRating] = useState<Rating>({
    id: 0,
    userId: 0,
    teaId: 0,
    umami: 0,
    astringency: 0,
    floral: 0,
    vegetal: 0,
    nutty: 0,
    roasted: 0,
    body: 0,
    rating: 0,
  });

  useEffect(() => {
    getTeas().then((res) => setTeaList(res.data as Tea[]));
  }, []);

  const handleSubmit = async () => {
    rating.user_id = userId;
    rating.tea_id = teaId;
    console.log("teaID:", teaId);
    await submitRating(rating);
    alert('Rating submitted!');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setRating((prevRating) => ({ ...prevRating, [name]: parseFloat(value) }));
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
      <div>
        <label>Umami:</label>
        <input type="number" name="umami" value={rating.umami} onChange={handleChange} />
      </div>
      <div>
        <label>Astringency:</label>
        <input type="number" name="astringency" value={rating.astringency} onChange={handleChange} />
      </div>
      <div>
        <label>Floral:</label>
        <input type="number" name="floral" value={rating.floral} onChange={handleChange} />
      </div>
      <div>
        <label>Vegetal:</label>
        <input type="number" name="vegetal" value={rating.vegetal} onChange={handleChange} />
      </div>
      <div>
        <label>Nutty:</label>
        <input type="number" name="nutty" value={rating.nutty} onChange={handleChange} />
      </div>
      <div>
        <label>Roasted:</label>
        <input type="number" name="roasted" value={rating.roasted} onChange={handleChange} />
      </div>
      <div>
        <label>Body:</label>
        <input type="number" name="body" value={rating.body} onChange={handleChange} />
      </div>
      <div>
        <label>Rating:</label>
        <input type="number" name="rating" value={rating.rating} onChange={handleChange} />
      </div>
      <button onClick={handleSubmit}>Submit Rating</button>
    </div>
  );
};

export default TeaRatingForm;
