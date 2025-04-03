import React, { useState, useRef, useEffect } from "react";
import mapboxgl from "mapbox-gl";
import MapboxGeocoder from "@mapbox/mapbox-gl-geocoder";
import { Link } from "react-router-dom";
import "mapbox-gl/dist/mapbox-gl.css";
import "@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css";
import "./styles.css";
import useUserLocation from "./hooks/useUserLocation";

mapboxgl.accessToken = "pk.eyJ1IjoidmVyaWZpZWRmaW5uIiwiYSI6ImNtN21tdWQ2ZjBqcm8ycnIwNXFwN2Z4bGcifQ.BckuIZ-IAbwTNq6oaIunGg";

const pois = [
  { name: "Restaurant A", lat: 53.3498, lng: -6.2603 },
  { name: "Coffee Shop B", lat: 53.3456, lng: -6.2678 },
];

const MapPage = () => {
  const mapContainerRef = useRef(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const markerRef = useRef(null);
  
  // Use Hook to get user location and nearest POI
  const { userLocation, nearestPOI } = useUserLocation(pois);

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
      marker: false,
    });

    mapInstance.addControl(geocoder, "top-left");

    geocoder.on("result", (event) => {
      const { center } = event.result;
      const [lng, lat] = center;

      setSelectedLocation({ lng, lat });

      if (markerRef.current) {
        markerRef.current.remove();
      }

      markerRef.current = new mapboxgl.Marker().setLngLat([lng, lat]).addTo(mapInstance);
      mapInstance.flyTo({ center: [lng, lat], zoom: 14 });
    });

    return () => mapInstance.remove();
  }, []);

  return (
    <div className="map-page">
      <h1>Location Selection</h1>

      <div ref={mapContainerRef} style={{ width: "100%", height: "500px" }}></div>

      {userLocation && (
        <p>📍 Your Location: {userLocation.lat}, {userLocation.lng}</p>
      )}

      {nearestPOI && (
        <p>🏠 Nearest POI: {nearestPOI.name} ({nearestPOI.lat}, {nearestPOI.lng})</p>
      )}

      <div className="back-button">
        <Link to="/">⬅ Go Back</Link>
      </div>
    </div>
  );
};

export default MapPage;
