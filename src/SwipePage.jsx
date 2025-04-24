import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";

const SwipePage = () => {
  const [cards, setCards] = useState([]);
  const [swipeDirection, setSwipeDirection] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1000);
    fetch("/localdata.json")
      .then((response) => {
        if (!response.ok) throw new Error("Failed to fetch data");
        return response.json();
      })    
      .then((data) => setCards(data.reverse()))
      .catch((error) => console.error("Error loading data:", error));
    return () => clearTimeout(timer);
  }, []);

  const handleSwipe = (direction, index) => {
    setSwipeDirection(direction);
    setTimeout(() => {
      setCards((prevCards) => prevCards.filter((_, i) => i !== index));
      setSwipeDirection(null);
      

      if (direction === "right") {
        if (cards.length === 1) {
          navigate('/match', { state: { restaurant: cards[index] } });
        }
      }
    }, 300);
  };

  const handleButtonSwipe = (isLike) => {
    if (cards.length === 0) return;
    handleSwipe(isLike ? "right" : "left", cards.length - 1);
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
                className={`card-ui`}
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
                  opacity: 0,
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
                  backgroundRepeat: 'no-repeat',
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

      {/* Button group for manual swiping */}
      <div className="swipe-button-group">
        <button 

          onClick={() => handleButtonSwipe(false)}
        >
          ❌ Skip
        </button>
        <button 

          onClick={() => handleButtonSwipe(true)}
        >
          ❤️ Like
        </button>
      </div>
    </div>
  );
};

export default SwipePage;