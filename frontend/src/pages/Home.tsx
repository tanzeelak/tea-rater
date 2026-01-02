import React, { useState, useEffect } from "react";
import Login from "../components/Login";
import Navbar from "../components/Navbar";
import { getTeas, getAllTeas, getUserRatings, getTastings } from "../services/api";
import { Tea, Rating, TeaTasting } from "../types";

interface RatingWithTeaName extends Rating {
  tea_name: string;
}

interface TeaWithDisplay extends Tea {
  display: string;
}

interface TeaFlight extends TeaTasting {
  ratings: RatingWithTeaName[];
  avgRating: number;
  date: string;
}

const Home: React.FC = () => {
  const [token, setToken] = useState<string | null>(localStorage.getItem("authToken"));
  const userId = token ? Number(token.replace("user-", "")) : null;
  const [refreshTeas, setRefreshTeas] = useState(0);
  const [teaFlights, setTeaFlights] = useState<TeaFlight[]>([]);
  const [availableTeas, setAvailableTeas] = useState<TeaWithDisplay[]>([]);
  const [allTeas, setAllTeas] = useState<TeaWithDisplay[]>([]);
  const [selectedFlight, setSelectedFlight] = useState<TeaFlight | null>(null);
  const [showNewFlight, setShowNewFlight] = useState(false);
  const [ratingTea, setRatingTea] = useState<TeaWithDisplay | null>(null);
  const [editingRating, setEditingRating] = useState<RatingWithTeaName | null>(null);

  const handleTeaRegistered = () => {
    setRefreshTeas(prev => prev + 1);
  };

  // Create tea flights from tastings and their associated ratings
  const createTeaFlights = (tastings: TeaTasting[], allRatings: RatingWithTeaName[]): TeaFlight[] => {
    return tastings.map(tasting => {
      // Get ratings for this specific tasting
      const tastingRatings = allRatings.filter(rating => rating.tasting_id === tasting.id);
      
      const avgRating = tastingRatings.length > 0 
        ? tastingRatings.reduce((sum, r) => sum + r.rating, 0) / tastingRatings.length
        : 0;
      
      return {
        id: tasting.id,
        name: tasting.name,
        date: new Date().toLocaleDateString(), // You might want to add a created_at field to TeaTasting model later
        ratings: tastingRatings,
        avgRating: Math.round(avgRating * 10) / 10
      };
    });
  };

  const fetchData = async () => {
    if (!userId) return;
    
    try {
      const [ratingsRes, teasRes, allTeasRes, tastingsRes] = await Promise.all([
        getUserRatings(userId),
        getTeas(userId),
        getAllTeas(),
        getTastings()
      ]);
      
      const ratings = ratingsRes.data as RatingWithTeaName[];
      const tastings = tastingsRes.data as TeaTasting[];
      
      setTeaFlights(createTeaFlights(tastings, ratings));
      setAvailableTeas(teasRes.data as TeaWithDisplay[]);
      setAllTeas(allTeasRes.data as TeaWithDisplay[]);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, [userId, refreshTeas]);

  const handleNewFlightComplete = () => {
    setShowNewFlight(false);
    setRefreshTeas(prev => prev + 1);
    fetchData();
  };

  const handleTeaRatingComplete = () => {
    setRatingTea(null);
    setRefreshTeas(prev => prev + 1);
    fetchData();
  };

  const handleRatingEditComplete = () => {
    setEditingRating(null);
    setRefreshTeas(prev => prev + 1);
    fetchData();
  };

  if (!token) {
    return <Login setToken={setToken} />;
  }

  if (editingRating) {
    return (
      <div>
        <Navbar setToken={setToken} userId={userId!} onTeaRegistered={handleTeaRegistered} />
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
          <button 
            onClick={() => setEditingRating(null)}
            style={{
              marginBottom: '1rem',
              padding: '0.5rem 1rem',
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer'
            }}
          >
            ← Back to Flight
          </button>
          <h2 style={{ marginBottom: '1rem', color: '#2d3748' }}>
            Edit Rating for {editingRating.tea_name}
          </h2>
          <TeaRatingCard 
            tea={{
              id: editingRating.tea_id,
              tea_name: editingRating.tea_name,
              provider: '',
              display: editingRating.tea_name
            }} 
            userId={userId!} 
            editingRating={editingRating}
            onComplete={handleRatingEditComplete} 
          />
        </div>
      </div>
    );
  }

  if (ratingTea) {
    return (
      <div>
        <Navbar setToken={setToken} userId={userId!} onTeaRegistered={handleTeaRegistered} />
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
          <button 
            onClick={() => setRatingTea(null)}
            style={{
              marginBottom: '1rem',
              padding: '0.5rem 1rem',
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer'
            }}
          >
            ← Back to Flight
          </button>
          <TeaRatingCard 
            tea={ratingTea} 
            userId={userId!} 
            onComplete={handleTeaRatingComplete} 
          />
        </div>
      </div>
    );
  }


  if (showNewFlight) {
    return (
      <div>
        <Navbar setToken={setToken} userId={userId!} onTeaRegistered={handleTeaRegistered} />
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
          <button 
            onClick={() => setShowNewFlight(false)}
            style={{
              marginBottom: '1rem',
              padding: '0.5rem 1rem',
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer'
            }}
          >
            ← Back to Dashboard
          </button>
          <NewFlightCreator 
            userId={userId!} 
            availableTeas={availableTeas}
            onComplete={handleNewFlightComplete} 
          />
        </div>
      </div>
    );
  }

  if (selectedFlight) {
    return (
      <div>
        <Navbar setToken={setToken} userId={userId!} onTeaRegistered={handleTeaRegistered} />
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
          <button 
            onClick={() => setSelectedFlight(null)}
            style={{
              marginBottom: '1rem',
              padding: '0.5rem 1rem',
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer'
            }}
          >
            ← Back to Dashboard
          </button>
          <FlightDetailView 
            flight={selectedFlight} 
            allTeas={allTeas}
            onRateTea={(tea) => setRatingTea(tea)}
            onEditRating={(rating) => setEditingRating(rating)}
          />
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navbar setToken={setToken} userId={userId!} onTeaRegistered={handleTeaRegistered} />
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
        <h1 style={{ marginBottom: '2rem', color: '#2d3748' }}>Tea Flight Dashboard</h1>
        
        {/* Past Tea Flights Section */}
        <section style={{ marginBottom: '3rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 style={{ margin: 0, color: '#4a5568' }}>Your Tea Flights</h2>
            {availableTeas.length > 0 && (
              <button
                onClick={() => setShowNewFlight(true)}
                style={{
                  backgroundColor: '#48bb78',
                  color: 'white',
                  border: 'none',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '8px',
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}
              >
                + Create New Flight
              </button>
            )}
          </div>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', 
            gap: '1.5rem' 
          }}>
            {teaFlights.map((flight) => (
              <TeaFlightCard 
                key={flight.id} 
                flight={flight} 
                onClick={() => setSelectedFlight(flight)} 
              />
            ))}
            {teaFlights.length === 0 && (
              <p style={{ color: '#718096', fontStyle: 'italic' }}>
                No tea flights yet. {availableTeas.length > 0 ? 'Create your first tea flight!' : 'Register some teas to get started.'}
              </p>
            )}
          </div>
        </section>

        {availableTeas.length === 0 && teaFlights.length === 0 && (
          <section style={{
            textAlign: 'center',
            padding: '3rem',
            backgroundColor: '#f7fafc',
            borderRadius: '12px',
            border: '2px dashed #cbd5e0'
          }}>
            <h3 style={{ color: '#4a5568', marginBottom: '1rem' }}>Welcome to Tea Flight!</h3>
            <p style={{ color: '#718096', marginBottom: '1.5rem' }}>
              Start by registering some teas using the navbar, then create your first tea flight to rate multiple teas together.
            </p>
          </section>
        )}
      </div>
    </div>
  );
};

// Component for displaying a tea flight card
const TeaFlightCard: React.FC<{ 
  flight: TeaFlight; 
  onClick: () => void; 
}> = ({ flight, onClick }) => {
  const getRatingColor = (score: number) => {
    if (score >= 8) return '#48bb78';
    if (score >= 6) return '#ed8936';
    return '#f56565';
  };

  return (
    <div 
      style={{
        backgroundColor: 'white',
        border: '1px solid #e2e8f0',
        borderRadius: '12px',
        padding: '1.5rem',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
        cursor: 'pointer',
        transition: 'all 0.2s'
      }}
      onClick={onClick}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = '0 8px 16px rgba(0, 0, 0, 0.15)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
      }}
    >
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'flex-start',
        marginBottom: '1rem' 
      }}>
        <div>
          <h3 style={{ 
            margin: '0 0 0.5rem 0', 
            color: '#2d3748',
            fontSize: '1.4rem'
          }}>
            {flight.name}
          </h3>
          <p style={{ 
            margin: 0, 
            color: '#718096',
            fontSize: '0.875rem'
          }}>
            {flight.date} • {flight.ratings.length} tea{flight.ratings.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div style={{
          backgroundColor: getRatingColor(flight.avgRating),
          color: 'white',
          padding: '0.5rem 1rem',
          borderRadius: '25px',
          fontSize: '1.1rem',
          fontWeight: 'bold'
        }}>
          {flight.avgRating}/10
        </div>
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <p style={{ 
          color: '#4a5568', 
          fontWeight: 'bold', 
          marginBottom: '0.5rem',
          fontSize: '0.875rem'
        }}>
          Teas in this flight:
        </p>
        <div style={{ 
          display: 'flex', 
          flexWrap: 'wrap', 
          gap: '0.5rem' 
        }}>
          {flight.ratings.slice(0, 3).map((rating, idx) => (
            <span 
              key={idx}
              style={{
                backgroundColor: '#edf2f7',
                color: '#4a5568',
                padding: '0.25rem 0.75rem',
                borderRadius: '15px',
                fontSize: '0.75rem',
                fontWeight: '500'
              }}
            >
              {rating.tea_name}
            </span>
          ))}
          {flight.ratings.length > 3 && (
            <span style={{
              color: '#718096',
              fontSize: '0.75rem',
              padding: '0.25rem 0.5rem'
            }}>
              +{flight.ratings.length - 3} more
            </span>
          )}
        </div>
      </div>

      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between',
        fontSize: '0.75rem',
        color: '#a0aec0'
      }}>
        <span>Click to view details →</span>
      </div>
    </div>
  );
};

// Component for viewing flight details
const FlightDetailView: React.FC<{ 
  flight: TeaFlight; 
  allTeas: TeaWithDisplay[];
  onRateTea: (tea: TeaWithDisplay) => void;
  onEditRating: (rating: RatingWithTeaName) => void;
}> = ({ flight, allTeas, onRateTea, onEditRating }) => {
  // Create a map of rated teas for quick lookup
  const ratedTeaMap = new Map();
  flight.ratings.forEach(rating => {
    ratedTeaMap.set(rating.tea_name, rating);
  });

  return (
    <div>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '2rem' 
      }}>
        <div>
          <h1 style={{ margin: '0 0 0.5rem 0', color: '#2d3748' }}>{flight.name}</h1>
          <p style={{ margin: 0, color: '#718096' }}>
            {flight.date} • {flight.ratings.length} rated, {allTeas.length - flight.ratings.length} unrated • Avg: {flight.avgRating}/10
          </p>
        </div>
      </div>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
        gap: '1.5rem' 
      }}>
        {allTeas.map((tea) => {
          const rating = ratedTeaMap.get(tea.tea_name);
          return rating ? (
            <RatedTeaCard 
              key={`rated-${tea.id}`} 
              rating={rating} 
              onEdit={() => onEditRating(rating)}
            />
          ) : (
            <UnratedTeaCard 
              key={`unrated-${tea.id}`} 
              tea={tea} 
              onRate={() => onRateTea(tea)} 
            />
          );
        })}
      </div>
    </div>
  );
};

// Component for creating a new tea flight
const NewFlightCreator: React.FC<{ 
  userId: number;
  availableTeas: TeaWithDisplay[];
  onComplete: () => void;
}> = ({ userId, availableTeas, onComplete }) => {
  const [selectedTeas, setSelectedTeas] = useState<TeaWithDisplay[]>([]);
  const [currentTeaIndex, setCurrentTeaIndex] = useState(0);
  const [ratings, setRatings] = useState<any[]>([]);
  const [flightName, setFlightName] = useState('');

  const handleTeaSelect = (tea: TeaWithDisplay) => {
    if (!selectedTeas.find(t => t.id === tea.id)) {
      setSelectedTeas([...selectedTeas, tea]);
    }
  };

  const handleTeaRemove = (tea: TeaWithDisplay) => {
    setSelectedTeas(selectedTeas.filter(t => t.id !== tea.id));
  };

  const handleRatingComplete = (ratingData: any) => {
    const newRatings = [...ratings, ratingData];
    setRatings(newRatings);
    
    if (currentTeaIndex < selectedTeas.length - 1) {
      setCurrentTeaIndex(currentTeaIndex + 1);
    } else {
      // All teas rated, complete the flight
      onComplete();
    }
  };

  const handleCreateEmptyFlight = async () => {
    try {
      const { createTasting } = await import('../services/api');
      await createTasting(flightName.trim());
      // Flight created successfully, return to dashboard
      onComplete();
    } catch (error: any) {
      console.error('Error creating flight:', error);
      if (error.response?.status === 409) {
        alert('A flight with this name already exists. Please choose a different name.');
      } else {
        alert('Failed to create flight. Please try again.');
      }
    }
  };

  if (selectedTeas.length > 0 && currentTeaIndex < selectedTeas.length) {
    return (
      <div>
        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{ margin: '0 0 0.5rem 0', color: '#2d3748' }}>
            Rating Tea {currentTeaIndex + 1} of {selectedTeas.length}
          </h2>
          <div style={{ 
            backgroundColor: '#edf2f7', 
            borderRadius: '8px', 
            padding: '1rem',
            marginBottom: '1rem'
          }}>
            <h3 style={{ margin: 0, color: '#4a5568' }}>
              Flight: {flightName || 'New Tea Flight'}
            </h3>
            <p style={{ margin: '0.5rem 0 0 0', color: '#718096' }}>
              Progress: {ratings.length}/{selectedTeas.length} completed
            </p>
          </div>
        </div>
        <TeaRatingCard 
          tea={selectedTeas[currentTeaIndex]} 
          userId={userId}
          onComplete={(data: any) => handleRatingComplete(data)}
        />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      <h2 style={{ marginBottom: '2rem', color: '#2d3748' }}>Create New Tea Flight</h2>
      
      <div style={{ marginBottom: '2rem' }}>
        <label style={{ 
          display: 'block', 
          marginBottom: '0.5rem', 
          fontWeight: 'bold',
          color: '#4a5568'
        }}>
          Flight Name:
        </label>
        <input
          type="text"
          value={flightName}
          onChange={(e) => setFlightName(e.target.value)}
          placeholder="e.g., Saturday Morning Tasting"
          style={{
            width: '100%',
            padding: '0.75rem',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            fontSize: '1rem'
          }}
        />
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <h3 style={{ marginBottom: '1rem', color: '#4a5568' }}>
          Selected Teas ({selectedTeas.length})
        </h3>
        <div style={{ 
          display: 'flex', 
          flexWrap: 'wrap', 
          gap: '0.5rem',
          marginBottom: '1rem'
        }}>
          {selectedTeas.map((tea) => (
            <span 
              key={tea.id}
              style={{
                backgroundColor: '#4299e1',
                color: 'white',
                padding: '0.5rem 1rem',
                borderRadius: '20px',
                fontSize: '0.875rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              {tea.display}
              <button
                onClick={() => handleTeaRemove(tea)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '1rem'
                }}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <h3 style={{ marginBottom: '1rem', color: '#4a5568' }}>Available Teas</h3>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', 
          gap: '1rem' 
        }}>
          {availableTeas.map((tea) => (
            <div
              key={tea.id}
              onClick={() => handleTeaSelect(tea)}
              style={{
                backgroundColor: selectedTeas.find(t => t.id === tea.id) ? '#edf2f7' : 'white',
                border: selectedTeas.find(t => t.id === tea.id) ? '2px solid #4299e1' : '1px solid #e2e8f0',
                borderRadius: '8px',
                padding: '1rem',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              <h4 style={{ margin: '0 0 0.25rem 0', color: '#2d3748' }}>
                {tea.display}
              </h4>
              <p style={{ margin: 0, fontSize: '0.875rem', color: '#718096' }}>
                {tea.provider}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
        {selectedTeas.length > 0 && (
          <button
            onClick={() => setCurrentTeaIndex(0)}
            disabled={!flightName.trim()}
            style={{
              flex: 1,
              backgroundColor: flightName.trim() ? '#48bb78' : '#cbd5e0',
              color: 'white',
              border: 'none',
              padding: '1rem',
              borderRadius: '8px',
              fontSize: '1.1rem',
              fontWeight: 'bold',
              cursor: flightName.trim() ? 'pointer' : 'not-allowed'
            }}
          >
            Start Rating {selectedTeas.length} Tea{selectedTeas.length !== 1 ? 's' : ''}
          </button>
        )}
        
        {flightName.trim() && (
          <button
            onClick={handleCreateEmptyFlight}
            style={{
              flex: selectedTeas.length > 0 ? 1 : 2,
              backgroundColor: '#4299e1',
              color: 'white',
              border: 'none',
              padding: '1rem',
              borderRadius: '8px',
              fontSize: '1.1rem',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            {selectedTeas.length > 0 ? 'Create Empty Flight' : 'Create Flight & Add Teas Later'}
          </button>
        )}
      </div>
    </div>
  );
};


// Component for displaying an unrated tea
const UnratedTeaCard: React.FC<{ 
  tea: TeaWithDisplay; 
  onRate: () => void; 
}> = ({ tea, onRate }) => {
  return (
    <div 
      style={{
        backgroundColor: 'white',
        border: '2px dashed #cbd5e0',
        borderRadius: '12px',
        padding: '1.5rem',
        textAlign: 'center',
        cursor: 'pointer',
        transition: 'all 0.2s'
      }}
      onClick={onRate}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = '#4299e1';
        e.currentTarget.style.backgroundColor = '#f7fafc';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = '#cbd5e0';
        e.currentTarget.style.backgroundColor = 'white';
      }}
    >
      <h3 style={{ 
        margin: '0 0 1rem 0', 
        color: '#2d3748',
        fontSize: '1.25rem'
      }}>
        {tea.display}
      </h3>
      
      <p style={{ 
        color: '#718096', 
        margin: '0 0 1.5rem 0',
        fontSize: '0.875rem'
      }}>
        Provider: {tea.provider}
      </p>

      <div style={{
        backgroundColor: '#edf2f7',
        color: '#4a5568',
        padding: '0.5rem 1rem',
        borderRadius: '20px',
        fontSize: '0.875rem',
        fontWeight: 'bold',
        marginBottom: '1rem'
      }}>
        Not Rated
      </div>

      <p style={{
        color: '#4299e1',
        fontSize: '0.875rem',
        fontWeight: 'bold',
        margin: 0
      }}>
        Click to Rate →
      </p>
    </div>
  );
};

// Component for displaying a rated tea
const RatedTeaCard: React.FC<{ 
  rating: RatingWithTeaName;
  onEdit?: () => void;
}> = ({ rating, onEdit }) => {
  const getRatingColor = (score: number) => {
    if (score >= 8) return '#48bb78';
    if (score >= 6) return '#ed8936';
    return '#f56565';
  };

  return (
    <div style={{
      backgroundColor: 'white',
      border: '1px solid #e2e8f0',
      borderRadius: '12px',
      padding: '1.5rem',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '1rem'
      }}>
        <h3 style={{ 
          margin: 0, 
          color: '#2d3748',
          fontSize: '1.25rem'
        }}>
          {rating.tea_name}
        </h3>
        {onEdit && (
          <button
            onClick={onEdit}
            style={{
              backgroundColor: '#4299e1',
              color: 'white',
              border: 'none',
              padding: '0.25rem 0.75rem',
              borderRadius: '6px',
              fontSize: '0.75rem',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#3182ce'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#4299e1'}
          >
            Edit
          </button>
        )}
      </div>
      
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1rem'
      }}>
        <span style={{ fontWeight: 'bold', color: '#4a5568' }}>Overall Rating:</span>
        <span style={{
          backgroundColor: getRatingColor(rating.rating),
          color: 'white',
          padding: '0.25rem 0.75rem',
          borderRadius: '20px',
          fontSize: '1.1rem',
          fontWeight: 'bold'
        }}>
          {rating.rating}/10
        </span>
      </div>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '1fr 1fr', 
        gap: '0.5rem',
        fontSize: '0.875rem',
        color: '#718096'
      }}>
        <div>Umami: {rating.umami}</div>
        <div>Astringency: {rating.astringency}</div>
        <div>Floral: {rating.floral}</div>
        <div>Vegetal: {rating.vegetal}</div>
        <div>Nutty: {rating.nutty}</div>
        <div>Roasted: {rating.roasted}</div>
      </div>
    </div>
  );
};

// Component for rating a tea
const TeaRatingCard: React.FC<{ 
  tea: TeaWithDisplay; 
  userId: number; 
  editingRating?: RatingWithTeaName;
  onComplete: (data: any) => void;
}> = ({ tea, userId, editingRating, onComplete }) => {
  const [formData, setFormData] = useState({
    umami: editingRating?.umami || 5,
    astringency: editingRating?.astringency || 5,
    floral: editingRating?.floral || 5,
    vegetal: editingRating?.vegetal || 5,
    nutty: editingRating?.nutty || 5,
    roasted: editingRating?.roasted || 5,
    body: editingRating?.body || 5,
    rating: editingRating?.rating || 5
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingRating) {
        // Edit existing rating
        const { editRating } = await import('../services/api');
        const ratingData = {
          user_id: userId,
          tea_id: tea.id,
          tasting_id: editingRating.tasting_id || 0, // Preserve existing tasting or use default
          ...formData
        };
        await editRating(editingRating.id, ratingData);
        onComplete(ratingData);
      } else {
        // Create new rating
        const { submitRating } = await import('../services/api');
        const ratingData = {
          user_id: userId,
          tea_id: tea.id,
          tasting_id: 0, // Backend will assign default tasting
          ...formData
        };
        await submitRating(ratingData);
        onComplete(ratingData);
      }
    } catch (error) {
      console.error('Error submitting rating:', error);
    }
  };

  const handleChange = (field: string, value: number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const RatingSlider: React.FC<{ 
    label: string; 
    field: string; 
    value: number; 
  }> = ({ label, field, value }) => (
    <div style={{ marginBottom: '1rem' }}>
      <label style={{ 
        display: 'block', 
        marginBottom: '0.5rem', 
        fontWeight: 'bold',
        color: '#4a5568'
      }}>
        {label}: {value}
      </label>
      <input
        type="range"
        min="1"
        max="10"
        value={value}
        onChange={(e) => handleChange(field, Number(e.target.value))}
        style={{
          width: '100%',
          height: '6px',
          borderRadius: '3px',
          background: '#e2e8f0',
          outline: 'none',
          cursor: 'pointer'
        }}
      />
    </div>
  );

  return (
    <div style={{
      backgroundColor: 'white',
      border: '1px solid #e2e8f0',
      borderRadius: '12px',
      padding: '2rem',
      maxWidth: '500px',
      margin: '0 auto'
    }}>
      <h2 style={{ 
        textAlign: 'center', 
        marginBottom: '2rem',
        color: '#2d3748'
      }}>
        Rate {tea.display}
      </h2>
      
      <form onSubmit={handleSubmit}>
        <RatingSlider label="Overall Rating" field="rating" value={formData.rating} />
        <RatingSlider label="Umami" field="umami" value={formData.umami} />
        <RatingSlider label="Astringency" field="astringency" value={formData.astringency} />
        <RatingSlider label="Floral" field="floral" value={formData.floral} />
        <RatingSlider label="Vegetal" field="vegetal" value={formData.vegetal} />
        <RatingSlider label="Nutty" field="nutty" value={formData.nutty} />
        <RatingSlider label="Roasted" field="roasted" value={formData.roasted} />
        <RatingSlider label="Body" field="body" value={formData.body} />
        
        <button
          type="submit"
          style={{
            width: '100%',
            backgroundColor: '#48bb78',
            color: 'white',
            border: 'none',
            padding: '1rem',
            borderRadius: '8px',
            fontSize: '1.1rem',
            fontWeight: 'bold',
            cursor: 'pointer',
            marginTop: '1rem'
          }}
        >
          {editingRating ? 'Update Rating' : 'Submit Rating'}
        </button>
      </form>
    </div>
  );
};

export default Home;
