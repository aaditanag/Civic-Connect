import { useState, useEffect } from 'react';

const useGeolocation = () => {
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const getCurrentPosition = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this browser.');
      return;
    }

    setLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        try {
          // Reverse geocoding to get address
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`,
            {
              headers: {
                'User-Agent': 'CivicConnect/1.0 (civic-issue-reporter@example.com)'
              }
            }
          );
          const data = await response.json();

          setLocation({
            lat: latitude,
            lng: longitude,
            address: data.display_name || `Lat: ${latitude.toFixed(5)}, Lng: ${longitude.toFixed(5)}`
          });
        } catch (geocodeError) {
          console.error('Reverse geocoding failed:', geocodeError);
          setLocation({
            lat: latitude,
            lng: longitude,
            address: `Lat: ${latitude.toFixed(5)}, Lng: ${longitude.toFixed(5)}`
          });
        }

        setLoading(false);
      },
      (positionError) => {
        setLoading(false);
        switch (positionError.code) {
          case positionError.PERMISSION_DENIED:
            setError('User denied the request for Geolocation.');
            break;
          case positionError.POSITION_UNAVAILABLE:
            setError('Location information is unavailable.');
            break;
          case positionError.TIMEOUT:
            setError('The request to get user location timed out.');
            break;
          default:
            setError('An unknown error occurred.');
            break;
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      }
    );
  };

  return {
    location,
    error,
    loading,
    getCurrentPosition
  };
};

export default useGeolocation;
