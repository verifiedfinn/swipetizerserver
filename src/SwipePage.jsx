import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { io } from 'socket.io-client';

const socket = io('http://localhost:3001'); // adjust for prod

const SwipePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const sessionCode = new URLSearchParams(location.search).get('code'); // get ?code=XYZ from URL

  const [restaurants, setRestaurants] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem('userId') || sessionStorage.getItem('userId');
    setUserId(stored || `guest-${socket.id}`);
  }, []);

  useEffect(() => {
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

  // ✅ Listen for matchFound event
  useEffect(() => {
    socket.on('matchFound', ({ restaurantId, users }) => {
      const match = restaurants.find(r => r.id === restaurantId);
      if (match) {
        console.log('🎉 MATCH FOUND:', match.name);
        navigate('/match', { state: { restaurant: match, users } });
      }
    });

    return () => socket.off('matchFound');
  }, [restaurants, navigate]);

  // ✅ Emit swipes
  const handleSwipe = (isRightSwipe) => {
    const current = restaurants[currentIndex];
    if (!current || !sessionCode || !userId) return;

    if (isRightSwipe) {
      socket.emit('swipe', {
        sessionCode,
        userId,
        restaurantId: current.id,
        direction: 'right'
      });
    }

    // move to next card
    setCurrentIndex((prev) => prev + 1);
  };

  if (currentIndex >= restaurants.length) {
    return <h2 style={{ textAlign: 'center' }}>No more restaurants!</h2>;
  }

  const current = restaurants[currentIndex];

  return (
    <div className="swipe-page">
      <h2>Swipe on Restaurants</h2>

      <div className="restaurant-card">
        <img src={current.image} alt={current.name} />
        <h3>{current.name}</h3>
        <p>{current.price}</p>
      </div>

      <div className="button-group">
        <button onClick={() => handleSwipe(false)}>❌ Skip</button>
        <button onClick={() => handleSwipe(true)}>❤️ Like</button>
      </div>
    </div>
  );
};

export default SwipePage;
