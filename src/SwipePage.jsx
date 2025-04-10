import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const SwipePage = () => {
  const navigate = useNavigate();

  const [restaurants, setRestaurants] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Total people in the session (hardcoded)
  const participantsCount = 4;

  useEffect(() => {
    // Load mock restaurant data when page loads
    const mockRestaurants = [
      { id: 1, name: 'restaurant1', image: 'https://via.placeholder.com/300', price: '$$' },
      { id: 2, name: 'restaurant2', image: 'https://via.placeholder.com/300', price: '$$$' },
      { id: 3, name: 'restaurant3', image: 'https://via.placeholder.com/300', price: '$' },
      { id: 4, name: 'restaurant4', image: 'https://via.placeholder.com/300', price: '$$' },
      { id: 5, name: 'restaurant5', image: 'https://via.placeholder.com/300', price: '$$' },
      { id: 6, name: 'restaurant6', image: 'https://via.placeholder.com/300', price: '$' },
    ];
    setRestaurants(mockRestaurants);
  }, []);

// Handle swipe action
const handleSwipe = (isRightSwipe) => {
    const current = restaurants[currentIndex];

    if (isRightSwipe) {
      console.log(`User liked: ${current.name}`);

      // Math logic: if over 50% liked it (simulate swipeRightCount)
      const mockSwipeRightCount = Math.ceil(participantsCount / 2); // just simulate >= 50%

      if (mockSwipeRightCount >= participantsCount / 2) {
        // Jump to match page
        navigate('/match', { state: { restaurant: current } });
        return;
      }
    }

    // Go to next card
    setCurrentIndex((prev) => prev + 1);
  };

  // When all cards are shown
  if (currentIndex >= restaurants.length) {
    return <h2 style={{ textAlign: 'center' }}>No more restaurants!</h2>;
  }

  const current = restaurants[currentIndex];

  return (
    <div className="swipe-page">
      <h2>Swipe on Restaurants</h2>

      {/* Show restaurant info */}
      <div className="restaurant-card">
        <img src={current.image} alt={current.name} />
        <h3>{current.name}</h3>
        <p>{current.price}</p>
      </div>

      {/* swipe function implent here */}
      {/* react-tinder-card */}

      {/* buttons*/}
      <div className="button-group">
        <button onClick={() => handleSwipe(false)}>❌ Skip</button>
        <button onClick={() => handleSwipe(true)}>❤️ Like</button>
      </div>
    </div>
  );
};

export default SwipePage;
