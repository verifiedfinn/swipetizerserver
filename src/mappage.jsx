import React, { useState } from "react";
import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";
import { Link } from "react-router-dom";
import "./styles.css";

const containerStyle = {
  width: "100%",
  height: "500px",
};

const center = {
  lat: 53.3498, // Default center (Dublin)
  lng: -6.2603,
};

const MapPage = () => {
  const [selectedLocation, setSelectedLocation] = useState(null);

  const handleMapClick = (event) => {
    setSelectedLocation({
      lat: event.latLng.lat(),
      lng: event.latLng.lng(),
    });
  };

  return (
    <div className="map-page">
      <h1>Location Selection</h1>
      <LoadScript googleMapsApiKey="YOUR_GOOGLE_MAPS_API_KEY">
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={center}
          zoom={14}
          onClick={handleMapClick}
        >
          {selectedLocation && <Marker position={selectedLocation} />}
        </GoogleMap>
      </LoadScript>
      
      {/* ✅ Button to Go Back */}
      <div className="back-button">
        <Link to="/">⬅ Go Back</Link>
      </div>
    </div>
  );
};

export default MapPage;
