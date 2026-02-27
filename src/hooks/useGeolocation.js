import { useState } from 'react';

export function useGeolocation() {
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const requestLocation = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        const errorMsg = 'La geolocalización no es compatible con tu navegador.';
        setError(errorMsg);
        reject(new Error(errorMsg));
        return;
      }

      setLoading(true);
      setError(null);

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const loc = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy,
          };
          setLocation(loc);
          setLoading(false);
          resolve(loc);
        },
        (err) => {
          let errorMsg = 'Error al obtener la ubicación.';
          if (err.code === 1) errorMsg = 'Permiso de ubicación denegado.';
          else if (err.code === 2) errorMsg = 'Ubicación no disponible.';
          else if (err.code === 3) errorMsg = 'Tiempo de espera agotado al obtener la ubicación.';
          
          setError(errorMsg);
          setLoading(false);
          reject(new Error(errorMsg));
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    });
  };

  return { location, error, loading, requestLocation };
}
