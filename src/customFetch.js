export async function customFetch(url) {
	const response = await fetch(url);

	if (!response.ok) {
		throw new Error('Failed to fetch places');
	}

	const data = await response.json();

	return data.places;
}

export async function updateUserPlaces(url, places) {
	const options = {
		method: 'PUT',
		body: JSON.stringify({ places }),
		headers: { 'Content-type': 'application/json' },
	};

	const response = await fetch(url, options);

	if (!response.ok) {
		throw new Error('Failed to fetch places');
	}

	const data = await response.json();

	return data.message;
}
