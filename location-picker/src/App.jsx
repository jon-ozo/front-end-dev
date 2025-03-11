/**
 * This project shows the use of useState(), useEffect and useCallback().
 * The useEffect() method is called on every render and can also be used to 
 * cause a re-render. useEffect takes a callback and a dependency(an array 
 * containing the props). This dependency is used to control re-renders.
 * Should a dependency be provided, useEffect will only fire if the dependency 
 * value changes. If there are no values in the dependency array, this would tell 
 * react to only re-render after the component mounts. useEffect should be used mostly 
 * for synchronicity with a component eg when handling side effects - events that 
 * happen not due to direct interaction like a click but during component rendering. 
 * After a component renders and there's a side effect (something that the component
 * needs from a third party or the DOM) e.g a DOM api call, data from a server etc, 
 * useEffect can be applied and used to handle the rendering process and cause a 
 * re-render should that be necessary. Going back to the dependency array argument, 
 * the array accepts various data types; string, int, functions etc. As stated above, 
 * once the value changes a re-render will occur. It is also important to note that 
 * useEffect() provides a function that can be returned and used to clean up the 
 * useEffect callback if it is still running after a re-render. However, in the case 
 * of a function being ased as a dependency, useEffect will always see the functon as
 * different everytime there is a re-render which could cos a loop. Because of this 
 * problem, useCallback was developed. the useCallback provides a better way to handle 
 * functions as a dependency by keeping the function from changing. After a re-render,
 * function passed into the useCallback() will be seen as the same function from before
 * the re-render. Finally, much like the useEffect takes a callback and a depenedency.
 */

import { useRef, useState, useEffect, useCallback } from 'react';

import Places from './components/Places.jsx';
import { AVAILABLE_PLACES } from './data.js';
import { sortPlacesByDistance } from './loc.js';
import Modal from './components/Modal.jsx';
import DeleteConfirmation from './components/DeleteConfirmation.jsx';
import logoImg from './assets/logo.png';


const storedIds = JSON.parse(localStorage.getItem('selectedPlaces')) || [];
const storedPlaces = storedIds.map(id => AVAILABLE_PLACES.find(place => place.id === id));

function App() {
  const selectedPlace = useRef();
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [pickedPlaces, setPickedPlaces] = useState(storedPlaces);
  const [availablePlaces, setavailablePlaces] = useState([]);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(position => {
      const sortedPlaces = sortPlacesByDistance(AVAILABLE_PLACES, position.coords.latitude, position.coords.longitude);
      setavailablePlaces(sortedPlaces);
    });
  }, []);

  function handleStartRemovePlace(id) {
    setModalIsOpen(true);
    selectedPlace.current = id;
  }

  function handleStopRemovePlace() {
    setModalIsOpen(false);
  }

  function handleSelectPlace(id) {
    setPickedPlaces((prevPickedPlaces) => {
      if (prevPickedPlaces.some((place) => place.id === id)) {
        return prevPickedPlaces;
      }
      const place = availablePlaces.find((place) => place.id === id);
      return [place, ...prevPickedPlaces];
    });

    const storedIds = JSON.parse(localStorage.getItem('selectedPlaces')) || [];

    if (storedIds.indexOf(id) === -1) {
      localStorage.setItem('selectedPlaces', JSON.stringify([id, ...storedIds]));
    }
  }

  const handleRemovePlace = useCallback(function handleRemovePlace(id) {
    setPickedPlaces((prevPickedPlaces) =>
      prevPickedPlaces.filter((place) => place.id !== selectedPlace.current)
    );

    setModalIsOpen(false);

    const storedIds = JSON.parse(localStorage.getItem('selectedPlaces')) || [];

    if (storedIds.indexOf(id) === -1) {
      localStorage.setItem('selectedPlaces', JSON.stringify(storedIds.filter(id => id !== selectedPlace.current)));
    }
  }, []);

  return (
    <>
      <Modal open={modalIsOpen} onClose={handleStopRemovePlace}>
        <DeleteConfirmation
          onCancel={handleStopRemovePlace}
          onConfirm={handleRemovePlace}
        />
      </Modal>

      <header>
        <img src={logoImg} alt="Stylized globe" />
        <h1>PlacePicker</h1>
        <p>
          Create your personal collection of places you would like to visit or
          you have visited.
        </p>
      </header>
      <main>
        <Places
          title="I'd like to visit ..."
          fallbackText={'Select the places you would like to visit below.'}
          places={pickedPlaces}
          onSelectPlace={handleStartRemovePlace}
        />
        <Places
          title="Available Places"
          places={availablePlaces}
          onSelectPlace={handleSelectPlace}
          fallbackText={'Sorting places based on your location...'}
        />
      </main>
    </>
  );
}

export default App;
