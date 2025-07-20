import React, { useState, useRef, useEffect } from "react";
import mapboxgl from "mapbox-gl";
import MapboxGeocoder from "@mapbox/mapbox-gl-geocoder";
import { useNavigate } from "react-router-dom";
import "mapbox-gl/dist/mapbox-gl.css";
import "@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css";
import "./styles.css";
import useUserLocation from "./hooks/useUserLocation";

// Mapbox Access Token (used inline instead of assigning to mapboxgl)
const MAPBOX_TOKEN = 'pk.eyJ1IjoidmVyaWZpZWRmaW5uIiwiYSI6ImNtN21tdWQ2ZjBqcm8ycnIwNXFwN2Z4bGcifQ.BckuIZ-IAbwTNq6oaIunGg';

const MapPage = () => {
  const mapContainerRef = useRef(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [locationName, setLocationName] = useState("");
  const markerRef = useRef(null);
  const mapRef = useRef(null);
  const [loading, setLoading] = useState(true);

  const { userLocation } = useUserLocation([]);
  const navigate = useNavigate();

  const reverseGeocode = async (lat, lng) => {
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${MAPBOX_TOKEN}`;
    try {
      const response = await fetch(url);
      const data = await response.json();
      const placeName = data.features[0]?.place_name || "Unknown Location";
      setLocationName(placeName);
    } catch (error) {
      console.error("❌ Failed to reverse geocode:", error);
    }
  };

  const handleMapClick = (e) => {
    const { lat, lng } = e.lngLat;
    setSelectedLocation({ lat, lng });
    reverseGeocode(lat, lng);
    if (markerRef.current) markerRef.current.remove();
    markerRef.current = new mapboxgl.Marker().setLngLat([lng, lat]).addTo(mapRef.current);
  };

  useEffect(() => {
    const mapInstance = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/streets-v11",
      center: [-6.2603, 53.3498],
      zoom: 14,
      accessToken: MAPBOX_TOKEN,
    });

    mapRef.current = mapInstance;

    const geocoder = new MapboxGeocoder({
      accessToken: MAPBOX_TOKEN,
      mapboxgl: mapboxgl,
      marker: false,
    });

    mapInstance.addControl(geocoder, "top-left");

    geocoder.on("result", (event) => {
      const [lng, lat] = event.result.center;
      setSelectedLocation({ lng, lat });
      reverseGeocode(lat, lng);
      if (markerRef.current) markerRef.current.remove();
      markerRef.current = new mapboxgl.Marker().setLngLat([lng, lat]).addTo(mapInstance);
      mapInstance.flyTo({ center: [lng, lat], zoom: 14 });
    });

    mapInstance.on("click", handleMapClick);

    return () => {
      mapInstance.off("click", handleMapClick);
      mapInstance.remove();
    };
  }, []);

  useEffect(() => {
    if (userLocation && mapRef.current && !selectedLocation) {
      setLoading(false);
      reverseGeocode(userLocation.lat, userLocation.lng);
      mapRef.current.flyTo({
        center: [userLocation.lng, userLocation.lat],
        zoom: 14,
      });
      if (markerRef.current) markerRef.current.remove();
      markerRef.current = new mapboxgl.Marker()
        .setLngLat([userLocation.lng, userLocation.lat])
        .addTo(mapRef.current);
    }
  }, [userLocation, selectedLocation]);

  const focusOnUserLocation = () => {
    if (userLocation && mapRef.current) {
      mapRef.current.flyTo({
        center: [userLocation.lng, userLocation.lat],
        zoom: 14,
      });
      if (markerRef.current) markerRef.current.remove();
      markerRef.current = new mapboxgl.Marker()
        .setLngLat([userLocation.lng, userLocation.lat])
        .addTo(mapRef.current);
    }
  };

  const handleGoBack = () => navigate(-1);

  const handleConfirmLocation = () => {
    const locationToConfirm = selectedLocation || userLocation;
    if (locationToConfirm && locationName) {
      navigate(`/filter-page?lat=${locationToConfirm.lat}&lng=${locationToConfirm.lng}&locationName=${encodeURIComponent(locationName)}`);
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

      {locationName && <p style={{ marginTop: "10px" }}>Location: {locationName}</p>}

      <button onClick={handleGoBack} className="back-button">⬅ Go Back</button>

      <div className="focus-button">
        <button onClick={focusOnUserLocation}>📍 Use My Location</button>
        <button onClick={handleConfirmLocation} className="confirm-location">✅ Confirm Location</button>
      </div>
    </div>
  );
};

export default MapPage;



