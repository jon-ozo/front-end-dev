import { useRef, useState, useCallback, useEffect } from 'react';

import Places from './components/Places.jsx';
import Modal from './components/Modal.jsx';
import DeleteConfirmation from './components/DeleteConfirmation.jsx';
import logoImg from './assets/logo.png';
import AvailablePlaces from './components/AvailablePlaces.jsx';
import { customFetch, updateUserPlaces } from './customFetch.js';
import Error from './components/Error.jsx';

export default function App() {
  const selectedPlace = useRef();

  const [userPlaces, setUserPlaces] = useState([]);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [updateError, setUpdateError] = useState();
  const [isLoaded, setIsLoaded] = useState(false); // state to give status updates on the data being fetched
  const [error, setError] = useState(); // state to handle errors if any while fetching data

  useEffect(() => {
    // async function showSelectedUserPlaces() {
    //   setIsLoaded(true);
      
    //   try {
    //     const places = await customFetch("http://localhost:4000/user-placess");
    //     setUserPlaces(places);
    //     setIsLoaded(false);
    //   } catch (error) {
    //     setError({error: error.message || "Something went wrong. Failed to delete place."})
    //     setIsLoaded(false);
    //   }
    // }
    
    // showSelectedUserPlaces();
    setIsLoaded(true);

    try {
      customFetch("http://localhost:4000/user-placess")
        .then(data => {
          setUserPlaces(data)
          setIsLoaded(false);
        });
    } catch (error) {
      setError({error: error.message || "Something went wrong. Failed to fetch your selected places."})
      setIsLoaded(false);
    }

  }, []);

  function handleStartRemovePlace(place) {
    setModalIsOpen(true);
    selectedPlace.current = place;   
  }

  function handleStopRemovePlace() {
    setModalIsOpen(false);
  }

  async function handleSelectPlace(selectedPlace) {
    setUserPlaces((prevPickedPlaces) => {
      if (!prevPickedPlaces) {
        prevPickedPlaces = [];
      }
      if (prevPickedPlaces.some((place) => place.id === selectedPlace.id)) {
        return prevPickedPlaces;
      }
      return [selectedPlace, ...prevPickedPlaces];
    });

    try {
      await updateUserPlaces("http://localhost:4000/user-places", [selectedPlace, ...userPlaces]);
    } catch (error) {
      setUserPlaces(userPlaces);
      setUpdateError({error: error.message || "Something went wrong. Failed to update place."})
    }
  }

  const handleRemovePlace = useCallback(async function handleRemovePlace() {
    setUserPlaces((prevPickedPlaces) =>
      prevPickedPlaces.filter((place) => place.id !== selectedPlace.current.id)
    );

    try {
      await updateUserPlaces("http://localhost:4000/user-places", userPlaces.filter(place => place.id !== selectedPlace.current.id));
    } catch (error) {
      setUserPlaces(userPlaces);
      setUpdateError({error: error.message || "Something went wrong. Failed to delete place."})
    }

    setModalIsOpen(false);
  }, [userPlaces]);

  function handleError() {
    setUpdateError(null);
  }

  return (
    <>
      {updateError && (<Modal open={updateError} onClose={handleError}>
        <Error title="Update error" message={updateError.error} onConfirm={handleError}  />
      </Modal>)}

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
        {error && <Error title="An error occured" message={error.error} onConfirm={handleError}  />}
        {!error && <Places
          title="I'd like to visit ..."
          isLoading={isLoaded}
          fetchText="Fetching your selected places"
          fallbackText="Select the places you would like to visit below."
          places={userPlaces}
          onSelectPlace={handleStartRemovePlace}
        />}

        <AvailablePlaces onSelectPlace={handleSelectPlace} />
      </main>
    </>
  );
}