import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import socket from './socket';

const SwipePage = () => {
  const fullCardsRef = useRef([]);
  const [cards, setCards] = useState([]);
  const [swipeDirection, setSwipeDirection] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  const sessionCode = new URLSearchParams(location.search).get("code");

  const preferences = location.state?.preferences || {
    cuisinePreferences: [],
    dietaryRestrictions: [],
    priceRange: [1, 5],
    ratingRange: [1, 5],
  };

  console.log("🧪 Test preferences used:", preferences);

  const filterRestaurants = (data, prefs = {}) => {
    const prefsCuisine = (prefs.cuisinePreferences || []).map(c => c.toLowerCase());
    const prefsDiet = (prefs.dietaryRestrictions || []).map(d => d.toLowerCase());
    const prefsPrice = prefs.priceRange || [1, 5];
    const prefsRating = prefs.ratingRange || [1, 5];

    return data.filter((restaurant) => {
      const name = restaurant.name;
      const cuisines = Array.isArray(restaurant["cuisine style"])
        ? restaurant["cuisine style"].map(c => c.toLowerCase())
        : [];

      const priceStr = restaurant["price range"] || "";
      const firstSymbolMatch = priceStr.match(/[$€]+/g);
      const priceLevel = firstSymbolMatch ? firstSymbolMatch[0].length : 1;

      const rating = parseFloat(restaurant.rating) || 0;

      const matchCuisine =
        prefsCuisine.length === 0 ||
        prefsCuisine.some(pref => cuisines.includes(pref));

      const matchDiet =
        prefsDiet.length === 0 ||
        prefsDiet.some(diet => cuisines.includes(diet));

      const matchPrice = priceLevel >= prefsPrice[0] && priceLevel <= prefsPrice[1];
      const matchRating = rating >= prefsRating[0] && rating <= prefsRating[1];

      const shouldInclude = matchCuisine && matchDiet && matchPrice && matchRating;

      // 🧠 Debug Log
      console.log(`[FILTERING] ${name}`);
      console.log("  cuisines:", cuisines);
      console.log("  matchCuisine:", matchCuisine);
      console.log("  matchDiet:", matchDiet);
      console.log("  priceLevel:", priceLevel, "matchPrice:", matchPrice);
      console.log("  rating:", rating, "matchRating:", matchRating);
      console.log("  ✅ Included:", shouldInclude);
      console.log(" ");

      return shouldInclude;
    });
  };

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1000);

    fetch("/localdata.json")
      .then(res => res.json())
      .then(data => {
        const filtered = filterRestaurants(data, preferences);
        console.log("✅ Filtered Results:", filtered.map(r => r.name));
        setCards(filtered.reverse());
        fullCardsRef.current = filtered;
      })
      .catch(err => console.error("❌ Failed to load cards:", err));

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const userId = localStorage.getItem("userId") || `guest-${socket.id}`;
    const username = localStorage.getItem("username") || `Guest ${Math.floor(Math.random() * 1000)}`;

    socket.emit("joinRoom", {
      sessionCode,
      user: { id: userId, username, isCreator: false }
    });

    return () => {
      socket.emit("leave-session", sessionCode);
    };
  }, [sessionCode]);

  useEffect(() => {
    const handleMatch = (data) => {
      const matchedRestaurant = fullCardsRef.current.find(
        r => Number(r.id) === Number(data.restaurantId)
      );

      if (matchedRestaurant) {
        navigate('/match', { state: { restaurant: matchedRestaurant } });
      } else {
        console.warn("⚠️ Matched restaurant not found:", data.restaurantId);
      }
    };

    socket.on("matchFound", handleMatch);
    return () => socket.off("matchFound", handleMatch);
  }, [navigate]);

  const handleSwipe = (direction, index) => {
    const swipedCard = cards[index];
    setSwipeDirection(direction);

    setTimeout(() => {
      setCards(prev => prev.filter((_, i) => i !== index));
      setSwipeDirection(null);

      if (direction === "right" && swipedCard) {
        const userId = localStorage.getItem("userId") || `guest-${socket.id}`;
        socket.emit("swipe", {
          sessionCode,
          restaurantId: swipedCard.id,
          userId,
          direction: "right"
        });
      }
    }, 300);
  };

  const handleButtonSwipe = (isLike) => {
    if (cards.length === 0) return;
    const topCardIndex = cards.length - 1;
    handleSwipe(isLike ? "right" : "left", topCardIndex);
  };

  if (loading) {
    return (
      <div className="loading-page">
        <div className="loader"></div>
        <h2>Loading...</h2>
      </div>
    );
  }

  if (cards.length === 0) {
    return <h2 style={{ textAlign: 'center' }}>No more restaurants!</h2>;
  }

  return (
    <div className="swipe-page">
      <h1>Swipe Deck</h1>

      {swipeDirection && (
        <motion.div
          className={`action ${swipeDirection}`}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1.1 }}
          exit={{ opacity: 0, scale: 0 }}
        >
          {swipeDirection === "right" ? "LIKED" : "DISLIKED"}
        </motion.div>
      )}

      <div className="deck">
        <AnimatePresence>
          {cards.slice(-3).map((card, index) => {
            const actualIndex = cards.length - 3 + index;
            return (
              <motion.div
                key={card.name}
                className="card-ui"
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.5}
                onDragEnd={(event, info) => {
                  if (info.velocity.x > 0.5 || info.offset.x > 100) {
                    handleSwipe("right", actualIndex);
                  } else if (info.velocity.x < -0.5 || info.offset.x < -100) {
                    handleSwipe("left", actualIndex);
                  }
                }}
                initial={{ scale: 1, y: index * 10, zIndex: index }}
                animate={{ scale: 1, y: index * 10, zIndex: index }}
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
