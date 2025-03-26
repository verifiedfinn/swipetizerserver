import React, { useState } from 'react';
import Nouislider from 'nouislider-react';
import 'nouislider/distribute/nouislider.css';

const FilterPage = () => {
  const [distance, setDistance] = useState(5);
  const [priceRange, setPriceRange] = useState([2, 3]);
  const [ratingRange, setRatingRange] = useState([3, 5]);
  const [dietaryRestrictions, setDietaryRestrictions] = useState([]);
  const [cuisinePreferences, setCuisinePreferences] = useState([]);

  const handleCheckboxChange = (setter, value) => {
    setter((prev) =>
      prev.includes(value)
        ? prev.filter((item) => item !== value)
        : [...prev, value]
    );
  };

  const handleCreateSession = () => {
    const sessionData = {
      distance,
      priceRange,
      ratingRange,
      dietaryRestrictions,
      cuisinePreferences,
    };

    // Send sessionData to your backend to store in MySQL
    fetch('/api/create-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(sessionData),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log('Session created:', data);
        // Handle post-creation logic here
      })
      .catch((error) => {
        console.error('Error creating session:', error);
      });
  };

  return (
    <div className="filter-page">
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