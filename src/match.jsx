import React from "react";
import { motion } from "framer-motion";
import { FaPhone, FaMapMarkerAlt, FaEllipsisH } from "react-icons/fa";
import "./styles.css";

const MatchPage = ({ restaurant }) => {
  return (
    <div className="match-page" style={{ backgroundImage: `url(${restaurant?.image || "https://via.placeholder.com/800"})` }}>
      {/* Text Animation */}
      <motion.h1
        className="match-text"
        initial={{ scale: 3, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 100, damping: 15 }}
      >
        IT'S A MATCH!
      </motion.h1>

      {/* Restaurant Info */}
      <div className="info-section">
        <h2>{restaurant?.name || "Restaurant Name"}</h2>
        <p>{restaurant?.price || "Price Range"}</p>

        {/* Buttons Section */}
        <div className="button-group">
          <button className="button">
            <FaPhone />
          </button>
          <button className="button">
            <FaMapMarkerAlt />
          </button>
          <button className="button">
            <FaEllipsisH />
          </button>
        </div>
      </div>
    </div>
  );
};

export default MatchPage;