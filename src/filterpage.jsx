import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Nouislider from 'nouislider-react';
import 'nouislider/dist/nouislider.css';
import Axios from 'axios';

const FilterPage = () => {
  const [distance, setDistance] = useState(5);
  const [priceRange, setPriceRange] = useState([2, 3]);
  const [ratingRange, setRatingRange] = useState([3, 5]);
  const [dietaryRestrictions, setDietaryRestrictions] = useState([]);
  const [cuisinePreferences, setCuisinePreferences] = useState([]);
  const [sessionCode, setSessionCode] = useState('');
  const navigate = useNavigate();

  const handleCheckboxChange = (setter, value) => {
    setter((prev) =>
      prev.includes(value)
        ? prev.filter((item) => item !== value)
        : [...prev, value]
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

    Axios.post('http://localhost:3001/create-session', {
      user_id: 1, // Replace with actual user ID if logged in
      preferences,
    })
      .then((response) => {
        const { session_token } = response.data;
        setSessionCode(session_token);
        navigate('/slide-deck', { state: { sessionCode: session_token } });
      })
      .catch((error) => {
        console.error('❌ Error creating session:', error);
      });
  };

  return (
    <div className="filter-page">
      {/* === SESSION CODE UI === */}
      {sessionCode && (
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <h3>Session Code</h3>
          <div
            style={{
              fontSize: '24px',
              fontWeight: 'bold',
              letterSpacing: '2px',
            }}
          >
            {sessionCode}
          </div>
        </div>
      )}

      <h1>SESSION PREFERENCES</h1>

      <div className="section">
        <span className="label">Maximum Distance</span>
        <span className="value">{distance} km</span>
        <Nouislider
          range={{ min: 1, max: 10 }}
          start={[distance]}
          step={1}
          tooltips
          onSlide={(values) => setDistance(Math.round(values[0]))}
        />
      </div>
      <hr />

      <div className="section">
        <span className="label">Price Range</span>
        <span className="value">
          {['€', '€€', '€€€', '€€€€', '€€€€€']
            .slice(priceRange[0] - 1, priceRange[1])
            .join(' - ')}
        </span>
        <Nouislider
          range={{ min: 1, max: 5 }}
          start={priceRange}
          step={1}
          tooltips
          connect
          onSlide={(values) => setPriceRange(values.map(Number))}
        />
      </div>
      <hr />

      <div className="section">
        <span className="label">Ratings Range</span>
        <span className="value">
          {['*', '**', '***', '****', '*****']
            .slice(ratingRange[0] - 1, ratingRange[1])
            .join(' - ')}
        </span>
        <Nouislider
          range={{ min: 1, max: 5 }}
          start={ratingRange}
          step={1}
          tooltips
          connect
          onSlide={(values) => setRatingRange(values.map(Number))}
        />
      </div>
      <hr />

      <div className="section">
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <div style={{ width: '45%' }}>
            <h3>Dietary Restrictions</h3>
            {['Vegetarian', 'Vegan', 'Gluten-Free', 'Fast-Casual'].map(
              (restriction) => (
                <label key={restriction}>
                  <input
                    type="checkbox"
                    checked={dietaryRestrictions.includes(restriction)}
                    onChange={() =>
                      handleCheckboxChange(setDietaryRestrictions, restriction)
                    }
                  />{' '}
                  {restriction}
                </label>
              )
            )}
          </div>

          <div
            style={{
              borderLeft: '2px solid',
              height: '200px',
              marginTop: '10px',
            }}
          ></div>

          <div style={{ width: '45%' }}>
            <h3>Cuisine Preferences</h3>
            {['Italian', 'Japanese', 'Mexican', 'Pub fare, potatoes and pints'].map(
              (cuisine) => (
                <label key={cuisine}>
                  <input
                    type="checkbox"
                    checked={cuisinePreferences.includes(cuisine)}
                    onChange={() =>
                      handleCheckboxChange(setCuisinePreferences, cuisine)
                    }
                  />{' '}
                  {cuisine}
                </label>
              )
            )}
          </div>
        </div>
      </div>

      <button className="create-session-btn" onClick={handleCreateSession}>
        Create New Session
      </button>
    </div>
  );
};

export default FilterPage;
