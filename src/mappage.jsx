import React, { useState, useRef, useEffect } from "react";
import mapboxgl from "mapbox-gl";
import MapboxGeocoder from "@mapbox/mapbox-gl-geocoder";
import { useNavigate } from "react-router-dom";
import "mapbox-gl/dist/mapbox-gl.css";
import "@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css";
import "./styles.css";
import useUserLocation from "./hooks/useUserLocation";

mapboxgl.accessToken = 'pk.eyJ1IjoidmVyaWZpZWRmaW5uIiwiYSI6ImNtN21tdWQ2ZjBqcm8ycnIwNXFwN2Z4bGcifQ.BckuIZ-IAbwTNq6oaIunGg';

const MapPage = () => {
  const mapContainerRef = useRef(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [locationName, setLocationName] = useState("");  // For storing the location name based on coordinates

  const markerRef = useRef(null);
  const mapRef = useRef(null);
  const [loading, setLoading] = useState(true);

  // Hook to get user location
  const { userLocation } = useUserLocation([]);
  const navigate = useNavigate();

  // Reverse geocoding to get location name
  const reverseGeocode = async (lat, lng) => {
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${mapboxgl.accessToken}`;
    try {
      const response = await fetch(url);
      const data = await response.json();
      const placeName = data.features[0]?.place_name || "Unknown Location";
      setLocationName(placeName);
    } catch (error) {
      console.error("❌ Failed to reverse geocode:", error);
    }
  };

  // Update selected location on map click
  const handleMapClick = (e) => {
    const { lat, lng } = e.lngLat;
    setSelectedLocation({ lat, lng });

    // Reverse Geocoding to get the name of the location
    reverseGeocode(lat, lng);

    // Remove previous marker
    if (markerRef.current) {
      markerRef.current.remove();
    }

    // Add new marker
    markerRef.current = new mapboxgl.Marker().setLngLat([lng, lat]).addTo(mapRef.current);
  };

  // Initialize map
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
      reverseGeocode(lat, lng);  // Get the location name on result

      // Remove previous marker
      if (markerRef.current) {
        markerRef.current.remove();
      }

      // Add new marker
      markerRef.current = new mapboxgl.Marker().setLngLat([lng, lat]).addTo(mapInstance);
      mapInstance.flyTo({ center: [lng, lat], zoom: 14 });
    });

    // Handle click on the map to change location
    mapInstance.on("click", handleMapClick);

    return () => {
      mapInstance.off("click", handleMapClick); // Clean up the click event listener
      mapInstance.remove();
    };
  }, []);

  useEffect(() => {
    // Ensure that map updates occur only after userLocation updates
    if (userLocation && mapRef.current && !selectedLocation) {
      setLoading(false); // stop loading
      console.log("Focusing on user location...");
      console.log("User Location:", userLocation);

      // Reverse geocode the user location on load
      reverseGeocode(userLocation.lat, userLocation.lng);

      mapRef.current.flyTo({
        center: [userLocation.lng, userLocation.lat],
        zoom: 14,
      });

      // Remove previous marker
      if (markerRef.current) {
        markerRef.current.remove();
      }

      // Add user location marker
      markerRef.current = new mapboxgl.Marker()
        .setLngLat([userLocation.lng, userLocation.lat])
        .addTo(mapRef.current);
    }
  }, [userLocation, selectedLocation]);

  const focusOnUserLocation = () => {
    console.log("Focusing on user location...");
    if (userLocation && mapRef.current) {
      console.log("User Location:", userLocation);
      mapRef.current.flyTo({
        center: [userLocation.lng, userLocation.lat],
        zoom: 14,
      });

      // Remove previous marker
      if (markerRef.current) {
        markerRef.current.remove();
      }

      // Create new marker
      markerRef.current = new mapboxgl.Marker()
        .setLngLat([userLocation.lng, userLocation.lat])
        .addTo(mapRef.current);
    }
  };

  const handleGoBack = () => {
    navigate(-1);  // Go back to the filter page
  };

  // Confirm location and navigate to FilterPage with coordinates and location name
  const handleConfirmLocation = () => {
    // Use either selected location or user location if no selection was made
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

      {/* Display location name below coordinates */}
      {locationName && <p style={{ marginTop: "10px" }}>Location: {locationName}</p>}

      <button 
        onClick={handleGoBack}
        className="back-button"
      >
        ⬅ Go Back
      </button>

      <div className="focus-button">
        <button onClick={focusOnUserLocation}>📍 Use My Location</button>
        <button onClick={handleConfirmLocation} className="confirm-location">✅ Confirm Location</button>
      </div>
    </div>
  );
};

export default MapPage;



