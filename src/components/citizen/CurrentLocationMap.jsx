import React, { useEffect, useRef, useState } from 'react';

const CurrentLocationMap = ({ onLocationSelect }) => {
  const mapRef = useRef(null);
  const leafletMapRef = useRef(null);
  const markerRef = useRef(null);
  const [info, setInfo] = useState('Fetching your location...');

  useEffect(() => {
    // Initialize geolocation and map
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(showPosition, showError);
    } else {
      setInfo("Geolocation is not supported by this browser.");
    }

    return () => {
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
    };
  }, []);

  async function showPosition(position) {
    const lat = position.coords.latitude;
    const lon = position.coords.longitude;

    // Update info
    setInfo(`Latitude: ${lat.toFixed(5)}, Longitude: ${lon.toFixed(5)}`);

    // Create Leaflet map
    if (!leafletMapRef.current && mapRef.current) {
      leafletMapRef.current = L.map(mapRef.current).setView([lat, lon], 13);

      // Add OpenStreetMap tiles
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
      }).addTo(leafletMapRef.current);

      // Add marker at user location
      markerRef.current = L.marker([lat, lon]).addTo(leafletMapRef.current);
      markerRef.current.bindPopup("You are here!").openPopup();

      // Handle map clicks for location selection
      leafletMapRef.current.on('click', async (e) => {
        const { lat, lng } = e.latlng;

        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`,
            {
              headers: {
                'User-Agent': 'CivicConnect/1.0 (civic-issue-reporter@example.com)'
              }
            }
          );
          const data = await response.json();

          const newLocation = {
            lat,
            lng,
            address: data.display_name || `Lat: ${lat.toFixed(5)}, Lng: ${lng.toFixed(5)}`
          };

          // Update marker
          if (markerRef.current) {
            leafletMapRef.current.removeLayer(markerRef.current);
          }
          markerRef.current = L.marker([lat, lng])
            .addTo(leafletMapRef.current)
            .bindPopup(newLocation.address)
            .openPopup();

          // Call the callback with the selected location
          if (onLocationSelect) {
            onLocationSelect(newLocation);
          }
        } catch (error) {
          console.error('Reverse geocoding failed:', error);
        }
      });

      // Reverse geocoding (optional)
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}`,
          {
            headers: {
              "User-Agent": "CivicConnect/1.0 (civic-issue-reporter@example.com)"
            }
          }
        );
        const data = await response.json();
        if (data.display_name) {
          setInfo(`📍 You are near: ${data.display_name}`);
          markerRef.current.bindPopup(data.display_name).openPopup();
        }
      } catch (error) {
        console.error("Reverse geocoding failed:", error);
      }
    }
  }

  // Handle errors
  function showError(error) {
    switch (error.code) {
      case error.PERMISSION_DENIED:
        setInfo("User denied the request for Geolocation.");
        break;
      case error.POSITION_UNAVAILABLE:
        setInfo("Location information is unavailable.");
        break;
      case error.TIMEOUT:
        setInfo("The request to get user location timed out.");
        break;
      default:
        setInfo("An unknown error occurred.");
        break;
    }
  }

  return (
    <div>
      <div id="info" className="text-center mb-4 text-lg font-medium text-indian-green">
        {info}
      </div>
      <div
        ref={mapRef}
        id="map"
        style={{ height: '400px', width: '100%' }}
        className="border border-gray-300 rounded-lg"
      ></div>
    </div>
  );
};

export default CurrentLocationMap;
