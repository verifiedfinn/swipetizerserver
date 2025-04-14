import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BrowserRouter as Router, Routes, Route, Link, useLocation, useNavigate } from "react-router-dom";
import MapPage from "./mappage.jsx";
import Login from './login.jsx'; 
import Register from './register.jsx';
import StartScreen from './startscreen.jsx';
import SessionChoice from './sessionchoice.jsx';
import FilterPage from './filterpage.jsx';
import WaitingRoom from './WaitingRoom.jsx';

import "./styles.css";
import SwipePage from './SwipePage.jsx';

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

  //This is no longer needed 
  // const getCardColor = (index) => {
  //   const colorClasses = ["orange", "red", "green", "brown", "cheese-orange"];
  //   if (index === 0 || index === cards.length - 1) return "orange";
  //   return colorClasses[index % colorClasses.length];
  // };

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
        <Route path="/swipe" element={<SwipePage />} />
        <Route path="/waitingroom" element={<WaitingRoom />} />
        <Route path="/home" element={
          sessionCode ? (
            <>
              <h1>Swipe Deck</h1>
              <h2>Session code: {sessionCode}</h2>
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
        className={`card-ui`}
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
        {/* <img className="card-img" src={card.image} alt={card.name} />
        <div className="card-body">
          <h2>{card.name}</h2>
          <p className="tag city">{card.City}</p>
          <p className="tag cuisine">{card["cuisine style"].join(", ")}</p>
          <p className="tag price">{card["price range"]}</p>
          <p className="tag rating">⭐ {card.rating}</p>
        </div> */}


        {/* <div className="card-body">
    <h2>{card.name}</h2>
    <p className="tag city">{card.city}</p>
    <p className="tag cuisine">{card["cuisine style"].join(", ")}</p>
    <p className="tag price">{card["price range"]}</p>
    <p className="tag rating">⭐ {card.rating}</p>
  </div> */}

   <div className="card-body">
    <div className="top-row">
      <h2>{card.name}</h2>
      <p className="tag price">{card["price range"]}</p>
    </div>
    <div className="bottom-row">
      <p className="tag rating">⭐ {card.rating}</p>
      <p className="tag cuisine">{card["cuisine style"].join(", ")}</p>
    </div>
    </div>

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
