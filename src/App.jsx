import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BrowserRouter as Router, Routes, Route, Link, useLocation, useNavigate } from "react-router-dom";
import MapPage from "./mappage.jsx";
import Login from './login.jsx'; 
import Register from './register.jsx';
import StartScreen from './startscreen.jsx';
import SessionChoice from './sessionchoice.jsx';
import FilterPage from './filterpage.jsx';
import "./styles.css";

function AppContent() {
  const [cards, setCards] = useState([]);
  const [swipeDirection, setSwipeDirection] = useState(null);
  const [sessionCode, setSessionCode] = useState(null); 
  const [loading, setLoading] = useState(true);

  const location = useLocation();
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

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const codeFromUrl = urlParams.get("session");

    if (location.state?.sessionCode) {
      setSessionCode(location.state.sessionCode);
    } else if (codeFromUrl) {
      setSessionCode(codeFromUrl);
    } else if (location.pathname === "/home") {
      navigate("/session-choice");
    }
  }, [location, navigate]);

  const handleSwipe = (direction, index) => {
    setSwipeDirection(direction);
    setTimeout(() => {
      setCards((prevCards) => prevCards.filter((_, i) => i !== index));
      setSwipeDirection(null);
    }, 300);
  };

  const getCardColor = (index) => {
    const colorClasses = ["orange", "red", "green", "brown", "cheese-orange"];
    if (index === 0 || index === cards.length - 1) return "orange";
    return colorClasses[index % colorClasses.length];
  };

  if (loading) {
    return (
      <div className="loading-page">
        <div className="loader"></div>
        <h2>Loading...</h2>
      </div>
    );
  }

  return (
    <div className="App">
      <nav className="navbar">
        <Link to="/home">Swipe Deck</Link>
        <Link to="/map">Location Map</Link>
      </nav>

      <Routes>
        <Route path="/" element={<StartScreen />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/session-choice" element={<SessionChoice />} />
        <Route path="/filter-page" element={<FilterPage />} />

        <Route path="/home" element={
          sessionCode ? (
            <>
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
                  {cards.map((card, index) => (
                    <motion.div
                      key={card.name}
                      className={`card ${getCardColor(index)}`}
                      drag="x"
                      dragConstraints={{ left: 0, right: 0 }}
                      dragElastic={0.5}
                      onDragEnd={(event, info) => {
                        if (info.velocity.x > 0.5 || info.offset.x > 100) {
                          handleSwipe("right", index);
                        } else if (info.velocity.x < -0.5 || info.offset.x < -100) {
                          handleSwipe("left", index);
                        }
                      }}
                      initial={{ scale: 1, y: index * 10, zIndex: cards.length - index }}
                      animate={{ scale: 1, y: index * 10, zIndex: cards.length - index }}
                      exit={{
                        x: swipeDirection === "right" ? 700 : -700,
                        rotate: swipeDirection === "right" ? 25 : -25,
                        opacity: 0,
                      }}
                      whileDrag={{ scale: 1.1 }}
                    >
                      <h2>{card.name}</h2>
                      <p>City: {card.city}</p>
                      <p>Cuisine: {card["cuisine style"].join(", ")}</p>
                      <p>Rating: {card.rating}</p>
                      <p>Price: {card["price range"]}</p>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </>
          ) : null
        } />

        <Route path="/map" element={<MapPage />} />
      </Routes>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}
