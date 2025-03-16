navigator.geolocation.getCurrentPosition((position) => {
    const userLat = position.coords.latitude;
    const userLon = position.coords.longitude;
    console.log(`User Location: ${userLat}, ${userLon}`);
});



function getDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius of the Earth in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    
    const a = 
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
}




//SELECT id, name, latitude, longitude,
(6371 * ACOS(
    COS(RADIANS(:user_lat)) * COS(RADIANS(latitude)) * 
    COS(RADIANS(longitude) - RADIANS(:user_lon)) + 
    SIN(RADIANS(:user_lat)) * SIN(RADIANS(latitude))
)) AS distance
FROM food_places
ORDER BY distance ASC;


//<Card>
<h2>{place.name}</h2>
<p>📍 {place.distance.toFixed(1)} km away</p>
</Card>



