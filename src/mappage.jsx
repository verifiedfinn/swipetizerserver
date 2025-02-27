import React, { useState, useRef, useEffect } from "react";
import mapboxgl from "mapbox-gl";
import MapboxGeocoder from "@mapbox/mapbox-gl-geocoder";
import { Link } from "react-router-dom";
import "mapbox-gl/dist/mapbox-gl.css";
import "@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css";
import "./styles.css";

// MAPBOX TOKEN
mapboxgl.accessToken = "pk.eyJ1IjoidmVyaWZpZWRmaW5uIiwiYSI6ImNtN21tdWQ2ZjBqcm8ycnIwNXFwN2Z4bGcifQ.BckuIZ-IAbwTNq6oaIunGg";

const MapPage = () => {
  const mapContainerRef = useRef(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const markerRef = useRef(null);

  useEffect(() => {
    const mapInstance = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/streets-v11",
      center: [-6.2603, 53.3498], // Default: Dublin
      zoom: 14,
    });

    const geocoder = new MapboxGeocoder({
      accessToken: mapboxgl.accessToken,
      mapboxgl: mapboxgl,
      marker: false, // We'll add our own marker
    });

    // Add search bar to the top of the map
    mapInstance.addControl(geocoder, "top-left");

    // Handle search result selection
    geocoder.on("result", (event) => {
      const { center } = event.result;
      const [lng, lat] = center;

      setSelectedLocation({ lng, lat });

      // Remove previous marker if exists
      if (markerRef.current) {
        markerRef.current.remove();
      }

      // Add new marker at selected location
      markerRef.current = new mapboxgl.Marker().setLngLat([lng, lat]).addTo(mapInstance);

      // Move map to selected location
      mapInstance.flyTo({ center: [lng, lat], zoom: 14 });
    });

    // Handle manual map click selection
    mapInstance.on("click", (event) => {
      const { lng, lat } = event.lngLat;
      setSelectedLocation({ lng, lat });

      if (markerRef.current) {
        markerRef.current.remove();
      }

      markerRef.current = new mapboxgl.Marker().setLngLat([lng, lat]).addTo(mapInstance);
    });

    return () => mapInstance.remove();
  }, []);

  return (
    <div className="map-page">
      <h1>Location Selection</h1>

      {/* Map */}
      <div ref={mapContainerRef} style={{ width: "100%", height: "500px", position: "relative" }}></div>

      {/* Selected Location Info */}
      {selectedLocation && (
        <p>Selected Location: {selectedLocation.lat}, {selectedLocation.lng}</p>
      )}

      {/* Back Button */}
      <div className="back-button">
        <Link to="/">⬅ Go Back</Link>
      </div>
    </div>
  );
};

export default MapPage;
