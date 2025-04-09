import { useState, useEffect } from "react";

const useUserLocation = (pois, externalLocation = null) => {
  const [userLocation, setUserLocation] = useState(externalLocation || null);
  const [nearestPOI, setNearestPOI] = useState(null);

  useEffect(() => {
    if (externalLocation) {
      setUserLocation(externalLocation);
      findNearestPOI(externalLocation.lat, externalLocation.lng);
    }

    else if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setUserLocation({ lat, lng });

        // try {
        //   const response = await fetch(
        //     `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=pk.eyJ1IjoidmVyaWZpZWRmaW5uIiwiYSI6ImNtN21tdWQ2ZjBqcm8ycnIwNXFwN2Z4bGcifQ.BckuIZ-IAbwTNq6oaIunGg`
        //   );
        //   const data = await response.json();
        //   console.log("User Location:", data.features[0]?.place_name);

        //   findNearestPOI(lat, lng);
        // } catch (error) {
        //   console.error("Error fetching geocoding data:", error);
        // }
      });
    }
  }, [externalLocation]);  // triggers when externalLocation changes

  const findNearestPOI = (lat, lng) => {
    let nearest = null;
    let minDistance = Infinity;

    pois.forEach((poi) => {
      const distance = Math.sqrt(
        Math.pow(lat - poi.lat, 2) + Math.pow(lng - poi.lng, 2)
      );
      if (distance < minDistance) {
        minDistance = distance;
        nearest = poi;
      }
    });

    setNearestPOI(nearest);
  };

  return { userLocation, nearestPOI };
};

export default useUserLocation;

