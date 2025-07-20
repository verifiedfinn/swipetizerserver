import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';

// Distance calculator
const getDistanceInKm = (lat1, lon1, lat2, lon2) => {
  const toRad = (value) => (value * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) ** 2;
  return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
};

const SwipePage = () => {
  const fullCardsRef = useRef([]);
  const [cards, setCards] = useState([]);
  const [swipeDirection, setSwipeDirection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showInstruction, setShowInstruction] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  const preferences = location.state?.preferences || {
    cuisinePreferences: [],
    dietaryRestrictions: [],
    priceRange: [1, 5],
    ratingRange: [1, 5]
  };

  const filterRestaurants = (data, prefs) => {
    const prefsCuisine = (prefs.cuisinePreferences || []).map(c => c.toLowerCase());
    const prefsDiet = (prefs.dietaryRestrictions || []).map(d => d.toLowerCase());
    const prefsPrice = prefs.priceRange || [1, 5];
    const prefsRating = prefs.ratingRange || [1, 5];
    const maxDistance = prefs.distance || 10;
    const center = prefs.selectedLocation;

    return data.filter((restaurant) => {
      const cuisines = Array.isArray(restaurant["cuisine style"])
        ? restaurant["cuisine style"].map(c => c.toLowerCase())
        : [];

      const priceStr = restaurant["price range"] || "";
      const priceLevel = (priceStr.match(/[$€]+/g)?.[0]?.length || 1);
      const rating = parseFloat(restaurant.rating) || 0;

      let matchDistance = true;
      if (center && restaurant.lat && restaurant.lng) {
        const dist = getDistanceInKm(center.lat, center.lng, parseFloat(restaurant.lat), parseFloat(restaurant.lng));
        matchDistance = dist <= maxDistance;
      }

      return (
        (prefsCuisine.length === 0 || prefsCuisine.some(pref => cuisines.includes(pref))) &&
        (prefsDiet.length === 0 || prefsDiet.some(diet => cuisines.includes(diet))) &&
        priceLevel >= prefsPrice[0] && priceLevel <= prefsPrice[1] &&
        rating >= prefsRating[0] && rating <= prefsRating[1] &&
        matchDistance
      );
    });
  };

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1000);
    fetch("/localdata.json")
      .then(res => res.json())
      .then(data => {
        const filtered = filterRestaurants(data, preferences);
        setCards(filtered);
        fullCardsRef.current = filtered;
      })
      .catch(err => console.error("❌ Failed to load cards:", err));

    return () => clearTimeout(timer);
  }, []);

  const handleSwipe = (direction) => {
    const topCard = cards[0];
    if (!topCard) return;

    setSwipeDirection(direction);

    setTimeout(() => {
      setCards(prev => prev.slice(1)); // remove top card
      setSwipeDirection(null);

      if (direction === "right") {
        navigate('/match', { state: { restaurant: topCard } });
      }
    }, 300);
  };

  const handleButtonSwipe = (isLike) => {
    handleSwipe(isLike ? "right" : "left");
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      const tag = e.target.tagName.toLowerCase();
      if (tag === 'input' || tag === 'textarea') return;

      if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleButtonSwipe(true);
      }
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handleButtonSwipe(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown, { passive: false });
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  if (loading) {
    return (
      <div className="loading-page">
        <div className="loader"></div>
        <h2>Loading...</h2>
      </div>
    );
  }

  if (!cards.length) {
    return <h2 style={{ textAlign: 'center' }}>No more restaurants found based on preferences.</h2>;
  }

  return (
    <div className="swipe-page">
      {showInstruction && (
        <motion.div
          className="instruction-text"
          initial={{ opacity: 1 }}
          animate={{ opacity: 0 }}
          exit={{ opacity: 0 }}
          transition={{ delay: 10, duration: 5 }}
        >
          <h2>Click, Drag, or Use Arrows to Swipe</h2>
        </motion.div>
      )}

      {swipeDirection && (
        <motion.div
          className={`action ${swipeDirection}`}
          initial={{ opacity: 1, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1.1 }}
          exit={{ opacity: 0, scale: 0 }}
        >
          {swipeDirection === "right" ? "LIKED" : "DISLIKED"}
        </motion.div>
      )}

      <div className="deck">
        <AnimatePresence>
          {cards.slice(0, 3).map((card, index) => {
            const reverseIndex = 2 - index;
            return (
              <motion.div
                key={card.name}
                className="card-ui"
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.5}
                onDragEnd={(e, info) => {
                  if (info.velocity.x > 0.5 || info.offset.x > 100) {
                    handleSwipe("right");
                  } else if (info.velocity.x < -0.5 || info.offset.x < -100) {
                    handleSwipe("left");
                  }
                }}
                initial={{ scale: 1, y: reverseIndex * 10, zIndex: reverseIndex }}
                animate={{ scale: 1, y: reverseIndex * 10, zIndex: reverseIndex }}
                exit={{
                  x: swipeDirection === "right" ? 700 : -700,
                  rotate: swipeDirection === "right" ? 15 : -15,
                  opacity: 0
                }}
                whileDrag={{ scale: 1.05 }}
                style={{
                  backgroundImage: `linear-gradient(
                    to top,
                    rgba(0, 0, 0, 0.6) 0%,
                    rgba(0, 0, 0, 0.4) 30%,
                    rgba(0, 0, 0, 0.0) 50%
                  ), url(${card.image})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat'
                }}
              >
                <div className="card-body">
                  <div className="top-row">
                    <h2>{card.name}</h2>
                    <p className="tag price">{card["price range"]}</p>
                  </div>
                  <div className="bottom-row">
                    <p className="tag rating">⭐ {card.rating}</p>
                    <p className="tag cuisine">
                      {Array.isArray(card["cuisine style"]) ? card["cuisine style"].join(", ") : ""}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      <div className="swipe-button-group">
        <button onClick={() => handleButtonSwipe(false)}>❌ Skip</button>
        <button onClick={() => handleButtonSwipe(true)}>❤️ Like</button>
      </div>
    </div>
  );
};

export default SwipePage;
