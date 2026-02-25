import type { LatLng, LibraryWithLinksAndInstances, UnknownLibrary } from '$lib/types/holdings';
import { BibDb } from '$lib/types/xl';

export const userLocation: { coords: LatLng | null } = $state({ coords: null });

export function saveUserLocation(loc: LatLng | null) {
	userLocation.coords = loc;
}

export function sortByDistance(
	holders: (LibraryWithLinksAndInstances | UnknownLibrary)[],
	userCoords: LatLng
) {
	return holders
		.map((item) => {
			if (!(BibDb.latitude in item) || !(BibDb.longitude in item)) {
				return { ...item, distance: NaN };
			}
			const lat = item[BibDb.latitude] as number;
			const lng = item[BibDb.longitude] as number;

			return {
				...item,
				distance: haversineDistance(userCoords.lat, userCoords.lng, lat, lng)
			};
		})
		.sort((a, b) => {
			const aVal = Number.isFinite(a.distance) ? a.distance : Infinity;
			const bVal = Number.isFinite(b.distance) ? b.distance : Infinity;
			return aVal - bVal;
		});
}

function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
	const toRad = (value: number) => (value * Math.PI) / 180;
	const R = 6371; // Earth radius in km

	const dLat = toRad(lat2 - lat1);
	const dLon = toRad(lon2 - lon1);

	const a =
		Math.sin(dLat / 2) * Math.sin(dLat / 2) +
		Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);

	const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
	const distance = R * c; // distance in km
	return distance < 10 ? Number(distance.toFixed(1)) : Math.round(distance);
}
