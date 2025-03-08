import React, { useState, useEffect } from "react";
import { getTeas, submitRating, editRating } from "../services/api";
import { Rating, Tea } from "../types";

interface TeaRatingFormProps {
  userId: number;
  editingRating?: Rating | null;
  onEditComplete?: () => void;
  refreshTrigger?: number;
}

const TeaRatingForm: React.FC<TeaRatingFormProps> = ({ 
  userId, 
  editingRating = null, 
  onEditComplete,
  refreshTrigger = 0 
}) => {
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
    getTeas(userId).then((res) => setTeaList(res.data as Tea[]));
  }, [refreshTrigger, userId]);

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

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setRating((prevRating) => ({ ...prevRating, [name]: parseFloat(value) }));
  };

  const renderRatingSelect = (name: string, label: string, description: string) => (
    <div style={{ 
      marginBottom: '1.5rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '2rem'
    }}>
      <div style={{ flex: 1, maxWidth: '300px' }}>
        <div style={{ fontWeight: 500 }}>{label}:</div>
        <div style={{ 
          fontSize: '0.8rem', 
          color: '#666',
          marginTop: '0.25rem'
        }}>
          {description}
        </div>
      </div>
      <select
        name={name}
        value={rating[name as keyof Rating]}
        onChange={handleChange}
        style={{
          padding: '0.5rem',
          borderRadius: '4px',
          border: '1px solid #ced4da',
          width: '100px',
          flexShrink: 0
        }}
      >
        <option value="0">Select...</option>
        {[1, 2, 3, 4, 5].map((num) => (
          <option key={num} value={num}>
            {num}
          </option>
        ))}
      </select>
    </div>
  );

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
          marginBottom: '2rem',
          width: '50%',
          maxWidth: '500px'
        }}
        disabled={!!editingRating}
      >
        <option value="0">Select a Tea</option>
        {teaList.map((tea) => (
          <option key={tea.id} value={tea.id}>
            {tea.tea_name}
          </option>
        ))}
      </select>

      <div style={{ marginBottom: '2rem' }}>
        {renderRatingSelect('umami', 'Umami', 'Savory, brothy taste sensation')}
        {renderRatingSelect('astringency', 'Astringency', 'Drying or puckering sensation')}
        {renderRatingSelect('floral', 'Floral', 'Flower-like aromas and taste')}
        {renderRatingSelect('vegetal', 'Vegetal', 'Fresh green, plant-like qualities')}
        {renderRatingSelect('nutty', 'Nuttiness', 'Nutty characteristics')}
        {renderRatingSelect('roasted', 'Roasted', 'Toasted, charred notes')}
        {renderRatingSelect('body', 'Full-bodied', 'Thickness and weight in mouth')}
        {renderRatingSelect('rating', 'Overall', 'Your overall impression')}
      </div>

      <button 
        onClick={handleSubmit}
        style={{
          padding: '0.5rem 1rem',
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        {editingRating ? 'Update Rating' : 'Submit Rating'}
      </button>
    </div>
  );
};

export default TeaRatingForm;
