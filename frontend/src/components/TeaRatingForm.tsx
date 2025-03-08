import React, { useState, useEffect } from "react";
import { getTeas, submitRating, editRating } from "../services/api";
import { Rating, Tea } from "../types";

interface TeaRatingFormProps {
  userId: number;
  editingRating?: Rating | null;
  onEditComplete?: () => void;
}

const TeaRatingForm: React.FC<TeaRatingFormProps> = ({ userId, editingRating = null, onEditComplete }) => {
  const [teaList, setTeaList] = useState<Tea[]>([]);
  const [teaId, setTeaId] = useState<number>(editingRating?.tea_id || 0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [rating, setRating] = useState<Rating>(editingRating || {
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

  useEffect(() => {
    if (editingRating) {
      setRating(editingRating);
      setTeaId(editingRating.tea_id);
    }
  }, [editingRating]);

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

    try {
      if (editingRating) {
        await editRating(editingRating.id, rating);
      } else {
        await submitRating(rating);
      }
      
      // Show success message
      setShowSuccess(true);
      setShowError(false);
      
      // Reset form if not editing
      if (!editingRating) {
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
      }

      // Call onEditComplete if provided
      if (editingRating && onEditComplete) {
        onEditComplete();
      }

      // Hide success message after 3 seconds
      setTimeout(() => {
        setShowSuccess(false);
      }, 3000);
    } catch (error) {
      console.error('Error submitting rating:', error);
      setShowError(true);
      setTimeout(() => {
        setShowError(false);
      }, 3000);
    }
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
          Rating {editingRating ? 'updated' : 'submitted'} successfully!
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
          {teaId === 0 ? 'Please select a tea before submitting!' : 'Error submitting rating. Please try again.'}
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
        disabled={!!editingRating}
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
      <button onClick={handleSubmit}>{editingRating ? 'Update Rating' : 'Submit Rating'}</button>
    </div>
  );
};

export default TeaRatingForm;
