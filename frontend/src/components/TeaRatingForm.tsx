import React, { useState, useEffect } from "react";
import { getTeas, submitRating } from "../services/api";
import { Rating, Tea } from "../types";


interface TeaRatingFormProps {
  userId: number;
}

const TeaRatingForm: React.FC<TeaRatingFormProps> = ({ userId }) => {
  const [teaList, setTeaList] = useState<Tea[]>([]);
  const [teaId, setTeaId] = useState<number>(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [rating, setRating] = useState<Rating>({
    id: 0,
    user_id: 0,
    tea_id: 0,
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
    if (teaId === 0) {
      setShowError(true);
      setTimeout(() => {
        setShowError(false);
      }, 3000);
      return;
    }

    rating.user_id = userId;
    rating.tea_id = teaId;
    await submitRating(rating);
    
    // Show success message
    setShowSuccess(true);
    setShowError(false);
    
    // Reset form
    setTeaId(0);
    setRating({
      id: 0,
      user_id: 0,
      tea_id: 0,
      umami: 0,
      astringency: 0,
      floral: 0,
      vegetal: 0,
      nutty: 0,
      roasted: 0,
      body: 0,
      rating: 0,
    });

    // Hide success message after 3 seconds
    setTimeout(() => {
      setShowSuccess(false);
    }, 3000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setRating((prevRating) => ({ ...prevRating, [name]: parseFloat(value) }));
  };

  return (
    <div>
      {showSuccess && (
        <div style={{
          backgroundColor: '#d4edda',
          color: '#155724',
          padding: '1rem',
          borderRadius: '4px',
          marginBottom: '1rem',
          textAlign: 'center'
        }}>
          Rating submitted successfully!
        </div>
      )}
      {showError && (
        <div style={{
          backgroundColor: '#f8d7da',
          color: '#721c24',
          padding: '1rem',
          borderRadius: '4px',
          marginBottom: '1rem',
          textAlign: 'center'
        }}>
          Please select a tea before submitting!
        </div>
      )}
      <select 
        value={teaId} 
        onChange={(e) => {
          setTeaId(Number(e.target.value));
          setShowError(false);
        }}
        style={{
          border: showError ? '2px solid #dc3545' : '1px solid #ced4da',
          borderRadius: '4px',
          padding: '0.5rem',
          marginBottom: '1rem',
          width: '100%'
        }}
      >
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
