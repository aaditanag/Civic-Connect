import React, { useEffect, useRef } from 'react';

const LocationMap = ({ location, onLocationSelect }) => {
  const mapRef = useRef(null);
  const leafletMapRef = useRef(null);
  const markerRef = useRef(null);

  useEffect(() => {
    if (!mapRef.current || !location) return;

    // Initialize map if not already done
    if (!leafletMapRef.current) {
      leafletMapRef.current = L.map(mapRef.current).setView([location.lat, location.lng], 15);

      // Add OpenStreetMap tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
      }).addTo(leafletMapRef.current);

      // Add marker
      markerRef.current = L.marker([location.lat, location.lng])
        .addTo(leafletMapRef.current)
        .bindPopup(location.address || 'Your location')
        .openPopup();

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

          onLocationSelect(newLocation);
        } catch (error) {
          console.error('Reverse geocoding failed:', error);
        }
      });
    } else {
      // Update existing map
      leafletMapRef.current.setView([location.lat, location.lng], 15);
      if (markerRef.current) {
        markerRef.current.setLatLng([location.lat, location.lng]);
        markerRef.current.bindPopup(location.address || 'Your location').openPopup();
      }
    }

    // Cleanup function
    return () => {
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
    };
  }, [location, onLocationSelect]);

  return (
    <div
      ref={mapRef}
      style={{ height: '300px', width: '100%', borderRadius: '8px' }}
      className="border border-gray-300"
    />
  );
};

export default LocationMap;
