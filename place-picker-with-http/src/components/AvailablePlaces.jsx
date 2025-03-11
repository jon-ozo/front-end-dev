import { useState, useEffect } from 'react';

import Error from './Error.jsx';
import Places from './Places.jsx';
import { sortPlacesByDistance } from '../loc.js';
import { customFetch } from '../customFetch.js';

export default function AvailablePlaces({ onSelectPlace }) {
  const [availablePlaces, setAvailablePlaces] = useState([]); // state to store fetched data
  const [isLoaded, setIsLoaded] = useState(false); // state to give status updates on the data being fetched
  const [error, setError] = useState(); // state to handle errors if any while fetching data

  // useEffect(() => {
  //   setIsLoaded(true);

  //   try {
  //     fetch('http://localhost:3000/places')
  //     .then(response => response.json())
  //     .then(data => {
            // setAvailablePlaces(data.places)
            // setIsLoaded(false);
          // });

  //     if (!response.ok) {
    //       throw new Error("Failed to fetch places");
    //   }
  //   } catch (error) {
  //     setError(error);
  //     setIsLoaded(false);
  //   }

  // }, []);

  useEffect(() => {
    async function fetchPlaces() {
      setIsLoaded(true);

      try {
        const places = await customFetch("http://localhost:4000/places");

        navigator.geolocation.getCurrentPosition(position => {
          const sortedPlaces = sortPlacesByDistance(places, position.coords.latitude, position.coords.longitude);
          setAvailablePlaces(sortedPlaces);
          setIsLoaded(false);
        });
        
      } catch (error) {
        setError({message: error.message || "Could not fetch places, try again."});
        setIsLoaded(false);
      }
    }
    fetchPlaces();

  }, []);

  if (error) {
    return <Error title="An error occured" message={error.message} />
  }
  
  return (
    <Places
      title="Available Places"
      places={availablePlaces}
      isLoading={isLoaded}
      fetchText="Fetching places..."
      fallbackText="No places available."
      onSelectPlace={onSelectPlace}
    />
  );
}
