1. get users' location

navigator.geolocation.getCurrentPosition(
  (position) => {
    const userLat = position.coords.latitude;
    const userLng = position.coords.longitude;
    console.log(`User's Location: ${userLat}, ${userLng}`);
  },
  (error) => {
    console.error("Error getting location:", error);
  }
);

2. mark the users' location on map

map.on("load", function () {
  navigator.geolocation.getCurrentPosition(
    (position) => {
      const userLocation = [position.coords.longitude, position.coords.latitude];

      new mapboxgl.Marker({ color: "blue" })
        .setLngLat(userLocation)
        .setPopup(new mapboxgl.Popup().setText("You are here!"))
        .addTo(map);
      
      map.flyTo({ center: userLocation, zoom: 14 });
    },
    (error) => {
      console.error("Error getting user location:", error);
    }
  );
});

