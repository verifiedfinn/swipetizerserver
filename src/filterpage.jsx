import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Slider from '@mui/material/Slider';
import Typography from '@mui/material/Typography';
import Axios from 'axios';
import BackButton from './components/BackButton';

const FilterPage = () => {
  const [distance, setDistance] = useState(5);
  const [priceRange, setPriceRange] = useState([2, 3]);
  const [ratingRange, setRatingRange] = useState([3, 5]);
  const [dietaryRestrictions, setDietaryRestrictions] = useState([]);
  const [cuisinePreferences, setCuisinePreferences] = useState([]);
  const [sessionCode, setSessionCode] = useState('');
  const navigate = useNavigate();

  const handleCheckboxChange = (setter, value) => {
    setter(prev =>
      prev.includes(value) ? prev.filter(item => item !== value) : [...prev, value]
    );
  };

  const handleCreateSession = () => {
    const preferences = {
      distance,
      priceRange,
      ratingRange,
      dietaryRestrictions,
      cuisinePreferences,
    };

    const session_token = Math.random().toString(36).substring(2, 8).toUpperCase();

    Axios.post('http://localhost:3001/create-session', {
      user_id: localStorage.getItem('userId') || sessionStorage.getItem('userId'),
      session_token,
      preferences,
    })
      .then(() => {
        setSessionCode(session_token);
        navigate(`/waiting-room?code=${session_token}`, {
          state: { preferences } // ✅ This line is fixed
        });
      })
      .catch((error) => {
        console.error('❌ Error creating session:', error);
      });
  };

  return (
    <div className="filter-page" style={{ position: 'relative', padding: '40px 30px 30px 30px' }}>
      <BackButton />

      <h1 style={{ textAlign: 'center', marginBottom: '30px' }}>SESSION PREFERENCES</h1>

      {sessionCode && (
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <h3>Session Code</h3>
          <div style={{ fontSize: '24px', fontWeight: 'bold', letterSpacing: '2px' }}>
            {sessionCode}
          </div>
        </div>
      )}

      <div className="section">
        <Typography gutterBottom>Maximum Distance: {distance} km</Typography>
        <Slider
          value={distance}
          onChange={(e, value) => setDistance(value)}
          min={1}
          max={10}
          valueLabelDisplay="auto"
          sx={{ color: '#f37474' }}
        />
      </div>

      <div className="section">
        <Typography gutterBottom>
          Price Range: {['€', '€€', '€€€', '€€€€', '€€€€€'].slice(priceRange[0] - 1, priceRange[1]).join(' - ')}
        </Typography>
        <Slider
          value={priceRange}
          onChange={(e, value) => setPriceRange(value)}
          valueLabelDisplay="auto"
          step={1}
          min={1}
          max={5}
          sx={{ color: '#f37474' }}
        />
      </div>

      <div className="section">
        <Typography gutterBottom>
          Rating Range: {['★', '★★', '★★★', '★★★★', '★★★★★'].slice(ratingRange[0] - 1, ratingRange[1]).join(' - ')}
        </Typography>
        <Slider
          value={ratingRange}
          onChange={(e, value) => setRatingRange(value)}
          valueLabelDisplay="auto"
          step={1}
          min={1}
          max={5}
          sx={{ color: '#f37474' }}
        />
      </div>

      <div className="section" style={{ display: 'flex', justifyContent: 'space-between' }}>
        <div style={{ width: '45%' }}>
          <h3>Dietary Restrictions</h3>
          {['Vegetarian', 'Vegan', 'Gluten-Free', 'Fast-Casual'].map((r) => (
            <label key={r}>
              <input
                type="checkbox"
                checked={dietaryRestrictions.includes(r)}
                onChange={() => handleCheckboxChange(setDietaryRestrictions, r)}
              />{' '}
              {r}
            </label>
          ))}
        </div>
        <div style={{ borderLeft: '2px solid', height: '200px', marginTop: '10px' }}></div>
        <div style={{ width: '45%' }}>
          <h3>Cuisine Preferences</h3>
          {['Italian', 'Japanese', 'Mexican', 'Pub fare, potatoes and pints'].map((c) => (
            <label key={c}>
              <input
                type="checkbox"
                checked={cuisinePreferences.includes(c)}
                onChange={() => handleCheckboxChange(setCuisinePreferences, c)}
              />{' '}
              {c}
            </label>
          ))}
        </div>
      </div>

      <button className="create-session-btn" onClick={handleCreateSession}>
        Create New Session
      </button>
    </div>
  );
};

export default FilterPage;
