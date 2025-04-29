import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FaPhone, FaMapMarkerAlt, FaEllipsisH } from "react-icons/fa";
import confetti from "canvas-confetti";
import "./styles.css";

const MatchPage = ({ restaurant }) => {
  const navigate = useNavigate();

  useEffect(() => {
    confetti({
      particleCount: 200,
      spread: 100,
      origin: { y: 0.6 },
    });
  }, []);

  // Force redirect back to session choice on browser back
  useEffect(() => {
    const handlePopState = () => {
      navigate("/session-choice", { replace: true });
    };

    window.history.pushState(null, "", window.location.pathname);
    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [navigate]);

  const openMap = (address) => {
    const encodedAddress = encodeURIComponent(address);
    const url = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;
    window.open(url, "_blank");
  };

  // Full match criteria and internal applied style with buttons 
  return (
    <div
      className="match-page-wrapper"
      style={{
        background: "radial-gradient(circle at center, rgba(0,0,0,0.7), rgba(0,0,0,0.95))",
        position: "fixed",
        top: 0,
        left: 0,
        height: "100vh",
        width: "100vw",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "1rem",
        overflow: "hidden",
        zIndex: 0
      }}
    >
      <motion.div
        className="card-ui match-card"
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 100, damping: 14 }}
        style={{
          backgroundImage: `linear-gradient(
            to top,
            rgba(0, 0, 0, 0.6) 0%,
            rgba(0, 0, 0, 0.4) 30%,
            rgba(0, 0, 0, 0.0) 50%
          ), url(${restaurant?.image})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat"
        }}
      >
        <div className="card-body">
          <motion.h1
            className="match-header"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: [1.1, 1.05, 1], opacity: 1 }}
            transition={{ duration: 1, ease: "easeInOut" }}
          >
            💘 It's a Match!
            <span className="white-sheen" />
          </motion.h1>

          <h2 className="restaurant-title">{restaurant?.name}</h2>
          <p className="tag price">{restaurant?.["price range"]}</p>
          <p className="tag cuisine">
            {Array.isArray(restaurant?.["cuisine style"])
              ? restaurant["cuisine style"].join(", ")
              : ""}
          </p>

          <div className="button-group">
            <a href={`tel:${restaurant?.phone}`}>
              <button className="button pretty-button">
                <FaPhone />
              </button>
            </a>
            <button
              className="button pretty-button"
              onClick={() => openMap(restaurant?.address)}
            >
              <FaMapMarkerAlt />
            </button>
            <button
              className="button pretty-button"
              onClick={() => navigate("/session-choice")}
            >
              <FaEllipsisH />
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default MatchPage;