import React, { useEffect, useState } from "react";
import { getUserRatings } from "../services/api";
import { Rating } from "../types";
import TeaRatingForm from "./TeaRatingForm";

interface UserRatingsProps {
  userId: number;
}

interface RatingWithTeaName extends Rating {
  tea_name: string;
}

const UserRatings: React.FC<UserRatingsProps> = ({ userId }) => {
  const [ratings, setRatings] = useState<RatingWithTeaName[]>([]);
  const [editingRating, setEditingRating] = useState<RatingWithTeaName | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchRatings = async () => {
    try {
      const res = await getUserRatings(userId);
      setRatings(res.data as RatingWithTeaName[]);
      setError(null);
    } catch (err) {
      console.error('Error fetching ratings:', err);
      setError('Failed to load ratings');
      setRatings([]);
    }
  };

  useEffect(() => {
    fetchRatings();
  }, [userId]);

  if (error) {
    return <div style={{ textAlign: 'center', color: '#dc3545', marginTop: '20px' }}>{error}</div>;
  }

  if (editingRating) {
    return (
      <div>
        <h2>Edit Rating for {editingRating.tea_name}</h2>
        <button 
          onClick={() => setEditingRating(null)}
          style={{
            marginBottom: '1rem',
            padding: '0.5rem 1rem',
            backgroundColor: '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Cancel Edit
        </button>
        <TeaRatingForm 
          userId={userId} 
          editingRating={editingRating}
          onEditComplete={() => {
            setEditingRating(null);
            fetchRatings();
          }}
        />
      </div>
    );
  }

  return (
    <div className="user-ratings">
      <h2>Your Tea Ratings</h2>
      {ratings && ratings.length > 0 ? (
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
          <thead>
            <tr>
              <th style={{ padding: '10px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Tea Name</th>
              <th style={{ padding: '10px', textAlign: 'center', borderBottom: '2px solid #ddd' }}>Overall</th>
              <th style={{ padding: '10px', textAlign: 'center', borderBottom: '2px solid #ddd' }}>Umami</th>
              <th style={{ padding: '10px', textAlign: 'center', borderBottom: '2px solid #ddd' }}>Astringency</th>
              <th style={{ padding: '10px', textAlign: 'center', borderBottom: '2px solid #ddd' }}>Floral</th>
              <th style={{ padding: '10px', textAlign: 'center', borderBottom: '2px solid #ddd' }}>Vegetal</th>
              <th style={{ padding: '10px', textAlign: 'center', borderBottom: '2px solid #ddd' }}>Nutty</th>
              <th style={{ padding: '10px', textAlign: 'center', borderBottom: '2px solid #ddd' }}>Roasted</th>
              <th style={{ padding: '10px', textAlign: 'center', borderBottom: '2px solid #ddd' }}>Body</th>
              <th style={{ padding: '10px', textAlign: 'center', borderBottom: '2px solid #ddd' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {ratings.map((rating) => (
              <tr key={rating.id}>
                <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>{rating.tea_name}</td>
                <td style={{ padding: '10px', textAlign: 'center', borderBottom: '1px solid #ddd' }}>{rating.rating}</td>
                <td style={{ padding: '10px', textAlign: 'center', borderBottom: '1px solid #ddd' }}>{rating.umami}</td>
                <td style={{ padding: '10px', textAlign: 'center', borderBottom: '1px solid #ddd' }}>{rating.astringency}</td>
                <td style={{ padding: '10px', textAlign: 'center', borderBottom: '1px solid #ddd' }}>{rating.floral}</td>
                <td style={{ padding: '10px', textAlign: 'center', borderBottom: '1px solid #ddd' }}>{rating.vegetal}</td>
                <td style={{ padding: '10px', textAlign: 'center', borderBottom: '1px solid #ddd' }}>{rating.nutty}</td>
                <td style={{ padding: '10px', textAlign: 'center', borderBottom: '1px solid #ddd' }}>{rating.roasted}</td>
                <td style={{ padding: '10px', textAlign: 'center', borderBottom: '1px solid #ddd' }}>{rating.body}</td>
                <td style={{ padding: '10px', textAlign: 'center', borderBottom: '1px solid #ddd' }}>
                  <button
                    onClick={() => setEditingRating(rating)}
                    style={{
                      padding: '0.25rem 0.5rem',
                      backgroundColor: '#007bff',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p style={{ textAlign: 'center', marginTop: '20px' }}>You haven't rated any teas yet!</p>
      )}
    </div>
  );
};

export default UserRatings; 