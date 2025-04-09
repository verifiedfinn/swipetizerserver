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
  const mapRef = useRef(null);
  const [loading, setLoading] = useState(true);

  // Use Hook to get user location
  const { userLocation } = useUserLocation(pois);

  // UseEffect for initializing map
  useEffect(() => {
    const mapInstance = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/streets-v11",
      center: [-6.2603, 53.3498], // Default: Dublin
      zoom: 14,
    });

    mapRef.current = mapInstance;

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

  useEffect(() => {
    // Ensure that map updates occur only after userLocation updates
    if (userLocation && mapRef.current && !selectedLocation) {
      setLoading(false); // stop loading
      console.log("Focusing on user location...");
      console.log("User Location:", userLocation);

      mapRef.current.flyTo({
        center: [userLocation.lng, userLocation.lat],
        zoom: 14,
      });

      if (markerRef.current) {
        markerRef.current.remove();
      }

      markerRef.current = new mapboxgl.Marker()
        .setLngLat([userLocation.lng, userLocation.lat])
        .addTo(mapRef.current);
    }
  }, [userLocation, selectedLocation]);  // listen to changes of userLocation selectedLocation

  const focusOnUserLocation = () => {
    console.log("Focusing on user location...");
    if (userLocation && mapRef.current) {
      console.log("User Location:", userLocation);
      mapRef.current.flyTo({
        center: [userLocation.lng, userLocation.lat],
        zoom: 14,
      });

      // remove the marker before
      if (markerRef.current) {
        markerRef.current.remove();
      }

      // create a new marker
      markerRef.current = new mapboxgl.Marker()
        .setLngLat([userLocation.lng, userLocation.lat])
        .addTo(mapRef.current);
    }
  };

  return (
    <div className="map-page">
      <h1>Location Selection</h1>

      {loading && <p>Loading your location...</p>}

      <div ref={mapContainerRef} style={{ width: "100%", height: "500px" }}></div>

      {selectedLocation ? (
        <p>📍 Selected Location: {selectedLocation.lat}, {selectedLocation.lng}</p>
      ) : userLocation ? (
        <p>📍 Your Location: {userLocation.lat}, {userLocation.lng}</p>
      ) : (
        <p>📍 Loading location...</p>
      )}

      <div className="back-button">
        <Link to="/">⬅ Go Back</Link>
      </div>

      <div className="focus-button">
        <button onClick={focusOnUserLocation}>📍 Use My Location</button>
      </div>
    </div>
  );
};

export default MapPage;
